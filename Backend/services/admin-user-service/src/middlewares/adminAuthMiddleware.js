const User = require('../../../../shared/models/User');
const AdminUser = require('../models/AdminUser');
const { verifyToken } = require('../utils/jwtHelper');
const { verifyAdminSessionToken } = require('../utils/adminSessionHelper');

/**
 * Middleware: Verify Admin Access
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    // Check for HS256 admin session token in HttpOnly cookies
    const adminSessionToken = req.cookies?.adminSessionToken;
    const adminSessionDecoded = verifyAdminSessionToken(adminSessionToken);

    let decoded = verifyToken(token) || adminSessionDecoded;
    let email = decoded?.emailId || decoded?.email;

    // Header fallback (from API gateway or admin-frontend)
    if (!email) {
      email = req.headers['x-user-email'] || req.headers['x-admin-email'] || req.query?.adminEmail;
    }

    if (!email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required: Admin credentials missing.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({
      $or: [{ emailId: cleanEmail }, { email: cleanEmail }]
    });

    const adminStaff = await AdminUser.findOne({
      $or: [{ email: cleanEmail }, { userId: decoded?.userId || email }]
    });

    if (!user && !adminStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin user not found.'
      });
    }

    if (user && user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'staff' && !user.isAdmin && !adminStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Administrator privileges required.'
      });
    }

    req.admin = {
      id: user?._id || adminStaff?._id,
      userID: user?.userID || adminStaff?.userId,
      emailId: user?.emailId || adminStaff?.email || cleanEmail,
      name: user?.name || adminStaff?.name || 'Administrator',
      role: adminStaff?.designation || user?.role || 'admin',
      sessionId: adminSessionDecoded?.sessionId || decoded?.sessionId || ''
    };

    next();
  } catch (error) {
    console.error('[AdminAuthMiddleware] Error:', error);
    res.status(500).json({ success: false, message: 'Internal authorization error', error: error.message });
  }
};

module.exports = {
  verifyAdmin
};
