import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileModal from '../Settings/ProfileModal';
import NotificationDrawer from '../Notification/NotificationDrawer';
import { Bell, ArrowRight, ChevronDown, Menu, X, Monitor, Laptop } from 'lucide-react';
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
  { name: 'My Flipibooks', path: '/my-flipbooks' },
  { name: 'Templates', path: '/templates' },
  { name: 'Guide', path: '/guide' },
  { name: 'Overview', path: '/overview' },
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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(2);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDesktopPrompt, setShowDesktopPrompt] = useState(false);
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

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsProfileModalOpen(false);
        setShowDesktopPrompt(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isMobileOrTablet = () => {
    if (typeof window === 'undefined') return false;
    const isTouchScreen = window.innerWidth < 1024;
    const isMobileUA = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isTouchScreen || isMobileUA;
  };

  const handleGoToMyFlipibook = (e) => {
    if (e) e.preventDefault();
    if (isMobileOrTablet()) {
      setShowDesktopPrompt(true);
      return;
    }
    if (isLoggedIn) {
      navigate('/my-flipbooks');
    } else {
      openAuthModal('signin', '/my-flipbooks');
    }
  };

  const handleLinkClick = (e, link) => {
    if (link.path === '/my-flipbooks' || link.name === 'My Flipibooks' || link.path.startsWith('/editor')) {
      if (isMobileOrTablet()) {
        e.preventDefault();
        setShowDesktopPrompt(true);
        return;
      }
    }
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
        className="w-full h-full bg-white px-3 sm:px-5 lg:px-[1.5vw] flex items-center justify-between border-b border-gray-200 shadow-xs relative" 
        aria-label="Main Navigation"
      >
        {/* Left Section: Logo & Desktop Links */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-[2.5vw] xl:gap-[3.5vw]">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/home" aria-label="Flipibook Home" className="flex items-center">
              <img 
                src={FlipibookLogo} 
                alt="Flipibook" 
                className="h-7 sm:h-8 md:h-9 lg:h-[4.5vh] max-h-10 w-auto object-contain transition-transform duration-300" 
              />
            </Link>
          </div>

          {/* Desktop & Large Tablet Navigation Links */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-[2.2vw]">
            {navLinks.map((link) => {
              const isActive = checkIsLinkActive(link, currentPath);
              const baseLinkStyle = "text-gray-500 hover:text-gray-900 font-semibold text-xs lg:text-[0.85vw] transition-colors relative pb-[0.25vw] after:absolute after:left-0 after:bottom-0 after:h-[0.15vw] after:w-0 hover:after:w-full after:bg-black after:transition-all after:duration-300 after:rounded-full";
              const activeLinkStyle = "text-[#ec5137] font-semibold text-xs lg:text-[0.85vw] transition-colors relative pb-[0.25vw] after:absolute after:left-0 after:bottom-0 after:h-[0.15vw] after:w-full after:bg-[#ec5137] after:transition-all after:duration-300 after:rounded-full";

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

        {/* Right Section: Actions & Hamburger Menu */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-[0.8vw]">
          {/* Go to Dashboard Button (hidden on mobile, visible on tablet & desktop) */}
          {!isMyFlipbooksPage && (
            <button
              type="button"
              onClick={handleGoToMyFlipibook}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 lg:px-[1.3vw] lg:py-[0.55vw] rounded-lg lg:rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d5452e] text-white text-xs sm:text-sm lg:text-[0.85vw] font-medium shadow-xs hover:shadow-sm transition-all duration-200 active:scale-95 cursor-pointer group whitespace-nowrap"
            >
              <span>Go to MyFlipibook</span>
              <ArrowRight className="w-3.5 h-3.5 lg:w-[1vw] lg:h-[1vw] transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          )}

          {isLoggedIn ? (
            <>
              {/* Notification Button */}
              <button 
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                aria-label="Notifications"
                aria-expanded={isNotificationOpen}
                className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-[2.4vw] lg:h-[2.4vw] cursor-pointer flex items-center justify-center rounded-full border transition-all duration-200 group flex-shrink-0 relative ${
                  isNotificationOpen
                    ? 'bg-[#ec5137] border-[#ec5137] text-white shadow-sm ring-2 ring-[#ec5137]/20'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bell className={`w-4 h-4 lg:w-[1.15vw] lg:h-[1.15vw] transition-colors ${
                  isNotificationOpen ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                }`} />
                {unreadNotifCount > 0 && !isNotificationOpen && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ec5137] ring-2 ring-white" />
                )}
              </button>

              {/* Profile Avatar Pill */}
              <button 
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                aria-label="User profile settings"
                aria-expanded={isProfileModalOpen}
                className="flex items-center gap-1 sm:gap-1.5 lg:gap-[0.35vw] p-0.5 sm:p-1 pr-1.5 sm:pr-2 lg:pr-[0.45vw] rounded-full border border-gray-200 hover:border-gray-300 bg-white transition-all duration-200 cursor-pointer shadow-xs group flex-shrink-0"
              >
                <div 
                  className="w-7 h-7 sm:w-8 sm:h-8 lg:w-[2.3vw] lg:h-[2.3vw] flex items-center justify-center rounded-full border border-gray-100 overflow-hidden group p-0.5 shadow-xs flex-shrink-0 relative"
                  style={{ backgroundColor: avatarBgColor }}
                >
                  {!activeUser ? (
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <svg className="w-4 h-4 lg:w-[1.2vw] lg:h-[1.2vw]" fill="currentColor" viewBox="0 0 24 24">
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
                      className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-[0.9vw] transition-all duration-300 select-none"
                      style={{ backgroundColor: avatarBgColor }}
                    >
                      {userInitial}
                    </div>
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 lg:w-[1vw] lg:h-[1vw] text-gray-500 group-hover:text-gray-700 transition-colors hidden sm:block" />
              </button>
            </>
          ) : (
            /* Sign in Button */
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-[1.4vw] lg:py-[0.55vw] rounded-lg lg:rounded-[0.5vw] bg-white border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-sm text-gray-700 hover:text-gray-900 text-xs sm:text-sm lg:text-[0.85vw] font-medium transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Sign in
            </button>
          )}

          {/* Mobile & Tablet Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile & Tablet Slide-Over Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 w-[82vw] max-w-[340px] h-full bg-white shadow-2xl flex flex-col justify-between z-10 transition-transform duration-300">
            {/* Drawer Top Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <Link 
                to="/home" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center"
              >
                <img src={FlipibookLogo} alt="Flipibook" className="h-7 w-auto object-contain" />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* If logged in: User Profile Card */}
              {isLoggedIn && (
                <div 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-orange-50/50 hover:border-orange-200 transition-all"
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: avatarBgColor }}
                  >
                    {hasValidPicture && resolvedPictureUrl ? (
                      <img src={resolvedPictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 text-sm truncate">
                      {activeUser?.displayName || activeUser?.name || 'Creator'}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {currentEmail || 'Account settings'}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 flex-shrink-0" />
                </div>
              )}

              {/* Navigation Links Group */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
                  Menu
                </div>
                {navLinks.map((link) => {
                  const isActive = checkIsLinkActive(link, currentPath);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={(e) => {
                        handleLinkClick(e, link);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-orange-50 text-[#ec5137] border-l-4 border-[#ec5137]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span>{link.name}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#ec5137]" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-[#FAFAFA] space-y-2">
              {!isMyFlipbooksPage && (
                <button
                  type="button"
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleGoToMyFlipibook(e);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#ec5137] hover:bg-[#d5452e] text-white text-sm font-semibold shadow-xs active:scale-98 transition-all cursor-pointer"
                >
                  <span>Go to MyFlipibook</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {!isLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('signin');
                  }}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-gray-900 text-sm font-semibold shadow-xs active:scale-98 transition-all cursor-pointer"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Experience Suggestion Modal for Mobile & Tablet */}
      {showDesktopPrompt && (
        <div 
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowDesktopPrompt(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowDesktopPrompt(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Device Icon Graphic */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ec5137] mb-4 shadow-xs">
              <Monitor className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-[#ec5137] border border-orange-200 text-xs font-semibold mb-2.5">
              <Laptop className="w-3.5 h-3.5" />
              <span>Desktop Only Application</span>
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              Try Application on Your Desktop for Best Experience
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-xs sm:text-sm mt-2 mb-6 leading-relaxed">
              FlipiBook Application (Studio, 3D Canvas, and Page Editors) is designed exclusively for desktop and laptop computers. Mobile and tablet devices are not supported for editing and managing flipbooks.
            </p>

            {/* Action Buttons */}
            <div className="w-full">
              <button
                type="button"
                onClick={() => {
                  setShowDesktopPrompt(false);
                  if (location.pathname.startsWith('/my-flipbooks') || location.pathname.startsWith('/editor')) {
                    navigate('/home');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#ec5137] hover:bg-[#d5452e] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Got it, Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <NotificationDrawer 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        onUnreadCountChange={setUnreadNotifCount}
      />
    </>
  );
}
