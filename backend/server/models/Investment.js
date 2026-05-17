const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    required: [true, 'Investment type is required'],
    enum: {
      values: ['stock', 'crypto'],
      message: 'Investment type must be either stock or crypto'
    }
  },
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    uppercase: true,
    trim: true,
    maxLength: [10, 'Symbol cannot be more than 10 characters']
  },
  amountInvested: {
    type: Number,
    required: [true, 'Investment amount is required'],
    min: [0, 'Investment amount cannot be negative']
  },
  currentValue: {
    type: Number,
    default: 0,
    min: [0, 'Current value cannot be negative']
  },
  quantity: {
    type: Number,
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  purchasePrice: {
    type: Number,
    min: [0, 'Purchase price cannot be negative'],
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
investmentSchema.index({ user: 1, type: 1 });
investmentSchema.index({ user: 1, symbol: 1 });
investmentSchema.index({ user: 1, date: -1 });

// Virtual for profit/loss calculation
investmentSchema.virtual('profitLoss').get(function() {
  return this.currentValue - this.amountInvested;
});

// Virtual for profit/loss percentage
investmentSchema.virtual('profitLossPercentage').get(function() {
  if (this.amountInvested === 0) return 0;
  return ((this.currentValue - this.amountInvested) / this.amountInvested) * 100;
});

// Virtual for investment status
investmentSchema.virtual('status').get(function() {
  const profitLoss = this.currentValue - this.amountInvested;
  if (profitLoss > 0) return 'profit';
  if (profitLoss < 0) return 'loss';
  return 'neutral';
});

// Ensure virtual fields are serialized
investmentSchema.set('toJSON', { virtuals: true });
investmentSchema.set('toObject', { virtuals: true });

// Instance method to update current value
investmentSchema.methods.updateCurrentValue = function(newValue) {
  this.currentValue = newValue;
  return this.save();
};

// Static method to get portfolio summary for a user
investmentSchema.statics.getPortfolioSummary = async function(userId) {
  const summary = await this.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: '$type',
        totalInvested: { $sum: '$amountInvested' },
        totalCurrentValue: { $sum: '$currentValue' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        type: '$_id',
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
        }
      }
    }
  ]);

  // Calculate overall totals
  const overallTotals = await this.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: null,
        totalInvested: { $sum: '$amountInvested' },
        totalCurrentValue: { $sum: '$currentValue' },
        totalCount: { $sum: 1 }
      }
    }
  ]);

  const overall = overallTotals[0] || {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalCount: 0
  };

  return {
    byType: summary,
    overall: {
      ...overall,
      profitLoss: overall.totalCurrentValue - overall.totalInvested,
      profitLossPercentage: overall.totalInvested > 0 
        ? ((overall.totalCurrentValue - overall.totalInvested) / overall.totalInvested) * 100 
        : 0
    }
  };
};

module.exports = mongoose.model('Investment', investmentSchema);