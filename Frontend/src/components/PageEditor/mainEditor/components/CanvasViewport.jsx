import { useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
const SelectionTooltip = () => null;
import { checkIsAnimatedWebp } from '../../utils/editorUtils';
import { optimizeImageForWeb, shouldOptimizeImage } from '../../../../utils/imageOptimizer';
import { syncDOM, syncChildrenKeyed } from '../utils/geometryUtils';
import {
  PENCIL_CURSOR,
  PEN_CURSOR,
  SHAPE_CURSOR,
  TEXT_TOOL_CURSOR,
  svgGlobalStyles
} from '../utils/constants';
import { normalizeForeignObjectNamespaces, healTableElementNode } from '../../LeftActionMenu/Elements/utils/tableElementUtils';
import { applyTrimViewToSvg } from '../utils/trimViewUtils';
import { DEFAULT_FRAME_IMAGE } from '../../LeftActionMenu/Elements/utils/imageFramingUtils';

import { insertPixabayImage } from '../../LeftActionMenu/Images';
export const CanvasViewport = ({
  zoomContainerRef,
  pan = { x: 0, y: 0 },
  zoom = 90,
  pages = [],
  activePageIndex = 0,
  localTrimView,
  isPopupEditor,
  canvasAspectRatio = '210 / 297',
  isConvertedFlipbook,
  selectedSelectTool,
  activeTopTool,
  setActiveTopTool,
  activeMainTool,
  setActiveMainTool,
  selectedPenTool,
  handleSvgMouseDown,
  handleSvgMouseMove,
  handleSvgMouseLeave,
  handleSvgClick,
  handleSvgDoubleClick,
  handleSvgMouseUp,
  handleSvgContextMenu,
  isSpaceDown,
  selectedLayerId,
  multiSelectedIds = new Set(),
  isEditingTextRef,
  marqueeOverlayRef1,
  updateElementAttribute,
  onOpenTemplateModal,
  setShowHotspotPopup
}) => {
  const lastRenderedHtmlRef = useRef({});

  const getHtmlToRender = (index, currentHtml) => {
    let clean = currentHtml || '';

    // Auto-heal any corrupted asset URLs with trailing base64 garbage
    clean = clean.replace(/(assets\/(?:Image|video|gif|audio|3D_Model|download)\/[A-Za-z0-9_.-]+)(?:[\s/]+[A-Za-z0-9+/=_%-]+)+(?=["'])/g, "$1");

    // Auto-purge legacy heavy 57KB JPEG frame placeholders to restore lightning speed
    if (clean.includes('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD')) {
      clean = clean.replace(/data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAASABIAAD[A-Za-z0-9+/=]+/g, DEFAULT_FRAME_IMAGE);
    }

    // Auto-fix for corrupted templates: strip out the pink XML parsererror and any baked-in custom controls
    if (clean.includes('parsererror') || clean.includes('id="custom-ctrl-')) {
      clean = clean.replace(/<parsererror[\s\S]*?<\/parsererror>/gi, '');
      clean = clean.replace(/<[^>]*id="custom-ctrl-[^>]*>.*?[\s\S]*?<\/[^>]*>/gi, '');
    }
    clean = clean.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');

    // Ensure invisible Document Shield exists above PDF Background in converted document pages
    if ((isConvertedFlipbook || clean.includes('PDF Background') || clean.includes('pdf-vector-layer')) && !clean.includes('data-name="Document Shield"')) {
      const bgStartMatch = clean.match(/<g\b[^>]*data-(?:name="PDF Background"|type="pdf-vector-layer")[^>]*>/i);
      if (bgStartMatch) {
        const startIndex = bgStartMatch.index;
        let depth = 0;
        let i = startIndex;
        let closeIndex = -1;
        while (i < clean.length) {
          if (clean.startsWith('<g', i) && (clean[i + 2] === ' ' || clean[i + 2] === '>')) {
            depth++;
            i += 2;
          } else if (clean.startsWith('</g>', i) || clean.startsWith('</svg:g>', i)) {
            depth--;
            const tagLen = clean.startsWith('</svg:g>', i) ? 8 : 4;
            if (depth === 0) {
              closeIndex = i + tagLen;
              break;
            }
            i += tagLen;
          } else {
            i++;
          }
        }
        if (closeIndex !== -1) {
          const vbMatch = clean.match(/viewBox=["']\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*["']/i);
          const wVal = vbMatch ? vbMatch[3] : '100%';
          const hVal = vbMatch ? vbMatch[4] : '100%';
          const shieldStr = `\n    <rect id="shield-page-${index}" data-name="Document Shield" data-type="shield" x="0" y="0" width="${wVal}" height="${hVal}" fill="none" opacity="0" pointer-events="all" style="pointer-events: all;" />`;
          clean = clean.slice(0, closeIndex) + shieldStr + clean.slice(closeIndex);
        }
      }
    }

    // Auto-heal: ensure audio-fill-layer is always a <rect> and not a corrupted <path data-shape-type="rectangle">
    if (clean.includes('audio-fill-layer')) {
      clean = clean.replace(/<path\b([^>]*\bclass="[^"]*audio-fill-layer[^"]*"[^]*?)(?:\/>|><\/path>)/gi, (match, attrs) => {
        let cleanedAttrs = attrs.replace(/\s*d="[^"]*"/gi, '').replace(/\s*data-shape-type="[^"]*"/gi, '');
        return `<rect${cleanedAttrs} />`;
      });
      clean = clean.replace(/(<rect\b[^>]*\bclass="[^"]*audio-fill-layer[^"]*"[^>]*)data-shape-type="[^"]*"/gi, '$1');
    }

    // Auto-heal: Ensure foreignObjects retain explicit XHTML namespace so HTML elements render
    clean = normalizeForeignObjectNamespaces(clean);

    if (isEditingTextRef?.current && lastRenderedHtmlRef.current[index]) {
      return lastRenderedHtmlRef.current[index];
    }
    lastRenderedHtmlRef.current[index] = clean;
    return clean;
  };

  // Promote the zoom layer only during a pan gesture (pure translate keeps the bitmap sharp).
  // Never during zoom: a promoted layer is scaled as a bitmap and looks blurry until re-rasterised.
  useEffect(() => {
    const el = zoomContainerRef?.current;
    if (!el) return undefined;
    el.style.willChange = 'transform';
    const t = setTimeout(() => { el.style.willChange = 'auto'; }, 150);
    return () => clearTimeout(t);
  }, [pan.x, pan.y]);

  useEffect(() => {
    const el = zoomContainerRef?.current;
    if (el) el.style.willChange = 'auto';
  }, [zoom]);

  return (
          <div
            id="main-zoom-container"
            ref={zoomContainerRef}
            className="flex items-center justify-center origin-center relative"
            style={{
              // No permanent will-change / backface-visibility: those freeze the page into ONE bitmap
              // rasterised at its base size, so zoomed text looks blurry and every DOM update (applying a
              // property to any element) re-rasterises it — visible as text glitching. will-change is
              // switched on only while zooming/panning (effect below) and dropped right after, so the
              // browser re-renders crisp at the current zoom.
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
              '--fbe-inv-zoom': 100 / (zoom || 100),
              cursor: isSpaceDown
                ? 'grab'
                : (activeMainTool === 'shapes'
                    ? SHAPE_CURSOR
                    : (activeMainTool === 'pen'
                        ? (selectedPenTool === 'pencil' ? PENCIL_CURSOR : PEN_CURSOR)
                        : (activeMainTool === 'type'
                            ? TEXT_TOOL_CURSOR
                            : (activeMainTool === 'hand' ? 'grab' : undefined)))),
            }}
          >
            {/* Pages Container Centered */}
            <div className="flex items-center justify-center gap-[0] relative z-10 shadow-[0_4px_20px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] rounded-sm">
              {/* Single A4 Canvas Page */}
              {pages.length > 0 && pages[activePageIndex] && (
                <div className="relative group/page">
                  {/* A4 Canvas Page Inner */}
                  <div
                    className="relative z-0 flex flex-col bg-white group/inner transition-shadow duration-300 overflow-visible"
                    style={isPopupEditor ? {
                      width: `min(55vw, 72vh * (${canvasAspectRatio}))`,
                      height: `min(72vh, 55vw / (${canvasAspectRatio}))`,
                      borderRadius: '1.2vw',
                      backgroundColor: '#ffffff'
                    } : {
                      height: '78vh',
                      aspectRatio: canvasAspectRatio,
                      minHeight: '400px',
                    }}
                  >
                    {/* Page Content */}
                    <div
                      className={`flex-1 w-full relative page-svg-container ${isConvertedFlipbook ? 'is-pdf-project' : ''} ${localTrimView ? 'trim-view-on' : 'trim-view-off'} overflow-visible tool-${selectedSelectTool} ${(activeTopTool !== 'interaction' && activeTopTool !== 'animation') ? 'hide-free-frames' : ''} ${activeTopTool !== 'interaction' ? 'disable-interaction-layers' : ''} ${activeTopTool === 'interaction' ? 'interaction-mode-active' : ''} ${(activeMainTool === 'pen' && selectedPenTool === 'pencil') ? 'pencil-mode' : ''} ${(activeMainTool === 'pen' && selectedPenTool === 'pen') ? 'pen-mode' : ''} ${(activeMainTool === 'shapes') ? 'shape-mode' : ''} ${(activeMainTool === 'type') ? 'type-mode' : ''}`}
                      data-page-index={activePageIndex}
                    >
                      <style>{svgGlobalStyles}</style>
                      {(() => {
                        const displayIndex = activePageIndex;
                        const isShapeActive = activeMainTool === 'shapes';
                        const isPencilActive = activeMainTool === 'pen' && selectedPenTool === 'pencil';
                        const isPenToolActive = activeMainTool === 'pen';
                        const isTypeActive = activeMainTool === 'type';

                        const pageHtml = pages[displayIndex]?.html;
                        const pageLayers = pages[displayIndex]?.layers || [];
                        const hasLayerElements = pageLayers.some(
                          (layer) =>
                            (Array.isArray(layer.children) && layer.children.length > 0) ||
                            (layer.type !== 'g' && layer.type !== 'frame')
                        );
                        const hasHtmlElements = (() => {
                          if (!pageHtml) return false;
                          const cleanHtml = pageHtml
                            .replace(/<defs[\s\S]*?<\/defs>/gi, '')
                            .replace(/<style[\s\S]*?<\/style>/gi, '')
                            .replace(/<rect\b[^>]*data-name=["\']Overlay["\'][^>]*\/>/gi, '')
                            .replace(/<rect\b[^>]*data-name=["\']Overlay["\'][^>]*>[\s\S]*?<\/rect>/gi, '')
                            .replace(/<rect\b[^>]*data-type=["\']background["\'][^>]*\/>/gi, '')
                            .replace(/<rect\b[^>]*data-type=["\']background["\'][^>]*>[\s\S]*?<\/rect>/gi, '');
                          return /<(path|image|text|foreignobject|circle|ellipse|polygon|polyline|use|video)\b/i.test(cleanHtml);
                        })();

                        const isPageEmpty =
                          !pages[displayIndex]?.isHidden &&
                          !hasHtmlElements &&
                          (!pageHtml || (!hasLayerElements && pageLayers.length <= 1));

                        return (
                          <div
                            className={`absolute inset-0 w-full h-full overflow-visible flex items-center justify-center ${isPopupEditor ? 'bg-transparent' : 'bg-white'}`}
                            style={{ cursor: (isEditingTextRef?.current ? 'default' : (isPencilActive ? PENCIL_CURSOR : (isPenToolActive ? PEN_CURSOR : (isShapeActive ? SHAPE_CURSOR : (isTypeActive ? TEXT_TOOL_CURSOR : 'default'))))) }}
                          >
                            {pageHtml && (
                              <div
                                key={`canvas-content-${displayIndex}`}
                                id={`canvas-content-${displayIndex}`}
                                className="w-full h-full flex items-center justify-center"
                                ref={(el) => {
                                  if (el) {
                                    const newHtml = getHtmlToRender(displayIndex, pages[displayIndex]?.html);
                                    if (window.__skipCanvasUpdateForPage === displayIndex) {
                                      window.__skipCanvasUpdateForPage = -1;
                                      el.__lastHtml = newHtml;
                                      el.__lastPageIndex = displayIndex;
                                    } else if (el.__lastHtml !== newHtml) {
                                      // Fast path: Direct innerHTML swap is hardware accelerated and avoids recursive syncDOM freezes
                                      // unless actively editing inline text where DOM input focus must be preserved.
                                      const isTextEditing = isEditingTextRef?.current;
                                      // Same page: patch in place (keyed by id). Only changed nodes/attributes are
                                      // touched, so other text boxes, images and live iframes are never rebuilt —
                                      // a full innerHTML swap re-created every text on each property change (glitch).
                                      // Full swap only for the first render / a page switch, or if patching fails.
                                      const isSamePage = el.__lastPageIndex === displayIndex && el.childNodes.length > 0;
                                      if (el.__lastPageIndex !== displayIndex || !isTextEditing) {
                                        let patched = false;
                                        if (isSamePage) {
                                          try {
                                            const parsed = new DOMParser().parseFromString(newHtml, 'text/html');
                                            syncChildrenKeyed(el, parsed.body);
                                            patched = true;
                                          } catch (err) {
                                            console.warn('[canvas] in-place patch failed, full re-render', err);
                                          }
                                        }
                                        if (!patched) el.innerHTML = newHtml;
                                        el.__lastPageIndex = displayIndex;
                                        el.__lastHtml = newHtml;
                                        // Auto-heal any path.audio-fill-layer into rect.audio-fill-layer
                                        el.querySelectorAll?.('path.audio-fill-layer').forEach(pathEl => {
                                          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                                          Array.from(pathEl.attributes).forEach(attr => {
                                            if (attr.name !== 'd' && attr.name !== 'data-shape-type') {
                                              rect.setAttribute(attr.name, attr.value);
                                            }
                                          });
                                          if (pathEl.parentNode) pathEl.parentNode.replaceChild(rect, pathEl);
                                        });
                                        el.querySelectorAll?.('rect.audio-fill-layer[data-shape-type]').forEach(rectEl => {
                                          rectEl.removeAttribute('data-shape-type');
                                        });
                                        // Auto-heal Table elements: restore inner table structure if missing or corrupted
                                        el.querySelectorAll?.('[data-type="table-frame"], g[id^="table-"]').forEach(tblG => {
                                          healTableElementNode(tblG);
                                        });
                                      } else {
                                        const parser = new DOMParser();
                                        const doc = parser.parseFromString(newHtml, 'text/html');
                                        const newChildren = Array.from(doc.body.childNodes);

                                        const oldChildren = Array.from(el.childNodes);
                                        const maxLength = Math.max(oldChildren.length, newChildren.length);

                                        for (let i = 0; i < maxLength; i++) {
                                          if (!oldChildren[i]) {
                                            el.appendChild(newChildren[i].cloneNode(true));
                                          } else if (!newChildren[i]) {
                                            el.removeChild(oldChildren[i]);
                                          } else {
                                            syncDOM(oldChildren[i], newChildren[i]);
                                          }
                                        }

                                        el.__lastHtml = newHtml;
                                        el.__lastPageIndex = displayIndex;
                                      }
                                      if (localTrimView) {
                                        const pageSvg = el.querySelector('svg');
                                        if (pageSvg) {
                                          applyTrimViewToSvg(pageSvg, true);
                                        }
                                      }
                                    }
                                  }
                                }}
                                onMouseDown={(e) => handleSvgMouseDown(displayIndex, e)}
                                onMouseMove={(e) => handleSvgMouseMove(displayIndex, e)}
                                onMouseUp={(e) => handleSvgMouseUp && handleSvgMouseUp(e)}
                                onPointerUp={(e) => handleSvgMouseUp && handleSvgMouseUp(e)}
                                onMouseLeave={handleSvgMouseLeave}
                                onClick={handleSvgClick}
                                onDoubleClick={(e) => handleSvgDoubleClick && handleSvgDoubleClick(e)}
                                onDragOver={(e) => {
                                  e.preventDefault(); // Necessary to allow dropping external assets
                                  e.dataTransfer.dropEffect = 'copy';
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (typeof setActiveMainTool === 'function') {
                                    setActiveMainTool('select');
                                  }
                                  try {
                                    const svg = e.currentTarget.querySelector('svg');
                                    if (!svg) return;

                                    // Convert screen coordinates to SVG coordinates
                                    const pt = svg.createSVGPoint();
                                    pt.x = e.clientX;
                                    pt.y = e.clientY;
                                    const ctm = svg.getScreenCTM(); // also used to scale dropped icon sizes
                                    const svgP = pt.matrixTransform(ctm.inverse());
                                    const dropPoint = { x: svgP.x, y: svgP.y };

                                    let targetShapeId = undefined;
                                    // Use elementsFromPoint to penetrate highlight overlays, selection boxes, and handles
                                    const elementsUnderCursor = typeof document.elementsFromPoint === 'function'
                                      ? document.elementsFromPoint(e.clientX, e.clientY)
                                      : [e.target];

                                    for (const hitEl of elementsUnderCursor) {
                                      if (!hitEl || typeof hitEl.closest !== 'function') continue;
                                      if (hitEl.closest?.('#ghost-layer, [id^="highlight-overlay"], .selection-overlay-layer, [data-name="Overlay"], [data-name="Document Shield"]')) {
                                        continue;
                                      }
                                      const sg = hitEl.closest('[data-is-element-shape="true"], [data-type="shape"], [data-shape-type], g[id^="shape-"]');
                                      if (sg && sg.id && !sg.id.includes('mask') && !sg.id.includes('clip')) {
                                        targetShapeId = sg.id;
                                        break;
                                      }
                                    }

                                    // Fallback: check e.target directly
                                    if (!targetShapeId && e.target) {
                                      const sg = e.target.closest('[data-is-element-shape="true"], [data-type="shape"], [data-shape-type], g[id^="shape-"]');
                                      if (sg && sg.id && !sg.id.includes('mask') && !sg.id.includes('clip')) {
                                        targetShapeId = sg.id;
                                      }
                                    }

                                    let data = null;

                                    // 1. Try reading JSON data
                                    const rawJson = e.dataTransfer.getData('application/json');
                                    if (rawJson) {
                                      try { data = JSON.parse(rawJson); } catch { /* ignored */ }
                                    }

                                    // 2. Try reading URL or text from external window/tab (e.g. Canva assets, web pages)
                                    if (!data) {
                                      const rawHtml = e.dataTransfer.getData('text/html');
                                      const rawUri = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
                                      let extractedUrl = null;

                                      if (rawHtml) {
                                        const match = rawHtml.match(/(?:src|href)=["']([^"']+)["']/i);
                                        if (match && match[1]) {
                                          extractedUrl = match[1];
                                        }
                                      }

                                      if (!extractedUrl && rawUri && rawUri.trim()) {
                                        const lines = rawUri.trim().split(/[\r\n]+/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
                                        if (lines.length > 0) {
                                          extractedUrl = lines[0];
                                        }
                                      }

                                      if (extractedUrl) {
                                        const trimmed = extractedUrl.trim();
                                        if (trimmed.startsWith('http') || trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('/')) {
                                          const lower = trimmed.toLowerCase();
                                          if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo')) {
                                            data = { type: 'video', url: trimmed };
                                          } else if (lower.endsWith('.gif')) {
                                            data = { type: 'gif', url: trimmed };
                                          } else {
                                            data = { type: 'image', url: trimmed };
                                          }
                                        }
                                      }
                                    }

                                    // 3. Try reading external files dropped directly from Desktop / File Explorer
                                    if (!data && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                      const files = Array.from(e.dataTransfer.files);
                                      let hasUnsupported = false;
                                      files.forEach(async (file, idx) => {
                                        const fileUrl = URL.createObjectURL(file);
                                        const offsetPoint = { x: dropPoint.x + idx * 20, y: dropPoint.y + idx * 20 };

                                        if (file.type.startsWith('image/')) {
                                          let isGif = file.type === 'image/gif';
                                          if (!isGif && file.type.includes('webp')) {
                                            isGif = await checkIsAnimatedWebp(file);
                                          }
                                          let finalFile = file;
                                          let finalUrl = fileUrl;
                                          if (!isGif && !file.type.includes('svg') && shouldOptimizeImage(file)) {
                                            try {
                                              const opt = await optimizeImageForWeb(file, { maxDimension: 3840, quality: 0.94 });
                                              if (opt?.file) {
                                                finalFile = opt.file;
                                                finalUrl = opt.dataUrl || URL.createObjectURL(opt.file);
                                              }
                                            } catch (optErr) {
                                              console.warn('[CanvasViewport] Drop image optimize fallback:', optErr);
                                            }
                                          }
                                          window.dispatchEvent(new CustomEvent('add-image-to-editor', {
                                            detail: {
                                              pageIndex: displayIndex,
                                              url: finalUrl,
                                              file: finalFile,
                                              gifUrl: isGif ? finalUrl : undefined,
                                              name: finalFile.name,
                                              type: isGif ? 'gif' : 'image',
                                              dropPoint: offsetPoint,
                                              targetShapeId
                                            }
                                          }));
                                        } else if (file.type.startsWith('video/')) {
                                          window.dispatchEvent(new CustomEvent('upload-video-to-editor', {
                                            detail: {
                                              pageIndex: displayIndex,
                                              videoUrl: fileUrl,
                                              file,
                                              originalUrl: fileUrl,
                                              dropPoint: offsetPoint
                                            }
                                          }));
                                        } else {
                                          hasUnsupported = true;
                                        }
                                      });
                                      if (hasUnsupported) {
                                        toast.error('Only Image, Video, and GIF formats are allowed.');
                                      }
                                      return;
                                    }

                                    if (!data) return;

                                    if (data.type === 'hotspot') {
                                      window.dispatchEvent(new CustomEvent('add-hotspot-to-editor', {
                                        detail: {
                                          pageIndex: displayIndex,
                                          icon: data.icon,
                                          dropPoint,
                                          presetId: data.icon?.presetId
                                        }
                                      }));
                                      setShowHotspotPopup(false);
                                    } else if (data.type === 'icon' || data.type === 'lucide-icon') {
                                      let dropSize = null;
                                      const scaleX = ctm ? ctm.a : 1;
                                      const scaleY = ctm ? ctm.d : 1;
                                      if ((data.dragSize || (data.dragWidth && data.dragHeight)) && scaleX && scaleY) {
                                        const w = data.dragWidth || data.dragSize;
                                        const h = data.dragHeight || data.dragSize;
                                        dropSize = {
                                          width: w / scaleX,
                                          height: h / scaleY,
                                        };
                                      }
                                      window.dispatchEvent(new CustomEvent('add-icon-to-editor', {
                                        detail: {
                                          pageIndex: displayIndex,
                                          icon: data.icon || { name: data.name, html: data.html },
                                          dropPoint,
                                          dropSize
                                        }
                                      }));
                                    } else if (data.type === 'pixabay' && data.url) {
                                      insertPixabayImage({ url: data.url, name: data.name, pageIndex: displayIndex, dropPoint, targetShapeId })
                                        .catch((err) => console.warn('[CanvasViewport] Pixabay insert failed:', err));
                                    } else if (data.type === 'image' || data.type === 'upload' || data.url) {
                                      window.dispatchEvent(new CustomEvent('add-image-to-editor', {
                                        detail: {
                                          pageIndex: displayIndex,
                                          url: data.url || data.src,
                                          name: data.name || 'Image',
                                          type: 'image',
                                          dropPoint,
                                          targetShapeId
                                        }
                                      }));
                                    } else if (data.type === 'gif') {
                                      window.dispatchEvent(new CustomEvent('add-image-to-editor', {
                                        detail: {
                                          pageIndex: displayIndex,
                                          url: data.url || data.src,
                                          gifUrl: data.url || data.src,
                                          name: data.name || 'GIF',
                                          type: 'gif',
                                          dropPoint,
                                          targetShapeId
                                        }
                                      }));
                                    } else if (data.type === 'element' || data.type === 'element-item' || data.elementId) {
                                      const ctm = svg.getScreenCTM();
                                      const scaleX = (ctm && ctm.a) ? Math.abs(ctm.a) : 1;
                                      const scaleY = (ctm && ctm.d) ? Math.abs(ctm.d) : 1;
                                      const dropSize = (data.dragWidth && data.dragHeight)
                                        ? {
                                            width: data.dragWidth / scaleX,
                                            height: data.dragHeight / scaleY
                                          }
                                        : undefined;
                                      window.dispatchEvent(new CustomEvent('add-element-to-editor', {
                                        detail: {
                                          pageIndex: displayIndex,
                                          elementId: data.elementId,
                                          dropPoint,
                                          dropSize
                                        }
                                      }));
                                    } else if (data.type === 'video') {
                                      window.dispatchEvent(new CustomEvent('upload-video-to-editor', {
                                        detail: {
                                          pageIndex: displayIndex,
                                          videoUrl: data.url || data.src,
                                          file: data.file,
                                          originalUrl: data.url || data.src,
                                          dropPoint
                                        }
                                      }));
                                    }
                                  } catch (err) {
                                    console.error('[MainEditor] Drop error:', err);
                                  }
                                }}
                                onContextMenu={(e) => handleSvgContextMenu(displayIndex, e)}
                              />
                            )}
                            {pages[displayIndex]?.isHidden && (
                              <div key={`hidden-placeholder-${displayIndex}`} className="w-full h-full flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px] z-20 absolute inset-0 pointer-events-auto">
                                <Icon icon="ant-design:eye-invisible-outlined" width="3vw" height="3vw" style={{ strokeWidth: 0.2 }} className="text-gray-500 mb-[1vw] svg-icon-override" />
                                <span className="text-gray-700 font-semibold text-[1.2vw]">This page is hidden</span>
                                <span className="text-gray-500 text-[0.85vw] mt-[0.5vw]">It will not be shown in the flipbook.</span>
                              </div>
                            )}
                            
                            {!pages[displayIndex]?.isHidden && (
                              <>
                                {/* Trim View Backdrop Mat & Page Shadow */}
                                {localTrimView && (
                                  <div
                                    key={`trim-view-mat-${displayIndex}`}
                                    className="pointer-events-none absolute inset-0 z-10"
                                    style={{
                                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08), 0 0 0 99999px rgba(244, 245, 247, 0.78)',
                                    }}
                                  />
                                )}

                                {/* Selection Overlay (Overlay rotated element perfectly) */}
                                <svg
                                  id={`highlight-overlay-${displayIndex}`}
                                  className={`absolute inset-0 w-full h-full selection-overlay-layer z-20 transition-opacity duration-200 ${isSpaceDown ? 'opacity-0' : 'opacity-100'}`}
                                  style={{ overflow: 'visible', pointerEvents: 'none', zIndex: 20 }}
                                />

                                {/* HTML Overlay for Resize Handles (Clickable) */}
                                <div
                                  id={`highlight-overlay-html-${displayIndex}`}
                                  className={`absolute inset-0 w-full h-full z-30 transition-opacity duration-200 ${isSpaceDown ? 'opacity-0' : 'opacity-100'}`}
                                  style={{ overflow: 'visible', pointerEvents: 'none', zIndex: 30 }}
                                />
                                <AnimatePresence>
                                  {selectedLayerId && !isEditingTextRef.current && multiSelectedIds.size <= 1 && (activeTopTool === 'animation') && (
                                    <SelectionTooltip
                                      selectedId={selectedLayerId}
                                      multiSelectedIds={multiSelectedIds}
                                      zoom={zoom}
                                      setActiveTopTool={setActiveTopTool}
                                      pageIndex={displayIndex}
                                      activePageIndex={activePageIndex}
                                      updateElementAttribute={updateElementAttribute}
                                      activeTopTool={activeTopTool}
                                    />
                                  )}
                                </AnimatePresence>
                              </>
                            )}

                            {/* Marquee Selection Box */}
                            {!isConvertedFlipbook && (
                              <svg
                                ref={marqueeOverlayRef1}
                                id="marquee-selection-overlay"
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  pointerEvents: 'none',
                                  zIndex: 1000,
                                  display: 'none',
                                  overflow: 'visible'
                                }}
                              >
                                <rect
                                  x="0"
                                  y="0"
                                  width="0"
                                  height="0"
                                  fill="rgba(82, 85, 202, 0.1)"
                                  stroke="#5255CA"
                                  strokeWidth={(1 / (zoom / 100)).toFixed(3)}
                                  shapeRendering="geometricPrecision"
                                  strokeLinejoin="miter"
                                />
                              </svg>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

  );
};

export default CanvasViewport;
