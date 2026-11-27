/**
 * scrubValue.js
 * Shared horizontal drag-to-change numeric value helper (Figma-style scrub).
 */

/**
 * Common horizontal scrub helper for dragging to change numbers.
 * Uses the custom 24x24 virtual ew-resize cursor without Pointer Lock,
 * avoiding Chrome's "press esc" popup while keeping exact cursor alignment.
 */
export const handleScrubHelper = (e, initialVal, updateFn, sensitivity = 5, options = null) => {
  const sValue = parseFloat(initialVal) || 0;
  const step = options?.step ?? 1;
  const precision = options?.precision ?? null;
  const onEnd = options?.onEnd ?? null;
  const target = e.currentTarget;
  const startX = e.clientX;
  const virtualY = e.clientY;
  let accumulatedDelta = 0;
  let hasMoved = false;
  let lastEmittedVal = null;
  let rafId = null;

  const computeVal = () => {
    const raw = sValue + (accumulatedDelta / sensitivity) * step;
    if (precision !== null) {
      return parseFloat(raw.toFixed(precision));
    }
    return sValue + Math.round(accumulatedDelta / sensitivity) * step;
  };

  const prevBodyCursor = document.body.style.cursor;
  const prevBodyUserSelect = document.body.style.userSelect;
  document.body.classList.add('is-scrubbing');
  document.body.style.cursor = 'none';
  document.body.style.userSelect = 'none';

  // Higher specificity than panel-level `body.is-scrubbing *` rules so the native OS cursor stays hidden everywhere
  let hideCursorStyle = document.getElementById('scrub-hide-native-cursor');
  if (!hideCursorStyle) {
    hideCursorStyle = document.createElement('style');
    hideCursorStyle.id = 'scrub-hide-native-cursor';
    hideCursorStyle.textContent = 'html body.is-scrubbing, html body.is-scrubbing * { cursor: none !important; }';
    document.head.appendChild(hideCursorStyle);
  }

  if (e.pointerId !== undefined && target?.setPointerCapture) {
    try {
      target.setPointerCapture(e.pointerId);
    } catch { }
  }

  const vCursor = document.createElement('div');
  vCursor.style.position = 'fixed';
  vCursor.style.left = '0px';
  vCursor.style.top = '0px';
  vCursor.style.margin = '0px';
  vCursor.style.padding = '0px';
  vCursor.style.width = '24px';
  vCursor.style.height = '24px';
  vCursor.style.display = 'flex';
  vCursor.style.alignItems = 'center';
  vCursor.style.justifyContent = 'center';
  vCursor.style.pointerEvents = 'none';
  vCursor.style.zIndex = '999999';
  vCursor.style.willChange = 'transform';
  vCursor.style.transform = `translate3d(${startX - 12}px, ${virtualY - 12}px, 0)`;
  vCursor.style.filter = 'none';
  vCursor.style.boxShadow = 'none';
  vCursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 15L21 12L18 9M6 9L3 12L6 15M4 12H20" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 15L21 12L18 9M6 9L3 12L6 15M4 12H20" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  document.body.appendChild(vCursor);

  const flushUpdate = () => {
    rafId = null;
    const newVal = computeVal();
    if (newVal !== lastEmittedVal) {
      lastEmittedVal = newVal;
      updateFn(newVal.toString());
    }
  };

  const onMouseMove = (moveEvent) => {
    accumulatedDelta = moveEvent.clientX - startX;
    if (Math.abs(accumulatedDelta) > 2) hasMoved = true;

    vCursor.style.transform = `translate3d(${moveEvent.clientX - 12}px, ${moveEvent.clientY - 12}px, 0)`;

    if (rafId === null) {
      rafId = requestAnimationFrame(flushUpdate);
    }
  };

  const onMouseUp = (moveEvent) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      flushUpdate();
    }
    if (moveEvent?.pointerId !== undefined && target?.releasePointerCapture) {
      try { target.releasePointerCapture(moveEvent.pointerId); } catch { }
    }
    if (vCursor.parentNode) vCursor.parentNode.removeChild(vCursor);
    document.body.classList.remove('is-scrubbing');
    document.body.style.cursor = prevBodyCursor;
    document.body.style.userSelect = prevBodyUserSelect;
    window.removeEventListener('pointermove', onMouseMove);
    window.removeEventListener('pointerup', onMouseUp);
    window.removeEventListener('pointercancel', onMouseUp);
    window.removeEventListener('blur', onMouseUp);
    if (typeof onEnd === 'function') {
      onEnd(computeVal().toString(), hasMoved);
    }
  };

  window.addEventListener('pointermove', onMouseMove);
  window.addEventListener('pointerup', onMouseUp);
  window.addEventListener('pointercancel', onMouseUp);
  window.addEventListener('blur', onMouseUp);
};
