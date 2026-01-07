const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { ensureAuthenticated } = require('../middleware/auth');

// Tất cả routes yêu cầu đăng nhập
router.use(ensureAuthenticated);

router.get('/profile', userController.profile);
router.post('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.get('/orders', userController.orders);
router.get('/addresses', userController.addresses);
router.post('/addresses', userController.addAddress);
router.delete('/addresses/:addressId', userController.removeAddress);
router.get('/wishlist', userController.wishlist);
router.post('/wishlist/:productId', userController.toggleWishlist);

module.exports = router;
