import { useRef, useCallback } from 'react';
import { clampCenterToAABB, parseSvgViewBox } from '../helpers/GeometryAABB';

/**
 * useElementInsertion
 * Encapsulates element insertion into the SVG canvas, coordinate clamping,
 * orphaned child migration into the page frame group, and editor state updates.
 */
export function useElementInsertion({
  activePageIndex = 0,
  baseWidth = 210,
  baseHeight = 297,
  saveModifiedPageHtml,
  setSelectedLayerId,
  selectedLayerIdRef,
  setMultiSelectedIds,
  multiSelectedIdsRef,
  setCurrentFrameId,
  currentFrameIdRef,
  drawOverlayHighlight,
  setActiveMainTool,
  throttleMs = 250,
}) {
  const lastInsertTimeRef = useRef(0);

  const handleInsert = useCallback(
    (item, customX, customY, targetPageIndex) => {
      if (!item || typeof item.insert !== 'function') return;

      const now = Date.now();
      if (now - lastInsertTimeRef.current < throttleMs) return;
      lastInsertTimeRef.current = now;

      const pageIdx = targetPageIndex !== undefined ? targetPageIndex : activePageIndex;
      let container = document.querySelector(`.page-svg-container[data-page-index="${pageIdx}"]`);
      if (!container) {
        container = document.querySelector('.active-page-outline') || document.querySelector('.page-svg-container');
      }
      const svg = container?.querySelector('svg') || document.querySelector('.page-svg-container svg') || document.querySelector('svg');
      if (!svg) return;

      // ViewBox boundary calculations via AABB Geometry algorithm
      const bounds = parseSvgViewBox(svg, baseWidth || 210, baseHeight || 297);
      const { x: cx, y: cy } = clampCenterToAABB({
        cx: customX,
        cy: customY,
        bounds,
        margin: 20,
      });

      const uniqueId = `el-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

      const el = item.insert(cx, cy);
      if (!el) return;

      if (!el.getAttribute('id')) {
        el.setAttribute('id', uniqueId);
      }
      const finalId = el.getAttribute('id') || uniqueId;
      if (!el.getAttribute('data-name')) {
        const defaultNamesByCategory = {
          buttons: 'Button',
          text: 'Typography',
          shapes: 'Shape',
          tables: 'Table',
          'qr-code': 'QR Code',
          'google-maps': 'Map',
          slideshow: 'Slideshow',
          masking: 'Image Frame',
          decorators: 'Decorator',
          audio: 'Audio',
          embeds: 'Embed Frame'
        };
        const defaultName = defaultNamesByCategory[item.category] || item.name || 'Element';
        el.setAttribute('data-name', defaultName);
      }
      if (!el.getAttribute('data-type')) {
        const defaultTypeByCategory = {
          buttons: 'button',
          text: 'text',
          shapes: 'shape',
          tables: 'table-frame',
          'qr-code': 'qrcode',
          'google-maps': 'map',
          slideshow: 'slideshow',
          masking: 'image-frame',
          decorators: 'decorator',
          audio: 'audio-frame',
          embeds: 'embed-frame'
        };
        el.setAttribute('data-type', defaultTypeByCategory[item.category] || 'shape');
      }

      // Target the page frame group rather than the root SVG
      const pageGroup =
        svg.querySelector('[data-type="frame"]') ||
        svg.querySelector('[data-name="Overlay"]')?.parentElement ||
        svg.querySelector('g[id^="g-"]') ||
        svg.querySelector('g') ||
        svg;

      // Migrate any orphaned elements directly on SVG into the page frame group
      if (pageGroup !== svg) {
        Array.from(svg.children).forEach((child) => {
          if (child === pageGroup) return;
          const tag = child.tagName?.toLowerCase();
          if (['defs', 'metadata', 'style', 'title', 'desc'].includes(tag)) return;
          if (
            child.getAttribute('data-name') === 'Document Shield' ||
            child.getAttribute('data-type') === 'shield'
          ) {
            return;
          }
          pageGroup.appendChild(child);
        });
      }

      if (!pageGroup.id && pageGroup !== svg) {
        pageGroup.id = 'frame-' + Date.now();
      }

      // If inserted element has nested <defs> (e.g. audio/button gradients or filters),
      // ensure they are also mirrored in the top-level <svg><defs> so url(#...) always resolves reliably.
      const nestedDefs = el.querySelectorAll('defs > *');
      if (nestedDefs.length > 0) {
        let svgDefs = svg.querySelector(':scope > defs') || svg.querySelector('defs');
        if (!svgDefs) {
          svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          svg.insertBefore(svgDefs, svg.firstChild);
        }
        nestedDefs.forEach((defItem) => {
          if (defItem.id && !svgDefs.querySelector(`[id="${defItem.id}"]`)) {
            svgDefs.appendChild(defItem.cloneNode(true));
          }
        });
      }

      pageGroup.appendChild(el);

      if (typeof saveModifiedPageHtml === 'function') {
        saveModifiedPageHtml(pageIdx, svg);
      }
      if (typeof setSelectedLayerId === 'function') {
        setSelectedLayerId(finalId);
      }
      if (selectedLayerIdRef) {
        selectedLayerIdRef.current = finalId;
      }
      if (typeof setMultiSelectedIds === 'function') {
        setMultiSelectedIds(new Set([finalId]));
      }
      if (multiSelectedIdsRef) {
        multiSelectedIdsRef.current = new Set([finalId]);
      }
      if (typeof setActiveMainTool === 'function') {
        setActiveMainTool('select');
      }
      const frameIdToSet = pageGroup && pageGroup !== svg && pageGroup.id ? pageGroup.id : null;
      if (frameIdToSet) {
        if (typeof setCurrentFrameId === 'function') {
          setCurrentFrameId(frameIdToSet);
        }
        if (currentFrameIdRef) {
          currentFrameIdRef.current = frameIdToSet;
        }
      }

      setTimeout(() => {
        const mountedEl = document.getElementById(finalId) || el;
        if (mountedEl && typeof drawOverlayHighlight === 'function') {
          drawOverlayHighlight(mountedEl, 'selected');
        }
      }, 50);
    },
    [activePageIndex, baseWidth, baseHeight, saveModifiedPageHtml, setSelectedLayerId, selectedLayerIdRef, setMultiSelectedIds, multiSelectedIdsRef, setCurrentFrameId, currentFrameIdRef, drawOverlayHighlight, setActiveMainTool, throttleMs]
  );

  return { handleInsert };
}

export default useElementInsertion;
