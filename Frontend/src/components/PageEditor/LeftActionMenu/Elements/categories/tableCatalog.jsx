/**
 * tableCatalog.jsx
 * Data Grid & Table Presets Catalog for FlipiBook Elements Panel
 * Canva-Style 3x3 Grid Thumbnails with Multi-Color Variants
 */
import React from 'react';
import { TABLE_TEMPLATES, createTableElementNode, getTableSvgString } from '../utils/tableElementUtils';

/**
 * Clean Canva-style 3x3 thumbnail preview component
 */
export function TableThumbnailPreview({ tmpl }) {
  const outerBorderColor = tmpl.previewBorderColor || tmpl.borderColor || '#cbd5e1';
  const innerDividerColor = tmpl.borderColor || '#cbd5e1';
  const borderWidth = tmpl.borderWidth || 1;

  const rowColors = tmpl.rowBackgrounds || [
    tmpl.headerBg || tmpl.themeColor || '#ffffff',
    tmpl.themeColor || '#ffffff',
    tmpl.footerBg || tmpl.themeColor || '#ffffff'
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-[0.35vw] pointer-events-none select-none bg-[#f1f3f5] rounded-xl transition-transform duration-150 group-hover:scale-[1.03]">
      <div
        className="w-[82%] h-[72%] rounded-[2px] overflow-hidden flex flex-col shadow-2xs"
        style={{
          border: `${borderWidth}px solid ${outerBorderColor}`,
          boxSizing: 'border-box',
          backgroundColor: tmpl.themeColor || '#ffffff'
        }}
      >
        {[0, 1, 2].map((r) => (
          <div
            key={r}
            className="flex-1 flex"
            style={{
              borderBottom: r < 2 ? `${borderWidth}px solid ${innerDividerColor}` : 'none',
              boxSizing: 'border-box'
            }}
          >
            {[0, 1, 2].map((c) => (
              <div
                key={c}
                className="flex-1"
                style={{
                  backgroundColor: rowColors[r] || '#ffffff',
                  borderRight: c < 2 ? `${borderWidth}px solid ${innerDividerColor}` : 'none',
                  boxSizing: 'border-box'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const TABLE_ITEMS = TABLE_TEMPLATES.map((tmpl) => ({
  id: tmpl.id,
  name: tmpl.name,
  subtopic: tmpl.subtopic,
  category: 'tables',
  type: 'table',
  renderPreview: () => <TableThumbnailPreview tmpl={tmpl} />,
  insert: (cx, cy) => createTableElementNode(tmpl, cx, cy),
  getSvgString: (isDrag) => getTableSvgString(tmpl, isDrag)
}));

