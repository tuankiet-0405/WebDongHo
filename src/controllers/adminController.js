const { User, Product, Category, Order, Coupon, Review } = require('../models');
const emailService = require('../services/emailService');
const reportService = require('../services/reportService');

// Dashboard
exports.dashboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Thống kê tổng quan
        const stats = {
            totalProducts: await Product.countDocuments(),
            totalOrders: await Order.countDocuments(),
            totalUsers: await User.countDocuments({ role: 'customer' }),
            totalRevenue: 0,
            todayOrders: await Order.countDocuments({ createdAt: { $gte: today } }),
            pendingOrders: await Order.countDocuments({ status: 'pending' })
        };

        // Tổng doanh thu
        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ['delivered', 'shipping'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        stats.totalRevenue = revenueResult[0]?.total || 0;

        // Đơn hàng mới nhất
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10);

        // Sản phẩm bán chạy
        const topProducts = await Product.find()
            .sort({ sold: -1 })
            .limit(5);

        res.render('admin/dashboard', {
            title: 'Dashboard | Admin',
            stats,
            recentOrders,
            topProducts
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// ==================== PRODUCTS ====================
exports.products = async (req, res) => {
    try {
        const { page = 1, search, category, status } = req.query;
        const limit = 20;
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query.$text = { $search: search };
        }
        if (category) query.category = category;
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;

        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('category');

        const categories = await Category.find({ isActive: true });

        res.render('admin/products/index', {
            title: 'Quản lý sản phẩm | Admin',
            products,
            categories,
            totalProducts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / limit),
            filters: { search, category, status }
        });
    } catch (error) {
        console.error('Admin products error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

exports.createProductPage = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        const config = require('../config');

        res.render('admin/products/create', {
            title: 'Thêm sản phẩm | Admin',
            categories,
            brands: config.product.brands,
            movements: config.product.movements,
            genders: config.product.genders,
            styles: config.product.styles
        });
    } catch (error) {
        console.error('Create product page error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const productData = req.body;

        // Xử lý images nếu có upload
        if (req.files && req.files.length > 0) {
            productData.images = req.files.map((file, index) => ({
                url: `/uploads/products/${file.filename}`,
                alt: productData.name,
                isPrimary: index === 0
            }));
        }

        // Xử lý features và tags
        if (productData.features) {
            productData.features = productData.features.split('\n').filter(f => f.trim());
        }
        if (productData.tags) {
            productData.tags = productData.tags.split(',').map(t => t.trim());
        }

        const product = new Product(productData);
        await product.save();

        req.flash('success_msg', 'Thêm sản phẩm thành công');
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Create product error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra: ' + error.message);
        res.redirect('/admin/products/create');
    }
};

exports.editProductPage = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');

        if (!product) {
            req.flash('error_msg', 'Không tìm thấy sản phẩm');
            return res.redirect('/admin/products');
        }

        const categories = await Category.find({ isActive: true });
        const config = require('../config');

        res.render('admin/products/edit', {
            title: 'Sửa sản phẩm | Admin',
            product,
            categories,
            brands: config.product.brands,
            movements: config.product.movements,
            genders: config.product.genders,
            styles: config.product.styles
        });
    } catch (error) {
        console.error('Edit product page error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productData = req.body;

        // Xử lý features và tags
        if (productData.features) {
            productData.features = productData.features.split('\n').filter(f => f.trim());
        }
        if (productData.tags) {
            productData.tags = productData.tags.split(',').map(t => t.trim());
        }

        await Product.findByIdAndUpdate(id, productData);

        req.flash('success_msg', 'Cập nhật sản phẩm thành công');
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Update product error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra');
        res.redirect(`/admin/products/${req.params.id}/edit`);
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Đã xóa sản phẩm' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

// ==================== CATEGORIES ====================
exports.categories = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ order: 1 })
            .populate('parent')
            .populate('productCount');

        res.render('admin/categories/index', {
            title: 'Quản lý danh mục | Admin',
            categories
        });
    } catch (error) {
        console.error('Admin categories error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();

        req.flash('success_msg', 'Thêm danh mục thành công');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Create category error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra');
        res.redirect('/admin/categories');
    }
};

exports.updateCategory = async (req, res) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        // Kiểm tra có sản phẩm trong danh mục không
        const productCount = await Product.countDocuments({ category: req.params.id });

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa. Danh mục có ${productCount} sản phẩm`
            });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Đã xóa danh mục' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

// ==================== ORDERS ====================
exports.orders = async (req, res) => {
    try {
        const { page = 1, status, search } = req.query;
        const limit = 20;
        const skip = (page - 1) * limit;

        let query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customer.email': { $regex: search, $options: 'i' } },
                { 'customer.phone': { $regex: search, $options: 'i' } }
            ];
        }

        const totalOrders = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email');

        res.render('admin/orders/index', {
            title: 'Quản lý đơn hàng | Admin',
            orders,
            totalOrders,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalOrders / limit),
            filters: { status, search }
        });
    } catch (error) {
        console.error('Admin orders error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

exports.orderDetail = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user')
            .populate('items.product')
            .populate('statusHistory.updatedBy', 'name');

        if (!order) {
            req.flash('error_msg', 'Không tìm thấy đơn hàng');
            return res.redirect('/admin/orders');
        }

        res.render('admin/orders/detail', {
            title: `Đơn hàng ${order.orderNumber} | Admin`,
            order
        });
    } catch (error) {
        console.error('Order detail error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Store old status for email
        const oldStatus = order.status;

        await order.updateStatus(status, note, req.user._id);

        // Send status update email
        if (oldStatus !== status) {
            emailService.sendOrderStatusUpdate(order, oldStatus, status, note).catch(err => {
                console.error('Failed to send order status email:', err);
            });
        }

        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

// ==================== USERS ====================
exports.users = async (req, res) => {
    try {
        const { page = 1, role, search } = req.query;
        const limit = 20;
        const skip = (page - 1) * limit;

        let query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const totalUsers = await User.countDocuments(query);
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.render('admin/users/index', {
            title: 'Quản lý người dùng | Admin',
            users,
            totalUsers,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalUsers / limit),
            filters: { role, search }
        });
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            isActive: user.isActive,
            message: user.isActive ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản'
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

exports.changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['customer', 'admin', 'staff'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Không cho phép thay đổi role của chính mình
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Không thể thay đổi vai trò của chính mình' });
        }

        user.role = role;
        await user.save();

        res.json({
            success: true,
            role: user.role,
            message: `Đã đổi vai trò thành ${role === 'admin' ? 'Quản trị viên' : role === 'staff' ? 'Nhân viên' : 'Khách hàng'}`
        });
    } catch (error) {
        console.error('Change user role error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Không cho phép xóa chính mình
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản của chính mình' });
        }

        // Không cho phép xóa admin khác
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản admin' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Đã xóa người dùng thành công'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

// ==================== COUPONS ====================

exports.coupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });

        res.render('admin/coupons/index', {
            title: 'Quản lý mã giảm giá | Admin',
            coupons
        });
    } catch (error) {
        console.error('Admin coupons error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        await coupon.save();

        req.flash('success_msg', 'Tạo mã giảm giá thành công');
        res.redirect('/admin/coupons');
    } catch (error) {
        console.error('Create coupon error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra: ' + error.message);
        res.redirect('/admin/coupons');
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Đã xóa mã giảm giá' });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

// ==================== REVIEWS ====================
exports.reviews = async (req, res) => {
    try {
        const { page = 1, status } = req.query;
        const limit = 20;
        const skip = (page - 1) * limit;

        let query = {};
        if (status === 'pending') query.isApproved = false;
        if (status === 'approved') query.isApproved = true;

        const totalReviews = await Review.countDocuments(query);
        const reviews = await Review.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('product', 'name slug')
            .populate('user', 'name email');

        res.render('admin/reviews/index', {
            title: 'Quản lý đánh giá | Admin',
            reviews,
            totalReviews,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReviews / limit),
            status
        });
    } catch (error) {
        console.error('Admin reviews error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

exports.approveReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        review.isApproved = true;
        await review.save();

        res.json({ success: true, message: 'Đã duyệt đánh giá' });
    } catch (error) {
        console.error('Approve review error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        await review.remove();

        res.json({ success: true, message: 'Đã xóa đánh giá' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

// ==================== SETTINGS ====================
exports.settings = async (req, res) => {
    try {
        res.render('admin/settings/index', {
            title: 'Cài đặt hệ thống | Admin'
        });
    } catch (error) {
        console.error('Admin settings error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// ==================== REPORTS ====================
exports.reportPage = async (req, res) => {
    try {
        res.render('admin/reports', {
            title: 'Báo cáo doanh thu | Admin'
        });
    } catch (error) {
        console.error('Report page error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

exports.getSalesReportData = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn khoảng thời gian'
            });
        }

        const report = await reportService.getSalesReport(startDate, endDate);

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Get sales report error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra: ' + error.message
        });
    }
};

exports.exportSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn khoảng thời gian'
            });
        }

        const csv = await reportService.generateCSV(startDate, endDate);
        const filename = `sales-report-${new Date().getTime()}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\ufeff' + csv);
    } catch (error) {
        console.error('Export sales report error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra: ' + error.message
        });
    }
};
