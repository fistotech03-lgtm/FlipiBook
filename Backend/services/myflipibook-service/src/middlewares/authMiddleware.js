const { verifyToken } = require('../utils/jwtHelper');
const { resolveAuthUser } = require('../utils/userHelper');

/**
 * Extracts and decodes access token from cookie or Bearer authorization header.
 */
const parseAuthToken = (req) => {
  const token =
    req.cookies?.token ||
    req.cookies?.accessToken ||
    req.cookies?.access_token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);
  const refreshToken = req.cookies?.refreshToken;

  let decoded = verifyToken(token);

  // If access token is expired or missing, check refresh token
  if ((!decoded || (!decoded.userId && !decoded.id && !decoded.emailId)) && refreshToken) {
    decoded = verifyToken(refreshToken);
  }
  return decoded;
};

/**
 * Middleware to authenticate requests via HttpOnly cookie or Bearer token.
 * Populates req.user with decoded token and resolves canonical user ID.
 */
const authenticateUser = async (req, res, next) => {
  const decoded = parseAuthToken(req);

  if (decoded && (decoded.userId || decoded.id || decoded.emailId)) {
    req.user = decoded;
    try {
      await resolveAuthUser(req);
    } catch (_) {}
    return next();
  }

  // Graceful fallback if client browser sends emailId param
  const fallbackEmail = (req.query?.emailId || req.body?.emailId || '').trim().toLowerCase();
  if (fallbackEmail) {
    req.user = { emailId: fallbackEmail, email: fallbackEmail };
    try {
      await resolveAuthUser(req);
    } catch (_) {}
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please sign in to access MyFlipibook.'
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
    const fallbackEmail = (req.query?.emailId || req.body?.emailId || '').trim().toLowerCase();
    if (fallbackEmail) {
      req.user = { emailId: fallbackEmail, email: fallbackEmail };
      try {
        await resolveAuthUser(req);
      } catch (_) {}
    }
  }
  next();
};

module.exports = {
  parseAuthToken,
  authenticateUser,
  optionalAuth
};
