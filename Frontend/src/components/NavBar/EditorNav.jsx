// src/components/Navbar.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import logo from '../assets/logo/Flipibook_logo.svg';
const logo = "/Login/logo.svg";
import {
  User,
  Share2,
  Save,
  Download,
  Loader2,
  Eye,
  ChevronDown,
  Monitor,
  Tablet,
  Smartphone,
  CloudOff,
  Bell,
  Languages,
} from "lucide-react";
import { Icon } from "@iconify/react";
import ProfileModal from "../Settings/ProfileModal";
import ShareModal from "../ShareModal";
import NotificationDrawer from "../Notification/NotificationDrawer";

import { useAuth, useActiveBook, useUIModals } from "../../store/hooks";
import { queryClient } from "../../queryClient";
import { useConfirm } from "../../context/ConfirmationContext";
import { useTranslation } from "../../context/TranslationContext";
import { TRANSLATE_LANGUAGES } from "../PageEditor/utils/inlineTranslationHelper";

const EditorNavbar = ({
  onExport: onExportProp,
  onSave: onSaveProp,
  onPreview: onPreviewProp,
  onPublish: onPublishProp,
  onClearFlipbook,
  onDeleteFlipbook,
  hasUnsavedChanges: hasUnsavedChangesProp,
  saveSuccessInfo: saveSuccessInfoProp,
  isAutoSaveEnabled: isAutoSaveEnabledProp,
  onToggleAutoSave: onToggleAutoSaveProp,
  isSaving: isSavingProp,
  activeDevice: activeDeviceProp,
  setActiveDevice: setActiveDeviceProp,
  currentBook: currentBookProp,
}) => {
  const {
    currentBook: currentBookRedux,
    hasUnsavedChanges: hasUnsavedChangesRedux,
    isSaving: isSavingRedux,
    isAutoSaveEnabled: isAutoSaveEnabledRedux,
    toggleAutoSave: toggleAutoSaveRedux,
    activeDevice: activeDeviceRedux,
    setActiveDevice: setActiveDeviceRedux,
    saveSuccessInfo: saveSuccessInfoRedux,
    triggerSave,
    triggerExport,
    triggerPreview,
  } = useActiveBook();

  const { openModal, setModalOpen } = useUIModals();
  const { openTranslateModal } = useTranslation();

  const currentBook = currentBookProp ?? currentBookRedux;
  const hasUnsavedChanges = hasUnsavedChangesProp ?? hasUnsavedChangesRedux;
  const isSaving = isSavingProp ?? isSavingRedux;
  const isAutoSaveEnabled = isAutoSaveEnabledProp ?? isAutoSaveEnabledRedux;
  const activeDevice = activeDeviceProp ?? activeDeviceRedux ?? "Desktop";
  const setActiveDevice = setActiveDeviceProp ?? setActiveDeviceRedux;
  const saveSuccessInfo = saveSuccessInfoProp ?? saveSuccessInfoRedux;

  const onSave = onSaveProp || triggerSave;
  const onExport = onExportProp || (() => {
    setModalOpen('isExportModalOpen', true);
    triggerExport();
  });
  const onPreview = onPreviewProp || triggerPreview;
  const onPublish = onPublishProp || (() => {
    const isBookPublished = Boolean(
      currentBook?.isPublished || 
      currentBook?.published || 
      currentBook?.is_published || 
      currentBook?.status === 'publish' ||
      currentBook?.status === 'published' ||
      currentBook?.meta?.isPublished
    );
    if (isBookPublished) {
      setModalOpen('isUnpublishWarningOpen', true);
    } else {
      setModalOpen('isPublishModalOpen', true);
    }
  });
  const onToggleAutoSave = onToggleAutoSaveProp || toggleAutoSaveRedux;

  const [secondsSinceSave, setSecondsSinceSave] = useState(0);
  const { user } = useAuth();
  const userProfile = {
    name: user?.name || "User",
    picture: user?.picture || null,
    avatarBgColor: "#f97316",
  };
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(2);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPublishMenuOpen, setIsPublishMenuOpen] = useState(false);
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [selectedTranslateLang, setSelectedTranslateLang] = useState("tam_Taml");
  const translateMenuRef = useRef(null);
  const deviceMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (
      location.pathname.startsWith("/editor") &&
      !location.pathname.includes("threed_editor") &&
      !location.pathname.includes("customized_editor")
    ) {
      localStorage.setItem("lastEditorPath", location.pathname);
    }
    if (location.pathname.includes("customized_editor")) {
      localStorage.setItem("lastCustomizedPath", location.pathname);
    }
  }, [location]);

  // Helper to determine if a link is active
  const isActive = (path) => {
    if (path === "/editor") {
      return (
        location.pathname.startsWith("/editor") &&
        !location.pathname.includes("threed_editor") &&
        !location.pathname.includes("customized_editor")
      );
    }
    if (path === "/editor/threed_editor")
      return location.pathname.includes("threed_editor");
    if (path === "/editor/customized_editor")
      return location.pathname.includes("customized_editor");
    return location.pathname === path;
  };

  // Timer: count seconds since last successful save
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSinceSave((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // When save completes or no unsaved changes exist, reset seconds counter to 0
  useEffect(() => {
    if (saveSuccessInfo || (!hasUnsavedChanges && !isSaving)) {
      setSecondsSinceSave(0);
    }
  }, [saveSuccessInfo, hasUnsavedChanges, isSaving]);

  // Online / Offline Detection
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const formatTime = (totalSeconds) => {
    if (totalSeconds < 5) return "Just now";
    if (totalSeconds < 60) return `${totalSeconds}s ago`;
    const mins = Math.floor(totalSeconds / 60);
    return `${mins}m ago`;
  };

  // Check if we are in 3D Editor, Customized Editor, or editing a PDF project
  const isThreedEditor = location.pathname.includes("threed_editor");
  const isCustomizedEditor = location.pathname.includes("customized_editor");
  const isPdfBook = Boolean(
    currentBook?.isPdfProject ||
    String(currentBook?.bookType || currentBook?.meta?.bookType || "").toLowerCase() === "pdf" ||
    (Array.isArray(currentBook?.pages) &&
      currentBook.pages.some((p) => {
        const content = p?.html || p?.content || "";
        return (
          typeof content === "string" &&
          (content.includes('data-name="PDF Background"') ||
            content.includes('data-type="pdf-vector-layer"') ||
            content.includes("Document Shield"))
        );
      }))
  );

  const confirm = useConfirm();

  const handleNavigateWithConfirm = async (to) => {
    queryClient.invalidateQueries({ queryKey: ["flipbook-books"] });
    queryClient.invalidateQueries({ queryKey: ["flipbook-folders"] });
    if (hasUnsavedChanges) {
      if (!isAutoSaveEnabled) {
        const result = await confirm({
          title: "Leave Site?",
          message: "Changes you made may not be saved.",
          confirmText: "Leave",
          cancelText: "Stay",
          type: "danger",
          showSave: isThreedEditor,
          saveText: "Save and exit",
        });

        if (!result) {
          // Clicked Stay / backdrop
          return;
        }

        if (result === 'save') {
          try {
            if (onSave) {
              await onSave(true);
            }
          } catch (err) {
            console.error("[EditorNav] Error saving before navigation:", err);
          }
        }
      } else {
        try {
          if (onSave) {
            await onSave();
          }
        } catch (err) {
          console.warn("[EditorNav] Auto-save before navigation error:", err);
        }
      }
    }
    navigate(to);
  };

  return (
    <>
      <nav
        className="bg-white border-b border-gray-200/90 flex items-center justify-between px-[1.25vw] shadow-xs z-[9999] relative select-none"
        style={{ height: "7vh" }}
      >
        {/* Left Section - Logo & Workspace Switcher */}
        <div className="flex items-center gap-[0.9vw] min-w-0">
          <Link
            to="/"
            className="flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              handleNavigateWithConfirm("/");
            }}
          >
            <img
              className="h-[4.1vh] w-auto object-contain"
              src={logo}
              alt="Flipibook"
            />
          </Link>

          <div className="w-[1px] h-[1.6vw] bg-gray-200 flex-shrink-0" />

          {/* Meaningful Compact Workspace Navigation */}
          <div className="flex items-center bg-gray-100/80 p-[0.2vw] rounded-[0.55vw] border border-gray-200/70 gap-[0.2vw]">
            <div className="relative group/tooltip flex items-center">
              <Link
                to="/my-flipbooks"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigateWithConfirm("/my-flipbooks");
                }}
                className="h-[2vw] flex items-center gap-[0.35vw] px-[0.7vw] rounded-[0.42vw] text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-xs transition-all"
              >
                <Icon
                  icon="boxicons:home-alt"
                  className="w-[1vw] h-[1vw] text-[#EC5137] flex-shrink-0"
                />
                <span className="font-medium text-[0.78vw] whitespace-nowrap">
                  My Flipbooks
                </span>
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.4vw] hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.25vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Go to My Flipbooks
                </div>
              </div>
            </div>

            <div className="relative group/tooltip flex items-center">
              <button
                onClick={() => {
                  handleNavigateWithConfirm(
                    isThreedEditor
                      ? localStorage.getItem("lastEditorPath") || "/editor"
                      : "/editor/threed_editor"
                  );
                }}
                className="h-[2vw] flex items-center gap-[0.35vw] px-[0.7vw] rounded-[0.42vw] text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-xs transition-all cursor-pointer"
              >
                {isThreedEditor ? (
                  <Icon
                    icon="lucide:layout"
                    className="w-[1vw] h-[1vw] text-[#4A3AFF] flex-shrink-0"
                  />
                ) : (
                  <svg
                    className="w-[1vw] h-[1vw] flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2L21.5 7.5L12 13L2.5 7.5L12 2Z" fill="#EC5137" />
                    <path d="M2.5 7.5L12 13V24L2.5 18.5V7.5Z" fill="#4A3AFF" />
                    <path d="M21.5 7.5L12 13V24L21.5 18.5V7.5Z" fill="#22C55E" />
                  </svg>
                )}
                <span className="font-medium text-[0.78vw] whitespace-nowrap">
                  {isThreedEditor ? "Page Editor" : "3D Editor"}
                </span>
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.4vw] hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.25vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  {isThreedEditor ? "Switch to Page Editor" : "Switch to 3D Editor"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section - Device Switcher (Customized Editor) or Book Name Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          {isCustomizedEditor ? (
            <div
              className="flex items-center bg-gray-100/80 p-[0.2vw] rounded-[0.55vw] border border-gray-200/70 gap-[0.15vw]"
              ref={deviceMenuRef}
            >
              {[
                { key: "Desktop", label: "Desktop", IconComp: Monitor },
                { key: "Tablet", label: "Tablet", IconComp: Tablet },
                { key: "Mobile", label: "Mobile", IconComp: Smartphone },
              ].map(({ key, label, IconComp }) => {
                const active = activeDevice === key;
                return (
                  <div key={key} className="relative group/tooltip flex items-center">
                    <button
                      onClick={() => setActiveDevice(key)}
                      className={`h-[2vw] flex items-center gap-[0.35vw] px-[0.65vw] rounded-[0.42vw] text-[0.76vw] font-medium transition-all cursor-pointer ${
                        active
                          ? "bg-white text-[#EC5137] shadow-xs"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                      }`}
                    >
                      <IconComp className="w-[0.95vw] h-[0.95vw]" strokeWidth={1.8} />
                      <span>{label}</span>
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.4vw] hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                      <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                      <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.25vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                        {label} View
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Right Section - Primary Book Actions & Account Utilities */}
        <div className="flex items-center gap-[0.5vw] justify-end relative">
          {/* Save & Sync Status Area: Hidden in Customized Editor (always auto-save) and when AutoSave is enabled */}
          {!isAutoSaveEnabled && !isCustomizedEditor && (
            <div className="relative flex items-center">
              {isThreedEditor ? (
                /* 3D Editor Save Split Dropdown Button */
                <div className="relative flex items-center">
                  <div className="h-[2.3vw] flex items-center rounded-[0.5vw] overflow-hidden shadow-xs border border-[#EC5137] bg-[#EC5137]">
                    <button
                      onClick={() => onSave && onSave(true)}
                      disabled={isSaving}
                      className="h-full flex items-center gap-[0.35vw] pl-[0.8vw] pr-[0.5vw] text-white hover:bg-[#d9482f] transition-all cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
                      title="Save"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-[1vw] h-[1vw] animate-spin text-white" />
                          <span className="font-medium text-[0.8vw]">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-[1vw] h-[1vw] text-white" />
                          <span className="font-medium text-[0.8vw]">Save</span>
                        </>
                      )}
                    </button>
                    <div className="w-[1px] h-[1.2vw] bg-white/30" />
                    <button
                      onClick={() => setIsSaveMenuOpen(!isSaveMenuOpen)}
                      className="h-full px-[0.4vw] text-white hover:bg-[#d9482f] transition-all cursor-pointer flex items-center justify-center"
                      title="More save options"
                    >
                      <ChevronDown
                        size="1vw"
                        className={`transition-transform duration-200 ${isSaveMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {isSaveMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsSaveMenuOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-[0.5vw] bg-white border border-gray-200 shadow-xl rounded-[0.8vw] w-[10.5vw] min-w-[10vw] z-50 overflow-hidden py-[0.3vw] animate-in fade-in slide-in-from-top-2 duration-150">
                        <button
                          onClick={() => {
                            setIsSaveMenuOpen(false);
                            window.dispatchEvent(new CustomEvent('editor-save-as'));
                          }}
                          className="w-full px-[0.8vw] py-[0.5vw] flex items-center gap-[0.5vw] text-gray-700 hover:bg-gray-50 hover:text-[#EC5137] transition-colors font-normal text-[0.82vw] cursor-pointer text-left whitespace-nowrap"
                        >
                          <Icon icon="material-symbols:save-as-outline" className="w-[1.05vw] h-[1.05vw] text-gray-500" />
                          <span>Save as Copy</span>
                        </button>
                        <div className="h-[1px] bg-gray-100 my-[0.2vw]" />
                        <button
                          onClick={() => {
                            setIsSaveMenuOpen(false);
                            window.dispatchEvent(new CustomEvent('editor-export-3d'));
                          }}
                          className="w-full px-[0.8vw] py-[0.5vw] flex items-center gap-[0.5vw] text-gray-700 hover:bg-gray-50 hover:text-[#EC5137] transition-colors font-normal text-[0.82vw] cursor-pointer text-left whitespace-nowrap"
                        >
                          <Download size="1vw" className="text-gray-500" />
                          <span>Export as Glb</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="relative group/tooltip flex items-center">
                  <button
                    onClick={() => onSave && onSave(true)}
                    disabled={isSaving || !hasUnsavedChanges}
                    className={`h-[2.3vw] transition-all relative flex items-center gap-[0.35vw] px-[0.85vw] rounded-[0.5vw] flex-shrink-0 ${
                      isSaving
                        ? "bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                        : hasUnsavedChanges
                        ? "bg-[#EC5137] hover:bg-[#d9482f] border border-[#EC5137] text-white shadow-xs cursor-pointer active:scale-[0.98]"
                        : "bg-white border border-gray-200 text-gray-600 cursor-default"
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-[1vw] h-[1vw] animate-spin text-[#EC5137]" />
                        <span className="font-medium text-[0.8vw]">Saving...</span>
                      </>
                    ) : hasUnsavedChanges ? (
                      <>
                        <Save className="w-[1vw] h-[1vw] text-white" />
                        <span className="font-medium text-[0.8vw]">Save</span>
                      </>
                    ) : (
                      <>
                        <Icon
                          icon="reicon:tick-circle-filled"
                          className="w-[1vw] h-[1vw] text-[#22c55e]"
                        />
                        <span className="font-medium text-[0.8vw] text-gray-600">Saved</span>
                      </>
                    )}
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.4vw] hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                    <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                    <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.25vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                      {hasUnsavedChanges
                        ? "Save pending changes"
                        : isSaving
                        ? "Saving changes..."
                        : "All changes saved"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Button - Hidden on 3D Editor */}
          {!isThreedEditor && (
            <div className="relative group/tooltip flex items-center">
              <button
                onClick={onPreview}
                className="h-[2.3vw] flex items-center gap-[0.35vw] px-[0.85vw] bg-white border border-gray-200 rounded-[0.5vw] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors flex-shrink-0 cursor-pointer"
              >
                <Icon icon="carbon:view" className="w-[1.05vw] h-[1.05vw]" />
                <span className="font-medium text-[0.8vw]">Preview</span>
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.4vw] hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.25vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Preview Flipbook
                </div>
              </div>
            </div>
          )}

          {/* Inline Text Translation - Shown in Customized Editor */}
          {isCustomizedEditor && (
            <div className="relative flex items-center" ref={translateMenuRef}>
              <button
                type="button"
                onMouseDown={(e) => {
                  // Preserve active input focus & text selection while picking language
                  e.preventDefault();
                }}
                onClick={() => setShowTranslateMenu((prev) => !prev)}
                title="Translate selected or focused text field"
                className={`h-[2.3vw] flex items-center gap-[0.35vw] px-[0.85vw] bg-white border rounded-[0.5vw] transition-colors flex-shrink-0 cursor-pointer ${
                  showTranslateMenu
                    ? "border-gray-400 text-gray-900 bg-gray-50"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <Icon icon="bi:translate" className="w-[1vw] h-[1vw] text-gray-700" />
                <span className="font-medium text-[0.8vw]">Translate</span>
                <ChevronDown
                  className={`w-[0.85vw] h-[0.85vw] transition-transform duration-150 ${
                    showTranslateMenu ? "rotate-180 text-gray-900" : "text-gray-400"
                  }`}
                />
              </button>

              {showTranslateMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowTranslateMenu(false)}
                  />
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute right-0 top-full mt-[0.5vw] w-[13.5vw] bg-white rounded-[0.6vw] shadow-[0_12px_36px_rgba(0,0,0,0.16)] border border-gray-100 p-[0.4vw] z-50 flex flex-col gap-[0.2vw]"
                  >
                    <div className="px-[0.5vw] py-[0.3vw] border-b border-gray-100 flex items-center justify-between">
                      <span className="text-[0.7vw] font-bold text-gray-800">Translate Field Text</span>
                    </div>
                    <div className="max-h-[34vh] overflow-y-auto flex flex-col gap-[0.1vw] py-[0.2vw]">
                      {TRANSLATE_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelectedTranslateLang(lang.code);
                            window.dispatchEvent(
                              new CustomEvent("trigger-inline-translate", {
                                detail: { targetLang: lang.code },
                              })
                            );
                            setShowTranslateMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-[0.6vw] py-[0.4vw] text-[0.72vw] font-medium rounded-[0.4vw] transition-colors cursor-pointer text-left ${
                            lang.code === selectedTranslateLang
                              ? "bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200/70"
                              : "text-gray-700 hover:bg-gray-100 hover:text-black"
                          }`}
                        >
                          <div className="flex items-center gap-[0.4vw]">
                            {lang.code === selectedTranslateLang && (
                              <span className="w-[0.4vw] h-[0.4vw] rounded-full bg-gray-700" />
                            )}
                            <span>{lang.name}</span>
                          </div>
                          <span className="text-[0.65vw] text-gray-400 font-normal">{lang.native}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Publish Split Button - Hidden inside 3D Editor */}
          {!isThreedEditor && (
            <div className="relative flex items-center">
              <div className="h-[2.3vw] flex items-center bg-[#EC5137] text-white rounded-[0.5vw] shadow-xs">
                <div className="relative group/publish-tooltip flex items-center h-full">
                  <button
                    onClick={onPublish}
                    className="h-full flex items-center gap-[0.35vw] px-[0.85vw] hover:bg-[#D5452E] transition-all duration-200 active:scale-95 cursor-pointer rounded-l-[0.5vw]"
                  >
                    <Icon icon="entypo:publish" className="w-[1vw] h-[1vw]" />
                    <span className="font-medium text-[0.8vw] whitespace-nowrap">
                      {currentBook?.isPublished ||
                      currentBook?.published ||
                      currentBook?.is_published ||
                      currentBook?.status === "publish" ||
                      currentBook?.meta?.isPublished
                        ? "Unpublish"
                        : "Publish"}
                    </span>
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.4vw] hidden group-hover/publish-tooltip:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                    <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                    <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.25vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                      {currentBook?.isPublished ||
                      currentBook?.published ||
                      currentBook?.is_published ||
                      currentBook?.status === "publish" ||
                      currentBook?.meta?.isPublished
                        ? "Unpublish Project"
                        : "Publish Project"}
                    </div>
                  </div>
                </div>

                <div className="w-[1px] h-[1.2vw] bg-white/35"></div>

                <div className="relative group/chevron-tooltip flex items-center h-full">
                  <button
                    onClick={() => setIsPublishMenuOpen(!isPublishMenuOpen)}
                    className="h-full px-[0.4vw] hover:bg-[#D5452E] transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer rounded-r-[0.5vw]"
                  >
                    <ChevronDown
                      size="1vw"
                      className={`transition-transform duration-300 ${isPublishMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {!isPublishMenuOpen && (
                    <div className="absolute right-0 top-full mt-[0.4vw] hidden group-hover/chevron-tooltip:flex flex-col items-end pointer-events-none z-50 whitespace-nowrap">
                      <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90 mr-[0.4vw]" />
                      <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.25vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                        Share, Export & Manage
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isPublishMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPublishMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-[0.6vw] bg-white border-[0.12vw] border-[#EC5137] shadow-xl rounded-[0.8vw] w-[11vw] z-50 overflow-hidden py-[0.4vw] animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        setIsPublishMenuOpen(false);
                        setIsShareOpen(true);
                      }}
                      disabled={isThreedEditor}
                      className={`w-full px-[1vw] py-[0.6vw] flex items-center justify-center gap-[0.5vw] text-gray-700 hover:bg-gray-50 transition-colors font-medium text-[0.8vw] cursor-pointer ${isThreedEditor ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Share2 size="1vw" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsPublishMenuOpen(false);
                        if (onExport) onExport();
                      }}
                      disabled={isThreedEditor}
                      className={`w-full px-[1vw] py-[0.6vw] flex items-center justify-center gap-[0.5vw] text-gray-700 hover:bg-gray-50 transition-colors font-medium text-[0.8vw] cursor-pointer ${isThreedEditor ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Download size="1vw" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsPublishMenuOpen(false);
                        if (onClearFlipbook) onClearFlipbook();
                      }}
                      className="w-full px-[1vw] py-[0.6vw] text-center text-gray-700 hover:bg-gray-50 transition-colors font-medium text-[0.8vw] cursor-pointer"
                    >
                      Clear Flipbook
                    </button>
                    <button
                      onClick={() => {
                        setIsPublishMenuOpen(false);
                        if (onDeleteFlipbook) onDeleteFlipbook();
                      }}
                      className="w-full px-[1vw] py-[0.6vw] text-center text-red-500 hover:bg-red-50 transition-colors font-bold text-[0.8vw] cursor-pointer"
                    >
                      Delete Flipbook
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Separator between Document Actions & Account/Settings Utilities */}
          <div className="w-[1px] h-[1.5vw] bg-gray-200 mx-[0.2vw] flex-shrink-0" />

          {/* Notification Button */}
          <div className="relative group/tooltip flex items-center">
            <button
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              aria-label="Notifications"
              className={`w-[2.3vw] h-[2.3vw] rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer flex-shrink-0 relative ${
                isNotificationOpen
                  ? "bg-[#EC5137] border-[#EC5137] text-white shadow-sm ring-2 ring-[#EC5137]/20"
                  : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900"
              }`}
            >
              <Bell
                className={`w-[1.05vw] h-[1.05vw] transition-colors ${
                  isNotificationOpen ? "text-white" : "text-gray-600"
                }`}
              />
              {unreadNotifCount > 0 && !isNotificationOpen && (
                <span className="absolute top-1.5 right-1.5 w-[0.45vw] h-[0.45vw] min-w-[7px] min-h-[7px] rounded-full bg-[#EC5137] ring-2 ring-white" />
              )}
            </button>
            {!isNotificationOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.4vw] hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.25vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Notifications
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="relative group/tooltip flex items-center">
            <button
              onClick={() => setIsProfileOpen(true)}
              aria-label="Profile"
              className="w-[2.3vw] h-[2.3vw] rounded-full overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center cursor-pointer flex-shrink-0 relative"
              style={{
                backgroundColor: !user
                  ? "#f3f4f6"
                  : userProfile.picture
                    ? "transparent"
                    : userProfile.avatarBgColor,
              }}
            >
              {!user ? (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-100 animate-pulse">
                  <div className="w-[1.1vw] h-[1.1vw] rounded-full bg-gray-300/80" />
                </div>
              ) : userProfile.picture ? (
                <img
                  src={userProfile.picture}
                  alt="Profile"
                  className="w-full h-full object-cover transition-opacity duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-white font-semibold text-[1vw] transition-all duration-300">
                  {userProfile.name
                    ? userProfile.name.charAt(0).toUpperCase()
                    : ""}
                </span>
              )}
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.4vw] hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
              <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.25vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                Profile & Auto-Save
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Render Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        isAutoSaveEnabled={isAutoSaveEnabled}
        onToggleAutoSave={onToggleAutoSave}
      />
      {/* Render Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        flipbookUrl={currentBook?.shareUrl}
        flipbookThumbnail={currentBook?.thumbnail}
        currentBook={currentBook}
        isMobileLayout={activeDevice === "Mobile"}
      />
      {/* Render Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onUnreadCountChange={setUnreadNotifCount}
      />
    </>
  );
};

export default EditorNavbar;
