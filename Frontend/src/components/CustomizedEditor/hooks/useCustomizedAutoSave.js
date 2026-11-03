import { useEffect, useRef } from 'react';
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

  // 3. Consolidated, Single-Pipeline Server Auto-Save with AbortController
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!v_id || !isDataLoaded || initialLoadRef?.current) return;

    const timer = setTimeout(async () => {
      // Abort previous in-flight save request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const userEmail = user?.emailId || user?.email;
      const userId = user?.userId || user?._id || user?.id;
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

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

      const payload = {
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

      try {
        const res = await axios.post(`${backendUrl}/api/flipbook/update-settings`, payload, {
          withCredentials: true,
          signal: abortControllerRef.current.signal
        });

        if (res.data?.share || res.data?.settings?.Visibility) {
          const vis = res.data.share || res.data.settings.Visibility;
          setShareSettings(prev => {
            if (JSON.stringify(prev) === JSON.stringify(vis)) return prev;
            return vis;
          });
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.warn('[AutoSave] Unified settings auto-save warning:', err?.message || err);
        }
      }
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, [
    v_id,
    folder,
    bookName,
    bookNameRef,
    isDataLoaded,
    backgroundSettings,
    bookAppearanceSettings,
    layoutSettings,
    layoutColors,
    logoSettings,
    watermarkSettings,
    preloaderSettings,
    menuBarSettings,
    otherSetupSettings,
    leadFormSettings,
    visibilitySettings,
    shareSettings,
    setShareSettings,
    user,
    initialLoadRef
  ]);

  // 4. Cache customized editor state to IndexedDB with book-specific key
  useEffect(() => {
    if (!isDataLoaded || !v_id) return;

    const timer = setTimeout(() => {
      saveCustomizedEditorState({
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
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [
    v_id,
    bookName,
    bookNameRef,
    folder,
    pages,
    targetPage,
    backgroundSettings,
    bookAppearanceSettings,
    layoutSettings,
    layoutColors,
    menuBarSettings,
    logoSettings,
    watermarkSettings,
    preloaderSettings,
    visibilitySettings,
    shareSettings,
    otherSetupSettings,
    leadFormSettings,
    bookmarks,
    notes,
    isDataLoaded
  ]);

  const notifiedUnsavedRef = useRef(false);

  // 5. Track changes for unsaved status indicator
  useEffect(() => {
    if (initialLoadRef?.current) return;

    if (setHasUnsavedChanges && !notifiedUnsavedRef.current) {
      setHasUnsavedChanges(true);
      notifiedUnsavedRef.current = true;
    }
  }, [
    bookName, logoSettings, profileSettings, backgroundSettings,
    bookAppearanceSettings, layoutSettings, layoutColors, menuBarSettings,
    otherSetupSettings, leadFormSettings, visibilitySettings,
    setHasUnsavedChanges, initialLoadRef
  ]);

  const autoSaveTimerRef = useRef(null);

  // 6. Periodic Full Flipbook Save (triggers handleSaveRef for pages/structures)
  useEffect(() => {
    if (isAutoSaveEnabled && hasUnsavedChanges && !initialLoadRef?.current && !isLoading) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        if (handleSaveRef?.current) {
          handleSaveRef.current();
        }
      }, 2500);
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [
    isAutoSaveEnabled, hasUnsavedChanges, isLoading, initialLoadRef, handleSaveRef,
    bookName, logoSettings, profileSettings, backgroundSettings,
    bookAppearanceSettings, layoutSettings, menuBarSettings,
    otherSetupSettings, leadFormSettings, visibilitySettings
  ]);

  return { notifiedUnsavedRef };
};
