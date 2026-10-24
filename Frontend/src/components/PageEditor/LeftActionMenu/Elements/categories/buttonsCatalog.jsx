import React from 'react';
import { BUTTON_TEMPLATES, createButtonElementNode } from '../utils/buttonElementUtils';

export const BUTTON_ITEMS = BUTTON_TEMPLATES.map((tmpl) => ({
  id: tmpl.id,
  name: tmpl.name,
  category: 'buttons',
  type: 'button',
  renderPreview: () => {
    const isRibbon = tmpl.isRibbon;
    const isParallelogram = tmpl.isParallelogram;
    const isDiamond = tmpl.isDiamond;
    const isArrow = tmpl.isArrow;
    const isGradient = tmpl.isGradient;

    return (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] pointer-events-none select-none">
        {isRibbon ? (
          <div
            className="w-full py-[0.35vw] text-[0.62vw] font-bold text-white text-center rounded-[0.2vw] shadow-sm uppercase tracking-wider relative"
            style={{ backgroundColor: tmpl.fill }}
          >
            {tmpl.text}
          </div>
        ) : isParallelogram ? (
          <div
            className="w-[88%] py-[0.35vw] text-[0.62vw] font-bold text-white text-center transform -skew-x-12 shadow-sm uppercase tracking-wider"
            style={{ backgroundColor: tmpl.fill }}
          >
            {tmpl.text}
          </div>
        ) : isDiamond || isArrow ? (
          <div
            className="w-full py-[0.35vw] text-[0.6vw] font-bold text-white text-center rounded-[0.3vw] shadow-sm uppercase tracking-wider"
            style={{
              background: tmpl.gradientColors
                ? `linear-gradient(90deg, ${tmpl.gradientColors[0]}, ${tmpl.gradientColors[1]})`
                : tmpl.fill
            }}
          >
            {tmpl.text}
          </div>
        ) : isGradient ? (
          <div
            className="w-full py-[0.4vw] text-[0.65vw] font-extrabold text-white text-center rounded-full shadow-sm uppercase tracking-wider"
            style={{
              background: `linear-gradient(90deg, ${tmpl.gradientColors[0]}, ${tmpl.gradientColors[1]})`
            }}
          >
            {tmpl.text}
          </div>
        ) : (
          <div
            className="w-full py-[0.35vw] text-[0.65vw] font-semibold text-center border shadow-sm truncate px-[0.4vw]"
            style={{
              backgroundColor: tmpl.fill,
              color: tmpl.textColor,
              borderColor: tmpl.stroke !== 'none' ? tmpl.stroke : 'transparent',
              borderRadius: tmpl.rx ? `${tmpl.rx / 4}px` : '4px'
            }}
          >
            {tmpl.text}
          </div>
        )}
      </div>
    );
  },
  insert: (cx, cy) => createButtonElementNode(tmpl, cx, cy)
}));
