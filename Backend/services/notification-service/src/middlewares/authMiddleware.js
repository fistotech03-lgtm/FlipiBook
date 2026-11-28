const { verifyToken } = require('../../../app-service/src/utils/jwtHelper');

/**
 * Optional authentication: attaches req.user if valid token or gateway email header is present.
 */
const optionalAuth = (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.cookies?.accessToken ||
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

  const headerEmail = req.headers['x-user-email'] || req.headers['x-client-email'];
  if (headerEmail) {
    req.user = { emailId: headerEmail.trim().toLowerCase() };
  }
  next();
};

module.exports = { optionalAuth };
