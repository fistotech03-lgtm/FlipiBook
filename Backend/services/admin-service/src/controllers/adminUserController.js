const User = require('../models/User');
const Flipbook = require('../models/Flipbook');
const { recordAdminLog } = require('../middlewares/adminAuthMiddleware');

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

    const filter = {};

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

    // Attach flipbook count for each user
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const bookCount = await Flipbook.countDocuments({
          $or: [
            { userId: u._id },
            { userEmail: u.emailId },
            { userID: u.userID }
          ]
        });
        return {
          ...u,
          booksCount: bookCount
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
    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const flipbooks = await Flipbook.find({
      $or: [
        { userId: user._id },
        { userEmail: user.emailId },
        { userID: user.userID }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      user,
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

    await recordAdminLog({
      adminEmail: req.admin?.emailId || 'admin@flipibook.com',
      adminName: req.admin?.name || 'Administrator',
      action: 'UPDATE_USER_ROLE',
      targetType: 'user',
      targetId: id,
      details: { updatedRole: role, userEmail: user.emailId }
    });

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

    await recordAdminLog({
      adminEmail: req.admin?.emailId || 'admin@flipibook.com',
      adminName: req.admin?.name || 'Administrator',
      action: 'UPDATE_USER_STATUS',
      targetType: 'user',
      targetId: id,
      details: { status, reason, userEmail: user.emailId }
    });

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

    await recordAdminLog({
      adminEmail: req.admin?.emailId || 'admin@flipibook.com',
      adminName: req.admin?.name || 'Administrator',
      action: 'DELETE_USER',
      targetType: 'user',
      targetId: id,
      details: { deletedEmail: user.emailId, name: user.name }
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
