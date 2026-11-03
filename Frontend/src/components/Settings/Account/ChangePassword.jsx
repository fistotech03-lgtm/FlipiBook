import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import axios from 'axios';

const ChangePassword = ({ onBack, onSuccess }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }
    if (!form.newPassword) {
      setErrorMessage('Please enter a new password.');
      return;
    }
    if (form.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/change-password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        onSuccess?.();
      } else {
        setErrorMessage(res.data?.message || 'Failed to change password.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to change password. Please check your current password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-12vw)] flex flex-col p-[1.5vw] font-sans">
      {/* Top Navigation: Back to Account Page */}
      <div className="mb-[1vw] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-[0.7vw]">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-[0.4vw] text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 px-[0.8vw] py-[0.45vw] rounded-[0.5vw] shadow-xs text-[0.78vw] font-medium transition-colors cursor-pointer group active:scale-[0.98]"
          >
            <Icon
              icon="lucide:arrow-left"
              className="w-[0.9vw] h-[0.9vw] text-gray-500 group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to Account</span>
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-[0.76vw] text-gray-500 font-medium">
            Sign-in & Security &gt; Change Password
          </span>
        </div>
      </div>

      {/* Main Container Card - Centered both horizontally and vertically (middle) */}
      <div className="w-full flex-1 flex items-center justify-center py-[2vw]">
        <div className="w-full max-w-[40vw] bg-white border border-gray-200 rounded-[1vw] p-[2.2vw] shadow-sm">
          {/* Header */}
          <div className="pb-[1.4vw] border-b border-gray-100">
            <h1 className="text-[1.25vw] font-semibold text-gray-900 leading-tight">
              Change Password
            </h1>
            <p className="text-[0.76vw] text-gray-500 mt-[0.25vw] font-normal leading-relaxed">
              Ensure your account is using a long, random password to stay secure.
            </p>
          </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-[1.2vw] p-[0.8vw] bg-[#FEF2F2] border border-[#FCA5A5] rounded-[0.6vw] flex items-center gap-[0.6vw] text-[#DC2626] text-[0.76vw]">
            <Icon icon="solar:danger-circle-bold" className="w-[1vw] h-[1vw] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handleSubmit} className="mt-[1.5vw] flex flex-col gap-[1.2vw]">
          {/* Current Password */}
          <div className="flex flex-col gap-[0.35vw]">
            <label className="text-[0.78vw] font-medium text-gray-700">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter your current password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="w-full px-[0.9vw] py-[0.55vw] pr-[2.4vw] text-[0.8vw] rounded-[0.5vw] border border-gray-300 focus:outline-hidden focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-[0.7vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <Icon icon={showCurrent ? 'lucide:eye-off' : 'lucide:eye'} className="w-[1vw] h-[1vw]" />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-[0.35vw]">
            <label className="text-[0.78vw] font-medium text-gray-700">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full px-[0.9vw] py-[0.55vw] pr-[2.4vw] text-[0.8vw] rounded-[0.5vw] border border-gray-300 focus:outline-hidden focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-[0.7vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <Icon icon={showNew ? 'lucide:eye-off' : 'lucide:eye'} className="w-[1vw] h-[1vw]" />
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-[0.35vw]">
            <label className="text-[0.78vw] font-medium text-gray-700">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-[0.9vw] py-[0.55vw] pr-[2.4vw] text-[0.8vw] rounded-[0.5vw] border border-gray-300 focus:outline-hidden focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-[0.7vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <Icon icon={showConfirm ? 'lucide:eye-off' : 'lucide:eye'} className="w-[1vw] h-[1vw]" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-[0.8vw] pt-[0.6vw]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-[0.45vw] bg-[#4c5add] hover:bg-[#3f4bb8] disabled:bg-[#9fa6eb] text-white text-[0.82vw] font-medium px-[1.5vw] py-[0.6vw] rounded-[0.5vw] shadow-xs transition-all cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="lucide:loader-2" className="w-[0.9vw] h-[0.9vw] animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Icon icon="lucide:check" className="w-[0.9vw] h-[0.9vw]" />
                  <span>Update Password</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="px-[1.2vw] py-[0.6vw] rounded-[0.5vw] border border-gray-300 text-gray-700 hover:bg-gray-50 text-[0.82vw] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
};

export default ChangePassword;
