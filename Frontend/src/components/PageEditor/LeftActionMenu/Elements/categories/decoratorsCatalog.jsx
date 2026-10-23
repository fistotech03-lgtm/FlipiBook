/**
 * decoratorsCatalog.jsx
 * Animated Decorators Presets Catalog for FlipiBook Elements Panel
 */
import React from 'react';
import { ANIMATED_SHAPES_PRESETS, createDecoratorElementNode } from '../utils/decoratorElementUtils';

export const DECORATOR_ITEMS = ANIMATED_SHAPES_PRESETS.map((preset) => ({
  id: `decorator-${preset.id}`,
  name: preset.name,
  category: 'decorators',
  type: 'decorator',
  renderPreview: () => {
    const processedSvg = (preset.svg || '')
      .replace(/COLOR_1/g, preset.color1 || '#00e5ff')
      .replace(/COLOR_2/g, preset.color2 || '#818cf8')
      .replace(/GLOW_COLOR/g, preset.glow || '#00e5ff');

    return (
      <div className="w-full h-full flex flex-col items-center justify-between p-[0.35vw] pointer-events-none select-none">
        <div className="w-full h-[70%] rounded-[0.25vw] bg-gray-900 border border-gray-800 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg
            viewBox={`0 0 ${preset.width || 100} ${preset.height || 100}`}
            className="w-[80%] h-[80%]"
            dangerouslySetInnerHTML={{ __html: processedSvg }}
          />
        </div>
        <div className="w-full text-center py-[0.1vw]">
          <span className="text-[0.58vw] font-medium text-gray-700 group-hover:text-blue-600 transition-colors truncate block">
            {preset.name}
          </span>
        </div>
      </div>
    );
  },
  insert: (cx, cy) => createDecoratorElementNode(preset, cx, cy)
}));
