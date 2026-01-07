const express = require('express');
const router = express.Router();
const { productController } = require('../controllers');

router.get('/', productController.index);
router.get('/:slug', productController.show);
router.get('/quick-view/:id', productController.quickView);
router.post('/:productId/reviews', productController.addReview);

module.exports = router;
