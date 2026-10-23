/**
 * GeometryAABB.js
 * 2D Axis-Aligned Bounding Box (AABB) calculations and clamping algorithms
 *
 * Provides:
 * - AABB intersection detection
 * - Viewport boundary clamping for dragged / dropped elements
 * - Safe canvas drop point calculations
 */

export class Box2D {
  constructor(minX = 0, minY = 0, maxX = 0, maxY = 0) {
    this.minX = Number(minX);
    this.minY = Number(minY);
    this.maxX = Number(maxX);
    this.maxY = Number(maxY);
  }

  get width() {
    return Math.max(0, this.maxX - this.minX);
  }

  get height() {
    return Math.max(0, this.maxY - this.minY);
  }

  get centerX() {
    return this.minX + this.width / 2;
  }

  get centerY() {
    return this.minY + this.height / 2;
  }

  /**
   * Tests if this bounding box intersects with another box in O(1)
   */
  intersects(other) {
    return !(
      this.maxX < other.minX ||
      this.minX > other.maxX ||
      this.maxY < other.minY ||
      this.minY > other.maxY
    );
  }

  /**
   * Tests if a 2D point (x, y) is inside this box in O(1)
   */
  contains(x, y) {
    return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
  }
}

/**
 * Clamps center coordinates (cx, cy) so the resulting bounding box
 * stays strictly within the container boundary with a safety margin.
 *
 * @param {Object} params
 * @param {number} params.cx - Desired center X coordinate
 * @param {number} params.cy - Desired center Y coordinate
 * @param {number} params.elemWidth - Width of the element (default: 0)
 * @param {number} params.elemHeight - Height of the element (default: 0)
 * @param {Object} params.bounds - Container bounds { minX, minY, width, height }
 * @param {number} params.margin - Inset safety margin in SVG units
 * @returns {{ x: number, y: number }} Clamped safe center coordinates
 */
export function clampCenterToAABB({
  cx,
  cy,
  elemWidth = 0,
  elemHeight = 0,
  bounds = { minX: 0, minY: 0, width: 210, height: 297 },
  margin = 20,
}) {
  const minX = bounds.minX ?? 0;
  const minY = bounds.minY ?? 0;
  const vbW = bounds.width ?? 210;
  const vbH = bounds.height ?? 297;

  // If cx/cy are undefined or invalid, place at exact center of the boundary
  let targetX = Number(cx);
  let targetY = Number(cy);

  if (isNaN(targetX) || cx === undefined || cx === null) {
    targetX = minX + vbW / 2;
  }
  if (isNaN(targetY) || cy === undefined || cy === null) {
    targetY = minY + vbH / 2;
  }

  const halfW = (Number(elemWidth) || 0) / 2;
  const halfH = (Number(elemHeight) || 0) / 2;

  // Effective clamped range
  const safeMinX = minX + margin + halfW;
  const safeMaxX = Math.max(safeMinX, minX + vbW - margin - halfW);

  const safeMinY = minY + margin + halfH;
  const safeMaxY = Math.max(safeMinY, minY + vbH - margin - halfH);

  return {
    x: Math.max(safeMinX, Math.min(safeMaxX, targetX)),
    y: Math.max(safeMinY, Math.min(safeMaxY, targetY)),
  };
}

/**
 * Parses SVG viewBox string into standard Box2D bounds object
 */
export function parseSvgViewBox(svgElement, fallbackWidth = 210, fallbackHeight = 297) {
  if (!svgElement || typeof svgElement.getAttribute !== 'function') {
    return { minX: 0, minY: 0, width: fallbackWidth, height: fallbackHeight };
  }

  const vb = svgElement.getAttribute('viewBox');
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3])) {
      return {
        minX: parts[0] || 0,
        minY: parts[1] || 0,
        width: parts[2] || fallbackWidth,
        height: parts[3] || fallbackHeight,
      };
    }
  }

  return { minX: 0, minY: 0, width: fallbackWidth, height: fallbackHeight };
}
