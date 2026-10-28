import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Upload,
  Plus,
  GripVertical,
  Trash2,
  Edit2,
  ArrowRightLeft
} from 'lucide-react';
import ColorPicker from '../../../../ColorPicker';
import ImageAdjustModal from './ImageAdjustModal';
import Effect from '../../../properties/Effect';
import { ElementSlider, ElementDropdown } from './ElementUIControls';
import { DEFAULT_FRAME_IMAGE } from '../utils/imageFramingUtils';

const PropertySlider = ({ label, value, onChange, onPointerUp, min = 0, max = 100 }) => {
  return (
    <div className="flex items-center gap-[0.5vw] py-[0.4vw]">
      <span className="text-[0.8vw] font-semibold text-gray-600 whitespace-nowrap min-w-[5.5vw]">{label} :</span>
      <div className="flex-grow flex items-center gap-[1vw]">
        <ElementSlider
          min={min}
          max={max}
          step={1}
          value={value || 0}
          onChange={(val) => onChange(val)}
          onPointerUp={onPointerUp}
          className="flex-grow"
        />
        <div className="w-[2.8vw] h-[1.8vw] flex items-center justify-center bg-white border border-gray-100 rounded-[0.4vw] shadow-sm flex-shrink-0">
          <input
            type="number"
            min={min}
            max={max}
            value={value || 0}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            onBlur={onPointerUp}
            onKeyDown={(e) => { if (e.key === 'Enter') onPointerUp(); }}
            className="w-full text-center text-[0.8vw] text-gray-700 font-semibold outline-none bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};

const ImageFramingProperties = ({ selectedElement, selectedLayerId, activePageIndex, updateElementAttribute, selectedElementProps }) => {
  const [slots, setSlots] = useState([]);
  const [gap, setGap] = useState(0);
  const [radius, setRadius] = useState(0);
  const [framePadding, setFramePadding] = useState(0);
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [slotRadii, setSlotRadii] = useState({});
  const [slotRotations, setSlotRotations] = useState({});
  const [slotMeta, setSlotMeta] = useState({});
  const slotReplaceRefs = useRef({});
  const activeSlotRef = useRef(null);
  const adjustStateRef = useRef({ isAdjusting: false, slotId: null, isPanning: false, startX: 0, startY: 0, matrix: null, rotateStr: '', imgNode: null, bbox: null, startMatrix: null, path: null });

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTargetSlotId, setAdjustTargetSlotId] = useState(null);

  const [openSubSection, setOpenSubSection] = useState('slots');
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [showDetailedPicker, setShowDetailedPicker] = useState(false);

  const [localFillHex, setLocalFillHex] = useState(null);
  const [localStrokeHex, setLocalStrokeHex] = useState(null);

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

  const backgroundColor = {
    fill: selectedElementProps?.['data-frame-bg-fill'] || 'none',
    fillOpacity: selectedElementProps?.['data-frame-bg-opacity'] ? parseFloat(selectedElementProps['data-frame-bg-opacity']) * 100 : 100,
    stroke: selectedElementProps?.['data-frame-stroke'] || 'none',
    strokeOpacity: selectedElementProps?.['data-frame-stroke-opacity'] ? parseFloat(selectedElementProps['data-frame-stroke-opacity']) * 100 : 100,
    fillType: 'solid',
    fillGradientType: 'linear',
    fillStops: [],
    fillAngle: 0,
    fillRadius: 100,
    strokeType: 'solid',
    strokeGradientType: 'linear',
    strokeStops: [],
    strokeAngle: 0,
    strokeRadius: 100,
    strokeWeight: parseFloat(selectedElementProps?.['data-frame-stroke-width'] || 0),
    strokeDashStyle: ((selectedElementProps?.['data-frame-stroke-dasharray']) && selectedElementProps['data-frame-stroke-dasharray'] !== 'none') ? 'Dashed' : 'Solid',
    strokeDasharrayValue: selectedElementProps?.['data-frame-stroke-dasharray'] || 'none',
    strokeDashLength: parseInt((selectedElementProps?.['data-frame-stroke-dasharray'] === 'none' ? '10,10' : (selectedElementProps?.['data-frame-stroke-dasharray'] || '10,10')).split(',')[0]) || 10,
    strokeDashGap: parseInt((selectedElementProps?.['data-frame-stroke-dasharray'] === 'none' ? '10,10' : (selectedElementProps?.['data-frame-stroke-dasharray'] || '10,10')).split(',')[1]) || 10,
    strokeLinecap: selectedElementProps?.['data-frame-stroke-linecap'] || 'square',
    strokePosition: selectedElementProps?.['data-frame-stroke-position'] || 'Outside',
  };

  const handleSetBackgroundColor = (updater) => {
    const next = typeof updater === 'function' ? updater(backgroundColor) : updater;
    const updates = {};
    if (backgroundColor.fill !== next.fill) updates['data-frame-bg-fill'] = next.fill;
    if (backgroundColor.fillOpacity !== next.fillOpacity) updates['data-frame-bg-opacity'] = (next.fillOpacity / 100).toString();
    if (backgroundColor.stroke !== next.stroke) updates['data-frame-stroke'] = next.stroke;
    if (backgroundColor.strokeOpacity !== next.strokeOpacity) updates['data-frame-stroke-opacity'] = (next.strokeOpacity / 100).toString();
    if (backgroundColor.strokeWeight !== next.strokeWeight) updates['data-frame-stroke-width'] = next.strokeWeight.toString();
    if (backgroundColor.strokeDashStyle !== next.strokeDashStyle || backgroundColor.strokeDashLength !== next.strokeDashLength || backgroundColor.strokeDashGap !== next.strokeDashGap || backgroundColor.strokeDasharrayValue !== next.strokeDasharrayValue) {
      const dashValue = (next.strokeDashStyle === 'none' || next.strokeDashStyle === 'Solid') 
        ? 'none' 
        : (next.strokeDasharrayValue || `${next.strokeDashLength || 10},${next.strokeDashGap || 10}`);
      updates['data-frame-stroke-dasharray'] = dashValue;
    }
    if (backgroundColor.strokeLinecap !== next.strokeLinecap && next.strokeLinecap !== undefined) {
      updates['data-frame-stroke-linecap'] = next.strokeLinecap;
    }
    if (backgroundColor.strokePosition !== next.strokePosition && next.strokePosition !== undefined) {
      updates['data-frame-stroke-position'] = next.strokePosition;
    }

    if (Object.keys(updates).length > 0) {
      Object.entries(updates).forEach(([k, v]) => selectedElement.setAttribute(k, v));
      
      let bgRect = selectedElement.querySelector('.frame-bg-rect');
      if (!bgRect) {
        updateFramePadding(framePadding, true);
        bgRect = selectedElement.querySelector('.frame-bg-rect');
      }
      
      if (bgRect) {
        bgRect.setAttribute('fill', next.fill !== 'none' && next.fill !== '#' ? next.fill : 'none');
        if (next.fillOpacity !== undefined) bgRect.setAttribute('fill-opacity', next.fillOpacity / 100);
        bgRect.setAttribute('stroke', next.stroke !== 'none' && next.stroke !== '#' ? next.stroke : 'none');
        if (next.strokeOpacity !== undefined) bgRect.setAttribute('stroke-opacity', next.strokeOpacity / 100);
        if (next.strokeWeight !== undefined) {
          const sw = parseFloat(next.strokeWeight) || 0;
          bgRect.setAttribute('paint-order', 'stroke fill');
          bgRect.style.paintOrder = 'stroke fill';
          bgRect.setAttribute('stroke-width', (sw * 2).toString());
          bgRect.setAttribute('data-frame-stroke-width', sw.toString());
        }
        const dashValue = (next.strokeDashStyle === 'none' || next.strokeDashStyle === 'Solid') 
          ? 'none' 
          : (next.strokeDasharrayValue || `${next.strokeDashLength || 10},${next.strokeDashGap || 10}`);
        bgRect.setAttribute('stroke-dasharray', dashValue);
        if (next.strokeLinecap !== undefined) {
          bgRect.setAttribute('stroke-linecap', next.strokeLinecap);
          bgRect.setAttribute('stroke-linejoin', next.strokeLinecap === 'round' ? 'round' : 'miter');
        }
      }

      // Gap color is now handled perfectly by the frame-bg-rect showing through the SVG mask holes.
      // We no longer apply strokes to the paths to fake gaps!
      const paths = Array.from(selectedElement.querySelectorAll('path, polygon, rect, circle, ellipse'))
        .filter(p => p.hasAttribute('fill') && p.getAttribute('fill').startsWith('url(#pattern'));
      paths.forEach(path => {
        path.removeAttribute('stroke');
        path.removeAttribute('stroke-opacity');
        path.removeAttribute('stroke-width');
      });

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

    // Find all paths that use a pattern for fill
    const paths = Array.from(selectedElement.querySelectorAll('path, polygon, rect, circle, ellipse'));
    const imageSlots = [];
    const listeners = [];

    const updateAdjustTransform = () => {
        if (!adjustStateRef.current.matrix) return;
        const m = adjustStateRef.current.matrix;
        const transformStr = `${adjustStateRef.current.rotateStr || ''}matrix(${m[0]} ${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]})`;
        if (adjustStateRef.current.imgNode) {
            adjustStateRef.current.imgNode.setAttribute('transform', transformStr);
        }
        const ghost = selectedElement.querySelector('#ghost-layer');
        if (ghost) {
            const ghostImg = ghost.querySelector('image, img');
            const outline = ghost.querySelector('rect');
            if (ghostImg) ghostImg.setAttribute('transform', transformStr);
            if (outline) outline.setAttribute('transform', transformStr);
        }
    };

    const enterAdjustMode = (patternId, path) => {
        const pattern = selectedElement.querySelector(`pattern[id="${patternId}"]`);
        if (!pattern) return;
        let imgNode = pattern.querySelector('image, img');
        if (!imgNode) {
          const useNode = pattern.querySelector('use');
          if (useNode) {
            const href = useNode.getAttribute('href') || useNode.getAttribute('xlink:href') || '';
            const targetId = href.replace('#', '');
            imgNode = selectedElement.querySelector(`image[id="${targetId}"], img[id="${targetId}"]`);
          }
        }
        if (!imgNode) return; // Cannot adjust empty slot

        adjustStateRef.current.isAdjusting = true;
        adjustStateRef.current.slotId = patternId;
        adjustStateRef.current.imgNode = imgNode;
        adjustStateRef.current.path = path;
        adjustStateRef.current.bbox = path.getBBox();
        
        const transformStr = imgNode.getAttribute('transform');
        let matrix = [1, 0, 0, 1, 0, 0];
        let rotateStr = '';
        if (transformStr) {
            const rMatch = transformStr.match(/rotate\([^)]+\)/);
            if (rMatch) rotateStr = rMatch[0] + ' ';
            
            const match = transformStr.match(/matrix\(([^)]+)\)/);
            if (match) {
                matrix = match[1].split(/[ ,]+/).map(parseFloat);
            }
        }
        adjustStateRef.current.matrix = matrix;
        adjustStateRef.current.rotateStr = rotateStr;

        let ghost = selectedElement.querySelector('#ghost-layer');
        if (ghost) ghost.remove();
        
        ghost = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        ghost.id = 'ghost-layer';
        ghost.style.pointerEvents = 'none';
        
        // Inherit path's transform to match local coordinate space
        let combinedTransform = path.getAttribute('transform') || '';
        const pt = pattern.getAttribute('patternTransform');
        if (pt) {
            combinedTransform = `${combinedTransform} ${pt}`.trim();
        }
        if (combinedTransform) {
            ghost.setAttribute('transform', combinedTransform);
        }
        
        const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const bbox = adjustStateRef.current.bbox;
        
        const pcu = pattern.getAttribute('patternContentUnits');
        if (!pcu || pcu === 'objectBoundingBox') {
            wrapper.setAttribute('transform', `translate(${bbox.x}, ${bbox.y}) scale(${bbox.width}, ${bbox.height})`);
        } else {
            wrapper.setAttribute('transform', `translate(0, 0)`);
        }
        
        const ghostImg = imgNode.cloneNode(true);
        ghostImg.setAttribute('opacity', '0.4');
        
        const outline = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        outline.setAttribute('fill', 'none');
        outline.setAttribute('stroke', '#f59e0b');
        outline.setAttribute('vector-effect', 'non-scaling-stroke');
        outline.setAttribute('stroke-dasharray', '5,5');
        
        let iw = imgNode.getAttribute('width');
        let ih = imgNode.getAttribute('height');
        if (!iw || iw.includes('%')) iw = (!pcu || pcu === 'objectBoundingBox') ? '1' : bbox.width.toString();
        if (!ih || ih.includes('%')) ih = (!pcu || pcu === 'objectBoundingBox') ? '1' : bbox.height.toString();
        
        outline.setAttribute('width', iw);
        outline.setAttribute('height', ih);
        
        const imgTransform = ghostImg.getAttribute('transform');
        if (imgTransform) outline.setAttribute('transform', imgTransform);
        
        wrapper.appendChild(ghostImg);
        wrapper.appendChild(outline);
        ghost.appendChild(wrapper);

        // Insert sibling to inherit group transforms
        if (path.parentNode) {
            path.parentNode.insertBefore(ghost, path.nextSibling);
        } else {
            selectedElement.appendChild(ghost);
        }

        const highlightId = `highlight-${patternId}`;
        let highlight = selectedElement.querySelector(`[data-highlight-id="${highlightId}"]`);
        if (highlight) {
            highlight.setAttribute('stroke', '#f59e0b');
            highlight.setAttribute('stroke-dasharray', '8,4');
        }
    };

    const exitAdjustMode = () => {
        adjustStateRef.current.isAdjusting = false;
        const ghost = selectedElement.querySelector('#ghost-layer');
        if (ghost) ghost.remove();
        
        if (adjustStateRef.current.slotId) {
            const highlightId = `highlight-${adjustStateRef.current.slotId}`;
            const highlight = selectedElement.querySelector(`[data-highlight-id="${highlightId}"]`);
            if (highlight) {
                highlight.setAttribute('stroke', '#2563eb');
                highlight.setAttribute('stroke-dasharray', '4,5');
            }
        }
        adjustStateRef.current.slotId = null;
        syncDomChanges();
    };

    const handlePointerMove = (e) => {
        if (!adjustStateRef.current.isPanning) return;
        e.preventDefault();
        e.stopPropagation();
        
        let dx = e.clientX - adjustStateRef.current.startX;
        let dy = e.clientY - adjustStateRef.current.startY;
        
        let pcu = 'objectBoundingBox';
        if (adjustStateRef.current.slotId && adjustStateRef.current.path) {
            const pattern = adjustStateRef.current.path.ownerSVGElement?.querySelector(`pattern[id="${adjustStateRef.current.slotId}"]`);
            if (pattern) {
                pcu = pattern.getAttribute('patternContentUnits') || 'objectBoundingBox';
                
                // Read rotation from patternTransform (old) OR from image transform (new)
                let rot = 0;
                const pt = pattern.getAttribute('patternTransform');
                if (pt) {
                    const match = pt.match(/rotate\(([-0-9.]+)/);
                    if (match) rot = parseFloat(match[1]);
                } else if (adjustStateRef.current.rotateStr) {
                    const match = adjustStateRef.current.rotateStr.match(/rotate\(([-0-9.]+)/);
                    if (match) rot = parseFloat(match[1]);
                }
                
                if (rot !== 0) {
                    const rad = -rot * Math.PI / 180;
                    const dxRot = dx * Math.cos(rad) - dy * Math.sin(rad);
                    const dyRot = dx * Math.sin(rad) + dy * Math.cos(rad);
                    dx = dxRot;
                    dy = dyRot;
                }
            }
        }

        let scaleX = 1;
        let scaleY = 1;
        if (adjustStateRef.current.path) {
            const ctm = adjustStateRef.current.path.getScreenCTM();
            if (ctm) {
                scaleX = ctm.a || 1;
                scaleY = ctm.d || 1;
            }
        }
        
        const bbox = adjustStateRef.current.bbox;
        let tx_delta, ty_delta;
        
        if (pcu === 'userSpaceOnUse') {
            tx_delta = dx / scaleX;
            ty_delta = dy / scaleY;
        } else {
            tx_delta = (dx / scaleX) / bbox.width;
            ty_delta = (dy / scaleY) / bbox.height;
        }
        
        const m = adjustStateRef.current.startMatrix;
        if (!m || !adjustStateRef.current.matrix) return;
        const newTx = m[4] + tx_delta;
        const newTy = m[5] + ty_delta;
        
        adjustStateRef.current.matrix[4] = newTx;
        adjustStateRef.current.matrix[5] = newTy;
        
        updateAdjustTransform();
    };

    const handlePointerUp = (e) => {
        if (adjustStateRef.current.isPanning) {
            adjustStateRef.current.isPanning = false;
        }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    paths.forEach((path, idx) => {
      const fill = path.getAttribute('fill');
      if (fill && fill.startsWith('url(#pattern')) {
        // Extract pattern ID
        const match = fill.match(/url\(#([^)]+)\)/);
        if (match && match[1]) {
          const patternId = match[1];
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

          const handleDoubleClick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (adjustStateRef.current.isAdjusting && adjustStateRef.current.slotId === patternId) {
              exitAdjustMode();
            } else {
              if (adjustStateRef.current.isAdjusting) {
                  exitAdjustMode();
              }
              enterAdjustMode(patternId, path);
            }
          };

          const handlePointerDown = (e) => {
            if (adjustStateRef.current.isAdjusting && adjustStateRef.current.slotId === patternId) {
                e.preventDefault();
                e.stopPropagation();
                adjustStateRef.current.isPanning = true;
                adjustStateRef.current.startX = e.clientX;
                adjustStateRef.current.startY = e.clientY;
                adjustStateRef.current.startMatrix = [...adjustStateRef.current.matrix];
            }
          };

          const handleWheel = (e) => {
            if (adjustStateRef.current.isAdjusting && adjustStateRef.current.slotId === patternId) {
                e.preventDefault();
                e.stopPropagation();
                
                const zoomDelta = e.deltaY < 0 ? 1.05 : 0.95;
                const m = adjustStateRef.current.matrix;
                
                let pcu = 'objectBoundingBox';
                const pattern = selectedElement?.querySelector(`pattern[id="${patternId}"]`);
                if (pattern) pcu = pattern.getAttribute('patternContentUnits') || 'objectBoundingBox';
                
                let cx = 0.5;
                let cy = 0.5;
                if (pcu === 'userSpaceOnUse' && adjustStateRef.current.bbox) {
                    cx = adjustStateRef.current.bbox.x + adjustStateRef.current.bbox.width / 2;
                    cy = adjustStateRef.current.bbox.y + adjustStateRef.current.bbox.height / 2;
                }

                m[0] *= zoomDelta;
                m[3] *= zoomDelta;
                m[4] = cx + (m[4] - cx) * zoomDelta;
                m[5] = cy + (m[5] - cy) * zoomDelta;
                
                updateAdjustTransform();
            }
          };

          path.addEventListener('mouseenter', handleMouseEnter);
          path.addEventListener('mouseleave', handleMouseLeave);
          path.addEventListener('click', handleSingleClick);
          path.addEventListener('dblclick', handleDoubleClick);
          path.addEventListener('pointerdown', handlePointerDown);
          path.addEventListener('wheel', handleWheel, { passive: false });

          listeners.push({ path, handleMouseEnter, handleMouseLeave, handleSingleClick, handleDoubleClick, handlePointerDown, handleWheel, removeHighlight });
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
    if (paths.length > 0) {
      const firstPath = paths[0];
      setGap(parseFloat(firstPath.getAttribute('stroke-width')) || 0);
      setRadius(parseFloat(firstPath.getAttribute('rx')) || parseFloat(firstPath.getAttribute('data-rx')) || 0);
    }
    
    // Load per-slot radii
    const initialRadii = {};
    const initialRotations = {};
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
               if (!foundRot) {
                   const imgNode = pattern.querySelector('image, img');
                   if (imgNode) {
                       const tf = imgNode.getAttribute('transform');
                       if (tf) {
                           const match = tf.match(/rotate\(([-0-9.]+)/);
                           if (match) initialRotations[pId] = parseFloat(match[1]);
                       }
                   }
               }
           }
       }
    });
    setSlotRadii(initialRadii);
    setSlotRotations(initialRotations);
    
    setFramePadding(parseFloat(selectedElement.getAttribute('data-frame-padding')) || 0);

    return () => {
      listeners.forEach(({ path, handleMouseEnter, handleMouseLeave, handleSingleClick, handleDoubleClick, handlePointerDown, handleWheel, removeHighlight }) => {
        path.removeEventListener('mouseenter', handleMouseEnter);
        path.removeEventListener('mouseleave', handleMouseLeave);
        path.removeEventListener('click', handleSingleClick);
        path.removeEventListener('dblclick', handleDoubleClick);
        if (handlePointerDown) path.removeEventListener('pointerdown', handlePointerDown);
        if (handleWheel) path.removeEventListener('wheel', handleWheel);
        removeHighlight();
      });
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (observer) observer.disconnect();
      activeSlotRef.current = null;
      setActiveSlotId(null);
      
      const ghost = selectedElement?.querySelector('#ghost-layer');
      if (ghost) ghost.remove();
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
    updateSlotImage(slotId, DEFAULT_FRAME_IMAGE);
  };

  const handleSaveAdjustedImage = ({
    croppedUrl,
    originalUrl,
    cropData,
    fixType,
    opacity: adjustedOpacity,
    filters
  }) => {
    if (!adjustTargetSlotId) return;
    const slotId = adjustTargetSlotId;

    const img = new window.Image();
    img.onload = () => {
      setSlotMeta(prev => ({
        ...prev,
        [slotId]: {
          name: prev[slotId]?.name || 'Image Name .jpg',
          meta: `${img.width} X ${img.height} • ${prev[slotId]?.size || '24MB'}`,
          originalUrl: originalUrl || prev[slotId]?.originalUrl || croppedUrl,
          cropData,
          fixType,
          opacity: adjustedOpacity,
          filters
        }
      }));
      updateSlotImage(slotId, croppedUrl);
    };
    img.src = croppedUrl;

    setShowAdjustModal(false);
    setAdjustTargetSlotId(null);
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
        
        path.removeAttribute('stroke');
        path.removeAttribute('stroke-opacity');
        path.removeAttribute('stroke-width');
        path.setAttribute('mask', `url(#${maskId})`);
      } else {
        path.removeAttribute('stroke');
        path.removeAttribute('stroke-opacity');
        path.removeAttribute('stroke-width');
        path.removeAttribute('mask');
        mask.remove();
      }
    });

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
    
    setSlotRadii(prev => ({...prev, [patternId]: newRadius}));
    
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
      const pattern = selectedElement.querySelector(`pattern[id="${patternId}"]`);
      const path = paths.find(p => p.getAttribute('data-pattern-id') === patternId || p.dataset?.patternId === patternId);
      if (pattern && path) {
        let bbox = { x: 0, y: 0, width: 100, height: 100 };
        try { bbox = path.getBBox(); } catch(e) {}
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        
        const pcu = pattern.getAttribute('patternContentUnits');
        let matrixStr = '';
        const imgNode = pattern.querySelector('image, img');
        
        if (imgNode) {
            let tf = imgNode.getAttribute('transform') || '';
            let m = [1, 0, 0, 1, 0, 0];
            const mMatch = tf.match(/matrix\(([^)]+)\)/);
            if (mMatch) {
                m = mMatch[1].split(/[ ,]+/).map(parseFloat);
            }
            
            if (pcu !== 'userSpaceOnUse') {
                // Upgrade from objectBoundingBox to userSpaceOnUse on the fly!
                m[0] = m[0] * bbox.width;
                m[2] = m[2] * bbox.width;
                m[1] = m[1] * bbox.height;
                m[3] = m[3] * bbox.height;
                m[4] = bbox.x + m[4] * bbox.width;
                m[5] = bbox.y + m[5] * bbox.height;
                pattern.setAttribute('patternContentUnits', 'userSpaceOnUse');
                pattern.removeAttribute('patternTransform');
            }
            
            matrixStr = `matrix(${m.join(' ')})`;
            
            if (angle !== 0) {
                imgNode.setAttribute('transform', `rotate(${angle}, ${cx}, ${cy}) ${matrixStr}`.trim());
            } else {
                imgNode.setAttribute('transform', matrixStr);
            }
        }
      }
    });

    if (!skipSync) syncDomChanges();
  };

  const updateSlotImage = (patternId, dataUrl, skipSync = false) => {
    if (!selectedElement) return;

    const pattern = selectedElement.querySelector(`pattern[id="${patternId}"]`);
    if (!pattern) return;

    // Find the shape that uses this pattern to get its aspect ratio
    const shapeEl = selectedElement.querySelector(`[fill="url(#${patternId})"]`);
    if (!shapeEl) return;

    // Load the image to get its width and height
    const img = new window.Image();
    img.onload = () => {
      const imgW = img.width;
      const imgH = img.height;

      // Compute the correct matrix to cover the slot (object-fit: cover equivalent in objectBoundingBox space)
      let bbox = { width: 100, height: 100 };
      try {
        bbox = shapeEl.getBBox();
      } catch(e) {}
      if (bbox.width === 0 || bbox.height === 0) bbox = { width: 100, height: 100 };

      const slotW = bbox.width;
      const slotH = bbox.height;

      const scale = Math.max(slotW / imgW, slotH / imgH);
      const finalW = imgW * scale;
      const finalH = imgH * scale;

      const tx_user = (slotW - finalW) / 2;
      const ty_user = (slotH - finalH) / 2;

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

      imageNode.setAttribute('width', imgW);
      imageNode.setAttribute('height', imgH);
      imageNode.removeAttribute('preserveAspectRatio');
      
      pattern.setAttribute('patternContentUnits', 'userSpaceOnUse');
      pattern.removeAttribute('patternTransform'); // Clear old pt when upgrading
      
      const existingTf = imageNode.getAttribute('transform') || '';
      let rotateStr = '';
      const rMatch = existingTf.match(/rotate\([^)]+\)/);
      if (rMatch) rotateStr = rMatch[0] + ' ';
      
      imageNode.setAttribute('transform', `${rotateStr}matrix(${scale} 0 0 ${scale} ${bbox.x + tx_user} ${bbox.y + ty_user})`);

      imageNode.setAttribute('href', dataUrl);
      imageNode.setAttribute('xlink:href', dataUrl);

      // Save changes
      if (!skipSync) {
        syncDomChanges();
      }
    };
    img.src = dataUrl;
  };

  const isFillNone = !backgroundColor?.fill || backgroundColor.fill === 'none' || backgroundColor.fill === 'transparent' || backgroundColor.fill === '#';
  const isStrokeNone = !backgroundColor?.stroke || backgroundColor.stroke === 'none' || backgroundColor.stroke === 'transparent' || backgroundColor.stroke === '#';

  const currentFillHex = localFillHex !== null 
    ? localFillHex 
    : (isFillNone ? 'NONE' : backgroundColor.fill);

  const currentStrokeHex = localStrokeHex !== null 
    ? localStrokeHex 
    : (isStrokeNone ? 'NONE' : backgroundColor.stroke);

  const handleHexSubmit = (type, val) => {
    let clean = (val || '').trim();
    if (clean.toLowerCase() === 'none' || clean === '' || clean === '#' || clean.toLowerCase() === 'transparent') {
      if (type === 'fill') {
        setLocalFillHex(null);
        handleSetBackgroundColor(prev => ({ ...prev, fill: 'none' }));
      } else {
        setLocalStrokeHex(null);
        handleSetBackgroundColor(prev => ({ ...prev, stroke: 'none' }));
      }
      return;
    }

    if (!clean.startsWith('#')) clean = '#' + clean;
    if (/^#[0-9A-Fa-f]{3,8}$/.test(clean)) {
      if (type === 'fill') {
        setLocalFillHex(null);
        handleSetBackgroundColor(prev => ({ ...prev, fill: clean, fillType: 'solid' }));
      } else {
        setLocalStrokeHex(null);
        handleSetBackgroundColor(prev => ({
          ...prev,
          stroke: clean,
          strokeType: 'solid',
          strokeWeight: (parseFloat(prev.strokeWeight) || 0) === 0 ? 3 : prev.strokeWeight
        }));
      }
    } else {
      if (type === 'fill') setLocalFillHex(null);
      else setLocalStrokeHex(null);
    }
  };

  return (
    <div className="flex flex-col gap-[1vw] font-sans select-none text-gray-800">
      {/* Title Header */}
      <div className="flex items-center gap-[0.75vw] mb-[0.2vw]">
        <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap tracking-wider">
          Image Framing Properties
        </span>
        <div className="h-[0.1vw] flex-1 bg-gray-200 mr-[-3vw]"></div>
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
          className="w-full py-[0.8vw] border-2 border-dashed border-gray-300 rounded-[0.75vw] flex items-center justify-center gap-[0.5vw] text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer font-medium text-[0.85vw]"
        >
          <Plus size="1vw" />
          <span>Add Images</span>
        </div>
      )}

      {/* ── 2. Images Slots List (matching reference image) ── */}
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
                  if (activeSlotId === slot.id) {
                    setActiveSlotId(null);
                    activeSlotRef.current = null;
                  } else {
                    setActiveSlotId(slot.id);
                    activeSlotRef.current = slot.id;
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => handleImageDrop(e, slot.id)}
                className={`flex items-center justify-between p-[0.6vw] px-[0.75vw] bg-white border rounded-[0.75vw] shadow-2xs transition-all cursor-pointer ${
                  isSelected || (!slot.currentImage || slot.currentImage === DEFAULT_FRAME_IMAGE)
                    ? 'border-blue-500 ring-1 ring-blue-500/30'
                    : 'border-gray-200/90 hover:border-gray-300'
                }`}
              >
                {/* Left Section: Drag handle + Thumbnail + Meta */}
                <div className="flex items-center gap-[0.6vw] min-w-0 flex-1">
                  {/* Drag Handle */}
                  <div className="text-gray-300 hover:text-gray-500 cursor-grab shrink-0 px-[0.1vw]">
                    <GripVertical size="0.95vw" />
                  </div>

                  {/* Thumbnail with Replace button overlay */}
                  <div
                    className="relative w-[3.8vw] h-[2.8vw] rounded-[0.45vw] border border-gray-200 shrink-0 overflow-hidden group/thumb cursor-pointer shadow-2xs bg-gray-100 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      slotReplaceRefs.current[slot.id]?.click();
                    }}
                    title="Click to replace image"
                  >
                    {slot.currentImage ? (
                      <>
                        <img
                          src={slot.currentImage}
                          alt={meta.name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
                        />
                        {/* Replace Overlay Button over the image */}
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/thumb:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 cursor-pointer">
                          <ArrowRightLeft size="0.85vw" strokeWidth={1.8} className="text-white mb-[0.1vw]" />
                          <span className="text-[0.52vw] font-medium text-white tracking-wide">Replace</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600">
                        <Plus size="0.9vw" />
                      </div>
                    )}
                  </div>

                  {/* File Name & Dimensions block */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[0.8vw] font-semibold text-gray-800 truncate" title={meta.name}>
                      {meta.name}
                    </span>
                    <span className="text-[0.68vw] text-gray-400 font-medium">
                      {meta.meta}
                    </span>
                  </div>
                </div>

                {/* Right Actions: Pencil / Edit & Delete Trash */}
                <div className="flex items-center gap-[0.4vw] shrink-0 ml-[0.5vw]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdjustTargetSlotId(slot.id);
                      setShowAdjustModal(true);
                    }}
                    className="p-[0.3vw] text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-[0.35vw] transition-colors cursor-pointer"
                    title="Edit Image Adjustment"
                  >
                    <Edit2 size="0.95vw" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSlotImage(slot.id);
                    }}
                    className="p-[0.3vw] text-[#e02424] hover:text-red-700 hover:bg-red-50 rounded-[0.35vw] transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 size="0.95vw" />
                  </button>
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
      <div className="flex flex-col gap-[0.5vw] mt-[0.5vw]">
        {slots.length > 1 && (
          <PropertySlider 
            label="Partition Gap" 
            value={gap} 
            onChange={(val) => updateGapAndRadius(val, radius, true)} 
            onPointerUp={syncDomChanges}
            min={0} 
            max={50} 
          />
        )}

        {slots.some(s => s.path.tagName.toLowerCase() === 'rect') && (
          <PropertySlider 
            label="Corner Radius" 
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
          label="Rotation" 
          value={activeSlotId ? (slotRotations[activeSlotId] || 0) : (Object.values(slotRotations)[0] || 0)} 
          onChange={(val) => updateRotation(val, true)} 
          onPointerUp={syncDomChanges}
          min={-180} 
          max={180} 
        />
      </div>

      {/* ===================== 4. FILL COLOR ===================== */}
      <div className="flex flex-col gap-[0.5vw]">
        <div className="flex items-center mt-[0.5vw] gap-[0.5vw]">
          <span className="text-[0.85vw] font-semibold text-black whitespace-nowrap">Fill Color</span>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>

        <div className="flex items-center ml-[0.5vw] mt-[0.5vw] gap-[0.5vw]">
          {/* Swatch */}
          <button
            type="button"
            onClick={() => setActiveColorPicker(activeColorPicker === 'fill' ? null : 'fill')}
            className="w-[2.2vw] h-[2.2vw] rounded-[0.45vw] border border-gray-200 shadow-sm cursor-pointer hover:border-gray-400 transition-all flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-white"
            title="Choose Fill Color"
          >
            {isFillNone ? (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1.5px] bg-red-500 rotate-45"></div>
            ) : (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: backgroundColor.fill,
                  opacity: (backgroundColor.fillOpacity ?? 100) / 100
                }}
              />
            )}
          </button>

          {/* Hex & Opacity Input */}
          <div className="flex-1 h-[2.2vw] bg-white border border-gray-200 rounded-[0.45vw] flex items-center justify-between px-[0.6vw] shadow-sm focus-within:border-indigo-500 transition-all">
            <input
              type="text"
              value={currentFillHex.toUpperCase()}
              onChange={(e) => setLocalFillHex(e.target.value)}
              onBlur={() => handleHexSubmit('fill', currentFillHex)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleHexSubmit('fill', currentFillHex); }}
              className="text-[0.76vw] font-semibold text-gray-700 w-[5vw] outline-none uppercase bg-transparent"
            />
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(backgroundColor?.fillOpacity !== undefined ? backgroundColor.fillOpacity : 100)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    handleSetBackgroundColor(prev => ({ ...prev, fillOpacity: Math.min(100, Math.max(0, val)) }));
                  }
                }}
                className="w-[2vw] text-right text-[0.74vw] text-gray-500 font-semibold outline-none bg-transparent no-spin"
              />
              <span className="text-[0.74vw] text-gray-500 font-semibold ml-[0.1vw]">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== 5. STROKE COLOR ===================== */}
      <div className="flex flex-col gap-[0.5vw]">
        <div className="flex items-center gap-[0.5vw]">
          <span className="text-[0.85vw] font-semibold text-black whitespace-nowrap">Stroke Color</span>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>

        {/* Row 1: Swatch + Hex/Opacity + Format */}
        <div className="flex items-center ml-[0.5vw] mt-[0.5vw] gap-[0.5vw]">
          <button
            type="button"
            onClick={() => setActiveColorPicker(activeColorPicker === 'stroke' ? null : 'stroke')}
            className="w-[2.2vw] h-[2.2vw] rounded-[0.45vw] border border-gray-200 shadow-sm cursor-pointer hover:border-gray-400 transition-all flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-white"
            title="Choose Stroke Color"
          >
            {isStrokeNone ? (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1.5px] bg-red-500 rotate-45"></div>
            ) : (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: backgroundColor.stroke,
                  opacity: (backgroundColor.strokeOpacity ?? 100) / 100
                }}
              />
            )}
          </button>

          <div className="flex-1 h-[2.2vw] bg-white border border-gray-200 rounded-[0.45vw] flex items-center justify-between px-[0.6vw] shadow-sm focus-within:border-indigo-500 transition-all">
            <input
              type="text"
              value={currentStrokeHex.toUpperCase()}
              onChange={(e) => setLocalStrokeHex(e.target.value)}
              onBlur={() => handleHexSubmit('stroke', currentStrokeHex)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleHexSubmit('stroke', currentStrokeHex); }}
              className="text-[0.76vw] font-semibold text-gray-700 w-[5vw] outline-none uppercase bg-transparent"
            />
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(backgroundColor?.strokeOpacity !== undefined ? backgroundColor.strokeOpacity : 100)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    handleSetBackgroundColor(prev => ({ ...prev, strokeOpacity: Math.min(100, Math.max(0, val)) }));
                  }
                }}
                className="w-[2vw] text-right text-[0.74vw] text-gray-500 font-semibold outline-none bg-transparent no-spin"
              />
              <span className="text-[0.74vw] text-gray-500 font-semibold ml-[0.1vw]">%</span>
            </div>
          </div>
        </div>

        {/* Stroke Settings (Exact match to image 2) */}
        <div className="flex flex-col gap-[0.8vw] ml-[0.5vw] mt-[0.25vw]">
          {/* Row 1: Alignment & Stroke Width */}
          <div className="grid grid-cols-2 gap-[0.75vw]">
            {/* Alignment */}
            <div className="flex flex-col gap-[0.3vw]">
              <span className="text-[0.76vw] font-semibold text-[#546274]">Alignment</span>
              <div className="w-full h-[2.2vw] px-[0.75vw] bg-white border border-[#e2e8f0] rounded-[0.5vw] flex items-center text-[0.8vw] text-slate-800 font-medium shadow-2xs select-none">
                <span>Outside</span>
              </div>
            </div>

            {/* Stroke Width Stepper */}
            <div className="flex flex-col gap-[0.3vw]">
              <span className="text-[0.76vw] font-semibold text-[#546274]">Stroke Width</span>
              <div className="flex items-center gap-[0.3vw] h-[2.2vw]">
                <button
                  type="button"
                  onClick={() => handleSetBackgroundColor(prev => ({
                    ...prev,
                    strokeWeight: Math.max(0, (parseFloat(prev.strokeWeight) || 0) - 1)
                  }))}
                  className="w-[2.2vw] h-full bg-[#f4f6f8] hover:bg-slate-200 active:scale-95 border border-[#e2e8f0] rounded-[0.45vw] flex items-center justify-center text-slate-800 font-bold text-[0.95vw] transition-all cursor-pointer shadow-2xs"
                >
                  −
                </button>
                <div className="flex-1 h-full bg-white border border-[#e2e8f0] rounded-[0.45vw] flex items-center justify-center shadow-2xs focus-within:border-indigo-500">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(parseFloat(backgroundColor?.strokeWeight) || 0)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        handleSetBackgroundColor(prev => ({ ...prev, strokeWeight: Math.max(0, val) }));
                      }
                    }}
                    className="w-full text-center text-[0.82vw] font-medium text-slate-800 outline-none bg-transparent no-spin"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSetBackgroundColor(prev => ({
                    ...prev,
                    strokeWeight: (parseFloat(prev.strokeWeight) || 0) + 1
                  }))}
                  className="w-[2.2vw] h-full bg-[#f4f6f8] hover:bg-slate-200 active:scale-95 border border-[#e2e8f0] rounded-[0.45vw] flex items-center justify-center text-slate-800 font-bold text-[0.95vw] transition-all cursor-pointer shadow-2xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Line style & Line Corner */}
          <div className="grid grid-cols-2 gap-[0.75vw]">
            <div className="flex flex-col gap-[0.3vw]">
              <span className="text-[0.76vw] font-semibold text-[#546274]">Line style</span>
              <div className="flex items-center h-[2.2vw]">
                {/* Solid */}
                <button
                  type="button"
                  onClick={() => handleSetBackgroundColor(prev => ({ ...prev, strokeDashStyle: 'Solid', strokeDasharrayValue: 'none' }))}
                  className="w-[9.5vw] h-full rounded-[0.5vw] border border-[#e2e8f0] bg-white hover:border-slate-300 shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                  title="Solid Line"
                >
                  <div className="w-[5vw] h-[2.5px] bg-[#243042] rounded-full"></div>
                </button>
              </div>
            </div>

            {/* Line Corner */}
            <div className="flex flex-col gap-[0.3vw]">
              <span className="text-[0.76vw] font-semibold text-[#546274]">Line Corner</span>
              <ElementDropdown
                value={backgroundColor?.strokeLinecap === 'round' ? 'Rounded' : 'Square'}
                onChange={(val) => handleSetBackgroundColor(prev => ({ ...prev, strokeLinecap: val === 'Rounded' ? 'round' : 'square' }))}
                options={['Square', 'Rounded']}
                buttonClassName="!h-[2.2vw]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===================== 6. EFFECTS ===================== */}
      <div className="flex flex-col mt-[0.5vw] gap-[0.5vw]">
        <div className="flex items-center gap-[0.5vw]">
          <span className="text-[0.85vw] font-semibold text-black whitespace-nowrap">Effects</span>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>

        <Effect
          hideHeader={true}
          isShape={false}
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
        />
      </div>

      {/* ===================== IMAGE ADJUST MODAL ===================== */}
      {showAdjustModal && adjustTargetSlotId && (
        <ImageAdjustModal
          isOpen={showAdjustModal}
          onClose={() => {
            setShowAdjustModal(false);
            setAdjustTargetSlotId(null);
          }}
          imageSrc={
            slotMeta[adjustTargetSlotId]?.originalUrl ||
            slots.find(s => s.id === adjustTargetSlotId)?.currentImage ||
            DEFAULT_FRAME_IMAGE
          }
          initialFixType={slotMeta[adjustTargetSlotId]?.fixType || 'Fit'}
          initialOpacity={slotMeta[adjustTargetSlotId]?.opacity !== undefined ? slotMeta[adjustTargetSlotId]?.opacity : 100}
          initialFilters={slotMeta[adjustTargetSlotId]?.filters || null}
          initialCrop={slotMeta[adjustTargetSlotId]?.cropData || null}
          frameAspectRatio={(() => {
            const slot = slots.find(s => s.id === adjustTargetSlotId);
            if (slot && slot.path) {
              try {
                const bbox = slot.path.getBBox();
                if (bbox.width && bbox.height) {
                  return bbox.width / bbox.height;
                }
              } catch (e) {}
            }
            return 130 / 140;
          })()}
          onSave={handleSaveAdjustedImage}
        />
      )}

      {/* ===================== 7. COLOR PICKER PORTAL ===================== */}
      {activeColorPicker && !activeColorPicker.startsWith('effect-') && !activeColorPicker.startsWith('data-effect-') && createPortal(
        <div
          className="fixed z-[5000]"
          style={{
            top: '50%',
            right: '19.5vw',
            transform: 'translateY(-50%)'
          }}
        >
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <ColorPicker
              key={activeColorPicker}
              color={activeColorPicker === 'fill' ? (backgroundColor?.fill || 'none') : (backgroundColor?.stroke || 'none')}
              opacity={activeColorPicker === 'fill' ? (backgroundColor?.fillOpacity ?? 100) : (backgroundColor?.strokeOpacity ?? 100)}
              onChange={(newColor) => {
                if (activeColorPicker === 'fill') {
                  setLocalFillHex(null);
                  handleSetBackgroundColor(prev => ({ ...prev, fill: newColor, fillType: 'solid' }));
                } else {
                  setLocalStrokeHex(null);
                  handleSetBackgroundColor(prev => ({
                    ...prev,
                    stroke: newColor,
                    strokeType: 'solid',
                    strokeWeight: newColor === 'none' ? prev.strokeWeight : ((parseFloat(prev.strokeWeight) || 0) === 0 ? 3 : prev.strokeWeight)
                  }));
                }
              }}
              onOpacityChange={(newOpacity) => {
                const num = parseFloat(newOpacity);
                if (!isNaN(num)) {
                  if (activeColorPicker === 'fill') {
                    handleSetBackgroundColor(prev => ({ ...prev, fillOpacity: num }));
                  } else {
                    handleSetBackgroundColor(prev => ({ ...prev, strokeOpacity: num }));
                  }
                }
              }}
              onClose={() => setActiveColorPicker(null)}
              colorsOnPage={colorsOnPage || []}
              disableGradient={activeColorPicker === 'stroke'}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ImageFramingProperties;
