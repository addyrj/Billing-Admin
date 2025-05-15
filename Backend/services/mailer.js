   






require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

const sendCompanyEmail = async (companyData, action = 'create') => {
    try {
        const recipients = process.env.EMAIL_RECIPIENTS.split(',').map(email => email.trim());
        const recipientEmails = recipients.join(',');

        // Safely handle contact numbers
        let contactNumbers = [];
        if (companyData.ContactNumbers) {
            contactNumbers = Array.isArray(companyData.ContactNumbers) 
                ? companyData.ContactNumbers 
                : [companyData.ContactNumbers];
        } else if (companyData.contactNumbers) {
            contactNumbers = Array.isArray(companyData.contactNumbers)
                ? companyData.contactNumbers
                : [companyData.contactNumbers];
        }

        // Calculate grand total if not provided
        if (!companyData.grandTotalPrice && companyData.products) {
            companyData.grandTotalPrice = companyData.products.reduce(
                (sum, p) => sum + (p.price * p.quantity), 0
            );
        }

        const mailOptions = {
            from: `"${companyData.partnerName}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: recipientEmails,
            subject: action === 'create' 
                ? `${companyData.partnerName} has Successfully Generated a Purchase Request`
                : `${companyData.partnerName} has Updated a Purchase Request`,
            html: generateEmailTemplate(companyData, action, contactNumbers)
        };

        await transporter.verify();
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.response);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        throw error;
    }
};

const formatContactNumbers = (numbers) => {
    if (!numbers || numbers.length === 0) return 'N/A';
    return numbers.filter(n => n).join(', ');
};

const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') {
        try {
            address = JSON.parse(address);
        } catch {
            return address;
        }
    }
    const parts = [
        address.address,
        address.city,
        address.state,
        address.pinCode
    ].filter(p => p);
    return parts.join(', ');
};

const generateEmailTemplate = (companyData, action, contactNumbers) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.4; color: #333333;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <tr>
            <td style="padding: 20px 0 10px 0;">
                <h2 style="color: #2e7d32; margin: 0; font-size: 20px; border-bottom: 2px solid #2e7d32; padding-bottom: 10px;">
                    ${companyData.partnerName} ${action === 'create' ? 'Generated' : 'Updated'} a Purchase Request
                </h2>
            </td>
        </tr>
        
        <!-- Partner Information -->
        <tr>
            <td style="padding: 10px 0;">
                <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #dddddd; border-collapse: collapse;">
                    <tr>
                        <td width="30%" style="background-color: #e3f2fd; border: 1px solid #dddddd; padding: 8px;"><strong>Partner Name:</strong></td>
                        <td style="border: 1px solid #dddddd; padding: 8px;">${companyData.partnerName}</td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Company Details -->
        <tr>
            <td style="padding: 10px 0;">
                <h3 style="color: #1565c0; margin: 10px 0; font-size: 16px;">Company Details</h3>
                <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #dddddd; border-collapse: collapse;">
                    <tr>
                        <td width="30%" style="background-color: #e3f2fd; border: 1px solid #dddddd; padding: 8px;"><strong>Company Name:</strong></td>
                        <td style="border: 1px solid #dddddd; padding: 8px;">${companyData.companyName}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f5f5f5; border: 1px solid #dddddd; padding: 8px;"><strong>Firm Type:</strong></td>
                        <td style="border: 1px solid #dddddd; padding: 8px;">${companyData.firmType}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #e3f2fd; border: 1px solid #dddddd; padding: 8px;"><strong>Registered Office Address:</strong></td>
                        <td style="border: 1px solid #dddddd; padding: 8px;">
                            ${formatAddress(companyData.registeredOfficeAddress)}
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f5f5f5; border: 1px solid #dddddd; padding: 8px;"><strong>GST No:</strong></td>
                        <td style="border: 1px solid #dddddd; padding: 8px;">${companyData.gstNo || "N/A"}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #e3f2fd; border: 1px solid #dddddd; padding: 8px;"><strong>Nature of Business:</strong></td>
                        <td style="border: 1px solid #dddddd; padding: 8px;">${companyData.natureOfBusiness}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f5f5f5; border: 1px solid #dddddd; padding: 8px;"><strong>Contact Numbers:</strong></td>
                         <td style="border: 1px solid #dddddd; padding: 8px;">${formatContactNumbers(contactNumbers)}</td>
                    </tr>


                    
                    <tr>
                        <td style="background-color: #e3f2fd; border: 1px solid #dddddd; padding: 8px;"><strong>Email:</strong></td>
                        <td style="border: 1px solid #dddddd; padding: 8px;">${companyData.email || "N/A"}</td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Addresses -->
        <tr>
            <td style="padding: 10px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td width="48%" valign="top" style="padding-right: 10px;">
                            <h3 style="color: #1565c0; margin: 10px 0; font-size: 16px;">Billing Address</h3>
                            <div style="background-color: #e3f2fd; padding: 10px; border-radius: 4px; border: 1px solid #dddddd;">
                                <p style="margin: 0;">
                                    ${formatAddress(companyData.billingAddress)}
                                </p>
                            </div>
                        </td>
                        <td width="48%" valign="top">
                            <h3 style="color: #1565c0; margin: 10px 0; font-size: 16px;">Shipping Address</h3>
                            <div style="background-color: #e3f2fd; padding: 10px; border-radius: 4px; border: 1px solid #dddddd;">
                                <p style="margin: 0;">
                                    ${formatAddress(companyData.shippingAddress)}
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Products -->
        <tr>
            <td style="padding: 10px 0;">
                <h3 style="color: #1565c0; margin: 10px 0; font-size: 16px;">Products</h3>
                <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #dddddd; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #1565c0; color: white;">
                            <th style="padding: 10px; border: 1px solid #dddddd; text-align: left;">Product Name</th>
                            <th style="padding: 10px; border: 1px solid #dddddd; text-align: left;">Model</th>
                            <th style="padding: 10px; border: 1px solid #dddddd; text-align: left;">Quantity</th>
                            <th style="padding: 10px; border: 1px solid #dddddd; text-align: left;">Price</th>
                            <th style="padding: 10px; border: 1px solid #dddddd; text-align: left;">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(companyData.products || []).map((product, index) => `
                            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f5f5f5'};">
                                <td style="padding: 8px; border: 1px solid #dddddd;">${product.name || 'N/A'}</td>
                                <td style="padding: 8px; border: 1px solid #dddddd;">${product.modelNumber || 'N/A'}</td>
                                <td style="padding: 8px; border: 1px solid #dddddd;">${product.quantity || 0}</td>
                                <td style="padding: 8px; border: 1px solid #dddddd;">₹${product.price || 0}</td>
                                <td style="padding: 8px; border: 1px solid #dddddd;">₹${(product.price || 0) * (product.quantity || 0)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </td>
        </tr>
        
        <!-- Grand Total -->
        <tr>
            <td style="padding: 15px 0; text-align: right;">
                <h2 style="color: #1565c0; margin: 0; font-size: 18px;"> Grand Total Price: ₹${companyData.grandTotalPrice || 0}</h2>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

module.exports = sendCompanyEmail;