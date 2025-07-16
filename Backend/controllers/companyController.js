const db = require("../config/db");
const Company = require("../models/companyModel");
const paymentUpload = require('../config/paymentUpload');
const { companySchema, updateCompanySchema } = require("../validations/companyValidation");
const sendCompanyEmail = require("../services/mailer");
const ExcelJS = require('exceljs');
const fs = require('fs');
// Helper function to get next serial number
const getNextCompanySerialNumber = async (partnerId) => {
    const query = "SELECT MAX(serialNumber) AS maxSerialNumber FROM partnerdata WHERE partnerId = ?";
    const [results] = await db.query(query, [partnerId]);
    return results[0].maxSerialNumber ? results[0].maxSerialNumber + 1 : 1;
};

const createCompany = async (req, res) => {
    console.log('1. Starting company creation process');
    
    try {
        console.log('2. Validating request body');
        const { error } = companySchema.validate(req.body);
        if (error) {
            console.log('Validation failed:', error.details);
            
            // Return file info instead of deleting (for potential reuse)
            const uploadedFiles = req.files?.map(file => ({
                filename: file.filename,
                path: `/payment-images/${file.filename}`
            }));
            
            return res.status(400).json({ 
                success: false,
                message: "Validation failed",
                errors: error.details,
                uploadedFiles
            });
        }
        console.log('3. Getting partner info');
        const partnerId = req.user.id;
        const [partnerResult] = await db.query('SELECT username FROM users WHERE id = ?', [partnerId]);
        console.log('Partner query result:', partnerResult);

        if (!partnerResult || partnerResult.length === 0) {
            console.log('Partner not found in database');

            // Clean up files if partner not found
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }

            return res.status(404).json({
                success: false,
                message: "Partner user not found"
            });
        }

        console.log('4. Calculating product totals');
        let grandTotalPrice = 0;
        const updatedProducts = req.body.products.map(product => {
            const basePrice = product.price * product.quantity;
            const gstAmount = product.gstIncluded ? basePrice * 0.18 : 0;
            const totalPrice = basePrice + gstAmount;
            grandTotalPrice += totalPrice;
            return { ...product, totalPrice };
        });
        console.log('Calculated grand total:', grandTotalPrice);

        console.log('5. Preparing company data');
        const companyData = {
            ...req.body,
            products: updatedProducts,
            grandTotalPrice,
            partnerId,
            partnerName: partnerResult[0].username,
            registeredOfficeAddress: req.body.sameAsBilling
                ? req.body.billingAddress
                : req.body.registeredOfficeAddress,
            shippingAddress: req.body.sameAsBilling
                ? req.body.billingAddress
                : req.body.shippingAddress,
            contactNumbers: req.body.ContactNumbers,
            paymentMethod: req.body.paymentMethod || 'cod',
            paymentReference: req.body.paymentReference || null
        };
        console.log('Prepared company data:', JSON.stringify(companyData, null, 2));

        console.log('6. Getting serial number');
        const serialNumber = await getNextCompanySerialNumber(partnerId);
        console.log('Generated serial number:', serialNumber);

        console.log('7. Creating company in database');
        const result = await Company.create(companyData, serialNumber);
        console.log('Database insert result:', result);

        // Save payment details
        await Company.updatePaymentDetails(result.insertId, {
            paymentMethod: companyData.paymentMethod,
            paymentReference: companyData.paymentReference,
            paymentStatus: 'pending'
        });

        // Save payment images if any
        // Save payment images if any
        if (req.files?.length > 0) {
            console.log('Saving payment images:', req.files.length);
            try {
                await Company.addPaymentImages(result.insertId, req.files);
                console.log('Payment images saved to database');
            } catch (dbError) {
                console.error('Failed to save payment images:', dbError);
                // Consider whether to proceed or fail the request
            }
        }

        console.log('8. Sending confirmation email');
        const companyWithImages = {
            ...companyData,
            id: result.insertId,
            paymentImages: req.files ? req.files.map(f => `/payment-images/${f.filename}`) : []
        };
        await sendCompanyEmail(companyWithImages);

        console.log('9. Returning success response');
        return res.status(201).json({
            success: true,
            message: "Company created successfully",
            data: {
                id: result.insertId,
                serialNumber,
                grandTotalPrice,
                paymentMethod: companyData.paymentMethod,
                paymentReference: companyData.paymentReference,
                paymentImages: req.files ? req.files.map(f => `/payment-images/${f.filename}`) : []
            }
        });


    } catch (err) {
        console.error('10. Error occurred:', err);

        // Clean up files only on server errors (500), not validation errors (400)
        if (err.status !== 400 && req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (cleanupErr) {
                    console.error('Error cleaning up file:', cleanupErr);
                }
            });
        }

        const status = err.status || 500;
        return res.status(status).json({
            success: false,
            message: err.message || "Failed to create company"
        });
    }
};
// Get all companies (public)
const getAllCompaniesPublic = async (req, res) => {
    try {
        let results = await Company.getAll();
        results = await Promise.all(results); // Wait for all payment data to be fetched

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No companies found"
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (err) {
        console.error("Error fetching companies:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch companies",
            error: process.env.NODE_ENV === 'development' ? err.message : null
        });
    }
};

// Get All Companies (with ownership check)
const getAllCompaniesWithOwnership = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`Fetching companies for user ${userId} with role ${userRole}`); // Debug log

        let results;
        if (userRole === 'adminsales') {
            console.log('Fetching all salesuser companies');
            results = await Company.getAllByRole('salesuser');
        } else {
            console.log(`Fetching companies for partner ${userId}`);
            results = await Company.getAllByPartner(userId);
        }

        console.log(`Found ${results.length} companies`); // Debug log

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No companies found for the current user",
                userRole,
                userId
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (err) {
        console.error("Error fetching companies:", {
            error: err.message,
            stack: err.stack,
            userId: req.user.id,
            role: req.user.role
        });
        res.status(500).json({
            success: false,
            message: "Failed to fetch companies",
            error: process.env.NODE_ENV === 'development' ? err.message : null
        });
    }
};

// Get Company by ID (with ownership check)
const getCompanyByIdWithOwnership = async (req, res) => {
    try {
        const companyId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`Fetch request for company ${companyId} by user ${userId} (${userRole})`);

        if (!companyId || isNaN(companyId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid company ID"
            });
        }

        const company = await Company.getById(companyId);
        console.log('Company found:', company ? company.id : 'null');

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        // Ownership check
        if (userRole === 'salesuser' && company.partnerId !== userId) {
            console.warn(`User ${userId} unauthorized to access company ${companyId}`);
            return res.status(403).json({
                success: false,
                message: "Access denied - not your company"
            });
        }

        res.status(200).json({
            success: true,
            data: company
        });

    } catch (error) {
        console.error("Company Fetch Error:", {
            error: error.message,
            stack: error.stack,
            params: req.params,
            user: req.user
        });
        res.status(500).json({
            success: false,
            message: "Failed to fetch company",
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};
getById: async (id) => {
    try {
        const query = "SELECT * FROM partnerdata WHERE id = ?";
        const [results] = await db.query(query, [id]);
        if (results.length === 0) {
            return null;
        }
        const company = results[0];
        
        // Get payment details and images
        const paymentDetails = await Company.getPaymentDetails(id);
        const paymentImages = await Company.getPaymentImages(id);

        return {
            ...Company.parseCompanyResults(results)[0],
            paymentMethod: paymentDetails?.payment_method || 'cod',
            paymentReference: paymentDetails?.payment_reference || '',
            paymentStatus: paymentDetails?.payment_status || 'pending',
            paymentImages: paymentImages || []
        };
    } catch (err) {
        console.error(`Error getting company data by ID ${id}:`, err);
        throw err;
    }
};
// controllers/companyController.js
const updateCompanyByIdWithOwnership = async (req, res) => {
    try {
        const companyId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verify company exists and user has access
        const existingCompany = await Company.getById(companyId);
        if (!existingCompany) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        if (userRole === 'salesuser' && existingCompany.partnerId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Validate the update data
        const { error } = updateCompanySchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Prepare update data (only include provided fields)
        const updateData = {};

        // Copy only the fields that were actually provided in the request
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                updateData[key] = req.body[key];
            }
        });

        // Special handling for products to recalculate totals
        if (updateData.products) {
            let grandTotalPrice = 0;
            updateData.products = updateData.products.map(product => {
                const basePrice = product.price * product.quantity;
                const gstAmount = product.gstIncluded ? basePrice * 0.18 : 0;
                const totalPrice = basePrice + gstAmount;
                grandTotalPrice += totalPrice;
                return { ...product, totalPrice };
            });
            updateData.grandTotalPrice = grandTotalPrice;
        }

        // Process the update
        const result = await Company.update(companyId, updateData);

        // Get the updated company data to send in email
        const updatedCompany = await Company.getById(companyId);

        // Send update confirmation email
        try {
            await sendCompanyEmail(updatedCompany, 'update');
            console.log('Update confirmation email sent successfully');
        } catch (emailError) {
            console.error('Failed to send update email:', emailError);
            // Don't fail the whole request if email fails
        }

        res.status(200).json({
            success: true,
            message: "Company updated successfully",
            data: result
        });

    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update company",
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};
// Delete Company (admin only)
const deleteCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const result = await Company.delete(companyId);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Company data entry not found" });
        }

        res.status(200).json({ message: "Company data entry deleted successfully" });
    } catch (error) {
        console.error("Error deleting company entry:", error);
        res.status(500).json({ message: "Database error", error });
    }
};

// Partner Dashboard

const getPartnerDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role.toLowerCase();

        let results;
        if (userRole === 'adminsales') {
            results = await Company.getAllByRole('salesuser');
        } else if (userRole === 'salesuser') {
            results = await Company.getAllByPartner(userId);
        } else {
            return res.status(403).json({ message: "Unauthorized role" });
        }

        results = await Promise.all(results); // Wait for all payment data

        if (!results || results.length === 0) {
            return res.status(404).json({ message: "No companies found" });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
// Admin Sales Dashboard - sees only their own companies
const getAdminSalesDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        let results = await Company.getAllByPartner(userId);
        results = await Promise.all(results); // Wait for all payment data

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No companies found for your admin account"
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (err) {
        console.error("Admin Sales Dashboard error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to load admin dashboard",
            error: process.env.NODE_ENV === 'development' ? err.message : null
        });
    }
};

// Export to Excel


// Update the exportCompaniesToExcel controller
const exportCompaniesToExcel = async (req, res) => {
    try {
        console.log(`Export request received`);

        // Get all companies regardless of role
        const results = await Company.getAll();

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No companies found to export"
            });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Company Data");

        // Enhanced headers with more detailed fields
        const headers = [
            "ID", "Serial Number", "Company Name", "Firm Type",
            "Nature of Business", "GST No", "Email","Payment Method", "Payment Reference", "Payment Status", "Payment Images",
            "Registered Address", "Registered City", "Registered State", "Registered Pin",
            "Billing Address", "Billing City", "Billing State", "Billing Pin",
            "Shipping Address", "Shipping City", "Shipping State", "Shipping Pin",
            "Same As Billing",
            "Primary Contact", "Secondary Contact", "Other Contacts",
            "Product Details", "Total Quantity", "Total Amount (₹)", "GST Amount (₹)",
            "Grand Total (₹)", "Partner ID", "Partner Name",
            "Created At", "Updated At"
        ];
        worksheet.addRow(headers);

        // Style the header row
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Add data rows
        results.forEach(company => {
            // Parse contact numbers
            let contacts = { primary: '', secondary: '', others: '' };
            try {
                const contactNumbers = JSON.parse(company.contactNumbers || "[]");
                if (contactNumbers.length > 0) contacts.primary = contactNumbers[0];
                if (contactNumbers.length > 1) contacts.secondary = contactNumbers[1];
                if (contactNumbers.length > 2) contacts.others = contactNumbers.slice(2).join(", ");
            } catch (e) {
                console.error('Error parsing contact numbers:', e);
            }

            // Process products
            let productDetails = '';
            let totalQuantity = 0;
            let totalAmount = 0;
            let gstAmount = 0;

            try {
                const products = typeof company.products === 'string' ?
                    JSON.parse(company.products) :
                    (company.products || []);

                productDetails = products.map(p =>
                    `${p.name} (${p.modelNumber || 'N/A'}) - Qty: ${p.quantity}, Price: ₹${p.price}`
                ).join("\n");

                totalQuantity = products.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);
                totalAmount = products.reduce((sum, p) => {
                    const price = parseFloat(p.price) || 0;
                    const qty = parseInt(p.quantity) || 0;
                    return sum + (price * qty);
                }, 0);

                gstAmount = products.reduce((sum, p) => {
                    if (p.gstIncluded) {
                        const price = parseFloat(p.price) || 0;
                        const qty = parseInt(p.quantity) || 0;
                        return sum + (price * qty * 0.18);
                    }
                    return sum;
                }, 0);
            } catch (e) {
                console.error('Error processing products:', e);
            }

            // Parse addresses
            const parseAddress = (addr) => {
                if (typeof addr === 'string') {
                    try {
                        return JSON.parse(addr);
                    } catch {
                        return {};
                    }
                }
                return addr || {};
            };

            const regAddress = parseAddress(company.registeredOfficeAddress);
            const billAddress = parseAddress(company.billingAddress);
            const shipAddress = parseAddress(company.shippingAddress);

            // Add row with all data
            worksheet.addRow([
                company.id,
                company.serialNumber,
                company.companyName,
                company.firmType,
                company.natureOfBusiness,
                company.gstNo,
                company.email,
                company.paymentMethod || 'cod',
company.paymentReference || '',
company.paymentStatus || 'pending',
company.paymentImages?.join("\n") || '',
                regAddress.address || '',
                regAddress.city || '',
                regAddress.state || '',
                regAddress.pinCode || '',
                billAddress.address || '',
                billAddress.city || '',
                billAddress.state || '',
                billAddress.pinCode || '',
                shipAddress.address || '',
                shipAddress.city || '',
                shipAddress.state || '',
                shipAddress.pinCode || '',
                company.sameAsBilling ? 'Yes' : 'No',
                contacts.primary,
                contacts.secondary,
                contacts.others,
                productDetails,
                totalQuantity,
                totalAmount.toFixed(2),
                gstAmount.toFixed(2),
                company.grandTotalPrice ? parseFloat(company.grandTotalPrice).toFixed(2) : '0.00',
                company.partnerId,
                company.partnerName,
                company.created_at,
                company.updated_at
            ]);
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                let columnLength = cell.value ? cell.value.toString().length : 0;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

        // Set response headers
        res.setHeader('Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition',
            'attachment; filename=companies_export_' + new Date().toISOString().split('T')[0] + '.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Export Error:", {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: "Export failed",
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};


module.exports = {
    createCompany,
    getAllCompaniesPublic,
    getAllCompaniesWithOwnership,
    getCompanyByIdWithOwnership,
    getPartnerDashboard,
    getAdminSalesDashboard,
    updateCompanyByIdWithOwnership,
    deleteCompanyById,
    exportCompaniesToExcel
};