const { Product, Category, Contact } = require('../models');
const emailService = require('../services/emailService');

// Trang chủ
exports.index = async (req, res) => {
    try {
        // Sản phẩm nổi bật
        const featuredProducts = await Product.find({ isFeatured: true, isActive: true })
            .limit(8)
            .populate('category');

        // Sản phẩm mới
        const newProducts = await Product.find({ isNewArrival: true, isActive: true })
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('category');

        // Sản phẩm bán chạy
        const bestSellers = await Product.find({ isActive: true })
            .sort({ sold: -1 })
            .limit(8)
            .populate('category');

        // Danh mục nổi bật
        const featuredCategories = await Category.find({ isFeatured: true, isActive: true })
            .limit(6);

        res.render('home/index', {
            title: 'Trang chủ | Watch Store',
            featuredProducts,
            newProducts,
            bestSellers,
            featuredCategories
        });
    } catch (error) {
        console.error('Home error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// Trang giới thiệu
exports.about = (req, res) => {
    res.render('home/about', {
        title: 'Giới thiệu | Watch Store'
    });
};

// Trang liên hệ
exports.contact = (req, res) => {
    res.render('home/contact', {
        title: 'Liên hệ | Watch Store'
    });
};

// Xử lý form liên hệ
exports.sendContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            req.flash('error_msg', 'Vui lòng điền đầy đủ thông tin bắt buộc');
            return res.redirect('/contact');
        }

        // Save to database
        const contact = new Contact({
            name,
            email,
            phone,
            subject,
            message
        });
        await contact.save();

        // Send confirmation email to customer
        await emailService.sendContactConfirmation(name, email, message).catch(err => {
            console.error('Failed to send confirmation email:', err);
        });

        // Send notification email to admin
        await emailService.sendContactNotification(contact).catch(err => {
            console.error('Failed to send admin notification:', err);
        });

        req.flash('success_msg', 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất!');
        res.redirect('/contact');
    } catch (error) {
        console.error('Contact error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra. Vui lòng thử lại!');
        res.redirect('/contact');
    }
};

// Tìm kiếm
exports.search = async (req, res) => {
    try {
        const { q, page = 1 } = req.query;
        const limit = 12;
        const skip = (page - 1) * limit;

        if (!q) {
            return res.render('home/search', {
                title: 'Tìm kiếm | Watch Store',
                products: [],
                query: '',
                totalProducts: 0,
                currentPage: 1,
                totalPages: 1
            });
        }

        const searchQuery = {
            $text: { $search: q },
            isActive: true
        };

        const totalProducts = await Product.countDocuments(searchQuery);
        const products = await Product.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .populate('category');

        res.render('home/search', {
            title: `Kết quả tìm kiếm: ${q} | Watch Store`,
            products,
            query: q,
            totalProducts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / limit)
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};
