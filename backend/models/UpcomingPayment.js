const mongoose = require('mongoose');

const upcomingPaymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    due: { type: Date, required: true },
    biller: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UpcomingPayment', upcomingPaymentSchema);