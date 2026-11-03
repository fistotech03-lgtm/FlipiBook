import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2
} from 'lucide-react';
import Color from '../../../properties/Color';
import Effect from '../../../properties/Effect';
import { DEFAULT_FRAME_IMAGE } from '../utils/imageFramingUtils';
import { updateShapeMaskTransform, updateShapeMaskFilters, updateShapeMaskOpacity, ensurePatternImageNode, applySvgGradientOrSolid } from '../utils/shapeMaskUtils';
import { parseGradient } from '../../../../ColorPicker';
import ImageAdjustmentModal, { AdjustmentIcon } from '../../../modals/ImageAdjustmentModal';
import { PropertySlider } from '../../../properties/propertiesShared';

const ImageFramingProperties = ({ selectedElement, selectedLayerId, activePageIndex, updateElementAttribute, selectedElementProps }) => {
  const [slots, setSlots] = useState([]);
  const [gap, setGap] = useState(0);
  const [radius, setRadius] = useState(0);
  const [framePadding, setFramePadding] = useState(0);
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [slotRadii, setSlotRadii] = useState({});
  const [slotRotations, setSlotRotations] = useState({});
  const [slotOpacities, setSlotOpacities] = useState({});
  const [slotMeta, setSlotMeta] = useState({});
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTargetSlotId, setAdjustTargetSlotId] = useState(null);
  const [slotFilters, setSlotFilters] = useState({});
  const slotReplaceRefs = useRef({});
  const activeSlotRef = useRef(null);

  const currentSlotFilters = (adjustTargetSlotId && slotFilters[adjustTargetSlotId]) || {
    exposure: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, highlights: 0, shadows: 0
  };

  const handleAdjustmentChange = (key, val) => {
    if (!adjustTargetSlotId) return;
    const nextFilters = {
      ...currentSlotFilters,
      [key]: val
    };
    setSlotFilters(prev => ({
      ...prev,
      [adjustTargetSlotId]: nextFilters
    }));

    const path = selectedElement?.querySelector(`[data-pattern-id="${adjustTargetSlotId}"], [fill*="${adjustTargetSlotId}"]`);
    if (!path) return;

    updateShapeMaskFilters({
      selectedElement: path,
      selectedLayerId,
      activePageIndex,
      filters: nextFilters,
      updateElementAttribute,
      doc: selectedElement.ownerDocument || document
    });
  };

  const handleResetAllAdjustments = () => {
    if (!adjustTargetSlotId) return;
    const reset = { exposure: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, highlights: 0, shadows: 0 };
    setSlotFilters(prev => ({
      ...prev,
      [adjustTargetSlotId]: reset
    }));

    const path = selectedElement?.querySelector(`[data-pattern-id="${adjustTargetSlotId}"], [fill*="${adjustTargetSlotId}"]`);
    if (!path) return;

    updateShapeMaskFilters({
      selectedElement: path,
      selectedLayerId,
      activePageIndex,
      filters: reset,
      updateElementAttribute,
      doc: selectedElement.ownerDocument || document
    });
  };

  const [openSubSection, setOpenSubSection] = useState('color');
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [showStrokeSettings, setShowStrokeSettings] = useState(false);
  const [isStrokeStyleOpen, setIsStrokeStyleOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [strokeSettingsPos, setStrokeSettingsPos] = useState({ top: 0, right: 0 });
  const [isDashPosOpen, setIsDashPosOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [showDetailedPicker, setShowDetailedPicker] = useState(false);

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
  }, [selectedElementProps, activePageIndex]);

  const frameBgFill = selectedElementProps?.['data-frame-bg-fill'] !== undefined
    ? selectedElementProps['data-frame-bg-fill']
    : (selectedElement?.getAttribute('data-frame-bg-fill') || 'none');

  const frameBgOpacity = selectedElementProps?.['data-frame-bg-opacity'] !== undefined
    ? parseFloat(selectedElementProps['data-frame-bg-opacity']) * 100
    : (selectedElement?.hasAttribute('data-frame-bg-opacity') ? parseFloat(selectedElement.getAttribute('data-frame-bg-opacity')) * 100 : 100);

  const frameStroke = selectedElementProps?.['data-frame-stroke'] !== undefined
    ? selectedElementProps['data-frame-stroke']
    : (selectedElement?.getAttribute('data-frame-stroke') || selectedElement?.querySelector('[stroke]:not(.frame-bg-rect):not([stroke="none"])')?.getAttribute('stroke') || 'none');

  const frameStrokeOpacity = selectedElementProps?.['data-frame-stroke-opacity'] !== undefined
    ? parseFloat(selectedElementProps['data-frame-stroke-opacity']) * 100
    : (selectedElement?.hasAttribute('data-frame-stroke-opacity') ? parseFloat(selectedElement.getAttribute('data-frame-stroke-opacity')) * 100 : 100);

  const frameStrokeWidth = parseFloat(selectedElementProps?.['data-frame-stroke-width'] !== undefined
    ? selectedElementProps['data-frame-stroke-width']
    : (selectedElement?.getAttribute('data-frame-stroke-width') || selectedElement?.querySelector('[data-stroke-width]')?.getAttribute('data-stroke-width') || 0));

  const activePath = activeSlotId && selectedElement
    ? selectedElement.querySelector(`[data-pattern-id="${activeSlotId}"], [fill*="${activeSlotId}"]`)
    : null;
  const activePattern = activeSlotId && selectedElement
    ? (selectedElement.querySelector(`pattern[id="${activeSlotId}"]`) || selectedElement.ownerDocument?.querySelector?.(`pattern[id="${activeSlotId}"]`))
    : null;
  const activeBgRect = activePattern?.querySelector?.('rect.mask-bg-fill');

  const resolvedFill = activeSlotId
    ? (activeBgRect?.getAttribute('fill') || activePath?.getAttribute('data-original-fill') || 'none')
    : frameBgFill;

  const resolvedFillOpacity = activeSlotId
    ? (activeBgRect && activeBgRect.hasAttribute('fill-opacity')
        ? parseFloat(activeBgRect.getAttribute('fill-opacity')) * 100
        : (activePath && activePath.hasAttribute('data-slot-fill-opacity')
            ? parseFloat(activePath.getAttribute('data-slot-fill-opacity')) * 100
            : 100))
    : frameBgOpacity;

  const resolvedStroke = activeSlotId
    ? (activePath?.getAttribute('stroke') || 'none')
    : frameStroke;

  const resolvedStrokeOpacity = activeSlotId && activePath && activePath.hasAttribute('stroke-opacity')
    ? parseFloat(activePath.getAttribute('stroke-opacity')) * 100
    : frameStrokeOpacity;

  const resolvedStrokeWidth = activeSlotId && activePath && activePath.hasAttribute('data-stroke-width')
    ? parseFloat(activePath.getAttribute('data-stroke-width')) || 0
    : frameStrokeWidth;

  const frameStrokeDasharray = selectedElementProps?.['data-frame-stroke-dasharray'] !== undefined
    ? selectedElementProps['data-frame-stroke-dasharray']
    : (selectedElement?.getAttribute('data-frame-stroke-dasharray') || 'none');

  const frameStrokeLinecap = selectedElementProps?.['data-frame-stroke-linecap'] || selectedElement?.getAttribute('data-frame-stroke-linecap') || 'square';
  const frameStrokePosition = selectedElementProps?.['data-frame-stroke-position'] || selectedElement?.getAttribute('data-frame-stroke-position') || 'Outside';

  const parsedFillGrad = (resolvedFill && typeof resolvedFill === 'string' && resolvedFill.includes('gradient')) ? parseGradient(resolvedFill) : null;

  const backgroundColor = {
    fill: resolvedFill,
    fillOpacity: resolvedFillOpacity,
    stroke: resolvedStroke,
    strokeOpacity: resolvedStrokeOpacity,
    fillType: parsedFillGrad ? 'gradient' : (resolvedFill.includes('gradient') ? 'gradient' : 'solid'),
    fillGradientType: parsedFillGrad ? parsedFillGrad.type.toLowerCase() : 'linear',
    fillStops: parsedFillGrad ? JSON.stringify(parsedFillGrad.stops.map(s => ({ color: s.color, offset: s.offset, opacity: s.opacity / 100 }))) : undefined,
    fillAngle: parsedFillGrad ? parsedFillGrad.angle || 0 : 0,
    fillRadius: parsedFillGrad ? parsedFillGrad.radius || 100 : 100,
    strokeType: resolvedStroke.includes('gradient') ? 'gradient' : 'solid',
    strokeGradientType: 'linear',
    strokeStops: [],
    strokeAngle: 0,
    strokeRadius: 100,
    strokeWeight: resolvedStrokeWidth,
    strokeDashStyle: (frameStrokeDasharray && frameStrokeDasharray !== 'none') ? 'Dashed' : 'Solid',
    strokeDasharrayValue: frameStrokeDasharray,
    strokeDashLength: parseInt((frameStrokeDasharray === 'none' ? '10,10' : (frameStrokeDasharray || '10,10')).split(',')[0]) || 10,
    strokeDashGap: parseInt((frameStrokeDasharray === 'none' ? '10,10' : (frameStrokeDasharray || '10,10')).split(',')[1]) || 10,
    strokeLinecap: (frameStrokeLinecap === 'round' || selectedElementProps?.['stroke-linecap'] === 'round' || selectedElementProps?.['stroke-linejoin'] === 'round') ? 'round' : 'square',
    strokePosition: frameStrokePosition,
  };

  const handleSetBackgroundColor = (updater) => {
    const next = typeof updater === 'function' ? updater(backgroundColor) : updater;
    if (!selectedElement) return;

    const fillVal = next.fill !== 'none' && next.fill !== '#' ? next.fill : 'none';
    const fillOp = next.fillOpacity !== undefined ? (next.fillOpacity / 100).toString() : '1';
    const strokeVal = next.stroke !== 'none' && next.stroke !== '#' ? next.stroke : 'none';
    const strokeOp = next.strokeOpacity !== undefined ? (next.strokeOpacity / 100).toString() : '1';
    const sw = parseFloat(next.strokeWeight !== undefined ? next.strokeWeight : backgroundColor.strokeWeight) || 0;
    const pos = next.strokePosition || backgroundColor.strokePosition || 'Outside';
    const dashValue = (next.strokeDashStyle === 'none' || next.strokeDashStyle === 'Solid')
      ? 'none'
      : (next.strokeDasharrayValue || `${next.strokeDashLength || 10},${next.strokeDashGap || 10}`);
    const cap = next.strokeLinecap || backgroundColor.strokeLinecap || 'square';

    if (activeSlotId) {
      // -------------------------------------------------------------
      // 1. SLOT-SPECIFIC: Target strictly the active slot path & pattern
      // -------------------------------------------------------------
      const allPaths = Array.from(selectedElement.querySelectorAll('path, polygon, rect:not(.frame-bg-rect), circle, ellipse'));
      const targetPaths = allPaths.filter(p => p.dataset.patternId === activeSlotId || p.getAttribute('fill')?.includes(activeSlotId));
      const pathsToUse = targetPaths.length > 0 ? targetPaths : (activePath ? [activePath] : []);

      pathsToUse.forEach(path => {
        path.setAttribute('data-original-fill', fillVal);
        path.setAttribute('data-slot-fill-opacity', fillOp);
        path.setAttribute('stroke', strokeVal);
        path.setAttribute('stroke-opacity', strokeOp);
        path.setAttribute('data-stroke-width', sw.toString());
        path.setAttribute('data-stroke-position', pos);
        path.setAttribute('vector-effect', 'non-scaling-stroke');
        path.setAttribute('stroke-dasharray', dashValue);
        path.setAttribute('stroke-linecap', cap);
        path.setAttribute('stroke-linejoin', cap === 'round' ? 'round' : 'miter');

        if (pos === 'Outside') {
          path.setAttribute('stroke-width', (sw * 2).toString());
          path.setAttribute('paint-order', 'stroke fill');
          path.style.paintOrder = 'stroke fill';
        } else if (pos === 'Inside') {
          path.setAttribute('stroke-width', (sw * 2).toString());
          path.setAttribute('paint-order', 'fill stroke');
          path.style.paintOrder = 'fill stroke';
        } else {
          path.setAttribute('stroke-width', sw.toString());
          path.setAttribute('paint-order', 'normal');
          path.style.paintOrder = 'normal';
        }

        const pat = selectedElement.querySelector(`pattern[id="${activeSlotId}"]`) ||
          selectedElement.ownerDocument?.querySelector?.(`pattern[id="${activeSlotId}"]`) ||
          document.getElementById(activeSlotId);
        if (pat) {
          let bgRect = pat.querySelector('rect.mask-bg-fill');
          if (!bgRect) {
            bgRect = (selectedElement.ownerDocument || document).createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('class', 'mask-bg-fill');
            pat.insertBefore(bgRect, pat.firstChild);
          }
          applySvgGradientOrSolid({
            targetEl: bgRect,
            fillVal,
            fillOp,
            idPrefix: `grad-${activeSlotId}-bg`,
            doc: selectedElement.ownerDocument || document,
            svgRoot: selectedElement.closest('svg') || selectedElement.ownerDocument?.querySelector('svg')
          });
        }
      });

      syncDomChanges();
      return;
    }

    // -------------------------------------------------------------
    // 2. GLOBAL FRAME STYLING (No active slot selected)
    // -------------------------------------------------------------
    const updates = {};
    if (backgroundColor.fill !== next.fill) updates['data-frame-bg-fill'] = next.fill;
    if (backgroundColor.fillOpacity !== next.fillOpacity) updates['data-frame-bg-opacity'] = (next.fillOpacity / 100).toString();
    if (backgroundColor.stroke !== next.stroke) {
      updates['data-frame-stroke'] = next.stroke;
      updates['stroke'] = next.stroke;
      updates['data-stroke-color'] = next.stroke;
    }
    if (backgroundColor.strokeOpacity !== next.strokeOpacity) {
      updates['data-frame-stroke-opacity'] = (next.strokeOpacity / 100).toString();
      updates['stroke-opacity'] = (next.strokeOpacity / 100).toString();
    }
    if (backgroundColor.strokeWeight !== next.strokeWeight || backgroundColor.strokePosition !== next.strokePosition) {
      updates['data-frame-stroke-width'] = sw.toString();
      updates['data-stroke-width'] = sw.toString();
      updates['data-stroke-position'] = pos;
      updates['vector-effect'] = 'non-scaling-stroke';
    }
    if (backgroundColor.strokeDashStyle !== next.strokeDashStyle || backgroundColor.strokeDashLength !== next.strokeDashLength || backgroundColor.strokeDashGap !== next.strokeDashGap || backgroundColor.strokeDasharrayValue !== next.strokeDasharrayValue) {
      updates['data-frame-stroke-dasharray'] = dashValue;
      updates['stroke-dasharray'] = dashValue;
    }
    if (backgroundColor.strokeLinecap !== next.strokeLinecap && next.strokeLinecap !== undefined) {
      updates['data-frame-stroke-linecap'] = next.strokeLinecap;
      updates['stroke-linecap'] = next.strokeLinecap;
      updates['stroke-linejoin'] = next.strokeLinecap === 'round' ? 'round' : 'miter';
    }
    if (backgroundColor.strokePosition !== next.strokePosition && next.strokePosition !== undefined) {
      updates['data-frame-stroke-position'] = next.strokePosition;
    }

    if (Object.keys(updates).length > 0) {
      Object.entries(updates).forEach(([k, v]) => selectedElement.setAttribute(k, v));

      const allPaths = Array.from(selectedElement.querySelectorAll('path, polygon, rect:not(.frame-bg-rect), circle, ellipse'));
      allPaths.forEach(path => {
        path.setAttribute('data-original-fill', fillVal);
        path.setAttribute('stroke', strokeVal);
        path.setAttribute('stroke-opacity', strokeOp);
        path.setAttribute('data-stroke-width', sw.toString());
        path.setAttribute('data-stroke-position', pos);
        path.setAttribute('vector-effect', 'non-scaling-stroke');
        path.setAttribute('stroke-dasharray', dashValue);
        path.setAttribute('stroke-linecap', cap);
        path.setAttribute('stroke-linejoin', cap === 'round' ? 'round' : 'miter');

        if (pos === 'Outside') {
          path.setAttribute('stroke-width', (sw * 2).toString());
          path.setAttribute('paint-order', 'stroke fill');
          path.style.paintOrder = 'stroke fill';
        } else if (pos === 'Inside') {
          path.setAttribute('stroke-width', (sw * 2).toString());
          path.setAttribute('paint-order', 'fill stroke');
          path.style.paintOrder = 'fill stroke';
        } else {
          path.setAttribute('stroke-width', sw.toString());
          path.setAttribute('paint-order', 'normal');
          path.style.paintOrder = 'normal';
        }

        const pFill = path.getAttribute('fill') || '';
        const match = pFill.match(/url\(['"]?#([^)'"]+)['"]?\)/);
        if (match && match[1]) {
          const patId = match[1];
          const pat = selectedElement.querySelector(`pattern[id="${patId}"]`) ||
            selectedElement.ownerDocument?.querySelector?.(`pattern[id="${patId}"]`) ||
            document.getElementById(patId);
          if (pat) {
            let bgRect = pat.querySelector('rect.mask-bg-fill');
            if (!bgRect) {
              bgRect = (selectedElement.ownerDocument || document).createElementNS('http://www.w3.org/2000/svg', 'rect');
              bgRect.setAttribute('class', 'mask-bg-fill');
              pat.insertBefore(bgRect, pat.firstChild);
            }
            applySvgGradientOrSolid({
              targetEl: bgRect,
              fillVal,
              fillOp,
              idPrefix: `grad-${patId}-bg`,
              doc: selectedElement.ownerDocument || document,
              svgRoot: selectedElement.closest('svg') || selectedElement.ownerDocument?.querySelector('svg')
            });
          }
        }
      });

      // Handle frame-bg-rect boundary if framePadding > 0
      const framePaddingVal = parseFloat(selectedElement.getAttribute('data-frame-padding') || 0);
      let boundary = selectedElement.querySelector('.frame-bg-rect');
      if (framePaddingVal > 0) {
        if (!boundary) {
          updateFramePadding(framePaddingVal, true);
          boundary = selectedElement.querySelector('.frame-bg-rect');
        }
        if (boundary) {
          applySvgGradientOrSolid({
            targetEl: boundary,
            fillVal,
            fillOp,
            idPrefix: `grad-${selectedLayerId}-frame-bg`,
            doc: selectedElement.ownerDocument || document,
            svgRoot: selectedElement.closest('svg') || selectedElement.ownerDocument?.querySelector('svg')
          });
          boundary.setAttribute('stroke', 'none');
        }
      } else if (boundary) {
        boundary.remove();
      }

      syncDomChanges();
      updateElementAttribute(activePageIndex, selectedLayerId, updates);
    }
  };

  const activeEffects = [];
  if (selectedElementProps?.['data-effect-drop-shadow'] === 'true') activeEffects.push('Drop Shadow');

  const handleSetActiveEffects = (updater) => {
    const currentActive = [];
    if (selectedElementProps?.['data-effect-drop-shadow'] === 'true') currentActive.push('Drop Shadow');

    const next = typeof updater === 'function' ? updater(currentActive) : updater;
    const updates = {};
    const hasDropShadow = next.includes('Drop Shadow');

    if ((selectedElementProps?.['data-effect-drop-shadow'] === 'true') !== hasDropShadow) updates['data-effect-drop-shadow'] = hasDropShadow ? 'true' : 'false';

    if (Object.keys(updates).length > 0) updateElementAttribute(activePageIndex, selectedLayerId, updates);
  };

  const effectSettings = {
    'Drop Shadow': {
      x: parseInt(selectedElementProps?.['data-effect-drop-shadow-x'] || 2),
      y: parseInt(selectedElementProps?.['data-effect-drop-shadow-y'] || 2),
      blur: parseInt(selectedElementProps?.['data-effect-drop-shadow-blur'] || 4),
      spread: parseInt(selectedElementProps?.['data-effect-drop-shadow-spread'] || 0),
      color: selectedElementProps?.['data-effect-drop-shadow-color'] || '#000000',
      opacity: parseInt(selectedElementProps?.['data-effect-drop-shadow-opacity'] || 35),
    }
  };

  const handleSetEffectSettings = (updater) => {
    const next = typeof updater === 'function' ? updater(effectSettings) : updater;
    if (!next) return;
    const updates = {};
    if (next['Drop Shadow'] && effectSettings['Drop Shadow']) {
      const type = 'Drop Shadow';
      const prefix = 'drop-shadow';
      if (next[type].x !== undefined && effectSettings[type].x !== next[type].x) updates[`data-effect-${prefix}-x`] = next[type].x.toString();
      if (next[type].y !== undefined && effectSettings[type].y !== next[type].y) updates[`data-effect-${prefix}-y`] = next[type].y.toString();
      if (next[type].blur !== undefined && effectSettings[type].blur !== next[type].blur) updates[`data-effect-${prefix}-blur`] = next[type].blur.toString();
      if (next[type].spread !== undefined && effectSettings[type].spread !== next[type].spread) updates[`data-effect-${prefix}-spread`] = next[type].spread.toString();
      if (next[type].color !== undefined && effectSettings[type].color !== next[type].color) updates[`data-effect-${prefix}-color`] = next[type].color;
      if (next[type].opacity !== undefined && effectSettings[type].opacity !== next[type].opacity) updates[`data-effect-${prefix}-opacity`] = next[type].opacity.toString();
    }

    if (Object.keys(updates).length > 0) updateElementAttribute(activePageIndex, selectedLayerId, updates);
  };

  useEffect(() => {
    if (!selectedElement) return;

    // Clean up any stale boundary rectangle if framePadding is 0
    const framePaddingVal = parseFloat(selectedElement.getAttribute('data-frame-padding') || 0);
    const existingBoundary = selectedElement.querySelector('.frame-bg-rect');
    if (existingBoundary && framePaddingVal <= 0) {
      existingBoundary.remove();
      syncDomChanges();
    }

    // Find all paths that use a pattern for fill
    const paths = Array.from(selectedElement.querySelectorAll('path, polygon, rect, circle, ellipse'));
    const imageSlots = [];
    const listeners = [];

    paths.forEach((path, idx) => {
      const fill = path.getAttribute('fill');
      if (fill && fill.startsWith('url(#pattern')) {
        // Extract pattern ID
        const match = fill.match(/url\(#([^)]+)\)/);
        if (match && match[1]) {
          const patternId = match[1];

          // Ensure pattern has mask-bg-fill
          const pat = selectedElement.querySelector(`pattern[id="${patternId}"]`) ||
            selectedElement.ownerDocument?.querySelector?.(`pattern[id="${patternId}"]`) ||
            document.getElementById(patternId);
          if (pat) {
            ensurePatternImageNode(pat, selectedElement, selectedElement.ownerDocument || document);

            let bgRect = pat.querySelector('rect.mask-bg-fill');
            if (!bgRect) {
              bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              bgRect.setAttribute('class', 'mask-bg-fill');
              bgRect.setAttribute('width', '1');
              bgRect.setAttribute('height', '1');
              bgRect.setAttribute('x', '0');
              bgRect.setAttribute('y', '0');
              const curFill = selectedElement.getAttribute('data-frame-bg-fill') || 'none';
              bgRect.setAttribute('fill', curFill !== '#' ? curFill : 'none');
              const curOp = selectedElement.getAttribute('data-frame-bg-opacity');
              if (curOp) bgRect.setAttribute('fill-opacity', curOp);
              pat.insertBefore(bgRect, pat.firstChild);
            }
          }

          // We'll update currentImage later via a function that runs initially and on mutations
          imageSlots.push({
            id: patternId,
            path: path,
            index: idx,
            currentImage: null
          });

          // Highlight overlay logic
          const highlightId = `highlight-${patternId}`;

          const addHighlight = () => {
            let highlight = selectedElement.querySelector(`[data-highlight-id="${highlightId}"]`);
            if (!highlight) {
              highlight = path.cloneNode();
              highlight.setAttribute('data-highlight-id', highlightId);
              highlight.setAttribute('pointer-events', 'none');
              highlight.setAttribute('fill', 'none');
              highlight.setAttribute('stroke', '#2563eb');
              highlight.setAttribute('stroke-width', '2');
              highlight.setAttribute('vector-effect', 'non-scaling-stroke');
              highlight.setAttribute('stroke-dasharray', '4,5');
              selectedElement.appendChild(highlight);
            }
          };

          const removeHighlight = () => {
            const highlight = selectedElement.querySelector(`[data-highlight-id="${highlightId}"]`);
            if (highlight) highlight.remove();
          };

          path.setAttribute('data-pattern-id', patternId);
          path.dataset.patternId = patternId;

          // Setup canvas interaction for this slot
          const handleMouseEnter = () => {
            if (paths.length === 1) return;
            addHighlight();
            path.style.cursor = 'pointer';
          };

          const handleMouseLeave = () => {
            if (paths.length === 1) return;
            if (activeSlotRef.current === patternId) return; // Keep highlight if active
            removeHighlight();
            path.style.cursor = '';
          };

          const handleSingleClick = (e) => {
            if (paths.length === 1) return;
            e.stopPropagation();
            e.preventDefault();

            if (activeSlotRef.current === patternId) {
              // Deselect
              activeSlotRef.current = null;
              setActiveSlotId(null);
              removeHighlight();
            } else {
              // Deselect previous
              if (activeSlotRef.current) {
                const prevHighlightId = `highlight-${activeSlotRef.current}`;
                const prevHighlight = selectedElement.querySelector(`[data-highlight-id="${prevHighlightId}"]`);
                if (prevHighlight) prevHighlight.remove();
              }
              activeSlotRef.current = patternId;
              setActiveSlotId(patternId);
              addHighlight(); // Ensure it gets highlighted
            }
          };

          path.addEventListener('mouseenter', handleMouseEnter);
          path.addEventListener('mouseleave', handleMouseLeave);
          path.addEventListener('click', handleSingleClick);

          listeners.push({ path, handleMouseEnter, handleMouseLeave, handleSingleClick, removeHighlight });
        }
      }
    });

    setSlots(imageSlots);

    let svgRoot = selectedElement;
    while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
      svgRoot = svgRoot.parentElement;
    }

    const updateSlotsImages = () => {
      if (!svgRoot) return;
      setSlots(prevSlots => {
        let changed = false;
        const newSlots = prevSlots.map(slot => {
          const pattern = svgRoot.querySelector(`pattern[id="${slot.id}"]`);
          let currentImage = null;
          if (pattern) {
            const imgNode = pattern.querySelector('image, img');
            if (imgNode) {
              currentImage = imgNode.getAttribute('href') || imgNode.getAttribute('xlink:href');
            } else {
              const useNode = pattern.querySelector('use');
              if (useNode) {
                const href = useNode.getAttribute('href') || useNode.getAttribute('xlink:href') || '';
                const targetId = href.replace('#', '');
                const refImg = svgRoot.querySelector(`image[id="${targetId}"], img[id="${targetId}"]`);
                if (refImg) {
                  currentImage = refImg.getAttribute('href') || refImg.getAttribute('xlink:href');
                }
              }
            }
          }
          if (slot.currentImage !== currentImage) {
            changed = true;
            return { ...slot, currentImage };
          }
          return slot;
        });
        return changed ? newSlots : prevSlots;
      });
    };

    updateSlotsImages();

    let observer = null;
    if (svgRoot) {
      observer = new MutationObserver(() => {
        updateSlotsImages();
      });
      observer.observe(svgRoot, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'xlink:href'] });
    }

    // Load initial gap and radius from the first valid path
    const savedGap = parseFloat(selectedElement.getAttribute('data-frame-gap'));
    if (!isNaN(savedGap)) {
      setGap(savedGap);
    } else {
      setGap(0);
    }
    if (paths.length > 0) {
      const firstPath = paths[0];
      setRadius(parseFloat(firstPath.getAttribute('rx')) || parseFloat(firstPath.getAttribute('data-rx')) || 0);
    }

    // Load per-slot radii
    const initialRadii = {};
    const initialRotations = {};
    const initialOpacities = {};
    paths.forEach(p => {
       const pId = p.dataset.patternId;
       if (pId) {
           initialRadii[pId] = parseFloat(p.getAttribute('rx')) || parseFloat(p.getAttribute('data-rx')) || 0;
           const pattern = selectedElement.querySelector(`pattern[id="${pId}"]`);
           if (pattern) {
               // Check patternTransform (old method) or image rotate (new method)
               const pt = pattern.getAttribute('patternTransform');
               let foundRot = false;
               if (pt) {
                   const match = pt.match(/rotate\(([-0-9.]+)/);
                   if (match) {
                       initialRotations[pId] = parseFloat(match[1]);
                       foundRot = true;
                   }
               }
               const imgNode = pattern.querySelector('image, img');
               if (imgNode) {
                   if (!foundRot) {
                       const tf = imgNode.getAttribute('transform');
                       if (tf) {
                           const match = tf.match(/rotate\(([-0-9.]+)/);
                           if (match) initialRotations[pId] = parseFloat(match[1]);
                       }
                   }
                   const opAttr = imgNode.getAttribute('opacity') || p.getAttribute('data-slot-opacity') || selectedElement.getAttribute('data-slot-opacity');
                   if (opAttr !== null && opAttr !== undefined && opAttr !== '') {
                       const val = parseFloat(opAttr);
                       initialOpacities[pId] = val <= 1 ? Math.round(val * 100) : Math.round(val);
                   } else {
                       initialOpacities[pId] = 100;
                   }
               }
           }
       }
    });
    setSlotRadii(initialRadii);
    setSlotRotations(initialRotations);
    setSlotOpacities(initialOpacities);

    const initialFilters = {};
    paths.forEach(p => {
      const pId = p.dataset.patternId;
      if (pId) {
        initialFilters[pId] = {
          exposure: parseFloat(p.getAttribute('data-effect-exposure') || '0'),
          contrast: parseFloat(p.getAttribute('data-effect-contrast') || '0'),
          saturation: parseFloat(p.getAttribute('data-effect-saturation') || '0'),
          temperature: parseFloat(p.getAttribute('data-effect-temperature') || '0'),
          tint: parseFloat(p.getAttribute('data-effect-tint') || '0'),
          highlights: parseFloat(p.getAttribute('data-effect-highlights') || '0'),
          shadows: parseFloat(p.getAttribute('data-effect-shadows') || '0')
        };
      }
    });
    setSlotFilters(initialFilters);
    
    setFramePadding(parseFloat(selectedElement.getAttribute('data-frame-padding')) || 0);

    return () => {
      listeners.forEach(({ path, handleMouseEnter, handleMouseLeave, handleSingleClick, removeHighlight }) => {
        path.removeEventListener('mouseenter', handleMouseEnter);
        path.removeEventListener('mouseleave', handleMouseLeave);
        path.removeEventListener('click', handleSingleClick);
        removeHighlight();
      });
      if (observer) observer.disconnect();
      activeSlotRef.current = null;
      setActiveSlotId(null);
    };
  }, [selectedElement, selectedLayerId]);

  useEffect(() => {
    slots.forEach(slot => {
      if (slot.currentImage && !slotMeta[slot.id]) {
        const img = new window.Image();
        img.onload = () => {
          setSlotMeta(prev => {
            if (prev[slot.id]) return prev;
            return {
              ...prev,
              [slot.id]: {
                name: 'Image Name .jpg',
                meta: `${img.width} X ${img.height} • 24MB`
              }
            };
          });
        };
        img.src = slot.currentImage;
      }
    });
  }, [slots]);

  const processFileForSlot = (file, slotId, customName = null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only Image formats are allowed for slots.');
      return;
    }
    const fileName = customName || file.name || 'Image Name .jpg';
    const fileSizeFormatted = file.size
      ? (file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(0)}MB`
        : `${Math.max(1, Math.round(file.size / 1024))}KB`)
      : '24MB';

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const img = new window.Image();
      img.onload = () => {
        setSlotMeta(prev => ({
          ...prev,
          [slotId]: {
            name: fileName,
            meta: `${img.width} X ${img.height} • ${fileSizeFormatted}`,
            originalUrl: dataUrl,
            size: fileSizeFormatted,
            cropData: null,
            filters: null,
            opacity: 100
          }
        }));
        updateSlotImage(slotId, dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSlotImage = (slotId) => {
    if (!selectedElement) return;
    setSlotMeta(prev => ({
      ...prev,
      [slotId]: {
        name: 'Image Name .jpg',
        meta: '300 X 300 • 24MB',
        originalUrl: DEFAULT_FRAME_IMAGE,
        cropData: null,
        filters: null,
        opacity: 100
      }
    }));
    setSlotOpacities(prev => ({
      ...prev,
      [slotId]: 100
    }));
    updateSlotImage(slotId, DEFAULT_FRAME_IMAGE);
  };

  const handleImageDrop = async (e, slotId) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFileForSlot(files[0], slotId);
    }
  };

  const handleFileChange = async (e, slotId) => {
    const file = e.target.files?.[0];
    if (file) {
      processFileForSlot(file, slotId);
    }
    e.target.value = '';
  };

  const syncDomChanges = () => {
    if (!selectedElement) return;
    window.__skipCanvasUpdateForPage = activePageIndex;
    let svgRoot = selectedElement;
    while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
      svgRoot = svgRoot.parentElement;
    }
    if (svgRoot) {
      const cloneSvg = svgRoot.cloneNode(true);
      cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(el => el.remove());
      const serializer = new XMLSerializer();
      const html = serializer.serializeToString(cloneSvg);
      updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
    }
  };

  const updateGapAndRadius = (newGap, newRadius, skipSync = false) => {
    if (!selectedElement) return;

    const paths = Array.from(selectedElement.querySelectorAll('path, polygon, rect, circle, ellipse'))
      .filter(p => p.hasAttribute('fill') && p.getAttribute('fill').startsWith('url(#pattern'));

    let defs = selectedElement.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      selectedElement.insertBefore(defs, selectedElement.firstChild);
    }

    paths.forEach((path, i) => {
      let maskId = `gap-mask-${selectedElement.id || 'frame'}-${i}`;
      let mask = defs.querySelector(`mask[id="${maskId}"]`);
      if (!mask) {
        mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
        mask.id = maskId;
        defs.appendChild(mask);
      }

      if (newGap > 0) {
        mask.innerHTML = ''; // clear old mask shapes
        mask.setAttribute('maskUnits', 'userSpaceOnUse');

        const whiteRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        // Cover everything so the image is visible
        whiteRect.setAttribute('x', '-5000');
        whiteRect.setAttribute('y', '-5000');
        whiteRect.setAttribute('width', '10000');
        whiteRect.setAttribute('height', '10000');
        whiteRect.setAttribute('fill', 'white');
        mask.appendChild(whiteRect);

        const clone = path.cloneNode(true);
        clone.setAttribute('fill', 'none'); // MUST be none, otherwise it defaults to black and hides the whole shape!
        clone.removeAttribute('mask');
        clone.removeAttribute('id');
        clone.removeAttribute('data-pattern-id');
        clone.removeAttribute('transform'); // Remove transform so it evaluates in path's local coordinate system
        clone.setAttribute('stroke', 'black');
        clone.setAttribute('stroke-width', newGap);
        clone.setAttribute('stroke-linejoin', 'round');
        mask.appendChild(clone);
        
        path.setAttribute('mask', `url(#${maskId})`);
      } else {
        path.removeAttribute('mask');
        if (mask) mask.remove();
      }
    });

    selectedElement.setAttribute('data-frame-gap', newGap.toString());

    paths.forEach(path => {
      // Radius translates to rx/ry for rect, or data-rx for shapes
      if (newRadius > 0) {
        if (path.tagName.toLowerCase() === 'rect') {
          path.setAttribute('rx', newRadius);
          path.setAttribute('ry', newRadius);
        } else {
          path.setAttribute('stroke-linejoin', 'round');
          path.setAttribute('data-rx', newRadius); // Keep track of it
        }
      } else {
        if (path.tagName.toLowerCase() === 'rect') {
          path.removeAttribute('rx');
          path.removeAttribute('ry');
        } else {
          path.removeAttribute('stroke-linejoin');
          path.removeAttribute('data-rx');
        }
      }
    });

    setGap(newGap);
    setRadius(newRadius);

    // Also update all slot radii state to match the global one
    const newSlotRadii = {};
    paths.forEach(p => {
      const pId = p.dataset.patternId;
      if (pId) newSlotRadii[pId] = newRadius;
    });
    setSlotRadii(newSlotRadii);

    const bgRect = selectedElement.querySelector('.frame-bg-rect');
    if (bgRect) {
      if (newRadius > 0) {
        bgRect.setAttribute('rx', newRadius);
        bgRect.setAttribute('ry', newRadius);
      } else {
        bgRect.removeAttribute('rx');
        bgRect.removeAttribute('ry');
      }
    }

    if (!skipSync) {
      syncDomChanges();
    }
  };

  const updateSlotRadius = (patternId, newRadius, skipSync = false) => {
    if (!selectedElement) return;

    setSlotRadii(prev => ({ ...prev, [patternId]: newRadius }));

    const paths = Array.from(selectedElement.querySelectorAll('path, polygon, rect, circle, ellipse'));
    const path = paths.find(p => p.dataset.patternId === patternId);
    if (path) {
      if (newRadius > 0) {
        if (path.tagName.toLowerCase() === 'rect') {
          path.setAttribute('rx', newRadius);
          path.setAttribute('ry', newRadius);
        } else {
          path.setAttribute('stroke-linejoin', 'round');
          path.setAttribute('data-rx', newRadius);
        }
      } else {
        if (path.tagName.toLowerCase() === 'rect') {
          path.removeAttribute('rx');
          path.removeAttribute('ry');
        } else {
          path.removeAttribute('stroke-linejoin');
          path.removeAttribute('data-rx');
        }
      }

      // Also update highlight clone if it exists
      const highlightId = `highlight-${patternId}`;
      const highlight = selectedElement.querySelector(`[data-highlight-id="${highlightId}"]`);
      if (highlight) {
        if (newRadius > 0 && highlight.tagName.toLowerCase() === 'rect') {
          highlight.setAttribute('rx', newRadius);
          highlight.setAttribute('ry', newRadius);
        } else if (highlight.tagName.toLowerCase() === 'rect') {
          highlight.removeAttribute('rx');
          highlight.removeAttribute('ry');
        }
      }
    }

    if (!skipSync) syncDomChanges();
  };

  const updateFramePadding = (newPadding, skipSync = false) => {
    if (!selectedElement) return;

    setFramePadding(newPadding);
    selectedElement.setAttribute('data-frame-padding', newPadding);

    const scaleVal = (100 - newPadding) / 100;

    const paths = Array.from(selectedElement.querySelectorAll('path, polygon, rect, circle, ellipse'))
      .filter(p => p.hasAttribute('fill') && p.getAttribute('fill').startsWith('url(#pattern'));

    paths.forEach(p => {
      if (!p.hasAttribute('data-orig-tf')) {
        p.setAttribute('data-orig-tf', p.getAttribute('transform') || '');
      }
    });

    // Find or create boundary rect
    let boundary = selectedElement.querySelector('.frame-bg-rect');
    if (!boundary) {
      // Restore ONLY original transforms to get true full layout bbox
      paths.forEach(p => {
        const origTf = p.getAttribute('data-orig-tf');
        if (origTf) p.setAttribute('transform', origTf);
        else p.removeAttribute('transform');
      });

      const bbox = selectedElement.getBBox();
      boundary = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      boundary.setAttribute('class', 'frame-bg-rect');

      const fillVal = selectedElement.getAttribute('data-frame-bg-fill') || 'none';
      boundary.setAttribute('fill', fillVal !== '#' ? fillVal : 'none');
      const bgOp = selectedElement.getAttribute('data-frame-bg-opacity');
      if (bgOp) boundary.setAttribute('fill-opacity', bgOp);

      const strokeVal = selectedElement.getAttribute('data-frame-stroke') || 'none';
      boundary.setAttribute('stroke', strokeVal !== '#' ? strokeVal : 'none');
      const strOp = selectedElement.getAttribute('data-frame-stroke-opacity');
      if (strOp) boundary.setAttribute('stroke-opacity', strOp);
      const strW = selectedElement.getAttribute('data-frame-stroke-width');
      if (strW) boundary.setAttribute('stroke-width', strW);
      const strDash = selectedElement.getAttribute('data-frame-stroke-dasharray');
      if (strDash) boundary.setAttribute('stroke-dasharray', strDash);
      if (radius > 0) {
        boundary.setAttribute('rx', radius);
        boundary.setAttribute('ry', radius);
      }

      boundary.setAttribute('pointer-events', 'none');
      boundary.setAttribute('x', bbox.x);
      boundary.setAttribute('y', bbox.y);
      boundary.setAttribute('width', bbox.width);
      boundary.setAttribute('height', bbox.height);
      selectedElement.insertBefore(boundary, selectedElement.firstChild);
    }

    const frameCx = parseFloat(boundary.getAttribute('x')) + parseFloat(boundary.getAttribute('width')) / 2;
    const frameCy = parseFloat(boundary.getAttribute('y')) + parseFloat(boundary.getAttribute('height')) / 2;

    const paddingTransform = `translate(${frameCx}, ${frameCy}) scale(${scaleVal}) translate(${-frameCx}, ${-frameCy})`;

    paths.forEach(path => {
      const origTf = path.getAttribute('data-orig-tf');
      const finalTransform = origTf ? `${paddingTransform} ${origTf}` : paddingTransform;
      path.setAttribute('transform', finalTransform);

      const patternId = path.dataset.patternId;
      if (patternId) {
        const highlightId = `highlight-${patternId}`;
        const highlight = selectedElement.querySelector(`[data-highlight-id="${highlightId}"]`);
        if (highlight) {
          highlight.setAttribute('transform', finalTransform);
        }
      }
    });

    if (!skipSync) {
      syncDomChanges();
    }
  };

  const updateRotation = (angle, skipSync = false) => {
    if (!selectedElement) return;

    const paths = Array.from(selectedElement.querySelectorAll('path, polygon, rect, circle, ellipse'))
      .filter(p => p.hasAttribute('fill') && p.getAttribute('fill').startsWith('url(#pattern'));

    const slotsToUpdate = activeSlotId ? [activeSlotId] : paths.map(p => p.dataset.patternId).filter(Boolean);

    setSlotRotations(prev => {
      const next = { ...prev };
      slotsToUpdate.forEach(id => { next[id] = angle; });
      return next;
    });

    slotsToUpdate.forEach(patternId => {
      const path = paths.find(p => p.getAttribute('data-pattern-id') === patternId || p.dataset?.patternId === patternId);
      if (path) {
        updateShapeMaskTransform({
          selectedElement: path,
          angle: angle
        });
      }
    });

    if (!skipSync) syncDomChanges();
  };

  const updateOpacity = (opacityVal, skipSync = false) => {
    if (!selectedElement) return;

    const paths = Array.from(selectedElement.querySelectorAll('path, polygon, rect, circle, ellipse'))
      .filter(p => p.hasAttribute('fill') && p.getAttribute('fill').startsWith('url(#pattern'));

    const slotsToUpdate = activeSlotId ? [activeSlotId] : paths.map(p => p.dataset.patternId).filter(Boolean);
    
    setSlotOpacities(prev => {
      const next = { ...prev };
      slotsToUpdate.forEach(id => { next[id] = opacityVal; });
      return next;
    });

    slotsToUpdate.forEach(patternId => {
      const path = paths.find(p => p.getAttribute('data-pattern-id') === patternId || p.dataset?.patternId === patternId);
      if (path) {
        updateShapeMaskOpacity({
          selectedElement: path,
          opacity: opacityVal
        });
      }
    });

    if (!skipSync) syncDomChanges();
  };

  const updateSlotImage = (patternId, dataUrl, skipSync = false) => {
    if (!selectedElement) return;

    const pattern = selectedElement.querySelector(`pattern[id="${patternId}"]`);
    if (!pattern) return;

    const shapeEl = selectedElement.querySelector(`[fill="url(#${patternId})"]`) ||
      selectedElement.querySelector(`[data-pattern-id="${patternId}"]`);
    if (!shapeEl) return;

    const img = new window.Image();
    img.onload = () => {
      const imgW = img.width;
      const imgH = img.height;

      shapeEl.setAttribute('data-mask-enabled', 'true');
      shapeEl.setAttribute('data-masked-image-url', dataUrl);
      shapeEl.setAttribute('data-slot-original-url', dataUrl);
      shapeEl.setAttribute('data-slot-image-meta', `${imgW} X ${imgH}`);
      shapeEl.setAttribute('data-slot-pan-x', '0');
      shapeEl.setAttribute('data-slot-pan-y', '0');
      shapeEl.setAttribute('data-slot-zoom', '1');

      let bgRect = pattern.querySelector('rect.mask-bg-fill');
      if (!bgRect) {
        bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('class', 'mask-bg-fill');
        bgRect.setAttribute('width', '1');
        bgRect.setAttribute('height', '1');
        bgRect.setAttribute('x', '0');
        bgRect.setAttribute('y', '0');
        const curFill = selectedElement.getAttribute('data-frame-bg-fill') || 'none';
        bgRect.setAttribute('fill', curFill !== '#' ? curFill : 'none');
        const curOp = selectedElement.getAttribute('data-frame-bg-opacity');
        if (curOp) bgRect.setAttribute('fill-opacity', curOp);
        pattern.insertBefore(bgRect, pattern.firstChild);
      }

      let imageNode = pattern.querySelector('image, img');
      const useNode = pattern.querySelector('use');

      if (!imageNode && useNode) {
        imageNode = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        pattern.removeChild(useNode);
        pattern.appendChild(imageNode);
      } else if (!imageNode) {
        imageNode = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        pattern.appendChild(imageNode);
      }

      imageNode.setAttribute('href', dataUrl);
      imageNode.setAttribute('xlink:href', dataUrl);

      const curOpacity = shapeEl.getAttribute('data-slot-opacity') || selectedElement.getAttribute('data-slot-opacity');
      if (curOpacity !== null && curOpacity !== undefined && curOpacity !== '') {
        const dec = Math.max(0, Math.min(1, parseFloat(curOpacity) / 100)).toString();
        imageNode.setAttribute('opacity', dec);
      }

      updateShapeMaskTransform({
        selectedElement: shapeEl,
        panX: 0,
        panY: 0,
        zoom: 1
      });

      if (!skipSync) {
        syncDomChanges();
      }
    };
    img.src = dataUrl;
  };



  return (
    <div className="flex flex-col gap-[1.2vw] font-sans select-none text-gray-800">
      {/* Title Header */}
      <div className="flex items-center gap-[0.8vw] mb-[0.25vw]">
        <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap">
          Image Framing Properties
        </span>
        <div className="flex-1 h-[1px] bg-gray-200" />
      </div>

      {/* ── 1. Top Section: Add Images Dashed Button (shown before upload) ── */}
      {!slots.some(s => s.currentImage && s.currentImage !== DEFAULT_FRAME_IMAGE) && (
        <div
          onClick={() => {
            const targetSlot = slots.find(s => s.id === activeSlotId) || slots[0];
            if (targetSlot && slotReplaceRefs.current[targetSlot.id]) {
              slotReplaceRefs.current[targetSlot.id]?.click();
            }
          }}
          className="w-full py-[1vw] border-2 border-dashed border-gray-300 rounded-[0.55vw] flex items-center justify-center gap-[0.5vw] text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer font-medium text-[0.85vw]"
        >
          <Plus size="1vw" />
          <span>Add Images</span>
        </div>
      )}

      {/* ── 2. Images Slots List (exact layout of ShapeProperties) ── */}
      {slots.length > 0 && (
        <div className="flex flex-col gap-[0.6vw]">
          {slots.map((slot, i) => {
            const isSelected = activeSlotId === slot.id;
            const meta = slotMeta[slot.id] || {
              name: 'Image Name .jpg',
              meta: '300 X 300 • 24MB'
            };

            return (
              <div
                key={slot.id}
                onClick={() => {
                  if (slots.length > 1 && selectedElement) {
                    selectedElement.querySelectorAll('[data-highlight-id]').forEach(el => el.remove());
                  }

                  if (activeSlotId === slot.id) {
                    setActiveSlotId(null);
                    activeSlotRef.current = null;
                  } else {
                    setActiveSlotId(slot.id);
                    activeSlotRef.current = slot.id;

                    if (slots.length > 1 && selectedElement) {
                      const highlightId = `highlight-${slot.id}`;
                      const path = slot.path || selectedElement.querySelector(`[data-pattern-id="${slot.id}"], [fill*="${slot.id}"]`);
                      if (path) {
                        const highlight = path.cloneNode();
                        highlight.setAttribute('data-highlight-id', highlightId);
                        highlight.setAttribute('pointer-events', 'none');
                        highlight.setAttribute('fill', 'none');
                        highlight.setAttribute('stroke', '#2563eb');
                        highlight.setAttribute('stroke-width', '2');
                        highlight.setAttribute('vector-effect', 'non-scaling-stroke');
                        highlight.setAttribute('stroke-dasharray', '4,5');
                        selectedElement.appendChild(highlight);
                      }
                    }
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => handleImageDrop(e, slot.id)}
                className={`flex items-center gap-[0.9vw] p-[0.8vw] bg-white rounded-[0.55vw] border shadow-2xs transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                {/* Thumbnail */}
                <div
                  className="relative w-[7.6vw] h-[5.6vw] rounded-[0.45vw] overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0 flex items-center justify-center shadow-2xs group"
                >
                  <img
                    src={slot.currentImage || DEFAULT_FRAME_IMAGE}
                    alt={meta.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Adjustment Icon Button (Top Right) */}
                  <button
                    type="button"
                    data-adjustment-trigger="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdjustTargetSlotId(slot.id);
                      setShowAdjustModal(prev => (adjustTargetSlotId === slot.id ? !prev : true));
                    }}
                    className={`absolute top-[0.35vw] right-[0.35vw] w-[1.7vw] h-[1.7vw] rounded-[0.35vw] shadow-md border flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer z-10 ${
                      showAdjustModal && adjustTargetSlotId === slot.id
                        ? 'bg-gray-100 text-gray-900 border-gray-300'
                        : 'bg-white text-gray-800 border-gray-100 hover:bg-gray-50'
                    }`}
                    title="Image Adjustments"
                  >
                    <AdjustmentIcon className="w-[0.95vw] h-[0.95vw]" />
                  </button>
                </div>

                {/* Info & Actions */}
                <div className="flex flex-col flex-1 min-w-0 justify-between py-[0.15vw]">
                  <div className="flex flex-col gap-[0.2vw]">
                    <span className="text-[0.82vw] font-semibold text-gray-900 truncate" title={meta.name}>
                      {meta.name}
                    </span>
                    <span className="text-[0.75vw] text-gray-500 font-medium truncate">
                      {meta.meta}
                    </span>
                  </div>

                  <div className="flex items-center gap-[0.5vw] mt-[0.7vw]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        slotReplaceRefs.current[slot.id]?.click();
                      }}
                      className="px-[0.7vw] h-[1.9vw] bg-white hover:bg-gray-50 text-gray-700 text-[0.8vw] font-medium rounded-[0.4vw] border border-gray-300 shadow-2xs hover:border-gray-400 cursor-pointer transition-colors"
                    >
                      Replace image
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlotImage(slot.id);
                      }}
                      className="h-[1.9vw] px-[0.5vw] bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-[0.4vw] border border-gray-300 shadow-2xs hover:border-red-200 cursor-pointer transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-[0.85vw] h-[0.85vw]" />
                    </button>
                  </div>
                </div>

                {/* Hidden File Input for this slot */}
                <input
                  type="file"
                  ref={(el) => (slotReplaceRefs.current[slot.id] = el)}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, slot.id)}
                />
              </div>
            );
          })}
        </div>
      )}

      {slots.length === 0 && (
        <div className="text-[0.8vw] text-gray-500 text-center py-[2vw]">
          No image slots found in this frame.
        </div>
      )}

      {/* ── 3. Properties Sliders ── */}
      <div className="flex flex-col gap-[0.4vw]">
        {slots.length > 1 && (
          <PropertySlider 
            label="Partition" 
            value={gap} 
            onChange={(val) => updateGapAndRadius(val, radius, true)} 
            onPointerUp={syncDomChanges}
            min={0}
            max={50}
          />
        )}

        {slots.some(s => s.path.tagName.toLowerCase() === 'rect') && (
          <PropertySlider 
            label="Corner" 
            value={activeSlotId ? (slotRadii[activeSlotId] || 0) : radius} 
            onChange={(val) => {
              if (activeSlotId) {
                updateSlotRadius(activeSlotId, val, true);
              } else {
                updateGapAndRadius(gap, val, true);
              }
            }}
            onPointerUp={syncDomChanges}
            min={0}
            max={100}
          />
        )}

        <PropertySlider 
          label="Opacity" 
          value={activeSlotId ? (slotOpacities[activeSlotId] ?? 100) : (Object.values(slotOpacities)[0] ?? 100)} 
          onChange={(val) => updateOpacity(val, true)} 
          onPointerUp={syncDomChanges}
          min={0} 
          max={100} 
          unit="%"
        />

        <PropertySlider 
          label="Rotation" 
          value={activeSlotId ? (slotRotations[activeSlotId] || 0) : (Object.values(slotRotations)[0] || 0)} 
          onChange={(val) => updateRotation(val, true)} 
          onPointerUp={syncDomChanges}
          min={-180} 
          max={180} 
          unit="°"
        />
      </div>

      {/* ===================== 4. APPEARANCE: COLOR ===================== */}
      <Color
        openSubSection={openSubSection}
        setOpenSubSection={setOpenSubSection}
        backgroundColor={backgroundColor}
        setBackgroundColor={handleSetBackgroundColor}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={setActiveColorPicker}
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
        colorsOnPage={colorsOnPage}
        showDetailedPicker={showDetailedPicker}
        setShowDetailedPicker={setShowDetailedPicker}
        hideFill={false}
        noAccordion={true}
      />

      {/* ===================== 5. APPEARANCE: EFFECTS ===================== */}
      <Effect
        isShape={true}
        openSubSection={openSubSection}
        setOpenSubSection={setOpenSubSection}
        activeEffects={activeEffects}
        setActiveEffects={handleSetActiveEffects}
        effectSettings={effectSettings}
        setEffectSettings={handleSetEffectSettings}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={setActiveColorPicker}
        showDetailedPicker={showDetailedPicker}
        setShowDetailedPicker={setShowDetailedPicker}
        hideBlur={true}
        hideInnerShadow={true}
        noAccordion={true}
      />

      {/* ===================== IMAGE ADJUSTMENT MODAL ===================== */}
      <ImageAdjustmentModal
        isOpen={showAdjustModal}
        onClose={() => {
          setShowAdjustModal(false);
          setAdjustTargetSlotId(null);
        }}
        filters={currentSlotFilters}
        onChange={handleAdjustmentChange}
        onResetAll={handleResetAllAdjustments}
      />

      {/* CUSTOM CSS */}
      <style>{`
        .hide-opacity-bar .space-y-\\[1vw\\] > div:nth-child(2) {
          display: none !important;
        }
        input[type='range'] {
          position: relative;
        }
        input[type='range']::before {
          content: ""; position: absolute; top: -0.75vw; bottom: -0.75vw; left: 0; right: 0; cursor: pointer; z-index: 1;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 1.1vw;
          width: 1.1vw;
          border-radius: 50%;
          background: #ffffff;
          border: 0.1vw solid #e5e7eb;
          box-shadow: 0 0.1vw 0.3vw rgba(0,0,0,0.1);
          cursor: pointer;
          position: relative;
          z-index: 2;
        }
        input[type='range'].blue-thumb::-webkit-slider-thumb {
          background: #6366f1;
          border-color: #6366f1;
          height: 0.8vw;
          width: 0.8vw;
        }
        .no-spin::-webkit-inner-spin-button, .no-spin::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        body.is-scrubbing, body.is-scrubbing * {
          cursor: none !important;
          user-select: none !important;
        }
        .hide-cursor, .hide-cursor * {
          cursor: none !important;
        }
        .virtual-scrub-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 100000;
          width: 2vw;
          height: 2vw;
          margin-left: -1vw;
          margin-top: -1vw;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0.1vw 0.2vw rgba(0,0,0,0.3));
        }
      `}</style>
    </div>
  );
};

export default ImageFramingProperties;
