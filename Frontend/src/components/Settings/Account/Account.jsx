import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { resolveUploadsPath } from '../../../utils/assetUtils';
import { useAuth } from '../../../context/AuthContext';
import { getInitialUser } from '../../../utils/authUtils';

import AccountOverview from './AccountOverview';
import AddPassword from './AddPassword';
import ChangePassword from './ChangePassword';

const Account = () => {
  const context = useOutletContext();
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const initUser = getInitialUser();
  const contextUser = context?.user || authUser || initUser || {};

  const userEmail =
    contextUser?.emailId ||
    contextUser?.email ||
    authUser?.emailId ||
    authUser?.email ||
    initUser?.emailId ||
    initUser?.email ||
    '';
  const userName =
    contextUser?.displayName ||
    contextUser?.name ||
    authUser?.displayName ||
    authUser?.name ||
    (userEmail ? userEmail.split('@')[0] : 'User');
  const avatarSrc =
    contextUser?.picture && contextUser.picture !== 'color_only'
      ? contextUser.picture.startsWith('blob:') || contextUser.picture.startsWith('data:')
        ? contextUser.picture
        : resolveUploadsPath(contextUser.picture)
      : null;

  // Track active sub-view in Account page: 'overview' | 'add-password' | 'change-password'
  const [activeView, setActiveView] = useState('overview');

  // Track hasPassword status locally with sync
  const [hasPassword, setHasPassword] = useState(() => {
    return Boolean(contextUser?.hasPassword);
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  // Check backend for latest hasPassword status on mount if email exists
  useEffect(() => {
    if (!userEmail) return;
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/profile`, {
          withCredentials: true,
        });
        if (res.data && isMounted) {
          if (res.data.hasPassword !== undefined) {
            setHasPassword(Boolean(res.data.hasPassword));
          }
          const p = res.data.profile || (res.data.emailId ? res.data : null);
          if (p) {
            const updated = {
              ...contextUser,
              ...p,
              name: p.name || p.displayName || contextUser.name || userEmail.split('@')[0],
              displayName: p.displayName || p.name || contextUser.displayName || '',
              picture: p.picture || contextUser.picture || null,
              avatarBgColor: p.avatarBgColor || contextUser.avatarBgColor || '#E8D4C8',
              hasPassword: res.data.hasPassword !== undefined ? Boolean(res.data.hasPassword) : Boolean(p.hasPassword),
            };
            if (context?.setUser) {
              context.setUser(updated);
            }
            if (setAuthUser) {
              setAuthUser(updated);
            }
          }
        }
      } catch (err) {
        // Fallback check on user/me
        try {
          const res = await axios.get(`${backendUrl}/api/user/me`, { withCredentials: true });
          if (res.data?.data && res.data.data.hasPassword !== undefined && isMounted) {
            setHasPassword(Boolean(res.data.data.hasPassword));
          }
        } catch (e) {}
      }
    };
    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, [userEmail, backendUrl]);

  // Sync if contextUser changes
  useEffect(() => {
    if (contextUser?.hasPassword !== undefined) {
      setHasPassword(Boolean(contextUser.hasPassword));
    }
  }, [contextUser?.hasPassword]);

  // Toast / notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleAddPasswordSuccess = () => {
    setHasPassword(true);
    if (context?.setUser) {
      context.setUser((prev) => ({ ...prev, hasPassword: true }));
    }
    if (setAuthUser) {
      setAuthUser((prev) => ({ ...prev, hasPassword: true }));
    }
    try {
      const stored = localStorage.getItem('user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.hasPassword = true;
        localStorage.setItem('user_profile', JSON.stringify(parsed));
      }
    } catch (e) {}

    setActiveView('overview');
    showToast('Password added successfully! You can now sign in with your email and password.');
  };

  const handleChangePasswordSuccess = () => {
    setActiveView('overview');
    showToast('Password changed successfully!');
  };

  return (
    <div className="w-full flex flex-col relative font-sans">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed top-[2vw] right-[2vw] z-50 flex items-center gap-[0.6vw] px-[1.1vw] py-[0.75vw] rounded-[0.6vw] shadow-lg border text-[0.8vw] font-medium transition-all animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'error'
              ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]'
              : 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]'
          }`}
        >
          <Icon
            icon={notification.type === 'error' ? 'solar:danger-circle-bold' : 'solar:check-circle-bold'}
            className="w-[1.1vw] h-[1.1vw] shrink-0"
          />
          <span>{notification.message}</span>
        </div>
      )}

      {/* View 1: Main Overview View */}
      {activeView === 'overview' && (
        <AccountOverview
          contextUser={contextUser}
          userEmail={userEmail}
          userName={userName}
          avatarSrc={avatarSrc}
          hasPassword={hasPassword}
          onAddPasswordClick={() => setActiveView('add-password')}
          onChangePasswordClick={() => setActiveView('change-password')}
          showToast={showToast}
        />
      )}

      {/* View 2: Add Password with OTP (Inline View with Top Back button) */}
      {activeView === 'add-password' && (
        <AddPassword
          userEmail={userEmail}
          onBack={() => setActiveView('overview')}
          onSuccess={handleAddPasswordSuccess}
        />
      )}

      {/* View 3: Change Password (Inline View with Top Back button) */}
      {activeView === 'change-password' && (
        <ChangePassword
          onBack={() => setActiveView('overview')}
          onSuccess={handleChangePasswordSuccess}
        />
      )}
    </div>
  );
};

export default Account;
