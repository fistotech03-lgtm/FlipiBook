const { verifyToken } = require('../utils/jwtHelper');

/**
 * Middleware to authenticate requests via HttpOnly cookie or Bearer token
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
  if ((!decoded || !decoded.userId) && refreshToken) {
    decoded = verifyToken(refreshToken);
  }

  if (!decoded || !decoded.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to edit pages.'
    });
  }

  req.user = decoded;
  next();
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
  if (decoded && decoded.userId) {
    req.user = decoded;
  }
  next();
};

module.exports = {
  authenticateUser,
  optionalAuth
};
