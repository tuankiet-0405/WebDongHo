const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    image: String,
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Số lượng ít nhất là 1']
    },
    subtotal: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Thông tin khách hàng (lưu snapshot)
    customer: {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập họ tên']
        },
        email: {
            type: String,
            required: [true, 'Vui lòng nhập email']
        },
        phone: {
            type: String,
            required: [true, 'Vui lòng nhập số điện thoại']
        }
    },
    // Địa chỉ giao hàng
    shippingAddress: {
        address: {
            type: String,
            required: [true, 'Vui lòng nhập địa chỉ']
        },
        city: {
            type: String,
            required: [true, 'Vui lòng chọn tỉnh/thành phố']
        },
        district: {
            type: String,
            required: [true, 'Vui lòng chọn quận/huyện']
        },
        ward: String
    },
    items: [orderItemSchema],
    // Tính tiền
    itemsTotal: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    couponCode: String,
    totalAmount: {
        type: Number,
        required: true
    },
    // Thanh toán
    paymentMethod: {
        type: String,
        enum: ['cod', 'bank_transfer', 'credit_card', 'momo', 'vnpay'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paidAt: Date,
    // Trạng thái đơn hàng
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    statusHistory: [{
        status: String,
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Ghi chú
    note: String,
    adminNote: String,
    // Tracking
    trackingNumber: String,
    shippingCarrier: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    // VNPay payment details
    vnpayTransactionId: String,
    vnpayBankCode: String,
    vnpayPayDate: String,
    paymentFailReason: String
}, {
    timestamps: true
});

// Tạo mã đơn hàng tự động
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.orderNumber = `WS${year}${month}${day}${random}`;
    }
    next();
});

// Cập nhật status history
orderSchema.methods.updateStatus = function (status, note, userId) {
    this.status = status;
    this.statusHistory.push({
        status,
        note,
        updatedBy: userId,
        updatedAt: new Date()
    });

    if (status === 'delivered') {
        this.deliveredAt = new Date();
        this.paymentStatus = 'paid';
        this.paidAt = new Date();
    }

    if (status === 'cancelled') {
        this.cancelledAt = new Date();
    }

    return this.save();
};

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'customer.email': 1 });

module.exports = mongoose.model('Order', orderSchema);
