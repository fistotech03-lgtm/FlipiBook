import React from 'react';
import { createShapeSvgNode } from '../utils/shapeElementUtils';

// Eagerly glob all Shape SVGs from assets
const shapeModules = import.meta.glob(
  '../../../../../assets/Elements/Shapes/*.svg',
  { eager: true, query: '?raw', import: 'default' }
);

// Filter out dashed lines, dotted lines, double lines, and straight/wavy line shapes as requested
const EXCLUDED_SHAPE_PATTERNS = [
  'dashed line',
  'dotted line',
  'double line',
  'straight line',
  'wavy line'
];

export const parsedShapes = Object.keys(shapeModules)
  .filter((path) => {
    const filename = path.split('/').pop().replace('.svg', '').toLowerCase();
    return !EXCLUDED_SHAPE_PATTERNS.some((pattern) => filename.includes(pattern));
  })
  .map((path) => {
    const filename = path.split('/').pop().replace('.svg', '');
    let svgContent = shapeModules[path];

    // Remove fill="none" on <svg> root so child elements inherit properly
    svgContent = svgContent.replace(/<svg[^>]*>/i, (match) =>
      match.replace(/fill="none"/gi, 'fill="inherit"')
    );

    // Apply default fill color (#FBDCD7)
    svgContent = svgContent.replace(/fill="(?!none|inherit)[^"]*"/gi, 'fill="#FBDCD7"');

    // Ensure NO stroke on preview shapes
    svgContent = svgContent.replace(/stroke="[^"]*"/gi, 'stroke="none"');
    svgContent = svgContent.replace(/stroke-width="[^"]*"/gi, 'stroke-width="0"');

    // Extract dimensions for center coordinate calculations
    let cx = 50, cy = 50, rx = 50;
    const viewBoxMatch = svgContent.match(/viewBox="0 0 ([0-9.]+) ([0-9.]+)"/i);
    if (viewBoxMatch) {
      const w = parseFloat(viewBoxMatch[1]);
      const h = parseFloat(viewBoxMatch[2]);
      cx = w / 2;
      cy = h / 2;
      rx = Math.min(w, h) / 2;
    } else {
      const widthMatch = svgContent.match(/width="([0-9.]+)"/i);
      const heightMatch = svgContent.match(/height="([0-9.]+)"/i);
      if (widthMatch && heightMatch) {
        const w = parseFloat(widthMatch[1]);
        const h = parseFloat(heightMatch[2]);
        cx = w / 2;
        cy = h / 2;
        rx = Math.min(w, h) / 2;
      }
    }

    // Inject dataset attributes so ElementShapesProperties.jsx recognizes and edits the shape
    const lowerName = filename.toLowerCase();
    const isStar = lowerName === 'star';
    const isTriangle = lowerName === 'triangle';
    const isPentagon = lowerName === 'pentagon';
    const isHexagon = lowerName === 'hexagon';
    const isPolygon = isTriangle || isPentagon || isHexagon;
    const isRect = ['rectangle', 'square', 'rounded rectangle', 'pill', 'oval', 'minus'].includes(lowerName);

    if (isStar || isPolygon) {
      const shapeType = isStar ? 'star' : 'polygon';
      const count = isStar ? 5 : (isTriangle ? 3 : (isPentagon ? 5 : 6));
      const extraAttrs = ` data-shape-type="${shapeType}" data-count="${count}" data-radius="0" data-cx="${cx}" data-cy="${cy}" data-rx="${rx}" data-is-element-shape="true"` + (isStar ? ' data-ratio="40"' : '');
      svgContent = svgContent.replace(/<(path|polygon)/i, `<$1${extraAttrs}`);
    } else if (isRect) {
      svgContent = svgContent.replace(/<rect/i, `<rect data-shape-type="rectangle" data-is-element-shape="true"`);
    } else {
      const isCircle = lowerName === 'circle';
      const isLine = lowerName.includes('line');
      const shapeType = isCircle ? 'ellipse' : (isLine ? 'line' : 'vector-path');
      svgContent = svgContent.replace(/<(path|circle|ellipse|line|polygon|polyline|rect)/i, `<$1 data-shape-type="${shapeType}" data-is-element-shape="true"`);
    }

    // Create a perfectly responsive preview SVG (removes hardcoded px width/height and adds preserveAspectRatio)
    let previewSvg = svgContent.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
      let a = attrs.trim();
      a = a.replace(/\bwidth="[0-9.]+"/gi, 'width="100%"');
      a = a.replace(/\bheight="[0-9.]+"/gi, 'height="100%"');
      if (!a.includes('preserveAspectRatio')) {
        a += ' preserveAspectRatio="xMidYMid meet"';
      }
      return `<svg ${a}>`;
    });

    return {
      name: filename,
      svgContent,
      previewSvg
    };
  });

// Format into element items for elementCatalog
export const SHAPE_ITEMS = parsedShapes.map((shape) => ({
  id: `shape-${shape.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
  name: shape.name,
  category: 'shapes',
  type: 'element-shape',
  svgContent: shape.svgContent,
  previewSvg: shape.previewSvg,
  renderPreview: () => (
    <div
      className="w-full h-full max-w-[2.8vw] max-h-[2.8vw] flex items-center justify-center pointer-events-none p-[0.15vw] [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain transition-transform duration-200 group-hover:scale-110"
      dangerouslySetInnerHTML={{ __html: shape.previewSvg }}
    />
  ),
  insert: (cx, cy) => createShapeSvgNode(shape, cx, cy)
}));

export default SHAPE_ITEMS;
