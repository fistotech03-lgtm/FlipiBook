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
  // Keep menuBarSettings.media strictly in sync with otherSetupSettings.sound
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

  // Keep menuBarSettings.interaction.gallerySettings strictly in sync with otherSetupSettings.gallery
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

  // Save Appearance Logic with Debounce
  useEffect(() => {
    if (!v_id || !isDataLoaded) return;

    const timer = setTimeout(() => {
      const userEmail = user?.emailId || user?.email;
      const userId = user?.userId || user?._id || user?.id;
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      
      axios.post(`${backendUrl}/api/flipbook/background`, {
        action: 'save',
        userId,
        customUserId: user?.userID,
        emailId: userEmail,
        v_id: v_id,
        folderName: folder || 'Recent Book',
        bookName: bookName,
        backgroundSettings
      }, { withCredentials: true }).catch(err => console.warn("Background API auto-save warning:", err));

      axios.post(`${backendUrl}/api/flipbook/update-settings`, {
        userID: user?.userID,
        emailId: userEmail,
        v_id: v_id,
        folderName: folder || 'Recent Book',
        bookName: bookName,
        Background: backgroundSettings,
        BookAppearance: bookAppearanceSettings,
        Layouts: {
          layoutStyle: layoutSettings,
          layoutColors: layoutColors
        }
      }, { withCredentials: true }).catch(err => console.warn("Appearance/Background auto-save warning:", err));
    }, 500);

    return () => clearTimeout(timer);
  }, [backgroundSettings, bookAppearanceSettings, layoutSettings, layoutColors, v_id, isDataLoaded, folder, bookName, user]);

  // Save Setup Logic with Debounce
  useEffect(() => {
    if (!v_id || !isDataLoaded) return;

    const timer = setTimeout(() => {
      const userEmail = user?.emailId || user?.email;
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const updatedShare = {
        ...(shareSettings || {}),
        access: visibilitySettings?.type || 'Public',
        password: visibilitySettings?.password || '',
        accessKey: visibilitySettings?.accessKey || '',
        isPasswordSaved: Boolean(visibilitySettings?.isPasswordSaved),
        inviteOnly: visibilitySettings?.inviteOnly || {}
      };
      axios.post(`${backendUrl}/api/flipbook/update-settings`, {
        userID: user?.userID,
        emailId: userEmail,
        v_id: v_id,
        folderName: folder || 'Recent Book',
        bookName: v_id,
        newName: bookNameRef?.current || currentBook?.flipbookName,
        MenuBar: menuBarSettings,
        otherSetup: otherSetupSettings,
        leadForm: leadFormSettings,
        Visibility: updatedShare
      }, { withCredentials: true }).then((res) => {
        if (res.data?.share || res.data?.settings?.Visibility) {
          const vis = res.data.share || res.data.settings.Visibility;
          setShareSettings(prev => {
            if (JSON.stringify(prev) === JSON.stringify(vis)) return prev;
            return vis;
          });
        }
      }).catch(err => console.error("Visibility auto-save failed:", err));
    }, 500);

    return () => clearTimeout(timer);
  }, [menuBarSettings, otherSetupSettings, leadFormSettings, isDataLoaded, v_id, folder, shareSettings, visibilitySettings, currentBook, bookNameRef, setShareSettings, user]);

  // Save Branding Logic with Debounce
  useEffect(() => {
    if (!v_id || !isDataLoaded) return;

    const timer = setTimeout(() => {
      const userEmail = user?.emailId || user?.email;
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

      axios.post(`${backendUrl}/api/flipbook/update-settings`, {
        userID: user?.userID,
        emailId: userEmail,
        v_id: v_id,
        folderName: folder || 'Recent Book',
        bookName: bookNameRef?.current || bookName,
        newName: bookNameRef?.current || bookName,
        Branding: {
          logoSettings,
          watermarkSettings,
          preloaderSettings
        }
      }, { withCredentials: true }).catch(err => console.warn("Branding auto-save warning:", err));
    }, 500);

    return () => clearTimeout(timer);
  }, [logoSettings, watermarkSettings, preloaderSettings, v_id, isDataLoaded, folder, bookName, bookNameRef, user]);

  // Auto-save & Real-time preview sync for otherSetupSettings
  useEffect(() => {
    if (!isDataLoaded || !otherSetupSettings) return;

    // Real-time sync gallery to menuBarSettings for live preview
    if (otherSetupSettings.gallery) {
      setMenuBarSettings(prev => {
        const curGallery = prev?.interaction?.gallerySettings || {};
        const newGallery = otherSetupSettings.gallery;
        if (
          curGallery.primaryColor === newGallery.primaryColor &&
          curGallery.secondaryColor === newGallery.secondaryColor &&
          curGallery.bgColor === newGallery.bgColor &&
          curGallery.transitionEffect === newGallery.transitionEffect &&
          curGallery.speed === newGallery.speed &&
          curGallery.autoPlay === newGallery.autoPlay &&
          curGallery.autoSlide === newGallery.autoSlide &&
          curGallery.infiniteLoop === newGallery.infiniteLoop &&
          curGallery.showDots === newGallery.showDots &&
          curGallery.navStyle === newGallery.navStyle &&
          curGallery.images === newGallery.images
        ) {
          return prev;
        }
        return {
          ...prev,
          interaction: {
            ...prev?.interaction,
            gallerySettings: {
              ...curGallery,
              ...newGallery
            }
          }
        };
      });
    }

    // Debounced Auto-save to MongoDB
    const timer = setTimeout(() => {
      if (!v_id) return;
      const userEmail = user?.emailId || user?.email;
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

      const mergedGallery = {
        ...(menuBarSettings?.interaction?.gallerySettings || {}),
        ...(otherSetupSettings?.gallery || {})
      };

      axios.post(`${backendUrl}/api/flipbook/update-settings`, {
        userID: user?.userID,
        emailId: userEmail,
        v_id: v_id,
        folderName: folder || 'Recent Book',
        bookName: bookNameRef?.current || bookName,
        otherSetup: {
          ...otherSetupSettings,
          gallery: mergedGallery
        },
        MenuBar: {
          ...menuBarSettings,
          interaction: {
            ...menuBarSettings?.interaction,
            gallerySettings: mergedGallery
          }
        }
      }, { withCredentials: true }).catch(err => console.warn("otherSetup auto-save warning:", err));
    }, 500);

    return () => clearTimeout(timer);
  }, [otherSetupSettings, isDataLoaded, v_id, folder, bookName, bookNameRef, menuBarSettings, setMenuBarSettings, user]);

  // Auto-save Layouts (layoutStyle & layoutColors) to MongoDB
  useEffect(() => {
    if (!isDataLoaded || !v_id || !layoutColors) return;

    const timer = setTimeout(() => {
      const userEmail = user?.emailId || user?.email;
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

      axios.post(`${backendUrl}/api/flipbook/update-settings`, {
        userID: user?.userID,
        emailId: userEmail,
        v_id: v_id,
        folderName: folder || 'Recent Book',
        bookName: bookNameRef?.current || bookName,
        Layouts: {
          layoutStyle: layoutSettings,
          layoutColors: layoutColors
        }
      }, { withCredentials: true }).catch(err => console.warn("Layouts auto-save warning:", err));
    }, 500);

    return () => clearTimeout(timer);
  }, [layoutSettings, layoutColors, isDataLoaded, v_id, folder, bookName, bookNameRef, user]);

  // Cache customized editor state to IndexedDB under 'customized_editor'
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
    }, 300);

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

  // Track changes for unsaved status
  useEffect(() => {
    if (initialLoadRef?.current) return;

    if (setHasUnsavedChanges && !notifiedUnsavedRef.current) {
      setHasUnsavedChanges(true);
      notifiedUnsavedRef.current = true;
    }
  }, [
    bookName, logoSettings, profileSettings, backgroundSettings,
    bookAppearanceSettings, layoutSettings, menuBarSettings,
    otherSetupSettings, leadFormSettings, visibilitySettings,
    setHasUnsavedChanges, initialLoadRef
  ]);

  const autoSaveTimerRef = useRef(null);

  // Auto-Save Mechanism for Customized Editor (Only runs when user makes changes)
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
