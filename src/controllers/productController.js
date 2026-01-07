const { Product, Category, Review } = require('../models');

// Danh sách sản phẩm
exports.index = async (req, res) => {
    try {
        const {
            page = 1,
            sort = 'newest',
            brand,
            category,
            minPrice,
            maxPrice,
            gender,
            movement
        } = req.query;

        const limit = 12;
        const skip = (page - 1) * limit;

        // Build query
        let query = { isActive: true };

        if (brand) query.brand = brand;
        if (category) query.category = category;
        if (gender) query['specifications.gender'] = gender;
        if (movement) query['specifications.movement'] = movement;

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Sort options
        let sortOption = {};
        switch (sort) {
            case 'price-asc':
                sortOption = { price: 1 };
                break;
            case 'price-desc':
                sortOption = { price: -1 };
                break;
            case 'bestseller':
                sortOption = { sold: -1 };
                break;
            case 'rating':
                sortOption = { 'rating.average': -1 };
                break;
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate('category');

        // Get filter data
        const categories = await Category.find({ isActive: true });
        const brands = await Product.distinct('brand', { isActive: true });

        res.render('products/index', {
            title: 'Sản phẩm | Watch Store',
            products,
            categories,
            brands,
            totalProducts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / limit),
            filters: { sort, brand, category, minPrice, maxPrice, gender, movement }
        });
    } catch (error) {
        console.error('Products index error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// Chi tiết sản phẩm
exports.show = async (req, res) => {
    try {
        const { slug } = req.params;

        const product = await Product.findOne({ slug, isActive: true })
            .populate('category')
            .populate({
                path: 'reviews',
                match: { isApproved: true },
                populate: { path: 'user', select: 'name avatar' },
                options: { sort: { createdAt: -1 }, limit: 10 }
            });

        if (!product) {
            return res.status(404).render('errors/404', {
                title: 'Không tìm thấy sản phẩm'
            });
        }

        // Sản phẩm liên quan
        const relatedProducts = await Product.find({
            _id: { $ne: product._id },
            category: product.category._id,
            isActive: true
        }).limit(4);

        res.render('products/show', {
            title: `${product.name} | Watch Store`,
            product,
            relatedProducts
        });
    } catch (error) {
        console.error('Product show error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// Quick view (AJAX)
exports.quickView = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('category');

        if (!product) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        }

        res.json(product);
    } catch (error) {
        console.error('Quick view error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Thêm review
exports.addReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, title, content } = req.body;

        if (!req.user) {
            req.flash('error_msg', 'Vui lòng đăng nhập để đánh giá');
            return res.redirect('back');
        }

        // Kiểm tra đã review chưa
        const existingReview = await Review.findOne({
            product: productId,
            user: req.user._id
        });

        if (existingReview) {
            req.flash('error_msg', 'Bạn đã đánh giá sản phẩm này rồi');
            return res.redirect('back');
        }

        const review = new Review({
            product: productId,
            user: req.user._id,
            rating,
            title,
            content
        });

        await review.save();

        req.flash('success_msg', 'Đánh giá của bạn đang chờ duyệt');
        res.redirect('back');
    } catch (error) {
        console.error('Add review error:', error);
        req.flash('error_msg', 'Có lỗi xảy ra');
        res.redirect('back');
    }
};
