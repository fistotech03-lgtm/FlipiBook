import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ArrowLeftRight,
  ArrowUpDown,
  Upload,
  Download,
  Copy,
  ClipboardPaste,
  Edit3,
  Check,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Combine,
  Split,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { TableMatrix } from '../helpers/TableMatrix';
import { normalizeForeignObjectNamespaces } from '../utils/tableElementUtils';
import Color from '../../../properties/FillStrokeProperties';
import ColorPicker from '../../../../Color';
import { PropertySlider, handleScrubHelper, ScrubPercentInput } from '../../../properties/controls/propertiesShared';
import {
  fontFamilies,
  fontWeights,
  loadGoogleFont,
  weightToNumeric,
  normalizeToTailwindWeight
} from '../../../properties/TextProperties';
import { FONT_FAMILIES } from '../../../../../config/fonts';


const BORDER_STYLES = [
  { id: 'solid', label: 'Solid', icon: '—' },
  { id: 'dashed', label: 'Dashed', icon: '- -' },
  { id: 'dotted', label: 'Dotted', icon: '···' },
  { id: 'double', label: 'Double', icon: '==' },
  { id: 'none', label: 'None', icon: '✕' }
];

const hexToRgba = (hex, opacity = 100) => {
  if (!hex || hex === 'transparent' || hex === 'none') return 'transparent';
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const a = Math.max(0, Math.min(1, (Number(opacity) || 100) / 100));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * Custom dashed table lines (Dash Property L / G). CSS "dashed" borders use a fixed browser pattern, so
 * when the table's stroke is dashed the lines are painted as repeating gradients on each cell instead:
 * every cell draws its top + left line (last column / last row also draw right / bottom), borders stay
 * transparent to keep the spacing. Reads ONLY the table element's saved attributes, so it can be re-run
 * after anything that rewrites cell borders. Solid / none → removes the painted dashes again.
 */
const applyTableDashPattern = (el) => {
  const table = el?.querySelector?.('table');
  if (!table) return;
  const cells = Array.from(table.querySelectorAll('td, th'));
  const style = el.getAttribute('data-border-style');
  const width = parseFloat(el.getAttribute('data-border-width') || '1') || 0;
  const preset = el.getAttribute('data-border-preset') || 'all';

  const clearDash = () => {
    if (table.getAttribute('data-dash-applied') !== 'true') return;
    table.removeAttribute('data-dash-applied');
    table.style.borderCollapse = 'collapse';
    table.style.removeProperty('border-spacing');
    cells.forEach((c) => {
      ['background-image', 'background-size', 'background-position', 'background-repeat', 'background-origin'].forEach((p) => c.style.removeProperty(p));
      c.style.borderStyle = style && style !== 'none' ? style : 'solid';
    });
  };

  if ((style !== 'dashed' && style !== 'dotted') || !(width > 0) || preset === 'none') { clearDash(); return; }

  const color = hexToRgba(el.getAttribute('data-border-color') || '#000000', el.getAttribute('data-border-opacity') || 100);
  const L = Math.max(1, parseFloat(el.getAttribute('data-dash-l') || '8') || 8);
  const G = Math.max(1, parseFloat(el.getAttribute('data-dash-g') || '4') || 4);
  const hLine = `repeating-linear-gradient(to right, ${color} 0 ${L}px, transparent ${L}px ${L + G}px)`;
  const vLine = `repeating-linear-gradient(to bottom, ${color} 0 ${L}px, transparent ${L}px ${L + G}px)`;

  // logical grid position of every cell (merged cells span several slots)
  const trs = Array.from(table.querySelectorAll('tr'));
  const occ = trs.map(() => []);
  const pos = new Map();
  let totalCols = 0;
  trs.forEach((tr, r) => {
    let c = 0;
    Array.from(tr.children).forEach((td) => {
      const tag = td.tagName.toLowerCase();
      if (tag !== 'td' && tag !== 'th') return;
      while (occ[r][c]) c++;
      const cs = parseInt(td.getAttribute('colspan') || '1', 10);
      const rs = parseInt(td.getAttribute('rowspan') || '1', 10);
      for (let dr = 0; dr < rs; dr++) for (let dc = 0; dc < cs; dc++) { if (!occ[r + dr]) occ[r + dr] = []; occ[r + dr][c + dc] = true; }
      pos.set(td, { r, c, rs, cs });
      c += cs;
      totalCols = Math.max(totalCols, c);
    });
  });
  const totalRows = trs.length;

  table.setAttribute('data-dash-applied', 'true');
  table.style.borderCollapse = 'separate';
  table.style.borderSpacing = '0';
  table.style.border = 'none';

  cells.forEach((cell) => {
    const p = pos.get(cell) || { r: 0, c: 0, rs: 1, cs: 1 };
    const top = preset === 'outer' ? p.r === 0 : true;
    const left = preset === 'outer' ? p.c === 0 : true;
    const right = p.c + p.cs >= totalCols;
    const bottom = p.r + p.rs >= totalRows;
    const imgs = [], sizes = [], places = [];
    if (top) { imgs.push(hLine); sizes.push(`100% ${width}px`); places.push('0 0'); }
    if (left) { imgs.push(vLine); sizes.push(`${width}px 100%`); places.push('0 0'); }
    if (right) { imgs.push(vLine); sizes.push(`${width}px 100%`); places.push('100% 0'); }
    if (bottom) { imgs.push(hLine); sizes.push(`100% ${width}px`); places.push('0 100%'); }
    cell.style.borderStyle = 'solid';
    cell.style.borderColor = 'transparent';
    cell.style.borderTopWidth = top ? `${width}px` : '0px';
    cell.style.borderLeftWidth = left ? `${width}px` : '0px';
    cell.style.borderRightWidth = right ? `${width}px` : '0px';
    cell.style.borderBottomWidth = bottom ? `${width}px` : '0px';
    if (imgs.length) {
      cell.style.backgroundImage = imgs.join(', ');
      cell.style.backgroundSize = sizes.join(', ');
      cell.style.backgroundPosition = places.join(', ');
      cell.style.backgroundRepeat = 'no-repeat';
      cell.style.backgroundOrigin = 'border-box';
    } else {
      ['background-image', 'background-size', 'background-position', 'background-repeat', 'background-origin'].forEach((q) => cell.style.removeProperty(q));
    }
  });
};

/**
 * Fit an imported (auto-height) table to its content: every column at least as wide as its longest
 * rendered word (table widens if they cannot all fit; spare width shared by content weight stored in
 * data-col-weights), and the foreignObject height = the table's natural height. Idempotent, so it can
 * be re-run after other effects touch the table. Returns true when it changed something.
 */
export const fitTableToContent = (el) => {
  const table = el?.querySelector?.('table');
  const fo = el?.querySelector?.('foreignObject');
  if (!table || !fo) return false;
  const trs = Array.from(table.querySelectorAll('tr'));
  if (!trs.length) return false;

  let totalCols = 0;
  trs.forEach((tr) => {
    let n = 0;
    Array.from(tr.children).forEach((td) => { n += parseInt(td.getAttribute('colspan') || '1', 10); });
    totalCols = Math.max(totalCols, n);
  });
  if (!totalCols) return false;

  let weights = [];
  try { weights = JSON.parse(el.getAttribute('data-col-weights') || '[]'); } catch { weights = []; }
  if (weights.length !== totalCols) weights = Array.from({ length: totalCols }, () => 1);

  // longest rendered word per column (single-span cells only)
  const minW = Array.from({ length: totalCols }, () => 0);
  trs.forEach((tr) => {
    let c = 0;
    Array.from(tr.children).forEach((td) => {
      const span = parseInt(td.getAttribute('colspan') || '1', 10);
      if (span === 1) {
        const cs = window.getComputedStyle(td);
        const chrome = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) +
          (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
        const words = (td.textContent || '').split(/\s+/).filter(Boolean);
        if (!words.length) {
          minW[c] = Math.max(minW[c], chrome + 8);
        } else {
          const probe = document.createElement('span');
          probe.style.cssText = 'white-space:nowrap;position:absolute;visibility:hidden;';
          td.appendChild(probe);
          words.forEach((w) => { probe.textContent = w; minW[c] = Math.max(minW[c], probe.offsetWidth + chrome + 2); });
          probe.remove();
        }
      }
      c += span;
    });
  });

  const curW = parseFloat(fo.getAttribute('width')) || table.offsetWidth || 1;
  const needW = minW.reduce((a, b) => a + b, 0);
  let finalW = curW;
  let colPx;
  if (needW > curW) {
    finalW = Math.ceil(needW);
    colPx = minW;
  } else {
    const spare = curW - needW;
    const wSum = weights.reduce((a, b) => a + b, 0) || 1;
    colPx = minW.map((m, i) => m + spare * (weights[i] / wSum));
  }
  let changed = false;
  if (Math.abs(finalW - curW) > 0.5) { fo.setAttribute('width', String(finalW)); changed = true; }

  let colgroup = table.querySelector('colgroup');
  if (!colgroup) { colgroup = document.createElement('colgroup'); table.insertBefore(colgroup, table.firstChild); }
  const sum = colPx.reduce((a, b) => a + b, 0) || 1;
  const pcts = colPx.map((w) => `${((w / sum) * 100).toFixed(3)}%`);
  const curPcts = Array.from(colgroup.querySelectorAll('col')).map((col) => parseFloat(col.style.width) || 0);
  const differs = curPcts.length !== pcts.length || pcts.some((pc, i) => Math.abs(parseFloat(pc) - curPcts[i]) > 0.05);
  if (differs) {
    colgroup.innerHTML = '';
    pcts.forEach((pc) => { const col = document.createElement('col'); col.style.width = pc; colgroup.appendChild(col); });
    changed = true;
  }
  table.style.tableLayout = 'fixed';
  table.style.width = '100%';

  // rows size to content; the box takes the table's natural height
  trs.forEach((tr) => tr.style.removeProperty('height'));
  const prevH = table.style.height;
  table.style.height = 'auto';
  const natural = Math.ceil(table.offsetHeight || 0);
  table.style.height = prevH || '100%';
  if (natural > 0 && Math.abs(natural - (parseFloat(fo.getAttribute('height')) || 0)) > 0.5) {
    fo.setAttribute('height', String(natural));
    changed = true;
  }
  return changed;
};

const parseRgbaColor = (colorStr, defaultHex = '#ffffff') => {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'inherit' || colorStr === 'none' || colorStr === 'rgba(0, 0, 0, 0)') {
    return { hex: defaultHex, opacity: 100 };
  }
  if (colorStr.startsWith('#')) {
    let clean = colorStr.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    if (clean.length === 6) return { hex: `#${clean}`, opacity: 100 };
    if (clean.length === 8) {
      const hex = `#${clean.slice(0, 6)}`;
      const alpha = Math.round((parseInt(clean.slice(6, 8), 16) / 255) * 100);
      return { hex, opacity: alpha };
    }
  }
  const match = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (match) {
    const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
    const a = match[4] !== undefined ? Math.round(parseFloat(match[4]) * 100) : 100;
    return { hex: `#${r}${g}${b}`, opacity: a };
  }
  // Named CSS color or other valid CSS format fallback
  try {
    const temp = document.createElement('div');
    temp.style.color = colorStr;
    document.body.appendChild(temp);
    const computed = window.getComputedStyle(temp).color;
    document.body.removeChild(temp);
    const m = computed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (m) {
      const r = parseInt(m[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(m[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(m[3], 10).toString(16).padStart(2, '0');
      const a = m[4] !== undefined ? Math.round(parseFloat(m[4]) * 100) : 100;
      return { hex: `#${r}${g}${b}`, opacity: a };
    }
  } catch (e) {}
  return { hex: defaultHex, opacity: 100 };
};

const extractCellFillColor = (td, tableEl) => {
  if (!td) return { hex: '#ffffff', opacity: 100 };
  const tableDefaultTheme = tableEl?.getAttribute('data-theme-color') || '#ffffff';
  const tableDefaultThemeOpacity = parseInt(tableEl?.getAttribute('data-theme-opacity') || '100', 10);

  // 1. Explicit cell data attributes
  const explicitBg = td.getAttribute('data-cell-bg-color') || td.getAttribute('data-cell-bg');
  const explicitOpacity = td.getAttribute('data-cell-bg-opacity');
  if (explicitBg && explicitBg !== 'transparent' && explicitBg !== 'none') {
    const parsed = parseRgbaColor(explicitBg, tableDefaultTheme);
    return {
      hex: parsed.hex,
      opacity: explicitOpacity !== null && explicitOpacity !== undefined ? parseInt(explicitOpacity, 10) : parsed.opacity
    };
  }

  // 2. Inline style
  const inlineBg = td.style.backgroundColor;
  if (inlineBg && inlineBg !== 'transparent' && inlineBg !== 'rgba(0, 0, 0, 0)') {
    const parsed = parseRgbaColor(inlineBg, tableDefaultTheme);
    return {
      hex: parsed.hex,
      opacity: explicitOpacity !== null && explicitOpacity !== undefined ? parseInt(explicitOpacity, 10) : parsed.opacity
    };
  }

  // 3. Computed style
  try {
    const compBg = window.getComputedStyle(td).backgroundColor;
    if (compBg && compBg !== 'transparent' && compBg !== 'rgba(0, 0, 0, 0)') {
      const parsed = parseRgbaColor(compBg, tableDefaultTheme);
      return {
        hex: parsed.hex,
        opacity: explicitOpacity !== null && explicitOpacity !== undefined ? parseInt(explicitOpacity, 10) : parsed.opacity
      };
    }
  } catch (e) {}

  return {
    hex: tableDefaultTheme,
    opacity: tableDefaultThemeOpacity
  };
};

// Helper to construct a complete 2D matrix of cell references accounting for rowspan and colspan
const buildTableGrid = (table) => {
  if (!table) return [];
  const trs = Array.from(table.querySelectorAll('tr'));
  const grid = [];
  trs.forEach((tr, rIdx) => {
    if (!grid[rIdx]) grid[rIdx] = [];
    let cIdx = 0;
    Array.from(tr.children).forEach(cell => {
      while (grid[rIdx][cIdx]) {
        cIdx++;
      }
      const rSpan = parseInt(cell.getAttribute('rowspan') || '1', 10);
      const cSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
      for (let dr = 0; dr < rSpan; dr++) {
        if (!grid[rIdx + dr]) grid[rIdx + dr] = [];
        for (let dc = 0; dc < cSpan; dc++) {
          grid[rIdx + dr][cIdx + dc] = cell;
        }
      }
      cIdx += cSpan;
    });
  });
  return grid;
};

const getColLetter = (colIdx) => {
  let temp, letter = '';
  let col = Number(colIdx) + 1;
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    col = Math.floor((col - temp) / 26);
  }
  return letter || 'A';
};

// Section Header matching ShapeProperties style
const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-[0.8vw] mb-[0.25vw] mt-[0.2vw]">
    <span className="text-[0.82vw] font-semibold text-gray-900 whitespace-nowrap">{title}</span>
    <div className="flex-1 h-[1px] bg-gray-200" />
  </div>
);

// Exact ColorBox matching user screenshot and Color.jsx
const ColorBoxRow = ({
  title,
  color,
  opacity = 100,
  onOpenPicker,
  onChange,
  onOpacityChange,
  isActive = false,
  titleRight,
}) => {
  const isTransparent = !color || color === 'none' || color === 'transparent';
  const displayColor = (() => {
    if (isTransparent) return '#';
    if (typeof color === 'string' && color.includes('gradient')) return 'Gradient';
    return typeof color === 'string' ? (color.startsWith('#') ? color.toUpperCase() : '#' + color.toUpperCase()) : '#000000';
  })();

  return (
    <div className="flex flex-col gap-[0.5vw]">
      {title && (
        <div className="flex items-center gap-[0.8vw] mb-[0.1vw]">
          <span className="text-[0.82vw] font-semibold text-gray-900 whitespace-nowrap">{title}</span>
          {titleRight}
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>
      )}
      <div className="flex items-center gap-[0.6vw]">
        {/* Swatch (3.6vw x 2.1vw rounded rectangle matching user screenshot) */}
        <div
          onClick={onOpenPicker}
          className={`w-[3.6vw] h-[2.1vw] rounded-[0.45vw] border border-gray-300 shadow-2xs cursor-pointer flex-shrink-0 relative overflow-hidden transition-transform hover:scale-105 ${
            isActive ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
          }`}
          title={`Change ${title || 'color'}`}
        >
          <div
            className="w-full h-full"
            style={{ background: isTransparent ? '#ffffff' : color }}
          />
          {isTransparent && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1.5px] bg-red-500 rotate-45 pointer-events-none" />
          )}
        </div>

        {/* Input box */}
        <div className="flex-1 h-[2.1vw] rounded-[0.45vw] border border-gray-300 bg-white flex items-center justify-between px-[0.75vw] hover:border-gray-400 focus-within:border-indigo-400 transition-colors shadow-2xs">
          <input
            type="text"
            value={displayColor}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || val === '#') {
                onChange('none');
              } else {
                const finalVal = val.startsWith('#') ? val : '#' + val;
                onChange(finalVal);
              }
            }}
            className="text-[0.8vw] font-medium text-gray-800 outline-none bg-transparent flex-1 uppercase"
            maxLength={9}
          />
          <ScrubPercentInput
            value={Math.round(parseFloat(opacity !== undefined ? opacity : 100))}
            onChange={(clamped) => onOpacityChange(clamped)}
          />
        </div>
      </div>
    </div>
  );
};

const ElementTableProperties = ({
  selectedElementProps,
  activePageIndex,
  selectedLayerId,
  updateElementAttribute,
  selectedElement,
  onUpdate,
  colorsOnPage
}) => {
  // Table Property states
  const [borderStyle, setBorderStyle] = useState('solid');
  const [themeColor, setThemeColor] = useState('#ffffff');
  const [themeOpacity, setThemeOpacity] = useState(100);
  const [borderColor, setBorderColor] = useState('#d1d5db');
  const [borderOpacity, setBorderOpacity] = useState(100);
  const [borderWidth, setBorderWidth] = useState(1);

  // Structure states
  const [rowsCount, setRowsCount] = useState(3);
  const [colsCount, setColsCount] = useState(3);
  const [structureVersion, setStructureVersion] = useState(0);

  // Text & Cell Property states
  const [cellColor, setCellColor] = useState('#000000');
  const [cellOpacity, setCellOpacity] = useState(100);
  const [cellBgColor, setCellBgColor] = useState('#ffffff');
  const [cellBgOpacity, setCellBgOpacity] = useState(100);
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [fontSize, setFontSize] = useState(13);
  const [fontWeight, setFontWeight] = useState('normal');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [verticalAlign, setVerticalAlign] = useState('middle');
  const [paddingX, setPaddingX] = useState(8);
  const [paddingY, setPaddingY] = useState(6);

  // Dropdown open states
  const [isBorderStyleOpen, setIsBorderStyleOpen] = useState(false);
  const [isFontFamilyOpen, setIsFontFamilyOpen] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showWeightDropdown, setShowWeightDropdown] = useState(false);
  const [activeTypographyPanel, setActiveTypographyPanel] = useState(null);
  const toggleTypographyPanel = (panel) => setActiveTypographyPanel(prev => prev === panel ? null : panel);

  // Color & Stroke UI states wired to Color.jsx
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [isTextColorPickerOpen, setIsTextColorPickerOpen] = useState(false);
  const [showStrokeSettings, setShowStrokeSettings] = useState(false);
  const [isStrokeStyleOpen, setIsStrokeStyleOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [strokeSettingsPos, setStrokeSettingsPos] = useState({ top: 0, right: 0 });
  const [isDashPosOpen, setIsDashPosOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [showDetailedPicker, setShowDetailedPicker] = useState(false);
  const [openSubSection, setOpenSubSection] = useState('color');

  // Table Edit Mode: 'global' (table movement, borders, theme) vs 'cell-edit' (cell selection & text edit)
  const [tableEditMode, setTableEditMode] = useState('global');

  // Multi-cell selection & clipboard states
  const [selectedCellKeys, setSelectedCellKeys] = useState(new Set());
  const selectedCellKeysRef = useRef(new Set());
  const [selectedCellText, setSelectedCellText] = useState('');
  const isMouseDownRef = useRef(false);
  const dragStartRef = useRef(null);
  const lastAnchorRef = useRef(null);
  const tableEditModeRef = useRef(tableEditMode);
  useEffect(() => {
    tableEditModeRef.current = tableEditMode;
  }, [tableEditMode]);
  const cellMouseDownPosRef = useRef(null);
  const fileInputRef = useRef(null);

  const markCellSelectedRef = useRef();
  const clearCellSelectionRef = useRef();
  const selectCellRangeRef = useRef();
  const applyBorderHighlightRef = useRef();
  const selectCellAndSyncPropertiesRef = useRef();
  const selectedLayerIdRef = useRef(selectedLayerId);
  useEffect(() => {
    selectedLayerIdRef.current = selectedLayerId;
  }, [selectedLayerId]);

  // Track divider drag state
  const isResizingDividerRef = useRef(false);

  // Ref to track live element
  const elementRef = useRef(null);
  const lastLoadedTableIdRef = useRef(null);

  // Helper to get actual DOM element inside canvas
  const getTargetElement = useCallback(() => {
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    let el = null;
    if (selectedLayerId) {
      el = editorDoc.getElementById(selectedLayerId) ||
           editorDoc.querySelector(`[id="${selectedLayerId}"]`) ||
           document.getElementById(selectedLayerId) ||
           document.querySelector(`[id="${selectedLayerId}"]`);
    }
    if (!el && selectedElement && selectedElement.isConnected) {
      el = selectedElement;
    }
    if (el) {
      if (typeof el.closest === 'function') {
        const parentTable = el.closest('[data-type="table"], [data-type="table-frame"], [id^="table-"], [id*="table"]');
        if (parentTable) return parentTable;
      }
      if (typeof el.querySelector === 'function') {
        const childTable = el.querySelector('[data-type="table"], [data-type="table-frame"], [id^="table-"], [id*="table"], .table-fill-layer, .table-card-wrapper, table');
        if (childTable) {
          return childTable.closest('[data-type="table"], [data-type="table-frame"], [id^="table-"]') || childTable;
        }
      }
    }
    return el;
  }, [selectedElement, selectedLayerId]);

  // Sync canvas DOM changes
  const syncChanges = useCallback((el) => {
    if (!el) return;
    if (typeof onUpdate === 'function') {
      window.__skipCanvasUpdateForPage = activePageIndex;
      let svgRoot = el;
      while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
        svgRoot = svgRoot.parentElement;
      }
      if (svgRoot) {
        const clone = svgRoot.cloneNode(true);
        clone.querySelectorAll('[data-highlight-id], #ghost-layer, .table-cell-selection-overlay').forEach(n => n.remove());
        const normalBorder = el.getAttribute('data-border-color') || '#cbd5e1';
        clone.querySelectorAll('[data-neighbor-highlighted]').forEach(td => {
          td.removeAttribute('data-neighbor-highlighted');
        });
        clone.querySelectorAll('td[data-cell-selected], th[data-cell-selected]').forEach(td => {
          td.removeAttribute('data-cell-selected');
          td.removeAttribute('contenteditable');
          td.style.removeProperty('outline');
          td.style.removeProperty('outline-offset');
          td.style.removeProperty('box-shadow');
          td.style.removeProperty('position');
          td.style.removeProperty('z-index');
          if (td.getAttribute('data-cell-border-color') && td.closest('table')?.getAttribute('data-dash-applied') !== 'true') {
            td.style.borderColor = td.getAttribute('data-cell-border-color');
          }
        });
        const serializer = new XMLSerializer();
        const html = normalizeForeignObjectNamespaces(serializer.serializeToString(clone));
        onUpdate(html);
      }
    }
  }, [onUpdate, activePageIndex]);

  // Helper to ensure table has a unified <colgroup> with a <col> for each column track
  const ensureColGroup = useCallback((tableEl, explicitTotalCols = null) => {
    if (!tableEl) return { colgroup: null, cols: [], totalCols: 0 };
    const trs = tableEl.querySelectorAll('tr');
    if (trs.length === 0) return { colgroup: null, cols: [], totalCols: 0 };

    let totalCols = explicitTotalCols;
    if (!totalCols) {
      trs.forEach(tr => {
        let count = 0;
        Array.from(tr.children).forEach(c => {
          count += parseInt(c.getAttribute('colspan') || '1', 10);
        });
        if (count > totalCols) totalCols = count;
      });
    }
    if (!totalCols || totalCols === 0) totalCols = 3;

    let colgroup = tableEl.querySelector('colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      tableEl.insertBefore(colgroup, tableEl.firstChild);
    }

    let cols = Array.from(colgroup.querySelectorAll('col'));
    if (cols.length !== totalCols) {
      colgroup.innerHTML = '';
      cols = [];
      const equalPct = (100 / totalCols).toFixed(3);
      for (let i = 0; i < totalCols; i++) {
        const col = document.createElement('col');
        col.style.width = `${equalPct}%`;
        colgroup.appendChild(col);
        cols.push(col);
      }
    }

    tableEl.style.tableLayout = 'fixed';
    tableEl.style.width = '100%';

    // Normalize: remove inline width on single cells so colgroup strictly controls them;
    // ensure merged cells have inline width equal to sum of their spanned cols
    tableEl.querySelectorAll('td, th').forEach(cell => {
      const span = parseInt(cell.getAttribute('colspan') || '1', 10);
      if (span === 1) {
        cell.style.removeProperty('width');
      } else {
        const startC = parseInt(cell.getAttribute('data-col') || '0', 10);
        let spanPct = 0;
        for (let k = startC; k < startC + span; k++) {
          if (cols[k]) spanPct += parseFloat(cols[k].style.width) || (100 / totalCols);
        }
        cell.style.width = `${spanPct.toFixed(3)}%`;
      }
    });

    return { colgroup, cols, totalCols };
  }, []);

  // Divider Resizing using existing table lines (highlighted in red #EF4444)
  const initTableResizers = useCallback((tableEl) => {
    if (!tableEl) return;
    if (tableEl.__resizersController) {
      tableEl.__resizersController.abort();
      delete tableEl.__resizersController;
      // the aborted listeners can no longer clear the global hover flag on mouseleave
      if (!isResizingDividerRef.current) window.__isHoveringTableDivider = false;
    }
    delete tableEl.__hasTableResizers;
    const resizerController = new AbortController();
    tableEl.__resizersController = resizerController;
    const signal = resizerController.signal;
    tableEl.__hasTableResizers = true;

    let isDividerHighlighted = false;

    const clearDividerHighlight = () => {
      window.__isHoveringTableDivider = false;
      if (!isDividerHighlighted) return;
      isDividerHighlighted = false;

      const el = tableEl.closest('[data-type="table-frame"], [data-type="table"], g[id^="table-"]') || getTargetElement();
      const tableDefaultBorderColor = el?.getAttribute('data-border-color') || borderColor || '#cbd5e1';
      const tableDefaultBorderOpacity = parseInt(el?.getAttribute('data-border-opacity') || borderOpacity || '100', 10);
      const normalBorder = hexToRgba(tableDefaultBorderColor, tableDefaultBorderOpacity);

      tableEl.querySelectorAll('td, th').forEach(cell => {
        cell.style.removeProperty('border-right-color');
        cell.style.removeProperty('border-left-color');
        cell.style.removeProperty('border-top-color');
        cell.style.removeProperty('border-bottom-color');
        const customColor = cell.getAttribute('data-cell-border-color');
        cell.style.borderColor = customColor || normalBorder;

        if (cell.hasAttribute('data-cell-border-top')) cell.style.borderTopColor = cell.getAttribute('data-cell-border-top');
        if (cell.hasAttribute('data-cell-border-bottom')) cell.style.borderBottomColor = cell.getAttribute('data-cell-border-bottom');
        if (cell.hasAttribute('data-cell-border-left')) cell.style.borderLeftColor = cell.getAttribute('data-cell-border-left');
        if (cell.hasAttribute('data-cell-border-right')) cell.style.borderRightColor = cell.getAttribute('data-cell-border-right');
      });
      if (el) applyTableDashPattern(el); // dashed tables keep transparent borders + painted dashes
    };

    const highlightColumnBorder = (colIndex) => {
      clearDividerHighlight();
      isDividerHighlighted = true;
      const trs = tableEl.querySelectorAll('tr');
      trs.forEach(tr => {
        Array.from(tr.children).forEach(cell => {
          const startC = parseInt(cell.getAttribute('data-col') || '0', 10);
          const span = parseInt(cell.getAttribute('colspan') || '1', 10);
          if (startC + span - 1 === colIndex) {
            cell.style.setProperty('border-right-color', '#EF4444', 'important');
          }
          if (startC === colIndex + 1) {
            cell.style.setProperty('border-left-color', '#EF4444', 'important');
          }
        });
      });
    };

    const highlightRowBorder = (rowIndex) => {
      clearDividerHighlight();
      isDividerHighlighted = true;
      const trs = tableEl.querySelectorAll('tr');
      trs.forEach(tr => {
        Array.from(tr.children).forEach(cell => {
          const startR = parseInt(cell.getAttribute('data-row') || '0', 10);
          const span = parseInt(cell.getAttribute('rowspan') || '1', 10);
          if (startR + span - 1 === rowIndex) {
            cell.style.setProperty('border-bottom-color', '#EF4444', 'important');
          }
          if (startR === rowIndex + 1) {
            cell.style.setProperty('border-top-color', '#EF4444', 'important');
          }
        });
      });
    };

    tableEl.addEventListener('mousemove', (e) => {
      if (isResizingDividerRef.current) return;
      const targetCell = e.target.closest('td, th');
      if (!targetCell) {
        tableEl.style.cursor = 'default';
        clearDividerHighlight();
        return;
      }
      const rect = targetCell.getBoundingClientRect();
      const colIdx = parseInt(targetCell.getAttribute('data-col') || '-1', 10);
      const rowIdx = parseInt(targetCell.getAttribute('data-row') || '-1', 10);
      const colSpan = parseInt(targetCell.getAttribute('colspan') || '1', 10);
      const rowSpan = parseInt(targetCell.getAttribute('rowspan') || '1', 10);

      const trs = tableEl.querySelectorAll('tr');
      const totalRows = trs.length;
      let totalCols = 0;
      trs.forEach(tr => {
        let count = 0;
        Array.from(tr.children).forEach(c => {
          count += parseInt(c.getAttribute('colspan') || '1', 10);
        });
        if (count > totalCols) totalCols = count;
      });
      if (totalCols === 0) totalCols = 3;

      const hitZone = 7;
      const isRightEdge = Math.abs(rect.right - e.clientX) <= hitZone;
      const isLeftEdge = Math.abs(e.clientX - rect.left) <= hitZone;
      const isBottomEdge = Math.abs(rect.bottom - e.clientY) <= hitZone;
      const isTopEdge = Math.abs(e.clientY - rect.top) <= hitZone;

      const dividerCol = isRightEdge ? (colIdx + colSpan - 1) : (isLeftEdge ? colIdx - 1 : -1);
      const dividerRow = isBottomEdge ? (rowIdx + rowSpan - 1) : (isTopEdge ? rowIdx - 1 : -1);

      const isColDivider = dividerCol >= 0 && dividerCol < totalCols - 1;
      const isRowDivider = dividerRow >= 0 && dividerRow < totalRows - 1;

      if (isColDivider) {
        window.__isHoveringTableDivider = true;
        targetCell.style.setProperty('cursor', 'col-resize', 'important');
        tableEl.style.setProperty('cursor', 'col-resize', 'important');
        highlightColumnBorder(dividerCol);
      } else if (isRowDivider) {
        window.__isHoveringTableDivider = true;
        targetCell.style.setProperty('cursor', 'row-resize', 'important');
        tableEl.style.setProperty('cursor', 'row-resize', 'important');
        highlightRowBorder(dividerRow);
      } else {
        window.__isHoveringTableDivider = false;
        const isEditing = targetCell.getAttribute('contenteditable') === 'true';
        targetCell.style.cursor = isEditing ? 'text' : 'default';
        tableEl.style.cursor = 'default';
        clearDividerHighlight();
      }
    }, { signal });

    tableEl.addEventListener('mouseleave', () => {
      if (isResizingDividerRef.current) return;
      window.__isHoveringTableDivider = false;
      tableEl.style.cursor = 'default';
      tableEl.querySelectorAll('td, th').forEach(td => {
        if (td.getAttribute('contenteditable') !== 'true') {
          td.style.cursor = 'default';
        }
      });
      clearDividerHighlight();
    }, { signal });

    tableEl.addEventListener('mousedown', (e) => {
      const targetCell = e.target.closest('td, th');
      if (!targetCell) return;
      const rect = targetCell.getBoundingClientRect();
      const colIdx = parseInt(targetCell.getAttribute('data-col') || '-1', 10);
      const rowIdx = parseInt(targetCell.getAttribute('data-row') || '-1', 10);
      const colSpan = parseInt(targetCell.getAttribute('colspan') || '1', 10);
      const rowSpan = parseInt(targetCell.getAttribute('rowspan') || '1', 10);

      const trs = tableEl.querySelectorAll('tr');
      const totalRows = trs.length;
      let totalCols = 0;
      trs.forEach(tr => {
        let count = 0;
        Array.from(tr.children).forEach(c => {
          count += parseInt(c.getAttribute('colspan') || '1', 10);
        });
        if (count > totalCols) totalCols = count;
      });
      if (totalCols === 0) totalCols = 3;

      const hitZone = 7;
      const isRightEdge = Math.abs(rect.right - e.clientX) <= hitZone;
      const isLeftEdge = Math.abs(e.clientX - rect.left) <= hitZone;
      const isBottomEdge = Math.abs(rect.bottom - e.clientY) <= hitZone;
      const isTopEdge = Math.abs(e.clientY - rect.top) <= hitZone;

      const dividerCol = isRightEdge ? (colIdx + colSpan - 1) : (isLeftEdge ? colIdx - 1 : -1);
      const dividerRow = isBottomEdge ? (rowIdx + rowSpan - 1) : (isTopEdge ? rowIdx - 1 : -1);

      if (dividerCol >= 0 && dividerCol < totalCols - 1) {
        e.preventDefault();
        e.stopPropagation();
        isResizingDividerRef.current = true;
        window.__isResizingTableDivider = true;
        window.__isHoveringTableDivider = true;

        document.body.style.setProperty('cursor', 'col-resize', 'important');
        document.body.classList.add('table-resizing-active');

        highlightColumnBorder(dividerCol);

        const tableRect = tableEl.getBoundingClientRect();
        const { cols } = ensureColGroup(tableEl, totalCols);

        // Clear inline widths from non-merged cells so <col> sizing takes full effect immediately
        tableEl.querySelectorAll('td, th').forEach(cell => {
          const span = parseInt(cell.getAttribute('colspan') || '1', 10);
          if (span === 1) {
            cell.style.removeProperty('width');
          }
        });

        const startColWidthsPx = [];
        for (let idx = 0; idx < totalCols; idx++) {
          let foundCell = null;
          for (const tr of trs) {
            const cell = tr.querySelector(`td[data-col="${idx}"], th[data-col="${idx}"]`);
            if (cell && parseInt(cell.getAttribute('colspan') || '1', 10) === 1) {
              foundCell = cell;
              break;
            }
          }
          if (foundCell) {
            startColWidthsPx[idx] = foundCell.getBoundingClientRect().width;
          } else {
            const pct = parseFloat(cols[idx]?.style.width) || (100 / totalCols);
            startColWidthsPx[idx] = (pct / 100) * tableRect.width;
          }
        }

        // Screen px per layout px (canvas zoom / table scale)
        const layoutScale = (tableEl.offsetWidth > 0) ? (tableRect.width / tableEl.offsetWidth) : 1;

        // Minimum column width = its longest rendered word + padding/borders (never squeeze text out:
        // overflowing text would push the column back and move every other line)
        const minColWidthsPx = Array.from({ length: totalCols }, () => 10);
        trs.forEach((tr) => {
          Array.from(tr.children).forEach((cell) => {
            if (parseInt(cell.getAttribute('colspan') || '1', 10) !== 1) return;
            const ci = parseInt(cell.getAttribute('data-col') || '-1', 10);
            if (ci < 0 || ci >= totalCols) return;
            const cs = window.getComputedStyle(cell);
            const chrome = ((parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) +
              (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0)) * layoutScale;
            const words = (cell.textContent || '').split(/\s+/).filter(Boolean);
            if (!words.length) return;
            const probe = document.createElement('span');
            probe.style.cssText = 'white-space:nowrap;position:absolute;visibility:hidden;';
            cell.appendChild(probe);
            words.forEach((w) => {
              probe.textContent = w;
              minColWidthsPx[ci] = Math.max(minColWidthsPx[ci], probe.getBoundingClientRect().width + chrome + 2);
            });
            probe.remove();
          });
        });

        // Work from the SAVED column percentages, normalised to exactly 100%. Measured px could disagree
        // slightly with them; the pair then summed to != 100% and the browser rescaled every column.
        let savedPcts = Array.from({ length: totalCols }, (_, idx) => parseFloat(cols[idx]?.style.width) || (100 / totalCols));
        const savedSum = savedPcts.reduce((a, b) => a + b, 0) || 100;
        if (Math.abs(savedSum - 100) > 0.01) {
          savedPcts = savedPcts.map((v) => (v / savedSum) * 100);
          savedPcts.forEach((v, idx) => { if (cols[idx]) cols[idx].style.width = `${v.toFixed(4)}%`; });
        }
        const initialColPcts = savedPcts;
        for (let idx = 0; idx < totalCols; idx++) startColWidthsPx[idx] = (savedPcts[idx] / 100) * tableRect.width;

        const onColMouseMove = (moveEvt) => {
          const deltaX = moveEvt.clientX - e.clientX;
          const minLeftPx = minColWidthsPx?.[dividerCol] || 10;
          const minRightPx = minColWidthsPx?.[dividerCol + 1] || 10;
          const leftStart = startColWidthsPx[dividerCol];
          const rightStart = startColWidthsPx[dividerCol + 1];

          let appliedDelta = deltaX;
          if (leftStart + appliedDelta < minLeftPx) appliedDelta = minLeftPx - leftStart;
          if (rightStart - appliedDelta < minRightPx) appliedDelta = rightStart - minRightPx;

          const newLeftPx = leftStart + appliedDelta;
          const pairPctSum = initialColPcts[dividerCol] + initialColPcts[dividerCol + 1];
          const rawLeftPct = (newLeftPx / tableRect.width) * 100;
          const minLeftPct = (minLeftPx / tableRect.width) * 100;
          const minRightPct = (minRightPx / tableRect.width) * 100;
          const maxLeftPct = Math.max(minLeftPct, pairPctSum - minRightPct);
          const leftPct = Math.max(minLeftPct, Math.min(rawLeftPct, maxLeftPct));
          const rightPct = pairPctSum - leftPct;

          const { cols: curCols } = ensureColGroup(tableEl, totalCols);
          if (curCols[dividerCol]) curCols[dividerCol].style.width = `${leftPct.toFixed(4)}%`;
          if (curCols[dividerCol + 1]) curCols[dividerCol + 1].style.width = `${rightPct.toFixed(4)}%`;

          tableEl.querySelectorAll('td, th').forEach(cell => {
            const span = parseInt(cell.getAttribute('colspan') || '1', 10);
            if (span === 1) {
              cell.style.removeProperty('width');
            } else {
              const startC = parseInt(cell.getAttribute('data-col') || '0', 10);
              let spanPct = 0;
              for (let k = startC; k < startC + span; k++) {
                if (curCols[k]) spanPct += parseFloat(curCols[k].style.width) || (100 / curCols.length);
              }
              cell.style.width = `${spanPct.toFixed(3)}%`;
            }
          });

          // Continuously synchronize cell selection highlight with resized columns!
          if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
            applyBorderHighlightRef.current?.(tableEl, selectedCellKeysRef.current);
          }
        };

        const onColMouseUp = () => {
          window.removeEventListener('mousemove', onColMouseMove);
          window.removeEventListener('mouseup', onColMouseUp);

          document.body.style.removeProperty('cursor');
          document.body.classList.remove('table-resizing-active');
          tableEl.style.removeProperty('cursor');
          tableEl.querySelectorAll('td, th').forEach(td => {
            if (td.getAttribute('contenteditable') !== 'true') {
              td.style.removeProperty('cursor');
            }
          });

          isResizingDividerRef.current = false;
          window.__isResizingTableDivider = false;
          window.__isHoveringTableDivider = false;

          clearDividerHighlight();

          const el = getTargetElement();
          if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
            applyBorderHighlightRef.current?.(tableEl, selectedCellKeysRef.current);
          }
          if (el) {
            syncChanges(el);
            if (typeof window.drawOverlayHighlight === 'function') {
              window.drawOverlayHighlight(el, 'selected');
            }
          }
        };

        window.addEventListener('mousemove', onColMouseMove);
        window.addEventListener('mouseup', onColMouseUp);

      } else if (dividerRow >= 0 && dividerRow < totalRows - 1) {
        e.preventDefault();
        e.stopPropagation();
        isResizingDividerRef.current = true;
        window.__isResizingTableDivider = true;
        window.__isHoveringTableDivider = true;

        document.body.style.setProperty('cursor', 'row-resize', 'important');
        document.body.classList.add('table-resizing-active');

        highlightRowBorder(dividerRow);

        const tableRect = tableEl.getBoundingClientRect();
        const rowHeightsPx = Array.from(trs).map(r => r.getBoundingClientRect().height);
        const totalRowsHeightPx = rowHeightsPx.reduce((a, b) => a + b, 0);

        trs.forEach(tr => {
          Array.from(tr.children).forEach(cell => {
            cell.style.removeProperty('height');
          });
        });

        const initialPcts = rowHeightsPx.map(h => (h / totalRowsHeightPx) * 100);
        trs.forEach((tr, i) => {
          tr.style.height = `${initialPcts[i].toFixed(4)}%`;
        });

        // Minimum row height = its tallest cell CONTENT (text + padding/borders). Dragging a row below
        // that let the text push it back, the table grew and every other row line shifted.
        const rowScale = (tableEl.offsetHeight > 0) ? (tableRect.height / tableEl.offsetHeight) : 1;
        const minRowHeightsPx = Array.from(trs).map((tr) => {
          let need = 8;
          Array.from(tr.children).forEach((cell) => {
            if (parseInt(cell.getAttribute('rowspan') || '1', 10) !== 1) return;
            const cs = window.getComputedStyle(cell);
            const chrome = ((parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0) +
              (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0)) * rowScale;
            let contentH = 0;
            if (cell.childNodes.length) {
              const range = document.createRange();
              range.selectNodeContents(cell);
              contentH = range.getBoundingClientRect().height;
            }
            need = Math.max(need, contentH + chrome + 1);
          });
          return need;
        });

        const onRowMouseMove = (moveEvt) => {
          const deltaY = moveEvt.clientY - e.clientY;
          const topTr = trs[dividerRow];
          const bottomTr = trs[dividerRow + 1];
          if (!topTr || !bottomTr) return;

          const minTopPx = minRowHeightsPx?.[dividerRow] || 8;
          const minBottomPx = minRowHeightsPx?.[dividerRow + 1] || 8;
          const topStart = rowHeightsPx[dividerRow];
          const bottomStart = rowHeightsPx[dividerRow + 1];

          let appliedDelta = deltaY;
          if (topStart + appliedDelta < minTopPx) appliedDelta = minTopPx - topStart;
          if (bottomStart - appliedDelta < minBottomPx) appliedDelta = bottomStart - minBottomPx;

          const newTopPx = topStart + appliedDelta;
          const pairPctSum = (initialPcts?.[dividerRow] || ((topStart / totalRowsHeightPx) * 100)) + (initialPcts?.[dividerRow + 1] || ((bottomStart / totalRowsHeightPx) * 100));
          const rawTopPct = (newTopPx / totalRowsHeightPx) * 100;
          const minTopPct = (minTopPx / totalRowsHeightPx) * 100;
          const minBottomPct = (minBottomPx / totalRowsHeightPx) * 100;
          const maxTopPct = Math.max(minTopPct, pairPctSum - minBottomPct);
          const topPct = Math.max(minTopPct, Math.min(rawTopPct, maxTopPct));
          const bottomPct = pairPctSum - topPct;

          topTr.style.height = `${topPct.toFixed(4)}%`;
          bottomTr.style.height = `${bottomPct.toFixed(4)}%`;

          // Continuously synchronize cell selection highlight with resized rows!
          if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
            applyBorderHighlightRef.current?.(tableEl, selectedCellKeysRef.current);
          }
        };

        const onRowMouseUp = () => {
          window.removeEventListener('mousemove', onRowMouseMove);
          window.removeEventListener('mouseup', onRowMouseUp);

          document.body.style.removeProperty('cursor');
          document.body.classList.remove('table-resizing-active');
          tableEl.style.removeProperty('cursor');
          tableEl.querySelectorAll('td, th').forEach(td => {
            if (td.getAttribute('contenteditable') !== 'true') {
              td.style.removeProperty('cursor');
            }
          });

          isResizingDividerRef.current = false;
          window.__isResizingTableDivider = false;
          window.__isHoveringTableDivider = false;

          clearDividerHighlight();

          const el = getTargetElement();
          if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
            applyBorderHighlightRef.current?.(tableEl, selectedCellKeysRef.current);
          }
          if (el) {
            syncChanges(el);
            if (typeof window.drawOverlayHighlight === 'function') {
              window.drawOverlayHighlight(el, 'selected');
            }
          }
        };

        window.addEventListener('mousemove', onRowMouseMove);
        window.addEventListener('mouseup', onRowMouseUp);
      }
    }, { signal, capture: true });
  }, [getTargetElement, ensureColGroup, borderColor, borderOpacity, syncChanges]);

  // Global mouseup to release cell dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isMouseDownRef.current = false;
      dragStartRef.current = null;
      isResizingDividerRef.current = false;
      window.__isResizingTableDivider = false;
      window.__isHoveringTableDivider = false;
      document.body.classList.remove('table-resizing-active');
      document.body.style.removeProperty('cursor');
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Cell selection helpers: highlight selected cells using an absolute overlay box on top of the cell's line stroke with high z-index
  const applyBorderHighlight = useCallback((table, selectedKeys) => {
    if (!table) return;
    const el = getTargetElement();
    const wrapper = el?.querySelector('.table-card-wrapper') || table.parentElement;

    // Remove previous selection overlays
    if (wrapper) {
      if (wrapper.style.position !== 'relative') {
        wrapper.style.position = 'relative';
      }
      wrapper.querySelectorAll('.table-cell-selection-overlay').forEach(n => n.remove());
    }

    const bColor = el?.getAttribute('data-border-color') || borderColor || '#cbd5e1';
    const bOpacity = parseInt(el?.getAttribute('data-border-opacity') || borderOpacity || '100', 10);
    const normalBorderColor = hexToRgba(bColor, bOpacity);
    const getCellBorderColor = (c) => c.getAttribute('data-cell-border-color') || normalBorderColor;

    // Table-level stroke comes from the element's saved attributes, NOT component state: this callback
    // is memoised with stale state, so deselecting a cell rewrote every border as solid / width 1
    // (a just-applied dashed stroke "disappeared" on click outside).
    const tableBorderWidth = el?.getAttribute('data-border-width') ?? borderWidth ?? '1';
    const savedStyle = el?.getAttribute('data-border-style') || borderStyle || 'solid';
    const tableBorderStyle = savedStyle === 'dotted' ? 'dashed' : savedStyle;
    const restoreCellBorders = (cell) => {
      const baseBorder = getCellBorderColor(cell);
      const baseWidth = cell.getAttribute('data-cell-border-width') || tableBorderWidth || '1';
      const baseStyle = cell.getAttribute('data-cell-border-style') || tableBorderStyle;
      cell.style.borderWidth = `${baseWidth}px`;
      cell.style.borderStyle = baseStyle;
      cell.style.borderColor = baseBorder;
      if (cell.hasAttribute('data-cell-border-top')) {
        cell.style.borderTopColor = cell.getAttribute('data-cell-border-top');
        if (cell.hasAttribute('data-cell-border-top-width')) cell.style.borderTopWidth = `${cell.getAttribute('data-cell-border-top-width')}px`;
        if (cell.hasAttribute('data-cell-border-top-style')) cell.style.borderTopStyle = cell.getAttribute('data-cell-border-top-style');
      }
      if (cell.hasAttribute('data-cell-border-bottom')) {
        cell.style.borderBottomColor = cell.getAttribute('data-cell-border-bottom');
        if (cell.hasAttribute('data-cell-border-bottom-width')) cell.style.borderBottomWidth = `${cell.getAttribute('data-cell-border-bottom-width')}px`;
        if (cell.hasAttribute('data-cell-border-bottom-style')) cell.style.borderBottomStyle = cell.getAttribute('data-cell-border-bottom-style');
      }
      if (cell.hasAttribute('data-cell-border-left')) {
        cell.style.borderLeftColor = cell.getAttribute('data-cell-border-left');
        if (cell.hasAttribute('data-cell-border-left-width')) cell.style.borderLeftWidth = `${cell.getAttribute('data-cell-border-left-width')}px`;
        if (cell.hasAttribute('data-cell-border-left-style')) cell.style.borderLeftStyle = cell.getAttribute('data-cell-border-left-style');
      }
      if (cell.hasAttribute('data-cell-border-right')) {
        cell.style.borderRightColor = cell.getAttribute('data-cell-border-right');
        if (cell.hasAttribute('data-cell-border-right-width')) cell.style.borderRightWidth = `${cell.getAttribute('data-cell-border-right-width')}px`;
        if (cell.hasAttribute('data-cell-border-right-style')) cell.style.borderRightStyle = cell.getAttribute('data-cell-border-right-style');
      }
    };

    // Clean up neighbor attributes and inner cell styles
    table.querySelectorAll('[data-neighbor-highlighted]').forEach(cell => {
      cell.removeAttribute('data-neighbor-highlighted');
      restoreCellBorders(cell);
    });

    table.querySelectorAll('td, th').forEach(cell => {
      cell.style.removeProperty('outline');
      cell.style.removeProperty('outline-offset');
      cell.style.removeProperty('box-shadow');
      const r = cell.getAttribute('data-row');
      const c = cell.getAttribute('data-col');
      if (!selectedKeys.has(`${r}_${c}`)) {
        cell.removeAttribute('data-cell-selected');
        restoreCellBorders(cell);
      }
    });

    applyTableDashPattern(el); // restored borders above are plain CSS; repaint custom dashes
    if (!selectedKeys || selectedKeys.size === 0 || !wrapper) return;

    const highlightColor = '#EA543A';
    // Thin selection stroke, constant ON SCREEN (~1.25px) whatever the canvas zoom / table scale:
    // convert screen px into the wrapper's own units (the table is scaled up inside the canvas)
    const wrapperScreenScale = (() => {
      const wr = wrapper.getBoundingClientRect();
      return (wr.width > 0 && wrapper.offsetWidth > 0) ? wr.width / wrapper.offsetWidth : 1;
    })();
    const highlightStroke = Math.max(0.2, 1.25 / (wrapperScreenScale || 1));
    const selectedCells = [];
    const entries = [];

    selectedKeys.forEach(key => {
      const [rStr, cStr] = key.split('_');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      const cell = table.querySelector(`td[data-row="${r}"][data-col="${c}"], th[data-row="${r}"][data-col="${c}"]`);
      if (cell) {
        cell.setAttribute('data-cell-selected', 'true');
        restoreCellBorders(cell);
        selectedCells.push(cell);
        entries.push({ r, c, cell });
      }
    });
    applyTableDashPattern(el);

    if (selectedCells.length === 0) return;

    const baseLeft = table.offsetLeft || 0;
    const baseTop = table.offsetTop || 0;

    // Check if selected cells form a single contiguous rectangle
    const minR = Math.min(...entries.map(e => e.r));
    const maxR = Math.max(...entries.map(e => e.r));
    const minC = Math.min(...entries.map(e => e.c));
    const maxC = Math.max(...entries.map(e => e.c));
    const isSingleRect = (maxR - minR + 1) * (maxC - minC + 1) === entries.length;

    const bWidth = parseFloat(el?.getAttribute('data-border-width') || borderWidth || '1') || 1;

    // Helper to calculate exact local coordinates of a cell relative to wrapper
    // Measured from real on-screen rects (scaled back to the wrapper's own units). Summing
    // offsetLeft/offsetTop through offsetParents is unreliable inside an SVG foreignObject and with
    // border-collapse tables in Chrome — it put the highlight about one border-width up/left of the cell.
    const getCellLocalRect = (cell) => {
      const wrapperRect = wrapper.getBoundingClientRect();
      const cRect = cell.getBoundingClientRect();
      const sX = (wrapperRect.width > 0 && wrapper.offsetWidth > 0) ? (wrapperRect.width / wrapper.offsetWidth) : 1;
      const sY = (wrapperRect.height > 0 && wrapper.offsetHeight > 0) ? (wrapperRect.height / wrapper.offsetHeight) : sX;
      // absolute children are positioned from the wrapper's padding box → skip its own border
      const l = (cRect.left - wrapperRect.left) / sX - (wrapper.clientLeft || 0);
      const t = (cRect.top - wrapperRect.top) / sY - (wrapper.clientTop || 0);
      const w = cRect.width / sX;
      const h = cRect.height / sY;
      return { left: l, top: t, right: l + w, bottom: t + h, width: w, height: h };
    };

    if (isSingleRect || entries.length === 1) {
      let minLeft = Infinity;
      let minTop = Infinity;
      let maxRight = -Infinity;
      let maxBottom = -Infinity;

      selectedCells.forEach(cell => {
        const rect = getCellLocalRect(cell);
        if (rect.left < minLeft) minLeft = rect.left;
        if (rect.top < minTop) minTop = rect.top;
        if (rect.right > maxRight) maxRight = rect.right;
        if (rect.bottom > maxBottom) maxBottom = rect.bottom;
      });

      const overlay = document.createElement('div');
      overlay.className = 'table-cell-selection-overlay';
      overlay.setAttribute(
        'style',
        `position:absolute;left:${minLeft}px;top:${minTop}px;width:${Math.max(1, maxRight - minLeft)}px;height:${Math.max(1, maxBottom - minTop)}px;border:${highlightStroke}px solid ${highlightColor};box-sizing:border-box;pointer-events:none;z-index:9999;border-radius:0px;`
      );
      wrapper.appendChild(overlay);
    } else {
      // Disjoint multi-cell selection: create an individual overlay box for each selected cell
      selectedCells.forEach(cell => {
        const rect = getCellLocalRect(cell);
        const overlay = document.createElement('div');
        overlay.className = 'table-cell-selection-overlay';
        overlay.setAttribute(
          'style',
          `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${Math.max(1, rect.width)}px;height:${Math.max(1, rect.height)}px;border:${highlightStroke}px solid ${highlightColor};box-sizing:border-box;pointer-events:none;z-index:9999;border-radius:0px;`
        );
        wrapper.appendChild(overlay);
      });
    }
  }, [getTargetElement]);
  applyBorderHighlightRef.current = applyBorderHighlight;

  const markCellSelected = useCallback((td, isSelected) => {
    if (!td) return;
    const table = td.closest('table');
    if (!table) return;
    const r = td.getAttribute('data-row');
    const c = td.getAttribute('data-col');
    const current = new Set(selectedCellKeysRef.current);
    if (isSelected) {
      current.add(`${r}_${c}`);
    } else {
      current.delete(`${r}_${c}`);
    }
    applyBorderHighlight(table, current);
  }, [applyBorderHighlight]);
  markCellSelectedRef.current = markCellSelected;

  const clearCellSelection = useCallback((targetEl) => {
    const el = targetEl || getTargetElement();
    const table = el?.querySelector('table');
    const wrapper = el?.querySelector('.table-card-wrapper') || table?.parentElement;
    if (el) {
      el.querySelectorAll('.table-cell-selection-overlay').forEach(n => n.remove());
    }
    if (wrapper) {
      wrapper.querySelectorAll('.table-cell-selection-overlay').forEach(n => n.remove());
    }
    if (table && applyBorderHighlightRef.current) {
      applyBorderHighlightRef.current(table, new Set());
    }
    setSelectedCellKeys(new Set());
    selectedCellKeysRef.current = new Set();
    setSelectedCellText('');

    if (el) {
      const tColor = el.getAttribute('data-theme-color') || '#ffffff';
      const tOpacity = parseInt(el.getAttribute('data-theme-opacity') || '100', 10);
      const bColor = el.getAttribute('data-border-color') || '#cbd5e1';
      const bOpacity = parseInt(el.getAttribute('data-border-opacity') || '100', 10);
      const bWidth = parseFloat(el.getAttribute('data-border-width') || '1');
      const bStyle = el.getAttribute('data-border-style') || 'solid';
      setThemeColor(prev => prev !== tColor ? tColor : prev);
      setThemeOpacity(prev => prev !== tOpacity ? tOpacity : prev);
      setBorderColor(prev => prev !== bColor ? bColor : prev);
      setBorderOpacity(prev => prev !== bOpacity ? bOpacity : prev);
      setBorderWidth(prev => prev !== bWidth ? bWidth : prev);
      setBorderStyle(prev => prev !== bStyle ? bStyle : prev);
    }
  }, [getTargetElement]);
  clearCellSelectionRef.current = clearCellSelection;

  // Clear table cell selection on external event (e.g., table moved or unselected)
  useEffect(() => {
    const handleClearCells = (e) => {
      if (e.detail?.elementId) {
        if (e.detail.elementId === selectedLayerId) {
          clearCellSelectionRef.current?.();
        }
      } else {
        clearCellSelectionRef.current?.();
      }
    };
    window.addEventListener('clear-table-cell-selection', handleClearCells);
    return () => window.removeEventListener('clear-table-cell-selection', handleClearCells);
  }, [selectedLayerId]);

  // Synchronize table cell selection on external event (e.g., table resized or transformed)
  useEffect(() => {
    const handleSyncCells = (e) => {
      const targetId = e?.detail?.elementId;
      if (targetId && targetId !== selectedLayerIdRef.current && targetId !== selectedLayerId) return;
      const el = getTargetElement();
      const table = el?.querySelector('table');
      if (table && selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0 && applyBorderHighlightRef.current) {
        applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
      }
    };
    window.addEventListener('sync-table-cell-selection', handleSyncCells);
    return () => window.removeEventListener('sync-table-cell-selection', handleSyncCells);
  }, [selectedLayerId, getTargetElement]);

  // Synchronize table font-size and padding states when dynamically scaled during resize
  useEffect(() => {
    const handlePropsSync = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      const targetId = detail.elementId;
      if (targetId && targetId !== selectedLayerIdRef.current && targetId !== selectedLayerId) return;
      if (detail.fontSize !== undefined) {
        setFontSize(detail.fontSize);
      }
      if (detail.paddingY !== undefined) {
        setPaddingY(detail.paddingY);
      }
      if (detail.paddingX !== undefined) {
        setPaddingX(detail.paddingX);
      }
      const el = getTargetElement();
      const table = el?.querySelector('table');
      if (table && selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0 && applyBorderHighlightRef.current) {
        applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
      }
    };
    window.addEventListener('table-properties-sync', handlePropsSync);
    return () => window.removeEventListener('table-properties-sync', handlePropsSync);
  }, [selectedLayerId, getTargetElement]);

  // Clean up all cell selection highlights when table is unselected (properties panel unmounts or layer changes)
  useEffect(() => {
    return () => {
      const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const targetId = selectedLayerIdRef.current || selectedLayerId;
      const el = (targetId ? (editorDoc.getElementById(targetId) || document.getElementById(targetId)) : null) || getTargetElement();
      if (el) {
        const table = el.querySelector('table');
        const wrapper = el.querySelector('.table-card-wrapper') || table?.parentElement;
        if (wrapper) {
          wrapper.querySelectorAll('.table-cell-selection-overlay').forEach(n => n.remove());
        }
        if (table) {
          if (table.__cellListenersController) {
            table.__cellListenersController.abort();
            delete table.__cellListenersController;
          }
          if (table.__resizersController) {
            table.__resizersController.abort();
            delete table.__resizersController;
          }
          delete table.__hasTableClickDelegation;
          delete table.__hasTableResizers;
          table.querySelectorAll('td, th').forEach(td => {
            delete td.__hasCellListeners;
            td.removeAttribute('data-cell-selected');
          });
        }
      }
    };
  }, [getTargetElement, selectedLayerId]);

  // Keep cell selection overlay persistent and aligned when properties change
  useEffect(() => {
    if (selectedCellKeys.size > 0) {
      const el = getTargetElement();
      const table = el?.querySelector('table');
      if (table && applyBorderHighlightRef.current) {
        applyBorderHighlightRef.current(table, selectedCellKeys);
      }
    }
  }, [selectedCellKeys, themeColor, themeOpacity, borderColor, borderOpacity, borderWidth, borderStyle, fontSize, fontFamily, paddingX, paddingY, cellColor, getTargetElement]);

  const selectCellRange = useCallback((el, r1, c1, r2, c2, keepExisting = false) => {
    if (!el) return;
    const table = el.querySelector('table');
    if (!table) return;

    const top = Math.min(r1, r2);
    const bottom = Math.max(r1, r2);
    const left = Math.min(c1, c2);
    const right = Math.max(c1, c2);

    const trs = Array.from(table.querySelectorAll('tr'));
    const grid = [];
    for (let r = 0; r < trs.length; r++) grid[r] = [];

    trs.forEach((tr, r) => {
      let c = 0;
      Array.from(tr.children).forEach(td => {
        if (td.tagName.toLowerCase() !== 'td' && td.tagName.toLowerCase() !== 'th') return;
        while (grid[r][c] !== undefined) c++;
        const colSpan = parseInt(td.getAttribute('colspan') || '1', 10);
        const rowSpan = parseInt(td.getAttribute('rowspan') || '1', 10);
        for (let dr = 0; dr < rowSpan; dr++) {
          for (let dc = 0; dc < colSpan; dc++) {
            if (!grid[r + dr]) grid[r + dr] = [];
            grid[r + dr][c + dc] = td;
          }
        }
        c += colSpan;
      });
    });

    const newKeys = keepExisting ? new Set(selectedCellKeysRef.current) : new Set();
    for (let r = top; r <= bottom; r++) {
      for (let c = left; c <= right; c++) {
        const td = grid[r]?.[c];
        if (td) {
          const actualR = td.getAttribute('data-row');
          const actualC = td.getAttribute('data-col');
          if (actualR !== null && actualC !== null) {
            newKeys.add(`${actualR}_${actualC}`);
          }
        }
      }
    }

    setSelectedCellKeys(newKeys);
    selectedCellKeysRef.current = newKeys;
    applyBorderHighlight(table, newKeys);

    if (newKeys.size === 1) {
      const singleTd = table.querySelector(`td[data-row="${top}"][data-col="${left}"], th[data-row="${top}"][data-col="${left}"]`);
      if (singleTd) {
        setSelectedCellText(singleTd.textContent || '');
      }
    } else {
      setSelectedCellText('');
    }

    if (typeof window.drawOverlayHighlight === 'function' && el) {
      window.drawOverlayHighlight(el, 'selected');
    }
  }, [applyBorderHighlight]);
  selectCellRangeRef.current = selectCellRange;

  // Helper to select cell and synchronize all properties (fill color, typography, stroke)
  const selectCellAndSyncProperties = useCallback((td, isShift = false, isCtrl = false) => {
    if (!td) return;
    const tableEl = td.closest('[data-type="table-frame"], [data-type="table"], g[id^="table-"]') || getTargetElement();
    const table = td.closest('table') || tableEl?.querySelector('table');
    const curR = parseInt(td.getAttribute('data-row') || '0', 10);
    const curC = parseInt(td.getAttribute('data-col') || '0', 10);

    if (isShift && lastAnchorRef.current) {
      if (selectCellRangeRef.current) {
        selectCellRangeRef.current(tableEl, lastAnchorRef.current.r, lastAnchorRef.current.c, curR, curC, isCtrl);
      }
      return;
    }

    if (isCtrl) {
      const key = `${curR}_${curC}`;
      const updated = new Set(selectedCellKeysRef.current);
      if (updated.has(key)) {
        updated.delete(key);
      } else {
        updated.add(key);
      }
      setSelectedCellKeys(updated);
      selectedCellKeysRef.current = updated;
      lastAnchorRef.current = { r: curR, c: curC };
      if (table && applyBorderHighlightRef.current) {
        applyBorderHighlightRef.current(table, updated);
      }
      return;
    }

    // Single cell selection
    lastAnchorRef.current = { r: curR, c: curC };
    const single = new Set([`${curR}_${curC}`]);
    setSelectedCellKeys(single);
    selectedCellKeysRef.current = single;
    setSelectedCellText(td.textContent || '');
    setTableEditMode('cell-edit');
    if (tableEl) {
      tableEl.setAttribute('data-table-mode', 'cell-edit');
    }

    // 1. Fetch fill color accurately
    const cellFill = extractCellFillColor(td, tableEl);
    setThemeColor(cellFill.hex);
    setThemeOpacity(cellFill.opacity);

    // 2. Stroke is strictly global: always reflect table-level border
    const tableDefaultBorderColor = tableEl?.getAttribute('data-border-color') || '#cbd5e1';
    const tableDefaultBorderOpacity = parseInt(tableEl?.getAttribute('data-border-opacity') || '100', 10);
    const tableDefaultBorderWidth = parseFloat(tableEl?.getAttribute('data-border-width') || '1') || 1;
    const tableDefaultBorderStyle = tableEl?.getAttribute('data-border-style') || 'solid';
    setBorderColor(tableDefaultBorderColor);
    setBorderOpacity(tableDefaultBorderOpacity);
    setBorderWidth(tableDefaultBorderWidth);
    setBorderStyle(tableDefaultBorderStyle);

    // 3. Detect cell typography accurately (with getComputedStyle fallback)
    let compStyle = null;
    try {
      compStyle = window.getComputedStyle(td);
    } catch (e) {}

    const rawColor = td.style.color || compStyle?.color || tableEl?.getAttribute('data-font-color') || '#000000';
    const parsedTextColor = parseRgbaColor(rawColor, '#000000');
    setCellColor(parsedTextColor.hex);

    const rawWeight = td.style.fontWeight || compStyle?.fontWeight || '';
    const normWeight = normalizeToTailwindWeight(rawWeight);
    setFontWeight(normWeight);
    setIsBold(rawWeight === 'bold' || rawWeight === '700' || rawWeight === '800' || rawWeight === '900' || rawWeight === '600' || ['bold', 'semibold', 'extrabold', 'black'].includes(normWeight));

    const rawStyle = td.style.fontStyle || compStyle?.fontStyle || '';
    setIsItalic(rawStyle === 'italic');

    const rawDecoration = td.style.textDecoration || compStyle?.textDecoration || '';
    setIsUnderline(rawDecoration.includes('underline'));
    setIsStrikethrough(rawDecoration.includes('line-through'));

    const rawAlign = td.style.textAlign || compStyle?.textAlign || 'left';
    setTextAlign(rawAlign);

    const rawVAlign = td.style.verticalAlign || compStyle?.verticalAlign || 'middle';
    setVerticalAlign(rawVAlign);

    if (td.style.fontSize) {
      setFontSize(parseInt(td.style.fontSize, 10));
    } else if (compStyle?.fontSize) {
      setFontSize(Math.round(parseFloat(compStyle.fontSize) * 0.75) || 13);
    } else {
      setFontSize(parseInt(tableEl?.getAttribute('data-font-size') || '13', 10));
    }

    const rawFontFamily = td.style.fontFamily || compStyle?.fontFamily || tableEl?.getAttribute('data-font-family') || 'Poppins';
    if (rawFontFamily) {
      setFontFamily(rawFontFamily.replace(/['",]/g, '').replace('sans-serif', '').trim());
    }

    if (table && applyBorderHighlightRef.current) {
      applyBorderHighlightRef.current(table, single);
    }
  }, [getTargetElement]);
  selectCellAndSyncPropertiesRef.current = selectCellAndSyncProperties;

  // Cell listeners attachment
  const attachCellListeners = useCallback((el) => {
    if (!el) return;
    const table = el.querySelector('table');
    if (!table) return;

    if (table.__cellListenersController) {
      table.__cellListenersController.abort();
      delete table.__cellListenersController;
    }
    table.querySelectorAll('td, th').forEach(cell => {
      delete cell.__hasCellListeners;
    });
    delete table.__hasTableClickDelegation;

    const controller = new AbortController();
    table.__cellListenersController = controller;
    const signal = controller.signal;

    // Self-healing: ensure any cells missing borders are restored immediately and clean up inline cell heights
    const bWidth = el.getAttribute('data-border-width') || '1';
    const bStyle = el.getAttribute('data-border-style') || 'solid';
    const bColor = el.getAttribute('data-border-color') || '#cbd5e1';
    // Custom-dashed tables have per-side widths (the "border" shorthand reads empty) and transparent
    // colours on purpose — not "missing" borders. Healing them stacked real CSS borders on the dashes.
    const isDashPainted = table.getAttribute('data-dash-applied') === 'true';
    table.querySelectorAll('td, th').forEach(cell => {
      if (!isDashPainted && (!cell.style.border || cell.style.border === 'none' || !cell.style.borderWidth)) {
        cell.style.border = `${bWidth}px ${bStyle} ${bColor}`;
      }
      if (!isDashPainted && !cell.getAttribute('data-cell-border-color')) {
        cell.setAttribute('data-cell-border-color', bColor);
      }
      cell.style.removeProperty('height');
    });
    applyTableDashPattern(el);

    const trs = Array.from(table.querySelectorAll('tr'));
    const numRows = trs.length;
    const grid = [];
    for (let r = 0; r < numRows; r++) grid[r] = [];

    trs.forEach((tr, r) => {
      let c = 0;
      Array.from(tr.children).forEach((td) => {
        if (td.tagName.toLowerCase() !== 'td' && td.tagName.toLowerCase() !== 'th') return;
        while (grid[r][c] !== undefined) c++;
        const colSpan = parseInt(td.getAttribute('colspan') || '1', 10);
        const rowSpan = parseInt(td.getAttribute('rowspan') || '1', 10);
        for (let dr = 0; dr < rowSpan; dr++) {
          for (let dc = 0; dc < colSpan; dc++) {
            if (!grid[r + dr]) grid[r + dr] = [];
            grid[r + dr][c + dc] = td;
          }
        }
        td.setAttribute('data-row', r.toString());
        td.setAttribute('data-col', c.toString());
        c += colSpan;

        if (td.__hasCellListeners) return;
        td.__hasCellListeners = true;

        td.addEventListener('mousedown', (e) => {
          if (e.button !== 0) return;
          if (td.getAttribute('contenteditable') === 'true') return;
          if (window.__isResizingTableDivider || window.__isHoveringTableDivider) return;

          const tableEl = el || td.closest('[data-type="table-frame"], [data-type="table"], g[id^="table-"]') || getTargetElement();
          const isTableSelected = Boolean(
            tableEl && (
              selectedLayerIdRef.current === tableEl.id ||
              tableEl.getAttribute('data-table-selected') === 'true'
            )
          );

          if (!isTableSelected) {
            return;
          }

          const isShift = e.shiftKey;
          const isCtrl = e.ctrlKey || e.metaKey;

          if (isShift || isCtrl) {
            e.stopPropagation();
          }

          selectCellAndSyncPropertiesRef.current?.(td, isShift, isCtrl);
        }, { signal });

        td.addEventListener('click', (e) => {
          if (td.getAttribute('contenteditable') === 'true') return;
          if (window.__isResizingTableDivider || window.__isHoveringTableDivider) return;

          const tableEl = el || td.closest('[data-type="table-frame"], [data-type="table"], g[id^="table-"]') || getTargetElement();
          const isTableSelected = Boolean(
            tableEl && (
              selectedLayerIdRef.current === tableEl.id ||
              tableEl.getAttribute('data-table-selected') === 'true'
            )
          );

          if (!isTableSelected) {
            return;
          }

          selectCellAndSyncPropertiesRef.current?.(td, e.shiftKey, e.ctrlKey || e.metaKey);
        }, { signal });

        td.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          selectCellAndSyncPropertiesRef.current?.(td, false, false);

          td.setAttribute('contenteditable', 'true');
          td.style.cursor = 'text';
          td.style.userSelect = 'text';
          td.focus();

          const tableEl = el || td.closest('[data-type="table-frame"], [data-type="table"], g[id^="table-"]') || getTargetElement();
          if (typeof window.drawOverlayHighlight === 'function' && tableEl) {
            window.drawOverlayHighlight(tableEl, 'selected');
          }
        }, { signal });

        td.addEventListener('blur', () => {
          td.removeAttribute('contenteditable');
          td.style.cursor = 'default';
          td.style.userSelect = 'none';
          const tableEl = el || td.closest('[data-type="table-frame"], [data-type="table"], g[id^="table-"]') || getTargetElement();
          const currentTable = tableEl?.querySelector('table') || table;
          if (currentTable && selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
            applyBorderHighlightRef.current?.(currentTable, selectedCellKeysRef.current);
          }
          if (tableEl && currentTable) {
            const fo = tableEl.querySelector('foreignObject');
            if (fo) {
              const renderedH = currentTable.offsetHeight || currentTable.scrollHeight;
              const curH = parseFloat(fo.getAttribute('height') || '0');
              if (renderedH > curH) {
                fo.setAttribute('height', String(Math.round(renderedH + 2)));
              }
            }
            if (typeof window.drawOverlayHighlight === 'function') {
              window.drawOverlayHighlight(tableEl, 'selected');
            }
            syncChanges(tableEl);
          }
        }, { signal });

        const handleCellContentChange = () => {
          setSelectedCellText(td.textContent || '');
          requestAnimationFrame(() => {
            const tableEl = el || td.closest('[data-type="table-frame"], [data-type="table"], g[id^="table-"]') || getTargetElement();
            const currentTable = tableEl?.querySelector('table') || table;
            if (currentTable && selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
              applyBorderHighlightRef.current?.(currentTable, selectedCellKeysRef.current);
            }
            if (tableEl && currentTable) {
              const fo = tableEl.querySelector('foreignObject');
              if (fo) {
                const renderedH = currentTable.offsetHeight || currentTable.scrollHeight;
                const curH = parseFloat(fo.getAttribute('height') || '0');
                if (renderedH > curH) {
                  fo.setAttribute('height', String(Math.round(renderedH + 2)));
                  if (typeof window.drawOverlayHighlight === 'function') {
                    window.drawOverlayHighlight(tableEl, 'selected');
                  }
                }
              }
            }
          });
        };

        td.addEventListener('input', handleCellContentChange, { signal });
        td.addEventListener('keyup', handleCellContentChange, { signal });

        td.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            td.blur();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            td.blur();
          }
        }, { signal });
      });
    });

    // Also attach delegated click and mousedown on table itself to catch any dynamically replaced cells
    if (!table.__hasTableClickDelegation) {
      table.__hasTableClickDelegation = true;
      table.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (window.__isResizingTableDivider || window.__isHoveringTableDivider) return;
        const cell = e.target.closest('td, th');
        if (!cell || cell.getAttribute('contenteditable') === 'true') return;

        const tableEl = el || cell.closest('[data-type="table-frame"], [data-type="table"], g[id^="table-"]') || getTargetElement();
        const isTableSelected = Boolean(
          tableEl && (
            selectedLayerIdRef.current === tableEl.id ||
            tableEl.getAttribute('data-table-selected') === 'true'
          )
        );

        if (!isTableSelected) {
          return;
        }

        selectCellAndSyncPropertiesRef.current?.(cell, e.shiftKey, e.ctrlKey || e.metaKey);
      }, { signal });

      table.addEventListener('click', (e) => {
        if (window.__isResizingTableDivider || window.__isHoveringTableDivider) return;
        const cell = e.target.closest('td, th');
        if (!cell || cell.getAttribute('contenteditable') === 'true') return;

        const tableEl = el || cell.closest('[data-type="table-frame"], [data-type="table"], g[id^="table-"]') || getTargetElement();
        const isTableSelected = Boolean(
          tableEl && (
            selectedLayerIdRef.current === tableEl.id ||
            tableEl.getAttribute('data-table-selected') === 'true'
          )
        );

        if (!isTableSelected) {
          return;
        }

        selectCellAndSyncPropertiesRef.current?.(cell, e.shiftKey, e.ctrlKey || e.metaKey);
      }, { signal });
    }
  }, [getTargetElement, syncChanges]);

  // Ensure table structure is valid and clean
  const ensureTableStructure = useCallback((el) => {
    if (!el) return;
    const existingTable = el.querySelector('table');
    if (existingTable) {
      const bWidth = el.getAttribute('data-border-width') || '1';
      const bStyle = el.getAttribute('data-border-style') || 'solid';
      const bColor = el.getAttribute('data-border-color') || '#cbd5e1';
      const isDashPainted = existingTable.getAttribute('data-dash-applied') === 'true';
      existingTable.querySelectorAll('td, th').forEach(cell => {
        if (!isDashPainted && (!cell.style.border || cell.style.border === 'none' || !cell.style.borderWidth)) {
          cell.style.border = `${bWidth}px ${bStyle} ${bColor}`;
        }
        if (!isDashPainted && !cell.getAttribute('data-cell-border-color')) {
          cell.setAttribute('data-cell-border-color', bColor);
        }
        cell.style.removeProperty('height');
      });
      applyTableDashPattern(el);

      ensureColGroup(existingTable);

      // Self-healing: if row 0 became enlarged (>= 70% with multiple rows), reset equally
      const trs = existingTable.querySelectorAll('tr');
      const rLen = trs.length;
      if (el.getAttribute('data-auto-height') === 'true') {
        // imported table: rows size to their content and the box fits the table
        fitTableToContent(el);
      } else if (rLen > 1) {
        const firstRowH = parseFloat(trs[0].style.height) || 0;
        if (firstRowH >= 70 || !trs[0].style.height) {
          const equalPct = (100 / rLen).toFixed(3);
          trs.forEach(tr => {
            tr.style.height = `${equalPct}%`;
            tr.style.boxSizing = 'border-box';
          });
        }
      }

      if (!selectedCellKeysRef.current || selectedCellKeysRef.current.size === 0) {
        setTableEditMode('global');
        el.setAttribute('data-table-mode', 'global');
      }
      attachCellListeners(el);
      initTableResizers(el.querySelector('table'));
      el.setAttribute('data-table-selected', 'true');
      return;
    }

    // Otherwise generate clean table
    const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    fo.setAttribute('x', '0');
    fo.setAttribute('y', '0');
    fo.setAttribute('width', '300');
    fo.setAttribute('height', '150');
    fo.style.overflow = 'visible';

    let rowsHtml = '';
    const rowHeightPct = (100 / 3).toFixed(3);
    const colWidthPct = (100 / 3).toFixed(3);
    for (let r = 0; r < 3; r++) {
      rowsHtml += `<tr style="height: ${rowHeightPct}%; box-sizing: border-box;">`;
      for (let c = 0; c < 3; c++) {
        rowsHtml += `<td data-row="${r}" data-col="${c}" style="width: ${colWidthPct}%; border: 1px solid #cbd5e1; padding: 6px 8px; color: #000000; text-align: left; vertical-align: middle; box-sizing: border-box; word-break: break-word; outline: none; background-color: #ffffff; cursor: default; user-select: none;"></td>`;
      }
      rowsHtml += '</tr>';
    }

    fo.innerHTML = `<div class="table-card-wrapper table-container" xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;box-sizing:border-box;border-radius:0px;overflow:visible;display:block;margin:0;padding:0;white-space:normal;line-height:normal;outline:none;user-select:none;pointer-events:auto;"><table style="width:100%;height:100%;border-collapse:collapse;border:1px solid #cbd5e1;background-color:#ffffff;font-family:'Poppins',sans-serif;font-size:13pt;table-layout:fixed;margin:0;padding:0;white-space:normal;outline:none;box-sizing:border-box;"><tbody>${rowsHtml}</tbody></table></div>`;
    el.appendChild(fo);
    el.setAttribute('data-type', 'table-frame');
    attachCellListeners(el);
    initTableResizers(el.querySelector('table'));
  }, [attachCellListeners, initTableResizers]);

  // Sync state from element attributes on selection
  useEffect(() => {
    const el = getTargetElement();
    if (!el) return;
    elementRef.current = el;

    ensureTableStructure(el);
    attachCellListeners(el);
    initTableResizers(el.querySelector('table'));

    // When selecting or switching to a table: reset cell selection so NO cell is pre-selected on hover/select!
    if (lastLoadedTableIdRef.current !== selectedLayerId) {
      lastLoadedTableIdRef.current = selectedLayerId;
      clearCellSelectionRef.current?.(el);
      setTableEditMode('global');
      el.setAttribute('data-table-mode', 'global');
      el.setAttribute('data-table-selected', 'true');
    } else if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
      // Cell is actively selected within this table: do not overwrite detected cell properties with table defaults!
      return;
    }

    const bStyle = el.getAttribute('data-border-style') || 'solid';
    const tColor = el.getAttribute('data-theme-color') || '#ffffff';
    const tOpacity = parseInt(el.getAttribute('data-theme-opacity') || '100', 10);
    const bColor = el.getAttribute('data-border-color') || '#cbd5e1';
    const bOpacity = parseInt(el.getAttribute('data-border-opacity') || '100', 10);
    const bWidth = parseFloat(el.getAttribute('data-border-width') || '1');
    const fFam = el.getAttribute('data-font-family') || 'Poppins';
    const fSize = parseInt(el.getAttribute('data-font-size') || '13', 10);
    const fWeight = el.getAttribute('data-font-weight') || 'Regular';
    const tAlign = el.getAttribute('data-text-align') || 'left';
    const vAlign = el.getAttribute('data-vertical-align') || 'middle';
    const rCount = parseInt(el.getAttribute('data-rows') || '3', 10);
    const cCount = parseInt(el.getAttribute('data-cols') || '3', 10);
    const padX = parseInt(el.getAttribute('data-padding-x') || '8', 10);
    const padY = parseInt(el.getAttribute('data-padding-y') || '6', 10);

    setBorderStyle(prev => prev !== bStyle ? bStyle : prev);
    setThemeColor(prev => prev !== tColor ? tColor : prev);
    setThemeOpacity(prev => prev !== tOpacity ? tOpacity : prev);
    setBorderColor(prev => prev !== bColor ? bColor : prev);
    setBorderOpacity(prev => prev !== bOpacity ? bOpacity : prev);
    setBorderWidth(prev => prev !== bWidth ? bWidth : prev);
    setFontFamily(prev => prev !== fFam ? fFam : prev);
    setFontSize(prev => prev !== fSize ? fSize : prev);
    setFontWeight(prev => {
      const norm = normalizeToTailwindWeight(fWeight);
      return prev !== norm ? norm : prev;
    });
    setIsBold(prev => {
      const norm = normalizeToTailwindWeight(fWeight);
      return ['bold', 'semibold', 'extrabold', 'black'].includes(norm);
    });
    setTextAlign(prev => prev !== tAlign ? tAlign : prev);
    setVerticalAlign(prev => prev !== vAlign ? vAlign : prev);
    setRowsCount(prev => prev !== rCount ? rCount : prev);
    setColsCount(prev => prev !== cCount ? cCount : prev);
    setPaddingX(prev => prev !== padX ? padX : prev);
    setPaddingY(prev => prev !== padY ? padY : prev);
  }, [selectedLayerId]);

  // Continuously ensure listeners and resizers remain bound to the live table DOM
  // whenever CanvasViewport re-renders or replaces innerHTML
  useEffect(() => {
    const container = document.getElementById('main-zoom-container') ||
                      document.querySelector('.page-svg-container') ||
                      document.body;
    if (!container) return;

    let rafId = null;
    const checkAndRebind = () => {
      const el = getTargetElement();
      if (!el) return;
      const table = el.querySelector('table');
      if (!table) return;

      const firstTd = table.querySelector('td, th');
      const needsResizers = !table.__hasTableResizers || !table.__resizersController;
      const needsCellListeners = !table.__cellListenersController || (firstTd && !firstTd.__hasCellListeners);

      if (needsResizers) {
        initTableResizers(table);
      }
      if (needsCellListeners) {
        attachCellListeners(el);
      }
      if ((needsResizers || needsCellListeners) && selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
        applyBorderHighlightRef.current?.(table, selectedCellKeysRef.current);
      }
    };

    checkAndRebind();

    const observer = new MutationObserver((mutations) => {
      const isOnlyOverlay = mutations.every(m => {
        const checkNodes = (list) => Array.from(list).every(n =>
          n.nodeType === 1 && (
            n.classList?.contains('table-cell-selection-overlay') ||
            n.id?.includes('highlight-overlay') ||
            n.classList?.contains('selection-overlay-layer')
          )
        );
        return checkNodes(m.addedNodes) && checkNodes(m.removedNodes);
      });
      if (isOnlyOverlay) return;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        checkAndRebind();
      });
    });

    observer.observe(container, {
      childList: true,
      subtree: true
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [selectedLayerId, getTargetElement, initTableResizers, attachCellListeners]);

  // Helper to get selected cells or all cells
  const getTargetCells = useCallback((el) => {
    if (!el) return [];
    const keys = selectedCellKeysRef.current;
    if (keys && keys.size > 0) {
      const result = [];
      keys.forEach(k => {
        const [r, c] = k.split('_');
        const cell = el.querySelector(`td[data-row="${r}"][data-col="${c}"], th[data-row="${r}"][data-col="${c}"]`);
        if (cell) result.push(cell);
      });
      if (result.length > 0) return result;
    }
    const domSelected = Array.from(el.querySelectorAll('td[data-cell-selected], th[data-cell-selected]'));
    if (domSelected.length > 0) return domSelected;
    return Array.from(el.querySelectorAll('td, th'));
  }, []);

  // Apply styles to table
  const applyTableStyles = useCallback((overrides = {}) => {
    const el = getTargetElement();
    if (!el) return;

    const tColor = overrides.themeColor !== undefined ? overrides.themeColor : themeColor;
    const tOpacity = overrides.themeOpacity !== undefined ? overrides.themeOpacity : themeOpacity;
    const bColor = overrides.borderColor !== undefined ? overrides.borderColor : borderColor;
    const bOpacity = overrides.borderOpacity !== undefined ? overrides.borderOpacity : borderOpacity;
    const bWidth = overrides.borderWidth !== undefined ? overrides.borderWidth : borderWidth;
    const bStyle = overrides.borderStyle !== undefined ? overrides.borderStyle : borderStyle;
    const fFam = overrides.fontFamily !== undefined ? overrides.fontFamily : fontFamily;
    const fSize = overrides.fontSize !== undefined ? overrides.fontSize : fontSize;
    const padX = overrides.paddingX !== undefined ? overrides.paddingX : paddingX;
    const padY = overrides.paddingY !== undefined ? overrides.paddingY : paddingY;

    el.setAttribute('data-theme-color', tColor);
    el.setAttribute('data-theme-opacity', String(tOpacity));
    el.setAttribute('data-border-color', bColor);
    el.setAttribute('data-border-opacity', String(bOpacity));
    el.setAttribute('data-border-width', String(bWidth));
    el.setAttribute('data-border-style', bStyle);
    el.setAttribute('data-font-family', fFam);
    el.setAttribute('data-font-size', String(fSize));
    el.setAttribute('data-padding-x', String(padX));
    el.setAttribute('data-padding-y', String(padY));

    const table = el.querySelector('table');
    if (table) {
      const borderRgba = hexToRgba(bColor, bOpacity);
      const themeRgba = hexToRgba(tColor, tOpacity);

      table.style.border = `${bWidth}px ${bStyle} ${borderRgba}`;
      if (tColor && (tColor.includes('gradient') || tColor.includes('url(#'))) {
        table.style.background = tColor;
      } else {
        table.style.background = 'none';
        table.style.backgroundColor = themeRgba;
      }
      table.style.fontFamily = `'${fFam}', sans-serif`;
      table.style.fontSize = `${fSize}pt`;

      table.querySelectorAll('td, th').forEach((cell) => {
        const customBg = cell.getAttribute('data-cell-bg-color') || cell.getAttribute('data-cell-bg');
        if (!customBg && tColor) cell.style.backgroundColor = themeRgba;
        // Clear per-side overrides BEFORE writing the border (removing them afterwards wiped it)
        ['top', 'bottom', 'left', 'right'].forEach((side) => {
          cell.style.removeProperty(`border-${side}-color`);
          cell.style.removeProperty(`border-${side}-width`);
          cell.style.removeProperty(`border-${side}-style`);
        });
        cell.style.borderColor = borderRgba;
        cell.style.borderWidth = `${bWidth}px`;
        cell.style.borderStyle = bStyle;
        cell.style.fontFamily = `'${fFam}', sans-serif`;
        cell.style.fontSize = `${fSize}pt`;
        cell.style.padding = `${padY}px ${padX}px`;
        cell.removeAttribute('data-cell-border-color');
        cell.removeAttribute('data-cell-border-width');
        cell.removeAttribute('data-cell-border-style');
        cell.removeAttribute('data-cell-border-top');
        cell.removeAttribute('data-cell-border-bottom');
        cell.removeAttribute('data-cell-border-left');
        cell.removeAttribute('data-cell-border-right');
      });
      applyTableDashPattern(el);

      if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0 && applyBorderHighlightRef.current) {
        applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
      }
      initTableResizers(table);
    }

    syncChanges(el);
  }, [getTargetElement, themeColor, themeOpacity, borderColor, borderOpacity, borderWidth, borderStyle, fontFamily, fontSize, paddingX, paddingY, initTableResizers, syncChanges]);

  // Text Color handler for cells
  const handleSetCellTextColor = useCallback((newColor) => {
    const colorStr = typeof newColor === 'string' ? newColor : (newColor?.hex || newColor?.rgb || '#000000');
    setCellColor(colorStr);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (!table) return;

    el.setAttribute('data-font-color', colorStr);
    el.setAttribute('data-cell-color', colorStr);

    const hasSelectedCells = Boolean(selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0);
    const cellsToUpdate = hasSelectedCells ? getTargetCells(el) : Array.from(table.querySelectorAll('td, th'));

    cellsToUpdate.forEach(cell => {
      cell.style.setProperty('color', colorStr, 'important');
      cell.setAttribute('data-cell-text-color', colorStr);
      cell.querySelectorAll('*').forEach(child => {
        child.style.setProperty('color', colorStr, 'important');
        if (child.tagName?.toLowerCase() === 'font') {
          child.setAttribute('color', colorStr);
        }
      });
    });

    if (!hasSelectedCells) {
      table.style.setProperty('color', colorStr, 'important');
    }

    if (hasSelectedCells && applyBorderHighlightRef.current) {
      applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
    }
    syncChanges(el);
  }, [getTargetElement, getTargetCells, syncChanges]);

  // Text Opacity handler for cells
  const handleSetCellTextOpacity = useCallback((newOpacity) => {
    const op = Math.min(Math.max(parseInt(newOpacity, 10) || 0, 0), 100);
    setCellOpacity(op);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (!table) return;

    el.setAttribute('data-font-opacity', op.toString());

    const hasSelectedCells = Boolean(selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0);
    const cellsToUpdate = hasSelectedCells ? getTargetCells(el) : Array.from(table.querySelectorAll('td, th'));

    cellsToUpdate.forEach(cell => {
      cell.style.setProperty('opacity', (op / 100).toString());
    });

    syncChanges(el);
  }, [getTargetElement, getTargetCells, syncChanges]);

  // Never leave the window-global divider flags set when this table panel closes
  useEffect(() => () => {
    window.__isHoveringTableDivider = false;
    window.__isResizingTableDivider = false;
    document.body.classList.remove('table-resizing-active');
  }, []);

  // Appearance: Color state representation for Color.jsx
  const [dashTick, setDashTick] = useState(0); // bumps when the saved Dash Property (L / G) changes
  const savedDashL = parseFloat(getTargetElement()?.getAttribute('data-dash-l') || '') || 8;
  const savedDashG = parseFloat(getTargetElement()?.getAttribute('data-dash-g') || '') || 4;
  const backgroundColor = useMemo(() => ({
    fill: themeColor || '#ffffff',
    fillOpacity: themeOpacity !== undefined ? themeOpacity : 100,
    stroke: borderColor || '#d1d5db',
    strokeOpacity: borderOpacity !== undefined ? borderOpacity : 100,
    fillType: themeColor?.includes('gradient') ? 'gradient' : 'solid',
    fillGradientType: 'linear',
    strokeType: 'solid',
    strokeGradientType: 'linear',
    strokeWeight: borderWidth !== undefined ? borderWidth : 1,
    strokeDashStyle: (borderStyle === 'dashed' || borderStyle === 'dotted') ? 'Dashed' : 'Solid',
    // the table's own saved L / G (was hard-coded 8,4, so reselecting showed different values)
    strokeDasharrayValue: (borderStyle === 'dashed' || borderStyle === 'dotted') ? `${savedDashL},${savedDashG}` : 'none',
    strokeDasharray: (borderStyle === 'dashed' || borderStyle === 'dotted') ? `${savedDashL},${savedDashG}` : 'none',
    strokeDashLength: savedDashL,
    strokeDashGap: savedDashG,
    strokeLinecap: 'butt',
    strokePosition: 'Center',
  }), [themeColor, themeOpacity, borderColor, borderOpacity, borderWidth, borderStyle, savedDashL, savedDashG, dashTick]);

  const handleSetBackgroundColor = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(backgroundColor) : updater;
    if (!next) return;

    const isFillChange = (next.fill !== undefined && next.fill !== backgroundColor.fill) ||
                         (next.fillOpacity !== undefined && next.fillOpacity !== backgroundColor.fillOpacity);
    const isStrokeChange = (next.stroke !== undefined && next.stroke !== backgroundColor.stroke) ||
                           (next.strokeOpacity !== undefined && next.strokeOpacity !== backgroundColor.strokeOpacity) ||
                           (next.strokeWeight !== undefined && next.strokeWeight !== backgroundColor.strokeWeight) ||
                           (next.strokeDashStyle !== undefined && next.strokeDashStyle !== backgroundColor.strokeDashStyle);

    let newThemeColor = next.fill !== undefined ? next.fill : themeColor;
    let newThemeOpacity = next.fillOpacity !== undefined ? next.fillOpacity : themeOpacity;
    let newBorderColor = next.stroke !== undefined ? next.stroke : borderColor;
    let newBorderOpacity = next.strokeOpacity !== undefined ? next.strokeOpacity : borderOpacity;
    let newBorderWidth = next.strokeWeight !== undefined ? next.strokeWeight : borderWidth;
    let newBorderStyle = borderStyle;

    // Solid or Dashed only (Dotted removed). The old "contains a 2" test turned dash values like
    // "2,4" / "12,4" into dotted, so Dashed seemed not to work.
    const dashVal = next.strokeDasharrayValue ?? next.strokeDasharray;
    if (next.strokeDashStyle === 'Solid' || dashVal === 'none') {
      newBorderStyle = 'solid';
    } else if (next.strokeDashStyle === 'Dashed' || (dashVal && dashVal !== 'none')) {
      newBorderStyle = 'dashed';
    }
    if (newBorderStyle === 'dotted') newBorderStyle = 'dashed';

    // Picking a stroke colour / width must SHOW lines: a table left at style "none" / width 0
    // (e.g. after the "Clear" preset) otherwise wiped every cell border and only an outer box remained.
    const isRealStrokeColor = newBorderColor && newBorderColor !== 'transparent' && newBorderColor !== 'none' && newBorderColor !== '#';
    if (isStrokeChange && isRealStrokeColor) {
      if (newBorderStyle === 'none') newBorderStyle = 'solid';
      if (!(Number(newBorderWidth) > 0)) newBorderWidth = 1;
    }

    if (isFillChange) {
      setThemeColor(newThemeColor);
      setThemeOpacity(newThemeOpacity);
    }
    if (isStrokeChange) {
      setBorderColor(newBorderColor);
      setBorderOpacity(newBorderOpacity);
      setBorderWidth(newBorderWidth);
      setBorderStyle(newBorderStyle);
    }

    const el = getTargetElement();
    const table = el?.querySelector('table');
    if (!el || !table) return;

    // Stroke is strictly GLOBAL: always applies to entire table and all its cells
    if (isStrokeChange) {
      el.setAttribute('data-border-color', newBorderColor);
      el.setAttribute('data-border-opacity', String(newBorderOpacity));
      el.setAttribute('data-border-width', String(newBorderWidth));
      el.setAttribute('data-border-style', newBorderStyle);

      const bRgba = hexToRgba(newBorderColor, newBorderOpacity);
      if (newBorderWidth === 0 || newBorderStyle === 'none' || newBorderColor === 'transparent') {
        table.style.border = 'none';
        table.querySelectorAll('td, th').forEach((cell) => {
          cell.style.border = 'none';
          cell.removeAttribute('data-cell-border-color');
          cell.removeAttribute('data-cell-border-width');
          cell.removeAttribute('data-cell-border-style');
          cell.removeAttribute('data-cell-border-top');
          cell.removeAttribute('data-cell-border-bottom');
          cell.removeAttribute('data-cell-border-left');
          cell.removeAttribute('data-cell-border-right');
          cell.style.removeProperty('border-top-color');
          cell.style.removeProperty('border-bottom-color');
          cell.style.removeProperty('border-left-color');
          cell.style.removeProperty('border-right-color');
          cell.style.removeProperty('border-top-width');
          cell.style.removeProperty('border-bottom-width');
          cell.style.removeProperty('border-left-width');
          cell.style.removeProperty('border-right-width');
          cell.style.removeProperty('border-top-style');
          cell.style.removeProperty('border-bottom-style');
          cell.style.removeProperty('border-left-style');
          cell.style.removeProperty('border-right-style');
        });
      } else {
        const bCss = `${newBorderWidth}px ${newBorderStyle} ${bRgba}`;
        table.style.border = bCss;
        table.style.borderColor = bRgba;
        table.style.borderWidth = `${newBorderWidth}px`;
        table.style.borderStyle = newBorderStyle;

        table.querySelectorAll('td, th').forEach((cell) => {
          // Clear old per-side overrides FIRST: removing border-*-style/width/color longhands after
          // setting the "border" shorthand wiped the shorthand too (cell border became "none 0px"),
          // so only the table's outer border stayed visible.
          ['top', 'bottom', 'left', 'right'].forEach((side) => {
            cell.style.removeProperty(`border-${side}-color`);
            cell.style.removeProperty(`border-${side}-width`);
            cell.style.removeProperty(`border-${side}-style`);
          });
          cell.style.border = bCss;
          cell.style.borderColor = bRgba;
          cell.style.borderWidth = `${newBorderWidth}px`;
          cell.style.borderStyle = newBorderStyle;
          cell.removeAttribute('data-cell-border-color');
          cell.removeAttribute('data-cell-border-width');
          cell.removeAttribute('data-cell-border-style');
          cell.removeAttribute('data-cell-border-top');
          cell.removeAttribute('data-cell-border-bottom');
          cell.removeAttribute('data-cell-border-left');
          cell.removeAttribute('data-cell-border-right');
        });
      }
    }

    // Fill applies per-cell if cells are selected, or globally if no cells are selected
    if (isFillChange) {
      const hasSelection = (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) ||
                           Boolean(el.querySelector('td[data-cell-selected], th[data-cell-selected]'));
      const fillRgba = hexToRgba(newThemeColor, newThemeOpacity);

      if (hasSelection) {
        const selectedCells = getTargetCells(el);
        selectedCells.forEach(cell => {
          cell.style.backgroundColor = fillRgba;
          cell.setAttribute('data-cell-bg', newThemeColor);
          cell.setAttribute('data-cell-bg-color', newThemeColor);
          cell.setAttribute('data-cell-bg-opacity', String(newThemeOpacity));
        });
      } else {
        el.setAttribute('data-theme-color', newThemeColor);
        el.setAttribute('data-theme-opacity', String(newThemeOpacity));
        if (newThemeColor && (newThemeColor.includes('gradient') || newThemeColor.includes('url(#'))) {
          table.style.background = newThemeColor;
        } else {
          table.style.background = 'none';
          table.style.backgroundColor = fillRgba;
        }
        table.querySelectorAll('td, th').forEach((cell) => {
          cell.style.backgroundColor = fillRgba;
          cell.removeAttribute('data-cell-bg');
          cell.removeAttribute('data-cell-bg-color');
          cell.removeAttribute('data-cell-bg-opacity');
        });
      }
    }

    // Dash Property (L / G): remember it on the table and repaint the custom dashed lines
    const dashValue = next.strokeDasharrayValue ?? next.strokeDasharray;
    if (dashValue && dashValue !== 'none') {
      const [dl, dg] = String(dashValue).split(/[\s,]+/).map((v) => parseFloat(v));
      if (dl > 0) el.setAttribute('data-dash-l', String(dl));
      if (dg > 0) el.setAttribute('data-dash-g', String(dg));
      setDashTick((t) => t + 1);
    }
    if (isStrokeChange) el.setAttribute('data-border-preset', 'all');
    applyTableDashPattern(el);

    if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0 && applyBorderHighlightRef.current) {
      applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
      requestAnimationFrame(() => {
        applyBorderHighlightRef.current?.(table, selectedCellKeysRef.current);
      });
    }
    initTableResizers(table);
    syncChanges(el);
  }, [backgroundColor, themeColor, themeOpacity, borderColor, borderOpacity, borderWidth, borderStyle, getTargetElement, getTargetCells, initTableResizers, syncChanges]);

  // ── Structure engine (merge-aware, selection-aware) ─────────────────────────────────────────
  // Rows / columns are inserted next to the selected cell(s) (or at the end with nothing selected),
  // delete removes the selected rows / columns (or the last one), merged cells grow / shrink instead
  // of breaking, column widths are kept, and the cell highlight is redrawn on the same cells.
  const makeTableCell = () => {
    const td = document.createElement('td');
    td.style.border = `${borderWidth}px ${borderStyle} ${hexToRgba(borderColor, borderOpacity)}`;
    td.style.padding = `${paddingY}px ${paddingX}px`;
    td.style.backgroundColor = hexToRgba(themeColor, themeOpacity);
    td.style.color = cellColor;
    td.style.textAlign = textAlign;
    td.style.verticalAlign = verticalAlign;
    td.style.boxSizing = 'border-box';
    td.style.wordBreak = 'break-word';
    td.style.userSelect = 'none';
    td.style.cursor = 'default';
    td.style.outline = 'none';
    return td;
  };

  // Logical grid: grid[r][c] -> the cell covering that slot (merged cells cover several slots)
  const buildTableGrid = (table) => {
    const trs = Array.from(table.querySelectorAll('tr'));
    const grid = trs.map(() => []);
    trs.forEach((tr, r) => {
      let c = 0;
      Array.from(tr.children).forEach((td) => {
        const tag = td.tagName.toLowerCase();
        if (tag !== 'td' && tag !== 'th') return;
        while (grid[r][c] !== undefined) c++;
        const cs = parseInt(td.getAttribute('colspan') || '1', 10);
        const rs = parseInt(td.getAttribute('rowspan') || '1', 10);
        for (let dr = 0; dr < rs; dr++) {
          for (let dc = 0; dc < cs; dc++) {
            if (!grid[r + dr]) grid[r + dr] = [];
            grid[r + dr][c + dc] = td;
          }
        }
        td.__gr = r; td.__gc = c; td.__rs = rs; td.__cs = cs;
        c += cs;
      });
    });
    const totalCols = grid.reduce((m, row) => Math.max(m, row.length), 0);
    return { trs, grid, totalCols };
  };

  // Bounds of the selected cells in grid slots (merged cells count with their full span)
  const getSelectionBounds = (table) => {
    const keys = selectedCellKeysRef.current;
    if (!keys || keys.size === 0) return null;
    let minR = Infinity, maxR = -1, minC = Infinity, maxC = -1;
    keys.forEach((k) => {
      const [r, c] = k.split('_').map(Number);
      if (Number.isNaN(r) || Number.isNaN(c)) return;
      const cell = table.querySelector(`td[data-row="${r}"][data-col="${c}"], th[data-row="${r}"][data-col="${c}"]`);
      const rs = cell ? parseInt(cell.getAttribute('rowspan') || '1', 10) : 1;
      const cs = cell ? parseInt(cell.getAttribute('colspan') || '1', 10) : 1;
      minR = Math.min(minR, r); maxR = Math.max(maxR, r + rs - 1);
      minC = Math.min(minC, c); maxC = Math.max(maxC, c + cs - 1);
    });
    return Number.isFinite(minR) ? { minR, maxR, minC, maxC } : null;
  };

  const readColWidths = (table, totalCols) => {
    const cols = Array.from(table.querySelectorAll('colgroup col'));
    if (cols.length === totalCols) {
      return cols.map((col) => parseFloat(col.style.width) || (100 / totalCols));
    }
    return Array.from({ length: totalCols }, () => 100 / totalCols);
  };

  const writeColWidths = (table, widths) => {
    const sum = widths.reduce((a, b) => a + b, 0) || 1;
    let colgroup = table.querySelector('colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      table.insertBefore(colgroup, table.firstChild);
    }
    colgroup.innerHTML = '';
    widths.forEach((w) => {
      const col = document.createElement('col');
      col.style.width = `${((w / sum) * 100).toFixed(3)}%`;
      colgroup.appendChild(col);
    });
  };

  // Re-index cells, keep colgroup / counts in sync, re-select and redraw the highlight
  const finishStructureChange = (el, table, pickKeys) => {
    const trs = Array.from(table.querySelectorAll('tr'));
    const rowHeightPct = (100 / Math.max(1, trs.length)).toFixed(3);
    trs.forEach((tr) => { tr.style.height = `${rowHeightPct}%`; tr.style.boxSizing = 'border-box'; });

    attachCellListeners(el); // re-writes data-row / data-col from the new layout
    const { totalCols } = ensureColGroup(table);

    setRowsCount(trs.length);
    setColsCount(totalCols);
    el.setAttribute('data-rows', String(trs.length));
    el.setAttribute('data-cols', String(totalCols));

    applyTableDashPattern(el); // new / removed edges need their dashed lines
    let nextKeys = typeof pickKeys === 'function' ? pickKeys() : null;
    if (nextKeys) {
      // keep only keys that point at a real cell after the change
      nextKeys = new Set([...nextKeys].filter((k) => {
        const [r, c] = k.split('_');
        return !!table.querySelector(`td[data-row="${r}"][data-col="${c}"], th[data-row="${r}"][data-col="${c}"]`);
      }));
      selectedCellKeysRef.current = nextKeys;
      setSelectedCellKeys(new Set(nextKeys));
      if (nextKeys.size === 1) {
        const [r, c] = [...nextKeys][0].split('_').map(Number);
        lastAnchorRef.current = { r, c };
        const td = table.querySelector(`td[data-row="${r}"][data-col="${c}"], th[data-row="${r}"][data-col="${c}"]`);
        setSelectedCellText(td?.textContent || '');
      }
    }
    applyBorderHighlight(table, selectedCellKeysRef.current || new Set());
    requestAnimationFrame(() => applyBorderHighlightRef.current?.(table, selectedCellKeysRef.current || new Set()));
    initTableResizers(table);
    syncChanges(el);
    setStructureVersion((v) => v + 1);
    window.dispatchEvent(new CustomEvent('force-update-selection-box', { detail: { elementId: el.id } }));
  };

  const shiftKeys = (axis, from) => () => {
    const keys = selectedCellKeysRef.current;
    if (!keys || keys.size === 0) return null;
    return new Set([...keys].map((k) => {
      const [r, c] = k.split('_').map(Number);
      if (axis === 'r') return `${r >= from ? r + 1 : r}_${c}`;
      return `${r}_${c >= from ? c + 1 : c}`;
    }));
  };

  // Insert a row above / below the selection (end of table when nothing is selected)
  const insertRow = (where = 'below') => {
    const el = getTargetElement();
    const table = el?.querySelector('table');
    if (!table) return;
    const { trs, grid, totalCols } = buildTableGrid(table);
    if (trs.length === 0) return;
    const b = getSelectionBounds(table);
    const at = b ? (where === 'above' ? b.minR : b.maxR + 1) : trs.length;

    const newTr = document.createElement('tr');
    newTr.style.boxSizing = 'border-box';
    const grown = new Set();
    for (let c = 0; c < totalCols; c++) {
      const above = at > 0 ? grid[at - 1]?.[c] : null;
      const below = grid[at]?.[c];
      if (above && above === below) {
        // a merged cell spans across the new row: stretch it instead of adding a cell
        if (!grown.has(above)) { above.setAttribute('rowspan', String(above.__rs + 1)); grown.add(above); }
        continue;
      }
      newTr.appendChild(makeTableCell());
    }
    if (at >= trs.length) trs[trs.length - 1].parentNode.appendChild(newTr);
    else trs[at].parentNode.insertBefore(newTr, trs[at]);

    finishStructureChange(el, table, where === 'above' ? shiftKeys('r', at) : () => selectedCellKeysRef.current);
  };

  // Insert a column left / right of the selection (end of table when nothing is selected)
  const insertColumn = (where = 'right') => {
    const el = getTargetElement();
    const table = el?.querySelector('table');
    if (!table) return;
    const { trs, grid, totalCols } = buildTableGrid(table);
    if (trs.length === 0) return;
    const b = getSelectionBounds(table);
    const at = b ? (where === 'left' ? b.minC : b.maxC + 1) : totalCols;

    const widths = readColWidths(table, totalCols);
    const grown = new Set();
    trs.forEach((tr, r) => {
      const left = at > 0 ? grid[r]?.[at - 1] : null;
      const right = grid[r]?.[at];
      if (left && left === right) {
        if (!grown.has(left)) { left.setAttribute('colspan', String(left.__cs + 1)); grown.add(left); }
        return;
      }
      const td = makeTableCell();
      // before the first cell that STARTS in this row at/after the insertion column
      const ref = Array.from(tr.children).find((x) => x.__gr === r && x.__gc >= at);
      if (ref) tr.insertBefore(td, ref); else tr.appendChild(td);
    });
    const neighbour = widths[Math.min(Math.max(at - 1, 0), widths.length - 1)] || (100 / totalCols);
    widths.splice(at, 0, neighbour);
    writeColWidths(table, widths);

    finishStructureChange(el, table, where === 'left' ? shiftKeys('c', at) : () => selectedCellKeysRef.current);
  };

  // Delete the selected rows (last row when nothing is selected)
  const deleteRows = () => {
    const el = getTargetElement();
    const table = el?.querySelector('table');
    if (!table) return;
    const { trs, grid, totalCols } = buildTableGrid(table);
    const b = getSelectionBounds(table);
    const minR = b ? b.minR : trs.length - 1;
    const maxR = b ? b.maxR : trs.length - 1;
    if (trs.length - (maxR - minR + 1) < 1) return; // keep at least one row

    const handled = new Set();
    for (let r = minR; r <= maxR; r++) {
      for (let c = 0; c < totalCols; c++) {
        const cell = grid[r]?.[c];
        if (!cell || handled.has(cell)) continue;
        handled.add(cell);
        const start = cell.__gr;
        const end = start + cell.__rs - 1;
        const overlap = Math.min(end, maxR) - Math.max(start, minR) + 1;
        const newRs = cell.__rs - overlap;
        if (newRs <= 0) { cell.remove(); continue; }
        if (newRs === 1) cell.removeAttribute('rowspan'); else cell.setAttribute('rowspan', String(newRs));
        if (start >= minR) {
          // its home row is going away: move it down into the first remaining row
          const destTr = trs[maxR + 1];
          if (destTr) {
            const ref = Array.from(destTr.children).find((x) => x.__gr === maxR + 1 && x.__gc > cell.__gc);
            if (ref) destTr.insertBefore(cell, ref); else destTr.appendChild(cell);
          }
        }
      }
    }
    for (let r = maxR; r >= minR; r--) trs[r]?.remove();

    const keepC = b ? b.minC : 0;
    finishStructureChange(el, table, () => {
      if (!b) return selectedCellKeysRef.current;
      const rows = table.querySelectorAll('tr').length;
      const r = Math.min(minR, rows - 1);
      const { grid: g } = buildTableGrid(table);
      const cell = g[r]?.[Math.min(keepC, (g[r]?.length || 1) - 1)];
      return cell ? new Set([`${cell.__gr}_${cell.__gc}`]) : new Set();
    });
  };

  // Delete the selected columns (last column when nothing is selected)
  const deleteColumns = () => {
    const el = getTargetElement();
    const table = el?.querySelector('table');
    if (!table) return;
    const { trs, grid, totalCols } = buildTableGrid(table);
    const b = getSelectionBounds(table);
    const minC = b ? b.minC : totalCols - 1;
    const maxC = b ? b.maxC : totalCols - 1;
    if (totalCols - (maxC - minC + 1) < 1) return; // keep at least one column

    const widths = readColWidths(table, totalCols);
    const handled = new Set();
    trs.forEach((_, r) => {
      for (let c = minC; c <= maxC; c++) {
        const cell = grid[r]?.[c];
        if (!cell || handled.has(cell)) continue;
        handled.add(cell);
        const start = cell.__gc;
        const end = start + cell.__cs - 1;
        const overlap = Math.min(end, maxC) - Math.max(start, minC) + 1;
        const newCs = cell.__cs - overlap;
        if (newCs <= 0) { cell.remove(); continue; }
        if (newCs === 1) cell.removeAttribute('colspan'); else cell.setAttribute('colspan', String(newCs));
      }
    });
    widths.splice(minC, maxC - minC + 1);
    writeColWidths(table, widths);

    const keepR = b ? b.minR : 0;
    finishStructureChange(el, table, () => {
      if (!b) return selectedCellKeysRef.current;
      const { grid: g, totalCols: tc } = buildTableGrid(table);
      const cell = g[Math.min(keepR, g.length - 1)]?.[Math.min(minC, tc - 1)];
      return cell ? new Set([`${cell.__gr}_${cell.__gc}`]) : new Set();
    });
  };

  // Paste spreadsheet cells (Excel / Sheets) into this table: fills from the selected cell (or A1),
  // adding rows / columns at the end when the pasted block is bigger than the table.
  useEffect(() => {
    const onTablePaste = (e) => {
      const detail = e.detail;
      const rows = detail?.rows;
      if (!Array.isArray(rows) || !rows.length) return;
      const el = getTargetElement();
      const table = el?.querySelector('table');
      if (!el || !table || !el.isConnected) return;
      detail.handled = true;

      let { trs, grid, totalCols } = buildTableGrid(table);
      const b = getSelectionBounds(table);
      const startR = b ? b.minR : 0;
      const startC = b ? b.minC : 0;
      const needR = startR + rows.length;
      const needC = startC + Math.max(...rows.map((r) => r.length));

      // grow: extra columns on every row, then extra rows
      if (needC > totalCols) {
        const widths = readColWidths(table, totalCols);
        const extra = needC - totalCols;
        trs.forEach((tr) => { for (let k = 0; k < extra; k++) tr.appendChild(makeTableCell()); });
        const avg = widths.reduce((a, w) => a + w, 0) / (widths.length || 1);
        for (let k = 0; k < extra; k++) widths.push(avg);
        writeColWidths(table, widths);
      }
      const tbody = table.querySelector('tbody') || table;
      const colsNow = Math.max(needC, totalCols);
      for (let r = trs.length; r < needR; r++) {
        const tr = document.createElement('tr');
        tr.style.boxSizing = 'border-box';
        for (let c = 0; c < colsNow; c++) tr.appendChild(makeTableCell());
        tbody.appendChild(tr);
      }

      ({ grid } = buildTableGrid(table));
      rows.forEach((rowVals, dr) => {
        rowVals.forEach((val, dc) => {
          const cell = grid[startR + dr]?.[startC + dc];
          // write only into a cell's own top-left slot (merged cells keep one value)
          if (cell && cell.__gr === startR + dr && cell.__gc === startC + dc) cell.textContent = val;
        });
      });

      finishStructureChange(el, table, () => {
        const keys = new Set();
        for (let r = startR; r < needR; r++) for (let c = startC; c < needC; c++) keys.add(`${r}_${c}`);
        return keys;
      });
      if (el.getAttribute('data-auto-height') === 'true') {
        fitTableToContent(el);
        syncChanges(el);
      }
    };
    window.addEventListener('fbe-table-paste', onTablePaste);
    return () => window.removeEventListener('fbe-table-paste', onTablePaste);
  });

  // Rows / Cols +/- buttons
  const handleAddRow = () => insertRow('below');
  const handleDeleteRow = () => deleteRows();
  const handleAddColumn = () => insertColumn('right');
  const handleDeleteColumn = () => deleteColumns();

  // Merge selected rectangular range of cells
  const handleMergeCells = useCallback(() => {
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (!table) return;

    if (selectedCellKeys.size < 2) return;

    const entries = Array.from(selectedCellKeys).map(k => {
      const [r, c] = k.split('_').map(Number);
      return { r, c };
    });

    const minR = Math.min(...entries.map(e => e.r));
    const maxR = Math.max(...entries.map(e => e.r));
    const minC = Math.min(...entries.map(e => e.c));
    const maxC = Math.max(...entries.map(e => e.c));

    const rowSpan = maxR - minR + 1;
    const colSpan = maxC - minC + 1;

    // Master cell is at (minR, minC)
    const trs = Array.from(table.querySelectorAll('tr'));
    let masterCell = null;
    const masterContent = [];

    // Collect all cells in the range
    const cellsToRemove = [];
    for (let r = minR; r <= maxR; r++) {
      const tr = trs[r];
      if (!tr) continue;
      for (let c = minC; c <= maxC; c++) {
        const cell = tr.querySelector(`td[data-row="${r}"][data-col="${c}"], th[data-row="${r}"][data-col="${c}"]`);
        if (cell) {
          if (r === minR && c === minC) {
            masterCell = cell;
            if (cell.innerText?.trim()) masterContent.push(cell.innerText.trim());
          } else {
            if (cell.innerText?.trim()) masterContent.push(cell.innerText.trim());
            cellsToRemove.push(cell);
          }
        }
      }
    }

    if (!masterCell) return;

    // Set colspan & rowspan
    if (colSpan > 1) masterCell.setAttribute('colspan', colSpan.toString());
    if (rowSpan > 1) masterCell.setAttribute('rowspan', rowSpan.toString());

    // Join text contents if any
    if (masterContent.length > 0) {
      masterCell.innerText = masterContent.join(' ');
    }

    // Remove merged subordinate cells
    cellsToRemove.forEach(cell => cell.remove());

    // Update selection to only the master cell
    const single = new Set([`${minR}_${minC}`]);
    setSelectedCellKeys(single);
    selectedCellKeysRef.current = single;
    lastAnchorRef.current = { r: minR, c: minC };
    applyBorderHighlight(table, single);

    ensureColGroup(table);
    attachCellListeners(el);
    syncChanges(el);
    setStructureVersion(v => v + 1);
  }, [getTargetElement, selectedCellKeys, applyBorderHighlight, ensureColGroup, attachCellListeners, syncChanges]);

  // Unmerge cells that have colspan > 1 or rowspan > 1
  const handleUnmergeCells = useCallback(() => {
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (!table) return;

    const bWidth = el.getAttribute('data-border-width') || '1';
    const bStyle = el.getAttribute('data-border-style') || 'solid';
    const bColor = el.getAttribute('data-border-color') || '#cbd5e1';
    const bOpacity = parseInt(el.getAttribute('data-border-opacity') || '100', 10);
    const borderRgba = hexToRgba(bColor, bOpacity);

    // Find merged cells to unmerge (either selected ones or all in table)
    let targets = [];
    if (selectedCellKeys.size > 0) {
      targets = Array.from(table.querySelectorAll('td[colspan], th[colspan], td[rowspan], th[rowspan]'))
        .filter(td => {
          const r = (td.getAttribute('data-row') || '').trim();
          const c = (td.getAttribute('data-col') || '').trim();
          const colSpan = parseInt(td.getAttribute('colspan') || '1', 10);
          const rowSpan = parseInt(td.getAttribute('rowspan') || '1', 10);
          return (colSpan > 1 || rowSpan > 1) && selectedCellKeys.has(`${r}_${c}`);
        });
    } else {
      targets = Array.from(table.querySelectorAll('td[colspan], th[colspan], td[rowspan], th[rowspan]'))
        .filter(td => {
          const colSpan = parseInt(td.getAttribute('colspan') || '1', 10);
          const rowSpan = parseInt(td.getAttribute('rowspan') || '1', 10);
          return colSpan > 1 || rowSpan > 1;
        });
    }
    if (targets.length === 0) return;

    const trs = Array.from(table.querySelectorAll('tr'));
    const totalCols = colsCount || trs[0]?.children?.length || 3;
    const defaultColWidthPct = (100 / totalCols).toFixed(3);

    targets.forEach(cell => {
      const colSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
      const rowSpan = parseInt(cell.getAttribute('rowspan') || '1', 10);
      const startR = parseInt(cell.getAttribute('data-row') || '0', 10);
      const startC = parseInt(cell.getAttribute('data-col') || '0', 10);

      cell.removeAttribute('colspan');
      cell.removeAttribute('rowspan');
      cell.style.width = `${defaultColWidthPct}%`;

      // Recreate missing cells across the (rowSpan x colSpan) area
      for (let r = startR; r < startR + rowSpan; r++) {
        const tr = trs[r];
        if (!tr) continue;

        for (let c = startC; c < startC + colSpan; c++) {
          if (r === startR && c === startC) continue;

          const newTd = document.createElement('td');
          newTd.setAttribute('data-row', r.toString());
          newTd.setAttribute('data-col', c.toString());
          newTd.style.width = `${defaultColWidthPct}%`;
          newTd.style.border = `${bWidth}px ${bStyle} ${borderRgba}`;
          newTd.style.padding = `${paddingY}px ${paddingX}px`;
          newTd.style.backgroundColor = hexToRgba(themeColor, themeOpacity);
          newTd.style.color = cellColor;
          newTd.style.textAlign = textAlign;
          newTd.style.verticalAlign = verticalAlign;
          newTd.style.boxSizing = 'border-box';
          newTd.style.wordBreak = 'break-word';
          newTd.style.outline = 'none';
          newTd.style.cursor = 'default';
          newTd.style.userSelect = 'none';

          // Insert at the right column order in row r
          const nextSibling = Array.from(tr.children).find(td => {
            const tdCol = parseInt(td.getAttribute('data-col') || '999', 10);
            return tdCol > c;
          });

          if (nextSibling) {
            tr.insertBefore(newTd, nextSibling);
          } else {
            tr.appendChild(newTd);
          }
        }
      }
    });

    clearCellSelection(el);
    ensureColGroup(table);
    attachCellListeners(el);
    syncChanges(el);
    setStructureVersion(v => v + 1);
  }, [getTargetElement, selectedCellKeys, colsCount, paddingY, paddingX, themeColor, themeOpacity, cellColor, textAlign, verticalAlign, clearCellSelection, ensureColGroup, attachCellListeners, syncChanges]);

  // Check if unmerging is possible (for selected cells if any, or anywhere in table)
  const canUnmerge = useMemo(() => {
    const el = getTargetElement();
    const table = el?.querySelector('table');
    if (!table) return false;

    if (selectedCellKeys.size > 0) {
      const mergedCells = Array.from(table.querySelectorAll('td[colspan], th[colspan], td[rowspan], th[rowspan]'));
      return mergedCells.some(cell => {
        const r = (cell.getAttribute('data-row') || '').trim();
        const c = (cell.getAttribute('data-col') || '').trim();
        const colSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
        const rowSpan = parseInt(cell.getAttribute('rowspan') || '1', 10);
        return (colSpan > 1 || rowSpan > 1) && selectedCellKeys.has(`${r}_${c}`);
      });
    }

    const anyMerged = Array.from(table.querySelectorAll('td[colspan], th[colspan], td[rowspan], th[rowspan]'));
    return anyMerged.some(cell => {
      const colSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
      const rowSpan = parseInt(cell.getAttribute('rowspan') || '1', 10);
      return colSpan > 1 || rowSpan > 1;
    });
  }, [selectedCellKeys, getTargetElement, selectedLayerId, rowsCount, colsCount, structureVersion]);

  // Border Presets handler (Global table stroke preset)
  const handleBorderPreset = (preset) => {
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (!table) return;

    const bRgba = hexToRgba(borderColor, borderOpacity);

    if (preset === 'none') {
      setBorderWidth(0);
      setBorderStyle('none');
      table.style.border = 'none';
      el.setAttribute('data-border-width', '0');
      el.setAttribute('data-border-style', 'none');

      table.querySelectorAll('td, th').forEach(cell => {
        cell.style.border = 'none';
        cell.removeAttribute('data-cell-border-color');
        cell.removeAttribute('data-cell-border-width');
        cell.removeAttribute('data-cell-border-style');
        cell.removeAttribute('data-cell-border-top');
        cell.removeAttribute('data-cell-border-bottom');
        cell.removeAttribute('data-cell-border-left');
        cell.removeAttribute('data-cell-border-right');
        cell.style.removeProperty('border-top-color');
        cell.style.removeProperty('border-bottom-color');
        cell.style.removeProperty('border-left-color');
        cell.style.removeProperty('border-right-color');
        cell.style.removeProperty('border-top-width');
        cell.style.removeProperty('border-bottom-width');
        cell.style.removeProperty('border-left-width');
        cell.style.removeProperty('border-right-width');
        cell.style.removeProperty('border-top-style');
        cell.style.removeProperty('border-bottom-style');
        cell.style.removeProperty('border-left-style');
        cell.style.removeProperty('border-right-style');
      });
    } else {
      const activeWidth = borderWidth > 0 ? borderWidth : 1;
      const activeStyle = (borderStyle && borderStyle !== 'none') ? borderStyle : 'solid';
      if (borderWidth === 0) setBorderWidth(1);
      if (borderStyle === 'none') setBorderStyle('solid');
      const bCss = `${activeWidth}px ${activeStyle} ${bRgba}`;

      table.style.border = bCss;
      el.setAttribute('data-border-color', borderColor);
      el.setAttribute('data-border-width', String(activeWidth));
      el.setAttribute('data-border-style', activeStyle);

      // Logical grid positions (merged cells span several slots) so "Outer" frames the real edges
      const { trs: gridTrs, totalCols: gridCols } = buildTableGrid(table);
      const trs = gridTrs;
      const totalR = trs.length;
      const totalC = gridCols || 1;

      trs.forEach((tr) => {
        Array.from(tr.children).forEach((cell) => {
          const r = cell.__gr ?? 0;
          const c = cell.__gc ?? 0;
          const colSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
          const rowSpan = parseInt(cell.getAttribute('rowspan') || '1', 10);
          cell.removeAttribute('data-cell-border-color');
          cell.removeAttribute('data-cell-border-width');
          cell.removeAttribute('data-cell-border-style');
          cell.removeAttribute('data-cell-border-top');
          cell.removeAttribute('data-cell-border-bottom');
          cell.removeAttribute('data-cell-border-left');
          cell.removeAttribute('data-cell-border-right');
          cell.style.removeProperty('border-top-color');
          cell.style.removeProperty('border-bottom-color');
          cell.style.removeProperty('border-left-color');
          cell.style.removeProperty('border-right-color');
          cell.style.removeProperty('border-top-width');
          cell.style.removeProperty('border-bottom-width');
          cell.style.removeProperty('border-left-width');
          cell.style.removeProperty('border-right-width');
          cell.style.removeProperty('border-top-style');
          cell.style.removeProperty('border-bottom-style');
          cell.style.removeProperty('border-left-style');
          cell.style.removeProperty('border-right-style');

          if (preset === 'all') {
            cell.style.border = bCss;
          } else if (preset === 'outer') {
            cell.style.border = 'none';
            if (r === 0) cell.style.borderTop = bCss;
            if (r + rowSpan - 1 >= totalR - 1) cell.style.borderBottom = bCss;
            if (c === 0) cell.style.borderLeft = bCss;
            if (c + colSpan - 1 >= totalC - 1) cell.style.borderRight = bCss;
          }
        });
      });
    }

    el.setAttribute('data-border-preset', preset);
    applyTableDashPattern(el);
    if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0 && applyBorderHighlightRef.current) {
      applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
    }
    syncChanges(el);
  };

  // Text formatting
  const handleToggleBold = () => {
    const next = !isBold;
    setIsBold(next);
    setFontWeight(next ? 'bold' : 'normal');
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    getTargetCells(el).forEach(cell => {
      cell.style.fontWeight = next ? '700' : '400';
      cell.querySelectorAll('*').forEach(child => {
        child.style.fontWeight = next ? '700' : '400';
      });
    });
    if (table && selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0 && applyBorderHighlightRef.current) {
      applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
    }
    syncChanges(el);
  };

  const handleToggleItalic = () => {
    const next = !isItalic;
    setIsItalic(next);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    getTargetCells(el).forEach(cell => {
      cell.style.fontStyle = next ? 'italic' : 'normal';
      cell.querySelectorAll('*').forEach(child => {
        child.style.fontStyle = next ? 'italic' : 'normal';
      });
    });
    if (table && selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0 && applyBorderHighlightRef.current) {
      applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
    }
    syncChanges(el);
  };

  const handleToggleUnderline = () => {
    const next = !isUnderline;
    setIsUnderline(next);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    const deco = next ? (isStrikethrough ? 'underline line-through' : 'underline') : (isStrikethrough ? 'line-through' : 'none');
    getTargetCells(el).forEach(cell => {
      cell.style.textDecoration = deco;
      cell.querySelectorAll('*').forEach(child => {
        child.style.textDecoration = deco;
      });
    });
    if (table && selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0 && applyBorderHighlightRef.current) {
      applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
    }
    syncChanges(el);
  };

  const handleToggleStrikethrough = () => {
    const next = !isStrikethrough;
    setIsStrikethrough(next);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    const deco = next ? (isUnderline ? 'underline line-through' : 'line-through') : (isUnderline ? 'underline' : 'none');
    getTargetCells(el).forEach(cell => {
      cell.style.textDecoration = deco;
      cell.querySelectorAll('*').forEach(child => {
        child.style.textDecoration = deco;
      });
    });
    if (table && selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0 && applyBorderHighlightRef.current) {
      applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
    }
    syncChanges(el);
  };

  const handleTextAlign = (align) => {
    setTextAlign(align);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    getTargetCells(el).forEach(cell => {
      cell.style.textAlign = align;
      cell.querySelectorAll('*').forEach(child => {
        child.style.textAlign = align;
      });
    });
    if (table && selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0 && applyBorderHighlightRef.current) {
      applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
    }
    syncChanges(el);
  };

  const handleFontFamilyChange = (font) => {
    setFontFamily(font);
    loadGoogleFont(font);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
      getTargetCells(el).forEach(cell => {
        cell.style.fontFamily = `'${font}', sans-serif`;
        cell.querySelectorAll('*').forEach(child => {
          child.style.fontFamily = `'${font}', sans-serif`;
        });
      });
      if (table && applyBorderHighlightRef.current) {
        applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
      }
      syncChanges(el);
    } else {
      applyTableStyles({ fontFamily: font });
    }
  };

  const handleFontSizeChange = (size) => {
    const num = parseInt(size, 10);
    if (isNaN(num) || num <= 0) return;
    setFontSize(num);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
      getTargetCells(el).forEach(cell => {
        cell.style.fontSize = `${num}pt`;
        cell.querySelectorAll('*').forEach(child => {
          child.style.fontSize = `${num}pt`;
        });
      });
      if (table && applyBorderHighlightRef.current) {
        applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
      }
      syncChanges(el);
    } else {
      applyTableStyles({ fontSize: num });
    }
  };

  const handleFontWeightChange = (weightVal) => {
    setFontWeight(weightVal);
    const numeric = weightToNumeric(weightVal);
    setIsBold(['bold', 'extrabold', 'black', 'semibold'].includes(weightVal) || parseInt(numeric, 10) >= 600);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
      getTargetCells(el).forEach(cell => {
        cell.style.fontWeight = numeric;
        cell.querySelectorAll('*').forEach(child => {
          child.style.fontWeight = numeric;
        });
      });
      if (table && applyBorderHighlightRef.current) {
        applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
      }
      syncChanges(el);
    } else {
      el.querySelectorAll('td, th').forEach(cell => {
        cell.style.fontWeight = numeric;
        cell.querySelectorAll('*').forEach(child => {
          child.style.fontWeight = numeric;
        });
      });
      el.setAttribute('data-font-weight', weightVal);
      syncChanges(el);
    }
  };

  const handleVerticalAlign = (vAlign) => {
    setVerticalAlign(vAlign);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
      getTargetCells(el).forEach(cell => {
        cell.style.verticalAlign = vAlign;
        cell.querySelectorAll('*').forEach(child => {
          child.style.verticalAlign = vAlign;
        });
      });
      if (table && applyBorderHighlightRef.current) {
        applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
      }
      syncChanges(el);
    } else {
      el.querySelectorAll('td, th').forEach(cell => {
        cell.style.verticalAlign = vAlign;
        cell.querySelectorAll('*').forEach(child => {
          child.style.verticalAlign = vAlign;
        });
      });
      el.setAttribute('data-vertical-align', vAlign);
      syncChanges(el);
    }
  };

  const handlePaddingXChange = (val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setPaddingX(num);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
      getTargetCells(el).forEach(cell => {
        cell.style.paddingLeft = `${num}px`;
        cell.style.paddingRight = `${num}px`;
      });
      if (table && applyBorderHighlightRef.current) {
        applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
      }
      syncChanges(el);
    } else {
      applyTableStyles({ paddingX: num });
    }
  };

  const handlePaddingYChange = (val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setPaddingY(num);
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0) {
      getTargetCells(el).forEach(cell => {
        cell.style.paddingTop = `${num}px`;
        cell.style.paddingBottom = `${num}px`;
      });
      if (table && applyBorderHighlightRef.current) {
        applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
      }
      syncChanges(el);
    } else {
      applyTableStyles({ paddingY: num });
    }
  };

  // Figma-like mouse slider (scrubber) for padding adjustments
  const handleScrubPadding = useCallback((type, startVal) => (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const initialVal = parseInt(startVal, 10) || 0;
    let lastAppliedVal = initialVal;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Holding Shift multiplies scrub step (10x), just like Figma
      const step = moveEvent.shiftKey ? 10 : 1;
      const deltaValue = (deltaX / 8) * step;
      const newVal = Math.max(0, Math.min(80, Math.round(initialVal + deltaValue)));

      if (newVal !== lastAppliedVal) {
        lastAppliedVal = newVal;
        if (type === 'paddingX') {
          handlePaddingXChange(newVal);
        } else {
          handlePaddingYChange(newVal);
        }
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [handlePaddingXChange, handlePaddingYChange]);

  // Excel Import & Export
  const handleExcelImport = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      const sheet = wb.worksheets[0];
      if (!sheet) return;

      const el = getTargetElement();
      if (!el) return;
      const table = el.querySelector('table');
      const tbody = table?.querySelector('tbody') || table;
      if (!tbody) return;

      // Display text of a cell (dates / formulas / rich text / hyperlinks, not "[object Object]")
      const cellText = (cell) => {
        try {
          const t = cell.text;
          if (t !== undefined && t !== null && typeof t !== 'object') return String(t);
        } catch { /* fall through */ }
        const v = cell.value;
        if (v === null || v === undefined) return '';
        if (typeof v === 'object') {
          if (Array.isArray(v.richText)) return v.richText.map((r) => r.text || '').join('');
          if (v.text !== undefined) return String(v.text);
          if (v.result !== undefined) return String(v.result);
          if (v instanceof Date) return v.toLocaleDateString();
        }
        return String(v);
      };
      const escapeCell = (str) => String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

      // Place every value in its REAL column (leading empty cells used to shift the row left)
      const excelRows = [];
      sheet.eachRow({ includeEmpty: false }, (row) => {
        const vals = [];
        row.eachCell({ includeEmpty: true }, (cell) => { vals[cell.col - 1] = cellText(cell); });
        excelRows.push(vals);
      });
      if (excelRows.length === 0) return;

      const maxCols = Math.max(...excelRows.map((r) => r.length), 1);

      // Content-based column widths: never narrower than the longest word (no "E n g l i s h")
      const weights = Array.from({ length: maxCols }, (_, c) => {
        let longest = 1;
        let longestWord = 1;
        excelRows.forEach((r) => {
          const t = String(r[c] || '').trim();
          longest = Math.max(longest, Math.min(t.length, 40));
          t.split(/\s+/).forEach((w) => { longestWord = Math.max(longestWord, Math.min(w.length, 24)); });
        });
        return Math.max(longestWord, Math.min(longest, 28) * 0.6) + 2;
      });

      const cellStyle = `border:${borderWidth}px ${borderStyle} ${hexToRgba(borderColor, borderOpacity)};padding:${paddingY}px ${paddingX}px;color:${cellColor};background-color:${hexToRgba(themeColor, themeOpacity)};text-align:${textAlign};vertical-align:${verticalAlign};box-sizing:border-box;white-space:normal;word-break:normal;overflow-wrap:break-word;outline:none;user-select:none;cursor:default;`;
      let rowsHtml = '';
      excelRows.forEach((rVals) => {
        let tds = '';
        for (let c = 0; c < maxCols; c++) tds += `<td style="${cellStyle}">${escapeCell(rVals[c] || '')}</td>`;
        rowsHtml += `<tr style="box-sizing:border-box;">${tds}</tr>`;
      });

      tbody.innerHTML = rowsHtml;
      writeColWidths(table, weights);
      attachCellListeners(el); // data-row / data-col
      ensureColGroup(table);

      el.setAttribute('data-auto-height', 'true');
      el.setAttribute('data-col-weights', JSON.stringify(weights.map((w) => Math.round(w * 100) / 100)));
      fitTableToContent(el);

      setRowsCount(excelRows.length);
      setColsCount(maxCols);
      el.setAttribute('data-rows', String(excelRows.length));
      el.setAttribute('data-cols', String(maxCols));

      applyTableDashPattern(el);

      // Old cell selection no longer points at the same data
      selectedCellKeysRef.current = new Set();
      setSelectedCellKeys(new Set());
      applyBorderHighlight(table, new Set());

      initTableResizers(table);
      syncChanges(el);
      setStructureVersion((v) => v + 1);
      window.dispatchEvent(new CustomEvent('force-update-selection-box', { detail: { elementId: el.id } }));

      // Other table effects run after this (re-render from saved HTML, structure healing on select);
      // re-apply the content fit once things settle so widths / box height stay correct.
      const elId = el.id;
      const refit = () => {
        const live = (elId && document.getElementById(elId)) || el;
        if (!live?.isConnected) return;
        if (fitTableToContent(live)) {
          applyTableDashPattern(live);
          syncChanges(live);
        }
        window.dispatchEvent(new CustomEvent('force-update-selection-box', { detail: { elementId: elId } }));
      };
      requestAnimationFrame(() => requestAnimationFrame(refit));
      setTimeout(refit, 150);
      setTimeout(refit, 600);
    } catch (err) {
      console.error('Failed to parse Excel file:', err);
    } finally {
      // allow importing the same file again
      if (input) input.value = '';
    }
  };

  const handleExcelExport = async () => {
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    if (!table) return;

    const trs = Array.from(table.querySelectorAll('tr'));
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Sheet 1');

    trs.forEach((tr) => {
      const cells = Array.from(tr.querySelectorAll('td, th'));
      const rowValues = cells.map((cell) => cell.innerText?.trim() || '');
      ws.addRow(rowValues);
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-export-${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isGlobalMode = tableEditMode === 'global' && (!selectedCellKeys || selectedCellKeys.size === 0);
  const isStrokeDisabled = !isGlobalMode;

  // ── Floating cell toolbar (badge above the table while cells are selected) ──
  // Screen-space (fixed) so it keeps one size at any zoom; follows the table through pan / zoom / resize.
  const [cellToolbarPos, setCellToolbarPos] = useState(null);
  const hasCellSelection = selectedCellKeys && selectedCellKeys.size > 0;
  useEffect(() => {
    if (!hasCellSelection) { setCellToolbarPos(null); return undefined; }
    let raf = 0;
    let last = '';
    const tick = () => {
      const el = getTargetElement();
      const table = el?.querySelector('table');
      const dragging = document.body.classList.contains('dragging-active') || el?.getAttribute('data-dragging') === 'true';
      if (table && !dragging) {
        const r = table.getBoundingClientRect();
        const visible = r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
        const top = Math.max(8, r.top - 46);
        const left = r.left + r.width / 2;
        const key = visible ? `${Math.round(left)}|${Math.round(top)}` : 'hidden';
        if (key !== last) {
          last = key;
          setCellToolbarPos(visible ? { top, left } : null);
        }
      } else if (last !== 'hidden') {
        last = 'hidden';
        setCellToolbarPos(null);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasCellSelection, getTargetElement]);

  const cellToolbar = hasCellSelection && cellToolbarPos && typeof document !== 'undefined' ? createPortal(
    <div
      className="fixed z-[9999] -translate-x-1/2 flex items-center gap-[2px] px-[4px] py-[3px] rounded-[8px] bg-white border border-gray-200 shadow-[0_6px_20px_rgba(0,0,0,0.12)] select-none font-sans"
      style={{ top: cellToolbarPos.top, left: cellToolbarPos.left }}
      // keep the cell selection: never let these clicks reach canvas / click-outside handlers
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {[
        { key: 'ra', title: 'Insert row above', Icon: ArrowUp, label: 'Row', run: () => insertRow('above') },
        { key: 'rb', title: 'Insert row below', Icon: ArrowDown, label: 'Row', run: () => insertRow('below') },
        { key: 'cl', title: 'Insert column left', Icon: ArrowLeft, label: 'Col', run: () => insertColumn('left') },
        { key: 'cr', title: 'Insert column right', Icon: ArrowRight, label: 'Col', run: () => insertColumn('right') },
        { key: 'sep1' },
        { key: 'dr', title: rowsCount <= 1 ? 'A table needs at least one row' : 'Delete selected row(s)', Icon: Trash2, label: 'Row', run: deleteRows, danger: true, disabled: rowsCount <= 1 },
        { key: 'dc', title: colsCount <= 1 ? 'A table needs at least one column' : 'Delete selected column(s)', Icon: Trash2, label: 'Col', run: deleteColumns, danger: true, disabled: colsCount <= 1 },
        { key: 'sep2' },
        { key: 'mg', title: selectedCellKeys.size >= 2 ? 'Merge selected cells' : 'Select 2+ cells to merge', Icon: Combine, label: 'Merge', run: handleMergeCells, disabled: selectedCellKeys.size < 2 },
        { key: 'um', title: canUnmerge ? 'Unmerge cells' : 'No merged cell selected', Icon: Split, label: 'Unmerge', run: handleUnmergeCells, disabled: !canUnmerge },
      ].map((b) => b.Icon ? (
        <button
          key={b.key}
          type="button"
          title={b.title}
          disabled={b.disabled}
          onClick={(e) => { e.stopPropagation(); if (!b.disabled) b.run(); }}
          className={`flex items-center gap-[3px] h-[26px] px-[7px] rounded-[6px] text-[11px] font-medium whitespace-nowrap transition-colors ${
            b.disabled
              ? 'text-gray-300 cursor-not-allowed'
              : b.danger
                ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
          }`}
        >
          <b.Icon size={13} />
          <span>{b.label}</span>
        </button>
      ) : (
        <div key={b.key} className="w-px h-[18px] bg-gray-200 mx-[2px]" />
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative flex flex-col gap-[1.5vw] w-full max-w-[25vw] pb-[2vw] font-sans select-none">
      {cellToolbar}

      {/* ===================== HEADER ===================== */}
      <div className="flex items-center gap-[0.8vw]">
        <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap tracking-wider">Table Properties</span>
        <div className="flex-1 h-[1px] bg-gray-200" />
      </div>

      {/* ===================== CELL SELECTION STATUS ===================== */}
      {selectedCellKeys.size > 0 && (
        <div className="flex items-center justify-between px-[0.7vw] py-[0.45vw] bg-orange-50 border border-orange-200 rounded-[0.45vw] shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-[0.4vw]">
            <div className="w-[0.55vw] h-[0.55vw] rounded-full bg-[#EA543A]" />
            <span className="text-[0.75vw] font-semibold text-gray-800">
              {(() => {
                const entries = Array.from(selectedCellKeys).map(k => {
                  const [r, c] = k.split('_').map(Number);
                  return { r, c };
                });
                if (entries.length === 1) {
                  const { r, c } = entries[0];
                  return `Cell ${getColLetter(c)}${r + 1} Selected`;
                }
                const minR = Math.min(...entries.map(e => e.r));
                const maxR = Math.max(...entries.map(e => e.r));
                const minC = Math.min(...entries.map(e => e.c));
                const maxC = Math.max(...entries.map(e => e.c));
                return `Range ${getColLetter(minC)}${minR + 1}:${getColLetter(maxC)}${maxR + 1} (${entries.length} Cells)`;
              })()}
            </span>
          </div>
          <div className="flex items-center gap-[0.4vw]">
            {/* Quick Text Color Swatch in Cell Bar */}
            <div
              onClick={() => {
                setActiveColorPicker(null);
                setIsTextColorPickerOpen(prev => !prev);
              }}
              className="flex items-center gap-[0.25vw] px-[0.35vw] py-[0.15vw] bg-white border border-gray-200 rounded-[0.3vw] shadow-2xs hover:border-gray-300 cursor-pointer color-picker-trigger"
              data-color-picker-trigger="true"
              title="Change Text Color of selected cell(s)"
            >
              <span className="text-[0.65vw] font-bold text-gray-700">Text:</span>
              <div
                className="w-[1vw] h-[1vw] rounded-[0.2vw] border border-gray-300 shadow-2xs"
                style={{ backgroundColor: cellColor }}
              />
            </div>
            {selectedCellKeys.size > 1 && (
              <button
                type="button"
                onClick={handleMergeCells}
                className="px-[0.45vw] py-[0.2vw] text-[0.68vw] font-bold bg-[#EA543A] hover:bg-[#d8482f] text-white rounded-[0.3vw] shadow-2xs transition-all cursor-pointer flex items-center gap-[0.2vw]"
                title="Merge selected cells"
              >
                <Combine size="0.65vw" />
                <span>Merge</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => clearCellSelection()}
              className="text-[0.7vw] font-semibold text-[#EA543A] hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ===================== STRUCTURE (ROWS & COLS & MERGE) ===================== */}
      <div className="flex flex-col gap-[0.6vw]">
        <SectionHeader title="Grid Structure" />

        <div className="grid grid-cols-2 gap-[0.6vw]">
          {/* Rows control */}
          <div className="flex items-center justify-between h-[2.1vw] px-[0.6vw] border border-gray-300 rounded-[0.45vw] bg-white shadow-2xs hover:border-gray-400 transition-colors">
            <span className="text-[0.8vw] font-medium text-gray-800">Rows: {rowsCount}</span>
            <div className="flex items-center gap-[0.2vw]">
              <button
                type="button"
                onClick={handleDeleteRow}
                className="w-[1.4vw] h-[1.4vw] flex items-center justify-center bg-gray-100 rounded-[0.35vw] hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                title={selectedCellKeys.size > 0 ? "Delete selected row(s)" : "Remove last row"}
              >
                <Minus size="0.7vw" />
              </button>
              <button
                type="button"
                onClick={handleAddRow}
                className="w-[1.4vw] h-[1.4vw] flex items-center justify-center bg-gray-100 rounded-[0.35vw] hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                title={selectedCellKeys.size > 0 ? "Add row below selected cell" : "Add row at the end"}
              >
                <Plus size="0.7vw" />
              </button>
            </div>
          </div>

          {/* Columns control */}
          <div className="flex items-center justify-between h-[2.1vw] px-[0.6vw] border border-gray-300 rounded-[0.45vw] bg-white shadow-2xs hover:border-gray-400 transition-colors">
            <span className="text-[0.8vw] font-medium text-gray-800">Cols: {colsCount}</span>
            <div className="flex items-center gap-[0.2vw]">
              <button
                type="button"
                onClick={handleDeleteColumn}
                className="w-[1.4vw] h-[1.4vw] flex items-center justify-center bg-gray-100 rounded-[0.35vw] hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                title={selectedCellKeys.size > 0 ? "Delete selected column(s)" : "Remove last column"}
              >
                <Minus size="0.7vw" />
              </button>
              <button
                type="button"
                onClick={handleAddColumn}
                className="w-[1.4vw] h-[1.4vw] flex items-center justify-center bg-gray-100 rounded-[0.35vw] hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                title={selectedCellKeys.size > 0 ? "Add column right of selected cell" : "Add column at the end"}
              >
                <Plus size="0.7vw" />
              </button>
            </div>
          </div>
        </div>

        {/* Insert next to the selected cell */}
        {selectedCellKeys.size > 0 && (
          <div className="flex items-center gap-[0.4vw]">
            <span className="text-[0.72vw] font-medium text-gray-500 whitespace-nowrap mr-[0.1vw]">Insert</span>
            {[
              { key: 'above', label: 'Above', Icon: ArrowUp, run: () => insertRow('above'), title: 'Insert row above' },
              { key: 'below', label: 'Below', Icon: ArrowDown, run: () => insertRow('below'), title: 'Insert row below' },
              { key: 'left', label: 'Left', Icon: ArrowLeft, run: () => insertColumn('left'), title: 'Insert column left' },
              { key: 'right', label: 'Right', Icon: ArrowRight, run: () => insertColumn('right'), title: 'Insert column right' },
            ].map(({ key, label, Icon, run, title }) => (
              <button
                key={key}
                type="button"
                onClick={run}
                title={title}
                className="flex-1 flex items-center justify-center gap-[0.25vw] h-[1.9vw] rounded-[0.4vw] border border-gray-300 bg-white text-[0.7vw] font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
              >
                <Icon size="0.75vw" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Delete the selected row(s) / column(s) — any position, not just the last one */}
        {selectedCellKeys.size > 0 && (
          <div className="flex items-center gap-[0.4vw]">
            <span className="text-[0.72vw] font-medium text-gray-500 whitespace-nowrap mr-[0.1vw]">Delete</span>
            <button
              type="button"
              onClick={deleteRows}
              disabled={rowsCount <= 1}
              title={rowsCount <= 1 ? 'A table needs at least one row' : 'Delete the selected row(s)'}
              className={`flex-1 flex items-center justify-center gap-[0.3vw] h-[1.9vw] rounded-[0.4vw] border text-[0.7vw] font-medium transition-colors shadow-2xs ${
                rowsCount <= 1
                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 cursor-pointer'
              }`}
            >
              <Trash2 size="0.75vw" />
              <span>Row</span>
            </button>
            <button
              type="button"
              onClick={deleteColumns}
              disabled={colsCount <= 1}
              title={colsCount <= 1 ? 'A table needs at least one column' : 'Delete the selected column(s)'}
              className={`flex-1 flex items-center justify-center gap-[0.3vw] h-[1.9vw] rounded-[0.4vw] border text-[0.7vw] font-medium transition-colors shadow-2xs ${
                colsCount <= 1
                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 cursor-pointer'
              }`}
            >
              <Trash2 size="0.75vw" />
              <span>Column</span>
            </button>
          </div>
        )}

        {/* Merge & Unmerge Options */}
        <div className="grid grid-cols-2 gap-[0.6vw] pt-[0.2vw]">
          <button
            type="button"
            onClick={handleMergeCells}
            disabled={selectedCellKeys.size < 2}
            className={`flex items-center justify-center gap-[0.4vw] h-[2.1vw] rounded-[0.45vw] border text-[0.75vw] font-semibold transition-all shadow-2xs ${
              selectedCellKeys.size >= 2
                ? 'bg-white border-orange-300 text-[#EA543A] hover:bg-orange-50 cursor-pointer'
                : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={selectedCellKeys.size >= 2 ? "Merge selected cells" : "Select 2 or more cells to merge"}
          >
            <Combine size="0.8vw" />
            <span>Merge Cells</span>
          </button>

          <button
            type="button"
            onClick={handleUnmergeCells}
            disabled={!canUnmerge}
            className={`flex items-center justify-center gap-[0.4vw] h-[2.1vw] rounded-[0.45vw] border text-[0.75vw] font-semibold transition-all shadow-2xs ${
              canUnmerge
                ? 'bg-white border-orange-300 text-[#EA543A] hover:bg-orange-50 cursor-pointer'
                : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={canUnmerge ? "Unmerge selected merged cell" : "No merged cells to unmerge"}
          >
            <Split size="0.8vw" />
            <span>Unmerge Cells</span>
          </button>
        </div>
      </div>

      {/* ===================== APPEARANCE: COLOR & STROKE (Color.jsx) ===================== */}
      <Color
        openSubSection={openSubSection}
        setOpenSubSection={setOpenSubSection}
        backgroundColor={backgroundColor}
        setBackgroundColor={handleSetBackgroundColor}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={(val) => {
          if (val) setIsTextColorPickerOpen(false);
          setActiveColorPicker(val);
        }}
        showStrokeSettings={showStrokeSettings}
        setShowStrokeSettings={setShowStrokeSettings}
        isStrokeStyleOpen={isStrokeStyleOpen}
        setIsStrokeStyleOpen={setIsStrokeStyleOpen}
        dropdownPos={dropdownPos}
        setDropdownPos={setDropdownPos}
        strokeSettingsPos={strokeSettingsPos}
        setStrokeSettingsPos={setStrokeSettingsPos}
        isDashPosOpen={isDashPosOpen}
        setIsDashPosOpen={setIsDashPosOpen}
        activePopup={activePopup}
        setActivePopup={setActivePopup}
        colorsOnPage={colorsOnPage}
        showDetailedPicker={showDetailedPicker}
        setShowDetailedPicker={setShowDetailedPicker}
        noAccordion={true}
        isTable={true}
        disableStroke={isStrokeDisabled}
      />

      {/* Border Presets (Clean Toolbar directly under stroke controls - Global mode only) */}
      <div className={`flex flex-col gap-[0.35vw] -mt-[0.6vw] ${isStrokeDisabled ? 'opacity-40 pointer-events-none select-none cursor-not-allowed' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="text-[0.76vw] font-semibold text-gray-700">Border Presets</span>
          {isStrokeDisabled && (
            <span className="text-[0.62vw] text-gray-400 font-normal">(Global mode only)</span>
          )}
        </div>
        <div className="flex items-center gap-[0.35vw]">
          {[
            { id: 'all', label: 'All Borders' },
            { id: 'outer', label: 'Outer' },
            { id: 'none', label: 'Clear' }
          ].map(preset => (
            <button
              key={preset.id}
              disabled={isStrokeDisabled}
              onClick={() => handleBorderPreset(preset.id)}
              className={`flex-1 py-[0.35vw] bg-white border border-gray-200 rounded-[0.4vw] text-[0.72vw] font-semibold text-gray-700 shadow-2xs transition-all ${
                isStrokeDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 cursor-pointer'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===================== TYPOGRAPHY & TEXT ===================== */}
      <div className="flex flex-col gap-[0.6vw]">
        <SectionHeader title="Typography" />

        {/* Row 1: Font Family & Font Size */}
        <div className="flex items-center gap-[0.6vw]">
          {/* Font Family */}
          <div className="relative flex-[1.6]">
            <button
              type="button"
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className="w-full h-[2.1vw] px-[0.7vw] flex items-center justify-between border border-gray-300 rounded-[0.45vw] bg-white hover:border-gray-400 shadow-2xs transition-colors cursor-pointer"
            >
              <span className="text-[0.8vw] font-medium text-gray-800 truncate" style={{ fontFamily: `'${fontFamily}', sans-serif` }}>
                {fontFamily === 'Designer_Signature' ? 'Designer Signature' : (fontFamily || 'Poppins')}
              </span>
              <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform ${showFontDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showFontDropdown && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setShowFontDropdown(false)} />
                <div className="absolute left-0 top-full mt-[0.35vw] w-full bg-white border border-gray-200 rounded-[0.5vw] shadow-xl max-h-[14vw] overflow-y-auto py-[0.25vw] z-[100] [&::-webkit-scrollbar]:w-[0.25vw] [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full animate-in fade-in zoom-in-95 duration-150">
                  {fontFamilies.map(font => {
                    const isSelected = font.toLowerCase() === (fontFamily || '').toLowerCase();
                    return (
                      <div
                        key={font}
                        onClick={() => {
                          handleFontFamilyChange(font);
                          setShowFontDropdown(false);
                        }}
                        className={`px-[0.75vw] py-[0.38vw] cursor-pointer text-[0.8vw] flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-gray-50 font-semibold text-[#4D47FF]' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        style={{ fontFamily: `'${font}', sans-serif` }}
                      >
                        <span className="truncate">{font === 'Designer_Signature' ? 'Designer Signature' : font}</span>
                        {isSelected && (
                          <span className="text-[#4D47FF] font-bold ml-1 text-[0.8vw]">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Font Size */}
          <div className="relative flex-1">
            <div className="w-full h-[2.1vw] px-[0.6vw] flex items-center justify-between border border-gray-300 rounded-[0.45vw] bg-white hover:border-gray-400 focus-within:border-gray-400 shadow-2xs transition-colors">
              <div className="flex items-center flex-1 min-w-0 mr-[0.2vw]">
                <input
                  type="text"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        handleFontSizeChange(val);
                        setShowFontSizeDropdown(false);
                      }
                      e.target.blur();
                    }
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      handleFontSizeChange(val);
                    }
                  }}
                  onFocus={() => setShowFontSizeDropdown(true)}
                  className="w-full bg-transparent outline-none text-[0.8vw] text-gray-800 font-medium"
                  placeholder="13"
                />
                <span className="text-[0.7vw] font-medium text-gray-400 select-none uppercase tracking-wider mr-[0.1vw]">pt</span>
              </div>
              <ChevronDown
                size="0.8vw"
                className={`text-gray-400 cursor-pointer flex-shrink-0 transition-transform ${showFontSizeDropdown ? 'rotate-180' : ''}`}
                onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
              />
            </div>
            {showFontSizeDropdown && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setShowFontSizeDropdown(false)} />
                <div className="absolute right-0 top-full mt-[0.35vw] w-full bg-white border border-gray-200 rounded-[0.5vw] shadow-xl max-h-[14vw] overflow-y-auto py-[0.25vw] z-[100] [&::-webkit-scrollbar]:w-[0.25vw] [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full animate-in fade-in zoom-in-95 duration-150">
                  {[6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48].map(size => (
                    <div
                      key={size}
                      onClick={() => {
                        handleFontSizeChange(size);
                        setShowFontSizeDropdown(false);
                      }}
                      className={`px-[0.75vw] py-[0.35vw] cursor-pointer text-[0.8vw] flex items-center justify-between transition-colors ${Number(fontSize) === size ? 'bg-gray-50 font-semibold text-[#4D47FF]' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <span>{size}</span>
                      <span className="text-[0.68vw] text-gray-400 font-normal">pt</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Font Weight (Full Width) */}
        <div className="relative w-full">
          <button
            type="button"
            onClick={() => setShowWeightDropdown(!showWeightDropdown)}
            className="w-full h-[2.1vw] px-[0.7vw] flex items-center justify-between border border-gray-300 rounded-[0.45vw] bg-white hover:border-gray-400 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="text-[0.8vw] truncate text-gray-800 font-medium">
              {fontWeights.find(w => w.value === fontWeight)?.name || (isBold ? 'Bold' : 'Regular')}
            </span>
            <ChevronDown size="0.75vw" className={`text-gray-400 transition-transform ${showWeightDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showWeightDropdown && (
            <>
              <div className="fixed inset-0 z-[90]" onClick={() => setShowWeightDropdown(false)} />
              <div className="absolute left-0 top-full mt-[0.35vw] w-full bg-white border border-gray-200 rounded-[0.5vw] shadow-xl max-h-[14vw] overflow-y-auto py-[0.25vw] z-[100] [&::-webkit-scrollbar]:w-[0.25vw] [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full animate-in fade-in zoom-in-95 duration-150">
                {fontWeights.map(w => (
                  <div
                    key={w.value}
                    onClick={() => {
                      handleFontWeightChange(w.value);
                      setShowWeightDropdown(false);
                    }}
                    className={`px-[0.75vw] py-[0.35vw] cursor-pointer text-[0.8vw] transition-colors ${fontWeight === w.value ? 'bg-gray-50 font-semibold text-[#4D47FF]' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    {w.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Row 3: Text Color (Inside Typography, full width, without separate heading) */}
        <ColorBoxRow
          color={cellColor}
          opacity={cellOpacity}
          onOpenPicker={() => {
            setActiveColorPicker(null);
            setIsTextColorPickerOpen(prev => !prev);
          }}
          onChange={handleSetCellTextColor}
          onOpacityChange={handleSetCellTextOpacity}
          isActive={isTextColorPickerOpen}
        />

        {/* Row 4: Toolbar Buttons: Alignment, Style, Vertical Alignment */}
        <div className="flex items-center gap-[0.6vw] relative">
          {/* Alignment */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => toggleTypographyPanel('alignment')}
              className={`w-full h-[2.1vw] rounded-[0.45vw] border border-gray-300 flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
                activeTypographyPanel === 'alignment'
                  ? 'bg-gray-100 text-[#4D47FF] border-[#4D47FF]/50'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
              title="Text Alignment"
            >
              {textAlign === 'center' ? <AlignCenter size="0.95vw" strokeWidth={2.2} /> :
                textAlign === 'right' ? <AlignRight size="0.95vw" strokeWidth={2.2} /> :
                  textAlign === 'justify' ? <AlignJustify size="0.95vw" strokeWidth={2.2} /> :
                    <AlignLeft size="0.95vw" strokeWidth={2.2} />}
            </button>
            {activeTypographyPanel === 'alignment' && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => toggleTypographyPanel(null)} />
                <div className="absolute top-full left-0 mt-[0.35vw] z-[100] p-[0.35vw] bg-white border border-gray-200 rounded-[0.5vw] flex gap-[0.3vw] shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <button type="button" onClick={() => { handleTextAlign('left'); toggleTypographyPanel(null); }} className={`w-[2.1vw] h-[2.1vw] rounded-[0.38vw] flex items-center justify-center transition-colors ${textAlign === 'left' ? 'bg-indigo-50 text-[#4D47FF] font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} title="Align Left"><AlignLeft size="0.9vw" /></button>
                  <button type="button" onClick={() => { handleTextAlign('center'); toggleTypographyPanel(null); }} className={`w-[2.1vw] h-[2.1vw] rounded-[0.38vw] flex items-center justify-center transition-colors ${textAlign === 'center' ? 'bg-indigo-50 text-[#4D47FF] font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} title="Align Center"><AlignCenter size="0.9vw" /></button>
                  <button type="button" onClick={() => { handleTextAlign('right'); toggleTypographyPanel(null); }} className={`w-[2.1vw] h-[2.1vw] rounded-[0.38vw] flex items-center justify-center transition-colors ${textAlign === 'right' ? 'bg-indigo-50 text-[#4D47FF] font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} title="Align Right"><AlignRight size="0.9vw" /></button>
                  <button type="button" onClick={() => { handleTextAlign('justify'); toggleTypographyPanel(null); }} className={`w-[2.1vw] h-[2.1vw] rounded-[0.38vw] flex items-center justify-center transition-colors ${textAlign === 'justify' ? 'bg-indigo-50 text-[#4D47FF] font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} title="Justify"><AlignJustify size="0.9vw" /></button>
                </div>
              </>
            )}
          </div>

          {/* Style (Bold/Italic/Underline/Strike) */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => toggleTypographyPanel('style')}
              className={`w-full h-[2.1vw] rounded-[0.45vw] border border-gray-300 flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
                activeTypographyPanel === 'style' || isBold || isItalic || isUnderline || isStrikethrough
                  ? 'bg-gray-100 text-[#4D47FF] border-[#4D47FF]/50'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
              title="Text Styling"
            >
              <Bold size="0.95vw" strokeWidth={2.2} />
            </button>
            {activeTypographyPanel === 'style' && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => toggleTypographyPanel(null)} />
                <div className="absolute top-full left-0 mt-[0.35vw] z-[100] p-[0.35vw] bg-white border border-gray-200 rounded-[0.5vw] flex gap-[0.3vw] shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <button type="button" onClick={() => handleToggleBold()} className={`w-[2.1vw] h-[2.1vw] rounded-[0.38vw] flex items-center justify-center font-bold text-[0.85vw] transition-colors ${isBold ? 'bg-indigo-50 text-[#4D47FF]' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} title="Bold">B</button>
                  <button type="button" onClick={() => handleToggleItalic()} className={`w-[2.1vw] h-[2.1vw] rounded-[0.38vw] flex items-center justify-center italic font-semibold text-[0.85vw] transition-colors ${isItalic ? 'bg-indigo-50 text-[#4D47FF]' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} title="Italic">I</button>
                  <button type="button" onClick={() => handleToggleUnderline()} className={`w-[2.1vw] h-[2.1vw] rounded-[0.38vw] flex items-center justify-center underline font-semibold text-[0.85vw] transition-colors ${isUnderline ? 'bg-indigo-50 text-[#4D47FF]' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} title="Underline">U</button>
                  <button type="button" onClick={() => handleToggleStrikethrough()} className={`w-[2.1vw] h-[2.1vw] rounded-[0.38vw] flex items-center justify-center transition-colors font-semibold text-[0.85vw] ${isStrikethrough ? 'bg-indigo-50 text-[#4D47FF]' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} title="Strikethrough"><span className="line-through">S</span></button>
                </div>
              </>
            )}
          </div>

          {/* Vertical Alignment */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => toggleTypographyPanel('valign')}
              className={`w-full h-[2.1vw] rounded-[0.45vw] border border-gray-300 flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
                activeTypographyPanel === 'valign'
                  ? 'bg-gray-100 text-[#4D47FF] border-[#4D47FF]/50'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
              title="Vertical Alignment"
            >
              {verticalAlign === 'top' ? <AlignVerticalJustifyStart size="0.95vw" strokeWidth={2.2} /> :
                verticalAlign === 'bottom' ? <AlignVerticalJustifyEnd size="0.95vw" strokeWidth={2.2} /> :
                  <AlignVerticalJustifyCenter size="0.95vw" strokeWidth={2.2} />}
            </button>
            {activeTypographyPanel === 'valign' && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => toggleTypographyPanel(null)} />
                <div className="absolute top-full right-0 mt-[0.35vw] z-[100] p-[0.35vw] bg-white border border-gray-200 rounded-[0.5vw] flex gap-[0.3vw] shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <button type="button" onClick={() => { handleVerticalAlign('top'); toggleTypographyPanel(null); }} className={`w-[2.1vw] h-[2.1vw] rounded-[0.38vw] flex items-center justify-center transition-colors ${verticalAlign === 'top' ? 'bg-indigo-50 text-[#4D47FF] font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} title="Align Top"><AlignVerticalJustifyStart size="0.9vw" /></button>
                  <button type="button" onClick={() => { handleVerticalAlign('middle'); toggleTypographyPanel(null); }} className={`w-[2.1vw] h-[2.1vw] rounded-[0.38vw] flex items-center justify-center transition-colors ${verticalAlign === 'middle' ? 'bg-indigo-50 text-[#4D47FF] font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} title="Align Middle"><AlignVerticalJustifyCenter size="0.9vw" /></button>
                  <button type="button" onClick={() => { handleVerticalAlign('bottom'); toggleTypographyPanel(null); }} className={`w-[2.1vw] h-[2.1vw] rounded-[0.38vw] flex items-center justify-center transition-colors ${verticalAlign === 'bottom' ? 'bg-indigo-50 text-[#4D47FF] font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} title="Align Bottom"><AlignVerticalJustifyEnd size="0.9vw" /></button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 4: Cell Padding Controls with Figma-like mouse slider */}
        <div className="flex items-center gap-[0.6vw]">
          {/* Padding X */}
          <div className="flex-1 flex items-center justify-between border border-gray-300 rounded-[0.45vw] px-[0.6vw] h-[2.1vw] bg-white hover:border-gray-400 focus-within:border-gray-400 shadow-2xs transition-colors">
            <div className="flex items-center flex-1 min-w-0 mr-[0.2vw]">
              <input
                type="text"
                value={paddingX}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    handlePaddingXChange(val);
                  } else if (e.target.value === '') {
                    setPaddingX('');
                  }
                }}
                onBlur={() => {
                  if (paddingX === '' || isNaN(paddingX)) {
                    handlePaddingXChange(8);
                  }
                }}
                className="w-full bg-transparent outline-none text-[0.8vw] text-gray-800 font-medium"
                placeholder="8"
              />
              <span className="text-[0.7vw] font-medium text-gray-400 select-none uppercase tracking-wider mr-[0.1vw]">px</span>
            </div>
            <div
              onMouseDown={handleScrubPadding('paddingX', paddingX)}
              className="group flex items-center gap-[0.25vw] border-l border-gray-200 pl-[0.35vw] ml-[0.1vw] cursor-ew-resize select-none text-gray-400 hover:text-gray-700 active:text-[#4D47FF] transition-colors py-[0.15vw]"
              title="Drag horizontally to adjust Pad X (Hold Shift for 10x)"
            >
              <ArrowLeftRight size="0.75vw" className="transition-transform group-hover:scale-110 pointer-events-none" />
              <span className="text-[0.68vw] font-semibold tracking-tight whitespace-nowrap pointer-events-none">X</span>
            </div>
          </div>

          {/* Padding Y */}
          <div className="flex-1 flex items-center justify-between border border-gray-300 rounded-[0.45vw] px-[0.6vw] h-[2.1vw] bg-white hover:border-gray-400 focus-within:border-gray-400 shadow-2xs transition-colors">
            <div className="flex items-center flex-1 min-w-0 mr-[0.2vw]">
              <input
                type="text"
                value={paddingY}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    handlePaddingYChange(val);
                  } else if (e.target.value === '') {
                    setPaddingY('');
                  }
                }}
                onBlur={() => {
                  if (paddingY === '' || isNaN(paddingY)) {
                    handlePaddingYChange(6);
                  }
                }}
                className="w-full bg-transparent outline-none text-[0.8vw] text-gray-800 font-medium"
                placeholder="6"
              />
              <span className="text-[0.7vw] font-medium text-gray-400 select-none uppercase tracking-wider mr-[0.1vw]">px</span>
            </div>
            <div
              onMouseDown={handleScrubPadding('paddingY', paddingY)}
              className="group flex items-center gap-[0.25vw] border-l border-gray-200 pl-[0.35vw] ml-[0.1vw] cursor-ew-resize select-none text-gray-400 hover:text-gray-700 active:text-[#4D47FF] transition-colors py-[0.15vw]"
              title="Drag horizontally to adjust Pad Y (Hold Shift for 10x)"
            >
              <ArrowUpDown size="0.75vw" className="transition-transform group-hover:scale-110 pointer-events-none" />
              <span className="text-[0.68vw] font-semibold tracking-tight whitespace-nowrap pointer-events-none">Y</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== EXCEL DATA & ACTIONS ===================== */}
      <div className="flex flex-col gap-[0.6vw]">
        <SectionHeader title="Excel Data & Actions" />

        <div className="grid grid-cols-2 gap-[0.6vw]">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-[0.4vw] py-[0.4vw] bg-white hover:bg-gray-50 border border-gray-200 rounded-[0.4vw] text-[0.74vw] font-semibold text-gray-700 shadow-2xs transition-all cursor-pointer"
          >
            <Upload size="0.78vw" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={handleExcelExport}
            className="flex items-center justify-center gap-[0.4vw] py-[0.4vw] bg-white hover:bg-gray-50 border border-gray-200 rounded-[0.4vw] text-[0.74vw] font-semibold text-gray-700 shadow-2xs transition-all cursor-pointer"
          >
            <Download size="0.78vw" />
            <span>Export Excel</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx, .xls, .csv"
          onChange={handleExcelImport}
        />
      </div>

      {/* Cell Text Color Picker Popup */}
      {isTextColorPickerOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999]"
          style={{
            top: '50%',
            right: '19.5vw',
            transform: 'translateY(-50%)'
          }}
        >
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <ColorPicker
              color={cellColor}
              opacity={cellOpacity}
              onOpacityChange={handleSetCellTextOpacity}
              onChange={(newColor) => {
                handleSetCellTextColor(newColor);
              }}
              onClose={() => setIsTextColorPickerOpen(false)}
              disableGradient={true}
            />
          </div>
        </div>,
        document.body
      )}

      {/* CUSTOM CSS matching ShapeProperties */}
      <style>{`
        .no-spin::-webkit-inner-spin-button, .no-spin::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        body.is-scrubbing, body.is-scrubbing * {
          cursor: none !important;
          user-select: none !important;
        }
        .hide-cursor, .hide-cursor * {
          cursor: none !important;
        }
        .virtual-scrub-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 100000;
          width: 2vw;
          height: 2vw;
          margin-left: -1vw;
          margin-top: -1vw;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0.1vw 0.2vw rgba(0,0,0,0.3));
        }
      `}</style>
    </div>
  );
};

export default React.memo(ElementTableProperties);
