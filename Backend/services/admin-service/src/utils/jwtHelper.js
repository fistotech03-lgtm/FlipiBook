const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'flipibook_secret_key_production_2026';

const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

module.exports = {
  verifyToken,
  generateToken,
  JWT_SECRET
};
