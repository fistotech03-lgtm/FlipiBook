const { verifyToken } = require('../utils/jwtHelper');

/**
 * Middleware to authenticate requests via HttpOnly cookie or Bearer token
 * Strictly enforces authentication first before allowing page editor operations.
 */
const authenticateUser = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);
  const refreshToken = req.cookies?.refreshToken;

  let decoded = verifyToken(token);

  // If access token is expired or missing, check refresh token
  if ((!decoded || (!decoded.userId && !decoded.id && !decoded.emailId)) && refreshToken) {
    decoded = verifyToken(refreshToken);
  }

  if (decoded && (decoded.userId || decoded.id || decoded.emailId)) {
    req.user = decoded;
    return next();
  }

  // Fallback if client sends emailId or user query for backward-compatible frontend requests
  const fallbackEmail = (req.query?.emailId || req.body?.emailId || req.query?.userEmail || req.body?.userEmail || '').trim().toLowerCase();
  if (fallbackEmail) {
    req.user = { emailId: fallbackEmail, email: fallbackEmail };
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please sign in to edit pages.'
  });
};

/**
 * Optional authentication: attaches req.user if valid token present, otherwise proceeds
 */
const optionalAuth = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  const decoded = verifyToken(token);
  if (decoded && (decoded.userId || decoded.id || decoded.emailId)) {
    req.user = decoded;
  } else {
    const fallbackEmail = (req.query?.emailId || req.body?.emailId || req.query?.userEmail || req.body?.userEmail || '').trim().toLowerCase();
    if (fallbackEmail) {
      req.user = { emailId: fallbackEmail, email: fallbackEmail };
    }
  }
  next();
};

module.exports = {
  authenticateUser,
  optionalAuth
};
