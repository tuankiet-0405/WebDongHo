const { Product, Coupon } = require('../models');

// Xem giỏ hàng
exports.index = (req, res) => {
    const cart = req.session.cart || { items: [], totalQty: 0, totalPrice: 0 };

    res.render('cart/index', {
        title: 'Giỏ hàng | Watch Store',
        cart
    });
};

// Thêm sản phẩm vào giỏ
exports.add = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const qty = parseInt(quantity);

        const product = await Product.findById(productId);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        if (product.stock < qty) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm không đủ số lượng'
            });
        }

        // Khởi tạo giỏ hàng nếu chưa có
        if (!req.session.cart) {
            req.session.cart = {
                items: [],
                totalQty: 0,
                totalPrice: 0
            };
        }

        const cart = req.session.cart;
        const itemIndex = cart.items.findIndex(item =>
            item.product.toString() === productId
        );

        const price = product.salePrice || product.price;

        if (itemIndex > -1) {
            // Sản phẩm đã có trong giỏ, cập nhật số lượng
            cart.items[itemIndex].quantity += qty;
            cart.items[itemIndex].subtotal = cart.items[itemIndex].quantity * price;
        } else {
            // Thêm sản phẩm mới
            cart.items.push({
                product: product._id,
                name: product.name,
                slug: product.slug,
                image: product.primaryImage,
                price: price,
                quantity: qty,
                subtotal: qty * price
            });
        }

        // Cập nhật tổng
        cart.totalQty = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

        req.session.cart = cart;

        res.json({
            success: true,
            message: 'Đã thêm vào giỏ hàng',
            cart: {
                totalQty: cart.totalQty,
                totalPrice: cart.totalPrice
            }
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra'
        });
    }
};

// Cập nhật số lượng
exports.update = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qty = parseInt(quantity);

        if (!req.session.cart) {
            return res.status(400).json({
                success: false,
                message: 'Giỏ hàng trống'
            });
        }

        const cart = req.session.cart;
        const itemIndex = cart.items.findIndex(item =>
            item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không có trong giỏ'
            });
        }

        // Kiểm tra tồn kho
        const product = await Product.findById(productId);
        if (product.stock < qty) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm không đủ số lượng'
            });
        }

        if (qty <= 0) {
            // Xóa sản phẩm khỏi giỏ
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = qty;
            cart.items[itemIndex].subtotal = qty * cart.items[itemIndex].price;
        }

        // Cập nhật tổng
        cart.totalQty = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

        req.session.cart = cart;

        res.json({
            success: true,
            message: 'Đã cập nhật giỏ hàng',
            cart
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra'
        });
    }
};

// Xóa sản phẩm khỏi giỏ
exports.remove = (req, res) => {
    try {
        const { productId } = req.params;

        if (!req.session.cart) {
            return res.status(400).json({
                success: false,
                message: 'Giỏ hàng trống'
            });
        }

        const cart = req.session.cart;
        const itemIndex = cart.items.findIndex(item =>
            item.product.toString() === productId
        );

        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1);
            cart.totalQty = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        }

        req.session.cart = cart;

        res.json({
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ',
            cart
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra'
        });
    }
};

// Xóa toàn bộ giỏ hàng
exports.clear = (req, res) => {
    req.session.cart = { items: [], totalQty: 0, totalPrice: 0 };

    res.json({
        success: true,
        message: 'Đã xóa giỏ hàng'
    });
};

// Áp dụng mã giảm giá
exports.applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        if (!req.session.cart || req.session.cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Giỏ hàng trống'
            });
        }

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Mã giảm giá không tồn tại'
            });
        }

        if (!coupon.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Mã giảm giá đã hết hạn hoặc hết lượt sử dụng'
            });
        }

        const cart = req.session.cart;
        const discount = coupon.calculateDiscount(cart.totalPrice);

        if (discount === 0) {
            return res.status(400).json({
                success: false,
                message: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString()}đ`
            });
        }

        cart.coupon = {
            code: coupon.code,
            discount: discount
        };
        cart.finalTotal = cart.totalPrice - discount;

        req.session.cart = cart;

        res.json({
            success: true,
            message: 'Áp dụng mã giảm giá thành công',
            discount,
            finalTotal: cart.finalTotal
        });
    } catch (error) {
        console.error('Apply coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra'
        });
    }
};
