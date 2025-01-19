const { body } = require('express-validator');

const transactionValidation = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Tipe transaksi tidak boleh kosong')
    .isIn(['income', 'expense'])
    .withMessage('Tipe transaksi harus income atau expense'),
  
  body('amount')
    .notEmpty()
    .withMessage('Jumlah tidak boleh kosong')
    .isNumeric()
    .withMessage('Jumlah harus berupa angka')
    .custom(value => value > 0)
    .withMessage('Jumlah harus lebih dari 0'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Deskripsi tidak boleh kosong')
    .isLength({ max: 500 })
    .withMessage('Deskripsi maksimal 500 karakter'),

  // Make date optional with default value
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Format tanggal tidak valid')
    .toDate()
];

module.exports = transactionValidation; 