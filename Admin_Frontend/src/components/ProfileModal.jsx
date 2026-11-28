import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { getStoredRoles, getStoredUsers } from '../services/adminStorage';

export default function ProfileModal({ isOpen, onClose, user }) {
  const navigate = useNavigate();
  const { logout } = useAdmin();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onClose();
      logout();
      navigate('/login');
    }
  };

  const storedUsers = getStoredUsers();
  const storedRoles = getStoredRoles();

  // Find freshest user data matching logged-in user
  const currentUserId = user?.userId || user?.id || user?.userID;
  const matchedUser = storedUsers.find(
    (u) =>
      (currentUserId && String(u.userId).toLowerCase() === String(currentUserId).toLowerCase()) ||
      (user?.email && String(u.email).toLowerCase() === String(user.email).toLowerCase())
  );

  const effectiveUser = matchedUser || user;

  const avatarUrl =
    effectiveUser?.avatar ||
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

  const name = effectiveUser?.name || user?.name || 'Super Administrator';

  // Resolve designation: resolve MongoDB ObjectId to real role name or fallback to Super Admin
  const rawRole = String(effectiveUser?.designation || effectiveUser?.role || user?.role || user?.designation || '').trim();
  let resolvedDesignation = rawRole;
  if (/^[0-9a-fA-F]{24}$/.test(rawRole)) {
    const foundRole = storedRoles.find((r) => String(r.id) === rawRole || String(r._id) === rawRole);
    resolvedDesignation = foundRole ? (foundRole.name || foundRole.Role || foundRole.designation) : 'Super Admin';
  }
  if (!resolvedDesignation || resolvedDesignation.toLowerCase() === 'admin') {
    resolvedDesignation = 'Super Admin';
  }

  const userId = effectiveUser?.userId || user?.userId || (user?.id && !/^[0-9a-fA-F]{24}$/.test(user.id) ? user.id : 'FLIP_ADMIN01');
  const email = effectiveUser?.email || user?.email || 'admin@flipibook.com';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[370px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 select-none relative p-7 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-[#EC5137] flex items-center justify-center cursor-pointer transition"
          title="Close"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Profile Header Section */}
        <div className="flex flex-col items-center mt-1">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-[3px] border-white shadow-lg ring-2 ring-slate-100"
            />
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs"></span>
          </div>

          {/* Name */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-3.5 leading-tight">
            {name}
          </h2>

          {/* Designation badge */}
          {resolvedDesignation && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#EC5137]/10 text-[#EC5137] border border-[#EC5137]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC5137]"></span>
              <span>{resolvedDesignation}</span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="mt-6 space-y-3.5 text-left">
          {/* User ID Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              User ID <span className="text-[#EC5137]">*</span>
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50/90 border border-slate-200 text-sm font-semibold text-neutral-800 font-mono tracking-wider">
              {userId}
            </div>
          </div>

          {/* Email / Mail ID Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              Mail ID <span className="text-[#EC5137]">*</span>
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50/90 border border-slate-200 text-sm font-semibold text-neutral-800 truncate">
              {email}
            </div>
          </div>
        </div>

        {/* Modal Bottom Log-out Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-[#EC5137] hover:bg-[#d9442b] active:bg-[#c63a23] text-white text-sm font-semibold transition duration-150 cursor-pointer shadow-md shadow-[#EC5137]/25 flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log-out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
