import { flipbookApi } from '../api/flipbookApi';

/**
 * BackgroundSyncManager
 * ─────────────────────────────────────────────────────────────
 * Uploads large multi-page flipbook batches (e.g. pages 11..100)
 * asynchronously in the background so the user can open and interact
 * with Customized Editor immediately without waiting 20+ seconds on upload modals.
 */
class BackgroundSyncManager {
  constructor() {
    this.activeSyncs = new Map();
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

    const task = (async () => {
      const BATCH_SIZE = 15;
      const total = remainingPages.length;
      let completed = 0;

      console.log(`[BackgroundSync] Starting background sync for ${v_id} (${total} pages)...`);
      window.dispatchEvent(new CustomEvent('flipbook-bg-sync-start', { detail: { v_id, total } }));

      try {
        for (let i = 0; i < total; i += BATCH_SIZE) {
          const batch = remainingPages.slice(i, i + BATCH_SIZE);
          await flipbookApi.savePagesBatch({
            emailId,
            v_id,
            pages: batch,
            keepBase64: true,
            fileSize: totalPdfSize
          });

          completed = Math.min(i + BATCH_SIZE, total);
          const percent = Math.round((completed / total) * 100);

          window.dispatchEvent(new CustomEvent('flipbook-bg-sync-progress', {
            detail: { v_id, completed, total, percent }
          }));

          // Yield to event loop between chunks so network and UI stay 60fps
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        console.log(`[BackgroundSync] Successfully completed background sync for ${v_id}!`);
      } catch (err) {
        console.warn(`[BackgroundSync] Background batch upload warning for ${v_id}:`, err?.message || err);
      } finally {
        this.activeSyncs.delete(v_id);
        window.dispatchEvent(new CustomEvent('flipbook-bg-sync-complete', { detail: { v_id } }));
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
