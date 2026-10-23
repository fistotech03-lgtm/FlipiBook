/**
 * TableMatrix.js
 * 2D Matrix / Grid Data Structure with Prefix Sum Array calculations
 *
 * Provides:
 * - Pure in-memory 2D Matrix representation of table cells
 * - O(R) row insertion / deletion
 * - O(R) column insertion / deletion
 * - O(1) cell access by coordinate (r, c)
 * - Prefix Sum Array for responsive column/row dimension calculations
 * - High-speed HTML generation and DOM synchronization
 */

export class TableMatrix {
  constructor(rows = 3, cols = 3, initialData = null) {
    this.rows = Math.max(1, parseInt(rows, 10) || 3);
    this.cols = Math.max(1, parseInt(cols, 10) || 3);
    this.grid = []; // grid[row][col]

    if (Array.isArray(initialData) && initialData.length > 0) {
      this.load2DArray(initialData);
    } else {
      this.initEmptyGrid();
    }
  }

  /**
   * Initializes empty grid with empty strings
   */
  initEmptyGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = new Array(this.cols).fill('');
      this.grid.push(row);
    }
  }

  /**
   * Loads a raw 2D array into the matrix, automatically adjusting dimensions
   */
  load2DArray(data) {
    if (!Array.isArray(data) || data.length === 0) {
      this.initEmptyGrid();
      return;
    }

    this.rows = data.length;
    let maxCols = 0;
    for (let r = 0; r < data.length; r++) {
      if (Array.isArray(data[r]) && data[r].length > maxCols) {
        maxCols = data[r].length;
      }
    }
    this.cols = Math.max(1, maxCols);

    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        row.push(data[r] && data[r][c] !== undefined ? String(data[r][c]) : '');
      }
      this.grid.push(row);
    }
  }

  /**
   * O(1) Cell Access
   */
  getCell(r, c) {
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      return this.grid[r][c];
    }
    return '';
  }

  /**
   * O(1) Cell Mutation
   */
  setCell(r, c, value) {
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      this.grid[r][c] = String(value);
      return true;
    }
    return false;
  }

  /**
   * Inserts a row at the specified index in O(R)
   */
  addRow(index = null, defaultValues = null) {
    const insertIdx = index !== null && index >= 0 && index <= this.rows ? index : this.rows;
    const newRow = Array.isArray(defaultValues)
      ? Array.from({ length: this.cols }, (_, c) => defaultValues[c] !== undefined ? String(defaultValues[c]) : '')
      : new Array(this.cols).fill('');

    this.grid.splice(insertIdx, 0, newRow);
    this.rows += 1;
    return insertIdx;
  }

  /**
   * Deletes a row at the specified index in O(R)
   * Prevents removing the last remaining row
   */
  deleteRow(index = null) {
    if (this.rows <= 1) return false;
    const removeIdx = index !== null && index >= 0 && index < this.rows ? index : this.rows - 1;
    this.grid.splice(removeIdx, 1);
    this.rows -= 1;
    return true;
  }

  /**
   * Inserts a column across all rows in O(R)
   */
  addColumn(index = null, defaultValues = null) {
    const insertIdx = index !== null && index >= 0 && index <= this.cols ? index : this.cols;

    for (let r = 0; r < this.rows; r++) {
      const val = Array.isArray(defaultValues) && defaultValues[r] !== undefined
        ? String(defaultValues[r])
        : '';
      this.grid[r].splice(insertIdx, 0, val);
    }

    this.cols += 1;
    return insertIdx;
  }

  /**
   * Deletes a column across all rows in O(R)
   * Prevents removing the last remaining column
   */
  deleteColumn(index = null) {
    if (this.cols <= 1) return false;
    const removeIdx = index !== null && index >= 0 && index < this.cols ? index : this.cols - 1;

    for (let r = 0; r < this.rows; r++) {
      this.grid[r].splice(removeIdx, 1);
    }

    this.cols -= 1;
    return true;
  }

  /**
   * Computes a 1D Prefix Sum Array of column widths for O(1) / O(log C)
   * spatial boundary hit testing
   *
   * @param {number} totalWidth
   * @returns {number[]} Prefix sums where P[i] is the starting offset of column i
   */
  getPrefixSumWidths(totalWidth = 260) {
    const colWidth = totalWidth / this.cols;
    const prefixSums = [0];
    let sum = 0;
    for (let c = 0; c < this.cols; c++) {
      sum += colWidth;
      prefixSums.push(sum);
    }
    return prefixSums;
  }

  /**
   * Exports grid data as a standard 2D array
   */
  to2DArray() {
    return this.grid.map((row) => [...row]);
  }

  /**
   * Generates clean table HTML based on the matrix model and styling options
   */
  toHtml(options = {}) {
    const {
      themeColor = '#ffffff',
      borderColor = '#cbd5e1',
      borderWidth = 1.5,
      borderStyle = 'solid',
      cellColor = '#000000',
      headerBg = null,
      headerColor = null,
      fontFamily = 'Poppins',
      fontSize = 13,
      paddingX = 8,
      paddingY = 6,
      textAlign = 'left',
      verticalAlign = 'middle',
      textWrapping = true,
    } = options;

    const rowHeightPercent = (100 / this.rows).toFixed(3);
    const colWidthPercent = (100 / this.cols).toFixed(3);

    let trs = '';
    for (let r = 0; r < this.rows; r++) {
      let tds = '';
      const isHeaderRow = r === 0 && Boolean(headerBg);
      const rowBg = isHeaderRow ? headerBg : themeColor;
      const rowTextColor = isHeaderRow ? (headerColor || '#ffffff') : cellColor;
      const rowFontWeight = isHeaderRow ? '600' : '400';

      for (let c = 0; c < this.cols; c++) {
        const cellText = this.grid[r][c] || '';
        tds += `<td contenteditable="true" data-row="${r}" data-col="${c}" style="width:${colWidthPercent}%;height:${rowHeightPercent}%;border:${borderWidth}px ${borderStyle} ${borderColor};padding:${paddingY}px ${paddingX}px;color:${rowTextColor};background-color:${rowBg};text-align:${textAlign};vertical-align:${verticalAlign};box-sizing:border-box;word-break:${textWrapping ? 'break-word' : 'normal'};outline:none;font-weight:${rowFontWeight};">${cellText}</td>`;
      }
      trs += `<tr style="height:${rowHeightPercent}%;box-sizing:border-box;">${tds}</tr>`;
    }

    return `<table style="width:100%;height:100%;border-collapse:collapse;border:${borderWidth}px ${borderStyle} ${borderColor};background-color:${themeColor};font-family:'${fontFamily}',sans-serif;font-size:${fontSize}px;table-layout:fixed;margin:0;padding:0;white-space:normal;box-sizing:border-box;"><tbody>${trs}</tbody></table>`;
  }

  /**
   * Parses live DOM table element into a TableMatrix instance
   */
  static fromDOM(tableElement) {
    if (!tableElement) return new TableMatrix(3, 3);

    const trElements = Array.from(tableElement.querySelectorAll('tr'));
    if (trElements.length === 0) return new TableMatrix(3, 3);

    const data2D = trElements.map((tr) => {
      const tdElements = Array.from(tr.querySelectorAll('td, th'));
      return tdElements.map((td) => td.innerText || td.textContent || '');
    });

    const matrix = new TableMatrix(data2D.length, data2D[0]?.length || 3);
    matrix.load2DArray(data2D);
    return matrix;
  }
}

export default TableMatrix;
