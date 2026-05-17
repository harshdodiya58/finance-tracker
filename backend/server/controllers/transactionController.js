const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// @desc    Get all transactions for logged in user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const {
      category,
      type,
      paymentMethod,
      borrowOrLend,
      settlementStatus,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sort = '-date'
    } = req.query;

    // Build filter object
    const filter = { user: req.user.id };

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (borrowOrLend && borrowOrLend !== 'all') filter.borrowOrLend = borrowOrLend;
    if (settlementStatus && settlementStatus !== 'all') filter.settlementStatus = settlementStatus;

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transactions'
    });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching transaction'
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const transaction = await Transaction.create(req.body);

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating transaction'
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    
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
        message: 'Transaction not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating transaction'
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error deleting transaction'
    });
  }
};

// @desc    Get transaction analytics
// @route   GET /api/transactions/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build match criteria
    const matchCriteria = { user: new mongoose.Types.ObjectId(req.user.id) };
    
    if (startDate || endDate) {
      matchCriteria.date = {};
      if (startDate) matchCriteria.date.$gte = new Date(startDate);
      if (endDate) matchCriteria.date.$lte = new Date(endDate);
    }

    // Income vs Expense Summary
    const incomeExpenseSummary = await Transaction.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Category-wise breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          income: {
            $sum: {
              $cond: [
                { $eq: ['$_id.type', 'income'] },
                '$total',
                0
              ]
            }
          },
          expense: {
            $sum: {
              $cond: [
                { $eq: ['$_id.type', 'expense'] },
                '$total',
                0
              ]
            }
          },
          totalTransactions: { $sum: '$count' }
        }
      },
      {
        $project: {
          category: '$_id',
          income: 1,
          expense: 1,
          net: { $subtract: ['$income', '$expense'] },
          totalTransactions: 1,
          _id: 0
        }
      },
      { $sort: { expense: -1 } }
    ]);

    // Borrow/Lend Summary
    const borrowLendSummary = await Transaction.aggregate([
      {
        $match: {
          ...matchCriteria,
          borrowOrLend: { $ne: 'none' }
        }
      },
      {
        $group: {
          _id: {
            borrowOrLend: '$borrowOrLend',
            settlementStatus: '$settlementStatus'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.borrowOrLend',
          pending: {
            $sum: {
              $cond: [
                { $eq: ['$_id.settlementStatus', 'pending'] },
                '$total',
                0
              ]
            }
          },
          settled: {
            $sum: {
              $cond: [
                { $eq: ['$_id.settlementStatus', 'settled'] },
                '$total',
                0
              ]
            }
          },
          totalTransactions: { $sum: '$count' }
        }
      },
      {
        $project: {
          type: '$_id',
          pending: 1,
          settled: 1,
          total: { $add: ['$pending', '$settled'] },
          totalTransactions: 1,
          _id: 0
        }
      }
    ]);

    // Payment Method Distribution
    const paymentMethodDistribution = await Transaction.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Monthly trend (last 12 months)
    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          ...matchCriteria,
          date: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 11))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          income: {
            $sum: {
              $cond: [
                { $eq: ['$_id.type', 'income'] },
                '$total',
                0
              ]
            }
          },
          expense: {
            $sum: {
              $cond: [
                { $eq: ['$_id.type', 'expense'] },
                '$total',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          income: 1,
          expense: 1,
          net: { $subtract: ['$income', '$expense'] },
          _id: 0
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // Format response
    const totalIncome = incomeExpenseSummary.find(item => item._id === 'income')?.total || 0;
    const totalExpense = incomeExpenseSummary.find(item => item._id === 'expense')?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpense,
          netAmount: totalIncome - totalExpense,
          totalTransactions: incomeExpenseSummary.reduce((sum, item) => sum + item.count, 0)
        },
        categoryBreakdown,
        borrowLendSummary,
        paymentMethodDistribution: paymentMethodDistribution.map(item => ({
          method: item._id,
          total: item.total,
          count: item.count
        })),
        monthlyTrend
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics'
    });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAnalytics
};