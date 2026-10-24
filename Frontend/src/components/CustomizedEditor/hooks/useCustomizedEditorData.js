import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  getCustomizedEditorState,
  getPageEditorState,
  cleanupLegacyEditorKeys
} from '../../../utils/dbUtils';
import { getSupabaseBaseUrl, rewriteHtmlUploads } from '../../../utils/assetUtils';
import { createDefaultPageData } from '../utils/defaultPageData';

export const useCustomizedEditorData = ({
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
  setHasUnsavedChanges,
  notifiedUnsavedRef
}) => {
  const hasInMemoryPages = Boolean(
    location?.state?.pages && 
    Array.isArray(location.state.pages) && 
    location.state.pages.length > 0
  );

  const [isLoading, setIsLoading] = useState(() => !hasInMemoryPages);
  const [isDataLoadingComplete, setIsDataLoadingComplete] = useState(() => hasInMemoryPages);
  const [loadingProgress, setLoadingProgress] = useState(() => hasInMemoryPages ? 100 : 0);

  useEffect(() => {
    let interval;
    if (isLoading && !hasInMemoryPages) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const increment = prev < 40 ? 10 : prev < 75 ? 6 : 3;
          return Math.min(prev + increment, 100);
        });
      }, 25);
    } else if (hasInMemoryPages) {
      setLoadingProgress(100);
      setIsLoading(false);
    }
    return () => clearInterval(interval);
  }, [isLoading, hasInMemoryPages]);

  useEffect(() => {
    if (isDataLoadingComplete && (loadingProgress === 100 || hasInMemoryPages) && isLoading) {
      setIsLoading(false);
    }
  }, [isDataLoadingComplete, loadingProgress, isLoading, hasInMemoryPages]);

  const initialLoadRef = useRef(true);

  // Initial load management
  useEffect(() => {
    if (!isLoading && initialLoadRef.current) {
      const timer = setTimeout(() => {
        initialLoadRef.current = false;
        if (setHasUnsavedChanges) setHasUnsavedChanges(false);
        if (notifiedUnsavedRef) notifiedUnsavedRef.current = false;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, setHasUnsavedChanges, notifiedUnsavedRef]);

  // Load Flipbook Data
  useEffect(() => {
    const fetchBook = async () => {
      const userEmail = user?.emailId || user?.email;

      // 1. Instant Quick-Load Cache from IndexedDB
      try {
        const cached = await getCustomizedEditorState(v_id);
        if (cached && (!v_id || cached.v_id === v_id)) {
          if (cached.Background) setBackgroundSettings(cached.Background);
          if (cached.BookAppearance) setBookAppearanceSettings(cached.BookAppearance);
          if (cached.Layouts) {
            if (cached.Layouts.layoutStyle !== undefined) setLayoutSettings(cached.Layouts.layoutStyle);
            if (cached.Layouts.layoutColors) setLayoutColors(cached.Layouts.layoutColors);
          }
          if (cached.MenuBar) setMenuBarSettings(cached.MenuBar);
          if (cached.Branding) {
            if (cached.Branding.logoSettings) setLogoSettings(cached.Branding.logoSettings);
            if (cached.Branding.watermarkSettings) setWatermarkSettings(cached.Branding.watermarkSettings);
            if (cached.Branding.preloaderSettings) setPreloaderSettings(cached.Branding.preloaderSettings);
          }
          if (cached.Visibility) setVisibilitySettings(cached.Visibility);
          if (cached.shareSettings) setShareSettings(cached.shareSettings);
          if (cached.otherSetup) setOtherSetupSettings(cached.otherSetup);
          if (cached.leadForm) setLeadFormSettings(cached.leadForm);
          if (cached.bookmarks) setBookmarks(cached.bookmarks);
          if (cached.notes) setNotes(cached.notes);
          if (cached.bookName && (!currentBook?.flipbookName || currentBook?.flipbookName === 'Name of the Book')) {
            setBookName(cached.bookName);
          }
          if (cached.pages && Array.isArray(cached.pages) && cached.pages.length > 0) {
            setPages(cached.pages);
            setIsLoading(false);
            setIsDataLoadingComplete(true);
            setLoadingProgress(100);
          }
          setIsDataLoaded(true);
        }
      } catch (cacheErr) {
        console.warn('[CustomizedEditor] Quick-load cache read warning:', cacheErr);
      }

      // 2. Check if page_editor has newer pages for this flipbook
      try {
        const pageEditorData = await getPageEditorState(v_id);
        if (pageEditorData && (!v_id || pageEditorData.v_id === v_id) && Array.isArray(pageEditorData.pages) && pageEditorData.pages.length > 0) {
          const isCorrupted = pageEditorData.pages.some(p => 
            typeof p.html === 'object' || 
            typeof p.content === 'object' || 
            !p.html || p.html.trim() === ''
          );

          if (!isCorrupted) {
            const data = pageEditorData;
            const sanitizedEmail = (userEmail || 'user').replace(/[@.]/g, "_");
            const userFolder = user?.userID || sanitizedEmail;
            const actualFolder = (folder && folder !== 'Recent Book') ? folder : 'My_Flipbooks';
            const autoBaseUrl = getSupabaseBaseUrl(userFolder, actualFolder, data.pageName || bookName);

            setPages(data.pages.map((p, i) => {
              let rawHTML = p.html || p.content || '';
              if (autoBaseUrl) {
                if (rawHTML.includes('../assets/')) {
                  rawHTML = rawHTML.split('../assets/').join(`${autoBaseUrl}assets/`);
                }
                if (rawHTML.includes('./assets/')) {
                  rawHTML = rawHTML.split('./assets/').join(`${autoBaseUrl}assets/`);
                }
                if (rawHTML.includes('nullassets/')) {
                  rawHTML = rawHTML.split('nullassets/').join(`${autoBaseUrl}assets/`);
                }
                rawHTML = rawHTML.replace(/(src|href|xlink:href)=(['"])(?:\.\.\/|\.\/)?assets\//gi, `$1=$2${autoBaseUrl}assets/`);
              }
              rawHTML = rewriteHtmlUploads(rawHTML);

              return {
                id: p.id || i,
                name: p.name || `Page ${i + 1}`,
                html: rawHTML,
                content: rawHTML,
                isHidden: p.isHidden || p.hide === 1
              };
            }));
            if (data.pageName && (!currentBook?.flipbookName || currentBook?.flipbookName === 'Name of the Book')) {
              setBookName(data.pageName);
            }
            if (!page) setTargetPage(0);
            setIsLoading(false);
            setIsDataLoadingComplete(true);
            setLoadingProgress(100);
          }
        }
      } catch (e) {
        console.error('[CustomizedEditor] Failed to load from page_editor state:', e);
      }

      cleanupLegacyEditorKeys();

      if (v_id) {
        try {
          const userEmail = user?.emailId || user?.email;
          const userId = user?.userId || user?._id || user?.id;
          const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

          const res = await axios.get(`${backendUrl}/api/flipbook/get`, {
            params: {
              ...(userId ? { userId } : {}),
              ...(user?.userID ? { customUserId: user.userID } : {}),
              ...(userEmail ? { emailId: userEmail } : {}),
              v_id,
              folderName: folder,
              bookName: decodeURIComponent(v_id)
            },
            withCredentials: true
          });

          if (res.data) {
            let pBaseUrl = null;
            if (res.data.meta) {
              const sanitizedEmail = (userEmail || 'user').replace(/[@.]/g, "_");
              const userFolder = res.data.meta?.userID || user?.userID || sanitizedEmail;
              const actualFolder = (res.data.meta?.folderName && Array.isArray(res.data.meta.folderName))
                ? (res.data.meta.folderName[0] || 'My_Flipbooks')
                : (res.data.meta?.folderName || folder || 'My_Flipbooks');
              pBaseUrl = getSupabaseBaseUrl(userFolder, actualFolder, res.data.meta.flipbookName);
              setProjectBaseUrl(pBaseUrl);
            }

            const fetchedName = res.data.meta?.flipbookName || res.data.name || location.state?.flipbookName || decodeURIComponent(v_id);
            if (fetchedName && fetchedName !== 'Name of the Book') {
              setBookName(fetchedName);
              if (lastLoadedBookNameRef) lastLoadedBookNameRef.current = fetchedName;
            }

            if (res.data.pages) {
              const mappedPages = await Promise.all(res.data.pages.map(async (p, i) => {
                let rawHTML = p.html || p.content || '';

                if (!rawHTML || typeof rawHTML !== 'string' || rawHTML.trim() === '') {
                  const metaW = res.data.meta?.width || res.data.settings?.width || location.state?.width || currentBook?.width || 210;
                  const metaH = res.data.meta?.height || res.data.settings?.height || location.state?.height || currentBook?.height || 297;
                  const defaultData = createDefaultPageData(p.name || `Page ${i + 1}`, metaW, metaH);
                  rawHTML = defaultData;
                }

                if (pBaseUrl) {
                  if (rawHTML.includes('../assets/')) {
                    rawHTML = rawHTML.split('../assets/').join(`${pBaseUrl}assets/`);
                  }
                  if (rawHTML.includes('./assets/')) {
                    rawHTML = rawHTML.split('./assets/').join(`${pBaseUrl}assets/`);
                  }
                  if (rawHTML.includes('nullassets/')) {
                    rawHTML = rawHTML.split('nullassets/').join(`${pBaseUrl}assets/`);
                  }
                  rawHTML = rawHTML.replace(/(src|href|xlink:href)=(['"])(?:\.\.\/|\.\/)?assets\//gi, `$1=$2${pBaseUrl}assets/`);
                }

                rawHTML = rewriteHtmlUploads(rawHTML);

                return {
                  id: p.id || i,
                  content: rawHTML,
                  name: p.name || `Page ${i + 1}`,
                  html: rawHTML,
                  isHidden: p.hide === 1 || p.isHidden
                };
              }));
              setPages(prevPages => {
                if (prevPages && prevPages.length > mappedPages.length) {
                  return prevPages;
                }
                return mappedPages;
              });
            }

            const cs = res.data.Customized_Settings || res.data.settings || {};
            const cb = cs.Branding || cs.branding || res.data.Branding || res.data.branding || {};

            const lVal = cb.logoSettings || cb.logo || cs.logoSettings || cs.logo || res.data.logoSettings || res.data.logo;
            if (lVal && typeof lVal === 'object') setLogoSettings(lVal);

            const wVal = cb.watermarkSettings || cb.watermark || cs.watermarkSettings || cs.watermark || res.data.watermarkSettings || res.data.watermark;
            if (wVal && typeof wVal === 'object') setWatermarkSettings(wVal);

            const pVal = cb.preloaderSettings || cb.preloader || cs.preloaderSettings || cs.preloader || res.data.preloaderSettings || res.data.preloader;
            if (pVal && typeof pVal === 'object') setPreloaderSettings(pVal);

            const prVal = cb.profileSettings || cb.profile || cs.profileSettings || cs.profile || res.data.profileSettings || res.data.profile;
            if (prVal && typeof prVal === 'object') setProfileSettings(prVal);

            const customizedBackground = res.data.Customized_Settings?.Background || res.data.settings?.Background;
            if (customizedBackground) setBackgroundSettings(customizedBackground);

            const loadedLayouts = res.data.Customized_Settings?.Layouts || res.data.settings?.Layouts || res.data.settings?.layouts;
            if (loadedLayouts) {
              const styleVal = loadedLayouts.layoutStyle !== undefined ? loadedLayouts.layoutStyle : loadedLayouts.style;
              if (styleVal !== undefined) setLayoutSettings(styleVal);
              if (loadedLayouts.layoutColors) setLayoutColors(loadedLayouts.layoutColors);
            }

            const customizedAppearance = res.data.Customized_Settings?.BookAppearance || res.data.Customized_Settings?.bookAppearance || res.data.Customized_Settings?.appearance || res.data.settings?.appearance || res.data.settings?.bookAppearanceSettings;
            if (customizedAppearance) {
              let validSpeed = customizedAppearance.flipSpeed;
              if (validSpeed === 'medium') {
                validSpeed = 'Fast';
              } else if (validSpeed === 'Slow' && !customizedAppearance.speedChanged) {
                validSpeed = 'Fast';
              }
              customizedAppearance.flipSpeed = validSpeed;
              setBookAppearanceSettings(customizedAppearance);
            }

            if (res.data.settings) {
              if (res.data.settings.background && !customizedBackground) setBackgroundSettings(res.data.settings.background);
              if (res.data.settings.appearance) {
                const appSettings = res.data.settings.appearance;
                let vSpeed = appSettings.flipSpeed;
                if (vSpeed === 'medium') vSpeed = 'Fast';
                else if (vSpeed === 'Slow' && !appSettings.speedChanged) vSpeed = 'Fast';
                appSettings.flipSpeed = vSpeed;
                setBookAppearanceSettings(appSettings);
              }
              if (res.data.settings.layout && (!loadedLayouts || (loadedLayouts.layoutStyle === undefined && loadedLayouts.style === undefined))) {
                setLayoutSettings(res.data.settings.layout);
              }
            }

            const loadedMenuBar = res.data.Customized_Settings?.MenuBar || res.data.settings?.MenuBar || res.data.settings?.menubar;
            const loadedOtherSetup = res.data.Customized_Settings?.otherSetup || res.data.settings?.otherSetup || res.data.settings?.othersetup;

            if (loadedMenuBar || loadedOtherSetup) {
              const mediaObj = loadedMenuBar?.media || {};
              const audioVal = mediaObj.audio !== undefined
                ? Boolean(mediaObj.audio)
                : (mediaObj.backgroundAudio !== undefined ? Boolean(mediaObj.backgroundAudio) : true);

              const rawCustomBgSounds = (Array.isArray(loadedOtherSetup?.sound?.customBgSounds) && loadedOtherSetup.sound.customBgSounds.length > 0)
                ? loadedOtherSetup.sound.customBgSounds
                : (Array.isArray(mediaObj.audioSettings?.customBgSounds) ? mediaObj.audioSettings.customBgSounds : []);

              const audioCustomBgSounds = rawCustomBgSounds.map((item, idx) => ({
                ...item,
                label: item.label || item.id || item.name || `BG Sound ${idx + 5}`
              }));

              const audioSet = {
                ...(mediaObj.audioSettings || {}),
                ...(loadedOtherSetup?.sound || {}),
                customBgSounds: audioCustomBgSounds
              };

              const navAddTextToIcons = loadedMenuBar?.navigation?.addTextToIconsSettings || loadedMenuBar?.addTextToIconsSettings || { font: 'Arial' };
              const navToc = loadedMenuBar?.navigation?.tocSettings || loadedMenuBar?.tocSettings || { addSearch: true, addPageNumber: true, addSerialNumberHeading: true, addSerialNumberSubheading: true, content: [] };
              const navBookmark = loadedMenuBar?.navigation?.bookmarkSettings || loadedMenuBar?.bookmarkSettings || { icon: 'default', font: 'Poppins', color: '#C45A5A', shape: 1, style: 1, items: [] };

              const loadedGalleryImgs = (Array.isArray(loadedOtherSetup?.gallery?.images) && loadedOtherSetup.gallery.images.length > 0)
                ? loadedOtherSetup.gallery.images
                : (Array.isArray(loadedMenuBar?.interaction?.gallerySettings?.images) ? loadedMenuBar.interaction.gallerySettings.images : []);

              if (loadedMenuBar) {
                setMenuBarSettings({
                  ...loadedMenuBar,
                  interaction: {
                    ...(loadedMenuBar.interaction || {}),
                    gallerySettings: {
                      imageFitType: 'Fill All',
                      transitionEffect: 'Linear',
                      primaryColor: '#4F46E5',
                      secondaryColor: '#9CA3AF',
                      bgColor: '#FFFFFF',
                      navigationIconType: 'Chevron',
                      autoPlay: true,
                      speed: 2,
                      infiniteLoop: true,
                      showDots: true,
                      ...(loadedMenuBar.interaction?.gallerySettings || {}),
                      images: loadedGalleryImgs
                    }
                  },
                  media: {
                    autoFlip: true,
                    ...(mediaObj || {}),
                    audio: audioVal,
                    backgroundAudio: audioVal,
                    audioSettings: {
                      bgSound: audioSet.bgSound || 'BG Sound 1',
                      bgSoundFile: audioSet.bgSoundFile || '',
                      customBgSounds: audioCustomBgSounds,
                      flipSound: audioSet.flipSound || 'Soft Paper Flip',
                      pageSpecificSound: Boolean(audioSet.pageSpecificSound)
                    }
                  },
                  addTextToIconsSettings: navAddTextToIcons,
                  tocSettings: navToc,
                  navigation: {
                    ...(loadedMenuBar.navigation || {}),
                    addTextToIconsSettings: navAddTextToIcons,
                    tocSettings: navToc,
                    bookmarkSettings: navBookmark
                  }
                });
              }

              const loadedGallerySettings = {
                ...(loadedMenuBar?.interaction?.gallerySettings || {}),
                ...(loadedOtherSetup?.gallery || {})
              };

              setOtherSetupSettings(prev => ({
                ...(prev || {}),
                ...(loadedOtherSetup || {}),
                gallery: {
                  ...(prev?.gallery || {}),
                  ...loadedGallerySettings,
                  transitionEffect: loadedGallerySettings.transitionEffect || prev?.gallery?.transitionEffect || 'Linear',
                  primaryColor: loadedGallerySettings.primaryColor || prev?.gallery?.primaryColor || '#555555',
                  secondaryColor: loadedGallerySettings.secondaryColor || prev?.gallery?.secondaryColor || '#9B9B9B',
                  bgColor: loadedGallerySettings.bgColor || prev?.gallery?.bgColor || '#FFFFFF',
                  navStyle: loadedGallerySettings.navStyle || loadedGallerySettings.navigationIconType || prev?.gallery?.navStyle || 1,
                  autoSlide: loadedGallerySettings.autoSlide ?? loadedGallerySettings.autoPlay ?? prev?.gallery?.autoSlide ?? true,
                  autoPlay: loadedGallerySettings.autoPlay ?? loadedGallerySettings.autoSlide ?? prev?.gallery?.autoPlay ?? true,
                  speed: loadedGallerySettings.speed ?? prev?.gallery?.speed ?? 2,
                  infiniteLoop: loadedGallerySettings.infiniteLoop ?? prev?.gallery?.infiniteLoop ?? true,
                  showDots: loadedGallerySettings.showDots ?? prev?.gallery?.showDots ?? true,
                  images: loadedGalleryImgs
                },
                sound: {
                  ...(prev?.sound || {}),
                  ...(loadedOtherSetup?.sound || {}),
                  bgSound: audioSet.bgSound || loadedOtherSetup?.sound?.bgSound || prev?.sound?.bgSound || 'BG Sound 1',
                  bgSoundFile: audioSet.bgSoundFile || loadedOtherSetup?.sound?.bgSoundFile || prev?.sound?.bgSoundFile || '',
                  customBgSounds: audioCustomBgSounds,
                  flipSound: audioSet.flipSound || loadedOtherSetup?.sound?.flipSound || prev?.sound?.flipSound || 'Soft Paper Flip',
                  pageSpecificSound: audioSet.pageSpecificSound !== undefined ? Boolean(audioSet.pageSpecificSound) : Boolean(loadedOtherSetup?.sound?.pageSpecificSound ?? prev?.sound?.pageSpecificSound),
                  bgSoundEnabled: audioVal
                }
              }));
            }

            const loadedLeadForm = res.data.Customized_Settings?.leadForm || res.data.settings?.leadForm || res.data.settings?.leadform;
            if (loadedLeadForm) {
              let lf = { ...loadedLeadForm };
              if (lf.fields && !Array.isArray(lf.fields)) {
                const newFields = [];
                if (lf.fields.name) newFields.push({ id: '1', type: 'name', placeholder: 'Enter your Name' });
                if (lf.fields.email) newFields.push({ id: '2', type: 'email', placeholder: 'Enter your Gmail' });
                if (lf.fields.phone) newFields.push({ id: '3', type: 'phone', placeholder: 'Enter your Phone Number' });
                if (lf.fields.feedback) newFields.push({ id: '4', type: 'feedback', placeholder: 'Enter your Feedback' });
                lf.fields = newFields;
              }
              setLeadFormSettings(lf);
            }

            const loadedVisibility =
              res.data.Customized_Settings?.Visibility ||
              res.data.settings?.Visibility ||
              res.data.settings?.visibility ||
              res.data.share;
            if (loadedVisibility) setVisibilitySettings(loadedVisibility);
            if (res.data.settings?.bookmarks) setBookmarks(res.data.settings.bookmarks);
            if (res.data.settings?.notes) setNotes(res.data.settings.notes);

            let shareData = res.data.share;
            let candidateShare =
              loadedVisibility?.shareId ||
              (shareData?.shareId && shareData.shareId !== v_id ? shareData.shareId : null) ||
              res.data.settings?.Visibility?.shareId ||
              res.data.meta?.Customized_Settings?.Visibility?.shareId;

            if (!candidateShare || candidateShare === v_id) {
              candidateShare = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
              shareData = { ...(shareData || {}), shareId: candidateShare, access: shareData?.access || 'public' };
              axios.post(`${backendUrl}/api/flipbook/update-settings`, {
                userID: user?.userID,
                emailId: userEmail,
                v_id: v_id,
                Visibility: { ...(loadedVisibility || {}), shareId: candidateShare }
              }, { withCredentials: true }).then(updateRes => {
                const serverShareId =
                  updateRes.data?.settings?.Visibility?.shareId ||
                  updateRes.data?.Customized_Settings?.Visibility?.shareId ||
                  updateRes.data?.share?.shareId;
                if (serverShareId && serverShareId !== candidateShare) {
                  setShareSettings(prev => ({ ...(prev || {}), shareId: serverShareId }));
                  setVisibilitySettings(prev => ({ ...(prev || {}), shareId: serverShareId }));
                }
              }).catch(err => console.error('Frontend shareId auto-heal save failed:', err));
            } else if (!shareData) {
              shareData = { shareId: candidateShare, access: 'public' };
            }
            setShareSettings(shareData);

            const effectiveShareId = candidateShare;
            setVisibilitySettings(prev => ({
              ...prev,
              ...(loadedVisibility || {}),
              shareId: effectiveShareId || prev.shareId,
              type: shareData?.access || loadedVisibility?.access || prev.type || 'Public',
              password: shareData?.password || prev.password || '',
              accessKey: shareData?.accessKey || prev.accessKey || '',
              isPasswordSaved: shareData?.isPasswordSaved !== undefined ? shareData.isPasswordSaved : prev.isPasswordSaved,
              inviteOnly: shareData?.inviteOnly || prev.inviteOnly || {}
            }));

            if (setCurrentBook) {
              setCurrentBook(prev => ({
                ...(prev || {}),
                isPublished: res.data.isPublished !== undefined ? Boolean(res.data.isPublished) : Boolean(res.data.meta?.isPublished),
                flipbookName: res.data.meta?.flipbookName || res.data.name || prev?.flipbookName,
                quotes: res.data.quotes || res.data.meta?.quotes || prev?.quotes || '',
                about: res.data.about || res.data.meta?.about || prev?.about || '',
                category: res.data.category || res.data.meta?.category || prev?.category || 'Product Based',
                language: res.data.language || res.data.meta?.language || prev?.language || 'English',
                tags: res.data.tags || res.data.meta?.tags || prev?.tags || [],
                meta: {
                  ...(prev?.meta || {}),
                  ...(res.data.meta || {})
                }
              }));
            }
          }
        } catch (err) {
          console.error("CustomizedEditor: Failed to fetch flipbook", err);
          if (!currentBook?.flipbookName || currentBook?.flipbookName === 'Name of the Book') {
            setBookName(location.state?.flipbookName || decodeURIComponent(v_id) || 'Name of the Book');
          }
        } finally {
          setIsDataLoadingComplete(true);
          setIsDataLoaded(true);
          setPages(prevPages => {
            if (!prevPages || prevPages.length === 0) {
              const count = location.state?.pageCount || 12;
              const w = location.state?.width || currentBook?.width || 210;
              const h = location.state?.height || currentBook?.height || 297;
              return Array.from({ length: count }, (_, i) => {
                const name = `Page ${i + 1}`;
                const defaultData = createDefaultPageData(name, w, h);
                return {
                  id: i + 1,
                  name: name,
                  html: defaultData,
                  content: defaultData
                };
              });
            }
            return prevPages;
          });
        }
      } else {
        setIsDataLoadingComplete(true);
        setIsDataLoaded(true);
      }
    };
    fetchBook();
  }, [v_id, folder, user]);

  return {
    isLoading,
    setIsLoading,
    isDataLoadingComplete,
    loadingProgress,
    initialLoadRef
  };
};
