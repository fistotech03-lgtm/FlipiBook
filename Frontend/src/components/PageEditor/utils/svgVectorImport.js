/**
 * svgVectorImport.js
 * Parses, sanitizes, and namespaces uploaded SVG files into clean inline vector
 * child nodes ready to be inserted into the PageEditor SVG canvas.
 */

const UNSAFE_TAGS = new Set(['script', 'foreignobject', 'iframe', 'object', 'embed']);

export const isSvgFile = (file) => {
  if (!file) return false;
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  return type === 'image/svg+xml' || name.endsWith('.svg');
};

const sanitizeNodeTree = (node) => {
  if (!node || node.nodeType !== 1) return;
  const tag = node.tagName.toLowerCase();
  if (UNSAFE_TAGS.has(tag)) {
    node.remove();
    return;
  }

  for (const attr of Array.from(node.attributes || [])) {
    const name = attr.name.toLowerCase();
    const val = (attr.value || '').trim().toLowerCase();
    if (name.startsWith('on')) {
      node.removeAttribute(attr.name);
      continue;
    }
    if ((name === 'href' || name === 'xlink:href' || name === 'src') && (val.startsWith('javascript:') || val.startsWith('data:text/html'))) {
      node.removeAttribute(attr.name);
    }
  }

  for (const child of Array.from(node.children || [])) {
    sanitizeNodeTree(child);
  }
};

const scopeSvgIdsAndClasses = (svgRoot, prefix) => {
  const idMap = new Map();
  svgRoot.querySelectorAll('[id]').forEach((el) => {
    const oldId = el.getAttribute('id');
    if (oldId) {
      const newId = `${prefix}_${oldId}`;
      idMap.set(oldId, newId);
      el.setAttribute('id', newId);
    }
  });

  if (idMap.size > 0) {
    const replaceUrlRefs = (str) => {
      if (!str || !str.includes('#')) return str;
      return str.replace(/url\(\s*['"]?#([^'")]+)['"]?\s*\)/g, (m, id) => {
        const mapped = idMap.get(id.trim());
        return mapped ? `url(#${mapped})` : m;
      });
    };

    const allNodes = [svgRoot, ...Array.from(svgRoot.querySelectorAll('*'))];
    allNodes.forEach((el) => {
      for (const attr of Array.from(el.attributes || [])) {
        const name = attr.name.toLowerCase();
        if (name === 'href' || name === 'xlink:href') {
          const val = (attr.value || '').trim();
          if (val.startsWith('#')) {
            const mapped = idMap.get(val.slice(1));
            if (mapped) el.setAttribute(attr.name, `#${mapped}`);
          }
        } else if (attr.value && attr.value.includes('url(')) {
          const updated = replaceUrlRefs(attr.value);
          if (updated !== attr.value) el.setAttribute(attr.name, updated);
        }
      }
    });
  }

  // Scope <style> class selectors to avoid cross-SVG CSS leakage on the same page
  const classMap = new Map();
  svgRoot.querySelectorAll('style').forEach((styleEl) => {
    let css = styleEl.textContent || '';
    css = css.replace(/\.([A-Za-z_-][A-Za-z0-9_-]*)/g, (_, cls) => {
      if (!classMap.has(cls)) classMap.set(cls, `${prefix}_${cls}`);
      return `.${classMap.get(cls)}`;
    });
    if (idMap.size > 0) {
      css = css.replace(/url\(\s*['"]?#([^'")]+)['"]?\s*\)/g, (m, id) => {
        const mapped = idMap.get(id.trim());
        return mapped ? `url(#${mapped})` : m;
      });
    }
    styleEl.textContent = css;
  });

  if (classMap.size > 0) {
    svgRoot.querySelectorAll('[class]').forEach((el) => {
      const nextClasses = (el.getAttribute('class') || '')
        .split(/\s+/)
        .filter(Boolean)
        .map((c) => classMap.get(c) || c)
        .join(' ');
      el.setAttribute('class', nextClasses);
    });
  }
};

const DEFS_CONTAINER_TAGS = new Set([
  'defs', 'clippath', 'pattern', 'mask', 'filter',
  'lineargradient', 'radialgradient', 'symbol', 'marker', 'style',
  'title', 'desc', 'metadata'
]);

const PRESENTATION_PROPS = new Set([
  'fill',
  'stroke',
  'stroke-width',
  'opacity',
  'fill-opacity',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'fill-rule',
  'clip-rule'
]);

const INHERITABLE_PROPS = [
  'fill',
  'stroke',
  'stroke-width',
  'fill-opacity',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'fill-rule'
];

const normalizeCssColor = (prop, val) => {
  if (!val) return val;
  const trimmed = val.trim();
  if (prop !== 'fill' && prop !== 'stroke') return trimmed;

  const shortHex = trimmed.match(/^#([0-9a-fA-F]{3})$/);
  if (shortHex) {
    const [r, g, b] = shortHex[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  const rgbMatch = trimmed.match(/^rgb\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    const toHex = (n) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, '0');
    return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
  }

  return trimmed;
};

const parseStyleDeclarations = (declText) => {
  const result = {};
  if (!declText) return result;
  for (const part of declText.split(';')) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = part.slice(0, colonIdx).trim().toLowerCase();
    if (!PRESENTATION_PROPS.has(prop)) continue;
    const rawVal = part.slice(colonIdx + 1).replace(/!important/gi, '').trim();
    if (rawVal) {
      result[prop] = normalizeCssColor(prop, rawVal);
    }
  }
  return result;
};

/**
 * Resolve `<style>` CSS rules and inline `style="..."` declarations into
 * SVG presentation attributes so RightSidebar reads true colors and edits
 * are never overridden by CSS specificity.
 */
const inlineSvgStylesToAttributes = (svgRoot) => {
  const styleNodes = Array.from(svgRoot.querySelectorAll('style'));
  const rules = [];

  for (const styleEl of styleNodes) {
    const cssText = (styleEl.textContent || '').replace(/\/\*[\s\S]*?\*\//g, '');
    const ruleRegex = /([^{}]+)\{([^{}]*)\}/g;
    let match;
    while ((match = ruleRegex.exec(cssText)) !== null) {
      const selectors = match[1].split(',').map((s) => s.trim()).filter(Boolean);
      const decls = parseStyleDeclarations(match[2]);
      if (Object.keys(decls).length === 0) continue;
      for (const sel of selectors) {
        rules.push({ sel, decls });
      }
    }
    styleEl.parentNode?.removeChild(styleEl);
  }

  const allElements = [svgRoot, ...Array.from(svgRoot.querySelectorAll('*'))];

  for (const { sel, decls } of rules) {
    let matched = [];
    try {
      matched = Array.from(svgRoot.querySelectorAll(sel));
    } catch {
      if (sel.startsWith('.')) {
        const cls = sel.slice(1);
        matched = allElements.filter((el) => {
          const c = el.getAttribute('class') || '';
          return c.split(/\s+/).includes(cls);
        });
      }
    }
    for (const el of matched) {
      for (const [prop, val] of Object.entries(decls)) {
        el.setAttribute(prop, val);
      }
    }
  }

  for (const el of allElements) {
    const inlineStyle = el.getAttribute('style');
    if (inlineStyle) {
      const decls = parseStyleDeclarations(inlineStyle);
      for (const [prop, val] of Object.entries(decls)) {
        el.setAttribute(prop, val);
      }
      el.removeAttribute('style');
    }
    for (const prop of ['fill', 'stroke']) {
      const existing = el.getAttribute(prop);
      if (existing) {
        el.setAttribute(prop, normalizeCssColor(prop, existing));
      }
    }
  }

  const propagate = (node, inherited) => {
    const tag = (node.tagName || '').toLowerCase();
    if (DEFS_CONTAINER_TAGS.has(tag)) return;

    const current = { ...inherited };
    for (const prop of INHERITABLE_PROPS) {
      const val = node.getAttribute?.(prop);
      if (val !== null && val !== undefined && val !== '') {
        current[prop] = val;
      }
    }

    if (tag === 'svg' || tag === 'g') {
      for (const child of Array.from(node.children || [])) {
        propagate(child, current);
      }
      if (tag === 'g') {
        for (const prop of INHERITABLE_PROPS) {
          node.removeAttribute(prop);
        }
      }
    } else {
      for (const prop of INHERITABLE_PROPS) {
        if (!node.hasAttribute(prop) && current[prop] !== undefined) {
          node.setAttribute(prop, current[prop]);
        }
      }
    }
  };

  propagate(svgRoot, {});
};

const fmtNum = (n) => {
  if (!Number.isFinite(n)) return '0';
  const rounded = Math.round(n * 10000) / 10000;
  return Object.is(rounded, -0) ? '0' : String(rounded);
};

const transformPoint = (m, x, y) => ({
  x: m.a * x + m.c * y + m.e,
  y: m.b * x + m.d * y + m.f
});

const parseSvgTransformMatrix = (transformStr) => {
  if (!transformStr || typeof DOMMatrix === 'undefined') {
    return typeof DOMMatrix !== 'undefined' ? new DOMMatrix() : { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, multiply: (o) => o };
  }
  try {
    return new DOMMatrix(transformStr);
  } catch {
    return new DOMMatrix();
  }
};

/**
 * Path-data tokenizer that understands compact arc flags: exporters write "a1 1 0 011 5" where the
 * large-arc and sweep flags are single digits with no separators ("01" = flags 0,1 then "1" = x).
 * A plain number regex reads "011" as 11 and shifts every following coordinate → broken shapes.
 */
const tokenizePathD = (d) => {
  const NUM = /^[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/;
  const out = [];
  let i = 0;
  let cmd = '';
  let argIdx = 0;
  const skip = () => { while (i < d.length && /[\s,]/.test(d[i])) i++; };
  while (true) {
    skip();
    if (i >= d.length) break;
    const ch = d[i];
    if (/[a-zA-Z]/.test(ch)) {
      cmd = ch.toUpperCase();
      out.push(ch);
      i++;
      argIdx = 0;
      continue;
    }
    // Arc: arguments 3 and 4 (0-based) of every 7 are single-digit flags
    if (cmd === 'A' && (argIdx % 7 === 3 || argIdx % 7 === 4) && (ch === '0' || ch === '1')) {
      out.push(ch);
      i++;
      argIdx++;
      continue;
    }
    const m = d.slice(i).match(NUM);
    if (!m) { i++; continue; } // skip junk
    out.push(m[0]);
    i += m[0].length;
    argIdx++;
  }
  return out.length ? out : null;
};

const transformPathD = (d, m) => {
  if (!d) return '';
  const tokens = tokenizePathD(d);
  if (!tokens) return d;

  let i = 0;
  let cmd = '';
  let curX = 0;
  let curY = 0;
  let startX = 0;
  let startY = 0;
  const out = [];

  const nextNum = () => parseFloat(tokens[i++]);
  const hasNum = () => i < tokens.length && !/^[a-zA-Z]$/.test(tokens[i]);

  const det = m.a * m.d - m.b * m.c;
  const sx = Math.hypot(m.a, m.b);
  const sy = Math.hypot(m.c, m.d);
  const rotDeg = (Math.atan2(m.b, m.a) * 180) / Math.PI;

  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) {
      cmd = tokens[i++];
    }
    const isRel = cmd === cmd.toLowerCase();
    const upper = cmd.toUpperCase();

    if (upper === 'Z') {
      out.push('Z');
      curX = startX;
      curY = startY;
      continue;
    }

    let firstInCmd = true;
    while (hasNum()) {
      const effectiveCmd = (upper === 'M' && !firstInCmd) ? (isRel ? 'l' : 'L') : cmd;
      const effUpper = effectiveCmd.toUpperCase();
      const effRel = effectiveCmd === effectiveCmd.toLowerCase();
      firstInCmd = false;

      if (effUpper === 'M' || effUpper === 'L' || effUpper === 'T') {
        const x = nextNum() + (effRel ? curX : 0);
        const y = nextNum() + (effRel ? curY : 0);
        const pt = transformPoint(m, x, y);
        out.push(`${effUpper} ${fmtNum(pt.x)} ${fmtNum(pt.y)}`);
        curX = x;
        curY = y;
        if (effUpper === 'M') {
          startX = x;
          startY = y;
        }
      } else if (effUpper === 'H') {
        const x = nextNum() + (effRel ? curX : 0);
        const pt = transformPoint(m, x, curY);
        out.push(`L ${fmtNum(pt.x)} ${fmtNum(pt.y)}`);
        curX = x;
      } else if (effUpper === 'V') {
        const y = nextNum() + (effRel ? curY : 0);
        const pt = transformPoint(m, curX, y);
        out.push(`L ${fmtNum(pt.x)} ${fmtNum(pt.y)}`);
        curY = y;
      } else if (effUpper === 'C') {
        const x1 = nextNum() + (effRel ? curX : 0);
        const y1 = nextNum() + (effRel ? curY : 0);
        const x2 = nextNum() + (effRel ? curX : 0);
        const y2 = nextNum() + (effRel ? curY : 0);
        const x = nextNum() + (effRel ? curX : 0);
        const y = nextNum() + (effRel ? curY : 0);
        const p1 = transformPoint(m, x1, y1);
        const p2 = transformPoint(m, x2, y2);
        const p = transformPoint(m, x, y);
        out.push(`C ${fmtNum(p1.x)} ${fmtNum(p1.y)} ${fmtNum(p2.x)} ${fmtNum(p2.y)} ${fmtNum(p.x)} ${fmtNum(p.y)}`);
        curX = x;
        curY = y;
      } else if (effUpper === 'S' || effUpper === 'Q') {
        const x1 = nextNum() + (effRel ? curX : 0);
        const y1 = nextNum() + (effRel ? curY : 0);
        const x = nextNum() + (effRel ? curX : 0);
        const y = nextNum() + (effRel ? curY : 0);
        const p1 = transformPoint(m, x1, y1);
        const p = transformPoint(m, x, y);
        out.push(`${effUpper} ${fmtNum(p1.x)} ${fmtNum(p1.y)} ${fmtNum(p.x)} ${fmtNum(p.y)}`);
        curX = x;
        curY = y;
      } else if (effUpper === 'A') {
        const rx = nextNum();
        const ry = nextNum();
        const xAxisRot = nextNum();
        const largeArc = nextNum();
        const sweep = nextNum();
        const x = nextNum() + (effRel ? curX : 0);
        const y = nextNum() + (effRel ? curY : 0);
        const p = transformPoint(m, x, y);
        const newSweep = det < 0 ? (sweep ? 0 : 1) : sweep;
        out.push(`A ${fmtNum(rx * sx)} ${fmtNum(ry * sy)} ${fmtNum(xAxisRot + rotDeg)} ${largeArc} ${newSweep} ${fmtNum(p.x)} ${fmtNum(p.y)}`);
        curX = x;
        curY = y;
      } else {
        break;
      }
    }
  }

  return out.join(' ');
};

const bakeSvgTransformsToPageUnits = (svgRoot, vbX, vbY, scale) => {
  if (typeof DOMMatrix === 'undefined') return;
  const rootMatrix = new DOMMatrix().scale(scale, scale).translate(-vbX, -vbY);

  const matrixStr = (m) => `matrix(${fmtNum(m.a)} ${fmtNum(m.b)} ${fmtNum(m.c)} ${fmtNum(m.d)} ${fmtNum(m.e)} ${fmtNum(m.f)})`;

  const walk = (node, parentMatrix) => {
    const tag = (node.tagName || '').toLowerCase();

    // <defs> / <clipPath>: their shapes live in the same user space as the baked content, so they
    // must get the same scale / offset (otherwise clipping lands in the wrong place / size).
    if (tag === 'defs' || tag === 'clippath') {
      const own = node.getAttribute?.('transform');
      const m = own ? parentMatrix.multiply(parseSvgTransformMatrix(own)) : parentMatrix;
      if (own) node.removeAttribute('transform');
      for (const child of Array.from(node.children || [])) walk(child, m);
      return;
    }
    // userSpaceOnUse gradients: fold the bake matrix into gradientTransform
    if (tag === 'lineargradient' || tag === 'radialgradient') {
      if ((node.getAttribute('gradientUnits') || '').toLowerCase() === 'userspaceonuse') {
        const own = node.getAttribute('gradientTransform');
        const m = own ? parentMatrix.multiply(parseSvgTransformMatrix(own)) : parentMatrix;
        node.setAttribute('gradientTransform', matrixStr(m));
      }
      return;
    }
    if (DEFS_CONTAINER_TAGS.has(tag)) return;

    const localStr = node.getAttribute?.('transform');
    const nodeMatrix = localStr
      ? parentMatrix.multiply(parseSvgTransformMatrix(localStr))
      : parentMatrix;

    if (localStr) {
      node.removeAttribute('transform');
    }

    if (tag === 'svg' || tag === 'g') {
      for (const child of Array.from(node.children || [])) {
        walk(child, nodeMatrix);
      }
      return;
    }

    const avgScale = (Math.hypot(nodeMatrix.a, nodeMatrix.b) + Math.hypot(nodeMatrix.c, nodeMatrix.d)) / 2;
    const sw = node.getAttribute('stroke-width');
    if (sw && !Number.isNaN(parseFloat(sw))) {
      node.setAttribute('stroke-width', fmtNum(parseFloat(sw) * avgScale));
    }

    const hasRotationOrSkew = Math.abs(nodeMatrix.b) > 1e-6 || Math.abs(nodeMatrix.c) > 1e-6;

    if (tag === 'path') {
      const d = node.getAttribute('d');
      if (d) node.setAttribute('d', transformPathD(d, nodeMatrix));
    } else if (tag === 'line') {
      const x1 = parseFloat(node.getAttribute('x1') || '0');
      const y1 = parseFloat(node.getAttribute('y1') || '0');
      const x2 = parseFloat(node.getAttribute('x2') || '0');
      const y2 = parseFloat(node.getAttribute('y2') || '0');
      const p1 = transformPoint(nodeMatrix, x1, y1);
      const p2 = transformPoint(nodeMatrix, x2, y2);
      node.setAttribute('x1', fmtNum(p1.x));
      node.setAttribute('y1', fmtNum(p1.y));
      node.setAttribute('x2', fmtNum(p2.x));
      node.setAttribute('y2', fmtNum(p2.y));
    } else if (tag === 'polygon' || tag === 'polyline') {
      const ptsStr = node.getAttribute('points') || '';
      const nums = ptsStr.trim().split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n));
      const newPts = [];
      for (let idx = 0; idx + 1 < nums.length; idx += 2) {
        const pt = transformPoint(nodeMatrix, nums[idx], nums[idx + 1]);
        newPts.push(`${fmtNum(pt.x)} ${fmtNum(pt.y)}`);
      }
      // Convert to an equivalent <path> so it can be edited with the Pen tool (node edit needs a path)
      if (newPts.length >= 2 && node.parentNode && node.ownerDocument) {
        const pathEl = node.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
        Array.from(node.attributes).forEach((a) => { if (a.name !== 'points') pathEl.setAttribute(a.name, a.value); });
        pathEl.setAttribute('d', `M ${newPts.join(' L ')}${tag === 'polygon' ? ' Z' : ''}`);
        node.parentNode.replaceChild(pathEl, node);
      } else {
        node.setAttribute('points', newPts.map((p) => p.replace(' ', ',')).join(' '));
      }
    } else if (tag === 'rect') {
      const x = parseFloat(node.getAttribute('x') || '0');
      const y = parseFloat(node.getAttribute('y') || '0');
      const w = parseFloat(node.getAttribute('width') || '0');
      const h = parseFloat(node.getAttribute('height') || '0');
      if (!hasRotationOrSkew) {
        const p0 = transformPoint(nodeMatrix, x, y);
        const p1 = transformPoint(nodeMatrix, x + w, y + h);
        node.setAttribute('x', fmtNum(Math.min(p0.x, p1.x)));
        node.setAttribute('y', fmtNum(Math.min(p0.y, p1.y)));
        node.setAttribute('width', fmtNum(Math.abs(p1.x - p0.x)));
        node.setAttribute('height', fmtNum(Math.abs(p1.y - p0.y)));
        const rx = node.getAttribute('rx');
        const ry = node.getAttribute('ry');
        if (rx) node.setAttribute('rx', fmtNum(parseFloat(rx) * Math.abs(nodeMatrix.a)));
        if (ry) node.setAttribute('ry', fmtNum(parseFloat(ry) * Math.abs(nodeMatrix.d)));
      } else {
        const pathEl = node.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
        for (const attr of Array.from(node.attributes)) {
          if (!['x', 'y', 'width', 'height', 'rx', 'ry'].includes(attr.name)) {
            pathEl.setAttribute(attr.name, attr.value);
          }
        }
        const rawD = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
        pathEl.setAttribute('d', transformPathD(rawD, nodeMatrix));
        node.parentNode?.replaceChild(pathEl, node);
      }
    } else if (tag === 'circle') {
      const cx = parseFloat(node.getAttribute('cx') || '0');
      const cy = parseFloat(node.getAttribute('cy') || '0');
      const r = parseFloat(node.getAttribute('r') || '0');
      const sx = Math.hypot(nodeMatrix.a, nodeMatrix.b);
      const sy = Math.hypot(nodeMatrix.c, nodeMatrix.d);
      const center = transformPoint(nodeMatrix, cx, cy);
      if (Math.abs(sx - sy) < 1e-4 && !hasRotationOrSkew) {
        node.setAttribute('cx', fmtNum(center.x));
        node.setAttribute('cy', fmtNum(center.y));
        node.setAttribute('r', fmtNum(r * sx));
      } else {
        const pathEl = node.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
        for (const attr of Array.from(node.attributes)) {
          if (!['cx', 'cy', 'r'].includes(attr.name)) {
            pathEl.setAttribute(attr.name, attr.value);
          }
        }
        const rawD = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
        pathEl.setAttribute('d', transformPathD(rawD, nodeMatrix));
        node.parentNode?.replaceChild(pathEl, node);
      }
    } else if (tag === 'ellipse') {
      const cx = parseFloat(node.getAttribute('cx') || '0');
      const cy = parseFloat(node.getAttribute('cy') || '0');
      const rx = parseFloat(node.getAttribute('rx') || '0');
      const ry = parseFloat(node.getAttribute('ry') || '0');
      const center = transformPoint(nodeMatrix, cx, cy);
      if (!hasRotationOrSkew) {
        node.setAttribute('cx', fmtNum(center.x));
        node.setAttribute('cy', fmtNum(center.y));
        node.setAttribute('rx', fmtNum(rx * Math.abs(nodeMatrix.a)));
        node.setAttribute('ry', fmtNum(ry * Math.abs(nodeMatrix.d)));
      } else {
        const pathEl = node.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
        for (const attr of Array.from(node.attributes)) {
          if (!['cx', 'cy', 'rx', 'ry'].includes(attr.name)) {
            pathEl.setAttribute(attr.name, attr.value);
          }
        }
        const rawD = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
        pathEl.setAttribute('d', transformPathD(rawD, nodeMatrix));
        node.parentNode?.replaceChild(pathEl, node);
      }
    } else if (tag !== 'path') {
      // image / text / use / anything without its own geometry baking: keep the full matrix as a
      // transform (its own transform was removed above, so without this it lost position & size)
      const isIdentity = nodeMatrix.a === 1 && nodeMatrix.b === 0 && nodeMatrix.c === 0 && nodeMatrix.d === 1 && nodeMatrix.e === 0 && nodeMatrix.f === 0;
      if (!isIdentity) node.setAttribute('transform', matrixStr(nodeMatrix));
    }
  };

  for (const child of Array.from(svgRoot.children || [])) {
    walk(child, rootMatrix);
  }
};

const assignEditableLayerIds = (svgRoot, prefix) => {
  let idx = 0;
  const walk = (parent) => {
    for (const child of Array.from(parent.children || [])) {
      const tag = (child.tagName || '').toLowerCase();
      if (DEFS_CONTAINER_TAGS.has(tag)) continue;

      idx += 1;
      if (tag === 'g') {
        const curId = child.getAttribute('id') || '';
        if (!curId.startsWith('group-')) {
          child.setAttribute('id', `group-${prefix}_${idx}`);
        }
        if (!child.getAttribute('data-type')) {
          child.setAttribute('data-type', 'group');
        }
        walk(child);
      } else {
        if (!child.getAttribute('id')) {
          child.setAttribute('id', `${prefix}_${tag}_${idx}`);
        }
      }
    }
  };
  walk(svgRoot);
};

export const parseAndSanitizeSvg = (svgText, prefix, maxDim = 80) => {
  if (!svgText || typeof svgText !== 'string') return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  if (doc.querySelector('parsererror')) return null;

  const svgRoot = doc.querySelector('svg');
  if (!svgRoot) return null;

  sanitizeNodeTree(svgRoot);
  scopeSvgIdsAndClasses(svgRoot, prefix);
  inlineSvgStylesToAttributes(svgRoot);
  assignEditableLayerIds(svgRoot, prefix);

  let vbX = 0;
  let vbY = 0;
  let vbW = 100;
  let vbH = 100;

  const viewBoxAttr = svgRoot.getAttribute('viewBox');
  if (viewBoxAttr) {
    const parts = viewBoxAttr.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => !isNaN(n)) && parts[2] > 0 && parts[3] > 0) {
      [vbX, vbY, vbW, vbH] = parts;
    }
  } else {
    const w = parseFloat(svgRoot.getAttribute('width'));
    const h = parseFloat(svgRoot.getAttribute('height'));
    if (!isNaN(w) && w > 0) vbW = w;
    if (!isNaN(h) && h > 0) vbH = h;
  }

  let displayWidth = maxDim;
  let displayHeight = (vbH / vbW) * displayWidth;
  if (displayHeight > maxDim) {
    displayHeight = maxDim;
    displayWidth = (vbW / vbH) * displayHeight;
  }
  const scale = displayWidth / vbW;

  bakeSvgTransformsToPageUnits(svgRoot, vbX, vbY, scale);

  const children = Array.from(svgRoot.childNodes).filter((n) => n.nodeType === 1);
  if (children.length === 0) return null;

  return { vbX, vbY, vbW, vbH, displayWidth, displayHeight, children };
};
