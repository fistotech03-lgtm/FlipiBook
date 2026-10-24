/**
 * buttonElementUtils.js
 * Isolated utilities for Interactive Button Elements in FlipiBook
 */

export const isElementButton = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-is-element-button') === 'true' ||
    el.getAttribute('data-type') === 'button' ||
    (typeof el.querySelector === 'function' && el.querySelector('[data-is-element-button="true"]') !== null)
  );
};

export const BUTTON_TEMPLATES = [
  {
    id: 'btn-pill-primary',
    name: 'Pill CTA',
    width: 140,
    height: 42,
    rx: 21,
    fill: '#EA543A',
    stroke: 'none',
    strokeWidth: 0,
    text: 'Click Here',
    textColor: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    shape: 'pill'
  },
  {
    id: 'btn-linear-gradient',
    name: 'Linear Gradient',
    width: 140,
    height: 42,
    rx: 21,
    isGradient: true,
    gradientColors: ['#9B7CFF', '#F655C8'],
    stroke: 'none',
    strokeWidth: 0,
    text: 'EXPLORE',
    textColor: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: '1px',
    shape: 'gradient'
  },
  {
    id: 'btn-cyber-outline',
    name: 'Cyber Outline',
    width: 140,
    height: 42,
    rx: 8,
    fill: '#FFFFFF',
    stroke: '#1E2538',
    strokeWidth: 2,
    text: 'Learn More',
    textColor: '#1E2538',
    fontWeight: '600',
    fontSize: 15,
    shape: 'outline'
  },
  {
    id: 'btn-ribbon-purple',
    name: 'Ribbon CTA',
    width: 150,
    height: 42,
    fill: '#7E22CE',
    accentColor: '#A855F7',
    text: 'Get Started',
    textColor: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    isRibbon: true,
    shape: 'ribbon'
  },
  {
    id: 'btn-parallelogram',
    name: 'Parallelogram',
    width: 150,
    height: 42,
    fill: '#10B981',
    text: 'DISCOVER',
    textColor: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    isParallelogram: true,
    shape: 'parallelogram'
  },
  {
    id: 'btn-diamond-badge',
    name: 'Diamond Badge',
    width: 150,
    height: 46,
    fill: '#B7007E',
    text: 'EXCLUSIVE',
    textColor: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    isDiamond: true,
    shape: 'diamond'
  },
  {
    id: 'btn-arrow-cyan',
    name: 'Arrow CTA',
    width: 160,
    height: 48,
    isGradient: true,
    gradientColors: ['#00F2FE', '#4FACFE'],
    text: 'CONTINUE',
    textColor: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    isArrow: true,
    shape: 'arrow'
  },
  {
    id: 'btn-skew-orange',
    name: 'Skew Gradient',
    width: 150,
    height: 48,
    isGradient: true,
    gradientColors: ['#FF9800', '#FF2B00'],
    text: 'SIGN UP',
    textColor: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    isSkew: true,
    shape: 'skew'
  },
  {
    id: 'btn-outside-circle',
    name: 'Scalloped CTA',
    width: 160,
    height: 48,
    fill: '#E31A61',
    text: 'ORDER NOW',
    textColor: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    isOutsideCircle: true,
    shape: 'outside-circle'
  },
  {
    id: 'btn-inset-circle',
    name: 'Inset Circle',
    width: 160,
    height: 48,
    fill: '#1877F2',
    text: 'CONNECT',
    textColor: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    isInsetCircle: true,
    shape: 'inset-circle'
  }
];

export const getButtonSvgCode = (template, uniqueId, withTransform = false) => {
  const transformAttr = withTransform ? ' transform="translate(60, 100)"' : '';
  const centerX = template.width / 2;
  const centerY = template.height / 2;

  if (template.isRibbon) {
    const w = template.width;
    const h = template.height;
    const slantDx = Math.round(h * 0.22);
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-button-shape="ribbon" data-text="${template.text}" data-fill-color="${template.fill}" data-accent-color="${template.accentColor || '#A855F7'}" cursor="pointer"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="0" fill="none" stroke="none" opacity="0" pointer-events="none" />
        <polygon class="btn-accent-left" points="0,${h} ${slantDx},${h} ${slantDx / 2},${h / 2}" fill="${template.accentColor || '#A855F7'}" stroke="none" />
        <polygon class="btn-accent-right" points="${w - slantDx},0 ${w},0 ${w - slantDx / 2},${h / 2}" fill="${template.accentColor || '#A855F7'}" stroke="none" />
        <polygon class="btn-main-poly" points="0,0 ${w - slantDx},0 ${w},${h} ${slantDx},${h}" fill="${template.fill}" stroke="none" />
        <text x="${centerX}" y="${centerY + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="Inter, -apple-system, sans-serif" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" style="text-anchor: middle; dominant-baseline: middle;" data-type="text">${template.text}</text>
      </g>
    `;
  }

  if (template.isParallelogram) {
    const w = template.width;
    const h = template.height;
    const slant = Math.round(h * 0.35);
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-button-shape="parallelogram" data-text="${template.text}" data-fill-color="${template.fill}" cursor="pointer"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="0" fill="none" stroke="none" opacity="0" pointer-events="none" />
        <polygon class="btn-main-poly" points="${slant},0 ${w},0 ${w - slant},${h} 0,${h}" fill="${template.fill}" stroke="none" />
        <text x="${centerX}" y="${centerY + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="Inter, -apple-system, sans-serif" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" style="text-anchor: middle; dominant-baseline: middle;" data-type="text">${template.text}</text>
      </g>
    `;
  }

  if (template.isDiamond) {
    const w = template.width;
    const h = template.height;
    const pointDx = Math.round(h * 0.45);
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-button-shape="diamond" data-text="${template.text}" data-fill-color="${template.fill}" cursor="pointer"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="0" fill="none" stroke="none" opacity="0" pointer-events="none" />
        <polygon class="btn-main-poly" points="${pointDx},0 ${w - pointDx},0 ${w},${h / 2} ${w - pointDx},${h} ${pointDx},${h} 0,${h / 2}" fill="${template.fill}" stroke="none" />
        <text x="${centerX}" y="${centerY + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="Inter, -apple-system, sans-serif" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" style="text-anchor: middle; dominant-baseline: middle;" data-type="text">${template.text}</text>
      </g>
    `;
  }

  if (template.isArrow) {
    const w = template.width;
    const h = template.height;
    const arrowDx = Math.round(h * 0.45);
    const gradId = `btn-grad-${uniqueId}`;
    const color1 = template.gradientColors?.[0] || '#00F2FE';
    const color2 = template.gradientColors?.[1] || '#4FACFE';
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-button-shape="arrow" data-text="${template.text}" cursor="pointer"${transformAttr}>
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${color1}" />
            <stop offset="100%" stop-color="${color2}" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="0" fill="none" stroke="none" opacity="0" pointer-events="none" />
        <polygon class="btn-main-poly" points="0,0 ${w - arrowDx},0 ${w},${h / 2} ${w - arrowDx},${h} 0,${h} ${arrowDx},${h / 2}" fill="url(#${gradId})" data-fill-color="linear-gradient(90deg, ${color1} 0%, ${color2} 100%)" stroke="none" />
        <text x="${centerX}" y="${centerY + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="Inter, -apple-system, sans-serif" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" style="text-anchor: middle; dominant-baseline: middle;" data-type="text">${template.text}</text>
      </g>
    `;
  }

  if (template.isSkew) {
    const w = template.width;
    const h = template.height;
    const r = 12;
    const s = Math.round(h * 0.25);
    const gradId = `btn-grad-${uniqueId}`;
    const color1 = template.gradientColors?.[0] || '#FF9800';
    const color2 = template.gradientColors?.[1] || '#FF2B00';
    const d = `M ${r},0 L ${w - s - r},0 Q ${w - s},0 ${w - s + 3},${r * 0.6} L ${w - 3},${h - r * 0.6} Q ${w},${h} ${w - r},${h} L ${r},${h} A ${r},${r} 0 0 1 0,${h - r} L 0,${r} A ${r},${r} 0 0 1 ${r},0 Z`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-button-shape="skew" data-text="${template.text}" cursor="pointer"${transformAttr}>
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${color1}" />
            <stop offset="100%" stop-color="${color2}" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="0" fill="none" stroke="none" opacity="0" pointer-events="none" />
        <path class="btn-main-poly" d="${d}" fill="url(#${gradId})" data-fill-color="linear-gradient(90deg, ${color1} 0%, ${color2} 100%)" stroke="none" />
        <text x="${centerX}" y="${centerY + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="Inter, -apple-system, sans-serif" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" style="text-anchor: middle; dominant-baseline: middle;" data-type="text">${template.text}</text>
      </g>
    `;
  }

  if (template.isOutsideCircle) {
    const w = template.width;
    const h = template.height;
    const rTop = 14;
    const rBot = 16;
    const d = `M 0,${h} Q ${rBot * 0.7},${h} ${rBot},${h - rBot} L ${rBot},${rTop} A ${rTop},${rTop} 0 0 1 ${rBot + rTop},0 L ${w - rBot - rTop},0 A ${rTop},${rTop} 0 0 1 ${w - rBot},${rTop} L ${w - rBot},${h - rBot} Q ${w - rBot * 0.7},${h} ${w},${h} Z`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-button-shape="outside-circle" data-text="${template.text}" data-fill-color="${template.fill}" cursor="pointer"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="0" fill="none" stroke="none" opacity="0" pointer-events="none" />
        <path class="btn-main-poly" d="${d}" fill="${template.fill}" stroke="none" />
        <text x="${centerX}" y="${centerY + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="Inter, -apple-system, sans-serif" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" style="text-anchor: middle; dominant-baseline: middle;" data-type="text">${template.text}</text>
      </g>
    `;
  }

  if (template.isInsetCircle) {
    const w = template.width;
    const h = template.height;
    const r = 12;
    const d = `M 0,${r} A ${r},${r} 0 0 0 ${r},0 L ${w - r},0 A ${r},${r} 0 0 0 ${w},${r} L ${w},${h - r} A ${r},${r} 0 0 0 ${w - r},${h} L ${r},${h} A ${r},${r} 0 0 0 0,${h - r} Z`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-button-shape="inset-circle" data-text="${template.text}" data-fill-color="${template.fill}" cursor="pointer"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="0" fill="none" stroke="none" opacity="0" pointer-events="none" />
        <path class="btn-main-poly" d="${d}" fill="${template.fill}" stroke="none" />
        <text x="${centerX}" y="${centerY + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="Inter, -apple-system, sans-serif" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" style="text-anchor: middle; dominant-baseline: middle;" data-type="text">${template.text}</text>
      </g>
    `;
  }

  if (template.isGradient) {
    const gradId = `btn-grad-${uniqueId}`;
    const color1 = template.gradientColors?.[0] || '#9B7CFF';
    const color2 = template.gradientColors?.[1] || '#F655C8';
    const letterSpacingAttr = template.letterSpacing ? ` letter-spacing="${template.letterSpacing}"` : '';
    const letterSpacingStyle = template.letterSpacing ? ` letter-spacing: ${template.letterSpacing};` : '';
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-text="${template.text}" cursor="pointer"${transformAttr}>
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${color1}" />
            <stop offset="100%" stop-color="${color2}" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${template.width}" height="${template.height}" rx="${template.rx}" fill="url(#${gradId})" data-fill-color="linear-gradient(90deg, ${color1} 0%, ${color2} 100%)" stroke="${template.stroke || 'none'}" stroke-width="${template.strokeWidth || 0}" />
        <text x="${centerX}" y="${centerY + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="Inter, -apple-system, sans-serif" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle"${letterSpacingAttr} style="text-anchor: middle; dominant-baseline: middle;${letterSpacingStyle}" data-type="text">${template.text}</text>
      </g>
    `;
  }

  return `
    <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-text="${template.text}" data-fill-color="${template.fill}" cursor="pointer"${transformAttr}>
      <rect class="btn-bg" x="0" y="0" width="${template.width}" height="${template.height}" rx="${template.rx}" fill="${template.fill}" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" />
      <text x="${centerX}" y="${centerY + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="Inter, -apple-system, sans-serif" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" style="text-anchor: middle; dominant-baseline: middle;" data-type="text">${template.text}</text>
    </g>
  `;
};

export const createButtonElementNode = (template, cx, cy) => {
  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
  const svgXml = getButtonSvgCode(template, uniqueId, false);

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svgXml}</svg>`, 'image/svg+xml');
  const g = doc.querySelector(`g#button-${uniqueId}`);
  if (!g) return null;

  const posX = Math.round(cx - template.width / 2);
  const posY = Math.round(cy - template.height / 2);

  g.setAttribute('transform', `translate(${posX}, ${posY})`);
  g.setAttribute('data-name', template.name || 'Button');
  g.setAttribute('data-type', 'button');
  g.setAttribute('data-is-element-button', 'true');
  g.setAttribute('data-interaction', 'open-link');
  g.setAttribute('data-interaction-value', '');

  return document.importNode(g, true);
};
