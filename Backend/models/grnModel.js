const db = require("../config/db");
const { convertToWords } = require("../config/amountConverter");

class GRNModel {
  // Generate next GRN number (unchanged)
  static async generateGRNNumber() {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const financialYear = `${currentYear.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;

    const [rows] = await db.query(
      `SELECT AUTO_INCREMENT 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'grns'`
    );

    let sequence = rows[0].AUTO_INCREMENT;
    
    return `GRN-IOTTECH/${financialYear}/${sequence.toString().padStart(3, '0')}`;
  }

  // Create GRN - Updated with proper GST handling
static async create(grnData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Calculate good_quantity if not provided
      const items = grnData.items.map(item => ({
        ...item,
        good_quantity: item.good_quantity ?? (item.received_quantity - (item.damage_quantity || 0)),
        damage_amount: item.damage_amount ?? (item.damage_quantity * item.per_unit_cost || 0)
      }));

      // Calculate totals
      const totalAmount = items.reduce((sum, item) => sum + (item.received_quantity * item.per_unit_cost), 0);
      const totalDamageAmount = items.reduce((sum, item) => sum + (item.damage_quantity * item.per_unit_cost), 0);
      const subtotal = totalAmount - totalDamageAmount;
      const freight = Number(grnData.freight) || 0;
      const gstPercentage = Number(grnData.gst_percentage) || 0;
      const gstAmount = (subtotal + freight) * (gstPercentage / 100);
      const payableAmount = subtotal + freight + gstAmount;

      // Prepare header data - remove any reference to 'gst' column
      const { items: _, ...headerData } = grnData;
      const dbData = {
        ...headerData,
        total_amount: totalAmount,
        damage_amount: totalDamageAmount,
        freight: freight,
        gst_percentage: gstPercentage,
        gst_amount: gstAmount, // Only use gst_amount, not gst
        grand_total: subtotal,
        payable_amount: payableAmount,
        payable_in_words: convertToWords(payableAmount),
        created_by: grnData.created_by,
        status: grnData.status || "Draft"
      };

      // Remove any accidental gst field if it exists
      delete dbData.gst;

      // Insert GRN header
      const [grnResult] = await connection.query(
        `INSERT INTO grns SET ?`, 
        [dbData]
      );

      const grnId = grnResult.insertId;

      // Insert items
      for (const item of items) {
        await connection.query(
          `INSERT INTO grn_items SET ?`,
          {
            grn_id: grnId,
            s_no: item.s_no,
            sku: item.sku,
            goods_description: item.goods_description,
            uom: item.uom,
            received_quantity: item.received_quantity,
            good_quantity: item.good_quantity,
            damage_quantity: item.damage_quantity || 0,
            per_unit_cost: item.per_unit_cost,
            amount: item.received_quantity * item.per_unit_cost,
            damage_status: item.damage_status,
            damage_amount: item.damage_quantity * item.per_unit_cost || 0
          }
        );
      }

      await connection.commit();
      return grnId;
    } catch (error) {
      await connection.rollback();
      console.error('GRN creation failed:', error);
      throw error;
    } finally {
      connection.release();
    }
}

  // Get all GRNs
  static async getAll() {
    // First get all GRNs
    const [grnRows] = await db.query(
      `SELECT g.*, u.username as created_by_name 
       FROM grns g 
       LEFT JOIN users u ON g.created_by = u.id 
       ORDER BY g.created_at DESC`
    );

    // For each GRN, check if it has any damaged items
    const grnsWithDamageStatus = await Promise.all(grnRows.map(async (grn) => {
      // Check if this GRN has any items with damage
      const [damageItems] = await db.query(
        `SELECT COUNT(*) as damage_count 
         FROM grn_items 
         WHERE grn_id = ? AND damage_quantity > 0`,
        [grn.id]
      );

      // Add damage_status field
      return {
        ...grn,
        damage_status: damageItems[0].damage_count > 0 ? "Damage" : "No Damage"
      };
    }));

    return grnsWithDamageStatus;
}

  // Get GRN by ID - Updated with proper GST handling
  static async getById(id) {
    const [grnRows] = await db.query(
      `SELECT g.*, u.username as created_by_name 
       FROM grns g 
       LEFT JOIN users u ON g.created_by = u.id 
       WHERE g.id = ?`,
      [id]
    );

    if (grnRows.length === 0) return null;

    const [itemRows] = await db.query(
      `SELECT * FROM grn_items WHERE grn_id = ? ORDER BY s_no`,
      [id]
    );

    // Calculate item-level amounts
    const items = itemRows.map(item => {
      const receivedQty = Number(item.received_quantity);
      const damageQty = Number(item.damage_quantity);
      const cost = Number(item.per_unit_cost);
      
      return {
        ...item,
        amount: receivedQty * cost,
        damage_amount: damageQty * cost
      };
    });

    // Calculate summary totals
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const totalDamageAmount = items.reduce((sum, item) => sum + item.damage_amount, 0);
    const subtotal = totalAmount - totalDamageAmount;
    const freight = Number(grnRows[0].freight);
    const gstPercentage = Number(grnRows[0].gst_percentage);
    const gstAmount = Number(grnRows[0].gst_amount);
    const payableAmount = subtotal + freight + gstAmount;

    return {
      ...grnRows[0],
      items,
      calculatedValues: {
        subtotal,
        gstPercentage,
        gstAmount,
        payableAmount
      }
    };
  }

  // Update GRN - Updated with proper GST handling
static async update(id, grnData, items = null) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Update GRN header
        await connection.query(
            `UPDATE grns SET ? WHERE id = ?`,
            [grnData, id]
        );

        // Update items if provided
        if (items) {
            // Get existing items to determine which to update vs insert
            const [existingItems] = await connection.query(
                `SELECT * FROM grn_items WHERE grn_id = ?`,
                [id]
            );

            for (const item of items) {
                const existingItem = existingItems.find(i => i.s_no === item.s_no);
                const receivedQty = Number(item.received_quantity);
                const damageQty = Number(item.damage_quantity || 0);
                const perUnitCost = Number(item.per_unit_cost);
                
                if (existingItem) {
                    // Update existing item
                    await connection.query(
                        `UPDATE grn_items SET ? WHERE id = ?`,
                        [{
                            s_no: item.s_no,
                            sku: item.sku,
                            goods_description: item.goods_description,
                            uom: item.uom,
                            received_quantity: receivedQty,
                            good_quantity: receivedQty - damageQty,
                            damage_quantity: damageQty,
                            per_unit_cost: perUnitCost,
                            amount: receivedQty * perUnitCost,
                            damage_status: damageQty > 0 ? 'Damage' : 'No Damage',
                            damage_amount: damageQty * perUnitCost
                        }, existingItem.id]
                    );
                } else {
                    // Insert new item
                    await connection.query(
                        `INSERT INTO grn_items SET ?`,
                        [{
                            grn_id: id,
                            s_no: item.s_no,
                            sku: item.sku,
                            goods_description: item.goods_description,
                            uom: item.uom,
                            received_quantity: receivedQty,
                            good_quantity: receivedQty - damageQty,
                            damage_quantity: damageQty,
                            per_unit_cost: perUnitCost,
                            amount: receivedQty * perUnitCost,
                            damage_status: damageQty > 0 ? 'Damage' : 'No Damage',
                            damage_amount: damageQty * perUnitCost
                        }]
                    );
                }
            }

            // Delete items that are no longer in the updated list
            const currentSNos = items.map(item => item.s_no);
            const itemsToDelete = existingItems.filter(item => !currentSNos.includes(item.s_no));
            
            for (const item of itemsToDelete) {
                await connection.query(
                    `DELETE FROM grn_items WHERE id = ?`,
                    [item.id]
                );
            }
        }

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

  // Delete GRN (unchanged)
  static async delete(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `DELETE FROM grn_items WHERE grn_id = ?`,
        [id]
      );

      const [result] = await connection.query(
        `DELETE FROM grns WHERE id = ?`,
        [id]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = GRNModel;