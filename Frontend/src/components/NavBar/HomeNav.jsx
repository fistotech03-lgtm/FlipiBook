import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// import FlipibookLogo from '../assets/logo/Flipibook_logo.svg';
const FlipibookLogo = '/Login/logo.svg';
import ProfileModal from '../Settings/ProfileModal';
import { Bell, User, CircleUser } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
// import ProfileModal from './ProfileModal';
// import { resolveUploadsPath } from '../utils/supabaseUtils';
const resolveUploadsPath = (path) => path || '';

const defaultColors = [
  '#4c5add', '#2563eb', '#059669', '#d97706', '#dc2626', 
  '#7c3aed', '#db2777', '#0891b2', '#8a4419', '#597810'
];

const getAvatarColor = (identifier, customColor) => {
  if (customColor && customColor !== '#E8D4C8' && customColor !== '#ffffff' && customColor !== 'transparent') {
    return customColor;
  }
  if (!identifier) return defaultColors[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  return defaultColors[Math.abs(hash) % defaultColors.length];
};

// List of routes that require user to be logged in
const protectedNavItems = ['/my-flipbooks'];

export default function HoveNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { user, isAuthenticated: isLoggedIn, openAuthModal } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      setIsProfileModalOpen(false);
    }
  }, [isLoggedIn]);

  const handleLinkClick = (e, link) => {
    if (protectedNavItems.includes(link.path) && !isLoggedIn) {
      e.preventDefault();
      openAuthModal('signin', link.path);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'My Flipbooks', path: '/my-flipbooks' },
    { name: 'Templates', path: '/templates' },
    { name: 'Converter', path: '/converter' },
    { name: 'Explore', path: '/explore' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Help', path: '/help' },
    // { name: 'Settings', path: '/settings' },
  ];

  return (
    <>
    <nav className="w-full bg-white px-[1.5vw] flex items-center justify-between z-50 border-b border-gray-200 shadow-sm" style={{ height: '7vh' }}>
      <div className="flex items-center gap-[2.5vw] xl:gap-[3.5vw]">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/home">
            <img src={FlipibookLogo} alt="Flipibook" className="h-[4.5vh] w-auto object-contain transition-transform duration-300" />
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-[1.5vw] xl:gap-[2.2vw]">
          {navLinks.map((link) => {
            const currentPath = location.pathname;
            const isActive = currentPath === link.path || 
                             (link.name === 'Home' && currentPath === '/') ||
                             (link.path === '/contact' && currentPath === '/contact-us');
            
            const baseLinkStyle = "text-gray-500 hover:text-gray-900 font-semibold text-[0.85vw] transition-colors relative pb-[0.25vw] after:absolute after:left-0 after:bottom-0 after:h-[0.15vw] after:w-0 hover:after:w-full after:bg-black after:transition-all after:duration-300 after:rounded-full";
            const activeLinkStyle = "text-[#ec5137] font-semibold text-[0.85vw] transition-colors relative pb-[0.25vw] after:absolute after:left-0 after:bottom-0 after:h-[0.15vw] after:w-full after:bg-[#ec5137] after:transition-all after:duration-300 after:rounded-full";

            return (
              <Link 
                  key={link.name} 
                  to={link.path} 
                  onClick={(e) => handleLinkClick(e, link)}
                  className={isActive ? activeLinkStyle : baseLinkStyle}
              >
                  {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-[1vw]">
        {isLoggedIn ? (
          <>
            {/* Notification */}
            <button className="w-[2.5vw] h-[2.5vw] cursor-pointer flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 group">
               <Bell size="1.2vw" className="text-gray-600 group-hover:text-gray-900 transition-colors" />
            </button>

            {/* Profile Avatar */}
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="w-[2.5vw] h-[2.5vw] cursor-pointer flex items-center justify-center rounded-full border border-gray-200 transition-all duration-200 overflow-hidden group p-[0.1vw] shadow-sm"
              style={{ backgroundColor: (typeof user?.picture === 'string' && user.picture && user.picture !== 'color_only') ? '#ffffff' : ((user?.avatarBgColor && user?.avatarBgColor !== '#E8D4C8' && user?.avatarBgColor !== '#ffffff') ? user?.avatarBgColor : getAvatarColor(user?.name || user?.emailId || user?.email || 'User')) }}
            >
                {typeof user?.picture === 'string' && user.picture && user.picture !== 'color_only' ? (
                   <img 
                     src={user.picture.startsWith('blob:') || user.picture.startsWith('data:') ? user.picture : resolveUploadsPath(user.picture)} 
                     alt={user.name || 'User'} 
                     className="w-full h-full object-cover rounded-full" 
                     referrerPolicy="no-referrer"
                     onError={(e) => {
                       e.target.style.display = 'none';
                     }}
                   />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-[0.9vw]"
                    style={{ backgroundColor: (user?.avatarBgColor && user?.avatarBgColor !== '#E8D4C8' && user?.avatarBgColor !== '#ffffff') ? user.avatarBgColor : getAvatarColor(user?.name || user?.emailId || user?.email || 'User') }}
                  >
                    {typeof user?.name === 'string' && user.name.length > 0 
                      ? user.name.charAt(0).toUpperCase() 
                      : (typeof user?.emailId === 'string' && user.emailId.length > 0 
                          ? user.emailId.charAt(0).toUpperCase() 
                          : (typeof user?.email === 'string' && user.email.length > 0 ? user.email.charAt(0).toUpperCase() : 'U'))}
                  </div>
                )}
            </button>
          </>
        ) : (
          /* When NOT logged in: Show Login / Signup with circle human icon, no border, and underlined black text */
          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            className="flex items-center gap-[0.45vw] px-[1.2vw] py-[0.5vw] rounded-full bg-gray-100 hover:bg-gray-200 text-black text-[0.82vw] font-medium transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <CircleUser size="1.25vw" className="text-black" />
            <span className="underline underline-offset-2">Login / Signup</span>
          </button>
        )}
      </div>
    </nav>
    <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
}
