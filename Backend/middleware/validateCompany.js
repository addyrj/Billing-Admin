const { companySchema, updateCompanySchema } = require('../validations/companyValidation');

const validateCompanyData = (req, res, next) => {
    const schema = req.method === 'POST' ? companySchema : updateCompanySchema;
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
        const errors = error.details.map(err => ({
            field: err.path.join('.'),
            message: err.message.replace(/"/g, '')
        }));
        return res.status(400).json({ 
            success: false,
            message: "Validation failed",
            errors 
        });
    }
    next();
};

module.exports = validateCompanyData;