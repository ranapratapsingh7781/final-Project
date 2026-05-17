const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

/**
 * Authentication Middleware
 * Verifies JWT token from request headers and attaches user data to req.user
 * Supports two token header formats:
 * 1. x-auth-token header
 * 2. Authorization: Bearer <token> header
 */
module.exports = function (req, res, next) {
  // Try to get token from x-auth-token header or Authorization header
  const token = 
    req.header('x-auth-token') || 
    (req.header('Authorization') || '').split(' ')[1];

  // Return 401 if no token provided
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied.' });
  }

  try {
    // Verify token and extract user data
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ msg: 'Token is not valid.' });
  }
};