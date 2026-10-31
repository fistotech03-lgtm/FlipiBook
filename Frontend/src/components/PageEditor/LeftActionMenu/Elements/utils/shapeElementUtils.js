/**
 * shapeElementUtils.js
 * Isolated pure-code vector shape definitions and utilities for FlipiBook.
 * Defines all 20 vector shapes 100% in JavaScript code without external .svg assets.
 */

export const isElementShape = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-is-element-shape') === 'true' ||
    el.getAttribute('data-shape-type') !== null ||
    el.getAttribute('data-type') === 'shape' ||
    (typeof el.closest === 'function' && (
      el.closest('[data-is-element-shape="true"]') !== null ||
      el.closest('[data-shape-type]') !== null ||
      el.closest('[data-type="shape"]') !== null
    )) ||
    (typeof el.querySelector === 'function' && (
      el.querySelector('[data-is-element-shape="true"]') !== null ||
      el.querySelector('[data-shape-type]') !== null ||
      el.querySelector('[data-type="shape"]') !== null
    ))
  );
};

/**
 * Generate full SVG string from a shape code definition with optional style overrides.
 * 
 * @param {Object} shape - Shape data object
 * @param {Object} [overrides={}] - Optional style overrides (fill, stroke, strokeWidth, inheritColors)
 * @returns {string} SVG markup string
 */
export const generateShapeSvg = (shape, overrides = {}) => {
  const fill = overrides.inheritColors 
    ? 'inherit' 
    : (overrides.fill !== undefined ? overrides.fill : shape.fill);
  const stroke = overrides.inheritColors 
    ? 'inherit' 
    : (overrides.stroke !== undefined ? overrides.stroke : shape.stroke);
  const strokeWidth = overrides.strokeWidth !== undefined ? overrides.strokeWidth : shape.strokeWidth;

  const joinAttr = shape.strokeLinejoin ? ` stroke-linejoin="${shape.strokeLinejoin}"` : '';
  const capAttr = shape.strokeLinecap ? ` stroke-linecap="${shape.strokeLinecap}"` : '';
  const miterAttr = shape.strokeMiterlimit ? ` stroke-miterlimit="${shape.strokeMiterlimit}"` : '';
  const fillRuleAttr = shape.fillRule ? ` fill-rule="${shape.fillRule}"` : '';

  let extraAttrs = ' data-is-element-shape="true"';
  if (shape.id) {
    extraAttrs += ` data-shape-id="${shape.id}"`;
  }
  if (shape.shapeType === 'star') {
    extraAttrs += ` data-shape-type="star" data-count="${shape.count || 5}" data-radius="${shape.radius || 0}" data-cx="${shape.cx || 50}" data-cy="${shape.cy || 50}" data-rx="${shape.rx || 50}" data-ratio="${shape.ratio || 40}"${shape.angle ? ` data-angle="${shape.angle}"` : ''}`;
  } else if (shape.shapeType === 'polygon') {
    extraAttrs += ` data-shape-type="polygon" data-count="${shape.count || 3}" data-radius="${shape.radius || 0}" data-cx="${shape.cx || 50}" data-cy="${shape.cy || 50}" data-rx="${shape.rx || 50}"`;
  } else if (shape.shapeType === 'rectangle') {
    const rx = shape.x !== undefined ? shape.x : 14;
    const ry = shape.y !== undefined ? shape.y : 14;
    const rw = shape.rectWidth !== undefined ? shape.rectWidth : ((shape.width || 100) - 28);
    const rh = shape.rectHeight !== undefined ? shape.rectHeight : ((shape.height || 100) - 28);
    extraAttrs += ` data-shape-type="rectangle" x="${rx}" y="${ry}" width="${rw}" height="${rh}"`;
  } else if (shape.shapeType === 'ellipse') {
    extraAttrs += ' data-shape-type="ellipse"';
  } else {
    extraAttrs += ` data-shape-type="${shape.shapeType || 'vector-path'}"`;
  }

  if (shape.tl !== undefined) {
    const rx = shape.x !== undefined ? shape.x : 10;
    const ry = shape.y !== undefined ? shape.y : 10;
    const rw = shape.rectWidth !== undefined ? shape.rectWidth : 80;
    const rh = shape.rectHeight !== undefined ? shape.rectHeight : 80;
    const isLinked = shape.cornerLinked !== undefined ? String(shape.cornerLinked) : 'false';
    extraAttrs += ` x="${rx}" y="${ry}" width="${rw}" height="${rh}" data-tl="${shape.tl}" data-tr="${shape.tr || 0}" data-bl="${shape.bl || 0}" data-br="${shape.br || 0}" data-corner-linked="${isLinked}" rx="${Math.max(shape.tl, shape.tr || 0, shape.bl || 0, shape.br || 0)}"`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${shape.viewBox || '0 0 100 100'}" width="${shape.width || 100}" height="${shape.height || 100}">
  <path d="${shape.d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${joinAttr}${capAttr}${miterAttr}${fillRuleAttr}${extraAttrs} />
</svg>`;
};

/**
 * Array of all 20 Vector Shapes defined entirely as pure JavaScript code.
 */
export const SHAPES_DATA = [
  {
    id: 'true-circle',
    name: 'Circle',
    shapeType: 'vector-path',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    x: 10,
    y: 10,
    rectWidth: 80,
    rectHeight: 80,
    tl: 40,
    tr: 40,
    bl: 40,
    br: 40,
    cornerLinked: true,
    cx: 50,
    cy: 50,
    rx: 50,
    d: 'M 50 10 A 40 40 0 1 0 50 90 A 40 40 0 1 0 50 10 Z',
    fill: '#ffefefff',
    stroke: '#e32914ff',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  },
  {
    id: 'squircle-superellipse',
    name: 'Squircle',
    shapeType: 'vector-path',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    x: 10,
    y: 10,
    rectWidth: 80,
    rectHeight: 80,
    tl: 25,
    tr: 25,
    bl: 25,
    br: 25,
    cornerLinked: true,
    cx: 50,
    cy: 50,
    rx: 50,
    d: 'M 50 10 C 78 10 90 22 90 50 C 90 78 78 90 50 90 C 22 90 10 78 10 50 C 10 22 22 10 50 10 Z',
    fill: '#faf0e7ff',
    stroke: '#ca480cff',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  },
  {
    id: 'rounded-diamond',
    name: 'Diamond',
    shapeType: 'polygon',
    count: 4,
    radius: 0,
    cx: 50,
    cy: 50,
    rx: 40,
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 50 10 L 90 50 L 50 90 L 10 50 Z',
    fill: '#fdf9ddff',
    stroke: '#baae0eff',
    strokeWidth: '2.5',
    strokeLinejoin: 'miter',
    strokeLinecap: 'square',
    strokeMiterlimit: '4',
    fillRule: 'evenodd'
  },
  {
    id: 'sharp-hexagon',
    name: 'Hexagon',
    shapeType: 'polygon',
    count: 6,
    radius: 0,
    cx: 50,
    cy: 50,
    rx: 50,
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 90.0 50.0 L 70.0 84.6 L 30.0 84.6 L 10.0 50.0 L 30.0 15.4 L 70.0 15.4 Z',
    fill: '#f0f9dfff',
    stroke: '#87a402ff',
    strokeWidth: '2.5',
    strokeLinejoin: 'miter',
    strokeLinecap: 'square',
    strokeMiterlimit: '4',
    fillRule: 'evenodd'
  },
  {
    id: 'sharp-triangle',
    name: 'Triangle',
    shapeType: 'polygon',
    count: 3,
    radius: 0,
    cx: 50,
    cy: 50,
    rx: 50,
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 50 12 L 85 78 L 15 78 Z',
    fill: '#daf8d5ff',
    stroke: '#07b424ff',
    strokeWidth: '2.5',
    strokeLinejoin: 'miter',
    strokeLinecap: 'square',
    strokeMiterlimit: '4',
    fillRule: 'evenodd'
  },
  {
    id: 'chubby-5-point-star',
    name: 'Star',
    shapeType: 'star',
    count: 5,
    ratio: 40,
    radius: 0,
    cx: 50,
    cy: 50,
    rx: 50,
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 50 8 L 60 36 L 90 37 L 66 55 L 75 84 L 50 67 L 25 84 L 34 55 L 10 37 L 40 36 Z',
    fill: '#d1f8f4ff',
    stroke: '#0cc2a7ff',
    strokeWidth: '2.5',
    strokeLinejoin: 'miter',
    strokeLinecap: 'square',
    strokeMiterlimit: '4',
    fillRule: 'evenodd'
  },
  {
    id: '4-point-sparkle',
    name: 'Sparkle',
    shapeType: 'star',
    count: 4,
    ratio: 40,
    radius: 0,
    cx: 50,
    cy: 50,
    rx: 50,
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 50 10 C 50 33 67 50 90 50 C 67 50 50 67 50 90 C 50 67 33 50 10 50 C 33 50 50 33 50 10 Z',
    fill: '#e1f7f8ff',
    stroke: '#0dbbc1ff',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  },
  {
    id: 'gemstone-jewel',
    name: 'Gem Stone',
    shapeType: 'vector-path',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    cx: 50,
    cy: 50,
    rx: 50,
    d: 'M 25 15 L 75 15 L 94 38 L 50 89 L 6 38 Z',
    fill: '#e0e6fcff',
    stroke: '#3730A3',
    strokeWidth: '2.5',
    strokeLinejoin: 'miter',
    strokeLinecap: 'square',
    strokeMiterlimit: '4',
    fillRule: 'evenodd'
  },
  {
    id: '8-point-spiky-starburst',
    name: 'Starburst',
    shapeType: 'star',
    count: 8,
    ratio: 40,
    radius: 0,
    cx: 50,
    cy: 50,
    rx: 50,
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 50.0 6.0 Q 58.8 28.8 81.1 18.9 Q 71.2 41.2 94.0 50.0 Q 71.2 58.8 81.1 81.1 Q 58.8 71.2 50.0 94.0 Q 41.2 71.2 18.9 81.1 Q 28.8 58.8 6.0 50.0 Q 28.8 41.2 18.9 18.9 Q 41.2 28.8 50.0 6.0 Z',
    fill: '#f0e1fbff',
    stroke: '#640bbdff',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  },
  {
    id: 'stadium-pill-capsule',
    name: 'Capsule',
    shapeType: 'vector-path',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    x: 32,
    y: 14,
    rectWidth: 36,
    rectHeight: 72,
    tl: 18,
    tr: 18,
    bl: 18,
    br: 18,
    cornerLinked: true,
    cx: 50,
    cy: 50,
    rx: 50,
    d: 'M 32 32 A 18 18 0 0 1 68 32 L 68 68 A 18 18 0 0 1 32 68 Z',
    fill: '#fde6ffff',
    stroke: '#b40cc4ff',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  },
  {
    id: 'arch-tombstone',
    name: 'Arch',
    shapeType: 'vector-path',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    x: 20,
    y: 16,
    rectWidth: 60,
    rectHeight: 72,
    tl: 30,
    tr: 30,
    bl: 0,
    br: 0,
    cornerLinked: false,
    cx: 50,
    cy: 50,
    rx: 50,
    d: 'M 20 88 L 20 46 A 30 30 0 0 1 80 46 L 80 88 Z',
    fill: '#fcecf5ff',
    stroke: '#ce228cff',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  },
  {
    id: 'diagonal-leaf',
    name: 'Leaf',
    shapeType: 'vector-path',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    x: 15,
    y: 15,
    rectWidth: 70,
    rectHeight: 70,
    tl: 0,
    tr: 70,
    bl: 70,
    br: 0,
    cornerLinked: false,
    cx: 50,
    cy: 50,
    rx: 50,
    d: 'M 15 15 C 68 15 85 32 85 85 C 32 85 15 68 15 15 Z',
    fill: '#e8fbefff',
    stroke: '#166534',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  },
  {
    id: 'reverse-curved-petal',
    name: 'Reverse Leaf',
    shapeType: 'vector-path',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    x: 15,
    y: 15,
    rectWidth: 70,
    rectHeight: 70,
    tl: 70,
    tr: 0,
    bl: 0,
    br: 70,
    cornerLinked: false,
    cx: 50,
    cy: 50,
    rx: 50,
    d: 'M 85 15 C 85 68 68 85 15 85 C 15 32 32 15 85 15 Z',
    fill: '#e2fafdff',
    stroke: '#0E7490',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  },
  {
    id: '6-point-star',
    name: 'Star',
    shapeType: 'star',
    count: 6,
    ratio: 40,
    radius: 0,
    cx: 50,
    cy: 50,
    rx: 50,
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 50.0 6.0 Q 62.5 28.3 88.1 28.0 Q 75.0 50.0 88.1 72.0 Q 62.5 71.7 50.0 94.0 Q 37.5 71.7 11.9 72.0 Q 25.0 50.0 11.9 28.0 Q 37.5 28.3 50.0 6.0 Z',
    fill: '#f2fee4ff',
    stroke: '#8cb409ff',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  },
  {
    id: 'reuleaux-triangle',
    name: 'ReuleauxTriangle',
    shapeType: 'vector-path',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    cx: 50,
    cy: 50,
    rx: 50,
    d: 'M 50 10 A 78 78 0 0 1 88 76 A 78 78 0 0 1 12 76 A 78 78 0 0 1 50 10 Z',
    fill: '#ecf5ffff',
    stroke: '#334155',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  },
  {
    id: 'sharp-pentagon',
    name: 'Pentagon',
    shapeType: 'polygon',
    count: 5,
    radius: 0,
    cx: 50,
    cy: 50,
    rx: 50,
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 50.0 10.0 L 88.0 37.6 L 73.5 82.4 L 26.5 82.4 L 12.0 37.6 Z',
    fill: '#fff3e2ff',
    stroke: '#cd8e05ff',
    strokeWidth: '2.5',
    strokeLinejoin: 'miter',
    strokeLinecap: 'square',
    strokeMiterlimit: '4',
    fillRule: 'evenodd'
  },
  {
    id: 'sharp-octagon',
    name: 'Octagon',
    shapeType: 'polygon',
    count: 8,
    radius: 0,
    cx: 50,
    cy: 50,
    rx: 50,
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 65.3 13.0 L 87.0 34.7 L 87.0 65.3 L 65.3 87.0 L 34.7 87.0 L 13.0 65.3 L 13.0 34.7 L 34.7 13.0 Z',
    fill: '#fde1e1ff',
    stroke: '#B91C1C',
    strokeWidth: '2.5',
    strokeLinejoin: 'miter',
    strokeLinecap: 'square',
    strokeMiterlimit: '4',
    fillRule: 'evenodd'
  },
  {
    id: 'swallowtail-ribbon-banner',
    name: 'Ribbon Banner',
    shapeType: 'vector-path',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    cx: 50,
    cy: 50,
    rx: 50,
    d: 'M 10 24 H 90 L 80 50 L 90 76 H 10 L 20 50 Z',
    fill: '#fbe8ffff',
    stroke: '#bb0ecbff',
    strokeWidth: '2.5',
    strokeLinejoin: 'miter',
    strokeLinecap: 'square',
    strokeMiterlimit: '4',
    fillRule: 'evenodd'
  },
  {
    id: 'gingko-fan-leaf',
    name: 'Gingko Fan Leaf',
    shapeType: 'vector-path',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    cx: 50,
    cy: 50,
    rx: 50,
    d: 'M 50 92 C 48 68 30 46 12 36 C 26 12 74 12 88 36 C 70 46 52 68 50 92 Z',
    fill: '#e4f7fbff',
    stroke: '#0f9cb5ff',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  },
  {
    id: 'sharp-square',
    name: 'Square',
    shapeType: 'polygon',
    count: 4,
    radius: 0,
    cx: 50,
    cy: 50,
    rx: 50.91,
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 14 14 L 86 14 L 86 86 L 14 86 Z',
    fill: '#fdedf5ff',
    stroke: '#7e0e48ff',
    strokeWidth: '2.5',
    strokeLinejoin: 'miter',
    strokeLinecap: 'square',
    strokeMiterlimit: '4',
    fillRule: 'evenodd'
  },
  {
    id: 'star-fish',
    name: 'Star Fish',
    shapeType: 'star',
    count: 5,
    ratio: 20,
    radius: 25,
    angle: 25,
    cx: 50,
    cy: 50,
    rx: 42,
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 61.6 28.4 Q 73.5 15.2, 65.7 31.2 L 65.7 31.2 Q 57.9 47.1, 74.1 54.4 L 74.1 54.4 Q 90.4 61.6, 72.8 59.1 L 72.8 59.1 Q 55.2 56.6, 53.3 74.3 L 53.3 74.3 Q 51.5 92.0, 48.4 74.5 L 48.4 74.5 Q 45.3 57.0, 27.9 60.7 L 27.9 60.7 Q 10.5 64.4, 26.2 56.0 L 26.2 56.0 Q 41.9 47.7, 33.0 32.3 L 33.0 32.3 Q 24.1 16.9, 36.9 29.3 L 36.9 29.3 Q 49.7 41.6, 61.6 28.4 Z',
    fill: '#FFFFDF',
    stroke: '#FFFF00',
    strokeWidth: '2.5',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fillRule: 'evenodd'
  }
].map(shape => ({
  ...shape,
  svgContent: generateShapeSvg(shape)
}));

/**
 * Get a shape by its ID or Name.
 * @param {string} idOrName - Shape ID or Name
 * @returns {Object|undefined}
 */
export const getShapeById = (idOrName) => {
  if (!idOrName) return undefined;
  const query = idOrName.toLowerCase().trim();
  return SHAPES_DATA.find(s => s.id === query || s.name.toLowerCase() === query);
};

/**
 * Parses shape SVG string and creates a positioned SVG element node.
 * Automatically injects shape parameters (star ratio, polygon sides, corner radius)
 * and centers the element at (cx, cy).
 */
export const createShapeSvgNode = (shapeData, cx, cy) => {
  if (!shapeData) return null;
  const svgContent = shapeData.svgContent || generateShapeSvg(shapeData);
  if (!svgContent) return null;

  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgRoot = parsedDoc.querySelector('svg');
  if (!svgRoot) return null;

  // Extract dimensions from viewBox or width/height
  let elW = 50;
  let elH = 50;
  const viewBox = svgRoot.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(parseFloat);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      elW = parts[2];
      elH = parts[3];
    }
  } else {
    const wAttr = parseFloat(svgRoot.getAttribute('width'));
    const hAttr = parseFloat(svgRoot.getAttribute('height'));
    if (!isNaN(wAttr) && wAttr > 0) elW = wAttr;
    if (!isNaN(hAttr) && hAttr > 0) elH = hAttr;
  }

  // Desired on-canvas size (~50x50 mm/units or scaled down if large)
  let scale = 1;
  const maxInitialSize = 60;
  if (elW > maxInitialSize || elH > maxInitialSize) {
    scale = maxInitialSize / Math.max(elW, elH);
  }

  const renderW = elW * scale;
  const renderH = elH * scale;

  const posX = Math.round(cx - renderW / 2);
  const posY = Math.round(cy - renderH / 2);

  const uniqueId = `shape-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id', uniqueId);
  g.setAttribute('transform', `translate(${posX}, ${posY}) scale(${scale.toFixed(4)})`);
  g.setAttribute('data-is-element-shape', 'true');
  g.setAttribute('data-type', 'shape');
  g.setAttribute('data-name', 'Shape');
  g.setAttribute('data-shape-title', shapeData.name || 'Shape');
  if (shapeData.id) {
    g.setAttribute('data-shape-id', shapeData.id);
  }
  if (shapeData.shapeType) {
    g.setAttribute('data-shape-type', shapeData.shapeType);
  }
  if (shapeData.tl !== undefined) {
    g.setAttribute('data-tl', String(shapeData.tl));
    g.setAttribute('data-tr', String(shapeData.tr || 0));
    g.setAttribute('data-bl', String(shapeData.bl || 0));
    g.setAttribute('data-br', String(shapeData.br || 0));
    g.setAttribute('data-corner-linked', shapeData.cornerLinked !== undefined ? String(shapeData.cornerLinked) : 'false');
    g.setAttribute('x', String(shapeData.x !== undefined ? shapeData.x : 10));
    g.setAttribute('y', String(shapeData.y !== undefined ? shapeData.y : 10));
    g.setAttribute('width', String(shapeData.rectWidth !== undefined ? shapeData.rectWidth : 80));
    g.setAttribute('height', String(shapeData.rectHeight !== undefined ? shapeData.rectHeight : 80));
    g.setAttribute('rx', String(Math.max(shapeData.tl, shapeData.tr || 0, shapeData.bl || 0, shapeData.br || 0)));
  }

  // Default styling: Clean fill and stroke matching shape definition
  const initialFill = shapeData.fill || '#d8e9feff';
  const initialStroke = shapeData.stroke || 'none';
  g.setAttribute('fill', initialFill);
  g.setAttribute('data-fill-color', initialFill);
  g.setAttribute('stroke', initialStroke);
  g.setAttribute('data-stroke-color', initialStroke);
  const initialSw = shapeData.strokeWidth !== undefined ? parseFloat(shapeData.strokeWidth) : 0;
  g.setAttribute('data-stroke-width', String(initialSw));
  g.setAttribute('stroke-width', String(initialSw * 2));
  g.setAttribute('data-stroke-position', 'Outside');
  g.setAttribute('paint-order', 'stroke fill');
  g.style.paintOrder = 'stroke fill';
  g.setAttribute('vector-effect', 'non-scaling-stroke');

  const initialLinecap = shapeData.strokeLinecap || 'square';
  const initialLinejoin = shapeData.strokeLinejoin || (initialLinecap === 'round' ? 'round' : 'miter');
  g.setAttribute('stroke-linecap', initialLinecap);
  g.setAttribute('stroke-linejoin', initialLinejoin);
  if (shapeData.strokeMiterlimit) {
    g.setAttribute('stroke-miterlimit', String(shapeData.strokeMiterlimit));
  }

  // Copy child shape attributes (like data-shape-type, data-count, etc.) up to g for RightSidebar inspection
  const primaryChild = svgRoot.querySelector('path, polygon, rect, circle, ellipse, line, g');
  if (primaryChild) {
    Array.from(primaryChild.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-') || ['x', 'y', 'width', 'height', 'rx', 'ry'].includes(attr.name)) {
        g.setAttribute(attr.name, attr.value);
      }
    });
  }

  // Ensure child elements inside do not have hardcoded stroke overriding g and preserve outside stroke paint-order
  Array.from(svgRoot.querySelectorAll('path, polygon, rect, circle, ellipse, line, polyline')).forEach((child) => {
    child.removeAttribute('stroke');
    child.removeAttribute('stroke-width');
    child.removeAttribute('stroke-linecap');
    child.removeAttribute('stroke-linejoin');
    child.setAttribute('fill', 'inherit');
    child.setAttribute('paint-order', 'stroke fill');
    child.style.paintOrder = 'stroke fill';
    child.setAttribute('vector-effect', 'non-scaling-stroke');
  });

  // Inject child SVG elements into the group
  g.innerHTML = svgRoot.innerHTML;
  const primaryInner = g.querySelector('path, polygon, rect, circle, ellipse, line, polyline');
  if (primaryInner && !primaryInner.getAttribute('id')) {
    primaryInner.setAttribute('id', `${uniqueId}-child`);
  }

  return g;
};

/**
 * Returns default corner radius geometry for the 6 corner-radius shapes.
 */
export const getShapeCornerDefaults = (id, title) => {
  const normId = (id || '').toLowerCase().trim();
  const normTitle = (title || '').toLowerCase().trim();
  if (normId === 'true-circle' || normTitle === 'circle') {
    return { tl: 40, tr: 40, bl: 40, br: 40, linked: true, x: 10, y: 10, w: 80, h: 80 };
  }
  if (normId === 'squircle-superellipse' || normTitle === 'squircle') {
    return { tl: 25, tr: 25, bl: 25, br: 25, linked: true, x: 10, y: 10, w: 80, h: 80 };
  }
  if (normId === 'stadium-pill-capsule' || normTitle === 'capsule') {
    return { tl: 18, tr: 18, bl: 18, br: 18, linked: true, x: 32, y: 14, w: 36, h: 72 };
  }
  if (normId === 'arch-tombstone' || normTitle === 'arch') {
    return { tl: 30, tr: 30, bl: 0, br: 0, linked: false, x: 20, y: 16, w: 60, h: 72 };
  }
  if (normId === 'diagonal-leaf' || normTitle === 'leaf') {
    return { tl: 0, tr: 70, bl: 70, br: 0, linked: false, x: 15, y: 15, w: 70, h: 70 };
  }
  if (normId === 'reverse-curved-petal' || normTitle === 'reverse leaf') {
    return { tl: 70, tr: 0, bl: 0, br: 70, linked: false, x: 15, y: 15, w: 70, h: 70 };
  }
  return null;
};

/**
 * Generates an SVG path data string for a 4-corner rounded shape (Circle, Squircle, Capsule, Arch, Leaf, Reverse Leaf).
 */
export const buildCornerRadiusPath = (x, y, w, h, tl, tr, br, bl) => {
  let scale = 1;
  const maxTop = (tl || 0) + (tr || 0);
  const maxBottom = (bl || 0) + (br || 0);
  const maxLeft = (tl || 0) + (bl || 0);
  const maxRight = (tr || 0) + (br || 0);
  if (maxTop > w && maxTop > 0) scale = Math.min(scale, w / maxTop);
  if (maxBottom > w && maxBottom > 0) scale = Math.min(scale, w / maxBottom);
  if (maxLeft > h && maxLeft > 0) scale = Math.min(scale, h / maxLeft);
  if (maxRight > h && maxRight > 0) scale = Math.min(scale, h / maxRight);

  const ctl = Math.max(0, (tl || 0) * scale);
  const ctr = Math.max(0, (tr || 0) * scale);
  const cbr = Math.max(0, (br || 0) * scale);
  const cbl = Math.max(0, (bl || 0) * scale);

  let d = `M ${(x + ctl).toFixed(2)} ${y.toFixed(2)}`;
  d += ` L ${(x + w - ctr).toFixed(2)} ${y.toFixed(2)}`;
  if (ctr > 0) {
    d += ` A ${ctr.toFixed(2)} ${ctr.toFixed(2)} 0 0 1 ${(x + w).toFixed(2)} ${(y + ctr).toFixed(2)}`;
  }
  d += ` L ${(x + w).toFixed(2)} ${(y + h - cbr).toFixed(2)}`;
  if (cbr > 0) {
    d += ` A ${cbr.toFixed(2)} ${cbr.toFixed(2)} 0 0 1 ${(x + w - cbr).toFixed(2)} ${(y + h).toFixed(2)}`;
  }
  d += ` L ${(x + cbl).toFixed(2)} ${(y + h).toFixed(2)}`;
  if (cbl > 0) {
    d += ` A ${cbl.toFixed(2)} ${cbl.toFixed(2)} 0 0 1 ${x.toFixed(2)} ${(y + h - cbl).toFixed(2)}`;
  }
  d += ` L ${x.toFixed(2)} ${(y + ctl).toFixed(2)}`;
  if (ctl > 0) {
    d += ` A ${ctl.toFixed(2)} ${ctl.toFixed(2)} 0 0 1 ${(x + ctl).toFixed(2)} ${y.toFixed(2)}`;
  }
  d += ' Z';
  return d;
};

export default SHAPES_DATA;
