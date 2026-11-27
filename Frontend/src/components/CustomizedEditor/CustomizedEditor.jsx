import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './sidebar/Sidebar';
import PreviewArea from './PreviewArea';
import DetailPanelContainer from './components/DetailPanelContainer';
import PreloaderOverlay from './components/PreloaderOverlay';
import { ensureCleanBook } from '../../utils/storage/dbUtils';
import { useAuth } from '../../context/AuthContext';
import { useLayoutColorVars } from './hooks/useLayoutColorVars';
import { useDynamicLayoutColors } from './hooks/useDynamicLayoutColors';
import { useCustomizedAutoSave } from './hooks/useCustomizedAutoSave';
import { useCustomizedActions } from './hooks/useCustomizedActions';
import { useCustomizedEditorData } from './hooks/useCustomizedEditorData';
import { Icon } from '@iconify/react';
import { executeInlineTranslation, isEditableTextField, TRANSLATE_LANGUAGES } from '../PageEditor/utils/inlineTranslationHelper';
import { loadWindowFromIDB } from '../../utils/customizedEditor/pageWindowStore';
import { clearRasterCache } from '../../utils/customizedEditor/pageRasterCache';
import { getInFlightActivityCount } from '../../utils/storage/saveLockManager';
import { subscribeEditorSync } from '../../utils/common/editorSyncChannel';
import { queryClient } from '../../queryClient';
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
    isSaving,
    setIsSaving,
    currentBook,
    setCurrentBook,
    activeDevice,
    setExportContext
  } = useOutletContext() || {};
  const { user } = useAuth();

  // Core Editor States
  const [bookName, setBookName] = useState(() => location.state?.flipbookName || currentBook?.flipbookName || 'Name of the Book');
  const [activeSubView, setActiveSubView] = useState(null);
  const [otherSetupTarget, setOtherSetupTarget] = useState(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [pages, setPages] = useState(() => {
    const rawPages = location.state?.pages;
    const totalCount = Number(location.state?.pageCount) || (Array.isArray(rawPages) ? rawPages.length : 0);
    
    if (totalCount > 0) {
      const initialPages = Array.isArray(rawPages) ? rawPages : [];
      return Array.from({ length: totalCount }, (_, i) => {
        const p = initialPages[i];
        if (p) {
          const normalized = normalizeSvgMarkup(p.content || p.html || '');
          return {
            id: p.id !== undefined ? p.id : i,
            pageNumber: p.pageNumber || i + 1,
            name: p.pageName || p.name || `Page ${i + 1}`,
            html: normalized,
            content: normalized,
            isHidden: Boolean(p.isHidden || p.hide === 1),
            isPlaceholder: false
          };
        }
        return {
          id: i,
          pageNumber: i + 1,
          name: `Page ${i + 1}`,
          html: '',
          content: '',
          isHidden: false,
          isPlaceholder: true
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

  // Invalidate queries on unmount so returning to MyFlipbooks refetches latest data
  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ['flipbook-books'] });
      queryClient.invalidateQueries({ queryKey: ['flipbook-folders'] });
    };
  }, []);

  // Customization Settings States (only seed from currentBook if it matches this book's v_id)
  const matchingBook = currentBook?.v_id === v_id ? currentBook : null;
  const [logoSettings, setLogoSettings] = useState(() => createDefaultLogoSettings(matchingBook, location.state));
  const [watermarkSettings, setWatermarkSettings] = useState(() => createDefaultWatermarkSettings(matchingBook, location.state));
  const [preloaderSettings, setPreloaderSettings] = useState(() => createDefaultPreloaderSettings(matchingBook, location.state));
  const [profileSettings, setProfileSettings] = useState(() => createDefaultProfileSettings(matchingBook, location.state));
  const [backgroundSettings, setBackgroundSettings] = useState(() => createDefaultBackgroundSettings(matchingBook, location.state));
  const [bookAppearanceSettings, setBookAppearanceSettings] = useState(() => createDefaultAppearanceSettings(matchingBook, location.state));
  const [layoutSettings, setLayoutSettings] = useState(() => createDefaultLayoutSettings(matchingBook, location.state));
  const [layoutColors, setLayoutColors] = useState(() => createDefaultLayoutColors(matchingBook, location.state));
  const [menuBarSettings, setMenuBarSettings] = useState(() => createDefaultMenuBarSettings());
  const [otherSetupSettings, setOtherSetupSettings] = useState(() => createDefaultOtherSetupSettings());
  const [leadFormSettings, setLeadFormSettings] = useState(() => createDefaultLeadFormSettings(matchingBook, location.state));
  const [visibilitySettings, setVisibilitySettings] = useState(() => createDefaultVisibilitySettings());
  const [shareSettings, setShareSettings] = useState(() => createDefaultShareSettings());

  const [translateContextMenu, setTranslateContextMenu] = useState(null); // { x, y }

  // Track editable text inputs/textareas, right-click translate menu, & handle inline translation in CustomizedEditor
  useEffect(() => {
    const captureEditable = (e) => {
      const target = e?.target;
      if (isEditableTextField(target)) {
        window.__lastEditableSelection = {
          el: target,
          start: target.selectionStart,
          end: target.selectionEnd,
          timestamp: Date.now(),
        };
      }
    };
    const handleContextMenu = (e) => {
      const target = e?.target;
      if (isEditableTextField(target)) {
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const hasSelectedText = typeof start === 'number' && typeof end === 'number' && start !== end && (target.value || '').slice(start, end).trim().length > 0;
        if (hasSelectedText) {
          e.preventDefault();
          window.__lastEditableSelection = {
            el: target,
            start,
            end,
            timestamp: Date.now(),
          };
          const menuWidth = 190;
          const menuHeight = 48;
          const x = Math.min(e.clientX, window.innerWidth - menuWidth - 16);
          const y = Math.min(e.clientY, window.innerHeight - menuHeight - 16);
          setTranslateContextMenu({ x, y });
          return;
        }
      }
      setTranslateContextMenu(null);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setTranslateContextMenu(null);
    };
    const handleTriggerInlineTranslate = async (e) => {
      const { targetLang = 'tam_Taml' } = e?.detail || {};
      await executeInlineTranslation({ targetLang });
    };
    document.addEventListener('focusin', captureEditable, true);
    document.addEventListener('mouseup', captureEditable, true);
    document.addEventListener('keyup', captureEditable, true);
    document.addEventListener('select', captureEditable, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('trigger-inline-translate', handleTriggerInlineTranslate);
    return () => {
      document.removeEventListener('focusin', captureEditable, true);
      document.removeEventListener('mouseup', captureEditable, true);
      document.removeEventListener('keyup', captureEditable, true);
      document.removeEventListener('select', captureEditable, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('trigger-inline-translate', handleTriggerInlineTranslate);
    };
  }, []);

  // Panel state synchronization
  useEffect(() => {
    setIsPanelCollapsed(false);
  }, [activeSubView]);

  // Clear previous book from IndexedDB and reset stale states when opening a new book in Customized Editor
  const activeVIdRef = useRef(v_id);
  useEffect(() => {
    if (!v_id) return;
    if (activeVIdRef.current !== v_id) {
      activeVIdRef.current = v_id;
      ensureCleanBook(v_id);
      clearRasterCache();
      const newBookName = location.state?.flipbookName || 'Name of the Book';
      setBookName(newBookName);
      setPreloaderSettings(createDefaultPreloaderSettings(null, location.state));
      setProjectBaseUrl(null);
      setDevicePages({ Desktop: 0, Tablet: 0, Mobile: 0 });
      setIsDataLoaded(Boolean(location.state?.pages && location.state.pages.length > 0));

      const rawPages = location.state?.pages;
      const totalCount = Number(location.state?.pageCount) || (Array.isArray(rawPages) ? rawPages.length : 0);
      if (totalCount > 0) {
        const initialPages = Array.isArray(rawPages) ? rawPages : [];
        setPages(Array.from({ length: totalCount }, (_, i) => {
          const p = initialPages[i];
          if (p) {
            const normalized = normalizeSvgMarkup(p.content || p.html || '');
            return {
              id: p.id !== undefined ? p.id : i,
              pageNumber: p.pageNumber || i + 1,
              name: p.pageName || p.name || `Page ${i + 1}`,
              html: normalized,
              content: normalized,
              isHidden: Boolean(p.isHidden || p.hide === 1),
              isPlaceholder: Boolean(p.isPlaceholder)
            };
          }
          return {
            id: i,
            pageNumber: i + 1,
            name: `Page ${i + 1}`,
            html: '',
            content: '',
            isHidden: false,
            isPlaceholder: true
          };
        }));
      } else {
        setPages([]);
      }

      if (setCurrentBook) {
        setCurrentBook({
          v_id: v_id,
          flipbookName: newBookName,
          folder: folder || 'My_Flipbooks',
          pages: Array.isArray(rawPages) ? rawPages : []
        });
      }
    }
  }, [v_id, location.state]);

  // Live listener for background-extracted pages streamed by backgroundExtractionManager (batched to prevent render storms)
  useEffect(() => {
    let pendingUpdates = [];
    let batchTimer = null;

    const flushPending = () => {
      if (pendingUpdates.length === 0) return;

      // Postpone React state update if user is in the middle of flipping a page to keep 60fps
      if (typeof document !== 'undefined' && document.querySelector('.fbe-is-flipping')) {
        if (batchTimer) clearTimeout(batchTimer);
        batchTimer = setTimeout(flushPending, 250);
        return;
      }

      const updates = [...pendingUpdates];
      pendingUpdates = [];

      setPages(prevPages => {
        if (!Array.isArray(prevPages) || prevPages.length === 0) return prevPages;
        let changed = false;
        let next = [...prevPages];

        for (const update of updates) {
          const { pageNumber, rawHtml } = update;
          if (typeof pageNumber !== 'number' || pageNumber < 1) continue;
          const targetIdx = pageNumber - 1;

          // Extend array if targetIdx exceeds current length to ensure pages are never lost or skipped
          while (next.length <= targetIdx) {
            next.push({
              id: next.length,
              pageNumber: next.length + 1,
              name: `Page ${next.length + 1}`,
              html: '',
              content: '',
              isHidden: false,
              isPlaceholder: true
            });
            changed = true;
          }

          const current = next[targetIdx];
          if (current.html === rawHtml && !current.isPlaceholder) continue;
          next[targetIdx] = {
            ...current,
            html: rawHtml,
            content: rawHtml,
            isPlaceholder: false
          };
          changed = true;
        }

        return changed ? next : prevPages;
      });
    };

    const handlePageExtracted = (e) => {
      const { v_id: eventVId, pageNumber, content, html } = e.detail || {};
      if (!eventVId || (v_id && eventVId !== v_id)) return;
      const rawHtml = html || content || '';
      if (!rawHtml) return;

      pendingUpdates.push({ pageNumber, rawHtml });
      if (batchTimer) clearTimeout(batchTimer);
      batchTimer = setTimeout(flushPending, 500);
    };

    window.addEventListener('flipbook-page-extracted', handlePageExtracted);
    return () => {
      if (batchTimer) clearTimeout(batchTimer);
      window.removeEventListener('flipbook-page-extracted', handlePageExtracted);
    };
  }, [v_id]);

  // Virtual Sliding Window: dynamically hydrates active spread ± 2 buffer pages from IndexedDB
  useEffect(() => {
    if (!v_id || !pages || pages.length === 0) return;
    const centerIdx = Math.max(0, targetPage);
    const totalCount = pages.length;

    let isMounted = true;
    loadWindowFromIDB(v_id, centerIdx, totalCount).then(({ pages: windowPages }) => {
      if (!isMounted || !windowPages || Object.keys(windowPages).length === 0) return;

      setPages(prevPages => {
        if (!Array.isArray(prevPages) || prevPages.length === 0) return prevPages;
        let changed = false;
        const next = [...prevPages];

        for (const [strIdx, pageData] of Object.entries(windowPages)) {
          const idx = Number(strIdx);
          if (idx < 0 || idx >= next.length) continue;
          const current = next[idx];
          const freshHtml = pageData.html || pageData.content || '';
          const isFreshPlaceholder = pageData.isPlaceholder || freshHtml.includes('generateSkeletonPageSvg') || freshHtml.includes('createDefaultPageData');
          if (freshHtml && current.html !== freshHtml && !isFreshPlaceholder) {
            next[idx] = {
              ...current,
              html: freshHtml,
              content: freshHtml,
              isPlaceholder: false
            };
            changed = true;
          }
        }
        return changed ? next : prevPages;
      });
    }).catch(() => {});

    return () => { isMounted = false; };
  }, [v_id, targetPage, pages.length]);

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
      const isFolId = (val) => Boolean(val && typeof val === 'string' && (val.startsWith('fol_') || /^[0-9a-fA-F]{12,24}$/.test(val) || val === 'fol_default' || val === 'default'));
      // Debounce URL updates — avoids re-serialising location.state (SVG data) on every flip
      const timer = setTimeout(() => {
        const activeFolderVId =
          currentBook?.folder_v_id ||
          currentBook?.folder_id ||
          location.state?.folder_v_id ||
          (isFolId(folder) ? folder : null);

        const rawTargetFolder = activeFolderVId || folder;
        const targetFolderParam = (typeof rawTargetFolder === 'string' ? rawTargetFolder.replace(/^fol_/, '') : rawTargetFolder) || 'default';
        const targetPath = targetPage > 0
          ? `/editor/customized_editor/${encodeURIComponent(targetFolderParam)}/${v_id}/${targetPage}`
          : `/editor/customized_editor/${encodeURIComponent(targetFolderParam)}/${v_id}`;

        if (window.location.pathname !== targetPath) {
          window.history.replaceState(window.history.state, '', targetPath);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    // navigate and location are stable refs — intentionally excluded to prevent
    // re-serialising location.state (SVG data) on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPage, folder, v_id, currentBook?.folder_v_id, currentBook?.folder_id]);

  // Sync export context (pages, active page index, active spread pages) to EditorLayout for ExportModal
  useEffect(() => {
    if (setExportContext) {
      const isMobileDevice = activeDevice === 'Mobile';
      const isTabletPortrait = activeDevice === 'Tablet' && typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
      const isSingle = isMobileDevice || isTabletPortrait;
      const totalCount = pages.length;

      let currentSpreadPages = [];
      if (totalCount > 0) {
        // targetPage is 0-indexed (0 = Page 1)
        const page1Based = (targetPage || 0) + 1;

        if (isSingle) {
          const p = Math.max(1, Math.min(page1Based, totalCount));
          currentSpreadPages = [p];
        } else {
          // Two-page spread
          if (page1Based <= 1) {
            // Page 1 is cover
            currentSpreadPages = [1];
          } else if (totalCount % 2 === 0 && page1Based >= totalCount) {
            // Even page count back cover
            currentSpreadPages = [totalCount];
          } else {
            // Internal 2-page spread: even left, odd right (e.g. 2 & 3, 4 & 5, 6 & 7, 8 & 9)
            const leftPage = page1Based % 2 === 0 ? page1Based : page1Based - 1;
            const rightPage = leftPage + 1;
            currentSpreadPages = [leftPage];
            if (rightPage <= totalCount) {
              currentSpreadPages.push(rightPage);
            }
          }
        }
      }

      setExportContext({
        pages,
        activePageIndex: targetPage || 0,
        activePages: currentSpreadPages
      });
    }
  }, [pages, targetPage, activeDevice, setExportContext]);

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
    pages,
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
    handleSaveRef,
    setIsSaving,
    triggerSaveSuccess
  });

  // Enterprise Unload Guard: Prevent closing tab while saving or asset upload is in progress
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const inFlight = getInFlightActivityCount();
      if (hasUnsavedChanges || isSaving || inFlight > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSaving]);

  // Real-time synchronization when PageEditor saves changes in another tab
  useEffect(() => {
    if (!v_id) return;
    const unsub = subscribeEditorSync(v_id, (event) => {
      if (event.type === 'book-saved') {
        console.log('[CustomizedEditor] Background save detected from PageEditor. Invalidating caches.');
        try { clearRasterCache(v_id); } catch (_) {}
        try { queryClient.invalidateQueries(['flipbook', v_id]); } catch (_) {}
      }
    });
    return unsub;
  }, [v_id]);

  // Real-time synchronization of current book to Navbar and ShareModal
  useEffect(() => {
    if (setCurrentBook && bookName && v_id) {
      const currentAccess = visibilitySettings?.type || visibilitySettings?.access || 'Public';
      const effectiveShareId = 
        shareSettings?.shareId || 
        visibilitySettings?.shareId || 
        visibilitySettings?.Visibility?.shareId || 
        '';

      const effectiveFolder = folder || currentBook?.folder || 'default';

      setCurrentBook(prev => {
        const sId = effectiveShareId || prev?.shareId || prev?.share?.shareId || prev?.Customized_Settings?.Visibility?.shareId || v_id;
        const prevFolder = prev?.folder || 'default';
        if (
          prevFolder === effectiveFolder &&
          prev?.flipbookName === bookName &&
          prev?.v_id === v_id &&
          prev?.shareId === sId &&
          (prev?.access || '').toLowerCase() === (currentAccess || '').toLowerCase()
        ) {
          return prev;
        }

        return {
          ...(prev || {}),
          folder: effectiveFolder,
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
  }, [setCurrentBook, folder, v_id, bookName, shareSettings?.shareId, visibilitySettings?.access, visibilitySettings?.type, visibilitySettings?.shareId]);

  // Build CSS variables for active layout colors
  const layoutColorVars = useLayoutColorVars(layoutSettings, layoutColors);
  const visiblePages = useMemo(() => pages.filter(p => !p.isHidden), [pages]);

  const isPdfProject = useMemo(() => {
    const bookType = String(currentBook?.bookType || currentBook?.meta?.bookType || '').toLowerCase();
    if (bookType === 'pdf') return true;
    return pages.some(
      (p) =>
        p?.html &&
        (p.html.includes('data-name="PDF Background"') ||
          p.html.includes('data-type="pdf-vector-layer"') ||
          p.html.includes('Document Shield'))
    );
  }, [currentBook?.bookType, currentBook?.meta?.bookType, pages]);

  useEffect(() => {
    if (setCurrentBook) {
      setCurrentBook((prev) => {
        if (!prev) return prev;
        if (Boolean(prev.isPdfProject) === isPdfProject) return prev;
        return { ...prev, isPdfProject };
      });
    }
  }, [isPdfProject, setCurrentBook]);

  return (
    <div
      className="flex flex-col h-full w-full bg-[#D9D9D9] overflow-hidden font-sans select-none relative"
      style={layoutColorVars ? Object.fromEntries(layoutColorVars.split(';').filter(v => v.trim()).map(v => {
        const i = v.indexOf(':');
        return [v.slice(0, i).trim(), v.slice(i + 1).trim()];
      })) : {}}
    >
      {/* Right-click Translate Selection Context Menu for selected text in editable inputs */}
      {translateContextMenu && (
        <>
          <div
            className="fixed inset-0 z-[99990]"
            onMouseDown={(e) => {
              e.preventDefault();
              setTranslateContextMenu(null);
            }}
          />
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="fixed z-[99991] w-[12.5vw] min-w-[175px] bg-white rounded-[0.55vw] shadow-[0_12px_32px_rgba(0,0,0,0.18)] border border-gray-100 p-[0.35vw]"
            style={{ left: translateContextMenu.x, top: translateContextMenu.y }}
          >
            <div className="relative group/translate-root">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('trigger-inline-translate', {
                    detail: { targetLang: 'tam_Taml' }
                  }));
                  setTranslateContextMenu(null);
                }}
                className="w-full flex items-center justify-between px-[0.6vw] py-[0.42vw] text-[0.75vw] font-medium text-gray-700 hover:bg-gray-50 rounded-[0.4vw] text-left cursor-pointer group-hover/translate-root:bg-gray-50"
              >
                <div className="flex items-center gap-[0.55vw]">
                  <Icon icon="bi:translate" className="w-[0.9vw] h-[0.9vw] text-gray-700" />
                  <span>Translate Selection</span>
                </div>
                <Icon icon="mdi:chevron-right" className="w-[0.8vw] h-[0.8vw] text-gray-400" />
              </button>

              <div
                onMouseDown={(e) => e.preventDefault()}
                className={`absolute left-full pl-[0.35vw] hidden group-hover/translate-root:block z-[99992] ${
                  translateContextMenu.y > (typeof window !== 'undefined' ? window.innerHeight - 280 : 500)
                    ? 'bottom-0'
                    : 'top-0'
                }`}
              >
                <div className="w-[11.5vw] min-w-[165px] bg-white rounded-[0.5vw] shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-gray-100 p-[0.3vw] flex flex-col gap-[0.1vw] max-h-[32vh] overflow-y-auto">
                  <div className="px-[0.4vw] py-[0.2vw] border-b border-gray-100 text-[0.65vw] font-bold text-gray-500">
                    Translate to:
                  </div>
                  {TRANSLATE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('trigger-inline-translate', {
                          detail: { targetLang: lang.code }
                        }));
                        setTranslateContextMenu(null);
                      }}
                      className={`flex items-center justify-between px-[0.5vw] py-[0.35vw] text-[0.7vw] font-medium rounded-[0.3vw] text-left cursor-pointer transition-colors ${
                        lang.code === 'tam_Taml'
                          ? 'bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200/70'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-[0.65vw] text-gray-400">{lang.native}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        :root { ${layoutColorVars} }
      `}</style>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Sidebar - Always Visible */}
        <div className="w-[16.25vw] h-full flex-shrink-0 bg-[#ffffff] shadow-sm z-20 relative border-r border-gray-200 overflow-visible">
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
          className={`h-full bg-[#fafafa] text-gray-800 shadow-sm z-10 border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0 ${
            activeSubView && !isPanelCollapsed
              ? 'w-[21.25vw] opacity-100 translate-x-0 overflow-visible'
              : 'w-0 opacity-0 -translate-x-full pointer-events-none overflow-hidden'
          }`}
        >
          {isLoading ? (
            <div className="p-[1.2vw] flex flex-col gap-[1vw] animate-pulse">
              <div className="flex items-center gap-[0.8vw]">
                <div className="w-[1.5vw] h-[1.5vw] bg-gray-200 rounded-[0.4vw]"></div>
                <div className="h-[1vw] bg-gray-200 rounded-[0.3vw] w-1/2"></div>
              </div>
              <div className="h-[1px] bg-gray-200 my-[0.4vw]"></div>
              <div className="flex flex-col gap-[0.8vw]">
                <div className="h-[2vw] bg-gray-100 rounded-[0.5vw] w-full"></div>
                <div className="h-[2vw] bg-gray-100 rounded-[0.5vw] w-full"></div>
                <div className="h-[4vw] bg-gray-100 rounded-[0.5vw] w-full"></div>
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

        {/* Main Preview Area */}
        <div className="flex-1 min-w-0 flex flex-col relative z-0 overflow-hidden">
          <PreloaderOverlay
            isLoading={isLoading && pages.length === 0}
            preloaderSettings={{ isCustom: false }}
            loadingProgress={loadingProgress}
          />
          <PreviewArea
            bookName={bookName}
            pages={visiblePages}
            targetPage={targetPage}
            onFlip={setTargetPage}
            logoSettings={logoSettings}
            watermarkSettings={watermarkSettings}
            backgroundSettings={backgroundSettings}
            bookAppearanceSettings={bookAppearanceSettings}
            menuBarSettings={menuBarSettings}
            leadFormSettings={leadFormSettings}
            onUpdateLeadForm={setLeadFormSettings}
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
            v_id={v_id}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomizedEditor;
