const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

/**
 * Create JWT token for user
 * Token expires in 12 hours
 */
const createToken = (userId) => 
  jwt.sign({ user: { id: userId } }, JWT_SECRET, { expiresIn: '12h' });

/**
 * POST /register - Register a new user
 * Request: { name, email, password }
 */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please provide name, email, and password.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) return res.status(400).json({ msg: 'User already exists.' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });
    await user.save();

    // Generate token and return user data
    const token = createToken(user.id);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * POST /login - Login existing user
 * Request: { email, password }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials.' });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

    // Generate token and return user data
    const token = createToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

/**
 * GET /me - Get current user profile
 * Protected route - requires authentication
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

module.exports = router;