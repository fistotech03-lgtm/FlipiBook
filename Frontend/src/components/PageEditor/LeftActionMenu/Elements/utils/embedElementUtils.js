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

const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const getEmbedSvgCode = (isClick = false) => {
  const uniqueId = `embed-${Date.now()}`;
  const scale = 0.25;
  const w = 650;
  const h = 400;
  const transform = 'transform="scale(0.25)"';

  const defaultBody = `
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%; height:100%; background:#f8fafc; color:#64748b; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align:center; box-sizing:border-box; padding:20px; border-radius:12px; border:2px dashed #cbd5e1;">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:10px;">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
      <div style="font-size:18px; font-weight:600; color:#1e293b; margin-bottom:4px;">3rd Party Embed Frame</div>
      <div style="font-size:13px; color:#64748b;">Enter URL or HTML code in Properties to display live embed</div>
    </div>
  `.trim();

  const srcdocHtml = escapeHtml(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;width:100vw;height:100vh;overflow:hidden;border-radius:12px;} video::-webkit-media-controls { zoom: 1.5; } video, iframe, img { width: 100%; height: 100%; border: none; display: block; border-radius:12px; }</style></head><body>${defaultBody}</body></html>`);

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
       data-tl="12" data-tr="12" data-bl="12" data-br="12" 
       rx="12" 
       data-custom-code="" 
       data-url="" 
       data-embed-via="URL" 
       cursor="pointer">
      <rect class="embed-fill-layer" x="0" y="0" width="${w}" height="${h}" rx="12" ry="12" fill="#f8fafc" opacity="1" pointer-events="none" />
      <g class="embed-content-group" pointer-events="none">
        <foreignObject x="0" y="0" width="${w}" height="${h}" pointer-events="all" style="border-radius: 12px; overflow: hidden;">
          <iframe srcdoc="${srcdocHtml}" width="100%" height="100%" style="border:none; background:transparent; border-radius: 12px;" scrolling="auto" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowtransparency="true"></iframe>
        </foreignObject>
      </g>
      <rect class="svg-image-stroke-overlay" x="0" y="0" width="${w}" height="${h}" rx="12" ry="12" fill="transparent" pointer-events="all" stroke="#000000" stroke-width="1" />
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
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%; height:100%; background:#f8fafc; color:#64748b; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align:center; box-sizing:border-box; padding:20px; border-radius:12px; border:2px dashed #cbd5e1;">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:10px;">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
      <div style="font-size:18px; font-weight:600; color:#1e293b; margin-bottom:4px;">3rd Party Embed Frame</div>
      <div style="font-size:13px; color:#64748b;">Enter URL or HTML code in Properties to display live embed</div>
    </div>
  `.trim();

  const srcdocHtml = escapeHtml(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;width:100vw;height:100vh;overflow:hidden;border-radius:12px;} video::-webkit-media-controls { zoom: 1.5; } video, iframe, img { width: 100%; height: 100%; border: none; display: block; border-radius:12px; }</style></head><body>${defaultBody}</body></html>`);

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
       data-tl="12" data-tr="12" data-bl="12" data-br="12" 
       rx="12" 
       data-custom-code="" 
       data-url="" 
       data-embed-via="URL" 
       cursor="pointer">
      <rect class="embed-fill-layer" x="0" y="0" width="${w}" height="${h}" rx="12" ry="12" fill="#f8fafc" opacity="1" pointer-events="none" />
      <g class="embed-content-group" pointer-events="none">
        <foreignObject x="0" y="0" width="${w}" height="${h}" pointer-events="all" style="border-radius: 12px; overflow: hidden;">
          <iframe srcdoc="${srcdocHtml}" width="100%" height="100%" style="border:none; background:transparent; border-radius: 12px;" scrolling="auto" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowtransparency="true"></iframe>
        </foreignObject>
      </g>
      <rect class="svg-image-stroke-overlay" x="0" y="0" width="${w}" height="${h}" rx="12" ry="12" fill="transparent" pointer-events="all" stroke="#000000" stroke-width="1" />
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
