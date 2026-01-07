const { Category, Product } = require('../models');

// Danh sách danh mục
exports.index = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true, parent: null })
            .populate({
                path: 'children',
                match: { isActive: true }
            })
            .populate('productCount');

        res.render('categories/index', {
            title: 'Danh mục | Watch Store',
            categories
        });
    } catch (error) {
        console.error('Categories index error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};

// Chi tiết danh mục
exports.show = async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = 1, sort = 'newest' } = req.query;
        const limit = 12;
        const skip = (page - 1) * limit;

        const category = await Category.findOne({ slug, isActive: true });

        if (!category) {
            return res.status(404).render('errors/404', {
                title: 'Không tìm thấy danh mục'
            });
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
            default:
                sortOption = { createdAt: -1 };
        }

        const totalProducts = await Product.countDocuments({
            category: category._id,
            isActive: true
        });

        const products = await Product.find({
            category: category._id,
            isActive: true
        })
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        res.render('categories/show', {
            title: `${category.name} | Watch Store`,
            category,
            products,
            totalProducts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / limit),
            sort
        });
    } catch (error) {
        console.error('Category show error:', error);
        res.status(500).render('errors/500', { title: 'Lỗi server' });
    }
};
