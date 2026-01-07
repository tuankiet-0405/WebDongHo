const express = require('express');
const router = express.Router();
const { Product, Category } = require('../models');

// API sản phẩm
router.get('/products', async (req, res) => {
    try {
        const { page = 1, limit = 12, category, brand, sort } = req.query;
        const skip = (page - 1) * limit;

        let query = { isActive: true };
        if (category) query.category = category;
        if (brand) query.brand = brand;

        let sortOption = { createdAt: -1 };
        if (sort === 'price-asc') sortOption = { price: 1 };
        if (sort === 'price-desc') sortOption = { price: -1 };
        if (sort === 'rating') sortOption = { 'rating.average': -1 };

        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('category', 'name slug');

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API chi tiết sản phẩm
router.get('/products/:slug', async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true })
            .populate('category');

        if (!product) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm' });
        }

        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API danh mục
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ order: 1 })
            .populate('productCount');

        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API tìm kiếm
router.get('/search', async (req, res) => {
    try {
        const { q, page = 1, limit = 12 } = req.query;

        if (!q) {
            return res.json({ success: true, data: [], total: 0 });
        }

        const skip = (page - 1) * limit;

        const products = await Product.find({
            $text: { $search: q },
            isActive: true
        })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('category', 'name slug');

        const total = await Product.countDocuments({
            $text: { $search: q },
            isActive: true
        });

        res.json({
            success: true,
            data: products,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API thương hiệu
router.get('/brands', async (req, res) => {
    try {
        const brands = await Product.distinct('brand', { isActive: true });
        res.json({ success: true, data: brands });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
