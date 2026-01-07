const express = require('express');
const router = express.Router();
const { categoryController } = require('../controllers');

router.get('/', categoryController.index);
router.get('/:slug', categoryController.show);

module.exports = router;
