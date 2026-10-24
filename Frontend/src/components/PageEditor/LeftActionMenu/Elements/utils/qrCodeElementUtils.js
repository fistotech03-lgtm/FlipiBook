/**
 * qrCodeElementUtils.js
 * Isolated utilities for QR Code Elements in FlipiBook
 */
import { QR_FRAMES, getCachedFrame, renderQRWithFrame, preloadDefaultFrames } from './qrFrameRenderer';

export { QR_FRAMES, getCachedFrame, renderQRWithFrame, preloadDefaultFrames };

export const isElementQRCode = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-type') === 'qrcode' ||
    (typeof el.getAttribute('id') === 'string' && el.getAttribute('id').startsWith('qrcode-'))
  );
};

/**
 * Creates an SVG <g> DOM node representing a QR Code element placed at (cx, cy).
 */
export function createQRCodeElementNode(options = {}, cx = 100, cy = 100) {
  const {
    frameId = 'frame-bottom-bar',
    url = 'https://example.com',
    text = 'SCAN ME',
    logoSrc = '',
    logoSize = 22,
    logoBg = true,
    width = 55
  } = options;

  const frameObj = QR_FRAMES.find((f) => f.id === frameId) || QR_FRAMES[0];
  const ratio = frameObj.ratio || 1;
  const height = Math.round(width * ratio);

  const cached = getCachedFrame(frameId, url);
  const imgHref = cached?.dataUrl || `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=240x240`;

  const uniqueId = `qrcode-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const x = Math.round(cx - width / 2);
  const y = Math.round(cy - height / 2);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id', uniqueId);
  g.setAttribute('data-type', 'qrcode');
  g.setAttribute('cursor', 'pointer');
  g.setAttribute('data-qr-url', url);
  g.setAttribute('data-qr-frame', frameId);
  g.setAttribute('data-qr-text', text);
  g.setAttribute('data-qr-logo-size', String(logoSize));
  g.setAttribute('data-qr-logo-bg', String(logoBg));
  g.setAttribute('data-qr-logo', logoSrc || '');
  g.setAttribute('transform', `translate(${x}, ${y})`);

  const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  image.setAttribute('x', '0');
  image.setAttribute('y', '0');
  image.setAttribute('width', String(width));
  image.setAttribute('height', String(height));
  image.setAttribute('href', imgHref);
  image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imgHref);
  image.setAttribute('preserveAspectRatio', 'none');
  g.appendChild(image);

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', '0');
  rect.setAttribute('width', String(width));
  rect.setAttribute('height', String(height));
  rect.setAttribute('fill', 'transparent');
  rect.setAttribute('pointer-events', 'all');
  g.appendChild(rect);

  // Asynchronously re-render the high-resolution composite canvas frame
  renderQRWithFrame({
    url,
    frame: frameId,
    text,
    logoSrc: logoSrc || null,
    logoSize: Number(logoSize) || 22,
    logoBg: logoBg !== false && logoBg !== 'false'
  })
    .then((rendered) => {
      if (rendered?.dataUrl) {
        image.setAttribute('href', rendered.dataUrl);
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', rendered.dataUrl);
      }
    })
    .catch((err) => {
      console.warn('[QR] High-res frame render error, using fallback:', err);
    });

  return g;
}

/**
 * Returns raw SVG string for drag-and-drop dataTransfer
 */
export function getQRCodeSvgString(options = {}, isDrag = false) {
  const {
    frameId = 'frame-bottom-bar',
    url = 'https://example.com',
    text = 'SCAN ME',
    logoSrc = '',
    logoSize = 22,
    logoBg = true,
    width = 55
  } = options;

  const frameObj = QR_FRAMES.find((f) => f.id === frameId) || QR_FRAMES[0];
  const ratio = frameObj.ratio || 1;
  const height = Math.round(width * ratio);
  const cached = getCachedFrame(frameId, url);
  const imgHref = cached?.dataUrl || `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=240x240`;
  const uniqueId = `qrcode-${Date.now()}`;
  const transform = isDrag ? '' : 'transform="translate(80, 120)"';

  return `
    <g id="${uniqueId}" data-type="qrcode" cursor="pointer" data-qr-url="${url}" data-qr-frame="${frameId}" data-qr-text="${text}" data-qr-logo-size="${logoSize}" data-qr-logo-bg="${logoBg}" data-qr-logo="${logoSrc || ''}" ${transform}>
      <image x="0" y="0" width="${width}" height="${height}" href="${imgHref}" preserveAspectRatio="none" />
      <rect x="0" y="0" width="${width}" height="${height}" fill="transparent" pointer-events="all" />
    </g>
  `.trim();
}
