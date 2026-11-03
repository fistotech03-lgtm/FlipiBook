/**
 * tableCatalog.jsx
 * Data Grid & Table Presets Catalog for FlipiBook Elements Panel
 */
import React from 'react';
import { TABLE_TEMPLATES, createTableElementNode, getTableSvgString } from '../utils/tableElementUtils';

export const TABLE_ITEMS = TABLE_TEMPLATES.map((tmpl) => ({
  id: tmpl.id,
  name: tmpl.name,
  category: 'tables',
  type: 'table',
  renderPreview: () => {
    const isDark = tmpl.id === 'table-dark-slate';

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-[0.35vw] pointer-events-none select-none">
        <div
          className="w-full h-[85%] rounded-[0.25vw] border flex flex-col overflow-hidden shadow-xs transition-transform group-hover:scale-[1.02]"
          style={{
            backgroundColor: tmpl.themeColor,
            borderColor: tmpl.borderColor
          }}
        >
          {/* Header Row Preview */}
          <div
            className="w-full h-[32%] flex items-center border-b px-[0.3vw] gap-[0.2vw]"
            style={{
              backgroundColor: tmpl.headerBg || (isDark ? '#1e293b' : '#f1f5f9'),
              borderColor: tmpl.borderColor
            }}
          >
            <div className="h-[0.25vw] rounded-full flex-1" style={{ backgroundColor: tmpl.headerColor || (isDark ? '#94a3b8' : '#64748b') }} />
            <div className="h-[0.25vw] rounded-full flex-1" style={{ backgroundColor: tmpl.headerColor || (isDark ? '#94a3b8' : '#64748b') }} />
            <div className="h-[0.25vw] rounded-full flex-1" style={{ backgroundColor: tmpl.headerColor || (isDark ? '#94a3b8' : '#64748b') }} />
          </div>

          {/* Row 1 Preview */}
          <div className="w-full h-[34%] flex items-center border-b px-[0.3vw] gap-[0.2vw]" style={{ borderColor: tmpl.borderColor }}>
            <div className="h-[0.2vw] rounded-full w-[45%]" style={{ backgroundColor: isDark ? '#475569' : '#cbd5e1' }} />
            <div className="h-[0.2vw] rounded-full w-[35%]" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }} />
            <div className="h-[0.2vw] rounded-full w-[20%]" style={{ backgroundColor: isDark ? '#475569' : '#cbd5e1' }} />
          </div>

          {/* Row 2 Preview */}
          <div className="w-full h-[34%] flex items-center px-[0.3vw] gap-[0.2vw]">
            <div className="h-[0.2vw] rounded-full w-[50%]" style={{ backgroundColor: isDark ? '#475569' : '#cbd5e1' }} />
            <div className="h-[0.2vw] rounded-full w-[30%]" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }} />
            <div className="h-[0.2vw] rounded-full w-[20%]" style={{ backgroundColor: isDark ? '#475569' : '#cbd5e1' }} />
          </div>
        </div>
      </div>
    );
  },
  insert: (cx, cy) => createTableElementNode(tmpl, cx, cy),
  getSvgString: (isDrag) => getTableSvgString(tmpl, isDrag)
}));
