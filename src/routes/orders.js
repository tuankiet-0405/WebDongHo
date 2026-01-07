const express = require('express');
const router = express.Router();
const { orderController } = require('../controllers');

router.get('/checkout', orderController.checkout);
router.post('/create', orderController.create);
router.get('/success/:orderNumber', orderController.success);
router.get('/track', orderController.track);
router.get('/:id', orderController.show);
router.put('/:id/cancel', orderController.cancel);

module.exports = router;
