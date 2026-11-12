/**
 * pdfWorker.js
 * Dedicated Web Worker for high-throughput, multi-threaded PDF vector extraction.
 * Runs MuPDF WASM off the main thread to guarantee 60fps UI responsiveness
 * while extracting mathematical vector SVGs at maximum hardware concurrency.
 */

import {
  hasCmykJpeg,
  convertCmykJpegsInSvg,
  formatMuPdfSvgForFlipbook,
  generatePdfPageSvg,
  uint8ArrayToBase64,
  svgToDataUrl
} from './pdfShared.js';

let mupdfModule = null;
const getMuPdf = async () => {
  if (!mupdfModule) {
    mupdfModule = await import('mupdf');
  }
  return mupdfModule;
};

let doc = null;
const ptToMm = 25.4 / 72;

// Listen for uncaught errors to prevent hanging promises on main thread
self.addEventListener('error', (e) => {
  try {
    self.postMessage({ type: 'WORKER_CRASH', error: e?.message || 'Worker startup error' });
  } catch (_) {}
});

self.addEventListener('unhandledrejection', (e) => {
  try {
    self.postMessage({ type: 'WORKER_CRASH', error: e?.reason?.message || String(e?.reason) });
  } catch (_) {}
});

self.onmessage = async (e) => {
  const { type, id, payload } = e.data || {};

  try {
    switch (type) {
      case 'INIT': {
        const { pdfBuffer } = payload || {};
        if (!pdfBuffer) {
          throw new Error('INIT called without pdfBuffer');
        }
        if (doc) {
          try { doc.destroy(); } catch (_) {}
          doc = null;
        }

        const mupdf = await getMuPdf();
        const uint8Array = new Uint8Array(pdfBuffer);
        doc = mupdf.Document.openDocument(uint8Array, 'application/pdf');
        const totalPages = doc.countPages();

        self.postMessage({
          type: 'INIT_OK',
          id,
          totalPages
        });
        break;
      }

      case 'RENDER_PAGE': {
        if (!doc) {
          throw new Error('Worker document not initialized before RENDER_PAGE');
        }
        const { pageIndex, pageNum } = payload || {};
        const mupdf = await getMuPdf();

        let page = null;
        let svgBuf = null;
        let highResPix = null;

        try {
          page = doc.loadPage(pageIndex);
          const bounds = page.getBounds(); // [x0, y0, x1, y1]
          const widthPt = bounds[2] - bounds[0];
          const heightPt = bounds[3] - bounds[1];
          const widthMm = Math.round(widthPt * ptToMm * 100) / 100;
          const heightMm = Math.round(heightPt * ptToMm * 100) / 100;

          // 1. Primary High-Resolution (2160p) Raster Pixmap Pipeline (zero vector lag, 60fps 3D flips)
          const maxPt = Math.max(widthPt, heightPt);
          let renderScale = 2.5;
          if (maxPt > 0) {
            const targetPixels = 2160;
            const desiredScale = targetPixels / maxPt;
            renderScale = Math.max(2.0, Math.min(4.0, desiredScale));
            if (maxPt * renderScale > 2400) {
              renderScale = Math.max(1.5, 2400 / maxPt);
            }
          }

          const renderMatrix = mupdf.Matrix.scale(renderScale, renderScale);
          highResPix = page.toPixmap(renderMatrix, mupdf.ColorSpace.DeviceRGB, false, true);

          let imageBytes = null;
          let mimeType = 'image/jpeg';
          try {
            if (typeof highResPix.asJPEG === 'function') {
              imageBytes = highResPix.asJPEG(92, false);
              mimeType = 'image/jpeg';
            }
          } catch (_) {}

          if (!imageBytes) {
            imageBytes = highResPix.asPNG();
            mimeType = 'image/png';
          }

          const base64Data = uint8ArrayToBase64(imageBytes);
          const highResDataUrl = `data:${mimeType};base64,${base64Data}`;
          const svgString = generatePdfPageSvg(highResDataUrl, `Page ${pageNum}`, widthMm, heightMm, true);

          self.postMessage({
            type: 'PAGE_OK',
            id,
            pageIndex,
            pageNum,
            dataUrl: highResDataUrl,
            svgString,
            width: widthMm,
            height: heightMm,
            isVector: false
          });
        } finally {
          if (highResPix) {
            try { highResPix.destroy(); } catch (_) {}
          }
          if (page) {
            try { page.destroy(); } catch (_) {}
          }
        }
        break;
      }

      case 'DESTROY': {
        if (doc) {
          try { doc.destroy(); } catch (_) {}
          doc = null;
        }
        self.postMessage({ type: 'DESTROY_OK', id });
        self.close();
        break;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (err) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: err?.message || String(err)
    });
  }
};
