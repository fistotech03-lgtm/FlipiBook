/**
 * buttonElementUtils.js
 * Isolated utilities for Interactive Button Elements in FlipiBook
 * Imported from ButtonStyle design templates
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
    id: 'solid-pill',
    name: 'Solid Pill',
    width: 140,
    height: 42,
    rx: 21,
    fill: '#1e1b4b',
    text: 'Shop Now',
    textColor: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    iconName: 'ShoppingCart',
    iconColor: '#ffffff',
    hasIcon: true
  },
  {
    id: 'white-pill-badge',
    name: 'White Pill Badge',
    width: 146,
    height: 42,
    rx: 21,
    fill: '#ffffff',
    stroke: '#e2e8f0',
    strokeWidth: 1.5,
    badgeColor: '#1e1b4b',
    text: 'Shop Now',
    textColor: '#1e1b4b',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    iconName: 'ShoppingCart',
    iconColor: '#ffffff',
    hasIcon: true
  },
  {
    id: 'rect-badge',
    name: 'Rect Badge',
    width: 146,
    height: 42,
    rx: 4,
    fill: '#ffffff',
    stroke: '#e2e8f0',
    strokeWidth: 1.5,
    badgeColor: '#1e1b4b',
    text: 'Shop Now',
    textColor: '#1e1b4b',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    iconName: 'ShoppingCart',
    iconColor: '#ffffff',
    hasIcon: true
  },
  {
    id: 'app-icon',
    name: 'App Icon',
    width: 130,
    height: 42,
    rx: 14,
    fill: '#60a5fa',
    text: 'Globe',
    textColor: '#ffffff',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    iconName: 'Globe',
    iconColor: '#ffffff',
    hasIcon: true
  },
  {
    id: 'blue-primary',
    name: 'Blue Primary',
    width: 130,
    height: 42,
    rx: 6,
    fill: '#3b82f6',
    text: 'BUTTON',
    textColor: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: "'Inter', sans-serif",
    letterSpacing: '0.8px',
    hasIcon: false
  },
  {
    id: 'social-badge',
    name: 'Social Badge',
    width: 160,
    height: 42,
    rx: 21,
    fill: '#22c55e',
    badgeColor: '#ffffff',
    text: '@Yourusername',
    textColor: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    iconName: 'WhatsApp',
    iconColor: '#22c55e',
    hasIcon: true
  },
  {
    id: 'angled-slice',
    name: 'Angled Slice',
    width: 150,
    height: 42,
    rx: 21,
    fill: '#ffffff',
    stroke: '#e2e8f0',
    strokeWidth: 1.5,
    sliceColor: '#f472b6',
    text: 'Contact us',
    textColor: '#000000',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    iconName: 'Phone',
    iconColor: '#ffffff',
    hasIcon: true
  },
  {
    id: 'slanted-border',
    name: 'Slanted Border',
    width: 148,
    height: 42,
    rx: 24,
    tl: 24,
    tr: 0,
    bl: 0,
    br: 24,
    cornerLinked: false,
    fill: '#ffffff',
    stroke: '#a855f7',
    strokeWidth: 2,
    text: 'SETTINGS',
    textColor: '#1e293b',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '2px',
    hasIcon: false
  },
  {
    id: 'like-chevron',
    name: 'Like Chevron',
    width: 140,
    height: 42,
    rx: 0,
    fill: '#ffffff',
    stroke: '#ec4899',
    strokeWidth: 2,
    blockColor: '#ec4899',
    text: 'LIKE',
    textColor: '#1e293b',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '0.5px',
    iconName: 'Heart',
    iconColor: '#ffffff',
    hasIcon: true
  },
  {
    id: 'upload-ribbon',
    name: 'Upload Ribbon',
    width: 146,
    height: 42,
    rx: 4,
    fill: '#ef4444',
    ribbonColor: '#93c5fd',
    text: 'UPLOAD',
    textColor: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '0.8px',
    iconName: 'Upload',
    iconColor: '#ffffff',
    hasIcon: true
  },
  {
    id: 'gradient-pill',
    name: 'Sunrise Pill',
    width: 146,
    height: 42,
    rx: 21,
    fill: 'linear-gradient(135deg, rgba(255, 232, 214, 1) 0%, rgba(255, 209, 220, 1) 100%)',
    gradientColors: ['#ffe8d6', '#ffd1dc'],
    stroke: '#fca5a5',
    strokeWidth: 1.5,
    text: 'Get Started',
    textColor: '#831843',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    iconName: 'Sparkles',
    iconColor: '#e11d48',
    hasIcon: true
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    width: 142,
    height: 42,
    rx: 10,
    fill: 'linear-gradient(135deg, rgba(224, 242, 254, 1) 0%, rgba(186, 230, 253, 1) 100%)',
    gradientColors: ['#e0f2fe', '#bae6fd'],
    stroke: '#38bdf8',
    strokeWidth: 1.5,
    text: 'Explore',
    textColor: '#0369a1',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    iconName: 'Compass',
    iconColor: '#0284c7',
    hasIcon: true
  },
  {
    id: 'lavender-badge',
    name: 'Lavender Badge',
    width: 154,
    height: 42,
    rx: 21,
    fill: 'linear-gradient(135deg, rgba(250, 245, 255, 1) 0%, rgba(243, 232, 255, 1) 100%)',
    gradientColors: ['#faf5ff', '#f3e8ff'],
    stroke: '#d8b4fe',
    strokeWidth: 1.5,
    badgeColor: '#a855f7',
    text: 'Subscribe',
    textColor: '#581c87',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    iconName: 'Bell',
    iconColor: '#ffffff',
    hasIcon: true
  },
  {
    id: 'mint-frost',
    name: 'Mint Frost',
    width: 146,
    height: 42,
    rx: 21,
    fill: 'linear-gradient(135deg, rgba(209, 250, 229, 1) 0%, rgba(167, 243, 208, 1) 100%)',
    gradientColors: ['#d1fae5', '#a7f3d0'],
    stroke: '#34d399',
    strokeWidth: 1.5,
    text: 'Verified',
    textColor: '#065f46',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    iconName: 'ShieldCheck',
    iconColor: '#059669',
    hasIcon: true
  },
  {
    id: 'sunset-coral',
    name: 'Sunset Coral',
    width: 142,
    height: 42,
    rx: 12,
    fill: 'linear-gradient(135deg, rgba(255, 241, 242, 1) 0%, rgba(254, 215, 170, 1) 100%)',
    gradientColors: ['#fff1f2', '#fed7aa'],
    stroke: '#fb7185',
    strokeWidth: 1.5,
    text: 'Hot Deals',
    textColor: '#9f1239',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: "'Inter', sans-serif",
    iconName: 'Zap',
    iconColor: '#e11d48',
    hasIcon: true
  },
  {
    id: 'frosted-glass',
    name: 'Frosted Glass',
    width: 148,
    height: 42,
    rx: 8,
    fill: 'linear-gradient(135deg, rgba(240, 249, 255, 1) 0%, rgba(224, 231, 255, 1) 100%)',
    gradientColors: ['#f0f9ff', '#e0e7ff'],
    stroke: '#818cf8',
    strokeWidth: 1.5,
    text: 'Learn More',
    textColor: '#3730a3',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    iconName: 'ArrowRight',
    iconColor: '#4f46e5',
    iconPlacement: 'Right',
    hasIcon: true
  },
  {
    id: 'lemon-ribbon',
    name: 'Lemon Ribbon',
    width: 148,
    height: 42,
    rx: 6,
    fill: 'linear-gradient(135deg, rgba(254, 252, 232, 1) 0%, rgba(254, 240, 138, 1) 100%)',
    gradientColors: ['#fefce8', '#fef08a'],
    ribbonColor: '#fbbf24',
    text: 'SPECIAL OFFER',
    textColor: '#713f12',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '0.8px',
    iconName: 'Tag',
    iconColor: '#78350f',
    hasIcon: true
  },
  {
    id: 'pearl-pill',
    name: 'Pearl Gradient',
    width: 148,
    height: 42,
    rx: 21,
    fill: 'linear-gradient(120deg, rgba(224, 231, 255, 1) 0%, rgba(237, 233, 254, 1) 50%, rgba(252, 231, 243, 1) 100%)',
    gradientColors: ['#e0e7ff', '#ede9fe', '#fce7f3'],
    stroke: '#c7d2fe',
    strokeWidth: 1.5,
    text: 'PREMIUM',
    textColor: '#312e81',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '1px',
    iconName: 'Diamond',
    iconColor: '#4f46e5',
    hasIcon: true
  },
  {
    id: 'diagonal-pastel',
    name: 'Diagonal Pastel',
    width: 152,
    height: 42,
    rx: 21,
    fill: '#ffffff',
    stroke: '#e2e8f0',
    strokeWidth: 1.5,
    sliceColor: '#a78bfa',
    text: 'Download',
    textColor: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    iconName: 'Download',
    iconColor: '#ffffff',
    hasIcon: true
  },
  {
    id: 'slanted-pastel',
    name: 'Slanted Pastel',
    width: 150,
    height: 42,
    rx: 20,
    tl: 20,
    tr: 4,
    bl: 4,
    br: 20,
    cornerLinked: false,
    fill: 'linear-gradient(135deg, rgba(245, 243, 255, 1) 0%, rgba(236, 254, 255, 1) 100%)',
    gradientColors: ['#f5f3ff', '#ecfeff'],
    stroke: '#a78bfa',
    strokeWidth: 2,
    text: 'WATCH LIVE',
    textColor: '#5b21b6',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '1px',
    iconName: 'Play',
    iconColor: '#7c3aed',
    hasIcon: true
  }
];

export const getButtonSvgCode = (template, uniqueId, withTransform = false) => {
  const transformAttr = withTransform ? ' transform="translate(60, 100)"' : '';
  const w = template.width;
  const h = template.height;

  if (template.id === 'solid-pill') {
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-button-template="solid-pill" data-has-icon="true" data-icon-name="ShoppingCart" data-icon-color="#ffffff" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="21" data-tr="21" data-bl="21" data-br="21" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="${template.fill}" stroke="none" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="ShoppingCart" transform="translate(18, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <circle cx="9" cy="21" r="1" fill="#ffffff" stroke="none" />
            <circle cx="20" cy="21" r="1" fill="#ffffff" stroke="none" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </g>
        <text x="82" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'white-pill-badge') {
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-accent-color="${template.badgeColor}" data-button-template="white-pill-badge" data-has-icon="true" data-icon-name="ShoppingCart" data-icon-color="#ffffff" data-icon-bg-color="${template.badgeColor}" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="21" data-tr="21" data-bl="21" data-br="21" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="${template.fill}" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <circle class="btn-badge-circle" cx="21" cy="${h / 2}" r="14" fill="${template.badgeColor}" stroke="none" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="ShoppingCart" transform="translate(13, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <circle cx="9" cy="21" r="1" fill="#ffffff" stroke="none" />
            <circle cx="20" cy="21" r="1" fill="#ffffff" stroke="none" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </g>
        <text x="86" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'rect-badge') {
    const clipId = `clip-rect-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-accent-color="${template.badgeColor}" data-button-template="rect-badge" data-has-icon="true" data-icon-name="ShoppingCart" data-icon-color="#ffffff" data-icon-bg-color="${template.badgeColor}" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="4" data-tr="4" data-bl="4" data-br="4" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <clipPath id="${clipId}">
            <rect x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" ry="${template.rx}" />
          </clipPath>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="${template.fill}" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <g clip-path="url(#${clipId})" pointer-events="none" style="pointer-events: none;">
          <path class="btn-badge-block" d="M 0,${template.rx} A ${template.rx},${template.rx} 0 0 1 ${template.rx},0 L 38,0 L 38,${h} L ${template.rx},${h} A ${template.rx},${template.rx} 0 0 1 0,${h - template.rx} Z" fill="${template.badgeColor}" stroke="none" pointer-events="none" style="pointer-events: none;" />
        </g>
        <g class="btn-icon" data-icon-name="ShoppingCart" transform="translate(11, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <circle cx="9" cy="21" r="1" fill="#ffffff" stroke="none" />
            <circle cx="20" cy="21" r="1" fill="#ffffff" stroke="none" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </g>
        <text x="92" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'app-icon') {
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-button-template="app-icon" data-has-icon="true" data-icon-name="Globe" data-icon-color="#ffffff" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="14" data-tr="14" data-bl="14" data-br="14" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="${template.fill}" stroke="none" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="Globe" transform="translate(18, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </g>
        <text x="76" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'blue-primary') {
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-button-template="blue-primary" data-has-icon="false" data-padding-w="0" data-padding-h="0" data-tl="6" data-tr="6" data-bl="6" data-br="6" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="${template.fill}" stroke="none" pointer-events="none" style="pointer-events: none;" />
        <text x="${w / 2}" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" letter-spacing="0.8px" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; letter-spacing: 0.8px; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'social-badge') {
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-accent-color="${template.badgeColor}" data-button-template="social-badge" data-has-icon="true" data-icon-name="WhatsApp" data-icon-color="#22c55e" data-icon-bg-color="${template.badgeColor}" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="21" data-tr="21" data-bl="21" data-br="21" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="${template.fill}" stroke="none" pointer-events="none" style="pointer-events: none;" />
        <circle class="btn-badge-circle" cx="21" cy="${h / 2}" r="14" fill="${template.badgeColor}" stroke="none" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="WhatsApp" transform="translate(13, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e" pointer-events="none" style="pointer-events: none;">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </g>
        <text x="94" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'angled-slice') {
    const clipId = `clip-t7-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-accent-color="${template.sliceColor}" data-button-template="angled-slice" data-has-icon="true" data-icon-name="Phone" data-icon-color="#ffffff" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="21" data-tr="21" data-bl="21" data-br="21" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <clipPath id="${clipId}">
            <rect x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" />
          </clipPath>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="${template.fill}" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <g clip-path="url(#${clipId})" pointer-events="none" style="pointer-events: none;">
          <polygon points="-5,-5 42,-5 26,${h + 5} -5,${h + 5}" fill="${template.sliceColor}" stroke="none" pointer-events="none" style="pointer-events: none;" />
        </g>
        <g class="btn-icon" data-icon-name="Phone" transform="translate(10, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff" pointer-events="none" style="pointer-events: none;">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </g>
        <text x="94" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'slanted-border') {
    const d = `M 24,0 L ${w},0 L ${w},${h - 24} A 24,24 0 0 1 ${w - 24},${h} L 0,${h} L 0,24 A 24,24 0 0 1 24,0 Z`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-button-template="slanted-border" data-has-icon="false" data-padding-w="0" data-padding-h="0" data-tl="24" data-tr="0" data-bl="0" data-br="24" data-corner-linked="false" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="24" fill="none" stroke="none" opacity="0" pointer-events="none" style="pointer-events: none;" />
        <path class="btn-main-poly" d="${d}" fill="${template.fill}" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <text x="${w / 2}" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" letter-spacing="2px" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; letter-spacing: 2px; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'like-chevron') {
    const points = `0,0 ${w - 12},0 ${w},${h / 2} ${w - 12},${h} 0,${h}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-accent-color="${template.blockColor}" data-button-template="like-chevron" data-has-icon="true" data-icon-name="Heart" data-icon-color="#ffffff" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="0" data-tr="0" data-bl="0" data-br="0" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="0" fill="none" stroke="none" opacity="0" pointer-events="none" style="pointer-events: none;" />
        <polygon class="btn-main-poly" points="${points}" fill="${template.fill}" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <polygon points="0,0 36,0 36,${h} 0,${h}" fill="${template.blockColor}" stroke="none" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="Heart" transform="translate(10, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff" pointer-events="none" style="pointer-events: none;">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </g>
        <text x="86" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" letter-spacing="0.5px" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; letter-spacing: 0.5px; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'upload-ribbon') {
    const clipId = `clip-upload-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-accent-color="${template.ribbonColor}" data-button-template="upload-ribbon" data-has-icon="true" data-icon-name="Upload" data-icon-color="#ffffff" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="4" data-tr="4" data-bl="4" data-br="4" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <clipPath id="${clipId}">
            <rect x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" ry="${template.rx}" />
          </clipPath>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="${template.fill}" stroke="none" pointer-events="none" style="pointer-events: none;" />
        <g clip-path="url(#${clipId})" pointer-events="none" style="pointer-events: none;">
          <polygon points="0,0 34,0 42,${h / 2} 34,${h} 0,${h}" fill="${template.ribbonColor}" stroke="none" pointer-events="none" style="pointer-events: none;" />
        </g>
        <g class="btn-icon" data-icon-name="Upload" transform="translate(10, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </g>
        <text x="92" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" letter-spacing="0.8px" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; letter-spacing: 0.8px; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'gradient-pill') {
    const gradId = `btn-grad-sunrise-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-stroke-color="${template.stroke}" data-button-template="gradient-pill" data-has-icon="true" data-icon-name="Sparkles" data-icon-color="${template.iconColor}" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="21" data-tr="21" data-bl="21" data-br="21" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffe8d6" />
            <stop offset="100%" stop-color="#ffd1dc" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="url(#${gradId})" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="Sparkles" transform="translate(16, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${template.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
          </svg>
        </g>
        <text x="84" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'ocean-breeze') {
    const gradId = `btn-grad-ocean-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-stroke-color="${template.stroke}" data-button-template="ocean-breeze" data-has-icon="true" data-icon-name="Compass" data-icon-color="${template.iconColor}" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="10" data-tr="10" data-bl="10" data-br="10" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e0f2fe" />
            <stop offset="100%" stop-color="#bae6fd" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="url(#${gradId})" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="Compass" transform="translate(16, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${template.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="${template.iconColor}" stroke="none"/>
          </svg>
        </g>
        <text x="82" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'lavender-badge') {
    const gradId = `btn-grad-lav-bg-${uniqueId}`;
    const badgeGradId = `btn-grad-lav-badge-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-stroke-color="${template.stroke}" data-accent-color="${template.badgeColor}" data-button-template="lavender-badge" data-has-icon="true" data-icon-name="Bell" data-icon-color="#ffffff" data-icon-bg-color="${template.badgeColor}" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="21" data-tr="21" data-bl="21" data-br="21" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#faf5ff" />
            <stop offset="100%" stop-color="#f3e8ff" />
          </linearGradient>
          <linearGradient id="${badgeGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#c084fc" />
            <stop offset="100%" stop-color="#a855f7" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="url(#${gradId})" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <circle class="btn-badge-circle" cx="21" cy="${h / 2}" r="14" fill="url(#${badgeGradId})" stroke="none" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="Bell" transform="translate(13, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
        </g>
        <text x="92" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'mint-frost') {
    const gradId = `btn-grad-mint-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-stroke-color="${template.stroke}" data-button-template="mint-frost" data-has-icon="true" data-icon-name="ShieldCheck" data-icon-color="${template.iconColor}" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="21" data-tr="21" data-bl="21" data-br="21" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#d1fae5" />
            <stop offset="100%" stop-color="#a7f3d0" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="url(#${gradId})" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="ShieldCheck" transform="translate(16, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${template.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </g>
        <text x="84" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'sunset-coral') {
    const gradId = `btn-grad-sunset-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-stroke-color="${template.stroke}" data-button-template="sunset-coral" data-has-icon="true" data-icon-name="Zap" data-icon-color="${template.iconColor}" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="12" data-tr="12" data-bl="12" data-br="12" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff1f2" />
            <stop offset="100%" stop-color="#fed7aa" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="url(#${gradId})" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="Zap" transform="translate(16, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${template.iconColor}" stroke="none" pointer-events="none" style="pointer-events: none;">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </g>
        <text x="82" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'frosted-glass') {
    const gradId = `btn-grad-frost-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-stroke-color="${template.stroke}" data-button-template="frosted-glass" data-has-icon="true" data-icon-name="ArrowRight" data-icon-color="${template.iconColor}" data-icon-placement="Right" data-padding-w="0" data-padding-h="0" data-tl="8" data-tr="8" data-bl="8" data-br="8" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f0f9ff" />
            <stop offset="100%" stop-color="#e0e7ff" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="url(#${gradId})" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <text x="64" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
        <g class="btn-icon" data-icon-name="ArrowRight" transform="translate(116, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${template.iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </g>
      </g>
    `;
  }

  if (template.id === 'lemon-ribbon') {
    const clipId = `clip-lemon-${uniqueId}`;
    const gradId = `btn-grad-lemon-${uniqueId}`;
    const ribbonGradId = `btn-grad-lemon-ribbon-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-accent-color="${template.ribbonColor}" data-button-template="lemon-ribbon" data-has-icon="true" data-icon-name="Tag" data-icon-color="${template.iconColor}" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="6" data-tr="6" data-bl="6" data-br="6" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <clipPath id="${clipId}">
            <rect x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" ry="${template.rx}" />
          </clipPath>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fefce8" />
            <stop offset="100%" stop-color="#fef08a" />
          </linearGradient>
          <linearGradient id="${ribbonGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde047" />
            <stop offset="100%" stop-color="#fbbf24" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="url(#${gradId})" stroke="#fde047" stroke-width="1" pointer-events="none" style="pointer-events: none;" />
        <g clip-path="url(#${clipId})" pointer-events="none" style="pointer-events: none;">
          <polygon points="0,0 34,0 42,${h / 2} 34,${h} 0,${h}" fill="url(#${ribbonGradId})" stroke="none" pointer-events="none" style="pointer-events: none;" />
        </g>
        <g class="btn-icon" data-icon-name="Tag" transform="translate(10, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${template.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
            <circle cx="7" cy="7" r="1.5" fill="${template.iconColor}" stroke="none"/>
          </svg>
        </g>
        <text x="94" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" letter-spacing="0.8px" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; letter-spacing: 0.8px; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'pearl-pill') {
    const gradId = `btn-grad-pearl-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-stroke-color="${template.stroke}" data-button-template="pearl-pill" data-has-icon="true" data-icon-name="Diamond" data-icon-color="${template.iconColor}" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="21" data-tr="21" data-bl="21" data-br="21" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e0e7ff" />
            <stop offset="50%" stop-color="#ede9fe" />
            <stop offset="100%" stop-color="#fce7f3" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="url(#${gradId})" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="Diamond" transform="translate(16, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${template.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <path d="M6 3h12l4 6-10 13L2 9Z"/>
            <path d="M11 3 8 9l4 13 4-13-3-6"/>
            <path d="M2 9h20"/>
          </svg>
        </g>
        <text x="86" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" letter-spacing="1px" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; letter-spacing: 1px; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'diagonal-pastel') {
    const clipId = `clip-diag-${uniqueId}`;
    const gradId = `btn-grad-diag-${uniqueId}`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-accent-color="${template.sliceColor}" data-button-template="diagonal-pastel" data-has-icon="true" data-icon-name="Download" data-icon-color="#ffffff" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="21" data-tr="21" data-bl="21" data-br="21" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <clipPath id="${clipId}">
            <rect x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" />
          </clipPath>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#93c5fd" />
            <stop offset="100%" stop-color="#c4b5fd" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx}" fill="${template.fill}" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <g clip-path="url(#${clipId})" pointer-events="none" style="pointer-events: none;">
          <polygon points="-5,-5 42,-5 26,${h + 5} -5,${h + 5}" fill="url(#${gradId})" stroke="none" pointer-events="none" style="pointer-events: none;" />
        </g>
        <g class="btn-icon" data-icon-name="Download" transform="translate(10, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="pointer-events: none;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </g>
        <text x="94" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  if (template.id === 'slanted-pastel') {
    const gradId = `btn-grad-slanted-${uniqueId}`;
    const d = `M 20,0 L ${w - 4},0 A 4,4 0 0 1 ${w},4 L ${w},${h - 20} A 20,20 0 0 1 ${w - 20},${h} L 4,${h} A 4,4 0 0 1 0,${h - 4} L 0,20 A 20,20 0 0 1 20,0 Z`;
    return `
      <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name}" data-text="${template.text}" data-fill-color="${template.fill}" data-stroke-color="${template.stroke}" data-button-template="slanted-pastel" data-has-icon="true" data-icon-name="Play" data-icon-color="${template.iconColor}" data-icon-placement="Left" data-padding-w="0" data-padding-h="0" data-tl="20" data-tr="4" data-bl="4" data-br="20" data-corner-linked="false" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f5f3ff" />
            <stop offset="100%" stop-color="#ecfeff" />
          </linearGradient>
        </defs>
        <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="20" fill="none" stroke="none" opacity="0" pointer-events="none" style="pointer-events: none;" />
        <path class="btn-main-poly" d="${d}" fill="url(#${gradId})" stroke="${template.stroke}" stroke-width="${template.strokeWidth}" pointer-events="none" style="pointer-events: none;" />
        <g class="btn-icon" data-icon-name="Play" transform="translate(16, 13)" pointer-events="none" style="pointer-events: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${template.iconColor}" stroke="none" pointer-events="none" style="pointer-events: none;">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </g>
        <text x="88" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily}" font-weight="${template.fontWeight}" letter-spacing="1px" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; font-family: ${template.fontFamily}; letter-spacing: 1px; pointer-events: none;">${template.text}</text>
      </g>
    `;
  }

  return `
    <g id="button-${uniqueId}" data-type="button" data-is-element-button="true" data-name="${template.name || 'Button'}" data-text="${template.text}" data-fill-color="${template.fill}" data-stroke-alignment="Outside" data-stroke-position="Outside" data-padding-w="0" data-padding-h="0" cursor="pointer" pointer-events="all" style="cursor: pointer; pointer-events: all;"${transformAttr}>
      <rect class="btn-bg" x="0" y="0" width="${w}" height="${h}" rx="${template.rx || 6}" fill="${template.fill}" stroke="${template.stroke || 'none'}" stroke-width="${(template.strokeWidth || 0) * 2}" data-stroke-width="${template.strokeWidth || 0}" paint-order="stroke fill" style="paint-order: stroke fill; pointer-events: none;" pointer-events="none" />
      <text x="${w / 2}" y="${h / 2 + 1}" fill="${template.textColor}" font-size="${template.fontSize}" font-family="${template.fontFamily || '-apple-system'}" font-weight="${template.fontWeight}" text-anchor="middle" dominant-baseline="middle" pointer-events="none" style="text-anchor: middle; dominant-baseline: middle; pointer-events: none;">${template.text}</text>
    </g>
  `;
};

export const getButtonPreviewSvg = (template) => {
  const w = template.width;
  const h = template.height;
  const uniqueId = `preview-${template.id}`;
  const innerSvg = getButtonSvgCode(template, uniqueId, false);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">${innerSvg}</svg>`;
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
  g.setAttribute('data-name', 'Button');
  g.setAttribute('data-button-title', template.name || 'Button');
  g.setAttribute('data-type', 'button');
  g.setAttribute('data-is-element-button', 'true');
  g.setAttribute('data-interaction', 'open-link');
  g.setAttribute('data-interaction-value', '');

  return document.importNode(g, true);
};
