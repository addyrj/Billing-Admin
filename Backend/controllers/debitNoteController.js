const DebitNote = require('../models/debitNoteModel');
const { validateDebitNote,
  validateDebitNoteUpdate } = require('../validations/debitNoteValidation');

exports.createDebitNote = async (req, res, next) => {
  try {
    const { error } = validateDebitNote(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const debitNoteData = {
      ...req.body,
      created_by: req.user.id // Make sure this is set
    };

    const debitNoteId = await DebitNote.create(debitNoteData);
    const newDebitNote = await DebitNote.getById(debitNoteId);

    res.status(201).json({
      success: true,
      data: newDebitNote
    });
  } catch (error) {
    next(error);
  }
};

exports.getDebitNote = async (req, res, next) => {
  try {
    const debitNote = await DebitNote.getById(req.params.id);
    if (!debitNote) {
      return res.status(404).json({
        success: false,
        error: 'Debit note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: debitNote
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllDebitNotes = async (req, res, next) => {
  try {
    const debitNotes = await DebitNote.getAll();
    res.status(200).json({
      success: true,
      count: debitNotes.length,
      data: debitNotes
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDebitNote = async (req, res, next) => {
  try {
    const { error } = validateDebitNoteUpdate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Get current note
    const currentNote = await DebitNote.getById(req.params.id);
    if (!currentNote) {
      return res.status(404).json({
        success: false,
        error: 'Debit note not found'
      });
    }

    // Prepare update data
    const updateData = {
      updated_by: req.user.id
    };

    // Define allowed fields
    const allowedFields = [
      'debit_note_date',
      'payment_mode',
      'dispatch_through',
      'freight',
      'consignee',
      'buyer_po_no',
      'grn_no',
      'original_invoice_no',
      'original_invoice_date',
      'buyer'
    ];

    // Only include allowed fields that exist in request
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle items separately if needed
    if (req.body.items) {
      // Add logic to update items if needed
    }

    const updated = await DebitNote.update(req.params.id, updateData);
    if (!updated) {
      return res.status(400).json({
        success: false,
        error: 'Debit note could not be updated'
      });
    }

    const updatedDebitNote = await DebitNote.getById(req.params.id);
    res.status(200).json({
      success: true,
      data: updatedDebitNote
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDebitNote = async (req, res, next) => {
  try {
    const debitNote = await DebitNote.getById(req.params.id);
    if (!debitNote) {
      return res.status(404).json({
        success: false,
        error: 'Debit note not found'
      });
    }

    const deleted = await DebitNote.delete(req.params.id);
    if (!deleted) {
      return res.status(400).json({
        success: false,
        error: 'Debit note could not be deleted'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};