// middleware/validateCompany.js
const { companySchema, updateCompanySchema } = require("../validations/companyValidation");

const validateCompanyData = (req, res, next) => {
  const schema = req.method === 'POST' ? companySchema : updateCompanySchema;
  
  const { error } = schema.validate(req.body, { 
    abortEarly: false,
    allowUnknown: false
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.context.label,
      message: detail.message
    }));
    
    const uploadedFiles = req.files?.map(file => ({
      filename: file.filename,
      path: `/payment-images/${file.filename}`
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      uploadedFiles
    });
  }

  next();
};

module.exports = validateCompanyData; 