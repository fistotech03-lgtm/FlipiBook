import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Pencil, Info, Phone, User, Building, MapPin, BarChart2, MoreVertical, Globe, BookOpen, Check, X } from 'lucide-react';
import { Icon } from '@iconify/react';
import ThumbnailPopup from '../Thumbnail_Popup';
import AvatarPopup from '../AvatarPopup';
import EditProfile from './EditProfile';
import Activity from '../Activity';
const resolveUploadsPath = (path) => path || '';

const LazyPreview = ({ v_id, emailId, backendUrl, iframeBaseUrl = '', title, imageUrl }) => {
  const containerRef = useRef(null);
  const [html, setHtml] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !v_id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loaded && !fetching) {
          setFetching(true);
          axios.get(`${backendUrl}/api/flipbook/preview/${v_id}`, { params: { emailId } })
            .then((res) => {
              if (res.data && res.data.html) {
                const fontsToLoad = new Set();
                const cssRegex = /font-family\s*:\s*(?:['"]([^'"]+)['"]|([^;}'"\s]+))/g;
                const attrRegex = /font-family\s*=\s*['"]([^'"]+)['"]/g;
                let match;
                while ((match = cssRegex.exec(res.data.html)) !== null) {
                  let f = match[1] || match[2];
                  if (f) f = f.split(',')[0].replace(/['"]/g, '').trim();
                  if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
                }
                while ((match = attrRegex.exec(res.data.html)) !== null) {
                  let f = match[1].split(',')[0].replace(/['"]/g, '').trim();
                  if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
                }
                
                let fontImports = '';
                if (fontsToLoad.size > 0) {
                  const fontList = Array.from(fontsToLoad).map(f => f.replace(/\s+/g, '+')).join('|');
                  fontImports = `<link href="https://fonts.googleapis.com/css?family=${fontList}:300,400,500,600,700,800,900&display=swap" rel="stylesheet">`;
                }
                
                setHtml({ content: res.data.html, fontImports });
              }
            })
            .catch(() => {})
            .finally(() => { setFetching(false); setLoaded(true); });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [v_id, loaded, fetching, backendUrl, emailId]);

  const isLoading = !loaded || fetching;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative overflow-hidden bg-white">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[0.4vw] bg-gradient-to-br from-gray-100 to-gray-200 rounded-[0.2vw] overflow-hidden">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite linear',
            }}
          />
          <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400 relative z-10"
            style={{ width: '1.2vw', height: '1.2vw', animation: 'spin 1.2s linear infinite' }}
          >
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      )}

      {html ? (() => {
        let processedContent = html.content || '';
        const cleanBaseUrl = (iframeBaseUrl || '').trim();
        let effectiveBaseHref = cleanBaseUrl;
        if (cleanBaseUrl) {
          const bookBaseUrl = cleanBaseUrl.endsWith('/') ? cleanBaseUrl : `${cleanBaseUrl}/`;
          effectiveBaseHref = `${bookBaseUrl}pages/`;
          const assetsBaseUrl = `${bookBaseUrl}assets/`;
          processedContent = processedContent
            .replace(/(?:href|xlink:href)=["'](?:\.\.\/|\.\/)?assets\/([^"']+)["']/gi, `href="${assetsBaseUrl}$1" xlink:href="${assetsBaseUrl}$1"`)
            .replace(/src=["'](?:\.\.\/|\.\/)?assets\/([^"']+)["']/gi, `src="${assetsBaseUrl}$1"`);
        }
        return (
          <iframe
            title={`Preview of ${title}`}
            className="w-full h-full border-none pointer-events-none"
            srcDoc={`<!DOCTYPE html><html><head>${html.fontImports}<base href="${effectiveBaseHref}"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:transparent;}svg{width:100%;height:100%;max-width:100%;max-height:100%;}[data-name="Free Frame"]{stroke:transparent !important;fill:transparent !important;}</style></head><body>${processedContent.replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet"')}</body></html>`}
          />
        );
      })() : loaded && imageUrl ? (
        <img src={resolveUploadsPath(imageUrl)} alt={title} className="w-full h-full object-contain" />
      ) : loaded && !html ? (
        <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full">
          <BookOpen className="w-[1.8vw] h-[1.8vw] text-gray-300" />
        </div>
      ) : null}
    </div>
  );
};

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
  company_logo_url: '',
  companyLogo: '',
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
  followers: [],
  following: [],
  visibilitySettings: {
    showInExplore: true,
    showContact: true,
    showAddress: true,
    showSocial: true
  },
  bannerBg: {
    type: 'gradient',
    value: 'linear-gradient(to bottom right, #c1e8d7, #85d8c3, #60bba3)'
  }
};

const Profile = () => {
  const context = useOutletContext();
  const navigate = useNavigate();
  const [localUser, setLocalUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user_profile');
      if (stored) return { ...defaultProfile, ...JSON.parse(stored) };
    } catch (e) {}
    return defaultProfile;
  });
  const user = context?.user ? { ...defaultProfile, ...context.user } : localUser;
  const setUser = context?.setUser || setLocalUser;

  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e?.detail) {
        setLocalUser(prev => ({
          ...defaultProfile,
          ...prev,
          ...e.detail
        }));
      }
    };
    window.addEventListener('profileUpdate', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdate', handleProfileUpdate);
  }, []);

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [activeStatsBookId, setActiveStatsBookId] = useState(null);
  const [isAvatarPopupOpen, setIsAvatarPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Edit Profile');
  const [editProfileActions, setEditProfileActions] = useState(null);
  const [bannerBg, setBannerBg] = useState({
    type: 'gradient',
    value: 'linear-gradient(to bottom right, #c1e8d7, #85d8c3, #60bba3)'
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);
  const [isChildScrollable, setIsChildScrollable] = useState(true);

  useEffect(() => {
    setIsChildScrollable(true);
  }, []);

  const [flipbooks, setFlipbooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  const { useremail } = useParams();
  const rawRouteEmail = useremail ? decodeURIComponent(useremail).trim() : '';
  const storedUserStr = typeof window !== 'undefined' ? (localStorage.getItem('user') || localStorage.getItem('user_profile')) : null;
  const storedUser = storedUserStr ? (() => { try { return JSON.parse(storedUserStr); } catch (e) { return null; } })() : null;
  const fallbackEmail = storedUser?.emailId || storedUser?.email || '';
  const ownEmail = (user?.emailId || user?.email || fallbackEmail).trim();
  const effectiveEmail = ownEmail || rawRouteEmail;

  // 1. Fetch user profile from backend
  useEffect(() => {
    if (!effectiveEmail) return;

    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/profile`, {
          params: { emailId: effectiveEmail }
        });
        const p = res.data?.profile || (res.data?.emailId ? res.data : null);
        if (p) {
            setUser(prev => {
              const updated = {
                ...defaultProfile,
                ...prev,
                ...p,
                about: p.about !== undefined ? p.about : prev.about,
                mobile: p.mobile !== undefined ? p.mobile : prev.mobile,
                countryCode: p.countryCode || prev.countryCode || '+91',
                displayName: p.displayName || prev.displayName || '',
                address1: p.address1 !== undefined ? p.address1 : prev.address1,
                address2: p.address2 !== undefined ? p.address2 : prev.address2,
                city: p.city !== undefined ? p.city : prev.city,
                state: p.state !== undefined ? p.state : prev.state,
                pincode: p.pincode !== undefined ? p.pincode : prev.pincode,
                country: p.country !== undefined ? p.country : prev.country,
                companyName: p.companyName !== undefined ? p.companyName : prev.companyName,
                industryType: p.industryType !== undefined ? p.industryType : (prev.industryType || prev.industry),
                companyEmail: p.companyEmail !== undefined ? p.companyEmail : prev.companyEmail,
                website: p.website !== undefined ? p.website : prev.website,
                email: p.emailId || prev.email || effectiveEmail,
                emailId: p.emailId || prev.emailId || effectiveEmail,
                name: p.name || prev.name || (effectiveEmail.split('@')[0]),
                picture: p.picture || prev.picture || null,
                company_logo_url: p.company_logo_url || p.companyLogo || prev.company_logo_url || prev.companyLogo || '',
                companyLogo: p.company_logo_url || p.companyLogo || prev.company_logo_url || prev.companyLogo || '',
                avatarBgColor: p.avatarBgColor || prev.avatarBgColor || '#E8D4C8',
                services: p.services || prev.services || [],
                followers: p.followers || prev.followers || [],
                following: p.following || prev.following || [],
                visibilitySettings: {
                  showInExplore: true,
                  showContact: true,
                  showAddress: true,
                  showSocial: true,
                  ...(prev.visibilitySettings || {}),
                  ...(p.visibilitySettings || {})
                },
                socials: {
                  ...defaultProfile.socials,
                  ...(p.socials || prev.socials || {})
                }
              };
              return updated;
            });
          if (p.bannerBg) {
            setBannerBg(p.bannerBg);
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, [effectiveEmail, backendUrl]);

  // 2. Banner update handler connected to backend
  const handleBannerBgChange = async (newBanner) => {
    if (newBanner?.file instanceof File) {
      // Local preview immediately
      setBannerBg(newBanner);
      if (!effectiveEmail) return;
      try {
        const formData = new FormData();
        formData.append('emailId', effectiveEmail);
        formData.append('banner', newBanner.file);
        const res = await axios.post(`${backendUrl}/api/profile/banner`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.success && res.data?.bannerBg) {
          setBannerBg(res.data.bannerBg);
        }
      } catch (err) {
        console.error("Error uploading banner to Profile folder:", err);
      }
    } else {
      setBannerBg(newBanner);
      if (!effectiveEmail) return;
      try {
        const res = await axios.post(`${backendUrl}/api/profile/banner`, {
          emailId: effectiveEmail,
          bannerBg: newBanner
        });
        if (res.data?.success && res.data?.bannerBg) {
          setBannerBg(res.data.bannerBg);
        }
      } catch (err) {
        console.error("Error updating banner in backend:", err);
      }
    }
  };

  // 3. Avatar update handlers connected to backend
  const handleSelectAvatar = async (avatarOrFile) => {
    if (avatarOrFile instanceof File) {
      // Local preview immediately
      const objectUrl = URL.createObjectURL(avatarOrFile);
      setUser(prev => {
        const updated = { ...prev, picture: objectUrl };
        return updated;
      });
      if (!effectiveEmail) return;
      try {
        const formData = new FormData();
        formData.append('emailId', effectiveEmail);
        formData.append('avatar', avatarOrFile);
        const res = await axios.post(`${backendUrl}/api/profile/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.success) {
          const newPic = res.data.picture || null;
          setUser(prev => {
            const updated = { ...prev, picture: newPic };
            return updated;
          });
        }
      } catch (err) {
        console.error("Error uploading avatar to Profile folder:", err);
      }
    } else {
      const isDeleting = !avatarOrFile;
      const targetColor = isDeleting
        ? ((user.avatarBgColor && user.avatarBgColor !== '#E8D4C8' && user.avatarBgColor !== '#ffffff') ? user.avatarBgColor : getAvatarColor(user.name || effectiveEmail))
        : (user.avatarBgColor || '#E8D4C8');

      setUser(prev => {
        const updated = { ...prev, picture: isDeleting ? null : avatarOrFile, avatarBgColor: targetColor };
        return updated;
      });
      if (!effectiveEmail) return;
      try {
        const res = await axios.post(`${backendUrl}/api/profile/avatar`, {
          emailId: effectiveEmail,
          picture: isDeleting ? null : avatarOrFile,
          avatarBgColor: targetColor
        });
        if (res.data?.success) {
          const newPic = isDeleting ? null : (res.data.picture || null);
          const newColor = res.data.avatarBgColor || targetColor;
          setUser(prev => {
            const updated = { ...prev, picture: newPic, avatarBgColor: newColor };
            return updated;
          });
        }
      } catch (err) {
        console.error("Error saving avatar in backend:", err);
      }
    }
  };

  const handleSelectColor = async (color) => {
    setUser(prev => {
      const updated = { ...prev, picture: 'color_only', avatarBgColor: color };
      return updated;
    });
    if (!effectiveEmail) return;
    try {
      await axios.post(`${backendUrl}/api/profile/avatar`, {
        emailId: effectiveEmail,
        picture: 'color_only',
        avatarBgColor: color
      });
    } catch (err) {
      console.error("Error saving avatar color in backend:", err);
    }
  };

  // 4. Fetch user flipbooks from backend
  useEffect(() => {
    if (!effectiveEmail) return;

    const fetchUserFlipbooks = async () => {
      setIsLoadingBooks(true);
      try {
        const res = await axios.get(`${backendUrl}/api/flipbook/list`, {
          params: { emailId: effectiveEmail }
        });
        const allBooks = res.data?.books || [];

        // Deduplicate and filter out 'Recent Book' folder items
        const seenVIds = new Set();
        const uniqueBooks = [];
        for (const b of allBooks) {
          if (b.folder === 'Recent Book' || b.folder === 'Recent book') continue;
          if (b.v_id && seenVIds.has(b.v_id)) continue;
          if (b.v_id) seenVIds.add(b.v_id);
          uniqueBooks.push(b);
        }

        if (uniqueBooks.length === 0 && allBooks.length > 0) {
          for (const b of allBooks) {
            if (b.v_id && seenVIds.has(b.v_id)) continue;
            if (b.v_id) seenVIds.add(b.v_id);
            uniqueBooks.push(b);
          }
        }

        setFlipbooks(uniqueBooks);
      } catch (err) {
        console.error("Error fetching user flipbooks in Profile:", err);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    fetchUserFlipbooks();
  }, [effectiveEmail, backendUrl]);



  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('profile-container');
      const scrollTop = container?.scrollTop || 0;
      const maxScroll = window.innerWidth * 0.15; // 15vw scroll distance for full effect
      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      setScrollProgress(progress);

      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    const container = document.getElementById('profile-container');
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    handleScroll();

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div id="profile-container" className="flex flex-col flex-1 h-full min-h-0 bg-transparent relative overflow-y-auto hide-scrollbar">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0.1vw;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 1vw;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 1vw;
        }
      `}</style>

      {/* Dummy spacer to create 15vw scroll area */}
      <div style={{ height: `calc(100% + 15vw)` }} className="w-full absolute top-0 left-0 pointer-events-none z-[-1]"></div>

      {/* Sticky wrapper for actual content */}
      <div className="sticky top-0 h-full flex flex-col w-full min-h-0 pointer-events-auto">

        {/* Top right menu icon - Moved outside banner wrapper to avoid stacking context issues */}
        <div className="sticky top-0 z-[60] w-full pointer-events-none" style={{ height: 0 }}>
          <div className="absolute top-[1vw] right-[1vw] pointer-events-auto">
            <button
              onClick={() => {
                setIsColorPickerOpen(!isColorPickerOpen);
                if (!isColorPickerOpen) setIsAvatarPopupOpen(false);
              }}
              className="bg-white/60 text-gray-800 p-[0.4vw] rounded-[0.4vw] transition-colors relative z-50 hover:bg-white/80 shadow-sm"
            >
              <Icon icon="mdi:edit-outline" className="w-[1.2vw] h-[1.2vw]" />
            </button>

            {/* Pop-up Color Picker */}
            <ThumbnailPopup
              isOpen={isColorPickerOpen}
              onClose={() => setIsColorPickerOpen(false)}
              bannerBg={bannerBg}
              setBannerBg={handleBannerBgChange}
            />
          </div>
        </div>

        {/* Top Banner Wrapper */}
        <div 
          className="relative w-full rounded-[1vw] z-[05] flex-shrink-0 overflow-hidden"
          style={{ 
            height: `${14 - (8 * scrollProgress)}vw`,
            background: bannerBg.type === 'solid' ? bannerBg.value : undefined,
            backgroundImage: bannerBg.type === 'gradient' ? bannerBg.value : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'height'
          }}
        >
          {/* Parallax Image Banner (Only used for actual images to maintain high FPS) */}
          {(bannerBg.type === 'image' || bannerBg.type === 'media') && (
            <div
              className="absolute top-0 inset-x-0 w-full"
              style={{
                height: `14vw`,
                transform: `translateY(-${scrollProgress * 4}vw)`,
                backgroundImage: bannerBg.value ? `url(${resolveUploadsPath(bannerBg.value.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, ''))})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                willChange: 'transform'
              }}
            ></div>
          )}
          
          {/* Faint wavy overlay could go here, using a CSS radial gradient as a placeholder for the texture */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 150%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% -50%, rgba(255,255,255,0.4) 0%, transparent 50%)' }}></div>
        </div>

        {/* Main Content Area */}
        <div 
          className="flex flex-col md:flex-row relative bg-white border-2 border-gray-200 rounded-[1vw] shadow-sm flex-1 min-h-0 min-w-0 w-full z-[40]"
          style={{ marginTop: `${1 - 0.35 * scrollProgress}vw`, willChange: 'margin-top' }}
        >

          {/* Left Column (Avatar + Info) */}
          <div className="w-[22vw] flex-shrink-0 border-r-2 border-gray-200 relative flex flex-col min-h-0">
            <div className="flex flex-col items-center flex-1 min-h-0 z-[70] w-full">

              {/* Top border eraser for container */}
              <div
                className="absolute top-[-0.2vw] left-[calc(50%-7.5vw)] w-[15vw] h-[0.4vw] bg-white z-10 pointer-events-none"
                style={{ transform: `scaleX(${1 - (0.30 * scrollProgress)})`, transformOrigin: 'center', willChange: 'transform' }}
              ></div>

              {/* Avatar Wrapper */}
              <div
                className="relative flex justify-center items-center z-[70] w-[12vw] h-[12vw] mt-[-6vw]"
                style={{ transform: `scale(${1 - (0.30 * scrollProgress)})`, transformOrigin: 'center', willChange: 'transform' }}
              >
                {/* Left Smooth Corner */}
                <svg className="absolute top-[3.19vw] -left-[1vw] w-[1.5vw] h-[2vw] z-10 pointer-events-none" viewBox="0 0 10 10">
                  <path d="M0,10 L10,10 L10,0 A10,10 0 0,1 0,10 Z" fill="white" />
                </svg>
                {/* Right Smooth Corner */}
                <svg className="absolute top-[3.19vw] -right-[1vw] w-[1.5vw] h-[2vw] z-10 pointer-events-none" viewBox="0 0 10 10">
                  <path d="M10,10 L0,10 L0,0 A10,10 0 0,0 10,10 Z" fill="white" />
                </svg>

                <div className="w-full h-full rounded-full bg-white p-[0.8vw] relative flex items-center justify-center">

                  {/* Semi-circle black border for the bottom half */}
                  <div
                    className="absolute bottom-0 left-0 w-full h-[50%] border-b-2 border-l-2 border-r-2 border-gray-200 rounded-b-full pointer-events-none z-20"
                    style={{ clipPath: 'polygon(0 16%, 100% 16%, 100% 100%, 0 100%)' }}
                  ></div>

                  <svg className="absolute bottom-[41.5%] -left-[1.1vw] w-[1.4vw] h-[1.1vw] z-10 pointer-events-none overflow-visible" viewBox="0 0 10 10">
                    <path d="M -7 0 L 0 0 A 10 10 0 0 1 10 10" fill="none" stroke="#e6e8ec" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                  </svg>
                  {/* Right Smooth Corner */}
                  <svg className="absolute bottom-[41.5%] -right-[1.15vw] w-[1.4vw] h-[1.1vw] z-10 pointer-events-none overflow-visible" viewBox="0 0 10 10">
                    <path d="M 17 0 L 10 0 A 10 10 0 0 0 0 10" fill="none" stroke="#e6e8ec" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                  </svg>

                  <div
                    className="w-[10.7vw] h-[10.7vw] rounded-full overflow-hidden relative shadow-inner z-10 bg-white transition-colors duration-300 flex items-center justify-center"
                    style={{ backgroundColor: (user.picture && user.picture !== 'color_only') ? '#ffffff' : ((user.avatarBgColor && user.avatarBgColor !== '#E8D4C8' && user.avatarBgColor !== '#ffffff') ? user.avatarBgColor : getAvatarColor(user.name || user.email || 'User')) }}
                  >
                    {user.picture && user.picture !== 'color_only' ? (
                      <img
                        src={user.picture.startsWith('blob:') || user.picture.startsWith('data:') ? user.picture : resolveUploadsPath(user.picture)}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-white text-[4.5vw] font-semibold drop-shadow-md">
                        {(() => {
                          const activeName = (user.displayName && user.displayName.trim() !== '') ? user.displayName.trim() : (user.name || user.email || 'U');
                          return activeName.charAt(0).toUpperCase();
                        })()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Camera Edit Icon badge matching screenshot */}
                <div className="absolute top-[1.5vw] right-[0.8vw] z-20">
                  <button
                    onClick={() => {
                      setIsAvatarPopupOpen(!isAvatarPopupOpen);
                      if (!isAvatarPopupOpen) setIsColorPickerOpen(false);
                    }}
                    className="w-[2.2vw] h-[2.2vw] bg-white rounded-full border border-gray-100 shadow-md hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Icon icon="solar:camera-bold" className="w-[1.1vw] h-[1.1vw] text-gray-700" />
                  </button>
                  <div 
                    className="absolute top-0 left-0"
                    style={{ transform: `scale(${1 / (1 - (0.30 * scrollProgress))})`, transformOrigin: 'top left', willChange: 'transform' }}
                  >
                    <AvatarPopup
                      isOpen={isAvatarPopupOpen}
                      onClose={() => setIsAvatarPopupOpen(false)}
                      onSelectAvatar={handleSelectAvatar}
                      onSelectColor={handleSelectColor}
                      currentAvatar={user.picture}
                    />
                  </div>
                </div>
              </div>

              {/* Name and Email */}
              <div 
                className="flex flex-col items-center w-full"
                style={{ 
                  transform: `translateY(-${scrollProgress * 1.8}vw)`, 
                  transition: 'transform 0.05s linear',
                  willChange: 'transform' 
                }}
              >
                <h1 className="text-[1.5vw] font-bold text-gray-900 mt-[0.3vw] truncate max-w-[18vw]">
                  {user.displayName && user.displayName.trim() !== '' ? user.displayName.trim() : (user.name || '')}
                </h1>
                {user.visibilitySettings?.showContact !== false && (
                  <div className="flex items-center gap-[0.4vw] text-[0.8vw] text-gray-500 mt-[0.2vw] truncate max-w-[18vw]">
                    <Icon icon="mdi:check-decagram" className="w-[1vw] h-[1vw] text-[#22c55e] flex-shrink-0" />
                    <span className="truncate font-medium">{user.email}</span>
                  </div>
                )}

                {/* Flipbooks, Followers & Views Stats matching screenshot */}
                <div className="flex items-center justify-center gap-[1.5vw] mt-[1.2vw] w-full px-[1vw]">
                  {/* Flipbooks */}
                  <div className="flex flex-col items-center">
                    <span className="text-[1.2vw] font-bold text-gray-900 leading-none">
                      {flipbooks?.length || 0}
                    </span>
                    <span className="text-[0.75vw] text-gray-400 font-medium mt-[0.35vw]">Flipbooks</span>
                  </div>

                  <div className="w-[1px] h-[1.8vw] bg-gray-200"></div>

                  {/* Followers */}
                  <div className="flex flex-col items-center">
                    <span className="text-[1.2vw] font-bold text-gray-900 leading-none">
                      {(() => {
                        const count = Array.isArray(user.followers) ? user.followers.length : (typeof user.followers === 'number' ? user.followers : 0);
                        if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                        return count;
                      })()}
                    </span>
                    <span className="text-[0.75vw] text-gray-400 font-medium mt-[0.35vw]">Followers</span>
                  </div>

                  <div className="w-[1px] h-[1.8vw] bg-gray-200"></div>

                  {/* Views */}
                  <div className="flex flex-col items-center">
                    <span className="text-[1.2vw] font-bold text-gray-900 leading-none">
                      {(() => {
                        const totalViews = (flipbooks || []).reduce((acc, b) => {
                          const v = Number(b.viewsCount !== undefined ? b.viewsCount : (b.views !== undefined ? b.views : 0));
                          return acc + (isNaN(v) ? 0 : v);
                        }, 0);
                        const viewsVal = user.views !== undefined ? user.views : totalViews;
                        if (viewsVal >= 1000) return (viewsVal / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                        return viewsVal;
                      })()}
                    </span>
                    <span className="text-[0.75vw] text-gray-400 font-medium mt-[0.35vw]">Views</span>
                  </div>
                </div>
              </div>

              {/* Info Cards Container */}
              <div 
                id="left-scroll-container" 
                className="w-full pb-[2vw] flex flex-col flex-1 min-h-0 overflow-y-auto hide-scrollbar rounded-b-[1vw]"
                style={{
                  marginTop: `${1.2 - (scrollProgress * 1.8)}vw`,
                  transition: 'margin-top 0.05s linear',
                  willChange: 'margin-top'
                }}
              >

                {/* Full Name (above About) */}
                {user.name && user.name.trim() !== '' && (
                  <div className="px-[1.2vw] py-[0.9vw] border-b border-gray-100 bg-white">
                    <h3 className="flex items-center gap-[0.55vw] text-[0.9vw] font-semibold text-[#374151] mb-[0.3vw]">
                      <Icon icon="solar:user-bold" className="w-[1.1vw] h-[1.1vw] text-[#4b5563]" />
                      <span>Full Name</span>
                    </h3>
                    <p className="text-[0.82vw] font-medium text-[#22262e] pl-[1.65vw]">
                      {user.name}
                    </p>
                  </div>
                )}

                {/* About */}
                <div className="px-[1.2vw] py-[1vw] border-b border-gray-100 bg-white">
                  <h3 className="flex items-center gap-[0.55vw] text-[0.9vw] font-semibold text-[#374151] mb-[0.6vw]">
                    <Icon icon="ix:about-filled" className="w-[1.25vw] h-[1.25vw] text-[#4b5563]" />
                    <span>About</span>
                  </h3>
                  <p className="text-[0.78vw] text-[#555962] leading-[1.65] font-normal whitespace-pre-wrap">
                    {user.about || 'No about info provided yet.'}
                  </p>
                </div>

                {/* Contact Number */}
                {user.visibilitySettings?.showContact !== false && (
                  <div className="px-[1.2vw] py-[1.2vw] bg-[#f8f9fa] border-y border-[#f0f2f5]">
                    <h3 className="flex items-center gap-[0.6vw] text-[0.92vw] font-semibold text-[#374151] mb-[0.6vw]">
                      <Icon icon="mdi:call" className="w-[1.25vw] h-[1.25vw] text-[#4b5563]" />
                      <span>Contact Number</span>
                    </h3>
                    <div className="flex flex-col gap-[0.3vw] text-[0.82vw] text-[#4b5563] font-normal tracking-wide pl-[0.1vw]">
                      {user.mobile || user.contact1 ? (
                        <div>
                          {user.contact1Label && user.contact1Label !== 'Contact 1' && (
                            <span className="font-semibold text-gray-700 mr-[0.3vw]">{user.contact1Label}:</span>
                          )}
                          <span>{(user.contact1CountryCode || user.countryCode || '+91')} {(user.contact1 || user.mobile)}</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                      {user.contact2 && (
                        <div>
                          {user.contact2Label && user.contact2Label !== 'Contact 2' && (
                            <span className="font-semibold text-gray-700 mr-[0.3vw]">{user.contact2Label}:</span>
                          )}
                          <span>{(user.contact2CountryCode || '+91')} {user.contact2}</span>
                        </div>
                      )}
                      {user.contact3 && (
                        <div>
                          {user.contact3Label && user.contact3Label !== 'Contact 3' && (
                            <span className="font-semibold text-gray-700 mr-[0.3vw]">{user.contact3Label}:</span>
                          )}
                          <span>{(user.contact3CountryCode || '+91')} {user.contact3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Professional Details Section matching screenshot */}
                <div className="px-[1.2vw] py-[1.2vw] border-b border-gray-100 bg-white">
                  <h3 className="flex items-center gap-[0.6vw] text-[0.92vw] font-semibold text-[#374151] mb-[0.8vw]">
                    <Icon icon="material-symbols-light:home-work-rounded" className="w-[1.3vw] h-[1.3vw] text-[#4b5563]" />
                    <span>Professional Details</span>
                  </h3>
                  <div className="text-[0.78vw] flex flex-col gap-[0.55vw] text-[#555962]">
                    <div>
                      <span className="font-semibold text-[#22262e]">Profile : </span>
                      <span>{user.profileType || 'Individual'}</span>
                    </div>
                    {(user.agencyName || user.businessName || user.companyName) && (
                      <div>
                        <span className="font-semibold text-[#22262e]">
                          {user.profileType === 'Company'
                            ? 'Company / Organization : '
                            : (user.profileType === 'Agency'
                              ? 'Agency Name : '
                              : (user.profileType === 'Freelancer' ? 'Business / Brand : ' : 'Company Name : '))}
                        </span>
                        <span>{user.companyName || user.agencyName || user.businessName}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-[#22262e]">Industry Type : </span>
                      <span>{user.industryType || user.industry || 'Software Development'}</span>
                    </div>
                    {user.profileType === 'Freelancer' && user.experience && (
                      <div>
                        <span className="font-semibold text-[#22262e]">Experience : </span>
                        <span>{user.experience}</span>
                      </div>
                    )}
                    {user.profileType === 'Agency' && user.teamSize && (
                      <div>
                        <span className="font-semibold text-[#22262e]">Team Size : </span>
                        <span>{user.teamSize}</span>
                      </div>
                    )}
                    {user.profileType === 'Company' && user.companySize && (
                      <div>
                        <span className="font-semibold text-[#22262e]">Company Size : </span>
                        <span>{user.companySize}</span>
                      </div>
                    )}
                    {(user.businessEmail || user.companyEmail) && user.visibilitySettings?.showContact !== false && (
                      <div>
                        <span className="font-semibold text-[#22262e]">
                          {(user.profileType === 'Freelancer' || user.profileType === 'Agency' || user.profileType === 'Company') ? 'Business Gmail : ' : 'Company Gmail : '}
                        </span>
                        <span>{user.businessEmail || user.companyEmail}</span>
                      </div>
                    )}
                    {(user.profileType === 'Freelancer' || user.profileType === 'Agency' || user.profileType === 'Company') && Array.isArray(user.specialization) && user.specialization.length > 0 && (
                      <div>
                        <span className="font-semibold text-[#22262e]">Specialization : </span>
                        <span>{user.specialization.join(', ')}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-[#22262e]">Service/Expertise : </span>
                      <span>
                        {((Array.isArray(user.services) && user.services.length > 0)
                          ? user.services
                          : ((Array.isArray(user.specialization) && user.specialization.length > 0)
                              ? user.specialization
                              : ['Website', 'Mobile Application', 'IDC', '3D Models', '3D Animations', 'Immencive Website', 'Customized Designs'])
                        ).join(', ')}
                      </span>
                    </div>
                    {user.visibilitySettings?.showContact !== false && Boolean(
                      (user.website && user.website.trim() !== '') ||
                      (user.socials?.website && typeof user.socials.website === 'string' && user.socials.website.trim() !== '')
                    ) && (
                      <div>
                        <span className="font-semibold text-[#22262e]">
                          {user.profileType === 'Company'
                            ? 'Company Website : '
                            : (user.profileType === 'Agency'
                              ? 'Agency Website : '
                              : (user.profileType === 'Freelancer' ? 'Portfolio / Website : ' : 'Website : '))}
                        </span>
                        {(() => {
                          const siteUrl = (user.website && user.website.trim() !== '') ? user.website.trim() : user.socials.website.trim();
                          return (
                            <a
                              href={siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {siteUrl}
                            </a>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                {user.visibilitySettings?.showAddress !== false && (
                  <div className="px-[1.2vw] py-[1.2vw] bg-[#f8f9fa] border-y border-[#f0f2f5]">
                    <h3 className="flex items-center gap-[0.6vw] text-[0.92vw] font-semibold text-[#374151] mb-[0.7vw]">
                      <Icon icon="carbon:location-company-filled" className="w-[1.25vw] h-[1.25vw] text-[#4b5563]" />
                      <span>Address</span>
                    </h3>
                    <div className="text-[0.8vw] flex flex-col gap-[0.35vw] text-[#4b5563] leading-[1.5] font-normal pl-[0.1vw]">
                      {(user.address1 || user.address2) ? (
                        <div>{[user.address1, user.address2].filter(Boolean).join(', ')}</div>
                      ) : null}
                      {(user.city || user.state) ? (
                        <div>{[user.city, user.state].filter(Boolean).join(', ')}</div>
                      ) : null}
                      <div>
                        {[user.country || 'India', user.pincode ? `${user.pincode}` : ''].filter(Boolean).join(' - ')}
                      </div>
                    </div>
                  </div>
                )}

                {user.visibilitySettings?.showSocial !== false && (
                  <div className="px-[1.2vw] py-[1vw] flex gap-[0.6vw] justify-start items-center">
                    {Boolean(user.socials?.website && typeof user.socials.website === 'string' && user.socials.website.trim() !== '') && (
                      <div onClick={() => window.open(user.socials.website.startsWith('http') ? user.socials.website : `https://${user.socials.website}`, '_blank')} className="w-[2vw] h-[2vw] bg-[#1a1a1a] rounded-[0.4vw] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                        <Globe className="w-[1.2vw] h-[1.2vw] text-white" />
                      </div>
                    )}
                    {Boolean(user.socials?.linkedin && typeof user.socials.linkedin === 'string' && user.socials.linkedin.trim() !== '') && (
                      <div onClick={() => window.open(user.socials.linkedin.startsWith('http') ? user.socials.linkedin : `https://${user.socials.linkedin}`, '_blank')} className="w-[2vw] h-[2vw] bg-[#0077b5] rounded-[0.4vw] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                        <Icon icon="mdi:linkedin" className="w-[1.4vw] h-[1.4vw] text-white" />
                      </div>
                    )}
                    {Boolean(user.socials?.instagram && typeof user.socials.instagram === 'string' && user.socials.instagram.trim() !== '') && (
                      <div onClick={() => window.open(user.socials.instagram.startsWith('http') ? user.socials.instagram : `https://${user.socials.instagram}`, '_blank')} className="w-[2vw] h-[2vw] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-[0.4vw] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                        <Icon icon="mdi:instagram" className="w-[1.3vw] h-[1.3vw] text-white" />
                      </div>
                    )}
                    {Boolean(user.socials?.facebook && typeof user.socials.facebook === 'string' && user.socials.facebook.trim() !== '') && (
                      <div onClick={() => window.open(user.socials.facebook.startsWith('http') ? user.socials.facebook : `https://${user.socials.facebook}`, '_blank')} className="w-[2vw] h-[2vw] bg-[#1877f2] rounded-[0.4vw] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                        <Icon icon="mdi:facebook" className="w-[1.4vw] h-[1.4vw] text-white" />
                      </div>
                    )}
                    {Boolean(user.socials?.whatsapp && typeof user.socials.whatsapp === 'string' && user.socials.whatsapp.trim() !== '') && (
                      <div onClick={() => window.open(user.socials.whatsapp.startsWith('http') ? user.socials.whatsapp : `https://wa.me/${user.socials.whatsapp.replace(/[^0-9]/g, '')}`, '_blank')} className="w-[2vw] h-[2vw] bg-[#25d366] rounded-[0.4vw] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                        <Icon icon="mdi:whatsapp" className="w-[1.4vw] h-[1.4vw] text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Buttons + Catalog) */}
          <div className="flex-1 relative h-full min-w-0">
            <div className="flex flex-col h-full w-full z-[45]">
              {/* Header Area */}
              <div className="pt-[1vw] pl-[1vw] pr-[1vw] pb-0 relative flex-shrink-0 z-[60]">

                {/* Buttons Row with permanent sticky Cancel & Save Changes */}
                <div className="flex justify-between items-center w-full relative z-[60]">
                  <div className="flex items-center gap-[0.6vw]">
                    <button
                      type="button"
                      className="px-[1.1vw] py-[0.55vw] text-[0.85vw] font-semibold rounded-[0.6vw] transition-all bg-white text-gray-900 border border-gray-200 shadow-sm cursor-default"
                    >
                      Edit Profile
                    </button>
                  </div>

                  {activeTab === 'Edit Profile' && editProfileActions && (
                    <div className="flex items-center gap-[0.8vw]">
                      <button
                        type="button"
                        disabled={editProfileActions.isSaving}
                        onClick={editProfileActions.handleCancel}
                        className="flex items-center gap-[0.4vw] px-[1.2vw] py-[0.55vw] border border-gray-300 rounded-[0.5vw] text-[0.85vw] font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <X className="w-[1vw] h-[1vw] text-gray-500" strokeWidth={1.8} /> Cancel
                      </button>
                      <button
                        type="button"
                        disabled={editProfileActions.isSaving}
                        onClick={editProfileActions.handleSave}
                        className="flex items-center gap-[0.4vw] px-[1.2vw] py-[0.55vw] bg-[#43A047] hover:bg-[#388E3C] rounded-[0.5vw] text-[0.85vw] font-medium text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {editProfileActions.isSaving ? (
                          <Icon icon="line-md:loading-loop" className="w-[1vw] h-[1vw]" />
                        ) : (
                          <Check className="w-[1vw] h-[1vw] text-white" strokeWidth={2.5} />
                        )}
                        {editProfileActions.isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div id="main-scroll-container" className={`flex-1 pl-[1.5vw] pb-[2vw] custom-scrollbar ${isChildScrollable ? 'overflow-y-auto pr-[1.5vw]' : 'overflow-hidden pr-[1.8vw]'}`}>
                {activeTab === 'Edit Profile' && (
                  <EditProfile
                    user={user}
                    setUser={setUser}
                    onActionReady={setEditProfileActions}
                  />
                )}

                {activeTab === 'Your IDC' && (
                  <div className="flex-1 flex flex-col relative mt-[1.5vw]">
                    {/* Catalog Section */}
                    <h2 className="text-[1.25vw] font-semibold text-gray-900 mb-[1.5vw]">
                      Your Interactive Digital catalog
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1vw]">
                      {isLoadingBooks ? (
                        [1, 2, 3, 4].map((i) => (
                          <div key={i} className="border border-gray-100 rounded-[0.6vw] overflow-hidden bg-white flex flex-col shadow-sm animate-pulse">
                            <div className="relative h-[12vw] bg-gray-100 flex items-center justify-center p-[0.6vw] rounded-t-[0.6vw]">
                              <div className="w-[80%] h-[85%] bg-gray-200/80 rounded-[0.3vw]"></div>
                              <div className="absolute bottom-[0.5vw] right-[0.5vw] w-[3.5vw] h-[1vw] bg-gray-300/80 rounded-full"></div>
                            </div>
                            <div className="p-[0.8vw] flex items-center justify-between border-t border-gray-50 bg-white rounded-b-[0.6vw]">
                              <div className="flex-1 min-w-0 pr-[0.5vw] flex flex-col gap-[0.35vw]">
                                <div className="h-[0.75vw] w-[70%] bg-gray-200 rounded-[0.2vw]"></div>
                                <div className="h-[0.55vw] w-[45%] bg-gray-100 rounded-[0.2vw]"></div>
                              </div>
                              <div className="w-[1.6vw] h-[1.6vw] rounded-full bg-gray-200 flex-shrink-0"></div>
                            </div>
                          </div>
                        ))
                      ) : flipbooks.length > 0 ? (
                        flipbooks.map((book) => {
                          const bookId = book.v_id || book.id;
                          return (
                            <div key={bookId} className="border border-gray-100 rounded-[0.6vw] overflow-visible group hover:shadow-md transition-shadow bg-white flex flex-col shadow-sm relative">

                              <div className="relative h-[12vw] bg-gray-50 overflow-hidden flex items-center justify-center p-[0.6vw] rounded-t-[0.6vw]">
                                <div className="w-full h-full overflow-hidden transform group-hover:scale-105 transition-transform duration-300 drop-shadow-sm rounded-[0.2vw] flex items-center justify-center bg-white">
                                  <LazyPreview
                                    v_id={book.v_id}
                                    emailId={effectiveEmail}
                                    backendUrl={backendUrl}
                                    iframeBaseUrl=""
                                    title={book.title || book.name}
                                    imageUrl={book.image || null}
                                  />
                                </div>
                                <div className="absolute bottom-[0.5vw] right-[0.5vw] bg-black/60 backdrop-blur-sm text-white text-[0.55vw] font-medium px-[0.6vw] py-[0.2vw] rounded-full z-10 pointer-events-none">
                                  {(Array.isArray(book.pages) ? book.pages.length : (typeof book.pages === 'number' ? book.pages : book.pagesCount)) || 0} Pages
                                </div>
                              </div>

                              <div className="p-[0.8vw] flex items-center justify-between border-t border-gray-50 bg-white rounded-b-[0.6vw]">
                                <div className="flex-1 min-w-0 pr-[0.5vw]">
                                  <h4 className="text-[0.75vw] font-semibold text-gray-900 truncate">
                                    {book.title || book.name}
                                  </h4>
                                  <p className="text-[0.6vw] text-gray-500 mt-[0.1vw] truncate">
                                    {book.quotes || 'No description available'}
                                  </p>
                                </div>
                                <div
                                  onMouseEnter={() => setActiveStatsBookId(bookId)}
                                  onMouseLeave={() => setActiveStatsBookId(null)}
                                >
                                  <button
                                    className="bg-black text-white p-[0.35vw] rounded-full hover:bg-gray-800 transition-colors flex-shrink-0 shadow-sm relative z-20"
                                  >
                                    <BarChart2 size="0.8vw" />
                                  </button>

                                  {/* Stats Tooltip */}
                                  {activeStatsBookId === bookId && (
                                    <div className="absolute bottom-[3vw] right-[0.5vw] w-[10vw] bg-[#424242]/95 backdrop-blur-md border border-gray-600/30 rounded-[0.6vw] p-[0.5vw] shadow-2xl z-30 text-white animate-in fade-in zoom-in-95 duration-200">
                                      <div className="flex flex-col gap-[0.4vw] text-[0.65vw] font-medium text-gray-300">
                                        <div>Views : <span className="text-white font-semibold">{book.viewsCount !== undefined ? book.viewsCount : (book.views !== undefined ? book.views : 0)}</span></div>
                                        <div>No of Pages : <span className="text-white font-semibold">{(Array.isArray(book.pages) ? book.pages.length : (typeof book.pages === 'number' ? book.pages : book.pagesCount)) || 0}</span></div>
                                        <div>Added to Shelf : <span className="text-white font-semibold">250k</span></div>
                                        <div className="flex items-center gap-[0.2vw]">
                                          Ratings :
                                          <div className="flex items-center text-yellow-400">
                                            <Icon icon="lucide:star" className="fill-current w-[0.65vw] h-[0.65vw]" />
                                            <Icon icon="lucide:star" className="fill-current w-[0.65vw] h-[0.65vw]" />
                                            <Icon icon="lucide:star" className="fill-current w-[0.65vw] h-[0.65vw]" />
                                            <Icon icon="lucide:star" className="fill-current w-[0.65vw] h-[0.65vw]" />
                                            <Icon icon="lucide:star" className="w-[0.65vw] h-[0.65vw]" />
                                          </div>
                                          <span className="text-gray-400">(4.5)</span>
                                        </div>
                                        <div>No of Ratings : <span className="text-white font-semibold">1528</span></div>
                                      </div>

                                      <div className="mt-[0.5vw] flex justify-start">
                                        <a href="#" className="flex items-center gap-[0.2vw] text-[0.75vw] text-white hover:text-gray-200 underline underline-offset-2 transition-colors">
                                          View More details
                                          <Icon icon="lucide:arrow-up-right" className="w-[1vw] h-[1vw]" />
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full py-[3vw] flex flex-col items-center justify-center text-gray-400">
                          <BookOpen className="w-[2.5vw] h-[2.5vw] text-gray-300 mb-[0.5vw]" />
                          <p className="text-[0.9vw] font-medium text-gray-500">No Interactive Digital Catalogs Found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'Activity' && <Activity userEmail={effectiveEmail} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
