const Joi = require("joi");
const PurchaseProduct = require("../models/purchaseProductModel");

const productSchema = Joi.object({
    productname: Joi.string().min(3).required(),
    description: Joi.string().min(5).required()
});

exports.createProduct = async (req, res) => {
    try {
        // Validate input
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Check for duplicate description
        const descriptionExists = await PurchaseProduct.isDescriptionExists(value.description);
        if (descriptionExists) {
            return res.status(400).json({ error: "Product with this description already exists" });
        }

        // Create product
        const product = await PurchaseProduct.create(value);
        res.status(201).json(product);
    } catch (err) {
        console.error("Error creating product:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await PurchaseProduct.getAll();
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await PurchaseProduct.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(product);
    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        // Validate input
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Check if product exists
        const existingProduct = await PurchaseProduct.getById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check for duplicate description (excluding current product)
        const descriptionExists = await PurchaseProduct.isDescriptionExists(
            value.description, 
            req.params.id
        );
        if (descriptionExists) {
            return res.status(400).json({ error: "Another product with this description already exists" });
        }

        // Update product
        const updatedProduct = await PurchaseProduct.update(req.params.id, value);
        if (!updatedProduct) {
            return res.status(500).json({ error: "Failed to update product" });
        }
        res.json(updatedProduct);
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        // Check if product exists
        const product = await PurchaseProduct.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Delete product
        const deleted = await PurchaseProduct.delete(req.params.id);
        if (!deleted) {
            return res.status(500).json({ error: "Failed to delete product" });
        }
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};