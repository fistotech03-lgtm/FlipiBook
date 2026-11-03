import { flipbookApi } from '../api/flipbookApi';

/**
 * BackgroundSyncManager
 * ─────────────────────────────────────────────────────────────
 * Uploads large multi-page flipbook batches (e.g. pages 11..100)
 * asynchronously in the background with automatic retry, exponential backoff,
 * and page-unload protection.
 */
class BackgroundSyncManager {
  constructor() {
    this.activeSyncs = new Map();
    this.beforeUnloadHandler = (e) => {
      if (this.activeSyncs.size > 0) {
        e.preventDefault();
        e.returnValue = 'Flipbook pages are currently syncing to the cloud. If you leave now, unsynced pages may be lost.';
        return e.returnValue;
      }
    };
  }

  _attachUnloadGuard() {
    if (typeof window !== 'undefined' && this.activeSyncs.size === 1) {
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  _detachUnloadGuard() {
    if (typeof window !== 'undefined' && this.activeSyncs.size === 0) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  /**
   * Helper to execute an async action with up to maxRetries attempts.
   */
  async _retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) throw err;
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  /**
   * Enqueues remaining pages for asynchronous background persistence
   * @param {string} v_id - Unique book ID
   * @param {string} emailId - User email ID
   * @param {Array} remainingPages - Array of page objects ({ pageNumber, pageName, content })
   * @param {number} totalPdfSize - Total file size
   */
  enqueue(v_id, emailId, remainingPages, totalPdfSize) {
    if (!v_id || !Array.isArray(remainingPages) || remainingPages.length === 0) return;

    if (this.activeSyncs.has(v_id)) {
      console.log(`[BackgroundSync] Book ${v_id} is already syncing in background.`);
      return;
    }

    this._attachUnloadGuard();

    const task = (async () => {
      const BATCH_SIZE = 15;
      const total = remainingPages.length;
      let completed = 0;
      let hasError = false;

      console.log(`[BackgroundSync] Starting background sync for ${v_id} (${total} pages)...`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('flipbook-bg-sync-start', { detail: { v_id, total } }));
      }

      try {
        for (let i = 0; i < total; i += BATCH_SIZE) {
          const batch = remainingPages.slice(i, i + BATCH_SIZE);

          // Retry each batch up to 3 times with exponential backoff
          await this._retryWithBackoff(async () => {
            return await flipbookApi.savePagesBatch({
              emailId,
              v_id,
              pages: batch,
              keepBase64: true,
              fileSize: totalPdfSize
            });
          }, 3, 1000);

          completed = Math.min(i + BATCH_SIZE, total);
          const percent = Math.round((completed / total) * 100);

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('flipbook-bg-sync-progress', {
              detail: { v_id, completed, total, percent }
            }));
          }

          // Yield to event loop between chunks so network and UI stay smooth
          await new Promise((resolve) => setTimeout(resolve, 60));
        }

        console.log(`[BackgroundSync] Successfully completed background sync for ${v_id}!`);
      } catch (err) {
        hasError = true;
        console.error(`[BackgroundSync] Background batch upload failed for ${v_id} after retries:`, err?.message || err);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('flipbook-bg-sync-error', {
            detail: { v_id, error: err?.message || 'Sync failed', completed, total }
          }));
        }
      } finally {
        this.activeSyncs.delete(v_id);
        this._detachUnloadGuard();
        if (!hasError && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('flipbook-bg-sync-complete', { detail: { v_id } }));
        }
      }
    })();

    this.activeSyncs.set(v_id, task);
  }

  /**
   * Checks if a given book has an ongoing background sync
   */
  isSyncing(v_id) {
    return this.activeSyncs.has(v_id);
  }
}

export const backgroundSyncManager = new BackgroundSyncManager();
export default backgroundSyncManager;
