const express = require("express");
const router = express.Router();
const {
  registerSuperadmin,
  createAdmin,
  createUserByAdmin,
  login,
  getAllUsers,
  updateAdmin, 
  getAllAdmins,
  deactivateAdmin,
  getAllSalesUsers,
  getAllPurchaseUsers,
  getUserWithRoleCheck,
  updateUser,
  getAdminById,
  deactivateUser
} = require("../controllers/authController");
const { authenticateToken, requireRole } = require("../middleware/authenticateToken");

// Public routes
router.post("/register-superadmin", registerSuperadmin);
router.post("/login", login);

// Protected admin routes
router.post("/create-admin", authenticateToken, requireRole('superadmin'), createAdmin);
router.post("/create-userSales", authenticateToken, requireRole('adminsales'), createUserByAdmin);
router.post("/create-userPurchase", authenticateToken, requireRole('adminpurchase'), createUserByAdmin);

// User retrieval routes
router.get("/users", authenticateToken, requireRole('superadmin'), getAllUsers);
router.get("/admins", authenticateToken, requireRole('superadmin'), getAllAdmins);
router.get("/sales-users", authenticateToken, requireRole('adminsales'), getAllSalesUsers);
router.get("/purchase-users", authenticateToken, requireRole('adminpurchase'), getAllPurchaseUsers);

// Get user by ID routes
router.get("/users/:id", authenticateToken, getUserWithRoleCheck);
router.get("/admins/:id", authenticateToken, requireRole('superadmin'), getAdminById);
router.get("/sales-users/:id", authenticateToken, getUserWithRoleCheck);
router.get("/purchase-users/:id", authenticateToken, getUserWithRoleCheck);

// Change all to PATCH for partial updates
router.patch("/users/:id", authenticateToken, requireRole('superadmin'), updateUser);
router.patch("/admins/:id", authenticateToken, requireRole('superadmin'), updateAdmin);
router.patch("/sales-users/:id", authenticateToken, requireRole('adminsales'), updateUser);
router.patch("/purchase-users/:id", authenticateToken, requireRole('adminpurchase'), updateUser);

// Deactivate user routes (DELETE)
router.delete("/users/:id", authenticateToken, requireRole('superadmin'), deactivateUser);
router.delete("/admins/:id", authenticateToken, requireRole('superadmin'), deactivateAdmin);
router.delete("/sales-users/:id", authenticateToken, requireRole('adminsales'), deactivateUser);
router.delete("/purchase-users/:id", authenticateToken, requireRole('adminpurchase'), deactivateUser);

module.exports = router;