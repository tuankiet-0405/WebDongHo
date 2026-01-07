const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    rating: {
        type: Number,
        required: [true, 'Vui lòng đánh giá sản phẩm'],
        min: [1, 'Đánh giá tối thiểu 1 sao'],
        max: [5, 'Đánh giá tối đa 5 sao']
    },
    title: {
        type: String,
        trim: true,
        maxlength: [100, 'Tiêu đề không quá 100 ký tự']
    },
    content: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung đánh giá'],
        maxlength: [1000, 'Nội dung không quá 1000 ký tự']
    },
    images: [{
        type: String
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reply: {
        content: String,
        repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        repliedAt: Date
    }
}, {
    timestamps: true
});

// Mỗi user chỉ review 1 lần cho 1 sản phẩm
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Cập nhật rating trung bình của sản phẩm sau khi thêm/sửa/xóa review
reviewSchema.statics.calculateAverageRating = async function (productId) {
    const result = await this.aggregate([
        { $match: { product: productId, isApproved: true } },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    const Product = mongoose.model('Product');

    if (result.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            'rating.average': Math.round(result[0].averageRating * 10) / 10,
            'rating.count': result[0].reviewCount
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            'rating.average': 0,
            'rating.count': 0
        });
    }
};

reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post('remove', function () {
    this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
