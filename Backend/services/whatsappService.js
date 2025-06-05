const twilio = require('twilio');
require('dotenv').config();

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendPurchaseOrderWhatsApp = async (poData, whatsappNumber) => {
  try {
    // Validate and format number
    if (!whatsappNumber) throw new Error('WhatsApp number is required');
    let formattedNumber = whatsappNumber.startsWith('+') ? whatsappNumber : `+91${whatsappNumber.replace(/\D/g, '')}`;

    // Get Twilio WhatsApp number
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber) throw new Error('Twilio WhatsApp number not configured');

    // Format dates and amounts
    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-IN') : 'Not specified';
    const formattedDate = formatDate(poData.date);
    const formattedSupplierDate = formatDate(poData.supplierOfferDate);
    const totalAmount = `₹${parseFloat(poData.totalAmount).toFixed(2)}`;

    // Create beautiful WhatsApp message
    const message = `
✨ *PURCHASE ORDER ${poData.poNo}* ✨
📅 *Date:* ${formattedDate} |📋 *Reference No:* ${poData.refNo || 'Not specified'}
━━━━━━━━━━━━━━━━━━━━
📌 *SUPPLIER DETAILS*
━━━━━━━━━━━━━━━━━━━━
🏢 *Supplier:* ${poData.supplier || 'Not specified'}
🏠 *Address:* ${poData.supplierAddress || 'Not specified'}
👤 *Contact:* ${poData.contactPerson || 'Not specified'}
📞 *Phone:* ${poData.contactNo || 'Not specified'}
💬 *WhatsApp:* ${poData.whatsappNo || 'Not specified'}
📧 *Email:* ${poData.email || 'Not specified'}
🏷️ *GST No:* ${poData.supplierGST || 'Not specified'}

🚚 *DELIVERY INFO*
━━━━━━━━━━━━━━━━━━━━
📍 *Address:*
${poData.deliveryAddress || 'Not specified'}

🚛 *Transport:* ${poData.transportation || 'Not specified'}
⏱️ *Delivery Period:* ${poData.deliveryPeriod || 'Not specified'}

🛒 *ORDER ITEMS* (${poData.items.length})
━━━━━━━━━━━━━━━━━━━━
${poData.items.map((item, index) => `
📌 *Item ${index + 1}: ${item.productname}*
   ├─ *Code:* ${item.itemcode}
   ├─ *Description:* ${item.description}
   ├─ *Qty:* ${item.quantity} ${item.units}
   ├─ *Rate:* ₹${item.rate.toFixed(2)}
   ├─ *GST:* ${item.igst ? `IGST ${item.igst}%` : `CGST ${item.cgst}% + SGST ${item.sgst}%`}
   └─ *Total:* ₹${item.total.toFixed(2)}
`).join('')}

💰 *ORDER SUMMARY*
━━━━━━━━━━━━━━━━━━━━
• *Subtotal:* ₹${(poData.totalAmount - poData.items.reduce((sum, item) => sum + (item.total - (item.rate * item.quantity)), 0)).toFixed(2)}
• *Tax Amount:* ₹${poData.items.reduce((sum, item) => sum + (item.total - (item.rate * item.quantity)), 0).toFixed(2)}
🟢 *TOTAL AMOUNT:* *₹${parseFloat(poData.totalAmount).toFixed(2)}*
📝 *Amount in words:*
"${poData.amountInWords}"

Thank you for your business! 🙏
_Purchase Department_
    `.trim();

    // Send the WhatsApp message
    const response = await client.messages.create({
      body: message,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('WhatsApp message sent successfully:', response.sid);
    return response;
    
  } catch (error) {
    console.error('WhatsApp sending failed:', error.message);
    throw error;
  }
};

module.exports = { sendPurchaseOrderWhatsApp };