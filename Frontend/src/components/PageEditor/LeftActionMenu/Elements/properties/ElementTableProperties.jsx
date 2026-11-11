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
  Split
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { TableMatrix } from '../helpers/TableMatrix';
import { normalizeForeignObjectNamespaces } from '../utils/tableElementUtils';
import Color from '../../../properties/Color';
import ColorPicker from '../../../properties/ColorPicker';
import { PropertySlider } from '../../../properties/propertiesShared';
import {
  fontFamilies,
  fontWeights,
  loadGoogleFont,
  weightToNumeric,
  normalizeToTailwindWeight
} from '../../../properties/TextProperties';

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
          if (td.getAttribute('data-cell-border-color')) {
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

        const minColWidthsPx = [];
        for (let idx = 0; idx < totalCols; idx++) {
          minColWidthsPx[idx] = 28;
        }

        const initialColPcts = startColWidthsPx.map(w => (w / tableRect.width) * 100);

        const onColMouseMove = (moveEvt) => {
          const deltaX = moveEvt.clientX - e.clientX;
          const minLeftPx = minColWidthsPx?.[dividerCol] || 28;
          const minRightPx = minColWidthsPx?.[dividerCol + 1] || 28;
          const leftStart = startColWidthsPx[dividerCol];
          const rightStart = startColWidthsPx[dividerCol + 1];

          let appliedDelta = deltaX;
          if (leftStart + appliedDelta < minLeftPx) appliedDelta = minLeftPx - leftStart;
          if (rightStart - appliedDelta < minRightPx) appliedDelta = rightStart - minRightPx;

          const newLeftPx = leftStart + appliedDelta;
          const pairPctSum = (initialColPcts?.[dividerCol] || ((leftStart / tableRect.width) * 100)) + (initialColPcts?.[dividerCol + 1] || ((rightStart / tableRect.width) * 100));
          const rawLeftPct = (newLeftPx / tableRect.width) * 100;
          const minLeftPct = (minLeftPx / tableRect.width) * 100;
          const minRightPct = (minRightPx / tableRect.width) * 100;
          const maxLeftPct = Math.max(minLeftPct, pairPctSum - minRightPct);
          const leftPct = Math.max(minLeftPct, Math.min(rawLeftPct, maxLeftPct));
          const rightPct = pairPctSum - leftPct;

          const { cols: curCols } = ensureColGroup(tableEl, totalCols);
          if (curCols[dividerCol]) curCols[dividerCol].style.width = `${leftPct.toFixed(3)}%`;
          if (curCols[dividerCol + 1]) curCols[dividerCol + 1].style.width = `${rightPct.toFixed(3)}%`;

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
          tr.style.height = `${initialPcts[i].toFixed(3)}%`;
        });

        const minRowHeightsPx = Array.from(trs).map(() => 24);

        const onRowMouseMove = (moveEvt) => {
          const deltaY = moveEvt.clientY - e.clientY;
          const topTr = trs[dividerRow];
          const bottomTr = trs[dividerRow + 1];
          if (!topTr || !bottomTr) return;

          const minTopPx = minRowHeightsPx?.[dividerRow] || 26;
          const minBottomPx = minRowHeightsPx?.[dividerRow + 1] || 26;
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

          topTr.style.height = `${topPct.toFixed(3)}%`;
          bottomTr.style.height = `${bottomPct.toFixed(3)}%`;

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

    const restoreCellBorders = (cell) => {
      const baseBorder = getCellBorderColor(cell);
      const baseWidth = cell.getAttribute('data-cell-border-width') || borderWidth || '1';
      const baseStyle = cell.getAttribute('data-cell-border-style') || borderStyle || 'solid';
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

    if (!selectedKeys || selectedKeys.size === 0 || !wrapper) return;

    const highlightColor = '#EA543A';
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

    // Measure exact sub-pixel boundaries relative to wrapper using getBoundingClientRect
    const wrapperRect = wrapper.getBoundingClientRect();
    const zoomScale = (wrapperRect.width > 0 && wrapper.offsetWidth > 0) ? (wrapperRect.width / wrapper.offsetWidth) : 1;

    if (isSingleRect || entries.length === 1) {
      let minLeft = Infinity;
      let minTop = Infinity;
      let maxRight = -Infinity;
      let maxBottom = -Infinity;

      selectedCells.forEach(cell => {
        const cRect = cell.getBoundingClientRect();
        let l, t, r, b;
        if (wrapperRect.width > 0 && zoomScale > 0) {
          l = (cRect.left - wrapperRect.left) / zoomScale;
          t = (cRect.top - wrapperRect.top) / zoomScale;
          r = (cRect.right - wrapperRect.left) / zoomScale;
          b = (cRect.bottom - wrapperRect.top) / zoomScale;
        } else {
          const baseLeft = table.offsetLeft || 0;
          const baseTop = table.offsetTop || 0;
          l = baseLeft + cell.offsetLeft;
          t = baseTop + cell.offsetTop;
          r = l + cell.offsetWidth;
          b = t + cell.offsetHeight;
        }
        if (l < minLeft) minLeft = l;
        if (t < minTop) minTop = t;
        if (r > maxRight) maxRight = r;
        if (b > maxBottom) maxBottom = b;
      });

      const overlay = document.createElement('div');
      overlay.className = 'table-cell-selection-overlay';
      overlay.setAttribute(
        'style',
        `position:absolute;left:${minLeft}px;top:${minTop}px;width:${maxRight - minLeft}px;height:${maxBottom - minTop}px;border:${bWidth}px solid ${highlightColor};box-sizing:border-box;pointer-events:none;z-index:9999;border-radius:0px;`
      );
      wrapper.appendChild(overlay);
    } else {
      // Disjoint multi-cell selection: create an individual overlay box for each selected cell
      selectedCells.forEach(cell => {
        const cellBWidth = parseFloat(cell.getAttribute('data-cell-border-width') || bWidth) || bWidth;
        const cRect = cell.getBoundingClientRect();
        let l, t, w, h;
        if (wrapperRect.width > 0 && zoomScale > 0) {
          l = (cRect.left - wrapperRect.left) / zoomScale;
          t = (cRect.top - wrapperRect.top) / zoomScale;
          w = cRect.width / zoomScale;
          h = cRect.height / zoomScale;
        } else {
          const baseLeft = table.offsetLeft || 0;
          const baseTop = table.offsetTop || 0;
          l = baseLeft + cell.offsetLeft;
          t = baseTop + cell.offsetTop;
          w = cell.offsetWidth;
          h = cell.offsetHeight;
        }

        const overlay = document.createElement('div');
        overlay.className = 'table-cell-selection-overlay';
        overlay.setAttribute(
          'style',
          `position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;border:${cellBWidth}px solid ${highlightColor};box-sizing:border-box;pointer-events:none;z-index:9999;border-radius:0px;`
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
    table.querySelectorAll('td, th').forEach(cell => {
      if (!cell.style.border || cell.style.border === 'none' || !cell.style.borderWidth) {
        cell.style.border = `${bWidth}px ${bStyle} ${bColor}`;
      }
      if (!cell.getAttribute('data-cell-border-color')) {
        cell.setAttribute('data-cell-border-color', bColor);
      }
      cell.style.removeProperty('height');
    });

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
      existingTable.querySelectorAll('td, th').forEach(cell => {
        if (!cell.style.border || cell.style.border === 'none' || !cell.style.borderWidth) {
          cell.style.border = `${bWidth}px ${bStyle} ${bColor}`;
        }
        if (!cell.getAttribute('data-cell-border-color')) {
          cell.setAttribute('data-cell-border-color', bColor);
        }
        cell.style.removeProperty('height');
      });

      ensureColGroup(existingTable);

      // Self-healing: if row 0 became enlarged (>= 70% with multiple rows), reset equally
      const trs = existingTable.querySelectorAll('tr');
      const rLen = trs.length;
      if (rLen > 1) {
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

  // Appearance: Color state representation for Color.jsx
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
    strokeDasharrayValue: borderStyle === 'dashed' ? '8,4' : (borderStyle === 'dotted' ? '2,4' : 'none'),
    strokeDashLength: borderStyle === 'dashed' ? 8 : (borderStyle === 'dotted' ? 2 : 10),
    strokeDashGap: 4,
    strokeLinecap: 'butt',
    strokePosition: 'Center',
  }), [themeColor, themeOpacity, borderColor, borderOpacity, borderWidth, borderStyle]);

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

    if (next.strokeDashStyle === 'Solid' || next.strokeDasharrayValue === 'none' || next.strokeDasharray === 'none') {
      newBorderStyle = 'solid';
    } else if (next.strokeDasharrayValue?.includes('2') || next.strokeDasharray?.includes('2')) {
      newBorderStyle = 'dotted';
    } else if (next.strokeDashStyle === 'Dashed' || next.strokeDasharrayValue?.includes('8') || next.strokeDasharray?.includes('8')) {
      newBorderStyle = 'dashed';
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

    if (selectedCellKeysRef.current && selectedCellKeysRef.current.size > 0 && applyBorderHighlightRef.current) {
      applyBorderHighlightRef.current(table, selectedCellKeysRef.current);
      requestAnimationFrame(() => {
        applyBorderHighlightRef.current?.(table, selectedCellKeysRef.current);
      });
    }
    initTableResizers(table);
    syncChanges(el);
  }, [backgroundColor, themeColor, themeOpacity, borderColor, borderOpacity, borderWidth, borderStyle, getTargetElement, getTargetCells, initTableResizers, syncChanges]);

  // Structure manipulation: Add / Remove Row
  const handleAddRow = () => {
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    const tbody = table?.querySelector('tbody') || table;
    if (!tbody) return;

    const currentTrs = tbody.querySelectorAll('tr');
    const newRowCount = currentTrs.length + 1;
    const currentCols = currentTrs[0]?.children?.length || colsCount;

    const newTr = document.createElement('tr');
    newTr.style.boxSizing = 'border-box';
    const colWidthPct = (100 / currentCols).toFixed(3);

    for (let c = 0; c < currentCols; c++) {
      const newTd = document.createElement('td');
      newTd.style.width = `${colWidthPct}%`;
      newTd.style.border = `${borderWidth}px ${borderStyle} ${hexToRgba(borderColor, borderOpacity)}`;
      newTd.style.padding = `${paddingY}px ${paddingX}px`;
      newTd.style.backgroundColor = hexToRgba(themeColor, themeOpacity);
      newTd.style.color = cellColor;
      newTd.style.textAlign = textAlign;
      newTd.style.verticalAlign = verticalAlign;
      newTd.style.boxSizing = 'border-box';
      newTd.style.userSelect = 'none';
      newTd.style.cursor = 'default';
      newTr.appendChild(newTd);
    }
    tbody.appendChild(newTr);

    const rowHeightPct = (100 / newRowCount).toFixed(3);
    tbody.querySelectorAll('tr').forEach(tr => {
      tr.style.height = `${rowHeightPct}%`;
    });

    setRowsCount(newRowCount);
    el.setAttribute('data-rows', String(newRowCount));
    attachCellListeners(el);
    syncChanges(el);
  };

  const handleDeleteRow = () => {
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    const tbody = table?.querySelector('tbody') || table;
    if (!tbody) return;

    const currentTrs = tbody.querySelectorAll('tr');
    if (currentTrs.length <= 1) return;

    currentTrs[currentTrs.length - 1].remove();
    const newRowCount = currentTrs.length - 1;
    const rowHeightPct = (100 / newRowCount).toFixed(3);
    tbody.querySelectorAll('tr').forEach(tr => {
      tr.style.height = `${rowHeightPct}%`;
    });

    setRowsCount(newRowCount);
    el.setAttribute('data-rows', String(newRowCount));
    syncChanges(el);
  };

  // Structure manipulation: Add / Remove Column
  const handleAddColumn = () => {
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    const trs = table?.querySelectorAll('tr');
    if (!trs || trs.length === 0) return;

    const newColCount = (trs[0].children?.length || colsCount) + 1;
    const colWidthPct = (100 / newColCount).toFixed(3);

    trs.forEach((tr, rIdx) => {
      const newTd = document.createElement('td');
      newTd.style.width = `${colWidthPct}%`;
      newTd.style.border = `${borderWidth}px ${borderStyle} ${hexToRgba(borderColor, borderOpacity)}`;
      newTd.style.padding = `${paddingY}px ${paddingX}px`;
      newTd.style.backgroundColor = hexToRgba(themeColor, themeOpacity);
      newTd.style.color = cellColor;
      newTd.style.textAlign = textAlign;
      newTd.style.verticalAlign = verticalAlign;
      newTd.style.boxSizing = 'border-box';
      newTd.style.userSelect = 'none';
      newTd.style.cursor = 'default';
      tr.appendChild(newTd);

      Array.from(tr.children).forEach(cell => {
        cell.style.width = `${colWidthPct}%`;
      });
    });

    setColsCount(newColCount);
    el.setAttribute('data-cols', String(newColCount));
    attachCellListeners(el);
    syncChanges(el);
  };

  const handleDeleteColumn = () => {
    const el = getTargetElement();
    if (!el) return;
    const table = el.querySelector('table');
    const trs = table?.querySelectorAll('tr');
    if (!trs || trs.length === 0 || trs[0].children.length <= 1) return;

    const newColCount = trs[0].children.length - 1;
    const colWidthPct = (100 / newColCount).toFixed(3);

    trs.forEach(tr => {
      const lastCell = tr.children[tr.children.length - 1];
      if (lastCell) lastCell.remove();

      Array.from(tr.children).forEach(cell => {
        cell.style.width = `${colWidthPct}%`;
      });
    });

    setColsCount(newColCount);
    el.setAttribute('data-cols', String(newColCount));
    syncChanges(el);
  };

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

      const trs = table.querySelectorAll('tr');
      const totalR = trs.length;
      const totalC = trs[0]?.children?.length || 1;

      trs.forEach((tr, r) => {
        Array.from(tr.children).forEach((cell, c) => {
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
    const file = e.target.files?.[0];
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

      const excelRows = [];
      sheet.eachRow({ includeEmpty: false }, (row) => {
        const rowVals = [];
        row.eachCell({ includeEmpty: true }, (cell) => {
          rowVals.push(cell.value !== null && cell.value !== undefined ? String(cell.value) : '');
        });
        excelRows.push(rowVals);
      });

      if (excelRows.length === 0) return;

      const maxCols = Math.max(...excelRows.map(r => r.length), 1);
      const rowHeightPct = (100 / excelRows.length).toFixed(3);
      const colWidthPct = (100 / maxCols).toFixed(3);

      let rowsHtml = '';
      excelRows.forEach((rVals, r) => {
        let tds = '';
        for (let c = 0; c < maxCols; c++) {
          const val = rVals[c] || '';
          tds += `<td data-row="${r}" data-col="${c}" style="width:${colWidthPct}%;border:${borderWidth}px ${borderStyle} ${hexToRgba(borderColor, borderOpacity)};padding:${paddingY}px ${paddingX}px;color:${cellColor};background-color:${hexToRgba(themeColor, themeOpacity)};text-align:${textAlign};vertical-align:${verticalAlign};box-sizing:border-box;word-break:break-word;overflow-wrap:break-word;outline:none;user-select:none;cursor:default;">${val}</td>`;
        }
        rowsHtml += `<tr style="height:${rowHeightPct}%;box-sizing:border-box;">${tds}</tr>`;
      });

      tbody.innerHTML = rowsHtml;
      setRowsCount(excelRows.length);
      setColsCount(maxCols);
      el.setAttribute('data-rows', String(excelRows.length));
      el.setAttribute('data-cols', String(maxCols));
      attachCellListeners(el);
      syncChanges(el);
    } catch (err) {
      console.error('Failed to parse Excel file:', err);
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

  return (
    <div className="relative flex flex-col gap-[1.5vw] w-full max-w-[25vw] pb-[2vw] font-sans select-none">

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
                title="Remove Row"
              >
                <Minus size="0.7vw" />
              </button>
              <button
                type="button"
                onClick={handleAddRow}
                className="w-[1.4vw] h-[1.4vw] flex items-center justify-center bg-gray-100 rounded-[0.35vw] hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                title="Add Row"
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
                title="Remove Column"
              >
                <Minus size="0.7vw" />
              </button>
              <button
                type="button"
                onClick={handleAddColumn}
                className="w-[1.4vw] h-[1.4vw] flex items-center justify-center bg-gray-100 rounded-[0.35vw] hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                title="Add Column"
              >
                <Plus size="0.7vw" />
              </button>
            </div>
          </div>
        </div>

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

        {/* Row 2: Weight & Text Color */}
        <div className="flex items-center gap-[0.6vw]">
          {/* Font Weight */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setShowWeightDropdown(!showWeightDropdown)}
              className="w-full h-[2.1vw] px-[0.6vw] flex items-center justify-between border border-gray-300 rounded-[0.45vw] bg-white hover:border-gray-400 shadow-2xs transition-colors cursor-pointer"
            >
              <span className="text-[0.8vw] truncate text-gray-800 font-medium">
                {fontWeights.find(w => w.value === fontWeight)?.name || (isBold ? 'Bold' : 'Regular')}
              </span>
              <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform ${showWeightDropdown ? 'rotate-180' : ''}`} />
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

          {/* Text Color */}
          <div
            onClick={() => {
              setActiveColorPicker(null);
              setIsTextColorPickerOpen(prev => !prev);
            }}
            className="flex-1 h-[2.1vw] px-[0.55vw] flex items-center justify-between border border-gray-300 rounded-[0.45vw] bg-white hover:border-gray-400 shadow-2xs transition-colors cursor-pointer color-picker-trigger"
            data-color-picker-trigger="true"
            title="Click to change Text Color"
          >
            <div className="flex items-center gap-[0.45vw] min-w-0">
              <div
                className="w-[1.2vw] h-[1.2vw] rounded-[0.25vw] border border-gray-200 shadow-2xs flex-shrink-0"
                style={{ backgroundColor: cellColor }}
              />
              <span className="text-[0.78vw] font-mono font-medium text-gray-700 uppercase truncate">
                {cellColor}
              </span>
            </div>
            <span className="text-[0.68vw] text-gray-400 font-medium select-none">Color</span>
          </div>
        </div>

        {/* Row 3: Toolbar Buttons: Alignment, Style, Vertical Alignment */}
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
              opacity={100}
              onOpacityChange={() => {}}
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
    </div>
  );
};

export default React.memo(ElementTableProperties);
