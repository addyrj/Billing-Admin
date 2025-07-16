const express = require('express');
const router = express.Router();
const debitNoteController = require('../controllers/debitNoteController');
const { authenticateToken, requireRole } = require('../middleware/authenticateToken');
const { validateDebitNote, validateDebitNoteUpdate } = require('../validations/debitNoteValidation');

// Apply authentication to all routes
router.use(authenticateToken);

// Create Debit Note - Uses full validation
router.post(
  '/debit',
  requireRole(['adminpurchase', 'purchaseuser']),
  (req, res, next) => {
    const { error } = validateDebitNote(req.body);
    if (error) {
      return res.status(400).json({
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  },
  debitNoteController.createDebitNote
);

// Update Debit Note - Uses partial validation
router.put(
  '/debit/:id',
  requireRole(['adminpurchase', 'purchaseuser']),
  (req, res, next) => {
    const { error } = validateDebitNoteUpdate(req.body);
    if (error) {
      return res.status(400).json({
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  },
  debitNoteController.updateDebitNote
);

// Get all Debit Notes
router.get(
  '/debit',
  debitNoteController.getAllDebitNotes
);

// Get Debit Note by ID
router.get(
  '/debit/:id',
  debitNoteController.getDebitNote
);

// Delete Debit Note
router.delete(
  '/debit/:id',
  requireRole(['adminpurchase']),
  debitNoteController.deleteDebitNote
);

module.exports = router;