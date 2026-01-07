const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Vui lòng nhập mã coupon'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    value: {
        type: Number,
        required: [true, 'Vui lòng nhập giá trị giảm giá'],
        min: [0, 'Giá trị không thể âm']
    },
    maxDiscount: {
        type: Number,
        min: [0, 'Giá trị không thể âm']
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    usageLimitPerUser: {
        type: Number,
        default: 1
    },
    usedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedAt: {
            type: Date,
            default: Date.now
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    }],
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    startDate: {
        type: Date,
        required: [true, 'Vui lòng nhập ngày bắt đầu']
    },
    endDate: {
        type: Date,
        required: [true, 'Vui lòng nhập ngày kết thúc']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Kiểm tra coupon còn hiệu lực
couponSchema.methods.isValid = function () {
    const now = new Date();
    return (
        this.isActive &&
        now >= this.startDate &&
        now <= this.endDate &&
        (this.usageLimit === null || this.usedCount < this.usageLimit)
    );
};

// Tính giảm giá
couponSchema.methods.calculateDiscount = function (orderTotal) {
    if (!this.isValid()) return 0;
    if (orderTotal < this.minOrderValue) return 0;

    let discount = 0;
    if (this.type === 'percentage') {
        discount = (orderTotal * this.value) / 100;
        if (this.maxDiscount) {
            discount = Math.min(discount, this.maxDiscount);
        }
    } else {
        discount = this.value;
    }

    return Math.min(discount, orderTotal);
};

couponSchema.index({ code: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
