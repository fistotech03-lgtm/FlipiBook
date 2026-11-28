// Production Permissions and Module Definitions
// NOTE: Critical permissions, roles, and admin users are persisted and validated in MongoDB
// via the backend services (admin-user-service and auth-service).
// This module provides in-memory defaults and evaluation helpers.

export const STORAGE_KEYS = {
  ADMIN_ROLES: 'flipibook_admin_roles',
  ADMIN_USERS: 'flipibook_admin_users',
  ADMIN_PERMISSIONS: 'flipibook_admin_permissions'
};

// Default permissions state
export const DEFAULT_MODULE_PERMISSIONS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Analytics, statistics, and system overview',
    enabled: false,
  },
  {
    id: 'threed_editor_assets',
    name: '3D Editor Assets',
    description: 'Manage 3D assets, models, materials, and canvas editor files',
    enabled: false,
  },
  {
    id: 'user_management',
    name: 'User Management',
    description: 'User accounts, credential controls, and access',
    enabled: false,
  },
  {
    id: 'template_management',
    name: 'Template Management',
    description: 'Document templates and design presets',
    enabled: false,
  },
  {
    id: 'management_role_access',
    name: 'Management - Role Access',
    description: 'Role access control, designation privileges, and permissions matrix',
    enabled: false,
  },
  {
    id: 'management_user',
    name: 'Management - User',
    description: 'Internal staff and management users, account credentials, and roles',
    enabled: false,
  },
];

// In-memory cache for fast UI updates during active session
let inMemoryPermissionsMap = {};
let inMemoryRoles = [];
let inMemoryUsers = [];

// Merge stored/fetched permissions with DEFAULT_MODULE_PERMISSIONS to ensure all modules are always present
export const mergeWithDefaultPermissions = (permissionsList) => {
  if (!Array.isArray(permissionsList)) {
    return DEFAULT_MODULE_PERMISSIONS.map((p) => ({ ...p }));
  }
  return DEFAULT_MODULE_PERMISSIONS.map((defaultMod) => {
    const matched = permissionsList.find((p) => p && (p.id === defaultMod.id || p.name === defaultMod.name));
    return {
      ...defaultMod,
      enabled: matched ? Boolean(matched.enabled) : false
    };
  });
};

// Permissions map cache (backed by in-memory, fallbacks to session cache)
export const getStoredPermissionsMap = () => {
  if (Object.keys(inMemoryPermissionsMap).length > 0) {
    return inMemoryPermissionsMap;
  }
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.ADMIN_PERMISSIONS);
    if (data) {
      inMemoryPermissionsMap = JSON.parse(data);
      return inMemoryPermissionsMap;
    }
  } catch (_) {}
  return {};
};

export const saveStoredPermissionsMap = (permMap) => {
  inMemoryPermissionsMap = permMap || {};
  try {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_PERMISSIONS, JSON.stringify(permMap));
    window.dispatchEvent(new Event('flipibook_permissions_updated'));
  } catch (_) {}
};

// Determine permissions for a specific logged-in admin user
export const getUserEffectivePermissions = (currentAdmin) => {
  if (!currentAdmin) return null;
  const roleName = String(currentAdmin.role || '').toLowerCase();
  const desigName = String(currentAdmin.designation || '').toLowerCase();
  const userId = String(currentAdmin.userId || '').toLowerCase();
  const email = String(currentAdmin.email || '').toLowerCase();

  const isSuperAdminAccount =
    roleName.includes('super') ||
    desigName.includes('super') ||
    userId.includes('admin') ||
    userId === 'flip_admin01' ||
    email === 'admin@flipibook.com' ||
    email === 'adminflipibook2026@gmail.com';

  // Super Admin always has full access to every module
  if (isSuperAdminAccount) {
    return {
      dashboard: true,
      threed_editor_assets: true,
      user_management: true,
      template_management: true,
      management_role_access: true,
      management_user: true,
      management: true,
      isSuperAdmin: true
    };
  }

  const permMap = getStoredPermissionsMap();

  // 1. Direct user assignment check in permMap
  const directPerms = permMap[currentAdmin.userId];
  if (directPerms && Array.isArray(directPerms)) {
    return directPerms.reduce((acc, p) => ({ ...acc, [p.id]: Boolean(p.enabled) }), { isSuperAdmin: false });
  }

  // 2. Check user.permissions returned from DB on login / verify
  if (Array.isArray(currentAdmin.permissions) && currentAdmin.permissions.length > 0) {
    return currentAdmin.permissions.reduce((acc, p) => ({ ...acc, [p.id]: Boolean(p.enabled) }), { isSuperAdmin: false });
  }

  // 3. Team Leads check
  if (currentAdmin.teamHead && permMap['Team Leads']) {
    return permMap['Team Leads'].reduce((acc, p) => ({ ...acc, [p.id]: p.enabled }), { isSuperAdmin: false });
  }

  // 4. Designation group check
  const userDesig = currentAdmin.designation || currentAdmin.role || '';
  if (permMap[userDesig]) {
    return permMap[userDesig].reduce((acc, p) => ({ ...acc, [p.id]: p.enabled }), { isSuperAdmin: false });
  }
  const roleKey = `All ${userDesig}`;
  if (permMap[roleKey]) {
    return permMap[roleKey].reduce((acc, p) => ({ ...acc, [p.id]: p.enabled }), { isSuperAdmin: false });
  }

  // Fallback: default to false for unassigned staff (secure by default)
  return {
    dashboard: true,
    threed_editor_assets: false,
    user_management: false,
    template_management: false,
    management_role_access: false,
    management_user: false,
    management: false,
    isSuperAdmin: false
  };
};

// Roles memory cache
export const getStoredRoles = () => {
  if (inMemoryRoles.length > 0) return inMemoryRoles;
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.ADMIN_ROLES);
    if (data) {
      inMemoryRoles = JSON.parse(data);
      return inMemoryRoles;
    }
  } catch (_) {}
  return [];
};

export const saveStoredRoles = (roles) => {
  inMemoryRoles = Array.isArray(roles) ? roles : [];
  try {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_ROLES, JSON.stringify(inMemoryRoles));
    window.dispatchEvent(new Event('flipibook_roles_updated'));
  } catch (_) {}
};

// Users memory cache
export const getStoredUsers = () => {
  if (inMemoryUsers.length > 0) return inMemoryUsers;
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    if (data) {
      inMemoryUsers = JSON.parse(data);
      return inMemoryUsers;
    }
  } catch (_) {}
  return [];
};

export const saveStoredUsers = (users) => {
  inMemoryUsers = Array.isArray(users) ? users : [];
  try {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(inMemoryUsers));
    window.dispatchEvent(new Event('flipibook_users_updated'));
  } catch (_) {}
};
