const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Protect all transaction routes with auth middleware
router.use(auth);

// Validasi untuk transaksi
const transactionValidation = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Tipe transaksi harus income atau expense'),
  body('amount')
    .isNumeric()
    .withMessage('Jumlah harus berupa angka')
    .isFloat({ min: 0 })
    .withMessage('Jumlah tidak boleh negatif'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Deskripsi tidak boleh kosong')
];

// Get all transactions
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const query = { user: req.userId };
    
    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 });

    // Calculate summary
    const summary = transactions.reduce((acc, curr) => {
      if (curr.type === 'income') {
        acc.totalIncome += curr.amount;
      } else {
        acc.totalExpense += curr.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    res.json({
      success: true,
      transactions,
      summary
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Create transaction
router.post('/', auth, transactionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: 'Data transaksi tidak valid'
      });
    }

    const { type, amount, description, date } = req.body;

    const transactionData = {
      user: req.userId,
      type,
      amount: Number(amount),
      description,
      date: date || new Date()
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();
    
    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal membuat transaksi'
    });
  }
});

// Update transaction
router.put('/:id', auth, transactionValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, date } = req.body;

    // Verify transaction exists and belongs to user
    const transaction = await Transaction.findOne({ 
      _id: id,
      user: req.userId 
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    // Update transaction
    transaction.type = type;
    transaction.amount = amount;
    transaction.description = description;
    if (date) transaction.date = date;

    await transaction.save();

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengupdate transaksi'
    });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Transaksi berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add this new route for dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Set proper headers
    res.setHeader('Content-Type', 'application/json');

    const transactions = await Transaction.find({ user: req.userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // Calculate summary
    const allTransactions = await Transaction.find({ user: req.userId });
    const summary = allTransactions.reduce((acc, curr) => {
      if (curr.type === 'income') {
        acc.totalIncome += curr.amount;
      } else {
        acc.totalExpense += curr.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    // Send JSON response
    res.json({
      success: true,
      summary,
      recentTransactions: transactions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      summary: {
        totalIncome: 0,
        totalExpense: 0
      },
      recentTransactions: []
    });
  }
});

module.exports = router; 