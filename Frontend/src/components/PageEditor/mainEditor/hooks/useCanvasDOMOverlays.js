import { useEffect, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { NavIconRenderer } from '../../../CustomizedEditor/popups/NavIconStylesPopup';
import { DotRenderer } from '../../../CustomizedEditor/popups/DotStylesPopup';
import { getVisualBBox } from '../utils/geometryUtils';

/**
 * Hook managing canvas DOM overlays:
 * - Slideshow pagination dots and hover navigation arrows
 * - Global dynamic scrollbars observer (custom scrollbar thumbs and backgrounds)
 * - Inside/Outside stroke position rendering via SVG masks and clipPaths
 */
export const useCanvasDOMOverlays = ({ activePageIndex = 0 }) => {

  // Global observer for dynamic styling to bypass WebKit pseudo-element bugs and ensure styles persist on load
  useEffect(() => {
    let animationFrameId;

    const hexToRgbaStr = (color, opacityVal) => {
      if (!color || color === 'transparent' || color === 'none' || color === '#') return 'transparent';
      if (color.startsWith('rgba') || color.startsWith('hsla') || color.includes('gradient')) return color;
      let c = color.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const num = parseInt(c, 16);
      if (isNaN(num)) return color;
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      const op = parseFloat(opacityVal);
      const clampedOp = isNaN(op) ? 1 : (op > 1 ? op / 100 : op);
      return `rgba(${r}, ${g}, ${b}, ${clampedOp})`;
    };

    const updateScrollbarStyles = () => {
      const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument;
      const elsDoc = Array.from(document.querySelectorAll('[data-scrollbar-color], [data-bg-fill], [data-bg-stroke]'));
      const elsIframe = editorDoc ? Array.from(editorDoc.querySelectorAll('[data-scrollbar-color], [data-bg-fill], [data-bg-stroke]')) : [];
      const els = [...elsDoc, ...elsIframe];

      let cssRules = '';
      els.forEach(el => {
        if (el.id) {
          if (el.hasAttribute('data-scrollbar-color')) {
            cssRules += `[id="${el.id}"] .flipbook-text-scrollbar::-webkit-scrollbar-thumb { background-color: ${el.getAttribute('data-scrollbar-color')} !important; border-radius: 20px !important; border: 3px solid transparent !important; background-clip: padding-box !important; }\n`;
          }
          if (el.hasAttribute('data-bg-fill')) {
            const bgFill = el.getAttribute('data-bg-fill');
            const bgFillOpacity = el.getAttribute('data-bg-fill-opacity') !== null ? el.getAttribute('data-bg-fill-opacity') : '1';
            if (bgFill && bgFill !== 'transparent' && bgFill !== 'none' && bgFill !== '#') {
              const finalBgFill = hexToRgbaStr(bgFill, bgFillOpacity);
              if (finalBgFill.includes('gradient')) {
                cssRules += `[id="${el.id}"] .flipbook-text-outer, [id="${el.id}"] > div { background-image: ${finalBgFill} !important; background-color: transparent !important; --bg-fill: ${finalBgFill} !important; }\n`;
              } else {
                cssRules += `[id="${el.id}"] .flipbook-text-outer, [id="${el.id}"] > div { background-color: ${finalBgFill} !important; background-image: none !important; --bg-fill: ${finalBgFill} !important; }\n`;
              }
            } else {
              cssRules += `[id="${el.id}"] .flipbook-text-outer, [id="${el.id}"] > div { background-color: transparent !important; background-image: none !important; --bg-fill: transparent !important; }\n`;
            }
          }
          if (el.hasAttribute('data-bg-stroke')) {
            const bgStroke = el.getAttribute('data-bg-stroke');
            const bgStrokeOpacity = el.getAttribute('data-bg-stroke-opacity') !== null ? el.getAttribute('data-bg-stroke-opacity') : '1';
            const sw = el.getAttribute('data-bg-stroke-width') !== null ? el.getAttribute('data-bg-stroke-width') : 0;
            const dash = el.getAttribute('data-bg-stroke-dasharray');
            const borderStyle = (dash && dash !== 'none') ? 'dashed' : 'solid';
            if (bgStroke && bgStroke !== 'none' && bgStroke !== 'transparent' && bgStroke !== '#' && Number(sw) > 0) {
              const finalBgStroke = hexToRgbaStr(bgStroke, bgStrokeOpacity);
              cssRules += `[id="${el.id}"] .flipbook-text-outer, [id="${el.id}"] > div { border: ${sw}px ${borderStyle} ${finalBgStroke} !important; --bg-stroke: ${finalBgStroke} !important; --bg-stroke-width: ${sw} !important; }\n`;
            } else {
              cssRules += `[id="${el.id}"] .flipbook-text-outer, [id="${el.id}"] > div { border: none !important; }\n`;
            }
          }
        }
      });
      let styleTag = document.getElementById('global-scrollbar-styles');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'global-scrollbar-styles';
        document.head.appendChild(styleTag);
      }
      if (styleTag.textContent !== cssRules) {
        styleTag.textContent = cssRules;
        setTimeout(() => {
          els.forEach(el => {
            const innerDiv = el.querySelector('.flipbook-text-scrollbar');
            if (innerDiv) {
              const currentOverflow = innerDiv.style.overflowY;
              innerDiv.style.overflowY = 'hidden';
              void innerDiv.offsetHeight;
              innerDiv.style.overflowY = currentOverflow || 'auto';
            }
          });
        }, 10);
      }
      if (editorDoc) {
        let iframeStyleTag = editorDoc.getElementById('global-scrollbar-styles');
        if (!iframeStyleTag) {
          iframeStyleTag = editorDoc.createElement('style');
          iframeStyleTag.id = 'global-scrollbar-styles';
          (editorDoc.head || editorDoc.documentElement).appendChild(iframeStyleTag);
        }
        if (iframeStyleTag.textContent !== cssRules) {
          iframeStyleTag.textContent = cssRules;
        }
      }
    };

    const observer = new MutationObserver(() => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateScrollbarStyles);
    });

    updateScrollbarStyles();
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-scrollbar-color', 'data-bg-fill', 'data-bg-fill-opacity', 'data-bg-stroke', 'data-bg-stroke-opacity', 'data-bg-stroke-width', 'id'] });

    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument;
    if (editorDoc && editorDoc.body) {
      try {
        observer.observe(editorDoc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-scrollbar-color', 'data-bg-fill', 'data-bg-fill-opacity', 'data-bg-stroke', 'data-bg-stroke-opacity', 'data-bg-stroke-width', 'id'] });
      } catch { /* ignored */ }
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Global Stroke Overlay Sync
  useEffect(() => {
    const syncOverlays = () => {
      const container = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`);
      if (!container) return;
      const svg = container.querySelector('svg');
      if (!svg) return;

      let defs = svg.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.insertBefore(defs, svg.firstChild);
      }

      const shapes = svg.querySelectorAll('[data-stroke-position="Outside"], [data-stroke-position="Inside"]');
      shapes.forEach(el => {
        // Vector shapes (rect, circle, ellipse, path, polygon, etc.) keep stroke directly on the element!
        const isVectorShape = ['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line'].includes(el.tagName.toLowerCase()) ||
          el.getAttribute('data-type') === 'shape' ||
          el.getAttribute('data-is-element-shape') === 'true';

        const isMaskedShape = Boolean(
          el.getAttribute('data-mask-enabled') === 'true' ||
          el.getAttribute('data-masked-image-url') ||
          (el.getAttribute('fill') && el.getAttribute('fill').includes('url(#pattern-')) ||
          el.closest?.('[data-mask-enabled="true"]') !== null ||
          el.closest?.('[fill*="url(#pattern-"]') !== null
        );

        if (isVectorShape) {
          // Restore original stroke if previously hidden by overlay code
          const origStroke = el.getAttribute('data-original-stroke') || el.getAttribute('stroke') || el.getAttribute('data-stroke-color');
          if (origStroke && origStroke !== 'none') {
            el.setAttribute('stroke', origStroke);
            el.removeAttribute('data-original-stroke');
          }
          const origSw = parseFloat(el.getAttribute('data-stroke-width') || el.getAttribute('stroke-width') || '0');
          if (origSw > 0) {
            const pos = el.getAttribute('data-stroke-position') || 'Outside';
            if (isMaskedShape) {
              // Masked shapes: keep native stroke directly on the shape element in 100% lockstep
              el.setAttribute('stroke-width', origSw.toString());
              el.setAttribute('paint-order', 'normal');
              el.style.paintOrder = 'normal';
            } else if (pos === 'Outside') {
              el.setAttribute('stroke-width', (origSw * 2).toString());
              el.setAttribute('paint-order', 'stroke fill');
              el.style.paintOrder = 'stroke fill';
            } else if (pos === 'Inside') {
              el.setAttribute('stroke-width', (origSw * 2).toString());
              el.setAttribute('paint-order', 'fill stroke');
              el.style.paintOrder = 'fill stroke';
            } else {
              el.setAttribute('stroke-width', origSw.toString());
              el.setAttribute('paint-order', 'normal');
              el.style.paintOrder = 'normal';
            }
          }
          el.setAttribute('vector-effect', 'non-scaling-stroke');
          const existingOverlay = el.parentNode?.querySelector(`.svg-shape-stroke-overlay[data-target="${el.id}"]`);
          if (existingOverlay) existingOverlay.remove();
          const safeId = (el.id || '').replace(/[^a-zA-Z0-9-_]/g, '_');
          defs?.querySelector(`mask[id="mask-shape-${safeId}"]`)?.remove();
          defs?.querySelector(`clipPath[id="clip-shape-${safeId}"]`)?.remove();
          return;
        }

        // Skip elements that manage their own stroke offsets (Images, Videos, and their dedicated overlays)
        if (
          el.tagName.toLowerCase() === 'image' ||
          el.tagName.toLowerCase() === 'foreignobject' ||
          el.tagName.toLowerCase() === 'g' ||
          el.classList.contains('svg-image-stroke-overlay') ||
          el.classList.contains('svg-video-stroke-overlay')
        ) {
          const existingOverlay = el.parentNode?.querySelector(`.svg-shape-stroke-overlay[data-target="${el.id}"]`);
          if (existingOverlay) existingOverlay.remove();
          return;
        }
        const pos = el.getAttribute('data-stroke-position');
        const sw = parseFloat(el.getAttribute('data-stroke-width') || '0');
        if (sw <= 0) {
          const existingOverlay = el.parentNode?.querySelector(`.svg-shape-stroke-overlay[data-target="${el.id}"]`);
          if (existingOverlay) existingOverlay.remove();
          return;
        }

        // Hide original stroke and capture its color
        const currentStroke = el.getAttribute('stroke');
        if (currentStroke && currentStroke !== 'none') {
          el.setAttribute('data-original-stroke', currentStroke);
          el.setAttribute('stroke', 'none');
        }
        if (el.hasAttribute('stroke-width')) {
          el.removeAttribute('stroke-width');
        }
        el.setAttribute('paint-order', 'normal');
        el.style.paintOrder = 'normal';

        if (!el.id) {
          el.id = `shape-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
        }
        const safeElId = (el.id || 'unknown').replace(/[^a-zA-Z0-9-_]/g, '_');

        let overlay = el.parentNode?.querySelector(`.svg-shape-stroke-overlay[data-target="${el.id}"]`);
        if (!overlay) {
          overlay = document.createElementNS('http://www.w3.org/2000/svg', el.tagName);
          overlay.classList.add('svg-shape-stroke-overlay');
          overlay.setAttribute('data-target', el.id);
          overlay.style.pointerEvents = 'none';
          if (pos === 'Inside') {
            el.parentNode.insertBefore(overlay, el.nextSibling);
          } else {
            el.parentNode.insertBefore(overlay, el);
          }
        }

        if (pos === 'Inside') {
          let clip = defs.querySelector(`clipPath[id="clip-shape-${safeElId}"]`);
          if (!clip) {
            clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            clip.id = `clip-shape-${safeElId}`;
            const clipShape = document.createElementNS('http://www.w3.org/2000/svg', el.tagName);
            clip.appendChild(clipShape);
            defs.appendChild(clip);
          }
          overlay.setAttribute('clip-path', `url(#clip-shape-${safeElId})`);
          overlay.removeAttribute('mask');
        } else {
          let mask = defs.querySelector(`mask[id="mask-shape-${safeElId}"]`);
          if (!mask) {
            mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            mask.id = `mask-shape-${safeElId}`;
            const maskBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            maskBg.setAttribute('x', '-500%');
            maskBg.setAttribute('y', '-500%');
            maskBg.setAttribute('width', '1000%');
            maskBg.setAttribute('height', '1000%');
            maskBg.setAttribute('fill', 'white');
            const maskShape = document.createElementNS('http://www.w3.org/2000/svg', el.tagName);
            maskShape.setAttribute('fill', 'black');
            mask.appendChild(maskBg);
            mask.appendChild(maskShape);
            defs.appendChild(mask);
          }
          overlay.setAttribute('mask', `url(#mask-shape-${safeElId})`);
          overlay.removeAttribute('clip-path');
        }

        // Sync visual attributes
        overlay.setAttribute('stroke', el.getAttribute('data-original-stroke') || el.getAttribute('data-stroke-color') || '#000');
        overlay.setAttribute('stroke-width', (sw * 2).toString());
        overlay.setAttribute('fill', 'none');
        overlay.setAttribute('stroke-opacity', el.getAttribute('data-stroke-opacity') || '1');
        overlay.setAttribute('vector-effect', 'non-scaling-stroke');

        const dashArray = el.getAttribute('data-stroke-dasharray') || el.getAttribute('stroke-dasharray');
        if (dashArray && dashArray !== 'none') overlay.setAttribute('stroke-dasharray', dashArray);
        else overlay.removeAttribute('stroke-dasharray');

        overlay.setAttribute('stroke-linecap', el.getAttribute('stroke-linecap') || 'butt');
        overlay.setAttribute('stroke-linejoin', (el.getAttribute('stroke-linecap') || 'butt') === 'round' ? 'round' : 'miter');

        // Sync geometry
        const attrsToSync = ['x', 'y', 'width', 'height', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'points'];
        const refShape = pos === 'Inside' ? defs.querySelector(`clipPath[id="clip-shape-${safeElId}"]`)?.firstChild : defs.querySelector(`mask[id="mask-shape-${safeElId}"]`)?.lastChild;

        attrsToSync.forEach(attr => {
          const val = el.getAttribute(attr);
          if (val !== null) {
            overlay.setAttribute(attr, val);
            if (refShape) refShape.setAttribute(attr, val);
          } else {
            overlay.removeAttribute(attr);
            if (refShape) refShape.removeAttribute(attr);
          }
        });

        // ONLY copy transform to the overlay, NOT to the clip/mask shapes (which use userSpaceOnUse coordinate system)
        const transformAttr = el.getAttribute('transform');
        if (transformAttr !== null) overlay.setAttribute('transform', transformAttr);
        else overlay.removeAttribute('transform');

        overlay.style.transform = el.style.transform;
        overlay.style.translate = el.style.translate;
        overlay.style.scale = el.style.scale;
        overlay.style.rotate = el.style.rotate;
        // Do NOT copy style.transform to refShape, because the mask/clip automatically operates
        // in the user coordinate space of the overlay. Applying it again causes double-transform bugs.
      });

      // Sync video / iframe elements inside foreignObjects
      svg.querySelectorAll('foreignObject iframe').forEach(iframe => {
        if (iframe.closest && iframe.closest('[data-type="map"], g[id^="map-"]')) return;
        const fo = iframe.closest('foreignObject');
        if (fo) {
          const foW = parseFloat(fo.getAttribute('width') || '0');
          const foH = parseFloat(fo.getAttribute('height') || '0');
          const origW = parseFloat(iframe.getAttribute('data-original-width')) || 640;
          const origH = parseFloat(iframe.getAttribute('data-original-height')) || 360;
          iframe.setAttribute('data-original-width', origW.toString());
          iframe.setAttribute('data-original-height', origH.toString());
          iframe.setAttribute('width', origW.toString());
          iframe.setAttribute('height', origH.toString());
          iframe.style.setProperty('width', origW + 'px', 'important');
          iframe.style.setProperty('height', origH + 'px', 'important');
          iframe.style.setProperty('transform-origin', '0 0', 'important');
          
          const isInteractive = fo.getAttribute('data-video-interactive') === 'true';
          iframe.style.setProperty('pointer-events', isInteractive ? 'auto' : 'none', 'important');
          iframe.style.setProperty('border', 'none', 'important');
          iframe.style.setProperty('display', 'block', 'important');

          if (foW > 0 && foH > 0 && origW > 0 && origH > 0) {
            const scaleX = foW / origW;
            const scaleY = foH / origH;
            iframe.style.setProperty('transform', `scale(${scaleX}, ${scaleY})`, 'important');
          }
        }
      });
      svg.querySelectorAll('foreignObject video').forEach(video => {
        const fo = video.closest('foreignObject');
        const isInteractive = fo ? fo.getAttribute('data-video-interactive') === 'true' : true;
        video.style.setProperty('width', '100%', 'important');
        video.style.setProperty('height', '100%', 'important');
        video.style.setProperty('display', 'block', 'important');
        video.style.setProperty('pointer-events', isInteractive ? 'auto' : 'none', 'important');
      });

      // Sync Image Masks
      svg.querySelectorAll('[data-masked-image-url]').forEach(shapeEl => {
        const shapeId = shapeEl.id;
        if (!shapeId) return;
        const imgEl = svg.querySelector(`[id="masked-img-${shapeId}"]`);
        const clipPath = defs?.querySelector(`clipPath[id="clip-shape-${shapeId}"]`);
        if (imgEl && clipPath) {
          const clipShape = clipPath.firstElementChild;
          if (clipShape) {
            // Sync geometry attributes (NO transform)
            const attrsToSync = ['x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points'];
            attrsToSync.forEach(attr => {
              const val = shapeEl.getAttribute(attr);
              if (val !== null) clipShape.setAttribute(attr, val);
              else clipShape.removeAttribute(attr);
            });
          }
          
          // Sync Image properties
          const transform = shapeEl.getAttribute('transform');
          if (transform) imgEl.setAttribute('transform', transform);
          else imgEl.removeAttribute('transform');

          if (typeof shapeEl.getBBox === 'function') {
             try {
                const bbox = shapeEl.getBBox();
                if (bbox && bbox.width > 0 && bbox.height > 0) {
                   imgEl.setAttribute('x', bbox.x);
                   imgEl.setAttribute('y', bbox.y);
                   imgEl.setAttribute('width', bbox.width);
                   imgEl.setAttribute('height', bbox.height);
                }
             } catch { /* ignored */ }
          }
        }
      });

      // Cleanup orphan overlays
      svg.querySelectorAll('.svg-shape-stroke-overlay').forEach(overlay => {
        const targetId = overlay.getAttribute('data-target');
        const target = svg.querySelector(`[id="${targetId}"]`);
        if (!target || target.getAttribute('data-stroke-position') === 'Center' || parseFloat(target.getAttribute('data-stroke-width') || '0') <= 0) {
          overlay.remove();
          const safeId = (targetId || '').replace(/[^a-zA-Z0-9-_]/g, '_');
          const mask = defs?.querySelector(`mask[id="mask-shape-${safeId}"]`);
          if (mask) mask.remove();
          const clip = defs?.querySelector(`clipPath[id="clip-shape-${safeId}"]`);
          if (clip) clip.remove();
        }
      });
    };

    const interval = setInterval(syncOverlays, 100);
    return () => clearInterval(interval);
  }, [activePageIndex]);
};

export default useCanvasDOMOverlays;
