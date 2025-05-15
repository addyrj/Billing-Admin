
const db = require("../config/db"); // This should be your promise-based MySQL pool

const PurchaseOrder = {
  // Create a new Purchase Order
  create : async (data) => {
    try {
      // First insert without poNo
      const { poNo, ...insertData } = data;
      
      // Ensure items are properly stringified
      if (insertData.items && typeof insertData.items !== 'string') {
        insertData.items = JSON.stringify(insertData.items);
      }
  
      const [result] = await db.query('INSERT INTO purchase_orders SET ?', [insertData]);
      return result;
    } catch (err) {
      console.error('Database error in create:', err);
      
      let errorMessage = 'Database error occurred';
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.sqlMessage.includes('poNo')) errorMessage = 'PO number already exists';
        else if (err.sqlMessage.includes('email')) errorMessage = 'Email already exists';
      }
      
      const error = new Error(errorMessage);
      error.details = {
        code: err.code,
        sqlMessage: err.sqlMessage,
        field: err.sqlMessage.match(/for key '(.+?)'/)?.[1] || 'unknown'
      };
      throw error;
    }
  },


  // Get all Purchase Orders with optional filtering
  getAll: async (filters = {}) => {
    try {
      let query = 'SELECT * FROM purchase_orders';
      const params = [];
      const whereClauses = [];

      if (filters.status) {
        whereClauses.push('status = ?');
        params.push(filters.status);
      }
      if (filters.fromDate) {
        whereClauses.push('date >= ?');
        params.push(filters.fromDate);
      }
      if (filters.toDate) {
        whereClauses.push('date <= ?');
        params.push(filters.toDate);
      }

      if (whereClauses.length) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      const [results] = await db.query(query, params);

      return results.map(order => ({
        ...order,
        items: order.items ? JSON.parse(order.items) : []
      }));
    } catch (err) {
      const error = new Error('Failed to fetch purchase orders');
      error.details = { code: err.code, sqlMessage: err.sqlMessage };
      throw error;
    }
  },

  // Get single Purchase Order by ID
  getById: async function(id) {
    try {
      const [results] = await db.query('SELECT * FROM purchase_orders WHERE id = ?', [id]);

      if (!results.length) {
        const error = new Error('Purchase order not found');
        error.code = 'NOT_FOUND';
        error.status = 404;
        throw error;
      }

      const order = results[0];
      try {
        return {
          ...order,
          items: order.items ? JSON.parse(order.items) : []
        };
      } catch (parseError) {
        console.error('Error parsing items:', parseError);
        return {
          ...order,
          items: []
        };
      }
    } catch (err) {
      console.error(`Error fetching PO ${id}:`, err);
      throw err;
    }
  },

  // Update PO number
  updatePoNumber : async (id, poNo) => {
    try {
      const [result] = await db.query(
        'UPDATE purchase_orders SET poNo = ? WHERE id = ? AND poNo IS NULL',
        [poNo, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('PO number already set or record not found');
      }
      
      return result;
    } catch (err) {
      console.error('Error updating PO number:', err);
      throw err;
    }
  },
  updateById: async function(id, data) {
    try {
      // Remove forbidden fields
      const { poNo, id: _, created_at, ...updateData } = data;

      // Prepare items if they exist
      if (updateData.items && typeof updateData.items !== 'string') {
        updateData.items = JSON.stringify(updateData.items);
      }

      // Build dynamic update query
      const setClause = Object.keys(updateData)
        .filter(key => updateData[key] !== undefined)
        .map(key => `${key} = ?`)
        .join(', ');

      const values = Object.keys(updateData)
        .filter(key => updateData[key] !== undefined)
        .map(key => updateData[key]);

      if (values.length === 0) {
        const error = new Error('No valid fields to update');
        error.code = 'NO_VALID_FIELDS';
        error.status = 400;
        throw error;
      }

      const query = `UPDATE purchase_orders SET ${setClause} WHERE id = ?`;
      const [result] = await db.query(query, [...values, id]);

      if (result.affectedRows === 0) {
        const error = new Error('Purchase order not found');
        error.code = 'NOT_FOUND';
        error.status = 404;
        throw error;
      }

      // Use 'this' to reference other methods in the same module
      return await this.getById(id);
    } catch (err) {
      console.error(`Error updating PO ${id}:`, err);
      throw err;
    }
  },

  // Update Purchase Order
   update : async (id, data) => {
    try {
      // Remove forbidden fields
      const { poNo, id: _, created_at, updated_at, ...updateData } = data;
  
      // Prepare items for database
      if (updateData.items && typeof updateData.items !== 'string') {
        updateData.items = JSON.stringify(updateData.items);
      }
  
      // Build dynamic SET clause
      const setClause = Object.keys(updateData)
        .filter(key => updateData[key] !== undefined)
        .map(key => `${key} = ?`)
        .join(', ');
  
      const values = Object.keys(updateData)
        .filter(key => updateData[key] !== undefined)
        .map(key => updateData[key]);
  
      if (values.length === 0) {
        throw new Error('No valid fields to update');
      }
  
      const query = `UPDATE purchase_orders SET ${setClause} WHERE id = ?`;
      const [result] = await db.query(query, [...values, id]);
  
      if (result.affectedRows === 0) {
        throw new Error('Purchase order not found or no changes made');
      }
  
      return result;
    } catch (err) {
      console.error('Error in update:', {
        id,
        error: err.message,
        stack: err.stack
      });
      
      const error = new Error('Failed to update purchase order');
      error.details = {
        code: err.code,
        sqlMessage: err.sqlMessage,
        id
      };
      throw error;
    }

  },

  // Delete Purchase Order
  delete: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM purchase_orders WHERE id = ?', [id]);
      
      if (!result.affectedRows) {
        const error = new Error('Purchase order not found');
        error.code = 'NOT_FOUND';
        throw error;
      }
      
      return result;
    } catch (err) {
      const error = new Error('Failed to delete purchase order');
      error.details = { code: err.code, sqlMessage: err.sqlMessage, id };
      throw error;
    }
  },
  deleteById: async function(id) {
    try {
      const [result] = await db.query('DELETE FROM purchase_orders WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        const error = new Error('Purchase order not found');
        error.code = 'NOT_FOUND';
        error.status = 404;
        throw error;
      }

      return { success: true, deletedId: id };
    } catch (err) {
      console.error(`Error deleting PO ${id}:`, err);
      throw err;
    }
  },

  // Check if PO number exists
  getByPoNo: async (poNo) => {
    try {
      const [results] = await db.query(
        'SELECT * FROM purchase_orders WHERE UPPER(poNo) = UPPER(?)', 
        [poNo]
      );
      return results[0] || null;
    } catch (err) {
      const error = new Error('Failed to check PO number');
      error.details = { code: err.code, sqlMessage: err.sqlMessage, poNo };
      throw error;
    }
  }
};

module.exports = PurchaseOrder;