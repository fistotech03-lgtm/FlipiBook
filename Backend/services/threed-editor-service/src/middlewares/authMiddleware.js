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
  if ((!decoded || (!decoded.userId && !decoded.id && !decoded.emailId)) && refreshToken) {
    decoded = verifyToken(refreshToken);
  }

  if (decoded && (decoded.userId || decoded.id || decoded.emailId)) {
    req.user = decoded;
    return next();
  }

  // Graceful fallback if client sends emailId or userEmail or userID
  const fallbackEmail = (
    req.query?.emailId ||
    req.body?.emailId ||
    req.query?.email ||
    req.body?.email ||
    req.query?.userEmail ||
    req.body?.userEmail ||
    ''
  ).trim().toLowerCase();

  const fallbackUserID = (req.query?.userID || req.body?.userID || '').trim();

  if (fallbackEmail || fallbackUserID) {
    req.user = { emailId: fallbackEmail, email: fallbackEmail, userID: fallbackUserID };
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please sign in to access 3D Editor.'
  });
};

/**
 * Optional authentication: attaches req.user if valid token/fallback present, otherwise proceeds
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
    const fallbackEmail = (
      req.query?.emailId ||
      req.body?.emailId ||
      req.query?.email ||
      req.body?.email ||
      req.query?.userEmail ||
      req.body?.userEmail ||
      ''
    ).trim().toLowerCase();
    const fallbackUserID = (req.query?.userID || req.body?.userID || '').trim();
    if (fallbackEmail || fallbackUserID) {
      req.user = { emailId: fallbackEmail, email: fallbackEmail, userID: fallbackUserID };
    }
  }
  next();
};

module.exports = {
  authenticateUser,
  optionalAuth
};
