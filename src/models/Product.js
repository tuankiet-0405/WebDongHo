const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'],
        trim: true,
        maxlength: [200, 'Tên sản phẩm không quá 200 ký tự']
    },
    slug: {
        type: String,
        unique: true
    },
    sku: {
        type: String,
        unique: true,
        required: [true, 'Vui lòng nhập mã SKU']
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả sản phẩm']
    },
    shortDescription: {
        type: String,
        maxlength: [500, 'Mô tả ngắn không quá 500 ký tự']
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá sản phẩm'],
        min: [0, 'Giá không thể âm']
    },
    salePrice: {
        type: Number,
        min: [0, 'Giá sale không thể âm']
    },
    images: [{
        url: String,
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Vui lòng chọn danh mục']
    },
    brand: {
        type: String,
        required: [true, 'Vui lòng nhập thương hiệu']
    },
    // Thông số kỹ thuật đồng hồ
    specifications: {
        movement: {
            type: String,
            enum: ['Automatic', 'Quartz', 'Mechanical', 'Solar', 'Kinetic']
        },
        caseMaterial: String,
        caseSize: String,
        caseThickness: String,
        bandMaterial: String,
        bandWidth: String,
        waterResistance: String,
        crystalType: String,
        dialColor: String,
        gender: {
            type: String,
            enum: ['Nam', 'Nữ', 'Unisex']
        },
        style: String,
        weight: String,
        warranty: String
    },
    features: [String],
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Số lượng không thể âm']
    },
    sold: {
        type: Number,
        default: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNewArrival: {
        type: Boolean,
        default: true
    },
    tags: [String],
    metaTitle: String,
    metaDescription: String
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Tạo slug trước khi lưu
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, locale: 'vi' });
    }
    next();
});

// Virtual: Kiểm tra còn hàng
productSchema.virtual('inStock').get(function () {
    return this.stock > 0;
});

// Virtual: Tính % giảm giá
productSchema.virtual('discountPercent').get(function () {
    if (this.salePrice && this.salePrice < this.price) {
        return Math.round((1 - this.salePrice / this.price) * 100);
    }
    return 0;
});

// Virtual: Giá hiển thị
productSchema.virtual('displayPrice').get(function () {
    return this.salePrice || this.price;
});

// Virtual: Ảnh chính
productSchema.virtual('primaryImage').get(function () {
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : (this.images[0]?.url || '/images/no-image.png');
});

// Index cho search
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ sold: -1 });
productSchema.index({ createdAt: -1 });

// Virtual populate reviews
productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product'
});

module.exports = mongoose.model('Product', productSchema);
