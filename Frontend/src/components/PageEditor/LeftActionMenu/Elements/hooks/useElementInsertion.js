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
      const svg = container?.querySelector('svg');
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

      pageGroup.appendChild(el);

      if (typeof saveModifiedPageHtml === 'function') {
        saveModifiedPageHtml(pageIdx, svg);
      }
      if (typeof setSelectedLayerId === 'function') {
        setSelectedLayerId(finalId);
      }
      if (typeof setActiveMainTool === 'function') {
        setActiveMainTool('select');
      }
    },
    [activePageIndex, baseWidth, baseHeight, saveModifiedPageHtml, setSelectedLayerId, setActiveMainTool, throttleMs]
  );

  return { handleInsert };
}

export default useElementInsertion;
