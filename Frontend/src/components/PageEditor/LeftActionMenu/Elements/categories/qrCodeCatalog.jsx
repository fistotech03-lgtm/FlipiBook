/**
 * qrCodeCatalog.jsx
 * QR Code Presets Catalog for FlipiBook Elements Panel
 */
import React from 'react';
import { QR_FRAMES, createQRCodeElementNode, getQRCodeSvgString } from '../utils/qrCodeElementUtils';

// Mini QR Code matrix path icon for vector thumbnails
const MiniQRMatrix = ({ x = 12, y = 12, size = 36 }) => {
  const scale = size / 36;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Top Left Finder */}
      <rect x="0" y="0" width="11" height="11" fill="none" stroke="#000" strokeWidth="2.5" />
      <rect x="3" y="3" width="5" height="5" fill="#000" />
      {/* Top Right Finder */}
      <rect x="25" y="0" width="11" height="11" fill="none" stroke="#000" strokeWidth="2.5" />
      <rect x="28" y="3" width="5" height="5" fill="#000" />
      {/* Bottom Left Finder */}
      <rect x="0" y="25" width="11" height="11" fill="none" stroke="#000" strokeWidth="2.5" />
      <rect x="3" y="28" width="5" height="5" fill="#000" />
      {/* Module Dots */}
      <rect x="14" y="2" width="3" height="3" fill="#000" />
      <rect x="19" y="5" width="3" height="3" fill="#000" />
      <rect x="14" y="10" width="3" height="3" fill="#000" />
      <rect x="2" y="14" width="3" height="3" fill="#000" />
      <rect x="7" y="19" width="3" height="3" fill="#000" />
      <rect x="14" y="15" width="3" height="3" fill="#000" />
      <rect x="19" y="15" width="3" height="3" fill="#000" />
      <rect x="14" y="22" width="3" height="3" fill="#000" />
      <rect x="19" y="25" width="3" height="3" fill="#000" />
      <rect x="26" y="14" width="3" height="3" fill="#000" />
      <rect x="31" y="19" width="3" height="3" fill="#000" />
      <rect x="25" y="25" width="3" height="3" fill="#000" />
      <rect x="31" y="28" width="3" height="3" fill="#000" />
    </g>
  );
};

export const FrameVectorThumbnail = ({ frameId }) => {
  switch (frameId) {
    case 'frame-none':
    default:
      return (
        <svg viewBox="0 0 60 60" className="w-full h-full p-[0.2vw]">
          <rect x="2" y="2" width="56" height="56" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <MiniQRMatrix x="12" y="12" size="36" />
        </svg>
      );
    case 'frame-bottom-bar':
      return (
        <svg viewBox="0 0 60 72" className="w-full h-full p-[0.2vw]">
          <rect x="3" y="3" width="54" height="66" rx="4" fill="#ffffff" stroke="#000000" strokeWidth="2.8" />
          <MiniQRMatrix x="12" y="9" size="36" />
          <path d="M 3 51 L 57 51 L 57 65 A 4 4 0 0 1 53 69 L 7 69 A 4 4 0 0 1 3 65 Z" fill="#000000" />
          <text x="30" y="61.5" fill="#ffffff" fontSize="5.2" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">SCAN ME</text>
        </svg>
      );
    case 'frame-top-bubble':
      return (
        <svg viewBox="0 0 60 72" className="w-full h-full p-[0.2vw]">
          <rect x="14" y="2" width="32" height="9" rx="2.5" fill="#000000" />
          <polygon points="26,11 30,15 34,11" fill="#000000" />
          <text x="30" y="8" fill="#ffffff" fontSize="4.2" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">SCAN ME</text>
          <rect x="5" y="14" width="50" height="53" rx="4" fill="#ffffff" stroke="#000000" strokeWidth="2.8" />
          <MiniQRMatrix x="12" y="21" size="36" />
        </svg>
      );
    case 'frame-curved-arrow':
      return (
        <svg viewBox="0 0 60 70" className="w-full h-full p-[0.2vw]">
          <MiniQRMatrix x="17" y="5" size="37" />
          <path d="M 12 54 Q 3 34 13 18" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <polygon points="17,16 11,13 12,20" fill="#000000" />
          <text x="24" y="63" fill="#000000" fontSize="7.5" fontWeight="bold" fontFamily="'Caveat', cursive, sans-serif" textAnchor="middle">Scan me</text>
        </svg>
      );
    case 'frame-phone':
      return (
        <svg viewBox="0 0 60 78" className="w-full h-full p-[0.2vw]">
          <rect x="8" y="2" width="44" height="74" rx="6" fill="#000000" />
          <rect x="24" y="5" width="12" height="1.8" rx="0.9" fill="#e2e8f0" />
          <circle cx="20" cy="5.9" r="0.9" fill="#64748b" />
          <rect x="12" y="9" width="36" height="54" rx="3" fill="#ffffff" />
          <MiniQRMatrix x="15" y="17" size="30" />
          <text x="30" y="70" fill="#ffffff" fontSize="4.8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">SCAN ME</text>
        </svg>
      );
    case 'frame-simple-text':
      return (
        <svg viewBox="0 0 60 70" className="w-full h-full p-[0.2vw]">
          <rect x="5" y="4" width="50" height="51" rx="4" fill="#ffffff" stroke="#000000" strokeWidth="2.8" />
          <MiniQRMatrix x="12" y="11" size="36" />
          <text x="30" y="64" fill="#000000" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">SCAN ME</text>
        </svg>
      );
  }
};

// Explicit default order of the 6 frame elements matching switch (frameId)
export const QR_FRAME_IDS = [
  'frame-none',
  'frame-bottom-bar',
  'frame-top-bubble',
  'frame-curved-arrow',
  'frame-phone',
  'frame-simple-text'
];

export const QR_ITEMS = QR_FRAME_IDS.map((frameId) => {
  const frame = QR_FRAMES.find((f) => f.id === frameId) || {
    id: frameId,
    shortName: frameId === 'frame-none' ? 'No Frame' : frameId,
    defaultText: frameId === 'frame-curved-arrow' ? 'Scan me' : (frameId === 'frame-none' ? '' : 'SCAN ME')
  };
  const isLightBg = frameId === 'frame-curved-arrow' || frameId === 'frame-simple-text';
  const defaultTextColor = isLightBg ? '#000000' : '#FFFFFF';
  const defaultFontFamily = frameId === 'frame-curved-arrow' ? 'Caveat' : 'Poppins';

  return {
    id: `qr-${frame.id}`,
    name: frame.shortName,
    category: 'qr-code',
    type: 'qrcode',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] pointer-events-none select-none">
        <div className="w-[85%] h-[85%] flex items-center justify-center transition-transform group-hover:scale-105">
          <FrameVectorThumbnail frameId={frame.id} />
        </div>
      </div>
    ),
    insert: (cx, cy) =>
      createQRCodeElementNode(
        {
          frameId: frame.id,
          text: frame.defaultText,
          textColor: defaultTextColor,
          fontFamily: defaultFontFamily,
          url: 'https://example.com'
        },
        cx,
        cy
      ),
    getSvgString: (isDrag) =>
      getQRCodeSvgString(
        {
          frameId: frame.id,
          text: frame.defaultText,
          textColor: defaultTextColor,
          fontFamily: defaultFontFamily,
          url: 'https://example.com'
        },
        isDrag
      )
  };
});
