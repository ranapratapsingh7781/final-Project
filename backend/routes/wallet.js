const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const UpcomingPayment = require('../models/UpcomingPayment');

const router = express.Router();

/**
 * Helper to validate and parse amount values
 * Returns null if amount is invalid
 */
const toAmount = (value) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Helper to validate sufficient funds
 */
const validateBalance = (userBalance, requiredAmount) => {
  return userBalance >= requiredAmount;
};

// ===== GET ENDPOINTS =====

/**
 * GET /balance - Get current wallet balance
 * Protected route - requires authentication
 */
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });
    res.json({ balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * GET /transactions - Get all transactions for logged-in user
 * Protected route - requires authentication
 */
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * GET /upcoming-payments - Get upcoming payments for logged-in user
 * Protected route - requires authentication
 */
router.get('/upcoming-payments', auth, async (req, res) => {
  try {
    const upcomingPayments = await UpcomingPayment.find({ user: req.user.id }).sort({ due: 1 });
    res.json(upcomingPayments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// ===== POST ENDPOINTS =====

/**
 * POST /add - Add funds (deposit) to wallet
 * Request: { amount, description }
 */
router.post('/add', auth, async (req, res) => {
  const amount = toAmount(req.body.amount);
  const description = (req.body.description || 'Wallet top-up').trim();

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: 'Please enter a valid amount.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      user: user.id,
      type: 'deposit',
      category: 'deposit',
      amount,
      description,
      status: 'completed',
    });
    await transaction.save();

    res.json({ balance: user.balance, transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * POST /withdraw - Withdraw funds from wallet
 * Request: { amount, description }
 */
router.post('/withdraw', auth, async (req, res) => {
  const amount = toAmount(req.body.amount);
  const description = (req.body.description || 'Wallet withdrawal').trim();

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: 'Please enter a valid amount.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });
    if (!validateBalance(user.balance, amount)) {
      return res.status(400).json({ msg: 'Insufficient balance.' });
    }

    user.balance -= amount;
    await user.save();

    const transaction = new Transaction({
      user: user.id,
      type: 'withdraw',
      category: 'withdraw',
      amount,
      description,
      status: 'completed',
    });
    await transaction.save();

    res.json({ balance: user.balance, transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * POST /transfer - Transfer funds to another user
 * Request: { recipient (email), amount, description }
 */
router.post('/transfer', auth, async (req, res) => {
  const recipientEmail = (req.body.recipient || '').trim().toLowerCase();
  const amount = toAmount(req.body.amount);
  const description = (req.body.description || '').trim();

  if (!recipientEmail || !amount || amount <= 0) {
    return res.status(400).json({ msg: 'Recipient email and valid amount are required.' });
  }

  try {
    const sender = await User.findById(req.user.id);
    if (!sender) return res.status(404).json({ msg: 'User not found.' });
    if (sender.email === recipientEmail) {
      return res.status(400).json({ msg: 'Cannot transfer to your own account.' });
    }
    if (!validateBalance(sender.balance, amount)) {
      return res.status(400).json({ msg: 'Insufficient balance.' });
    }

    const receiver = await User.findOne({ email: recipientEmail });
    if (!receiver) return res.status(404).json({ msg: 'Recipient not found.' });

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    const senderTx = new Transaction({
      user: sender.id,
      type: 'transfer',
      category: 'transfer',
      amount,
      description: description || `Transfer to ${receiver.email}`,
      recipient: receiver.email,
      status: 'completed',
    });

    const receiverTx = new Transaction({
      user: receiver.id,
      type: 'transfer',
      category: 'transfer',
      amount,
      description: description || `Received from ${sender.email}`,
      recipient: sender.email,
      status: 'completed',
    });

    await senderTx.save();
    await receiverTx.save();

    res.json({ balance: sender.balance, transaction: senderTx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * POST /pay-bill - Pay a bill (electricity, water, internet, mobile, gas)
 * Request: { biller, amount, description }
 */
router.post('/pay-bill', auth, async (req, res) => {
  const { biller } = req.body;
  const amount = toAmount(req.body.amount);
  const description = (req.body.description || '').trim();

  if (!biller || !amount || amount <= 0) {
    return res.status(400).json({ msg: 'Biller and valid amount are required.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });
    if (!validateBalance(user.balance, amount)) {
      return res.status(400).json({ msg: 'Insufficient balance.' });
    }

    user.balance -= amount;
    await user.save();

    const transaction = new Transaction({
      user: user.id,
      type: 'bill_payment',
      category: 'bill_payment',
      amount,
      description: description || `${biller} Bill Payment`,
      status: 'completed',
    });
    await transaction.save();

    res.json({ balance: user.balance, transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * POST /issue-demand - Issue a payment demand to someone
 * Request: { recipient (email), amount, description }
 */
router.post('/issue-demand', auth, async (req, res) => {
  const { recipient } = req.body;
  const amount = toAmount(req.body.amount);
  const description = (req.body.description || '').trim();

  if (!recipient || !amount || amount <= 0) {
    return res.status(400).json({ msg: 'Recipient and valid amount are required.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    const transaction = new Transaction({
      user: user.id,
      type: 'demand',
      category: 'demand',
      amount,
      description: description || `Demand to ${recipient}`,
      recipient,
      status: 'pending',
    });
    await transaction.save();

    res.json({ msg: 'Demand issued successfully.', transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * POST /request-money - Request money from someone
 * Request: { requester (email), amount, description }
 */
router.post('/request-money', auth, async (req, res) => {
  const { requester } = req.body;
  const amount = toAmount(req.body.amount);
  const description = (req.body.description || '').trim();

  if (!requester || !amount || amount <= 0) {
    return res.status(400).json({ msg: 'Requester and valid amount are required.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    const transaction = new Transaction({
      user: user.id,
      type: 'request',
      category: 'request',
      amount,
      description: description || `Money request from ${requester}`,
      recipient: requester,
      status: 'pending',
    });
    await transaction.save();

    res.json({ msg: 'Money request sent successfully.', transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * POST /add-upcoming-payment - Add an upcoming payment
 * Request: { title, amount, due, biller, description }
 */
router.post('/add-upcoming-payment', auth, async (req, res) => {
  const { title, amount, due, biller, description } = req.body;
  const parsedAmount = toAmount(amount);

  if (!title || !parsedAmount || parsedAmount <= 0 || !due) {
    return res.status(400).json({ msg: 'Title, valid amount, and due date are required.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    const upcomingPayment = new UpcomingPayment({
      user: user.id,
      title,
      amount: parsedAmount,
      due: new Date(due),
      biller,
      description,
    });
    await upcomingPayment.save();

    res.json({ msg: 'Upcoming payment added successfully.', upcomingPayment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * PUT /update-upcoming-payment/:id - Update an upcoming payment
 * Request: { title, amount, due, biller, description }
 */
router.put('/update-upcoming-payment/:id', auth, async (req, res) => {
  const { title, amount, due, biller, description } = req.body;
  const parsedAmount = toAmount(amount);

  if (!title || !parsedAmount || parsedAmount <= 0 || !due) {
    return res.status(400).json({ msg: 'Title, valid amount, and due date are required.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    const upcomingPayment = await UpcomingPayment.findOne({ _id: req.params.id, user: user.id });
    if (!upcomingPayment) return res.status(404).json({ msg: 'Upcoming payment not found.' });

    upcomingPayment.title = title;
    upcomingPayment.amount = parsedAmount;
    upcomingPayment.due = new Date(due);
    upcomingPayment.biller = biller;
    upcomingPayment.description = description;
    await upcomingPayment.save();

    res.json({ msg: 'Upcoming payment updated successfully.', upcomingPayment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * DELETE /delete-upcoming-payment/:id - Delete an upcoming payment
 */
router.delete('/delete-upcoming-payment/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    const upcomingPayment = await UpcomingPayment.findOneAndDelete({ _id: req.params.id, user: user.id });
    if (!upcomingPayment) return res.status(404).json({ msg: 'Upcoming payment not found.' });

    res.json({ msg: 'Upcoming payment deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

module.exports = router;