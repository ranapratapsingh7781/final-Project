const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdraw', 'transfer', 'bill_payment', 'demand', 'request'], required: true },
    category: {
      type: String,
      enum: ['transfer', 'bill', 'payment', 'card', 'withdraw', 'deposit', 'bill_payment', 'demand', 'request', 'history', 'other'],
      default: 'other',
    },
    amount: { type: Number, required: true },
    description: { type: String, trim: true },
    recipient: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    method: { type: String, trim: true },
    reference: { type: String, trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);