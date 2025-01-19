const Transaction = require('../models/Transaction');

// Get transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

// Add transaction
const addTransaction = async (req, res) => {
  try {
    const { amount, type, description } = req.body;
    
    const transaction = await Transaction.create({
      user: req.user.id,
      amount,
      type,
      description
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error adding transaction' });
  }
};

module.exports = {
  getTransactions,
  addTransaction
}; 