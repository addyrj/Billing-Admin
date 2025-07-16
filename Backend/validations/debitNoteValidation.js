const Joi = require('joi');

const itemSchema = Joi.object({
  s_no: Joi.number().integer().min(1).required().messages({
    'number.base': 'Serial number must be a number',
    'number.integer': 'Serial number must be an integer',
    'number.min': 'Serial number must be at least 1',
    'any.required': 'Serial number is required'
  }),
  sku: Joi.string().required().messages({
    'string.base': 'SKU must be a string',
    'any.required': 'SKU is required'
  }),
  description: Joi.string().required().messages({
    'string.base': 'Description must be a string',
    'any.required': 'Description is required'
  }),
  units: Joi.string().required().messages({
    'string.base': 'Units must be a string',
    'any.required': 'Units is required'
  }),
  quantity: Joi.number().min(0).required().messages({
    'number.base': 'Quantity must be a number',
    'number.min': 'Quantity cannot be negative',
    'any.required': 'Quantity is required'
  }),
  gst_rate: Joi.number().min(0).max(100).required().messages({
    'number.base': 'GST rate must be a number',
    'number.min': 'GST rate cannot be negative',
    'number.max': 'GST rate cannot exceed 100',
    'any.required': 'GST rate is required'
  }),
  unit_cost: Joi.number().min(0).required().messages({
    'number.base': 'Unit cost must be a number',
    'number.min': 'Unit cost cannot be negative',
    'any.required': 'Unit cost is required'
  }),
  amount: Joi.number().min(0).required().messages({
    'number.base': 'Amount must be a number',
    'number.min': 'Amount cannot be negative',
    'any.required': 'Amount is required'
  })
});

const debitNoteSchema = Joi.object({
  debit_note_date: Joi.date().required().messages({
    'date.base': 'Debit note date must be a valid date',
    'any.required': 'Debit note date is required'
  }),
  payment_mode: Joi.string().required().messages({
    'string.base': 'Payment mode must be a string',
    'any.required': 'Payment mode is required'
  }),
  buyer_po_no: Joi.string().required().messages({
    'string.base': 'Buyer PO number must be a string',
    'any.required': 'Buyer PO number is required'
  }),
  grn_no: Joi.string().required().messages({
    'string.base': 'GRN number must be a string',
    'any.required': 'GRN number is required'
  }),
  dispatch_through: Joi.string().required().messages({
    'string.base': 'Dispatch through must be a string',
    'any.required': 'Dispatch through is required'
  }),
  original_invoice_no: Joi.string().required().messages({
    'string.base': 'Original invoice number must be a string',
    'any.required': 'Original invoice number is required'
  }),
  original_invoice_date: Joi.date().required().messages({
    'date.base': 'Original invoice date must be a valid date',
    'any.required': 'Original invoice date is required'
  }),
  freight: Joi.number().min(0).required().messages({
    'number.base': 'Freight must be a number',
    'number.min': 'Freight cannot be negative',
    'any.required': 'Freight is required'
  }),
  consignee: Joi.object({
    name: Joi.string().required().messages({
      'string.base': 'Consignee name must be a string',
      'any.required': 'Consignee name is required'
    }),
    address: Joi.string().required().messages({
      'string.base': 'Consignee address must be a string',
      'any.required': 'Consignee address is required'
    }),
    gstin: Joi.string().required().messages({
      'string.base': 'Consignee GSTIN must be a string',
      'any.required': 'Consignee GSTIN is required'
    }),
    state: Joi.string().required().messages({
      'string.base': 'Consignee state must be a string',
      'any.required': 'Consignee state is required'
    }),
    code: Joi.string().required().messages({
      'string.base': 'Consignee code must be a string',
      'any.required': 'Consignee code is required'
    })
  }).required(),
  buyer: Joi.object({
    address: Joi.string().required().messages({
      'string.base': 'Buyer address must be a string',
      'any.required': 'Buyer address is required'
    })
  }).required(),
  items: Joi.array()
    .items(itemSchema)
    .min(1)
    .required()
    .messages({
      'array.base': 'Items must be an array',
      'array.min': 'At least one item is required',
      'any.required': 'Items are required'
    })
});

const updateDebitNoteSchema = Joi.object({
  debit_note_date: Joi.date().optional(),
  payment_mode: Joi.string().optional(),
  dispatch_through: Joi.string().optional(),
  freight: Joi.number().min(0).optional(),
  consignee: Joi.object({
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    gstin: Joi.string().optional(),
    state: Joi.string().optional(),
    code: Joi.string().optional()
  }).optional(),
  // Add these to allow the fields but not require them
  buyer_po_no: Joi.string().optional(),
  grn_no: Joi.string().optional(),
  original_invoice_no: Joi.string().optional(),
  original_invoice_date: Joi.date().optional(),
  buyer: Joi.object({
    address: Joi.string().optional()
  }).optional(),
  items: Joi.array().items(itemSchema).optional()
}).min(1);

const validateDebitNoteUpdate = (data) => {
  return updateDebitNoteSchema.validate(data, { abortEarly: false });
};
const validateDebitNote = (data) => {
  return debitNoteSchema.validate(data, { abortEarly: false });
};

module.exports = {
 validateDebitNote,
  validateDebitNoteUpdate
};
