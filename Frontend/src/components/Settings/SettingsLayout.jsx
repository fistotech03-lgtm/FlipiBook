import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { ArrowRight } from "lucide-react";
import { clearSession } from "../../utils/authUtils";
import { useAuth } from "../../context/AuthContext";

const defaultColors = [
  "#4c5add",
  "#2563eb",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#8a4419",
  "#597810",
];

export const getAvatarColor = (identifier, customColor) => {
  if (
    customColor &&
    customColor !== "#E8D4C8" &&
    customColor !== "#ffffff" &&
    customColor !== "transparent"
  ) {
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
  name: "User",
  email: "",
  emailId: "",
  picture: null,
  avatarBgColor: "#E8D4C8",
  about: "",
  mobile: "",
  companyName: "",
  industryType: "",
  companyEmail: "",
  website: "",
  services: [],
  address1: "",
  address2: "",
  city: "",
  pincode: "",
  state: "",
  country: "INDIA",
  socials: {
    website: "",
    instagram: "",
    linkedin: "",
    facebook: "",
    whatsapp: "",
  },
  bannerBg: {
    type: "gradient",
    value: "linear-gradient(to bottom right, #c1e8d7, #85d8c3, #60bba3)",
  },
};

const SettingsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user_profile');
      if (stored) return { ...defaultProfile, ...JSON.parse(stored) };
    } catch (e) {}
    return defaultProfile;
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }

    // Clear client session and user data
    clearSession();
    localStorage.removeItem("user");
    localStorage.removeItem("user_profile");
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("last_active_folder");
    localStorage.removeItem("hide_upgrade_card");
    localStorage.removeItem("isAutoSaveEnabled");
    sessionStorage.clear();

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }

    setUser(defaultProfile);
    navigate("/home");
  };

  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e?.detail) {
        setUser(prev => ({
          ...defaultProfile,
          ...prev,
          ...e.detail
        }));
      }
    };
    window.addEventListener('profileUpdate', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdate', handleProfileUpdate);
  }, []);

  useEffect(() => {
    if (authUser) {
      const email = authUser.emailId || authUser.email || "";
      let localProfile = {};
      try {
        const stored = localStorage.getItem('user_profile');
        if (stored) localProfile = JSON.parse(stored);
      } catch (e) {}

      setUser((prev) => ({
        ...defaultProfile,
        ...prev,
        ...localProfile,
        ...authUser,
        name:
          localProfile.name ||
          authUser.name ||
          authUser.userName ||
          (email ? email.split("@")[0] : prev.name),
        email,
        emailId: email,
        picture: localProfile.picture !== undefined ? localProfile.picture : (authUser.picture || prev.picture),
        avatarBgColor:
          localProfile.avatarBgColor || authUser.avatarBgColor || prev.avatarBgColor || "#E8D4C8",
      }));
    }
  }, [authUser]);

  const sidebarGroups = [
    {
      title: "General",
      items: [
        {
          path: "profile",
          id: "profile",
          label: "Profile",
          icon: "mingcute:profile-line",
        },
        {
          path: "account",
          id: "account",
          label: "Account",
          icon: "iconamoon:profile",
        },
        {
          path: "notifications",
          id: "notifications",
          label: "Notifications",
          icon: "basil:notification-on-outline",
        },
      ],
    },
    {
      title: "System & Billing",
      items: [
        {
          path: "virtual-stall",
          to: "#",
          id: "virtual-stall",
          label: "Virtual Stall",
          icon: "icon-park-outline:booth",
        },
        {
          path: "billing",
          id: "billing",
          label: "Billing and Invoice",
          icon: "tdesign:bill",
        },
        {
          path: "support",
          to: "#",
          id: "support",
          label: "Support",
          icon: "griddy-icons:customer-support",
        },
      ],
    },
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
                <div
                  className="h-[0.0925vw] bg-gray-200 flex-1"
                  style={{ marginRight: "-1.5vw" }}
                >
                  {" "}
                </div>
              </div>

              <div className="flex flex-col gap-[0.2vw]">
                {group.items.map((item) => {
                  const isProfile = item.id === "profile";
                  const isActive = isProfile
                    ? location.pathname.startsWith("/settings/profile")
                    : location.pathname === `/settings/${item.path}` ||
                      location.pathname.startsWith(`/settings/${item.path}/`);

                  const destination = item.to || `/settings/${item.path}`;

                  return (
                    <Link
                      key={item.id || item.path}
                      to={destination}
                      className={`
                        flex items-center gap-[1vw] px-[0.75vw] py-[0.4vw] rounded-[0.5vw] text-[0.8125vw] font-semibold transition-colors
                        ${
                          isActive
                            ? "bg-[#F2F2F2] text-gray-800"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        }
                      `}
                    >
                      <Icon
                        icon={item.icon}
                        className={`w-[1vw] h-[1vw] flex-shrink-0 text-gray-700 ${item.icon.startsWith("gcp:") ? "grayscale brightness-0 opacity-90" : ""}`}
                        style={{ strokeWidth: "1.2px" }}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade Profile Button with Crown matching screenshot */}
        <div className="p-[0.75vw] mb-[0.5vw]">
          <div className="relative">
            {/* 3D Gold Crown */}
            <div className="absolute -top-[1.2vw] -right-[0.5vw] w-[2.6vw] h-[2.1vw] rotate-[16deg] z-20 select-none pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
              <svg viewBox="0 0 68 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="goldGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF7C2" />
                    <stop offset="20%" stopColor="#FAD04C" />
                    <stop offset="50%" stopColor="#E5A620" />
                    <stop offset="80%" stopColor="#FCE082" />
                    <stop offset="100%" stopColor="#A86B06" />
                  </linearGradient>
                  <linearGradient id="goldShine" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7A4B00" />
                    <stop offset="35%" stopColor="#FFDE6A" />
                    <stop offset="65%" stopColor="#CF8B13" />
                    <stop offset="100%" stopColor="#FFFDF2" />
                  </linearGradient>
                  <radialGradient id="crownVelvet" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#8A151B" />
                    <stop offset="70%" stopColor="#5E0B10" />
                    <stop offset="100%" stopColor="#3B0508" />
                  </radialGradient>
                  <radialGradient id="rubyGem" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FF6B6B" />
                    <stop offset="40%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#7F1D1D" />
                  </radialGradient>
                  <radialGradient id="blueGem" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="50%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                  </radialGradient>
                  <radialGradient id="emeraldGem" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#064E3B" />
                  </radialGradient>
                  <radialGradient id="pearlSphere" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor="#FFF3D6" />
                    <stop offset="100%" stopColor="#D4A747" />
                  </radialGradient>
                </defs>

                <path d="M 12 40 C 14 26, 54 26, 56 40 Z" fill="url(#crownVelvet)" opacity="0.9" />
                <path d="M 10 40 Q 34 20 34 11 Q 34 20 58 40" stroke="url(#goldGradMain)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 7 42 Q 34 47 61 42 L 59 50 Q 34 54 9 50 Z" fill="url(#goldShine)" stroke="#7A4B00" strokeWidth="0.8" />
                <circle cx="16" cy="46.5" r="2" fill="url(#rubyGem)" stroke="#FFEAA7" strokeWidth="0.5" />
                <circle cx="28" cy="48" r="2" fill="url(#blueGem)" stroke="#FFEAA7" strokeWidth="0.5" />
                <circle cx="40" cy="48" r="2" fill="url(#rubyGem)" stroke="#FFEAA7" strokeWidth="0.5" />
                <circle cx="52" cy="46.5" r="2" fill="url(#emeraldGem)" stroke="#FFEAA7" strokeWidth="0.5" />
                <path d="M 7 42 L 3 19 L 20 30 L 34 11 L 48 30 L 65 19 L 61 42 Q 34 47 7 42 Z" fill="url(#goldGradMain)" stroke="#8A5A00" strokeWidth="0.9" />
                <path d="M 10 40 L 7 24 L 20 32 L 34 15 L 48 32 L 61 24 L 58 40 Q 34 44 10 40 Z" fill="url(#goldShine)" opacity="0.6" />
                <circle cx="3" cy="18" r="3.2" fill="url(#pearlSphere)" stroke="#B3770E" strokeWidth="0.7" />
                <circle cx="20" cy="29" r="2.8" fill="url(#pearlSphere)" stroke="#B3770E" strokeWidth="0.7" />
                <circle cx="34" cy="10" r="4.1" fill="url(#pearlSphere)" stroke="#B3770E" strokeWidth="0.7" />
                <circle cx="48" cy="29" r="2.8" fill="url(#pearlSphere)" stroke="#B3770E" strokeWidth="0.7" />
                <circle cx="65" cy="18" r="3.2" fill="url(#pearlSphere)" stroke="#B3770E" strokeWidth="0.7" />
                <polygon points="34,22 38.5,28 34,34 29.5,28" fill="url(#rubyGem)" stroke="#FFF3B0" strokeWidth="0.8" />
                <circle cx="20" cy="36" r="1.6" fill="url(#blueGem)" />
                <circle cx="48" cy="36" r="1.6" fill="url(#emeraldGem)" />
              </svg>
            </div>

            <button
              onClick={() => navigate('/settings/profile')}
              className="w-full relative overflow-hidden py-[0.62vw] px-[1vw] rounded-[0.75vw] text-[0.82vw] font-medium text-white flex items-center justify-center gap-[0.5vw] shadow-[0_4px_14px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)] active:scale-[0.99] transition-all cursor-pointer group"
              style={{
                background: 'radial-gradient(ellipse at 50% 30%, #25282d 0%, #15171a 70%, #0d0e10 100%)'
              }}
            >
              <span className="tracking-wide font-medium">Upgrade Profile</span>
              <ArrowRight className="w-[0.9vw] h-[0.9vw] transition-transform group-hover:translate-x-[0.2vw]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white p-[1vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Outlet key={location.pathname} context={{ user, setUser }} />
      </main>
    </div>
  );
};

export default SettingsLayout;
