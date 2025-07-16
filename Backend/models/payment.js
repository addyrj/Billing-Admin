const pool = require('../config/db');

const savePayment = async ({ order_id, payment_id, signature }) => {
  const query = `
    INSERT INTO payments (razorpay_order_id, razorpay_payment_id, razorpay_signature, created_at)
    VALUES (?, ?, ?, NOW())
  `;
  const [result] = await pool.execute(query, [order_id, payment_id, signature]);
  return result.insertId;
};

module.exports = {
  savePayment,
};
