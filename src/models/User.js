const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập họ tên'],
        trim: true,
        maxlength: [100, 'Họ tên không quá 100 ký tự']
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minlength: [6, 'Mật khẩu ít nhất 6 ký tự']
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: '/images/default-avatar.png'
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'staff'],
        default: 'customer'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    addresses: [{
        name: String,
        phone: String,
        address: String,
        city: String,
        district: String,
        ward: String,
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// So sánh password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Lấy tên hiển thị
userSchema.virtual('displayName').get(function () {
    return this.name || this.email.split('@')[0];
});

module.exports = mongoose.model('User', userSchema);
