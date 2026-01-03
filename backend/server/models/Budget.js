const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Food', 
        'Travel', 
        'Bills', 
        'Shopping', 
        'Investment', 
        'Entertainment', 
        'Healthcare', 
        'Education', 
        'Transport', 
        'Utilities', 
        'Other'
      ],
      message: 'Please select a valid category'
    }
  },
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [0, 'Budget limit cannot be negative']
  },
  period: {
    type: String,
    enum: {
      values: ['monthly', 'weekly'],
      message: 'Period must be either monthly or weekly'
    },
    default: 'monthly'
  }
}, {
  timestamps: true
});

// Compound index to ensure one budget per user per category per period
budgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: true });

// Instance method to calculate spent amount for the current period
budgetSchema.methods.getSpentAmount = async function() {
  const Transaction = mongoose.model('Transaction');
  const now = new Date();
  let startDate;

  if (this.period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else { // weekly
    const dayOfWeek = now.getDay();
    startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);
  }

  const result = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(this.user),
        category: this.category,
        type: 'expense',
        date: { $gte: startDate, $lte: now }
      }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalSpent : 0;
};

// Instance method to get budget progress
budgetSchema.methods.getProgress = async function() {
  const spentAmount = await this.getSpentAmount();
  const percentage = this.limit > 0 ? (spentAmount / this.limit) * 100 : 0;
  
  return {
    limit: this.limit,
    spent: spentAmount,
    remaining: Math.max(0, this.limit - spentAmount),
    percentage: Math.round(percentage * 100) / 100,
    status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'on-track'
  };
};

module.exports = mongoose.model('Budget', budgetSchema);