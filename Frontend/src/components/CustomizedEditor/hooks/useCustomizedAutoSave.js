import { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { saveCustomizedEditorState } from '../../../utils/dbUtils';

export const useCustomizedAutoSave = ({
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
  triggerSaveSuccess,
}) => {
  // 1. Keep menuBarSettings.media strictly in sync with otherSetupSettings.sound
  useEffect(() => {
    if (otherSetupSettings?.sound) {
      setMenuBarSettings(prev => {
        const curMedia = prev?.media || {};
        const curAudioSet = curMedia.audioSettings || {};
        const newAudioSet = otherSetupSettings.sound;
        if (
          curAudioSet.bgSound === newAudioSet.bgSound &&
          curAudioSet.bgSoundFile === newAudioSet.bgSoundFile &&
          curAudioSet.flipSound === newAudioSet.flipSound &&
          curAudioSet.pageSpecificSound === newAudioSet.pageSpecificSound &&
          curAudioSet.bgSoundEnabled === newAudioSet.bgSoundEnabled &&
          curAudioSet.flipSoundEnabled === newAudioSet.flipSoundEnabled
        ) {
          return prev;
        }

        return {
          ...(prev || {}),
          media: {
            ...curMedia,
            audioSettings: {
              ...curAudioSet,
              ...newAudioSet
            }
          }
        };
      });
    }
  }, [otherSetupSettings?.sound, setMenuBarSettings]);

  // 2. Keep menuBarSettings.interaction.gallerySettings strictly in sync with otherSetupSettings.gallery
  useEffect(() => {
    if (otherSetupSettings?.gallery?.images) {
      setMenuBarSettings(prev => {
        const curInteraction = prev?.interaction || {};
        const curGallery = curInteraction.gallerySettings || {};
        const newImages = otherSetupSettings.gallery.images;

        if (JSON.stringify(curGallery.images) === JSON.stringify(newImages)) {
          return prev;
        }

        return {
          ...(prev || {}),
          interaction: {
            ...curInteraction,
            gallerySettings: {
              ...curGallery,
              images: newImages
            }
          }
        };
      });
    }
  }, [otherSetupSettings?.gallery?.images, setMenuBarSettings]);

  // Synchronous State Caches for Zero-Data-Loss Exit & Lifecycle Flush
  const latestPayloadRef = useRef(null);
  const latestIndexedDBStateRef = useRef(null);
  const isDirtyRef = useRef(false);
  const notifiedUnsavedRef = useRef(false);
  const abortControllerRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const idbTimerRef = useRef(null);

  // Helper to construct latest backend payload
  const buildPayload = useCallback(() => {
    const userEmail = user?.emailId || user?.email;
    const userId = user?.userId || user?._id || user?.id;

    const mergedGallery = {
      ...(menuBarSettings?.interaction?.gallerySettings || {}),
      ...(otherSetupSettings?.gallery || {})
    };

    const updatedShare = {
      ...(shareSettings || {}),
      access: visibilitySettings?.type || 'Public',
      password: visibilitySettings?.password || '',
      accessKey: visibilitySettings?.accessKey || '',
      isPasswordSaved: Boolean(visibilitySettings?.isPasswordSaved),
      inviteOnly: visibilitySettings?.inviteOnly || {}
    };

    return {
      userID: user?.userID,
      userId,
      emailId: userEmail,
      v_id: v_id,
      folderName: folder || 'Recent Book',
      bookName: bookNameRef?.current || bookName,
      newName: bookNameRef?.current || bookName,
      Background: backgroundSettings,
      BookAppearance: bookAppearanceSettings,
      Layouts: {
        layoutStyle: layoutSettings,
        layoutColors: layoutColors
      },
      Branding: {
        logoSettings,
        watermarkSettings,
        preloaderSettings
      },
      MenuBar: {
        ...menuBarSettings,
        interaction: {
          ...menuBarSettings?.interaction,
          gallerySettings: mergedGallery
        }
      },
      otherSetup: {
        ...otherSetupSettings,
        gallery: mergedGallery
      },
      leadForm: leadFormSettings,
      Visibility: updatedShare
    };
  }, [
    user, v_id, folder, bookName, bookNameRef, backgroundSettings,
    bookAppearanceSettings, layoutSettings, layoutColors, logoSettings,
    watermarkSettings, preloaderSettings, menuBarSettings, otherSetupSettings,
    leadFormSettings, visibilitySettings, shareSettings
  ]);

  // Helper to construct latest IndexedDB state
  const buildIndexedDBState = useCallback(() => {
    return {
      v_id,
      bookName: bookNameRef?.current || bookName,
      folderName: folder || 'Recent Book',
      pages: pages && pages.length > 0 ? pages : [],
      targetPage: targetPage || 0,
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
      bookmarks,
      notes,
      timestamp: Date.now()
    };
  }, [
    v_id, bookName, bookNameRef, folder, pages, targetPage,
    backgroundSettings, bookAppearanceSettings, layoutSettings,
    layoutColors, menuBarSettings, logoSettings, watermarkSettings,
    preloaderSettings, visibilitySettings, shareSettings,
    otherSetupSettings, leadFormSettings, bookmarks, notes
  ]);

  // Always keep refs synchronized on every render/update
  useEffect(() => {
    latestPayloadRef.current = buildPayload();
    latestIndexedDBStateRef.current = buildIndexedDBState();
  }, [buildPayload, buildIndexedDBState]);

  // Primary Flush Engine: synchronously handles IDB save and dispatches backend sync (keepalive on exit)
  const flushSettings = useCallback(async (isExit = false) => {
    if (!v_id || !isDataLoaded || initialLoadRef?.current) return;
    if (!isDirtyRef.current && !hasUnsavedChanges) return;

    const payload = latestPayloadRef.current || buildPayload();
    const idbState = latestIndexedDBStateRef.current || buildIndexedDBState();
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

    // 1. Synchronously persist to IndexedDB with zero delay
    try {
      saveCustomizedEditorState(idbState);
    } catch (e) {
      console.warn('[AutoSave] IndexedDB flush error:', e);
    }

    // 2. Clear any pending debounce timers
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    if (idbTimerRef.current) {
      clearTimeout(idbTimerRef.current);
      idbTimerRef.current = null;
    }

    // If auto-save is disabled, do NOT send network requests (only manual save writes to backend)
    if (!isAutoSaveEnabled) {
      return;
    }

    // 3. Immediate Exit Network Flush (Keepalive ensures the browser sends the POST even if window/tab terminates)
    if (isExit) {
      if (navigator.onLine && payload) {
        try {
          fetch(`${backendUrl}/api/flipbook/update-settings`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json'
            },
            keepalive: true,
            credentials: 'include'
          }).catch(() => {});
        } catch (err) {
          console.warn('[AutoSave] Keepalive exit flush error:', err);
        }
      }
      isDirtyRef.current = false;
      if (setHasUnsavedChanges) setHasUnsavedChanges(false);
      return;
    }

    // 4. In-App Normal Save (Back button, router transition, or debounce expiration)
    if (!navigator.onLine) {
      // Offline: Changes are safely retained in IndexedDB and will sync on reconnection
      return;
    }

    try {
      if (setIsSaving) setIsSaving(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const res = await axios.post(`${backendUrl}/api/flipbook/update-settings`, payload, {
        withCredentials: true,
        signal: abortControllerRef.current.signal
      });

      if (res.data?.share || res.data?.settings?.Visibility) {
        const vis = res.data.share || res.data.settings.Visibility;
        if (setShareSettings) {
          setShareSettings(prev => {
            if (JSON.stringify(prev) === JSON.stringify(vis)) return prev;
            return vis;
          });
        }
      }

      isDirtyRef.current = false;
      if (setHasUnsavedChanges) setHasUnsavedChanges(false);
      if (notifiedUnsavedRef) notifiedUnsavedRef.current = false;
      if (triggerSaveSuccess) {
        triggerSaveSuccess({ name: payload.bookName || 'Flipbook', folder: 'Customized' });
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.warn('[AutoSave] Unified settings auto-save warning:', err?.message || err);
      }
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  }, [
    v_id, isDataLoaded, initialLoadRef, hasUnsavedChanges, buildPayload,
    buildIndexedDBState, setIsSaving, setShareSettings, setHasUnsavedChanges, triggerSaveSuccess
  ]);

  // Track user edits & mark dirty
  useEffect(() => {
    if (initialLoadRef?.current || !isDataLoaded) return;

    isDirtyRef.current = true;
    if (setHasUnsavedChanges && !notifiedUnsavedRef.current) {
      setHasUnsavedChanges(true);
      notifiedUnsavedRef.current = true;
    }

    // Debounced cache to IndexedDB (300ms)
    if (idbTimerRef.current) clearTimeout(idbTimerRef.current);
    idbTimerRef.current = setTimeout(() => {
      if (latestIndexedDBStateRef.current) {
        saveCustomizedEditorState(latestIndexedDBStateRef.current);
      }
    }, 300);

    // Debounced Auto-Save to Backend (1000ms)
    if (isAutoSaveEnabled && !isLoading) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        flushSettings(false);
      }, 1000);
    }

    return () => {
      if (idbTimerRef.current) clearTimeout(idbTimerRef.current);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [
    bookName, logoSettings, profileSettings, backgroundSettings,
    bookAppearanceSettings, layoutSettings, layoutColors, menuBarSettings,
    otherSetupSettings, leadFormSettings, visibilitySettings, shareSettings,
    bookmarks, notes, isAutoSaveEnabled, isLoading, isDataLoaded,
    initialLoadRef, setHasUnsavedChanges, flushSettings
  ]);

  const flushSettingsRef = useRef(flushSettings);
  useEffect(() => {
    flushSettingsRef.current = flushSettings;
  }, [flushSettings]);

  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Zero-Data-Loss Lifecycle Handlers: Backbutton, Refresh, Tab Close, Backgrounding, Offline Reconnect
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushSettingsRef.current?.(true);
    };

    const handlePageHide = () => {
      flushSettingsRef.current?.(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushSettingsRef.current?.(true);
      }
    };

    const handlePopState = () => {
      flushSettingsRef.current?.(false);
    };

    const handleOnline = () => {
      if (isDirtyRef.current || hasUnsavedChangesRef.current) {
        flushSettingsRef.current?.(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('online', handleOnline);

    return () => {
      // Component unmount only (route change, in-app navigation, etc.)
      flushSettingsRef.current?.(true);

      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return { notifiedUnsavedRef, flushSettings };
};
