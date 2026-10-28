import React from 'react';
import { Icon } from '@iconify/react';
import { resolveUploadsPath } from '../../../utils/assetUtils';
import { getAvatarColor } from '../SettingsLayout';

const AccountOverview = ({
  contextUser,
  userEmail,
  userName,
  avatarSrc,
  hasPassword,
  onAddPasswordClick,
  onChangePasswordClick,
}) => {
  return (
    <div className="w-full flex flex-col p-[1.5vw] font-sans">
      {/* Page Title & Subtitle */}
      <div className="mb-[1.8vw]">
        <h1 className="text-[1.35vw] font-semibold text-gray-800 tracking-tight leading-tight">
          Account Settings
        </h1>
        <p className="text-[0.74vw] text-gray-500 mt-[0.25vw] font-normal">
          Manage your credentials, active sessions and account security
        </p>
      </div>

      {/* Account Overview Card */}
      <div className="w-full bg-white border border-gray-200 rounded-[1vw] p-[1.5vw] shadow-sm mb-[1.5vw]">
        {/* Card Header */}
        <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
          <Icon icon="solar:user-bold" className="w-[1.1vw] h-[1.1vw] text-[#4b5563]" />
          <h2 className="text-[0.98vw] font-medium text-gray-800">
            Account Overview
          </h2>
        </div>
        <p className="text-[0.72vw] text-gray-500 mb-[1.5vw] pl-[1.65vw] font-normal">
          Key profile details and account verification status
        </p>

        {/* Content Row: User details, Account Type, Member Since, Last Login */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-[1.5vw] pt-[0.2vw]">
          {/* User Profile Block */}
          <div className="flex items-center gap-[0.9vw]">
            <div
              className="w-[3.8vw] h-[3.8vw] rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-xs border border-gray-100"
              style={{
                backgroundColor: avatarSrc
                  ? '#ffffff'
                  : contextUser?.avatarBgColor || getAvatarColor(userName || userEmail || 'User'),
              }}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={userName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-white text-[1.5vw] font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-[0.4vw]">
                <h3 className="text-[1.05vw] font-medium text-gray-900 truncate leading-none">
                  {userName}
                </h3>
                {/* Green Verified Badge */}
                <Icon
                  icon="mdi:check-decagram"
                  className="w-[0.95vw] h-[0.95vw] text-[#22c55e] shrink-0"
                />
              </div>
              <p className="text-[0.74vw] text-gray-500 truncate mt-[0.3vw] mb-[0.4vw] font-normal">
                {userEmail}
              </p>
              {/* Email Verified Pill */}
              <div>
                <span className="inline-flex items-center gap-[0.3vw] bg-[#DCFCE7] text-[#16A34A] text-[0.66vw] font-medium px-[0.6vw] py-[0.15vw] rounded-full">
                  <span className="w-[0.35vw] h-[0.35vw] rounded-full bg-[#16A34A]"></span>
                  Email Verified
                </span>
              </div>
            </div>
          </div>

          {/* Account Type */}
          <div className="flex flex-col pl-[1.2vw] border-l border-gray-100">
            <span className="text-[0.74vw] font-medium text-gray-700 mb-[0.45vw]">
              Account type
            </span>
            <div className="flex items-center gap-[0.45vw] text-gray-600">
              <Icon
                icon="lucide:user"
                className="w-[0.9vw] h-[0.9vw] text-[#4b5563]"
                strokeWidth="2"
              />
              <span className="text-[0.76vw] text-[#555962] font-normal">
                {contextUser?.profileType || 'Individual Creator'}
              </span>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex flex-col pl-[1.2vw] border-l border-gray-100">
            <span className="text-[0.74vw] font-medium text-gray-700 mb-[0.45vw]">
              Member Since
            </span>
            <div className="flex items-center gap-[0.45vw] text-gray-600">
              <Icon
                icon="lucide:calendar"
                className="w-[0.9vw] h-[0.9vw] text-[#4b5563]"
                strokeWidth="2"
              />
              <span className="text-[0.76vw] text-[#555962] font-normal">
                {contextUser?.createdAt
                  ? new Date(contextUser.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Apr 29, 2024'}
              </span>
            </div>
          </div>

          {/* Last Login */}
          <div className="flex flex-col pl-[1.2vw] border-l border-gray-100">
            <span className="text-[0.74vw] font-medium text-gray-700 mb-[0.45vw]">
              Last Login
            </span>
            <div className="flex items-center gap-[0.45vw] text-gray-600">
              <Icon
                icon="lucide:clock"
                className="w-[0.9vw] h-[0.9vw] text-[#4b5563]"
                strokeWidth="2"
              />
              <span className="text-[0.76vw] text-[#555962] font-normal">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                &nbsp;10:45 AM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign-in & Security Card */}
      <div className="w-full bg-white border border-gray-200 rounded-[1vw] p-[1.5vw] shadow-sm mb-[1.5vw]">
        {/* Card Header */}
        <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
          <Icon icon="solar:lock-keyhole-bold" className="w-[1.1vw] h-[1.1vw] text-[#4b5563]" />
          <h2 className="text-[0.98vw] font-medium text-gray-800">
            Sign-in & Security
          </h2>
        </div>
        <p className="text-[0.72vw] text-gray-500 mb-[1.3vw] pl-[1.65vw] font-normal">
          Manage your password and authentication safeguards
        </p>

        {/* Password Row Box */}
        <div className="w-full bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.75vw] p-[1vw] flex items-center justify-between">
          <div className="flex items-center gap-[0.9vw]">
            {/* Key Icon in circle */}
            <div
              className={`w-[2.5vw] h-[2.5vw] rounded-full flex items-center justify-center shadow-xs border ${
                hasPassword
                  ? 'bg-white border-gray-200 text-gray-600'
                  : 'bg-amber-50 border-amber-200 text-amber-600'
              }`}
            >
              <Icon icon="lucide:key" className="w-[1.05vw] h-[1.05vw] -rotate-45" strokeWidth="2" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-[0.5vw]">
                <span className="text-[0.88vw] font-medium text-gray-800">
                  {hasPassword ? 'Password' : 'Password not Yet Added'}
                </span>
                {!hasPassword && (
                  <span className="bg-amber-100 text-amber-800 text-[0.64vw] font-medium px-[0.5vw] py-[0.12vw] rounded-full">
                    Action Needed
                  </span>
                )}
              </div>
              <span className="text-[0.72vw] text-gray-400 mt-[0.1vw] font-normal">
                {hasPassword
                  ? 'Your account is secured with a password'
                  : 'You signed in via Google. Add a password to enable email & password login.'}
              </span>
            </div>
          </div>

          {/* Action Button: Add Password OR Change Password */}
          {hasPassword ? (
            <button
              type="button"
              onClick={onChangePasswordClick}
              className="flex items-center gap-[0.45vw] bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-300 text-[0.8vw] font-medium px-[1vw] py-[0.5vw] rounded-[0.5vw] shadow-xs transition-colors cursor-pointer active:scale-[0.98]"
            >
              <Icon icon="lucide:repeat" className="w-[0.85vw] h-[0.85vw] text-gray-500" strokeWidth="2" />
              <span>Change Password</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddPasswordClick}
              className="flex items-center gap-[0.45vw] bg-[#4c5add] hover:bg-[#3f4bb8] text-white text-[0.8vw] font-medium px-[1.1vw] py-[0.5vw] rounded-[0.5vw] shadow-xs transition-all cursor-pointer active:scale-[0.98]"
            >
              <Icon icon="lucide:plus" className="w-[0.85vw] h-[0.85vw]" strokeWidth="2.2" />
              <span>Add Password</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Sessions Card */}
      <div className="w-full bg-white border border-gray-200 rounded-[1vw] p-[1.5vw] shadow-sm mb-[1.5vw]">
        {/* Card Header with Top-Right Action Buttons */}
        <div className="flex items-start justify-between mb-[1.3vw]">
          <div>
            <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
              <Icon icon="solar:devices-bold" className="w-[1.1vw] h-[1.1vw] text-[#4b5563]" />
              <h2 className="text-[0.98vw] font-medium text-gray-800">
                Active Sessions
              </h2>
            </div>
            <p className="text-[0.72vw] text-gray-500 pl-[1.65vw] font-normal">
              Devices currently signed in and authorized for this account
            </p>
          </div>

          <div className="flex items-center gap-[0.7vw]">
            {/* Select devices button */}
            <button
              type="button"
              className="flex items-center gap-[0.35vw] text-gray-600 hover:text-gray-900 text-[0.78vw] font-medium px-[0.75vw] py-[0.45vw] transition-colors cursor-pointer"
            >
              <Icon icon="lucide:copy" className="w-[0.85vw] h-[0.85vw] text-gray-500" strokeWidth="2" />
              <span>Select devices</span>
            </button>

            {/* Logout other devices button */}
            <button
              type="button"
              className="flex items-center gap-[0.35vw] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]/30 text-[0.78vw] font-medium px-[0.9vw] py-[0.45vw] rounded-[0.5vw] transition-colors cursor-pointer"
            >
              <Icon icon="lucide:log-out" className="w-[0.85vw] h-[0.85vw]" strokeWidth="2" />
              <span>Logout other devices</span>
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex flex-col gap-[0.75vw]">
          {/* Session 1: Current Session */}
          <div className="w-full bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.75vw] px-[1.1vw] py-[0.9vw] grid grid-cols-12 items-center shadow-xs">
            <div className="col-span-4 flex items-center gap-[0.85vw]">
              <Icon icon="uim:windows" className="w-[1.7vw] h-[1.7vw] shrink-0 text-[#0078D4]" />
              <div className="flex flex-col">
                <span className="text-[0.85vw] font-medium text-gray-800 leading-none">
                  Chrome on Windows
                </span>
                <span className="text-[0.72vw] text-gray-500 mt-[0.3vw] font-normal">
                  Coimbatore, India <span className="text-gray-300">•</span>{' '}
                  <span className="text-emerald-600 font-medium">Active Now</span>
                </span>
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-center">
              <span className="bg-[#DCFCE7] text-[#16A34A] text-[0.68vw] font-medium px-[0.75vw] py-[0.18vw] rounded-full inline-flex items-center justify-center leading-normal">
                Current Session
              </span>
            </div>

            <div className="col-span-3 text-[0.74vw] text-gray-500 font-normal pl-[0.8vw]">
              IP : 123.3445.455.345
            </div>

            <div className="col-span-3 flex flex-col">
              <span className="text-[0.7vw] text-gray-400 font-normal">
                Last Activated
              </span>
              <span className="text-[0.74vw] text-gray-600 font-medium mt-[0.1vw]">
                Apr 29, 2026 - 10:45 AM
              </span>
            </div>
          </div>

          {/* Session 2 */}
          <div className="w-full bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.75vw] px-[1.1vw] py-[0.9vw] grid grid-cols-12 items-center shadow-xs">
            <div className="col-span-4 flex items-center gap-[0.85vw]">
              <Icon icon="uim:windows" className="w-[1.7vw] h-[1.7vw] shrink-0 text-[#0078D4]" />
              <div className="flex flex-col">
                <span className="text-[0.85vw] font-medium text-gray-800 leading-none">
                  Chrome on Windows
                </span>
                <span className="text-[0.72vw] text-gray-500 mt-[0.3vw] font-normal">
                  Coimbatore, India <span className="text-gray-300">•</span> Last Active 2 hours ago
                </span>
              </div>
            </div>
            <div className="col-span-2"></div>
            <div className="col-span-3 text-[0.74vw] text-gray-500 font-normal pl-[0.8vw]">
              IP : 123.3445.455.345
            </div>
            <div className="col-span-2 flex flex-col">
              <span className="text-[0.7vw] text-gray-400 font-normal">
                Last Activated
              </span>
              <span className="text-[0.74vw] text-gray-600 font-medium mt-[0.1vw]">
                Apr 29, 2026 - 10:45 AM
              </span>
            </div>
            <div className="col-span-1 flex justify-end">
              <button
                type="button"
                className="flex items-center gap-[0.3vw] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[0.74vw] font-medium px-[0.85vw] py-[0.4vw] rounded-[0.45vw] shadow-xs transition-colors cursor-pointer"
              >
                <Icon icon="lucide:log-out" className="w-[0.8vw] h-[0.8vw] text-gray-500" strokeWidth="2" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Session 3 */}
          <div className="w-full bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.75vw] px-[1.1vw] py-[0.9vw] grid grid-cols-12 items-center shadow-xs">
            <div className="col-span-4 flex items-center gap-[0.85vw]">
              <Icon icon="uim:windows" className="w-[1.7vw] h-[1.7vw] shrink-0 text-[#0078D4]" />
              <div className="flex flex-col">
                <span className="text-[0.85vw] font-medium text-gray-800 leading-none">
                  Chrome on Windows
                </span>
                <span className="text-[0.72vw] text-gray-500 mt-[0.3vw] font-normal">
                  Coimbatore, India <span className="text-gray-300">•</span> Last Active 1 day ago
                </span>
              </div>
            </div>
            <div className="col-span-2"></div>
            <div className="col-span-3 text-[0.74vw] text-gray-500 font-normal pl-[0.8vw]">
              IP : 123.3445.455.345
            </div>
            <div className="col-span-2 flex flex-col">
              <span className="text-[0.7vw] text-gray-400 font-normal">
                Last Activated
              </span>
              <span className="text-[0.74vw] text-gray-600 font-medium mt-[0.1vw]">
                Apr 29, 2026 - 10:45 AM
              </span>
            </div>
            <div className="col-span-1 flex justify-end">
              <button
                type="button"
                className="flex items-center gap-[0.3vw] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[0.74vw] font-medium px-[0.85vw] py-[0.4vw] rounded-[0.45vw] shadow-xs transition-colors cursor-pointer"
              >
                <Icon icon="lucide:log-out" className="w-[0.8vw] h-[0.8vw] text-gray-500" strokeWidth="2" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Session 4 */}
          <div className="w-full bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.75vw] px-[1.1vw] py-[0.9vw] grid grid-cols-12 items-center shadow-xs">
            <div className="col-span-4 flex items-center gap-[0.85vw]">
              <Icon icon="uim:windows" className="w-[1.7vw] h-[1.7vw] shrink-0 text-[#0078D4]" />
              <div className="flex flex-col">
                <span className="text-[0.85vw] font-medium text-gray-800 leading-none">
                  Chrome on Windows
                </span>
                <span className="text-[0.72vw] text-gray-500 mt-[0.3vw] font-normal">
                  Coimbatore, India <span className="text-gray-300">•</span> Last Active 1 hour ago
                </span>
              </div>
            </div>
            <div className="col-span-2"></div>
            <div className="col-span-3 text-[0.74vw] text-gray-500 font-normal pl-[0.8vw]">
              IP : 123.3445.455.345
            </div>
            <div className="col-span-2 flex flex-col">
              <span className="text-[0.7vw] text-gray-400 font-normal">
                Last Activated
              </span>
              <span className="text-[0.74vw] text-gray-600 font-medium mt-[0.1vw]">
                Apr 29, 2026 - 10:45 AM
              </span>
            </div>
            <div className="col-span-1 flex justify-end">
              <button
                type="button"
                className="flex items-center gap-[0.3vw] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[0.74vw] font-medium px-[0.85vw] py-[0.4vw] rounded-[0.45vw] shadow-xs transition-colors cursor-pointer"
              >
                <Icon icon="lucide:log-out" className="w-[0.8vw] h-[0.8vw] text-gray-500" strokeWidth="2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Login Activities Card */}
      <div className="w-full bg-white border border-gray-200 rounded-[1vw] p-[1.5vw] shadow-sm mb-[1.5vw]">
        {/* Card Header with More Menu */}
        <div className="flex items-start justify-between mb-[1.3vw]">
          <div>
            <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
              <Icon icon="solar:history-bold" className="w-[1.1vw] h-[1.1vw] text-[#4b5563]" />
              <h2 className="text-[0.98vw] font-medium text-gray-800">
                Recent Login Activities
              </h2>
            </div>
            <p className="text-[0.72vw] text-gray-500 pl-[1.65vw] font-normal">
              Your recent sign-in attempts and account activity
            </p>
          </div>

          <button
            type="button"
            className="p-[0.3vw] text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-[0.4vw] transition-colors cursor-pointer"
          >
            <Icon icon="lucide:more-vertical" className="w-[1vw] h-[1vw]" />
          </button>
        </div>

        {/* Table Container */}
        <div className="w-full border border-gray-200 rounded-[0.75vw] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 bg-[#f8f9fa] border-b border-gray-200 px-[1.2vw] py-[0.75vw] text-[0.76vw] font-medium text-gray-700">
            <div>Device</div>
            <div>Location</div>
            <div>Date & Time</div>
            <div>IP Address</div>
            <div>Status</div>
            <div className="text-right pr-[0.6vw]">Action</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100 text-[0.75vw]">
            {/* Row 1: Chrome on Windows - Current Session */}
            <div className="grid grid-cols-6 items-center px-[1.2vw] py-[0.95vw] hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-[0.6vw] font-medium text-gray-800">
                <Icon icon="uim:windows" className="w-[1.3vw] h-[1.3vw] shrink-0 text-[#0078D4]" />
                <span>Chrome on Windows</span>
              </div>
              <div className="text-gray-500 font-normal">Coimbatore, India</div>
              <div className="text-gray-500 font-normal">Apr 29, 2026 - 10:45 AM</div>
              <div className="text-gray-500 font-normal">IP : 192 . 168 . 584 . 485</div>
              <div>
                <span className="bg-[#DCFCE7] text-[#16A34A] text-[0.68vw] font-medium px-[0.75vw] py-[0.18vw] rounded-full inline-block">
                  Current Session
                </span>
              </div>
              <div className="text-right pr-[0.6vw] text-gray-400 font-normal">
                Current device
              </div>
            </div>

            {/* Row 2: Chrome on Windows - Failed */}
            <div className="grid grid-cols-6 items-center px-[1.2vw] py-[0.95vw] hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-[0.6vw] font-medium text-gray-800">
                <Icon icon="uim:windows" className="w-[1.3vw] h-[1.3vw] shrink-0 text-[#0078D4]" />
                <span>Chrome on Windows</span>
              </div>
              <div className="text-gray-500 font-normal">Coimbatore, India</div>
              <div className="text-gray-500 font-normal">Apr 29, 2026 - 10:45 AM</div>
              <div className="text-gray-500 font-normal">IP : 192 . 168 . 584 . 485</div>
              <div>
                <span className="bg-[#FEE2E2] text-[#EF4444] text-[0.68vw] font-medium px-[0.8vw] py-[0.18vw] rounded-full inline-block">
                  Failed
                </span>
              </div>
              <div className="text-right pr-[0.6vw]">
                <button type="button" className="text-[#EF4444] hover:underline font-normal cursor-pointer">
                  It's Not you?
                </button>
              </div>
            </div>

            {/* Row 3: Chrome on Android - Completed */}
            <div className="grid grid-cols-6 items-center px-[1.2vw] py-[0.95vw] hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-[0.6vw] font-medium text-gray-800">
                <Icon icon="ant-design:android-filled" className="w-[1.3vw] h-[1.3vw] shrink-0 text-[#3DDC84]" />
                <span>Chrome on Android</span>
              </div>
              <div className="text-gray-500 font-normal">Coimbatore, India</div>
              <div className="text-gray-500 font-normal">Apr 29, 2026 - 10:45 AM</div>
              <div className="text-gray-500 font-normal">IP : 192 . 168 . 584 . 485</div>
              <div className="text-gray-600 font-normal">Completed</div>
              <div className="text-right pr-[0.6vw]">
                <button type="button" className="text-[#EF4444] hover:underline font-normal cursor-pointer">
                  It's Not you?
                </button>
              </div>
            </div>

            {/* Row 4: Safari on Mac - Completed */}
            <div className="grid grid-cols-6 items-center px-[1.2vw] py-[0.95vw] hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-[0.6vw] font-medium text-gray-800">
                <Icon icon="logos:apple" className="w-[1.15vw] h-[1.15vw] shrink-0 text-gray-900" />
                <span>Safari on Mac</span>
              </div>
              <div className="text-gray-500 font-normal">Coimbatore, India</div>
              <div className="text-gray-500 font-normal">Apr 29, 2026 - 10:45 AM</div>
              <div className="text-gray-500 font-normal">IP : 192 . 168 . 584 . 485</div>
              <div className="text-gray-600 font-normal">Completed</div>
              <div className="text-right pr-[0.6vw]">
                <button type="button" className="text-[#EF4444] hover:underline font-normal cursor-pointer">
                  It's Not you?
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View More Expander Button */}
        <div className="w-full flex items-center justify-center pt-[1vw]">
          <button
            type="button"
            className="flex items-center gap-[0.3vw] text-gray-600 hover:text-gray-900 text-[0.78vw] font-medium transition-colors cursor-pointer"
          >
            <span>View More</span>
            <Icon icon="lucide:chevron-down" className="w-[0.9vw] h-[0.9vw]" strokeWidth="2" />
          </button>
        </div>
      </div>

      {/* Account Management Card */}
      <div className="w-full bg-white border border-gray-200 rounded-[1vw] p-[1.5vw] shadow-sm mb-[1.5vw]">
        {/* Card Header */}
        <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
          <Icon icon="solar:settings-bold" className="w-[1.1vw] h-[1.1vw] text-[#4b5563]" />
          <h2 className="text-[0.98vw] font-medium text-gray-800">
            Account Management
          </h2>
        </div>
        <p className="text-[0.72vw] text-gray-500 mb-[1.3vw] pl-[1.65vw] font-normal">
          Manage your account access, multi-account switching and deletion
        </p>

        {/* Options List */}
        <div className="flex flex-col gap-[0.75vw]">
          {/* Option 1: Delete Account */}
          <div className="w-full bg-[#f8f9fa] hover:bg-gray-100/70 border border-[#f0f2f5] rounded-[0.75vw] p-[1vw] flex items-center justify-between cursor-pointer transition-colors group">
            <div className="flex items-center gap-[0.85vw]">
              <div className="w-[2.5vw] h-[2.5vw] rounded-full bg-white border border-red-200 flex items-center justify-center shadow-xs">
                <Icon icon="lucide:trash-2" className="w-[1.05vw] h-[1.05vw] text-[#EF4444]" strokeWidth="2" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.85vw] font-medium text-gray-800">
                  Delete Account
                </span>
                <span className="text-[0.72vw] text-gray-400 mt-[0.1vw] font-normal">
                  Permanently delete your account and all associated flipbooks & data
                </span>
              </div>
            </div>

            <Icon icon="lucide:chevron-right" className="w-[1.05vw] h-[1.05vw] text-gray-400 group-hover:text-gray-700 transition-colors" />
          </div>

          {/* Option 2: Switch Accounts */}
          <div className="w-full bg-[#f8f9fa] hover:bg-gray-100/70 border border-[#f0f2f5] rounded-[0.75vw] p-[1vw] flex items-center justify-between cursor-pointer transition-colors group">
            <div className="flex items-center gap-[0.85vw]">
              {/* Overlapping Avatars */}
              <div className="relative w-[2.8vw] h-[2.5vw] flex items-center">
                <div className="absolute right-0 w-[1.9vw] h-[1.9vw] rounded-full bg-[#E11D48] text-white text-[0.75vw] font-medium flex items-center justify-center shadow-xs">
                  A
                </div>
                <div
                  className="absolute left-0 w-[1.9vw] h-[1.9vw] rounded-full overflow-hidden border-2 border-white flex items-center justify-center shadow-xs"
                  style={{
                    backgroundColor: avatarSrc
                      ? '#ffffff'
                      : contextUser?.avatarBgColor || getAvatarColor(userName || userEmail || 'User'),
                  }}
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={userName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-white text-[0.8vw] font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[0.85vw] font-medium text-gray-800">
                  Switch Accounts
                </span>
                <span className="text-[0.72vw] text-gray-400 mt-[0.1vw] font-normal">
                  Sign in with another FlipiBook account or add a new account
                </span>
              </div>
            </div>

            <Icon icon="lucide:chevron-right" className="w-[1.05vw] h-[1.05vw] text-gray-400 group-hover:text-gray-700 transition-colors" />
          </div>

          {/* Option 3: Logout */}
          <div className="w-full bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.75vw] p-[1vw] flex items-center justify-between">
            <div className="flex items-center gap-[0.85vw]">
              <div
                className="w-[2.5vw] h-[2.5vw] rounded-full overflow-hidden flex items-center justify-center shadow-xs border border-gray-100"
                style={{
                  backgroundColor: avatarSrc
                    ? '#ffffff'
                    : contextUser?.avatarBgColor || getAvatarColor(userName || userEmail || 'User'),
                }}
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={userName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-white text-[0.95vw] font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-[0.85vw] font-medium text-gray-800">
                  Logout
                </span>
                <span className="text-[0.72vw] text-gray-400 mt-[0.1vw] font-normal">
                  Securely sign out from your current active session
                </span>
              </div>
            </div>

            {/* Logout Current Account Button */}
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('user_profile');
                localStorage.removeItem('last_active_folder');
                localStorage.removeItem('hide_upgrade_card');
                sessionStorage.removeItem('hide_upgrade_card');
                if (window.google?.accounts?.id) {
                  window.google.accounts.id.disableAutoSelect();
                }
                window.location.href = '/';
              }}
              className="flex items-center gap-[0.35vw] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]/30 text-[0.78vw] font-medium px-[0.9vw] py-[0.45vw] rounded-[0.5vw] transition-colors cursor-pointer"
            >
              <Icon icon="lucide:log-out" className="w-[0.85vw] h-[0.85vw]" strokeWidth="2" />
              <span>Logout Current Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverview;
