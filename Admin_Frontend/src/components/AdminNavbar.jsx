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
          <span className="hidden sm:inline-block px-[0.5vw] py-[0.15vw] rounded-[0.35vw] bg-[#ec5137]/10 text-[#ec5137] border border-[#ec5137]/20 text-[0.65vw] font-black uppercase tracking-wider">
            ADMIN
          </span>
        </div>

        {/* Horizontal Navigation Links matching Frontend HomeNav */}
        <div className="hidden lg:flex items-center gap-[1.5vw] xl:gap-[2.2vw]">
          {navLinks.map((link) => {
            const isActive = checkIsActive(link.path);
            const baseLinkStyle = "text-gray-500 hover:text-gray-900 font-semibold text-[0.85vw] transition-colors relative pb-[0.25vw] after:absolute after:left-0 after:bottom-0 after:h-[0.15vw] after:w-0 hover:after:w-full after:bg-black after:transition-all after:duration-300 after:rounded-full";
            const activeLinkStyle = "text-[#ec5137] font-semibold text-[0.85vw] transition-colors relative pb-[0.25vw] after:absolute after:left-0 after:bottom-0 after:h-[0.15vw] after:w-full after:bg-[#ec5137] after:transition-all after:duration-300 after:rounded-full";

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
        <div className="hidden sm:flex items-center gap-[0.4vw] px-[0.8vw] py-[0.35vw] rounded-full bg-emerald-50 border border-emerald-200 text-[0.75vw] text-emerald-800 font-medium">
          <span className="w-[0.45vw] h-[0.45vw] rounded-full bg-emerald-500 status-pulse" />
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
          className="w-[2.4vw] h-[2.4vw] rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-[1.1vw] h-[1.1vw] ${isRefreshing ? 'animate-spin text-[#ec5137]' : ''}`} />
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="w-[2.4vw] h-[2.4vw] rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 transition-all relative cursor-pointer"
        >
          <Bell className="w-[1.15vw] h-[1.15vw]" />
          <span className="absolute top-[0.5vw] right-[0.5vw] w-[0.45vw] h-[0.45vw] rounded-full bg-[#ec5137]" />
        </button>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-[0.6vw] pl-[0.6vw] border-l border-gray-200">
          <div className="w-[2.3vw] h-[2.3vw] rounded-full bg-gradient-to-tr from-[#ec5137] to-orange-400 text-white font-bold text-[0.8vw] flex items-center justify-center shadow-xs ring-2 ring-orange-100 flex-shrink-0">
            {adminUser?.initials || 'AD'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-[0.8vw] font-bold text-gray-900 leading-tight">
              {adminUser?.name || 'Administrator'}
            </p>
            <p className="text-[0.65vw] font-semibold text-[#ec5137] uppercase tracking-wide">
              {adminUser?.role || 'Super Admin'}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
