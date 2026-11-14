const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const queueManager = require('./queueService');

const execFileAsync = promisify(execFile);

const storageRoot = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.resolve(__dirname, '../../../../storage');

const CANDIDATE_CWEBP = [
  '/opt/homebrew/bin/cwebp',
  '/usr/local/bin/cwebp',
  '/usr/bin/cwebp',
  'cwebp'
];

let cachedCwebp = null;
function getCwebp() {
  if (cachedCwebp) return cachedCwebp;
  for (const c of CANDIDATE_CWEBP) {
    try {
      if (fs.existsSync(c)) {
        cachedCwebp = c;
        return c;
      }
    } catch (e) {}
  }
  return 'cwebp';
}

const { pathToFileURL } = require('url');

let mupdfModule = null;
async function getMuPdf() {
  if (!mupdfModule) {
    try {
      mupdfModule = await import('mupdf');
    } catch (e) {
      const mupdfPath = path.resolve(__dirname, '../../node_modules/mupdf/dist/mupdf.js');
      mupdfModule = await import(pathToFileURL(mupdfPath).href);
    }
  }
  return mupdfModule;
}

/**
 * Convert a PNG buffer directly to WebP using Google cwebp binary
 */
async function bufferToWebP(pngBuffer, outPath, quality = 85, resizeWidth = 0) {
  const cwebp = getCwebp();
  const tempPng = `${outPath}.temp.png`;
  await fs.promises.writeFile(tempPng, pngBuffer);

  const args = ['-q', String(quality)];
  if (resizeWidth > 0) {
    args.push('-resize', String(resizeWidth), '0');
  }
  args.push(tempPng, '-o', outPath);

  try {
    await execFileAsync(cwebp, args, { timeout: 30000 });
  } finally {
    await fs.promises.unlink(tempPng).catch(() => {});
  }
}

/**
 * Extracts a single page using MuPDF:
 * - High-Res WebP (2400px Retina quality)
 * - Thumbnail WebP (240px thumbnail)
 * - Vector Structured Text JSON
 */
async function extractSinglePage(doc, pageIndex, outDir, mupdf) {
  const pageNum = pageIndex + 1;
  const page = doc.loadPage(pageIndex);
  const bounds = page.getBounds(); // [x0, y0, x1, y1]
  const widthPt = bounds[2] - bounds[0];
  const heightPt = bounds[3] - bounds[1];

  const ptToMm = 25.4 / 72;
  const widthMm = Math.round(widthPt * ptToMm * 10) / 10;
  const heightMm = Math.round(heightPt * ptToMm * 10) / 10;

  // 1. Vector Structured Text JSON
  let textJsonStr = '{"blocks":[]}';
  try {
    textJsonStr = page.toStructuredText().asJSON();
  } catch (e) {}
  const textJsonPath = path.join(outDir, `${pageNum}_text.json`);
  await fs.promises.writeFile(textJsonPath, textJsonStr);

  // 2. High-Res 2400px Render Scale
  const maxPt = Math.max(widthPt, heightPt);
  const targetPixels = 2400;
  const highScale = maxPt > 0 ? Math.max(1.5, Math.min(3.5, targetPixels / maxPt)) : 2.5;

  const highPix = page.toPixmap(mupdf.Matrix.scale(highScale, highScale), mupdf.ColorSpace.DeviceRGB, false, true);
  const highPngBytes = highPix.asPNG();
  const webpPath = path.join(outDir, `${pageNum}.webp`);
  await bufferToWebP(highPngBytes, webpPath, 85);

  // 3. Thumbnail 240px Render Scale
  const thumbScale = maxPt > 0 ? 240 / maxPt : 0.3;
  const thumbPix = page.toPixmap(mupdf.Matrix.scale(thumbScale, thumbScale), mupdf.ColorSpace.DeviceRGB, false, true);
  const thumbPngBytes = thumbPix.asPNG();
  const thumbPath = path.join(outDir, `${pageNum}_thumb.webp`);
  await bufferToWebP(thumbPngBytes, thumbPath, 75);

  return {
    pageNumber: pageNum,
    image: `${pageNum}.webp`,
    thumb: `${pageNum}_thumb.webp`,
    text: `${pageNum}_text.json`,
    width: widthMm,
    height: heightMm,
    hasInteractive: false
  };
}

/**
 * Main Extraction Worker for up to 10,000+ Pages
 */
async function processExtractionJob(job) {
  const { jobId, userId, bookId, filePath } = job;

  try {
    const bookDir = path.join(storageRoot, userId, 'books', bookId);
    const pagesDir = path.join(bookDir, 'pages');
    await fs.promises.mkdir(pagesDir, { recursive: true });

    const mupdf = await getMuPdf();
    const pdfBytes = await fs.promises.readFile(filePath);
    const doc = mupdf.Document.openDocument(new Uint8Array(pdfBytes), 'application/pdf');
    const totalPages = doc.countPages();

    if (totalPages === 0) {
      throw new Error('PDF document contains zero pages');
    }

    const firstPage = doc.loadPage(0);
    const firstBounds = firstPage.getBounds();
    const ptToMm = 25.4 / 72;
    const widthMm = Math.round((firstBounds[2] - firstBounds[0]) * ptToMm * 10) / 10;
    const heightMm = Math.round((firstBounds[3] - firstBounds[1]) * ptToMm * 10) / 10;
    const aspectRatio = parseFloat((widthMm / heightMm).toFixed(4));

    await queueManager.updateJob(jobId, {
      totalPages,
      width: widthMm || 210,
      height: heightMm || 297,
      aspectRatio: aspectRatio || 0.7071,
      stage: 'extracting_initial',
      status: 'extracting'
    });

    const allPages = [];

    // ==========================================
    // Phase 1: Fast-Launch (Pages 1 to 10 in <1s)
    // ==========================================
    const initialBatchSize = Math.min(10, totalPages);
    for (let p = 0; p < initialBatchSize; p++) {
      const pageInfo = await extractSinglePage(doc, p, pagesDir, mupdf);
      allPages.push(pageInfo);
    }

    await queueManager.updateJob(jobId, {
      availablePages: allPages.length,
      initialPagesReady: true,
      stage: totalPages > 10 ? 'streaming_remaining' : 'finalizing',
      progress: Math.round((allPages.length / totalPages) * 100),
      pages: allPages
    });

    // ==========================================
    // Phase 2: Background Batching (Pages 11 to 10,000+)
    // ==========================================
    if (totalPages > initialBatchSize) {
      for (let p = initialBatchSize; p < totalPages; p++) {
        const pageInfo = await extractSinglePage(doc, p, pagesDir, mupdf);
        allPages.push(pageInfo);

        // Update progress every 5 pages or on final page
        if ((p + 1) % 5 === 0 || p === totalPages - 1) {
          const progress = Math.round((allPages.length / totalPages) * 100);
          await queueManager.updateJob(jobId, {
            availablePages: allPages.length,
            progress,
            pages: allPages
          });
        }

        // Yield CPU to ensure web requests stay 100% responsive
        if ((p + 1) % 10 === 0) {
          await new Promise(r => setTimeout(r, 10));
        }
      }
    }

    // Save lightweight manifest.json (< 25 KB)
    const manifest = {
      bookId,
      userId,
      totalPages,
      width: widthMm,
      height: heightMm,
      aspectRatio,
      baseUrl: `/storage/${userId}/books/${bookId}/pages/`,
      pages: allPages
    };

    await fs.promises.writeFile(
      path.join(bookDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    // Sync total pages count and page structures with MongoDB collection 'flipbooks' so MyFlipbooks UI and Editor load all pages
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection && mongoose.connection.db) {
        const formattedDbPages = allPages.map(p => ({
          id: p.pageNumber,
          pageNumber: p.pageNumber,
          name: `Page ${p.pageNumber}`,
          fileName: `${p.pageNumber}.webp`,
          imageUrl: `${manifest.baseUrl}${p.pageNumber}.webp`,
          content: `<div style="position:relative;width:100%;height:100%;"><img src="${manifest.baseUrl}${p.pageNumber}.webp" style="width:100%;height:100%;object-fit:contain;display:block;" alt="Page ${p.pageNumber}" /></div>`,
          html: `<div style="position:relative;width:100%;height:100%;"><img src="${manifest.baseUrl}${p.pageNumber}.webp" style="width:100%;height:100%;object-fit:contain;display:block;" alt="Page ${p.pageNumber}" /></div>`,
          isPlaceholder: false
        }));

        await mongoose.connection.db.collection('flipbooks').updateOne(
          { v_id: bookId },
          { 
            $set: { 
              pages: formattedDbPages,
              pagesCount: totalPages,
              'meta.pages': totalPages,
              'meta.pageCount': totalPages,
              'meta.pagesCount': totalPages
            } 
          }
        );
      }
    } catch (dbErr) {
      console.warn('[documentExtractor] DB update warning:', dbErr);
    }

    await queueManager.updateJob(jobId, {
      status: 'completed',
      stage: 'completed',
      progress: 100,
      pages: allPages,
      manifest
    });

    // Remove uploaded temporary PDF
    await fs.promises.unlink(filePath).catch(() => {});
  } catch (err) {
    console.error(`[Extraction Job ${jobId} Error]:`, err);
    await queueManager.updateJob(jobId, {
      status: 'failed',
      stage: 'error',
      error: err.message || 'Extraction failed'
    });
  } finally {
    queueManager.releaseWorker();
  }
}

queueManager.on('worker:start', (job) => {
  processExtractionJob(job);
});

module.exports = {
  processExtractionJob,
  extractSinglePage
};
