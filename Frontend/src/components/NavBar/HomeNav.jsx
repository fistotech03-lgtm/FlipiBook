import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProfileModal from '../Settings/ProfileModal';
import { Bell, ArrowRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { verifyToken } from '../../utils/authUtils';

const FlipibookLogo = '/Login/logo.svg';

const DEFAULT_AVATAR_COLORS = [
  '#4c5add', '#2563eb', '#059669', '#d97706', '#dc2626', 
  '#7c3aed', '#db2777', '#0891b2', '#8a4419', '#597810'
];

const DEFAULT_NAV_LINKS = [
  { name: 'Home', path: '/home' },
  { name: 'Converter', path: '/converter' },
  { name: 'Explore', path: '/explore' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Help', path: '/help' },
];

const MY_FLIPBOOKS_NAV_LINKS = [
  { name: 'Over View', path: '/home' },
  { name: 'My Flipibooks', path: '/my-flipbooks' },
  { name: 'Templates', path: '/templates' },
  { name: 'Features', path: '/features' },
  { name: 'Help / Support', path: '/help' },
];

const PROTECTED_NAV_ITEMS = new Set(['/my-flipbooks']);

const getAvatarColor = (identifier, customColor) => {
  if (customColor && customColor !== '#E8D4C8' && customColor !== '#ffffff' && customColor !== 'transparent') {
    return customColor;
  }
  if (!identifier) return DEFAULT_AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_AVATAR_COLORS[Math.abs(hash) % DEFAULT_AVATAR_COLORS.length];
};

const checkIsLinkActive = (link, currentPath) => {
  return currentPath === link.path || 
         (link.name === 'Home' && currentPath === '/') ||
         (link.name === 'Over View' && currentPath === '/home') ||
         (link.name === 'My Flipibooks' && currentPath.startsWith('/my-flipbooks')) ||
         (link.path === '/contact' && currentPath === '/contact-us') ||
         (link.path === '/help' && (currentPath === '/help' || currentPath === '/contact'));
};

export default function HomeNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isMyFlipbooksPage = currentPath.startsWith('/my-flipbooks') || currentPath.startsWith('/templates') || currentPath.startsWith('/settings');
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const isLoggedIn = isAuthenticated || verifyToken();

  // Reset image load error if user's picture updates
  useEffect(() => {
    setImageLoadError(false);
  }, [user?.picture]);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsProfileModalOpen(false);
    }
  }, [isLoggedIn]);

  const handleLinkClick = (e, link) => {
    if (PROTECTED_NAV_ITEMS.has(link.path) && !isLoggedIn) {
      e.preventDefault();
      openAuthModal('signin', link.path);
    }
  };

  const navLinks = isMyFlipbooksPage ? MY_FLIPBOOKS_NAV_LINKS : DEFAULT_NAV_LINKS;

  const userInitial = useMemo(() => {
    if (typeof user?.name === 'string' && user.name.trim().length > 0) {
      return user.name.trim().charAt(0).toUpperCase();
    }
    if (typeof user?.emailId === 'string' && user.emailId.trim().length > 0) {
      return user.emailId.trim().charAt(0).toUpperCase();
    }
    if (typeof user?.email === 'string' && user.email.trim().length > 0) {
      return user.email.trim().charAt(0).toUpperCase();
    }
    return '';
  }, [user?.name, user?.emailId, user?.email]);

  const hasValidPicture = typeof user?.picture === 'string' && 
                          user.picture.length > 0 && 
                          user.picture !== 'color_only' && 
                          !imageLoadError;

  const avatarBgColor = useMemo(() => {
    if (!user) return '#f3f4f6';
    if (hasValidPicture) return '#ffffff';
    return (user?.avatarBgColor && user?.avatarBgColor !== '#E8D4C8' && user?.avatarBgColor !== '#ffffff') 
      ? user.avatarBgColor 
      : getAvatarColor(user?.name || user?.emailId || user?.email || 'User');
  }, [user, hasValidPicture]);

  return (
    <>
      <nav 
        className="w-full bg-white px-[1.5vw] flex items-center justify-between z-50 border-b border-gray-200 shadow-xs" 
        style={{ height: '7vh' }}
        aria-label="Main Navigation"
      >
        <div className="flex items-center gap-[2.5vw] xl:gap-[3.5vw]">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/home" aria-label="Flipibook Home">
              <img src={FlipibookLogo} alt="Flipibook" className="h-[4.5vh] w-auto object-contain transition-transform duration-300" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-[1.5vw] xl:gap-[2.2vw]">
            {navLinks.map((link) => {
              const isActive = checkIsLinkActive(link, currentPath);
              const baseLinkStyle = "text-gray-500 hover:text-gray-900 font-semibold text-[0.85vw] transition-colors relative pb-[0.25vw] after:absolute after:left-0 after:bottom-0 after:h-[0.15vw] after:w-0 hover:after:w-full after:bg-black after:transition-all after:duration-300 after:rounded-full";
              const activeLinkStyle = "text-[#ec5137] font-semibold text-[0.85vw] transition-colors relative pb-[0.25vw] after:absolute after:left-0 after:bottom-0 after:h-[0.15vw] after:w-full after:bg-[#ec5137] after:transition-all after:duration-300 after:rounded-full";

              return (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  onClick={(e) => handleLinkClick(e, link)}
                  className={isActive ? activeLinkStyle : baseLinkStyle}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-[0.8vw]">
          {/* Go to My FlipiBook Button */}
          {!isMyFlipbooksPage && (
            <button
              type="button"
              onClick={() => isLoggedIn ? navigate('/my-flipbooks') : openAuthModal('signin', '/my-flipbooks')}
              className="flex items-center gap-[0.5vw] px-[1.3vw] py-[0.55vw] rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d5452e] text-white text-[0.85vw] font-medium shadow-xs hover:shadow-sm transition-all duration-200 active:scale-95 cursor-pointer group whitespace-nowrap"
            >
              <span>Go to My FlipiBook</span>
              <ArrowRight className="w-[1vw] h-[1vw] transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          )}

          {isLoggedIn ? (
            <>
              {/* Notification Button */}
              <button 
                type="button"
                aria-label="Notifications"
                className="w-[2.4vw] h-[2.4vw] cursor-pointer flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 group"
              >
                <Bell size="1.15vw" className="text-gray-600 group-hover:text-gray-900 transition-colors" />
              </button>

              {/* Profile Avatar Pill */}
              <button 
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                aria-label="User profile settings"
                aria-expanded={isProfileModalOpen}
                className="flex items-center gap-[0.35vw] p-[0.15vw] pr-[0.45vw] rounded-full border border-gray-200 hover:border-gray-300 bg-white transition-all duration-200 cursor-pointer shadow-xs group"
              >
                <div 
                  className="w-[2.3vw] h-[2.3vw] flex items-center justify-center rounded-full border border-gray-100 overflow-hidden group p-[0.1vw] shadow-xs flex-shrink-0 relative"
                  style={{ backgroundColor: avatarBgColor }}
                >
                  {!user ? (
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-100 animate-pulse">
                      <div className="w-[1.1vw] h-[1.1vw] rounded-full bg-gray-300/80" />
                    </div>
                  ) : hasValidPicture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name || 'User avatar'} 
                      className="w-full h-full object-cover rounded-full transition-all duration-300" 
                      referrerPolicy="no-referrer"
                      onError={() => setImageLoadError(true)}
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-[0.9vw] transition-all duration-300"
                      style={{ backgroundColor: avatarBgColor }}
                    >
                      {userInitial}
                    </div>
                  )}
                </div>
                <ChevronDown size="1vw" className="text-gray-500 group-hover:text-gray-700 transition-colors" />
              </button>
            </>
          ) : (
            /* Sign in Button */
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="px-[1.4vw] py-[0.55vw] rounded-[0.5vw] bg-white border border-gray-100 hover:border-gray-200 shadow-[0_3px_14px_rgba(0,0,0,0.07)] hover:shadow-xs text-[#374151] hover:text-gray-900 text-[0.85vw] font-medium transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
}
