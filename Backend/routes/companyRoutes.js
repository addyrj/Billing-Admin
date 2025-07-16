const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const { authenticateToken, requireRole } = require("../middleware/authenticateToken");
const db = require('../config/db');
const validateCompanyData = require("../middleware/validateCompany"); 
const paymentUpload = require("../config/paymentUpload");

router.use(authenticateToken);

// Create company - accessible to salesuser and adminsales
router.post("/companies", 
  authenticateToken,
  requireRole(['salesuser', 'adminsales']),
  (req, res, next) => {
    // Only use multer for multipart requests
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      paymentUpload(req, res, next);
    } else {
      next();
    }
  },
  validateCompanyData,
  companyController.createCompany
);

// Admin Sales Dashboard (only their own data)
router.get("/dashboard/adminsales", 
  authenticateToken,
  requireRole(['adminsales']),
  companyController.getAdminSalesDashboard
);
router.get("/all-data", companyController.getAllCompaniesPublic);

// Get specific company
router.get("/companies/:id", 
  requireRole(['salesuser', 'adminsales']), 
  companyController.getCompanyByIdWithOwnership
);

// Dashboard
router.get("/partner/dashboard", 
  requireRole(['salesuser', 'adminsales']), 
  companyController.getPartnerDashboard
);

// Update company route with validation
router.put("/companies/:id", 
  requireRole(['salesuser', 'adminsales']),
  validateCompanyData, // This should use updateCompanySchema for PUT requests
  companyController.updateCompanyByIdWithOwnership
);
// Delete company - only adminsales
router.delete("/companies/:id", 
  requireRole('adminsales'), 
  companyController.deleteCompanyById
);

router.get("/companies/export/excel", companyController.exportCompaniesToExcel);

module.exports = router;