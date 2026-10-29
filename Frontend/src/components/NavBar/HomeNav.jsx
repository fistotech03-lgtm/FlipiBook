import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileModal from '../Settings/ProfileModal';
import { Bell, ArrowRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { verifyToken, getInitialUser } from '../../utils/authUtils';
import { resolveUploadsPath } from '../../utils/assetUtils';

const FlipibookLogo = '/Login/logo.svg';

const DEFAULT_AVATAR_COLORS = [
  '#4c5add', '#2563eb', '#059669', '#d97706', '#dc2626', 
  '#7c3aed', '#db2777', '#0891b2', '#8a4419', '#597810'
];

const DEFAULT_NAV_LINKS = [
  { name: 'Home', path: '/home' },
  { name: 'Explore', path: '/explore' },
  { name: 'Features', path: '/features' },
  { name: 'Converter', path: '/converter' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Forum', path: '/forum' },
  { name: 'Help', path: '/help' },
];

const MY_FLIPBOOKS_NAV_LINKS = [
  { name: 'Overview', path: '/overview' },
  { name: 'My Flipibooks', path: '/my-flipbooks' },
  { name: 'Templates', path: '/templates' },
  { name: 'Guide', path: '/guide' },
];

const PROTECTED_NAV_ITEMS = new Set(['/my-flipbooks', '/overview']);

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
         (link.name === 'Overview' && currentPath === '/overview') ||
         (link.name === 'Over View' && currentPath === '/overview') ||
         (link.name === 'My Flipibooks' && currentPath.startsWith('/my-flipbooks')) ||
         (link.path === '/contact' && currentPath === '/contact-us') ||
         (link.path === '/help' && (currentPath === '/help' || currentPath === '/contact'));
};

export default function HomeNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isMyFlipbooksPage = currentPath.startsWith('/my-flipbooks') || currentPath.startsWith('/templates') || currentPath.startsWith('/settings') || currentPath.startsWith('/overview') || currentPath.startsWith('/guide');
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  
  const { user, isAuthenticated, openAuthModal, setUser: setAuthUser } = useAuth();
  const isLoggedIn = isAuthenticated || verifyToken();

  const cookieUser = useMemo(() => getInitialUser(), []);
  const activeUser = user || cookieUser;

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const currentEmail = (activeUser?.emailId || activeUser?.email || cookieUser?.emailId || cookieUser?.email || '').trim();

  // If active user is missing picture or full name, fetch latest profile from backend
  useEffect(() => {
    if (!isLoggedIn || !currentEmail) return;

    let isMounted = true;
    const fetchLatestProfile = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/profile`, {
          withCredentials: true,
        });
        const p = res.data?.profile || (res.data?.emailId ? res.data : null);
        if (p && isMounted) {
          const updatedUser = {
            ...(activeUser || {}),
            ...p,
            name: p.name || p.displayName || activeUser?.name || currentEmail.split('@')[0],
            displayName: p.displayName || p.name || activeUser?.displayName || '',
            picture: p.picture || activeUser?.picture || null,
            avatarBgColor: p.avatarBgColor || activeUser?.avatarBgColor || '#E8D4C8',
          };
          if (setAuthUser) {
            setAuthUser(updatedUser);
          }
        }
      } catch (err) {
        // Silent fallback
      }
    };

    if (!activeUser?.picture || !activeUser?.name) {
      fetchLatestProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, currentEmail, backendUrl]);

  // Reset image load error if user's picture updates
  useEffect(() => {
    setImageLoadError(false);
  }, [activeUser?.picture]);

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
    const candidate = (
      activeUser?.displayName ||
      activeUser?.name ||
      activeUser?.userName ||
      activeUser?.emailId ||
      activeUser?.email ||
      ''
    ).trim();

    if (candidate.length > 0) {
      return candidate.charAt(0).toUpperCase();
    }
    return isLoggedIn ? 'U' : '';
  }, [activeUser, isLoggedIn]);

  const pictureCandidate = activeUser?.picture;
  const hasValidPicture = typeof pictureCandidate === 'string' && 
                          pictureCandidate.length > 0 && 
                          pictureCandidate !== 'color_only' && 
                          !imageLoadError;

  const resolvedPictureUrl = useMemo(() => {
    if (!hasValidPicture || !pictureCandidate) return null;
    return pictureCandidate.startsWith('blob:') || pictureCandidate.startsWith('data:')
      ? pictureCandidate
      : resolveUploadsPath(pictureCandidate);
  }, [hasValidPicture, pictureCandidate]);

  const avatarBgColor = useMemo(() => {
    if (!activeUser && !isLoggedIn) return '#f3f4f6';
    if (hasValidPicture) return '#ffffff';
    return (activeUser?.avatarBgColor && activeUser?.avatarBgColor !== '#E8D4C8' && activeUser?.avatarBgColor !== '#ffffff') 
      ? activeUser.avatarBgColor 
      : getAvatarColor(activeUser?.displayName || activeUser?.name || activeUser?.emailId || activeUser?.email || 'User');
  }, [activeUser, hasValidPicture, isLoggedIn]);

  return (
    <>
      <nav 
        className="w-full h-full bg-white px-[1.5vw] flex items-center justify-between border-b border-gray-200 shadow-xs" 
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
          {/* Go to Dashboard Button */}
          {!isMyFlipbooksPage && (
            <button
              type="button"
              onClick={() => isLoggedIn ? navigate('/overview') : openAuthModal('signin', '/overview')}
              className="flex items-center gap-[0.5vw] px-[1.3vw] py-[0.55vw] rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d5452e] text-white text-[0.85vw] font-medium shadow-xs hover:shadow-sm transition-all duration-200 active:scale-95 cursor-pointer group whitespace-nowrap"
            >
              <span>Go to Dashboard</span>
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
                  {!activeUser ? (
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <svg className="w-[1.2vw] h-[1.2vw]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  ) : hasValidPicture && resolvedPictureUrl ? (
                    <img 
                      src={resolvedPictureUrl} 
                      alt={activeUser.displayName || activeUser.name || 'User avatar'} 
                      className="w-full h-full object-cover rounded-full transition-all duration-300" 
                      referrerPolicy="no-referrer"
                      onError={() => setImageLoadError(true)}
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-[0.9vw] transition-all duration-300 select-none"
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
