/**
 * useElementAttributeSync.js
 * Hook providing central DOM attribute synchronization (fill, stroke, opacity,
 * gradients, filters, transform) and page background color updates.
 */

import { parseLayersFromSVG, syncGradient, syncFilters } from './svgFilterUtils';

export const useElementAttributeSync = ({ setPages, saveToHistory }) => {
    const updateElementAttribute = (pageIndex, elementId, attribute, value) => {
    saveToHistory();
    // Special case: ImageEditor serializes the whole SVG and passes it directly
    if (attribute === '__dom_sync__') {
      const safeParseSVG = (htmlStr) => {
        let safeStr = htmlStr;
        if (!safeStr.includes('xmlns:xlink=')) {
          safeStr = safeStr.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
        }
        const parser = new DOMParser();
        let doc = parser.parseFromString(safeStr, 'image/svg+xml');
        if (doc.querySelector('parsererror')) {
          console.warn("Strict XML parsing failed, falling back to HTML parsing for layers");
          doc = parser.parseFromString(safeStr, 'text/html');
        }
        return doc;
      };
      setPages(prev => {
        const updated = [...prev];
        const page = updated[pageIndex];
        if (!page) return updated;

        let newLayers = page.layers;
        if (value) {
          const doc = safeParseSVG(value);
          const svgEl = doc.querySelector('svg');
          if (svgEl) {
            newLayers = parseLayersFromSVG(svgEl);
          }
        }

        updated[pageIndex] = { ...page, html: value, layers: newLayers };
        return updated;
      });
      return;
    }
    setPages(prev => {
      const updated = [...prev];
      const page = updated[pageIndex];
      if (!page || !page.html) return prev;

      const parser = new DOMParser();
      let safeStr = page.html;
      if (!safeStr.includes('xmlns:xlink=')) safeStr = safeStr.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
      let doc = parser.parseFromString(safeStr, 'image/svg+xml');
      if (doc.querySelector('parsererror')) doc = parser.parseFromString(safeStr, 'text/html');
      let element = doc.getElementById(elementId);
      if (!element) {
        element = doc.querySelector(`[data-name="${elementId}"]`);
      }
      if (element) {
        const updates = (typeof attribute === 'object' && attribute !== null)
          ? Object.entries(attribute)
          : [[attribute, value]];

        // ── Pass 1: Write all attribute values onto the element first ──────────
        // This is critical for batch corner-radius updates: we must ensure every
        // data-tl/tr/bl/br and rx value is committed before any shape redraw
        // reads them, otherwise redraws triggered mid-loop see stale values.
        updates.forEach(([attr, val]) => {
          if (val === null || val === 'none' || val === '#') {
            if (attr === 'fill' || attr === 'stroke') {
              element.setAttribute(attr, 'none');
            } else {
              element.removeAttribute(attr);
            }
            if (attr === 'stroke-width') element.setAttribute('stroke', 'none');
            if (['stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit'].includes(attr) && element.tagName.toLowerCase() === 'g') {
              element.querySelectorAll('path, polygon, rect, circle, ellipse, line, polyline').forEach(c => c.removeAttribute(attr));
            }
          } else {
            if (attr === 'innerHTML' || attr === 'hotspotHtml') {
              element.innerHTML = val;
            } else {
              element.setAttribute(attr, val);

              if (element.tagName.toLowerCase() === 'g') {
                const innerShapes = element.querySelectorAll('path, polygon, rect, circle, ellipse, line, polyline');
                innerShapes.forEach(child => {
                  if ([
                    'data-shape-type', 'data-shape-id', 'data-count', 'data-ratio', 'data-radius',
                    'data-cx', 'data-cy', 'data-rx', 'rx', 'ry', 'data-tl', 'data-tr', 'data-bl', 'data-br',
                    'data-corner-linked', 'paint-order', 'data-stroke-position',
                    'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit'
                  ].includes(attr)) {
                    child.setAttribute(attr, val);
                    if (attr === 'paint-order') child.style.paintOrder = val;
                  }
                });
              }

              if ((attr === 'fill' || attr === 'stroke' || attr === 'stroke-width' || attr === 'stroke-dasharray') && element.getAttribute('data-type') === 'icon') {
                const children = element.querySelectorAll('*');
                children.forEach(c => {
                  const tag = c.tagName.toLowerCase();
                  if (['path', 'rect', 'circle', 'polygon', 'ellipse', 'line', 'polyline'].includes(tag)) {
                    if (tag === 'rect' && !c.hasAttribute('fill')) {
                      c.setAttribute('fill', 'none');
                    }
                    if (attr === 'fill' && c.hasAttribute('fill') && c.getAttribute('fill') !== 'none') {
                      c.setAttribute('fill', val);
                    }
                    if (attr === 'stroke' && c.hasAttribute('stroke') && c.getAttribute('stroke') !== 'none') {
                      c.setAttribute('stroke', val);
                    }
                    if (attr === 'stroke-width' && c.hasAttribute('stroke') && c.getAttribute('stroke') !== 'none') {
                      c.setAttribute('stroke-width', val);
                    }
                    if (attr === 'stroke-dasharray' && c.hasAttribute('stroke') && c.getAttribute('stroke') !== 'none') {
                      c.setAttribute('stroke-dasharray', val);
                    }
                  }
                });
              }
            }
            if (attr === 'stroke-width' && val !== '0' && (element.getAttribute('stroke') === 'none' || !element.getAttribute('stroke'))) {
              element.setAttribute('stroke', '#000000');
            }
          }
        });

        // ── Pass 2: Shape redraws — all attrs are now committed ───────────────
        // Track whether a rect has already been redrawn in this batch so we
        // don't emit multiple redundant path rewrites for the same element.
        let rectRedrawnThisBatch = false;

        updates.forEach(([attr, val]) => {
          if (val === null || val === 'none' || val === '#') return; // no redraw needed

          // --- DYNAMIC SHAPE REDRAW (FOR POLYGON/STAR/ROUNDED RECT/DIAMOND) ---
          const isRectCorner = ['data-tl', 'data-tr', 'data-bl', 'data-br'].includes(attr);
          if (attr === 'data-count' || attr === 'data-rx' || attr === 'data-ry' || attr === 'data-ratio' || attr === 'data-radius' || isRectCorner || attr === 'rx') {
            let targetShape = element;
            if (element.tagName.toLowerCase() === 'g') {
              const inner = element.querySelector('path, polygon, rect, circle, ellipse, line');
              if (inner) {
                targetShape = inner;
              }
            }
            let shapeType = targetShape.getAttribute('data-shape-type') || element.getAttribute('data-shape-type') || (targetShape.tagName.toLowerCase() === 'rect' ? 'rectangle' : null);
            if (!shapeType && (targetShape.getAttribute('data-is-element-shape') === 'true' || element.getAttribute('data-is-element-shape') === 'true')) {
              shapeType = 'rectangle';
            }

            const pathD = targetShape.getAttribute('d') || '';
            const isDiamond = shapeType === 'diamond' ||
              targetShape.getAttribute('data-shape-id') === 'rounded-diamond' ||
              element.getAttribute('data-shape-id') === 'rounded-diamond' ||
              (pathD && (pathD.includes('50 12') || pathD.includes('50 88') || pathD.includes('85 43') || pathD.includes('15 57') || pathD.includes('85 57')));

            if (isDiamond) {
              shapeType = 'diamond';
              if (targetShape.getAttribute('data-shape-type') !== 'diamond') {
                targetShape.setAttribute('data-shape-type', 'diamond');
              }
              if (element && element.getAttribute && element.getAttribute('data-shape-type') !== 'diamond') {
                element.setAttribute('data-shape-type', 'diamond');
              }
            }

            if (shapeType === 'polygon' || shapeType === 'star') {
              let cx = parseFloat(targetShape.getAttribute('data-cx') || element.getAttribute('data-cx') || 0);
              let cy = parseFloat(targetShape.getAttribute('data-cy') || element.getAttribute('data-cy') || 0);
              let rx = parseFloat(targetShape.getAttribute('data-rx') || element.getAttribute('data-rx') || 0);
              const count = parseInt(targetShape.getAttribute('data-count') || element.getAttribute('data-count') || (shapeType === 'polygon' ? 3 : 5));
              const cr = parseFloat(targetShape.getAttribute('data-radius') || element.getAttribute('data-radius') || 0);

              if (!cx && !cy) { cx = 50; cy = 50; }
              if (!rx || rx <= 0) { rx = 42; }

              targetShape.setAttribute('data-cx', cx.toString());
              targetShape.setAttribute('data-cy', cy.toString());
              targetShape.setAttribute('data-rx', rx.toString());
              if (element !== targetShape) {
                element.setAttribute('data-cx', cx.toString());
                element.setAttribute('data-cy', cy.toString());
                element.setAttribute('data-rx', rx.toString());
              }

              const pts = [];
              if (shapeType === 'polygon') {
                for (let i = 0; i < count; i++) {
                  const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
                  pts.push({ x: cx + rx * Math.cos(angle), y: cy + rx * Math.sin(angle) });
                }
              } else if (shapeType === 'star') {
                const ratio = parseFloat(targetShape.getAttribute('data-ratio') || element.getAttribute('data-ratio') || 40) / 100;
                const ri = rx * ratio;
                const sides = count * 2;
                for (let i = 0; i < sides; i++) {
                  const r = (i % 2 === 0) ? rx : ri;
                  const angle = (Math.PI / count) * i - Math.PI / 2;
                  pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
                }
              }

              if (cr > 0 && pts.length > 2) {
                let pathData = "";
                const cornerPoints = pts.map((curr, i) => {
                  const prev = pts[(i + pts.length - 1) % pts.length];
                  const next = pts[(i + 1) % pts.length];
                  const d1 = { x: curr.x - prev.x, y: curr.y - prev.y };
                  const d2 = { x: next.x - curr.x, y: next.y - curr.y };
                  const l1 = Math.hypot(d1.x, d1.y) || 1;
                  const l2 = Math.hypot(d2.x, d2.y) || 1;
                  const limit = Math.max(0, Math.min(cr, l1 / 2, l2 / 2));
                  return {
                    q: { x: curr.x, y: curr.y },
                    p1: { x: curr.x - (d1.x / l1) * limit, y: curr.y - (d1.y / l1) * limit },
                    p2: { x: curr.x + (d2.x / l2) * limit, y: curr.y + (d2.y / l2) * limit },
                    limit
                  };
                });
                cornerPoints.forEach((cp, i) => {
                  if (i === 0) pathData += `M ${cp.p1.x.toFixed(2)} ${cp.p1.y.toFixed(2)}`;
                  else pathData += ` L ${cp.p1.x.toFixed(2)} ${cp.p1.y.toFixed(2)}`;
                  if (cp.limit > 0) {
                    pathData += ` Q ${cp.q.x.toFixed(2)} ${cp.q.y.toFixed(2)}, ${cp.p2.x.toFixed(2)} ${cp.p2.y.toFixed(2)}`;
                  }
                });
                pathData += " Z";
                targetShape.setAttribute('d', pathData);
              } else {
                targetShape.setAttribute('d', `M ${pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L ')} Z`);
              }
              if (element !== targetShape && element.tagName.toLowerCase() !== 'g') {
                element.setAttribute('d', targetShape.getAttribute('d'));
              }
            }
            else if (shapeType === 'rectangle' && (isRectCorner || attr === 'rx') && !rectRedrawnThisBatch) {
              // All corner attrs are already written in Pass 1 — read them fresh.
              rectRedrawnThisBatch = true;
              let x = parseFloat(targetShape.getAttribute('x') || 0);
              let y = parseFloat(targetShape.getAttribute('y') || 0);
              let w = parseFloat(targetShape.getAttribute('width') || 0);
              let h = parseFloat(targetShape.getAttribute('height') || 0);
              const defR = parseFloat(targetShape.getAttribute('rx') || 0);

              if ((!w || !h) && typeof targetShape.getBBox === 'function') {
                try {
                  const bbox = targetShape.getBBox();
                  if (bbox && bbox.width > 0 && bbox.height > 0) {
                    x = bbox.x; y = bbox.y; w = bbox.width; h = bbox.height;
                  }
                } catch (e) {}
              }
              if (!w || !h) {
                const parentSvg = targetShape.closest('svg');
                if (parentSvg) {
                  const vb = parentSvg.getAttribute('viewBox');
                  if (vb) {
                    const parts = vb.split(/[ ,]+/).map(parseFloat);
                    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
                      x = parts[0] + 14;
                      y = parts[1] + 14;
                      w = parts[2] - 28;
                      h = parts[3] - 28;
                    }
                  }
                }
              }
              if (!w || !h) { x = 14; y = 14; w = 72; h = 72; }

              targetShape.setAttribute('x', x);
              targetShape.setAttribute('y', y);
              targetShape.setAttribute('width', w);
              targetShape.setAttribute('height', h);

              const maxR = Math.min(w / 2, h / 2);
              const parseR = (v, d) => (v !== null && v !== '') ? (isNaN(parseFloat(v)) ? 0 : parseFloat(v)) : d;
              const tl = Math.min(parseR(targetShape.getAttribute('data-tl') || element.getAttribute('data-tl'), defR), maxR);
              const tr = Math.min(parseR(targetShape.getAttribute('data-tr') || element.getAttribute('data-tr'), defR), maxR);
              const bl = Math.min(parseR(targetShape.getAttribute('data-bl') || element.getAttribute('data-bl'), defR), maxR);
              const br = Math.min(parseR(targetShape.getAttribute('data-br') || element.getAttribute('data-br'), defR), maxR);

              const d = `
                    M ${x + tl},${y}
                    L ${x + w - tr},${y}
                    A ${tr},${tr} 0 0 1 ${x + w},${y + tr}
                    L ${x + w},${y + h - br}
                    A ${br},${br} 0 0 1 ${x + w - br},${y + h}
                    L ${x + bl},${y + h}
                    A ${bl},${bl} 0 0 1 ${x},${y + h - bl}
                    L ${x},${y + tl}
                    A ${tl},${tl} 0 0 1 ${x + tl},${y}
                    Z
                 `.replace(/\s+/g, ' ').trim();

              if (targetShape.tagName.toLowerCase() === 'rect') {
                const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
                Array.from(targetShape.attributes).forEach(a => path.setAttribute(a.name, a.value));
                path.setAttribute('d', d);
                path.setAttribute('data-shape-type', 'rectangle');
                targetShape.parentNode.replaceChild(path, targetShape);
              } else {
                targetShape.setAttribute('d', d);
              }
            }
            else if (shapeType === 'diamond' && (isRectCorner || attr === 'rx') && !rectRedrawnThisBatch) {
              rectRedrawnThisBatch = true;
              let x = parseFloat(targetShape.getAttribute('x') || 0);
              let y = parseFloat(targetShape.getAttribute('y') || 0);
              let w = parseFloat(targetShape.getAttribute('width') || 0);
              let h = parseFloat(targetShape.getAttribute('height') || 0);
              const defR = parseFloat(targetShape.getAttribute('rx') || 0);

              if ((!w || !h) && typeof targetShape.getBBox === 'function') {
                try {
                  const bbox = targetShape.getBBox();
                  if (bbox && bbox.width > 0 && bbox.height > 0) {
                    x = bbox.x; y = bbox.y; w = bbox.width; h = bbox.height;
                  }
                } catch (e) {}
              }
              if (!w || !h) {
                const parentSvg = targetShape.closest('svg');
                if (parentSvg) {
                  const vb = parentSvg.getAttribute('viewBox');
                  if (vb) {
                    const parts = vb.split(/[ ,]+/).map(parseFloat);
                    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
                      x = parts[0] + 10;
                      y = parts[1] + 10;
                      w = parts[2] - 20;
                      h = parts[3] - 20;
                    }
                  }
                }
              }
              if (!w || !h) { x = 10; y = 10; w = 80; h = 80; }

              targetShape.setAttribute('x', x);
              targetShape.setAttribute('y', y);
              targetShape.setAttribute('width', w);
              targetShape.setAttribute('height', h);

              const parseR = (v, d) => (v !== null && v !== '') ? (isNaN(parseFloat(v)) ? 0 : parseFloat(v)) : d;
              const tl = parseR(targetShape.getAttribute('data-tl') || element.getAttribute('data-tl'), defR);
              const tr = parseR(targetShape.getAttribute('data-tr') || element.getAttribute('data-tr'), defR);
              const bl = parseR(targetShape.getAttribute('data-bl') || element.getAttribute('data-bl'), defR);
              const br = parseR(targetShape.getAttribute('data-br') || element.getAttribute('data-br'), defR);

              const cx = x + w / 2;
              const cy = y + h / 2;
              const pts = [
                { x: cx, y: y, r: tl },
                { x: x + w, y: cy, r: tr },
                { x: cx, y: y + h, r: br },
                { x: x, y: cy, r: bl }
              ];

              const cornerPoints = pts.map((curr, i) => {
                const prev = pts[(i + pts.length - 1) % pts.length];
                const next = pts[(i + 1) % pts.length];
                const d1 = { x: curr.x - prev.x, y: curr.y - prev.y };
                const d2 = { x: next.x - curr.x, y: next.y - curr.y };
                const l1 = Math.hypot(d1.x, d1.y) || 1;
                const l2 = Math.hypot(d2.x, d2.y) || 1;
                const limit = Math.max(0, Math.min(curr.r, l1 / 2, l2 / 2));
                return {
                  limit,
                  q: { x: curr.x, y: curr.y },
                  p1: { x: curr.x - (d1.x / l1) * limit, y: curr.y - (d1.y / l1) * limit },
                  p2: { x: curr.x + (d2.x / l2) * limit, y: curr.y + (d2.y / l2) * limit }
                };
              });

              let pathData = '';
              cornerPoints.forEach((cp, i) => {
                if (i === 0) pathData += `M ${cp.p1.x.toFixed(2)} ${cp.p1.y.toFixed(2)}`;
                else pathData += ` L ${cp.p1.x.toFixed(2)} ${cp.p1.y.toFixed(2)}`;
                if (cp.limit > 0) {
                  pathData += ` Q ${cp.q.x.toFixed(2)} ${cp.q.y.toFixed(2)}, ${cp.p2.x.toFixed(2)} ${cp.p2.y.toFixed(2)}`;
                }
              });
              pathData += ' Z';

              targetShape.setAttribute('d', pathData);
            }
          }
        });

        // --- GRADIENT SYNC ---
        const checkGrad = (attr) => attr.startsWith('fill') || attr.startsWith('stroke') || attr.includes('-stops') || attr.includes('-gradient-type') || attr.includes('-type') || attr.includes('stroke-') || attr.includes('data-fill-color') || attr.includes('data-stroke-color');
        const hasGradRelated = typeof attribute === 'object' && attribute !== null
          ? Object.keys(attribute).some(checkGrad)
          : checkGrad(attribute);

        if (hasGradRelated) {
          const hasFillGrad = typeof attribute === 'object' && attribute !== null
            ? Object.keys(attribute).some(a => a.startsWith('fill') || a.includes('fill-') || a === 'data-fill-color')
            : (attribute.startsWith('fill') || attribute.includes('fill-') || attribute === 'data-fill-color');
          const hasStrokeGrad = typeof attribute === 'object' && attribute !== null
            ? Object.keys(attribute).some(a => a.startsWith('stroke') || a.includes('stroke-') || a === 'data-stroke-color')
            : (attribute.startsWith('stroke') || attribute.includes('stroke-') || attribute === 'data-stroke-color');

          if (hasFillGrad) {
            syncGradient(doc, element, 'fill');
          }
          if (hasStrokeGrad) {
            syncGradient(doc, element, 'stroke');
          }

          if (element.tagName.toLowerCase() === 'g') {
            const children = element.querySelectorAll('path, rect, circle, ellipse, polyline, polygon');
            children.forEach(child => {
              updates.forEach(([attr]) => {
                if (element.getAttribute('data-type') !== 'icon') {
                  if (attr === 'fill' || attr === 'stroke' || attr === 'stroke-width' || attr === 'stroke-dasharray' || attr === 'opacity') {
                    child.removeAttribute(attr);
                    if (child.style) child.style.removeProperty(attr);
                  }
                }
              });
              if (hasFillGrad) {
                child.removeAttribute('fill');
                if (child.style) child.style.removeProperty('fill');
              }
              if (hasStrokeGrad) {
                child.removeAttribute('stroke');
                if (child.style) child.style.removeProperty('stroke');
              }
            });
          }

          updates.forEach(([attr, val]) => {
            if (attr === 'stroke' && val !== 'none' && val !== '#') {
              const currentWidth = element.getAttribute('stroke-width');
              if (!currentWidth || currentWidth === '0') {
                element.setAttribute('stroke-width', '1');
              }
            }
          });
        }

        const hasEffectRelated = typeof attribute === 'object' && attribute !== null
          ? Object.keys(attribute).some(a => a.startsWith('data-effect-'))
          : attribute.startsWith('data-effect-');
        if (hasEffectRelated) {
          syncFilters(doc, element);
        }

        const serializer = new XMLSerializer();
        updated[pageIndex] = { ...page, html: serializer.serializeToString(doc.documentElement) };
      }
      return updated;
    });
  };

    const updatePageBackground = (pageIndex, color) => {
    saveToHistory();
    setPages(prev => {
      const updated = [...prev];
      const page = updated[pageIndex];
      if (page && page.html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(page.html, 'image/svg+xml');
        const overlay = doc.querySelector('[data-name="Overlay"]');
        if (overlay) {
          overlay.setAttribute('fill', color);
          page.html = new XMLSerializer().serializeToString(doc);
        }
        updated[pageIndex] = { ...page };
      }
      return updated;
    });
  };

  return {
    updateElementAttribute,
    updatePageBackground
  };
};
