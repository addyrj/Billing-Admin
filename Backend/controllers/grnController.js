const GRNModel = require("../models/grnModel");
const { validationResult } = require("express-validator");
const { convertToWords } = require('../config/amountConverter');

class GRNController {
  // Generate GRN number (unchanged)
  static async generateGRNNumber(req, res) {
    try {
      const grnNo = await GRNModel.generateGRNNumber();
      res.json({
        success: true,
        data: { grnNo }
      });
    } catch (error) {
      console.error("Error generating GRN number:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate GRN number",
        error: process.env.NODE_ENV === "development" ? error.message : null
      });
    }
  }

  // Safe number parser
  static safeParseNumber(value, defaultValue = 0) {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }

  // Create GRN with new calculation logic
  static async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let grnData = req.body;
      
      // Generate GRN number automatically
      const grnNo = await GRNModel.generateGRNNumber();
      
      // Calculate amounts for each item with proper number handling
      let totalAmount = 0;
      let totalDamageAmount = 0;
      
      grnData.items = grnData.items.map(item => {
        const receivedQty = GRNController.safeParseNumber(item.received_quantity);
        const damageQty = GRNController.safeParseNumber(item.damage_quantity);
        const perUnitCost = GRNController.safeParseNumber(item.per_unit_cost);
        
        // Total amount = received quantity * cost
        const amount = receivedQty * perUnitCost;
        // Damage amount = damage quantity * cost
        const damageAmount = damageQty * perUnitCost;
        
        totalAmount += amount;
        totalDamageAmount += damageAmount;
        
        return {
          ...item,
          amount: amount,
          damage_amount: damageAmount,
          per_unit_cost: perUnitCost,
          received_quantity: receivedQty,
          damage_quantity: damageQty,
          good_quantity: receivedQty - damageQty // Calculate good quantity
        };
      });

      // Calculate totals with proper number handling
      const freight = GRNController.safeParseNumber(grnData.freight);
      const gstPercentage = GRNController.safeParseNumber(grnData.gst);

      // Calculate subtotal (total amount - damage amount)
      const subtotal = totalAmount - totalDamageAmount;

      // Calculate GST on (subtotal + freight)
      const gstAmount = (subtotal + freight) * (gstPercentage / 100);
      
      // Payable amount = (subtotal + freight) + GST
      const payableAmount = subtotal + freight + gstAmount;

      // Prepare data for database insertion
      const dbData = {
        ...grnData,
        grn_no: grnNo,
        total_amount: totalAmount,
        damage_amount: totalDamageAmount,
        freight: freight,
        gst: gstAmount,
        grand_total: subtotal, // Grand total is same as payable amount
        payable_amount: payableAmount,
        payable_in_words: convertToWords(payableAmount),
        created_by: req.user.id,
        status: "Draft"
      };

      const grnId = await GRNModel.create(dbData);

      res.status(201).json({
        success: true,
        message: "GRN created successfully",
        data: { 
          grnId,
          grnNo,
          calculatedValues: {
            totalAmount,
            totalDamageAmount,
            subtotal,
            freight,
            gstAmount,
            payableAmount
          }
        }
      });
    } catch (error) {
      console.error("Error creating GRN:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create GRN",
        error: process.env.NODE_ENV === "development" ? error.message : null
      });
    }
  }

  // Calculate amounts with new logic
  static calculateAmounts(grnData) {
    let totalAmount = 0;
    let totalDamageAmount = 0;
    
    // Process each item to calculate amounts
    grnData.items.forEach(item => {
      const receivedQty = GRNController.safeParseNumber(item.received_quantity);
      const damageQty = GRNController.safeParseNumber(item.damage_quantity);
      const perUnitCost = GRNController.safeParseNumber(item.per_unit_cost);
      
      totalAmount += receivedQty * perUnitCost;
      totalDamageAmount += damageQty * perUnitCost;
    });

    const freight = GRNController.safeParseNumber(grnData.freight);
    const gstPercentage = GRNController.safeParseNumber(grnData.gst);

    // Calculate subtotal (total amount - damage amount)
    const subtotal = totalAmount - totalDamageAmount;

    // Calculate GST on (subtotal + freight)
    const gstAmount = (subtotal + freight) * (gstPercentage / 100);
    
    // Payable amount = (subtotal + freight) + GST
    const payableAmount = subtotal + freight + gstAmount;

    return {
      total_amount: totalAmount,
      damage_amount: totalDamageAmount,
      freight: freight,
      gst_percentage: gstPercentage, // Include percentage
    gst_amount: gstAmount,
      grand_total: subtotal,
      payable_amount: payableAmount,
      payable_in_words: convertToWords(payableAmount),
      // _calculated: {
      //   subtotal,
      //   gstPercentage
      // }
    };
  }

  // Get all GRNs (unchanged)
  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search;
      const status = req.query.status;

      let grns;
      if (search) {
        grns = await GRNModel.search(search, status);
      } else if (req.query.page) {
        grns = await GRNModel.getAllPaginated(page, limit);
      } else {
        grns = await GRNModel.getAll();
      }

      res.json({
        success: true,
        data: grns
      });
    } catch (error) {
      console.error("Error fetching GRNs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch GRNs",
        error: process.env.NODE_ENV === "development" ? error.message : null
      });
    }
  }

  // Get GRN by ID (unchanged)
  static async getById(req, res) {
    try {
      const grn = await GRNModel.getById(req.params.id);
      if (!grn) {
        return res.status(404).json({
          success: false,
          message: "GRN not found"
        });
      }
      res.json({
        success: true,
        data: grn
      });
    } catch (error) {
      console.error("Error fetching GRN:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch GRN",
        error: process.env.NODE_ENV === "development" ? error.message : null
      });
    }
  }

  // Update GRN with new calculation logic
static async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const grnData = req.body;
        const grnId = req.params.id;
        
        // Get existing GRN with items
        const existingGRN = await GRNModel.getById(grnId);
        if (!existingGRN) {
            return res.status(404).json({
                success: false,
                message: "GRN not found"
            });
        }

        // Merge items - update existing and add new
        let mergedItems = [...existingGRN.items];
        if (grnData.items) {
            grnData.items.forEach(newItem => {
                const existingIndex = mergedItems.findIndex(i => i.s_no === newItem.s_no);
                if (existingIndex >= 0) {
                    // Update existing item
                    mergedItems[existingIndex] = {
                        ...mergedItems[existingIndex],
                        ...newItem,
                        id: mergedItems[existingIndex].id // Preserve the ID
                    };
                } else {
                    // Add new item
                    mergedItems.push(newItem);
                }
            });
        }

        // Calculate amounts based on merged items
        let totalAmount = 0;
        let totalDamageAmount = 0;
        
        mergedItems.forEach(item => {
            const receivedQty = GRNController.safeParseNumber(item.received_quantity);
            const damageQty = GRNController.safeParseNumber(item.damage_quantity);
            const perUnitCost = GRNController.safeParseNumber(item.per_unit_cost);
            
            totalAmount += receivedQty * perUnitCost;
            totalDamageAmount += damageQty * perUnitCost;
        });

        const freight = grnData.freight !== undefined ? 
            GRNController.safeParseNumber(grnData.freight) : 
            GRNController.safeParseNumber(existingGRN.freight);
            
        const gstPercentage = grnData.gst_percentage !== undefined ? 
            GRNController.safeParseNumber(grnData.gst_percentage) : 
            GRNController.safeParseNumber(existingGRN.gst_percentage);

        // Calculate subtotal (total amount - damage amount)
        const subtotal = totalAmount - totalDamageAmount;

        // Calculate GST on (subtotal + freight)
        const gstAmount = (subtotal + freight) * (gstPercentage / 100);
        
        // Payable amount = (subtotal + freight) + GST
        const payableAmount = subtotal + freight + gstAmount;

        const amounts = {
            total_amount: totalAmount,
            damage_amount: totalDamageAmount,
            freight: freight,
            gst_percentage: gstPercentage,
            gst_amount: gstAmount,
            grand_total: subtotal,
            payable_amount: payableAmount,
            payable_in_words: convertToWords(payableAmount)
        };

        // Prepare update data
        const updateData = {
            ...grnData,
            ...amounts,
            updated_by: req.user.id
        };

        // Remove items from update data (handled separately)
        delete updateData.items;

        // Update GRN with merged items
        const updated = await GRNModel.update(grnId, updateData, mergedItems);

        // Get updated GRN to return
        const updatedGRN = await GRNModel.getById(grnId);

        res.json({
            success: true,
            message: "GRN updated successfully",
            data: updatedGRN
        });
    } catch (error) {
        console.error("Error updating GRN:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update GRN",
            error: process.env.NODE_ENV === "development" ? error.message : null
        });
    }
}
  // Delete GRN (unchanged)
  static async delete(req, res) {
    try {
      const deleted = await GRNModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "GRN not found"
        });
      }
      res.json({
        success: true,
        message: "GRN deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting GRN:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete GRN",
        error: process.env.NODE_ENV === "development" ? error.message : null
      });
    }
  }
}

module.exports = GRNController;