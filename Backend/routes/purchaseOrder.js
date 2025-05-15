const express = require("express");
const { 

  createPurchaseOrder
} = require("../controllers/purchaseOrder");

const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();
router.post("/purchase-orders", authenticateToken, createPurchaseOrder);

module.exports = router;