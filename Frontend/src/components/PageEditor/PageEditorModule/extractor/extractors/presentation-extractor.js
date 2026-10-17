/**
 * PPTX Presentation to PDF Extractor
 * Uses the native presentation parser and SVG renderer from src/presentation
 */

import { loadPresentation, getSlides, getSlideSize } from '@presentation-lib/pptx/src/api/index.ts';
import { renderSlideToSvg } from '@presentation-lib/pptx-preview/src/index.ts';
import { buildPdf, canvasToJpegBytes } from './pdf-builder.js';

// Convert EMU (English Metric Units) to Points and Pixels
const EMU_PER_INCH = 914400;
const PT_PER_INCH = 72;
const PX_PER_INCH = 96;

function emuToPt(emu) {
  return (emu / EMU_PER_INCH) * PT_PER_INCH;
}

function emuToPx(emu) {
  return (emu / EMU_PER_INCH) * PX_PER_INCH;
}

/**
 * Render SVG string to a high-DPI canvas
 * @param {string} svgString
 * @param {number} targetWidthPx
 * @param {number} targetHeightPx
 * @param {number} [scale=2]
 * @returns {Promise<HTMLCanvasElement>}
 */
function svgToCanvas(svgString, targetWidthPx, targetHeightPx, scale = 2) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(targetWidthPx * scale));
    canvas.height = Math.max(1, Math.round(targetHeightPx * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to rasterize slide SVG'));
    };

    img.src = url;
  });
}

/**
 * Extracts a PPTX presentation to a multi-page PDF document.
 * @param {Blob | File | ArrayBuffer} fileInput
 * @param {string} fileName
 * @param {(progress: { percent: number, stage: string }) => void} [onProgress]
 * @returns {Promise<{ pdfBlob: Blob, pdfUrl: string, pages: Array<{ index: number, canvas: HTMLCanvasElement, width: number, height: number, dataUrl: string }>, pageCount: number, title: string }>}
 */
export async function extractPresentationToPdf(fileInput, fileName = 'presentation.pptx', onProgress = () => {}) {
  const blob = fileInput instanceof Blob ? fileInput : new Blob([fileInput]);
  const title = fileName.replace(/\.[^/.]+$/, '');

  onProgress({ percent: 15, stage: 'Parsing presentation package...' });

  const pres = await loadPresentation(blob);
  const slides = getSlides(pres);

  if (!slides || slides.length === 0) {
    throw new Error('This presentation contains no slides.');
  }

  const rawSize = getSlideSize(pres) || { width: 9144000, height: 5143500 }; // default 16:9 widescreen
  const widthPt = emuToPt(rawSize.width);
  const heightPt = emuToPt(rawSize.height);
  const widthPx = emuToPx(rawSize.width);
  const heightPx = emuToPx(rawSize.height);

  onProgress({ percent: 30, stage: `Found ${slides.length} slides. Rendering high-DPI canvases...` });

  const pdfPages = [];
  const previewPages = [];
  const total = slides.length;

  for (let i = 0; i < total; i++) {
    const slide = slides[i];
    const percent = Math.round(30 + (i / total) * 55);
    onProgress({ percent, stage: `Rendering slide ${i + 1} of ${total}...` });

    // Render slide to pure vector SVG
    const svgString = renderSlideToSvg(pres, slide, { textLayout: 'svg' });
    const canvas = await svgToCanvas(svgString, widthPx, heightPx, 1.25);
    const jpegBytes = await canvasToJpegBytes(canvas, 0.88);

    pdfPages.push({
      widthPx,
      heightPx,
      jpeg: jpegBytes,
      imageWidth: canvas.width,
      imageHeight: canvas.height,
      fragments: [],
    });

    const ptToMm = 25.4 / 72;
    const widthMm = Math.round(widthPt * ptToMm * 10) / 10;
    const heightMm = Math.round(heightPt * ptToMm * 10) / 10;

    previewPages.push({
      index: i + 1,
      pageNumber: i + 1,
      pageName: `Page ${i + 1}`,
      width: widthMm,
      height: heightMm,
      svgString,
      content: svgString,
      dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`,
      isVector: true,
    });
  }

  onProgress({ percent: 90, stage: 'Assembling PDF slide deck...' });

  const pdfBytes = buildPdf(pdfPages, { title, author: 'Puter Extractor' });
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(pdfBlob);

  onProgress({ percent: 100, stage: 'Presentation extracted to PDF!' });

  return {
    pdfBlob,
    pdfUrl,
    pages: previewPages,
    pageCount: previewPages.length,
    title,
  };
}
