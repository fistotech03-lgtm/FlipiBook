import { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import usePreventBrowserZoom from './hooks/usePreventBrowserZoom';

import paper from 'paper';
import {
  makeNode,
  makePath,
  loadDIntoVectraSession,
  usePenNodeEngine
} from './penTool';

import { CropController } from './properties/controls/Crop';


import CanvasRuler from './toolbar/CanvasRuler';
import GuidesOverlay from './toolbar/GuidesOverlay';
import TopToolbar from './toolbar/TopToolbar';
import {
  getVisualBBox,
  getCanvasBounds,
  clearOverlayType
} from './mainEditor/utils/geometryUtils';
import { isElementHidden, purgeElementOverlays } from './mainEditor/selectionOverlays/overlayDomUtils';
import { useSlideshowManager } from './LeftActionMenu/Elements/hooks/useSlideshowManager';
import { useVideoControls } from './mainEditor/hooks/useVideoControls';
import { useSelectionOverlays } from './mainEditor/hooks/useSelectionOverlays';
import { useInteractEngine } from './mainEditor/hooks/useInteractEngine';
import { convertTextToForeignObject } from './mainEditor/utils/textConversionUtils';
// Encapsulated in useCanvasPointerEvents
import { useCanvasZoomPan, computePanBounds } from './mainEditor/hooks/useCanvasZoomPan';
import { alignSelectedElements } from './mainEditor/utils/alignmentUtils';
import { useCanvasTransforms } from './mainEditor/hooks/useCanvasTransforms';
import { useCanvasAssetInsertion } from './mainEditor/hooks/useCanvasAssetInsertion';
import { useCanvasKeyboardShortcuts } from './mainEditor/hooks/useCanvasKeyboardShortcuts';
import { useCanvasDOMOverlays } from './mainEditor/hooks/useCanvasDOMOverlays';
import { useCanvasContextMenuAndBadges } from './mainEditor/hooks/useCanvasContextMenuAndBadges';
import { useCanvasPointerEvents } from './mainEditor/hooks/useCanvasPointerEvents';
import { CanvasViewport } from './mainEditor/components/CanvasViewport';
import { FloatingToolbars } from './mainEditor/components/FloatingToolbars';
import { executeInlineTranslation } from './utils/inlineTranslationHelper';
import {
  LeftActionMenu,
  AddElementsModal,
  ImagesModal,
  IconsModal
} from './LeftActionMenu';
import { getTopLevelFrames, hitTest as hitTestExt, isPageRootElement } from './mainEditor/utils/frameHierarchyUtils';
import { parseLayersFromSVG, sanitizeSvgXml } from './utils/editorUtils';
import { DEFAULT_FRAME_IMAGE } from './LeftActionMenu/Elements/utils/imageFramingUtils';
import { PageNavigationControls } from './mainEditor/components/PageNavigationControls';
import { applyTrimViewToSvg, cleanTrimViewFromHtml, isElementCompletelyOutside } from './mainEditor/utils/trimViewUtils';
import { drawShapeImageAdjustOverlay } from './penTool/penOverlayEngine';
import { normalizeForeignObjectNamespaces } from './LeftActionMenu/Elements/utils/tableElementUtils';
import { SHAPE_CURSOR, PENCIL_CURSOR, PEN_CURSOR, TYPE_CURSOR } from './mainEditor/utils/constants';

// Re-export geometry utilities for backward compatibility with external components


const MainEditor = ({
  isPdfProject,
  isRulerEnabled = true,
  isTrimView = false,
  pages = [],
  activePageIndex,
  setActivePageIndex,
  clearPage,
  deletePage,
  onOpenTemplateModal,
  selectedLayerId,
  setSelectedLayerId,
  updatePageHtml,
  multiSelectedIds = new Set(),
  setMultiSelectedIds,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  currentFrameId,
  setCurrentFrameId,
  activeMainTool,
  setActiveMainTool,
  activeTopTool,
  setActiveTopTool,
  updateElementAttribute,
  flipbookDimensions = null,
  isPopupEditor = false,
  v_id,
  flipbookVId,
  folderName,
  flipbookName
}) => {
  usePreventBrowserZoom();const { width: baseWidth, height: baseHeight } = flipbookDimensions || { width: 210, height: 297 };
  const canvasAspectRatio = baseWidth && baseHeight ? `${baseWidth} / ${baseHeight}` : '210 / 297';

  const [showSelectOptions, setShowSelectOptions] = useState(false);
  const [showPenOptions, setShowPenOptions] = useState(false);
  const [showShapesOptions, setShowShapesOptions] = useState(false);
  const [localTrimView, setLocalTrimView] = useState(isTrimView);
  const [localRulerEnabled, setLocalRulerEnabled] = useState(isRulerEnabled);

  useEffect(() => {
    setLocalTrimView(isTrimView);
  }, [isTrimView]);

  useEffect(() => {
    setLocalRulerEnabled(isRulerEnabled);
  }, [isRulerEnabled]);

  useEffect(() => {
    const handleToggleTrim = (e) => {
      if (e.detail !== undefined) {
        setLocalTrimView(e.detail);
      } else {
        setLocalTrimView(prev => !prev);
      }
    };
    window.addEventListener('editor_toggleTrimView', handleToggleTrim);
    return () => window.removeEventListener('editor_toggleTrimView', handleToggleTrim);
  }, []);

  useEffect(() => {
    const handleToggleRuler = (e) => {
      if (e.detail !== undefined) {
        const val = typeof e.detail === 'object' && e.detail !== null
          ? (e.detail.isRulerEnabled !== undefined ? e.detail.isRulerEnabled : e.detail)
          : e.detail;
        setLocalRulerEnabled(Boolean(val));
      } else {
        setLocalRulerEnabled(prev => !prev);
      }
    };
    window.addEventListener('editor_toggleRuler', handleToggleRuler);
    return () => window.removeEventListener('editor_toggleRuler', handleToggleRuler);
  }, []);

  // Robustly ensure multi-selection dotted outlines are removed when selection is no longer multiple
  useEffect(() => {
    if (multiSelectedIds && multiSelectedIds.size <= 1) {
      document.querySelectorAll('.overlay-type-multi-child-selected').forEach(el => el.remove());
    }
  }, [multiSelectedIds]);
  // isEditingText is now managed via isEditingTextRef to prevent React re-renders from destroying the edit box

  const [selectedSelectTool, setSelectedSelectTool] = useState('select'); // 'select' or 'direct'
  const [selectedPenTool, setSelectedPenTool] = useState('pen'); // 'pen', 'curve', 'pencil'
  const [showHotspotPopup, setShowHotspotPopup] = useState(false);
  const [selectedShapeTool, setSelectedShapeTool] = useState('rectangle'); // 'rectangle', 'circle', 'polygon', 'line', 'star'
  const [zoom, setZoom] = useState(90);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // Track which page's menu is open
  const [isElementsModalOpen, setIsElementsModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [isIconsModalOpen, setIsIconsModalOpen] = useState(false);


  const isConvertedFlipbook = Boolean(isPdfProject || (pages && pages.some(p => p.html && (p.html.includes('PDF Background') || p.html.includes('pdf-vector-layer') || p.html.includes('Document Shield')))));
  const isPdfMode = Boolean(isPdfProject || isConvertedFlipbook);

  // Converted PDF / DOC / PPT books: Ruler and Trim View don't apply — keep them off (saved prefs untouched)
  useEffect(() => {
    if (!isConvertedFlipbook) return;
    if (localTrimView) setLocalTrimView(false);
    if (localRulerEnabled) setLocalRulerEnabled(false);
  }, [isConvertedFlipbook, localTrimView, localRulerEnabled]);

  const pdfDefaultsSetRef = useRef(false);
  useEffect(() => {
    if (isConvertedFlipbook) {
      setIsElementsModalOpen(false);
      setIsImagesModalOpen(false);
      setIsIconsModalOpen(false);
      if (!pdfDefaultsSetRef.current) {
        if (setActiveTopTool) setActiveTopTool('interaction');
        if (multiSelectedIds && multiSelectedIds.size > 0 && setMultiSelectedIds) {
          setMultiSelectedIds(new Set());
        }
        document.querySelectorAll('.overlay-type-multi-child-selected').forEach(el => el.remove());
        const boundsPoly = document.getElementById('overlay-poly-selected-multi-selection-bounds');
        if (boundsPoly) boundsPoly.remove();
        pdfDefaultsSetRef.current = true;
      }
      if (marqueeOverlayRef1.current) {
        marqueeOverlayRef1.current.style.display = 'none';
        const rect = marqueeOverlayRef1.current.querySelector?.('rect');
        if (rect) {
          rect.setAttribute('x', '0');
          rect.setAttribute('y', '0');
          rect.setAttribute('width', '0');
          rect.setAttribute('height', '0');
        }
      }
      if (marqueeOverlayRef2.current) marqueeOverlayRef2.current.style.display = 'none';
      { const sb = document.getElementById('marquee-screen-box'); if (sb) sb.style.display = 'none'; }
    }
  }, [isConvertedFlipbook, setActiveTopTool]);

  // ── Refs ─────────────────────────────────────────────────────────────
  const isCtrlPressedRef = useRef(false);
  const currentFrameIdRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeOverlayRef1 = useRef(null);
  const marqueeOverlayRef2 = useRef(null);
  const marqueeCandidatesRef = useRef([]);
  const marqueeDataRef = useRef(null);
  const multiSelectedIdsRef = useRef(new Set());
  const selectedLayerIdRef = useRef(null);
  const dragStateRef = useRef(null);
  const suppressClickRef = useRef(false);
  const lastWheelTimeRef = useRef(0);       // ← tracks last Ctrl+scroll time to suppress spurious clicks
  const wasRecentlyPanningRef = useRef(false); // ← tracks recent Space pan to suppress spurious clicks
  const isAltPressedRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0, target: null });
  const drawMeasurementOverlayRef = useRef(null);
  const activeMainToolRef = useRef(activeMainTool);
  const activeTopToolRef = useRef(activeTopTool);
  const selectedSelectToolRef = useRef(selectedSelectTool);
  const isSpaceDownRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });
  const currentPanRef = useRef({ x: 0, y: 0 });
  const currentZoomRef = useRef(90);
  const wheelRafRef = useRef(null);
  const zoomContainerRef = useRef(null);
  const selectedPenToolRef = useRef(selectedPenTool);
  const drawingShapeRef = useRef(null);
  const shapeStartPointRef = useRef(null);
  const skipClearSelectionRef = useRef(false);
  const lastClickRef = useRef({ time: 0, target: null });
  const updatePageHtmlRef = useRef(updatePageHtml);
  const editorContainerRef = useRef(null);

  // Mouse-wheel scrolling for "Scrollable text" boxes. Text boxes don't receive pointer events
  // on the canvas in select mode, so route the wheel to the box under the cursor ourselves.
  useEffect(() => {
    const el = editorContainerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return; // zoom gestures
      const fos = el.querySelectorAll('.page-svg-container foreignObject[data-scrollable="true"]');
      for (const fo of fos) {
        const r = fo.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) continue;
        const inner = fo.querySelector('.flipbook-text-scrollbar') || fo.firstElementChild;
        if (!inner || inner.scrollHeight <= inner.clientHeight) return;
        const atTop = inner.scrollTop <= 0 && e.deltaY < 0;
        const atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1 && e.deltaY > 0;
        if (atTop || atBottom) return;
        e.preventDefault();
        e.stopPropagation();
        inner.scrollTop += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        return;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);
  const isEditingTextRef = useRef(false);
  const drawOverlayHighlightRef = useRef(null); // Stable ref, populated after useSelectionOverlays
  const nodeEditModeRef = useRef(false);    // Stable early ref, also returned by usePenNodeEngine
  const clearMeasurementOverlayRef = useRef(null); // Stable ref, populated after useSelectionOverlays




  useEffect(() => {
    activeTopToolRef.current = activeTopTool;
    if (activeTopTool === 'interaction' || activeTopTool === 'animation') {
      setIsElementsModalOpen(false);
      setIsImagesModalOpen(false);
      setIsIconsModalOpen(false);
      if (marqueeOverlayRef1.current) {
        marqueeOverlayRef1.current.style.display = 'none';
        const rect = marqueeOverlayRef1.current.querySelector?.('rect');
        if (rect) {
          rect.setAttribute('x', '0');
          rect.setAttribute('y', '0');
          rect.setAttribute('width', '0');
          rect.setAttribute('height', '0');
        }
      }
      if (marqueeOverlayRef2.current) marqueeOverlayRef2.current.style.display = 'none';
      { const sb = document.getElementById('marquee-screen-box'); if (sb) sb.style.display = 'none'; }
      if (marqueeDataRef.current) marqueeDataRef.current = null;
      marqueeRef.current = null;
      setMarquee(null);
      if (multiSelectedIds && multiSelectedIds.size > 1 && setMultiSelectedIds) {
        setMultiSelectedIds(new Set(selectedLayerId ? [selectedLayerId] : []));
      }
      document.querySelectorAll('.overlay-type-multi-child-selected').forEach(el => el.remove());
      const boundsPoly = document.getElementById('overlay-poly-selected-multi-selection-bounds');
      if (boundsPoly) boundsPoly.remove();
    } else {
      // In non-interaction mode: deselect any Free Frame or Hotspot immediately
      if (selectedLayerId) {
        const selEl = document.getElementById(selectedLayerId);
        const isFreeFrameOrHotspot = selEl ? (
          selEl.getAttribute('data-name') === 'Free Frame' ||
          selEl.getAttribute('data-type') === 'free-frame' ||
          (selEl.id && selEl.id.startsWith('free-frame')) ||
          selEl.getAttribute('data-is-hotspot') === 'true' ||
          selEl.getAttribute('data-type') === 'hotspot' ||
          (selEl.id && selEl.id.startsWith('hotspot-'))
        ) : (selectedLayerId.startsWith('free-frame') || selectedLayerId.startsWith('hotspot-'));
        if (isFreeFrameOrHotspot) {
          if (setSelectedLayerId) setSelectedLayerId(null);
          selectedLayerIdRef.current = null;
          if (setMultiSelectedIds) setMultiSelectedIds(new Set());
          multiSelectedIdsRef.current = new Set();
          document.querySelectorAll('.selection-overlay-layer polygon, .selection-overlay-layer g, .selection-overlay-layer circle').forEach(el => el.remove());
        }
      }
    }
  }, [activeTopTool, selectedLayerId, multiSelectedIds, setMultiSelectedIds]);

  useEffect(() => {
    paperScopeRef.current = new paper.PaperScope();
    paperScopeRef.current.setup(document.createElement('canvas'));

    const handleKeyDown = (e) => {
      // 1. Skip shortcuts if user is typing
      if (document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA' ||
        isEditingTextRef.current ||
        document.activeElement.isContentEditable) return;

      const key = e.key.toLowerCase();

      // ── Restrict shortcuts in non-editor modes ─────────────────
      if (activeTopTool !== 'editor') {
        const isSelectionKey = key === 'v' || key === 'a' || key === ' ';
        if (!isSelectionKey) return;
      }

      // ── Spacebar Pan ─────────────
      if (key === ' ' && !isSpaceDownRef.current) {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || isEditingTextRef.current || document.activeElement.isContentEditable) return;
        e.preventDefault();
        // Blur any focused interactive element (buttons, etc.) so Space doesn't
        // re-trigger their click action on keyup.
        const active = document.activeElement;
        if (active && active !== document.body && typeof active.blur === 'function') {
          active.blur();
        }
        isSpaceDownRef.current = true;
        setIsSpaceDown(true);
      }

      // ── Tool Shortcuts ─────────────
      // V for selection
      if (key === 'v' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setActiveMainTool('select');
        setSelectedSelectTool('select');
        closeAllDropdowns();
      }

      // A for direct tool
      if (key === 'a' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setActiveMainTool('select');
        setSelectedSelectTool('direct');
        closeAllDropdowns();
      }

      // P or Shift+P for pen tool
      if (key === 'p' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setActiveMainTool('pen');
        if (e.shiftKey) {
          setSelectedPenTool('pencil');
        } else {
          setSelectedPenTool('pen');
        }
        closeAllDropdowns();
      }

      // ── Ctrl detection ──
      if (e.key === 'Control' && !isCtrlPressedRef.current) {
        isCtrlPressedRef.current = true;
      }

      if (e.key === 'Alt') {
        e.preventDefault();
        if (!isAltPressedRef.current) {
          isAltPressedRef.current = true;
          document.querySelectorAll('.overlay-type-hover, .overlay-type-child-hover').forEach(el => el.remove());
          if (lastMousePosRef.current && drawMeasurementOverlayRef.current) {
            let currentTarget = lastMousePosRef.current.target;
            // If the SVG re-rendered, the old target might be detached from the DOM.
            // Get the fresh element currently at the mouse coordinates.
            if (currentTarget && !document.contains(currentTarget)) {
              currentTarget = document.elementFromPoint(lastMousePosRef.current.x, lastMousePosRef.current.y) || currentTarget;
              lastMousePosRef.current.target = currentTarget;
            }
            drawMeasurementOverlayRef.current(currentTarget);
          }
        }
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === ' ') {
        isSpaceDownRef.current = false;
        setIsSpaceDown(false);
        isPanningRef.current = false;
      }
      if (e.key === 'Control') {
        isCtrlPressedRef.current = false;
      }
      if (e.key === 'Alt') {
        e.preventDefault();
        isAltPressedRef.current = false;
        document.querySelectorAll('.measurement-overlay-group').forEach(el => el.remove());
      }
    };

    const handleWindowBlur = () => {
      isAltPressedRef.current = false;
      document.querySelectorAll('.measurement-overlay-group').forEach(el => el.remove());
    };

    // Use capture phase so our Space handler fires BEFORE the focused button's
    // native Space-activates-button handler — ensuring preventDefault() works.
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    // Cleanup to prevent leaks
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [activeTopTool]);

  const saveModifiedPageHtml = (targetPageIndex, targetSvg, explicitLayers = null) => {
    if (!updatePageHtmlRef.current) return;
    window.__skipCanvasUpdateForPage = targetPageIndex;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = targetSvg.outerHTML;
    tempDiv.querySelectorAll('.slideshow-transition-clone').forEach(el => el.remove());
    tempDiv.querySelectorAll('.custom-video-overlay').forEach(el => el.remove());
    cleanTrimViewFromHtml(tempDiv);
    tempDiv.querySelectorAll('.video-damage-rect, [class*="damage-rect"], [id="multi-selection-bounds"], [data-is-dummy="true"], rect[fill="rgba(0,0,0,0.001)"]').forEach(el => el.remove());
    try {
      targetSvg.querySelectorAll('.video-damage-rect, [class*="damage-rect"], [id="multi-selection-bounds"], [data-is-dummy="true"], rect[fill="rgba(0,0,0,0.001)"]').forEach(el => el.remove());
    } catch (e) {}
    // Ensure all style attributes use single quotes rather than double quotes inside attribute values
    tempDiv.querySelectorAll('[style]').forEach(el => {
      const st = el.getAttribute('style');
      if (st && st.includes('"')) {
        el.setAttribute('style', st.replace(/"/g, "'"));
      }
    });

    // Auto-heal any image frame where pattern IDs were lost
    const healImageFrames = (root) => {
      if (!root) return;
      const frames = root.querySelectorAll('[data-type="image-frame"], [data-is-image-frame="true"], g[id^="image-frame-"]');
      frames.forEach((frame) => {
        const shapes = frame.querySelectorAll('[fill*="url(#"]');
        const patterns = Array.from(frame.querySelectorAll('pattern'));
        if (patterns.length > 0) {
          shapes.forEach((shape, idx) => {
            const fill = shape.getAttribute('fill') || '';
            const match = fill.match(/url\(#([^)]+)\)/);
            if (match && match[1]) {
              const patId = match[1];
              if (!frame.querySelector(`pattern[id="${patId}"]`)) {
                const unassigned = patterns.find((p) => !p.id) || patterns[idx];
                if (unassigned) {
                  unassigned.setAttribute('id', patId);
                }
              }
            }
          });
        }
      });
    };
    healImageFrames(tempDiv);
    healImageFrames(targetSvg);

    let finalHtml = tempDiv.innerHTML;
    // Auto-heal any broken unescaped span style attributes
    finalHtml = finalHtml.replace(/<span([^>]*?)style="([^"]*?font-family:\s*)"\s*([^>]*?)>([\s\S]*?)<\/span>/gi, (match, beforeStyle, prefix, brokenAttrs, inner) => {
      let fontName = 'Playfair Display';
      if (/playfair/i.test(brokenAttrs)) fontName = 'Playfair Display';
      else if (/inter/i.test(brokenAttrs)) fontName = 'Inter';
      else if (/roboto/i.test(brokenAttrs)) fontName = 'Roboto';
      else if (/poppins/i.test(brokenAttrs)) fontName = 'Poppins';
      else if (/satisfy/i.test(brokenAttrs)) fontName = 'Satisfy';
      else if (/bangers/i.test(brokenAttrs)) fontName = 'Bangers';
      else if (/oswald/i.test(brokenAttrs)) fontName = 'Oswald';
      const cleanStyle = `${prefix}'${fontName}', sans-serif`.replace(/"/g, "'");
      return `<span${beforeStyle}style="${cleanStyle}">${inner}</span>`;
    });
    finalHtml = finalHtml.replace(/\s+[a-zA-Z0-9_\-\:]*[",:][a-zA-Z0-9_\-\:]*=""/gi, '');
    finalHtml = finalHtml.replace(/\s+[a-zA-Z0-9_\-\:]*;=""/gi, '');
    finalHtml = finalHtml.replace(/\s+(?:playfair|roboto|poppins|inter|bangers|oswald|sans-serif)=""/gi, '');
    finalHtml = finalHtml
      .replace(/<\s*br[^>]*>(?:<\/\s*br\s*>)?/gi, '<br/>')
      .replace(/<\/\s*br\s*>/gi, '');
    finalHtml = sanitizeSvgXml(finalHtml);

    // Auto-purge legacy heavy 57KB JPEG frame placeholders to save disk space and memory
    if (finalHtml.includes('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD')) {
      finalHtml = finalHtml.replace(/data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAASABIAAD[A-Za-z0-9+/=]+/g, DEFAULT_FRAME_IMAGE);
    }

    // Normalize any foreignObject so XHTML namespace is explicitly preserved
    finalHtml = normalizeForeignObjectNamespaces(finalHtml);

    const resolvedLayers = explicitLayers || (targetSvg && typeof parseLayersFromSVG === 'function' ? parseLayersFromSVG(targetSvg) : null);

    if (updatePageHtmlRef.current) {
      updatePageHtmlRef.current(targetPageIndex, finalHtml, resolvedLayers);
    } else if (typeof updatePageHtml === 'function') {
      updatePageHtml(targetPageIndex, finalHtml, resolvedLayers);
    }
  };

  // ── Modular Hook Calls: Slideshow & Custom Video Controls ──
  useSlideshowManager();
  useVideoControls({ setSelectedLayerId, selectedLayerId, activePageIndex, updateElementAttribute });


  // ── Modular Hook Call: Canvas DOM Overlays & Visual Observers ──
  useCanvasDOMOverlays({ activePageIndex });

  // ── Modular Hook Call: External Asset & Media Insertion Engine ──
  useCanvasAssetInsertion({
    pages,
    activePageIndex,
    baseWidth,
    baseHeight,
    updatePageHtml,
    saveModifiedPageHtml,
    setSelectedLayerId,
    setMultiSelectedIds,
    setActiveMainTool,
    setActiveTopTool,
    drawOverlayHighlight: (...args) => drawOverlayHighlightRef.current?.(...args),
    currentFrameIdRef,
    setCurrentFrameId,
    selectedLayerIdRef,
    multiSelectedIdsRef,
    v_id,
    flipbookVId,
    folderName,
    flipbookName
  });

  // ── Marquee Selection State ───────────────────────────────────────────────
  const [marquee, setMarquee] = useState(null); // { pageIndex }

  useEffect(() => { marqueeRef.current = marquee; }, [marquee]);

  const handleRotateRef = useRef(null);

  // ── Modular Hook Call: Figma-Style Selection Overlays & Highlighting ──
  const {
    syncMultiSelectionBox,
    drawMultiSelectionHighlight,
    drawOverlayHighlight,
    clearMeasurementOverlay
  } = useSelectionOverlays({
    zoom,
    activePageIndex,
    baseWidth,
    baseHeight,
    isAltPressedRef,
    nodeEditModeRef,
    activeTopToolRef,
    isEditingTextRef,
    selectedLayerIdRef,
    multiSelectedIdsRef,
    drawMeasurementOverlayRef,
    setActiveTopTool,
    updateElementAttribute,
    handleRotateRef
  });

  // Populate stable refs so hooks initialized before useSelectionOverlays can call them via wrappers
  drawOverlayHighlightRef.current = drawOverlayHighlight;
  clearMeasurementOverlayRef.current = clearMeasurementOverlay;

  // ── Modular Hook Call: Canvas Element Transformations (Rotate & Flip) ──
  const {
    rotation,
    handleRotate,
    handleFlip
  } = useCanvasTransforms({
    selectedLayerId,
    multiSelectedIds,
    activePageIndex,
    currentFrameId,
    updatePageHtml,
    drawOverlayHighlight,
    drawMultiSelectionHighlight
  });

  handleRotateRef.current = handleRotate;

  useEffect(() => {
    window.editorRotate = handleRotate;
    window.editorFlip = handleFlip;

    const onEditorRotate = (e) => {
      if (handleRotate && e.detail) {
        handleRotate(e.detail.angle, e.detail.isFinal !== false);
      }
    };
    const onEditorFlip = (e) => {
      if (handleFlip && e.detail) {
        handleFlip(e.detail.direction);
      }
    };
    window.addEventListener('editor-rotate', onEditorRotate);
    window.addEventListener('editor-flip', onEditorFlip);

    return () => {
      window.removeEventListener('editor-rotate', onEditorRotate);
      window.removeEventListener('editor-flip', onEditorFlip);
    };
  }, [handleRotate, handleFlip]);

  // Sync workspace canvas color state & opacity
  const [canvaColor, setCanvaColor] = useState(() => {
    return localStorage.getItem('editor_canva_color') || '#E6E7E7';
  });
  const [canvaOpacity, setCanvaOpacity] = useState(() => {
    const saved = localStorage.getItem('editor_canva_opacity');
    return saved !== null ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    const onCanvaColorChange = (e) => {
      if (e.detail?.color) {
        setCanvaColor(e.detail.color);
      }
      if (e.detail?.opacity !== undefined) {
        setCanvaOpacity(e.detail.opacity);
      }
    };
    window.addEventListener('editor-canva-color-changed', onCanvaColorChange);
    return () => window.removeEventListener('editor-canva-color-changed', onCanvaColorChange);
  }, []);

  // ── Inline Text Translation Event Listener ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__selectedLayerId = selectedLayerId;
      window.__multiSelectedIds = multiSelectedIds ? Array.from(multiSelectedIds) : [];
    }
  }, [selectedLayerId, multiSelectedIds]);

  useEffect(() => {
    const handleTriggerInlineTranslate = async (e) => {
      if (isPdfMode) return;
      const { targetLang = 'tam_Taml', layerId = null, layerIds = null } = e?.detail || {};
      const activeIds = Array.isArray(layerIds) && layerIds.length > 0
        ? layerIds
        : (multiSelectedIds && multiSelectedIds.size > 1
          ? Array.from(multiSelectedIds)
          : (layerId || selectedLayerId ? [layerId || selectedLayerId] : []));
      await executeInlineTranslation({
        targetLang,
        layerId: layerId || selectedLayerId,
        layerIds: activeIds,
        activePageIndex,
        saveModifiedPageHtml,
        onComplete: (translatedText) => {
          console.log('[MainEditor] Text translated successfully:', translatedText?.slice(0, 30));
        },
        onError: (err) => {
          console.warn('[MainEditor] Text translation warning:', err);
        }
      });
    };
    window.addEventListener('trigger-inline-translate', handleTriggerInlineTranslate);
    return () => window.removeEventListener('trigger-inline-translate', handleTriggerInlineTranslate);
  }, [isPdfMode, activePageIndex, selectedLayerId, multiSelectedIds, saveModifiedPageHtml]);

  const computedCanvaBackground = useMemo(() => {
    if (isPopupEditor) return 'transparent';
    if (!canvaColor) return '#E6E7E7';
    if (canvaColor.includes('gradient')) {
      return canvaColor;
    }
    if (canvaColor.startsWith('#')) {
      let hex = canvaColor.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${canvaOpacity})`;
    }
    return canvaColor;
  }, [canvaColor, canvaOpacity, isPopupEditor]);


  // ── Modular Hook Call: Canvas Context Menu & Interaction Badges ──
  const { handleSvgContextMenu } = useCanvasContextMenuAndBadges({
    activeTopTool,
    isConvertedFlipbook,
    currentFrameIdRef,
    selectedLayerId,
    setSelectedLayerId,
    multiSelectedIds,
    setMultiSelectedIds,
    pages,
    drawOverlayHighlight,
    drawMultiSelectionHighlight,
    setActiveMainTool,
    setSelectedShapeTool,
    selectedShapeTool
  });
  // ── Sync refs with props ──────────────────────────────────────────────────
  useEffect(() => { activeMainToolRef.current = activeMainTool; }, [activeMainTool]);
  useEffect(() => { selectedSelectToolRef.current = selectedSelectTool; }, [selectedSelectTool]);
  useEffect(() => { selectedPenToolRef.current = selectedPenTool; }, [selectedPenTool]);
  useEffect(() => { selectedLayerIdRef.current = selectedLayerId; }, [selectedLayerId]);
  useEffect(() => { multiSelectedIdsRef.current = multiSelectedIds; }, [multiSelectedIds]);
  useEffect(() => { updatePageHtmlRef.current = updatePageHtml; }, [updatePageHtml]);
  useEffect(() => { currentFrameIdRef.current = currentFrameId; }, [currentFrameId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuIndex(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // ── Modular Hook Call: Pen Tool & Interactive Node Edit Engine ──
  // (Must be called before useCanvasKeyboardShortcuts which needs its refs)
  const {
    paperScopeRef,
    nodeEditModeRef: _nodeEditModeRef,
    nodeEditPathRef,
    nodeEditPageIndexRef,
    nodeEditPaperPathRef,
    nodeEditDragRef,
    nodeEditSelectedSegIdxRef,
    nodeEditSelectedSegIndicesRef,
    nodeEditSelectedHandleSideRef,
    nodeEditSelectedCurveIdxRef,
    nodeEditHoverCurveIdxRef,
    nodeEditSplitSegIdxRef,
    nodeEditScreenNodesRef,
    nodeEditScreenSegmentsRef,
    nodeEditImageAdjustRef,
    vectraPenSessionRef,
    drawingPathRef,
    drawingPointsRef,
    isFreehandDrawingRef,
    drawingPageIndexRef,
    drawingSvgRef,
    draggedNodeIndexRef,
    bendingStateRef,
    drawingSubPathsRef,
    drawingSubPathElsRef,
    activeBendingSegmentRef,
    handleDraggingStateRef,
    convertPaperSegmentToVectraNode,
    clearPenToolNodes,
    drawBendingNodes,
    renderVectraOverlay,
    clearVectraOverlay,
    drawNodeEditOverlay,
    exitNodeEditMode,
    enterNodeEditMode,
    commitAndExitPenDrawing,
  } = usePenNodeEngine({
    zoom,
    activePageIndex,
    pages,
    selectedLayerId,
    setSelectedLayerId,
    setMultiSelectedIds,
    updatePageHtml,
    activeMainTool,
    activeTopTool,
    saveModifiedPageHtml,
    drawOverlayHighlight: (...args) => drawOverlayHighlightRef.current?.(...args),
    clearOverlayType,
    clearMeasurementOverlay: (...args) => clearMeasurementOverlayRef.current?.(...args),
    nodeEditModeRef,
    skipClearSelectionRef,
    selectedLayerIdRef,
    multiSelectedIdsRef
  });

  // ── Modular Hook Call: Canvas Keyboard Shortcuts Engine ──
  useCanvasKeyboardShortcuts({
    activeTopTool,
    activeMainTool,
    setActiveMainTool,
    selectedPenTool,
    setSelectedPenTool,
    activePageIndex,
    pages,
    updatePageHtml,
    saveModifiedPageHtml,
    setSelectedLayerId,
    setMultiSelectedIds,
    setCurrentFrameId,
    currentFrameIdRef,
    selectedLayerIdRef,
    multiSelectedIdsRef,
    vectraPenSessionRef,
    drawingPathRef,
    commitAndExitPenDrawing,
    clearVectraOverlay,
    renderVectraOverlay,
    nodeEditModeRef,
    nodeEditPaperPathRef,
    nodeEditPathRef,
    nodeEditPageIndexRef,
    nodeEditSelectedSegIndicesRef,
    nodeEditSelectedSegIdxRef,
    nodeEditSelectedHandleSideRef,
    nodeEditSelectedCurveIdxRef,
    paperScopeRef,
    enterNodeEditMode,
    exitNodeEditMode,
    drawNodeEditOverlay,
    drawOverlayHighlight,
    drawMultiSelectionHighlight,
    isAltPressedRef,
    drawMeasurementOverlayRef,
    lastMousePosRef
  });

  useEffect(() => {
    return () => {
      dragStateRef.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.classList.remove('resizing-active');
      document.body.classList.remove('dragging-active');
    };
  }, []);

  // ── Clear selection on tool switch ──────────────────────────────────────────
  const prevActiveMainToolRef = useRef(activeMainTool);
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const prevTool = prevActiveMainToolRef.current;
    prevActiveMainToolRef.current = activeMainTool;

    if (skipClearSelectionRef.current) {
      skipClearSelectionRef.current = false;
      return;
    }

    // Do not clear selection if main tool has not changed (e.g. sub-tool toggle or re-render within 'select')
    if (prevTool === activeMainTool) {
      return;
    }

    // When switching to pen tool, check if an existing vector path is being edited or selected
    if (activeMainTool === 'pen') {
      // Clear node edit contour overlay so blue outline does not cover existing path stroke while drawing
      document.querySelectorAll('[id^="highlight-overlay-"]').forEach(overlay => {
        const nodeGroup = overlay.querySelector('#node-edit-overlay-group');
        if (nodeGroup) nodeGroup.remove();
      });

      let existingTarget = nodeEditModeRef.current ? nodeEditPathRef.current : null;

      if (existingTarget && existingTarget.getAttribute('d')) {
        drawingPathRef.current = existingTarget;
        nodeEditPathRef.current = existingTarget;
        nodeEditModeRef.current = true;
        drawingPageIndexRef.current = nodeEditPageIndexRef.current !== null ? nodeEditPageIndexRef.current : activePageIndex;
        const activeContainer = existingTarget.closest('.page-svg-container');
        if (activeContainer) {
          const svg = activeContainer.querySelector('svg');
          drawingSvgRef.current = svg;
        }

        if (existingTarget.id && setSelectedLayerId) {
          setSelectedLayerId(existingTarget.id);
          selectedLayerIdRef.current = existingTarget.id;
        }

        const vSession = vectraPenSessionRef.current;
        loadDIntoVectraSession(existingTarget.getAttribute('d'), vSession, paperScopeRef.current);
        if (existingTarget.parentElement) {
          renderVectraOverlay(drawingPageIndexRef.current, existingTarget.parentElement, vSession);
        }
        return;
      }
    }

    if (setSelectedLayerId) {
      setSelectedLayerId(null);
      if (setMultiSelectedIds) {
        setMultiSelectedIds(new Set());
        multiSelectedIdsRef.current = new Set();
      }
      setMarquee(null);
      // Force immediate visual cleanup of active selections
      clearOverlayType('selected');
      clearOverlayType('child-selected');
      // Clear pen tool nodes and Vectra overlay on tool switch
      document.querySelectorAll('.pen-tool-node').forEach(n => n.remove());
      if (activeMainTool !== 'pen' || selectedPenTool !== 'pen') {
        // Leaving the pen: end its node-edit session too (left on, it hides every selection's handles)
        if (nodeEditModeRef.current) exitNodeEditMode();
        vectraPenSessionRef.current.reset();
        clearVectraOverlay(activePageIndex);
        document.querySelectorAll('[id^="highlight-overlay-"]').forEach(overlay => {
          const g = overlay.querySelector('#vectra-overlay-group');
          if (g) g.innerHTML = '';
        });
      }

      document.querySelectorAll('[data-selected="true"]').forEach(el => el.removeAttribute('data-selected'));
      document.querySelectorAll('[data-child-selected="true"]').forEach(el => el.removeAttribute('data-child-selected'));
      document.querySelectorAll('[data-table-selected="true"]').forEach(el => {
        el.removeAttribute('data-table-selected');
        el.removeAttribute('data-table-mode');
      });
    }
  }, [activeMainTool, selectedSelectTool, selectedPenTool, selectedShapeTool, setSelectedLayerId, setMultiSelectedIds]);

  // ── Sync multi-selection ref with prop ────────────────────────────────────────
  useEffect(() => {
    if (multiSelectedIds) {
      multiSelectedIdsRef.current = multiSelectedIds;
    }
  }, [multiSelectedIds]);

  // ── Modular Hook Call: Canvas Zoom & Pan Gestures Engine ──
  const {
    handleZoomIn,
    handleZoomOut,
    handleResetZoom
  } = useCanvasZoomPan({
    zoom,
    setZoom,
    pan,
    setPan,
    baseWidth,
    baseHeight,
    activePageIndex,
    pagesCount: pages ? pages.length : 1,
    editorContainerRef,
    zoomContainerRef,
    currentZoomRef,
    currentPanRef,
    wheelRafRef,
    lastWheelTimeRef,
    suppressClickRef
  });




  // ── Handle watchdog: a single selection ALWAYS gets visible, correctly placed resize dots ────
  // Insertions, drag-and-drop, tool switches and page re-renders can wipe, hide or strand the HTML
  // handle layer after the selection box was drawn. Leftover drag flags (dragging-active /
  // data-dragging) from a gesture that already ended are cleared here instead of blocking the repair.
  useEffect(() => {
    if (!selectedLayerId || activeTopTool !== 'editor') return undefined;
    if (multiSelectedIds && multiSelectedIds.size > 1) return undefined;
    const id = selectedLayerId;
    const esc = (window.CSS && CSS.escape) ? CSS.escape(id) : id;
    // Elements that legitimately have no 4 corner dots (lines use start/end handles, etc.) would
    // "fail" forever — after 2 redraws that don't produce healthy handles, stop for this selection.
    let failedRedraws = 0;

    const handlesHealthy = (box) => {
      const handles = Array.from(document.querySelectorAll(`[id^="resize-handle-${esc}-"]`));
      const corners = handles.filter((h) => /-(nw|ne|se|sw)$/.test(h.id));
      if (corners.length < 4) return false;
      const b = box.getBoundingClientRect();
      const slack = 16;
      return corners.every((h) => {
        if (!h.isConnected || h.style.display === 'none') return false;
        const cs = getComputedStyle(h);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
        const r = h.getBoundingClientRect();
        if (!r.width || !r.height) return false;
        const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
        // a handle stranded at an old position (element moved / re-rendered) is not healthy
        return cx >= b.left - slack && cx <= b.right + slack && cy >= b.top - slack && cy <= b.bottom + slack;
      });
    };

    const check = () => {
      if (nodeEditModeRef.current || window.__isAdjustingShapeImage) return;
      const body = document.body;
      if (body.classList.contains('shape-adjust-active') || body.classList.contains('screen-color-picking')) return;
      // A gesture is really in progress → leave it alone. Otherwise drag flags are leftovers: clear them.
      if (window.__fbePointerDown) return;
      if (body.classList.contains('dragging-active')) body.classList.remove('dragging-active');
      document.querySelectorAll('[data-dragging="true"]').forEach((n) => n.removeAttribute('data-dragging'));

      const el = document.getElementById(id);
      if (!el || !el.isConnected) return;
      if (isEditingTextRef.current && el.querySelector?.('[data-editing="true"], [contenteditable="true"]')) return;
      const box = document.querySelector(`[id="overlay-poly-selected-${esc}"], [id="overlay-poly-child-selected-${esc}"]`);
      if (!box) return; // nothing selectable drawn (locked, background, frame…)
      if (handlesHealthy(box)) { failedRedraws = 0; return; }
      if (failedRedraws >= 2) return;
      failedRedraws += 1;
      // Broken: drop whatever is left and redraw from scratch
      document.querySelectorAll(`[id^="resize-handle-${esc}-"]`).forEach((h) => h.remove());
      const fn = drawOverlayHighlightRef.current || drawOverlayHighlight;
      if (typeof fn === 'function') {
        fn(el, el.getAttribute('data-child-selected') === 'true' ? 'child-selected' : 'selected');
      }
    };

    const timers = [60, 250, 700].map((ms) => setTimeout(check, ms));
    const iv = setInterval(check, 600);
    // Re-check right after any gesture ends (pointer up, native drop, drag end)
    const afterGesture = () => requestAnimationFrame(() => setTimeout(check, 30));
    const evs = ['pointerup', 'mouseup', 'drop', 'dragend'];
    evs.forEach((t) => window.addEventListener(t, afterGesture, true));
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(iv);
      evs.forEach((t) => window.removeEventListener(t, afterGesture, true));
    };
  }, [selectedLayerId, multiSelectedIds, activeTopTool, pages]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync refs and perform page-level DOM highlights ──────────────────────────
  useEffect(() => {
    if (activeTopTool === 'interaction' || activeTopTool === 'animation') {
      if (nodeEditModeRef.current) {
        exitNodeEditMode();
      }
    }

    // A node-edit session whose path is gone or no longer selected is stale — end it so handles show
    if (nodeEditModeRef.current && activeMainTool !== 'pen') {
      const nPath = nodeEditPathRef.current;
      if (!nPath || !nPath.isConnected || (selectedLayerId && nPath.id !== selectedLayerId)) exitNodeEditMode();
    }

    // Suppress regular selection box and resize handles when in Path Node Edit Mode or Shape Image Adjust Mode
    if (nodeEditModeRef.current || window.__isAdjustingShapeImage || document.body.classList.contains('shape-adjust-active')) {
      clearOverlayType('selected');
      clearOverlayType('entered');
      clearOverlayType('child-selected');
      document.querySelectorAll('[id^="highlight-overlay-html-"] .resize-handle').forEach(h => h.remove());
      if (nodeEditModeRef.current && nodeEditPathRef.current && nodeEditPaperPathRef.current) {
        drawNodeEditOverlay(nodeEditPathRef.current, nodeEditPaperPathRef.current, nodeEditPageIndexRef.current);
      } else if (window.__shapeImageAdjustTarget) {
        drawShapeImageAdjustOverlay(window.__shapeImageAdjustTarget, activePageIndex, zoom);
      }
      return;
    }

    // Force immediate visual cleanup of all overlays before redraw
    clearOverlayType('selected');
    clearOverlayType('entered');
    clearOverlayType('child-selected');

    // Clean up HTML-based UI elements (interaction badges)
    document.querySelectorAll('[id^="interaction-badge-"]').forEach(badge => {
      if (activeTopTool !== 'interaction' && activeTopTool !== 'animation') {
        badge.remove();
      } else {
        const id = badge.id.replace('interaction-badge-', '');
        const idsToHighlight = multiSelectedIds.size > 0
          ? multiSelectedIds
          : (selectedLayerId ? new Set([selectedLayerId]) : new Set());
        if (!idsToHighlight.has(id)) {
          badge.remove();
        }
      }
    });

    const validMultiIds = new Set(Array.from(multiSelectedIds || []).filter(id => {
      const el = document.getElementById(id);
      return el && !isPageRootElement(el, el.closest('svg'));
    }));

    if (validMultiIds.size > 1) {
      if (localTrimView) {
        validMultiIds.forEach(id => {
          document.querySelectorAll(`[id="${id}"]`).forEach(el => {
            const svg = el.closest('svg');
            if (svg && isElementCompletelyOutside(el, svg)) {
              el.setAttribute('data-trim-outside', 'true');
            } else if (el) {
              el.removeAttribute('data-trim-outside');
            }
          });
        });
      }
      drawMultiSelectionHighlight(validMultiIds, 'selected');
    } else {
      const idsToHighlight = validMultiIds.size > 0
        ? validMultiIds
        : (selectedLayerId ? new Set([selectedLayerId]) : new Set());

      idsToHighlight.forEach(id => {
        const elements = document.querySelectorAll(`[id="${id}"]`);
        if (elements.length === 0) {
          purgeElementOverlays(id);
          return;
        }

        elements.forEach(el => {
          if (isElementHidden(el)) {
            purgeElementOverlays(el);
            return;
          }

          const isFreeFrame = el.getAttribute('data-name') === 'Free Frame' || el.getAttribute('data-type') === 'free-frame' || (el.id && el.id.startsWith('free-frame'));
          if (isFreeFrame && activeTopTool !== 'interaction' && activeTopTool !== 'animation') return;

          if (localTrimView) {
            const svg = el.closest('svg');
            if (svg && isElementCompletelyOutside(el, svg)) {
              el.setAttribute('data-trim-outside', 'true');
            } else if (el) {
              el.removeAttribute('data-trim-outside');
            }
          }

          // Highlights across multiple pages are drawn in their respective containers
          const type = (currentFrameId && id !== currentFrameId) ? 'child-selected' : 'selected';
          el.setAttribute(`data-${type}`, 'true');
          drawOverlayHighlight(el, type);

          // If this selected element is inside a parent group, highlight the parent group with a dotted line!
          const parentGroup = el.parentElement?.closest('g');
          if (parentGroup && parentGroup.id && parentGroup.id !== id && parentGroup.getAttribute('data-type') !== 'frame' && parentGroup.getAttribute('data-name') !== 'Overlay') {
            if (!isElementHidden(parentGroup)) {
              drawOverlayHighlight(parentGroup, 'entered');
            }
          }
        });
      });
    }

    if (currentFrameId) {
      document.querySelectorAll(`[id="${currentFrameId}"]`).forEach(el => {
        if (el.getAttribute('data-type') === 'frame') {
          el.setAttribute('data-frame-entered', 'true');
          drawOverlayHighlight(el, 'entered');
        }
      });
    }

    if (isEditingTextRef.current) {
      document.querySelectorAll('.selection-overlay-layer .resize-handle').forEach(h => h.remove());
      document.querySelectorAll('[id^="highlight-overlay-html-"] .resize-handle').forEach(h => h.remove());
    }
  }, [selectedLayerId, currentFrameId, multiSelectedIds, pages, activePageIndex, zoom, activeTopTool, localTrimView]);

  // Redraw hover outline on zoom so its stroke stays a constant on-screen width
  useEffect(() => {
    document.querySelectorAll('.page-svg-container [data-hovered="true"], .page-svg-container [data-child-hovered="true"]').forEach(el => {
      if (el.getAttribute('data-selected') === 'true' || el.getAttribute('data-child-selected') === 'true') return;
      drawOverlayHighlight(el, el.getAttribute('data-child-hovered') === 'true' ? 'child-hover' : 'hover');
    });
  }, [zoom]);

  // Synchronize Trim View mask and outside status across all visible page SVGs
  useEffect(() => {
    const svgs = document.querySelectorAll('.page-svg-container svg:not([id^="highlight-overlay-"])');
    svgs.forEach(svg => {
      applyTrimViewToSvg(svg, localTrimView, baseWidth, baseHeight);
    });
  }, [localTrimView, activePageIndex, pages, baseWidth, baseHeight]);

  // Sync refs
  useEffect(() => {
    currentFrameIdRef.current = currentFrameId;
  }, [currentFrameId]);

  const hitTest = (el, clientX, clientY, buffer = 0) =>
    hitTestExt(el, clientX, clientY, buffer, selectedLayerIdRef.current, multiSelectedIdsRef.current);





  // Deselect audio element when switching to interaction mode
  useEffect(() => {
    if (activeTopTool === 'interaction' && selectedLayerId) {
      const el = document.getElementById(selectedLayerId);
      const isAudio = el?.getAttribute?.('data-type') === 'audio-frame' || (selectedLayerId && selectedLayerId.startsWith('audio-')) || el?.closest?.('[data-type="audio-frame"], g[id^="audio-"]');
      if (isAudio) {
        if (typeof setSelectedLayerId === 'function') setSelectedLayerId(null);
        if (typeof setMultiSelectedIds === 'function') setMultiSelectedIds(new Set());
      }
    }
  }, [activeTopTool, selectedLayerId, setSelectedLayerId, setMultiSelectedIds]);

  // Sync refs with props/state
  useEffect(() => { selectedLayerIdRef.current = selectedLayerId; }, [selectedLayerId]);
  useEffect(() => { activeMainToolRef.current = activeMainTool; }, [activeMainTool]);
  useEffect(() => { selectedSelectToolRef.current = selectedSelectTool; }, [selectedSelectTool]);
  useEffect(() => { multiSelectedIdsRef.current = multiSelectedIds; }, [multiSelectedIds]);
  useEffect(() => { selectedPenToolRef.current = selectedPenTool; }, [selectedPenTool]);

const getDraggableElement = (target, canvasRoot) => {
    if (!target || !canvasRoot || !canvasRoot.contains || !canvasRoot.contains(target)) return null;
    let current = target;

    // Locked elements can NEVER be clicked, selected, or dragged on the canvas!
    const lockedEl = (typeof current.closest === 'function' ? current.closest('[data-locked="true"]') : null) ||
                     (current.getAttribute && current.getAttribute('data-locked') === 'true' ? current : null);
    if (lockedEl) {
      return null;
    }

    // If clicking on a tspan, promote to parent text element first
    if (current && current.tagName?.toLowerCase() === 'tspan') {
      current = current.parentElement || current.parentNode;
    }

    // Hotspots are single compound elements; if clicking anywhere inside a hotspot group, drag the whole hotspot ONLY in interaction mode!
    const hotspotGroup = current && typeof current.closest === 'function' ? current.closest('[data-is-hotspot="true"], [data-type="hotspot"]') : null;
    if (hotspotGroup) {
      if (activeTopToolRef.current !== 'interaction') {
        // When not in interaction mode, do not target hotspots so clicks pass through
      } else {
        if (!hotspotGroup.id) {
          hotspotGroup.id = `hotspot-${Date.now()}`;
        }
        return hotspotGroup;
      }
    }

    // Video groups are single compound elements; always drag the whole video group
    const videoGroup = current && typeof current.closest === 'function' ? current.closest('[data-is-video-group="true"]') : null;
    if (videoGroup) {
      return videoGroup;
    }

    // Button elements are single compound elements; if clicking anywhere inside a button group, drag/select the whole button!
    const buttonGroup = current && typeof current.closest === 'function' ? current.closest('[data-is-element-button="true"], [data-type="button"], g[id^="button-"]') : null;
    if (buttonGroup) {
      if (!buttonGroup.id) {
        buttonGroup.id = `button-${Date.now()}`;
      }
      return buttonGroup;
    }

    // Audio elements are single compound elements; always drag/select the whole audio group
    const audioGroup = current && typeof current.closest === 'function' ? current.closest('[data-type="audio-frame"], g[id^="audio-"]') : null;
    if (audioGroup) {
      if (activeTopToolRef.current === 'interaction') {
        return null;
      }
      if (!audioGroup.id) {
        audioGroup.id = `audio-${Date.now()}`;
      }
      return audioGroup;
    }

    // Titles (motion graphic) elements are single compound elements; if clicking anywhere inside, drag/select the whole title element!
    // SVG Typography groups (group-typography-...) are user groups containing editable text elements!
    const titleGroup = current && typeof current.closest === 'function' ? current.closest('[data-typography-type="motion-graphic"], [data-subtopic="Titles"], [data-motion-template]') : null;
    if (titleGroup) {
      if (!titleGroup.id) {
        titleGroup.id = `title-${Date.now()}`;
      }
      return titleGroup;
    }

    // Icons are single compound elements (hit-box + icon paths); always select the whole icon group,
    // never its transparent hit-box rect (styling that rect draws a box around the icon)
    const iconGroup = current && typeof current.closest === 'function' ? current.closest('g[data-type="icon"]') : null;
    if (iconGroup) {
      if (!iconGroup.id) {
        iconGroup.id = `icon-${Date.now()}`;
      }
      return iconGroup;
    }

    // Decorator elements are single compound elements; always drag/select the whole decorator group
    // Element shapes are single compound elements; always drag/select the whole shape group (ensure never inside audio frame)
    const shapeGroup = current && typeof current.closest === 'function' ? (
      current.parentElement?.closest('g[data-is-element-shape="true"], g[data-shape-type], g[data-type="shape"], g[id^="shape-"]') ||
      (current.tagName?.toLowerCase() === 'g' && current.matches?.('[data-is-element-shape="true"], [data-shape-type], [data-type="shape"], g[id^="shape-"]') ? current : null) ||
      current.closest('g[data-is-element-shape="true"], g[data-shape-type], g[data-type="shape"], g[id^="shape-"]') ||
      current.closest('[data-is-element-shape="true"], [data-shape-type], [data-type="shape"], g[id^="shape-"]')
    ) : null;
    if (shapeGroup && !shapeGroup.closest?.('[data-type="audio-frame"], g[id^="audio-"]')) {
      if (!shapeGroup.id) {
        shapeGroup.id = `shape-${Date.now()}`;
      }
      return shapeGroup;
    }

    const decoratorGroup = current && typeof current.closest === 'function' ? current.closest('[data-is-animated-decorator="true"], [data-type="animated-decorator"], [data-type="decorator"], g[id^="decorator-"]') : null;
    if (decoratorGroup) {
      if (!decoratorGroup.id) {
        decoratorGroup.id = `decorator-${Date.now()}`;
      }
      return decoratorGroup;
    }

    // Image frame elements are single compound elements
    const imageFrameGroup = current && typeof current.closest === 'function' ? current.closest('[data-is-image-frame="true"], [data-type="image-frame"], [data-frame-type], g[id^="image-frame-"]') : null;
    if (imageFrameGroup) {
      if (!imageFrameGroup.id) {
        imageFrameGroup.id = `image-frame-${Date.now()}`;
      }
      return imageFrameGroup;
    }

    // QR Code elements are single compound elements; always drag/select the whole QR Code group
    const qrGroup = current && typeof current.closest === 'function' ? current.closest('[data-type="qrcode"], g[id^="qrcode-"]') : null;
    if (qrGroup) {
      if (!qrGroup.id) {
        qrGroup.id = `qrcode-${Date.now()}`;
      }
      return qrGroup;
    }

    // Map elements are single compound elements; always drag/select the whole map group
    const mapContainer = current && typeof current.closest === 'function' ? current.closest('[data-type="map"], g[id^="map-"]') : null;
    if (mapContainer) {
      const mapGroup = (mapContainer.tagName?.toLowerCase() === 'g' ? mapContainer : mapContainer.closest('g[id^="map-"], g[data-type="map"]')) || mapContainer;
      if (!mapGroup.id) {
        mapGroup.id = `map-${Date.now()}`;
      }
      return mapGroup;
    }

    // Slideshow elements are single compound elements; always drag/select the whole slideshow group
    const slideshowGroup = current && typeof current.closest === 'function' ? current.closest('[data-is-slideshow="true"], [data-type="slideshow"], g[id^="slideshow-"]') : null;
    if (slideshowGroup) {
      if (!slideshowGroup.id) {
        slideshowGroup.id = `slideshow-${Date.now()}`;
      }
      return slideshowGroup;
    }


    // Embed elements are single compound elements; always drag/select the whole embed group
    const embedGroup = current && typeof current.closest === 'function' ? current.closest('[data-type="embed-frame"], g[id^="embed-"]') : null;
    if (embedGroup) {
      if (!embedGroup.id) {
        embedGroup.id = `embed-${Date.now()}`;
      }
      return embedGroup;
    }

    // Table elements are single compound elements; always drag/select the whole table group
    const tableGroup = current && typeof current.closest === 'function' ? current.closest('[data-type="table-frame"], [data-type="table"], g[id^="table-"]') : null;
    if (tableGroup) {
      if (!tableGroup.id) {
        tableGroup.id = `table-${Date.now()}`;
      }
      return tableGroup;
    }

    let deepestElementWithId = null;

    while (current && current !== canvasRoot && current.tagName) {
      const tagName = current.tagName.toLowerCase();

      if (tagName === 'svg') {
        return deepestElementWithId;
      }

      // In non-interaction mode, Free Frames and Hotspots must never be draggable or selectable
      const isFreeFrameOrHotspot = (
        current.getAttribute && (
          current.getAttribute('data-name') === 'Free Frame' ||
          current.getAttribute('data-type') === 'free-frame' ||
          (current.id && current.id.startsWith('free-frame')) ||
          current.getAttribute('data-is-hotspot') === 'true' ||
          current.getAttribute('data-type') === 'hotspot' ||
          (current.id && current.id.startsWith('hotspot-'))
        )
      );
      if (isFreeFrameOrHotspot && activeTopToolRef.current !== 'interaction') {
        current = current.parentElement || current.parentNode;
        continue;
      }

      // In Trim View, elements completely outside cannot be targeted directly from canvas unless already selected
      if (current.getAttribute && current.getAttribute('data-trim-outside') === 'true') {
        const isSel = (current.id && current.id === selectedLayerIdRef.current) ||
          (multiSelectedIdsRef.current && current.id && multiSelectedIdsRef.current.has(current.id));
        if (!isSel) {
          current = current.parentElement || current.parentNode;
          continue;
        }
      }

      // Auto-assign an id to id-less elements from SVG templates so they
      // become selectable. This matches how the type tool creates new text.
      if (
        !current.id &&
        current.getAttribute('data-hidden') !== 'true' &&
        current.getAttribute('data-locked') !== 'true' &&
        current.getAttribute('data-name') !== 'Overlay' &&
        current.getAttribute('data-name') !== 'Document Shield' &&
        current.getAttribute('data-type') !== 'shield' &&
        !['svg', 'defs', 'clippath', 'lineargradient', 'radialgradient', 'pattern', 'filter', 'style', 'metadata'].includes(tagName)
      ) {
        current.id = `${tagName}-${Math.random().toString(36).substr(2, 9)}`;
        if (!deepestElementWithId) deepestElementWithId = current;
      }

      if (
        current.id &&
        current.getAttribute('data-hidden') !== 'true' &&
        current.getAttribute('data-locked') !== 'true' &&
        current.getAttribute('data-name') !== 'Overlay' &&
        current.getAttribute('data-name') !== 'Document Shield' &&
        current.getAttribute('data-type') !== 'shield' &&
        (!isConvertedFlipbook || (
          ((current.getAttribute('data-is-hotspot') === 'true' || current.getAttribute('data-type') === 'hotspot' || current.id?.startsWith('hotspot-')) && activeTopToolRef.current === 'interaction') ||
          ((current.getAttribute('data-name') === 'Free Frame' || current.getAttribute('data-type') === 'free-frame' || current.id?.startsWith('free-frame')) && activeTopToolRef.current === 'interaction') ||
          (current.getAttribute('data-type') === 'shape' && current.getAttribute('data-name') !== 'Free Frame' && current.getAttribute('data-type') !== 'free-frame' && !current.id?.startsWith('free-frame')) ||
          current.getAttribute('data-type') === 'icon'
        ))
      ) {
        // Prevent targeting inner image of an image group directly, or inner elements of video/gif groups
        if (tagName === 'image' && current.parentElement?.getAttribute('data-is-image-group') === 'true') {
          // Skip the inner image and let it traverse to the parent group
        } else if ((tagName === 'foreignobject' || tagName === 'video' || tagName === 'iframe') && current.parentElement?.getAttribute('data-is-video-group') === 'true') {
          // Skip inner foreignobject/video/iframe and let it traverse to the parent video group
        } else if (current.parentElement?.getAttribute('data-is-gif-group') === 'true') {
          // Skip inner gif elements and let it traverse to parent gif group
        } else {
          if (!deepestElementWithId) deepestElementWithId = current;
        }
      }

      // Check if current is a User Group (<g data-type="group"> or <g data-name="Group"> or id starting with "group-")
      const isUserGroup = current.id && (
        current.getAttribute('data-type') === 'group' ||
        (current.getAttribute('data-name') || '').toLowerCase() === 'group' ||
        current.id.startsWith('group-')
      ) && current.getAttribute('data-is-image-group') !== 'true' && current.getAttribute('data-is-video-group') !== 'true' && current.getAttribute('data-is-gif-group') !== 'true';

      if (isUserGroup && selectedSelectToolRef.current !== 'direct') {
        const frameId = currentFrameIdRef.current;
        // If this group is not the currently entered frame/context, return the User Group!
        if (frameId !== current.id) {
          return current;
        }
      }

      current = current.parentElement || current.parentNode;
    }

    return deepestElementWithId;
  };

  // ── Modular Hook Call: Interact.js Dragging & Resizing Engine ──
  useInteractEngine({
    zoom,
    activePageIndex,
    isConvertedFlipbook,
    setSelectedLayerId,
    setMultiSelectedIds,
    setCurrentFrameId,
    drawOverlayHighlight,
    drawMultiSelectionHighlight,
    syncMultiSelectionBox,
    saveModifiedPageHtml,
    getDraggableElement,
    getTopLevelFrames,
    isPageRootElement,
    hitTest,
    selectedLayerIdRef,
    multiSelectedIdsRef,
    currentFrameIdRef,
    activeTopToolRef,
    activeMainToolRef,
    selectedSelectToolRef,
    nodeEditModeRef,
    suppressClickRef,
    drawMeasurementOverlayRef,
    updatePageHtml,
    updatePageHtmlRef,
    localTrimView
  });


  // ── Modular Hook Call: Canvas Pointer Events Engine ────────────────────────
  const {
    handleSvgMouseDown,
    handleSvgMouseMove,
    handleSvgMouseUp,
    handleSvgMouseLeave,
    handleSvgClick,
    handleSvgDoubleClick
  } = useCanvasPointerEvents({
    zoom,
    activePageIndex,
    setActivePageIndex,
    pages,
    setSelectedLayerId,
    setMultiSelectedIds,
    setCurrentFrameId,
    activeMainTool,
    setActiveMainTool,
    activeTopTool,
    selectedPenTool,
    selectedSelectTool,
    selectedShapeTool,
    setMarquee,
    isConvertedFlipbook,
    updatePageHtml,
    saveModifiedPageHtml,
    // Refs
    currentFrameIdRef,
    selectedLayerIdRef,
    multiSelectedIdsRef,
    activeMainToolRef,
    activeTopToolRef,
    selectedSelectToolRef,
    selectedPenToolRef,
    drawingPathRef,
    drawingPointsRef,
    isFreehandDrawingRef,
    drawingPageIndexRef,
    drawingSvgRef,
    drawingShapeRef,
    shapeStartPointRef,
    draggedNodeIndexRef,
    bendingStateRef,
    drawingSubPathsRef,
    drawingSubPathElsRef,
    activeBendingSegmentRef,
    handleDraggingStateRef,
    nodeEditModeRef,
    nodeEditPathRef,
    nodeEditPaperPathRef,
    nodeEditPageIndexRef,
    nodeEditDragRef,
    nodeEditSelectedSegIdxRef,
    nodeEditSelectedSegIndicesRef,
    nodeEditSelectedHandleSideRef,
    nodeEditSelectedCurveIdxRef,
    nodeEditHoverCurveIdxRef,
    nodeEditSplitSegIdxRef,
    nodeEditScreenNodesRef,
    nodeEditScreenSegmentsRef,
    nodeEditImageAdjustRef,
    vectraPenSessionRef,
    paperScopeRef,
    marqueeRef,
    marqueeOverlayRef1,
    marqueeOverlayRef2,
    marqueeCandidatesRef,
    marqueeDataRef,
    suppressClickRef,
    isAltPressedRef,
    lastMousePosRef,
    lastClickRef,
    isEditingTextRef,
    drawMeasurementOverlayRef,
    skipClearSelectionRef,
    loadDIntoVectraSession,
    // Helper callbacks
    drawOverlayHighlight,
    drawBendingNodes,
    renderVectraOverlay,
    clearPenToolNodes,
    drawNodeEditOverlay,
    enterNodeEditMode,
    exitNodeEditMode,
    commitAndExitPenDrawing,
    convertTextToForeignObject,
    getDraggableElement
  });

  const handlePrevPage = () => {
    setActivePageIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    if (activePageIndex + 1 < pages.length) {
      setActivePageIndex(prev => prev + 1);
    }
  };

  const closeAllDropdowns = () => {
    setShowSelectOptions(false);
    setShowPenOptions(false);
    setShowShapesOptions(false);
    if (setOpenMenuIndex) setOpenMenuIndex(null);
  };


  const handleAlign = (type) => {
    alignSelectedElements(type, {
      activePageIndex,
      multiSelectedIds,
      selectedLayerId,
      updatePageHtml,
      saveModifiedPageHtml,
      drawMultiSelectionHighlight,
      drawOverlayHighlight,
      multiSelectedIdsRef
    });
  };


  const activeCanvasCursor = (() => {
    if (isSpaceDown || activeMainTool === 'hand') {
      return isPanningRef.current ? 'grabbing' : 'grab';
    }
    if (activeMainTool === 'shapes') {
      return SHAPE_CURSOR;
    }
    if (activeMainTool === 'pen') {
      return selectedPenTool === 'pencil' ? PENCIL_CURSOR : PEN_CURSOR;
    }
    if (activeMainTool === 'type') {
      return TYPE_CURSOR;
    }
    return 'default';
  })();

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden h-full ${isPopupEditor ? 'bg-[#E5E7EB]' : 'bg-white'}`}
      onClick={closeAllDropdowns}
      onContextMenu={(e) => e.preventDefault()}
    >
      <CropController
        activePageIndex={activePageIndex}
        zoom={zoom}
        saveModifiedPageHtml={saveModifiedPageHtml}
        drawOverlayHighlight={drawOverlayHighlight}
        getVisualBBox={getVisualBBox}
      />
      <TopToolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetZoom}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onAlign={handleAlign}
        selectedLayerId={selectedLayerId}
        hideTools={isPdfProject}

        hasSelection={(() => {
          const ids = multiSelectedIds.size > 0 ? Array.from(multiSelectedIds) : (selectedLayerId ? [selectedLayerId] : []);
          if (ids.length === 0) return false;

          // Collect all "Base" (Root Frame or Background Overlay) IDs across all visible containers
          // (Handles both single and double-page spread selections)
          const baseIds = new Set();
          document.querySelectorAll('.page-svg-container svg').forEach(svg => {
            const topLevelFrames = getTopLevelFrames(svg);
            topLevelFrames.forEach(frame => {
              baseIds.add(frame.id);
              const overlay = frame.querySelector('[data-name="Overlay"]');
              if (overlay) baseIds.add(overlay.id);
            });
          });

          // Enable tools ONLY if at least one selected ID is NOT a base/root frame
          return ids.some(id => id && !baseIds.has(id));
        })()}
      />
      <div
        ref={editorContainerRef}
        data-editor-canvas="true"
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        style={{
          cursor: activeCanvasCursor,
          background: computedCanvaBackground
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('show-layer-context-menu', {
            detail: { e, layerId: 'outside-background', pageIndex: activePageIndex, isOverlay: true }
          }));
        }}
        onMouseDown={(e) => {
          if (isSpaceDownRef.current || e.button === 1 || activeMainTool === 'hand') {
            e.preventDefault();
            e.stopPropagation();
            isPanningRef.current = true;
            lastPanPointRef.current = { x: e.clientX, y: e.clientY };
            setIsSpaceDown(true);
            if (zoomContainerRef.current) {
              zoomContainerRef.current.style.transition = 'none';
            }
            return;
          }
        }}
        onMouseMove={(e) => {
          if (isPanningRef.current) {
            e.preventDefault();
            e.stopPropagation();
            const dx = e.clientX - lastPanPointRef.current.x;
            const dy = e.clientY - lastPanPointRef.current.y;
            lastPanPointRef.current = { x: e.clientX, y: e.clientY };

            const prev = currentPanRef.current;
            const newX = prev.x + dx;
            const newY = prev.y + dy;

            if (!editorContainerRef.current) return;

            const currentScale = zoom / 100;
            const { maxPanX, maxPanY } = computePanBounds(
              editorContainerRef.current,
              zoomContainerRef.current,
              currentScale,
              baseWidth,
              baseHeight
            );

            const boundedX = Math.min(Math.max(newX, -maxPanX), maxPanX);
            const boundedY = Math.min(Math.max(newY, -maxPanY), maxPanY);

            currentPanRef.current = { x: boundedX, y: boundedY };

            if (zoomContainerRef.current) {
              zoomContainerRef.current.style.transition = 'none';
              zoomContainerRef.current.style.transform = `translate3d(${boundedX}px, ${boundedY}px, 0px) scale(${currentScale})`;
            }
            window.dispatchEvent(new CustomEvent('editor-pan-update', { detail: { x: boundedX, y: boundedY } }));
          } else if (marqueeDataRef?.current && (e.buttons & 1) !== 0) {
            if (handleSvgMouseMove) {
              handleSvgMouseMove(activePageIndex, e);
            }
          }
        }}
        onMouseUp={(e) => {
          if (isPanningRef.current) {
            isPanningRef.current = false;
            // Mark that we just finished panning so the immediately-following
            // onClick does not accidentally select/deselect canvas elements.
            wasRecentlyPanningRef.current = true;
            setTimeout(() => { wasRecentlyPanningRef.current = false; }, 150);
            setIsSpaceDown(isSpaceDownRef.current);
            setPan(currentPanRef.current);
          }
          if (handleSvgMouseUp) {
            handleSvgMouseUp(e);
          }
        }}
        onMouseLeave={() => {
          if (isPanningRef.current) {
            isPanningRef.current = false;
            wasRecentlyPanningRef.current = true;
            setTimeout(() => { wasRecentlyPanningRef.current = false; }, 150);
            setIsSpaceDown(isSpaceDownRef.current);
            setPan(currentPanRef.current);
          }
        }}
        onClick={(e) => {
          // Suppress clicks that happen right after Ctrl+scroll zoom or Space panning
          if (isPanningRef.current || isSpaceDownRef.current || suppressClickRef.current || wasRecentlyPanningRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          // ── Background Click: Select active page root folder instead of clearing selection ─────────────────
          const container = e.target.closest('.page-svg-container');
          const pageIdx = container ? parseInt(container.getAttribute('data-page-index')) : activePageIndex;

          if (setActivePageIndex && activePageIndex !== pageIdx) {
            setActivePageIndex(pageIdx);
          }

          // ── Background Click: In converted flipbooks, clear selection instead of selecting full page root ─────
          if (isConvertedFlipbook) {
            if (setSelectedLayerId) setSelectedLayerId(null);
            if (setMultiSelectedIds) setMultiSelectedIds(new Set());
            if (setCurrentFrameId) setCurrentFrameId(null);
            currentFrameIdRef.current = null;
            return;
          }

          const pageSvg = container?.querySelector('svg') || document.querySelector(`.page-svg-container[data-page-index="${pageIdx}"] svg`);
          const topFrames = pageSvg ? getTopLevelFrames(pageSvg) : [];
          const rootId = (topFrames && topFrames.length > 0 ? topFrames[0].id : pages[pageIdx]?.layers?.[0]?.id);

          if (rootId) {
            if (setSelectedLayerId) setSelectedLayerId(rootId);
            if (setMultiSelectedIds) setMultiSelectedIds(new Set([rootId]));
            if (setCurrentFrameId) setCurrentFrameId(rootId);
            currentFrameIdRef.current = rootId;
          } else if (setSelectedLayerId) {
            setSelectedLayerId(null);
            setMultiSelectedIds(new Set());
            setCurrentFrameId(null);
            currentFrameIdRef.current = null;
          }
        }}

      >
        {/* Invisible Overlay for Panning */}
        {isSpaceDown && (
          <div className="absolute inset-0 z-[9999]" style={{ cursor: isPanningRef.current ? 'grabbing' : 'grab' }} />
        )}

        {/* Canvas Ruler */}
        {localRulerEnabled && (
          <CanvasRuler
            zoom={zoom}
            pan={currentPanRef.current}
            baseLogicalWidth={baseWidth}
            baseLogicalHeight={baseHeight}
            baseCanvasWidth={window.innerHeight * 0.78 * (baseWidth / baseHeight)}
            baseCanvasHeight={window.innerHeight * 0.78}
            selectedLayerId={selectedLayerId}
            multiSelectedIds={multiSelectedIds}
          />
        )}

        {/* Guides Overlay */}
        {localRulerEnabled && (
          <GuidesOverlay
            zoom={zoom}
            pan={currentPanRef.current}
            baseLogicalWidth={baseWidth}
            baseLogicalHeight={baseHeight}
            baseCanvasWidth={window.innerHeight * 0.78 * (baseWidth / baseHeight)}
            baseCanvasHeight={window.innerHeight * 0.78}
          />
        )}

        {/* Modular Floating Toolbars */}
        <FloatingToolbars
          isPdfProject={isPdfProject}
          isPopupEditor={isPopupEditor}
          pages={pages}
          activePageIndex={activePageIndex}
          activeTopTool={activeTopTool}
          setActiveTopTool={setActiveTopTool}
          activeMainTool={activeMainTool}
          setActiveMainTool={setActiveMainTool}
          selectedSelectTool={selectedSelectTool}
          setSelectedSelectTool={setSelectedSelectTool}
          selectedPenTool={selectedPenTool}
          setSelectedPenTool={setSelectedPenTool}
          selectedShapeTool={selectedShapeTool}
          setSelectedShapeTool={setSelectedShapeTool}
          showHotspotPopup={showHotspotPopup}
          setShowHotspotPopup={setShowHotspotPopup}
          showSelectOptions={showSelectOptions}
          setShowSelectOptions={setShowSelectOptions}
          showPenOptions={showPenOptions}
          setShowPenOptions={setShowPenOptions}
          showShapesOptions={showShapesOptions}
          setShowShapesOptions={setShowShapesOptions}
          openMenuIndex={openMenuIndex}
          setOpenMenuIndex={setOpenMenuIndex}
          closeAllDropdowns={closeAllDropdowns}
          onOpenTemplateModal={onOpenTemplateModal}
          clearPage={clearPage}
          deletePage={deletePage}
        />
        {/* Canvas Area container */}
        <div
          className={`w-full h-full flex items-center justify-center relative ${isPopupEditor ? 'overflow-visible' : 'overflow-hidden'} bg-transparent`}
          style={{ cursor: activeCanvasCursor }}
          onMouseDown={(e) => {
            if (e.button === 0 && !isSpaceDownRef.current && activeMainTool !== 'hand' && !e.target.closest('[id^="canvas-content-"]') && !e.target.closest('.resize-handle') && !e.target.closest('button') && !e.target.closest('input') && !e.target.closest('.z-50')) {
              if (handleSvgMouseDown) {
                handleSvgMouseDown(activePageIndex, e);
              }
            }
          }}
          onMouseMove={(e) => {
            // The page container (CanvasViewport) already handled moves over the page. Re-running
            // here would resolve the wrong <svg> (first one in this div, e.g. a LeftActionMenu icon)
            // and wipe the hover box that was just drawn.
            if (e.target?.closest?.('[id^="canvas-content-"]')) return;
            if (handleSvgMouseMove) {
              handleSvgMouseMove(activePageIndex, e);
            }
          }}
          onMouseUp={(e) => {
            if (handleSvgMouseUp) {
              handleSvgMouseUp(e);
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            if (e.target.closest('.page-svg-container')) return;
            e.preventDefault();
            e.stopPropagation();
            try {
              const rawJson = e.dataTransfer.getData('application/json');
              if (rawJson) {
                const data = JSON.parse(rawJson);
                if (data.type === 'element' || data.elementId) {
                  window.dispatchEvent(new CustomEvent('add-element-to-editor', {
                    detail: {
                      pageIndex: activePageIndex,
                      elementId: data.elementId,
                      dropPoint: null
                    }
                  }));
                }
              }
            } catch (err) {
              console.error('Background drop error:', err);
            }
          }}
        >
          {/* Left Action Menu (Elements, Templets, Styles, Icons) */}
          {!isPopupEditor && !isPdfMode && activeTopTool !== 'interaction' && activeTopTool !== 'animation' && (
            <LeftActionMenu
              activeTopTool={activeTopTool}
              isRulerEnabled={localRulerEnabled}
              activePageIndex={activePageIndex}
              pages={pages}
              onOpenTemplateModal={onOpenTemplateModal}
              saveModifiedPageHtml={saveModifiedPageHtml}
              updatePageHtml={updatePageHtml}
              setSelectedLayerId={setSelectedLayerId}
              setActiveMainTool={setActiveMainTool}
              setSelectedShapeTool={setSelectedShapeTool}
              activeMainTool={activeMainTool}
              baseWidth={baseWidth}
              baseHeight={baseHeight}
              isImagesModalOpen={isImagesModalOpen}
              onToggleImagesModal={() => {
                setIsElementsModalOpen(false);
                setIsIconsModalOpen(false);
                setIsImagesModalOpen(prev => !prev);
              }}
              onCloseImagesModal={() => setIsImagesModalOpen(false)}
              isElementsModalOpen={isElementsModalOpen}
              onToggleElementsModal={() => {
                setIsImagesModalOpen(false);
                setIsIconsModalOpen(false);
                setIsElementsModalOpen(prev => !prev);
              }}
              onCloseElementsModal={() => setIsElementsModalOpen(false)}
              isIconsModalOpen={isIconsModalOpen}
              onToggleIconsModal={() => {
                setIsImagesModalOpen(false);
                setIsElementsModalOpen(false);
                setIsIconsModalOpen(prev => !prev);
              }}
              onCloseIconsModal={() => setIsIconsModalOpen(false)}
            />
          )}

          {/* Draggable Images Modal */}
          {!isPdfMode && (
            <ImagesModal
              isOpen={isImagesModalOpen}
              onClose={() => setIsImagesModalOpen(false)}
              isRulerEnabled={localRulerEnabled}
              activePageIndex={activePageIndex}
              dragConstraintsRef={editorContainerRef}
            />
          )}

          {/* Draggable Add Elements Modal */}
          {!isPdfMode && (
            <AddElementsModal
              isOpen={isElementsModalOpen}
              onClose={() => setIsElementsModalOpen(false)}
              isRulerEnabled={localRulerEnabled}
              activePageIndex={activePageIndex}
              pages={pages}
              saveModifiedPageHtml={saveModifiedPageHtml}
              setSelectedLayerId={setSelectedLayerId}
              selectedLayerIdRef={selectedLayerIdRef}
              setMultiSelectedIds={setMultiSelectedIds}
              multiSelectedIdsRef={multiSelectedIdsRef}
              setCurrentFrameId={setCurrentFrameId}
              currentFrameIdRef={currentFrameIdRef}
              drawOverlayHighlight={(...args) => drawOverlayHighlightRef.current?.(...args)}
              setActiveMainTool={setActiveMainTool}
              baseWidth={baseWidth}
              baseHeight={baseHeight}
              dragConstraintsRef={editorContainerRef}
            />
          )}

          {/* Draggable Icons Modal */}
          {!isPdfMode && (
            <IconsModal
              isOpen={isIconsModalOpen}
              onClose={() => setIsIconsModalOpen(false)}
              isRulerEnabled={localRulerEnabled}
              activePageIndex={activePageIndex}
              saveModifiedPageHtml={saveModifiedPageHtml}
              setSelectedLayerId={setSelectedLayerId}
              setActiveMainTool={setActiveMainTool}
              baseWidth={baseWidth}
              baseHeight={baseHeight}
              dragConstraintsRef={editorContainerRef}
            />
          )}

          {/* Modular Canvas Viewport */}
          <CanvasViewport
            zoomContainerRef={zoomContainerRef}
            pan={pan}
            zoom={zoom}
            pages={pages}
            activePageIndex={activePageIndex}
            localTrimView={localTrimView}
            isPopupEditor={isPopupEditor}
            canvasAspectRatio={canvasAspectRatio}
            isConvertedFlipbook={isConvertedFlipbook}
            selectedSelectTool={selectedSelectTool}
            activeTopTool={activeTopTool}
            setActiveTopTool={setActiveTopTool}
            activeMainTool={activeMainTool}
            setActiveMainTool={setActiveMainTool}
            selectedPenTool={selectedPenTool}
            handleSvgMouseDown={handleSvgMouseDown}
            handleSvgMouseMove={handleSvgMouseMove}
            handleSvgMouseUp={handleSvgMouseUp}
            handleSvgMouseLeave={handleSvgMouseLeave}
            handleSvgClick={handleSvgClick}
            handleSvgDoubleClick={handleSvgDoubleClick}
            handleSvgContextMenu={handleSvgContextMenu}
            isSpaceDown={isSpaceDown}
            selectedLayerId={selectedLayerId}
            multiSelectedIds={multiSelectedIds}
            isEditingTextRef={isEditingTextRef}
            marqueeOverlayRef1={marqueeOverlayRef1}
            updateElementAttribute={updateElementAttribute}
            onOpenTemplateModal={onOpenTemplateModal}
            setShowHotspotPopup={setShowHotspotPopup}
          />
          {/* Page Navigation Controls Widget */}
          <PageNavigationControls
            pages={pages}
            activePageIndex={activePageIndex}
            setActivePageIndex={setActivePageIndex}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
          />
        </div>
      </div>

      {/* Pages rendered on demand via PageCacheManager */}
    </div>
  );
};




export default MainEditor;

