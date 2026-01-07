const { Order, Product, Coupon } = require('../models');
const emailService = require('../services/emailService');

// Trang thanh toán
exports.checkout = (req, res) => {
    const cart = req.session.cart;

    if (!cart || cart.items.length === 0) {
        req.flash('error_msg', 'Giỏ hàng trống');
        return res.redirect('/cart');
    }

    res.render('orders/checkout', {
        title: 'Thanh toán | Watch Store',
        cart,
        user: req.user
    });
};

// Tạo đơn hàng
exports.create = async (req, res) => {
    try {
        const cart = req.session.cart;

        if (!cart || cart.items.length === 0) {
            req.flash('error_msg', 'Giỏ hàng trống');
            return res.redirect('/cart');
        }

        const {
            name, email, phone,
            address, city, district, ward,
            paymentMethod, note
        } = req.body;

        // Tạo order items và kiểm tra tồn kho
        const orderItems = [];
        for (const item of cart.items) {
            const product = await Product.findById(item.product);

            if (!product || product.stock < item.quantity) {
                req.flash('error_msg', `Sản phẩm "${item.name}" không đủ số lượng`);
                return res.redirect('/cart');
            }

            orderItems.push({
                product: item.product,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal
            });
        }

        // Tính tổng tiền
        const itemsTotal = cart.totalPrice;
        const shippingFee = itemsTotal >= 2000000 ? 0 : 30000; // Free ship từ 2M
        const discount = cart.coupon?.discount || 0;
        const totalAmount = itemsTotal + shippingFee - discount;

        // Tạo đơn hàng
        const order = new Order({
            user: req.user?._id,
            customer: { name, email, phone },
            shippingAddress: { address, city, district, ward },
            items: orderItems,
            itemsTotal,
            shippingFee,
            discount,
            couponCode: cart.coupon?.code,
            totalAmount,
            paymentMethod,
            note,
            statusHistory: [{
                status: 'pending',
                note: 'Đơn hàng mới tạo'
            }]
        });

        await order.save();

        // Cập nhật tồn kho
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: {
                    stock: -item.quantity,
                    sold: item.quantity
                }
            });
        }

        // Cập nhật coupon usage
        if (cart.coupon?.code) {
            await Coupon.findOneAndUpdate(
                { code: cart.coupon.code },
                {
                    $inc: { usedCount: 1 },
                    $push: {
                        usedBy: {
                            user: req.user?._id,
                            orderId: order._id
                        }
                    }
                }
            );
        }

        // Xóa giỏ hàng
        req.session.cart = { items: [], totalQty: 0, totalPrice: 0 };

        // Gửi email xác nhận đơn hàng
        emailService.sendOrderConfirmation(order).catch(err => {
            console.error('Failed to send order confirmation email:', err);
            // Don't block the order creation if email fails
        });

        // If payment method is VNPay, redirect to VNPay payment gateway
        if (paymentMethod === 'vnpay') {
            return res.redirect(`/vnpay/create-payment?orderId=${order._id}`);
        }

        req.flash('success_msg', 'Đặt hàng thành công!');
        res.redirect(`/orders/success/${order.orderNumber}`);
    } catch (error) {
        console.error('Create order error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra khi đặt hàng');
        res.redirect('/checkout');
    }
};

// Trang đặt hàng thành công
exports.success = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const order = await Order.findOne({ orderNumber });

        if (!order) {
            return res.status(404).render('errors/404', {
                title: 'Không tìm thấy đơn hàng'
            });
        }

        res.render('orders/success', {
            title: 'Đặt hàng thành công | Watch Store',
            order
        });
    } catch (error) {
        console.error('Order success error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// Tra cứu đơn hàng
exports.track = async (req, res) => {
    try {
        const { orderNumber, email } = req.query;

        if (!orderNumber) {
            return res.render('orders/track', {
                title: 'Tra cứu đơn hàng | Watch Store',
                order: null
            });
        }

        const order = await Order.findOne({
            orderNumber,
            'customer.email': email
        });

        res.render('orders/track', {
            title: 'Tra cứu đơn hàng | Watch Store',
            order,
            searched: true
        });
    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// Xem chi tiết đơn hàng (user)
exports.show = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('items.product');

        if (!order) {
            return res.status(404).render('errors/404', {
                title: 'Không tìm thấy đơn hàng'
            });
        }

        // Kiểm tra quyền xem
        if (req.user && order.user?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).render('errors/403', {
                title: 'Không có quyền truy cập'
            });
        }

        res.render('orders/show', {
            title: `Đơn hàng ${order.orderNumber} | Watch Store`,
            order
        });
    } catch (error) {
        console.error('Show order error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// Hủy đơn hàng
exports.cancel = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Chỉ hủy được khi đơn hàng chưa giao
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng này'
            });
        }

        // Hoàn lại tồn kho
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: {
                    stock: item.quantity,
                    sold: -item.quantity
                }
            });
        }

        await order.updateStatus('cancelled', reason, req.user?._id);
        order.cancelReason = reason;
        await order.save();

        res.json({
            success: true,
            message: 'Đã hủy đơn hàng'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra'
        });
    }
};
