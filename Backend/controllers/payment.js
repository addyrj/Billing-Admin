const Razorpay = require('razorpay');
const crypto = require('crypto');
const { savePayment } = require('../models/payment');
const { validateVerifyPayload } = require('../validations/payment');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    res.json({ id: order.id, currency: order.currency, amount: order.amount });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      error: 'Failed to create payment order',
      details: error.error?.description || error.message
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const { error } = validateVerifyPayload(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await savePayment({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
      });

      return res.json({ message: 'Payment verified and saved successfully.' });
    } else {
      return res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (err) {
    console.error('Verification Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
