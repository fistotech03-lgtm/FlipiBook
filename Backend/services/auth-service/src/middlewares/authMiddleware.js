const { verifyToken } = require('../utils/jwtHelper');
const { getRedis, isAvailable } = require('../../../../shared/redisClient');

/**
 * Check if a session has been blacklisted / revoked in Redis
 */
const isSessionRevokedInRedis = async (sessionId) => {
  const redis = getRedis();
  if (!isAvailable() || !redis || !sessionId) return false;
  try {
    const val = await redis.get(`revoked:session:${sessionId}`);
    return val === '1';
  } catch (_) {
    return false;
  }
};

/**
 * Middleware to authenticate requests via HttpOnly cookie or Bearer token
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
  if ((!decoded || !decoded.userId) && refreshToken) {
    decoded = verifyToken(refreshToken);
  }

  if (!decoded || !decoded.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.'
    });
  }

  // Fast in-memory check for remote session revocation
  if (decoded.sessionId && (await isSessionRevokedInRedis(decoded.sessionId))) {
    return res.status(401).json({
      success: false,
      message: 'Session has been revoked or logged out. Please sign in again.'
    });
  }

  req.user = decoded;
  next();
};

module.exports = { authenticateUser };
