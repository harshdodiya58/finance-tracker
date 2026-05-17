const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['income', 'expense'],
      message: 'Transaction type must be either income or expense'
    }
  },
  description: {
    type: String,
    trim: true,
    maxLength: [200, 'Description cannot be more than 200 characters']
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
        'Salary', 
        'Business', 
        'Freelance', 
        'Other'
      ],
      message: 'Please select a valid category'
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'],
      message: 'Please select a valid payment method'
    }
  },
  borrowOrLend: {
    type: String,
    enum: {
      values: ['none', 'borrow', 'lend'],
      message: 'Borrow or lend must be none, borrow, or lend'
    },
    default: 'none'
  },
  personName: {
    type: String,
    trim: true,
    maxLength: [50, 'Person name cannot be more than 50 characters'],
    validate: {
      validator: function(v) {
        // personName is required if borrowOrLend is not 'none'
        if (this.borrowOrLend !== 'none' && (!v || v.trim().length === 0)) {
          return false;
        }
        return true;
      },
      message: 'Person name is required when borrowing or lending'
    }
  },
  contactDetails: {
    type: String,
    trim: true,
    maxLength: [100, 'Contact details cannot be more than 100 characters']
  },
  settlementStatus: {
    type: String,
    enum: {
      values: ['pending', 'settled'],
      message: 'Settlement status must be pending or settled'
    },
    default: 'pending',
    validate: {
      validator: function(v) {
        // settlementStatus only applies if borrowOrLend is not 'none'
        if (this.borrowOrLend === 'none' && v !== 'pending') {
          return false;
        }
        return true;
      },
      message: 'Settlement status only applies to borrow/lend transactions'
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, borrowOrLend: 1 });

// Pre-save middleware to handle settlement status logic
transactionSchema.pre('save', function(next) {
  // If borrowOrLend is 'none', reset related fields
  if (this.borrowOrLend === 'none') {
    this.personName = undefined;
    this.contactDetails = undefined;
    this.settlementStatus = 'pending';
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);