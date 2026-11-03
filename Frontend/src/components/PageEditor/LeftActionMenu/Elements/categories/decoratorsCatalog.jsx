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
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-[#090d16] border border-gray-800 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 p-[0.3vw] shadow-2xs">
          <svg
            viewBox={`0 0 ${preset.width || 100} ${preset.height || 100}`}
            className="w-full h-full object-contain max-h-[2.8vw]"
            preserveAspectRatio="xMidYMid meet"
            dangerouslySetInnerHTML={{ __html: processedSvg }}
          />
        </div>
      </div>
    );
  },
  insert: (cx, cy) => createDecoratorElementNode(preset, cx, cy)
}));

export default DECORATOR_ITEMS;
