/**
 * pageBuilder.worker.js
 *
 * Web Worker for CPU-heavy page-building operations.
 * Runs in a SEPARATE OS THREAD — the main thread (UI) stays free.
 *
 * Tasks offloaded here:
 *   1. cleanStaticHtml()   — DOMParser + SVG attribute manipulation
 *   2. buildPageDoc()      — Full HTML document string generation
 *   3. sanitizePageHtml()  — iframe/SVG attribute cleanup
 *
 * Message API:
 *   IN  → { id, type: 'buildDoc',   rawHtml, pageNum, backendUrl }
 *   IN  → { id, type: 'cleanHtml',  rawHtml }
 *   OUT ← { id, type: 'buildDoc',   srcdoc, cleanedHtml }
 *   OUT ← { id, type: 'cleanHtml',  cleanedHtml }
 *   OUT ← { id, type: 'error',      message }
 *
 * Usage in FlipBookEngine:
 *   const worker = new Worker(new URL('../workers/pageBuilder.worker.js', import.meta.url), { type: 'module' });
 *   worker.postMessage({ id: 'p5', type: 'buildDoc', rawHtml: page.html, pageNum: 5, backendUrl: BACKEND_URL });
 *   worker.onmessage = ({ data }) => { if (data.id === 'p5') iframe.srcdoc = data.srcdoc; };
 */

/* ── cleanStaticHtml ─────────────────────────────────────────────────────── */

const staticHtmlCache = new Map();

function cleanStaticHtml(html) {
  if (!html) return '';
  if (staticHtmlCache.has(html)) return staticHtmlCache.get(html);
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const rootSvg = doc.querySelector('svg');
    if (rootSvg) {
      const w  = rootSvg.getAttribute('width');
      const h  = rootSvg.getAttribute('height');
      const vb = rootSvg.getAttribute('viewBox');
      if (!vb && w && h && !w.includes('%') && !h.includes('%')) {
        const nw = parseFloat(w);
        const nh = parseFloat(h);
        if (!isNaN(nw) && !isNaN(nh)) {
          rootSvg.setAttribute('viewBox', `0 0 ${nw} ${nh}`);
        }
      }
      rootSvg.setAttribute('width',  '100%');
      rootSvg.setAttribute('height', '100%');
    }

    // Remove media foreignObjects that must not load in the static background
    doc.querySelectorAll(
      'foreignObject[data-type="video"], foreignObject[data-type="map"], ' +
      'foreignObject[data-type="embed-frame"], foreignObject video, foreignObject iframe, ' +
      'g[data-type="map"], g[data-type="embed-frame"]'
    ).forEach(el => {
      const target =
        el.closest('g[data-type="map"], g[data-type="embed-frame"]') ||
        (el.tagName?.toLowerCase() === 'foreignobject' ? el : el.closest('foreignObject')) ||
        el;
      target.remove();
    });

    const cleaned = doc.body.innerHTML || html;
    if (staticHtmlCache.size > 200) staticHtmlCache.clear(); // cap cache
    staticHtmlCache.set(html, cleaned);
    return cleaned;
  } catch (e) {
    return html;
  }
}

/* ── sanitizePageHtmlForPreview ──────────────────────────────────────────── */

function sanitizePageHtmlForPreview(html) {
  if (!html) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const rootSvg = doc.querySelector('svg');
    if (rootSvg) {
      const w  = rootSvg.getAttribute('width');
      const h  = rootSvg.getAttribute('height');
      const vb = rootSvg.getAttribute('viewBox');
      if (!vb && w && h && !w.includes('%') && !h.includes('%')) {
        const nw = parseFloat(w);
        const nh = parseFloat(h);
        if (!isNaN(nw) && !isNaN(nh)) {
          rootSvg.setAttribute('viewBox', `0 0 ${nw} ${nh}`);
        }
      }
      rootSvg.setAttribute('width',  '100%');
      rootSvg.setAttribute('height', '100%');
    }

    doc.querySelectorAll('iframe').forEach(iframe => {
      const fo = iframe.closest('foreignObject');
      const isMap =
        (fo && fo.getAttribute('data-type') === 'map') ||
        iframe.closest('g[data-type="map"]') ||
        iframe.closest('.map-root-container');
      const hideControls =
        (fo && fo.getAttribute('data-show-controls') === 'false') ||
        iframe.getAttribute('data-show-controls') === 'false';

      const currentStyle = iframe.getAttribute('style') || '';
      if (isMap) {
        const cleanedStyle = currentStyle.replace(/pointer-events\s*:\s*(?:auto|none)\s*(?:!important)?\s*;?/gi, '');
        iframe.setAttribute('style', cleanedStyle + ' pointer-events: none !important;');
      } else if (currentStyle) {
        const cleanedStyle = currentStyle.replace(/pointer-events\s*:\s*none\s*(?:!important)?\s*;?/gi, '');
        iframe.setAttribute('style', cleanedStyle + ' pointer-events: auto !important;');
      }

      const src = iframe.getAttribute('src') || '';
      if (hideControls && (src.includes('youtube.com') || src.includes('youtu.be'))) {
        try {
          const url = new URL(src);
          url.searchParams.set('controls', '0');
          iframe.setAttribute('src', url.toString());
        } catch (e) {
          iframe.setAttribute('src', src.includes('controls=')
            ? src.replace(/controls=[^&"']+/i, 'controls=0')
            : `${src}${src.includes('?') ? '&' : '?'}controls=0`);
        }
      }

      iframe.setAttribute('allowfullscreen', 'true');
      const allow = iframe.getAttribute('allow') || '';
      if (!allow) {
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
      } else if (!allow.includes('fullscreen')) {
        iframe.setAttribute('allow', `${allow}; fullscreen`);
      }
    });

    return doc.body.innerHTML || html;
  } catch (e) {
    return html;
  }
}

/* ── rewriteHtmlUploads ──────────────────────────────────────────────────── */

function rewriteHtmlUploads(html, backendUrl) {
  if (!html || !backendUrl) return html;
  const storageBase = `${backendUrl}/storage/`;
  const DATA_URI_RE = /(data:[^;]+;base64,[A-Za-z0-9+/=\s]+)/g;
  const parts = html.split(DATA_URI_RE);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 !== 0) continue;
    parts[i] = parts[i]
      .replace(/(src|href|xlink:href)=(['"])(\/storage\/|storage\/)/g, `$1=$2${storageBase}`)
      .replace(/(url\(\s*['"]?)\/storage\//g, `$1${storageBase}`)
      .replace(/(src|href|xlink:href)=(['"])(\/uploads\/|uploads\/)/g, `$1=$2${storageBase}`)
      .replace(/(url\(\s*['"]?)\/uploads\//g, `$1${storageBase}`);
  }
  return parts.join('');
}

/* ── buildPageDoc ────────────────────────────────────────────────────────── */

const PAGE_DOC_CSS = `
  html, body {
    margin:0; padding:0; overflow:hidden; background:transparent; width:100%; height:100%;
    backface-visibility: hidden !important;
    -webkit-backface-visibility: hidden !important;
  }
  body > svg,
  svg:not(foreignObject svg):not([data-type="icon"]):not([data-type="button"] svg) {
    width: 100% !important; height: 100% !important; display: block !important;
    margin: 0 !important; padding: 0 !important; shape-rendering: geometricPrecision !important;
  }
  * { box-sizing: border-box; outline: none !important; }
  .text-edit-box, [contenteditable="true"], [data-scrollable="true"],
  foreignObject:not([data-type="map"]) div:not(.map-root-container):not(.map-card-overlay):not(.map-card-overlay *) {
    white-space: pre-wrap !important; word-wrap: break-word !important;
    word-break: normal !important; overflow-wrap: anywhere !important;
  }
  .map-nowrap, [data-nowrap="true"], .map-card-overlay .map-nowrap {
    white-space: nowrap !important; word-break: normal !important; overflow-wrap: normal !important;
  }
  foreignObject:not([data-type="map"]):not([data-type="embed-frame"]) {
    overflow: visible !important; clip-path: none !important;
  }
  foreignObject:not([data-type="map"]):not([data-type="embed-frame"]) * { clip-path: none !important; }
  foreignObject[data-type="map"], g[data-type="map"] foreignObject, .map-root-container { overflow: hidden !important; }
  .map-root-container, .embed-root-container, .table-card-wrapper, .table-container {
    width: 100% !important; height: 100% !important; display: block !important;
    position: relative !important; box-sizing: border-box !important;
  }
  .map-stage { position: absolute !important; top: 0 !important; left: 0 !important; overflow: hidden !important; }
  .map-stage iframe, .map-root-container iframe {
    position: absolute !important; top: 0 !important; left: 0 !important;
    width: 100% !important; height: 100% !important; border: 0 !important;
    margin: 0 !important; padding: 0 !important; display: block !important; pointer-events: none !important;
  }
  .map-open-maps-btn, .map-action-btn-circle, .map-card-overlay,
  .map-sheet-btn, .map-sheet-link-btn { pointer-events: auto !important; }
  foreignObject video {
    width: 100% !important; height: 100% !important; display: block !important;
    border: none !important; outline: none !important; margin: 0 !important;
    padding: 0 !important; box-sizing: border-box !important; pointer-events: auto !important;
  }
  foreignObject iframe {
    display: block !important; border: none !important; outline: none !important;
    margin: 0 !important; padding: 0 !important; box-sizing: border-box !important;
    pointer-events: auto !important; transform-origin: 0 0 !important;
  }
  foreignObject[data-type="video"] { overflow: hidden !important; pointer-events: auto !important; }
  foreignObject[data-type="video"] * { pointer-events: auto !important; }
  [data-scrollable="true"]::-webkit-scrollbar { width:6px !important; height:6px !important; display:block !important; }
  [data-scrollable="true"]::-webkit-scrollbar-track { background:#E5E7EB !important; border-radius:10px !important; }
  [data-scrollable="true"]::-webkit-scrollbar-thumb { background:#4B5563 !important; border-radius:10px !important; }
`;

function buildPageDoc(rawHtml, backendUrl) {
  const body = rewriteHtmlUploads(sanitizePageHtmlForPreview(rawHtml || ''), backendUrl);
  return `<!DOCTYPE html><html><head><style>${PAGE_DOC_CSS}</style></head><body>${body}</body></html>`;
}

/* ── Worker Message Handler ──────────────────────────────────────────────── */

self.onmessage = ({ data }) => {
  const { id, type, rawHtml, backendUrl } = data;
  try {
    if (type === 'buildDoc') {
      const cleanedHtml = cleanStaticHtml(rawHtml);
      const srcdoc      = buildPageDoc(rawHtml, backendUrl || '');
      self.postMessage({ id, type: 'buildDoc', srcdoc, cleanedHtml });

    } else if (type === 'cleanHtml') {
      const cleanedHtml = cleanStaticHtml(rawHtml);
      self.postMessage({ id, type: 'cleanHtml', cleanedHtml });

    } else {
      self.postMessage({ id, type: 'error', message: `Unknown type: ${type}` });
    }
  } catch (err) {
    self.postMessage({ id, type: 'error', message: err?.message || String(err) });
  }
};

