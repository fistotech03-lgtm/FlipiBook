import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Bell, RefreshCw } from 'lucide-react';
import { getMicroservicesHealth } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

export default function AdminNavbar() {
  const location = useLocation();
  const { adminUser, showToast } = useAdmin();
  const [onlineCount, setOnlineCount] = useState(null);
  const [totalCount, setTotalCount] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkHealth = async () => {
    try {
      setIsRefreshing(true);
      const data = await getMicroservicesHealth();
      const online = data.services?.filter((s) => s.status === 'ONLINE').length || 0;
      setOnlineCount(online);
      setTotalCount(data.services?.length || 10);
    } catch {
      setOnlineCount(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = async () => {
    await checkHealth();
    showToast('Platform telemetry refreshed', 'success');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'User Management', path: '/users' },
  ];

  const checkIsActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="w-full bg-white px-[1.5vw] flex items-center justify-between border-b border-gray-200 shadow-xs z-30 flex-shrink-0"
      style={{ height: '7vh' }}
      aria-label="Admin Navigation"
    >
      <div className="flex items-center gap-[2.5vw] xl:gap-[3.5vw]">
        {/* Official FlipiBook Logo */}
        <div className="flex items-center gap-[0.7vw] flex-shrink-0">
          <NavLink to="/" aria-label="FlipiBook Admin Console" className="flex items-center">
            <img src="/logo.svg" alt="Flipibook" className="h-[4.5vh] w-auto object-contain transition-transform duration-300" />
          </NavLink>
          <span className="hidden sm:inline-block px-[0.5vw] py-[0.15vw] rounded-[0.35vw] bg-[#ec5137]/10 text-[#ec5137] border border-[#ec5137]/20 text-[0.62vw] font-medium uppercase tracking-wider">
            ADMIN
          </span>
        </div>

        {/* Horizontal Navigation Links matching Frontend HomeNav */}
        <div className="hidden lg:flex items-center gap-[1.5vw] xl:gap-[2.2vw]">
          {navLinks.map((link) => {
            const isActive = checkIsActive(link.path);
            const baseLinkStyle = "text-gray-600 hover:text-gray-900 font-medium text-[0.82vw] transition-colors relative pb-[0.25vw] after:absolute after:left-0 after:bottom-0 after:h-[0.15vw] after:w-0 hover:after:w-full after:bg-gray-800 after:transition-all after:duration-300 after:rounded-full";
            const activeLinkStyle = "text-[#ec5137] font-medium text-[0.82vw] transition-colors relative pb-[0.25vw] after:absolute after:left-0 after:bottom-0 after:h-[0.15vw] after:w-full after:bg-[#ec5137] after:transition-all after:duration-300 after:rounded-full";

            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={isActive ? activeLinkStyle : baseLinkStyle}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.name}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-[0.8vw]">
        {/* Cluster Telemetry Status Pill */}
        <div className="hidden sm:flex items-center gap-[0.4vw] px-[0.8vw] py-[0.3vw] rounded-full bg-[#DCFCE7] border border-[#bbf7d0] text-[0.72vw] text-[#16A34A] font-medium">
          <span className="w-[0.4vw] h-[0.4vw] rounded-full bg-[#16A34A] status-pulse" />
          <span>
            {onlineCount !== null ? `${onlineCount}/${totalCount} Online` : 'Checking...'}
          </span>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          title="Refresh cluster telemetry"
          className="w-[2.2vw] h-[2.2vw] rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-[1vw] h-[1vw] ${isRefreshing ? 'animate-spin text-[#ec5137]' : ''}`} />
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="w-[2.2vw] h-[2.2vw] rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 transition-all relative cursor-pointer"
        >
          <Bell className="w-[1.05vw] h-[1.05vw]" />
          <span className="absolute top-[0.45vw] right-[0.45vw] w-[0.4vw] h-[0.4vw] rounded-full bg-[#ec5137]" />
        </button>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-[0.6vw] pl-[0.6vw] border-l border-gray-200">
          <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-gradient-to-tr from-[#ec5137] to-orange-400 text-white font-medium text-[0.8vw] flex items-center justify-center shadow-xs ring-1 ring-orange-200 flex-shrink-0">
            {adminUser?.initials || 'AD'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-[0.78vw] font-medium text-gray-800 leading-tight">
              {adminUser?.name || 'Administrator'}
            </p>
            <p className="text-[0.65vw] font-medium text-[#ec5137] uppercase tracking-wide">
              {adminUser?.role || 'Super Admin'}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
