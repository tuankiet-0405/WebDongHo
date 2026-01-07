const vnpayService = require('../services/vnpayService');
const { Order } = require('../models');

// Create VNPay payment
exports.createPayment = async (req, res) => {
    try {
        const { orderId } = req.query;

        const order = await Order.findById(orderId);

        if (!order) {
            req.flash('error_msg', 'Không tìm thấy đơn hàng');
            return res.redirect('/cart');
        }

        // Check if order belongs to current user (if logged in)
        if (req.user && order.user && order.user.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'Không có quyền truy cập đơn hàng này');
            return res.redirect('/cart');
        }

        const amount = order.totalAmount;
        const orderInfo = `Thanh toan don hang ${order.orderNumber}`;
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket?.remoteAddress ||
            '127.0.0.1';

        const paymentUrl = vnpayService.createPaymentUrl(
            order.orderNumber,
            amount,
            orderInfo,
            ipAddr
        );

        // Update order with payment info
        order.paymentMethod = 'vnpay';
        order.paymentStatus = 'pending';
        await order.save();

        res.redirect(paymentUrl);
    } catch (error) {
        console.error('VNPay create payment error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra khi tạo thanh toán');
        res.redirect('/cart');
    }
};

// VNPay return URL handler
exports.vnpayReturn = async (req, res) => {
    try {
        const vnp_Params = req.query;

        // Verify signature
        const isValid = vnpayService.verifyReturnUrl(vnp_Params);

        if (!isValid) {
            req.flash('error_msg', 'Chữ ký không hợp lệ');
            return res.redirect('/');
        }

        const orderNumber = vnp_Params['vnp_TxnRef'];
        const order = await Order.findOne({ orderNumber });

        if (!order) {
            req.flash('error_msg', 'Không tìm thấy đơn hàng');
            return res.redirect('/');
        }

        // Get transaction status
        const status = vnpayService.getTransactionStatus(vnp_Params);

        if (status.success) {
            // Payment successful
            order.paymentStatus = 'paid';
            order.vnpayTransactionId = vnp_Params['vnp_TransactionNo'];
            order.vnpayBankCode = vnp_Params['vnp_BankCode'];
            order.vnpayPayDate = vnp_Params['vnp_PayDate'];

            await order.save();

            req.flash('success_msg', 'Thanh toán thành công!');
            res.redirect(`/orders/success/${order.orderNumber}`);
        } else {
            // Payment failed
            order.paymentStatus = 'failed';
            order.paymentFailReason = status.message;
            await order.save();

            req.flash('error_msg', `Thanh toán thất bại: ${status.message}`);
            res.redirect('/cart');
        }
    } catch (error) {
        console.error('VNPay return error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra');
        res.redirect('/');
    }
};

// VNPay IPN (Instant Payment Notification) handler
exports.vnpayIPN = async (req, res) => {
    try {
        const vnp_Params = req.query;

        // Verify signature
        const isValid = vnpayService.verifyIPN(vnp_Params);

        if (!isValid) {
            return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
        }

        const orderNumber = vnp_Params['vnp_TxnRef'];
        const order = await Order.findOne({ orderNumber });

        if (!order) {
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        // Check if already processed
        if (order.paymentStatus === 'paid') {
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        // Get transaction status
        const status = vnpayService.getTransactionStatus(vnp_Params);

        if (status.success) {
            order.paymentStatus = 'paid';
            order.vnpayTransactionId = vnp_Params['vnp_TransactionNo'];
            order.vnpayBankCode = vnp_Params['vnp_BankCode'];
            order.vnpayPayDate = vnp_Params['vnp_PayDate'];
            await order.save();

            return res.status(200).json({ RspCode: '00', Message: 'Success' });
        } else {
            order.paymentStatus = 'failed';
            order.paymentFailReason = status.message;
            await order.save();

            return res.status(200).json({ RspCode: '99', Message: 'Payment failed' });
        }
    } catch (error) {
        console.error('VNPay IPN error:', error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

module.exports = exports;
