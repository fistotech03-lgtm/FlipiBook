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

export const TABLE_TEMPLATES = [
  {
    id: 'table-standard',
    name: 'Standard Grid',
    rows: 3,
    cols: 3,
    width: 260,
    height: 120,
    themeColor: '#ffffff',
    themeOpacity: 100,
    borderColor: '#cbd5e1',
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderRadius: 6,
    cellColor: '#0f172a',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: 'Regular',
    textAlign: 'left',
    verticalAlign: 'middle',
    paddingX: 10,
    paddingY: 8,
    sampleHeaders: ['Item', 'Category', 'Price'],
    sampleData: [
      ['Design System', 'UI/UX', '$450'],
      ['Motion Library', 'Graphics', '$320']
    ]
  },
  {
    id: 'table-accent-header',
    name: 'Accent Header',
    rows: 3,
    cols: 3,
    width: 260,
    height: 120,
    themeColor: '#ffffff',
    themeOpacity: 100,
    borderColor: '#e2e8f0',
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderRadius: 8,
    cellColor: '#1e293b',
    headerBg: '#EA543A',
    headerColor: '#ffffff',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: 'Medium',
    textAlign: 'left',
    verticalAlign: 'middle',
    paddingX: 10,
    paddingY: 8,
    sampleHeaders: ['Phase', 'Deliverable', 'Status'],
    sampleData: [
      ['Phase 1', 'Brand Audit', 'Done'],
      ['Phase 2', 'Prototypes', 'In Review']
    ]
  },
  {
    id: 'table-dark-slate',
    name: 'Executive Dark',
    rows: 3,
    cols: 3,
    width: 260,
    height: 120,
    themeColor: '#0f172a',
    themeOpacity: 100,
    borderColor: '#334155',
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderRadius: 8,
    cellColor: '#f8fafc',
    headerBg: '#1e293b',
    headerColor: '#38bdf8',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: 'Regular',
    textAlign: 'left',
    verticalAlign: 'middle',
    paddingX: 10,
    paddingY: 8,
    sampleHeaders: ['Metric', 'Q3 Target', 'Actual'],
    sampleData: [
      ['Revenue', '$1.2M', '$1.45M'],
      ['NPS Score', '85%', '92%']
    ]
  },
  {
    id: 'table-minimal-clean',
    name: 'Clean Borderless',
    rows: 3,
    cols: 3,
    width: 260,
    height: 120,
    themeColor: '#ffffff',
    themeOpacity: 100,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
    cellColor: '#334155',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: 'Regular',
    textAlign: 'left',
    verticalAlign: 'middle',
    paddingX: 10,
    paddingY: 8,
    sampleHeaders: ['Feature', 'Starter', 'Enterprise'],
    sampleData: [
      ['Users', '5', 'Unlimited'],
      ['Support', 'Email', '24/7 Dedicated']
    ]
  },
  {
    id: 'table-emerald-sheet',
    name: 'Emerald Sheet',
    rows: 4,
    cols: 3,
    width: 280,
    height: 140,
    themeColor: '#ffffff',
    themeOpacity: 100,
    borderColor: '#a7f3d0',
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderRadius: 8,
    cellColor: '#064e3b',
    headerBg: '#059669',
    headerColor: '#ffffff',
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: 'Regular',
    textAlign: 'left',
    verticalAlign: 'middle',
    paddingX: 8,
    paddingY: 6,
    sampleHeaders: ['Account', 'Budget', 'Balance'],
    sampleData: [
      ['Marketing', '$25,000', '$14,200'],
      ['R&D Dev', '$80,000', '$62,500'],
      ['Operations', '$15,000', '$8,900']
    ]
  },
  {
    id: 'table-compact-data',
    name: 'Compact Matrix',
    rows: 4,
    cols: 4,
    width: 300,
    height: 140,
    themeColor: '#f8fafc',
    themeOpacity: 100,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 6,
    cellColor: '#1e293b',
    headerBg: '#e2e8f0',
    headerColor: '#0f172a',
    fontFamily: 'Poppins',
    fontSize: 11,
    fontWeight: 'Regular',
    textAlign: 'center',
    verticalAlign: 'middle',
    paddingX: 6,
    paddingY: 5,
    sampleHeaders: ['ID', 'Region', 'Units', 'Growth'],
    sampleData: [
      ['01', 'North', '1,420', '+18%'],
      ['02', 'South', '980', '+12%'],
      ['03', 'East', '2,150', '+24%']
    ]
  }
];

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
  const width = merged.width || 260;
  const height = merged.height || 120;
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
  g.setAttribute('data-font-size', String(merged.fontSize || 13));
  g.setAttribute('data-font-weight', merged.fontWeight || 'Regular');
  g.setAttribute('data-text-align', merged.textAlign || 'left');
  g.setAttribute('data-vertical-align', merged.verticalAlign || 'middle');
  g.setAttribute('data-padding-x', String(merged.paddingX || 8));
  g.setAttribute('data-padding-y', String(merged.paddingY || 6));
  g.setAttribute('data-text-wrapping', 'true');
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
  wrapper.setAttribute('style', `width:100%;height:100%;box-sizing:border-box;border-radius:${merged.borderRadius || 0}px;overflow:hidden;display:block;margin:0;padding:0;white-space:normal;line-height:normal;pointer-events:auto;`);
  wrapper.innerHTML = generateTableHtml(merged);

  foreignObject.appendChild(wrapper);
  g.appendChild(foreignObject);

  const overlayRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  overlayRect.setAttribute('class', 'svg-table-overlay svg-image-stroke-overlay');
  overlayRect.setAttribute('x', '0');
  overlayRect.setAttribute('y', '0');
  overlayRect.setAttribute('width', String(width));
  overlayRect.setAttribute('height', String(height));
  overlayRect.setAttribute('fill', 'transparent');
  overlayRect.setAttribute('pointer-events', 'none');
  g.appendChild(overlayRect);

  return g;
}

/**
 * Returns raw SVG string for drag-and-drop
 */
export function getTableSvgString(config = {}, isDrag = false) {
  const tmpl = TABLE_TEMPLATES.find((t) => t.id === config.id) || TABLE_TEMPLATES[0];
  const merged = { ...tmpl, ...config };
  const uniqueId = `table-${Date.now()}`;
  const width = merged.width || 260;
  const height = merged.height || 120;
  const transform = isDrag ? '' : 'transform="translate(80, 100)"';

  const tableInnerHtml = generateTableHtml(merged);

  return `<g id="${uniqueId}" data-type="table-frame" data-scrollable="false" data-rows="${merged.rows}" data-cols="${merged.cols}" data-theme-color="${merged.themeColor}" data-theme-opacity="${merged.themeOpacity || 100}" data-border-color="${merged.borderColor}" data-border-opacity="100" data-border-width="${merged.borderWidth}" data-border-style="${merged.borderStyle || 'solid'}" data-border-radius="${merged.borderRadius || 0}" data-cell-color="${merged.cellColor}" data-font-family="${merged.fontFamily || 'Poppins'}" data-font-size="${merged.fontSize || 13}" data-font-weight="${merged.fontWeight || 'Regular'}" data-text-align="${merged.textAlign || 'left'}" data-vertical-align="${merged.verticalAlign || 'middle'}" data-padding-x="${merged.paddingX || 8}" data-padding-y="${merged.paddingY || 6}" data-text-wrapping="true" ${transform}><foreignObject x="0" y="0" width="${width}" height="${height}" style="overflow:visible;"><div class="table-card-wrapper table-container" xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;box-sizing:border-box;border-radius:${merged.borderRadius || 0}px;overflow:hidden;display:block;margin:0;padding:0;white-space:normal;line-height:normal;pointer-events:auto;">${tableInnerHtml}</div></foreignObject><rect class="svg-table-overlay svg-image-stroke-overlay" width="${width}" height="${height}" fill="transparent" pointer-events="none" /></g>`.trim();
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
  const borderWidth = tableGroup.getAttribute('data-border-width') || '1.5';
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
