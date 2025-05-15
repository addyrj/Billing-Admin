const Joi = require("joi");
const { convertToWords } = require('../config/amountConverter');

const itemSchema = Joi.object({
  id: Joi.number().required()
    .messages({ 'any.required': 'Item ID is required' }),
  description: Joi.string().required().max(500)
    .messages({ 'string.empty': 'Description cannot be empty' }),
  productname: Joi.string().required().max(100)
    .messages({ 'string.empty': 'Product name is required' }),
  units: Joi.string().valid('kg', 'pcs', 'numbers').required()
    .messages({ 
      'any.only': 'Units must be kg, pcs, or numbers',
      'any.required': 'Units are required'
    }),
  rate: Joi.number().required().positive().precision(2)
    .messages({ 
      'number.base': 'Rate must be a number',
      'number.positive': 'Rate must be positive',
      'any.required': 'Rate is required'
    }),
  quantity: Joi.number().required().integer().min(1)
    .messages({ 
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required'
    }),
  cgst: Joi.number().min(0).max(100).precision(2),
  sgst: Joi.number().min(0).max(100).precision(2),
  igst: Joi.number().min(0).max(100).precision(2),
  total: Joi.number().required().precision(2)
    .custom((value, helpers) => {
      const item = helpers.state.ancestors[0];
      const calculatedTotal = (item.rate * item.quantity) * (1 + (item.cgst + item.sgst + item.igst)/100);
      return Math.abs(value - calculatedTotal) < 0.01 ? value : helpers.error('number.itemTotalMismatch');
    })
    .messages({
      'number.itemTotalMismatch': 'Item total does not match calculated value (rate × quantity + taxes)',
      'any.required': 'Item total is required'
    })
}).options({ abortEarly: false });



const invoiceOrderSchema = Joi.object({
  poNo: Joi.string()
    .pattern(/^PO-IOTTECH\/\d{2}-\d{2}\/\d+$/)
    .optional()
    .allow(null, '')
    .messages({
      'string.pattern.base': 'PO number must be in format PO-IOTTECH/YY-YY/ID'
    }),

    date: Joi.alternatives()
    .try(
      Joi.date().iso(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    )
    .required()
    // .max('now')
    .messages({
      'date.base': 'Invalid date format (use YYYY-MM-DD)',
      'date.max': 'Date cannot be in the future',
      'any.required': 'Date is required'
    }),
  refNo: Joi.string().required().max(100)
    .messages({
      'string.empty': 'Reference number is required',
      'any.required': 'Reference number is required'
    }),
  validity: Joi.string().required().max(100),
  supplierOfferNo: Joi.string().required().max(100),
  deliveryPeriod: Joi.string().required().max(100),
  transportation: Joi.string().valid('vehicle', 'courier').required(),
  panNo: Joi.string().required().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .messages({
      'string.pattern.base': 'Invalid PAN format'
    }),
  purchaseRequest: Joi.string().required().max(100),

  supplier: Joi.string().required().max(100)
    .messages({ 
      'string.empty': 'Supplier name is required',
      'any.required': 'Supplier name is required'
    }),
  supplierAddress: Joi.string().required().max(500)
    .messages({ 
      'string.empty': 'Supplier address is required',
      'any.required': 'Supplier address is required'
    }),
  contactPerson: Joi.string().required().max(100),
  contactNo: Joi.string().required().pattern(/^[0-9]{10,15}$/)
    .messages({
      'string.pattern.base': 'Invalid contact number format'
    }),
  email: Joi.string().required().email().max(100),
  prNo: Joi.string().required().max(50),
  supplierOfferDate: Joi.alternatives()
  .try(
    Joi.date().iso(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    Joi.allow(null)
  )
  .optional(),
  paymentTerms: Joi.string().valid('Fifteen Days', '30-days', '45-days').optional(),

  gstNo: Joi.string()
    .valid('07AAHCI3643R1ZZ')
    .required()
    .messages({
      'any.only': 'Company GST number must be 07AAHCI3643R1ZZ',
      'any.required': 'Company GST is required'
    }),
  supplierGST: Joi.string()
    .required()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[A-Z]{1}[0-9A-Z]{1}$/i)
    .messages({
      'string.pattern.base': 'Invalid GST format',
      'any.required': 'Supplier GST is required'
    }),

  invoiceAddress: Joi.string()
    .required()
    .valid('IOTtech Smart Products Pvt. Ltd, Plot No-13, 3rd Floor, Pocket-8, Sector -17, Dwarka, New Delhi-110075')
    .messages({
      'any.only': 'Invoice address must match company address',
      'any.required': 'Invoice address is required'
    }),
  deliveryAddress: Joi.string()
    .required()
    .valid('IOTtech Smart Products Pvt. Ltd, Plot No-13, 3rd Floor, Pocket-8, Sector -17, Dwarka, New Delhi-110075')
    .messages({
      'any.only': 'Delivery address must match company address',
      'any.required': 'Delivery address is required'
    }),

  items: Joi.array()
    .items(itemSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one item is required',
      'any.required': 'Items are required'
    }),

  totalAmount: Joi.number()
    .required()
    .precision(2)
    .custom((value, helpers) => {
      const items = helpers.state.ancestors[0].items;
      if (!items || !Array.isArray(items)) {
        return helpers.error('number.mismatch');
      }
      
      const calculatedTotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.total) || 0);
      }, 0);
      
      return Math.abs(value - calculatedTotal) < 0.01 ? value : helpers.error('number.mismatch');
    })
    .messages({
      'number.mismatch': 'Total amount does not match sum of item totals',
      'any.required': 'Total amount is required'
    }),
// Change the amountInWords validation to:
amountInWords: Joi.string()
  .required()
  .custom((value, helpers) => {
    try {
      const total = helpers.state.ancestors[0].totalAmount;
      if (!total) return value;
      
      const expected = convertToWords(total);
      if (value.toLowerCase().trim() !== expected.toLowerCase().trim()) {
        return helpers.error('string.amountMismatch', {
          expected: expected.toLowerCase().trim() + ' only'
        });
      }
      return value;
    } catch (err) {
      console.error('Validation error:', err);
      return helpers.error('string.amountMismatch', {
        expected: 'Error in validation'
      });
    }
  })
  .messages({
    'string.amountMismatch': 'Amount in words should be exactly: "{{#expected}}"',
    'any.required': 'Amount in words is required'
  }),
  preparedBySignature: Joi.string().required()
    .messages({
      'string.empty': 'Prepared by signature is required',
      'any.required': 'Prepared by signature is required'
    }),
  verifiedBySignature: Joi.string().required(),
  authorizedSignature: Joi.string().required()
}).options({ abortEarly: false });



// Add this to your invoiceValidation.js
const updateInvoiceOrderSchema = Joi.object({
  poNo: Joi.string().optional().strip(),
  id: Joi.number().optional().strip(),
  created_at: Joi.forbidden(),
  updated_at: Joi.forbidden(),

  date: Joi.alternatives()
    .try(
      Joi.date().iso(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
      Joi.allow(null)
    )
    .optional()
    .messages({
      'date.base': 'Invalid date format (use YYYY-MM-DD)',
    }),

  supplierOfferDate: Joi.alternatives()
    .try(
      Joi.date().iso(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
      Joi.allow(null)
    )
    .optional(),

  items: Joi.array()
    .items(itemSchema)
    .optional()
    .messages({
      'array.base': 'Items must be an array',
    }),

  totalAmount: Joi.number()
    .precision(2)
    .optional()
    .custom((value, helpers) => {
      const items = helpers.state.ancestors[0].items;
      if (!items || !Array.isArray(items)) return value;
      
      const calculatedTotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.total) || 0);
      }, 0);
      
      return Math.abs(value - calculatedTotal) < 0.01 ? value : helpers.error('number.mismatch');
    }),

  supplierOfferNo: Joi.string().max(100).optional(),
  refNo: Joi.string().max(100).optional(),
  validity: Joi.string().max(100).optional(),
  deliveryPeriod: Joi.string().max(100).optional(),
  transportation: Joi.string().valid('vehicle', 'courier').optional(),
  panNo: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  purchaseRequest: Joi.string().max(100).optional(),
  supplier: Joi.string().max(100).optional(),
  supplierAddress: Joi.string().max(500).optional(),
  contactPerson: Joi.string().max(100).optional(),
  contactNo: Joi.string().pattern(/^[0-9]{10,15}$/).allow('').optional(),
  email: Joi.string().email().max(100).optional(),
  prNo: Joi.string().max(50).optional(),
  supplierOfferDate: Joi.alternatives()
    .try(
      Joi.date().iso(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
      Joi.allow(null)
    )
    .optional(),
  paymentTerms: Joi.string().valid('Fifteen Days', '30-days', '45-days').optional(),
  gstNo: Joi.string().valid('07AAHCI3643R1ZZ').optional(),
  supplierGST: Joi.string().allow('').optional(),
 
  invoiceAddress: Joi.string()
    .valid('IOTtech Smart Products Pvt. Ltd, Plot No-13, 3rd Floor, Pocket-8, Sector -17, Dwarka, New Delhi-110075')
    .optional(),
  deliveryAddress: Joi.string()
    .valid('IOTtech Smart Products Pvt. Ltd, Plot No-13, 3rd Floor, Pocket-8, Sector -17, Dwarka, New Delhi-110075')
    .optional(),


  amountInWords: Joi.string().optional(),
  preparedBySignature: Joi.string().optional(),
  verifiedBySignature: Joi.string().optional(),
  authorizedSignature: Joi.string().optional()
}).options({ 
  abortEarly: false,
  stripUnknown: true,
  allowUnknown: true
});

module.exports = { invoiceOrderSchema, itemSchema,updateInvoiceOrderSchema };


