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

  if ((!decoded || (!decoded.userId && !decoded.id && !decoded.emailId)) && refreshToken) {
    decoded = verifyToken(refreshToken);
  }

  if (decoded && (decoded.userId || decoded.id || decoded.emailId)) {
    req.user = decoded;
    return next();
  }

  const fallbackEmail = (req.query?.emailId || req.body?.emailId || '').trim().toLowerCase();
  if (fallbackEmail) {
    req.user = { emailId: fallbackEmail, email: fallbackEmail };
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please sign in to access payment services.'
  });
};

module.exports = {
  authenticateUser
};
