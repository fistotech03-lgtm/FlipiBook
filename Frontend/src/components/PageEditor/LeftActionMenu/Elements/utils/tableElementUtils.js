/**
 * tableElementUtils.js
 * Isolated utilities for Data Grid & Table Elements in FlipiBook
 */
import ExcelJS from 'exceljs';
import { TableMatrix } from '../helpers/TableMatrix';

export const isElementTable = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  const dataType = el.getAttribute('data-type');
  const id = el.getAttribute('id') || '';
  return (
    dataType === 'table-frame' ||
    dataType === 'table' ||
    id.startsWith('table-') ||
    (typeof el.querySelector === 'function' && el.querySelector('[data-type="table-frame"], table') !== null)
  );
};

export const TABLE_PALETTES = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    solid: '#2563eb',
    soft: '#93c5fd',
    med: '#bfdbfe',
    light: '#eff6ff',
    border: '#2563eb',
    darkText: '#1e3a8a',
  },
  {
    id: 'ocean-cyan',
    name: 'Ocean Cyan',
    solid: '#0284c7',
    soft: '#7dd3fc',
    med: '#bae6fd',
    light: '#f0f9ff',
    border: '#0284c7',
    darkText: '#075985',
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    solid: '#059669',
    soft: '#6ee7b7',
    med: '#a7f3d0',
    light: '#ecfdf5',
    border: '#059669',
    darkText: '#064e3b',
  },
  {
    id: 'sunset-coral',
    name: 'Sunset Coral',
    solid: '#ea543a',
    soft: '#fca5a5',
    med: '#fed7aa',
    light: '#fff7ed',
    border: '#ea543a',
    darkText: '#7c2d12',
  },
  {
    id: 'royal-violet',
    name: 'Royal Violet',
    solid: '#7c3aed',
    soft: '#c4b5fd',
    med: '#ddd6fe',
    light: '#f5f3ff',
    border: '#7c3aed',
    darkText: '#4c1d95',
  },
  {
    id: 'slate-charcoal',
    name: 'Executive Slate',
    solid: '#334155',
    soft: '#94a3b8',
    med: '#cbd5e1',
    light: '#f8fafc',
    border: '#475569',
    darkText: '#0f172a',
  },
];

const buildTemplates = () => {
  const templates = [];

  TABLE_PALETTES.forEach((p) => {
    // 1. Standard Grid
    templates.push({
      id: `table-${p.id}-grid`,
      name: `${p.name} Grid`,
      styleVariant: 'grid',
      subtopic: p.name,
      rows: 3,
      cols: 3,
      width: 150,
      height: 70,
      themeColor: '#ffffff',
      themeOpacity: 100,
      borderColor: p.border,
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 0,
      cellColor: '#1e293b',
      fontFamily: 'Poppins',
      fontSize: 9,
      fontWeight: 'Regular',
      textAlign: 'left',
      verticalAlign: 'middle',
      paddingX: 6,
      paddingY: 4,
      rowBackgrounds: ['#ffffff', '#ffffff', '#ffffff'],
    });

    // 2. Header Accent (Soft Tint)
    templates.push({
      id: `table-${p.id}-header-accent`,
      name: `${p.name} Header`,
      styleVariant: 'header-accent',
      subtopic: p.name,
      rows: 3,
      cols: 3,
      width: 150,
      height: 70,
      themeColor: '#ffffff',
      themeOpacity: 100,
      borderColor: p.border,
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 0,
      cellColor: '#1e293b',
      headerBg: p.soft,
      headerColor: p.darkText,
      fontFamily: 'Poppins',
      fontSize: 9,
      fontWeight: 'Medium',
      textAlign: 'left',
      verticalAlign: 'middle',
      paddingX: 6,
      paddingY: 4,
      rowBackgrounds: [p.soft, '#ffffff', '#ffffff'],
    });

    // 3. Bookended Grid (Header & Footer)
    templates.push({
      id: `table-${p.id}-bookended`,
      name: `${p.name} Bookended`,
      styleVariant: 'bookended',
      subtopic: p.name,
      rows: 3,
      cols: 3,
      width: 150,
      height: 70,
      themeColor: '#ffffff',
      themeOpacity: 100,
      borderColor: p.border,
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 0,
      cellColor: '#1e293b',
      headerBg: p.soft,
      headerColor: p.darkText,
      footerBg: p.soft,
      footerColor: p.darkText,
      fontFamily: 'Poppins',
      fontSize: 9,
      fontWeight: 'Medium',
      textAlign: 'left',
      verticalAlign: 'middle',
      paddingX: 6,
      paddingY: 4,
      rowBackgrounds: [p.soft, '#ffffff', p.soft],
    });

    // 4. Bold Header Grid
    templates.push({
      id: `table-${p.id}-bold-header`,
      name: `${p.name} Bold Header`,
      styleVariant: 'bold-header',
      subtopic: p.name,
      rows: 3,
      cols: 3,
      width: 150,
      height: 70,
      themeColor: '#ffffff',
      themeOpacity: 100,
      borderColor: p.border,
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 0,
      cellColor: '#1e293b',
      headerBg: p.solid,
      headerColor: '#ffffff',
      fontFamily: 'Poppins',
      fontSize: 9,
      fontWeight: 'Medium',
      textAlign: 'left',
      verticalAlign: 'middle',
      paddingX: 6,
      paddingY: 4,
      rowBackgrounds: [p.solid, '#ffffff', '#ffffff'],
    });

    // 5. Clean Minimal Header (Solid Header with Clean Dividers)
    templates.push({
      id: `table-${p.id}-clean-minimal`,
      name: `${p.name} Minimal`,
      styleVariant: 'clean-minimal',
      subtopic: p.name,
      rows: 3,
      cols: 3,
      width: 150,
      height: 70,
      themeColor: '#f8fafc',
      themeOpacity: 100,
      borderColor: '#ffffff',
      previewBorderColor: '#e2e8f0',
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 0,
      cellColor: '#334155',
      headerBg: p.solid,
      headerColor: '#ffffff',
      fontFamily: 'Poppins',
      fontSize: 9,
      fontWeight: 'Medium',
      textAlign: 'left',
      verticalAlign: 'middle',
      paddingX: 6,
      paddingY: 4,
      rowBackgrounds: [p.solid, '#f8fafc', '#f8fafc'],
    });

    // 6. Striped Alternating Matrix
    templates.push({
      id: `table-${p.id}-striped`,
      name: `${p.name} Striped`,
      styleVariant: 'striped',
      subtopic: p.name,
      rows: 3,
      cols: 3,
      width: 150,
      height: 70,
      themeColor: '#ffffff',
      themeOpacity: 100,
      borderColor: '#ffffff',
      previewBorderColor: '#e2e8f0',
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 0,
      cellColor: '#1e293b',
      headerBg: p.solid,
      headerColor: '#ffffff',
      fontFamily: 'Poppins',
      fontSize: 9,
      fontWeight: 'Medium',
      textAlign: 'left',
      verticalAlign: 'middle',
      paddingX: 6,
      paddingY: 4,
      rowBackgrounds: [p.solid, p.med, p.light],
    });
  });

  return templates;
};

export const TABLE_TEMPLATES = buildTemplates();

export function generateTableHtml(config = {}) {
  const {
    rows = 3,
    cols = 3,
    sampleHeaders = [],
    sampleData = [],
    ...styles
  } = config;

  // Build 2D grid matrix
  const initialData = [];
  if (Array.isArray(sampleHeaders) && sampleHeaders.length > 0) {
    initialData.push(sampleHeaders);
  }
  if (Array.isArray(sampleData)) {
    sampleData.forEach((row) => initialData.push(row));
  }

  const matrix = new TableMatrix(rows, cols, initialData.length > 0 ? initialData : null);
  return matrix.toHtml({
    ...styles,
    rows: matrix.rows,
    cols: matrix.cols,
  });
}

/**
 * Creates an SVG <g> DOM node representing a rich Table element
 */
export function createTableElementNode(config = {}, cx = 200, cy = 200) {
  const tmpl = TABLE_TEMPLATES.find((t) => t.id === config.id) || TABLE_TEMPLATES[0];
  const merged = { ...tmpl, ...config };

  const uniqueId = `table-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const width = merged.width || 150;
  const height = merged.height || 70;
  const x = Math.round(cx - width / 2);
  const y = Math.round(cy - height / 2);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id', uniqueId);
  g.setAttribute('data-type', 'table-frame');
  g.setAttribute('data-name', 'Table');
  g.setAttribute('data-table-title', merged.name || 'Table');
  g.setAttribute('data-scrollable', 'false');
  g.setAttribute('data-rows', String(merged.rows));
  g.setAttribute('data-cols', String(merged.cols));
  g.setAttribute('data-theme-color', merged.themeColor);
  g.setAttribute('data-theme-opacity', String(merged.themeOpacity || 100));
  g.setAttribute('data-border-color', merged.borderColor);
  g.setAttribute('data-border-opacity', '100');
  g.setAttribute('data-border-width', String(merged.borderWidth));
  g.setAttribute('data-border-style', merged.borderStyle || 'solid');
  g.setAttribute('data-border-radius', String(merged.borderRadius || 0));
  g.setAttribute('data-cell-color', merged.cellColor);
  g.setAttribute('data-font-family', merged.fontFamily || 'Poppins');
  g.setAttribute('data-font-size', String(merged.fontSize || 9));
  g.setAttribute('data-font-weight', merged.fontWeight || 'Regular');
  g.setAttribute('data-text-align', merged.textAlign || 'left');
  g.setAttribute('data-vertical-align', merged.verticalAlign || 'middle');
  g.setAttribute('data-padding-x', String(merged.paddingX || 6));
  g.setAttribute('data-padding-y', String(merged.paddingY || 4));
  g.setAttribute('data-text-wrapping', 'true');
  if (merged.headerBg) g.setAttribute('data-header-bg', merged.headerBg);
  if (merged.footerBg) g.setAttribute('data-footer-bg', merged.footerBg);
  if (merged.stripeBg) g.setAttribute('data-stripe-bg', merged.stripeBg);
  if (merged.rowBackgrounds) g.setAttribute('data-row-backgrounds', JSON.stringify(merged.rowBackgrounds));
  g.setAttribute('transform', `translate(${x}, ${y})`);

  const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  foreignObject.setAttribute('x', '0');
  foreignObject.setAttribute('y', '0');
  foreignObject.setAttribute('width', String(width));
  foreignObject.setAttribute('height', String(height));
  foreignObject.setAttribute('style', 'overflow:visible;');

  const wrapper = document.createElement('div');
  wrapper.className = 'table-card-wrapper table-container';
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  wrapper.setAttribute('style', `width:100%;height:100%;box-sizing:border-box;border-radius:${merged.borderRadius || 0}px;overflow:visible;display:block;margin:0;padding:0;white-space:normal;line-height:normal;outline:none;user-select:none;pointer-events:auto;`);
  wrapper.innerHTML = generateTableHtml(merged);

  foreignObject.appendChild(wrapper);
  g.appendChild(foreignObject);

  return g;
}

/**
 * Returns raw SVG string for drag-and-drop
 */
export function getTableSvgString(config = {}, isDrag = false) {
  const tmpl = TABLE_TEMPLATES.find((t) => t.id === config.id) || TABLE_TEMPLATES[0];
  const merged = { ...tmpl, ...config };
  const uniqueId = `table-${Date.now()}`;
  const width = merged.width || 150;
  const height = merged.height || 70;
  const transform = isDrag ? '' : 'transform="translate(80, 100)"';

  const extraAttrs = [
    merged.headerBg ? `data-header-bg="${merged.headerBg}"` : '',
    merged.footerBg ? `data-footer-bg="${merged.footerBg}"` : '',
    merged.stripeBg ? `data-stripe-bg="${merged.stripeBg}"` : '',
    merged.rowBackgrounds ? `data-row-backgrounds='${JSON.stringify(merged.rowBackgrounds)}'` : ''
  ].filter(Boolean).join(' ');

  const tableInnerHtml = generateTableHtml(merged);

  return `<g id="${uniqueId}" data-type="table-frame" data-scrollable="false" data-rows="${merged.rows}" data-cols="${merged.cols}" data-theme-color="${merged.themeColor}" data-theme-opacity="${merged.themeOpacity || 100}" data-border-color="${merged.borderColor}" data-border-opacity="100" data-border-width="${merged.borderWidth}" data-border-style="${merged.borderStyle || 'solid'}" data-border-radius="${merged.borderRadius || 0}" data-cell-color="${merged.cellColor}" data-font-family="${merged.fontFamily || 'Poppins'}" data-font-size="${merged.fontSize || 9}" data-font-weight="${merged.fontWeight || 'Regular'}" data-text-align="${merged.textAlign || 'left'}" data-vertical-align="${merged.verticalAlign || 'middle'}" data-padding-x="${merged.paddingX || 6}" data-padding-y="${merged.paddingY || 4}" data-text-wrapping="true" ${extraAttrs} ${transform}><foreignObject x="0" y="0" width="${width}" height="${height}" style="overflow:visible;"><div class="table-card-wrapper table-container" xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;box-sizing:border-box;border-radius:${merged.borderRadius || 0}px;overflow:visible;display:block;margin:0;padding:0;white-space:normal;line-height:normal;outline:none;user-select:none;pointer-events:auto;">${tableInnerHtml}</div></foreignObject></g>`.trim();
}

/**
 * Normalizes foreignObject contents across any SVG string so that HTML elements
 * retain their explicit XHTML namespace (xmlns="http://www.w3.org/1999/xhtml").
 * This prevents XML parsers (e.g., DOMParser with "image/svg+xml") from misclassifying
 * <div>, <table>, <tr>, <td> into the SVG namespace, which causes them to vanish.
 */
export function normalizeForeignObjectNamespaces(htmlStr) {
  if (!htmlStr || typeof htmlStr !== 'string') return htmlStr;

  // 1. Ensure HTML void elements are self-closing for strict XML compliance (<col />, <img />, <hr />, <br/>, <input />)
  let clean = htmlStr
    .replace(/<col\b([^>]*?)(?:\s*\/\s*>|>\s*<\/\s*col\s*>|>)/gi, '<col$1 />')
    .replace(/<img\b([^>]*?)(?:\s*\/\s*>|>\s*<\/\s*img\s*>|>)/gi, '<img$1 />')
    .replace(/<hr\b([^>]*?)(?:\s*\/\s*>|>\s*<\/\s*hr\s*>|>)/gi, '<hr$1 />')
    .replace(/<input\b([^>]*?)(?:\s*\/\s*>|>\s*<\/\s*input\s*>|>)/gi, '<input$1 />')
    .replace(/<\s*br[^>]*>(?:<\/\s*br\s*>)?/gi, '<br/>')
    .replace(/<\/\s*br\s*>/gi, '');

  if (!clean.includes('foreignObject') && !clean.includes('foreignobject')) return clean;

  return clean.replace(/<foreignObject([^>]*)>([\s\S]*?)<\/foreignObject>/gi, (match, foAttrs, foInner) => {
    let inner = foInner;
    if (!inner.includes('xmlns="http://www.w3.org/1999/xhtml"') && !inner.includes("xmlns='http://www.w3.org/1999/xhtml'")) {
      inner = inner.replace(/<([a-zA-Z0-9]+)\b([^>]*)>/i, '<$1$2 xmlns="http://www.w3.org/1999/xhtml">');
    }
    return `<foreignObject${foAttrs}>${inner}</foreignObject>`;
  });
}

/**
 * Auto-heals a live DOM table element node if its internal table or wrapper was stripped
 */
export function healTableElementNode(tableG) {
  if (!tableG || typeof tableG.getAttribute !== 'function') return;
  const fo = tableG.querySelector('foreignObject');
  if (!fo) return;

  let wrapper = fo.querySelector('.table-card-wrapper');
  let tbl = fo.querySelector('table');
  const hasRows = tbl && tbl.querySelectorAll('tr').length > 0;

  if (!wrapper || !tbl || !hasRows) {
    const rows = parseInt(tableG.getAttribute('data-rows') || '3', 10);
    const cols = parseInt(tableG.getAttribute('data-cols') || '3', 10);
    const themeColor = tableG.getAttribute('data-theme-color') || '#ffffff';
    const themeOpacity = parseInt(tableG.getAttribute('data-theme-opacity') || '100', 10);
    const borderColor = tableG.getAttribute('data-border-color') || '#2563eb';
    const borderWidth = parseFloat(tableG.getAttribute('data-border-width') || '1');
    const borderStyle = tableG.getAttribute('data-border-style') || 'solid';
    const borderRadius = parseFloat(tableG.getAttribute('data-border-radius') || '0');
    const cellColor = tableG.getAttribute('data-cell-color') || '#1e293b';
    const fontFamily = tableG.getAttribute('data-font-family') || 'Poppins';
    const fontSize = parseInt(tableG.getAttribute('data-font-size') || '13', 10);
    const paddingX = parseInt(tableG.getAttribute('data-padding-x') || '8', 10);
    const paddingY = parseInt(tableG.getAttribute('data-padding-y') || '6', 10);
    const headerBg = tableG.getAttribute('data-header-bg');
    const footerBg = tableG.getAttribute('data-footer-bg');
    const stripeBg = tableG.getAttribute('data-stripe-bg');
    let rowBackgrounds = null;
    try {
      const rb = tableG.getAttribute('data-row-backgrounds');
      if (rb) rowBackgrounds = JSON.parse(rb);
    } catch (e) {}

    const matrix = new TableMatrix(rows, cols);
    const generatedHtml = matrix.toHtml({
      rows,
      cols,
      themeColor,
      themeOpacity,
      borderColor,
      borderWidth,
      borderStyle,
      borderRadius,
      cellColor,
      fontFamily,
      fontSize,
      paddingX,
      paddingY,
      headerBg,
      footerBg,
      stripeBg,
      rowBackgrounds
    });

    fo.innerHTML = `<div class="table-card-wrapper table-container" xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;box-sizing:border-box;border-radius:${borderRadius}px;overflow:visible;display:block;margin:0;padding:0;white-space:normal;line-height:normal;outline:none;user-select:none;pointer-events:auto;">${generatedHtml}</div>`;
  } else {
    // If wrapper exists, ensure xmlns and styles are present
    if (!wrapper.getAttribute('xmlns')) {
      wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    }
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.overflow = 'visible';
    fo.setAttribute('style', 'overflow:visible;');
  }
}

/**
 * Exports table content to an Excel file using ExcelJS
 */
export async function exportTableToExcel(tableGroup, fileName = 'table-data.xlsx') {
  if (!tableGroup) return;
  const table = tableGroup.querySelector('table');
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tr'));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet 1');

  rows.forEach((tr, rIdx) => {
    const cells = Array.from(tr.querySelectorAll('td, th'));
    const rowValues = cells.map((cell) => cell.innerText.trim());
    const row = ws.addRow(rowValues);

    // Apply basic cell styles
    cells.forEach((cell, cIdx) => {
      const excelCell = row.getCell(cIdx + 1);
      const isHeader = rIdx === 0;
      excelCell.font = {
        name: 'Poppins',
        size: isHeader ? 11 : 10,
        bold: isHeader
      };
      excelCell.alignment = {
        vertical: 'middle',
        horizontal: cell.style.textAlign || 'left'
      };
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports an Excel file and populates the selected table element
 */
export async function importExcelToTable(file, tableGroup) {
  if (!file || !tableGroup) return;
  const table = tableGroup.querySelector('table');
  if (!table) return;

  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if (!ws) return;

  const gridData = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    const rowVals = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      rowVals.push(cell.text || '');
    });
    gridData.push(rowVals);
  });

  if (gridData.length === 0) return;

  const newRows = gridData.length;
  const newCols = Math.max(...gridData.map((r) => r.length), 1);

  // Update table group metadata
  tableGroup.setAttribute('data-rows', String(newRows));
  tableGroup.setAttribute('data-cols', String(newCols));

  const tbody = table.querySelector('tbody') || table;
  tbody.innerHTML = '';

  const rowHeightPercent = (100 / newRows).toFixed(3);
  const colWidthPercent = (100 / newCols).toFixed(3);

  const borderColor = tableGroup.getAttribute('data-border-color') || '#cbd5e1';
  const borderWidth = tableGroup.getAttribute('data-border-width') || '1';
  const borderStyle = tableGroup.getAttribute('data-border-style') || 'solid';
  const cellColor = tableGroup.getAttribute('data-cell-color') || '#000000';
  const themeColor = tableGroup.getAttribute('data-theme-color') || '#ffffff';

  gridData.forEach((rowVals, r) => {
    const tr = document.createElement('tr');
    tr.style.height = `${rowHeightPercent}%`;
    tr.style.boxSizing = 'border-box';

    for (let c = 0; c < newCols; c++) {
      const td = document.createElement('td');
      td.contentEditable = 'true';
      td.setAttribute('data-row', String(r));
      td.setAttribute('data-col', String(c));
      td.style.width = `${colWidthPercent}%`;
      td.style.height = `${rowHeightPercent}%`;
      td.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`;
      td.style.padding = '6px 8px';
      td.style.color = cellColor;
      td.style.backgroundColor = themeColor;
      td.style.textAlign = 'left';
      td.style.verticalAlign = 'middle';
      td.style.boxSizing = 'border-box';
      td.style.wordBreak = 'break-word';
      td.style.outline = 'none';
      td.innerText = rowVals[c] || '';
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
}
