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

export const getEmbedSvgCode = (isClick = false) => {
  const uniqueId = `embed-${Date.now()}`;
  const transform = 'transform="scale(0.25)"';

  return `
    <g id="${uniqueId}" data-type="embed-frame" ${transform} data-fill-color="#f3f4f6" data-fill-opacity="1" cursor="pointer">
      <rect class="embed-fill-layer" x="0" y="0" width="650" height="400" fill="#f3f4f6" opacity="1" pointer-events="none" />
      <g class="embed-content-group" pointer-events="none">
        <rect width="650" height="400" fill="transparent" stroke="#3b82f6" stroke-width="2" stroke-dasharray="6,6" rx="8" />
        <rect x="175" y="75" width="300" height="200" fill="#e5e7eb" rx="12" />
        <path d="M 175 87 Q 175 75 187 75 L 463 75 Q 475 75 475 87 L 475 105 L 175 105 Z" fill="#d1d5db" />
        <circle cx="195" cy="90" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="210" cy="90" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="225" cy="90" r="4" fill="#ffffff" opacity="0.8" />
        <g transform="translate(285, 135) scale(3.5)" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.7">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </g>
      </g>
      <rect class="svg-image-stroke-overlay" x="0" y="0" width="650" height="400" fill="transparent" pointer-events="all" />
    </g>
  `.trim();
};

export function createEmbedElementNode(cx = 105, cy = 148) {
  const scale = 0.25;
  const w = 650 * scale;
  const h = 400 * scale;
  const uniqueId = `embed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const x = Math.round(cx - w / 2);
  const y = Math.round(cy - h / 2);

  const rawSvg = `
    <g id="${uniqueId}" data-type="embed-frame" transform="translate(${x}, ${y}) scale(${scale})" data-fill-color="#f3f4f6" data-fill-opacity="1" cursor="pointer">
      <rect class="embed-fill-layer" x="0" y="0" width="650" height="400" fill="#f3f4f6" opacity="1" pointer-events="none" />
      <g class="embed-content-group" pointer-events="none">
        <rect width="650" height="400" fill="transparent" stroke="#3b82f6" stroke-width="2" stroke-dasharray="6,6" rx="8" />
        <rect x="175" y="75" width="300" height="200" fill="#e5e7eb" rx="12" />
        <path d="M 175 87 Q 175 75 187 75 L 463 75 Q 475 75 475 87 L 475 105 L 175 105 Z" fill="#d1d5db" />
        <circle cx="195" cy="90" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="210" cy="90" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="225" cy="90" r="4" fill="#ffffff" opacity="0.8" />
        <g transform="translate(285, 135) scale(3.5)" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.7">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </g>
      </g>
      <rect class="svg-image-stroke-overlay" x="0" y="0" width="650" height="400" fill="transparent" pointer-events="all" />
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
