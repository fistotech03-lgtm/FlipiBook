/**
 * shapeMaskUtils.js
 * Standalone utilities for SVG Shape Image Masking in FlipiBook.
 * Provides unified, normalized objectBoundingBox pattern masking for both
 * preset shapes and user-drawn shapes (paths, rects, ellipses, polygons, stars).
 */
import { DEFAULT_FRAME_IMAGE } from './imageFramingUtils';
import { parseGradient } from '../../../../ColorPicker';

/**
 * Applies either an SVG linear/radial gradient (via <defs>) or a solid color to an element.
 * SVG <path>, <rect>, <circle> etc. cannot accept CSS "linear-gradient(...)" directly in fill.
 * They must reference a paint server via "url(#gradId)".
 *
 * @param {Object} params
 * @param {Element} params.targetEl - The element receiving the fill (<path>, <rect class="mask-bg-fill">, etc.)
 * @param {string} params.fillVal - Color string, e.g. '#ff0000', 'linear-gradient(...)', 'url(#...)'
 * @param {number|string} [params.fillOp] - Opacity (0..1 or 0..100)
 * @param {string} [params.idPrefix='grad'] - Prefix for the generated <linearGradient> ID
 * @param {Document} [params.doc=document]
 * @param {Element} [params.svgRoot]
 * @returns {{ isGradient: boolean, fillAttr: string, gradId?: string, parsed?: Object }}
 */
export const applySvgGradientOrSolid = ({
  targetEl,
  fillVal,
  fillOp,
  idPrefix = 'grad',
  doc = document,
  svgRoot
}) => {
  if (!targetEl) return { isGradient: false, fillAttr: 'none' };

  const ownerDoc = targetEl.ownerDocument || doc || document;
  const root = svgRoot || targetEl.closest?.('svg') || ownerDoc.querySelector?.('svg');

  // Handle empty or transparent fills
  if (!fillVal || fillVal === 'none' || fillVal === 'transparent' || fillVal === '#') {
    targetEl.setAttribute('fill', 'none');
    return { isGradient: false, fillAttr: 'none' };
  }

  // Already a URL reference (e.g. url(#...))
  if (typeof fillVal === 'string' && fillVal.toLowerCase().startsWith('url(#')) {
    targetEl.setAttribute('fill', fillVal);
    if (fillOp !== undefined && fillOp !== null) {
      const opNum = parseFloat(fillOp);
      const normOp = opNum > 1 ? (opNum / 100).toString() : opNum.toString();
      targetEl.setAttribute('fill-opacity', normOp);
    }
    return { isGradient: true, fillAttr: fillVal };
  }

  // Check if it's a CSS gradient
  const isGradient = typeof fillVal === 'string' && fillVal.includes('gradient');
  if (isGradient && root) {
    const parsed = parseGradient(fillVal);
    if (parsed && parsed.stops && parsed.stops.length > 0) {
      let defs = root.querySelector('defs');
      if (!defs) {
        defs = ownerDoc.createElementNS('http://www.w3.org/2000/svg', 'defs');
        root.insertBefore(defs, root.firstChild);
      }

      const cleanPrefix = idPrefix.replace(/[^a-zA-Z0-9_-]/g, '_');
      const gradId = `${cleanPrefix}-${Math.random().toString(36).substr(2, 6)}`;

      // Remove any previous gradient elements matching this prefix
      Array.from(defs.querySelectorAll(`[id^="${cleanPrefix}"]`)).forEach(el => el.remove());

      const svgGradType = parsed.type === 'Radial' ? 'radialGradient' : 'linearGradient';
      const gradEl = ownerDoc.createElementNS('http://www.w3.org/2000/svg', svgGradType);
      gradEl.id = gradId;

      if (parsed.type === 'Radial') {
        const radius = parsed.radius || 100;
        gradEl.setAttribute('cx', '50%');
        gradEl.setAttribute('cy', '50%');
        gradEl.setAttribute('r', (radius / 2) + '%');
      } else {
        const angle = parsed.angle || 0;
        const angleRad = (angle * Math.PI) / 180;
        const dx = Math.sin(angleRad) * 50;
        const dy = -Math.cos(angleRad) * 50;
        gradEl.setAttribute('x1', Math.round(50 - dx) + '%');
        gradEl.setAttribute('y1', Math.round(50 - dy) + '%');
        gradEl.setAttribute('x2', Math.round(50 + dx) + '%');
        gradEl.setAttribute('y2', Math.round(50 + dy) + '%');
      }

      parsed.stops.forEach(s => {
        const stop = ownerDoc.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', `${s.offset}%`);
        stop.setAttribute('stop-color', s.color);
        const rawOp = (s.opacity !== undefined && s.opacity !== null) ? s.opacity : 1;
        const stopOp = rawOp > 1 ? rawOp / 100 : rawOp;
        stop.setAttribute('stop-opacity', String(stopOp));
        gradEl.appendChild(stop);
      });

      defs.appendChild(gradEl);

      const fillUrl = `url(#${gradId})`;
      targetEl.setAttribute('fill', fillUrl);
      if (fillOp !== undefined && fillOp !== null) {
        const opNum = parseFloat(fillOp);
        const normOp = opNum > 1 ? (opNum / 100).toString() : opNum.toString();
        targetEl.setAttribute('fill-opacity', normOp);
      }

      return {
        isGradient: true,
        fillAttr: fillUrl,
        gradId,
        parsed
      };
    }
  }

  // Solid color fallback
  targetEl.setAttribute('fill', fillVal);
  if (fillOp !== undefined && fillOp !== null) {
    const opNum = parseFloat(fillOp);
    const normOp = opNum > 1 ? (opNum / 100).toString() : opNum.toString();
    targetEl.setAttribute('fill-opacity', normOp);
  }
  return { isGradient: false, fillAttr: fillVal };
};

/**
 * Ensures a pattern contains an actual <image> node.
 * If the pattern only has a <use> reference (common in raw frame presets),
 * it converts it into a standalone <image> node referencing the resolved image URL.
 * @param {Element} pattern
 * @param {Element} [selectedElement]
 * @param {Document} [doc=document]
 * @returns {Element|null}
 */
export const ensurePatternImageNode = (pattern, selectedElement, doc = document) => {
  if (!pattern) return null;
  let imgNode = pattern.querySelector('image, img');
  if (!imgNode) {
    const useNode = pattern.querySelector('use');
    if (useNode) {
      const href = useNode.getAttribute('href') || useNode.getAttribute('xlink:href') || '';
      const targetId = href.replace('#', '');
      const root = selectedElement?.closest?.('svg') || selectedElement?.ownerDocument || doc;
      const refImg = root.querySelector?.(`image[id="${targetId}"], img[id="${targetId}"]`);
      const srcUrl = refImg ? (refImg.getAttribute('href') || refImg.getAttribute('xlink:href')) : DEFAULT_FRAME_IMAGE;

      imgNode = (doc || document).createElementNS('http://www.w3.org/2000/svg', 'image');
      imgNode.setAttribute('href', srcUrl || DEFAULT_FRAME_IMAGE);
      imgNode.setAttribute('xlink:href', srcUrl || DEFAULT_FRAME_IMAGE);

      const useTransform = useNode.getAttribute('transform');
      if (useTransform) {
        imgNode.setAttribute('transform', useTransform);
        const refW = refImg?.getAttribute('width') || '1254';
        const refH = refImg?.getAttribute('height') || '1254';
        imgNode.setAttribute('width', refW);
        imgNode.setAttribute('height', refH);
        imgNode.setAttribute('preserveAspectRatio', 'none');
      } else {
        const patId = pattern.getAttribute('id');
        const rootDoc = selectedElement?.ownerDocument || doc || document;
        const slotShape = (selectedElement?.closest?.('svg') || rootDoc).querySelector?.(`[fill*="${patId}"]`);
        let slotW = null;
        let slotH = null;
        if (slotShape) {
          if (slotShape.hasAttribute('width') && slotShape.hasAttribute('height')) {
            slotW = parseFloat(slotShape.getAttribute('width'));
            slotH = parseFloat(slotShape.getAttribute('height'));
          } else {
            try {
              const bb = slotShape.getBBox();
              if (bb.width > 0 && bb.height > 0) {
                slotW = bb.width;
                slotH = bb.height;
              }
            } catch (e) {}
          }
        }
        if (slotW && slotH && slotW > 0 && slotH > 0 && Math.abs(slotW - slotH) > 0.1) {
          const naturalW = 1254;
          const naturalH = 1254;
          let scaleX, scaleY, transX, transY;
          if (slotW < slotH) {
            scaleY = 1 / naturalH;
            scaleX = scaleY * (slotH / slotW);
            transX = 0.5 - 0.5 * (slotH / slotW);
            transY = 0;
          } else {
            scaleX = 1 / naturalW;
            scaleY = scaleX * (slotW / slotH);
            transX = 0;
            transY = 0.5 - 0.5 * (slotW / slotH);
          }
          imgNode.setAttribute('transform', `matrix(${scaleX.toFixed(8)} 0 0 ${scaleY.toFixed(8)} ${transX.toFixed(6)} ${transY.toFixed(6)})`);
          imgNode.setAttribute('width', String(naturalW));
          imgNode.setAttribute('height', String(naturalH));
          imgNode.setAttribute('preserveAspectRatio', 'none');
        } else {
          imgNode.setAttribute('preserveAspectRatio', 'none');
          imgNode.setAttribute('width', '1');
          imgNode.setAttribute('height', '1');
          imgNode.setAttribute('x', '0');
          imgNode.setAttribute('y', '0');
        }
      }
      pattern.removeChild(useNode);
      pattern.appendChild(imgNode);
    }
  } else {
    const href = imgNode.getAttribute('href') || imgNode.getAttribute('xlink:href');
    if (!href || href === '__FRAME_IMAGE__') {
      imgNode.setAttribute('href', DEFAULT_FRAME_IMAGE);
      imgNode.setAttribute('xlink:href', DEFAULT_FRAME_IMAGE);
    }
    // Also check if pattern has patternContentUnits="objectBoundingBox" but imgNode was squished with width="1" height="1" and no transform
    if (pattern.getAttribute('patternContentUnits') === 'objectBoundingBox' && (!imgNode.hasAttribute('transform') || !imgNode.getAttribute('transform')) && imgNode.getAttribute('width') === '1' && imgNode.getAttribute('height') === '1') {
      const patId = pattern.getAttribute('id');
      const rootDoc = selectedElement?.ownerDocument || doc || document;
      const slotShape = (selectedElement?.closest?.('svg') || rootDoc).querySelector?.(`[fill*="${patId}"]`);
      let slotW = null;
      let slotH = null;
      if (slotShape) {
        if (slotShape.hasAttribute('width') && slotShape.hasAttribute('height')) {
          slotW = parseFloat(slotShape.getAttribute('width'));
          slotH = parseFloat(slotShape.getAttribute('height'));
        } else {
          try {
            const bb = slotShape.getBBox();
            if (bb.width > 0 && bb.height > 0) {
              slotW = bb.width;
              slotH = bb.height;
            }
          } catch (e) {}
        }
      }
      if (slotW && slotH && slotW > 0 && slotH > 0 && Math.abs(slotW - slotH) > 0.1) {
        const naturalW = 1254;
        const naturalH = 1254;
        let scaleX, scaleY, transX, transY;
        if (slotW < slotH) {
          scaleY = 1 / naturalH;
          scaleX = scaleY * (slotH / slotW);
          transX = 0.5 - 0.5 * (slotH / slotW);
          transY = 0;
        } else {
          scaleX = 1 / naturalW;
          scaleY = scaleX * (slotW / slotH);
          transX = 0;
          transY = 0.5 - 0.5 * (slotW / slotH);
        }
        imgNode.setAttribute('transform', `matrix(${scaleX.toFixed(8)} 0 0 ${scaleY.toFixed(8)} ${transX.toFixed(6)} ${transY.toFixed(6)})`);
        imgNode.setAttribute('width', String(naturalW));
        imgNode.setAttribute('height', String(naturalH));
        imgNode.removeAttribute('x');
        imgNode.removeAttribute('y');
        imgNode.setAttribute('preserveAspectRatio', 'none');
      }
    }
  }
  return imgNode;
};

/**
 * Resolves the primary shape element, parent SVG root, and <defs> container.
 * @param {Element} selectedElement 
 * @param {Document} [doc=document] 
 * @returns {{ shapeEl: Element|null, svgRoot: Element|null, defs: Element|null }}
 */
export const findShapeAndSvgRoot = (selectedElement, doc = document) => {
  if (!selectedElement) return { shapeEl: null, svgRoot: null, defs: null };

  let shapeEl = null;
  if (['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(selectedElement.tagName?.toLowerCase())) {
    shapeEl = selectedElement;
  } else {
    shapeEl = selectedElement.querySelector('path, polygon, rect, circle, ellipse');
  }

  let svgRoot = selectedElement;
  while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
    svgRoot = svgRoot.parentElement;
  }
  if (!svgRoot) {
    svgRoot = selectedElement.closest('svg') || doc.querySelector('svg');
  }

  let defs = svgRoot ? svgRoot.querySelector('defs') : null;
  if (!defs && svgRoot) {
    defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgRoot.insertBefore(defs, svgRoot.firstChild);
  }

  return { shapeEl, svgRoot, defs };
};

/**
 * Inspects an element and returns its current shape image mask state.
 * @param {Object} params
 * @param {Element} params.selectedElement
 * @param {Object} [params.selectedElementProps]
 * @param {Document} [params.doc=document]
 * @returns {Object}
 */
export const getShapeMaskState = ({ selectedElement, selectedElementProps, doc = document }) => {
  const defaultState = {
    isMaskEnabled: false,
    slotImage: null,
    slotOriginalImage: null,
    slotImageName: 'Image Name .jpg',
    slotImageMeta: '300 X 300 • 24MB',
    slotRotation: 0,
    slotOpacity: 100,
    slotFilters: { exposure: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, highlights: 0, shadows: 0 }
  };

  if (!selectedElement) return defaultState;

  const hasMaskEnabledAttr = (
    selectedElement.getAttribute('data-mask-enabled') === 'true' ||
    selectedElement.querySelector('[data-mask-enabled="true"]') !== null ||
    (selectedElement.getAttribute('fill') && selectedElement.getAttribute('fill').includes('url(#pattern-')) ||
    selectedElement.querySelector('[fill*="url(#pattern-"]') !== null ||
    Boolean(selectedElementProps?.['data-mask-enabled'] === 'true') ||
    Boolean(selectedElementProps?.['data-masked-image-url'])
  );

  if (!hasMaskEnabledAttr) {
    return defaultState;
  }

  let result = {
    ...defaultState,
    isMaskEnabled: true
  };

  const { shapeEl, svgRoot } = findShapeAndSvgRoot(selectedElement, doc);
  const target = shapeEl || selectedElement;

  const fill = target.getAttribute('fill') || selectedElement.getAttribute('fill') || '';
  if (fill.includes('url(')) {
    const match = fill.match(/url\(['"]?#([^)'"]+)['"]?\)/);
    if (match && match[1]) {
      const patternId = match[1];
      const pattern = (svgRoot || selectedElement.closest?.('svg') || doc).querySelector?.(`pattern[id="${patternId}"]`) ||
        doc.getElementById(patternId) ||
        document.getElementById(patternId);

      if (pattern) {
        const imgNode = ensurePatternImageNode(pattern, selectedElement, doc);
        if (imgNode) {
          const newHref = imgNode.getAttribute('href') || imgNode.getAttribute('xlink:href');
          if (newHref) {
            result.slotImage = newHref;
            const savedName = target.getAttribute('data-slot-image-name') || selectedElement.getAttribute('data-slot-image-name');
            if (savedName) result.slotImageName = savedName;

            const savedMeta = target.getAttribute('data-slot-image-meta') || selectedElement.getAttribute('data-slot-image-meta');
            if (savedMeta) result.slotImageMeta = savedMeta;

            const savedOrig = target.getAttribute('data-slot-original-url') || selectedElement.getAttribute('data-slot-original-url');
            result.slotOriginalImage = savedOrig || newHref;

            const pt = pattern.getAttribute('patternTransform') || '';
            const ptMatch = pt.match(/rotate\(([-0-9.]+)/);
            if (ptMatch) {
              result.slotRotation = parseFloat(ptMatch[1]);
            } else {
              const savedRot = target.getAttribute('data-slot-rotation') || selectedElement.getAttribute('data-slot-rotation');
              if (savedRot) {
                result.slotRotation = parseFloat(savedRot);
              } else {
                const tf = imgNode.getAttribute('transform') || '';
                const rMatch = tf.match(/rotate\(([-0-9.]+)/);
                if (rMatch) result.slotRotation = parseFloat(rMatch[1]);
              }
            }

            const opAttr = imgNode.getAttribute('opacity') || target.getAttribute('data-slot-opacity') || selectedElement.getAttribute('data-slot-opacity');
            if (opAttr !== null && opAttr !== undefined && opAttr !== '') {
              const parsedOp = parseFloat(opAttr);
              result.slotOpacity = parsedOp <= 1 ? Math.round(parsedOp * 100) : Math.round(parsedOp);
            } else {
              result.slotOpacity = 100;
            }

            result.slotPanX = parseFloat(target.getAttribute('data-slot-pan-x') || selectedElement.getAttribute('data-slot-pan-x') || '0');
            result.slotPanY = parseFloat(target.getAttribute('data-slot-pan-y') || selectedElement.getAttribute('data-slot-pan-y') || '0');
            result.slotZoom = parseFloat(target.getAttribute('data-slot-zoom') || selectedElement.getAttribute('data-slot-zoom') || '1');
          }
        }
      }
    }
  } else if (target.getAttribute('data-masked-image-url') || selectedElement.getAttribute('data-masked-image-url') || selectedElementProps?.['data-masked-image-url']) {
    const fallbackUrl = target.getAttribute('data-masked-image-url') || selectedElement.getAttribute('data-masked-image-url') || selectedElementProps?.['data-masked-image-url'];
    result.slotImage = fallbackUrl;
    result.slotOriginalImage = target.getAttribute('data-slot-original-url') || selectedElement.getAttribute('data-slot-original-url') || fallbackUrl;
    result.slotPanX = parseFloat(target.getAttribute('data-slot-pan-x') || selectedElement.getAttribute('data-slot-pan-x') || selectedElementProps?.['data-slot-pan-x'] || '0');
    result.slotPanY = parseFloat(target.getAttribute('data-slot-pan-y') || selectedElement.getAttribute('data-slot-pan-y') || selectedElementProps?.['data-slot-pan-y'] || '0');
    result.slotZoom = parseFloat(target.getAttribute('data-slot-zoom') || selectedElement.getAttribute('data-slot-zoom') || selectedElementProps?.['data-slot-zoom'] || '1');
  }

  // Parse filter data attributes from DOM or props
  const getProp = (attr) => (
    target?.getAttribute?.(attr) ||
    selectedElement?.getAttribute?.(attr) ||
    selectedElementProps?.[attr] ||
    '0'
  );

  result.slotFilters = {
    exposure: parseFloat(getProp('data-effect-exposure')),
    contrast: parseFloat(getProp('data-effect-contrast')),
    saturation: parseFloat(getProp('data-effect-saturation')),
    temperature: parseFloat(getProp('data-effect-temperature')),
    tint: parseFloat(getProp('data-effect-tint')),
    highlights: parseFloat(getProp('data-effect-highlights')),
    shadows: parseFloat(getProp('data-effect-shadows')),
  };

  return result;
};

/**
 * Applies an image mask to an SVG shape using normalized objectBoundingBox coordinates.
 * @param {Object} params
 * @param {Element} params.selectedElement
 * @param {string} params.selectedLayerId
 * @param {number} params.activePageIndex
 * @param {string} params.dataUrl
 * @param {string} [params.name]
 * @param {string} [params.sizeStr]
 * @param {string} [params.originalDataUrl]
 * @param {Function} params.updateElementAttribute
 * @param {Document} [params.doc=document]
 * @param {Function} [params.onSuccess]
 */
export const applyShapeImageMask = ({
  selectedElement,
  selectedLayerId,
  activePageIndex,
  dataUrl,
  name = null,
  sizeStr = null,
  originalDataUrl = null,
  updateElementAttribute,
  doc = document,
  onSuccess
}) => {
  if (!selectedElement || !selectedLayerId || !dataUrl) return;

  const { shapeEl, svgRoot, defs } = findShapeAndSvgRoot(selectedElement, doc);
  if (!shapeEl) return;

  shapeEl.setAttribute('data-mask-enabled', 'true');
  selectedElement.setAttribute('data-mask-enabled', 'true');
  if (!shapeEl.hasAttribute('data-original-fill')) {
    shapeEl.setAttribute('data-original-fill', shapeEl.getAttribute('fill') || '#3194FC');
  }
  if (!shapeEl.hasAttribute('data-original-fill-opacity')) {
    shapeEl.setAttribute('data-original-fill-opacity', shapeEl.getAttribute('fill-opacity') || '1');
  }
  selectedElement.setAttribute('data-original-fill', shapeEl.getAttribute('data-original-fill'));
  selectedElement.setAttribute('data-original-fill-opacity', shapeEl.getAttribute('data-original-fill-opacity'));

  // Ensure stroke stays directly on shapeEl so dragging the shape moves stroke and image fill together in lockstep
  const curStroke = shapeEl.getAttribute('data-original-stroke') || shapeEl.getAttribute('stroke') || shapeEl.getAttribute('data-stroke-color');
  if (curStroke && curStroke !== 'none') {
    shapeEl.setAttribute('stroke', curStroke);
    shapeEl.removeAttribute('data-original-stroke');
    const pos = shapeEl.getAttribute('data-stroke-position') || 'Outside';
    const origSw = parseFloat(shapeEl.getAttribute('data-stroke-width') || shapeEl.getAttribute('stroke-width') || '1');
    if (pos === 'Outside') {
      shapeEl.setAttribute('stroke-width', (origSw * 2).toString());
      shapeEl.setAttribute('paint-order', 'stroke fill');
      shapeEl.style.paintOrder = 'stroke fill';
    } else if (pos === 'Inside') {
      shapeEl.setAttribute('stroke-width', (origSw * 2).toString());
      shapeEl.setAttribute('paint-order', 'fill stroke');
      shapeEl.style.paintOrder = 'fill stroke';
    } else {
      shapeEl.setAttribute('stroke-width', origSw.toString());
      shapeEl.setAttribute('paint-order', 'normal');
      shapeEl.style.paintOrder = 'normal';
    }
  }

  // Remove any detached stroke overlays or legacy clipping masks for this element
  const rootSvgEl = svgRoot || selectedElement.closest?.('svg') || doc.querySelector?.('svg');
  if (rootSvgEl && selectedLayerId) {
    rootSvgEl.querySelectorAll(`.svg-shape-stroke-overlay[data-target="${selectedLayerId}"]`).forEach(el => el.remove());
    const safeId = selectedLayerId.replace(/[^a-zA-Z0-9-_]/g, '_');
    rootSvgEl.querySelectorAll(`mask[id="mask-shape-${safeId}"], clipPath[id="clip-shape-${safeId}"]`).forEach(el => el.remove());
  }

  const effectiveDefs = defs || (() => {
    const newDefs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
    if (svgRoot) svgRoot.insertBefore(newDefs, svgRoot.firstChild);
    return newDefs;
  })();

  const patternId = `pattern-${selectedLayerId}`;
  let pattern = effectiveDefs.querySelector(`pattern[id="${patternId}"]`);
  if (!pattern) {
    pattern = doc.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', patternId);
    effectiveDefs.appendChild(pattern);
  }

  pattern.setAttribute('patternUnits', 'objectBoundingBox');
  pattern.setAttribute('patternContentUnits', 'objectBoundingBox');
  pattern.setAttribute('width', '1');
  pattern.setAttribute('height', '1');
  pattern.removeAttribute('x');
  pattern.removeAttribute('y');
  pattern.removeAttribute('patternTransform');
  pattern.removeAttribute('viewBox');

  shapeEl.setAttribute('fill', `url(#${patternId})`);
  if (selectedElement !== shapeEl) {
    selectedElement.setAttribute('fill', `url(#${patternId})`);
  }

  const img = new window.Image();
  img.onload = () => {
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    const dims = `${imgW} X ${imgH}`;
    const meta = `${dims} • ${sizeStr || '24MB'}`;
    const origToSave = originalDataUrl || dataUrl;

    if (name) shapeEl.setAttribute('data-slot-image-name', name);
    shapeEl.setAttribute('data-slot-image-meta', meta);
    shapeEl.setAttribute('data-slot-original-url', origToSave);
    shapeEl.setAttribute('data-masked-image-url', origToSave);

    if (selectedElement !== shapeEl) {
      if (name) selectedElement.setAttribute('data-slot-image-name', name);
      selectedElement.setAttribute('data-slot-image-meta', meta);
      selectedElement.setAttribute('data-slot-original-url', origToSave);
      selectedElement.setAttribute('data-masked-image-url', origToSave);
    }

    let bbox;
    try {
      bbox = shapeEl.getBBox();
    } catch {
      bbox = { x: 0, y: 0, width: 100, height: 100 };
    }
    const baseX = bbox.x;
    const baseY = bbox.y;
    const baseW = bbox.width || 100;
    const baseH = bbox.height || 100;

    shapeEl.setAttribute('data-slot-base-x', String(baseX));
    shapeEl.setAttribute('data-slot-base-y', String(baseY));
    shapeEl.setAttribute('data-slot-base-w', String(baseW));
    shapeEl.setAttribute('data-slot-base-h', String(baseH));
    if (selectedElement !== shapeEl) {
      selectedElement.setAttribute('data-slot-base-x', String(baseX));
      selectedElement.setAttribute('data-slot-base-y', String(baseY));
      selectedElement.setAttribute('data-slot-base-w', String(baseW));
      selectedElement.setAttribute('data-slot-base-h', String(baseH));
    }

    let bgRect = pattern.querySelector('rect.mask-bg-fill');
    if (!bgRect) {
      bgRect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('class', 'mask-bg-fill');
      bgRect.setAttribute('width', '1');
      bgRect.setAttribute('height', '1');
      bgRect.setAttribute('x', '0');
      bgRect.setAttribute('y', '0');
      pattern.insertBefore(bgRect, pattern.firstChild);
    }
    const origFillColor = shapeEl.getAttribute('data-original-fill') || '#ffffff';
    const origFillOp = shapeEl.getAttribute('data-original-fill-opacity') || '1';
    applySvgGradientOrSolid({
      targetEl: bgRect,
      fillVal: origFillColor,
      fillOp: origFillOp,
      idPrefix: `grad-${patternId}-bg`,
      doc,
      svgRoot
    });

    let imageNode = pattern.querySelector('image, img');
    if (!imageNode) {
      imageNode = doc.createElementNS('http://www.w3.org/2000/svg', 'image');
      pattern.appendChild(imageNode);
    }

    imageNode.setAttribute('href', dataUrl);
    imageNode.setAttribute('xlink:href', dataUrl);

    updateShapeMaskTransform({
      selectedElement,
      panX: 0,
      panY: 0,
      zoom: 1,
      angle: 0,
      doc
    });

    if (typeof onSuccess === 'function') {
      onSuccess({
        dataUrl,
        origToSave,
        name,
        meta
      });
    }

    window.__skipCanvasUpdateForPage = activePageIndex;
    const rootSvg = svgRoot || selectedElement.closest('svg') || doc.querySelector('svg');
    if (rootSvg && typeof updateElementAttribute === 'function') {
      const cloneSvg = rootSvg.cloneNode(true);
      cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer, .selection-overlay-layer').forEach(el => el.remove());
      const serializer = new XMLSerializer();
      const html = serializer.serializeToString(cloneSvg);
      updateElementAttribute(activePageIndex, selectedLayerId, {
        '__dom_sync__': html,
        'fill': `url(#${patternId})`,
        'data-masked-image-url': dataUrl
      });
    }
  };
  img.src = dataUrl;
};

/**
 * Removes the image mask completely, restoring original solid fill.
 * @param {Object} params
 */
export const removeShapeMask = ({
  selectedElement,
  selectedLayerId,
  activePageIndex,
  updateElementAttribute,
  originalFillFallback = '#3194FC',
  doc = document
}) => {
  if (!selectedElement) return;

  const { shapeEl, svgRoot } = findShapeAndSvgRoot(selectedElement, doc);
  const target = shapeEl || selectedElement;

  target.removeAttribute('data-mask-enabled');
  const patternMatch = (target.getAttribute('fill') || '').match(/url\(['"]?#([^)'"]+)['"]?\)/);
  if (patternMatch && patternMatch[1]) {
    const pat = (svgRoot || selectedElement).querySelector(`pattern[id="${patternMatch[1]}"]`) ||
      doc.getElementById(patternMatch[1]) ||
      document.getElementById(patternMatch[1]);
    if (pat) pat.remove();
  }

  const origFill = target.getAttribute('data-original-fill') || originalFillFallback;
  const origFillOp = target.getAttribute('data-original-fill-opacity') || '1';
  applySvgGradientOrSolid({
    targetEl: target,
    fillVal: origFill,
    fillOp: origFillOp,
    idPrefix: `grad-${target.id || selectedLayerId}-fill`,
    doc,
    svgRoot
  });
  target.removeAttribute('data-pattern-id');
  target.removeAttribute('data-masked-image-url');
  target.removeAttribute('data-slot-image-name');
  target.removeAttribute('data-slot-image-meta');
  target.removeAttribute('data-slot-original-url');
  target.style.removeProperty('filter');
  ['data-effect-exposure', 'data-effect-contrast', 'data-effect-saturation', 'data-effect-temperature', 'data-effect-tint', 'data-effect-highlights', 'data-effect-shadows'].forEach(attr => {
    target.removeAttribute(attr);
    if (selectedElement !== target) selectedElement.removeAttribute(attr);
  });

  if (selectedElement !== target) {
    selectedElement.removeAttribute('data-mask-enabled');
    selectedElement.removeAttribute('data-slot-image-name');
    selectedElement.removeAttribute('data-slot-image-meta');
    selectedElement.removeAttribute('data-slot-original-url');
    selectedElement.setAttribute('fill', origFill);
    selectedElement.style.removeProperty('filter');
  }

  // Restore original stroke if was previously hidden by mask overlay
  const origStroke = target.getAttribute('data-original-stroke');
  if (origStroke && origStroke !== 'none') {
    target.setAttribute('stroke', origStroke);
    target.removeAttribute('data-original-stroke');
    const sw = parseFloat(target.getAttribute('data-stroke-width') || '0');
    if (sw > 0) {
      target.setAttribute('stroke-width', (sw * 2).toString());
      target.setAttribute('paint-order', 'stroke fill');
      target.style.paintOrder = 'stroke fill';
    }
  }

  const rootSvg = svgRoot || selectedElement.closest('svg') || doc.querySelector('svg');
  if (rootSvg) {
    const overlay = rootSvg.querySelector(`.svg-shape-stroke-overlay[data-target="${selectedLayerId}"]`);
    if (overlay) overlay.remove();
    const safeId = (selectedLayerId || '').replace(/[^a-zA-Z0-9-_]/g, '_');
    rootSvg.querySelector(`mask[id="mask-shape-${safeId}"]`)?.remove();
    rootSvg.querySelector(`clipPath[id="clip-shape-${safeId}"]`)?.remove();
  }

  window.__skipCanvasUpdateForPage = activePageIndex;
  if (rootSvg && typeof updateElementAttribute === 'function') {
    const cloneSvg = rootSvg.cloneNode(true);
    cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer, .selection-overlay-layer').forEach(el => el.remove());
    const serializer = new XMLSerializer();
    const html = serializer.serializeToString(cloneSvg);
    updateElementAttribute(activePageIndex, selectedLayerId, {
      '__dom_sync__': html,
      'data-mask-enabled': 'false',
      'data-masked-image-url': null,
      'fill': origFill
    });
  }

  window.dispatchEvent(new CustomEvent('shape-mask-toggled', { detail: { layerId: selectedLayerId, enabled: false } }));
};

/**
 * Deletes the image from the shape mask slot while keeping mask state enabled.
 * @param {Object} params
 */
export const deleteShapeMaskImage = ({
  selectedElement,
  selectedLayerId,
  activePageIndex,
  updateElementAttribute,
  originalFillFallback = '#3194FC',
  doc = document
}) => {
  if (!selectedElement) return;

  const { shapeEl, svgRoot } = findShapeAndSvgRoot(selectedElement, doc);
  const target = shapeEl || selectedElement;

  const patternMatch = (target.getAttribute('fill') || '').match(/url\(['"]?#([^)'"]+)['"]?\)/);
  if (patternMatch && patternMatch[1]) {
    const pat = (svgRoot || selectedElement).querySelector(`pattern[id="${patternMatch[1]}"]`) ||
      doc.getElementById(patternMatch[1]) ||
      document.getElementById(patternMatch[1]);
    if (pat) pat.remove();
  }

  const origFill = target.getAttribute('data-original-fill') || originalFillFallback;
  const origFillOp = target.getAttribute('data-original-fill-opacity') || '1';
  applySvgGradientOrSolid({
    targetEl: target,
    fillVal: origFill,
    fillOp: origFillOp,
    idPrefix: `grad-${target.id || selectedLayerId}-fill`,
    doc,
    svgRoot
  });
  target.removeAttribute('data-pattern-id');
  target.removeAttribute('data-masked-image-url');
  target.removeAttribute('data-slot-image-name');
  target.removeAttribute('data-slot-image-meta');
  target.removeAttribute('data-slot-original-url');
  target.removeAttribute('data-slot-crop-data');
  target.style.removeProperty('filter');
  ['data-effect-exposure', 'data-effect-contrast', 'data-effect-saturation', 'data-effect-temperature', 'data-effect-tint', 'data-effect-highlights', 'data-effect-shadows'].forEach(attr => {
    target.removeAttribute(attr);
    if (selectedElement !== target) selectedElement.removeAttribute(attr);
  });
  target.removeAttribute('data-slot-fix-type');
  target.removeAttribute('data-slot-opacity');
  target.removeAttribute('data-slot-filters');
  target.setAttribute('data-mask-enabled', 'true');

  if (selectedElement !== target) {
    selectedElement.removeAttribute('data-slot-image-name');
    selectedElement.removeAttribute('data-slot-image-meta');
    selectedElement.removeAttribute('data-slot-original-url');
    selectedElement.removeAttribute('data-slot-crop-data');
    selectedElement.removeAttribute('data-slot-fix-type');
    selectedElement.removeAttribute('data-slot-opacity');
    selectedElement.removeAttribute('data-slot-filters');
    selectedElement.setAttribute('data-mask-enabled', 'true');
    selectedElement.setAttribute('fill', origFill);
  }

  window.__skipCanvasUpdateForPage = activePageIndex;
  const rootSvg = svgRoot || selectedElement.closest('svg') || doc.querySelector('svg');
  if (rootSvg && typeof updateElementAttribute === 'function') {
    const cloneSvg = rootSvg.cloneNode(true);
    cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer, .selection-overlay-layer').forEach(el => el.remove());
    const serializer = new XMLSerializer();
    const html = serializer.serializeToString(cloneSvg);
    updateElementAttribute(activePageIndex, selectedLayerId, {
      '__dom_sync__': html,
      'data-masked-image-url': null,
      'fill': origFill
    });
  }
};

/**
 * Updates rotation on the masked image inside the pattern.
 * @param {Object} params
 */
export const updateShapeMaskRotation = ({
  selectedElement,
  angle,
  doc = document,
  onSync
}) => {
  return updateShapeMaskTransform({
    selectedElement,
    angle,
    doc,
    onSync
  });
};

/**
 * Updates opacity on the masked image inside the pattern.
 * @param {Object} params
 */
export const updateShapeMaskOpacity = ({
  selectedElement,
  opacity,
  doc = document,
  onSync
}) => {
  if (!selectedElement) return;

  const { shapeEl, svgRoot } = findShapeAndSvgRoot(selectedElement, doc);
  const target = shapeEl || selectedElement;

  const fillAttr = target.getAttribute('fill') || target.style?.fill || selectedElement.getAttribute('fill') || selectedElement.style?.fill || '';
  const patternMatch = fillAttr.match(/url\(['"]?#([^)'"]+)['"]?\)/);
  if (!patternMatch || !patternMatch[1]) return;
  const patternId = patternMatch[1];

  const allPatterns = new Set();
  const searchRoot = svgRoot || selectedElement.closest?.('svg') || doc;
  searchRoot.querySelectorAll?.(`pattern[id="${patternId}"]`).forEach(p => allPatterns.add(p));
  selectedElement.querySelectorAll?.(`pattern[id="${patternId}"]`).forEach(p => allPatterns.add(p));
  const docP = doc.getElementById?.(patternId) || document.getElementById?.(patternId);
  if (docP && docP.tagName?.toLowerCase() === 'pattern') allPatterns.add(docP);
  if (allPatterns.size === 0) return;

  const dec = Math.max(0, Math.min(1, opacity / 100)).toString();
  allPatterns.forEach(pattern => {
    const curImg = ensurePatternImageNode(pattern, selectedElement, doc);
    if (curImg) {
      curImg.setAttribute('opacity', dec);
    }
    pattern.setAttribute('data-ts', String(Date.now()));
  });

  target.setAttribute('data-slot-opacity', opacity.toString());
  if (selectedElement !== target) {
    selectedElement.setAttribute('data-slot-opacity', opacity.toString());
  }

  if (typeof onSync === 'function') {
    onSync();
  }
};

/**
 * Updates pan (offset) and zoom (scale) of the masked image inside the SVG pattern.
 * Coordinates are normalized in objectBoundingBox space (0..1) with center (0.5, 0.5).
 * @param {Object} params
 */
export const updateShapeMaskTransform = ({
  selectedElement,
  panX,
  panY,
  zoom,
  angle,
  doc = document,
  onSync
}) => {
  if (!selectedElement) return;

  const { shapeEl, svgRoot } = findShapeAndSvgRoot(selectedElement, doc);
  const target = shapeEl || selectedElement;

  const fillAttr = target.getAttribute('fill') || target.style?.fill || selectedElement.getAttribute('fill') || selectedElement.style?.fill || '';
  const patternMatch = fillAttr.match(/url\(['"]?#([^)'"]+)['"]?\)/);
  if (!patternMatch || !patternMatch[1]) return;
  const patternId = patternMatch[1];

  const allPatterns = new Set();
  const searchRoot = svgRoot || selectedElement.closest?.('svg') || doc;
  searchRoot.querySelectorAll?.(`pattern[id="${patternId}"]`).forEach(p => allPatterns.add(p));
  selectedElement.querySelectorAll?.(`pattern[id="${patternId}"]`).forEach(p => allPatterns.add(p));
  const docP = doc.getElementById?.(patternId) || document.getElementById?.(patternId);
  if (docP && docP.tagName?.toLowerCase() === 'pattern') allPatterns.add(docP);
  if (allPatterns.size === 0) return;

  const firstPattern = Array.from(allPatterns)[0];
  const primaryImgNode = ensurePatternImageNode(firstPattern, selectedElement, doc);
  if (!primaryImgNode) return;

  const currentPanX = panX !== undefined ? panX : parseFloat(target.getAttribute('data-slot-pan-x') || '0');
  const currentPanY = panY !== undefined ? panY : parseFloat(target.getAttribute('data-slot-pan-y') || '0');
  const currentZoom = zoom !== undefined ? zoom : parseFloat(target.getAttribute('data-slot-zoom') || '1');

  let currentAngle = angle;
  if (currentAngle === null || currentAngle === undefined) {
    const tf = primaryImgNode.getAttribute('transform') || '';
    const rMatch = tf.match(/rotate\(([-0-9.]+)/);
    if (rMatch) {
      currentAngle = parseFloat(rMatch[1]) || 0;
    } else {
      const rotAttr = target.getAttribute('data-slot-rotation') || selectedElement.getAttribute('data-slot-rotation');
      currentAngle = rotAttr ? (parseFloat(rotAttr) || 0) : 0;
    }
  }

  target.setAttribute('data-slot-pan-x', String(currentPanX));
  target.setAttribute('data-slot-pan-y', String(currentPanY));
  target.setAttribute('data-slot-zoom', String(currentZoom));
  if (selectedElement !== target) {
    selectedElement.setAttribute('data-slot-pan-x', String(currentPanX));
    selectedElement.setAttribute('data-slot-pan-y', String(currentPanY));
    selectedElement.setAttribute('data-slot-zoom', String(currentZoom));
  }

  // Get or establish fixed slot base dimensions
  let bbox;
  try {
    bbox = target.getBBox();
  } catch {
    bbox = { x: 0, y: 0, width: 100, height: 100 };
  }

  const baseW = bbox.width > 0 ? bbox.width : 100;
  const baseH = bbox.height > 0 ? bbox.height : 100;
  const cx = bbox.x + baseW / 2;
  const cy = bbox.y + baseH / 2;

  target.setAttribute('data-slot-base-x', String(bbox.x));
  target.setAttribute('data-slot-base-y', String(bbox.y));
  target.setAttribute('data-slot-base-w', String(baseW));
  target.setAttribute('data-slot-base-h', String(baseH));
  if (selectedElement !== target) {
    selectedElement.setAttribute('data-slot-base-x', String(bbox.x));
    selectedElement.setAttribute('data-slot-base-y', String(bbox.y));
    selectedElement.setAttribute('data-slot-base-w', String(baseW));
    selectedElement.setAttribute('data-slot-base-h', String(baseH));
  }

  // Use userSpaceOnUse for isotropic pixel coordinates: 1px X = 1px Y.
  // This completely eliminates shear and aspect-ratio stretch when rotating!
  const padX = Math.max(baseW * 2, 200);
  const padY = Math.max(baseH * 2, 200);

  const meta = target.getAttribute('data-slot-image-meta') || selectedElement.getAttribute('data-slot-image-meta') || '';
  const m = meta.match(/(\d+)\s*[xX]\s*(\d+)/);
  let naturalW = m ? parseFloat(m[1]) : (primaryImgNode.naturalWidth || (primaryImgNode.width?.baseVal?.value > 1 ? primaryImgNode.width.baseVal.value : 1254));
  let naturalH = m ? parseFloat(m[2]) : (primaryImgNode.naturalHeight || (primaryImgNode.height?.baseVal?.value > 1 ? primaryImgNode.height.baseVal.value : 1254));
  if (!naturalW || naturalW <= 1) naturalW = 1254;
  if (!naturalH || naturalH <= 1) naturalH = 1254;

  const scale = Math.max(baseW / naturalW, baseH / naturalH) * currentZoom;
  const imgW = naturalW * scale;
  const imgH = naturalH * scale;

  const dx = currentPanX * baseW;
  const dy = currentPanY * baseH;

  const tileCenterX = padX + baseW / 2;
  const tileCenterY = padY + baseH / 2;

  const imgX = tileCenterX + dx - imgW / 2;
  const imgY = tileCenterY + dy - imgH / 2;

  const origFill = target.getAttribute('data-original-fill') || selectedElement.getAttribute('data-original-fill');
  const origFillOp = target.getAttribute('data-original-fill-opacity') || selectedElement.getAttribute('data-original-fill-opacity') || '1';

  allPatterns.forEach(pattern => {
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('patternContentUnits', 'userSpaceOnUse');
    pattern.setAttribute('x', String(bbox.x - padX));
    pattern.setAttribute('y', String(bbox.y - padY));
    pattern.setAttribute('width', String(baseW + padX * 2));
    pattern.setAttribute('height', String(baseH + padY * 2));
    pattern.removeAttribute('patternTransform');
    pattern.removeAttribute('viewBox');

    // Background rect in pattern covering the entire user space tile
    let bgRect = pattern.querySelector('rect.mask-bg-fill');
    if (!bgRect) {
      bgRect = (doc || document).createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('class', 'mask-bg-fill');
      pattern.insertBefore(bgRect, pattern.firstChild);
    }
    bgRect.setAttribute('x', String(padX));
    bgRect.setAttribute('y', String(padY));
    bgRect.setAttribute('width', String(baseW));
    bgRect.setAttribute('height', String(baseH));

    if (origFill && origFill !== 'none') {
      applySvgGradientOrSolid({
        targetEl: bgRect,
        fillVal: origFill,
        fillOp: origFillOp,
        idPrefix: `grad-${patternId}-bg`,
        doc,
        svgRoot
      });
    } else if (origFill === 'none') {
      bgRect.setAttribute('fill', 'none');
    }

    const curImg = ensurePatternImageNode(pattern, selectedElement, doc);
    if (curImg) {
      curImg.setAttribute('x', String(imgX));
      curImg.setAttribute('y', String(imgY));
      curImg.setAttribute('width', String(imgW));
      curImg.setAttribute('height', String(imgH));
      curImg.setAttribute('preserveAspectRatio', 'none');

      if (currentAngle !== 0) {
        curImg.setAttribute('transform', `rotate(${currentAngle}, ${tileCenterX + dx}, ${tileCenterY + dy})`);
      } else {
        curImg.removeAttribute('transform');
      }
    }

    // Force pattern cache invalidation in browser
    pattern.setAttribute('data-ts', String(Date.now()));
  });

  target.setAttribute('data-slot-rotation', String(currentAngle));
  if (selectedElement !== target) {
    selectedElement.setAttribute('data-slot-rotation', String(currentAngle));
  }

  const fill = target.getAttribute('fill') || fillAttr;
  if (fill) {
    target.setAttribute('fill', fill);
  }

  if (typeof onSync === 'function') {
    onSync();
  }
};

/**
 * Builds CSS filter string from adjustment filters.
 * @param {Object} f
 * @returns {string}
 */
export const buildAdjustmentFilterString = (f) => {
  if (!f) return '';
  const exposure = f.exposure || 0;
  const contrast = f.contrast || 0;
  const saturation = f.saturation || 0;
  const temperature = f.temperature || 0;
  const tint = f.tint || 0;
  const h = f.highlights || 0;
  const s = f.shadows || 0;

  const isNeutral = (
    exposure === 0 &&
    contrast === 0 &&
    saturation === 0 &&
    temperature === 0 &&
    tint === 0 &&
    h === 0 &&
    s === 0
  );
  if (isNeutral) return '';

  let str = '';
  str += `brightness(${Math.max(0, 100 + exposure + (h / 5))}%) `;
  str += `contrast(${Math.max(0, 100 + contrast + (s / 5))}%) `;
  str += `saturate(${Math.max(0, 100 + saturation)}%) `;
  if (tint !== 0) str += `hue-rotate(${tint}deg) `;
  if (temperature > 0) str += `sepia(${temperature / 2}%) `;
  else if (temperature < 0) str += `hue-rotate(180deg) sepia(${Math.abs(temperature) / 2}%) hue-rotate(-180deg) `;
  return str.trim();
};

/**
 * Updates CSS filters on a shape mask's <image> node and persists data attributes.
 * @param {Object} params
 */
export const updateShapeMaskFilters = ({
  selectedElement,
  selectedLayerId,
  activePageIndex,
  filters,
  updateElementAttribute,
  doc = document,
  onSync
}) => {
  if (!selectedElement) return;

  const { shapeEl, svgRoot } = findShapeAndSvgRoot(selectedElement, doc);
  const target = shapeEl || selectedElement;

  const filterStr = buildAdjustmentFilterString(filters);

  // 1. Apply to pattern <image>
  const fill = target.getAttribute('fill') || '';
  const match = fill.match(/url\(['"]?#([^)'"]+)['"]?\)/);
  if (match && match[1]) {
    const pattern = (svgRoot || selectedElement).querySelector(`pattern[id="${match[1]}"]`) ||
      doc.getElementById(match[1]) ||
      document.getElementById(match[1]);
    if (pattern) {
      const imgNode = pattern.querySelector('image, img');
      if (imgNode) {
        if (filterStr) {
          imgNode.style.setProperty('filter', filterStr, 'important');
        } else {
          imgNode.style.removeProperty('filter');
        }
        imgNode.removeAttribute('filter');
      }
    }
  }

  // 2. Apply directly to target and selectedElement (this ensures visual filter on pattern fill)
  const existingSvgFilter = target.getAttribute('filter') || selectedElement?.getAttribute('filter') || '';
  let combinedFilter = filterStr;
  if (existingSvgFilter && existingSvgFilter.startsWith('url(')) {
    combinedFilter = combinedFilter ? `${combinedFilter} ${existingSvgFilter}` : existingSvgFilter;
  }

  if (combinedFilter) {
    target.style.setProperty('filter', combinedFilter, 'important');
    if (selectedElement !== target) {
      selectedElement.style.setProperty('filter', combinedFilter, 'important');
    }
  } else {
    target.style.removeProperty('filter');
    if (selectedElement !== target) {
      selectedElement.style.removeProperty('filter');
    }
  }

  // 3. Set data attributes on target & selectedElement
  const f = filters || {};
  const attrs = {
    'data-effect-exposure': String(f.exposure || 0),
    'data-effect-contrast': String(f.contrast || 0),
    'data-effect-saturation': String(f.saturation || 0),
    'data-effect-temperature': String(f.temperature || 0),
    'data-effect-tint': String(f.tint || 0),
    'data-effect-highlights': String(f.highlights || 0),
    'data-effect-shadows': String(f.shadows || 0)
  };

  Object.entries(attrs).forEach(([k, v]) => {
    target.setAttribute(k, v);
    if (selectedElement !== target) selectedElement.setAttribute(k, v);
  });

  // 4. Serialize DOM with __dom_sync__ to commit to page.html
  window.__skipCanvasUpdateForPage = activePageIndex;
  const rootSvg = svgRoot || selectedElement.closest('svg') || doc.querySelector('svg');
  if (rootSvg && typeof updateElementAttribute === 'function') {
    const cloneSvg = rootSvg.cloneNode(true);
    cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer, .selection-overlay-layer').forEach(el => el.remove());
    const serializer = new XMLSerializer();
    const html = serializer.serializeToString(cloneSvg);
    updateElementAttribute(activePageIndex, selectedLayerId, {
      ...attrs,
      '__dom_sync__': html
    });
  }

  if (typeof onSync === 'function') {
    onSync();
  }
};


