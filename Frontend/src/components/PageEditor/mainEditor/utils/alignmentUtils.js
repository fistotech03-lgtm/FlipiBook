import { getVisualBBox, getElementMatrix, matrixToTransform } from './geometryUtils';
import { isElementCropped } from '../../properties/Crop';
import { isElementCompletelyOutside } from './trimViewUtils';

/**
 * Calculates and applies professional vector-studio / Figma-style alignments
 * (left, center, right, top, middle, bottom, distribute horizontally, distribute vertically)
 * across SVG canvas layers.
 * 
 * - When 1 element is selected: aligns relative to the page viewBox / artboard.
 * - When 2+ elements are selected: aligns relative to the collective selection bounding box.
 * - Distribution evenly spaces objects or centers along horizontal/vertical axes.
 */
export const alignSelectedElements = (type, {
  activePageIndex,
  multiSelectedIds,
  selectedLayerId,
  updatePageHtml,
  saveModifiedPageHtml,
  drawMultiSelectionHighlight,
  drawOverlayHighlight,
  multiSelectedIdsRef,
  to = 'auto' // 'auto' | 'selection' | 'page'
}) => {
  const ids = multiSelectedIds && multiSelectedIds.size > 0
    ? Array.from(multiSelectedIds)
    : (selectedLayerId ? [selectedLayerId] : []);
  if (ids.length === 0) return;

  const svg = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"] svg`);
  if (!svg) return;

  const elements = ids.map(id => svg.querySelector(`[id="${id}"]`)).filter(Boolean);
  if (elements.length === 0) return;

  const getElBBox = (el) => {
    try {
      const vBox = getVisualBBox(el);
      const ctm = el.getScreenCTM();
      const svgCTMInv = svg.getScreenCTM()?.inverse();
      if (!ctm || !svgCTMInv) return null;

      const toSvgMatrix = svgCTMInv.multiply(ctm);
      const p1 = new DOMPoint(vBox.x, vBox.y).matrixTransform(toSvgMatrix);
      const p2 = new DOMPoint(vBox.x + vBox.width, vBox.y).matrixTransform(toSvgMatrix);
      const p3 = new DOMPoint(vBox.x + vBox.width, vBox.y + vBox.height).matrixTransform(toSvgMatrix);
      const p4 = new DOMPoint(vBox.x, vBox.y + vBox.height).matrixTransform(toSvgMatrix);

      const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
      const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
      const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
      const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

      return {
        minX, maxX, minY, maxY,
        width: Math.max(0, maxX - minX),
        height: Math.max(0, maxY - minY),
        midX: (minX + maxX) / 2,
        midY: (minY + maxY) / 2
      };
    } catch {
      return null;
    }
  };

  const elBBoxes = elements.map(el => ({ el, bbox: getElBBox(el) })).filter(item => item.bbox);
  if (elBBoxes.length === 0) return;

  // Page / Artboard bounds
  const vb = svg.viewBox?.baseVal;
  const vx = vb ? vb.x : 0;
  const vy = vb ? vb.y : 0;
  const vw = vb && vb.width > 0 ? vb.width : (parseFloat(svg.getAttribute('width')) || 210);
  const vh = vb && vb.height > 0 ? vb.height : (parseFloat(svg.getAttribute('height')) || 297);
  const pageBBox = {
    minX: vx,
    minY: vy,
    maxX: vx + vw,
    maxY: vy + vh,
    midX: vx + vw / 2,
    midY: vy + vh / 2,
    width: vw,
    height: vh
  };

  // Collective Selection bounds
  const selectionBBox = elBBoxes.reduce((acc, { bbox }) => ({
    minX: Math.min(acc.minX, bbox.minX),
    minY: Math.min(acc.minY, bbox.minY),
    maxX: Math.max(acc.maxX, bbox.maxX),
    maxY: Math.max(acc.maxY, bbox.maxY),
  }), {
    minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity
  });
  selectionBBox.width = Math.max(0, selectionBBox.maxX - selectionBBox.minX);
  selectionBBox.height = Math.max(0, selectionBBox.maxY - selectionBBox.minY);
  selectionBBox.midX = (selectionBBox.minX + selectionBBox.maxX) / 2;
  selectionBBox.midY = (selectionBBox.minY + selectionBBox.maxY) / 2;

  // Align target:
  // If explicitly 'page' or only 1 element selected, align to Page / Artboard.
  // If multiple elements selected and 'auto' or 'selection', align to selection bounds.
  const targetBBox = (to === 'page' || elBBoxes.length < 2) ? pageBBox : selectionBBox;

  const applyTranslation = (el, dx, dy) => {
    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return;
    try {
      const svgEl = el.ownerSVGElement || el.closest('svg');
      const svgCTMInv = svgEl.getScreenCTM().inverse();
      const parentScreenCTM = el.parentNode.getScreenCTM();
      const parentToUserCTM = svgCTMInv.multiply(parentScreenCTM);
      const invParentCTM = parentToUserCTM.inverse();

      const p0 = new DOMPoint(0, 0).matrixTransform(invParentCTM);
      const p1 = new DOMPoint(dx, dy).matrixTransform(invParentCTM);
      const localDx = p1.x - p0.x;
      const localDy = p1.y - p0.y;

      const tag = el.tagName.toLowerCase();
      const isText = tag === 'text' || el.getAttribute('data-type') === 'text';
      const isCropped = isElementCropped(el) || el.getAttribute('data-is-image-group') === 'true' || el.hasAttribute('data-crop-data');
      const hasTransform = el.getAttribute('transform');

      if (isText || isCropped || (hasTransform && hasTransform !== 'matrix(1 0 0 1 0 0)')) {
        const matrix = typeof getElementMatrix === 'function' ? getElementMatrix(el) : new DOMMatrix(el.getAttribute('transform') || '');
        const nextMatrix = new DOMMatrix().translate(localDx, localDy).multiply(matrix);
        if (typeof matrixToTransform === 'function') el.setAttribute('transform', matrixToTransform(nextMatrix));
      } else {
        if (tag === 'rect' || tag === 'foreignobject' || tag === 'image') {
          const currentX = parseFloat(el.getAttribute('x')) || 0;
          const currentY = parseFloat(el.getAttribute('y')) || 0;
          el.setAttribute('x', currentX + localDx);
          el.setAttribute('y', currentY + localDy);
        } else if (tag === 'circle' || tag === 'ellipse') {
          const currentCx = parseFloat(el.getAttribute('cx')) || 0;
          const currentCy = parseFloat(el.getAttribute('cy')) || 0;
          el.setAttribute('cx', currentCx + localDx);
          el.setAttribute('cy', currentCy + localDy);
        } else if (tag === 'line') {
          el.setAttribute('x1', (parseFloat(el.getAttribute('x1')) || 0) + localDx);
          el.setAttribute('y1', (parseFloat(el.getAttribute('y1')) || 0) + localDy);
          el.setAttribute('x2', (parseFloat(el.getAttribute('x2')) || 0) + localDx);
          el.setAttribute('y2', (parseFloat(el.getAttribute('y2')) || 0) + localDy);
        } else {
          const matrix = typeof getElementMatrix === 'function' ? getElementMatrix(el) : new DOMMatrix(el.getAttribute('transform') || '');
          const nextMatrix = new DOMMatrix().translate(localDx, localDy).multiply(matrix);
          if (typeof matrixToTransform === 'function') el.setAttribute('transform', matrixToTransform(nextMatrix));
        }
      }
    } catch { /* ignored */ }
  };

  if (type === 'distribute-h') {
    if (elBBoxes.length >= 3) {
      elBBoxes.sort((a, b) => a.bbox.minX - b.bbox.minX);
      const first = elBBoxes[0];
      const last = elBBoxes[elBBoxes.length - 1];

      const totalSpan = last.bbox.maxX - first.bbox.minX;
      const sumOfWidths = elBBoxes.reduce((sum, item) => sum + item.bbox.width, 0);
      const gap = (totalSpan - sumOfWidths) / (elBBoxes.length - 1);

      if (gap >= 0) {
        // Distribute spacing evenly between objects
        let currentX = first.bbox.minX + first.bbox.width + gap;
        for (let i = 1; i < elBBoxes.length - 1; i++) {
          const item = elBBoxes[i];
          const dx = currentX - item.bbox.minX;
          applyTranslation(item.el, dx, 0);
          currentX += item.bbox.width + gap;
        }
      } else {
        // If shapes overlap, distribute by centers evenly
        const centerStep = (last.bbox.midX - first.bbox.midX) / (elBBoxes.length - 1);
        for (let i = 1; i < elBBoxes.length - 1; i++) {
          const item = elBBoxes[i];
          const targetMidX = first.bbox.midX + i * centerStep;
          const dx = targetMidX - item.bbox.midX;
          applyTranslation(item.el, dx, 0);
        }
      }
    } else if (elBBoxes.length === 2) {
      // For 2 elements, center them symmetrically inside page or selection bounds
      const [first, second] = elBBoxes.slice().sort((a, b) => a.bbox.minX - b.bbox.minX);
      const totalW = first.bbox.width + second.bbox.width;
      const availableW = pageBBox.width;
      const gap = Math.max(20, (availableW - totalW) / 3);
      const targetFirstX = pageBBox.minX + gap;
      const targetSecondX = targetFirstX + first.bbox.width + gap;
      applyTranslation(first.el, targetFirstX - first.bbox.minX, 0);
      applyTranslation(second.el, targetSecondX - second.bbox.minX, 0);
    }
  } else if (type === 'distribute-v') {
    if (elBBoxes.length >= 3) {
      elBBoxes.sort((a, b) => a.bbox.minY - b.bbox.minY);
      const first = elBBoxes[0];
      const last = elBBoxes[elBBoxes.length - 1];

      const totalSpan = last.bbox.maxY - first.bbox.minY;
      const sumOfHeights = elBBoxes.reduce((sum, item) => sum + item.bbox.height, 0);
      const gap = (totalSpan - sumOfHeights) / (elBBoxes.length - 1);

      if (gap >= 0) {
        // Distribute spacing evenly between objects
        let currentY = first.bbox.minY + first.bbox.height + gap;
        for (let i = 1; i < elBBoxes.length - 1; i++) {
          const item = elBBoxes[i];
          const dy = currentY - item.bbox.minY;
          applyTranslation(item.el, 0, dy);
          currentY += item.bbox.height + gap;
        }
      } else {
        // If shapes overlap, distribute by centers evenly
        const centerStep = (last.bbox.midY - first.bbox.midY) / (elBBoxes.length - 1);
        for (let i = 1; i < elBBoxes.length - 1; i++) {
          const item = elBBoxes[i];
          const targetMidY = first.bbox.midY + i * centerStep;
          const dy = targetMidY - item.bbox.midY;
          applyTranslation(item.el, 0, dy);
        }
      }
    } else if (elBBoxes.length === 2) {
      // For 2 elements, space them symmetrically vertically inside page
      const [first, second] = elBBoxes.slice().sort((a, b) => a.bbox.minY - b.bbox.minY);
      const totalH = first.bbox.height + second.bbox.height;
      const availableH = pageBBox.height;
      const gap = Math.max(20, (availableH - totalH) / 3);
      const targetFirstY = pageBBox.minY + gap;
      const targetSecondY = targetFirstY + first.bbox.height + gap;
      applyTranslation(first.el, 0, targetFirstY - first.bbox.minY);
      applyTranslation(second.el, 0, targetSecondY - second.bbox.minY);
    }
  } else {
    // Left, center, right, top, middle, bottom alignments
    elBBoxes.forEach(({ el, bbox }) => {
      let dx = 0, dy = 0;
      switch (type) {
        case 'left': dx = targetBBox.minX - bbox.minX; break;
        case 'center': dx = targetBBox.midX - bbox.midX; break;
        case 'right': dx = targetBBox.maxX - bbox.maxX; break;
        case 'top': dy = targetBBox.minY - bbox.minY; break;
        case 'middle': dy = targetBBox.midY - bbox.midY; break;
        case 'bottom': dy = targetBBox.maxY - bbox.maxY; break;
      }
      applyTranslation(el, dx, dy);
    });
  }

  // Update trim-outside attributes now that elements have been aligned
  elements.forEach(el => {
    if (isElementCompletelyOutside(el, svg)) {
      el.setAttribute('data-trim-outside', 'true');
    } else {
      el.removeAttribute('data-trim-outside');
    }
  });

  if (saveModifiedPageHtml) {
    saveModifiedPageHtml(activePageIndex, svg);
  } else if (updatePageHtml) {
    updatePageHtml(activePageIndex, svg.outerHTML);
  }

  // Update selection highlight after aligning elements so the blue box immediately snaps to the new positions
  if (multiSelectedIdsRef && multiSelectedIdsRef.current && multiSelectedIdsRef.current.size > 1) {
    if (typeof drawMultiSelectionHighlight === 'function') {
      drawMultiSelectionHighlight(multiSelectedIdsRef.current, 'selected');
    }
  } else if (elements.length > 0) {
    const el = elements[0];
    if (el && typeof drawOverlayHighlight === 'function') {
      drawOverlayHighlight(el, 'selected');
    }
  } else if (selectedLayerId) {
    const el = svg.querySelector(`[id="${CSS.escape(selectedLayerId)}"]`) || document.getElementById(selectedLayerId);
    if (el && typeof drawOverlayHighlight === 'function') {
      drawOverlayHighlight(el, 'selected');
    }
  }

  window.dispatchEvent(new CustomEvent('force-update-selection-box'));
};

