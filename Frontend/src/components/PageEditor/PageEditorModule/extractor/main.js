import './style.css';
import { extractDocToPdf } from './extractors/doc-extractor.js';
import { extractPresentationToPdf } from './extractors/presentation-extractor.js';
import { createSampleDocx, createSamplePptx } from './extractors/samples.js';

const app = document.getElementById('app');

app.innerHTML = `
  <header class="app-header">
    <a href="#" class="brand">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M9 15l3 3 3-3"></path>
          <path d="M12 12v6"></path>
        </svg>
      </div>
      <span class="brand-title">Puter Extractor</span>
    </a>
    <div class="header-badges">
      <div class="badge-pill active">
        <span>⚡ Client-Side PDF Engine</span>
      </div>
    </div>
  </header>

  <main class="main-content">
    <section class="hero-section">
      <div class="hero-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        Universal Document & Presentation Converter
      </div>
      <h1 class="hero-title">
        Extract <span class="gradient-text">DOCX & PPTX</span> directly into PDF
      </h1>
      <p class="hero-subtitle">
        Upload your Microsoft Word documents or PowerPoint presentations. Our high-fidelity canvas engine converts them into clean, searchable PDF files entirely in your browser.
      </p>
    </section>

    <!-- Common Upload Box -->
    <div class="upload-card" id="upload-card">
      <div class="dropzone-border" id="dropzone">
        <input type="file" id="file-input" accept=".docx,.doc,.pptx,.ppt" style="display: none;" />
        <div class="upload-icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <h2 class="dropzone-title">Drop your document or presentation here</h2>
        <p class="dropzone-desc">Drag & drop your file or click the button below</p>
        
        <div class="format-tags">
          <span class="format-tag doc">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Word (.docx, .doc)
          </span>
          <span class="format-tag ppt">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            Presentation (.pptx, .ppt)
          </span>
          <span class="format-tag pdf">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export to PDF
          </span>
        </div>

        <button type="button" class="btn-browse" id="btn-browse">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Choose File
        </button>
      </div>

      <div class="samples-bar">
        <span class="samples-label">Or test immediately:</span>
        <button type="button" class="sample-chip" id="btn-sample-doc">
          <span>📄</span> Sample Word Doc
        </button>
        <button type="button" class="sample-chip" id="btn-sample-ppt">
          <span>📊</span> Sample Presentation
        </button>
      </div>

      <!-- Live Progress Bar -->
      <div class="progress-container" id="progress-container">
        <div class="progress-header">
          <span class="progress-stage" id="progress-stage">
            <svg class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
            Processing...
          </span>
          <span class="progress-percent" id="progress-percent">0%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" id="progress-bar"></div>
        </div>
      </div>

      <!-- Error Banner -->
      <div class="error-banner" id="error-banner"></div>
    </div>

    <!-- Extraction Result Section -->
    <section class="result-section" id="result-section">
      <div class="result-card">
        <div class="file-info">
          <div class="file-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <circle cx="12" cy="14" r="3"></circle>
            </svg>
          </div>
          <div class="file-details">
            <h3 id="res-title">document.pdf</h3>
            <div class="file-meta">
              <span id="res-type-badge">PDF Document</span>
              <span class="meta-dot"></span>
              <span id="res-page-count">0 pages</span>
              <span class="meta-dot"></span>
              <span id="res-file-size">0 KB</span>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <a id="btn-download" class="btn-primary" download="extracted.pdf">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download PDF
          </a>
          <a id="btn-preview-tab" class="btn-secondary" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Open in Tab
          </a>
          <button type="button" class="btn-secondary" id="btn-reset">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Convert Another
          </button>
        </div>
      </div>

      <!-- Preview Gallery -->
      <div class="preview-gallery">
        <div class="gallery-header">
          <h2 class="gallery-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            Extracted Sheets Preview
          </h2>
          <span style="font-size: 13px; color: var(--text-muted);" id="gallery-subtitle">Click any page to enlarge</span>
        </div>
        <div class="pages-grid" id="pages-grid"></div>
      </div>
    </section>
  </main>

  <!-- Modal Viewer for enlarged page -->
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <strong id="modal-title">Page Preview</strong>
        <button type="button" class="btn-close" id="btn-close-modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <img id="modal-img" class="modal-img" src="" alt="Enlarged page preview" />
      </div>
    </div>
  </div>

  <footer class="app-footer">
    <span>Puter Extractor · Open source Document & Presentation Engine · Runs entirely in your browser</span>
  </footer>
`;

// Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const btnBrowse = document.getElementById('btn-browse');
const btnSampleDoc = document.getElementById('btn-sample-doc');
const btnSamplePpt = document.getElementById('btn-sample-ppt');
const progressContainer = document.getElementById('progress-container');
const progressStage = document.getElementById('progress-stage');
const progressPercent = document.getElementById('progress-percent');
const progressBar = document.getElementById('progress-bar');
const errorBanner = document.getElementById('error-banner');
const resultSection = document.getElementById('result-section');
const uploadCard = document.getElementById('upload-card');
const resTitle = document.getElementById('res-title');
const resTypeBadge = document.getElementById('res-type-badge');
const resPageCount = document.getElementById('res-page-count');
const resFileSize = document.getElementById('res-file-size');
const btnDownload = document.getElementById('btn-download');
const btnPreviewTab = document.getElementById('btn-preview-tab');
const btnReset = document.getElementById('btn-reset');
const pagesGrid = document.getElementById('pages-grid');
const modalOverlay = document.getElementById('modal-overlay');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const btnCloseModal = document.getElementById('btn-close-modal');

let currentPdfUrl = null;

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateProgress({ percent, stage }) {
  progressContainer.style.display = 'block';
  progressBar.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
  progressStage.innerHTML = `
    <svg style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
    ${stage}
  `;
}

function showError(message) {
  progressContainer.style.display = 'none';
  errorBanner.style.display = 'block';
  errorBanner.textContent = message;
}

function clearError() {
  errorBanner.style.display = 'none';
  errorBanner.textContent = '';
}

async function processFile(file, name) {
  clearError();
  const fileName = name || file.name || 'document';
  const lowerName = fileName.toLowerCase();

  const isDoc = lowerName.endsWith('.docx') || lowerName.endsWith('.doc');
  const isPpt = lowerName.endsWith('.pptx') || lowerName.endsWith('.ppt');

  if (!isDoc && !isPpt) {
    showError('Unsupported file type. Please upload a Word document (.docx, .doc) or Presentation (.pptx, .ppt).');
    return;
  }

  // Check for legacy OLE2/CFBF binary format (Word 97-2003 .doc or PPT 97-2003 .ppt)
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) {
      showError('This file is in legacy binary format (Word 97-2003 .doc or PowerPoint 97-2003 .ppt). Please save or convert the file to modern XML format (.docx or .pptx) for full layout fidelity.');
      return;
    }
  } catch (_) {}

  try {
    let result;
    if (isDoc) {
      result = await extractDocToPdf(file, fileName, updateProgress);
    } else {
      result = await extractPresentationToPdf(file, fileName, updateProgress);
    }

    displayResult(result, isDoc ? 'Word Document' : 'Presentation');
  } catch (err) {
    console.error('Extraction error:', err);
    showError(`Extraction failed: ${err.message || 'The file could not be parsed.'}`);
  }
}

function displayResult(result, typeName) {
  progressContainer.style.display = 'none';
  uploadCard.style.display = 'none';
  resultSection.style.display = 'flex';

  if (currentPdfUrl) {
    URL.revokeObjectURL(currentPdfUrl);
  }
  currentPdfUrl = result.pdfUrl;

  const pdfFileName = `${result.title}.pdf`;
  resTitle.textContent = pdfFileName;
  resTypeBadge.textContent = `${typeName} → PDF`;
  resPageCount.textContent = `${result.pageCount} ${result.pageCount === 1 ? 'page' : 'pages'}`;
  resFileSize.textContent = formatBytes(result.pdfBlob.size);

  btnDownload.href = result.pdfUrl;
  btnDownload.download = pdfFileName;
  btnPreviewTab.href = result.pdfUrl;

  // Render Thumbnails
  pagesGrid.innerHTML = '';
  const isLandscape = result.pages[0] && result.pages[0].width > result.pages[0].height;

  result.pages.forEach((page) => {
    const card = document.createElement('div');
    card.className = 'page-card';
    card.innerHTML = `
      <div class="page-thumb-wrapper ${isLandscape ? 'landscape' : ''}">
        <img class="page-thumb-img" src="${page.dataUrl}" alt="Page ${page.index}" loading="lazy" />
      </div>
      <div class="page-footer">
        <span>${isLandscape ? 'Slide' : 'Page'} ${page.index}</span>
        <span>${Math.round(page.width)} × ${Math.round(page.height)}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      openModal(page.dataUrl, `${isLandscape ? 'Slide' : 'Page'} ${page.index}`);
    });

    pagesGrid.appendChild(card);
  });
}

function openModal(imgSrc, title) {
  modalImg.src = imgSrc;
  modalTitle.textContent = title;
  modalOverlay.style.display = 'flex';
}

function closeModal() {
  modalOverlay.style.display = 'none';
  modalImg.src = '';
}

// Reset UI
btnReset.addEventListener('click', () => {
  resultSection.style.display = 'none';
  uploadCard.style.display = 'block';
  progressContainer.style.display = 'none';
  clearError();
  fileInput.value = '';
});

// Modal Events
btnCloseModal.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Dropzone Events
btnBrowse.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

dropzone.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    processFile(file, file.name);
  }
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add('drag-over');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('drag-over');
  });
});

dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file) {
    processFile(file, file.name);
  }
});

// Sample Buttons
btnSampleDoc.addEventListener('click', async (e) => {
  e.stopPropagation();
  clearError();
  updateProgress({ percent: 10, stage: 'Generating sample Word document...' });
  try {
    const docBlob = createSampleDocx();
    await processFile(docBlob, 'Sample_Executive_Summary.docx');
  } catch (err) {
    showError(`Sample generation failed: ${err.message}`);
  }
});

btnSamplePpt.addEventListener('click', async (e) => {
  e.stopPropagation();
  clearError();
  updateProgress({ percent: 10, stage: 'Generating sample presentation...' });
  try {
    const pptBlob = await createSamplePptx();
    await processFile(pptBlob, 'Sample_Strategy_Deck.pptx');
  } catch (err) {
    showError(`Sample presentation generation failed: ${err.message}`);
  }
});

// Keyframe for spinner
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(spinStyle);
