const { User, Order, Product } = require('../models');
const bcrypt = require('bcryptjs');

// Trang profile
exports.profile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('wishlist');

        res.render('users/profile', {
            title: 'Tài khoản | Watch Store',
            user
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// Cập nhật profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        await User.findByIdAndUpdate(req.user._id, {
            name,
            phone
        });

        req.flash('success_msg', 'Cập nhật thông tin thành công');
        res.redirect('/users/profile');
    } catch (error) {
        console.error('Update profile error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra');
        res.redirect('/users/profile');
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            req.flash('error_msg', 'Mật khẩu xác nhận không khớp');
            return res.redirect('/users/profile');
        }

        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            req.flash('error_msg', 'Mật khẩu hiện tại không đúng');
            return res.redirect('/users/profile');
        }

        user.password = newPassword;
        await user.save();

        req.flash('success_msg', 'Đổi mật khẩu thành công');
        res.redirect('/users/profile');
    } catch (error) {
        console.error('Change password error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra');
        res.redirect('/users/profile');
    }
};

// Danh sách đơn hàng
exports.orders = async (req, res) => {
    try {
        const { page = 1, status } = req.query;
        const limit = 10;
        const skip = (page - 1) * limit;

        let query = { user: req.user._id };
        if (status) query.status = status;

        const totalOrders = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.render('users/orders', {
            title: 'Đơn hàng của tôi | Watch Store',
            orders,
            totalOrders,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalOrders / limit),
            status
        });
    } catch (error) {
        console.error('User orders error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// Quản lý địa chỉ
exports.addresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.render('users/addresses', {
            title: 'Sổ địa chỉ | Watch Store',
            addresses: user.addresses
        });
    } catch (error) {
        console.error('Addresses error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// Thêm địa chỉ
exports.addAddress = async (req, res) => {
    try {
        const { name, phone, address, city, district, ward, isDefault } = req.body;

        const user = await User.findById(req.user._id);

        // Nếu đặt làm mặc định, bỏ default của các địa chỉ khác
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push({
            name,
            phone,
            address,
            city,
            district,
            ward,
            isDefault: isDefault || user.addresses.length === 0
        });

        await user.save();

        req.flash('success_msg', 'Thêm địa chỉ thành công');
        res.redirect('/users/addresses');
    } catch (error) {
        console.error('Add address error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra');
        res.redirect('/users/addresses');
    }
};

// Xóa địa chỉ
exports.removeAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { addresses: { _id: addressId } }
        });

        res.json({ success: true, message: 'Đã xóa địa chỉ' });
    } catch (error) {
        console.error('Remove address error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

// Wishlist
exports.wishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('wishlist');

        res.render('users/wishlist', {
            title: 'Sản phẩm yêu thích | Watch Store',
            products: user.wishlist
        });
    } catch (error) {
        console.error('Wishlist error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// Thêm/Xóa khỏi wishlist
exports.toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);

        const index = user.wishlist.indexOf(productId);

        if (index > -1) {
            user.wishlist.splice(index, 1);
            await user.save();
            res.json({ success: true, action: 'removed', message: 'Đã xóa khỏi yêu thích' });
        } else {
            user.wishlist.push(productId);
            await user.save();
            res.json({ success: true, action: 'added', message: 'Đã thêm vào yêu thích' });
        }
    } catch (error) {
        console.error('Toggle wishlist error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};
