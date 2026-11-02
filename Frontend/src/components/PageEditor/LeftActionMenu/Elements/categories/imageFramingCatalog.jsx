/**
 * imageFramingCatalog.jsx
 * Image Framing & SVG Masking Elements Catalog for FlipiBook
 */
import React from 'react';
import { IMAGE_FRAMING_PRESETS, createImageFrameNode, getFrameSvg } from '../utils/imageFramingUtils';

const GRID_IDS = new Set([
  'frame-2-colums',
  'frame-4-grid',
  'frame-big-left',
  'frame-circle-collage',
  'frame-dimond-collage',
  'frame-hexagon-collage',
  'frame-left-right',
  'frame-off-set',
  'frame-single',
  'frame-split',
  'frame-top-bottom',
  'frame-triangle-collage',
  'frame-staggered-3-columns',
  'frame-diamond-s-curve--4-',
  'frame-arch-horseshoe--6-'
]);

const LETTER_IDS = new Set([
  'frame-0', 'frame-1', 'frame-2', 'frame-3', 'frame-4',
  'frame-5', 'frame-6', 'frame-7', 'frame-8', 'frame-9',
  'frame-a', 'frame-b', 'frame-c', 'frame-d', 'frame-e',
  'frame-f', 'frame-g', 'frame-h', 'frame-i', 'frame-j',
  'frame-k', 'frame-l', 'frame-m', 'frame-n', 'frame-o',
  'frame-p', 'frame-q', 'frame-r', 'frame-s', 'frame-t',
  'frame-u', 'frame-v', 'frame-w', 'frame-x', 'frame-y',
  'frame-z'
]);

export const FRAMING_ITEMS = IMAGE_FRAMING_PRESETS.map((preset) => {
  const raw = getFrameSvg(preset);

  let subtopic = 'Shapes';
  if (GRID_IDS.has(preset.id)) {
    subtopic = 'Grid';
  } else if (LETTER_IDS.has(preset.id)) {
    subtopic = 'Letters';
  }

  return {
    id: preset.id,
    name: preset.name,
    category: 'masking',
    subtopic,
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

// Reorder FRAMING_ITEMS so that Grid comes first, Shapes second, Letters third
const SUBTOPIC_ORDER = {
  Grid: 1,
  Shapes: 2,
  Letters: 3
};

FRAMING_ITEMS.sort((a, b) => {
  const orderA = SUBTOPIC_ORDER[a.subtopic] || 99;
  const orderB = SUBTOPIC_ORDER[b.subtopic] || 99;
  return orderA - orderB;
});

export default FRAMING_ITEMS;
