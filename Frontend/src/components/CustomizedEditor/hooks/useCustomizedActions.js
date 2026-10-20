import { useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { saveCustomizedEditorState } from '../../../utils/dbUtils';
import { getSupabaseBaseUrl } from '../../../utils/assetUtils';
import { createDefaultPageData } from '../utils/defaultPageData';

export const useCustomizedActions = ({
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
  triggerSaveSuccess,
  notifiedUnsavedRef
}) => {
  const lastLoadedBookNameRef = useRef(null);
  const currentBookRef = useRef(currentBook);
  useEffect(() => { currentBookRef.current = currentBook; }, [currentBook]);

  const handleExport = useCallback(() => {
    console.log("Exporting...");
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const userEmail = user?.emailId || user?.email || user?.userEmail;
      const customUserId = user?.userID;
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

      const prevBookName = lastLoadedBookNameRef.current || currentBook?.flipbookName;
      const validBookName = bookName || currentBook?.flipbookName || currentBook?.title || (v_id ? decodeURIComponent(v_id) : 'Untitled Document');
      const newBookName = validBookName;
      const isRenamed = prevBookName && prevBookName !== newBookName && prevBookName !== 'Name of the Book';

      // 1. Save flipbook pages and structure to /api/flipbook/save
      if (pages && pages.length > 0 && validBookName) {
        const payloadPages = pages.map((p, index) => ({
          pageName: p.name || `Page ${index + 1}`,
          content: p.html || p.content || '',
          v_id: p.v_id || (typeof p.id === 'string' && p.id.length > 5 ? p.id : null)
        }));

        const savePayload = {
          emailId: userEmail,
          v_id: v_id,
          flipbookName: validBookName,
          folderName: folder || 'Recent Book',
          overwrite: true,
          pages: payloadPages
        };

        await axios.post(`${backendUrl}/api/flipbook/save`, savePayload).catch(err => {
          console.warn("Main save endpoint call in CustomizedEditor warning:", err);
        });
      }

      // Sync gallery settings
      const rawGalleryImages = (otherSetupSettings?.gallery?.images && otherSetupSettings.gallery.images.length > 0)
        ? otherSetupSettings.gallery.images
        : (menuBarSettings?.interaction?.gallerySettings?.images || []);

      const effectiveGalleryImages = rawGalleryImages.filter(img => img && img.url && !img.url.startsWith('blob:'));

      const mergedGallerySettings = {
        ...(menuBarSettings?.interaction?.gallerySettings || {}),
        ...(otherSetupSettings?.gallery || {}),
        images: effectiveGalleryImages
      };

      const syncedMenuBarSettings = {
        ...menuBarSettings,
        interaction: {
          ...menuBarSettings?.interaction,
          gallerySettings: mergedGallerySettings
        }
      };

      const syncedOtherSetupSettings = {
        ...otherSetupSettings,
        gallery: mergedGallerySettings
      };

      // 2. Save customization settings
      const payload = {
        emailId: userEmail,
        userID: customUserId,
        folderName: folder || 'Recent Book',
        v_id: v_id,
        bookName: validBookName,
        flipbookName: validBookName,
        oldName: prevBookName,
        newName: validBookName,
        Customized_Settings: {
          FlipbookInfo: {
            category: currentBook?.category || 'Product Based',
            language: currentBook?.language || 'English',
            tags: currentBook?.tags || [],
            quotes: currentBook?.quotes || '',
            about: currentBook?.about || ''
          },
          Branding: {
            logoSettings,
            watermarkSettings,
            preloaderSettings
          },
          Background: backgroundSettings,
          MenuBar: syncedMenuBarSettings,
          Layouts: {
            layoutStyle: layoutSettings,
            layoutColors: layoutColors
          },
          BookAppearance: bookAppearanceSettings,
          otherSetup: syncedOtherSetupSettings,
          leadForm: leadFormSettings,
          Visibility: {
            ...(shareSettings || {}),
            access: visibilitySettings?.type || 'Public',
            password: visibilitySettings?.password || '',
            accessKey: visibilitySettings?.accessKey || '',
            isPasswordSaved: Boolean(visibilitySettings?.isPasswordSaved),
            inviteOnly: visibilitySettings?.inviteOnly || {}
          }
        }
      };

      await axios.post(`${backendUrl}/api/flipbook/update-settings`, payload);
      if (payload.share) setShareSettings(payload.share);
      if (triggerSaveSuccess) {
        triggerSaveSuccess({ name: validBookName, isManual: true });
      }
      if (setHasUnsavedChanges) {
        setHasUnsavedChanges(false);
      }

      let updatedPagesList = pages;
      if (isRenamed) {
        const sanitizedEmail = (userEmail || 'default_user').replace(/[@.]/g, "_");
        const userFolder = customUserId || currentBook?.userID || user?.userID || sanitizedEmail;
        const realFolder = (currentBook?.folderName && Array.isArray(currentBook.folderName))
          ? (currentBook.folderName.find(f => f !== 'Recent Book' && f !== 'Recent book') || 'My_Flipbooks')
          : (folder && folder !== 'Recent Book' ? folder : 'My_Flipbooks');

        const newPBaseUrl = getSupabaseBaseUrl(userFolder, realFolder, newBookName);
        setProjectBaseUrl(newPBaseUrl);

        const escapedOld = prevBookName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "(?: |%20)");
        const oldPathRegex = new RegExp(`/${escapedOld}/`, 'g');
        const newPathSegment = `/${newBookName}/`;

        setPages(prevPages => {
          if (!prevPages) return [];
          updatedPagesList = prevPages.map(p => {
            const h = p.html || p.content || '';
            const newH = h.replace(oldPathRegex, newPathSegment);
            return {
              ...p,
              html: newH,
              content: newH
            };
          });
          return updatedPagesList;
        });

        lastLoadedBookNameRef.current = newBookName;
      }

      await saveCustomizedEditorState({
        v_id: v_id,
        bookName: newBookName,
        folderName: folder || 'Recent Book',
        pages: updatedPagesList,
        activePageIndex: targetPage || 0,
        Background: backgroundSettings,
        BookAppearance: bookAppearanceSettings,
        Layouts: {
          layoutStyle: layoutSettings,
          layoutColors: layoutColors
        },
        MenuBar: syncedMenuBarSettings,
        Branding: {
          logoSettings,
          watermarkSettings,
          preloaderSettings
        },
        Visibility: visibilitySettings,
        shareSettings: shareSettings,
        otherSetup: syncedOtherSetupSettings,
        leadForm: leadFormSettings,
        bookmarks: bookmarks,
        notes: notes,
        timestamp: Date.now()
      });

      if (setCurrentBook) {
        setCurrentBook(prev => ({
          ...(prev || {}),
          flipbookName: newBookName,
          realName: newBookName,
          title: newBookName,
          meta: {
            ...(prev?.meta || {}),
            flipbookName: newBookName
          }
        }));
      }

      if (setHasUnsavedChanges) {
        setHasUnsavedChanges(false);
        if (notifiedUnsavedRef) notifiedUnsavedRef.current = false;
      }
      if (triggerSaveSuccess) triggerSaveSuccess({ name: newBookName, folder: 'Customized' });
    } catch (error) {
      console.error("Save failed", error);
    }
  }, [
    folder, v_id, bookName, pages, logoSettings, watermarkSettings, preloaderSettings,
    profileSettings, backgroundSettings, bookAppearanceSettings, layoutSettings,
    layoutColors, menuBarSettings, otherSetupSettings, leadFormSettings,
    visibilitySettings, shareSettings, setShareSettings, setHasUnsavedChanges,
    triggerSaveSuccess, currentBook, targetPage, setCurrentBook, user,
    setPages, setProjectBaseUrl, notifiedUnsavedRef
  ]);

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;
  const handleExportRef = useRef(handleExport);
  handleExportRef.current = handleExport;

  const stableSaveHandler = useCallback((...args) => handleSaveRef.current?.(...args), []);
  const stableExportHandler = useCallback((...args) => handleExportRef.current?.(...args), []);

  const handlePreview = useCallback(() => {
    window.dispatchEvent(new Event('close-profile-preview'));

    const candidateShareId =
      visibilitySettings?.shareId ||
      visibilitySettings?.Visibility?.shareId ||
      currentBook?.Customized_Settings?.Visibility?.shareId ||
      currentBook?.Visibility?.shareId ||
      (shareSettings?.shareId && shareSettings.shareId !== v_id ? shareSettings.shareId : null) ||
      (currentBook?.share?.shareId && currentBook.share.shareId !== v_id ? currentBook.share.shareId : null);

    const visibilityShareId = (candidateShareId && candidateShareId !== v_id) ? candidateShareId : null;

    const previewUrl = visibilityShareId
      ? `/preview?shareId=${visibilityShareId}${v_id ? `&v_id=${v_id}` : ''}`
      : (v_id ? `/preview?v_id=${v_id}` : '/preview');
    
    // 1. Open preview immediately in new tab for instant response
    window.open(previewUrl, '_blank');

    // 2. Cache editor state to IndexedDB under 'customized_editor'
    try {
      saveCustomizedEditorState({
        v_id: v_id,
        bookName: bookName,
        folderName: folder || 'Recent Book',
        pages: pages,
        activePageIndex: targetPage || 0,
        projectBaseUrl: projectBaseUrl,
        Background: backgroundSettings,
        BookAppearance: bookAppearanceSettings,
        Layouts: {
          layoutStyle: layoutSettings,
          layoutColors: layoutColors
        },
        MenuBar: menuBarSettings,
        Branding: {
          logoSettings,
          watermarkSettings,
          preloaderSettings
        },
        Visibility: visibilitySettings,
        shareSettings: shareSettings,
        otherSetup: otherSetupSettings,
        leadForm: leadFormSettings,
        bookmarks: bookmarks,
        notes: notes,
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn("Failed to cache customized preview state to IndexedDB:", e);
    }

    // 3. Trigger backend save asynchronously in the background without blocking the UI
    if (handleSaveRef.current) {
      handleSaveRef.current().catch(err => {
        console.error("Background save on preview failed:", err);
      });
    }
  }, [
    shareSettings, currentBook, v_id, pages, targetPage, bookName,
    projectBaseUrl, logoSettings, watermarkSettings, preloaderSettings,
    profileSettings, backgroundSettings, bookAppearanceSettings,
    layoutSettings, layoutColors, menuBarSettings, otherSetupSettings,
    leadFormSettings, visibilitySettings, folder, bookmarks, notes
  ]);

  const handlePreviewRef = useRef(handlePreview);
  handlePreviewRef.current = handlePreview;
  const stablePreviewHandler = useCallback(() => handlePreviewRef.current?.(), []);

  const handleClearAllPages = useCallback(() => {
    const defaultW = currentBookRef.current?.width || 210;
    const defaultH = currentBookRef.current?.height || 297;
    setPages(prevPages => 
      prevPages.map((p, i) => {
        const blankSvg = createDefaultPageData(p.name || `Page ${i + 1}`, defaultW, defaultH);
        return {
          ...p,
          content: blankSvg,
          html: blankSvg
        };
      })
    );
    if (setHasUnsavedChanges) setHasUnsavedChanges(true);
  }, [setHasUnsavedChanges, setPages]);

  // Export/Save Handlers for Context (Registration)
  useEffect(() => {
    if (setExportHandler) setExportHandler(() => stableExportHandler);
    if (setSaveHandler) setSaveHandler(() => stableSaveHandler);
    if (setPreviewHandler) setPreviewHandler(() => stablePreviewHandler);
    if (setClearHandler) setClearHandler(() => handleClearAllPages);

    window.addEventListener('trigger-clear-flipbook', handleClearAllPages);

    return () => {
      if (setExportHandler) setExportHandler(null);
      if (setSaveHandler) setSaveHandler(null);
      if (setPreviewHandler) setPreviewHandler(null);
      if (setClearHandler) setClearHandler(null);
      window.removeEventListener('trigger-clear-flipbook', handleClearAllPages);
    };
  }, [setExportHandler, setSaveHandler, setPreviewHandler, setClearHandler, stableSaveHandler, stableExportHandler, stablePreviewHandler, handleClearAllPages]);

  return {
    handleSave,
    handleSaveRef,
    handleExport,
    handlePreview,
    handleClearAllPages,
    stableSaveHandler,
    lastLoadedBookNameRef
  };
};
