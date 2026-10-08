import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';

// GuidesOverlay listens to ruler events, renders draggable guidelines,
// provides magnetic snapping against canvas edges, centers, elements, and minute ruler ticks,
// and shows the live movement coordinate in a dark box.
const GuidesOverlay = ({
  zoom,
  pan,
  baseCanvasWidth,
  baseCanvasHeight,
  baseLogicalWidth = 210,
  baseLogicalHeight = 297
}) => {
  const containerRef = useRef(null);

  // Store guides as logical coordinates in the flipbook space (0 to unscaled canvas dimension)
  const [guides, setGuides] = useState({ h: [], v: [] });

  const guidesStateRef = useRef(guides);
  guidesStateRef.current = guides;

  const containerDimensionsRef = useRef({ width: 0, height: 0 });
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  const animationFrameRef = useRef(null);

  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // Keep dimensions up to date
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        containerDimensionsRef.current = {
          width: entry.contentRect.width,
          height: entry.contentRect.height
        };
        updateLinesDOM(zoomRef.current, panRef.current);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update DOM lines directly for 60fps panning & zooming (pixel-perfect integer screen alignment)
  const updateLinesDOM = (renderZoom, renderPan) => {
    if (!containerRef.current) return;

    const zoomContainer = document.getElementById('main-zoom-container');
    if (!zoomContainer) return;

    const pageContainers = Array.from(zoomContainer.querySelectorAll('.page-svg-container'));
    if (pageContainers.length === 0) return;

    let minLeft = Infinity;
    let minTop = Infinity;
    let maxRight = -Infinity;
    let maxBottom = -Infinity;

    pageContainers.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.left < minLeft) minLeft = rect.left;
      if (rect.top < minTop) minTop = rect.top;
      if (rect.right > maxRight) maxRight = rect.right;
      if (rect.bottom > maxBottom) maxBottom = rect.bottom;
    });

    const rulerRect = containerRef.current.getBoundingClientRect();
    const startX = minLeft - rulerRect.left;
    const startY = minTop - rulerRect.top;
    const scale = renderZoom / 100;

    // Update horizontal lines (transform in Y)
    const hLines = containerRef.current.querySelectorAll('.guide-line-h');
    hLines.forEach(line => {
      const logicalY = parseFloat(line.dataset.logical);
      const screenY = startY + (logicalY * scale);
      line.style.transform = `translateY(${Math.floor(screenY)}px)`;
    });

    // Update vertical lines (transform in X)
    const vLines = containerRef.current.querySelectorAll('.guide-line-v');
    vLines.forEach(line => {
      const logicalX = parseFloat(line.dataset.logical);
      const screenX = startX + (logicalX * scale);
      line.style.transform = `translateX(${Math.floor(screenX)}px)`;
    });
  };

  // Immediate synchronous positioning on guide changes before browser paint
  useLayoutEffect(() => {
    updateLinesDOM(zoomRef.current, panRef.current);
  }, [guides]);

  // Listen to panning to update lines instantly
  useEffect(() => {
    const handlePanUpdate = (e) => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      panRef.current = e.detail;
      updateLinesDOM(zoomRef.current, panRef.current);
    };
    window.addEventListener('editor-pan-update', handlePanUpdate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('editor-pan-update', handlePanUpdate);
    };
  }, [baseCanvasWidth, baseCanvasHeight]);

  // Smooth animated update when zoom or layout changes
  useEffect(() => {
    const startZoom = zoomRef.current;
    const targetZoom = zoom;
    const startPan = panRef.current;
    const targetPan = pan;

    const zoomDiff = targetZoom - startZoom;
    const panDiffX = targetPan.x - startPan.x;
    const panDiffY = targetPan.y - startPan.y;

    if (Math.abs(zoomDiff) < 0.1 && Math.abs(panDiffX) < 1 && Math.abs(panDiffY) < 1) {
      zoomRef.current = targetZoom;
      panRef.current = targetPan;
      updateLinesDOM(targetZoom, targetPan);
    } else {
      const duration = 300;
      const startTime = performance.now();
      const ease = (t) => t * (2 - t);

      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      const step = (time) => {
        let elapsed = time - startTime;
        if (elapsed > duration) elapsed = duration;

        const progress = elapsed / duration;
        const easedT = ease(progress);

        const nowZoom = startZoom + zoomDiff * easedT;
        const nowPan = {
          x: startPan.x + panDiffX * easedT,
          y: startPan.y + panDiffY * easedT
        };

        zoomRef.current = nowZoom;
        panRef.current = nowPan;
        updateLinesDOM(nowZoom, nowPan);

        if (elapsed < duration) {
          animationFrameRef.current = requestAnimationFrame(step);
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    }
  }, [zoom, pan, baseCanvasWidth, baseCanvasHeight, guides]);

  // Global drag handler with magnetic snapping and dark coordinate box
  useEffect(() => {
    let isDragging = false;
    let dragType = null; // 'h' or 'v'
    let dragIndex = -1; // -1 means new guide
    let dragElement = null; // Temporary visual line while dragging
    let dragOffset = { x: 0, y: 0 };
    let snapTargets = []; // Precomputed magnetic snap targets for 60fps drag
    let badgeEl = null; // Dark coordinate box
    let hiddenTarget = null;
    let lastLogicalVal = null;

    const getScreenCoord = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const getLogicalCoord = (screenPos) => {
      const zoomContainer = document.getElementById('main-zoom-container');
      if (!zoomContainer) return { x: 0, y: 0, startX: 0, startY: 0, scale: 1, logicalPageW: 500, logicalPageH: 700 };

      const pageContainers = Array.from(zoomContainer.querySelectorAll('.page-svg-container'));
      if (pageContainers.length === 0) return { x: 0, y: 0, startX: 0, startY: 0, scale: 1, logicalPageW: 500, logicalPageH: 700 };

      let minLeft = Infinity;
      let minTop = Infinity;
      let maxRight = -Infinity;
      let maxBottom = -Infinity;

      pageContainers.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.left < minLeft) minLeft = rect.left;
        if (rect.top < minTop) minTop = rect.top;
        if (rect.right > maxRight) maxRight = rect.right;
        if (rect.bottom > maxBottom) maxBottom = rect.bottom;
      });

      const rulerRect = containerRef.current.getBoundingClientRect();
      const startX = minLeft - rulerRect.left;
      const startY = minTop - rulerRect.top;
      const scale = (zoomRef.current || 100) / 100;

      const logicalPageW = (maxRight - minLeft) / scale;
      const logicalPageH = (maxBottom - minTop) / scale;

      return {
        x: (screenPos.x - startX) / scale,
        y: (screenPos.y - startY) / scale,
        startX,
        startY,
        scale,
        logicalPageW,
        logicalPageH
      };
    };

    // Precompute primary magnetic snap targets on drag start
    const collectSnapTargets = (type, currentDragIdx) => {
      const zoomContainer = document.getElementById('main-zoom-container');
      if (!zoomContainer || !containerRef.current) return [];

      const pageContainers = Array.from(zoomContainer.querySelectorAll('.page-svg-container'));
      if (pageContainers.length === 0) return [];

      let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;
      pageContainers.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.left < minLeft) minLeft = rect.left;
        if (rect.top < minTop) minTop = rect.top;
        if (rect.right > maxRight) maxRight = rect.right;
        if (rect.bottom > maxBottom) maxBottom = rect.bottom;
      });

      const rulerRect = containerRef.current.getBoundingClientRect();
      const startX = minLeft - rulerRect.left;
      const startY = minTop - rulerRect.top;
      const scale = (zoomRef.current || 100) / 100;

      const logicalPageW = (maxRight - minLeft) / scale;
      const logicalPageH = (maxBottom - minTop) / scale;

      const targets = [];

      if (type === 'v') {
        // Page bounds & center (0, center, page end)
        targets.push(0);
        targets.push(logicalPageW / 2);
        targets.push(logicalPageW);

        // Other vertical guides
        const curV = guidesStateRef.current?.v || [];
        curV.forEach((gVal, idx) => {
          if (idx !== currentDragIdx) targets.push(gVal);
        });

        // Elements on canvas
        pageContainers.forEach(container => {
          const svg = container.querySelector('svg');
          if (!svg) return;
          const elements = svg.querySelectorAll('[id]:not(defs *):not(clipPath *):not(style):not(script)');
          elements.forEach(el => {
            const name = el.getAttribute('data-name') || '';
            const dt = el.getAttribute('data-type') || '';
            if (name === 'Overlay' || name === 'Document Shield' || dt === 'background' || dt === 'shield') return;
            if (el.getAttribute('data-hidden') === 'true' || el.style.visibility === 'hidden' || el.style.display === 'none') return;
            if (el.closest('[data-name="Overlay"]') || el.closest('[data-type="background"]')) return;
            if (el === svg) return;

            try {
              const rect = el.getBoundingClientRect();
              if (rect.width <= 0 || rect.height <= 0) return;
              const lLeft = (rect.left - rulerRect.left - startX) / scale;
              const lRight = (rect.right - rulerRect.left - startX) / scale;
              const lCenter = (lLeft + lRight) / 2;

              targets.push(lLeft);
              targets.push(lCenter);
              targets.push(lRight);
            } catch (_) {}
          });
        });
      } else {
        // Page bounds & center (0, center, page end)
        targets.push(0);
        targets.push(logicalPageH / 2);
        targets.push(logicalPageH);

        // Other horizontal guides
        const curH = guidesStateRef.current?.h || [];
        curH.forEach((gVal, idx) => {
          if (idx !== currentDragIdx) targets.push(gVal);
        });

        // Elements on canvas
        pageContainers.forEach(container => {
          const svg = container.querySelector('svg');
          if (!svg) return;
          const elements = svg.querySelectorAll('[id]:not(defs *):not(clipPath *):not(style):not(script)');
          elements.forEach(el => {
            const name = el.getAttribute('data-name') || '';
            const dt = el.getAttribute('data-type') || '';
            if (name === 'Overlay' || name === 'Document Shield' || dt === 'background' || dt === 'shield') return;
            if (el.getAttribute('data-hidden') === 'true' || el.style.visibility === 'hidden' || el.style.display === 'none') return;
            if (el.closest('[data-name="Overlay"]') || el.closest('[data-type="background"]')) return;
            if (el === svg) return;

            try {
              const rect = el.getBoundingClientRect();
              if (rect.width <= 0 || rect.height <= 0) return;
              const lTop = (rect.top - rulerRect.top - startY) / scale;
              const lBottom = (rect.bottom - rulerRect.top - startY) / scale;
              const lCenter = (lTop + lBottom) / 2;

              targets.push(lTop);
              targets.push(lCenter);
              targets.push(lBottom);
            } catch (_) {}
          });
        });
      }

      return targets;
    };

    // Create dark coordinate badge (matching 1st image reference)
    const createBadge = () => {
      if (badgeEl) return;
      badgeEl = document.createElement('div');
      badgeEl.style.cssText = `
        position: fixed;
        z-index: 99999;
        pointer-events: none;
        background-color: #1e2432;
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.3px;
        white-space: nowrap;
        user-select: none;
        display: none;
        align-items: center;
        justify-content: center;
      `;
      document.body.appendChild(badgeEl);
    };

    const updateBadge = (clientX, clientY, mmValue, type) => {
      if (!badgeEl) return;
      badgeEl.style.display = 'flex';

      const axisLabel = type === 'h' ? 'Y' : 'X';
      badgeEl.textContent = `${axisLabel}: ${mmValue.toFixed(1)} mm`;

      // Position badge: centered under horizontal line, or beside vertical line
      const badgeWidth = badgeEl.offsetWidth || 70;
      const badgeHeight = badgeEl.offsetHeight || 24;

      if (type === 'h') {
        badgeEl.style.left = `${clientX - badgeWidth / 2}px`;
        badgeEl.style.top = `${clientY + 14}px`;
      } else {
        badgeEl.style.left = `${clientX + 14}px`;
        badgeEl.style.top = `${clientY - badgeHeight / 2}px`;
      }
    };

    const removeBadge = () => {
      if (badgeEl && badgeEl.parentNode) {
        badgeEl.parentNode.removeChild(badgeEl);
      }
      badgeEl = null;
    };

    // Handle drag initiation from ruler (new guide)
    const handleRulerDragStart = (e) => {
      const { type, clientX, clientY } = e.detail;
      isDragging = true;
      dragType = type;
      dragIndex = -1; // New guide
      dragOffset = { x: 0, y: 0 };
      lastLogicalVal = null;

      snapTargets = collectSnapTargets(type, -1);
      createBadge();

      dragElement = document.createElement('div');
      dragElement.className = `absolute pointer-events-none z-50 ${type === 'h' ? 'left-0 w-full h-[9px]' : 'top-0 h-full w-[9px]'}`;
      if (type === 'h') {
        dragElement.style.top = '-4px';
        dragElement.style.left = '0';
        dragElement.innerHTML = '<div class="absolute top-[4px] left-0 w-full h-[1px] bg-red-500"></div>';
      } else {
        dragElement.style.left = '-4px';
        dragElement.style.top = '0';
        dragElement.innerHTML = '<div class="absolute left-[4px] top-0 w-[1px] h-full bg-red-500"></div>';
      }
      containerRef.current.appendChild(dragElement);

      const pos = getScreenCoord({ clientX, clientY });
      if (type === 'h') dragElement.style.transform = `translateY(${Math.floor(pos.y)}px)`;
      else dragElement.style.transform = `translateX(${Math.floor(pos.x)}px)`;
    };

    const handleMouseMove = (e) => {
      if (!isDragging || !dragElement) return;

      const pos = getScreenCoord(e);
      const rawScreenPos = { x: pos.x - dragOffset.x, y: pos.y - dragOffset.y };
      const logicalInfo = getLogicalCoord(rawScreenPos);

      const rawVal = dragType === 'h' ? logicalInfo.y : logicalInfo.x;

      // 1. PRIMARY SNAP TARGETS (Canvas edges, center, elements, other guides)
      const primaryScreenThreshold = 7;
      const primaryLogicalThreshold = primaryScreenThreshold / logicalInfo.scale;

      let effectiveLogical = rawVal;
      let snappedToPrimary = false;
      let minDiff = Infinity;

      for (const targetVal of snapTargets) {
        const diff = Math.abs(rawVal - targetVal);
        if (diff <= primaryLogicalThreshold && diff < minDiff) {
          minDiff = diff;
          effectiveLogical = targetVal;
          snappedToPrimary = true;
        }
      }

      // 2. MINUTE POINTS MAGNETIC SNAP (Ruler subdivisions / millimeter ticks)
      const totalLogical = dragType === 'h' ? logicalInfo.logicalPageH : logicalInfo.logicalPageW;
      const totalBase = dragType === 'h' ? (baseLogicalHeight || 297) : (baseLogicalWidth || 210);

      if (!snappedToPrimary && totalLogical > 0 && totalBase > 0) {
        const rawMm = (rawVal / totalLogical) * totalBase;
        const visualScale = (totalLogical * logicalInfo.scale) / totalBase;

        // Determine step matching CanvasRuler subdivisions
        let stepMm = 500;
        if (visualScale > 20) stepMm = 5;
        else if (visualScale > 10) stepMm = 10;
        else if (visualScale > 4) stepMm = 20;
        else if (visualScale > 1.5) stepMm = 50;
        else if (visualScale > 0.5) stepMm = 100;
        else if (visualScale > 0.2) stepMm = 250;

        const subStepMm = stepMm / 10;
        // Minute points snap step: 0.5mm if high zoom, else 1mm (or finer subStep)
        const minuteStepMm = subStepMm <= 0.5 ? 0.5 : 1;

        const nearestMm = Math.round(rawMm / minuteStepMm) * minuteStepMm;
        const nearestLogical = (nearestMm / totalBase) * totalLogical;

        const screenDist = Math.abs(rawVal - nearestLogical) * logicalInfo.scale;
        const mmScreenDist = (minuteStepMm / totalBase) * totalLogical * logicalInfo.scale;
        const minuteThreshold = Math.min(3.5, mmScreenDist * 0.45);

        if (screenDist <= minuteThreshold) {
          effectiveLogical = nearestLogical;
        }
      }

      lastLogicalVal = effectiveLogical;

      // Pixel-perfect integer screen coordinate matching CanvasRuler Math.floor()
      const effectiveScreen = dragType === 'h'
        ? Math.floor(logicalInfo.startY + (effectiveLogical * logicalInfo.scale))
        : Math.floor(logicalInfo.startX + (effectiveLogical * logicalInfo.scale));

      if (dragType === 'h') {
        dragElement.style.transform = `translateY(${effectiveScreen}px)`;
      } else {
        dragElement.style.transform = `translateX(${effectiveScreen}px)`;
      }

      // Compute display mm value
      const mmVal = totalLogical > 0 ? (effectiveLogical / totalLogical) * totalBase : effectiveLogical;
      updateBadge(e.clientX, e.clientY, mmVal, dragType);
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;

      const pos = getScreenCoord(e);
      const rulerRect = containerRef.current.getBoundingClientRect();

      // Check if user dragged guide back onto ruler to delete it
      const draggedToRuler = (dragType === 'v' && e.clientX <= rulerRect.left + 22) ||
                            (dragType === 'h' && e.clientY <= rulerRect.top + 22);

      const finalLogical = lastLogicalVal !== null
        ? lastLogicalVal
        : (dragType === 'h' ? getLogicalCoord({ x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }).y
                            : getLogicalCoord({ x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }).x);

      setGuides(prev => {
        const newGuides = { ...prev };
        if (dragIndex === -1) {
          // Add new guide if inside canvas
          if (!draggedToRuler) {
            newGuides[dragType] = [...newGuides[dragType], finalLogical];
          }
        } else {
          // Update or delete existing guide
          if (draggedToRuler) {
            newGuides[dragType] = newGuides[dragType].filter((_, idx) => idx !== dragIndex);
          } else {
            newGuides[dragType] = [...newGuides[dragType]];
            newGuides[dragType][dragIndex] = finalLogical;
          }
        }
        return newGuides;
      });

      if (dragElement && dragElement.parentNode) {
        dragElement.parentNode.removeChild(dragElement);
      }
      dragElement = null;
      isDragging = false;
      lastLogicalVal = null;
      removeBadge();

      if (hiddenTarget) {
        hiddenTarget.style.opacity = '1';
        hiddenTarget = null;
      }
    };

    let lastClickTime = 0;
    let lastClickIndex = -1;
    let lastClickType = null;

    // Handle dragging and double-click delete on existing guides
    const handleGuideMouseDown = (e) => {
      const target = e.target.closest('.guide-line-h, .guide-line-v');
      if (!target) return;

      let clickedType = null;
      let clickedIndex = -1;

      if (target.classList.contains('guide-line-h')) {
        clickedType = 'h';
        clickedIndex = parseInt(target.dataset.index);
      } else if (target.classList.contains('guide-line-v')) {
        clickedType = 'v';
        clickedIndex = parseInt(target.dataset.index);
      } else {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastClickTime < 300 && lastClickIndex === clickedIndex && lastClickType === clickedType) {
        // Double-click detected! Delete the guideline.
        setGuides(prev => {
          const newGuides = { ...prev };
          newGuides[clickedType] = newGuides[clickedType].filter((_, idx) => idx !== clickedIndex);
          return newGuides;
        });
        lastClickTime = 0;
        return;
      }

      lastClickTime = now;
      lastClickIndex = clickedIndex;
      lastClickType = clickedType;

      isDragging = true;
      dragType = clickedType;
      dragIndex = clickedIndex;
      lastLogicalVal = null;

      snapTargets = collectSnapTargets(clickedType, clickedIndex);
      createBadge();

      dragElement = document.createElement('div');
      dragElement.className = `absolute pointer-events-none z-50 ${clickedType === 'h' ? 'left-0 w-full h-[9px]' : 'top-0 h-full w-[9px]'}`;
      if (clickedType === 'h') {
        dragElement.style.top = '-4px';
        dragElement.style.left = '0';
        dragElement.innerHTML = '<div class="absolute top-[4px] left-0 w-full h-[1px] bg-red-500"></div>';
      } else {
        dragElement.style.left = '-4px';
        dragElement.style.top = '0';
        dragElement.innerHTML = '<div class="absolute left-[4px] top-0 w-[1px] h-full bg-red-500"></div>';
      }

      const currentTransform = target.style.transform;
      const val = parseFloat(currentTransform.replace(/[^\d.-]/g, '')) || 0;

      const pos = getScreenCoord(e);
      if (clickedType === 'h') {
        dragOffset = { x: 0, y: pos.y - val };
        dragElement.style.transform = `translateY(${val}px)`;
      } else {
        dragOffset = { x: pos.x - val, y: 0 };
        dragElement.style.transform = `translateX(${val}px)`;
      }

      containerRef.current.appendChild(dragElement);

      hiddenTarget = target;
      hiddenTarget.style.opacity = '0';
    };

    window.addEventListener('ruler-drag-start', handleRulerDragStart);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const container = containerRef.current;
    if (container) container.addEventListener('mousedown', handleGuideMouseDown);

    return () => {
      window.removeEventListener('ruler-drag-start', handleRulerDragStart);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container) container.removeEventListener('mousedown', handleGuideMouseDown);
      removeBadge();
    };
  }, [baseCanvasWidth, baseCanvasHeight, baseLogicalWidth, baseLogicalHeight]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {guides.h.map((val, idx) => (
        <div
          key={`h-${idx}`}
          className="guide-line-h group absolute left-0 w-full h-[9px] cursor-row-resize pointer-events-auto select-none"
          style={{ top: '-4px' }}
          data-index={idx}
          data-logical={val}
          title="Horizontal Guide: Drag to move, double-click to remove"
        >
          <div className="absolute top-[4px] left-0 w-full h-[1px] bg-red-500 group-hover:bg-red-600 transition-colors pointer-events-none" />
        </div>
      ))}
      {guides.v.map((val, idx) => (
        <div
          key={`v-${idx}`}
          className="guide-line-v group absolute top-0 h-full w-[9px] cursor-col-resize pointer-events-auto select-none"
          style={{ left: '-4px' }}
          data-index={idx}
          data-logical={val}
          title="Vertical Guide: Drag to move, double-click to remove"
        >
          <div className="absolute left-[4px] top-0 w-[1px] h-full bg-red-500 group-hover:bg-red-600 transition-colors pointer-events-none" />
        </div>
      ))}
    </div>
  );
};

export default GuidesOverlay;
