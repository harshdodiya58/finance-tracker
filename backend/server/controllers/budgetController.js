const Budget = require('../models/Budget');

// @desc    Get all budgets for logged in user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const { category, period } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    
    if (category) filter.category = category;
    if (period) filter.period = period;

    const budgets = await Budget.find(filter)
      .sort({ category: 1, period: 1 })
      .populate('user', 'name email');

    // Get progress for each budget
    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const progress = await budget.getProgress();
        return {
          ...budget.toObject(),
          progress
        };
      })
    );

    res.status(200).json({
      success: true,
      count: budgetsWithProgress.length,
      data: budgetsWithProgress
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching budgets'
    });
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name email');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Get progress
    const progress = await budget.getProgress();

    res.status(200).json({
      success: true,
      data: {
        ...budget.toObject(),
        progress
      }
    });
  } catch (error) {
    console.error('Get budget error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching budget'
    });
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const budget = await Budget.create(req.body);

    // Get progress
    const progress = await budget.getProgress();

    res.status(201).json({
      success: true,
      data: {
        ...budget.toObject(),
        progress
      }
    });
  } catch (error) {
    console.error('Create budget error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    // Handle duplicate budget error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and period'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating budget'
    });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    let budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // Get progress
    const progress = await budget.getProgress();

    res.status(200).json({
      success: true,
      data: {
        ...budget.toObject(),
        progress
      }
    });
  } catch (error) {
    console.error('Update budget error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Handle duplicate budget error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and period'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating budget'
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error deleting budget'
    });
  }
};

// @desc    Get budget usage analytics
// @route   GET /api/budgets/analytics
// @access  Private
const getBudgetAnalytics = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });

    if (budgets.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalBudgets: 0,
            onTrackBudgets: 0,
            warningBudgets: 0,
            exceededBudgets: 0
          },
          budgetProgress: []
        }
      });
    }

    // Get progress for all budgets
    const budgetProgress = await Promise.all(
      budgets.map(async (budget) => {
        const progress = await budget.getProgress();
        return {
          id: budget._id,
          category: budget.category,
          period: budget.period,
          ...progress
        };
      })
    );

    // Calculate summary statistics
    const summary = budgetProgress.reduce(
      (acc, budget) => {
        acc.totalBudgets += 1;
        
        switch (budget.status) {
          case 'on-track':
            acc.onTrackBudgets += 1;
            break;
          case 'warning':
            acc.warningBudgets += 1;
            break;
          case 'exceeded':
            acc.exceededBudgets += 1;
            break;
        }
        
        return acc;
      },
      {
        totalBudgets: 0,
        onTrackBudgets: 0,
        warningBudgets: 0,
        exceededBudgets: 0
      }
    );

    // Calculate totals
    const totals = budgetProgress.reduce(
      (acc, budget) => {
        acc.totalBudgetAmount += budget.limit;
        acc.totalSpentAmount += budget.spent;
        return acc;
      },
      { totalBudgetAmount: 0, totalSpentAmount: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          ...summary,
          ...totals,
          overallPercentage: totals.totalBudgetAmount > 0 
            ? Math.round((totals.totalSpentAmount / totals.totalBudgetAmount) * 100 * 100) / 100
            : 0
        },
        budgetProgress: budgetProgress.sort((a, b) => b.percentage - a.percentage)
      }
    });
  } catch (error) {
    console.error('Get budget analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching budget analytics'
    });
  }
};

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAnalytics
};