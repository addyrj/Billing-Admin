const db = require("../config/db");

const generateItemCode = (id) => {
    return `RM${String(id).padStart(4, '0')}`;
};

const PurchaseProduct = {
    create: async (data) => {
        const [result] = await db.execute(
            "INSERT INTO purchase_products (productname, description) VALUES (?, ?)",
            [data.productname, data.description]
        );
        
        // Generate and update the itemcode after insertion
        const itemcode = generateItemCode(result.insertId);
        await db.execute(
            "UPDATE purchase_products SET itemcode = ? WHERE id = ?",
            [itemcode, result.insertId]
        );
        
        return { id: result.insertId, itemcode, ...data };
    },

    getAll: async () => {
        const [products] = await db.query(
            "SELECT * FROM purchase_products ORDER BY created_at DESC"
        );
        return products;
    },

    getById: async (id) => {
        const [product] = await db.execute(
            "SELECT * FROM purchase_products WHERE id = ?",
            [id]
        );
        return product[0] || null;
    },

    update: async (id, data) => {
        const [result] = await db.execute(
            "UPDATE purchase_products SET productname = ?, description = ? WHERE id = ?",
            [data.productname, data.description, id]
        );
        return result.affectedRows > 0 ? { id, ...data } : null;
    },

    delete: async (id) => {
        const [result] = await db.execute(
            "DELETE FROM purchase_products WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    },

    isDescriptionExists: async (description, excludeId = null) => {
        let query = "SELECT id FROM purchase_products WHERE LOWER(TRIM(description)) = LOWER(TRIM(?))";
        const params = [description];
        
        if (excludeId) {
            query += " AND id != ?";
            params.push(excludeId);
        }
        
        const [products] = await db.execute(query, params);
        return products.length > 0;
    }
};

module.exports = PurchaseProduct;