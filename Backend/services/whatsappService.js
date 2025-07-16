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
    const totalAmount = `₹${parseFloat(poData.totalAmount).toFixed(2)}`;

    // Create the fixed parts of the message (header, supplier info, delivery info, summary)
    const messageHeader = `✨ *PURCHASE ORDER ${poData.poNo}* ✨
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
━━━━━━━━━━━━━━━━━━━━`;

    const messageSummary = `

💰 *ORDER SUMMARY*
━━━━━━━━━━━━━━━━━━━━
• *Subtotal:* ₹${(poData.totalAmount - poData.items.reduce((sum, item) => sum + (item.total - (item.rate * item.quantity)), 0)).toFixed(2)}
• *Tax Amount:* ₹${poData.items.reduce((sum, item) => sum + (item.total - (item.rate * item.quantity)), 0).toFixed(2)}
🟢 *TOTAL AMOUNT:* *₹${parseFloat(poData.totalAmount).toFixed(2)}*
📝 *Amount in words:*
"${poData.amountInWords}"

Thank you for your business With IotTech! 🙏
_Purchase Department_`;

    // Calculate available space for items
    const fixedContentLength = messageHeader.length + messageSummary.length;
    const maxItemsLength = 1580 - fixedContentLength; // Leave some buffer for safety
    
    // Build items section with character limit check
    let itemsSection = '';
    let truncated = false;
    
    for (let index = 0; index < poData.items.length; index++) {
      const item = poData.items[index];
      const itemText = `
📌 *Item ${index + 1}: ${item.productname}*
   ├─ *Code:* ${item.itemcode}
   ├─ *Description:* ${item.description}
   ├─ *Qty:* ${item.quantity} ${item.units}
   ├─ *Rate:* ₹${item.rate.toFixed(2)}
   ├─ *GST:* ${item.igst ? `IGST ${item.igst}%` : `CGST ${item.cgst}% + SGST ${item.sgst}%`}
   └─ *Total:* ₹${item.total.toFixed(2)}
`;

      // Check if adding this item would exceed the limit
      const truncationText = `\n...\n(${poData.items.length - index} more items - see full details in email/document)`;
      
      if (itemsSection.length + itemText.length + truncationText.length > maxItemsLength) {
        // Add truncation message if there are remaining items
        if (index < poData.items.length) {
          itemsSection += `\n...\n(${poData.items.length - index} more items - see full details in email/document)`;
          truncated = true;
        }
        break;
      }
      
      itemsSection += itemText;
    }

    // Combine all parts
    const finalMessage = (messageHeader + itemsSection + messageSummary).trim();

    // Final safety check
    if (finalMessage.length > 1600) {
      console.warn(`Message still too long: ${finalMessage.length} characters. Further truncation needed.`);
      // Emergency truncation - this shouldn't happen with proper calculation above
      const emergencyMessage = finalMessage.substring(0, 1580) + '\n...\n(Message truncated)';
      
      const response = await client.messages.create({
        body: emergencyMessage,
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${formattedNumber}`
      });
      
      console.log('WhatsApp message sent with emergency truncation:', response.sid);
      return response;
    }

    // Send the WhatsApp message
    const response = await client.messages.create({
      body: finalMessage,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log(`WhatsApp message sent successfully: ${response.sid}${truncated ? ' (items truncated due to length)' : ''}`);
    return response;
    
  } catch (error) {
    console.error('WhatsApp sending failed:', error.message);
    throw error;
  }
};

module.exports = { sendPurchaseOrderWhatsApp };