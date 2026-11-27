import { useEffect, useCallback, useRef } from 'react';
import { setOverlayInvZoom } from '../selectionOverlays/overlayDomUtils';

const calculateFitZoom = (containerWidth, containerHeight, baseWidth, baseHeight) => {
  const padding = window.innerWidth * 0.01;
  const arrowSpace = window.innerWidth * 0.08;

  const availWidth = Math.max(100, containerWidth - (padding * 2) - arrowSpace);
  const availHeight = Math.max(100, containerHeight - (padding * 2));

  const baseVhHeight = window.innerHeight * 0.78;
  const totalWidth = baseWidth || 210;
  const totalHeight = baseHeight || 297;

  const baseCanvasHeight = baseVhHeight;
  const baseCanvasWidth = baseCanvasHeight * (totalWidth / totalHeight);

  const scaleX = availWidth / baseCanvasWidth;
  const scaleY = availHeight / baseCanvasHeight;

  let autoZoom = Math.min(scaleX, scaleY) * 90;
  return Math.max(55, Math.min(250, Math.round(autoZoom)));
};

/**
 * Calculates pan boundaries to ensure the canvas book/sheet is never hidden or lost out of view.
 * Guarantees that at least a comfortable margin of the sheet remains visible on screen at all times.
 */
export const computePanBounds = (containerEl, zoomContainerEl, currentScale = 1, baseW = 210, baseH = 297) => {
  const containerWidth = containerEl?.clientWidth || window.innerWidth;
  const containerHeight = containerEl?.clientHeight || window.innerHeight;

  const sheetEl = zoomContainerEl?.querySelector?.('.group\\/page') || zoomContainerEl?.firstElementChild || zoomContainerEl;
  const unscaledW = sheetEl?.offsetWidth || ((containerHeight * 0.78) * ((baseW || 210) / (baseH || 297))) || 500;
  const unscaledH = sheetEl?.offsetHeight || (containerHeight * 0.78) || 700;

  const scaledW = unscaledW * currentScale;
  const scaledH = unscaledH * currentScale;

  // At least 100px or 30% of sheet must always remain inside the viewport boundary
  const minVisibleX = Math.min(100, scaledW * 0.3);
  const minVisibleY = Math.min(100, scaledH * 0.3);

  const maxPanX = Math.max(0, (containerWidth / 2) + (scaledW / 2) - minVisibleX);
  const maxPanY = Math.max(0, (containerHeight / 2) + (scaledH / 2) - minVisibleY);

  return { maxPanX, maxPanY };
};

/**
 * Hook to manage smooth canvas zooming, panning, auto-fit to container,
 * mouse wheel zoom gestures, and window resize listeners.
 */
export const useCanvasZoomPan = ({
  zoom,
  setZoom,
  pan,
  setPan,
  baseWidth,
  baseHeight,
  activePageIndex,
  pagesCount = 1,
  editorContainerRef,
  zoomContainerRef,
  currentZoomRef,
  currentPanRef,
  wheelRafRef,
  lastWheelTimeRef,
  suppressClickRef
}) => {
  // Smooth wheel-zoom & smooth wheel-pan animation state
  const targetZoomRef = useRef(null);
  const zoomAnchorRef = useRef({ x: 0, y: 0 });
  const panRafRef = useRef(null);
  const targetPanRef = useRef(null);
  const suppressClickTimeoutRef = useRef(null);

  const handleZoomIn = () => {
    const currentP = currentPanRef.current || pan || { x: 0, y: 0 };
    setZoom(prev => {
      const current = currentZoomRef.current || prev || 100;
      const nextZoom = Math.min(Math.round(current * 1.15), 10000);
      currentZoomRef.current = nextZoom;
      if (zoomContainerRef.current) {
        zoomContainerRef.current.style.transition = 'transform 0.15s ease-out, --fbe-inv-zoom 0.15s ease-out';
        zoomContainerRef.current.style.transform = `translate(${currentP.x}px, ${currentP.y}px) scale(${nextZoom / 100})`;
        setOverlayInvZoom(zoomContainerRef.current, nextZoom / 100);
      }
      return nextZoom;
    });
  };

  const handleZoomOut = () => {
    const currentP = currentPanRef.current || pan || { x: 0, y: 0 };
    setZoom(prev => {
      const current = currentZoomRef.current || prev || 100;
      const nextZoom = Math.max(Math.round(current / 1.15), 10);
      currentZoomRef.current = nextZoom;
      if (zoomContainerRef.current) {
        zoomContainerRef.current.style.transition = 'transform 0.15s ease-out, --fbe-inv-zoom 0.15s ease-out';
        zoomContainerRef.current.style.transform = `translate(${currentP.x}px, ${currentP.y}px) scale(${nextZoom / 100})`;
        setOverlayInvZoom(zoomContainerRef.current, nextZoom / 100);
      }
      return nextZoom;
    });
  };

  const handleAutoFitZoom = useCallback(() => {
    if (!editorContainerRef.current) return;

    const container = editorContainerRef.current;
    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();

    if (containerWidth < 300 || containerHeight < 200) {
      setTimeout(() => {
        if (editorContainerRef.current) {
          const rect = editorContainerRef.current.getBoundingClientRect();
          if (rect.width >= 300 && rect.height >= 200) {
            setZoom(calculateFitZoom(rect.width, rect.height, baseWidth, baseHeight));
          }
        }
      }, 100);
      return;
    }

    setZoom(calculateFitZoom(containerWidth, containerHeight, baseWidth, baseHeight));
  }, [baseWidth, baseHeight, editorContainerRef, setZoom]);

  const handleResetZoom = () => {
    handleAutoFitZoom();
    setPan({ x: 0, y: 0 });
  };

  // Auto-fit zoom on mount and dimension/page change
  useEffect(() => {
    handleAutoFitZoom();
    const t1 = setTimeout(handleAutoFitZoom, 100);
    const t2 = setTimeout(handleAutoFitZoom, 350);
    const t3 = setTimeout(handleAutoFitZoom, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activePageIndex, pagesCount, baseWidth, baseHeight, handleAutoFitZoom]);

  // Sync pan & zoom tracking refs
  // (skipped while a wheel-zoom animation runs: the refs are the live source of truth
  //  then, and syncing from a lagging render would snap the canvas backwards)
  useEffect(() => {
    if (wheelRafRef.current) return;
    currentPanRef.current = pan;
  }, [pan, currentPanRef, wheelRafRef]);

  useEffect(() => {
    if (wheelRafRef.current) return;
    currentZoomRef.current = zoom;
  }, [zoom, currentZoomRef, wheelRafRef]);

  // Maintain fit on window/container resize
  useEffect(() => {
    if (!editorContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      handleAutoFitZoom();
    });
    observer.observe(editorContainerRef.current);
    return () => observer.disconnect();
  }, [handleAutoFitZoom, editorContainerRef]);

  // Mouse wheel zoom gesture listener
  useEffect(() => {
    const el = editorContainerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (e.target.closest('.editor-ss-overlay, input, textarea, select, .flipbook-text-scrollbar, [contenteditable="true"], [data-scrollable="true"], [data-modal], [data-modal="true"], .custom-scrollbar, [role="dialog"], .overflow-y-auto, .overflow-auto, .modal-scroll-container')) return;
      if (window.__isAdjustingShapeImage) return;

      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        e.stopPropagation();

        lastWheelTimeRef.current = Date.now();
        suppressClickRef.current = true;
        if (suppressClickTimeoutRef.current) clearTimeout(suppressClickTimeoutRef.current);
        suppressClickTimeoutRef.current = setTimeout(() => { suppressClickRef.current = false; }, 200);

        const containerEl = zoomContainerRef.current;
        if (!containerEl) return;

        const minZ = 10;
        const maxZ = 10000;

        // Normalize delta (line/page modes) and convert to a continuous zoom factor
        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 16;
        else if (e.deltaMode === 2) delta *= 100;
        delta = Math.max(-100, Math.min(100, delta));
        const factor = Math.exp(-delta * 0.0035);

        // Accumulate on the animation target so rapid wheel ticks stack smoothly
        const baseZoom = targetZoomRef.current ?? (currentZoomRef.current || zoom || 100);
        const newTarget = Math.min(Math.max(baseZoom * factor, minZ), maxZ);
        targetZoomRef.current = newTarget;
        zoomAnchorRef.current = { x: e.clientX, y: e.clientY };

        containerEl.style.transition = 'none';

        if (wheelRafRef.current) return; // animation already running

        const step = () => {
          const target = targetZoomRef.current;
          const currentZoom = currentZoomRef.current || 100;
          const currentPan = currentPanRef.current || { x: 0, y: 0 };

          const diff = target - currentZoom;
          const done = Math.abs(diff) < 0.02;
          const nextZoom = done ? target : currentZoom + diff * 0.22;

          // Keep the point under the cursor fixed while scaling
          const editorRect = el.getBoundingClientRect();
          const centerX = editorRect.left + editorRect.width / 2 + currentPan.x;
          const centerY = editorRect.top + editorRect.height / 2 + currentPan.y;
          const ratio = nextZoom / currentZoom;
          const rawNextX = currentPan.x + (zoomAnchorRef.current.x - centerX) * (1 - ratio);
          const rawNextY = currentPan.y + (zoomAnchorRef.current.y - centerY) * (1 - ratio);

          const { maxPanX, maxPanY } = computePanBounds(el, zoomContainerRef.current, nextZoom / 100, baseWidth, baseHeight);
          const clampedX = Math.min(Math.max(rawNextX, -maxPanX), maxPanX);
          const clampedY = Math.min(Math.max(rawNextY, -maxPanY), maxPanY);
          const nextPan = { x: clampedX, y: clampedY };

          currentZoomRef.current = nextZoom;
          currentPanRef.current = nextPan;
          if (zoomContainerRef.current) {
            zoomContainerRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px) scale(${nextZoom / 100})`;
            setOverlayInvZoom(zoomContainerRef.current, nextZoom / 100);
          }
          window.dispatchEvent(new CustomEvent('editor-pan-update', { detail: { ...nextPan, zoom: nextZoom } }));

          // Commit to React only when the animation settles. Committing every frame re-rendered the
          // whole editor and redrew every overlay per frame (visible glitching). The selection box /
          // handles stay constant-size mid-zoom through the --fbe-inv-zoom CSS variable instead.
          if (done) {
            setZoom(nextZoom); // unrounded so zoom & pan stay consistent (display rounds)
            setPan(nextPan);
            wheelRafRef.current = null;
            targetZoomRef.current = null;
            return;
          }
          wheelRafRef.current = requestAnimationFrame(step);
        };
        // No will-change while zooming: it makes the browser stretch a cached bitmap (blurry until
        // it re-rasterises). Without it, content is re-rendered crisp at every zoom step.
        if (zoomContainerRef.current) zoomContainerRef.current.style.willChange = 'auto';
        wheelRafRef.current = requestAnimationFrame(step);
      } else {
        // Standard Scroll:
        // - Normal scroll: sheet moves top and bottom
        // - Shift + scroll: sheet moves left and right
        e.preventDefault();
        e.stopPropagation();

        lastWheelTimeRef.current = Date.now();
        suppressClickRef.current = true;
        if (suppressClickTimeoutRef.current) clearTimeout(suppressClickTimeoutRef.current);
        suppressClickTimeoutRef.current = setTimeout(() => { suppressClickRef.current = false; }, 200);

        const containerEl = zoomContainerRef.current;
        if (!containerEl) return;

        // Cancel any running wheel-zoom animation so it doesn't fight pan
        if (wheelRafRef.current) {
          cancelAnimationFrame(wheelRafRef.current);
          wheelRafRef.current = null;
          targetZoomRef.current = null;
        }

        let multiplier = 1;
        if (e.deltaMode === 1) multiplier = 16;
        else if (e.deltaMode === 2) multiplier = 100;

        let dx = 0;
        let dy = 0;

        if (e.shiftKey) {
          // Shift + scroll -> Move sheet left and right
          const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          dx = rawDelta * multiplier;
          dy = 0;
        } else {
          // Normal scroll -> Move sheet top and bottom (and trackpad horizontal if deltaX present)
          dx = e.deltaX * multiplier;
          dy = e.deltaY * multiplier;
        }

        const currentP = currentPanRef.current || pan || { x: 0, y: 0 };
        const currentZ = currentZoomRef.current || zoom || 100;
        const currentScale = currentZ / 100;

        const { maxPanX, maxPanY } = computePanBounds(el, containerEl, currentScale, baseWidth, baseHeight);

        // Accumulate displacement on targetPan so rapid wheel ticks stack smoothly with natural momentum
        const baseTargetX = targetPanRef.current ? targetPanRef.current.x : currentP.x;
        const baseTargetY = targetPanRef.current ? targetPanRef.current.y : currentP.y;

        const nextTargetX = Math.min(Math.max(baseTargetX - dx, -maxPanX), maxPanX);
        const nextTargetY = Math.min(Math.max(baseTargetY - dy, -maxPanY), maxPanY);

        targetPanRef.current = { x: nextTargetX, y: nextTargetY };

        if (panRafRef.current) return; // animation already gliding smoothly

        // GPU layer for the whole glide (CanvasViewport drops it ~150ms after the final pan commit)
        containerEl.style.willChange = 'transform';

        const panStep = () => {
          if (!targetPanRef.current) {
            panRafRef.current = null;
            return;
          }
          const target = targetPanRef.current;
          const curr = currentPanRef.current || { x: 0, y: 0 };
          const diffX = target.x - curr.x;
          const diffY = target.y - curr.y;

          const doneX = Math.abs(diffX) < 0.25;
          const doneY = Math.abs(diffY) < 0.25;

          // Smooth exponential ease-out interpolation
          const stepX = doneX ? target.x : curr.x + diffX * 0.28;
          const stepY = doneY ? target.y : curr.y + diffY * 0.28;

          const currZ = currentZoomRef.current || zoom || 100;
          const scale = currZ / 100;

          const nextP = { x: stepX, y: stepY };
          currentPanRef.current = nextP;

          if (zoomContainerRef.current) {
            zoomContainerRef.current.style.transition = 'none';
            zoomContainerRef.current.style.transform = `translate(${stepX}px, ${stepY}px) scale(${scale})`;
            setOverlayInvZoom(zoomContainerRef.current, scale);
          }
          window.dispatchEvent(new CustomEvent('editor-pan-update', { detail: nextP }));

          // Commit React state only when the glide settles: a setPan every frame re-rendered the whole
          // canvas (all page HTML) ~60×/s, which made scrolling stutter. The DOM transform above
          // already moves the sheet each frame.
          if (doneX && doneY) {
            panRafRef.current = null;
            targetPanRef.current = null;
            setPan(nextP);
            return;
          }

          panRafRef.current = requestAnimationFrame(panStep);
        };

        panRafRef.current = requestAnimationFrame(panStep);
      }
    };

    const handleMouseDown = () => {
      // If user starts clicking or dragging with hand/spacebar, immediately freeze any active glide
      if (panRafRef.current) {
        cancelAnimationFrame(panRafRef.current);
        panRafRef.current = null;
        targetPanRef.current = null;
        // Keep where the glide stopped (state is only committed at the end of a glide)
        if (currentPanRef.current) setPan({ ...currentPanRef.current });
      }
    };

    // Popups (colour pickers etc.) put an invisible full-screen click-catcher over the canvas
    // to close on outside click. It swallows wheel events, so scroll / shift+scroll / zoom stop
    // working while a picker is open. Forward wheel events that land on such a transparent
    // layer (and are over the canvas) to the canvas handler. Real modals (tinted/blurred
    // backdrops) are not affected.
    const isTransparentClickCatcher = (node) => {
      if (!node || node === document.body || node === document.documentElement || el.contains(node)) return false;
      const cs = window.getComputedStyle(node);
      if (cs.position !== 'fixed') return false;
      const r = node.getBoundingClientRect();
      if (r.width < window.innerWidth * 0.9 || r.height < window.innerHeight * 0.9) return false;
      const bg = cs.backgroundColor || '';
      const transparentBg = bg === 'transparent' || /rgba?\([^)]*,\s*0(?:\.0+)?\s*\)$/.test(bg);
      const noBlur = !cs.backdropFilter || cs.backdropFilter === 'none';
      return transparentBg && noBlur && (cs.backgroundImage === 'none' || !cs.backgroundImage);
    };
    const handleWindowWheel = (e) => {
      if (el.contains(e.target)) return; // the canvas handles its own events
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      if (!isTransparentClickCatcher(e.target)) return;
      handleWheel(e);
    };

    el.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    el.addEventListener('mousedown', handleMouseDown, { capture: true });
    window.addEventListener('wheel', handleWindowWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel, { capture: true });
      el.removeEventListener('mousedown', handleMouseDown, { capture: true });
      window.removeEventListener('wheel', handleWindowWheel);
    };
  }, [currentPanRef, currentZoomRef, editorContainerRef, lastWheelTimeRef, pan, setPan, setZoom, suppressClickRef, wheelRafRef, zoom, zoomContainerRef]);

  // Cancel any running wheel-zoom or pan animation on unmount
  useEffect(() => () => {
    if (wheelRafRef.current) cancelAnimationFrame(wheelRafRef.current);
    if (panRafRef.current) cancelAnimationFrame(panRafRef.current);
    if (suppressClickTimeoutRef.current) clearTimeout(suppressClickTimeoutRef.current);
    wheelRafRef.current = null;
    panRafRef.current = null;
    targetPanRef.current = null;
  }, [wheelRafRef]);

  return {
    handleZoomIn,
    handleZoomOut,
    handleAutoFitZoom,
    handleResetZoom
  };
};
