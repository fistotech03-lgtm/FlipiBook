import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { resolveUploadsPath } from '../../../utils/assetUtils';
import { getAvatarColor } from '../SettingsLayout';
import { getClientDeviceInfo, getPublicClientIpAndLocation, isIPv4 } from '../../../utils/deviceUtils';

const AccountOverview = ({
  contextUser,
  userEmail,
  userName,
  avatarSrc,
  hasPassword,
  onAddPasswordClick,
  onChangePasswordClick,
  showToast,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  // Active Sessions & Recent Activity States
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState(null);
  const [isViewMoreActivities, setIsViewMoreActivities] = useState(false);

  // Fetch active sessions
  const fetchActiveSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const deviceInfo = getClientDeviceInfo();
      const netInfo = await getPublicClientIpAndLocation();
      const headers = {
        'x-device-id': deviceInfo.deviceId,
        'x-client-browser': deviceInfo.browser,
        'x-client-os': deviceInfo.operatingSystem,
      };
      if (netInfo?.ip) {
        headers['x-client-ip'] = netInfo.ip;
      }
      if (netInfo?.location) {
        headers['x-client-location'] = netInfo.location;
      }

      const res = await axios.get(`${backendUrl}/api/auth/sessions`, {
        headers,
        withCredentials: true,
      });
      if (res.data?.success && Array.isArray(res.data.sessions)) {
        const enriched = res.data.sessions.map((s) => {
          const needsIpv4 = !isIPv4(s.ipAddress) || s.ipAddress === '127.0.0.1' || s.ipAddress === '::1' || s.ipAddress === 'localhost';
          if (s.isCurrent && netInfo?.ip && isIPv4(netInfo.ip) && needsIpv4) {
            return {
              ...s,
              ipAddress: netInfo.ip,
              location: netInfo.location || s.location,
            };
          }
          return s;
        });
        setSessions(enriched);
      }
    } catch (err) {
      console.warn('Failed to load active sessions:', err.message);
    } finally {
      setLoadingSessions(false);
    }
  }, [backendUrl]);

  // Fetch recent login activities
  const fetchRecentActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);
      const deviceInfo = getClientDeviceInfo();
      const netInfo = await getPublicClientIpAndLocation();
      const headers = {
        'x-device-id': deviceInfo.deviceId,
      };
      if (netInfo?.ip) {
        headers['x-client-ip'] = netInfo.ip;
      }

      const res = await axios.get(`${backendUrl}/api/auth/recent-activity`, {
        headers,
        withCredentials: true,
      });
      if (res.data?.success && Array.isArray(res.data.activities)) {
        const enriched = res.data.activities.map((a) => {
          const needsIpv4 = !isIPv4(a.ipAddress) || a.ipAddress === '127.0.0.1' || a.ipAddress === '::1' || a.ipAddress === 'localhost';
          if (a.isCurrent && netInfo?.ip && isIPv4(netInfo.ip) && needsIpv4) {
            return {
              ...a,
              ipAddress: netInfo.ip,
              location: netInfo.location || a.location,
            };
          }
          return a;
        });
        setRecentActivities(enriched);
      }
    } catch (err) {
      console.warn('Failed to load recent activity:', err.message);
    } finally {
      setLoadingActivities(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchActiveSessions();
    fetchRecentActivities();
  }, [fetchActiveSessions, fetchRecentActivities]);

  // Revoke single session
  const handleRevokeSession = async (sessionId) => {
    try {
      setRevokingSessionId(sessionId);
      const res = await axios.post(
        `${backendUrl}/api/auth/sessions/revoke`,
        { sessionId },
        { withCredentials: true }
      );
      if (res.data?.success) {
        showToast?.('Device logged out successfully', 'success');
        fetchActiveSessions();
        fetchRecentActivities();
      } else {
        showToast?.(res.data?.message || 'Failed to logout device', 'error');
      }
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Failed to logout device', 'error');
    } finally {
      setRevokingSessionId(null);
    }
  };

  // Revoke all other sessions
  const handleRevokeOtherSessions = async () => {
    const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;
    if (otherSessionsCount === 0) {
      showToast?.('No other active devices found', 'success');
      return;
    }

    if (!window.confirm('Are you sure you want to log out of all other devices?')) {
      return;
    }

    try {
      setIsRevokingAll(true);
      const deviceInfo = getClientDeviceInfo();
      const res = await axios.post(
        `${backendUrl}/api/auth/sessions/revoke-others`,
        {},
        {
          headers: {
            'x-device-id': deviceInfo.deviceId,
          },
          withCredentials: true,
        }
      );
      if (res.data?.success) {
        showToast?.(res.data.message || 'Logged out from all other devices successfully', 'success');
        fetchActiveSessions();
        fetchRecentActivities();
      } else {
        showToast?.(res.data?.message || 'Failed to logout other devices', 'error');
      }
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Failed to logout other devices', 'error');
    } finally {
      setIsRevokingAll(false);
    }
  };

  // Device Icon Helper
  const getDeviceIcon = (operatingSystem = '', browser = '') => {
    const os = String(operatingSystem).toLowerCase();
    if (os.includes('win')) {
      return <Icon icon="uim:windows" className="w-[1.7vw] h-[1.7vw] shrink-0 text-[#0078D4]" />;
    }
    if (os.includes('mac') || os.includes('ios') || os.includes('iphone') || os.includes('ipad')) {
      return <Icon icon="logos:apple" className="w-[1.4vw] h-[1.4vw] shrink-0 text-gray-900" />;
    }
    if (os.includes('android')) {
      return <Icon icon="ant-design:android-filled" className="w-[1.7vw] h-[1.7vw] shrink-0 text-[#3DDC84]" />;
    }
    if (os.includes('linux')) {
      return <Icon icon="logos:linux-tux" className="w-[1.6vw] h-[1.6vw] shrink-0" />;
    }
    return <Icon icon="solar:laptop-bold" className="w-[1.7vw] h-[1.7vw] shrink-0 text-gray-600" />;
  };

  // Human-readable time ago helper
  const formatTimeAgo = (dateValue, isCurrent) => {
    if (isCurrent) return 'Active Now';
    if (!dateValue) return 'Recently';
    const d = new Date(dateValue);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return 'Active Now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Date and Time formatter
  const formatDateTime = (dateValue) => {
    if (!dateValue) return '--';
    const d = new Date(dateValue);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };
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
                {sessions[0]?.loginTime
                  ? formatDateTime(sessions[0].loginTime)
                  : formatDateTime(new Date())}
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
              Devices currently signed in and authorized for this account ({sessions.length})
            </p>
          </div>

          <div className="flex items-center gap-[0.7vw]">
            {/* Refresh sessions button */}
            <button
              type="button"
              onClick={fetchActiveSessions}
              className="flex items-center gap-[0.35vw] text-gray-600 hover:text-gray-900 text-[0.78vw] font-medium px-[0.75vw] py-[0.45vw] transition-colors cursor-pointer"
              title="Refresh sessions"
            >
              <Icon
                icon="lucide:refresh-cw"
                className={`w-[0.85vw] h-[0.85vw] text-gray-500 ${loadingSessions ? 'animate-spin' : ''}`}
                strokeWidth="2"
              />
              <span>Refresh</span>
            </button>

            {/* Logout other devices button */}
            {sessions.filter((s) => !s.isCurrent).length > 0 && (
              <button
                type="button"
                onClick={handleRevokeOtherSessions}
                disabled={isRevokingAll}
                className="flex items-center gap-[0.35vw] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]/30 text-[0.78vw] font-medium px-[0.9vw] py-[0.45vw] rounded-[0.5vw] transition-colors cursor-pointer disabled:opacity-50"
              >
                <Icon icon="lucide:log-out" className="w-[0.85vw] h-[0.85vw]" strokeWidth="2" />
                <span>{isRevokingAll ? 'Logging out...' : 'Logout other devices'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        {loadingSessions ? (
          <div className="py-[2vw] flex items-center justify-center text-gray-400 text-[0.8vw]">
            <Icon icon="lucide:loader-2" className="w-[1.2vw] h-[1.2vw] animate-spin text-[#4c5add] mr-[0.5vw]" />
            <span>Loading active sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-[2vw] text-center text-gray-400 text-[0.8vw]">
            No active sessions found.
          </div>
        ) : (
          <div className="flex flex-col gap-[0.75vw]">
            {(() => {
              const hasOtherDevices = sessions.some((s) => !s.isCurrent);
              return sessions.map((session) => (
                <div
                  key={session.sessionId || session.id}
                  className={`w-full bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.75vw] px-[1.2vw] py-[0.9vw] grid ${
                    hasOtherDevices ? 'grid-cols-5' : 'grid-cols-4'
                  } items-center shadow-xs`}
                >
                  {/* Col 1: Device icon + Browser & OS + Location/Activity */}
                  <div className="flex items-center gap-[0.85vw] min-w-0 pr-[0.5vw]">
                    {getDeviceIcon(session.operatingSystem, session.browser)}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[0.85vw] font-medium text-gray-800 leading-none truncate">
                        {session.browser} on {session.operatingSystem}
                      </span>
                      <span className="text-[0.72vw] text-gray-500 mt-[0.3vw] font-normal truncate">
                        {session.location} <span className="text-gray-300">•</span>{' '}
                        {session.isCurrent ? (
                          <span className="text-emerald-600 font-medium">Active Now</span>
                        ) : (
                          <span>Last Active {formatTimeAgo(session.lastActiveAt, false)}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Col 2: Current Session Badge */}
                  <div className="flex items-center justify-center">
                    {session.isCurrent ? (
                      <span className="bg-[#DCFCE7] text-[#16A34A] text-[0.68vw] font-medium px-[0.75vw] py-[0.18vw] rounded-full inline-flex items-center justify-center leading-normal">
                        Current Session
                      </span>
                    ) : null}
                  </div>

                  {/* Col 3: IP Address */}
                  <div className="flex flex-col justify-center pl-[1vw]">
                    <span className="text-[0.68vw] text-gray-400 font-normal">
                      IP Address
                    </span>
                    <span className="text-[0.74vw] text-gray-700 font-mono font-medium mt-[0.1vw] truncate">
                      {session.ipAddress}
                    </span>
                  </div>

                  {/* Col 4: Last Activated Timestamp */}
                  <div className="flex flex-col justify-center pl-[1vw]">
                    <span className="text-[0.68vw] text-gray-400 font-normal">
                      Last Activated
                    </span>
                    <span className="text-[0.74vw] text-gray-600 font-medium mt-[0.1vw] whitespace-nowrap">
                      {formatDateTime(session.lastActiveAt)}
                    </span>
                  </div>

                  {/* Col 5: Action Button (only rendered when other devices exist to avoid dead empty gaps) */}
                  {hasOtherDevices && (
                    <div className="flex items-center justify-end">
                      {!session.isCurrent ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(session.sessionId)}
                          disabled={revokingSessionId === session.sessionId}
                          className="flex items-center gap-[0.3vw] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[0.74vw] font-medium px-[0.85vw] py-[0.4vw] rounded-[0.45vw] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Icon icon="lucide:log-out" className="w-[0.8vw] h-[0.8vw] text-gray-500" strokeWidth="2" />
                          <span>{revokingSessionId === session.sessionId ? '...' : 'Logout'}</span>
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      {/* Recent Login Activities Card */}
      <div className="w-full bg-white border border-gray-200 rounded-[1vw] p-[1.5vw] shadow-sm mb-[1.5vw]">
        {/* Card Header with Refresh Button */}
        <div className="flex items-start justify-between mb-[1.3vw]">
          <div>
            <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
              <Icon icon="solar:history-bold" className="w-[1.1vw] h-[1.1vw] text-[#4b5563]" />
              <h2 className="text-[0.98vw] font-medium text-gray-800">
                Recent Login Activities
              </h2>
            </div>
            <p className="text-[0.72vw] text-gray-500 pl-[1.65vw] font-normal">
              Your recent sign-in attempts, security events and device logins
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRecentActivities}
            className="p-[0.3vw] text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-[0.4vw] transition-colors cursor-pointer"
            title="Refresh history"
          >
            <Icon
              icon="lucide:refresh-cw"
              className={`w-[1vw] h-[1vw] ${loadingActivities ? 'animate-spin' : ''}`}
            />
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
          {loadingActivities ? (
            <div className="py-[2vw] flex items-center justify-center text-gray-400 text-[0.8vw]">
              <Icon icon="lucide:loader-2" className="w-[1.2vw] h-[1.2vw] animate-spin text-[#4c5add] mr-[0.5vw]" />
              <span>Loading activities...</span>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="py-[2vw] text-center text-gray-400 text-[0.8vw]">
              No recent login records found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 text-[0.75vw]">
              {(isViewMoreActivities ? recentActivities : recentActivities.slice(0, 4)).map((act) => (
                <div
                  key={act.id || act.sessionId + act.date}
                  className="grid grid-cols-6 items-center px-[1.2vw] py-[0.95vw] hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-[0.6vw] font-medium text-gray-800 min-w-0">
                    {getDeviceIcon(act.operatingSystem, act.browser)}
                    <span className="truncate">{act.device || `${act.browser} on ${act.operatingSystem}`}</span>
                  </div>
                  <div className="text-gray-500 font-normal truncate">{act.location}</div>
                  <div className="text-gray-500 font-normal">{formatDateTime(act.date)}</div>
                  <div className="text-gray-700 font-normal font-mono text-[0.74vw]">{act.ipAddress}</div>
                  <div>
                    {act.isCurrent ? (
                      <span className="bg-[#DCFCE7] text-[#16A34A] text-[0.68vw] font-medium px-[0.75vw] py-[0.18vw] rounded-full inline-block">
                        Current Session
                      </span>
                    ) : act.eventType === 'FAILED_LOGIN' ? (
                      <span className="bg-[#FEE2E2] text-[#EF4444] text-[0.68vw] font-medium px-[0.8vw] py-[0.18vw] rounded-full inline-block">
                        Failed
                      </span>
                    ) : act.eventType === 'NEW_DEVICE_LOGIN' ? (
                      <span className="bg-[#DBEAFE] text-[#1D4ED8] text-[0.68vw] font-medium px-[0.75vw] py-[0.18vw] rounded-full inline-block">
                        New Device
                      </span>
                    ) : act.status === 'LOGGED_OUT' || act.status === 'REVOKED' || act.eventType === 'LOGOUT' ? (
                      <span className="bg-gray-100 text-gray-600 text-[0.68vw] font-medium px-[0.75vw] py-[0.18vw] rounded-full inline-block">
                        Completed
                      </span>
                    ) : (
                      <span className="text-gray-600 font-normal">Active</span>
                    )}
                  </div>
                  <div className="text-right pr-[0.6vw]">
                    {act.isCurrent ? (
                      <span className="text-gray-400 font-normal">Current device</span>
                    ) : act.eventType === 'FAILED_LOGIN' ? (
                      <button
                        type="button"
                        onClick={onChangePasswordClick}
                        className="text-[#EF4444] hover:underline font-normal cursor-pointer"
                      >
                        It's Not you?
                      </button>
                    ) : (
                      <span className="text-gray-400 font-normal">Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View More Expander Button */}
        {recentActivities.length > 4 && (
          <div className="w-full flex items-center justify-center pt-[1vw]">
            <button
              type="button"
              onClick={() => setIsViewMoreActivities((prev) => !prev)}
              className="flex items-center gap-[0.3vw] text-gray-600 hover:text-gray-900 text-[0.78vw] font-medium transition-colors cursor-pointer"
            >
              <span>{isViewMoreActivities ? 'View Less' : 'View More'}</span>
              <Icon
                icon="lucide:chevron-down"
                className={`w-[0.9vw] h-[0.9vw] transition-transform ${isViewMoreActivities ? 'rotate-180' : ''}`}
                strokeWidth="2"
              />
            </button>
          </div>
        )}
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
          Manage your account access and deletion
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

          {/* Option 2: Logout */}
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
