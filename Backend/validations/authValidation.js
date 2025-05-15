const Joi = require("joi");

// Registration Validation
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    mobile: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('superadmin', 'adminsales', 'adminpurchase', 'salesuser', 'purchaseuser').required(),
  });

  return schema.validate(data);
};

// Login Validation
const loginValidation = (data) => {
  const schema = Joi.object({
    user_id: Joi.alternatives()
      .try(
        Joi.string().email(),
        Joi.string().pattern(/^[0-9]{10,15}$/),
        Joi.number().integer().positive()
      )
      .required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

// Update Validation (Fixed syntax)
const updateValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().optional(),
    mobile: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    password: Joi.string().min(6).optional()
  }).min(1); // Require at least one field
  
  return schema.validate(data);
};

module.exports = { 
  registerValidation, 
  loginValidation, 
  updateValidation
};