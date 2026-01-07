const express = require('express');
const router = express.Router();
const { homeController } = require('../controllers');

router.get('/', homeController.index);
router.get('/about', homeController.about);
router.get('/contact', homeController.contact);
router.post('/contact', homeController.sendContact);
router.get('/search', homeController.search);

module.exports = router;
