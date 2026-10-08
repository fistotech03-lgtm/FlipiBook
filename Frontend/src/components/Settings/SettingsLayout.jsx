import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { clearSession } from '../../utils/authUtils';
import { useAuth } from '../../context/AuthContext';

const defaultColors = [
  '#4c5add', '#2563eb', '#059669', '#d97706', '#dc2626', 
  '#7c3aed', '#db2777', '#0891b2', '#8a4419', '#597810'
];

export const getAvatarColor = (identifier, customColor) => {
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

const defaultProfile = {
  name: 'User',
  email: '',
  emailId: '',
  picture: null,
  avatarBgColor: '#E8D4C8',
  about: '',
  mobile: '',
  companyName: '',
  industryType: '',
  companyEmail: '',
  website: '',
  services: [],
  address1: '',
  address2: '',
  city: '',
  pincode: '',
  state: '',
  country: 'INDIA',
  socials: {
    website: '',
    instagram: '',
    linkedin: '',
    facebook: '',
    whatsapp: ''
  },
  bannerBg: {
    type: 'gradient',
    value: 'linear-gradient(to bottom right, #c1e8d7, #85d8c3, #60bba3)'
  }
};

const getInitialProfile = () => {
  try {
    const cached = localStorage.getItem('user_profile') || localStorage.getItem('user');
    if (cached) {
      const parsed = JSON.parse(cached);
      const email = parsed.emailId || parsed.email || '';
      return {
        ...defaultProfile,
        ...parsed,
        email,
        emailId: email,
        name: parsed.name || (email ? email.split('@')[0] : 'User')
      };
    }
  } catch (e) {}
  return defaultProfile;
};

const SettingsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [user, setUser] = useState(getInitialProfile);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Logout error:', e);
    }

    // Clear client session and user data
    clearSession();
    localStorage.removeItem('user');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('last_active_folder');
    localStorage.removeItem('hide_upgrade_card');
    localStorage.removeItem('isAutoSaveEnabled');
    sessionStorage.clear();

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }

    setUser(defaultProfile);
    navigate('/home');
  };

  useEffect(() => {
    let targetEmail = '';
    const storedUser = localStorage.getItem('user_profile') || localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        targetEmail = parsedUser.emailId || parsedUser.email || '';
        setUser(prev => ({
          ...defaultProfile,
          ...prev,
          ...parsedUser,
          name: parsedUser.name || (targetEmail ? targetEmail.split('@')[0] : 'User'),
          email: targetEmail || '',
          emailId: targetEmail || '',
          picture: parsedUser.picture || null,
          avatarBgColor: parsedUser.avatarBgColor || '#E8D4C8'
        }));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    fetch(`${backendUrl}/api/auth/verify`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data?.user) {
          setUser(prev => ({
            ...prev,
            name: data.user.name || prev.name,
            email: data.user.emailId || data.user.email || prev.email,
            emailId: data.user.emailId || data.user.email || prev.emailId,
            picture: data.user.picture || prev.picture
          }));
          const stored = localStorage.getItem('user_profile') || localStorage.getItem('user');
          const parsed = stored ? JSON.parse(stored) : {};
          const updated = { ...parsed, ...data.user };
          localStorage.setItem('user', JSON.stringify(updated));
          localStorage.setItem('user_profile', JSON.stringify(updated));
        }
      })
      .catch(() => {});
  }, []);

  // Sync user state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('user_profile', JSON.stringify(user));
    } catch (e) {}
  }, [user]);

  const userEmail = user?.emailId || user?.email || '';
  const profilePath = userEmail ? `profile/${encodeURIComponent(userEmail)}` : 'profile';

  const sidebarGroups = [
    {
      title: 'General',
      items: [
        { path: profilePath, id: 'profile', label: 'Profile', icon: 'mingcute:profile-line' },
        { path: 'account', id: 'account', label: 'Account', icon: 'iconamoon:profile' },
        { path: 'notifications', id: 'notifications', label: 'Notifications', icon: 'basil:notification-on-outline' },
        { path: 'my-shelf', id: 'my-shelf', label: 'My Shelf', icon: 'clarity:library-line' },
      ]
    }
  ];

  return (
    <div className="flex h-full bg-white font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-[16vw] mt-[1.5vw] flex-shrink-0 border-r border-gray-100 flex flex-col">
        
        {/* Navigation Links */}
        <div className="flex-1 px-[1vw] pb-[2vw] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {sidebarGroups.map((group, index) => (
            <div key={index} className="mb-[1vw]">
              
              {/* Group Title with Line */}
              <div className="flex items-center gap-[1vw] mb-[0.8vw] px-[0.5vw]">
                <h4 className="text-[0.95vw] font-semibold text-gray-700 whitespace-nowrap">
                  {group.title}
                </h4>
                <div className="h-[0.0925vw] bg-gray-200 flex-1" style={{ marginRight: '-1.5vw' }}> </div>
              </div>

              <div className="flex flex-col gap-[0.2vw]">
                {group.items.map((item) => {
                  const isProfile = item.id === 'profile';
                  const isActive = isProfile 
                    ? location.pathname.startsWith('/settings/profile')
                    : location.pathname === `/settings/${item.path}` || location.pathname.startsWith(`/settings/${item.path}/`);

                  return (
                    <Link
                      key={item.id || item.path}
                      to={`/settings/${item.path}`}
                      className={`
                        flex items-center gap-[1vw] px-[0.75vw] py-[0.4vw] rounded-[0.5vw] text-[0.8125vw] font-semibold transition-colors
                        ${isActive 
                          ? 'bg-[#F2F2F2] text-gray-800' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        }
                      `}
                    >
                      <Icon 
                        icon={item.icon} 
                        className={`w-[1vw] h-[1vw] flex-shrink-0 text-gray-700 ${item.icon.startsWith('gcp:') ? 'grayscale brightness-0 opacity-90' : ''}`} 
                        style={{ strokeWidth: '1.2px' }}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Log Out Button */}
        <div className="p-[0.5vw] mb-[0.5vw]">
          <button 
            onClick={handleLogout}
            className="w-full relative overflow-hidden bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white active:scale-[0.98] rounded-[0.8vw] py-[0.65vw] flex items-center justify-center gap-[0.5vw] transition-all duration-200 cursor-pointer font-semibold text-[0.85vw] shadow-xs hover:shadow-md hover:shadow-red-500/20 group"
          >
            <Icon icon="lucide:log-out" className="w-[1.05vw] h-[1.05vw] transition-transform group-hover:-translate-x-0.5" />
            <span>Log Out</span>
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white p-[1vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  );
};

export default SettingsLayout;
