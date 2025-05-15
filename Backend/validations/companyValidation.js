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
    partnerId: Joi.number().optional(),
    partnerName: Joi.string().optional(),
    serialNumber: Joi.number().optional(),
    created_at: Joi.date().optional(),
    updated_at: Joi.date().optional()
});

const updateCompanySchema = Joi.object({
    companyName: Joi.string(),
    firmType: Joi.string(),
    registeredOfficeAddress: Joi.object({
        address: Joi.string(),
        State: Joi.string(),
        pinCode: Joi.string().length(6).pattern(/^[0-9]+$/)
    }),
    billingAddress: Joi.object({
        address: Joi.string(),
        State: Joi.string(),
        pinCode: Joi.string().length(6).pattern(/^[0-9]+$/)
    }),
    shippingAddress: Joi.object({
        address: Joi.string(),
        State: Joi.string(),
        pinCode: Joi.string().length(6).pattern(/^[0-9]+$/)
    }),
    sameAsBilling: Joi.boolean(),
    natureOfBusiness: Joi.string(),
    gstNo: Joi.string().length(15).pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/).allow(''),
    email: Joi.string().email().allow(''),
    ContactNumbers: Joi.array().items(Joi.string().length(10).pattern(/^[0-9]+$/)),
    products: Joi.array().items(
        Joi.object({
            name: Joi.string(),
            modelNumber: Joi.string(),
            quantity: Joi.number().min(1),
            price: Joi.number().min(0),
            gstIncluded: Joi.boolean(),
            totalPrice: Joi.number()
        })
    ),
    grandTotalPrice: Joi.number()
}).min(1); // At least one field must be provided

module.exports = { companySchema, updateCompanySchema };


