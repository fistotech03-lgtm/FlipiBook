const mongoose = require('mongoose');
const { AdminRole, AdminUser } = require('../models');

// Helper to convert permissions array [ { id, name, enabled } ]
// into user's requested Access format: [ { "dashboard": 1 }, { "user_management": 0 }, ... ]
const formatPermissionsToAccess = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  return permissions.map((p) => {
    const key = p.name || p.id;
    const val = p.enabled ? 1 : 0;
    return { [key]: val };
  });
};

const validatePasswordRules = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least 1 uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least 1 lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least 1 number.';
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return 'Password must contain at least 1 special character.';
  }
  return null;
};

// Helper to build a unified MongoDB query matcher for AdminUser (by userId, userid, _id, name, or email)
const buildAdminUserQuery = (identifier, extraConditions = {}) => {
  if (!identifier) return extraConditions;
  const cleanId = String(identifier).trim();
  const lowerId = cleanId.toLowerCase();

  const isObjectId = mongoose.Types.ObjectId.isValid(cleanId);
  const idOrConditions = [
    { userid: cleanId },
    { userId: cleanId },
    { name: cleanId },
    { e_mailid: lowerId },
    { email: lowerId }
  ];
  if (isObjectId) {
    idOrConditions.push({ _id: cleanId });
  }

  return {
    $or: idOrConditions,
    ...extraConditions
  };
};

// ── ADMIN ROLES CONTROLLER ──────────────────────────────────────────────

// GET /api/admin/roles
const getRoles = async (req, res) => {
  try {
    const roles = await AdminRole.find().sort({ createdAt: 1 }).lean();
    return res.status(200).json({ success: true, roles });
  } catch (err) {
    console.error('[getRoles error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/roles
const createRole = async (req, res) => {
  try {
    const { Role, roleName, roleId } = req.body;
    const targetRole = (Role || roleName || '').trim();
    if (!targetRole) {
      return res.status(400).json({ success: false, message: 'Role Name is required' });
    }

    // Auto-generate unique roleId (e.g. R_ID01, R_ID02) if not passed
    let effectiveRoleId = (roleId || '').trim();
    if (!effectiveRoleId) {
      const count = await AdminRole.countDocuments();
      effectiveRoleId = `R_ID${String(count + 1).padStart(2, '0')}`;
    }

    const newRole = await AdminRole.create({
      roleId: effectiveRoleId,
      Role: targetRole,
      createdDate: new Date()
    });

    return res.status(201).json({ success: true, role: newRole });
  } catch (err) {
    console.error('[createRole error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/roles/permissions
// Update permissions for a role or specific user
const updateRolePermissions = async (req, res) => {
  try {
    const { targetKey, permissions, applyTo, appliedPersonId, appliedPersonName } = req.body;
    if (!targetKey) {
      return res.status(400).json({ success: false, message: 'Target key is required' });
    }

    const accessList = formatPermissionsToAccess(permissions);

    // Identify if the target refers to super_admin
    const isSuperAdminTarget =
      String(targetKey).toLowerCase() === 'super_admin' ||
      String(targetKey).toLowerCase() === 'super admin' ||
      String(targetKey).toLowerCase() === 'admin' ||
      String(targetKey).toLowerCase() === 'super administrator' ||
      String(targetKey).toLowerCase() === 'fist-o' ||
      String(applyTo || '').toLowerCase() === 'super_admin' ||
      String(applyTo || '').toLowerCase() === 'super admin' ||
      String(applyTo || '').toLowerCase() === 'admin' ||
      String(applyTo || '').toLowerCase() === 'fist-o' ||
      String(applyTo || '').toLowerCase() === 'super administrator' ||
      String(appliedPersonName || '').toLowerCase() === 'super_admin' ||
      String(appliedPersonName || '').toLowerCase() === 'fist-o';

    if (isSuperAdminTarget) {
      // Also update or ensure super_admin entry exists in AdminRole
      await AdminRole.findOneAndUpdate(
        { Role: 'super_admin' },
        {
          $set: {
            Role: 'super_admin',
            createdDate: new Date()
          }
        },
        { upsert: true, new: true }
      ).catch(() => { });

      const adminUser = await AdminUser.findOne({
        $or: [
          { role: { $regex: /^super_admin$/i } },
          { userid: { $regex: /^admin$/i } },
          { name: { $regex: /super_admin|super administrator|fist-o/i } },
          { e_mailid: 'admin@flipibook.com' }
        ]
      });

      if (adminUser) {
        adminUser.Access = accessList;
        adminUser.markModified('Access');
        await adminUser.save();
        return res.status(200).json({ success: true, user: adminUser });
      }
    }

    // 1. If an individual person was selected (or targetKey is a specific User ID or personId)
    const specificUserId = appliedPersonId || (targetKey && (targetKey.startsWith('FLIP_') || targetKey === 'Admin') ? targetKey : null);
    const userMatch = await AdminUser.findOne(buildAdminUserQuery(specificUserId || targetKey));

    if (userMatch) {
      // Update individual user's Access in AdminUser
      userMatch.Access = accessList;
      userMatch.markModified('Access');
      await userMatch.save();

      return res.status(200).json({ success: true, user: userMatch });
    }

    // 2. Otherwise update or create general role document
    const cleanTarget = targetKey.replace(/^All\s+/i, '').trim();
    const updatedRole = await AdminRole.findOneAndUpdate(
      { Role: cleanTarget },
      {
        $set: {
          Role: cleanTarget,
          createdDate: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Sync all members under this designation (match by role name, designation string, or roleId)
    if (updatedRole) {
      const roleIdStr = updatedRole._id ? updatedRole._id.toString() : '';
      await AdminUser.updateMany(
        {
          $or: [
            { designation: cleanTarget },
            { designation: new RegExp(`^${cleanTarget}$`, 'i') },
            ...(roleIdStr ? [{ designation: roleIdStr }] : [])
          ]
        },
        { $set: { Access: accessList } }
      ).catch(() => { });
    }

    return res.status(200).json({ success: true, role: updatedRole });
  } catch (err) {
    console.error('[updateRolePermissions error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN STAFF USERS CONTROLLER ────────────────────────────────────────

// GET /api/admin/management-users
const getAdminUsers = async (req, res) => {
  try {

    // Auto-normalize existing documents:
    // 1. Move lowercase userid -> userId, e_mailid -> email
    // 2. Remove legacy duplicate fields ($unset userid, e_mailid, isDeleted)
    try {
      const allUsers = await AdminUser.find({});
      for (const u of allUsers) {
        const uid = u.userId || u.userid;
        const uEmail = u.email || u.e_mailid;

        const updateFields = {};
        if (uid) updateFields.userId = uid;
        if (uEmail) updateFields.email = uEmail;

        await AdminUser.collection.updateOne(
          { _id: u._id },
          {
            ...(Object.keys(updateFields).length > 0 ? { $set: updateFields } : {}),
            $unset: {
              userid: "",
              e_mailid: "",
              isDeleted: ""
            }
          }
        );
      }
    } catch (normErr) {
      console.warn('[getAdminUsers normalize error]:', normErr.message);
    }

    let users = [];
    try {
      users = await AdminUser.find({}).sort({ createdAt: 1 }).lean();
    } catch (dbErr) {
      console.error('[getAdminUsers DB query error]:', dbErr.message);
    }

    // Resolve ObjectId designations to Role names if applicable
    let allRoles = [];
    try {
      allRoles = await AdminRole.find().lean();
    } catch (_) { }
    const roleMap = new Map();
    allRoles.forEach((r) => {
      if (r._id) roleMap.set(r._id.toString(), r.Role || r.roleName || '');
      if (r.roleId) roleMap.set(r.roleId.toString(), r.Role || r.roleName || '');
    });

    const populatedUsers = users.map((u) => {
      const desigStr = String(u.designation || '').trim();
      const matchedRoleName = roleMap.get(desigStr);
      return {
        ...u,
        designation: matchedRoleName || u.designation
      };
    });

    return res.status(200).json({ success: true, users: populatedUsers });
  } catch (err) {
    console.error('[getAdminUsers error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/management-users
const createAdminUser = async (req, res) => {
  try {
    const { name, email, designation, password, status, Access, permissions } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    const passErr = validatePasswordRules(password);
    if (passErr) {
      return res.status(400).json({ success: false, message: passErr });
    }

    // Auto-generate userId (staff users start from FLIP_AD0001)
    const staffCount = await AdminUser.countDocuments({
      $or: [{ userId: /^FLIP_AD/i }, { userid: /^FLIP_AD/i }]
    });
    const generatedUserId = `FLIP_AD${String(staffCount + 1).padStart(4, '0')}`;
    const cleanEmail = (email || req.body.e_mailid || `admin_${Date.now()}@flipibook.com`).trim().toLowerCase();
    const effectivePassword = password.trim();
    const defaultAccessList = [
      { "Dashboard": 0 },
      { "3D Editor Assets": 0 },
      { "User Management": 0 },
      { "Template Management": 0 },
      { "Management - Role Access": 0 },
      { "Management - User": 0 }
    ];

    const effectiveAccess = Array.isArray(Access) && Access.length > 0
      ? Access
      : (Array.isArray(permissions) && permissions.length > 0 ? formatPermissionsToAccess(permissions) : defaultAccessList);

    const newUser = await AdminUser.create({
      userId: generatedUserId,
      name: name.trim(),
      designation: (designation || 'Staff').trim(),
      email: cleanEmail,
      password: effectivePassword,
      createddate: new Date(),
      status: status || 'Active',
      Access: effectiveAccess
    });

    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error('[createAdminUser error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/management-users/:id
const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, e_mailid, designation, password, status, Access, permissions } = req.body;

    const user = await AdminUser.findOne(buildAdminUserQuery(id));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (password && password.trim()) {
      const passErr = validatePasswordRules(password.trim());
      if (passErr) {
        return res.status(400).json({ success: false, message: passErr });
      }
      user.password = password.trim();
    }

    if (name) user.name = name.trim();
    if (e_mailid || email) {
      user.e_mailid = (e_mailid || email).trim().toLowerCase();
    }
    if (designation) user.designation = designation.trim();
    if (status) user.status = status;
    if (Access || permissions) {
      user.Access = Access || formatPermissionsToAccess(permissions);
    }

    await user.save();
    return res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (err) {
    console.error('[updateAdminUser error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/management-users/:id/password
const updateAdminUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || !password.trim()) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const passErr = validatePasswordRules(password.trim());
    if (passErr) {
      return res.status(400).json({ success: false, message: passErr });
    }

    const user = await AdminUser.findOne(buildAdminUserQuery(id));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password.trim();
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[updateAdminUserPassword error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/management-users/:id
const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    await AdminUser.findOneAndDelete(buildAdminUserQuery(id));
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('[deleteAdminUser error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRolePermissions,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  updateAdminUserPassword,
  deleteAdminUser
};
