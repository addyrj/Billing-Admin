//Invoice generater

const Joi = require("joi");

const purchaseOrderSchema = Joi.object({
    poNo: Joi.string().required(),
    date: Joi.date().required(),
    refNo: Joi.string().allow(""),
    validity: Joi.string().allow(""),
    supplierOfferNo: Joi.string().allow(""),
    deliveryPeriod: Joi.string().allow(""),
    transportation: Joi.string().allow(""),
    panNo: Joi.string().allow(""),
    purchaseRequest: Joi.string().allow(""),
    supplier: Joi.string().required(),
    contactPerson: Joi.string().allow(""),
    contactNo: Joi.string().allow(""),
    email: Joi.string().email().allow(""),
    prNo: Joi.string().allow(""),
    supplierOfferDate: Joi.date().allow(""),
    paymentTerms: Joi.string().allow(""),
    gstNo: Joi.string().required(), // Fixed GST No
    supplierGST: Joi.string().allow(""),
    invoiceAddress: Joi.string().required(), // Fixed invoice address
    deliveryAddress: Joi.string().required(), // Fixed delivery address
    items: Joi.array()
        .items(
            Joi.object({
                description: Joi.string().required(),
                units: Joi.string().allow(""),
                rate: Joi.number().required(),
                quantity: Joi.number().required(),
                cgst: Joi.number().allow(""),
                sgst: Joi.number().allow(""),
                total: Joi.number().required(),
            })
        )
        .min(1)
        .required(),
    totalAmount: Joi.number().required(),
    amountInWords: Joi.string().required(),
    preparedBySignature: Joi.string().allow(""),
    verifiedBySignature: Joi.string().allow(""),
    authorizedBySignature: Joi.string().allow(""),
  });
  
module.exports = { purchaseOrderSchema };