import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Pencil, Info, Phone, User, Building, MapPin, BarChart2, MoreVertical, Globe, BookOpen, Check, X } from 'lucide-react';
import { Icon } from '@iconify/react';
import ThumbnailPopup from '../Thumbnail_Popup';
import AvatarPopup from '../AvatarPopup';
import ImageCropModal from '../ImageCropModal';
import EditProfile from './EditProfile';
import Activity from '../Activity';
import { useAuth } from '../../../context/AuthContext';
import { resolveUploadsPath } from '../../../utils/assetUtils';
import { getInitialUser } from '../../../utils/authUtils';

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
          axios.get(`${backendUrl}/api/flipbook/preview/${v_id}`, { withCredentials: true })
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
  contact1: '',
  contact1CountryCode: '+91',
  contact1Label: 'Contact 1',
  contact2: '',
  contact2CountryCode: '+91',
  contact2Label: 'Contact 2',
  contact3: '',
  contact3CountryCode: '+91',
  contact3Label: 'Contact 3',
  contactCount: 2,
  profileType: '',
  professionalTitle: '',
  companyName: '',
  industryType: '',
  companyEmail: '',
  website: '',
  services: [],
  specialization: [],
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
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const context = useOutletContext();
  const navigate = useNavigate();
  const [localProfileData, setLocalProfileData] = useState({});

  const effectiveAuthUser = context?.user || authUser || getInitialUser();
  const user = useMemo(() => ({
    ...defaultProfile,
    ...(effectiveAuthUser || {}),
    ...localProfileData
  }), [effectiveAuthUser, localProfileData]);

  const displayUser = user;

  const setUser = useCallback((updater) => {
    setLocalProfileData(prev => {
      const currentFull = { ...defaultProfile, ...(effectiveAuthUser || {}), ...prev };
      const nextChanges = typeof updater === 'function' ? updater(currentFull) : updater;
      const merged = { ...currentFull, ...nextChanges };

      // Defer parent context and Redux sync to next microtick to avoid React render conflict
      setTimeout(() => {
        if (context?.setUser) {
          context.setUser(cPrev => ({ ...cPrev, ...nextChanges }));
        }
        if (setAuthUser) {
          setAuthUser(merged);
        }
      }, 0);

      return { ...prev, ...nextChanges };
    });
  }, [effectiveAuthUser, context?.setUser, setAuthUser]);

  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e?.detail) {
        setLocalProfileData(prev => ({
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
  const bannerPopupRef = useRef(null);
  const avatarPopupRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (bannerPopupRef.current && !bannerPopupRef.current.contains(e.target)) {
        setIsColorPickerOpen(false);
      }
      if (avatarPopupRef.current && !avatarPopupRef.current.contains(e.target)) {
        setIsAvatarPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  const [activeTab, setActiveTab] = useState('Edit Profile');
  const [editProfileActions, setEditProfileActions] = useState(null);
  const [bannerBg, setBannerBg] = useState({
    type: 'gradient',
    value: 'linear-gradient(to bottom right, #c1e8d7, #85d8c3, #60bba3)'
  });
  const [cropModal, setCropModal] = useState({
    isOpen: false,
    imageSrc: null,
    cropType: 'avatar', // 'avatar' | 'banner'
    title: ''
  });

  const handleStartCrop = (fileOrSrc, cropType = 'avatar') => {
    setIsAvatarPopupOpen(false);
    setIsColorPickerOpen(false);
    setCropModal({
      isOpen: true,
      imageSrc: fileOrSrc,
      cropType,
      title: cropType === 'avatar' ? 'Crop Profile Avatar' : 'Crop Banner Image'
    });
  };

  const handleCropComplete = (croppedFile, croppedDataUrl) => {
    if (cropModal.cropType === 'avatar') {
      handleSelectAvatar(croppedFile);
    } else if (cropModal.cropType === 'banner') {
      handleBannerBgChange({
        type: 'media',
        file: croppedFile,
        value: `url(${croppedDataUrl})`
      });
    }
    setCropModal(prev => ({ ...prev, isOpen: false, imageSrc: null }));
  };

  const [isChildScrollable, setIsChildScrollable] = useState(true);

  useEffect(() => {
    setIsChildScrollable(true);
  }, []);

  const [flipbooks, setFlipbooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  const { useremail } = useParams();
  const rawRouteEmail = useremail ? decodeURIComponent(useremail).trim() : '';
  const initialCookieUser = useMemo(() => getInitialUser(), []);
  const fallbackEmail = (
    authUser?.emailId ||
    authUser?.email ||
    context?.user?.emailId ||
    context?.user?.email ||
    initialCookieUser?.emailId ||
    initialCookieUser?.email ||
    ''
  ).trim();
  const ownEmail = (user?.emailId || user?.email || fallbackEmail).trim();
  const effectiveEmail = ownEmail || rawRouteEmail;

  // 1. Fetch user profile from backend
  useEffect(() => {
    if (!effectiveEmail) return;

    let isMounted = true;
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/profile`, {
          withCredentials: true
        });
        const p = res.data?.profile || (res.data?.emailId ? res.data : null);
        if (p && isMounted) {
          const updated = {
            ...defaultProfile,
            ...(effectiveAuthUser || {}),
            ...p,
            about: p.about !== undefined ? p.about : (user.about || ''),
            mobile: p.mobile !== undefined ? p.mobile : (user.mobile || ''),
            countryCode: p.countryCode || user.countryCode || '+91',
            contact1: p.contact1 !== undefined ? p.contact1 : (user.contact1 || p.mobile || user.mobile || ''),
            contact1CountryCode: p.contact1CountryCode || user.contact1CountryCode || p.countryCode || user.countryCode || '+91',
            contact1Label: p.contact1Label !== undefined ? p.contact1Label : (user.contact1Label || 'Contact 1'),
            contact2: p.contact2 !== undefined ? p.contact2 : (user.contact2 || ''),
            contact2CountryCode: p.contact2CountryCode || user.contact2CountryCode || '+91',
            contact2Label: p.contact2Label !== undefined ? p.contact2Label : (user.contact2Label || 'Contact 2'),
            contact3: p.contact3 !== undefined ? p.contact3 : (user.contact3 || ''),
            contact3CountryCode: p.contact3CountryCode || user.contact3CountryCode || '+91',
            contact3Label: p.contact3Label !== undefined ? p.contact3Label : (user.contact3Label || 'Contact 3'),
            contactCount: p.contactCount !== undefined ? p.contactCount : (user.contactCount || 2),
            displayName: p.displayName || p.name || user.displayName || '',
            profileType: p.profileType || user.profileType || '',
            professionalTitle: p.professionalTitle || p.title || user.professionalTitle || user.title || '',
            address1: p.address1 !== undefined ? p.address1 : (user.address1 || ''),
            address2: p.address2 !== undefined ? p.address2 : (user.address2 || ''),
            city: p.city !== undefined ? p.city : (user.city || ''),
            state: p.state !== undefined ? p.state : (user.state || ''),
            pincode: p.pincode !== undefined ? p.pincode : (user.pincode || ''),
            country: p.country !== undefined ? p.country : (user.country || 'INDIA'),
            companyName: p.companyName !== undefined ? p.companyName : (user.companyName || ''),
            industryType: p.industryType !== undefined ? p.industryType : (user.industryType || user.industry || ''),
            companyEmail: p.companyEmail !== undefined ? p.companyEmail : (user.companyEmail || ''),
            website: p.website !== undefined ? p.website : (user.website || ''),
            email: p.emailId || effectiveEmail,
            emailId: p.emailId || effectiveEmail,
            name: p.name || user.name || (effectiveEmail.split('@')[0]),
            picture: p.picture || user.picture || null,
            company_logo_url: p.company_logo_url || p.companyLogo || user.company_logo_url || user.companyLogo || '',
            companyLogo: p.company_logo_url || p.companyLogo || user.company_logo_url || user.companyLogo || '',
            avatarBgColor: p.avatarBgColor || user.avatarBgColor || '#E8D4C8',
            services: p.services || user.services || [],
            followers: p.followers || user.followers || [],
            following: p.following || user.following || [],
            visibilitySettings: {
              showInExplore: true,
              showContact: true,
              showAddress: true,
              showSocial: true,
              ...(user.visibilitySettings || {}),
              ...(p.visibilitySettings || {})
            },
            socials: {
              ...defaultProfile.socials,
              ...(p.socials || user.socials || {})
            }
          };
          setUser(updated);
          if (p.bannerBg) {
            setBannerBg(p.bannerBg);
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
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
          withCredentials: true
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





  return (
    <div id="profile-container" className="flex flex-col flex-1 h-full min-h-0 bg-transparent relative overflow-hidden">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0.35vw;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 1vw;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 1vw;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        .custom-scrollbar::-webkit-scrollbar-button {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>

      {/* Main content wrapper */}
      <div className="h-full flex flex-col w-full min-h-0 pointer-events-auto">

        {/* Top right menu icon - Moved outside banner wrapper to avoid stacking context issues */}
        <div className="sticky top-0 z-[60] w-full pointer-events-none" style={{ height: 0 }}>
          <div ref={bannerPopupRef} className="absolute top-[1vw] right-[1vw] pointer-events-auto flex items-center gap-[0.4vw]">
            {(bannerBg.type === 'image' || bannerBg.type === 'media') && bannerBg.value && (
              <button
                onClick={() => {
                  const rawSrc = bannerBg.file || bannerBg.value.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
                  handleStartCrop(rawSrc, 'banner');
                }}
                className="bg-white/80 hover:bg-white text-gray-800 px-[0.6vw] py-[0.35vw] rounded-[0.4vw] transition-colors relative z-50 shadow-sm flex items-center gap-[0.3vw] text-[0.75vw] font-medium cursor-pointer"
                title="Crop Banner"
              >
                <Icon icon="solar:crop-bold" className="w-[1vw] h-[1vw] text-gray-700" />
                <span>Crop Banner</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsColorPickerOpen(!isColorPickerOpen);
                if (!isColorPickerOpen) setIsAvatarPopupOpen(false);
              }}
              className="bg-white/60 text-gray-800 p-[0.4vw] rounded-[0.4vw] transition-colors relative z-50 hover:bg-white/80 shadow-sm cursor-pointer"
              title="Edit Banner"
            >
              <Icon icon="mdi:edit-outline" className="w-[1.2vw] h-[1.2vw]" />
            </button>

            {/* Pop-up Color Picker */}
            <ThumbnailPopup
              isOpen={isColorPickerOpen}
              onClose={() => setIsColorPickerOpen(false)}
              bannerBg={bannerBg}
              setBannerBg={handleBannerBgChange}
              onStartCrop={handleStartCrop}
            />
          </div>
        </div>

        {/* Top Banner Wrapper (Fixed default height of 14vw, no scroll resize) */}
        <div 
          className="relative w-full rounded-[1vw] z-[05] flex-shrink-0 overflow-hidden h-[9.5vw]"
          style={{ 
            background: bannerBg.type === 'solid' ? bannerBg.value : undefined,
            backgroundImage: bannerBg.type === 'gradient' ? bannerBg.value : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Static Image Banner */}
          {(bannerBg.type === 'image' || bannerBg.type === 'media') && (
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: bannerBg.value ? `url(${resolveUploadsPath(bannerBg.value.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, ''))})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            ></div>
          )}
          
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 150%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% -50%, rgba(255,255,255,0.4) 0%, transparent 50%)' }}></div>
        </div>

        {/* Main Content Area */}
        <div 
          className="flex flex-col md:flex-row relative bg-white border-2 border-gray-200 rounded-[1vw] shadow-sm flex-1 min-h-0 min-w-0 w-full z-[40] mt-[1vw]"
        >

          {/* Left Column (Avatar + Info) */}
          <div className="w-[22vw] flex-shrink-0 border-r-2 border-gray-200 relative flex flex-col min-h-0">
            <div className="flex flex-col items-center flex-1 min-h-0 z-[70] w-full">

              {/* Top border eraser for container */}
              <div
                className="absolute top-[-0.2vw] left-[calc(50%-5.7vw)] w-[11.4vw] h-[0.4vw] bg-white z-10 pointer-events-none"
              ></div>

              {/* Avatar Wrapper (Fixed default size, no scroll scaling) */}
              <div
                className="relative flex justify-center items-center z-[70] w-[10.5vw] h-[10.5vw] mt-[-6.3vw]"
              >
                {/* Left Smooth Corner (White fill) */}
                <svg className="absolute top-[4.75vw] -left-[1vw] w-[1.5vw] h-[1.8vw] z-10 pointer-events-none" viewBox="0 0 10 10">
                  <path d="M0,10 L10,10 L10,0 A10,10 0 0,1 0,10 Z" fill="white" />
                </svg>
                {/* Right Smooth Corner (White fill) */}
                <svg className="absolute top-[4.75vw] -right-[1vw] w-[1.5vw] h-[1.8vw] z-10 pointer-events-none" viewBox="0 0 10 10">
                  <path d="M10,10 L0,10 L0,0 A10,10 0 0,0 10,10 Z" fill="white" />
                </svg>

                <div className="w-full h-full rounded-full bg-white p-[0.8vw] relative flex items-center justify-center">

                  {/* Perfect Round Circular Arc for the bottom half */}
                  <div
                    className="absolute inset-0 w-full h-full border-2 border-gray-200 rounded-full pointer-events-none z-20"
                    style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 100%, 0 100%)' }}
                  ></div>

                  {/* Left Connecting Curve to Container Top Border */}
                  <svg className="absolute top-[6.3vw] -left-[0.98vw] w-[1vw] h-[1vw] z-20 pointer-events-none overflow-visible" viewBox="0 0 10 10">
                    <path d="M -10 0 L 0 0 A 10 10 0 0 1 10 10" fill="none" stroke="#e5e7eb" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                  </svg>
                  {/* Right Connecting Curve to Container Top Border */}
                  <svg className="absolute top-[6.3vw] -right-[0.98vw] w-[1vw] h-[1vw] z-20 pointer-events-none overflow-visible" viewBox="0 0 10 10">
                    <path d="M 20 0 L 10 0 A 10 10 0 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                  </svg>

                  <div
                    className="w-[9.3vw] h-[9.3vw] rounded-full overflow-hidden relative shadow-inner z-10 bg-white transition-colors duration-300 flex items-center justify-center"
                    style={{ backgroundColor: (displayUser.picture && displayUser.picture !== 'color_only') ? '#ffffff' : ((displayUser.avatarBgColor && displayUser.avatarBgColor !== '#E8D4C8' && displayUser.avatarBgColor !== '#ffffff') ? displayUser.avatarBgColor : getAvatarColor(displayUser.name || displayUser.email || 'User')) }}
                  >
                    {displayUser.picture && displayUser.picture !== 'color_only' ? (
                      <img
                        src={displayUser.picture.startsWith('blob:') || displayUser.picture.startsWith('data:') ? displayUser.picture : resolveUploadsPath(displayUser.picture)}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-white text-[3.9vw] font-semibold drop-shadow-md">
                        {(() => {
                          const activeName = (displayUser.displayName && displayUser.displayName.trim() !== '') ? displayUser.displayName.trim() : (displayUser.name || displayUser.email || 'U');
                          return activeName.charAt(0).toUpperCase();
                        })()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Camera Edit Icon badge matching screenshot */}
                <div ref={avatarPopupRef} className="absolute top-[1.1vw] right-[0.5vw] z-20">
                  <button
                    onClick={() => {
                      setIsAvatarPopupOpen(!isAvatarPopupOpen);
                      if (!isAvatarPopupOpen) setIsColorPickerOpen(false);
                    }}
                    className="w-[1.95vw] h-[1.95vw] bg-white rounded-full border border-gray-100 shadow-md hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Icon icon="solar:camera-bold" className="w-[0.95vw] h-[0.95vw] text-gray-700" />
                  </button>
                  <div className="absolute top-0 left-0">
                    <AvatarPopup
                      isOpen={isAvatarPopupOpen}
                      onClose={() => setIsAvatarPopupOpen(false)}
                      onSelectAvatar={handleSelectAvatar}
                      onSelectColor={handleSelectColor}
                      currentAvatar={displayUser.picture}
                      onStartCrop={handleStartCrop}
                    />
                  </div>
                </div>
              </div>

              {/* Name and Email */}
              <div className="flex flex-col items-center w-full">
                <h1 className="text-[1.25vw] font-semibold text-gray-900 mt-[0.3vw] truncate max-w-[18vw]">
                  {displayUser.displayName && displayUser.displayName.trim() !== '' ? displayUser.displayName.trim() : (displayUser.name || '')}
                </h1>
                {displayUser.visibilitySettings?.showContact !== false && (
                  <div className="flex items-center gap-[0.4vw] text-[0.75vw] text-gray-500 mt-[0.2vw] truncate max-w-[18vw]">
                    <Icon icon="mdi:check-decagram" className="w-[0.95vw] h-[0.95vw] text-[#22c55e] flex-shrink-0" />
                    <span className="truncate font-normal">{displayUser.email}</span>
                  </div>
                )}

                {/* Flipbooks, Followers & Views Stats matching screenshot */}
                <div className="flex items-center justify-center gap-[1.5vw] mt-[1.2vw] w-full px-[1vw]">
                  {/* Flipbooks */}
                  <div className="flex flex-col items-center">
                    <span className="text-[1.05vw] font-semibold text-gray-900 leading-none">
                      {flipbooks?.length || 0}
                    </span>
                    <span className="text-[0.7vw] text-gray-400 font-normal mt-[0.35vw]">Flipbooks</span>
                  </div>

                  <div className="w-[1px] h-[1.8vw] bg-gray-200"></div>

                  {/* Followers */}
                  <div className="flex flex-col items-center">
                    <span className="text-[1.05vw] font-semibold text-gray-900 leading-none">
                      {(() => {
                        const count = Array.isArray(displayUser.followers) ? displayUser.followers.length : (typeof displayUser.followers === 'number' ? displayUser.followers : 0);
                        if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                        return count;
                      })()}
                    </span>
                    <span className="text-[0.7vw] text-gray-400 font-normal mt-[0.35vw]">Followers</span>
                  </div>

                  <div className="w-[1px] h-[1.8vw] bg-gray-200"></div>

                  {/* Views */}
                  <div className="flex flex-col items-center">
                    <span className="text-[1.05vw] font-semibold text-gray-900 leading-none">
                      {(() => {
                        const totalViews = (flipbooks || []).reduce((acc, b) => {
                          const v = Number(b.viewsCount !== undefined ? b.viewsCount : (b.views !== undefined ? b.views : 0));
                          return acc + (isNaN(v) ? 0 : v);
                        }, 0);
                        const viewsVal = displayUser.views !== undefined ? displayUser.views : totalViews;
                        if (viewsVal >= 1000) return (viewsVal / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                        return viewsVal;
                      })()}
                    </span>
                    <span className="text-[0.7vw] text-gray-400 font-normal mt-[0.35vw]">Views</span>
                  </div>
                </div>
              </div>

              {/* Info Cards Container */}
              <div 
                id="left-scroll-container" 
                className="w-full px-[1.5vw] py-[1.2vw] flex flex-col gap-[1.6vw] flex-1 min-h-0 overflow-y-auto hide-scrollbar rounded-b-[1vw]"
              >
                {/* 1. Profile Details Section */}
                <div className="flex flex-col gap-[0.9vw]">
                  <div className="flex items-center gap-[0.45vw] text-[#ec5137]">
                    <Icon icon="solar:user-bold" className="w-[1.05vw] h-[1.05vw] flex-shrink-0" />
                    <h3 className="text-[0.82vw] font-medium text-[#374151] tracking-tight leading-none">Profile Details</h3>
                  </div>

                  <div className="flex flex-col gap-[1.1vw] pl-[0.1vw]">
                    {/* Full Name */}
                    {displayUser.name || displayUser.displayName ? (
                      <div>
                        <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Full Name</p>
                        <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                          {displayUser.name || displayUser.displayName}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-[0.35vw]">
                        <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Full Name</p>
                        <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                      </div>
                    )}

                    {/* Profile Type */}
                    <div>
                      <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Profile Type</p>
                      <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                        {displayUser.profileType || '-'}
                      </p>
                    </div>

                    {/* Conditional Fields based on Profile Type */}
                    {(!displayUser.profileType || displayUser.profileType === 'Individual') ? (
                      (displayUser.professionalTitle || displayUser.title) ? (
                        <div>
                          <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Professional Title</p>
                          <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                            {displayUser.professionalTitle || displayUser.title}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-[0.35vw]">
                          <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Professional Title</p>
                          <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                        </div>
                      )
                    ) : displayUser.profileType === 'Company' ? (
                      <>
                        {/* Industry Type */}
                        <div>
                          <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Industry Type</p>
                          <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                            {displayUser.industryType || displayUser.industry || 'Software Development'}
                          </p>
                        </div>

                        {/* Company / Organization */}
                        {(displayUser.companyName || displayUser.businessName) ? (
                          <div>
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Company / Organization</p>
                            <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                              {displayUser.companyName || displayUser.businessName}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-[0.35vw]">
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Company / Organization</p>
                            <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                          </div>
                        )}

                        {/* Company Size */}
                        {displayUser.companySize ? (
                          <div>
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Company Size</p>
                            <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                              {displayUser.companySize}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-[0.35vw]">
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Company Size</p>
                            <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                          </div>
                        )}

                        {/* Business / Company Gmail */}
                        {(displayUser.businessEmail || displayUser.companyEmail) ? (
                          <div>
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Company Gmail</p>
                            <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                              {displayUser.businessEmail || displayUser.companyEmail}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-[0.35vw]">
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Company Gmail</p>
                            <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                          </div>
                        )}
                      </>
                    ) : displayUser.profileType === 'Agency' ? (
                      <>
                        {/* Industry Type */}
                        <div>
                          <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Industry Type</p>
                          <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                            {displayUser.industryType || displayUser.industry || 'Software Development'}
                          </p>
                        </div>

                        {/* Agency Name */}
                        {(displayUser.agencyName || displayUser.companyName || displayUser.businessName) ? (
                          <div>
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Agency Name</p>
                            <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                              {displayUser.agencyName || displayUser.companyName || displayUser.businessName}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-[0.35vw]">
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Agency Name</p>
                            <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                          </div>
                        )}

                        {/* Team Size */}
                        {displayUser.teamSize ? (
                          <div>
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Team Size</p>
                            <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                              {displayUser.teamSize}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-[0.35vw]">
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Team Size</p>
                            <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                          </div>
                        )}

                        {/* Business Gmail */}
                        {(displayUser.businessEmail || displayUser.companyEmail) ? (
                          <div>
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Business Gmail</p>
                            <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                              {displayUser.businessEmail || displayUser.companyEmail}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-[0.35vw]">
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Business Gmail</p>
                            <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Freelancer */
                      <>
                        {/* Industry Type */}
                        <div>
                          <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Industry Type</p>
                          <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                            {displayUser.industryType || displayUser.industry || 'Software Development'}
                          </p>
                        </div>

                        {/* Business / Brand Name */}
                        {(displayUser.businessName || displayUser.companyName) ? (
                          <div>
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Business / Brand Name</p>
                            <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                              {displayUser.businessName || displayUser.companyName}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-[0.35vw]">
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Business / Brand Name</p>
                            <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                          </div>
                        )}

                        {/* Experience */}
                        {displayUser.experience ? (
                          <div>
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Experience</p>
                            <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                              {displayUser.experience}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-[0.35vw]">
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Experience</p>
                            <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                          </div>
                        )}

                        {/* Business Gmail */}
                        {(displayUser.businessEmail || displayUser.companyEmail) ? (
                          <div>
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Business Gmail</p>
                            <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                              {displayUser.businessEmail || displayUser.companyEmail}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-[0.35vw]">
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Business Gmail</p>
                            <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Skills / Expertise */}
                    {(() => {
                      const skillsList = (Array.isArray(displayUser.services) && displayUser.services.length > 0)
                        ? displayUser.services
                        : (Array.isArray(displayUser.skills) && displayUser.skills.length > 0 ? displayUser.skills : []);
                      return skillsList.length > 0 ? (
                        <div>
                          <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Skills / Expertise</p>
                          <p className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw]">
                            {skillsList.join(', ')}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-[0.35vw]">
                          <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Skills / Expertise</p>
                          <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                        </div>
                      );
                    })()}

                    {/* About */}
                    {displayUser.about ? (
                      <div>
                        <p className="text-[0.82vw] text-gray-400 font-normal leading-none">About</p>
                        <p className="text-[0.82vw] text-gray-700 font-normal leading-relaxed mt-[0.35vw] whitespace-pre-wrap">
                          {displayUser.about}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-[0.35vw]">
                        <p className="text-[0.82vw] text-gray-400 font-normal leading-none">About</p>
                        <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Contact & Location Section */}
                {displayUser.visibilitySettings?.showContact !== false && (
                  <div className="flex flex-col gap-[0.9vw]">
                    <div className="flex items-center gap-[0.45vw] text-[#ec5137]">
                      <Icon icon="solar:map-point-bold" className="w-[1.05vw] h-[1.05vw] flex-shrink-0" />
                      <h3 className="text-[0.82vw] font-medium text-[#374151] tracking-tight leading-none">Contact & Location</h3>
                    </div>

                    <div className="flex flex-col gap-[1.1vw] pl-[0.1vw]">
                      {/* Number */}
                      {displayUser.mobile || displayUser.contact1 ? (
                        <div>
                          <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Number</p>
                          <div className="text-[0.82vw] text-gray-700 font-normal leading-snug mt-[0.35vw] flex flex-col gap-[0.15vw]">
                            <div>
                              {displayUser.contact1Label && displayUser.contact1Label !== 'Contact 1' && (
                                <span className="font-normal text-gray-500 mr-[0.25vw]">{displayUser.contact1Label}:</span>
                              )}
                              <span>{(displayUser.contact1CountryCode || displayUser.countryCode || '+91')} {(displayUser.contact1 || displayUser.mobile)}</span>
                            </div>
                            {displayUser.contact2 && (
                              <div>
                                {displayUser.contact2Label && displayUser.contact2Label !== 'Contact 2' && (
                                  <span className="font-normal text-gray-500 mr-[0.25vw]">{displayUser.contact2Label}:</span>
                                )}
                                <span>{(displayUser.contact2CountryCode || '+91')} {displayUser.contact2}</span>
                              </div>
                            )}
                            {displayUser.contact3 && (
                              <div>
                                {displayUser.contact3Label && displayUser.contact3Label !== 'Contact 3' && (
                                  <span className="font-normal text-gray-500 mr-[0.25vw]">{displayUser.contact3Label}:</span>
                                )}
                                <span>{(displayUser.contact3CountryCode || '+91')} {displayUser.contact3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-[0.35vw]">
                          <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Number</p>
                          <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                        </div>
                      )}

                      {/* Address */}
                      {displayUser.visibilitySettings?.showAddress !== false && (() => {
                        const lines = [];
                        if (displayUser.address1) lines.push(displayUser.address1);
                        const line2 = [displayUser.address2, displayUser.city].filter(Boolean).join(' , ');
                        if (line2) lines.push(line2);
                        const statePart = displayUser.state && displayUser.state !== 'None' ? displayUser.state : '';
                        const pinPart = displayUser.pincode ? `${displayUser.pincode}` : '';
                        const line3 = [statePart, pinPart].filter(Boolean).join(' - ');
                        if (line3) {
                          const fullLine3 = displayUser.country && displayUser.country !== 'None' && displayUser.country !== 'INDIA'
                            ? `${line3}, ${displayUser.country}`
                            : line3;
                          lines.push(fullLine3);
                        } else if (displayUser.country && displayUser.country !== 'None' && displayUser.country !== 'INDIA') {
                          lines.push(displayUser.country);
                        }

                        if (lines.length === 0) {
                          return (
                            <div className="flex items-center gap-[0.35vw]">
                              <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Address</p>
                              <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                            </div>
                          );
                        }

                        return (
                          <div>
                            <p className="text-[0.82vw] text-gray-400 font-normal leading-none">Address</p>
                            <div className="text-[0.82vw] text-gray-700 font-normal leading-relaxed mt-[0.35vw]">
                              <div className="flex flex-col">
                                {lines.map((l, i) => (
                                  <span key={i}>{l}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 3. Social Media & Links Section */}
                {displayUser.visibilitySettings?.showSocial !== false && (() => {
                  const hasWebsite = Boolean((displayUser.socials?.website && typeof displayUser.socials.website === 'string' && displayUser.socials.website.trim() !== '') || (displayUser.website && typeof displayUser.website === 'string' && displayUser.website.trim() !== ''));
                  const hasLinkedin = Boolean(displayUser.socials?.linkedin && typeof displayUser.socials.linkedin === 'string' && displayUser.socials.linkedin.trim() !== '');
                  const hasInstagram = Boolean(displayUser.socials?.instagram && typeof displayUser.socials.instagram === 'string' && displayUser.socials.instagram.trim() !== '');
                  const hasFacebook = Boolean(displayUser.socials?.facebook && typeof displayUser.socials.facebook === 'string' && displayUser.socials.facebook.trim() !== '');
                  const hasWhatsapp = Boolean(displayUser.socials?.whatsapp && typeof displayUser.socials.whatsapp === 'string' && displayUser.socials.whatsapp.trim() !== '');

                  const hasAny = hasWebsite || hasLinkedin || hasInstagram || hasFacebook || hasWhatsapp;

                  if (!hasAny) {
                    return (
                      <div className="flex items-center gap-[0.35vw]">
                        <div className="flex items-center gap-[0.45vw] text-[#ec5137]">
                          <Icon icon="streamline-ultimate:corporate-social-media" className="w-[1.05vw] h-[1.05vw] flex-shrink-0" />
                          <h3 className="text-[0.82vw] font-semibold text-gray-900 tracking-tight leading-none">Social Media & Links</h3>
                        </div>
                        <span className="text-[0.74vw] text-gray-400 font-normal leading-none">-</span>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-[0.9vw]">
                      <div className="flex items-center gap-[0.45vw] text-[#ec5137]">
                        <Icon icon="streamline-ultimate:corporate-social-media" className="w-[1.05vw] h-[1.05vw] flex-shrink-0" />
                        <h3 className="text-[0.82vw] font-semibold text-gray-900 tracking-tight leading-none">Social Media & Links</h3>
                      </div>

                      <div className="flex items-center gap-[0.55vw] mt-[0.1vw] flex-wrap">
                        {/* Website */}
                        {hasWebsite && (
                          <div
                            onClick={() => {
                              const site = displayUser.socials?.website || displayUser.website;
                              if (site) window.open(site.startsWith('http') ? site : `https://${site}`, '_blank');
                            }}
                            className="w-[2.2vw] h-[2.2vw] bg-[#1a1a1a] rounded-[0.45vw] flex items-center justify-center transition-opacity shadow-xs cursor-pointer hover:opacity-80"
                            title={displayUser.socials?.website || displayUser.website || 'Website'}
                          >
                            <Globe className="w-[1.2vw] h-[1.2vw] text-white" />
                          </div>
                        )}

                        {/* LinkedIn */}
                        {hasLinkedin && (
                          <div
                            onClick={() => {
                              const li = displayUser.socials?.linkedin;
                              if (li) window.open(li.startsWith('http') ? li : `https://${li}`, '_blank');
                            }}
                            className="w-[2.2vw] h-[2.2vw] bg-[#0077b5] rounded-[0.45vw] flex items-center justify-center transition-opacity shadow-xs cursor-pointer hover:opacity-80"
                            title={displayUser.socials?.linkedin || 'LinkedIn'}
                          >
                            <Icon icon="mdi:linkedin" className="w-[1.4vw] h-[1.4vw] text-white" />
                          </div>
                        )}

                        {/* Instagram */}
                        {hasInstagram && (
                          <div
                            onClick={() => {
                              const ig = displayUser.socials?.instagram;
                              if (ig) window.open(ig.startsWith('http') ? ig : `https://${ig}`, '_blank');
                            }}
                            className="w-[2.2vw] h-[2.2vw] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-[0.45vw] flex items-center justify-center transition-opacity shadow-xs cursor-pointer hover:opacity-80"
                            title={displayUser.socials?.instagram || 'Instagram'}
                          >
                            <Icon icon="mdi:instagram" className="w-[1.3vw] h-[1.3vw] text-white" />
                          </div>
                        )}

                        {/* Facebook */}
                        {hasFacebook && (
                          <div
                            onClick={() => {
                              const fb = displayUser.socials?.facebook;
                              if (fb) window.open(fb.startsWith('http') ? fb : `https://${fb}`, '_blank');
                            }}
                            className="w-[2.2vw] h-[2.2vw] bg-[#1877f2] rounded-[0.45vw] flex items-center justify-center transition-opacity shadow-xs cursor-pointer hover:opacity-80"
                            title={displayUser.socials?.facebook || 'Facebook'}
                          >
                            <Icon icon="mdi:facebook" className="w-[1.4vw] h-[1.4vw] text-white" />
                          </div>
                        )}

                        {/* WhatsApp */}
                        {hasWhatsapp && (
                          <div
                            onClick={() => {
                              const wa = displayUser.socials?.whatsapp;
                              if (wa) window.open(wa.startsWith('http') ? wa : `https://wa.me/${wa.replace(/[^0-9]/g, '')}`, '_blank');
                            }}
                            className="w-[2.2vw] h-[2.2vw] bg-[#25d366] rounded-[0.45vw] flex items-center justify-center transition-opacity shadow-xs cursor-pointer hover:opacity-80"
                            title={displayUser.socials?.whatsapp || 'WhatsApp'}
                          >
                            <Icon icon="mdi:whatsapp" className="w-[1.4vw] h-[1.4vw] text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Right Column (Buttons + Catalog) */}
          <div className="flex-1 relative h-full min-w-0">
            <div className="flex flex-col h-full w-full z-[45]">
              {/* Header Area: Title on Left, Action Buttons on Right in the SAME LINE */}
              <div className="pt-[1.2vw] pl-[1.5vw] pr-[1.5vw] pb-[0.8vw] relative flex-shrink-0 z-[60] flex items-center justify-between border-b border-gray-100">
                <div>
                  <h2 className="text-[1.15vw] font-medium text-gray-800 tracking-tight leading-none">Edit Profile</h2>
                  <p className="text-[0.72vw] text-gray-400 mt-[0.35vw]">Only your actions and activities will appear here.</p>
                </div>

                {/* Action Buttons: Hidden until user types/makes changes */}
                <div className="flex items-center gap-[0.8vw] min-h-[2.4vw]">
                  {activeTab === 'Edit Profile' && editProfileActions?.isEdited && (
                    <div className="flex items-center gap-[0.8vw] transition-all duration-200">
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
                        {editProfileActions.isSaving
                          ? (editProfileActions.isAlreadySaved ? 'Updating...' : 'Saving...')
                          : (editProfileActions.isAlreadySaved ? 'Update Changes' : 'Save Changes')
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div id="main-scroll-container" className={`flex-1 pl-[1.5vw] pt-[1.2vw] pb-[2vw] custom-scrollbar ${isChildScrollable ? 'overflow-y-auto pr-[1.5vw]' : 'overflow-hidden pr-[1.8vw]'}`}>
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
      {/* Image Crop Modal for Avatar & Banner */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        onClose={() => setCropModal(prev => ({ ...prev, isOpen: false, imageSrc: null }))}
        imageSrc={cropModal.imageSrc}
        cropType={cropModal.cropType}
        title={cropModal.title}
        aspectRatio={cropModal.cropType === 'banner' ? 8.38 : 1}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default Profile;
