const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/authenticateToken");
const productController = require("../controllers/productController");

const router = express.Router();

// Public read endpoints
router.get("/products", productController.getAllProducts);
router.get("/products/:id", productController.getProductById);

// Admin-only write endpoints
router.post("/products", 
//   authenticateToken,
//   requireRole('adminsales'),
  productController.createProduct
);

router.put("/products/:id", 
//   authenticateToken,
//   requireRole('adminsales'),
  productController.updateProduct
);

router.delete("/products/:id", 
  // authenticateToken,
  // requireRole('adminsales'),
  productController.deleteProduct
);

module.exports = router;