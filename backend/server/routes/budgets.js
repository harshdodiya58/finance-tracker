const express = require('express');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAnalytics
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Analytics route (must come before /:id route)
router.get('/analytics', getBudgetAnalytics);

// CRUD routes
router
  .route('/')
  .get(getBudgets)
  .post(createBudget);

router
  .route('/:id')
  .get(getBudget)
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;