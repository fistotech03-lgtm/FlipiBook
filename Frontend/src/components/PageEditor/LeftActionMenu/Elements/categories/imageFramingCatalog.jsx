/**
 * imageFramingCatalog.jsx
 * Image Framing & SVG Masking Elements Catalog for FlipiBook
 */
import React from 'react';
import { createImageFrameNode } from '../utils/imageFramingUtils';

// Eagerly glob all 50+ Frame SVGs from assets/Elements/ImageFraming
const frameModules = import.meta.glob(
  '../../../../../assets/Elements/ImageFraming/*.svg',
  { eager: true, import: 'default' }
);

const rawFrameModules = import.meta.glob(
  '../../../../../assets/Elements/ImageFraming/*.svg',
  { eager: true, query: '?raw', import: 'default' }
);

export const FRAMING_ITEMS = Object.keys(frameModules).map((filePath) => {
  const filename = filePath.split('/').pop().replace('.svg', '');
  const url = frameModules[filePath];
  const raw = rawFrameModules[filePath] || '';

  return {
    id: `frame-${filename.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: filename,
    category: 'masking',
    type: 'frame',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.35vw] pointer-events-none select-none">
        <img
          src={url}
          alt={filename}
          className="w-full h-full object-contain max-w-[2.8vw] max-h-[2.8vw] opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </div>
    ),
    insert: (cx, cy) => createImageFrameNode(filename, raw, cx, cy)
  };
});
