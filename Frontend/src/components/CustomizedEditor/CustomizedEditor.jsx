import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './sidebar/Sidebar';
import PreviewArea from './PreviewArea';
import DetailPanelContainer from './components/DetailPanelContainer';
import PreloaderOverlay from './components/PreloaderOverlay';
import { ensureCleanBook } from '../../utils/dbUtils';
import { useAuth } from '../../context/AuthContext';
import { useLayoutColorVars } from './hooks/useLayoutColorVars';
import { useDynamicLayoutColors } from './hooks/useDynamicLayoutColors';
import { useCustomizedAutoSave } from './hooks/useCustomizedAutoSave';
import { useCustomizedActions } from './hooks/useCustomizedActions';
import { useCustomizedEditorData } from './hooks/useCustomizedEditorData';
import {
  createDefaultLogoSettings,
  createDefaultWatermarkSettings,
  createDefaultPreloaderSettings,
  createDefaultProfileSettings,
  createDefaultBackgroundSettings,
  createDefaultAppearanceSettings,
  createDefaultLayoutSettings,
  createDefaultLayoutColors,
  createDefaultMenuBarSettings,
  createDefaultOtherSetupSettings,
  createDefaultLeadFormSettings,
  createDefaultVisibilitySettings,
  createDefaultShareSettings
} from './utils/defaultSettings';

const normalizeSvgMarkup = (htmlStr) => {
  if (!htmlStr || typeof htmlStr !== 'string') return htmlStr;
  try {
    return htmlStr.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
      let newAttrs = attrs;
      const widthMatch = attrs.match(/\bwidth=["']([^"']*)["']/i);
      const heightMatch = attrs.match(/\bheight=["']([^"']*)["']/i);
      const viewBoxMatch = attrs.match(/\bviewBox=["']([^"']*)["']/i);
      
      const wVal = widthMatch ? widthMatch[1] : null;
      const hVal = heightMatch ? heightMatch[1] : null;
      
      if (!viewBoxMatch && wVal && hVal && !wVal.includes('%') && !hVal.includes('%')) {
        const numW = parseFloat(wVal);
        const numH = parseFloat(hVal);
        if (!isNaN(numW) && !isNaN(numH)) {
          newAttrs += ` viewBox="0 0 ${numW} ${numH}"`;
        }
      }
      
      if (/\bwidth=["'][^"']*["']/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(/\bwidth=["'][^"']*["']/i, 'width="100%"');
      } else {
        newAttrs += ' width="100%"';
      }
      if (/\bheight=["'][^"']*["']/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(/\bheight=["'][^"']*["']/i, 'height="100%"');
      } else {
        newAttrs += ' height="100%"';
      }
      return `<svg${newAttrs}>`;
    });
  } catch (e) {
    return htmlStr;
  }
};

const CustomizedEditor = () => {
  const { folder, v_id, page } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    setExportHandler,
    setSaveHandler,
    setPreviewHandler,
    setClearHandler,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    triggerSaveSuccess,
    isAutoSaveEnabled,
    currentBook,
    setCurrentBook,
    activeDevice
  } = useOutletContext() || {};
  const { user } = useAuth();

  // Core Editor States
  const [bookName, setBookName] = useState(() => location.state?.flipbookName || currentBook?.flipbookName || 'Name of the Book');
  const [activeSubView, setActiveSubView] = useState(null);
  const [otherSetupTarget, setOtherSetupTarget] = useState(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [pages, setPages] = useState(() => {
    if (location.state?.pages && Array.isArray(location.state.pages) && location.state.pages.length > 0) {
      return location.state.pages.map((p, i) => {
        const normalized = normalizeSvgMarkup(p.content || p.html || '');
        return {
          id: p.id !== undefined ? p.id : i,
          name: p.pageName || p.name || `Page ${i + 1}`,
          html: normalized,
          content: normalized,
          isHidden: Boolean(p.isHidden || p.hide === 1)
        };
      });
    }
    return [];
  });
  const [metaDimensions, setMetaDimensions] = useState(() => ({
    width: location.state?.width || currentBook?.width || null,
    height: location.state?.height || currentBook?.height || null,
    orientation: location.state?.orientation || currentBook?.orientation || null
  }));
  const [devicePages, setDevicePages] = useState({ Desktop: 0, Tablet: 0, Mobile: 0 });
  const targetPage = devicePages[activeDevice || 'Desktop'] || 0;
  const setTargetPage = useCallback((pageNum) => {
    setDevicePages(prev => {
      const dev = activeDevice || 'Desktop';
      if (prev[dev] === pageNum) return prev;
      return {
        ...prev,
        [dev]: pageNum
      };
    });
  }, [activeDevice]);

  const [projectBaseUrl, setProjectBaseUrl] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(() => {
    return Boolean(location.state?.pages && Array.isArray(location.state.pages) && location.state.pages.length > 0);
  });
  const [tocOpenTrigger, setTocOpenTrigger] = useState(0);

  // Customization Settings States
  const [logoSettings, setLogoSettings] = useState(() => createDefaultLogoSettings(currentBook, location.state));
  const [watermarkSettings, setWatermarkSettings] = useState(() => createDefaultWatermarkSettings(currentBook, location.state));
  const [preloaderSettings, setPreloaderSettings] = useState(() => createDefaultPreloaderSettings(currentBook, location.state));
  const [profileSettings, setProfileSettings] = useState(() => createDefaultProfileSettings(currentBook, location.state));
  const [backgroundSettings, setBackgroundSettings] = useState(() => createDefaultBackgroundSettings(currentBook, location.state));
  const [bookAppearanceSettings, setBookAppearanceSettings] = useState(() => createDefaultAppearanceSettings(currentBook, location.state));
  const [layoutSettings, setLayoutSettings] = useState(() => createDefaultLayoutSettings(currentBook, location.state));
  const [layoutColors, setLayoutColors] = useState(() => createDefaultLayoutColors(currentBook, location.state));
  const [menuBarSettings, setMenuBarSettings] = useState(() => createDefaultMenuBarSettings());
  const [otherSetupSettings, setOtherSetupSettings] = useState(() => createDefaultOtherSetupSettings());
  const [leadFormSettings, setLeadFormSettings] = useState(() => createDefaultLeadFormSettings());
  const [visibilitySettings, setVisibilitySettings] = useState(() => createDefaultVisibilitySettings());
  const [shareSettings, setShareSettings] = useState(() => createDefaultShareSettings());

  // Panel state synchronization
  useEffect(() => {
    setIsPanelCollapsed(false);
  }, [activeSubView]);

  // Clear previous book from IndexedDB and reset stale Redux book when opening a new book in Customized Editor
  useEffect(() => {
    if (v_id) {
      ensureCleanBook(v_id);
      if (setCurrentBook && currentBook?.v_id && currentBook.v_id !== v_id) {
        setCurrentBook(prev => ({
          ...(prev || {}),
          v_id: v_id,
          flipbookName: bookName,
          folder: folder || 'My_Flipbooks',
          pages: pages && pages.length > 0 ? pages : []
        }));
      }
    }
  }, [v_id]);

  const profilePreviewForcedRef = useRef(false);
  const hasFetchedRef = useRef(null);

  useEffect(() => {
    const shouldBeOpen = activeSubView === 'profile' && !isPanelCollapsed;
    if (shouldBeOpen && !profilePreviewForcedRef.current) {
      window.dispatchEvent(new Event('open-profile-preview'));
      profilePreviewForcedRef.current = true;
    } else if (!shouldBeOpen && profilePreviewForcedRef.current) {
      window.dispatchEvent(new Event('close-profile-preview'));
      profilePreviewForcedRef.current = false;
    }
  }, [activeSubView, isPanelCollapsed]);

  // Handle page sync with URL
  useEffect(() => {
    if (page !== undefined && page !== null && page !== '') {
      const pageNum = parseInt(page, 10);
      if (!isNaN(pageNum)) {
        setTargetPage(pageNum);
      }
    }
  }, [page, setTargetPage]);

  useEffect(() => {
    if (folder && v_id) {
      const targetPath = targetPage > 0
        ? `/editor/customized_editor/${encodeURIComponent(folder)}/${v_id}/${targetPage}`
        : `/editor/customized_editor/${encodeURIComponent(folder)}/${v_id}`;

      if (location.pathname !== targetPath) {
        navigate(targetPath, { replace: true, state: location.state });
      }
    }
  }, [targetPage, folder, v_id, navigate, location.pathname, location.state]);

  // Global flipbook name sync
  useEffect(() => {
    if (currentBook?.flipbookName && currentBook?.v_id === v_id) {
      setBookName(prev => (prev === currentBook.flipbookName ? prev : currentBook.flipbookName));
    }
  }, [currentBook?.flipbookName, currentBook?.v_id, v_id]);

  const bookNameRef = useRef(bookName);
  bookNameRef.current = bookName;

  // 1. Dynamic Layout Colors Extraction Hook
  useDynamicLayoutColors({
    backgroundSettings,
    layoutSettings,
    setLayoutColors,
    v_id,
    user,
    folder,
    bookNameRef,
    bookName
  });

  // 2. Actions & Context Handlers Hook
  const {
    handleSave,
    handleSaveRef,
    handleExport,
    handlePreview,
    handleClearAllPages,
    stableSaveHandler,
    lastLoadedBookNameRef
  } = useCustomizedActions({
    folder,
    v_id,
    bookName,
    setBookName,
    pages,
    setPages,
    targetPage,
    projectBaseUrl,
    setProjectBaseUrl,
    logoSettings,
    watermarkSettings,
    preloaderSettings,
    profileSettings,
    backgroundSettings,
    bookAppearanceSettings,
    layoutSettings,
    layoutColors,
    menuBarSettings,
    otherSetupSettings,
    leadFormSettings,
    visibilitySettings,
    shareSettings,
    setShareSettings,
    bookmarks,
    notes,
    user,
    currentBook,
    setCurrentBook,
    setExportHandler,
    setSaveHandler,
    setPreviewHandler,
    setClearHandler,
    setHasUnsavedChanges,
    triggerSaveSuccess
  });

  // 3. Data Fetching & State Initialization Hook
  const {
    isLoading,
    setIsLoading,
    loadingProgress,
    initialLoadRef
  } = useCustomizedEditorData({
    folder,
    v_id,
    page,
    setTargetPage,
    location,
    user,
    currentBook,
    setCurrentBook,
    bookName,
    setBookName,
    setPages,
    setProjectBaseUrl,
    setLogoSettings,
    setWatermarkSettings,
    setPreloaderSettings,
    setProfileSettings,
    setBackgroundSettings,
    setBookAppearanceSettings,
    setLayoutSettings,
    setLayoutColors,
    setMenuBarSettings,
    setOtherSetupSettings,
    setLeadFormSettings,
    setVisibilitySettings,
    setShareSettings,
    setBookmarks,
    setNotes,
    setIsDataLoaded,
    lastLoadedBookNameRef,
    setHasUnsavedChanges
  });

  // 4. Auto-save & Change Tracking Hook
  useCustomizedAutoSave({
    v_id,
    folder,
    bookName,
    bookNameRef,
    currentBook,
    pages,
    targetPage,
    isDataLoaded,
    user,
    backgroundSettings,
    bookAppearanceSettings,
    layoutSettings,
    layoutColors,
    menuBarSettings,
    setMenuBarSettings,
    otherSetupSettings,
    setOtherSetupSettings,
    leadFormSettings,
    visibilitySettings,
    shareSettings,
    setShareSettings,
    logoSettings,
    watermarkSettings,
    preloaderSettings,
    profileSettings,
    bookmarks,
    notes,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    isAutoSaveEnabled,
    isLoading,
    initialLoadRef,
    handleSaveRef
  });

  // Real-time synchronization of current book to Navbar and ShareModal
  useEffect(() => {
    if (setCurrentBook && bookName && v_id) {
      const currentAccess = visibilitySettings?.type || visibilitySettings?.access || 'Public';
      const effectiveShareId = 
        shareSettings?.shareId || 
        visibilitySettings?.shareId || 
        visibilitySettings?.Visibility?.shareId || 
        '';

      setCurrentBook(prev => {
        const sId = effectiveShareId || prev?.shareId || prev?.share?.shareId || prev?.Customized_Settings?.Visibility?.shareId || v_id;
        if (
          prev?.folder === folder &&
          prev?.flipbookName === bookName &&
          prev?.v_id === v_id &&
          prev?.shareId === sId &&
          (prev?.access || '').toLowerCase() === (currentAccess || '').toLowerCase()
        ) {
          return prev;
        }

        return {
          ...(prev || {}),
          folder,
          flipbookName: bookName,
          v_id,
          shareId: sId,
          type: currentAccess,
          access: currentAccess,
          shareAccess: currentAccess,
          share: {
            ...(prev?.share || {}),
            ...shareSettings,
            ...visibilitySettings,
            shareId: sId,
            access: currentAccess
          },
          Visibility: {
            ...(prev?.Visibility || {}),
            ...visibilitySettings,
            shareId: sId,
            access: currentAccess
          },
          Customized_Settings: {
            ...(prev?.Customized_Settings || {}),
            Visibility: {
              ...(prev?.Customized_Settings?.Visibility || {}),
              ...visibilitySettings,
              shareId: sId,
              access: currentAccess
            }
          },
          pages,
          settings: {
            ...(prev?.settings || {}),
            visibility: visibilitySettings
          }
        };
      });
    }
  }, [setCurrentBook, folder, v_id, bookName, shareSettings?.shareId, visibilitySettings?.access, visibilitySettings?.type, visibilitySettings?.shareId, pages]);

  // Build CSS variables for active layout colors
  const layoutColorVars = useLayoutColorVars(layoutSettings, layoutColors);
  const visiblePages = useMemo(() => pages.filter(p => !p.isHidden), [pages]);

  return (
    <div
      className="flex flex-col h-full w-full bg-[#D9D9D9] overflow-hidden font-sans select-none relative"
      style={layoutColorVars ? Object.fromEntries(layoutColorVars.split(';').filter(v => v.trim()).map(v => {
        const i = v.indexOf(':');
        return [v.slice(0, i).trim(), v.slice(i + 1).trim()];
      })) : {}}
    >
      <style>{`:root { ${layoutColorVars} }`}</style>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Sidebar - Always Visible */}
        <div className="w-[16.25vw] h-full flex-shrink-0 bg-white shadow-xl z-20 relative border-r border-gray-100 overflow-visible">
          <Sidebar
            bookName={bookName}
            setBookName={setBookName}
            activeSubView={activeSubView}
            setActiveSubView={setActiveSubView}
            isPanelCollapsed={isPanelCollapsed}
            setIsPanelCollapsed={setIsPanelCollapsed}
            pageCount={pages.filter(p => !p.isHidden).length}
            onSave={stableSaveHandler}
            currentBook={currentBook}
            setCurrentBook={setCurrentBook}
            isLoading={isLoading}
          />
        </div>

        {/* Sub-side Panel (Detail View) - Opens next to Main Sidebar */}
        <div
          className={`h-full bg-white shadow-lg z-10 border-r border-gray-100 transition-all duration-300 ease-in-out flex-shrink-0 ${
            activeSubView && !isPanelCollapsed
              ? 'w-[21.25vw] opacity-100 translate-x-0 overflow-visible'
              : 'w-0 opacity-0 -translate-x-full pointer-events-none overflow-hidden'
          }`}
        >
          <div className="w-[21vw] h-full flex flex-col overflow-visible">
            {isLoading ? (
              <div className="p-[1.2vw] flex flex-col gap-[1vw] animate-pulse">
                <div className="flex items-center gap-[0.8vw]">
                  <div className="w-[1.5vw] h-[1.5vw] bg-gray-200/80 rounded-[0.4vw]"></div>
                  <div className="h-[1vw] bg-gray-200/80 rounded-[0.3vw] w-1/2"></div>
                </div>
                <div className="h-[1px] bg-gray-100 my-[0.4vw]"></div>
                <div className="flex flex-col gap-[0.8vw]">
                  <div className="h-[2vw] bg-gray-100/80 rounded-[0.5vw] w-full"></div>
                  <div className="h-[2vw] bg-gray-100/80 rounded-[0.5vw] w-full"></div>
                  <div className="h-[4vw] bg-gray-100/80 rounded-[0.5vw] w-full"></div>
                </div>
              </div>
            ) : (
              activeSubView && (
                <DetailPanelContainer
                  activeSubView={activeSubView}
                  setActiveSubView={setActiveSubView}
                  setIsPanelCollapsed={setIsPanelCollapsed}
                  logoSettings={logoSettings}
                  setLogoSettings={setLogoSettings}
                  watermarkSettings={watermarkSettings}
                  setWatermarkSettings={setWatermarkSettings}
                  preloaderSettings={preloaderSettings}
                  setPreloaderSettings={setPreloaderSettings}
                  backgroundSettings={backgroundSettings}
                  setBackgroundSettings={setBackgroundSettings}
                  layoutSettings={layoutSettings}
                  setLayoutSettings={setLayoutSettings}
                  layoutColors={layoutColors}
                  setLayoutColors={setLayoutColors}
                  bookAppearanceSettings={bookAppearanceSettings}
                  setBookAppearanceSettings={setBookAppearanceSettings}
                  menuBarSettings={menuBarSettings}
                  setMenuBarSettings={setMenuBarSettings}
                  otherSetupSettings={otherSetupSettings}
                  setOtherSetupSettings={setOtherSetupSettings}
                  otherSetupTarget={otherSetupTarget}
                  setOtherSetupTarget={setOtherSetupTarget}
                  leadFormSettings={leadFormSettings}
                  setLeadFormSettings={setLeadFormSettings}
                  visibilitySettings={visibilitySettings}
                  setVisibilitySettings={setVisibilitySettings}
                  pages={pages}
                  folder={folder}
                  bookName={bookName}
                  v_id={v_id}
                  setTocOpenTrigger={setTocOpenTrigger}
                  setIsLoading={setIsLoading}
                />
              )
            )}
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 min-w-0 flex flex-col relative z-0 overflow-hidden">
          {/* Modern Flipbook Skeleton Loader */}
          {isLoading && pages.length === 0 && (
            <div 
              className="absolute inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden"
              style={{
                backgroundColor: '#1E1F24',
                color: '#ffffff'
              }}
            >
              <style>{`
                @keyframes skeletonShimmer {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
                .skeleton-shimmer {
                  position: absolute;
                  inset: 0;
                  transform: translateX(-100%);
                  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%);
                  animation: skeletonShimmer 2s infinite ease-in-out;
                }
              `}</style>
              
              <div className="w-full max-w-[800px] px-8 flex flex-col items-center justify-center gap-6">
                {/* Top Status Badge */}
                <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 shadow-sm backdrop-blur-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-[13px] font-medium tracking-wide text-gray-200">
                    Preparing Flipbook Preview... {loadingProgress > 0 && loadingProgress < 100 ? `${loadingProgress}%` : ''}
                  </span>
                </div>

                {/* 2-Page Open Book Skeleton Spread */}
                <div className="relative w-full aspect-[16/10] max-h-[460px] flex rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#25282F]">
                  {/* Left Page Skeleton */}
                  <div className="flex-1 p-8 border-r border-black/40 flex flex-col justify-between bg-gradient-to-br from-white/10 via-white/5 to-transparent relative overflow-hidden">
                    <div className="skeleton-shimmer" />
                    <div className="space-y-4">
                      <div className="h-6 w-3/4 rounded-md bg-white/20" />
                      <div className="h-3 w-full rounded bg-white/10" />
                      <div className="h-3 w-5/6 rounded bg-white/10" />
                      <div className="h-3 w-4/6 rounded bg-white/10" />
                    </div>
                    <div className="w-full h-28 rounded-lg bg-white/10 border border-white/5 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/10" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-2.5 w-16 rounded bg-white/10" />
                      <div className="h-3 w-6 rounded bg-white/15" />
                    </div>
                  </div>

                  {/* Center Spine Crease */}
                  <div className="w-[3px] bg-gradient-to-b from-black/50 via-black/80 to-black/50 shadow-inner z-10" />

                  {/* Right Page Skeleton */}
                  <div className="flex-1 p-8 flex flex-col justify-between bg-gradient-to-bl from-white/10 via-white/5 to-transparent relative overflow-hidden">
                    <div className="skeleton-shimmer" style={{ animationDelay: '0.4s' }} />
                    <div className="space-y-3.5">
                      <div className="h-5 w-1/2 rounded bg-white/15 mb-4" />
                      <div className="h-3 w-full rounded bg-white/10" />
                      <div className="h-3 w-full rounded bg-white/10" />
                      <div className="h-3 w-3/4 rounded bg-white/10" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-full rounded bg-white/10" />
                      <div className="h-3 w-5/6 rounded bg-white/10" />
                      <div className="h-3 w-4/6 rounded bg-white/10" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-3 w-6 rounded bg-white/15" />
                      <div className="h-2.5 w-16 rounded bg-white/10" />
                    </div>
                  </div>
                </div>

                {/* Bottom Floating Toolbar Skeleton */}
                <div className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-lg">
                  <div className="w-6 h-6 rounded-full bg-white/20" />
                  <div className="w-16 h-4 rounded-full bg-white/15" />
                  <div className="w-6 h-6 rounded-full bg-white/20" />
                  <div className="w-[1px] h-4 bg-white/20 mx-1" />
                  <div className="w-5 h-5 rounded-md bg-white/15" />
                  <div className="w-5 h-5 rounded-md bg-white/15" />
                  <div className="w-5 h-5 rounded-md bg-white/15" />
                </div>
              </div>
            </div>
          )}
          <PreviewArea
            bookName={bookName}
            pages={visiblePages}
            targetPage={targetPage}
            logoSettings={logoSettings}
            watermarkSettings={watermarkSettings}
            backgroundSettings={backgroundSettings}
            bookAppearanceSettings={bookAppearanceSettings}
            menuBarSettings={menuBarSettings}
            leadFormSettings={leadFormSettings}
            profileSettings={profileSettings}
            otherSetupSettings={otherSetupSettings}
            onUpdateOtherSetup={setOtherSetupSettings}
            activeLayout={layoutSettings}
            layoutColors={layoutColors}
            isSidebarOpen={activeSubView && !isPanelCollapsed}
            activeDevice={activeDevice || 'Desktop'}
            activeSubView={activeSubView}
            bookmarks={bookmarks}
            notes={notes}
            setBookmarks={setBookmarks}
            setNotes={setNotes}
            onFlip={setTargetPage}
            isEditor={true}
            useNativeFullscreen={true}
            baseUrl={projectBaseUrl}
            isLoading={isLoading}
            externalShowTOC={tocOpenTrigger}
            currentBook={currentBook}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomizedEditor;
