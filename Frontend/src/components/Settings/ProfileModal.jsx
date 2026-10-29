import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  BookOpen,
  ChevronRight,
  Settings,
  LogOut,
  Database,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { clearSession } from "../../utils/authUtils";
import { resolveUploadsPath } from "../../utils/assetUtils";

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

const getAvatarColor = (identifier, customColor) => {
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

export default function ProfileModal({
  isOpen,
  onClose,
  isAutoSaveEnabled,
  onToggleAutoSave,
}) {
  const { user: authUser, logout } = useAuth();

  const [user, setUser] = useState({
    name:
      authUser?.name ||
      (authUser?.emailId
        ? authUser.emailId.split("@")[0]
        : authUser?.email
          ? authUser.email.split("@")[0]
          : "User"),
    email: authUser?.emailId || authUser?.email || "No Email",
    picture: authUser?.picture || null,
    avatarBgColor: authUser?.avatarBgColor || "#E8D4C8",
  });

  const [storage, setStorage] = useState({ used: 0, total: 300 * 1024 * 1024 });
  const [isLoadingStorage, setIsLoadingStorage] = useState(false);
  const [autoSave, setAutoSave] = useState(() => {
    const saved = localStorage.getItem("isAutoSaveEnabled");
    return saved !== null
      ? JSON.parse(saved)
      : isAutoSaveEnabled !== undefined
        ? isAutoSaveEnabled
        : true;
  });

  const navigate = useNavigate();
  const location = useLocation();
  const isMyFlipbooksPage = location.pathname.startsWith("/my-flipbooks");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    clearSession();
    sessionStorage.clear();

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    onClose();
    navigate("/home");
  };

  useEffect(() => {
    if (isAutoSaveEnabled !== undefined) {
      setAutoSave(isAutoSaveEnabled);
    }
  }, [isAutoSaveEnabled]);

  const handleToggleAutoSave = () => {
    const nextState = !autoSave;
    setAutoSave(nextState);
    localStorage.setItem("isAutoSaveEnabled", JSON.stringify(nextState));
    if (onToggleAutoSave) {
      onToggleAutoSave(nextState);
    }
  };

  // Sync local user state whenever authUser changes
  useEffect(() => {
    if (authUser) {
      const email = authUser.emailId || authUser.email || "";
      setUser((prev) => ({
        ...prev,
        name:
          authUser.name || (email ? email.split("@")[0] : prev.name || "User"),
        email: email || prev.email || "No Email",
        picture: authUser.picture || prev.picture || null,
        avatarBgColor:
          authUser.avatarBgColor || prev.avatarBgColor || "#E8D4C8",
      }));
    }
  }, [authUser]);

  useEffect(() => {
    if (!isOpen) return;

    const targetEmail = authUser?.emailId || authUser?.email || "";
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

    // Check backend auth verify if picture or email is missing
    const checkVerifySession = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/auth/verify`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser((prev) => ({
              ...prev,
              name: data.user.name || prev.name,
              email: data.user.emailId || data.user.email || prev.email,
              picture: data.user.picture || prev.picture,
            }));
          }
        }
      } catch (e) {}
    };

    // Fetch latest profile info (name, picture, avatarBgColor)
    const fetchLatestProfile = async (emailToFetch) => {
      if (
        !emailToFetch ||
        emailToFetch === "No Email" ||
        emailToFetch === "guest@example.com"
      )
        return;
      try {
        const res = await fetch(
          `${backendUrl}/api/profile?emailId=${encodeURIComponent(emailToFetch)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.profile) {
            const p = data.profile;
            setUser((prev) => ({
              ...prev,
              name:
                p.name ||
                prev.name ||
                (emailToFetch ? emailToFetch.split("@")[0] : "User"),
              email: p.emailId || emailToFetch,
              picture: p.picture || prev.picture || null,
              avatarBgColor: p.avatarBgColor || prev.avatarBgColor || "#E8D4C8",
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching live profile in ProfileModal:", err);
      }
    };

    checkVerifySession();

    const fetchLiveStorageSettings = async (emailToFetch) => {
      if (
        !emailToFetch ||
        emailToFetch === "No Email" ||
        emailToFetch === "guest@example.com"
      )
        return;

      setIsLoadingStorage(true);
      try {
        const response = await fetch(
          `${backendUrl}/api/usersetting/get-settings?emailId=${encodeURIComponent(emailToFetch)}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setStorage({
              used: typeof data.usedStorage === "number" ? data.usedStorage : 0,
              total:
                typeof data.maxStorage === "number"
                  ? data.maxStorage
                  : 300 * 1024 * 1024,
            });
            if (data.isAutoSaveEnabled !== undefined) {
              setAutoSave(data.isAutoSaveEnabled);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching live storage settings:", error);
      } finally {
        setIsLoadingStorage(false);
      }
    };

    if (targetEmail) {
      fetchLatestProfile(targetEmail);
      fetchLiveStorageSettings(targetEmail);
    }
  }, [isOpen, authUser]);

  const formatMB = (bytes) => {
    if (!bytes || bytes <= 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 0.1) return "0.1 MB";
    if (mb < 100) return `${parseFloat(mb.toFixed(1))} MB`;
    return `${Math.round(mb)} MB`;
  };

  const usedFormatted = formatMB(storage.used);
  const totalFormatted = `${Math.round(storage.total / (1024 * 1024))}MB`;
  const percentage =
    storage.total > 0
      ? Math.min(100, Math.round((storage.used / storage.total) * 100))
      : 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Light Backdrop */}
      <div
        className="fixed inset-0 z-[150] cursor-default bg-black/15 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Popup Modal Card */}
      <div className="fixed top-[4.5vw] right-[2vw] z-[160] w-[21vw] min-w-[300px] max-w-[360px] bg-white rounded-[1.2vw] shadow-[0_20px_50px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden p-[1.1vw] animate-in fade-in zoom-in-95 duration-150 select-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-[0.9vw]">
          <div className="flex items-center gap-[0.5vw] flex-1 mr-[0.5vw]">
            <span className="text-[1.05vw] font-bold text-gray-900 tracking-tight">Profile</span>
            <div className="flex-1 h-[1px] bg-gray-100" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            className="w-[1.6vw] h-[1.6vw] rounded-[0.4vw] text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X size="0.95vw" strokeWidth={2} />
          </button>
        </div>

        {/* User Info Card with Old Badge Ribbon */}
        <div
          onClick={() => {
            navigate("/settings/profile");
            onClose();
          }}
          className="relative bg-gradient-to-b from-gray-50/70 to-white border border-gray-100 hover:border-indigo-100 rounded-[0.9vw] p-[0.85vw] mb-[0.85vw] flex items-center gap-[0.85vw] cursor-pointer transition-all hover:shadow-xs group overflow-hidden"
        >
          {/* Free Badge Ribbon */}
          <div className="absolute top-0 right-0 bg-[#0066ff] text-white text-[0.62vw] font-bold px-[0.75vw] py-[0.2vw] rounded-bl-[0.4vw] rounded-tr-[0.9vw] shadow-sm select-none">
            {authUser?.plan || "Free"}
          </div>

          {/* Avatar */}
          <div
            className="w-[3.1vw] h-[3.1vw] rounded-full overflow-hidden ring-2 ring-white shadow-xs flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              backgroundColor:
                user.picture && user.picture !== "color_only"
                  ? "#ffffff"
                  : user.avatarBgColor &&
                      user.avatarBgColor !== "#E8D4C8" &&
                      user.avatarBgColor !== "#ffffff"
                    ? user.avatarBgColor
                    : getAvatarColor(user.name || user.email || "User"),
            }}
          >
            {user.picture && user.picture !== "color_only" ? (
              <img
                src={
                  user.picture.startsWith("blob:") ||
                  user.picture.startsWith("data:")
                    ? user.picture
                    : resolveUploadsPath(user.picture)
                }
                alt={user.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <span className="text-[1.15vw] font-bold text-white drop-shadow-sm select-none">
                {(user.displayName || user.name) ? (user.displayName || user.name).trim().charAt(0).toUpperCase() : "U"}
              </span>
            )}
          </div>

          {/* User Details */}
          <div className="flex flex-col min-w-0 pr-[3.5vw]">
            <h3 className="text-[0.88vw] font-bold text-gray-900 truncate leading-snug group-hover:text-indigo-600 transition-colors">
              {user.displayName || user.name || "User"}
            </h3>
            <p className="text-[0.68vw] text-gray-500 font-normal truncate mt-[0.05vw]">
              {user.email}
            </p>
            <span className="text-[0.62vw] text-indigo-600/80 font-medium mt-[0.2vw] flex items-center gap-[0.15vw]">
              <span>Manage profile</span>
              <ChevronRight size="0.6vw" />
            </span>
          </div>
        </div>

        {/* Storage Progress Section */}
        <div className="bg-gray-50/70 border border-gray-100 rounded-[0.85vw] p-[0.75vw] mb-[0.85vw]">
          <div className="flex justify-between items-center mb-[0.35vw]">
            <div className="flex items-center gap-[0.35vw]">
              <Database size="0.75vw" className="text-gray-500" />
              <span className="text-[0.76vw] font-semibold text-gray-800">Storage</span>
            </div>
            <span className="text-[0.68vw] font-medium text-gray-500">
              {isLoadingStorage
                ? "Calculating..."
                : `${usedFormatted} / ${totalFormatted}`}
            </span>
          </div>
          <div className="w-full h-[0.35vw] bg-gray-200/70 rounded-full overflow-hidden mb-[0.25vw]">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-[#4c5add] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[0.62vw] text-gray-400 font-medium">
            <span>{percentage}% used</span>
            <button
              type="button"
              onClick={() => {
                navigate("/settings/billing");
                onClose();
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer hover:underline"
            >
              Upgrade Storage
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex flex-col gap-[0.2vw]">
          {/* My Flipbooks - shown if not already on /my-flipbooks */}
          {!isMyFlipbooksPage && (
            <button
              type="button"
              onClick={() => {
                navigate("/my-flipbooks");
                onClose();
              }}
              className="w-full flex items-center justify-between py-[0.55vw] px-[0.6vw] hover:bg-gray-50/90 rounded-[0.6vw] cursor-pointer transition-colors group text-left"
            >
              <div className="flex items-center gap-[0.65vw]">
                <div className="w-[1.8vw] h-[1.8vw] rounded-[0.45vw] bg-indigo-50 text-indigo-600 flex items-center justify-center transition-colors group-hover:bg-indigo-100">
                  <BookOpen size="0.9vw" />
                </div>
                <span className="text-[0.78vw] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  My Flipbooks
                </span>
              </div>
              <ChevronRight
                size="0.8vw"
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </button>
          )}

          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              navigate("/settings/profile");
              onClose();
            }}
            className="w-full flex items-center justify-between py-[0.55vw] px-[0.6vw] hover:bg-gray-50/90 rounded-[0.6vw] cursor-pointer transition-colors group text-left"
          >
            <div className="flex items-center gap-[0.65vw]">
              <div className="w-[1.8vw] h-[1.8vw] rounded-[0.45vw] bg-gray-100 text-gray-600 flex items-center justify-center transition-colors group-hover:bg-gray-200">
                <Settings size="0.9vw" />
              </div>
              <span className="text-[0.78vw] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Settings
              </span>
            </div>
            <ChevronRight
              size="0.8vw"
              className="text-gray-400 group-hover:text-gray-600 transition-colors"
            />
          </button>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gray-100 my-[0.4vw]" />

        {/* Log Out Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-[0.5vw] px-[0.6vw] rounded-[0.6vw] text-red-600 hover:bg-red-50/70 text-[0.78vw] font-medium flex items-center justify-between transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-[0.65vw]">
            <div className="w-[1.8vw] h-[1.8vw] rounded-[0.45vw] bg-red-50 text-red-500 flex items-center justify-center transition-colors group-hover:bg-red-100">
              <LogOut size="0.85vw" />
            </div>
            <span>Log Out</span>
          </div>
          <ChevronRight size="0.8vw" className="text-red-300 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </>
  );
}
