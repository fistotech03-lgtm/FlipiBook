/**
 * officeExtractor.js
 * In-browser Office to PDF conversion engine (Client-Side).
 * 
 * Provides:
 * 1. Ultra-fast, zero-server client-side conversion of modern Word (.docx)
 *    and PowerPoint (.pptx) documents directly to PDF in the browser.
 * 2. Instant detection of legacy binary 97-2003 formats (.doc, .ppt, OLE2 signature)
 *    so the user is politely intimated with a direct converter link.
 */

let engineLoadPromise = null;

/**
 * Checks if a given file or filename is an Office document (.docx, .doc, .pptx, .ppt).
 * @param {string|File} fileOrName 
 * @returns {boolean}
 */
export const isOfficeDocument = (fileOrName) => {
  const name = typeof fileOrName === 'string' ? fileOrName : (fileOrName?.name || '');
  const lower = name.toLowerCase();
  return (
    lower.endsWith('.docx') ||
    lower.endsWith('.doc') ||
    lower.endsWith('.pptx') ||
    lower.endsWith('.ppt')
  );
};

/**
 * Checks whether an Office document is a modern XML format (.docx or .pptx).
 * @param {string|File} fileOrName 
 * @returns {boolean}
 */
export const isModernOfficeDocument = (fileOrName) => {
  const name = typeof fileOrName === 'string' ? fileOrName : (fileOrName?.name || '');
  const lower = name.toLowerCase();
  return lower.endsWith('.docx') || lower.endsWith('.pptx');
};

/**
 * Detects whether a file is a legacy Microsoft Office 97-2003 binary format (.doc, .ppt, or OLE2 binary header).
 * @param {File|Blob} file 
 * @returns {Promise<{ isLegacy: boolean, type: 'doc' | 'ppt' | null, ext: string }>}
 */
export const checkIsLegacyOfficeDocument = async (file) => {
  if (!file) return { isLegacy: false, type: null, ext: '' };

  const name = (file.name || '').toLowerCase();
  const isDocExt = name.endsWith('.doc') && !name.endsWith('.docx');
  const isPptExt = name.endsWith('.ppt') && !name.endsWith('.pptx');

  if (isDocExt) {
    return { isLegacy: true, type: 'doc', ext: '.doc' };
  }
  if (isPptExt) {
    return { isLegacy: true, type: 'ppt', ext: '.ppt' };
  }

  // Deep header inspection for OLE2 binary stream (0xD0, 0xCF, 0x11, 0xE0)
  try {
    const slice = file.slice(0, 8);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) {
      // It is an OLE2 legacy binary container
      const type = name.includes('ppt') ? 'ppt' : 'doc';
      return { isLegacy: true, type, ext: type === 'ppt' ? '.ppt' : '.doc' };
    }
  } catch (err) {
    console.warn('[OfficeExtractor] Header inspection error:', err);
  }

  return { isLegacy: false, type: null, ext: '' };
};

/**
 * Returns a direct free converter URL (CloudConvert) for legacy formats.
 * @param {'doc' | 'ppt' | string} typeOrExt 
 * @returns {string}
 */
export const getLegacyConverterUrl = (typeOrExt) => {
  const lower = String(typeOrExt).toLowerCase();
  if (lower.includes('ppt')) {
    return 'https://cloudconvert.com/ppt-to-pptx';
  }
  return 'https://cloudconvert.com/doc-to-docx';
};

/**
 * Lazily loads the client-side extractor bundle into the browser document.
 * @returns {Promise<void>}
 */
export const loadExtractorEngine = () => {
  if (typeof window !== 'undefined' && window.extractDocToPdf && window.extractPresentationToPdf) {
    return Promise.resolve();
  }

  if (engineLoadPromise) {
    return engineLoadPromise;
  }

  engineLoadPromise = new Promise((resolve, reject) => {
    try {
      const existing = document.querySelector('script[data-office-engine="true"]');
      if (existing) {
        if (window.extractDocToPdf && window.extractPresentationToPdf) {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(new Error('Failed to load engine script: ' + e.message)));
        return;
      }

      const script = document.createElement('script');
      script.type = 'module';
      script.src = '/extractor/engine.js';
      script.setAttribute('data-office-engine', 'true');

      script.onload = () => {
        // Allow microtask cycle for module exports to bind to window
        setTimeout(() => {
          if (window.extractDocToPdf || window.extractPresentationToPdf) {
            resolve();
          } else {
            resolve();
          }
        }, 100);
      };

      script.onerror = (err) => {
        engineLoadPromise = null;
        reject(new Error(`Failed to load in-browser office conversion engine from /extractor/engine.js: ${err?.message || 'Network error'}`));
      };

      document.head.appendChild(script);
    } catch (e) {
      engineLoadPromise = null;
      reject(e);
    }
  });

  return engineLoadPromise;
};

/**
 * Extracts a modern Office document (.docx, .pptx) into a standard PDF File object entirely client-side.
 * 
 * @param {File} file - Incoming .docx or .pptx File
 * @param {(progress: { percent: number, stage: string }) => void} [onProgress]
 * @returns {Promise<File>} - Converted PDF File object ready for flipbook creation or page editing
 */
export const extractOfficeDocumentToPdf = async (file, onProgress = () => {}) => {
  if (!file) throw new Error('No document provided for extraction.');

  // Check legacy format first
  const legacyCheck = await checkIsLegacyOfficeDocument(file);
  if (legacyCheck.isLegacy) {
    const error = new Error(`Legacy ${legacyCheck.type === 'ppt' ? 'PowerPoint (.ppt)' : 'Word (.doc)'} format detected. Please convert to modern .${legacyCheck.type === 'ppt' ? 'pptx' : 'docx'} format.`);
    error.isLegacyFormat = true;
    error.legacyType = legacyCheck.type;
    error.converterUrl = getLegacyConverterUrl(legacyCheck.type);
    throw error;
  }

  onProgress({ percent: 5, stage: 'Initializing in-browser document engine...' });
  await loadExtractorEngine();

  const name = file.name || 'document.docx';
  const lower = name.toLowerCase();
  const isPpt = lower.endsWith('.pptx');

  if (isPpt) {
    if (!window.extractPresentationToPdf) {
      throw new Error('Presentation extraction engine is not available.');
    }
    onProgress({ percent: 15, stage: 'Extracting PowerPoint presentation...' });
    const result = await window.extractPresentationToPdf(file, name, onProgress);
    const pdfName = name.replace(/\.[^/.]+$/, '') + '.pdf';
    const pdfFile = new File([result.pdfBlob], pdfName, { type: 'application/pdf' });
    pdfFile.pagesData = result.pages;
    pdfFile.pageCount = result.pageCount;
    return pdfFile;
  }

  // Word (.docx)
  if (!window.extractDocToPdf) {
    throw new Error('Word document extraction engine is not available.');
  }
  onProgress({ percent: 15, stage: 'Extracting Word document...' });
  const result = await window.extractDocToPdf(file, name, onProgress);
  const pdfName = name.replace(/\.[^/.]+$/, '') + '.pdf';
  const pdfFile = new File([result.pdfBlob], pdfName, { type: 'application/pdf' });
  pdfFile.pagesData = result.pages;
  pdfFile.pageCount = result.pageCount;
  return pdfFile;
};
