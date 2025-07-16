const express = require("express");
const router = express.Router();
const GRNController = require("../controllers/grnController");
const { createGRNSchema, updateGRNSchema } = require("../validations/grnValidation");
const { authenticateToken, requireRole } = require("../middleware/authenticateToken");

// Middleware to validate using Joi
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    next();
};

// Apply authentication to all routes
router.use(authenticateToken);

// Generate GRN number
router.get(
    "/generate-grn-no",
    requireRole(["adminpurchase", "purchaseuser"]),
    GRNController.generateGRNNumber
);

// Create GRN
router.post(
    "/grn",
    requireRole(["adminpurchase", "purchaseuser"]),
    validate(createGRNSchema),
    GRNController.create
);

// Get all GRNs
router.get(
    "/grn",
    GRNController.getAll
);

// Get GRN by ID
router.get(
    "/grn/:id",
    // requireRole(["adminpurchase", "purchaseuser", "superadmin"]),
    GRNController.getById
);

// Update GRN
router.put(
    "/grn/:id",
    requireRole(["adminpurchase", "purchaseuser"]),
    validate(updateGRNSchema),
    GRNController.update
);

// Delete GRN
router.delete(
    "/grn/:id",
    requireRole(["adminpurchase"]),
    GRNController.delete
);



module.exports = router;