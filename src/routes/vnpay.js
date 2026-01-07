const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpayController');

// Create VNPay payment (GET because we redirect here from order creation)
router.get('/create-payment', vnpayController.createPayment);

// VNPay return URL
router.get('/return', vnpayController.vnpayReturn);

// VNPay IPN (Instant Payment Notification)
router.get('/ipn', vnpayController.vnpayIPN);

module.exports = router;
