const Joi = require('joi');

const verifySchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});

exports.validateVerifyPayload = (data) => verifySchema.validate(data);
