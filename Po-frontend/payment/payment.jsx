import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Payment = () => {
  const location = useLocation();
  const { amount, orderDetails } = location.state || {};

  useEffect(() => {
    if (!amount) {
      // Handle case where amount is not provided
      console.error('No payment amount provided');
      // You might want to redirect back or show an error
      return;
    }
  }, [amount]);

  const handlePayment = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount * 100 }), // Convert to paise
      });

      const data = await response.json();

      if (!data.id) {
        alert('Order creation failed');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Your Company Name',
        description: 'Payment for Order',
        order_id: data.id,
        handler: async function (response) {
          const verifyRes = await fetch('http://localhost:4000/api/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: orderDetails // Pass order details to backend if needed
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.message) {
            alert('✅ Payment Verified: ' + verifyData.message);
            // Redirect to success page or order confirmation
          } else {
            alert('❌ Verification failed');
          }
        },
        prefill: {
          name: orderDetails?.companyName || 'Customer',
          email: orderDetails?.email || 'customer@example.com',
          contact: orderDetails?.ContactNumbers[0] || '9999999999',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="Payment" style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Complete Your Payment</h1>
      <div style={{ marginBottom: '1rem' }}>
        <p>Amount to pay: ₹{amount?.toFixed(2) || '0.00'}</p>
      </div>
      <button
        onClick={handlePayment}
        style={{
          backgroundColor: 'green',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Pay ₹{amount?.toFixed(2) || '0.00'}
      </button>
    </div>
  );
};

export default Payment;