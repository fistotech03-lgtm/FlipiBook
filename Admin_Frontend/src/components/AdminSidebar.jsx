import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  LifeBuoy,
  Activity,
  ShieldCheck,
  Database,
  ChevronRight
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function AdminSidebar() {
  const { adminUser } = useAdmin();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'User Management', path: '/users', icon: Users },
    { name: 'Flipbook Moderation', path: '/flipbooks', icon: BookOpen },
    { name: 'Forum & Feedback', path: '/forum', icon: MessageSquare },
    { name: 'Support Tickets', path: '/tickets', icon: LifeBuoy },
    { name: 'System Telemetry', path: '/system', icon: Activity },
    { name: 'Audit Logs', path: '/logs', icon: ShieldCheck },
  ];

  return (
    <aside 
      className="w-[18vw] bg-[#151c28] h-[93vh] border-r border-[#1f293d] flex flex-col justify-between p-[1.2vw] z-20 select-none text-white flex-shrink-0"
    >
      {/* Top Section */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Navigation Items (identical to MyFlipbooks sidebar items) */}
        <nav className="space-y-[0.25vw] overflow-y-auto pr-[0.25vw] flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#2c3749] text-white font-medium shadow-xs'
                      : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-[0.75vw] min-w-0">
                      <Icon
                        size="1.15vw"
                        className={`shrink-0 ${isActive ? 'text-[#ec5137]' : 'text-gray-300'}`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isActive && (
                      <ChevronRight size="0.95vw" className="text-gray-400 shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Divider */}
      <div className="my-[0.7vw] border-b border-[#243042] flex-none" />

      {/* Bottom Section: Cluster Storage Box & Profile Avatar */}
      <div className="flex-none space-y-[0.7vw]">
        {/* Cluster Storage status (matching the toggleable storage box in MyFlipbooks) */}
        <div className="p-[0.75vw] rounded-[0.6vw] bg-[#1e2738] border border-[#2f3d52] flex items-center justify-between">
          <div className="flex items-center gap-[0.65vw]">
            <div className="w-[2vw] h-[2vw] rounded-[0.45vw] bg-[#2c3749] flex items-center justify-center text-[#ec5137] flex-shrink-0">
              <Database size="1vw" />
            </div>
            <div>
              <p className="text-[0.78vw] font-bold text-white leading-tight">Cluster Storage</p>
              <p className="text-[0.68vw] text-gray-400">MongoDB & Assets</p>
            </div>
          </div>
          <span className="w-[0.45vw] h-[0.45vw] rounded-full bg-emerald-500 status-pulse" />
        </div>

        {/* Admin User Info */}
        <div className="flex items-center gap-[0.65vw] px-[0.3vw] py-[0.2vw]">
          <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-gradient-to-tr from-[#ec5137] to-orange-400 text-white font-bold text-[0.8vw] flex items-center justify-center shadow-xs flex-shrink-0">
            {adminUser?.initials || 'AD'}
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <p className="text-[0.78vw] font-semibold text-white truncate leading-tight">
              {adminUser?.name || 'Administrator'}
            </p>
            <p className="text-[0.68vw] text-gray-400 truncate">
              {adminUser?.email || 'admin@flipibook.com'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
