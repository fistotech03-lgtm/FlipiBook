/**
 * imageFramingUtils.js
 * Isolated utilities for SVG Image Framing & Masking Elements in FlipiBook
 */

export const isImageFrame = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-type') === 'image-frame' ||
    el.getAttribute('data-is-image-frame') === 'true' ||
    el.getAttribute('data-frame-type') !== null ||
    (el.getAttribute('id') && el.getAttribute('id').startsWith('image-frame-'))
  );
};

export const createImageFrameNode = (frameName, rawSvg, cx, cy) => {
  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
  let cleanSvg = (rawSvg || '').replace(/<\?xml.*?\?>/g, '');
  
  // Scope pattern IDs to avoid SVG pattern ID collisions between multiple frames
  const patternRegex = /id="(pattern-[^"]+|pattern\d*)"/g;
  cleanSvg = cleanSvg.replace(patternRegex, (match, p1) => `id="${p1}-${uniqueId}"`);
  cleanSvg = cleanSvg.replace(/url\(#(pattern-[^)]+|pattern\d*)\)/g, (match, p1) => `url(#${p1}-${uniqueId})`);

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanSvg, 'image/svg+xml');
  const svgEl = doc.documentElement;
  const width = parseFloat(svgEl.getAttribute('width') || '100');
  const height = parseFloat(svgEl.getAttribute('height') || '100');

  // Scale frame to snug canvas placement (~75mm or 75 units)
  let scale = 1;
  const maxSize = 80;
  if (width > maxSize || height > maxSize) {
    scale = maxSize / Math.max(width, height);
  }

  const renderW = width * scale;
  const renderH = height * scale;
  const posX = Math.round(cx - renderW / 2);
  const posY = Math.round(cy - renderH / 2);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id', `image-frame-${uniqueId}`);
  g.setAttribute('data-type', 'image-frame');
  g.setAttribute('data-is-image-frame', 'true');
  g.setAttribute('data-frame-type', frameName);
  g.setAttribute('data-name', `${frameName} Frame`);
  g.setAttribute('transform', `translate(${posX}, ${posY}) scale(${scale.toFixed(4)})`);
  g.setAttribute('cursor', 'pointer');
  g.innerHTML = svgEl.innerHTML;

  return g;
};
