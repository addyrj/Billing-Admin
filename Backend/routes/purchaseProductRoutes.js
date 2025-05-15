const express = require("express");
const router = express.Router();
const productController = require("../controllers/purchaseProductController");
const { authenticateToken, requireRole } = require("../middleware/authenticateToken");

// Route definitions
router.post("/purchase-products",
  authenticateToken,
  requireRole(['adminpurchase', 'purchaseuser']),
  productController.createProduct
);

router.get("/purchase-products",
  authenticateToken, // Uncomment if you want to protect this route
  productController.getAllProducts
);
router.get("/purchase-products/:id",  // NEW ROUTE
  authenticateToken,
  productController.getProductById // Call the controller method to fetch a product by ID
);

router.put("/purchase-products/:id",
  authenticateToken,
  requireRole(['adminpurchase', 'purchaseuser']),
  productController.updateProduct
);

router.delete("/purchase-products/:id",
  authenticateToken,
  requireRole(['adminpurchase', 'purchaseuser']),
  productController.deleteProduct
);

module.exports = router;