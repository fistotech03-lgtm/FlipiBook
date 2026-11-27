// Reusable color and gradient utilities

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

export const cssColorToHex = (c) => {
  if (!c) return '';
  const m = String(c).match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!m) return String(c).toUpperCase();
  return '#' + [m[1], m[2], m[3]].map(n => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase();
};

export const hexToRgb = (hex) => {
  if (!hex) return { r: 255, g: 255, b: 255, a: 1 };
  let normalized = hex.replace('#', '');
  if (normalized.length === 3 || normalized.length === 4) {
    normalized = normalized.split('').map(char => char + char).join('');
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(normalized);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: result[4] ? parseInt(result[4], 16) / 255 : 1
  } : { r: 255, g: 255, b: 255, a: 1 };
};

export const getColorAtOffset = (offset, stops) => {
  if (!stops || stops.length === 0) return '#FFFFFF';
  const sorted = [...stops].sort((a, b) => a.offset - b.offset);
  if (offset <= sorted[0].offset) return sorted[0].color;
  if (offset >= sorted[sorted.length - 1].offset) return sorted[sorted.length - 1].color;
  for (let i = 0; i < sorted.length - 1; i++) {
    const s1 = sorted[i]; const s2 = sorted[i + 1];
    if (offset >= s1.offset && offset <= s2.offset) {
      const ratio = (offset - s1.offset) / (s2.offset - s1.offset);
      const c1 = hexToRgb(s1.color); const c2 = hexToRgb(s2.color);
      const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
      const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
      const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
      return rgbToHex(r, g, b);
    }
  }
  return '#FFFFFF';
};

export const generateGradientString = (type, stops, angle = 0, radius = 100) => {
  if (!stops || stops.length < 2) return '';
  const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);

  const stopsStr = (scale = 100) => sortedStops.map(s => {
    const rgb = hexToRgb(s.color);
    const opacity = ((s.opacity || 100) / 100) * (rgb.a ?? 1);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity}) ${s.offset * (scale / 100)}%`;
  }).join(', ');

  switch (type) {
    case 'Radial':
      return `radial-gradient(circle at center, ${stopsStr(radius)})`;
    case 'Angular':
      return `conic-gradient(from ${angle}deg at center, ${stopsStr(100)})`;
    case 'Diamond': {
      const sStr = stopsStr(radius);
      return `
                linear-gradient(to top left, ${sStr}) 0 0/51% 51% no-repeat,
                linear-gradient(to top right, ${sStr}) 100% 0/51% 51% no-repeat,
                linear-gradient(to bottom left, ${sStr}) 0 100%/51% 51% no-repeat,
                linear-gradient(to bottom right, ${sStr}) 100% 100%/51% 51% no-repeat
            `.replace(/\s+/g, ' ').trim();
    }
    default:
      return `linear-gradient(${angle}deg, ${stopsStr(100)})`;
  }
};

export const solidPalette = [
  '#FFFFFF', '#000000', '#FF0000', '#FF4500', '#FFA500',
  '#FFFF00', '#008000', '#0000FF', '#8A2BE2', '#800080', '#C71585'
];

export const defaultGradientPresets = [
  ['#FFE2BB', '#FFBBC1'], ['#4DBA55', '#A2D357'], ['#FF0581', '#FFB5DC'],
  ['#7F073D', '#F967C8'], ['#ff3969', '#faccc5'], ['#FDBB2D', '#22C1C3'],
  ['#FFB0DC', '#DFCBFF'], ['#82ABFF', '#43D3DA'], ['#A5B4FC', '#E0E7FF'],
  ['#fa709a', '#D5A7FF'], ['#30cfd0', '#713EAE'], ['#a18cd1', '#fbc2eb'],
];

export const parseGradient = (gradientStr) => {
  if (!gradientStr || typeof gradientStr !== 'string' || !gradientStr.includes('gradient')) {
    return null;
  }

  const type = gradientStr.includes('radial') ? 'Radial' :
    gradientStr.includes('conic') ? 'Angular' :
      gradientStr.includes('linear-gradient(to top left') ? 'Diamond' : 'Linear';

  // For Diamond, we only want to parse the first gradient's stops
  const parseStr = type === 'Diamond' ? gradientStr.split('no-repeat,')[0] : gradientStr;

  // Extract stops
  const stops = [];
  // Match rgba? or hex colors
  const stopRegex = /(rgba?\([\d\s,.]+\)|#[0-9a-fA-F]{3,8})\s+([\d.]+)%/g;
  let match;
  while ((match = stopRegex.exec(parseStr)) !== null) {
    let colorStr = match[1];
    let opacity = 100;
    let hexColor = '#FFFFFF';

    if (colorStr.startsWith('#')) {
      hexColor = colorStr.substring(0, 7).toUpperCase(); // Extract base hex (ignore alpha if 8 chars)
      if (colorStr.length === 9) { // 8-char hex
        opacity = Math.round((parseInt(colorStr.substring(7, 9), 16) / 255) * 100);
      } else if (colorStr.length === 5) { // 4-char hex
        opacity = Math.round((parseInt(colorStr.substring(4, 5) + colorStr.substring(4, 5), 16) / 255) * 100);
      }
    } else {
      const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (rgbMatch) {
        hexColor = rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
        if (rgbMatch[4]) {
          opacity = Math.round(parseFloat(rgbMatch[4]) * 100);
        }
      }
    }

    stops.push({
      color: hexColor,
      offset: parseFloat(match[2]),
      opacity: opacity
    });
  }

  // Extract angle/radius
  let angle = 0;
  let radius = 100;

  if (type === 'Linear' || type === 'Angular') {
    const angleMatch = gradientStr.match(/(\d+)deg/);
    if (angleMatch) {
      angle = parseInt(angleMatch[1]);
    } else if (gradientStr.includes('to top')) {
      angle = 0;
    } else if (gradientStr.includes('to right')) {
      angle = 90;
    } else if (gradientStr.includes('to bottom')) {
      angle = 180;
    } else if (gradientStr.includes('to left')) {
      angle = 270;
    }
  } else if (type === 'Radial' || type === 'Diamond') {
    const maxPctMatch = [...gradientStr.matchAll(/([\d.]+)%/g)].map(m => parseFloat(m[1]));
    if (maxPctMatch.length > 0) {
      radius = Math.max(...maxPctMatch);
    }
    // Only unscale if we actually found a valid radius and stops exist
    if (radius > 0 && stops.length > 0) {
      const scale = radius / 100;
      stops.forEach(s => {
        s.offset = Math.min(100, Math.round(s.offset / scale));
      });
    }
  }

  return { type, stops: stops.length > 0 ? stops : null, angle, radius };
};

export const hexToHsv = (hex) => {
  if (!hex || hex === "transparent" || hex.includes("gradient")) return { h: 0, s: 0, v: 100 };
  let color = hex.toString();
  if (!color.startsWith("#")) return { h: 0, s: 0, v: 100 };
  color = color.substring(1);
  if (color.length === 3)
    color = color.split("").map((c) => c + c).join("");
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  let h = 0;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

export const hsvToHex = ({ h, s, v }) => {
  s /= 100; v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const handleLocalScrub = (e, initialVal, updateFn, sensitivity = 5) => {
  const sValue = parseFloat(initialVal) || 0;
  let accumulatedDelta = 0;
  let virtualX = e.clientX;
  let virtualY = e.clientY;

  document.body.classList.add('is-scrubbing');

  if (e.pointerId !== undefined) {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { }
  }

  const vCursor = document.createElement('div');
  vCursor.className = 'virtual-scrub-cursor';
  vCursor.style.left = `${virtualX}px`;
  vCursor.style.top = `${virtualY}px`;
  vCursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 15L21 12L18 9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 9L3 12L6 15" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 12H20" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 15L21 12L18 9" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 9L3 12L6 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 12H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  document.body.appendChild(vCursor);

  const onMouseMove = (moveEvent) => {
    const dx = moveEvent.movementX || 0;
    accumulatedDelta += dx;

    virtualX += dx;
    if (virtualX < 0) virtualX = window.innerWidth;
    if (virtualX > window.innerWidth) virtualX = 0;
    vCursor.style.left = `${virtualX}px`;

    const newVal = sValue + Math.round(accumulatedDelta / sensitivity);
    updateFn(newVal.toString());
  };

  const onMouseUp = (moveEvent) => {
    if (moveEvent.pointerId !== undefined) {
      try { moveEvent.target.releasePointerCapture(moveEvent.pointerId); } catch (e) { }
    }
    if (vCursor.parentNode) vCursor.parentNode.removeChild(vCursor);
    document.body.classList.remove('is-scrubbing');
    window.removeEventListener('pointermove', onMouseMove);
    window.removeEventListener('pointerup', onMouseUp);
  };

  window.addEventListener('pointermove', onMouseMove);
  window.addEventListener('pointerup', onMouseUp);
};

const _specialGradientCache = new Map();
const MAX_GRADIENT_CACHE = 64;

const normalizeStopRgba = (stop) => {
  const rawOp = (stop.opacity !== undefined && stop.opacity !== null) ? Number(stop.opacity) : 1;
  const alpha = Math.min(1, Math.max(0, rawOp > 1 ? rawOp / 100 : rawOp));
  const color = String(stop.color || '#000000').trim();
  if (color.startsWith('#')) {
    const { r, g, b, a } = hexToRgb(color);
    const finalA = (stop.opacity !== undefined && stop.opacity !== null) ? alpha : a;
    return `rgba(${r}, ${g}, ${b}, ${finalA})`;
  }
  const rgbMatch = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)/i);
  if (rgbMatch) {
    const baseA = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    const finalA = (stop.opacity !== undefined && stop.opacity !== null) ? alpha : baseA;
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${finalA})`;
  }
  return color;
};

/**
 * Rasterizes CSS 'angular' (conic-gradient) or 'diamond' gradients onto an offscreen canvas
 * and returns a PNG data URL for use inside SVG <pattern><image .../></pattern>.
 */
export const renderSpecialGradientDataUrl = ({
  type,
  stops = [],
  angle = 0,
  radius = 100,
  size = 256,
}) => {
  const normType = String(type || '').toLowerCase();
  if ((normType !== 'angular' && normType !== 'diamond') || !stops.length) return null;

  const sortedStops = [...stops].sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0));
  const numAngle = parseFloat(angle) || 0;
  const numRadius = parseFloat(radius) || 100;
  const cacheKey = `${normType}|${numAngle}|${numRadius}|${size}|${sortedStops.map(s => `${s.color}:${s.offset}:${s.opacity}`).join(',')}`;

  if (_specialGradientCache.has(cacheKey)) {
    return _specialGradientCache.get(cacheKey);
  }

  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const half = size / 2;

  if (normType === 'angular') {
    const startAngle = ((numAngle - 90) * Math.PI) / 180;
    if (typeof ctx.createConicGradient === 'function') {
      const grad = ctx.createConicGradient(startAngle, half, half);
      sortedStops.forEach((s) => {
        const offset = Math.min(1, Math.max(0, (parseFloat(s.offset) || 0) / 100));
        grad.addColorStop(offset, normalizeStopRgba(s));
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }
  } else if (normType === 'diamond') {
    const scale = Math.max(0.01, numRadius / 100);
    const quadrants = [
      { x: 0, y: 0, w: half + 1, h: half + 1, x2: half - half * scale, y2: half - half * scale },
      { x: half, y: 0, w: half, h: half + 1, x2: half + half * scale, y2: half - half * scale },
      { x: 0, y: half, w: half + 1, h: half, x2: half - half * scale, y2: half + half * scale },
      { x: half, y: half, w: half, h: half, x2: half + half * scale, y2: half + half * scale },
    ];
    quadrants.forEach((q) => {
      const grad = ctx.createLinearGradient(half, half, q.x2, q.y2);
      sortedStops.forEach((s) => {
        const offset = Math.min(1, Math.max(0, (parseFloat(s.offset) || 0) / 100));
        grad.addColorStop(offset, normalizeStopRgba(s));
      });
      ctx.fillStyle = grad;
      ctx.fillRect(q.x, q.y, q.w, q.h);
    });
  }

  const dataUrl = canvas.toDataURL('image/png');
  if (_specialGradientCache.size >= MAX_GRADIENT_CACHE) {
    const oldestKey = _specialGradientCache.keys().next().value;
    _specialGradientCache.delete(oldestKey);
  }
  _specialGradientCache.set(cacheKey, dataUrl);
  return dataUrl;
};

/**
 * Creates or updates an SVG <pattern> paint server for 'angular' or 'diamond' gradients.
 */
export const createOrUpdateSvgPatternGradient = ({
  doc = document,
  defs,
  gradId,
  existingEl = null,
  type,
  stops,
  angle = 0,
  radius = 100,
}) => {
  const ownerDoc = doc.ownerDocument || doc;
  const dataUrl = renderSpecialGradientDataUrl({ type, stops, angle, radius });
  if (!dataUrl) return null;

  let patternEl = existingEl;
  if (patternEl && patternEl.tagName?.toLowerCase() !== 'pattern') {
    patternEl.remove();
    patternEl = null;
  }

  if (!patternEl) {
    patternEl = ownerDoc.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    patternEl.id = gradId;
    patternEl.setAttribute('patternUnits', 'objectBoundingBox');
    patternEl.setAttribute('patternContentUnits', 'objectBoundingBox');
    patternEl.setAttribute('width', '1');
    patternEl.setAttribute('height', '1');

    const imgEl = ownerDoc.createElementNS('http://www.w3.org/2000/svg', 'image');
    imgEl.setAttribute('x', '0');
    imgEl.setAttribute('y', '0');
    imgEl.setAttribute('width', '1');
    imgEl.setAttribute('height', '1');
    imgEl.setAttribute('preserveAspectRatio', 'none');
    imgEl.setAttribute('href', dataUrl);
    imgEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl);
    patternEl.appendChild(imgEl);

    if (defs) defs.appendChild(patternEl);
  } else {
    let imgEl = patternEl.querySelector('image');
    if (!imgEl) {
      imgEl = ownerDoc.createElementNS('http://www.w3.org/2000/svg', 'image');
      imgEl.setAttribute('x', '0');
      imgEl.setAttribute('y', '0');
      imgEl.setAttribute('width', '1');
      imgEl.setAttribute('height', '1');
      imgEl.setAttribute('preserveAspectRatio', 'none');
      patternEl.appendChild(imgEl);
    }
    imgEl.setAttribute('href', dataUrl);
    imgEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl);
  }

  return patternEl;
};
