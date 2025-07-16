const db = require('../config/db');
const { convertToWords } = require('../config/amountConverter');

class DebitNote {
  static async generateDebitNoteNumber() {
    const prefix = 'ISSPL';
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const nextYear = (new Date().getFullYear() + 1).toString().slice(-2);
    const financialYear = `${currentYear}-${nextYear}`;
    
    const [result] = await db.query(
      `SELECT MAX(SUBSTRING_INDEX(debit_note_number, '/', -1)) as last_number 
       FROM debit_notes 
       WHERE debit_note_number LIKE ?`,
      [`${prefix}/${financialYear}/%`]
    );
    
    const lastNumber = result[0].last_number ? parseInt(result[0].last_number) : 0;
    const newNumber = lastNumber + 1;
    
    return `${prefix}/${financialYear}/${newNumber.toString().padStart(3, '0')}`;
  }

  static async calculateAmounts(items, freight, gstPercentage) {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount)) || 0, 0);
    const freightAmount = parseFloat(freight) || 0;
    const gstAmount = (subtotal + freightAmount) * (gstPercentage / 100);
    const payableAmount = subtotal + freightAmount + gstAmount;
    
    return {
      subtotal: subtotal.toFixed(2),
      gst_amount: gstAmount.toFixed(2),
      payable_amount: payableAmount.toFixed(2)
    };
  }
static async create(debitNoteData) {
    const {
      debit_note_date,
      payment_mode,
      buyer_po_no,
      grn_no,
      dispatch_through,
      original_invoice_no,
      original_invoice_date,
      freight,
      consignee,
      buyer,
      items,
      created_by
    } = debitNoteData;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Generate debit note number
      const debit_note_number = await this.generateDebitNoteNumber();

      // Get GST percentage from first item
      const gstPercentage = items.length > 0 ? parseFloat(items[0].gst_rate) || 0 : 0;

      // Calculate amounts
      const { subtotal, gst_amount, payable_amount } = await this.calculateAmounts(
        items,
        freight,
        gstPercentage
      );

      const amount_in_words = convertToWords(payable_amount);
      const amount_in_words_gst = convertToWords(gst_amount);

      // Insert debit note header
      const [result] = await connection.query(
        `INSERT INTO debit_notes 
        (debit_note_number, debit_note_date, payment_mode, buyer_po_no, grn_no, 
         dispatch_through, original_invoice_no, original_invoice_date, freight,
         consignee_name, consignee_address, consignee_gstin, consignee_state, consignee_code,
         buyer_address, subtotal, gst_percentage, gst_amount, amount_in_words_gst, payable_amount, amount_in_words, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          debit_note_number,
          debit_note_date,
          payment_mode,
          buyer_po_no,
          grn_no,
          dispatch_through,
          original_invoice_no,
          original_invoice_date,
          freight,
          consignee.name,
          consignee.address,
          consignee.gstin,
          consignee.state,
          consignee.code,
          buyer.address,
          subtotal,
          gstPercentage,
          gst_amount,
          amount_in_words_gst,
          payable_amount,
          amount_in_words,
          'Draft',
          created_by
        ]
      );

      const debitNoteId = result.insertId;

      // Insert items
      for (const item of items) {
        await connection.query(
          `INSERT INTO debit_note_items 
          (debit_note_id, s_no, sku, description, units, quantity, gst_rate, unit_cost, amount)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            debitNoteId,
            item.s_no,
            item.sku,
            item.description,
            item.units,
            item.quantity,
            item.gst_rate,
            item.unit_cost,
            item.amount
          ]
        );
      }

      await connection.commit();
      return debitNoteId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

static async getById(id) {
  const [debitNotes] = await db.query(
    `SELECT dn.*, 
     JSON_OBJECT(
       'name', dn.consignee_name,
       'address', dn.consignee_address,
       'gstin', dn.consignee_gstin,
       'state', dn.consignee_state,
       'code', dn.consignee_code
     ) as consignee,
     JSON_OBJECT(
       'address', dn.buyer_address
     ) as buyer
     FROM debit_notes dn 
     WHERE dn.id = ?`, 
    [id]
  );

  if (debitNotes.length === 0) return null;

  const [items] = await db.query(
    `SELECT 
       id,
       debit_note_id,
       s_no,
       sku,
       description,
       units,
       quantity,
       gst_rate,
       unit_cost,
       amount
     FROM debit_note_items 
     WHERE debit_note_id = ? 
     ORDER BY s_no`,
    [id]
  );

  return {
    ...debitNotes[0],
    consignee: JSON.parse(debitNotes[0].consignee),
    buyer: JSON.parse(debitNotes[0].buyer),
    items: items || []
  };
}

static async getAll() {
    const [rows] = await db.query(
      `SELECT 
        dn.id, 
        dn.debit_note_number, 
        dn.debit_note_date, 
        dn.buyer_po_no, 
        dn.grn_no, 
        dn.payable_amount, 
        dn.status,
        dn.consignee_name as vendor_name
      FROM debit_notes dn 
      ORDER BY debit_note_date DESC`
    );
    return rows;
  }

static async update(id, debitNoteData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Prepare update fields
      const updateFields = {
        updated_by: debitNoteData.updated_by
      };

      // Define all possible fields that can be updated
      const possibleFields = [
        'debit_note_date',
        'payment_mode',
        'dispatch_through',
        'freight',
        'consignee_name',
        'consignee_address',
        'consignee_gstin',
        'consignee_state',
        'consignee_code',
        'buyer_po_no',
        'grn_no',
        'original_invoice_no',
        'original_invoice_date',
        'buyer_address'
      ];

      // Handle consignee separately
      if (debitNoteData.consignee) {
        updateFields.consignee_name = debitNoteData.consignee.name || null;
        updateFields.consignee_address = debitNoteData.consignee.address || null;
        updateFields.consignee_gstin = debitNoteData.consignee.gstin || null;
        updateFields.consignee_state = debitNoteData.consignee.state || null;
        updateFields.consignee_code = debitNoteData.consignee.code || null;
      }

      // Handle other fields
      possibleFields.forEach(field => {
        if (debitNoteData[field] !== undefined) {
          updateFields[field] = debitNoteData[field];
        }
      });

      // Handle buyer address
      if (debitNoteData.buyer?.address) {
        updateFields.buyer_address = debitNoteData.buyer.address;
      }

      // Build dynamic update query
      const setClause = Object.keys(updateFields)
        .map(field => `${field} = ?`)
        .join(', ');

      const query = `
        UPDATE debit_notes 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await connection.query(query, [
        ...Object.values(updateFields),
        id
      ]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query('DELETE FROM debit_note_items WHERE debit_note_id = ?', [id]);
      const [result] = await connection.query('DELETE FROM debit_notes WHERE id = ?', [id]);

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

module.exports = DebitNote;