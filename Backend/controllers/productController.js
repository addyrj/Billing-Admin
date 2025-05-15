const Product = require("../models/productModel");
const Joi = require("joi");

// Updated Joi schema (no gst)
const productSchema = Joi.object({
    name: Joi.string().required(),
    models: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required()
    })).min(1).required()
});

const createProduct = async (req, res) => {
    try {
        // Validate input
        const { error } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Create product
        const result = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: result
        });

    } catch (err) {
        console.error("Error creating product:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: process.env.NODE_ENV === 'development' ? err.message : null
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.getAll();
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: process.env.NODE_ENV === 'development' ? err.message : null
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.getById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
            error: process.env.NODE_ENV === 'development' ? err.message : null
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        // Validate input
        const { error } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const result = await Product.update(req.params.id, req.body);

        if (!result.updated) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully"
        });
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: process.env.NODE_ENV === 'development' ? err.message : null
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const result = await Product.delete(req.params.id);

        if (!result.deleted) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: process.env.NODE_ENV === 'development' ? err.message : null
        });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};