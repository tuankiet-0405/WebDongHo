const passport = require('passport');
const { User } = require('../models');
const emailService = require('../services/emailService');

// Trang đăng nhập
exports.loginPage = (req, res) => {
    if (req.user) return res.redirect('/');

    res.render('auth/login', {
        title: 'Đăng nhập | Watch Store'
    });
};

// Xử lý đăng nhập
exports.login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: req.session.returnTo || '/',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
};

// Trang đăng ký
exports.registerPage = (req, res) => {
    if (req.user) return res.redirect('/');

    res.render('auth/register', {
        title: 'Đăng ký | Watch Store'
    });
};

// Xử lý đăng ký
exports.register = async (req, res) => {
    try {
        const { name, email, password, password2, phone } = req.body;
        const errors = [];

        // Validate
        if (!name || !email || !password) {
            errors.push({ msg: 'Vui lòng điền đầy đủ thông tin' });
        }

        if (password !== password2) {
            errors.push({ msg: 'Mật khẩu xác nhận không khớp' });
        }

        if (password.length < 6) {
            errors.push({ msg: 'Mật khẩu ít nhất 6 ký tự' });
        }

        if (errors.length > 0) {
            return res.render('auth/register', {
                title: 'Đăng ký | Watch Store',
                errors,
                name,
                email,
                phone
            });
        }

        // Kiểm tra email tồn tại
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.render('auth/register', {
                title: 'Đăng ký | Watch Store',
                errors: [{ msg: 'Email đã được sử dụng' }],
                name,
                phone
            });
        }

        // Tạo user mới
        const user = new User({
            name,
            email: email.toLowerCase(),
            password,
            phone
        });

        await user.save();

        req.flash('success_msg', 'Đăng ký thành công! Vui lòng đăng nhập');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Register error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra');
        res.redirect('/auth/register');
    }
};

// Đăng xuất
exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash('success_msg', 'Đã đăng xuất');
        res.redirect('/');
    });
};

// Trang quên mật khẩu
exports.forgotPasswordPage = (req, res) => {
    res.render('auth/forgot-password', {
        title: 'Quên mật khẩu | Watch Store'
    });
};

// Xử lý quên mật khẩu
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            req.flash('error_msg', 'Email không tồn tại trong hệ thống');
            return res.redirect('/auth/forgot-password');
        }

        // Tạo reset token
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ
        await user.save();

        // Gửi email reset password
        const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${token}`;

        emailService.sendPasswordReset(user.email, resetUrl, user.name).catch(err => {
            console.error('Failed to send password reset email:', err);
        });

        req.flash('success_msg', 'Đã gửi link đặt lại mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Forgot password error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra');
        res.redirect('/auth/forgot-password');
    }
};

// Trang đặt lại mật khẩu
exports.resetPasswordPage = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error_msg', 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
            return res.redirect('/auth/forgot-password');
        }

        res.render('auth/reset-password', {
            title: 'Đặt lại mật khẩu | Watch Store',
            token
        });
    } catch (error) {
        console.error('Reset password page error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra');
        res.redirect('/auth/forgot-password');
    }
};

// Xử lý đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            req.flash('error_msg', 'Mật khẩu xác nhận không khớp');
            return res.redirect(`/auth/reset-password/${token}`);
        }

        if (password.length < 6) {
            req.flash('error_msg', 'Mật khẩu ít nhất 6 ký tự');
            return res.redirect(`/auth/reset-password/${token}`);
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error_msg', 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
            return res.redirect('/auth/forgot-password');
        }

        // Cập nhật mật khẩu
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash('success_msg', 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Reset password error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra');
        res.redirect('/auth/forgot-password');
    }
};

