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

  const pdfPages = [];
  const previewPages = [];
  const total = slides.length;

  onProgress({ percent: 20, stage: `Found ${total} slides. Reading slides...`, current: 1, total });

  for (let i = 0; i < total; i++) {
    const slide = slides[i];
    const percent = Math.round(20 + ((i + 1) / total) * 60);
    onProgress({ percent, stage: `Reading slide ${i + 1} of ${total}...`, current: i + 1, total });

    // Yield to event loop every slide so the UI and GPU spinner stay completely smooth without stutter
    await new Promise(r => setTimeout(r, 0));

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

    let normalizedSvg = svgString;
    if (normalizedSvg && typeof normalizedSvg === 'string') {
      normalizedSvg = normalizedSvg.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
        let newAttrs = attrs;
        const wMatch = attrs.match(/\bwidth=["']([^"']*)["']/i);
        const hMatch = attrs.match(/\bheight=["']([^"']*)["']/i);
        const vbMatch = attrs.match(/\bviewBox=["']([^"']*)["']/i);
        if (!vbMatch && wMatch && hMatch && !wMatch[1].includes('%') && !hMatch[1].includes('%')) {
          const nw = parseFloat(wMatch[1]);
          const nh = parseFloat(hMatch[1]);
          if (!isNaN(nw) && !isNaN(nh)) {
            newAttrs += ` viewBox="0 0 ${nw} ${nh}"`;
          }
        }
        if (/\bwidth=["'][^"']*["']/i.test(newAttrs)) {
          newAttrs = newAttrs.replace(/\bwidth=["'][^"']*["']/i, 'width="100%"');
        } else {
          newAttrs += ' width="100%"';
        }
        if (/\bheight=["'][^"']*["']/i.test(newAttrs)) {
          newAttrs = newAttrs.replace(/\bheight=["'][^"']*["']/i, 'height="100%"');
        } else {
          newAttrs += ' height="100%"';
        }
        return `<svg${newAttrs}>`;
      });
    }

    const pageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const flattenedSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${widthMm} ${heightMm}" width="100%" height="100%"><g data-name="PDF Background" data-type="pdf-vector-layer" data-locked="true" style="pointer-events: none;"><image href="${pageDataUrl}" width="${widthMm}" height="${heightMm}" preserveAspectRatio="none"/></g><rect data-name="Document Shield" data-type="shield" data-locked="true" x="0" y="0" width="${widthMm}" height="${heightMm}" fill="transparent" pointer-events="all" style="cursor: default;"/></svg>`;

    previewPages.push({
      index: i + 1,
      pageNumber: i + 1,
      pageName: `Page ${i + 1}`,
      width: widthMm,
      height: heightMm,
      svgString: flattenedSvg,
      content: flattenedSvg,
      dataUrl: pageDataUrl,
      canvas,
      isVector: false,
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
