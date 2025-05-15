const db = require("../config/db");

const Product = {
    create: async (productData) => {
        try {
            const [productResult] = await db.query(
                "INSERT INTO products (name) VALUES (?)",
                [productData.name]
            );
            const productId = productResult.insertId;

            if (productData.models && productData.models.length > 0) {
                const subProductValues = productData.models.map(model => [
                    productId,
                    model.name,
                    model.price
                ]);

                await db.query(
                    "INSERT INTO sub_products (product_id, model, price) VALUES ?",
                    [subProductValues]
                );
            }

            return {
                productId,
                message: "Product created successfully"
            };
        } catch (err) {
            console.error("Product creation error:", err);
            throw err;
        }
    },

    getAll: async () => {
        try {
            const [results] = await db.query(`
                SELECT 
                    p.id, 
                    p.name, 
                    p.created_at,
                    GROUP_CONCAT(
                        CONCAT(s.model, ' - ₹', s.price)
                        ORDER BY s.model ASC
                        SEPARATOR ', '
                    ) AS models
                FROM products p
                LEFT JOIN sub_products s ON p.id = s.product_id
                GROUP BY p.id, p.created_at
                ORDER BY p.created_at DESC
            `);
            return results;
        } catch (err) {
            console.error("Error fetching products:", err);
            throw err;
        }
    },

    getById: async (productId) => {
        try {
            const [results] = await db.query(`
                SELECT 
                    p.id, 
                    p.name, 
                    p.created_at,
                    GROUP_CONCAT(
                        CONCAT(s.model, ' - ₹', s.price)
                        ORDER BY s.model ASC
                        SEPARATOR ', '
                    ) AS models
                FROM products p
                LEFT JOIN sub_products s ON p.id = s.product_id
                WHERE p.id = ?
                GROUP BY p.id, p.created_at
            `, [productId]);
            return results[0] || null;
        } catch (err) {
            console.error("Error fetching product:", err);
            throw err;
        }
    },

    update: async (productId, productData) => {
        try {
            await db.query("START TRANSACTION");

            const [updateResult] = await db.query(
                "UPDATE products SET name = ? WHERE id = ?",
                [productData.name, productId]
            );

            if (updateResult.affectedRows === 0) {
                await db.query("ROLLBACK");
                return { updated: false };
            }

            await db.query(
                "DELETE FROM sub_products WHERE product_id = ?",
                [productId]
            );

            if (productData.models && productData.models.length > 0) {
                const subProductValues = productData.models.map(model => [
                    productId,
                    model.name,
                    model.price
                ]);

                await db.query(
                    "INSERT INTO sub_products (product_id, model, price) VALUES ?",
                    [subProductValues]
                );
            }

            await db.query("COMMIT");
            return { updated: true };
        } catch (err) {
            await db.query("ROLLBACK");
            console.error("Product update error:", err);
            throw err;
        }
    },

    delete: async (productId) => {
        try {
            const [result] = await db.query(
                "DELETE FROM products WHERE id = ?",
                [productId]
            );
            return { deleted: result.affectedRows > 0 };
        } catch (err) {
            console.error("Product deletion error:", err);
            throw err;
        }
    }
};

module.exports = Product;
