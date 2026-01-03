const Investment = require('../models/Investment');
const mongoose = require('mongoose');

// @desc    Get all investments for logged in user
// @route   GET /api/investments
// @access  Private
const getInvestments = async (req, res) => {
  try {
    const { type, symbol, page = 1, limit = 10, sort = '-date' } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    
    if (type) filter.type = type;
    if (symbol) filter.symbol = new RegExp(symbol, 'i'); // Case insensitive search

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get investments with pagination
    const investments = await Investment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    // Get total count for pagination
    const total = await Investment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: investments.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: investments
    });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching investments'
    });
  }
};

// @desc    Get single investment
// @route   GET /api/investments/:id
// @access  Private
const getInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name email');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('Get investment error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching investment'
    });
  }
};

// @desc    Create new investment
// @route   POST /api/investments
// @access  Private
const createInvestment = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // If currentValue is not provided, set it to amountInvested
    if (!req.body.currentValue && req.body.amountInvested) {
      req.body.currentValue = req.body.amountInvested;
    }

    const investment = await Investment.create(req.body);

    res.status(201).json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('Create investment error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating investment'
    });
  }
};

// @desc    Update investment
// @route   PUT /api/investments/:id
// @access  Private
const updateInvestment = async (req, res) => {
  try {
    let investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    investment = await Investment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('Update investment error:', error);
    
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
        message: 'Investment not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating investment'
    });
  }
};

// @desc    Delete investment
// @route   DELETE /api/investments/:id
// @access  Private
const deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    await Investment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Investment deleted successfully'
    });
  } catch (error) {
    console.error('Delete investment error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error deleting investment'
    });
  }
};

// @desc    Update current value of investment
// @route   PUT /api/investments/:id/value
// @access  Private
const updateInvestmentValue = async (req, res) => {
  try {
    const { currentValue } = req.body;

    if (currentValue === undefined || currentValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid current value'
      });
    }

    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    await investment.updateCurrentValue(currentValue);

    res.status(200).json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('Update investment value error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating investment value'
    });
  }
};

// @desc    Get investment portfolio summary
// @route   GET /api/investments/portfolio
// @access  Private
const getPortfolioSummary = async (req, res) => {
  try {
    const portfolioSummary = await Investment.getPortfolioSummary(req.user.id);

    res.status(200).json({
      success: true,
      data: portfolioSummary
    });
  } catch (error) {
    console.error('Get portfolio summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching portfolio summary'
    });
  }
};

// @desc    Get investment analytics
// @route   GET /api/investments/analytics
// @access  Private
const getInvestmentAnalytics = async (req, res) => {
  try {
    // Portfolio summary
    const portfolioSummary = await Investment.getPortfolioSummary(req.user.id);

    // Top performers (by profit/loss percentage)
    const topPerformers = await Investment.find({ user: req.user.id })
      .sort({ profitLossPercentage: -1 })
      .limit(5);

    // Worst performers (by profit/loss percentage)
    const worstPerformers = await Investment.find({ user: req.user.id })
      .sort({ profitLossPercentage: 1 })
      .limit(5);

    // Investment distribution by symbol
    const symbolDistribution = await Investment.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$symbol',
          type: { $first: '$type' },
          totalInvested: { $sum: '$amountInvested' },
          totalCurrentValue: { $sum: '$currentValue' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          symbol: '$_id',
          type: 1,
          totalInvested: 1,
          totalCurrentValue: 1,
          count: 1,
          profitLoss: { $subtract: ['$totalCurrentValue', '$totalInvested'] },
          profitLossPercentage: {
            $cond: {
              if: { $eq: ['$totalInvested', 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: [
                    { $subtract: ['$totalCurrentValue', '$totalInvested'] },
                    '$totalInvested'
                  ]},
                  100
                ]
              }
            }
          },
          _id: 0
        }
      },
      { $sort: { totalCurrentValue: -1 } }
    ]);

    // Monthly investment trend (last 12 months)
    const monthlyTrend = await Investment.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 11))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalInvested: { $sum: '$amountInvested' },
          totalCurrentValue: { $sum: '$currentValue' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          totalInvested: 1,
          totalCurrentValue: 1,
          count: 1,
          profitLoss: { $subtract: ['$totalCurrentValue', '$totalInvested'] },
          _id: 0
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // Performance statistics
    const performanceStats = await Investment.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $project: {
          profitLoss: { $subtract: ['$currentValue', '$amountInvested'] },
          profitLossPercentage: {
            $cond: {
              if: { $eq: ['$amountInvested', 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: [
                    { $subtract: ['$currentValue', '$amountInvested'] },
                    '$amountInvested'
                  ]},
                  100
                ]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalInvestments: { $sum: 1 },
          profitableInvestments: {
            $sum: { $cond: [{ $gt: ['$profitLoss', 0] }, 1, 0] }
          },
          lossMakingInvestments: {
            $sum: { $cond: [{ $lt: ['$profitLoss', 0] }, 1, 0] }
          },
          averageProfitLossPercentage: { $avg: '$profitLossPercentage' },
          maxProfitLossPercentage: { $max: '$profitLossPercentage' },
          minProfitLossPercentage: { $min: '$profitLossPercentage' }
        }
      }
    ]);

    const stats = performanceStats[0] || {
      totalInvestments: 0,
      profitableInvestments: 0,
      lossMakingInvestments: 0,
      averageProfitLossPercentage: 0,
      maxProfitLossPercentage: 0,
      minProfitLossPercentage: 0
    };

    res.status(200).json({
      success: true,
      data: {
        portfolioSummary,
        topPerformers: topPerformers.map(inv => ({
          id: inv._id,
          symbol: inv.symbol,
          type: inv.type,
          amountInvested: inv.amountInvested,
          currentValue: inv.currentValue,
          profitLoss: inv.profitLoss,
          profitLossPercentage: inv.profitLossPercentage
        })),
        worstPerformers: worstPerformers.map(inv => ({
          id: inv._id,
          symbol: inv.symbol,
          type: inv.type,
          amountInvested: inv.amountInvested,
          currentValue: inv.currentValue,
          profitLoss: inv.profitLoss,
          profitLossPercentage: inv.profitLossPercentage
        })),
        symbolDistribution,
        monthlyTrend,
        performanceStats: {
          ...stats,
          profitablePercentage: stats.totalInvestments > 0 
            ? (stats.profitableInvestments / stats.totalInvestments) * 100 
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Get investment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching investment analytics'
    });
  }
};

module.exports = {
  getInvestments,
  getInvestment,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  updateInvestmentValue,
  getPortfolioSummary,
  getInvestmentAnalytics
};