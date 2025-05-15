const { invoiceOrderSchema, updateInvoiceOrderSchema } = require("../validations/invoiceValidation");
const PurchaseOrder = require("../models/invoiceModel");
const { convertToWords } = require('../config/amountConverter');
const { sendPurchaseOrderEmail } = require('../services/emailService');

// Helper function to validate form data
const validateFormData = (formData, isUpdate = false) => {
  try {
    const schema = isUpdate ? updateInvoiceOrderSchema : invoiceOrderSchema;
    const { error, value } = schema.validate(formData, { abortEarly: false });

    if (error) {
      return {
        error: true,
        errorResponse: {
          success: false,
          errors: error.details.map(err => ({
            field: err.path.join('.'),
            message: err.message.replace(/['"]+/g, '')
          }))
        }
      };
    }

    if (value.items?.length) {
      const calculatedTotal = parseFloat(
        value.items.reduce((sum, item) => sum + parseFloat(item.total.toFixed(2)), 0)
      ).toFixed(2);
      
      if (Math.abs(parseFloat(value.totalAmount) - parseFloat(calculatedTotal)) > 0.01) {
        return {
          error: true,
          errorResponse: {
            success: false,
            errors: [{
              field: 'totalAmount',
              message: `Total amount (${value.totalAmount}) does not match sum of item totals (${calculatedTotal})`
            }]
          }
        };
      }
    }

    return { validData: value };
  } catch (err) {
    console.error('Validation error:', err);
    throw new Error('Form validation failed');
  }
};

// Helper to handle controller errors
const handleControllerError = (res, err, context) => {
  console.error(`Error in ${context}:`, {
    message: err.message,
    stack: err.stack,
    code: err.code,
    time: new Date().toISOString()
  });

  if (err.message.includes('timed out')) {
    return res.status(504).json({
      success: false,
      message: 'Operation timed out',
      error: err.message
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      errors: [{
        field: err.sqlMessage.includes('poNo') ? 'poNo' : 'unknown',
        message: err.sqlMessage.includes('poNo') 
          ? 'PO number already exists' 
          : 'Duplicate entry error'
      }]
    });
  }

  if (err.code === 'NOT_FOUND') {
    return res.status(404).json({ 
      success: false, 
      message: err.message 
    });
  }

  if (err.code === 'DATE_VALIDATION') {
    return res.status(400).json({
      success: false,
      errors: [{
        field: 'supplierOfferDate',
        message: err.message
      }]
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    referenceId: Date.now()
  });
};

// Prepare form data
const prepareFormData = (body, files, isUpdate = false) => {
  const safeParseFloat = (num) => {
    if (typeof num === 'number') return num;
    if (typeof num === 'string') {
      const cleaned = num.replace(/[^\d.-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return null;
    if (dateStr instanceof Date) return dateStr.toISOString().split('T')[0];
    
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? (isUpdate ? null : dateStr) : date.toISOString().split('T')[0];
    } catch (e) {
      if (isUpdate) return null;
      throw new Error(`Invalid date: ${dateStr}`);
    }
  };

  let items = [];
  try {
    if (body.items) {
      const itemsData = typeof body.items === 'string' ? JSON.parse(body.items) : body.items;
      if (Array.isArray(itemsData)) {
        items = itemsData.map(item => ({
          ...item,
          id: +item.id || 0,
          rate: safeParseFloat(item.rate),
          quantity: +item.quantity || 0,
          cgst: safeParseFloat(item.cgst || 0),
          sgst: safeParseFloat(item.sgst || 0),
          igst: safeParseFloat(item.igst || 0),
          total: safeParseFloat(item.total || 0)
        }));
      }
    }
  } catch (e) {
    if (!isUpdate) throw new Error('Invalid items data format');
  }

  const itemsTotal = items.length > 0 
    ? parseFloat(items.reduce((sum, item) => sum + safeParseFloat(item.total || 0), 0)).toFixed(2)
    : safeParseFloat(body.totalAmount) || 0;

  const signatures = {};
  if (files) {
    ['preparedBySignature', 'verifiedBySignature', 'authorizedSignature'].forEach(field => {
      if (files[field]?.[0]) {
        signatures[field] = `/signatures/${files[field][0].filename}`;
      }
    });
  }

  const numericAmount = body.totalAmount ? safeParseFloat(body.totalAmount) : itemsTotal;
  const amountInWords = convertToWords(numericAmount);

  return {
    ...body,
    ...signatures,
    items,
    date: parseDate(body.date),
    supplierOfferDate: parseDate(body.supplierOfferDate),
    contactNo: body.contactNo?.replace(/\s+/g, '') || '',
    supplierGST: body.supplierGST?.toUpperCase() || '',
    totalAmount: numericAmount,
    amountInWords
  };
};

// Controller Actions

const createPurchaseOrder = async (req, res) => {
  try {
    const formData = prepareFormData(req.body, req.files);
    
    // Validate the form data
    const validationResult = validateFormData(formData);
    if (validationResult.error) {
      return res.status(400).json(validationResult.errorResponse);
    }

    const { validData } = validationResult;
    
    // Generate PO base without ID first
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearSegment = `${currentYear.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;
    const poBase = `PO-IOTTECH/${yearSegment}/`;

    // First create the record without poNo
    const dbData = {
      ...validData,
      items: validData.items ? JSON.stringify(validData.items) : null,
    };

    // Insert into database
    const result = await PurchaseOrder.create(dbData);
    
    // Now update with the final PO number
    const fullPoNumber = `${poBase}${result.insertId}`;
    await PurchaseOrder.updatePoNumber(result.insertId, fullPoNumber);
    
    // Fetch the complete record to return
    const createdOrder = await PurchaseOrder.getById(result.insertId);

    // Send email notification
    try {
      const recipients = process.env.EMAIL_RECIPIENTS?.split(',').map(email => email.trim()) || [];
      await sendPurchaseOrderEmail(createdOrder, recipients, false);
    } catch (emailError) {
      console.error('Email sending failed but order was created:', emailError);
      // Continue even if email fails
    }
    
    return res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: createdOrder
    });

  } catch (err) {
    console.error('Error in createPurchaseOrder:', {
      message: err.message,
      stack: err.stack,
      details: err.details,
      time: new Date().toISOString()
    });

    if (err.details?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: err.message,
        field: err.details.field
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create purchase order",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const uploadSignatures = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ 
        success: false, 
        message: "No files were uploaded" 
      });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    const response = {};
    
    for (const field of ["preparedBySignature", "verifiedBySignature", "authorizedSignature"]) {
      if (req.files[field]?.[0]) {
        if (!validTypes.includes(req.files[field][0].mimetype)) {
          throw new Error(`Invalid file type for ${field}. Only images are allowed`);
        }
        if (req.files[field][0].size > 2 * 1024 * 1024) {
          throw new Error(`File too large for ${field}. Max 2MB allowed`);
        }
        response[field] = `/signatures/${req.files[field][0].filename}`;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: "Signatures uploaded successfully", 
      files: response 
    });
  } catch (err) {
    console.error('Signature upload error:', err);
    res.status(400).json({ 
      success: false, 
      message: err.message || "Signature upload failed" 
    });
  }
};

const getAllPurchaseOrders = async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (fromDate) filters.fromDate = new Date(fromDate);
    if (toDate) filters.toDate = new Date(toDate);

    const purchaseOrders = await PurchaseOrder.getAll(filters);
    res.status(200).json({ success: true, data: purchaseOrders, filters });
  } catch (err) {
    handleControllerError(res, err, "getAllPurchaseOrders");
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      throw { code: 'INVALID_INPUT', message: 'Invalid purchase order ID' };
    }

    const purchaseOrder = await PurchaseOrder.getById(id);
    
    if (typeof purchaseOrder.items === 'string') {
      try {
        purchaseOrder.items = JSON.parse(purchaseOrder.items);
      } catch (e) {
        console.error('Error parsing items:', e);
        purchaseOrder.items = [];
      }
    }

    res.status(200).json({ success: true, data: purchaseOrder });
  } catch (err) {
    handleControllerError(res, err, "getPurchaseOrderById");
  }
};

// Modified updatePurchaseOrder controller
const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    const formData = prepareFormData(req.body, req.files, true);
    
    const { error } = updateInvoiceOrderSchema.validate(formData, {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/['"]+/g, '')
        }))
      });
    }

    const updatedPO = await PurchaseOrder.updateById(id, formData);
    
    // Send update notification email
    try {
      const recipients = process.env.EMAIL_RECIPIENTS?.split(',').map(email => email.trim()) || [];
      await sendPurchaseOrderEmail(updatedPO, recipients, true);
    } catch (emailError) {
      console.error('Email sending failed but order was updated:', emailError);
      // Continue even if email fails
    }
    
    res.status(200).json({
      success: true,
      message: "Purchase order updated successfully",
      data: updatedPO
    });

  } catch (err) {
    console.error('Update error:', {
      message: err.message,
      code: err.code,
      time: new Date().toISOString()
    });

    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && {
        error: err.details || err.message
      })
    });
  }
};

const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    await PurchaseOrder.deleteById(id);
    
    res.status(200).json({
      success: true,
      message: "Purchase order deleted successfully",
      deletedId: id
    });

  } catch (err) {
    console.error('Delete error:', {
      message: err.message,
      code: err.code,
      time: new Date().toISOString()
    });

    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && {
        error: err.details || err.message
      })
    });
  }
};

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  uploadSignatures,
};