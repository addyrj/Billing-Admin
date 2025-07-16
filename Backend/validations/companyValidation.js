const Joi = require('joi');


const companySchema = Joi.object({
    companyName: Joi.string().required(),
    firmType: Joi.string().required(),
    registeredOfficeAddress: Joi.object({
        address: Joi.string().required(),
        State: Joi.string().required(),
        pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).required()
    }).required(),
    billingAddress: Joi.object({
        address: Joi.string().required(),
        State: Joi.string().required(),
        pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).required()
    }).required(),
    shippingAddress: Joi.object({
        address: Joi.string().required(),
        State: Joi.string().required(),
        pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).required()
    }).required(),
    sameAsBilling: Joi.boolean().required(),
    natureOfBusiness: Joi.string().required(),
    gstNo: Joi.string().length(15).pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/).allow(''),
    email: Joi.string().email().allow('').optional(), 

    ContactNumbers: Joi.array().items(Joi.string().length(10).pattern(/^[0-9]+$/)).min(1).required(),  // ✅ At least one number required
    products: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            modelNumber: Joi.string().required(),
            quantity: Joi.number().min(1).required(),
            price: Joi.number().min(0).required(),
            gstIncluded: Joi.boolean().required(),
            totalPrice: Joi.number().optional()
        })
    ).min(1).required(),
    grandTotalPrice: Joi.number().optional(),  // ✅ Added grand total
      paymentMethod: Joi.string().valid('cod', 'cheque', 'online').default('cod'),
    paymentReference: Joi.when('paymentMethod', {
        is: Joi.not('cod'),
        then: Joi.string().required(),
        otherwise: Joi.string().allow('').optional()
    }),
    partnerId: Joi.number().optional(),
    partnerName: Joi.string().optional(),
    serialNumber: Joi.number().optional(),
    created_at: Joi.date().optional(),
    updated_at: Joi.date().optional()
});

const updateCompanySchema = Joi.object({
    companyName: Joi.string().optional(),
    firmType: Joi.string().optional(),
    registeredOfficeAddress: Joi.object({
        address: Joi.string().optional(),
        State: Joi.string().optional(),
        pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).optional()
    }).optional(),
    billingAddress: Joi.object({
        address: Joi.string().optional(),
        State: Joi.string().optional(),
        pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).optional()
    }).optional(),
    shippingAddress: Joi.object({
        address: Joi.string().optional(),
        State: Joi.string().optional(),
        pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).optional()
    }).optional(),
    sameAsBilling: Joi.boolean().optional(),
    natureOfBusiness: Joi.string().optional(),
    gstNo: Joi.string().length(15).pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/).allow('').optional(),
    email: Joi.string().email().allow('').optional(),
    ContactNumbers: Joi.array().items(Joi.string().length(10).pattern(/^[0-9]+$/)).optional(),
    products: Joi.array().items(
        Joi.object({
            name: Joi.string().optional(),
            modelNumber: Joi.string().optional(),
            quantity: Joi.number().min(1).optional(),
            price: Joi.number().min(0).optional(),
            gstIncluded: Joi.boolean().optional(),
            totalPrice: Joi.number().optional()
        })
    ).optional(),
    grandTotalPrice: Joi.number().optional(),
    paymentMethod: Joi.string().valid('cod', 'cheque', 'online').default('cod').optional(),
    paymentReference: Joi.when('paymentMethod', {
        is: Joi.not('cod'),
        then: Joi.string().required(),
        otherwise: Joi.string().allow('').optional()
    }).optional()
}).options({ allowUnknown: false });

module.exports = { companySchema, updateCompanySchema };


