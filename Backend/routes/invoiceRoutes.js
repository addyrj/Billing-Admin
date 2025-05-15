const express = require("express");
const router = express.Router();
const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  uploadSignatures
} = require("../controllers/invoiceController");
const { authenticateToken, requireRole } = require("../middleware/authenticateToken");
const upload = require("../config/multerConfig");

// Apply authentication to all routes
router.use(authenticateToken);

// Create PO - Only adminpurchase
router.post(
  "/create-invoice",
  requireRole(['adminpurchase', 'purchaseuser']),
  upload.fields([
    { name: 'preparedBySignature', maxCount: 1 },
    { name: 'verifiedBySignature', maxCount: 1 },
    { name: 'authorizedSignature', maxCount: 1 }
  ]),
  createPurchaseOrder
);

// Get all POs - Both roles
router.get(
  "/get-po",
  // requireRole(['adminpurchase', 'purchaseuser']),
  getAllPurchaseOrders
);

// Get single PO - Both roles
router.get(
  "/get-pobyid/:id",
  requireRole(['adminpurchase', 'purchaseuser','superadmin']),
  getPurchaseOrderById
);

// Update PO - Only adminpurchase
router.put(
  "/update-po/:id",
  requireRole(['adminpurchase', 'purchaseuser']),
  updatePurchaseOrder
);

// Delete PO - Only adminpurchase
router.delete(
  "/delete-po/:id",
  requireRole('adminpurchase'),
  deletePurchaseOrder
);

// Upload signatures - Both roles
router.post(
  "/upload-signatures",
  requireRole(['adminpurchase', 'purchaseuser']),
  upload.fields([
    { name: 'preparedBySignature', maxCount: 1 },
    { name: 'verifiedBySignature', maxCount: 1 },
    { name: 'authorizedSignature', maxCount: 1 }
  ]),
  uploadSignatures
);

module.exports = router;