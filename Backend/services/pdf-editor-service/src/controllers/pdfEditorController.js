const fs = require('fs');
const path = require('path');
const os = require('os');
const { nanoid } = require('nanoid');
const { PDFDocument } = require('pdf-lib');
const AdmZip = require('adm-zip');

const {
  convertPdfWithInkscape,
  checkInkscapeVersion,
  exportSvgsToVectorPdf
} = require('../utils/inkscapeConverter');

const {
  convertOfficeToPdf,
  isOfficeDocument,
  checkLibreOfficeStatus
} = require('../utils/documentConverter');

/**
 * GET /api/pdf-editor/inkscape-status
 * GET /api/flipbook/inkscape-status
 * GET /api/flipbook/check-inkscape
 */
exports.getInkscapeStatus = async (req, res) => {
  try {
    const status = await checkInkscapeVersion();
    return res.json(status);
  } catch (err) {
    return res.status(500).json({ available: false, error: err.message });
  }
};

/**
 * GET /api/pdf-editor/office-status
 * GET /api/flipbook/office-status
 * GET /api/flipbook/check-libreoffice
 */
exports.getOfficeStatus = async (req, res) => {
  try {
    const status = await checkLibreOfficeStatus();
    return res.json(status);
  } catch (err) {
    return res.status(500).json({ available: false, error: err.message });
  }
};

/**
 * POST /api/flipbook/convert-office-to-pdf
 * POST /api/pdf-editor/convert-office-to-pdf
 */
exports.convertOfficeToPdfHandler = async (req, res) => {
  const file = req.file || (req.files && req.files[0]);
  if (!file) {
    return res.status(400).json({ success: false, message: 'No document file uploaded' });
  }

  const tempDocPath = file.path;
  const tempPdfPath = path.join(
    path.dirname(tempDocPath),
    `converted_${nanoid(8)}.pdf`
  );

  try {
    const officeStatus = await checkLibreOfficeStatus();
    if (!officeStatus.available) {
      return res.status(400).json({
        success: false,
        message: 'Server-side LibreOffice has been decommissioned. Modern Word (.docx) and PowerPoint (.pptx) documents are converted directly in the browser via client-side canvas engine.'
      });
    }

    await convertOfficeToPdf(tempDocPath, tempPdfPath);

    if (!fs.existsSync(tempPdfPath) || fs.statSync(tempPdfPath).size === 0) {
      throw new Error('Conversion failed: Output PDF is empty');
    }

    const origName = (file.originalname || 'document').replace(/\.[^/.]+$/, '') + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(origName)}"`);

    const readStream = fs.createReadStream(tempPdfPath);
    readStream.pipe(res);

    readStream.on('close', () => {
      if (fs.existsSync(tempPdfPath)) {
        try { fs.unlinkSync(tempPdfPath); } catch (e) {}
      }
    });
  } catch (convErr) {
    console.error('[PDF Editor Service] Document to PDF conversion error:', convErr);
    if (fs.existsSync(tempPdfPath)) {
      try { fs.unlinkSync(tempPdfPath); } catch (e) {}
    }
    const rawMsg = convErr.message || '';
    const isCorrupt = /corrupt|cannot be read|not be loaded|damaged|password|format error|failed to parse|could not be opened|command failed/i.test(rawMsg);
    return res.status(400).json({
      success: false,
      isCorrupted: isCorrupt,
      message: isCorrupt
        ? (rawMsg.includes('is corrupted') ? rawMsg : `Your file "${file.originalname}" is corrupted, unreadable, or password-protected. Please check your document in PowerPoint/Word and try again.`)
        : (rawMsg || 'Failed to convert document to PDF')
    });
  } finally {
    if (fs.existsSync(tempDocPath)) {
      try { fs.unlinkSync(tempDocPath); } catch (e) {}
    }
  }
};

/**
 * POST /api/flipbook/inspect-document
 * POST /api/pdf-editor/inspect-document
 */
exports.inspectDocumentHandler = async (req, res) => {
  const file = req.file || (req.files && req.files[0]);
  if (!file) {
    return res.status(400).json({ success: false, message: 'No document file uploaded' });
  }

  const tempPath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();
  let tempPdfPath = null;

  try {
    let targetPdfPath = tempPath;

    // 1. Fast-path: for PPTX, count slide XML files inside the zip directly in memory (~5ms)
    if (ext === '.pptx') {
      try {
        const zip = new AdmZip(tempPath);
        const zipEntries = zip.getEntries();
        const slideEntries = zipEntries.filter((e) => /^ppt\/slides\/slide\d+\.xml$/i.test(e.entryName));
        if (slideEntries.length > 0) {
          let width = 297, height = 167;
          const presEntry = zip.getEntry('ppt/presentation.xml');
          if (presEntry) {
            const presXml = presEntry.getData().toString('utf8');
            const cxMatch = presXml.match(/<[a-z0-9:]*sldSz[^>]*cx=["'](\d+)["']/i);
            const cyMatch = presXml.match(/<[a-z0-9:]*sldSz[^>]*cy=["'](\d+)["']/i);
            if (cxMatch && cyMatch) {
              const cx = parseInt(cxMatch[1], 10);
              const cy = parseInt(cyMatch[1], 10);
              if (cx > 0 && cy > 0) {
                width = Math.round((cx / 36000) * 10) / 10;
                height = Math.round((cy / 36000) * 10) / 10;
              }
            }
          }
          return res.json({
            success: true,
            count: slideEntries.length,
            width,
            height,
            isUniform: true,
            pages: Array.from({ length: slideEntries.length }, (_, i) => ({
              pageNumber: i + 1,
              width,
              height
            }))
          });
        }
      } catch (zipErr) {
        console.warn('[PDF Editor Service] Fast PPTX inspection failed, falling back to LibreOffice:', zipErr.message);
      }
    }

    // 1b. Fast-path: for DOCX, extract page count and dimensions directly in memory (~5ms)
    if (ext === '.docx') {
      try {
        const zip = new AdmZip(tempPath);
        let count = 1;
        let width = 210, height = 297;

        const appEntry = zip.getEntry('docProps/app.xml');
        if (appEntry) {
          const appXml = appEntry.getData().toString('utf8');
          const m = appXml.match(/<Pages>(\d+)<\/Pages>/i);
          if (m && parseInt(m[1], 10) > 0) count = parseInt(m[1], 10);
        }

        const docEntry = zip.getEntry('word/document.xml');
        if (docEntry) {
          const docXml = docEntry.getData().toString('utf8');
          const breaks = docXml.match(/<w:lastRenderedPageBreak\b|<w:br[^>]*w:type=["']page["']/gi);
          if (breaks && breaks.length + 1 > count) count = breaks.length + 1;

          const pgSzMatch = docXml.match(/<w:pgSz[^>]*w:w=["'](\d+)["'][^>]*w:h=["'](\d+)["']/i) ||
                            docXml.match(/<w:pgSz[^>]*w:h=["'](\d+)["'][^>]*w:w=["'](\d+)["']/i);
          if (pgSzMatch) {
            const isLandscape = /w:orient=["']landscape["']/i.test(pgSzMatch[0]);
            let wMm = Math.round((parseInt(pgSzMatch[1], 10) / 56.6929) * 10) / 10;
            let hMm = Math.round((parseInt(pgSzMatch[2], 10) / 56.6929) * 10) / 10;
            if (isLandscape && wMm < hMm) {
              const tmp = wMm; wMm = hMm; hMm = tmp;
            }
            width = wMm;
            height = hMm;
          }
        }

        return res.json({
          success: true,
          count,
          width,
          height,
          isUniform: true,
          pages: Array.from({ length: count }, (_, i) => ({
            pageNumber: i + 1,
            width,
            height
          }))
        });
      } catch (docxZipErr) {
        console.warn('[PDF Editor Service] Fast DOCX inspection failed, falling back to LibreOffice:', docxZipErr.message);
      }
    }

    // 2. If it is an Office document (.doc, .docx, .ppt), convert to PDF first via LibreOffice
    if (isOfficeDocument(file.originalname)) {
      tempPdfPath = path.join(path.dirname(tempPath), `inspect_${nanoid(8)}.pdf`);
      await convertOfficeToPdf(tempPath, tempPdfPath);
      targetPdfPath = tempPdfPath;
    }

    // 3. Verify PDF exists and has content
    if (!fs.existsSync(targetPdfPath) || fs.statSync(targetPdfPath).size === 0) {
      throw new Error('Unable to parse document: output PDF was empty');
    }

    // 4. Read PDF using pdf-lib for exact page count & dimensions
    const pdfBytes = fs.readFileSync(targetPdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const count = pdfDoc.getPageCount();
    const pages = [];
    const ptToMm = 25.4 / 72;

    for (let i = 0; i < count; i++) {
      const page = pdfDoc.getPage(i);
      const { width: widthPt, height: heightPt } = page.getSize();
      const rotation = page.getRotation().angle;
      const isRotated = rotation === 90 || rotation === 270;
      const finalWidthPt = isRotated ? heightPt : widthPt;
      const finalHeightPt = isRotated ? widthPt : heightPt;
      const widthMm = Math.round(finalWidthPt * ptToMm * 10) / 10;
      const heightMm = Math.round(finalHeightPt * ptToMm * 10) / 10;
      pages.push({
        pageNumber: i + 1,
        width: widthMm,
        height: heightMm
      });
    }

    const firstPage = pages[0] || { width: 210, height: 297 };
    const isUniform = pages.every(
      (p) => Math.abs(p.width - firstPage.width) < 1 && Math.abs(p.height - firstPage.height) < 1
    );

    return res.json({
      success: true,
      count,
      width: firstPage.width,
      height: firstPage.height,
      isUniform,
      pages
    });
  } catch (inspectErr) {
    console.error('[PDF Editor Service] Document inspection error:', inspectErr);
    const rawMsg = inspectErr.message || '';
    const isCorrupt = /corrupt|cannot be read|not be loaded|damaged|password|format error|failed to parse|invalid pdf|syntax error|unexpected end|end-of-file|could not be opened|command failed/i.test(rawMsg);
    return res.status(400).json({
      success: false,
      isCorrupted: isCorrupt,
      message: isCorrupt
        ? (rawMsg.includes('is corrupted') ? rawMsg : `Your file "${file.originalname}" is corrupted, unreadable, or password-protected. Please check your document and try again.`)
        : (rawMsg || 'Failed to inspect document')
    });
  } finally {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (e) {}
    }
    if (tempPdfPath && fs.existsSync(tempPdfPath)) {
      try { fs.unlinkSync(tempPdfPath); } catch (e) {}
    }
  }
};

/**
 * POST /api/flipbook/convert-pdf-inkscape
 * POST /api/pdf-editor/convert-pdf-inkscape
 * Legacy endpoint maintained for backwards-compatibility:
 * Office docs (.doc, .docx, .ppt, .pptx) are converted via LibreOffice.
 * PDF page counts & dimensions are extracted using pdf-lib.
 * Actual vector rendering is handled by MuPDF in the client.
 */
exports.convertPdfInkscapeHandler = async (req, res) => {
  let files = req.files || (req.file ? [req.file] : []);
  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: 'No PDF or document file uploaded' });
  }

  // Deduplicate files
  const seenFiles = new Set();
  files = files.filter((f) => {
    const key = `${f.originalname}_${f.size}`;
    if (seenFiles.has(key)) {
      if (fs.existsSync(f.path)) {
        try { fs.unlinkSync(f.path); } catch (e) {}
      }
      return false;
    }
    seenFiles.add(key);
    return true;
  });

  const tempFilePaths = files.map((f) => f.path);
  const intermediatePdfs = [];

  try {
    // If any file is a Word or PowerPoint document, convert it to PDF via LibreOffice
    const processedPdfPaths = [];
    for (const p of tempFilePaths) {
      if (isOfficeDocument(p)) {
        const outPdf = path.join(path.dirname(p), `doc_to_pdf_${nanoid(8)}.pdf`);
        await convertOfficeToPdf(p, outPdf);
        processedPdfPaths.push(outPdf);
        intermediatePdfs.push(outPdf);
      } else {
        processedPdfPaths.push(p);
      }
    }

    const maxPages = req.body.maxPages ? parseInt(req.body.maxPages, 10) : Infinity;

    // If Inkscape CLI is available on the machine (e.g., Docker container or installed locally), use it
    const inkscapeStatus = await checkInkscapeVersion();
    if (inkscapeStatus.available) {
      console.log('[PDF Editor Service] Executing Inkscape CLI vector conversion...');
      const result = await convertPdfWithInkscape(processedPdfPaths, { maxPages });
      return res.json({
        success: true,
        engine: 'inkscape',
        pages: result.pages,
        width: result.width,
        height: result.height,
        isUniform: result.isUniform,
        totalPages: result.totalPages
      });
    }

    console.log('[PDF Editor Service] Inkscape CLI not present on host; intimating client to use pure vector MuPDF engine.');
    return res.status(503).json({
      success: false,
      engine: 'none',
      message: 'Inkscape CLI not present on host; client-side vector extraction will be used.'
    });
  } catch (conversionErr) {
    console.error('[PDF Editor Service] Document conversion error:', conversionErr);
    const rawMsg = conversionErr.message || '';
    const isCorrupt = /corrupt|cannot be read|not be loaded|damaged|password|format error|failed to parse|invalid pdf|syntax error|unexpected end|end-of-file|could not be opened|command failed/i.test(rawMsg);
    const firstFileName = files[0]?.originalname ? ` "${files[0].originalname}"` : '';
    return res.status(400).json({
      success: false,
      isCorrupted: isCorrupt,
      message: isCorrupt
        ? (rawMsg.includes('is corrupted') ? rawMsg : `Your file${firstFileName} is corrupted, unreadable, or password-protected. Please check your document and try again.`)
        : (rawMsg || 'Failed to process document')
    });
  } finally {
    tempFilePaths.forEach((p) => {
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (e) {}
      }
    });
    intermediatePdfs.forEach((p) => {
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (e) {}
      }
    });
  }
};

/**
 * POST /api/flipbook/export-vector-pdf
 * POST /api/pdf-editor/export-vector-pdf
 */
exports.exportVectorPdfHandler = async (req, res) => {
  try {
    const { pages, bookName } = req.body;
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({ success: false, message: 'No SVG pages provided for PDF export' });
    }

    const inkscapeStatus = await checkInkscapeVersion();
    if (!inkscapeStatus.available) {
      return res.status(501).json({
        success: false,
        message: 'Inkscape is not available on the host. Please use client-side PDF export.'
      });
    }

    const sanitizedBookName = (bookName || 'flipbook').replace(/[^a-zA-Z0-9_-]/g, '_');
    console.log(`[PDF Editor Service] Generating true vector PDF export for "${sanitizedBookName}" (${pages.length} pages)...`);

    const pdfBuffer = await exportSvgsToVectorPdf(pages, { bookName: sanitizedBookName });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedBookName}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (err) {
    console.error('[PDF Editor Service] Vector PDF export error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to export vector PDF' });
  }
};
