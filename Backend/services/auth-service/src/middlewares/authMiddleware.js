const User = require('../../../../shared/models/User');
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
  try {
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

    // Allow authentication if any canonical identifier is present
    if (!decoded || (!decoded.userId && !decoded.id && !decoded.emailId)) {
      // Gateway internal header fallback
      const headerEmail = req.headers['x-user-email'] || req.headers['x-client-email'];
      if (headerEmail) {
        decoded = { emailId: headerEmail.trim().toLowerCase() };
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please sign in.'
        });
      }
    }

    // Fast in-memory check for remote session revocation
    if (decoded.sessionId && (await isSessionRevokedInRedis(decoded.sessionId))) {
      return res.status(401).json({
        success: false,
        message: 'Session has been revoked or logged out. Please sign in again.'
      });
    }

    // Ensure userId and emailId are populated on req.user for downstream consistency
    if (!decoded.userId || !decoded.emailId) {
      try {
        const rawId = decoded.id || decoded._id;
        let dbUser = null;
        if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
          dbUser = await User.findById(rawId).select('_id userID emailId');
        } else if (decoded.emailId) {
          dbUser = await User.findOne({ emailId: decoded.emailId.toLowerCase() }).select('_id userID emailId');
        }
        if (dbUser) {
          decoded.userId = decoded.userId || dbUser.userID || `FLIPI${String(dbUser._id).slice(-4).toUpperCase()}`;
          decoded.emailId = decoded.emailId || dbUser.emailId;
          decoded.id = decoded.id || dbUser._id;
        }
      } catch (_) {}
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication error in authMiddleware: ' + err.message,
      error: err.message,
      stack: err.stack,
    });
  }
};

module.exports = { authenticateUser };
