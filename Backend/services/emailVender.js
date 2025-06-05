const nodemailer = require('nodemailer');
require('dotenv').config();
const { generateInvoicePDF } = require('./pdfGenerator');

// Reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

const sendPurchaseOrderEmailVender = async (poData = false) => {
  try {
    // 1. Validate and format email
    if (!poData.email) throw new Error('Supplier email is required');
    
    // Remove any whitespace and convert to lowercase
    const supplierEmail = poData.email.trim().toLowerCase();
    
    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierEmail)) {
      throw new Error('Invalid supplier email format');
    }

    // 2. Generate PDF with error handling
    let pdfBuffer;
    try {
      pdfBuffer = await generateInvoicePDF(poData);
    } catch (pdfError) {
      console.error('❌ PDF generation failed:', pdfError);
      throw new Error('Failed to generate PDF attachment');
    }

    // 3. Prepare email content with rich HTML template
    const formattedDate = poData.date ? new Date(poData.date).toLocaleDateString('en-IN') : 'Not specified';
    const formattedSupplierDate = poData.supplierOfferDate ? new Date(poData.supplierOfferDate).toLocaleDateString('en-IN') : 'Not specified';

    const mailOptions = {
      from: `"Purchase Department" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: supplierEmail,
      subject: `${ 'New'} Purchase Order ${poData.poNo || ''}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { color: #2e7d32; border-bottom: 2px solid #2e7d32; padding-bottom: 10px; }
        .section-title { color: #1565c0; margin: 15px 0 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th { background-color: #1565c0; color: white; text-align: left; padding: 10px; }
        td { padding: 8px; border: 1px solid #ddd; }
        .row-odd { background-color: #ffffff; }
        .row-even { background-color: #f5f5f5; }
        .address-box { background-color: #e3f2fd; padding: 10px; border-radius: 4px; border: 1px solid #ddd; }
        .total { text-align: right; font-weight: bold; color: #1565c0; }
    </style>
</head>
<body>
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <h2 class="header">
            ${ 'New'} Purchase Order ${poData.poNo ? poData.poNo : ''}
        </h2>
        
        <!-- Basic Info -->
        <table>
            <tr>
                <td style="background-color: #e3f2fd; width: 30%;"><strong>PO Date:</strong></td>
                <td>${formattedDate}</td>
            </tr>
            <tr>
                <td style="background-color: #f5f5f5;"><strong>Supplier:</strong></td>
                <td>${poData.supplier || 'Not specified'}</td>
            </tr>
            <tr>
                <td style="background-color: #e3f2fd;"><strong>Supplier Offer No:</strong></td>
                <td>${poData.supplierOfferNo || 'Not specified'} (${formattedSupplierDate})</td>
            </tr>
            <tr>
                <td style="background-color: #f5f5f5;"><strong>Reference No:</strong></td>
                <td>${poData.refNo || 'Not specified'}</td>
            </tr>
        </table>
        
        <!-- Supplier Details -->
        <h3 class="section-title">Supplier Details</h3>
        <table>
            <tr>
                <td style="background-color: #e3f2fd; width: 30%;"><strong>Address:</strong></td>
                <td>${poData.supplierAddress || 'Not specified'}</td>
            </tr>
            <tr>
                <td style="background-color: #f5f5f5;"><strong>Contact Person:</strong></td>
                <td>${poData.contactPerson || 'Not specified'}</td>
            </tr>
            <tr>
                <td style="background-color: #e3f2fd;"><strong>Contact Number:</strong></td>
                <td>${poData.contactNo || 'Not specified'}</td>
            </tr>
             <tr>
                <td style="background-color: #e3f2fd;"><strong>WhatsApp No:</strong></td>
                <td>${poData.whatsappNo || 'Not specified'}</td>
            </tr>
            <tr>
                <td style="background-color: #f5f5f5;"><strong>Email:</strong></td>
                <td>${poData.email || 'Not specified'}</td>
            </tr>
            <tr>
                <td style="background-color: #e3f2fd;"><strong>GST No:</strong></td>
                <td>${poData.supplierGST || 'Not specified'}</td>
            </tr>
        </table>
        
        <!-- Delivery Details -->
        <h3 class="section-title">Delivery Details</h3>
        <table style="width: 100%;">
            <tr>
                <td style="width: 48%; vertical-align: top; padding-right: 10px;">
                    <h4 style="color: #1565c0; margin: 10px 0;">Delivery Address</h4>
                    <div class="address-box">
                        <p style="margin: 0;">${poData.deliveryAddress || 'Not specified'}</p>
                    </div>
                </td>
                <td style="width: 48%; vertical-align: top;">
                    <h4 style="color: #1565c0; margin: 10px 0;">Transportation</h4>
                    <div class="address-box">
                        <p style="margin: 0;">${poData.transportation || 'Not specified'}</p>
                        <p style="margin: 10px 0 0 0;"><strong>Delivery Period:</strong> ${poData.deliveryPeriod || 'Not specified'}</p>
                    </div>
                </td>
            </tr>
        </table>
        
        <!-- Items Table -->
        <h3 class="section-title">Order Items</h3>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Units</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${poData.items.map((item, index) => `
                    <tr class="${index % 2 === 0 ? 'row-odd' : 'row-even'}">
                        <td>${item.description || item.productname || 'N/A'}</td>
                        <td>${item.units || 'N/A'}</td>
                        <td>${item.quantity || 0}</td>
                        <td>₹${item.rate ? item.rate.toFixed(2) : '0.00'}</td>
                        <td>₹${item.total ? item.total.toFixed(2) : '0.00'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <!-- Totals -->
        <div class="total">
            <p>Subtotal: ₹${poData.totalAmount ? parseFloat(poData.totalAmount).toFixed(2) : '0.00'}</p>
            <p>Amount in Words: ${poData.amountInWords || 'Not specified'}</p>
        </div>
        
        <!-- Footer -->
        <p style="margin-top: 20px;">
            This is an ${ 'new purchase order'}. Please find the attached PDF for complete details.
        </p>
        <p>Regards,<br>Purchase Department of Iottech Smart products</p>
    </div>
</body>
</html>
      `,
      attachments: [{
        filename: `PO_${poData.poNo || Date.now()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };

    // 4. Send email with timeout
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout')), 30000)
      )
    ]);

    console.log(`✅ ${ 'New'} purchase order email sent to ${supplierEmail}:`, info.messageId);
    return info;
    
  } catch (error) {
    console.error(`❌ Failed to send ${ 'new'} purchase order email:`, {
      error: error.message,
      poNumber: poData.poNo,
      supplierEmail: poData.email,
      time: new Date().toISOString()
    });
    throw error;
  }
};

module.exports = { sendPurchaseOrderEmailVender };