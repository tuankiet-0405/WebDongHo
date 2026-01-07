// Middleware kiểm tra đăng nhập
exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    // Lưu URL để redirect sau khi đăng nhập
    req.session.returnTo = req.originalUrl;
    req.flash('error_msg', 'Vui lòng đăng nhập để tiếp tục');
    res.redirect('/auth/login');
};

// Middleware kiểm tra chưa đăng nhập
exports.ensureGuest = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

// Middleware kiểm tra quyền admin
exports.ensureAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
        return next();
    }
    req.flash('error_msg', 'Bạn không có quyền truy cập');
    res.redirect('/');
};

// Middleware kiểm tra quyền chủ tài khoản
exports.ensureOwner = (req, res, next) => {
    if (req.user && (req.user._id.toString() === req.params.id || req.user.role === 'admin')) {
        return next();
    }
    req.flash('error_msg', 'Bạn không có quyền thực hiện hành động này');
    res.redirect('back');
};
