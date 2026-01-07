const express = require('express');
const router = express.Router();
const { cartController } = require('../controllers');

router.get('/', cartController.index);
router.post('/add', cartController.add);
router.put('/update', cartController.update);
router.delete('/remove/:productId', cartController.remove);
router.delete('/clear', cartController.clear);
router.post('/apply-coupon', cartController.applyCoupon);

module.exports = router;
