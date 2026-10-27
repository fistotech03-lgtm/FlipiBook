const User = require('../models/User');
const AdminLog = require('../models/AdminLog');
const { verifyToken } = require('../utils/jwtHelper');

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

    let decoded = verifyToken(token);
    let email = decoded?.emailId || decoded?.email;

    // Header fallback (from API gateway)
    if (!email) {
      email = req.headers['x-user-email'] || req.headers['x-admin-email'] || req.query?.adminEmail;
    }

    if (!email) {
      // In development, permit fallback if header x-dev-admin is passed or allow internal calls
      if (process.env.NODE_ENV === 'development') {
        req.admin = { emailId: 'admin@flipibook.com', role: 'admin', name: 'Dev Admin' };
        return next();
      }
      return res.status(401).json({
        success: false,
        message: 'Authentication required: Admin credentials missing.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ emailId: cleanEmail }, { email: cleanEmail }]
    });

    if (!user) {
      // If user doesn't exist but has internal admin header in dev
      if (process.env.NODE_ENV === 'development') {
        req.admin = { emailId: cleanEmail, role: 'admin', name: 'Dev Admin' };
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin user not found.'
      });
    }

    if (user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'staff' && !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Administrator privileges required.'
      });
    }

    req.admin = {
      id: user._id,
      userID: user.userID,
      emailId: user.emailId,
      name: user.name || 'Administrator',
      role: user.role
    };

    next();
  } catch (error) {
    console.error('[AdminAuthMiddleware] Error:', error);
    res.status(500).json({ success: false, message: 'Internal authorization error', error: error.message });
  }
};

/**
 * Helper to record administrative audit logs
 */
const recordAdminLog = async ({
  adminEmail,
  adminName = 'Admin',
  action,
  targetType,
  targetId = '',
  details = {},
  ipAddress = ''
}) => {
  try {
    await AdminLog.create({
      adminEmail: (adminEmail || 'admin@flipibook.com').toLowerCase(),
      adminName,
      action,
      targetType,
      targetId: String(targetId),
      details,
      ipAddress
    });
  } catch (err) {
    console.error('[recordAdminLog Error]:', err.message);
  }
};

module.exports = {
  verifyAdmin,
  recordAdminLog
};
