/**
 * DOCX Document to PDF Extractor
 * Uses the native canvas engine from src/documents
 */

import { openCanvasDocument } from '@documents/engine/open-document.js';
import { CanvasEditor } from '@documents/engine/canvas-editor.js';
import { loadCanvasFonts } from '@documents/engine/canvas-text.js';
import { buildPdf, canvasToJpegBytes } from './pdf-builder.js';

function extractPageFragments(lines, pageIndex) {
  const out = [];
  if (!lines) return out;
  for (const line of lines) {
    if (line.page !== pageIndex || line.virtual || line.cellText) continue;
    for (const f of line.fragments || []) {
      if (f.text && !f.image) {
        out.push({
          text: f.text,
          x: f.x,
          baseline: line.baseline,
          width: f.width,
          fontSize: f.fontSize,
        });
      }
    }
  }
  return out;
}

/**
 * Extracts a DOCX file to a searchable PDF and renders page preview canvases.
 * @param {Blob | File | ArrayBuffer} fileInput
 * @param {string} fileName
 * @param {(progress: { percent: number, stage: string }) => void} [onProgress]
 * @returns {Promise<{ pdfBlob: Blob, pdfUrl: string, pages: Array<{ index: number, canvas: HTMLCanvasElement, width: number, height: number, dataUrl: string }>, pageCount: number, title: string }>}
 */
export async function extractDocToPdf(fileInput, fileName = 'document.docx', onProgress = () => {}) {
  const blob = fileInput instanceof Blob ? fileInput : new Blob([fileInput]);
  const title = fileName.replace(/\.[^/.]+$/, '');

  onProgress({ percent: 15, stage: 'Parsing Word document structure...' });

  const { pkg, images } = await openCanvasDocument(blob);
  await loadCanvasFonts();

  onProgress({ percent: 35, stage: 'Preparing canvas layout engine...' });

  // Create an isolated off-screen container for rendering
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.top = '-99999px';
  host.style.left = '-99999px';
  host.style.width = '1000px';
  host.style.height = '1000px';
  host.style.visibility = 'hidden';
  host.style.pointerEvents = 'none';
  document.body.appendChild(host);

  let editor;
  try {
    editor = new CanvasEditor(host, {
      paragraphs: pkg.paragraphs,
      pageSettings: pkg.pageSettings,
      numbering: pkg.numbering,
      styles: pkg.styles,
      tables: pkg.tables,
      pageStories: pkg.pageStories,
      comments: pkg.comments,
      assets: pkg.assets,
      drawingLayouts: pkg.drawingLayouts,
      images,
      readOnly: true,
      inputLabel: 'Document text',
    });

    onProgress({ percent: 50, stage: 'Rendering pages to high-resolution sheets...' });

    await editor.fontRefresh;
    const sheets = editor.printSheets();
    const { layout, storyLayout } = editor.printedLayout || editor;
    const lines = [...(layout?.lines || []), ...(layout?.repeatedLines || []), ...(storyLayout?.lines || [])];

    const pdfPages = [];
    const previewPages = [];

    const total = sheets.length;
    onProgress({ percent: 45, stage: `Found ${total} pages. Processing...`, current: 1, total });

    for (let i = 0; i < total; i++) {
      const canvas = sheets[i];
      const geometry = (layout?.pages && layout.pages[i]) || layout?.page || { width: 816, height: 1056 };

      const percent = Math.round(45 + ((i + 1) / total) * 40);
      onProgress({ percent, stage: `Processing page ${i + 1} of ${total}...`, current: i + 1, total });

      // Yield to event loop so spinner runs smoothly
      await new Promise(r => setTimeout(r, 0));

      const jpegBytes = await canvasToJpegBytes(canvas, 0.92);
      const fragments = extractPageFragments(lines, i);

      pdfPages.push({
        widthPx: geometry.width,
        heightPx: geometry.height,
        jpeg: jpegBytes,
        imageWidth: canvas.width,
        imageHeight: canvas.height,
        fragments,
      });

      const pageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const widthMm = Math.round(geometry.width * (25.4 / 96) * 10) / 10;
      const heightMm = Math.round(geometry.height * (25.4 / 96) * 10) / 10;
      const flattenedSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${widthMm} ${heightMm}" width="100%" height="100%"><g data-name="PDF Background" data-type="pdf-vector-layer" data-locked="true" style="pointer-events: none;"><image href="${pageDataUrl}" width="${widthMm}" height="${heightMm}" preserveAspectRatio="none"/></g><rect data-name="Document Shield" data-type="shield" data-locked="true" x="0" y="0" width="${widthMm}" height="${heightMm}" fill="transparent" pointer-events="all" style="cursor: default;"/></svg>`;

      previewPages.push({
        index: i + 1,
        pageNumber: i + 1,
        pageName: `Page ${i + 1}`,
        canvas,
        width: widthMm,
        height: heightMm,
        dataUrl: pageDataUrl,
        svgString: flattenedSvg,
        content: flattenedSvg,
        isVector: false,
      });
    }

    onProgress({ percent: 90, stage: 'Compiling PDF document...' });

    const pdfBytes = buildPdf(pdfPages, { title, author: 'Puter Extractor' });
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    onProgress({ percent: 100, stage: 'Extraction complete!' });

    return {
      pdfBlob,
      pdfUrl,
      pages: previewPages,
      pageCount: previewPages.length,
      title,
    };
  } finally {
    try {
      editor?.destroy?.();
    } catch (_) {}
    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
    // Clean up decoded image bitmaps
    if (images) {
      for (const img of images.values()) {
        try {
          img.close?.();
        } catch (_) {}
      }
    }
  }
}
