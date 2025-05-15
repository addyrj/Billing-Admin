const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const { authenticateToken, requireRole } = require("../middleware/authenticateToken");
const db = require('../config/db');
const validateCompanyData = require("../middleware/validateCompany"); 

// Apply authentication to all company routes
router.use(authenticateToken);


// Create company - accessible to salesuser and adminsales
router.post("/companies", 
  requireRole(['salesuser', 'adminsales']), 
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
  validateCompanyData, // Now properly imported
  companyController.updateCompanyByIdWithOwnership
);
// Delete company - only adminsales
router.delete("/companies/:id", 
  requireRole('adminsales'), 
  companyController.deleteCompanyById
);

router.get("/companies/export/excel", companyController.exportCompaniesToExcel);

module.exports = router;