/**
 * backgroundExtractionManager.js
 * ─────────────────────────────────────────────────────────────
 * Autonomous off-main-thread background vector extraction engine.
 * After initial pages (e.g. 50%) are extracted and the editor is opened immediately,
 * this manager streams the remaining pages (e.g. pages 51..100) using Web Workers,
 * saving them to IndexedDB, streaming them into the live editor state,
 * and saving batches to the backend without causing any UI lag or frame drops.
 */
import { flipbookApi } from '../api/flipbookApi';
import { saveCustomizedEditorState, savePageEditorState, getCustomizedEditorState, getPageEditorState } from './dbUtils';

class BackgroundExtractionManager {
  constructor() {
    this.activeExtractions = new Map();
    this.beforeUnloadHandler = (e) => {
      if (this.activeExtractions.size > 0) {
        e.preventDefault();
        e.returnValue = 'Flipbook pages are currently extracting in the background. If you leave now, some pages may need to be reloaded.';
        return e.returnValue;
      }
    };
  }

  _attachGuard() {
    if (typeof window !== 'undefined' && this.activeExtractions.size === 1) {
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  _detachGuard() {
    if (typeof window !== 'undefined' && this.activeExtractions.size === 0) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  /**
   * Starts background extraction for remaining pages of a flipbook
   * @param {Object} config
   * @param {ArrayBuffer} config.arrayBuffer - PDF binary buffer
   * @param {string} config.v_id - Flipbook unique ID
   * @param {string} config.emailId - User email ID
   * @param {number} config.startIndex - 0-based start index (e.g. 50 for page 51)
   * @param {number} config.totalPages - Total pages count (e.g. 100)
   * @param {number} config.width - Page width in mm
   * @param {number} config.height - Page height in mm
   * @param {string} config.orientation - Page orientation
   * @param {number} config.totalPdfSize - Total file size
   * @param {string} config.bookName - Flipbook name
   * @param {string} config.folderName - Target folder name
   */
  start({
    arrayBuffer,
    v_id,
    emailId,
    startIndex,
    totalPages,
    width,
    height,
    orientation,
    totalPdfSize,
    bookName,
    folderName
  }) {
    if (!v_id || !arrayBuffer || startIndex >= totalPages) return;

    if (this.activeExtractions.has(v_id)) {
      console.log(`[BackgroundExtraction] Book ${v_id} is already extracting in background.`);
      return;
    }

    this._attachGuard();

    const task = (async () => {
      const hardwareConcurrency = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
      const workerCount = Math.min(3, Math.max(1, Math.floor(hardwareConcurrency / 2)));
      const workers = [];

      try {
        console.log(`[BackgroundExtraction] Starting background extraction for ${v_id}: pages ${startIndex + 1} to ${totalPages} across ${workerCount} workers.`);

        for (let i = 0; i < workerCount; i++) {
          const w = new Worker(new URL('./pdfWorker.js', import.meta.url), { type: 'module' });
          workers.push({ id: i, worker: w, busy: false });
        }

        // Initialize workers in parallel with 25s timeout
        await Promise.all(
          workers.map(w => {
            return new Promise((res, rej) => {
              const id = `bg_init_${Date.now()}_${Math.random()}`;
              const t = setTimeout(() => rej(new Error('Background worker init timeout')), 25000);
              const handler = (e) => {
                if (e.data?.id === id || e.data?.type === 'INIT_OK') {
                  clearTimeout(t);
                  w.worker.removeEventListener('message', handler);
                  res();
                }
              };
              w.worker.addEventListener('message', handler);
              w.worker.postMessage({ type: 'INIT', id, payload: { pdfBuffer: arrayBuffer.slice(0) } });
            });
          })
        );

        // Queue remaining tasks
        const remainingQueue = [];
        for (let idx = startIndex; idx < totalPages; idx++) {
          remainingQueue.push({ pageIndex: idx, pageNum: idx + 1 });
        }

        const pendingCloudSyncBatch = [];
        const BATCH_SYNC_SIZE = 5;

        // Render helper for single page
        const renderPage = (wObj, pageIndex, pageNum) => {
          return new Promise((res, rej) => {
            const id = `bg_render_${pageIndex}_${Date.now()}`;
            const t = setTimeout(() => rej(new Error(`Background render timeout for page ${pageNum}`)), 25000);
            const handler = (e) => {
              if (e.data?.id === id || (e.data?.type === 'PAGE_OK' && e.data?.pageIndex === pageIndex)) {
                clearTimeout(t);
                wObj.worker.removeEventListener('message', handler);
                res(e.data);
              }
            };
            wObj.worker.addEventListener('message', handler);
            wObj.worker.postMessage({ type: 'RENDER_PAGE', id, payload: { pageIndex, pageNum } });
          });
        };

        const flushBatchToCloud = async (batch) => {
          if (!batch || batch.length === 0) return;
          try {
            await flipbookApi.savePagesBatch({
              emailId,
              v_id,
              pages: batch,
              keepBase64: true,
              fileSize: totalPdfSize
            });
          } catch (syncErr) {
            console.warn(`[BackgroundExtraction] Failed to sync batch of ${batch.length} pages:`, syncErr);
          }
        };

        // Worker execution loop
        const runWorker = async (wObj) => {
          while (remainingQueue.length > 0) {
            const taskItem = remainingQueue.shift();
            if (!taskItem) break;

            try {
              wObj.busy = true;
              const result = await renderPage(wObj, taskItem.pageIndex, taskItem.pageNum);
              wObj.busy = false;

              const svgContent = result.svgString || '';
              const pageData = {
                pageNumber: taskItem.pageNum,
                pageName: `Page ${taskItem.pageNum}`,
                content: svgContent,
                html: svgContent,
                width: result.width || width,
                height: result.height || height,
                isVector: !!result.isVector
              };

              // Schedule non-blocking update using requestIdleCallback to keep 60fps in editor
              const scheduleUpdate = (typeof window !== 'undefined' && window.requestIdleCallback)
                ? window.requestIdleCallback
                : (cb) => setTimeout(cb, 30);

              scheduleUpdate(() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('flipbook-page-extracted', {
                    detail: {
                      v_id,
                      pageIndex: taskItem.pageIndex,
                      pageNumber: taskItem.pageNum,
                      content: svgContent,
                      html: svgContent,
                      isVector: !!result.isVector
                    }
                  }));
                }

                // Update IndexedDB in background
                this._updateIndexedDbPage(v_id, taskItem.pageNum, svgContent);
              });

              pendingCloudSyncBatch.push(pageData);
              if (pendingCloudSyncBatch.length >= BATCH_SYNC_SIZE) {
                const toSync = pendingCloudSyncBatch.splice(0, pendingCloudSyncBatch.length);
                flushBatchToCloud(toSync);
              }

              // Subtle yield so worker message passing never causes micro-stutter
              await new Promise(r => setTimeout(r, 40));
            } catch (pageErr) {
              console.warn(`[BackgroundExtraction] Warning extracting page ${taskItem.pageNum}:`, pageErr);
              wObj.busy = false;
            }
          }
        };

        await Promise.all(workers.map(w => runWorker(w)));

        // Flush any remaining pages in cloud batch
        if (pendingCloudSyncBatch.length > 0) {
          await flushBatchToCloud(pendingCloudSyncBatch);
        }

        console.log(`[BackgroundExtraction] Successfully finished all background pages for ${v_id}!`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('flipbook-extraction-complete', { detail: { v_id, totalPages } }));
        }
      } catch (err) {
        console.error(`[BackgroundExtraction] Background extraction error for ${v_id}:`, err);
      } finally {
        workers.forEach(w => {
          try {
            w.worker.postMessage({ type: 'DESTROY', id: 'term' });
            w.worker.terminate();
          } catch (_) {}
        });
        this.activeExtractions.delete(v_id);
        this._detachGuard();
      }
    })();

    this.activeExtractions.set(v_id, task);
  }

  async _updateIndexedDbPage(v_id, pageNumber, svgContent) {
    try {
      const [customizedState, pageEditorState] = await Promise.all([
        getCustomizedEditorState(v_id).catch(() => null),
        getPageEditorState(v_id).catch(() => null)
      ]);

      if (customizedState && Array.isArray(customizedState.pages)) {
        const pIdx = customizedState.pages.findIndex(p => p.pageNumber === pageNumber || p.name === `Page ${pageNumber}` || (p.id !== undefined && p.id === pageNumber - 1));
        if (pIdx !== -1) {
          customizedState.pages[pIdx] = {
            ...customizedState.pages[pIdx],
            html: svgContent,
            content: svgContent,
            isPlaceholder: false
          };
          await saveCustomizedEditorState(customizedState);
        }
      }

      if (pageEditorState && Array.isArray(pageEditorState.pages)) {
        const pIdx = pageEditorState.pages.findIndex(p => p.pageNumber === pageNumber || p.name === `Page ${pageNumber}` || (p.id !== undefined && p.id === `page_${pageNumber}`));
        if (pIdx !== -1) {
          pageEditorState.pages[pIdx] = {
            ...pageEditorState.pages[pIdx],
            html: svgContent,
            isPlaceholder: false
          };
          await savePageEditorState(pageEditorState);
        }
      }
    } catch (e) {
      // Non-fatal IndexedDB background update error
    }
  }

  isExtracting(v_id) {
    return this.activeExtractions.has(v_id);
  }
}

export const backgroundExtractionManager = new BackgroundExtractionManager();
export default backgroundExtractionManager;

