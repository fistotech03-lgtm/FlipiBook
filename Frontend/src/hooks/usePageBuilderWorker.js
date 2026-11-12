/**
 * usePageBuilderWorker.js
 *
 * React hook that manages a singleton Web Worker for page-building tasks.
 * The worker runs buildPageDoc + cleanStaticHtml in a background OS thread.
 *
 * Usage:
 *   const { buildDoc, cleanHtml } = usePageBuilderWorker();
 *
 *   // Both return Promises — resolved from worker, never blocks main thread
 *   const { srcdoc, cleanedHtml } = await buildDoc(rawHtml);
 *   const cleanedHtml = await cleanHtml(rawHtml);
 */

import { useRef, useEffect, useCallback } from 'react';

// Worker singleton — shared across all FlipBookEngine instances
let workerSingleton = null;
let workerPendingMap = new Map(); // id → { resolve, reject }
let workerIdCounter = 0;

function getWorker() {
  if (!workerSingleton || workerSingleton._dead) {
    try {
      workerSingleton = new Worker(
        new URL('../workers/pageBuilder.worker.js', import.meta.url),
        { type: 'module' }
      );
      workerSingleton._dead = false;

      workerSingleton.onmessage = ({ data }) => {
        const { id, type, srcdoc, cleanedHtml, message } = data;
        const pending = workerPendingMap.get(id);
        if (!pending) return;
        workerPendingMap.delete(id);
        if (type === 'error') {
          pending.reject(new Error(message));
        } else {
          pending.resolve({ srcdoc, cleanedHtml });
        }
      };

      workerSingleton.onerror = (err) => {
        console.error('[PageBuilderWorker] Worker error:', err);
        workerSingleton._dead = true;
        // Reject all pending promises
        for (const [, { reject }] of workerPendingMap) {
          reject(err);
        }
        workerPendingMap.clear();
      };
    } catch (err) {
      console.warn('[PageBuilderWorker] Worker unavailable, falling back to main thread:', err);
      return null;
    }
  }
  return workerSingleton;
}

/**
 * Post a message to the worker and return a Promise for the result.
 * Falls back gracefully to main-thread if worker is unavailable.
 */
function postToWorker(msg, fallback) {
  const worker = getWorker();
  if (!worker) {
    // Fallback: run synchronously on main thread
    try { return Promise.resolve({ result: fallback() }); }
    catch (e) { return Promise.reject(e); }
  }

  const id = `w${++workerIdCounter}`;
  return new Promise((resolve, reject) => {
    workerPendingMap.set(id, { resolve, reject });
    worker.postMessage({ ...msg, id });
  });
}

/**
 * Hook — provides buildDoc and cleanHtml functions backed by the worker.
 *
 * @param {string} backendUrl  VITE_BACKEND_URL for asset rewriting
 */
export function usePageBuilderWorker(backendUrl = '') {
  const backendUrlRef = useRef(backendUrl);
  useEffect(() => { backendUrlRef.current = backendUrl; }, [backendUrl]);

  /**
   * Build a full srcdoc HTML document for a page.
   * Returns Promise<{ srcdoc: string, cleanedHtml: string }>
   */
  const buildDoc = useCallback((rawHtml) => {
    return postToWorker(
      { type: 'buildDoc', rawHtml, backendUrl: backendUrlRef.current },
      // Main-thread fallback (runs only if Worker construction failed)
      () => {
        // Import inline to avoid circular dep — these are the same functions from FlipBookEngine
        const cleaned = rawHtml; // minimal fallback
        return { srcdoc: `<!DOCTYPE html><html><body>${cleaned}</body></html>`, cleanedHtml: cleaned };
      }
    );
  }, []);

  /**
   * Clean SVG/HTML for static background (strips videos, fixes viewBox).
   * Returns Promise<{ cleanedHtml: string }>
   */
  const cleanHtml = useCallback((rawHtml) => {
    return postToWorker(
      { type: 'cleanHtml', rawHtml },
      () => ({ cleanedHtml: rawHtml })
    );
  }, []);

  return { buildDoc, cleanHtml };
}

/**
 * Terminate the worker singleton (call on app unmount or hot reload).
 */
export function terminatePageBuilderWorker() {
  if (workerSingleton) {
    workerSingleton.terminate();
    workerSingleton = null;
    workerPendingMap.clear();
  }
}

