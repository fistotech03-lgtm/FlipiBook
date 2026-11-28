const mongoose = require('mongoose');
const User = require('../../../../shared/models/User');
const Profile = require('../../../../shared/models/Profile');
const Flipbook = require('../../../../shared/models/Flipbook');
const backupService = require('../../../../shared/backupService');

/**
 * 1. List All Users (with Search, Filtering, Pagination)
 * GET /api/admin/users
 */
const listUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = 'all',
      status = 'all',
      sort = 'newest'
    } = req.query;

    const filter = {
      role: { $nin: ['admin', 'superadmin', 'Super Admin'] },
      userID: { $nin: ['Admin', 'admin'], $not: /^FLIP_AD/i }
    };

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { emailId: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { userID: { $regex: q, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    if (sort === 'oldest') {
      sortOptions.createdAt = 1;
    } else if (sort === 'name') {
      sortOptions.name = 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .select('-password')
        .lean(),
      User.countDocuments(filter)
    ]);

    // Attach profile and flipbook count for each user safely
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        let profile = null;
        let bookCount = 0;

        try {
          const profileOrConditions = [
            ...(u.userID ? [{ userID: String(u.userID) }] : []),
            ...(u.emailId ? [{ emailId: String(u.emailId).toLowerCase().trim() }] : []),
            ...(u.email ? [{ emailId: String(u.email).toLowerCase().trim() }] : [])
          ];

          if (profileOrConditions.length > 0) {
            profile = await Profile.findOne({ $or: profileOrConditions }).lean();
          }
        } catch (err) {
          console.warn(`[AdminUserController] Could not fetch profile for user ${u._id}:`, err.message);
        }

        try {
          const bookOrConditions = [
            { userObjectID: u._id },
            ...(u.userID ? [{ userID: String(u.userID) }] : []),
            ...(u.emailId ? [{ userEmail: String(u.emailId) }] : [])
          ];

          bookCount = await Flipbook.countDocuments({ $or: bookOrConditions });
        } catch (err) {
          console.warn(`[AdminUserController] Could not count flipbooks for user ${u._id}:`, err.message);
        }

        const resolvedAccountType = profile?.accountType || profile?.profileType || u.accountType || u.profileType || 'Individual';

        return {
          ...u,
          displayName: profile?.displayName || u.displayName || u.name || 'User',
          accountType: resolvedAccountType,
          profileType: resolvedAccountType,
          picture: profile?.picture || u.picture || null,
          avatarBgColor: profile?.avatarBgColor || u.avatarBgColor || '#E8D4C8',
          plan: u.plan || 'Free',
          status: u.status || 'Active',
          booksCount: bookCount,
          profile: profile || null
        };
      })
    );

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      users: usersWithCounts
    });
  } catch (error) {
    console.error('[AdminUserController - listUsers] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

/**
 * 2. Get Single User Details
 * GET /api/admin/users/:id
 */
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    let user = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findById(id).select('-password').lean();
    }

    if (!user) {
      user = await User.findOne({
        $or: [
          { userID: id },
          { emailId: id.toLowerCase().trim() }
        ]
      }).select('-password').lean();
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let flipbooks = [];
    let profile = null;

    try {
      const bookOrConditions = [
        { userObjectID: user._id },
        ...(user.userID ? [{ userID: String(user.userID) }] : []),
        ...(user.emailId ? [{ userEmail: String(user.emailId) }] : [])
      ];
      flipbooks = await Flipbook.find({ $or: bookOrConditions }).sort({ createdAt: -1 }).lean();
    } catch (err) {
      console.warn(`[AdminUserController] Could not fetch flipbooks for user ${user._id}:`, err.message);
    }

    try {
      const profileOrConditions = [
        ...(user.userID ? [{ userID: String(user.userID) }] : []),
        ...(user.emailId ? [{ emailId: String(user.emailId).toLowerCase().trim() }] : []),
        ...(user.email ? [{ emailId: String(user.email).toLowerCase().trim() }] : [])
      ];
      if (profileOrConditions.length > 0) {
        profile = await Profile.findOne({ $or: profileOrConditions }).lean();
      }
    } catch (err) {
      console.warn(`[AdminUserController] Could not fetch profile for user ${user._id}:`, err.message);
    }

    const resolvedAccountType = profile?.accountType || profile?.profileType || user.accountType || user.profileType || 'Individual';

    res.json({
      success: true,
      user: {
        ...user,
        displayName: profile?.displayName || user.displayName || user.name || 'User',
        accountType: resolvedAccountType,
        profileType: resolvedAccountType,
        picture: profile?.picture || user.picture || null,
        avatarBgColor: profile?.avatarBgColor || user.avatarBgColor || '#E8D4C8',
        plan: user.plan || 'Free',
        status: user.status || 'Active'
      },
      profile: profile || null,
      flipbooks,
      totalBooks: flipbooks.length
    });
  } catch (error) {
    console.error('[AdminUserController - getUserDetails] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: error.message });
  }
};

/**
 * 3. Update User Role (Admin / Moderator / User)
 * PATCH /api/admin/users/:id/role
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['user', 'admin', 'moderator', 'staff'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role: ${role}` });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role, isAdmin: role === 'admin' } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User role successfully updated to ${role}`,
      user
    });
  } catch (error) {
    console.error('[AdminUserController - updateUserRole] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role', error: error.message });
  }
};

/**
 * 4. Update User Account Status (Active, Suspended, Banned)
 * PATCH /api/admin/users/:id/status
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason = '' } = req.body;

    const allowedStatuses = ['active', 'suspended', 'banned'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          isActive: status === 'active'
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User status set to ${status}`,
      user
    });
  } catch (error) {
    console.error('[AdminUserController - updateUserStatus] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status', error: error.message });
  }
};

/**
 * 5. Delete User Account
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or already deleted' });
    }

    // Record user deletion in backup database
    backupService.recordUserDeletion(user, {
      req,
      user: req.admin,
      reason: 'ADMIN_DELETE'
    });

    res.json({
      success: true,
      message: `User ${user.emailId} permanently removed from platform`,
      id
    });
  } catch (error) {
    console.error('[AdminUserController - deleteUser] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

module.exports = {
  listUsers,
  getUserDetails,
  updateUserRole,
  updateUserStatus,
  deleteUser
};
