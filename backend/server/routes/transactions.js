const express = require('express');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAnalytics
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Analytics route (must come before /:id route)
router.get('/analytics', getAnalytics);

// CRUD routes
router
  .route('/')
  .get(getTransactions)
  .post(createTransaction);

router
  .route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;