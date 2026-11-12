import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import {
  Type,
  ArrowRightLeft,
  Plus,
  Minus,
  GripVertical,
  Trash2,
  Crop,
  Check
} from 'lucide-react';
import ImageAdjustModal from './ImageAdjustModal';
import SlideTextPopup from './SlideTextPopup';
import ReplaceMediaModal from '../../../modals/ReplaceMediaModal';
import { Icon } from '@iconify/react';
import { getVisualBBox } from '../../../mainEditor/utils/geometryUtils';
import PremiumDropdown from '../../../../CustomizedEditor/components/PremiumDropdown';
import NavIconStylesPopup, { NavIconRenderer } from '../popups/NavIconStylesPopup';
import DotStylesPopup, { DotRenderer } from '../popups/DotStylesPopup';
import { saveToDB, getFromDB } from '../../../../../utils/dbUtils';
import ColorPicker from '../../../../ColorPicker';
import Color from '../../../properties/Color';
import { ElementToggle, ElementSlider, ElementDropdown } from './ElementUIControls';
import { update3FrameSlideshow, RingBuffer } from '../utils/slideshowElementUtils';

// Clean up any lingering debuggers from Vite HMR
['my-slideshow-debug', 'my-slideshow-debug2', 'my-slideshow-debug3'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.remove();
});

const processLocalImageFile = (file) => {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    if (typeof file === 'string') {
      if (file.startsWith('blob:')) {
        fetch(file)
          .then(res => {
            if (!res.ok) throw new Error('Blob fetch failed');
            return res.blob();
          })
          .then(blob => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target.result;
              const img = new Image();
              img.onload = () => {
                resolve({
                  id: Date.now() + Math.random(),
                  url: dataUrl,
                  name: 'Image.jpg',
                  dimensions: `${img.width} X ${img.height}`,
                  size: `${Math.max(1, Math.round(blob.size / 1024))}KB`,
                  isUploading: false
                });
              };
              img.onerror = () => {
                resolve({
                  id: Date.now() + Math.random(),
                  url: dataUrl,
                  name: 'Image.jpg',
                  dimensions: '1920 X 1080',
                  size: `${Math.max(1, Math.round(blob.size / 1024))}KB`,
                  isUploading: false
                });
              };
              img.src = dataUrl;
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          })
          .catch(() => {
            // Dead or expired blob URL from a previous session
            resolve(null);
          });
        return;
      }
      return resolve({
        id: Date.now() + Math.random(),
        url: file,
        name: file.split('/').pop()?.split('?')[0] || 'Image.jpg',
        dimensions: '1920 X 1080',
        size: '24MB',
        isUploading: false
      });
    }
    const fileName = file.name || `Image_${Date.now()}.jpg`;
    const fileSizeFormatted = file.size
      ? (file.size >= 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(0)}MB`
          : `${Math.max(1, Math.round(file.size / 1024))}KB`)
      : '24MB';

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        resolve({
          id: Date.now() + Math.random(),
          url: dataUrl,
          name: fileName,
          heading: '',
          subtext: '',
          dimensions: `${img.width} X ${img.height}`,
          size: fileSizeFormatted,
          isUploading: false
        });
      };
      img.onerror = () => {
        resolve({
          id: Date.now() + Math.random(),
          url: dataUrl,
          name: fileName,
          heading: '',
          subtext: '',
          dimensions: '1920 X 1080',
          size: fileSizeFormatted,
          isUploading: false
        });
      };
      img.src = dataUrl;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

const MAX_GALLERY_IMAGES = 4;

const SlideshowEditor = ({ selectedElement, activePageIndex, onUpdate, isOpen, onToggle, opacity, onUpdateOpacity, setPreviewSrc, setIsUpdatingDOM, currentPageVId, flipbookVId, folderName, flipbookName, onDisableSlideshow, onDeleteLayer, ...restProps }) => {
  const accordionRef = useRef(null);

  useEffect(() => {
    if (isOpen && accordionRef.current) {
      setTimeout(() => {
        accordionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 350);
    }
  }, [isOpen]);
  // Slideshow specific states
  const [slideshowSettings, setSlideshowSettings] = useState({
    transitionEffect: 'Coverflow',
    autoPlay: false,
    speed: 3,
    infiniteLoop: true,
    showArrows: true,
    showDots: true,
    imageFitType: 'Fit',
    dragToSlide: false,
    dotColor: '#3b82f6',
    dotOpacity: 100,
    dotStyle: 1,
    dotButtonSize: 70,
    navIconColor: '#ffffff',
    navIconOpacity: 100,
    navStyle: 1,
    navButtonSize: 70,
    autoSlide: false,
    bgColor: 'none',
    bgOpacity: 100,
    strokeColor: 'none',
    strokeOpacity: 100,
    strokeAlignment: 'Outside',
    strokeWidth: 0,
    strokeLineStyle: 'Solid',
    strokeDashLength: 8,
    strokeDashGap: 4,
    strokeLineCorner: 'Square',
  });
  const [slideshowImages, setSlideshowImages] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [draggedSlideIndex, setDraggedSlideIndex] = useState(null);
  const [dragOverSlideIndex, setDragOverSlideIndex] = useState(null);
  const isJustDroppedRef = useRef(false);

  const handleSlideDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setDraggedSlideIndex(index);
  };

  const handleSlideDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlideIndex !== index) {
      setDragOverSlideIndex(index);
    }
  };

  const handleSlideDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverSlideIndex(null);
  };

  const handleSlideDragEnd = () => {
    setDraggedSlideIndex(null);
    setDragOverSlideIndex(null);
  };

  const handleSlideDrop = (e, dropIndex) => {
    e.preventDefault();
    const fromIndex = draggedSlideIndex !== null ? draggedSlideIndex : Number(e.dataTransfer.getData('text/plain'));
    setDraggedSlideIndex(null);
    setDragOverSlideIndex(null);

    if (isNaN(fromIndex) || fromIndex === null || fromIndex === dropIndex || fromIndex < 0 || fromIndex >= slideshowImages.length) {
      return;
    }

    isJustDroppedRef.current = true;
    setTimeout(() => { isJustDroppedRef.current = false; }, 150);

    setSlideshowImages(current => {
      const updated = [...current];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(dropIndex, 0, moved);

      if (selectedElement?.id) {
        saveToDB(`slideshow_${flipbookVId || 'local'}_${selectedElement.id}`, updated).catch(() => {});
      }

      return updated;
    });

    setActiveSlideIndex(dropIndex);
  };

  const updateImageAtIndex = useCallback((index, key, value) => {
    setSlideshowImages(current => {
      const updated = [...current];
      if (updated[index]) {
        updated[index] = { ...updated[index], [key]: value };
      }
      return updated;
    });
    if (onUpdateRef.current) {
      if (onUpdateTimerRef.current) clearTimeout(onUpdateTimerRef.current);
      onUpdateTimerRef.current = setTimeout(() => {
        if (onUpdateRef.current) onUpdateRef.current({});
      }, 500);
    }
  }, []);

  // Automatically persist images locally to IndexedDB to prevent loss on unsaved refresh
  useEffect(() => {
    if (selectedElement?.id && slideshowImages.length > 0) {
      const dbKey = `slideshow_${flipbookVId || 'local'}_${selectedElement.id}`;
      saveToDB(dbKey, slideshowImages).catch((err) => {
        console.warn("IndexedDB slideshow save failed:", err);
      });
      try {
        const lightweight = slideshowImages.map(img => ({
          ...img,
          url: (img.url && img.url.length < 150000) ? img.url : ''
        }));
        localStorage.setItem(dbKey, JSON.stringify(lightweight));
      } catch (e) {}
    } else if (selectedElement?.id && slideshowImages.length === 0) {
      const dbKey = `slideshow_${flipbookVId || 'local'}_${selectedElement.id}`;
      saveToDB(dbKey, []).catch(() => {});
      localStorage.removeItem(dbKey);
    }
  }, [selectedElement?.id, slideshowImages, flipbookVId]);
  const isHoveringRef = useRef(false);

  const [showGallery, setShowGallery] = useState(false);
  const [openContextMenu, setOpenContextMenu] = useState(null);
  const [libraryTargetIndex, setLibraryTargetIndex] = useState(null);
  const [showDotColorPicker, setShowDotColorPicker] = useState(false);
  const [showDotStylesPopup, setShowDotStylesPopup] = useState(false);
  const [showNavColorPicker, setShowNavColorPicker] = useState(false);
  const [showNavStylesPopup, setShowNavStylesPopup] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false);
  const [openSubSection, setOpenSubSection] = useState(null);
  const [showStrokeSettings, setShowStrokeSettings] = useState(false);
  const [isStrokeStyleOpen, setIsStrokeStyleOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [strokeSettingsPos, setStrokeSettingsPos] = useState({ top: 0, right: 0 });
  const [isDashPosOpen, setIsDashPosOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [showDetailedPicker, setShowDetailedPicker] = useState(false);
  const [isAlignOpen, setIsAlignOpen] = useState(false);
  const [isCornerOpen, setIsCornerOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState(null);
  const replaceInputRef = useRef(null);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTargetIndex, setAdjustTargetIndex] = useState(null);

  const [showSlideTextPopup, setShowSlideTextPopup] = useState(false);
  const [textTargetIndex, setTextTargetIndex] = useState(null);
  const [openTextIndices, setOpenTextIndices] = useState({});

  const handleSaveAdjustedImage = useCallback(({
    croppedUrl,
    originalUrl,
    cropData,
    fixType,
    opacity: adjustedOpacity,
    filters
  }) => {
    if (adjustTargetIndex === null || !slideshowImages[adjustTargetIndex]) return;

    setSlideshowImages(current => {
      const updated = [...current];
      if (updated[adjustTargetIndex]) {
        updated[adjustTargetIndex] = {
          ...updated[adjustTargetIndex],
          url: croppedUrl,
          originalUrl: originalUrl || updated[adjustTargetIndex].originalUrl || updated[adjustTargetIndex].url,
          cropData: cropData,
          fixType: fixType,
          opacity: adjustedOpacity,
          filters: filters || updated[adjustTargetIndex].filters
        };
      }
      if (selectedElement?.id) {
        saveToDB(`slideshow_${flipbookVId || 'local'}_${selectedElement.id}`, updated).catch(() => {});
      }
      return updated;
    });

    if (onUpdateRef.current) {
      if (onUpdateTimerRef.current) clearTimeout(onUpdateTimerRef.current);
      onUpdateTimerRef.current = setTimeout(() => {
        if (onUpdateRef.current) onUpdateRef.current({ shouldRefresh: true });
      }, 300);
    }
  }, [adjustTargetIndex, slideshowImages, flipbookVId, selectedElement?.id]);

  const initialSlideBackupRef = useRef(null);

  const handleLiveSlideTextChange = useCallback((updatedTypography) => {
    if (textTargetIndex === null) return;
    setSlideshowImages(current => {
      const updated = [...current];
      if (updated[textTargetIndex]) {
        updated[textTargetIndex] = {
          ...updated[textTargetIndex],
          ...updatedTypography
        };
      }
      return updated;
    });
  }, [textTargetIndex]);

  const handleCancelSlideText = useCallback(() => {
    if (textTargetIndex === null || !initialSlideBackupRef.current) return;
    setSlideshowImages(current => {
      const updated = [...current];
      if (updated[textTargetIndex]) {
        updated[textTargetIndex] = {
          ...updated[textTargetIndex],
          ...initialSlideBackupRef.current
        };
      }
      return updated;
    });
  }, [textTargetIndex]);

  const handleSaveSlideText = useCallback(({
    heading,
    subtext,
    fontFamily,
    fontSize,
    textColor,
    fontWeight,
    fontStyle,
    textDecoration,
    textAlign,
    textShadow
  }) => {
    if (textTargetIndex === null || !slideshowImages[textTargetIndex]) return;

    setSlideshowImages(current => {
      const updated = [...current];
      if (updated[textTargetIndex]) {
        updated[textTargetIndex] = {
          ...updated[textTargetIndex],
          heading: heading !== undefined ? heading : updated[textTargetIndex].heading,
          subtext: subtext !== undefined ? subtext : updated[textTargetIndex].subtext,
          fontFamily: fontFamily || updated[textTargetIndex].fontFamily,
          fontSize: fontSize || updated[textTargetIndex].fontSize,
          textColor: textColor || updated[textTargetIndex].textColor,
          fontWeight: fontWeight || updated[textTargetIndex].fontWeight,
          fontStyle: fontStyle || updated[textTargetIndex].fontStyle,
          textDecoration: textDecoration || updated[textTargetIndex].textDecoration,
          textAlign: textAlign || updated[textTargetIndex].textAlign,
          textShadow: textShadow || updated[textTargetIndex].textShadow
        };
      }
      if (selectedElement?.id) {
        saveToDB(`slideshow_${flipbookVId || 'local'}_${selectedElement.id}`, updated).catch(() => {});
      }
      return updated;
    });

    if (onUpdateRef.current) {
      if (onUpdateTimerRef.current) clearTimeout(onUpdateTimerRef.current);
      onUpdateTimerRef.current = setTimeout(() => {
        if (onUpdateRef.current) onUpdateRef.current({ shouldRefresh: true });
      }, 300);
    }
  }, [textTargetIndex, slideshowImages, flipbookVId, selectedElement?.id]);

  const [isDisabling] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const isUpdatingDOM = useRef(false);
  const isUpdatingDOMTimeoutRef = useRef(null);
  const isHydrating = useRef(true);
  const isSyncingRef = useRef(false);

  const onUpdateTimerRef = useRef(null);
  const syncTimeoutRef = useRef(null);

  const onUpdateRef = useRef(onUpdate);
  const onUpdateOpacityRef = useRef(onUpdateOpacity);
  const setPreviewSrcRef = useRef(setPreviewSrc);
  const isAnimatingRef = useRef(false);
  const resetAutoTimerRef = useRef(null);
  const applyDesignRef = useRef(null);

  const truncateLogData = (data) => {
    if (!data) return data;
    try {
      const obj = typeof data === 'string' ? JSON.parse(data) : JSON.parse(JSON.stringify(data));
      if (obj && obj.images) {
        obj.images = obj.images.map(img => ({
          ...img,
          url: (img.url && img.url.length > 100) ? (img.url.substring(0, 40) + "..." + img.url.substring(img.url.length - 20)) : img.url
        }));
      }
      return obj;
    } catch (e) { return data; }
  };

  const getSvgImageEl = (el) => {
    if (!el) return null;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'image' || tag === 'img') return el;

    const findInPattern = (node) => {
      const fill = node.getAttribute?.('fill') || '';
      if (fill?.startsWith('url(#')) {
        const patternId = fill.match(/url\(#([^)]+)\)/)?.[1];
        if (patternId) {
          const doc = node.ownerDocument;
          const ownerSvg = node.closest('svg');
          const pattern = ownerSvg?.querySelector(`[id="${patternId}"]`) || doc?.getElementById(patternId);
          if (pattern) {
            const img = pattern.querySelector('image');
            if (img) return img;
            const useEl = pattern.querySelector('use');
            if (useEl) {
              const refId = (useEl.getAttribute('href') || useEl.getAttribute('xlink:href'))?.replace('#', '');
              if (refId) return doc?.getElementById(refId) || ownerSvg?.querySelector(`[id="${refId}"]`);
            }
          }
        }
      }
      return null;
    };

    const patternTarget = findInPattern(el);
    if (patternTarget) return patternTarget;
    const childImg = el.querySelector('image, img');
    if (childImg) return childImg;
    const childrenWithPatterns = el.querySelectorAll('[fill^="url(#"]');
    for (const child of Array.from(childrenWithPatterns)) {
      const target = findInPattern(child);
      if (target) return target;
    }
    return null;
  };

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onUpdateOpacityRef.current = onUpdateOpacity;
    setPreviewSrcRef.current = setPreviewSrc;
  });

  const syncStateFromDOM = useCallback((force = false) => {
    if (!selectedElement || isSyncingRef.current) return;

    isHydrating.current = true;
    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const pageContainer = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`);
      const targetElement = pageContainer?.querySelector(`[id="${selectedElement.id}"]`) || selectedElement;


      const savedDataRaw = targetElement.getAttribute('data-slideshow');

      if (savedDataRaw) {
        const savedData = JSON.parse(savedDataRaw);
        if (savedData) {
          setSlideshowSettings(prev => ({ ...prev, ...savedData.settings }));
          setSlideshowImages(prev => {
            // NEVER overwrite if actively uploading
            const hasOptimistic = prev.some(img => img.isUploading);
            if (hasOptimistic) return prev;

            let newImages = (savedData.images || []).slice(0, MAX_GALLERY_IMAGES);

            // Clean up and sanitize any dead blob URLs from prior sessions to avoid ERR_FILE_NOT_FOUND
            newImages = newImages.map(img => {
              if (img?.url && img.url.startsWith('blob:')) {
                return {
                  ...img,
                  url: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22500%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ESlide%20Image%3C%2Ftext%3E%3C%2Fsvg%3E"
                };
              }
              return img;
            });

            // Check IndexedDB / localStorage fallback if DOM savedData has no images or has sanitized placeholders
            const localKey = `slideshow_${flipbookVId || 'local'}_${targetElement.id}`;
            const needsDbCheck = !newImages || newImages.length === 0 || newImages.some(img => img.url?.includes('Slide%20Image'));
            if (needsDbCheck) {
              getFromDB(localKey).then(dbImages => {
                if (Array.isArray(dbImages) && dbImages.length > 0) {
                  const validDbImages = dbImages.filter(img => img?.url && !img.url.startsWith('blob:') && !img.url.includes('Slide%20Image'));
                  if (validDbImages.length > 0) {
                    setSlideshowImages(validDbImages);
                  }
                }
              }).catch(() => {});
              const localRaw = localStorage.getItem(localKey);
              if (localRaw) {
                try {
                  const localImages = JSON.parse(localRaw);
                  if (Array.isArray(localImages) && localImages.length > 0) {
                    const validLocal = localImages.filter(img => img?.url && !img.url.startsWith('blob:') && !img.url.includes('Slide%20Image'));
                    if (validLocal.length > 0) {
                      newImages = validLocal.slice(0, MAX_GALLERY_IMAGES);
                    }
                  }
                } catch (e) { }
              }
            }

            // If forced (e.g. element selection), we sync. 
            // Otherwise, we only sync if the DOM has more or different information.
            // Crucially, we don't let the DOM "shrink" our image list unless forced.
            if (!force && prev.length > 0 && newImages.length < prev.length) {
              return prev;
            }

            if (!force && prev.length > 0) return prev;

            return newImages.map((img, idx) => {
              if (idx === 0 && img.isOriginalCrop === undefined) {
                 return { ...img, isOriginalCrop: true }; // Retroactive fix for old saves
              }
              return img;
            });
          });
        }
      } else {
        // Default init
        setSlideshowSettings({
          transitionEffect: 'Coverflow',
          autoPlay: false,
          speed: 3,
          infiniteLoop: true,
          showArrows: true,
          showDots: true,
          imageFitType: 'Fit',
          dragToSlide: false,
          dotColor: '#3b82f6',
          dotOpacity: 100,
          dotStyle: 1,
          dotButtonSize: 70,
          navIconColor: '#ffffff',
          navIconOpacity: 100,
          navStyle: 1,
          navButtonSize: 70,
          autoSlide: false,
          bgColor: 'none',
          bgOpacity: 100,
          strokeColor: 'none',
          strokeOpacity: 100,
          strokeWidth: 0,
          strokeLineCorner: 'Square'
        });
        const imgEl = getSvgImageEl(targetElement);
        const currentSrc = (imgEl?.getAttribute('href') || imgEl?.getAttribute('xlink:href') || imgEl?.getAttribute('src') || imgEl?.src || targetElement.getAttribute('href') || targetElement.getAttribute('xlink:href'));
        setSlideshowImages(prev => {
          const hasOptimistic = prev.some(img => img.isUploading);
          if (hasOptimistic) return prev;
          if (prev.length > 0 && !force) return prev;
          if (currentSrc && !currentSrc.includes('placehold.co') && !currentSrc.startsWith('blob:')) {
            return [{ id: Date.now(), url: currentSrc, name: 'Main Image', isOriginalCrop: true }];
          }
          const is3Frame = targetElement.getAttribute('data-type') === 'slideshow' ||
                           targetElement.getAttribute('data-is-slideshow') === 'true' ||
                           targetElement.querySelectorAll('rect:not([fill="transparent"]):not(.bbox-anchor):not(.slideshow-container-bg)').length >= 3;
          if (is3Frame) {
            return [
              { id: 1, url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80', name: 'Slide 1', heading: '', subtext: '' },
              { id: 2, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', name: 'Slide 2', heading: '', subtext: '' },
              { id: 3, url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', name: 'Slide 3', heading: '', subtext: '' }
            ];
          }
          return [];
        });
      }

      const activeIdx = parseInt(targetElement.getAttribute('data-active-index')) || 0;
      setActiveSlideIndex(activeIdx);

    } catch (e) {
      console.error("Failed to sync slideshow from DOM", e);
    }

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      isHydrating.current = false;
      isSyncingRef.current = false;
      setIsSyncing(false);
      syncTimeoutRef.current = null;
    }, 50);
  }, [selectedElement]);

  const applyDesign = useCallback((overrideIndex = null) => {
    if (!selectedElement?.id || isDisabling) return;

    const apply = () => {
      const pageContainer = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`);
      const targetElement = pageContainer?.querySelector(`[id="${selectedElement.id}"]`) || selectedElement;
      if (!targetElement) return;

      const currentSwiperIndex = targetElement._swiperInstance?.realIndex;
      const effectiveIndex = (overrideIndex !== null && overrideIndex !== undefined) 
        ? overrideIndex 
        : (currentSwiperIndex !== undefined && !isNaN(currentSwiperIndex) ? currentSwiperIndex : activeSlideIndex);

      isUpdatingDOM.current = true;
      try {
        const dataToSave = {
          settings: slideshowSettings,
          images: slideshowImages.slice(0, MAX_GALLERY_IMAGES)
        };

        const newDataStr = JSON.stringify(dataToSave);
        const oldDataStr = targetElement.getAttribute('data-slideshow');

        if (newDataStr !== oldDataStr) {
          targetElement.setAttribute('data-slideshow', newDataStr);
          targetElement.setAttribute('data-is-slideshow', 'true');
          targetElement.dataset.slideshow = newDataStr;
          targetElement.dataset.isSlideshow = 'true';
          targetElement._slideshowManual = true;

          // Trigger a silent background save to the parent appData
          // We debounce this specifically to avoid massive lag when dragging sliders.
          if (onUpdateRef.current) {
            if (onUpdateTimerRef.current) clearTimeout(onUpdateTimerRef.current);
            onUpdateTimerRef.current = setTimeout(() => {
              if (onUpdateRef.current) onUpdateRef.current({});
            }, 500);
          }
        }

        targetElement.setAttribute('data-active-index', effectiveIndex.toString());

        const isSlideshowGroup = targetElement.getAttribute('data-type') === 'slideshow' ||
                                 targetElement.getAttribute('data-is-slideshow') === 'true' ||
                                 (typeof targetElement.getAttribute('id') === 'string' && targetElement.getAttribute('id').startsWith('slideshow-'));

        if (isSlideshowGroup) {
          const curImages = (slideshowImages && slideshowImages.length > 0)
            ? slideshowImages
            : (liveRunnerImagesRef.current && liveRunnerImagesRef.current.length > 0
                ? liveRunnerImagesRef.current
                : defaultSampleImages);

          // Update slideshow element directly with active slide, controls, and layout
          update3FrameSlideshow(targetElement, curImages, effectiveIndex, slideshowSettings);

          // Apply Container Background & Border if containerBg exists
          let containerBg = targetElement.querySelector('.slideshow-container-bg');
          if (containerBg) {
            const sColor = slideshowSettings.strokeColor || '#e2e8f0';
            const sWidth = slideshowSettings.strokeWidth !== undefined ? slideshowSettings.strokeWidth : 1;
            const sOpacity = (slideshowSettings.strokeOpacity !== undefined ? slideshowSettings.strokeOpacity : 100) / 100;
            const bgColor = slideshowSettings.bgColor || '#0f172a';
            const bgOpacity = (slideshowSettings.bgOpacity !== undefined ? slideshowSettings.bgOpacity : 100) / 100;

            if (bgColor === 'transparent' || bgColor === 'none' || bgOpacity === 0) {
              containerBg.setAttribute('fill', 'none');
            } else {
              containerBg.setAttribute('fill', bgColor);
              containerBg.setAttribute('fill-opacity', bgOpacity.toString());
            }

            if (sColor === 'transparent' || sColor === 'none' || sWidth === 0 || sOpacity === 0) {
              containerBg.setAttribute('stroke', 'none');
              containerBg.setAttribute('stroke-width', '0');
            } else {
              containerBg.setAttribute('stroke', sColor);
              containerBg.setAttribute('stroke-width', sWidth.toString());
              containerBg.setAttribute('stroke-opacity', sOpacity.toString());
            }
          }

          // Apply opacity to the entire group
          const opacityVal = (opacity / 100).toString();
          targetElement.setAttribute('opacity', opacityVal);
          targetElement.style.opacity = opacityVal;
        } else {
          // Standard Single-Image Logic
          const targetImg = getSvgImageEl(targetElement) || targetElement;
          
          // ONLY touch the visual image properties (href, crop, opacity) if an animation isn't currently running.
          // The timer (performTransition) has exclusive control over these during active transitions.
        if (!isAnimatingRef.current) {
          if (slideshowImages[activeSlideIndex]) {
            const imgObj = slideshowImages[activeSlideIndex];
            const url = imgObj.url;
            if (targetImg.getAttribute('href') !== url || targetImg.src !== url) {
              targetImg.setAttribute('href', url);
              try { targetImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', url); } catch (e) { }
              if (targetImg.tagName?.toLowerCase() === 'img') targetImg.src = url;
              if (setPreviewSrcRef.current) setPreviewSrcRef.current(url);
            }

            // Ensure the crop viewport correctly frames the image for transitions
            const cropStr = targetElement.getAttribute('data-crop-data');
            if (cropStr && cropStr !== 'null') {
              try {
                const crop = JSON.parse(cropStr);
                const origX = parseFloat(targetElement.getAttribute('data-crop-orig-x') || targetImg.getAttribute('data-crop-orig-x') || '0');
                const origY = parseFloat(targetElement.getAttribute('data-crop-orig-y') || targetImg.getAttribute('data-crop-orig-y') || '0');
                const origW = parseFloat(targetElement.getAttribute('data-crop-orig-w') || targetImg.getAttribute('data-crop-orig-w') || targetImg.getAttribute('width') || '100');
                const origH = parseFloat(targetElement.getAttribute('data-crop-orig-h') || targetImg.getAttribute('data-crop-orig-h') || targetImg.getAttribute('height') || '100');

                // Ensure bounding box anchor exists to prevent CSS clip-path percentage shifts
                const wrapper = targetImg.parentNode;
                if (wrapper && wrapper.tagName.toLowerCase() === 'g') {
                  let anchor = wrapper.querySelector('.bbox-anchor');
                  if (!anchor) {
                    anchor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    anchor.setAttribute('class', 'bbox-anchor');
                    anchor.setAttribute('fill', 'none');
                    anchor.style.pointerEvents = 'none';
                    wrapper.insertBefore(anchor, wrapper.firstChild);
                  }
                  anchor.setAttribute('x', origX);
                  anchor.setAttribute('y', origY);
                  anchor.setAttribute('width', origW);
                  anchor.setAttribute('height', origH);
                }

                if (imgObj?.isOriginalCrop) {
                  targetImg.setAttribute('x', origX);
                  targetImg.setAttribute('y', origY);
                  targetImg.setAttribute('width', origW);
                  targetImg.setAttribute('height', origH);
                  targetImg.style.removeProperty('transform');
                } else {
                  const cropX = origX + (origW * (parseFloat(crop.left) / 100));
                  const cropY = origY + (origH * (parseFloat(crop.top) / 100));
                  const cropW = origW * (parseFloat(crop.width) / 100);
                  const cropH = origH * (parseFloat(crop.height) / 100);

                  targetImg.setAttribute('x', cropX);
                  targetImg.setAttribute('y', cropY);
                  targetImg.setAttribute('width', cropW);
                  targetImg.setAttribute('height', cropH);
                  targetImg.style.removeProperty('transform');
                }
              } catch (e) { console.error("Error applying crop to gallery image", e); }
            }
          }

          // Fit mode
          const currentSingleImgObj = slideshowImages[activeSlideIndex];
          const singleFitMode = currentSingleImgObj?.fixType || slideshowSettings.imageFitType || 'Fit';
          if (targetImg.tagName?.toLowerCase() === 'image') {
            let par = 'xMidYMid meet';
            if (singleFitMode === 'Fit' || singleFitMode === 'Fit All') par = 'xMidYMid meet';
            else if (singleFitMode === 'Stretch') par = 'none';
            else if (singleFitMode === 'Fill' || singleFitMode === 'Fill All') par = 'xMidYMid slice';
            targetImg.setAttribute('preserveAspectRatio', par);
          } else if (targetImg.tagName?.toLowerCase() === 'img') {
            let val = 'contain';
            if (singleFitMode === 'Fit' || singleFitMode === 'Fit All') val = 'contain';
            else if (singleFitMode === 'Stretch') val = 'fill';
            else if (singleFitMode === 'Fill' || singleFitMode === 'Fill All') val = 'cover';
            targetImg.style.objectFit = val;
            targetImg.style.width = '100%';
            targetImg.style.height = '100%';
          }

          // Ensure container doesn't bleed
          if (targetElement !== targetImg) {
            if (targetElement.tagName?.toLowerCase() === 'svg') {
              targetElement.style.setProperty('overflow', 'hidden', 'important');
              targetElement.setAttribute('overflow', 'hidden');
            }
          } else if (targetElement.tagName?.toLowerCase() !== 'image' && targetElement.tagName?.toLowerCase() !== 'svg') {
            targetElement.style.setProperty('overflow', 'hidden', 'important');
          }

          // Apply Opacity
          const slideOpacity = currentSingleImgObj?.opacity !== undefined ? currentSingleImgObj.opacity : opacity;
          const opacityVal = (slideOpacity / 100).toString();
          
          let filterString = '';
          if (slideshowImages[activeSlideIndex]) {
            const imgObj = slideshowImages[activeSlideIndex];
            if (imgObj.filters) {
              const f = imgObj.filters;
              const exposure = f.exposure || 0;
              const contrast = f.contrast || 0;
              const saturation = f.saturation || 0;
              const temperature = f.temperature || 0;
              const tint = f.tint || 0;
              const h = f.highlights || 0;
              const s = f.shadows || 0;

              filterString += `brightness(${100 + exposure + (h / 5)}%) `;
              filterString += `contrast(${100 + contrast + (s / 5)}%) `;
              filterString += `saturate(${100 + saturation}%) `;
              if (tint !== 0) filterString += `hue-rotate(${tint}deg) `;
              if (temperature > 0) filterString += `sepia(${temperature / 2}%) `;
              else if (temperature < 0) filterString += `hue-rotate(180deg) sepia(${Math.abs(temperature) / 2}%) hue-rotate(-180deg) `;
            } else {
              const blurVal = imgObj.blur || 0;
              const brightnessVal = imgObj.brightness !== undefined ? imgObj.brightness : 100;
              const contrastVal = imgObj.contrast !== undefined ? imgObj.contrast : 100;
              if (blurVal > 0) filterString += `blur(${blurVal}px) `;
              if (brightnessVal !== 100) filterString += `brightness(${brightnessVal}%) `;
              if (contrastVal !== 100) filterString += `contrast(${contrastVal}%)`;
            }
            filterString = filterString.trim();

            if (targetElement.tagName?.toLowerCase() === 'svg' || targetElement.tagName?.toLowerCase() === 'g') {
              let textGroup = targetElement.querySelector('.single-overlay-text-group');
              if (!textGroup) {
                textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                textGroup.setAttribute('class', 'single-overlay-text-group');
                targetElement.appendChild(textGroup);
              }
              textGroup.innerHTML = '';
              const fFam = imgObj.fontFamily || 'Arial';
              const fSize = imgObj.fontSize || 16;
              const hasHeading = Boolean(imgObj.heading);
              const hasSubtext = Boolean(imgObj.subtext);
              const tColor = imgObj.textColor || '#ffffff';
              const fWeight = imgObj.fontWeight || 'bold';
              const fStyle = imgObj.fontStyle || 'normal';
              const tAlign = imgObj.textAlign || 'center';
              const tAnchor = tAlign === 'left' ? 'start' : (tAlign === 'right' ? 'end' : 'middle');
              const posX = tAlign === 'left' ? '8%' : (tAlign === 'right' ? '92%' : '50%');

              const singleShadowCss = (() => {
                const s = imgObj.textShadow;
                if (s === 'none') return 'none';
                if (s === 'lite') return '1px 1px 2px rgba(0, 0, 0, 0.45)';
                if (s === 'dark') return '2px 3px 6px rgba(0, 0, 0, 0.95), 0 0 4px rgba(0, 0, 0, 0.8)';
                return '1px 2px 4px rgba(0, 0, 0, 0.75)';
              })();

              if (imgObj.heading) {
                const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                t.setAttribute('x', posX);
                t.setAttribute('y', hasSubtext ? '46%' : '50%');
                t.setAttribute('text-anchor', tAnchor);
                t.setAttribute('dominant-baseline', 'central');
                t.setAttribute('fill', tColor);
                t.setAttribute('font-size', `${fSize}px`);
                t.setAttribute('font-family', `'${fFam}', sans-serif`);
                t.setAttribute('font-weight', fWeight);
                t.setAttribute('font-style', fStyle);
                if (imgObj.textDecoration === 'underline') {
                  t.setAttribute('text-decoration', 'underline');
                }
                t.setAttribute('style', `${singleShadowCss !== 'none' ? `text-shadow: ${singleShadowCss}; ` : ''}pointer-events: none;${imgObj.textDecoration === 'underline' ? ' text-decoration: underline;' : ''}`);
                t.textContent = imgObj.heading;
                textGroup.appendChild(t);
              }
              if (imgObj.subtext) {
                const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                t.setAttribute('x', posX);
                t.setAttribute('y', hasHeading ? '56%' : '50%');
                t.setAttribute('text-anchor', tAnchor);
                t.setAttribute('dominant-baseline', 'central');
                t.setAttribute('fill', tColor);
                t.setAttribute('font-size', `${Math.max(8, Math.round(fSize * 0.65))}px`);
                t.setAttribute('font-family', `'${fFam}', sans-serif`);
                t.setAttribute('font-weight', fWeight === 'bold' ? '600' : 'normal');
                t.setAttribute('font-style', fStyle);
                if (imgObj.textDecoration === 'underline') {
                  t.setAttribute('text-decoration', 'underline');
                }
                t.setAttribute('style', `${singleShadowCss !== 'none' ? `text-shadow: ${singleShadowCss}; ` : ''}pointer-events: none;${imgObj.textDecoration === 'underline' ? ' text-decoration: underline;' : ''}`);
                t.textContent = imgObj.subtext;
                textGroup.appendChild(t);
              }
            }
          }

          if (targetImg && targetImg !== targetElement) {
            targetElement.style.removeProperty('opacity');
            targetElement.removeAttribute('opacity');
            
            targetImg.setAttribute('opacity', opacityVal);
            targetImg.style.opacity = opacityVal; // Do NOT use !important as it breaks Fade transitions
            
            if (filterString) {
                targetImg.style.filter = filterString;
            } else {
                targetImg.style.removeProperty('filter');
            }
          } else {
            targetElement.setAttribute('opacity', opacityVal);
            targetElement.style.opacity = opacityVal;
            if (filterString) {
                targetElement.style.filter = filterString;
            } else {
                targetElement.style.removeProperty('filter');
            }
          }

          // Apply Container Background for Single-Image mode
          const bgParent = (targetElement.tagName?.toLowerCase() === 'g') ? targetElement : targetImg.parentNode;
          if (bgParent && bgParent.tagName?.toLowerCase() === 'g') {
            let containerBg = bgParent.querySelector('.slideshow-container-bg');
            const bgColor = slideshowSettings.bgColor || '#000000';
            const bgOpacity = (slideshowSettings.bgOpacity !== undefined ? slideshowSettings.bgOpacity : 100) / 100;
            if (!containerBg && (bgColor !== 'transparent' && bgColor !== 'none' && bgOpacity > 0)) {
              containerBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              containerBg.setAttribute('class', 'slideshow-container-bg');
              bgParent.insertBefore(containerBg, bgParent.firstChild);
            }
            if (containerBg) {
              const pad = 5;
              const sColor = slideshowSettings.strokeColor || '#9ca3af';
              const sWidth = slideshowSettings.strokeWidth !== undefined ? slideshowSettings.strokeWidth : 1;
              const sOpacity = (slideshowSettings.strokeOpacity !== undefined ? slideshowSettings.strokeOpacity : 100) / 100;
              let sDash = 'none';
              if (slideshowSettings.strokeLineStyle === 'Dotted') {
                sDash = '2,3';
              } else if (slideshowSettings.strokeLineStyle === 'Dashed') {
                sDash = `${slideshowSettings.strokeDashLength || 8},${slideshowSettings.strokeDashGap || 4}`;
              }
              const sCap = slideshowSettings.strokeLineCorner === 'Rounded' ? 'round' : 'square';
              const sJoin = slideshowSettings.strokeLineCorner === 'Rounded' ? 'round' : 'miter';
              const sAlign = slideshowSettings.strokeAlignment || 'Outside';
              let alignOffset = 0;
              if (sAlign === 'Inside') alignOffset = sWidth / 2;
              else if (sAlign === 'Outside') alignOffset = -sWidth / 2;

              const bAnchor = bgParent.querySelector('.bbox-anchor');
              const bx = (parseFloat(bAnchor?.getAttribute('x') || targetImg.getAttribute('x') || '0')) - pad + alignOffset;
              const by = (parseFloat(bAnchor?.getAttribute('y') || targetImg.getAttribute('y') || '0')) - pad + alignOffset;
              const bw = (parseFloat(bAnchor?.getAttribute('width') || targetImg.getAttribute('width') || '100')) + pad * 2 - alignOffset * 2;
              const bh = (parseFloat(bAnchor?.getAttribute('height') || targetImg.getAttribute('height') || '100')) + pad * 2 - alignOffset * 2;
              containerBg.setAttribute('x', bx.toString());
              containerBg.setAttribute('y', by.toString());
              containerBg.setAttribute('width', bw.toString());
              containerBg.setAttribute('height', bh.toString());
              const bgCornerRadius = slideshowSettings.strokeLineCorner === 'Square' ? 0 : 10;
              containerBg.setAttribute('rx', bgCornerRadius.toString());
              containerBg.setAttribute('ry', bgCornerRadius.toString());
              if (bgColor === 'transparent' || bgColor === 'none' || bgOpacity === 0) {
                containerBg.setAttribute('fill', 'none');
                containerBg.setAttribute('fill-opacity', '0');
                containerBg.style.fill = 'none';
                containerBg.style.fillOpacity = '0';
              } else {
                containerBg.setAttribute('fill', bgColor);
                containerBg.setAttribute('fill-opacity', bgOpacity.toString());
                containerBg.style.fill = bgColor;
                containerBg.style.fillOpacity = bgOpacity.toString();
              }

              if (sColor === 'transparent' || sColor === 'none' || sWidth === 0 || sOpacity === 0) {
                containerBg.setAttribute('stroke', 'none');
                containerBg.setAttribute('stroke-width', '0');
                containerBg.style.stroke = 'none';
                containerBg.style.strokeWidth = '0';
              } else {
                containerBg.setAttribute('stroke', sColor);
                containerBg.setAttribute('stroke-width', sWidth.toString());
                containerBg.setAttribute('stroke-opacity', sOpacity.toString());
                containerBg.style.stroke = sColor;
                containerBg.style.strokeWidth = `${sWidth}px`;
                containerBg.style.strokeOpacity = sOpacity.toString();
                if (sDash !== 'none') {
                  containerBg.setAttribute('stroke-dasharray', sDash);
                  containerBg.style.strokeDasharray = sDash;
                } else {
                  containerBg.removeAttribute('stroke-dasharray');
                  containerBg.style.removeProperty('stroke-dasharray');
                }
                containerBg.setAttribute('stroke-linecap', sCap);
                containerBg.setAttribute('stroke-linejoin', sJoin);
              }
            }
          }
        }
        } // End of Standard Single-Image Logic

        if (targetElement.getAttribute('data-is-slideshow') === 'true' || targetElement.getAttribute('data-type') === 'slideshow') {
          const curImages = (slideshowImages && slideshowImages.length > 0) ? slideshowImages : defaultSampleImages;
          update3FrameSlideshow(targetElement, curImages, effectiveIndex, slideshowSettings);
        }

        // No need to trigger a full React re-render of the SVG (shouldRefresh: true)
        // because the necessary attributes (data-slideshow, href, opacity) are directly mutated on the DOM node above.
        // Forcing a refresh here causes the DOM to be wiped and rebuilt from the parent's stale state,
        // which ruins any active CSS transitions and resets the slideshow to Image 1.
      } finally {
        if (isUpdatingDOMTimeoutRef.current) clearTimeout(isUpdatingDOMTimeoutRef.current);
        isUpdatingDOMTimeoutRef.current = setTimeout(() => {
          isUpdatingDOM.current = false;
          isUpdatingDOMTimeoutRef.current = null;
        }, 500);
      }
    };

    apply();
  }, [
    selectedElement?.id,
    JSON.stringify(slideshowSettings),
    JSON.stringify(slideshowImages.map(img => ({
      url: img.url,
      heading: img.heading,
      subtext: img.subtext,
      fontFamily: img.fontFamily,
      fontSize: img.fontSize,
      textColor: img.textColor,
      fontWeight: img.fontWeight,
      fontStyle: img.fontStyle,
      textAlign: img.textAlign,
      textDecoration: img.textDecoration,
      textShadow: img.textShadow,
      filters: img.filters,
      opacity: img.opacity
    }))),
    activeSlideIndex,
    opacity,
    activePageIndex
  ]);

  useEffect(() => {
    applyDesignRef.current = applyDesign;
  }, [applyDesign]);

  useEffect(() => {
    if (!selectedElement?.id) return;
    syncStateFromDOM(true);
  }, [selectedElement?.id, syncStateFromDOM]);

  // Master Update Effect
  useEffect(() => {
    if (!isSyncingRef.current && selectedElement?.id && !isDisabling) {
      applyDesign();
    }
  }, [
    selectedElement?.id,
    JSON.stringify(slideshowSettings),
    JSON.stringify(slideshowImages.map(img => ({
      url: img.url,
      heading: img.heading,
      subtext: img.subtext,
      fontFamily: img.fontFamily,
      fontSize: img.fontSize,
      textColor: img.textColor,
      fontWeight: img.fontWeight,
      fontStyle: img.fontStyle,
      textAlign: img.textAlign,
      textDecoration: img.textDecoration,
      textShadow: img.textShadow,
      filters: img.filters,
      opacity: img.opacity
    }))),
    opacity,
    applyDesign
  ]);

  // ── Live Editor Runner ──
  // IMPORTANT: SVG elements can't host HTML children, so we inject
  // an absolutely-positioned overlay div into the HTML page container
  // and position it over the target element using getBoundingClientRect.
  const liveRunnerIndexRef = useRef(activeSlideIndex);
  const liveRunnerImagesRef = useRef(slideshowImages);
  const liveRunnerAutoTimer = useRef(null);
  const liveRunnerOverlayRef = useRef(null);
  const positionOverlayRef = useRef(null);
  const slideshowSettingsRef = useRef(slideshowSettings);
  slideshowSettingsRef.current = slideshowSettings;

  useEffect(() => { liveRunnerIndexRef.current = activeSlideIndex; }, [activeSlideIndex]);
  useEffect(() => { liveRunnerImagesRef.current = slideshowImages; }, [slideshowImages]);

  const performTransition = useCallback((newIdx, dir = 'next') => {
    if (isAnimatingRef.current) return;

    const pageContainer = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`);
    const targetElement = pageContainer?.querySelector(`[id="${selectedElement?.id}"]`) || selectedElement;
    if (!targetElement) return;

    const isSlideshowGroup = targetElement.getAttribute('data-type') === 'slideshow' ||
                             targetElement.getAttribute('data-is-slideshow') === 'true' ||
                             (typeof targetElement.getAttribute('id') === 'string' && targetElement.getAttribute('id').startsWith('slideshow-'));
    if (isSlideshowGroup) {
      liveRunnerIndexRef.current = newIdx;
      setActiveSlideIndex(newIdx);
      targetElement.setAttribute('data-active-index', newIdx.toString());

      const curImages = (slideshowImages && slideshowImages.length > 0)
        ? slideshowImages
        : (liveRunnerImagesRef.current || defaultSampleImages);

      const prevIdx = activeSlideIndex;
      const dir = newIdx >= prevIdx ? 1 : -1;
      update3FrameSlideshow(targetElement, curImages, newIdx, slideshowSettings, dir, prevIdx);
      window.dispatchEvent(new CustomEvent('slideshow-index-changed', {
        detail: { id: targetElement.id, index: newIdx, source: 'properties' }
      }));
      return;
    }

    const imgEl = getSvgImageEl(targetElement) || targetElement;
    const images = liveRunnerImagesRef.current;
    const nextUrl = images[newIdx]?.url;
    if (!nextUrl || !imgEl) return;

    isAnimatingRef.current = true;
    if (typeof setIsUpdatingDOM === 'function') setIsUpdatingDOM(true);
    liveRunnerIndexRef.current = newIdx; // Update early to prevent interval double-trigger

    const overlay = liveRunnerOverlayRef.current;
    if (overlay && overlay._updateDots) {
      overlay._updateDots(newIdx);
    }

    const finalize = () => {
      targetElement.setAttribute('data-active-index', newIdx.toString());
      liveRunnerIndexRef.current = newIdx; // Crucial for auto-slide interval
      setActiveSlideIndex(newIdx);

      // Sync overlay if exists
      const currentOverlay = liveRunnerOverlayRef.current;
      if (currentOverlay) {
        if (currentOverlay._updateDots) {
          currentOverlay._updateDots(newIdx);
        }
        currentOverlay.querySelectorAll('.editor-ss-dot').forEach((d, i) => {
          d.style.opacity = i === newIdx ? '1' : '0.4';
          const activeScale = d.getAttribute('data-active-scale') || 'scale(1.4)';
          const inactiveScale = d.getAttribute('data-inactive-scale') || 'scale(1)';
          d.style.transform = i === newIdx ? activeScale : inactiveScale;
        });
      }

      setTimeout(() => {
        isAnimatingRef.current = false;
        if (typeof setIsUpdatingDOM === 'function') setIsUpdatingDOM(false);
      }, 50);
    };

    const setElSrc = (url, imgObj) => {
      imgEl.setAttribute('href', url);
      try { imgEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', url); } catch (e) { }
      if (imgEl.tagName?.toLowerCase() === 'img') imgEl.src = url;
      if (setPreviewSrcRef.current) setPreviewSrcRef.current(url);

      const cropStr = targetElement.getAttribute('data-crop-data');
      if (cropStr && cropStr !== 'null') {
        try {
          const crop = JSON.parse(cropStr);
          const origX = parseFloat(targetElement.getAttribute('data-crop-orig-x') || imgEl.getAttribute('data-crop-orig-x') || '0');
          const origY = parseFloat(targetElement.getAttribute('data-crop-orig-y') || imgEl.getAttribute('data-crop-orig-y') || '0');
          const origW = parseFloat(targetElement.getAttribute('data-crop-orig-w') || imgEl.getAttribute('data-crop-orig-w') || imgEl.getAttribute('width') || '100');
          const origH = parseFloat(targetElement.getAttribute('data-crop-orig-h') || imgEl.getAttribute('data-crop-orig-h') || imgEl.getAttribute('height') || '100');

          // Ensure bounding box anchor exists to prevent CSS clip-path percentage shifts
          const wrapper = imgEl.parentNode;
          if (wrapper && wrapper.tagName.toLowerCase() === 'g') {
            let anchor = wrapper.querySelector('.bbox-anchor');
            if (!anchor) {
              anchor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              anchor.setAttribute('class', 'bbox-anchor');
              anchor.setAttribute('fill', 'none');
              anchor.style.pointerEvents = 'none';
              wrapper.insertBefore(anchor, wrapper.firstChild);
            }
            anchor.setAttribute('x', origX);
            anchor.setAttribute('y', origY);
            anchor.setAttribute('width', origW);
            anchor.setAttribute('height', origH);
          }

          if (imgObj?.isOriginalCrop) {
            imgEl.setAttribute('x', origX);
            imgEl.setAttribute('y', origY);
            imgEl.setAttribute('width', origW);
            imgEl.setAttribute('height', origH);
            imgEl.style.setProperty('transform', `translate(${crop.offX || 0}%, ${crop.offY || 0}%) scale(${crop.scale || 1})`, 'important');
          } else {
            const cropX = origX + (origW * (parseFloat(crop.left) / 100));
            const cropY = origY + (origH * (parseFloat(crop.top) / 100));
            const cropW = origW * (parseFloat(crop.width) / 100);
            const cropH = origH * (parseFloat(crop.height) / 100);

            imgEl.setAttribute('x', cropX);
            imgEl.setAttribute('y', cropY);
            imgEl.setAttribute('width', cropW);
            imgEl.setAttribute('height', cropH);
            imgEl.style.setProperty('transform', 'none', 'important');
          }
        } catch (e) { console.error("Error applying crop to gallery image", e); }
      }
    };

    const animEl = targetElement;
    const baseOpacity = (opacity / 100).toString();

    // Use independent CSS properties
    animEl.style.transformBox = 'fill-box';
    animEl.style.transformOrigin = 'center';

    // Swap src on the original element immediately
    setElSrc(nextUrl, images[newIdx]);
    finalize();
  }, [activePageIndex, selectedElement, opacity, setIsUpdatingDOM]);

  const runnerSettingsStr = JSON.stringify({
    navIconColor: slideshowSettings.navIconColor,
    navStyle: slideshowSettings.navStyle,
    showDots: slideshowSettings.showDots,
    dotStyle: slideshowSettings.dotStyle,
    showArrows: slideshowSettings.showArrows,
    showNav: slideshowSettings.showNav,
    dotColor: slideshowSettings.dotColor,
    autoSlide: slideshowSettings.autoSlide,
    autoPlay: slideshowSettings.autoPlay,
    speed: slideshowSettings.speed,
    infiniteLoop: slideshowSettings.infiniteLoop
  });

  // Clean up any lingering HTML overlay artifacts to prevent duplicate overlays
  useEffect(() => {
    const cleanupArtifacts = () => {
      document.querySelectorAll(".editor-ss-overlay, .global-ss-overlay, .ss-dots-container, .ss-nav-btn, .editor-ss-dots-wrap, .editor-ss-nav").forEach(el => el.remove());
    };
    cleanupArtifacts();
    return cleanupArtifacts;
  }, [selectedElement?.id, activePageIndex]);


  const handleFileUpload = useCallback(async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_GALLERY_IMAGES - slideshowImages.length;
    const filesToUpload = Array.from(files).filter(file => file.type.startsWith('image/')).slice(0, remainingSlots);

    if (filesToUpload.length === 0) return;

    const processed = await Promise.all(filesToUpload.map(processLocalImageFile));
    const valid = processed.filter(Boolean);

    if (valid.length > 0) {
      setSlideshowImages(prev => {
        const next = [...prev, ...valid];
        if (selectedElement?.id) {
          saveToDB(`slideshow_${flipbookVId || 'local'}_${selectedElement.id}`, next).catch(() => {});
        }
        return next;
      });
      if (onUpdateRef.current) onUpdateRef.current({ shouldRefresh: true });
    }
    e.target.value = '';
  }, [slideshowImages.length, selectedElement?.id, flipbookVId]);

  const handleReplaceFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || replaceTargetIndex === null) return;

    const localImg = await processLocalImageFile(file);
    if (localImg) {
      setSlideshowImages(current => {
        const updated = [...current];
        if (updated[replaceTargetIndex]) {
          updated[replaceTargetIndex] = { ...updated[replaceTargetIndex], ...localImg };
        }
        if (selectedElement?.id) {
          saveToDB(`slideshow_${flipbookVId || 'local'}_${selectedElement.id}`, updated).catch(() => {});
        }
        return updated;
      });
      if (onUpdateRef.current) onUpdateRef.current({ shouldRefresh: true });
    }
    e.target.value = '';
    setReplaceTargetIndex(null);
  }, [replaceTargetIndex, selectedElement?.id, flipbookVId]);

  const handleModalReplace = async (file) => {
    if (!file || replaceTargetIndex === null) return;
    const localImg = await processLocalImageFile(file);
    if (localImg) {
      setSlideshowImages(current => {
        const updated = [...current];
        if (updated[replaceTargetIndex]) {
          updated[replaceTargetIndex] = { ...updated[replaceTargetIndex], ...localImg };
        }
        if (selectedElement?.id) {
          saveToDB(`slideshow_${flipbookVId || 'local'}_${selectedElement.id}`, updated).catch(() => {});
        }
        return updated;
      });
      if (onUpdateRef.current) onUpdateRef.current({ shouldRefresh: true });
    }
    setShowReplaceModal(false);
    setReplaceTargetIndex(null);
  };

  const deleteImage = useCallback((index) => {
    setSlideshowImages(current => {
      const updated = current.filter((_, idx) => idx !== index);
      if (selectedElement?.id) {
        saveToDB(`slideshow_${flipbookVId || 'local'}_${selectedElement.id}`, updated).catch(() => {});
      }
      return updated;
    });
    setOpenContextMenu(null);
    if (activeSlideIndex >= index && activeSlideIndex > 0) {
      setActiveSlideIndex(prev => prev - 1);
    }
    if (onUpdateRef.current) onUpdateRef.current({ shouldRefresh: true });
  }, [selectedElement?.id, flipbookVId, activeSlideIndex]);

  const handleGallerySelect = useCallback(async (img) => {
    if (!img) return;
    const targetFile = img.file || (img instanceof File ? img : img.url || img);
    const localImg = await processLocalImageFile(targetFile);
    if (!localImg) return;

    const targetIdx = libraryTargetIndex !== null ? libraryTargetIndex : activeSlideIndex;
    setSlideshowImages(prev => {
      const updated = [...prev];
      if (targetIdx < updated.length) {
        updated[targetIdx] = localImg;
      } else if (updated.length < MAX_GALLERY_IMAGES) {
        updated.push(localImg);
      }
      if (selectedElement?.id) {
        saveToDB(`slideshow_${flipbookVId || 'local'}_${selectedElement.id}`, updated).catch(() => {});
      }
      return updated;
    });

    if (targetIdx < MAX_GALLERY_IMAGES) {
      setActiveSlideIndex(targetIdx);
    }

    setLibraryTargetIndex(null);
    setOpenContextMenu(null);
    setShowGallery(false);
  }, [libraryTargetIndex, activeSlideIndex, selectedElement?.id, flipbookVId]);

  const updateSetting = (key, value) => {
    setSlideshowSettings(prev => ({ ...prev, [key]: value }));
  };

  const colorsOnPage = React.useMemo(() => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const elements = doc.querySelectorAll('[data-fill-color], [data-stroke-color]');
    const colors = new Set();
    elements.forEach(el => {
      const fill = el.getAttribute('data-fill-color');
      const stroke = el.getAttribute('data-stroke-color');
      if (fill && fill !== 'none' && fill !== '#' && !fill.includes('gradient')) colors.add(fill.toUpperCase());
      if (stroke && stroke !== 'none' && stroke !== '#' && !stroke.includes('gradient')) colors.add(stroke.toUpperCase());
    });
    colors.add('#FFFFFF');
    colors.add('#000000');
    return Array.from(colors).slice(0, 12);
  }, [activePageIndex]);

  const backgroundColor = React.useMemo(() => {
    const rawDash = slideshowSettings.strokeDasharray || (slideshowSettings.strokeLineStyle === 'Dashed' ? `${slideshowSettings.strokeDashLength || 10},${slideshowSettings.strokeDashGap || 10}` : 'none');
    return {
      fill: slideshowSettings.bgColor || 'none',
      fillOpacity: slideshowSettings.bgOpacity ?? 100,
      stroke: slideshowSettings.strokeColor || 'none',
      strokeOpacity: slideshowSettings.strokeOpacity ?? 100,
      strokeWeight: slideshowSettings.strokeWidth ?? 0,
      strokeDashStyle: slideshowSettings.strokeLineStyle === 'Dashed' ? 'Dashed' : 'Solid',
      strokeDasharrayValue: rawDash !== 'none' ? rawDash : undefined,
      strokeDashLength: slideshowSettings.strokeDashLength || 10,
      strokeDashGap: slideshowSettings.strokeDashGap || 10,
      strokeLinecap: slideshowSettings.strokeLineCorner === 'Square' ? 'square' : 'round',
      strokePosition: slideshowSettings.strokeAlignment || 'Outside',
    };
  }, [
    slideshowSettings.bgColor,
    slideshowSettings.bgOpacity,
    slideshowSettings.strokeColor,
    slideshowSettings.strokeOpacity,
    slideshowSettings.strokeWidth,
    slideshowSettings.strokeLineStyle,
    slideshowSettings.strokeDasharray,
    slideshowSettings.strokeDashLength,
    slideshowSettings.strokeDashGap,
    slideshowSettings.strokeLineCorner,
    slideshowSettings.strokeAlignment
  ]);

  const handleSetBackgroundColor = useCallback((updater) => {
    setSlideshowSettings(prev => {
      const currentBg = {
        fill: prev.bgColor || 'none',
        fillOpacity: prev.bgOpacity ?? 100,
        stroke: prev.strokeColor || 'none',
        strokeOpacity: prev.strokeOpacity ?? 100,
        strokeWeight: prev.strokeWidth ?? 0,
        strokeDashStyle: prev.strokeLineStyle === 'Dashed' ? 'Dashed' : 'Solid',
        strokeDashLength: prev.strokeDashLength || 10,
        strokeDashGap: prev.strokeDashGap || 10,
        strokeLinecap: prev.strokeLineCorner === 'Square' ? 'square' : 'round',
        strokePosition: prev.strokeAlignment || 'Outside',
      };
      const next = typeof updater === 'function' ? updater(currentBg) : updater;

      const newFill = next.fill !== undefined ? next.fill : prev.bgColor;
      const newFillOp = next.fillOpacity !== undefined ? next.fillOpacity : prev.bgOpacity;
      const newStroke = next.stroke !== undefined ? next.stroke : prev.strokeColor;
      const newStrokeOp = next.strokeOpacity !== undefined ? next.strokeOpacity : prev.strokeOpacity;
      const newStrokeWidth = next.strokeWeight !== undefined ? next.strokeWeight : (next.strokeWidth !== undefined ? next.strokeWidth : prev.strokeWidth);
      const newDashStyle = next.strokeDashStyle || (next['stroke-dasharray'] && next['stroke-dasharray'] !== 'none' ? 'Dashed' : 'Solid');
      const newDashLength = next.strokeDashLength !== undefined ? next.strokeDashLength : prev.strokeDashLength;
      const newDashGap = next.strokeDashGap !== undefined ? next.strokeDashGap : prev.strokeDashGap;
      const newCorner = next.strokeLinecap === 'square' ? 'Square' : (next.strokeLinecap === 'round' ? 'Rounded' : prev.strokeLineCorner);
      const newPos = next.strokePosition || next['data-stroke-position'] || prev.strokeAlignment;

      return {
        ...prev,
        bgColor: newFill,
        bgOpacity: newFillOp,
        strokeColor: newStroke,
        strokeOpacity: newStrokeOp,
        strokeWidth: newStrokeWidth,
        strokeLineStyle: newDashStyle,
        strokeDashLength: newDashLength,
        strokeDashGap: newDashGap,
        strokeLineCorner: newCorner,
        strokeAlignment: newPos
      };
    });
  }, []);

  return (
    <div className="space-y-[1.2vw] font-sans pb-[2vw] overflow-x-hidden select-none">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0.25vw; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 0.5vw; }
        .custom-range-slider { -webkit-appearance: none; width: 100%; background: transparent; position: relative; }
        .custom-range-slider::before { content: ""; position: absolute; top: -0.75vw; bottom: -0.75vw; left: 0; right: 0; cursor: pointer; z-index: 1; }
        .custom-range-slider::-webkit-slider-runnable-track { height: 0.2vw; border-radius: 0.1vw; background: inherit; }
        .custom-range-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 1vw; width: 1vw; border-radius: 50%; background: #4D47FF; border: 0.02vw solid #ffffff; box-shadow: 0 0.15vw 0.5vw rgba(77,71,255,0.4); margin-top: -0.4vw; cursor: pointer; transition: box-shadow 0.15s ease; position: relative; z-index: 2; }
        .custom-range-slider::-webkit-slider-thumb:hover { box-shadow: 0 0.15vw 0.75vw rgba(77,71,255,0.6); }
      `}</style>

      {/* ── 1. Top Add Images Button ── */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-300 rounded-[0.55vw] bg-white py-[1.1vw] flex items-center justify-center gap-[0.5vw] text-gray-600 hover:text-[#4D47FF] hover:border-[#4D47FF] hover:bg-gray-50/60 cursor-pointer transition-all shadow-2xs group"
      >
        <Plus size="1vw" className="text-gray-500 group-hover:text-[#4D47FF] transition-colors" />
        <span className="text-[0.82vw] font-semibold text-gray-700 group-hover:text-[#4D47FF] transition-colors">Add Images</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* ── 2. Images List ── */}
      {slideshowImages.length > 0 && (
        <div className="space-y-[0.6vw]">
          {slideshowImages.map((img, i) => {
            const slideKey = img.id || i;
            const isTextOpen = Boolean(openTextIndices[slideKey]);
            const hasText = Boolean(img.heading || img.subtext);

            return (
              <div
                key={slideKey}
                draggable={true}
                onDragStart={(e) => handleSlideDragStart(e, i)}
                onDragOver={(e) => handleSlideDragOver(e, i)}
                onDragLeave={handleSlideDragLeave}
                onDragEnd={handleSlideDragEnd}
                onDrop={(e) => handleSlideDrop(e, i)}
                onClick={() => {
                  if (isJustDroppedRef.current) return;
                  const { direction } = RingBuffer.shortestPath(activeSlideIndex, i, slideshowImages.length);
                  setActiveSlideIndex(i);
                  performTransition(i, direction);
                }}
                className={`flex flex-col p-[0.7vw] bg-white border rounded-[0.55vw] shadow-2xs cursor-pointer transition-all ${
                  draggedSlideIndex === i
                    ? 'opacity-30 border-dashed border-[#4D47FF] scale-[0.98]'
                    : dragOverSlideIndex === i
                      ? 'border-[#4D47FF] ring-2 ring-[#4D47FF]/40 bg-[#EEF2FF]/30 scale-[1.01]'
                      : activeSlideIndex === i
                        ? 'border-[#4D47FF] ring-1 ring-[#4D47FF]/30'
                        : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Top Row: Drag Handle, Thumbnail, File Name & Dimensions, Actions */}
                <div className="flex items-center justify-between">
                  {/* Drag Handle */}
                  <div
                    className="text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing px-[0.1vw] py-[0.2vw] transition-colors"
                    title="Drag to reorder slide"
                  >
                    <GripVertical size="0.95vw" />
                  </div>

                  {/* Thumbnail with Replace button overlay */}
                  <div
                    className="relative w-[4.2vw] h-[3.2vw] rounded-[0.4vw] mx-[0.4vw] border border-gray-200 shrink-0 overflow-hidden group/thumb cursor-pointer shadow-2xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplaceTargetIndex(i);
                      replaceInputRef.current?.click();
                    }}
                    title="Click to replace image"
                  >
                    <img
                      src={img.url}
                      alt={img.name || `Slide ${i + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%2280%22%20viewBox%3D%220%200%20100%2080%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22100%22%20height%3D%2280%22%2F%3E%3Ctext%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%223.5%22%3ENo%20Img%3C%2Ftext%3E%3C%2Fsvg%3E";
                      }}
                      style={{
                        opacity: (img.opacity !== undefined ? img.opacity : 100) / 100,
                        objectFit: img.fixType === 'Fit' ? 'contain' : img.fixType === 'Stretch' ? 'fill' : 'cover'
                      }}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
                    />

                    {/* Replace Overlay Button over the image */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/thumb:opacity-100 flex flex-col items-center justify-center text-white transition-all duration-200">
                      <ArrowRightLeft size="0.85vw" strokeWidth={1.8} className="text-white mb-[0.1vw]" />
                      <span className="text-[0.52vw] font-semibold text-white tracking-wide">Replace</span>
                    </div>
                  </div>

                  <div className="flex-1" />

                  {/* Actions: Adjust Image, Edit Text & Delete */}
                  <div className="flex items-center gap-[0.35vw] shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdjustTargetIndex(i);
                        setShowAdjustModal(true);
                      }}
                      className="text-gray-400 hover:text-[#4D47FF] transition-colors p-[0.25vw] rounded-[0.3vw] hover:bg-gray-50"
                      title="Adjust / Crop Image"
                    >
                      <Crop size="0.9vw" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlideIndex(i);
                        setOpenTextIndices(prev => ({
                          ...prev,
                          [slideKey]: !prev[slideKey]
                        }));
                      }}
                      className={`transition-colors p-[0.25vw] rounded-[0.3vw] relative ${
                        isTextOpen 
                          ? 'text-[#4D47FF] bg-[#4D47FF]/10' 
                          : hasText 
                            ? 'text-[#4D47FF] hover:bg-gray-100' 
                            : 'text-gray-400 hover:text-[#4D47FF] hover:bg-gray-50'
                      }`}
                      title={isTextOpen ? "Hide Slide Heading & Subheading" : "Show Slide Heading & Subheading"}
                    >
                      <Type size="0.9vw" />
                      {hasText && !isTextOpen && (
                        <span className="absolute top-[0.1vw] right-[0.1vw] w-[0.25vw] h-[0.25vw] bg-[#4D47FF] rounded-full" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(i);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors p-[0.25vw] rounded-[0.3vw] hover:bg-red-50"
                      title="Delete Image"
                    >
                      <Trash2 size="0.9vw" />
                    </button>
                  </div>
                </div>

                {/* Bottom Section: Heading and Subheading Input Boxes (Shown when T icon is clicked) */}
                {isTextOpen && (
                  <div
                    className="mt-[0.5vw] pt-[0.5vw] border-t border-gray-100 flex flex-col gap-[0.35vw]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-[0.4vw]">
                      <span className="text-[0.68vw] font-semibold text-gray-500 w-[4.5vw] shrink-0">Heading</span>
                      <input
                        type="text"
                        value={img.heading !== undefined ? img.heading : ''}
                        onChange={(e) => updateImageAtIndex(i, 'heading', e.target.value)}
                        placeholder="Enter slide heading..."
                        className="flex-1 h-[1.8vw] rounded-[0.4vw] border border-gray-300 px-[0.5vw] text-[0.72vw] font-medium text-gray-800 outline-none focus:border-[#4D47FF] bg-white shadow-2xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSlideIndex(i);
                          setTextTargetIndex(i);
                          initialSlideBackupRef.current = { ...slideshowImages[i] };
                          setShowSlideTextPopup(true);
                        }}
                        className="text-gray-400 hover:text-[#4D47FF] transition-colors p-[0.2vw]"
                        title="Edit Text & Typography Styling"
                      >
                        <Type size="0.75vw" />
                      </button>
                    </div>
                    <div className="flex items-center gap-[0.4vw]">
                      <span className="text-[0.68vw] font-semibold text-gray-500 w-[4.5vw] shrink-0">Subheading</span>
                      <input
                        type="text"
                        value={img.subtext !== undefined ? img.subtext : ''}
                        onChange={(e) => updateImageAtIndex(i, 'subtext', e.target.value)}
                        placeholder="Enter slide subheading..."
                        className="flex-1 h-[1.8vw] rounded-[0.4vw] border border-gray-300 px-[0.5vw] text-[0.72vw] font-medium text-gray-700 outline-none focus:border-[#4D47FF] bg-white shadow-2xs transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 3. Slideshow Properties Header ── */}
      <div className="flex items-center gap-[0.8vw] pt-[0.2vw]">
        <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap">Slideshow Properties</span>
        <div className="flex-1 h-[1px] bg-gray-200" />
      </div>

      {/* Auto Slide Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[0.82vw] font-medium text-gray-800 whitespace-nowrap">Auto Slide</span>
        <div className="flex-1 border-b border-dashed border-gray-200 mx-[0.75vw]" />
        <ElementToggle
          checked={slideshowSettings.autoSlide ?? slideshowSettings.autoPlay ?? false}
          activeColor="#4D47FF"
          onChange={(checked) => {
            setSlideshowSettings(prev => ({
              ...prev,
              autoSlide: checked,
              autoPlay: checked
            }));
          }}
        />
      </div>

      {/* Auto Slide Duration (shown only if Auto Slide is enabled) */}
      {(slideshowSettings.autoSlide ?? slideshowSettings.autoPlay ?? false) && (
        <div className="flex items-center justify-between">
          <span className="text-[0.82vw] font-medium text-gray-800 whitespace-nowrap">Auto Slide Duration</span>
          <div className="flex-1 border-b border-dashed border-gray-200 mx-[0.75vw]" />
          <div className="w-[6.5vw]">
            <ElementDropdown
              value={`${slideshowSettings.speed || 3} sec`}
              onChange={(val) => {
                const speedVal = Number(String(val).replace(' sec', ''));
                setSlideshowSettings(prev => ({
                  ...prev,
                  speed: speedVal,
                  autoPlay: true,
                  autoSlide: true
                }));
              }}
              options={['1 sec', '2 sec', '3 sec', '4 sec', '5 sec', '8 sec', '10 sec']}
              buttonClassName="!h-[2vw] !text-[0.8vw] !font-medium !border-gray-300 !rounded-[0.4vw]"
            />
          </div>
        </div>
      )}

      {/* Infinity Loop Mode */}
      <div className="flex items-center justify-between">
        <span className="text-[0.82vw] font-medium text-gray-800 whitespace-nowrap">Infinity Loop Mode</span>
        <div className="flex-1 border-b border-dashed border-gray-200 mx-[0.75vw]" />
        <ElementToggle
          checked={slideshowSettings.infiniteLoop ?? true}
          activeColor="#4D47FF"
          onChange={(checked) => updateSetting('infiniteLoop', checked)}
        />
      </div>

      {/* Manual Navigation Button */}
      <div className="space-y-[0.75vw]">
        <div className="flex items-center justify-between">
          <span className="text-[0.82vw] font-medium text-gray-800 whitespace-nowrap">Manual Navigation Button</span>
          <div className="flex-1 border-b border-dashed border-gray-200 mx-[0.75vw]" />
          <ElementToggle
            checked={slideshowSettings.showArrows ?? true}
            activeColor="#4D47FF"
            onChange={(next) => {
              updateSetting('showArrows', next);
              updateSetting('showNav', next);
            }}
          />
        </div>

        {(slideshowSettings.showArrows ?? true) && (
          <div className="flex items-center justify-between gap-[1vw] pt-[0.2vw]">
            {/* Left Column: Size & Color */}
            <div className="flex-1 flex flex-col gap-[0.55vw]">
              <div className="flex items-center justify-between">
                <span className="text-[0.75vw] font-medium text-gray-700">Button Size :</span>
                <span className="text-[0.75vw] px-[0.4vw] py-[0.1vw] bg-gray-100 rounded-[0.3vw] text-gray-700 font-medium">
                  {slideshowSettings.navButtonSize ?? 70}%
                </span>
              </div>
              {/* Range Slider */}
              <div className="flex items-center h-[1.6vw] px-[0.1vw]">
                <input
                  type="range"
                  min={50}
                  max={200}
                  value={slideshowSettings.navButtonSize ?? 70}
                  onChange={(e) => updateSetting('navButtonSize', Number(e.target.value))}
                  className="w-full cursor-pointer custom-range-slider"
                  style={{
                    backgroundImage: `linear-gradient(to right, #4D47FF 0%, #4D47FF ${((((slideshowSettings.navButtonSize ?? 70) - 50) / 150) * 100)}%, #E2E8F0 ${((((slideshowSettings.navButtonSize ?? 70) - 50) / 150) * 100)}%, #E2E8F0 100%)`
                  }}
                />
              </div>
              {/* Color Swatch & HEX box */}
              <div className="flex items-center gap-[0.4vw] mt-[0.1vw]">
                <div
                  className="w-[2vw] h-[2vw] rounded-[0.4vw] cursor-pointer shadow-2xs border border-gray-300 shrink-0 hover:scale-105 transition-transform"
                  style={{ background: slideshowSettings.navIconColor || '#ffffff' }}
                  onClick={() => setShowNavColorPicker(true)}
                  title="Choose Icon Color"
                />
                <div
                  onClick={() => setShowNavColorPicker(true)}
                  className="flex-1 h-[2vw] border border-gray-300 rounded-[0.4vw] px-[0.6vw] flex items-center justify-between bg-white shadow-2xs cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <span className="text-[0.78vw] text-gray-700 font-medium uppercase truncate">
                    {slideshowSettings.navIconColor || '#ffffff'}
                  </span>
                  <span className="text-[0.72vw] text-gray-400 font-medium">100%</span>
                </div>
              </div>
            </div>

            {/* Right Column: Preview Card */}
            <div
              onClick={() => setShowNavStylesPopup(true)}
              className="w-[7.8vw] h-[4.8vw] bg-white border border-gray-300 rounded-[0.55vw] relative flex items-center justify-center cursor-pointer hover:border-[#4D47FF] shadow-2xs shrink-0 group/nav overflow-hidden transition-all"
            >
              <div className="absolute top-[0.35vw] right-[0.4vw] text-gray-400 group-hover/nav:text-[#4D47FF] transition-colors">
                <Icon icon="lucide:arrow-right-left" className="w-[0.85vw] h-[0.85vw]" />
              </div>
              <div
                className="flex items-center justify-center gap-[0.9vw] transition-transform duration-150"
                style={{
                  transform: `scale(${Math.max(0.5, Math.min(1.8, (slideshowSettings.navButtonSize ?? 70) / 100))})`,
                  transformOrigin: 'center'
                }}
              >
                <div className="flex items-center justify-center">
                  {NavIconRenderer({ styleId: slideshowSettings.navStyle || 1, size: '1.4vw', color: slideshowSettings.navIconColor || '#ffffff' }).left}
                </div>
                <div className="flex items-center justify-center">
                  {NavIconRenderer({ styleId: slideshowSettings.navStyle || 1, size: '1.4vw', color: slideshowSettings.navIconColor || '#ffffff' }).right}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      <div className="space-y-[0.75vw]">
        <div className="flex items-center justify-between">
          <span className="text-[0.82vw] font-medium text-gray-800 whitespace-nowrap">Pagination Dots</span>
          <div className="flex-1 border-b border-dashed border-gray-200 mx-[0.75vw]" />
          <ElementToggle
            checked={slideshowSettings.showDots ?? true}
            activeColor="#4D47FF"
            onChange={(checked) => updateSetting('showDots', checked)}
          />
        </div>

        {(slideshowSettings.showDots ?? true) && (
          <div className="flex items-center justify-between gap-[1vw] pt-[0.2vw]">
            {/* Left Column: Size & Color */}
            <div className="flex-1 flex flex-col gap-[0.55vw]">
              <div className="flex items-center justify-between">
                <span className="text-[0.75vw] font-medium text-gray-700">Button Size :</span>
                <span className="text-[0.75vw] px-[0.4vw] py-[0.1vw] bg-gray-100 rounded-[0.3vw] text-gray-700 font-medium">
                  {slideshowSettings.dotButtonSize ?? 70}%
                </span>
              </div>
              {/* Range Slider */}
              <div className="flex items-center h-[1.6vw] px-[0.1vw]">
                <input
                  type="range"
                  min={50}
                  max={200}
                  value={slideshowSettings.dotButtonSize ?? 70}
                  onChange={(e) => updateSetting('dotButtonSize', Number(e.target.value))}
                  className="w-full cursor-pointer custom-range-slider"
                  style={{
                    backgroundImage: `linear-gradient(to right, #4D47FF 0%, #4D47FF ${((((slideshowSettings.dotButtonSize ?? 70) - 50) / 150) * 100)}%, #E2E8F0 ${((((slideshowSettings.dotButtonSize ?? 70) - 50) / 150) * 100)}%, #E2E8F0 100%)`
                  }}
                />
              </div>
              {/* Color Swatch & HEX box */}
              <div className="flex items-center gap-[0.4vw] mt-[0.1vw]">
                <div
                  className="w-[2vw] h-[2vw] rounded-[0.4vw] cursor-pointer shadow-2xs border border-gray-300 shrink-0 hover:scale-105 transition-transform"
                  style={{ background: slideshowSettings.dotColor || '#4D47FF' }}
                  onClick={() => setShowDotColorPicker(true)}
                  title="Choose Dot Color"
                />
                <div
                  onClick={() => setShowDotColorPicker(true)}
                  className="flex-1 h-[2vw] border border-gray-300 rounded-[0.4vw] px-[0.6vw] flex items-center justify-between bg-white shadow-2xs cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <span className="text-[0.78vw] text-gray-700 font-medium uppercase truncate">
                    {slideshowSettings.dotColor || '#4D47FF'}
                  </span>
                  <span className="text-[0.72vw] text-gray-400 font-medium">100%</span>
                </div>
              </div>
            </div>

            {/* Right Column: Preview Card */}
            <div
              onClick={() => setShowDotStylesPopup(true)}
              className="w-[7.8vw] h-[4.8vw] bg-white border border-gray-300 rounded-[0.55vw] relative flex items-center justify-center cursor-pointer hover:border-[#4D47FF] shadow-2xs shrink-0 group/dots overflow-hidden transition-all"
            >
              <div className="absolute top-[0.35vw] right-[0.4vw] text-gray-400 group-hover/dots:text-[#4D47FF] transition-colors">
                <Icon icon="lucide:arrow-right-left" className="w-[0.85vw] h-[0.85vw]" />
              </div>
              <div
                className="flex items-center justify-center transition-transform duration-150"
                style={{
                  transform: `scale(${Math.max(0.5, Math.min(1.8, (slideshowSettings.dotButtonSize ?? 70) / 100))})`,
                  transformOrigin: 'center'
                }}
              >
                <DotRenderer
                  styleId={slideshowSettings.dotStyle || 1}
                  size="0.6vw"
                  color={slideshowSettings.dotColor || '#4D47FF'}
                  activeIndex={0}
                  count={3}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Color & Border (Using Color.jsx matching ImageProperties) ── */}
      <Color
        noAccordion={true}
        selectedElement={selectedElement}
        backgroundColor={backgroundColor}
        setBackgroundColor={handleSetBackgroundColor}
        openSubSection={openSubSection}
        setOpenSubSection={setOpenSubSection}
        showStrokeSettings={showStrokeSettings}
        setShowStrokeSettings={setShowStrokeSettings}
        isStrokeStyleOpen={isStrokeStyleOpen}
        setIsStrokeStyleOpen={setIsStrokeStyleOpen}
        dropdownPos={dropdownPos}
        setDropdownPos={setDropdownPos}
        strokeSettingsPos={strokeSettingsPos}
        setStrokeSettingsPos={setStrokeSettingsPos}
        isDashPosOpen={isDashPosOpen}
        setIsDashPosOpen={setIsDashPosOpen}
        activePopup={activePopup}
        setActivePopup={setActivePopup}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={setActiveColorPicker}
        showDetailedPicker={showDetailedPicker}
        setShowDetailedPicker={setShowDetailedPicker}
        colorsOnPage={colorsOnPage}
      />

      {/* Popups & Pickers */}

      {showDotColorPicker && createPortal(
        <div id="slideshow-color-picker" className="fixed z-[9999]" style={{ top: '160px', right: '10.5vw' }}>
          <div className="relative">
            <div className="fixed inset-0" onClick={() => setShowDotColorPicker(false)} />
            <ColorPicker
              color={slideshowSettings.dotColor || '#000000'}
              onChange={(val) => updateSetting('dotColor', val)}
              opacity={slideshowSettings.dotOpacity ?? 100}
              onOpacityChange={(val) => updateSetting('dotOpacity', val)}
              onClose={() => setShowDotColorPicker(false)}
              className="relative z-[10000]"
              colorsOnPage={colorsOnPage}
            />
          </div>
        </div>,
        document.body
      )}

      {showNavColorPicker && createPortal(
        <div id="slideshow-nav-color-picker" className="fixed z-[9999]" style={{ top: '160px', right: '10.5vw' }}>
          <div className="relative">
            <div className="fixed inset-0" onClick={() => setShowNavColorPicker(false)} />
            <ColorPicker
              color={slideshowSettings.navIconColor || '#000000'}
              onChange={(val) => updateSetting('navIconColor', val)}
              opacity={slideshowSettings.navIconOpacity ?? 100}
              onOpacityChange={(val) => updateSetting('navIconOpacity', val)}
              onClose={() => setShowNavColorPicker(false)}
              className="relative z-[10000]"
              colorsOnPage={colorsOnPage}
            />
          </div>
        </div>,
        document.body
      )}

      {showNavStylesPopup && createPortal(
        <div className="fixed inset-0 z-[10000]" onClick={() => setShowNavStylesPopup(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <NavIconStylesPopup
              isOpen={true}
              onClose={() => setShowNavStylesPopup(false)}
              onSelect={(styleId) => {
                updateSetting('navStyle', styleId);
                setShowNavStylesPopup(false);
              }}
              currentStyle={slideshowSettings.navStyle}
              color={slideshowSettings.navIconColor}
              positionStyle={{ top: '50%', right: '15vw', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>,
        document.body
      )}

      {showDotStylesPopup && createPortal(
        <div className="fixed inset-0 z-[10000]" onClick={() => setShowDotStylesPopup(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <DotStylesPopup
              isOpen={true}
              onClose={() => setShowDotStylesPopup(false)}
              onSelect={(styleId) => {
                updateSetting('dotStyle', styleId);
                setShowDotStylesPopup(false);
              }}
              currentStyle={slideshowSettings.dotStyle}
              positionStyle={{ top: '50%', right: '15vw', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>,
        document.body
      )}


      {/* Media Modal for Gallery and Replace */}
      <ReplaceMediaModal
        show={showGallery || showReplaceModal}
        mediaType="image"
        onClose={() => {
          setShowGallery(false);
          setShowReplaceModal(false);
          setReplaceTargetIndex(null);
        }}
        onReplace={(file) => {
          if (showReplaceModal) {
            handleModalReplace(file);
          } else {
            handleGallerySelect(file);
          }
        }}
      />

      {/* Image Adjust / Crop Modal (Strictly for Image Adjustment) */}
      {showAdjustModal && adjustTargetIndex !== null && slideshowImages[adjustTargetIndex] && (
        <ImageAdjustModal
          isOpen={showAdjustModal}
          onClose={() => {
            setShowAdjustModal(false);
            setAdjustTargetIndex(null);
          }}
          imageSrc={slideshowImages[adjustTargetIndex]?.originalUrl || slideshowImages[adjustTargetIndex]?.url}
          initialFixType={slideshowImages[adjustTargetIndex]?.fixType || slideshowSettings.imageFitType || 'Fit'}
          initialOpacity={slideshowImages[adjustTargetIndex]?.opacity !== undefined ? slideshowImages[adjustTargetIndex]?.opacity : 100}
          initialFilters={slideshowImages[adjustTargetIndex]?.filters || null}
          initialCrop={slideshowImages[adjustTargetIndex]?.cropData || null}
          frameAspectRatio={130 / 140}
          onSave={handleSaveAdjustedImage}
        />
      )}

      {/* Slide Text & Typography Popup */}
      {showSlideTextPopup && textTargetIndex !== null && slideshowImages[textTargetIndex] && (
        <SlideTextPopup
          isOpen={showSlideTextPopup}
          onClose={() => {
            setShowSlideTextPopup(false);
            setTextTargetIndex(null);
          }}
          initialHeading={slideshowImages[textTargetIndex]?.heading || ''}
          initialSubtext={slideshowImages[textTargetIndex]?.subtext || ''}
          initialFontFamily={slideshowImages[textTargetIndex]?.fontFamily || 'Arial'}
          initialFontSize={slideshowImages[textTargetIndex]?.fontSize || 14}
          initialTextColor={slideshowImages[textTargetIndex]?.textColor || '#ffffff'}
          initialFontWeight={slideshowImages[textTargetIndex]?.fontWeight || 'bold'}
          initialFontStyle={slideshowImages[textTargetIndex]?.fontStyle || 'normal'}
          initialTextAlign={slideshowImages[textTargetIndex]?.textAlign || 'center'}
          initialTextDecoration={slideshowImages[textTargetIndex]?.textDecoration || 'none'}
          initialTextShadow={slideshowImages[textTargetIndex]?.textShadow || 'medium'}
          onChange={handleLiveSlideTextChange}
          onCancel={handleCancelSlideText}
          onSave={handleSaveSlideText}
          positionStyle={{ top: '70%', right: '15vw', transform: 'translateY(-50%)' }}
        />
      )}
    </div>
  );
};

export { SlideshowEditor };

export default function ElementSlideshowProperties({
  selectedElement,
  selectedElementProps,
  updateElementAttribute,
  activePageIndex,
  selectedLayerId,
  effectiveFolder,
  folderName: propFolderName,
  effectiveBook,
  flipbookName: propFlipbookName,
  effectiveVId,
  flipbookVId: propFlipbookVId,
  currentPageVId,
  onDeleteLayer,
  isOpen = true,
  onToggle,
  opacity: directOpacity,
  onUpdateOpacity: directOnUpdateOpacity,
  onUpdate: directOnUpdate,
  setPreviewSrc,
  setIsUpdatingDOM,
  onDisableSlideshow,
  ...restProps
}) {
  const getSelectedElement = () => {
    if (selectedElement && typeof selectedElement.getAttribute === 'function') {
      return selectedElement.closest?.('[data-is-slideshow="true"], [data-type="slideshow"], g[id^="slideshow-"]') || selectedElement;
    }
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const base = selectedLayerId ? editorDoc.getElementById(selectedLayerId) : null;
    return base?.closest?.('[data-is-slideshow="true"], [data-type="slideshow"], g[id^="slideshow-"]') || base || selectedElement;
  };

  const el = getSelectedElement();

  const handleUpdate = (newHtml) => {
    if (directOnUpdate) {
      directOnUpdate(newHtml);
      return;
    }
    window.__skipCanvasUpdateForPage = activePageIndex;
    if (typeof newHtml === 'string') {
      if (updateElementAttribute && selectedLayerId) {
        updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', newHtml);
      }
    } else {
      const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const targetNode = el || (selectedLayerId ? editorDoc.getElementById(selectedLayerId) : null);
      if (!targetNode) return;
      const svgRoot = targetNode.ownerSVGElement || targetNode.closest?.('svg') || editorDoc.querySelector('svg');
      if (svgRoot && updateElementAttribute && selectedLayerId) {
        const cloneSvg = svgRoot.cloneNode(true);
        cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary, #ghost-layer, .selection-overlay-layer').forEach(e => e.remove());
        const serializer = new XMLSerializer();
        const html = serializer.serializeToString(cloneSvg);
        updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
      }
    }
  };

  const currentOpacity = directOpacity !== undefined
    ? directOpacity
    : (selectedElementProps?.opacity !== undefined ? Math.round(parseFloat(selectedElementProps.opacity) * 100) : 100);

  const handleUpdateOpacity = (newOpacity) => {
    if (directOnUpdateOpacity) {
      directOnUpdateOpacity(newOpacity);
    } else if (updateElementAttribute && selectedLayerId) {
      updateElementAttribute(activePageIndex, selectedLayerId, 'opacity', (newOpacity / 100).toString());
    }
  };

  return (
    <div className="w-full">
      <SlideshowEditor
        selectedElement={el}
        activePageIndex={activePageIndex}
        currentPageVId={currentPageVId || selectedElementProps?.pageVId || ''}
        onUpdate={handleUpdate}
        isOpen={isOpen}
        onToggle={onToggle}
        flipbookName={propFlipbookName || effectiveBook}
        flipbookVId={propFlipbookVId || effectiveVId}
        folderName={propFolderName || effectiveFolder}
        opacity={currentOpacity}
        onUpdateOpacity={handleUpdateOpacity}
        setPreviewSrc={setPreviewSrc}
        setIsUpdatingDOM={setIsUpdatingDOM}
        onDisableSlideshow={onDisableSlideshow}
        onDeleteLayer={onDeleteLayer}
        {...restProps}
      />
    </div>
  );
}
