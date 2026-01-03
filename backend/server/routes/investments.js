const express = require('express');
const {
  getInvestments,
  getInvestment,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  updateInvestmentValue,
  getPortfolioSummary,
  getInvestmentAnalytics
} = require('../controllers/investmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Analytics and portfolio routes (must come before /:id routes)
router.get('/analytics', getInvestmentAnalytics);
router.get('/portfolio', getPortfolioSummary);

// CRUD routes
router
  .route('/')
  .get(getInvestments)
  .post(createInvestment);

router
  .route('/:id')
  .get(getInvestment)
  .put(updateInvestment)
  .delete(deleteInvestment);

// Update current value route
router.put('/:id/value', updateInvestmentValue);

module.exports = router;