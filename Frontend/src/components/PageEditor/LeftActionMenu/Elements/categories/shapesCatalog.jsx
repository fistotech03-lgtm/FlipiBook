import React from 'react';
import { SHAPES_DATA, generateShapeSvg, createShapeSvgNode } from '../utils/shapeElementUtils';

/**
 * ShapePreview
 * Renders the accurate vector SVG preview matching each Shape definition
 */
export const ShapePreview = ({ shape }) => {
  return (
    <svg
      viewBox={shape.viewBox || '0 0 100 100'}
      className="w-full h-full max-w-[2.8vw] max-h-[2.8vw] object-contain pointer-events-none select-none transition-transform duration-200 group-hover:scale-110"
    >
      <path
        d={shape.d}
        fill={shape.fill || '#d8e9fe'}
        stroke={shape.stroke || '#1E40AF'}
        strokeWidth={shape.strokeWidth || '2.5'}
        strokeLinejoin={shape.strokeLinejoin || 'round'}
        strokeLinecap={shape.strokeLinecap || 'round'}
        fillRule={shape.fillRule || 'evenodd'}
      />
    </svg>
  );
};

// Format code-defined vector shapes into element items for elementCatalog
export const SHAPE_ITEMS = SHAPES_DATA.map((shape) => {
  const svgContent = shape.svgContent || generateShapeSvg(shape);
  const previewSvg = svgContent.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    let a = attrs;
    a = a.replace(/(?<![\w-])width="[^"]*"/i, 'width="100%"');
    a = a.replace(/(?<![\w-])height="[^"]*"/i, 'height="100%"');
    if (!a.includes('preserveAspectRatio')) {
      a += ' preserveAspectRatio="xMidYMid meet"';
    }
    return `<svg ${a.trim()}>`;
  });

  return {
    id: `shape-${shape.id}`,
    name: shape.name,
    category: 'shapes',
    type: 'element-shape',
    shapeData: shape,
    svgContent,
    previewSvg,
    renderPreview: () => <ShapePreview shape={shape} />,
    insert: (cx, cy) => createShapeSvgNode(shape, cx, cy)
  };
});

export default SHAPE_ITEMS;
