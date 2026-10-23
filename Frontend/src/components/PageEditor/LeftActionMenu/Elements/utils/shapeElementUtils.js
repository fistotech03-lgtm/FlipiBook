/**
 * shapeElementUtils.js
 * Isolated utilities for SVG Element Shapes in FlipiBook
 */

export const isElementShape = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-is-element-shape') === 'true' ||
    el.getAttribute('data-shape-type') !== null ||
    (typeof el.querySelector === 'function' && el.querySelector('[data-is-element-shape="true"]') !== null)
  );
};

/**
 * Parses raw shape SVG string and creates a positioned SVG element node.
 * Automatically injects shape parameters (star ratio, polygon sides, corner radius)
 * and centers the element at (cx, cy).
 * Default stroke is strictly 'none' and stroke-width is '0' until user applies one.
 */
export const createShapeSvgNode = (shapeData, cx, cy) => {
  if (!shapeData || !shapeData.svgContent) return null;

  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(shapeData.svgContent, 'image/svg+xml');
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

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${posX}, ${posY}) scale(${scale.toFixed(4)})`);
  g.setAttribute('data-is-element-shape', 'true');
  g.setAttribute('data-type', 'shape');
  g.setAttribute('data-name', shapeData.name || 'Shape');

  // Default styling: Clean fill with NO stroke until user explicitly applies one
  g.setAttribute('fill', '#FBDCD7');
  g.setAttribute('stroke', 'none');
  g.setAttribute('stroke-width', '0');

  // Copy child shape attributes (like data-shape-type, data-count, etc.) up to g for RightSidebar inspection
  const primaryChild = svgRoot.querySelector('path, polygon, rect, circle, ellipse, line, g');
  if (primaryChild) {
    Array.from(primaryChild.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-')) {
        g.setAttribute(attr.name, attr.value);
      }
    });
  }

  // Ensure child elements inside do not have hardcoded stroke overriding g
  Array.from(svgRoot.querySelectorAll('path, polygon, rect, circle, ellipse, line, polyline')).forEach((child) => {
    child.removeAttribute('stroke');
    child.removeAttribute('stroke-width');
    child.setAttribute('fill', 'inherit');
  });

  // Inject child SVG elements into the group
  g.innerHTML = svgRoot.innerHTML;

  return g;
};
