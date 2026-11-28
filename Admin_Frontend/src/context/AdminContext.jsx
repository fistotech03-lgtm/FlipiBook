import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);

  const [toasts, setToasts] = useState([]);
  const [isValidatingSession, setIsValidatingSession] = useState(true);

  // Validate active session against Backend on mount
  useEffect(() => {
    let isMounted = true;

    const verifyCurrentSession = async () => {
      try {
        const res = await axios.get('/api/admin/auth/me', { withCredentials: true });
        if (res.data?.success && res.data.user) {
          const userData = res.data.user;
          const isSuper =
            Boolean(userData.isSuperAdmin) ||
            String(userData.role || '').toLowerCase().includes('super') ||
            String(userData.designation || '').toLowerCase().includes('super') ||
            String(userData.userId || userData.userID || '').toLowerCase().includes('admin') ||
            String(userData.email || userData.emailId || '').toLowerCase() === 'adminflipibook2026@gmail.com' ||
            String(userData.email || userData.emailId || '').toLowerCase() === 'admin@flipibook.com';

          const verifiedAdmin = {
            name: userData.name || (isSuper ? 'Super Administrator' : 'Staff Member'),
            email: userData.emailId || userData.email || '',
            userId: userData.userID || userData.userId || '',
            designation: isSuper ? 'Super Admin' : (userData.designation || 'Staff'),
            role: isSuper ? 'Super Admin' : (userData.role || 'Staff'),
            roleId: userData.roleId || '',
            permissions: userData.permissions || [],
            avatar: userData.picture || userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            initials: (userData.name || 'Admin').slice(0, 2).toUpperCase()
          };

          if (isMounted) {
            setAdminUser(verifiedAdmin);
            window.dispatchEvent(new Event('flipibook_permissions_updated'));
          }
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          if (isMounted) {
            setAdminUser(null);
            try { localStorage.removeItem('flipibook_admin_user'); } catch (_) { }
          }
        }
      } finally {
        if (isMounted) setIsValidatingSession(false);
      }
    };

    verifyCurrentSession();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    window.__CURRENT_ADMIN__ = adminUser;
  }, [adminUser]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = async (userIdOrEmail, password) => {
    const cleanId = String(userIdOrEmail || '').trim();

    try {
      const res = await axios.post(
        '/api/admin/auth/login',
        {
          userId: cleanId,
          email: cleanId,
          emailId: cleanId,
          password
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        const userData = res.data.user || {};
        const isSuper =
          Boolean(userData.isSuperAdmin) ||
          String(userData.role || '').toLowerCase().includes('super') ||
          String(userData.designation || '').toLowerCase().includes('super') ||
          String(userData.userId || userData.userID || cleanId).toLowerCase().includes('admin') ||
          String(userData.email || userData.emailId || cleanId).toLowerCase() === 'adminflipibook2026@gmail.com' ||
          String(userData.email || userData.emailId || cleanId).toLowerCase() === 'admin@flipibook.com';

        const defaultFullPermissions = [
          { id: 'dashboard', name: 'Dashboard', enabled: true },
          { id: 'threed_editor_assets', name: '3D Editor Assets', enabled: true },
          { id: 'user_management', name: 'User Management', enabled: true },
          { id: 'template_management', name: 'Template Management', enabled: true },
          { id: 'management_role_access', name: 'Management - Role Access', enabled: true },
          { id: 'management_user', name: 'Management - User', enabled: true }
        ];

        const permissions = isSuper
          ? defaultFullPermissions
          : (Array.isArray(userData.permissions) && userData.permissions.length > 0
            ? userData.permissions
            : defaultFullPermissions);

        const newAdmin = {
          name: userData.name || (isSuper ? 'Super Administrator' : 'Staff Member'),
          email: userData.emailId || userData.email || cleanId,
          userId: userData.userID || userData.userId || cleanId,
          designation: isSuper ? 'Super Admin' : (userData.designation || 'Staff'),
          role: isSuper ? 'Super Admin' : (userData.role || 'Staff'),
          roleId: userData.roleId || '',
          permissions: permissions,
          avatar: userData.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          initials: (userData.name || 'Admin').slice(0, 2).toUpperCase()
        };
        setAdminUser(newAdmin);
        window.dispatchEvent(new Event('flipibook_permissions_updated'));
        return { success: true, user: newAdmin };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    try { localStorage.removeItem('flipibook_admin_user'); } catch (_) { }
    setAdminUser(null);
    try {
      axios.post('/api/admin/auth/logout', {}, { withCredentials: true }).catch(() => { });
    } catch (_) { }
  };

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        setAdminUser,
        isValidatingSession,
        login,
        logout,
        showToast
      }}
    >
      {children}

      {/* Global Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-200 ${toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/40 text-red-200'
                : 'bg-stone-900/90 border-stone-700 text-stone-200'
              }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-white cursor-pointer ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AdminContext.Provider>
  );
};
