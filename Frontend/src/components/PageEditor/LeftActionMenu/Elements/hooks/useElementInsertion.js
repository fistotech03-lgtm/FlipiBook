import { useRef, useCallback } from 'react';
import { clampCenterToAABB, parseSvgViewBox } from '../helpers/GeometryAABB';
import { parseLayersFromSVG } from '../../../utils/editorUtils';

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
      const container = document.querySelector(`.page-svg-container[data-page-index="${pageIdx}"]`);
      const canvasContent = container?.querySelector('[id^="canvas-content-"]');
      const svg = canvasContent ? canvasContent.querySelector('svg') : container?.querySelector('svg:not([id^="highlight-overlay-"]):not(#marquee-selection-overlay)');
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
          audio: 'audio-frame',
          embeds: 'embed-frame'
        };
        el.setAttribute('data-type', defaultTypeByCategory[item.category] || 'shape');
      }

      // Helper to identify if a group is an element container rather than the page frame
      const isElementContainer = (node) => {
        if (!node || typeof node.getAttribute !== 'function') return false;
        const dt = (node.getAttribute('data-type') || '').toLowerCase();
        const elementTypes = [
          'embed-frame', 'audio-frame', 'table-frame', 'image-frame', 'shape',
          'button', 'qrcode', 'qr-code', 'map', 'slideshow', 'video', 'image',
          'group', 'text', 'decorator', 'animated-decorator', 'hotspot'
        ];
        if (elementTypes.includes(dt)) return true;
        if (
          node.getAttribute('data-is-image-group') === 'true' ||
          node.getAttribute('data-is-video-group') === 'true' ||
          node.getAttribute('data-is-gif-group') === 'true' ||
          node.getAttribute('data-is-element-shape') === 'true' ||
          node.getAttribute('data-is-element-button') === 'true' ||
          node.getAttribute('data-is-element-typography') === 'true' ||
          node.getAttribute('data-is-slideshow') === 'true'
        ) {
          return true;
        }
        return false;
      };

      // Target the true page frame group rather than an element group or the root SVG
      const directChildren = Array.from(svg.children || []);
      let pageGroup = directChildren.find(
        (child) =>
          child.tagName?.toLowerCase() === 'g' &&
          (child.getAttribute('data-type') === 'frame' || /^Page\s*\d+$/i.test(child.getAttribute('data-name') || '')) &&
          !isElementContainer(child)
      );

      if (!pageGroup) {
        const overlayParent = svg.querySelector('[data-name="Overlay"]')?.parentElement;
        if (overlayParent && !isElementContainer(overlayParent)) {
          pageGroup = overlayParent;
        }
      }

      if (!pageGroup) {
        pageGroup = svg;
      }

      // Migrate any orphaned elements directly on SVG into the page frame group (only if genuine page frame)
      if (pageGroup !== svg && pageGroup.getAttribute('data-type') === 'frame') {
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
          if (child.getAttribute('data-type') !== 'frame') {
            pageGroup.appendChild(child);
          }
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

      const immediateLayers = typeof parseLayersFromSVG === 'function' ? parseLayersFromSVG(svg) : null;

      if (typeof saveModifiedPageHtml === 'function') {
        saveModifiedPageHtml(pageIdx, svg, immediateLayers);
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
