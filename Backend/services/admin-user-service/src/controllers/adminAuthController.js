const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { AdminUser } = require('../models');
const AdminLog = require('../models/AdminLog');
const {
  generateAdminSessionId,
  signAdminSessionToken,
  verifyAdminSessionToken
} = require('../utils/adminSessionHelper');

/**
 * Format AdminUser.Access array into front-end permissions list
 * e.g. [{ "Dashboard": 1 }, { "3D Editor Assets": 0 }] ->
 * [{ id: 'dashboard', name: 'Dashboard', enabled: true }, ...]
 */
const formatAccessToPermissions = (accessList) => {
  const defaultModules = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'threed_editor_assets', name: '3D Editor Assets' },
    { id: 'user_management', name: 'User Management' },
    { id: 'template_management', name: 'Template Management' },
    { id: 'management_role_access', name: 'Management - Role Access' },
    { id: 'management_user', name: 'Management - User' }
  ];

  if (!Array.isArray(accessList) || accessList.length === 0) {
    return defaultModules.map((m) => ({ ...m, enabled: false }));
  }

  // Flatten array of objects [{ "Dashboard": 1 }, ...] into a lookup map
  const accessMap = {};
  accessList.forEach((item) => {
    if (item && typeof item === 'object') {
      Object.entries(item).forEach(([key, val]) => {
        accessMap[key.toLowerCase().trim()] = Number(val) === 1;
      });
    }
  });

  return defaultModules.map((m) => {
    const isEnabled =
      Boolean(accessMap[m.name.toLowerCase().trim()]) ||
      Boolean(accessMap[m.id.toLowerCase().trim()]);
    return {
      ...m,
      enabled: isEnabled
    };
  });
};

/**
 * POST /api/admin/auth/login
 * Standalone Admin / Staff Authentication
 */
const adminLogin = async (req, res) => {
  try {
    const { userId, email, emailId, password } = req.body;
    const identifier = String(userId || email || emailId || '').trim();
    const cleanPassword = String(password || '').trim();

    if (!identifier || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID / Email and Password are required.'
      });
    }

    const lowerId = identifier.toLowerCase();
    const user = await AdminUser.findOne({
      $or: [
        { userId: identifier.toUpperCase() },
        { userId: identifier },
        { email: lowerId },
        { name: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'This account does not exist. Please check your credentials.'
      });
    }

    if (user.status && user.status.toLowerCase() !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your admin account is inactive or suspended. Please contact Super Admin.'
      });
    }

    // Compare password (plain text or bcrypt hash)
    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(cleanPassword);
    } else if (user.password === cleanPassword) {
      isMatch = true;
    } else if (user.password && user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(cleanPassword, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid User ID or Password.'
      });
    }

    // Determine if Super Admin
    const isSuper =
      String(user.userId || '').toUpperCase() === 'FLIP_ADMIN01' ||
      String(user.email || '').toLowerCase() === 'adminflipibook2026@gmail.com';

    // Format permissions
    const permissions = isSuper
      ? [
          { id: 'dashboard', name: 'Dashboard', enabled: true },
          { id: 'threed_editor_assets', name: '3D Editor Assets', enabled: true },
          { id: 'user_management', name: 'User Management', enabled: true },
          { id: 'template_management', name: 'Template Management', enabled: true },
          { id: 'management_role_access', name: 'Management - Role Access', enabled: true },
          { id: 'management_user', name: 'Management - User', enabled: true }
        ]
      : formatAccessToPermissions(user.Access);

    const sessionId = generateAdminSessionId(user.userId);
    const token = signAdminSessionToken({
      sessionId,
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: isSuper ? 'Super Admin' : (user.designation || 'Staff'),
      isSuperAdmin: isSuper
    });

    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    };

    res.cookie('token', token, cookieOptions);
    res.cookie('adminSessionToken', token, cookieOptions);

    // Record session into AdminLog collection
    try {
      const rawUa = req.headers['user-agent'] || '';
      const ua = rawUa.toLowerCase();
      let operatingSystem = 'Unknown OS';
      if (/windows nt 10\.0/.test(ua)) operatingSystem = 'Windows 11/10';
      else if (/windows/.test(ua)) operatingSystem = 'Windows';
      else if (/macintosh|mac os x/.test(ua)) operatingSystem = 'macOS';
      else if (/android/.test(ua)) operatingSystem = 'Android';
      else if (/linux/.test(ua)) operatingSystem = 'Linux';

      let browser = 'Unknown Browser';
      if (/edg\//.test(ua)) browser = 'Edge';
      else if (/chrome|crios/.test(ua)) browser = 'Chrome';
      else if (/firefox|fxios/.test(ua)) browser = 'Firefox';
      else if (/safari/.test(ua)) browser = 'Safari';

      let deviceType = 'desktop';
      if (/mobile|iphone|ipod|android.*mobile/.test(ua)) deviceType = 'mobile';
      else if (/ipad|tablet/.test(ua)) deviceType = 'tablet';

      const ipAddress =
        req.headers['cf-connecting-ip'] ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.ip ||
        req.socket?.remoteAddress ||
        '127.0.0.1';

      const deviceId =
        req.body?.deviceId ||
        req.headers['x-device-id'] ||
        `dev_${crypto.randomBytes(8).toString('hex')}`;

      // Invalidate any older active sessions for this device and user
      await AdminLog.updateMany(
        {
          $or: [{ userId: user.userId }, { userObjectId: user._id }],
          deviceId,
          status: 'ACTIVE'
        },
        {
          $set: {
            status: 'LOGGED_OUT',
            logoutTime: new Date()
          }
        }
      ).catch(() => {});

      await AdminLog.create({
        sessionId,
        userId: user.userId || 'Admin',
        userObjectId: user._id,
        deviceId,
        ipAddress,
        userAgent: rawUa,
        browser,
        operatingSystem,
        deviceType,
        location: req.headers['cf-ipcountry'] ? `Country: ${req.headers['cf-ipcountry']}` : 'Local Network',
        loginTime: new Date(),
        lastActiveTime: new Date(),
        status: 'ACTIVE',
        isRevoked: false,
        eventType: 'SUCCESSFUL_LOGIN'
      });
    } catch (logErr) {
      console.warn('[AdminLog Creation Warning]:', logErr.message);
    }

    const adminData = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      emailId: user.email,
      designation: user.designation || (isSuper ? 'Super Admin' : 'Staff'),
      role: isSuper ? 'Super Admin' : (user.designation || 'Staff'),
      roleId: user.roleId || '',
      isSuperAdmin: isSuper,
      status: user.status,
      permissions,
      Access: user.Access
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: adminData
    });
  } catch (error) {
    console.error('[Admin Auth Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

/**
 * POST /api/admin/auth/logout
 */
const adminLogout = async (req, res) => {
  try {
    const token = req.cookies?.adminSessionToken || req.cookies?.token;
    if (token) {
      const decoded = verifyAdminSessionToken(token);
      if (decoded && decoded.sessionId) {
        await AdminLog.updateMany(
          { sessionId: decoded.sessionId, status: 'ACTIVE' },
          { $set: { status: 'LOGGED_OUT', logoutTime: new Date() } }
        ).catch(() => {});
      }
    }

    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const cookieOpts = {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/'
    };
    res.clearCookie('token', cookieOpts);
    res.clearCookie('adminSessionToken', cookieOpts);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/auth/me
 */
const adminMe = async (req, res) => {
  try {
    const adminUser = req.admin;
    if (!adminUser) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const cleanId = String(adminUser.userID || adminUser.userId || adminUser.emailId || adminUser.email || '').trim();
    const userDoc = await AdminUser.findOne({
      $or: [
        { userId: cleanId.toUpperCase() },
        { userId: cleanId },
        { email: cleanId.toLowerCase() },
        { _id: adminUser.id }
      ]
    });

    const isSuper =
      Boolean(adminUser.isSuperAdmin) ||
      cleanId.toUpperCase() === 'FLIP_ADMIN01' ||
      String(adminUser.emailId || adminUser.email || '').toLowerCase() === 'adminflipibook2026@gmail.com';

    const permissions = isSuper
      ? [
          { id: 'dashboard', name: 'Dashboard', enabled: true },
          { id: 'threed_editor_assets', name: '3D Editor Assets', enabled: true },
          { id: 'user_management', name: 'User Management', enabled: true },
          { id: 'template_management', name: 'Template Management', enabled: true },
          { id: 'management_role_access', name: 'Management - Role Access', enabled: true },
          { id: 'management_user', name: 'Management - User', enabled: true }
        ]
      : formatAccessToPermissions(userDoc?.Access || []);

    const userPayload = {
      id: userDoc?._id || adminUser.id,
      userId: userDoc?.userId || adminUser.userID || adminUser.userId || cleanId,
      name: userDoc?.name || adminUser.name || 'Administrator',
      email: userDoc?.email || adminUser.emailId || adminUser.email || cleanId,
      emailId: userDoc?.email || adminUser.emailId || adminUser.email || cleanId,
      designation: userDoc?.designation || (isSuper ? 'Super Admin' : 'Staff'),
      role: isSuper ? 'Super Admin' : (userDoc?.designation || adminUser.role || 'Staff'),
      roleId: userDoc?.roleId || '',
      isSuperAdmin: isSuper,
      status: userDoc?.status || 'Active',
      permissions,
      Access: userDoc?.Access || []
    };

    return res.status(200).json({ success: true, user: userPayload });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  adminMe
};
