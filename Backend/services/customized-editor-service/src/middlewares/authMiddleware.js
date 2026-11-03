const { verifyToken } = require('../utils/jwtHelper');
const { resolveAuthUser } = require('../utils/userHelper');

/**
 * Middleware to authenticate requests via HttpOnly cookie or Bearer token
 * (Identical to myflipibook-service)
 */
const authenticateUser = async (req, res, next) => {
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
    try {
      await resolveAuthUser(req);
    } catch (_) {}
    return next();
  }

  // Graceful fallback if client browser sends emailId or userEmail or userID
  const fallbackEmail = (
    req.query?.emailId ||
    req.body?.emailId ||
    req.query?.userEmail ||
    req.body?.userEmail ||
    ''
  ).trim().toLowerCase();
  const fallbackUserID = (req.query?.userID || req.body?.userID || '').trim();
  if (fallbackEmail || fallbackUserID) {
    req.user = { emailId: fallbackEmail, email: fallbackEmail, userID: fallbackUserID };
    try {
      await resolveAuthUser(req);
    } catch (_) {}
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please sign in to access Customized Editor.'
  });
};

/**
 * Optional authentication: attaches req.user if valid token present, otherwise proceeds
 */
const optionalAuth = async (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  const decoded = verifyToken(token);
  if (decoded && (decoded.userId || decoded.id || decoded.emailId)) {
    req.user = decoded;
    try {
      await resolveAuthUser(req);
    } catch (_) {}
  } else {
    const fallbackEmail = (
      req.query?.emailId ||
      req.body?.emailId ||
      req.query?.userEmail ||
      req.body?.userEmail ||
      ''
    ).trim().toLowerCase();
    const fallbackUserID = (req.query?.userID || req.body?.userID || '').trim();
    if (fallbackEmail || fallbackUserID) {
      req.user = { emailId: fallbackEmail, email: fallbackEmail, userID: fallbackUserID };
      try {
        await resolveAuthUser(req);
      } catch (_) {}
    }
  }
  next();
};

module.exports = {
  authenticateUser,
  optionalAuth
};
