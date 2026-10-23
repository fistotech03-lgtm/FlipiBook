/**
 * ElementTableProperties.jsx
 * Dedicated Property Inspector for Data Grid & Table Elements in FlipiBook
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Minus,
  Upload,
  Download,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { exportTableToExcel, importExcelToTable } from '../utils/tableElementUtils';
import { TableMatrix } from '../helpers/TableMatrix';

const FONT_FAMILIES = [
  'Poppins',
  'Inter',
  'Roboto',
  'Arial',
  'Montserrat',
  'Lato',
  'Open Sans',
  'Playfair Display'
];

const FONT_SIZES = [8, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32];

const BORDER_STYLES = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed' },
  { id: 'dotted', label: 'Dotted' },
  { id: 'double', label: 'Double' },
  { id: 'none', label: 'None' }
];

export default function ElementTableProperties({
  selectedElement,
  updateElementAttribute,
  activePageIndex,
  selectedLayerId
}) {
  const fileInputRef = useRef(null);

  // Inspector State
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [themeColor, setThemeColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#cbd5e1');
  const [borderWidth, setBorderWidth] = useState(1.5);
  const [borderStyle, setBorderStyle] = useState('solid');
  const [borderRadius, setBorderRadius] = useState(0);
  const [cellColor, setCellColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [fontSize, setFontSize] = useState(13);
  const [fontWeight, setFontWeight] = useState('Regular');
  const [textAlign, setTextAlign] = useState('left');
  const [verticalAlign, setVerticalAlign] = useState('middle');
  const [paddingX, setPaddingX] = useState(8);
  const [paddingY, setPaddingY] = useState(6);
  const [textWrapping, setTextWrapping] = useState(true);

  // Read current table state
  useEffect(() => {
    if (!selectedElement) return;

    const r = parseInt(selectedElement.getAttribute('data-rows') || '3', 10);
    const c = parseInt(selectedElement.getAttribute('data-cols') || '3', 10);
    const tc = selectedElement.getAttribute('data-theme-color') || '#ffffff';
    const bc = selectedElement.getAttribute('data-border-color') || '#cbd5e1';
    const bw = parseFloat(selectedElement.getAttribute('data-border-width') || '1.5');
    const bs = selectedElement.getAttribute('data-border-style') || 'solid';
    const br = parseInt(selectedElement.getAttribute('data-border-radius') || '0', 10);
    const cc = selectedElement.getAttribute('data-cell-color') || '#000000';
    const ff = selectedElement.getAttribute('data-font-family') || 'Poppins';
    const fsVal = parseInt(selectedElement.getAttribute('data-font-size') || '13', 10);
    const fw = selectedElement.getAttribute('data-font-weight') || 'Regular';
    const ta = selectedElement.getAttribute('data-text-align') || 'left';
    const va = selectedElement.getAttribute('data-vertical-align') || 'middle';
    const px = parseInt(selectedElement.getAttribute('data-padding-x') || '8', 10);
    const py = parseInt(selectedElement.getAttribute('data-padding-y') || '6', 10);
    const wrap = selectedElement.getAttribute('data-text-wrapping') !== 'false';

    setRows(r);
    setCols(c);
    setThemeColor(tc);
    setBorderColor(bc);
    setBorderWidth(isNaN(bw) ? 1.5 : bw);
    setBorderStyle(bs);
    setBorderRadius(isNaN(br) ? 0 : br);
    setCellColor(cc);
    setFontFamily(ff);
    setFontSize(isNaN(fsVal) ? 13 : fsVal);
    setFontWeight(fw);
    setTextAlign(ta);
    setVerticalAlign(va);
    setPaddingX(px);
    setPaddingY(py);
    setTextWrapping(wrap);
  }, [selectedElement, selectedLayerId]);

  // Sync DOM changes
  const notifyDomChange = () => {
    if (updateElementAttribute && selectedLayerId && selectedElement) {
      updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', selectedElement.outerHTML);
    }
  };

  // Helper to re-render table from matrix model
  const syncTableFromMatrix = (matrix) => {
    if (!selectedElement) return;
    const table = selectedElement.querySelector('table');
    if (!table) return;

    const newHtml = matrix.toHtml({
      themeColor,
      borderColor,
      borderWidth,
      borderStyle,
      cellColor,
      fontFamily,
      fontSize,
      fontWeight,
      textAlign,
      verticalAlign,
      paddingX,
      paddingY,
      textWrapping,
    });

    const wrapper = table.parentElement;
    if (wrapper) {
      wrapper.innerHTML = newHtml;
    }

    selectedElement.setAttribute('data-rows', String(matrix.rows));
    selectedElement.setAttribute('data-cols', String(matrix.cols));
    setRows(matrix.rows);
    setCols(matrix.cols);
    notifyDomChange();
  };

  // Row Manipulation via 2D Matrix
  const handleAddRow = () => {
    if (!selectedElement) return;
    const table = selectedElement.querySelector('table');
    if (!table) return;

    const matrix = TableMatrix.fromDOM(table);
    matrix.addRow();
    syncTableFromMatrix(matrix);
  };

  const handleDeleteRow = () => {
    if (!selectedElement) return;
    const table = selectedElement.querySelector('table');
    if (!table) return;

    const matrix = TableMatrix.fromDOM(table);
    if (matrix.deleteRow()) {
      syncTableFromMatrix(matrix);
    }
  };

  // Column Manipulation via 2D Matrix
  const handleAddColumn = () => {
    if (!selectedElement) return;
    const table = selectedElement.querySelector('table');
    if (!table) return;

    const matrix = TableMatrix.fromDOM(table);
    matrix.addColumn();
    syncTableFromMatrix(matrix);
  };

  const handleDeleteColumn = () => {
    if (!selectedElement) return;
    const table = selectedElement.querySelector('table');
    if (!table) return;

    const matrix = TableMatrix.fromDOM(table);
    if (matrix.deleteColumn()) {
      syncTableFromMatrix(matrix);
    }
  };

  // Styling updates
  const updateTableStyle = (attrName, val, cssUpdater) => {
    if (!selectedElement) return;
    selectedElement.setAttribute(attrName, String(val));

    const table = selectedElement.querySelector('table');
    if (table && cssUpdater) {
      cssUpdater(table);
    }
    notifyDomChange();
  };

  const handleThemeColorChange = (color) => {
    setThemeColor(color);
    updateTableStyle('data-theme-color', color, (tbl) => {
      tbl.style.backgroundColor = color;
      tbl.querySelectorAll('td').forEach((td) => {
        td.style.backgroundColor = color;
      });
    });
  };

  const handleBorderColorChange = (color) => {
    setBorderColor(color);
    updateTableStyle('data-border-color', color, (tbl) => {
      tbl.style.borderColor = color;
      tbl.querySelectorAll('td').forEach((td) => {
        td.style.borderColor = color;
      });
    });
  };

  const handleBorderWidthChange = (val) => {
    const num = parseFloat(val) || 0;
    setBorderWidth(num);
    updateTableStyle('data-border-width', num, (tbl) => {
      tbl.style.borderWidth = `${num}px`;
      tbl.querySelectorAll('td').forEach((td) => {
        td.style.borderWidth = `${num}px`;
      });
    });
  };

  const handleBorderStyleChange = (style) => {
    setBorderStyle(style);
    updateTableStyle('data-border-style', style, (tbl) => {
      tbl.style.borderStyle = style;
      tbl.querySelectorAll('td').forEach((td) => {
        td.style.borderStyle = style;
      });
    });
  };

  const handleBorderRadiusChange = (radius) => {
    setBorderRadius(radius);
    updateTableStyle('data-border-radius', radius, () => {
      const wrapper = selectedElement.querySelector('.table-card-wrapper');
      if (wrapper) wrapper.style.borderRadius = `${radius}px`;
    });
  };

  const handleCellColorChange = (color) => {
    setCellColor(color);
    updateTableStyle('data-cell-color', color, (tbl) => {
      tbl.querySelectorAll('td').forEach((td) => {
        td.style.color = color;
      });
    });
  };

  const handleFontFamilyChange = (ff) => {
    setFontFamily(ff);
    updateTableStyle('data-font-family', ff, (tbl) => {
      tbl.style.fontFamily = `'${ff}', sans-serif`;
    });
  };

  const handleFontSizeChange = (sz) => {
    setFontSize(sz);
    updateTableStyle('data-font-size', sz, (tbl) => {
      tbl.style.fontSize = `${sz}px`;
    });
  };


  const handleTextAlignChange = (align) => {
    setTextAlign(align);
    updateTableStyle('data-text-align', align, (tbl) => {
      tbl.querySelectorAll('td').forEach((td) => {
        td.style.textAlign = align;
      });
    });
  };

  const handlePaddingChange = (px, py) => {
    setPaddingX(px);
    setPaddingY(py);
    selectedElement.setAttribute('data-padding-x', String(px));
    selectedElement.setAttribute('data-padding-y', String(py));
    const table = selectedElement.querySelector('table');
    if (table) {
      table.querySelectorAll('td').forEach((td) => {
        td.style.padding = `${py}px ${px}px`;
      });
    }
    notifyDomChange();
  };

  // Excel handlers
  const handleExportExcel = async () => {
    if (!selectedElement) return;
    await exportTableToExcel(selectedElement, `flipibook-table-${Date.now()}.xlsx`);
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement) return;
    await importExcelToTable(file, selectedElement);
    const r = parseInt(selectedElement.getAttribute('data-rows') || '3', 10);
    const c = parseInt(selectedElement.getAttribute('data-cols') || '3', 10);
    setRows(r);
    setCols(c);
    notifyDomChange();
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-[0.8vw] p-[0.6vw] text-gray-700 custom-scrollbar text-[0.72vw]">
      {/* Header & Quick Excel Actions */}
      <div className="flex items-center justify-between pb-[0.4vw] border-b border-gray-100">
        <span className="font-semibold text-gray-800 text-[0.82vw]">Table & Data Grid</span>
        <div className="flex items-center gap-[0.3vw]">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import from Excel (.xlsx)"
            className="p-[0.25vw] bg-white border border-gray-200 rounded-[0.25vw] hover:bg-gray-50 hover:border-gray-300 text-gray-600 transition-colors cursor-pointer"
          >
            <Upload size="0.75vw" />
          </button>
          <button
            onClick={handleExportExcel}
            title="Export to Excel (.xlsx)"
            className="p-[0.25vw] bg-white border border-gray-200 rounded-[0.25vw] hover:bg-gray-50 hover:border-gray-300 text-gray-600 transition-colors cursor-pointer"
          >
            <Download size="0.75vw" />
          </button>
        </div>
      </div>

      {/* Grid Structure Control (Rows / Columns) */}
      <div className="flex flex-col gap-[0.4vw] bg-gray-50/80 p-[0.5vw] rounded-[0.35vw] border border-gray-100">
        <span className="text-[0.65vw] font-medium text-gray-500 uppercase tracking-wider">Structure</span>
        <div className="grid grid-cols-2 gap-[0.5vw]">
          {/* Rows */}
          <div className="flex items-center justify-between bg-white px-[0.4vw] py-[0.25vw] rounded-[0.25vw] border border-gray-200">
            <span className="text-[0.68vw] text-gray-600 font-medium">Rows: {rows}</span>
            <div className="flex items-center gap-[0.15vw]">
              <button
                onClick={handleDeleteRow}
                disabled={rows <= 1}
                className="p-[0.15vw] hover:bg-gray-100 rounded text-gray-500 disabled:opacity-40 cursor-pointer"
              >
                <Minus size="0.6vw" />
              </button>
              <button
                onClick={handleAddRow}
                className="p-[0.15vw] hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
              >
                <Plus size="0.6vw" />
              </button>
            </div>
          </div>

          {/* Columns */}
          <div className="flex items-center justify-between bg-white px-[0.4vw] py-[0.25vw] rounded-[0.25vw] border border-gray-200">
            <span className="text-[0.68vw] text-gray-600 font-medium">Cols: {cols}</span>
            <div className="flex items-center gap-[0.15vw]">
              <button
                onClick={handleDeleteColumn}
                disabled={cols <= 1}
                className="p-[0.15vw] hover:bg-gray-100 rounded text-gray-500 disabled:opacity-40 cursor-pointer"
              >
                <Minus size="0.6vw" />
              </button>
              <button
                onClick={handleAddColumn}
                className="p-[0.15vw] hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
              >
                <Plus size="0.6vw" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Borders & Outlines */}
      <div className="flex flex-col gap-[0.4vw]">
        <span className="text-[0.65vw] font-medium text-gray-500 uppercase tracking-wider">Borders & Radius</span>
        <div className="grid grid-cols-2 gap-[0.4vw]">
          <div className="flex flex-col gap-[0.2vw]">
            <label className="text-[0.62vw] text-gray-500">Border Color</label>
            <div className="flex items-center gap-[0.3vw] bg-white border border-gray-200 rounded-[0.3vw] px-[0.3vw] py-[0.2vw]">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => handleBorderColorChange(e.target.value)}
                className="w-[1.2vw] h-[1.2vw] rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-[0.65vw] text-gray-700">{borderColor}</span>
            </div>
          </div>

          <div className="flex flex-col gap-[0.2vw]">
            <label className="text-[0.62vw] text-gray-500">Table Background</label>
            <div className="flex items-center gap-[0.3vw] bg-white border border-gray-200 rounded-[0.3vw] px-[0.3vw] py-[0.2vw]">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => handleThemeColorChange(e.target.value)}
                className="w-[1.2vw] h-[1.2vw] rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-[0.65vw] text-gray-700">{themeColor}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[0.4vw]">
          {/* Border Width */}
          <div className="flex flex-col gap-[0.2vw]">
            <label className="text-[0.62vw] text-gray-500">Width ({borderWidth}px)</label>
            <input
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={borderWidth}
              onChange={(e) => handleBorderWidthChange(e.target.value)}
              className="accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Border Radius */}
          <div className="flex flex-col gap-[0.2vw]">
            <label className="text-[0.62vw] text-gray-500">Corner Radius ({borderRadius}px)</label>
            <input
              type="range"
              min="0"
              max="16"
              step="1"
              value={borderRadius}
              onChange={(e) => handleBorderRadiusChange(e.target.value)}
              className="accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Border Style Pills */}
        <div className="flex items-center gap-[0.2vw] bg-gray-50 p-[0.2vw] rounded-[0.3vw] border border-gray-200">
          {BORDER_STYLES.map((st) => (
            <button
              key={st.id}
              onClick={() => handleBorderStyleChange(st.id)}
              className={`flex-1 py-[0.2vw] text-[0.62vw] font-medium rounded-[0.2vw] transition-all cursor-pointer ${
                borderStyle === st.id ? 'bg-white shadow-xs text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Typography & Cell Styling */}
      <div className="flex flex-col gap-[0.4vw] pt-[0.4vw] border-t border-gray-100">
        <span className="text-[0.65vw] font-medium text-gray-500 uppercase tracking-wider">Cell Typography</span>

        <div className="grid grid-cols-2 gap-[0.4vw]">
          {/* Font Family */}
          <div className="flex flex-col gap-[0.2vw]">
            <label className="text-[0.62vw] text-gray-500">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-[0.25vw] px-[0.3vw] py-[0.2vw] text-[0.68vw]"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="flex flex-col gap-[0.2vw]">
            <label className="text-[0.62vw] text-gray-500">Size</label>
            <select
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-[0.25vw] px-[0.3vw] py-[0.2vw] text-[0.68vw]"
            >
              {FONT_SIZES.map((sz) => (
                <option key={sz} value={sz}>{sz}px</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[0.4vw]">
          {/* Text Color */}
          <div className="flex flex-col gap-[0.2vw]">
            <label className="text-[0.62vw] text-gray-500">Text Color</label>
            <div className="flex items-center gap-[0.3vw] bg-white border border-gray-200 rounded-[0.3vw] px-[0.3vw] py-[0.2vw]">
              <input
                type="color"
                value={cellColor}
                onChange={(e) => handleCellColorChange(e.target.value)}
                className="w-[1.2vw] h-[1.2vw] rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-[0.65vw] text-gray-700">{cellColor}</span>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="flex flex-col gap-[0.2vw]">
            <label className="text-[0.62vw] text-gray-500">Align</label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-[0.3vw] p-[0.15vw]">
              <button
                onClick={() => handleTextAlignChange('left')}
                className={`flex-1 py-[0.2vw] flex items-center justify-center rounded-[0.2vw] cursor-pointer ${
                  textAlign === 'left' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <AlignLeft size="0.65vw" />
              </button>
              <button
                onClick={() => handleTextAlignChange('center')}
                className={`flex-1 py-[0.2vw] flex items-center justify-center rounded-[0.2vw] cursor-pointer ${
                  textAlign === 'center' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <AlignCenter size="0.65vw" />
              </button>
              <button
                onClick={() => handleTextAlignChange('right')}
                className={`flex-1 py-[0.2vw] flex items-center justify-center rounded-[0.2vw] cursor-pointer ${
                  textAlign === 'right' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <AlignRight size="0.65vw" />
              </button>
            </div>
          </div>
        </div>

        {/* Cell Padding */}
        <div className="grid grid-cols-2 gap-[0.4vw]">
          <div className="flex flex-col gap-[0.2vw]">
            <label className="text-[0.62vw] text-gray-500">Padding X ({paddingX}px)</label>
            <input
              type="range"
              min="2"
              max="20"
              value={paddingX}
              onChange={(e) => handlePaddingChange(parseInt(e.target.value, 10), paddingY)}
              className="accent-blue-600 cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-[0.2vw]">
            <label className="text-[0.62vw] text-gray-500">Padding Y ({paddingY}px)</label>
            <input
              type="range"
              min="2"
              max="20"
              value={paddingY}
              onChange={(e) => handlePaddingChange(paddingX, parseInt(e.target.value, 10))}
              className="accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
