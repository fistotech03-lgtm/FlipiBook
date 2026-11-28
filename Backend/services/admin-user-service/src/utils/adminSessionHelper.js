const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.JWT_SECRET ||
  'flipibook_admin_hs256_secure_key_2026';

/**
 * Generate a unique Admin Session ID combining userId and randomHex
 * e.g., "sess_ADM001_a7f92b4c10e394b2"
 *
 * @param {string} userId - User ID or identifier
 * @returns {string} Formatted sessionId
 */
const generateAdminSessionId = (userId = '') => {
  const cleanUserId = String(userId || 'admin')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '');
  const randomHex = crypto.randomBytes(8).toString('hex'); // 16 hex chars collision-proof

  return `sess_${cleanUserId || 'admin'}_${randomHex}`;
};

/**
 * Sign Admin Session Token strictly using HS256 algorithm
 * @param {Object} payload - { sessionId, userId, email, role, isAdmin }
 * @param {string} expiresIn - Token expiry (default '7d')
 * @returns {string} Signed JWT
 */
const signAdminSessionToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, ADMIN_JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn
  });
};

/**
 * Verify Admin Session Token strictly using HS256 algorithm
 * @param {string} token - JWT from req.cookies.adminSessionToken
 * @returns {Object|null} Decoded payload or null
 */
const verifyAdminSessionToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateAdminSessionId,
  signAdminSessionToken,
  verifyAdminSessionToken,
  ADMIN_JWT_SECRET
};
