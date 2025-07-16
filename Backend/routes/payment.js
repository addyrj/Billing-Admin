const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/payment');

// POST /api/payment/create-razorpay-order
router.post('/create-payment', createOrder);

// POST /api/payment/verify
router.post('/verify', verifyPayment);

module.exports = router;
