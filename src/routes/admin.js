const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Middleware: yêu cầu đăng nhập và quyền admin
router.use(ensureAuthenticated);
router.use(ensureAdmin);

// Dashboard
router.get('/', adminController.dashboard);

// Products
router.get('/products', adminController.products);
router.get('/products/create', adminController.createProductPage);
router.post('/products', upload.array('images', 5), adminController.createProduct);
router.get('/products/:id/edit', adminController.editProductPage);
router.put('/products/:id', upload.array('images', 5), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Categories
router.get('/categories', adminController.categories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Orders
router.get('/orders', adminController.orders);
router.get('/orders/:id', adminController.orderDetail);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Users
router.get('/users', adminController.users);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.put('/users/:id/role', adminController.changeUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Coupons
router.get('/coupons', adminController.coupons);
router.post('/coupons', adminController.createCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Reviews
router.get('/reviews', adminController.reviews);
router.put('/reviews/:id/approve', adminController.approveReview);
router.delete('/reviews/:id', adminController.deleteReview);

// Settings
router.get('/settings', adminController.settings);

module.exports = router;
