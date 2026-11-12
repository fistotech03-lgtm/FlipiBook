/**
 * pageWindowStore.js
 *
 * Virtual Sliding Window for Flipbook Pages
 * -----------------------------------------
 * Keeps only WINDOW_SIZE pages in memory at any time.
 * All other pages live in IndexedDB (compressed) and are loaded on demand.
 *
 * Memory impact for a 100-page book:
 *   Before: ~300 MB (all 100 pages + iframes in RAM)
 *   After:  ~15 MB  (7 pages window + minimal placeholders)
 *
 * Random jump handling:
 *   User types page 87 → loadWindow(87) → Promise.all 5 IDB reads (~20ms)
 *   → hydrate DOM slots → Turn.js jumps to 87 → shimmer hides
 *
 * Sequential flip at window edge:
 *   turning event fires → preload next page from IDB (we have 600ms before animation ends)
 *   turned event fires → shift window, evict far page
 */

import { saveToDB, getFromDB } from './dbUtils';

// Number of pages kept active in memory (current spread ± buffer)
export const WINDOW_SIZE = 7; // must be odd; covers current spread + 2 on each side
const HALF = Math.floor(WINDOW_SIZE / 2); // 3

/**
 * Save ALL pages of a book into IDB individually (called once after extraction/load).
 * Each page stored separately so we can retrieve any single page in O(1).
 * @param {string} v_id      Book ID
 * @param {Array}  pages     Full pages array [{html, content, ...}, ...]
 */
export const saveAllPagesToIDB = async (v_id, pages) => {
  if (!v_id || !Array.isArray(pages) || pages.length === 0) return;
  // Batch writes — don't await each one; run up to 10 in parallel
  const BATCH = 10;
  for (let i = 0; i < pages.length; i += BATCH) {
    const slice = pages.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async (page, j) => {
        const idx = i + j;
        const pageContent = page?.html || page?.content || '';
        if (!pageContent || page.isPlaceholder) {
          // Never overwrite an existing non-empty page in IDB with an empty placeholder
          const existing = await getFromDB(`page_${v_id}_${idx}`);
          if (existing && (existing.html || existing.content) && !existing.isPlaceholder) {
            return;
          }
        }
        return saveToDB(`page_${v_id}_${idx}`, page);
      })
    );
  }
  // Also save the total page count so we know the book size without loading all pages
  await saveToDB(`page_meta_${v_id}`, { count: pages.length });
};

/**
 * Save a single page to IDB (called by auto-save when a page is edited).
 * @param {string} v_id
 * @param {number} index  0-based page index
 * @param {Object} page   Page data object
 */
export const savePageToIDB = async (v_id, index, page) => {
  if (!v_id || index < 0 || !page) return;
  const pageContent = page?.html || page?.content || '';
  if (!pageContent || page.isPlaceholder) {
    const existing = await getFromDB(`page_${v_id}_${index}`);
    if (existing && (existing.html || existing.content) && !existing.isPlaceholder) {
      return;
    }
  }
  return saveToDB(`page_${v_id}_${index}`, page);
};

/**
 * Load a single page from IDB by index.
 * @param {string} v_id
 * @param {number} index  0-based page index
 * @returns {Promise<Object|null>}
 */
export const getPageFromIDB = async (v_id, index) => {
  if (!v_id || index < 0) return null;
  return getFromDB(`page_${v_id}_${index}`);
};

/**
 * Get the total page count from IDB metadata.
 * @param {string} v_id
 * @returns {Promise<number>}
 */
export const getPageCountFromIDB = async (v_id) => {
  if (!v_id) return 0;
  const meta = await getFromDB(`page_meta_${v_id}`);
  return meta?.count || 0;
};

/**
 * Load a window of pages centered on `centerIndex` from IDB.
 * Returns a sparse object: { [absoluteIndex]: pageData }
 *
 * Example: centerIndex=87, totalPages=100, WINDOW_SIZE=7
 *   loads indices 84, 85, 86, 87, 88, 89, 90
 *   returns { 84: {...}, 85: {...}, ..., 90: {...} }
 *
 * @param {string} v_id
 * @param {number} centerIndex   0-based logical page index
 * @param {number} totalPages    Total pages in the book
 * @returns {Promise<{pages: Object, windowStart: number, windowEnd: number}>}
 */
export const loadWindowFromIDB = async (v_id, centerIndex, totalPages) => {
  if (!v_id || totalPages === 0) return { pages: {}, windowStart: 0, windowEnd: 0 };

  const start = Math.max(0, centerIndex - HALF);
  const end   = Math.min(totalPages - 1, centerIndex + HALF);

  // Parallel IDB reads — typically 10–50ms for 7 pages
  const indices = [];
  for (let i = start; i <= end; i++) indices.push(i);

  const loaded = await Promise.all(
    indices.map(idx => getPageFromIDB(v_id, idx).then(page => ({ idx, page })))
  );

  const pages = {};
  for (const { idx, page } of loaded) {
    if (page) pages[idx] = page;
  }

  return { pages, windowStart: start, windowEnd: end };
};

/**
 * PageWindowManager — stateful manager for a book's sliding window.
 * Use one instance per open book.
 */
export class PageWindowManager {
  constructor(v_id, totalPages, initialPages = []) {
    this.v_id        = v_id;
    this.totalPages  = totalPages;
    this.windowStart = 0;
    this.windowEnd   = Math.min(WINDOW_SIZE - 1, totalPages - 1);
    // Map of absoluteIndex → pageData (the live in-memory window)
    this.window      = new Map();
    // Preload queue — pending IDB loads
    this._preloadPromise = null;

    // Seed window from initial pages (passed from React state / server response)
    if (initialPages.length > 0) {
      const seedCount = Math.min(initialPages.length, WINDOW_SIZE);
      for (let i = 0; i < seedCount; i++) {
        this.window.set(i, initialPages[i]);
      }
    }
  }

  /**
   * Get page data for a given absolute index.
   * Returns from in-memory window, or null if not loaded yet.
   */
  getPage(index) {
    return this.window.get(index) ?? null;
  }

  /**
   * Get a placeholder for a page not in the window.
   * Placeholder has empty html so Turn.js renders a blank page (not broken).
   */
  getPlaceholder() {
    return { html: '', content: '', isPad: false, isPlaceholder: true };
  }

  /**
   * Get page for rendering — returns real page if in window, placeholder otherwise.
   */
  getPageOrPlaceholder(index) {
    return this.window.has(index) ? this.window.get(index) : this.getPlaceholder();
  }

  /**
   * Check if an index is currently in the loaded window.
   */
  isInWindow(index) {
    return this.window.has(index);
  }

  /**
   * Synchronously update a single page in the window (after edit/auto-save).
   * Also saves to IDB in background.
   */
  updatePage(index, pageData) {
    this.window.set(index, pageData);
    savePageToIDB(this.v_id, index, pageData); // fire-and-forget
  }

  /**
   * Shift window to center on `targetIndex`.
   * - If shift is small (≤ HALF pages): incremental — load only the new pages, evict old
   * - If shift is large (random jump): full reload — clear and load new window
   *
   * Returns a Promise that resolves when the new window is fully loaded.
   * Also returns `isJump: true` if the shift was large (caller should show shimmer).
   *
   * @param {number} targetIndex  0-based target page index
   * @returns {Promise<{isJump: boolean, windowStart: number, windowEnd: number}>}
   */
  async shiftWindow(targetIndex) {
    const clampedTarget = Math.max(0, Math.min(this.totalPages - 1, targetIndex));
    const newStart = Math.max(0, clampedTarget - HALF);
    const newEnd   = Math.min(this.totalPages - 1, clampedTarget + HALF);

    // Calculate how many pages need loading
    const toLoad = [];
    for (let i = newStart; i <= newEnd; i++) {
      if (!this.window.has(i)) toLoad.push(i);
    }

    const isJump = toLoad.length > 2; // Large jump: load many new pages

    // Parallel IDB loads
    if (toLoad.length > 0) {
      const loaded = await Promise.all(
        toLoad.map(idx => getPageFromIDB(this.v_id, idx).then(page => ({ idx, page })))
      );
      for (const { idx, page } of loaded) {
        if (page) this.window.set(idx, page);
      }
    }

    // Evict pages outside the new window to free RAM
    for (const [idx] of this.window) {
      if (idx < newStart || idx > newEnd) {
        this.window.delete(idx);
      }
    }

    this.windowStart = newStart;
    this.windowEnd   = newEnd;

    return { isJump, windowStart: newStart, windowEnd: newEnd };
  }

  /**
   * Preload the page just AHEAD of the current direction of travel.
   * Call this from the Turn.js `turning` event (before animation starts).
   * We have ~600ms before animation ends — IDB reads take ~20ms.
   *
   * @param {number} turnPage   1-based Turn.js page number being turned to
   * @param {string} direction  'next' | 'prev'
   */
  async preloadForFlip(turnPage, direction) {
    const targetIdx = turnPage - 1; // convert to 0-based
    const ahead = direction === 'next'
      ? Math.min(this.totalPages - 1, targetIdx + 2)
      : Math.max(0, targetIdx - 2);

    if (!this.window.has(ahead)) {
      // Don't await — fire and forget; we're racing the flip animation
      getPageFromIDB(this.v_id, ahead).then(page => {
        if (page) this.window.set(ahead, page);
      });
    }
  }

  /**
   * Dispose — clear all in-memory data.
   */
  dispose() {
    this.window.clear();
    this._preloadPromise = null;
  }
}

