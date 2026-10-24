
/**
 * Utility to convert raw SVG <text> elements to responsive, multi-line <foreignObject> elements
 * with computed CSS styles, font-families, line-heights, letter-spacing, and text alignments.
 */
export const convertTextToForeignObject = (el) => {
    if (!el || el.tagName.toLowerCase() !== 'text') return null;

    const bbox = el.getBBox();
    const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    fo.id = el.id;

    // Copy all attributes except positional/size/clip ones (we'll set those from bbox, and clip-path causes issues on resize)
    Array.from(el.attributes).forEach(attr => {
      if (!['x', 'y', 'width', 'height', 'clip-path'].includes(attr.name)) {
        fo.setAttribute(attr.name, attr.value);
      }
    });

    // ── Computed Style & Child Inspection (Figma / Vector-Studio Style) ─────────
    const comp = window.getComputedStyle(el);
    const tspans = Array.from(el.querySelectorAll('tspan'));
    const firstTspan = tspans.length > 0 ? tspans[0] : null;
    const tspanComp = firstTspan ? window.getComputedStyle(firstTspan) : null;

    // 1. Font Family Detection
    let rawFf = el.getAttribute('font-family') || el.style.fontFamily || el.getAttribute('data-font-family');
    if (!rawFf) {
      rawFf = firstTspan?.getAttribute('font-family') || firstTspan?.style.fontFamily;
    }
    if (!rawFf) {
      const compFf = comp.fontFamily;
      const tspanFf = tspanComp?.fontFamily;
      if (compFf && !compFf.includes('sans-serif')) rawFf = compFf;
      else if (tspanFf && !tspanFf.includes('sans-serif')) rawFf = tspanFf;
      else rawFf = compFf || tspanFf || 'Inter, sans-serif';
    }
    const cleanFontFamily = rawFf.replace(/['"]/g, '').split(',')[0].trim();

    // 2. Font Size Detection
    let rawFs = el.getAttribute('font-size') || el.style.fontSize || el.getAttribute('data-font-size');
    if (!rawFs) {
      rawFs = firstTspan?.getAttribute('font-size') || firstTspan?.style.fontSize;
    }
    if (!rawFs) {
      rawFs = comp.fontSize || tspanComp?.fontSize || '16px';
    }
    if (typeof rawFs === 'number' || /^[0-9.]+$/.test(rawFs)) {
      rawFs = `${rawFs}px`;
    }

    // 3. Font Weight Detection
    let rawFw = el.getAttribute('font-weight') || el.style.fontWeight;
    if (!rawFw) {
      rawFw = firstTspan?.getAttribute('font-weight') || firstTspan?.style.fontWeight;
    }
    if (!rawFw || rawFw === 'normal') {
      rawFw = comp.fontWeight || tspanComp?.fontWeight || '400';
    }
    if (rawFw === 'bold') rawFw = '700';
    else if (rawFw === 'normal') rawFw = '400';

    // 4. Font Style Detection
    const rawStyle = el.getAttribute('font-style') || el.style.fontStyle || firstTspan?.getAttribute('font-style') || comp.fontStyle || 'normal';

    // 5. Fill / Color Detection
    let rawFill = el.getAttribute('fill') || el.style.fill || firstTspan?.getAttribute('fill') || firstTspan?.style.fill;
    if (!rawFill || rawFill === 'none') {
      rawFill = (comp.fill && comp.fill !== 'none') ? comp.fill : ((tspanComp?.fill && tspanComp.fill !== 'none') ? tspanComp.fill : comp.color);
    }
    if (!rawFill || rawFill === 'none') rawFill = '#000000';

    // 6. Text Decoration Detection
    const rawDeco = el.getAttribute('text-decoration') || el.style.textDecoration || comp.textDecoration || 'none';

    // 7. Text Alignment: Preserve exact alignment from data-text-align, style.textAlign, SVG text-anchor, or template geometry
    const dataAlign = el.getAttribute('data-text-align') || el.getAttribute('data-align') || firstTspan?.getAttribute('data-text-align');
    
    // Check direct anchor on element, on first tspan, or on any tspan (DO NOT use computed style which defaults to 'start')
    let rawAnchor = el.getAttribute('text-anchor') || el.style?.textAnchor;
    if (!rawAnchor && firstTspan) {
      rawAnchor = firstTspan.getAttribute('text-anchor') || firstTspan.style?.textAnchor;
    }
    if (!rawAnchor) {
      const tspanWithAnchor = tspans.find(t => t.getAttribute('text-anchor') || (t.style && t.style.textAnchor));
      if (tspanWithAnchor) rawAnchor = tspanWithAnchor.getAttribute('text-anchor') || tspanWithAnchor.style?.textAnchor;
    }
    if (!rawAnchor) {
      const ancestorWithAnchor = el.closest('[text-anchor]');
      if (ancestorWithAnchor) rawAnchor = ancestorWithAnchor.getAttribute('text-anchor');
    }

    let rawAlign = el.style?.textAlign || el.getAttribute('text-align') || firstTspan?.style?.textAlign;

    let finalAlign = 'left';
    const normAnchor = String(rawAnchor || '').toLowerCase().trim();
    const normAlign = String(rawAlign || dataAlign || '').toLowerCase().trim();
    if (normAnchor === 'middle' || normAnchor === 'center' || normAlign === 'center' || normAlign === 'middle') {
      finalAlign = 'center';
    } else if (normAnchor === 'end' || normAnchor === 'right' || normAlign === 'right' || normAlign === 'end') {
      finalAlign = 'right';
    } else if (normAlign === 'justify') {
      finalAlign = 'justify';
    } else if (dataAlign && ['left', 'center', 'right', 'justify'].includes(dataAlign)) {
      finalAlign = dataAlign;
    } else if (rawAlign && ['left', 'center', 'right', 'justify'].includes(rawAlign)) {
      finalAlign = rawAlign;
    } else {
      // Multi-line tspan geometry analysis: detect centered/right lines in templates exported without text-anchor
      if (tspans.length > 1) {
        const linePositions = [];
        tspans.forEach(t => {
          const xAttr = t.getAttribute('x');
          if (xAttr !== null && xAttr !== '') {
            const lx = parseFloat(xAttr);
            let lw = 0;
            try {
              lw = t.getComputedTextLength ? t.getComputedTextLength() : (t.getBBox ? t.getBBox().width : 0);
            } catch (e) {}
            if (!isNaN(lx) && lw > 0) {
              linePositions.push({ startX: lx, width: lw, midX: lx + lw / 2, endX: lx + lw });
            }
          }
        });

        if (linePositions.length > 1) {
          const first = linePositions[0];
          const isCentered = linePositions.every(l => Math.abs(l.midX - first.midX) < 4);
          const isRight = linePositions.every(l => Math.abs(l.endX - first.endX) < 4);
          const isSameLeft = linePositions.every(l => Math.abs(l.startX - first.startX) < 4);

          if (isCentered && !isSameLeft) {
            finalAlign = 'center';
          } else if (isRight && !isSameLeft) {
            finalAlign = 'right';
          }
        }
      }

      // Container or page centering check for templates
      if (finalAlign === 'left') {
        const svgRoot = el.ownerSVGElement;
        const viewBox = svgRoot?.viewBox?.baseVal;
        const svgW = viewBox && viewBox.width > 0 ? viewBox.width : (parseFloat(svgRoot?.getAttribute('width')) || 0);
        const textMidX = bbox.x + bbox.width / 2;

        if (svgW > 0 && Math.abs(textMidX - (svgW / 2)) < 5) {
          finalAlign = 'center';
        } else {
          const parentGroup = el.parentElement;
          if (parentGroup && parentGroup.tagName.toLowerCase() !== 'svg') {
            const siblingRect = Array.from(parentGroup.children).find(c =>
              c !== el && (c.tagName.toLowerCase() === 'rect' || c.getAttribute('data-type') === 'shape')
            );
            if (siblingRect) {
              try {
                const sBBox = siblingRect.getBBox();
                const sMidX = sBBox.x + sBBox.width / 2;
                if (Math.abs(textMidX - sMidX) < 4 && bbox.width < sBBox.width * 0.95) {
                  finalAlign = 'center';
                }
              } catch (e) {}
            }
          }
        }
      }
    }

    fo.setAttribute('data-auto-wrap', 'true');
    fo.setAttribute('data-type', 'text');
    fo.setAttribute('x', bbox.x);
    fo.setAttribute('y', bbox.y);
    fo.setAttribute('width', Math.max(Math.ceil(bbox.width) + 2, 10));
    fo.setAttribute('height', Math.max(Math.ceil(bbox.height) + 2, 10));
    fo.setAttribute('overflow', 'visible');
    fo.setAttribute('data-text-align', finalAlign);

    // Preserve transform if any
    const transform = el.getAttribute('transform');
    if (transform) fo.setAttribute('transform', transform);

    const div = document.createElement('div');
    const isScrollable = el.getAttribute('data-scrollable') === 'true';
    div.style.width = '100%';
    div.style.minHeight = '100%';
    if (isScrollable) {
      div.style.overflowY = 'auto';
      div.style.overflowX = 'hidden';
    }
    div.style.color = rawFill;
    div.style.fontFamily = `'${cleanFontFamily}', sans-serif`;
    div.style.fontSize = rawFs;
    div.style.fontWeight = rawFw;
    div.style.fontStyle = rawStyle;
    div.style.textDecoration = rawDeco;
    div.style.textAlign = finalAlign;
    if (finalAlign === 'justify') {
      div.style.textAlignLast = 'left';
      div.style.textJustify = 'inter-word';
    }
    div.style.lineHeight = el.getAttribute('data-line-height') || '1.2';
    div.style.letterSpacing = el.style.letterSpacing || el.getAttribute('letter-spacing') || comp.letterSpacing || 'normal';
    div.style.wordSpacing = 'normal';
    div.style.wordBreak = 'normal';
    div.style.overflowWrap = 'break-word';

    // Auto-width for single-line text (point text), auto-height for paragraphs
    const defaultSizing = tspans.length > 1 ? 'auto-height' : 'auto-width';
    const sizingMode = el.getAttribute('data-sizing-mode') || defaultSizing;
    fo.setAttribute('data-sizing-mode', sizingMode);
    div.style.whiteSpace = sizingMode === 'auto-width' ? 'nowrap' : 'pre-wrap';
    div.style.padding = '0px';
    div.style.margin = '0';
    div.style.boxSizing = 'border-box';
    div.style.outline = 'none';
    div.style.background = 'transparent';
    div.style.userSelect = 'none';
    div.style.pointerEvents = 'none';

    if (!isScrollable) {
      div.style.display = 'block';
    }

    const escapeHtml = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };

    // Fast, natural tspan-to-lines reconstruction: preserve exact SVG line structure without layout thrashing
    if (tspans.length > 0) {
      let linesData = [];
      let currentLineTspans = [];
      let lastY = null;
      let lineHeights = [];

      const fontSize = parseFloat(rawFs) || 12;

      tspans.forEach((t, i) => {
        const y = t.getAttribute('y');
        const dy = t.getAttribute('dy');
        const isNewLine = i > 0 && (dy || (y !== null && lastY !== null && Math.abs(parseFloat(y) - parseFloat(lastY)) > 2));

        if (isNewLine) {
          let deltaY = null;
          if (dy) {
            if (dy.endsWith('em')) deltaY = parseFloat(dy) * fontSize;
            else deltaY = parseFloat(dy);
          } else if (y !== null && lastY !== null) {
            deltaY = Math.abs(parseFloat(y) - parseFloat(lastY));
          }
          if (deltaY !== null && !isNaN(deltaY) && deltaY > 0 && deltaY < fontSize * 3) {
            lineHeights.push(deltaY);
          }
          linesData.push(currentLineTspans);
          currentLineTspans = [];
        }
        currentLineTspans.push(t);
        if (y !== null) lastY = y;
      });
      if (currentLineTspans.length > 0) {
        linesData.push(currentLineTspans);
      }

      // Preserve exact line height from SVG baseline spacing
      if (!el.hasAttribute('data-line-height') && lineHeights.length > 0) {
        const avgPx = lineHeights.reduce((a, b) => a + b, 0) / lineHeights.length;
        div.style.lineHeight = `${avgPx.toFixed(2)}px`;
      }

      let htmlContent = '';
      for (let i = 0; i < linesData.length; i++) {
        const lineTspans = linesData[i];
        let lineText = '';
        lineTspans.forEach((t, idx) => {
          const str = t.textContent || '';
          if (idx > 0 && !lineText.endsWith(' ') && !str.startsWith(' ')) {
            lineText += ' ';
          }
          lineText += str;
        });
        htmlContent += (i > 0 ? '<br/>' : '') + escapeHtml(lineText);
      }
      div.innerHTML = htmlContent;
    } else {
      div.textContent = el.textContent || '';
    }

    fo.appendChild(div);
    return fo;
  };

  // ── Helper: set single selection and clear multi-selection ───────────────────
