/**
 * embedElementUtils.js
 * Isolated utilities for 3rd-Party Web Embeds in FlipiBook
 */

export const isElementEmbed = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-type') === 'embed-frame' ||
    (typeof el.getAttribute('id') === 'string' && el.getAttribute('id').startsWith('embed-'))
  );
};

export const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Generates the overlay button UI for the embed frame
 * (Open Website button + Fullscreen button)
 */
export const getEmbedOverlayHtml = ({
  targetUrl = '',
  openWebsiteBtn = true,
  allowFullscreen = true,
  behavior = 'Open in - Current Tab'
} = {}) => {
  const showOpenBtn = openWebsiteBtn !== false && openWebsiteBtn !== 'false';
  const showFsBtn = allowFullscreen !== false && allowFullscreen !== 'false';

  // Only show overlay buttons if enabled AND there is a target URL/code
  if ((!showOpenBtn && !showFsBtn) || !targetUrl || !String(targetUrl).trim()) {
    return '';
  }

  let formattedUrl = '';
  let trimmed = String(targetUrl).trim();
  if (trimmed.startsWith('<')) {
    const srcMatch = trimmed.match(/src=["']([^"']*)["']/i);
    if (srcMatch && srcMatch[1]) trimmed = srcMatch[1];
  }
  if (trimmed && !/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }
  formattedUrl = trimmed;

  const targetAttr = behavior === 'Open in - New Tab' ? '_blank' : '_top';

  const btnStyle = 'display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 5px !important; padding: 4px 10px !important; height: 26px !important; background: rgba(15, 23, 42, 0.88) !important; color: #ffffff !important; text-decoration: none !important; border-radius: 6px !important; border: 1px solid rgba(255, 255, 255, 0.22) !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important; font-size: 11px !important; font-weight: 600 !important; line-height: 1 !important; letter-spacing: 0.2px !important; cursor: pointer !important; pointer-events: auto !important; -webkit-backdrop-filter: blur(8px) !important; backdrop-filter: blur(8px) !important; transition: all 0.15s ease !important; user-select: none !important; box-sizing: border-box !important; white-space: nowrap !important; flex-shrink: 0 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;';

  const iconStyle = 'width: 12px !important; height: 12px !important; min-width: 12px !important; max-width: 12px !important; min-height: 12px !important; max-height: 12px !important; display: inline-block !important; flex-shrink: 0 !important; color: #ffffff !important; stroke: #ffffff !important;';

  const spanStyle = 'color: #ffffff !important; font-size: 11px !important; font-weight: 600 !important; line-height: 1 !important; white-space: nowrap !important; display: inline-block !important; letter-spacing: 0.2px !important;';

  const openBtnHtml = showOpenBtn ? `
    <a href="${escapeHtml(formattedUrl || '#')}" 
       target="${targetAttr}" 
       rel="noopener noreferrer" 
       class="embed-open-btn" 
       title="Open website" 
       data-embed-action="open-website" 
       style="${btnStyle}">
      <svg class="svg-icon-override" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
      <span style="${spanStyle}">Open website</span>
    </a>
  ` : '';

  const fullscreenBtnHtml = showFsBtn ? `
    <button type="button" 
            class="embed-fullscreen-btn" 
            title="Full screen" 
            data-embed-action="fullscreen" 
            style="${btnStyle}">
      <svg class="svg-icon-override embed-fs-icon-enter" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
      </svg>
      <svg class="svg-icon-override embed-fs-icon-exit" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle} display: none !important;">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
      </svg>
      <span class="embed-fs-text" style="${spanStyle}">Full screen</span>
    </button>
  ` : '';

  return `
    <div class="embed-overlay-wrapper" style="position: absolute !important; top: 10px !important; right: 10px !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; z-index: 25 !important; pointer-events: auto !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;">
      ${openBtnHtml}
      ${fullscreenBtnHtml}
    </div>
  `.trim();
};

export const getEmbedSvgCode = (isClick = false) => {
  const uniqueId = `embed-${Date.now()}`;
  const scale = 0.25;
  const w = 650;
  const h = 400;
  const transform = 'transform="scale(0.25)"';

  const defaultBody = `
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%; height:100%; background:#f8fafc; color:#64748b; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align:center; box-sizing:border-box; padding:20px; border-radius:0px; border:2px dashed #cbd5e1;">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:10px;">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
      <div style="font-size:18px; font-weight:600; color:#1e293b; margin-bottom:4px;">3rd Party Embed Frame</div>
      <div style="font-size:13px; color:#64748b;">Enter URL or HTML code in Properties to display live embed</div>
    </div>
  `.trim();

  const srcdocHtml = escapeHtml(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;width:100vw;height:100vh;overflow:hidden;border-radius:0px;} video::-webkit-media-controls { zoom: 1.5; } video, iframe, img { width: 100%; height: 100%; border: none; display: block; border-radius:0px; }</style></head><body>${defaultBody}</body></html>`);

  const overlayHtml = getEmbedOverlayHtml({
    targetUrl: '',
    openWebsiteBtn: true,
    allowFullscreen: true,
    behavior: 'Open in - Current Tab'
  });

  return `
    <g id="${uniqueId}" 
       data-type="embed-frame" 
       data-name="Embed Frame" 
       ${transform} 
       data-fill-color="#f8fafc" 
       data-fill-opacity="1" 
       data-stroke-color="#000000" 
       data-stroke-width="1" 
       data-stroke-opacity="1" 
       data-line-corner="Rounded" 
       data-custom-code="" 
       data-url="" 
       data-embed-via="URL" 
       data-open-website-btn="true" 
       data-allow-fullscreen="true" 
       data-behavior="Open in - Current Tab" 
       cursor="pointer">
      <rect class="embed-fill-layer" x="0" y="0" width="${w}" height="${h}" fill="#f8fafc" opacity="1" pointer-events="none" />
      <g class="embed-content-group" pointer-events="none">
        <foreignObject x="0" y="0" width="${w}" height="${h}" pointer-events="all" style="border-radius: 0px; overflow: hidden;">
          <div xmlns="http://www.w3.org/1999/xhtml" class="embed-root-container" style="position: relative; width: 100%; height: 100%; overflow: hidden; margin: 0; padding: 0; border-radius: 0px; background: transparent;">
            <iframe srcdoc="${srcdocHtml}" width="100%" height="100%" style="border:none; background:transparent; border-radius: 0px;" scrolling="auto" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen="true" allowtransparency="true"></iframe>
            ${overlayHtml}
          </div>
        </foreignObject>
      </g>
      <rect class="svg-image-stroke-overlay" x="0" y="0" width="${w}" height="${h}" fill="transparent" pointer-events="all" stroke="#000000" stroke-width="1" />
    </g>
  `.trim();
};

export function createEmbedElementNode(cx = 105, cy = 148, customCode = '') {
  const scale = 0.25;
  const w = 650;
  const h = 400;
  const targetW = w * scale;
  const targetH = h * scale;
  const uniqueId = `embed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const x = Math.round(cx - targetW / 2);
  const y = Math.round(cy - targetH / 2);

  const defaultBody = customCode ? customCode : `
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%; height:100%; background:#f8fafc; color:#64748b; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align:center; box-sizing:border-box; padding:20px; border-radius:0px; border:2px dashed #cbd5e1;">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:10px;">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
      <div style="font-size:18px; font-weight:600; color:#1e293b; margin-bottom:4px;">3rd Party Embed Frame</div>
      <div style="font-size:13px; color:#64748b;">Enter URL or HTML code in Properties to display live embed</div>
    </div>
  `.trim();

  const srcdocHtml = escapeHtml(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;width:100vw;height:100vh;overflow:hidden;border-radius:0px;} video::-webkit-media-controls { zoom: 1.5; } video, iframe, img { width: 100%; height: 100%; border: none; display: block; border-radius:0px; }</style></head><body>${defaultBody}</body></html>`);

  const overlayHtml = getEmbedOverlayHtml({
    targetUrl: customCode,
    openWebsiteBtn: true,
    allowFullscreen: true,
    behavior: 'Open in - Current Tab'
  });

  const rawSvg = `
    <g id="${uniqueId}" 
       data-type="embed-frame" 
       data-name="Embed Frame" 
       transform="translate(${x}, ${y}) scale(${scale})" 
       data-fill-color="#f8fafc" 
       data-fill-opacity="1" 
       data-stroke-color="#000000" 
       data-stroke-width="1" 
       data-stroke-opacity="1" 
       data-line-corner="Rounded" 
       data-custom-code="" 
       data-url="" 
       data-embed-via="URL" 
       data-open-website-btn="true" 
       data-allow-fullscreen="true" 
       data-behavior="Open in - Current Tab" 
       cursor="pointer">
      <rect class="embed-fill-layer" x="0" y="0" width="${w}" height="${h}" fill="#f8fafc" opacity="1" pointer-events="none" />
      <g class="embed-content-group" pointer-events="none">
        <foreignObject x="0" y="0" width="${w}" height="${h}" pointer-events="all" style="border-radius: 0px; overflow: hidden;">
          <div xmlns="http://www.w3.org/1999/xhtml" class="embed-root-container" style="position: relative; width: 100%; height: 100%; overflow: hidden; margin: 0; padding: 0; border-radius: 0px; background: transparent;">
            <iframe srcdoc="${srcdocHtml}" width="100%" height="100%" style="border:none; background:transparent; border-radius: 0px;" scrolling="auto" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen="true" allowtransparency="true"></iframe>
            ${overlayHtml}
          </div>
        </foreignObject>
      </g>
      <rect class="svg-image-stroke-overlay" x="0" y="0" width="${w}" height="${h}" fill="transparent" pointer-events="all" stroke="#000000" stroke-width="1" />
    </g>
  `.trim();

  const parser = new DOMParser();
  let doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${rawSvg}</svg>`, 'image/svg+xml');
  let el = doc.querySelector('g[data-type="embed-frame"]') || doc.querySelector('g[id^="embed-"]');
  if (!el && doc.querySelector('parsererror')) {
    doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${rawSvg}</svg>`, 'text/html');
    el = doc.querySelector('g[data-type="embed-frame"]') || doc.querySelector('g[id^="embed-"]');
  }

  if (el) {
    return document.importNode(el, true);
  }
  return null;
}
