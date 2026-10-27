/**
 * imageFramingCatalog.jsx
 * Image Framing & SVG Masking Elements Catalog for FlipiBook
 */
import React from 'react';
import { IMAGE_FRAMING_PRESETS, createImageFrameNode, getFrameSvg } from '../utils/imageFramingUtils';

export const FRAMING_ITEMS = IMAGE_FRAMING_PRESETS.map((preset) => {
  const raw = getFrameSvg(preset);

  return {
    id: preset.id,
    name: preset.name,
    category: 'masking',
    type: 'frame',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.35vw] pointer-events-none select-none">
        <svg
          viewBox={preset.viewBox}
          className="w-full h-full object-contain max-w-[2.8vw] max-h-[2.8vw] opacity-80 group-hover:opacity-100 transition-opacity"
          dangerouslySetInnerHTML={{ __html: preset.innerSvg }}
        />
      </div>
    ),
    insert: (cx, cy) => createImageFrameNode(preset.name, raw, cx, cy)
  };
});

export default FRAMING_ITEMS;
