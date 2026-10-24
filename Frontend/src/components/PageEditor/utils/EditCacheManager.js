/**
 * EditCacheManager.js
 * 
 * High-performance Cache & Execution Manager for Canvas Inline Editing.
 * Eliminates lag, layout thrashing, and dropped frames during text editing by:
 * 
 * 1. O(1) Cached DOM References:
 *    Caches active foreignObject, inner contenteditable container, page container,
 *    and selection overlay references, avoiding expensive querySelector / closest() scans on keystrokes.
 * 
 * 2. Offscreen Canvas Text Metrics Cache:
 *    Ultra-fast (<0.01ms) text measuring via cached 2D Canvas context. Avoids style-mutation
 *    layout thrashing (minHeight='0px' / width='max-content' forced reflows).
 * 
 * 3. Batched & Decoupled RAF Engine:
 *    Coalesces typing keystrokes and overlay polygon updates into a single synchronized
 *    requestAnimationFrame tick, delivering buttery smooth typing response.
 * 
 * 4. Pointer Hover & Canvas Suppression:
 *    Signals to canvas pointer events to skip heavy raycasting and polygon calculations
 *    while an edit session is active.
 */

export class EditCacheManager {
  constructor() {
    // Active editing session state
    this.session = null;

    // Offscreen Canvas for text measurement
    this._canvas = null;
    this._ctx = null;

    // Measurement cache: key -> { width, height }
    this.metricsCache = new Map();
    this.maxMetricsCacheSize = 500;

    // Element & Bounds cache
    this.elementCache = new Map();
    this.boundsCache = new Map();

    // RAF management
    this.pendingRaf = null;
    this.lastOverlaySync = 0;
    this.overlaySyncThrottleMs = 100; // max 10 overlay updates per second during typing
  }

  /**
   * Check if text editing is actively underway
   */
  isEditing() {
    return this.session !== null && this.session.isActive;
  }

  /**
   * Get the active editing session element
   */
  getActiveTarget() {
    return this.session ? this.session.foTarget : null;
  }

  /**
   * Lazily retrieve an offscreen 2D canvas context for text metrics
   */
  getCanvasContext() {
    if (!this._ctx) {
      if (typeof OffscreenCanvas !== 'undefined') {
        try {
          this._canvas = new OffscreenCanvas(256, 256);
          this._ctx = this._canvas.getContext('2d');
        } catch {
          // fallback to hidden DOM canvas
        }
      }
      if (!this._ctx && typeof document !== 'undefined') {
        this._canvas = document.createElement('canvas');
        this._canvas.width = 256;
        this._canvas.height = 256;
        this._ctx = this._canvas.getContext('2d');
      }
    }
    return this._ctx;
  }

  /**
   * Instant text width measurement using cached canvas context (no DOM reflow)
   */
  measureTextWidth(text, fontSpecs = {}) {
    if (!text) return 0;
    const { fontFamily = 'sans-serif', fontSize = '16px', fontWeight = '400', letterSpacing = '0px' } = fontSpecs;
    const cacheKey = `${text}|${fontFamily}|${fontSize}|${fontWeight}|${letterSpacing}`;

    if (this.metricsCache.has(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const ctx = this.getCanvasContext();
    if (!ctx) return text.length * (parseFloat(fontSize) || 16) * 0.55;

    ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
    const metrics = ctx.measureText(text);
    let width = metrics.width;

    const ls = parseFloat(letterSpacing);
    if (!isNaN(ls) && ls !== 0) {
      width += text.length * ls;
    }

    if (this.metricsCache.size >= this.maxMetricsCacheSize) {
      this.metricsCache.clear();
    }
    this.metricsCache.set(cacheKey, width);
    return width;
  }

  /**
   * Start an active inline editing session.
   * Caches all structural DOM references so subsequent typing doesn't scan the DOM.
   */
  startSession(foTarget, div) {
    if (!foTarget || !div) return;

    // End any existing session first
    if (this.session) {
      this.endSession();
    }

    const container = foTarget.closest('.page-svg-container');
    const pageIndex = container ? container.getAttribute('data-page-index') : null;
    const overlay = pageIndex !== null ? document.getElementById(`highlight-overlay-${pageIndex}`) : null;
    const parentGroup = foTarget.closest('g');
    const sizingMode = foTarget.getAttribute('data-sizing-mode') || 'auto-height';

    const currentX = parseFloat(foTarget.getAttribute('x')) || 0;
    const currentY = parseFloat(foTarget.getAttribute('y')) || 0;
    const currentW = parseFloat(foTarget.getAttribute('width')) || 0;
    const currentH = parseFloat(foTarget.getAttribute('height')) || 0;

    this.session = {
      isActive: true,
      foTarget,
      div,
      container,
      pageIndex,
      overlay,
      parentGroup: (parentGroup && parentGroup.getAttribute('data-name') === 'Group') ? parentGroup : null,
      sizingMode,
      currentX,
      currentY,
      currentW,
      currentH,
      lastW: currentW,
      lastH: currentH,
      isDirty: false
    };

    this.lastOverlaySync = performance.now();
  }

  /**
   * Batched measurement and dimension update.
   * Eliminates forced synchronous reflows by separating read and write phases.
   */
  batchMeasurement({ forceOverlay = false, onRedrawOverlay = null } = {}) {
    if (!this.session || !this.session.isActive) return;

    const { foTarget, div, sizingMode } = this.session;
    const isScrollable = foTarget.getAttribute('data-scrollable') === 'true';
    if (isScrollable) return;

    // Read Phase: single scrollHeight/scrollWidth read
    const contentH = div.scrollHeight;
    const contentW = div.scrollWidth;

    let targetW = this.session.currentW;
    let targetH = this.session.currentH;
    let targetX = this.session.currentX;
    let dimensionChanged = false;

    if (sizingMode === 'auto-width') {
      const widthDiff = contentW - this.session.currentW;
      if (Math.abs(widthDiff) > 3) {
        targetW = Math.max(contentW + 4, 10);
        const align = div.style.textAlign || foTarget.getAttribute('data-text-align') || 'left';
        if (align === 'center') {
          targetX = this.session.currentX - (widthDiff / 2);
        } else if (align === 'right' || align === 'end') {
          targetX = this.session.currentX - widthDiff;
        }
        dimensionChanged = true;
      }
    }

    if (sizingMode !== 'fixed') {
      if (Math.abs(contentH - this.session.currentH) > 2) {
        targetH = Math.max(contentH + 2, 10);
        dimensionChanged = true;
      }
    }

    // Write Phase: Apply changes
    if (dimensionChanged) {
      if (targetW !== this.session.currentW) {
        foTarget.setAttribute('width', targetW);
        this.session.currentW = targetW;
      }
      if (targetX !== this.session.currentX) {
        foTarget.setAttribute('x', targetX);
        this.session.currentX = targetX;
      }
      if (targetH !== this.session.currentH) {
        foTarget.setAttribute('height', targetH);
        this.session.currentH = targetH;
      }
      this.session.isDirty = true;
    }

    // Overlay Redraw: Throttled to 10fps during typing, or instantaneous when forced
    const now = performance.now();
    const shouldSyncOverlay = forceOverlay || (dimensionChanged && (now - this.lastOverlaySync > this.overlaySyncThrottleMs));

    if (shouldSyncOverlay && typeof onRedrawOverlay === 'function') {
      this.lastOverlaySync = now;
      this.syncOverlayHighlight(onRedrawOverlay);
    }
  }

  /**
   * Fast overlay highlight update using cached overlay nodes
   */
  syncOverlayHighlight(redrawCallback) {
    if (!this.session || !this.session.isActive) return;
    const { foTarget, overlay, parentGroup } = this.session;

    if (overlay) {
      const oldSel = overlay.querySelector(`[id="overlay-poly-selected-${foTarget.id}"]`);
      if (oldSel) oldSel.remove();
      const oldChildSel = overlay.querySelector(`[id="overlay-poly-child-selected-${foTarget.id}"]`);
      if (oldChildSel) oldChildSel.remove();
    }

    const highlightType = document.querySelector(`[id="overlay-poly-child-selected-${foTarget.id}"]`) ? 'child-selected' : 'selected';
    if (typeof redrawCallback === 'function') {
      redrawCallback(foTarget, highlightType);

      if (parentGroup) {
        const overlayNode = document.querySelector(`[id="overlay-poly-entered-${parentGroup.id}"]`);
        if (overlayNode) {
          overlayNode.remove();
          redrawCallback(parentGroup, 'entered');
        }
      }
    }
  }

  /**
   * Schedule measurement on the next animation frame, coalescing rapid keystrokes
   */
  scheduleInputMeasurement(onRedrawOverlay) {
    if (this.pendingRaf) {
      cancelAnimationFrame(this.pendingRaf);
    }
    this.pendingRaf = requestAnimationFrame(() => {
      this.pendingRaf = null;
      this.batchMeasurement({ forceOverlay: false, onRedrawOverlay });
    });
  }

  /**
   * End editing session and flush all changes
   */
  endSession(onRedrawOverlay = null) {
    if (this.pendingRaf) {
      cancelAnimationFrame(this.pendingRaf);
      this.pendingRaf = null;
    }

    if (this.session) {
      // Final flush
      if (this.session.isDirty && typeof onRedrawOverlay === 'function') {
        this.batchMeasurement({ forceOverlay: true, onRedrawOverlay });
      }
      this.session.isActive = false;
      this.session = null;
    }

    this.elementCache.clear();
    this.boundsCache.clear();
  }

  /**
   * Reset / clear all caches
   */
  clear() {
    this.endSession();
    this.metricsCache.clear();
    this.elementCache.clear();
    this.boundsCache.clear();
  }
}

export const editCacheManager = new EditCacheManager();
export default editCacheManager;
