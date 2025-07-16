const Joi = require('joi');

const itemSchema = Joi.object({
    s_no: Joi.number().integer().min(1).required(),
    sku: Joi.string().required().max(50),
    goods_description: Joi.string().required().max(255),
    uom: Joi.string().valid('PCS', 'KG', 'LTR', 'Number').required(),
    received_quantity: Joi.number().positive().required(),
    good_quantity: Joi.number().min(0).default(0),
    damage_quantity: Joi.number().min(0).default(0),
    per_unit_cost: Joi.number().positive().required(),
    amount: Joi.number().positive().optional(),
    damage_status: Joi.string().valid('No Damage', 'Damage').default('No Damage'),
    damage_amount: Joi.number().min(0).default(0)
}).custom((value, helpers) => {
    // Convert all quantities to numbers
    const received = Number(value.received_quantity);
    const good = Number(value.good_quantity);
    const damage = Number(value.damage_quantity);
    
    if (value.damage_status === 'Damage') {
        // Auto-calculate good_quantity if not properly provided
        if (isNaN(good) || good < 0) {
            value.good_quantity = received - damage;
        }
        
        // Validate damage quantity is positive
        if (damage <= 0) {
            return helpers.error('any.invalid', {
                message: 'Damage quantity must be positive when damage status is "Damage"'
            });
        }
        
        // Validate the sum matches
        if ((value.good_quantity + damage) !== received) {
            return helpers.error('any.invalid', {
                message: `Quantities must balance (${value.good_quantity} good + ${damage} damage ≠ ${received} received)`
            });
        }
    } else {
      
        value.good_quantity = received;
        value.damage_quantity = 0;
        value.damage_amount = 0;
    }
    
    return value;
}).messages({
    'any.invalid': '{{#message}}'
});

// Define the base GRN schema
const baseGRNSchema = {
    grn_date: Joi.date().iso().required(),
    prepared_by: Joi.string().required().max(100),
    vendor_name: Joi.string().required().max(100),
    address: Joi.string().required().max(500),
    invoice_no: Joi.string().required().max(50),
    invoice_date: Joi.date().iso().required(),
    po_no: Joi.string().required().max(50),
    freight: Joi.number().min(0).default(0),
    gst_percentage: Joi.number().min(0).max(30).default(0), 
    // gst_amount: Joi.number().min(0).optional(),
    items: Joi.array().items(itemSchema).min(1).required(),
    
    // These will be calculated fields
    total_amount: Joi.number().positive().optional(),
    damage_amount: Joi.number().min(0).optional(),
    grand_total: Joi.number().positive().optional(),
    payable_amount: Joi.number().positive().optional(),
    payable_in_words: Joi.string().optional(),
    status: Joi.string().valid('Draft', 'Submitted', 'Approved', 'Rejected').default('Draft'),
    grn_no: Joi.string().pattern(/^GRN-IOTTECH\/\d{2}-\d{2}\/\d{3}$/).optional()
};

// Create schemas
const createGRNSchema = Joi.object(baseGRNSchema);
const updateGRNSchema = Joi.object({
    grn_date: Joi.date().iso().optional(),
    prepared_by: Joi.string().max(100).optional(),
    vendor_name: Joi.string().max(100).optional(),
    address: Joi.string().max(500).optional(),
    invoice_no: Joi.string().max(50).optional(),
    invoice_date: Joi.date().iso().optional(),
    po_no: Joi.string().max(50).optional(),
    freight: Joi.number().min(0).optional(),
    gst_percentage: Joi.number().min(0).max(30).optional(),
    gst_amount: Joi.number().min(0).optional(),
    items: Joi.array().items(itemSchema).optional(),
    total_amount: Joi.number().positive().optional(),
    damage_amount: Joi.number().min(0).optional(),
    grand_total: Joi.number().positive().optional(),
    payable_amount: Joi.number().positive().optional(),
    payable_in_words: Joi.string().optional(),
    status: Joi.string().valid('Draft', 'Submitted', 'Approved', 'Rejected').optional(),
    grn_no: Joi.string().pattern(/^GRN-IOTTECH\/\d{2}-\d{2}\/\d{3}$/).optional()
}).min(1); // At least one field must be provided

module.exports = {
    createGRNSchema,
    updateGRNSchema,
    itemSchema
};