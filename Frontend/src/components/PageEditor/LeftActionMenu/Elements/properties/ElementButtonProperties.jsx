import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Pencil,
  ArrowLeftRight
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import ColorPicker, { parseGradient, generateGradientString } from '../../../../ColorPicker';
import { IconsModal } from '../../Icons';
import Effect from '../../../properties/Effect';
import { ElementToggle, ElementDropdown } from './ElementUIControls';

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-[0.4vw] mt-[0.3vw] mb-[0.1vw]">
    <span className="text-[0.9vw] font-semibold text-black whitespace-nowrap">{title}</span>
    <div className="h-[0.06vw] bg-gray-200 flex-1 ml-[0.3vw]" />
  </div>
);

// Helper row with fixed-width label ensuring all colons align vertically
const PropertyRow = ({ label, children, className = '' }) => (
  <div className={`flex items-center gap-[0.5vw] ${className}`}>
    <div className="w-[5.8vw] shrink-0 flex items-center pl-[0.5vw] justify-between text-gray-800 font-semibold">
      <span className={`${label.length > 12 ? 'text-[0.8vw]' : 'text-[0.8vw]'}`}>
        {label}
      </span>
      <span className="text-gray-900 font-semibold text-[0.8vw]">:</span>
    </div>
    <div className="flex-1 min-w-0">
      {children}
    </div>
  </div>
);

// Color swatch + hex & opacity box with ColorPicker connectivity
const ColorInput = ({ color, onChange, opacity = 100, onOpenPicker, isActive = false }) => {
  const displayColor = (color && color.startsWith('#')) ? color.toUpperCase() : (color || '#000000');

  return (
    <div className="flex items-center gap-[0.4vw] w-full">
      <div
        onClick={onOpenPicker}
        className={`color-box color-box-trigger w-[2vw] h-[2vw] rounded-[0.5vw] border flex-shrink-0 relative overflow-hidden flex items-center justify-center cursor-pointer shadow-2xs hover:scale-105 transition-all ${
          isActive ? 'border-[#E05638] ring-2 ring-[#E05638]/40 scale-105 shadow-xs' : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{ background: (color === 'none' || color === 'transparent') ? '#ffffff' : (color || '#000000') }}
        title="Click to open color palette"
      >
        {(color === 'none' || color === 'transparent') && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1.5px] bg-red-500 rotate-45" />
        )}
      </div>
      <div className="flex-1 h-[2.5vw] flex items-center justify-between border border-gray-200 rounded-[0.5vw] bg-white px-[0.6vw] text-[0.8vw] text-gray-800 focus-within:border-[#E05638] shadow-2xs">
        <input
          type="text"
          value={color && color.includes('gradient') ? 'GRADIENT' : displayColor}
          onChange={(e) => {
            let val = e.target.value;
            if (!val.startsWith('#') && val.length > 0 && !val.includes('gradient')) val = '#' + val;
            onChange(val);
          }}
          className="w-[5.2vw] font-mono text-[0.8vw] text-gray-500 bg-transparent focus:outline-none uppercase font-normal"
          maxLength={color && color.includes('gradient') ? 10 : 7}
        />
        <span className="text-gray-400 text-[0.75vw] font-semibold">{opacity}%</span>
      </div>
    </div>
  );
};

const ColorInputWithFormat = ({ color, onChange, opacity = 100, onOpenPicker, isActive = false }) => (
  <div className="flex items-center gap-[0.4vw] w-full">
    <div
      onClick={onOpenPicker}
      className={`color-box color-box-trigger w-[2vw] h-[2vw] rounded-[0.5vw] border flex-shrink-0 relative overflow-hidden flex items-center justify-center cursor-pointer shadow-2xs hover:scale-105 transition-all ${
        isActive ? 'border-[#E05638] ring-2 ring-[#E05638]/40 scale-105 shadow-xs' : 'border-gray-200 hover:border-gray-300'
      }`}
      style={{ background: (color === 'none' || color === 'transparent') ? '#ffffff' : (color || '#000000') }}
      title="Click to open color palette"
    >
      {(color === 'none' || color === 'transparent') && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1.5px] bg-red-500 rotate-45" />
      )}
    </div>
    <div className="flex-1 h-[2.5vw] flex items-center justify-between border border-gray-200 rounded-[0.5vw] bg-white px-[0.6vw] text-[0.8vw] text-gray-800 focus-within:border-[#E05638] shadow-2xs">
      <input
        type="text"
        value={color && color.includes('gradient') ? 'GRADIENT' : (color?.toUpperCase() || '#000000')}
        onChange={(e) => {
          let val = e.target.value;
          if (!val.startsWith('#') && val.length > 0 && !val.includes('gradient')) val = '#' + val;
          onChange(val);
        }}
        className="w-[5.2vw] font-mono text-[0.8vw] text-gray-500 bg-transparent focus:outline-none uppercase font-normal"
        maxLength={color && color.includes('gradient') ? 10 : 7}
      />
      <span className="text-gray-400 text-[0.75vw] font-semibold">{opacity}%</span>
    </div>
  </div>
);

const fontFamilies = [
  'Poppins', 'Arial', 'Bangers', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
  'Helvetica', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Inter', 'Playfair Display', 'Oswald', 'Merriweather',
  'Public Sans', 'Lora', 'Cabin', 'Satisfy'
];

const fontWeights = [
  { name: 'Thin', value: '100' },
  { name: 'Extra Light', value: '200' },
  { name: 'Light', value: '300' },
  { name: 'Regular', value: '400' },
  { name: 'Medium', value: '500' },
  { name: 'Semi Bold', value: '600' },
  { name: 'Bold', value: '700' },
  { name: 'Extra Bold', value: '800' }
];

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 50, 64, 72];

// Helper to extract color or reconstruct gradient string from SVG defs if needed
const extractColorOrGradient = (element, attrName, defaultColor) => {
  if (!element) return defaultColor;
  const buttonG = element.closest?.('[data-is-element-button="true"], [data-type="button"], g[id^="button-"]');
  const dataColor = element.getAttribute(`data-${attrName}-color`) || buttonG?.getAttribute(`data-${attrName}-color`);
  if (dataColor) return dataColor;

  const rawVal = element.getAttribute(attrName) || element.style?.[attrName] || defaultColor;
  if (rawVal && rawVal.startsWith('url(#')) {
    const gradId = rawVal.match(/url\(#([^)]+)\)/)?.[1];
    const svgRoot = element.closest('svg');
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;

    const gradEl = (gradId && buttonG ? buttonG.querySelector(`#${gradId}`) : null) ||
      (gradId && svgRoot ? svgRoot.querySelector(`#${gradId}`) : null) ||
      (gradId ? editorDoc.getElementById(gradId) : null) ||
      (gradId ? document.getElementById(gradId) : null);

    if (gradEl) {
      const isRadial = gradEl.tagName.toLowerCase().includes('radial');
      const stops = Array.from(gradEl.querySelectorAll('stop')).map(stop => ({
        color: stop.getAttribute('stop-color') || '#ffffff',
        offset: parseFloat(stop.getAttribute('offset') || 0),
        opacity: Math.round(parseFloat(stop.getAttribute('stop-opacity') || 1) * 100)
      }));
      if (stops.length > 0) {
        if (isRadial) {
          const r = parseFloat(gradEl.getAttribute('r') || 50);
          return generateGradientString('Radial', stops, 0, r);
        } else {
          const x1 = parseFloat(gradEl.getAttribute('x1') || 50);
          const y1 = parseFloat(gradEl.getAttribute('y1') || 0);
          const x2 = parseFloat(gradEl.getAttribute('x2') || 50);
          const y2 = parseFloat(gradEl.getAttribute('y2') || 100);
          const angle = Math.round((Math.atan2(x2 - x1, -(y2 - y1)) * 180) / Math.PI + 360) % 360;
          return generateGradientString('Linear', stops, angle, 100);
        }
      }
    }
  }
  return rawVal;
};

// Compute matching lighter accent shade for corner flaps
const lightenColor = (col, amount = 0.3) => {
  if (!col) return col;
  let baseCol = col;
  if (typeof baseCol === 'string' && baseCol.includes('gradient')) {
    try {
      const parsed = parseGradient(baseCol);
      if (parsed && parsed.stops && parsed.stops.length > 0) {
        baseCol = parsed.stops[0].color;
      }
    } catch (_) {}
  }
  if (typeof baseCol !== 'string') return col;
  let r = 0, g = 0, b = 0;
  if (baseCol.startsWith('#')) {
    let hex = baseCol.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    r = parseInt(hex.substring(0, 2), 16) || 0;
    g = parseInt(hex.substring(2, 4), 16) || 0;
    b = parseInt(hex.substring(4, 6), 16) || 0;
  } else if (baseCol.startsWith('rgb')) {
    const parts = baseCol.match(/\d+/g);
    if (parts && parts.length >= 3) {
      r = parseInt(parts[0]) || 0;
      g = parseInt(parts[1]) || 0;
      b = parseInt(parts[2]) || 0;
    } else {
      return baseCol;
    }
  } else {
    return baseCol;
  }
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`;
};

export const getRoundedPathD = (x, y, w, h, tl, tr, br, bl) => {
  const maxR = Math.max(0, Math.min(w / 2, h / 2));
  const clamp = (r) => Math.max(0, Math.min(Number(r) || 0, maxR));
  const ctl = clamp(tl);
  const ctr = clamp(tr);
  const cbr = clamp(br);
  const cbl = clamp(bl);

  let d = `M ${x + ctl},${y}`;
  d += ` L ${x + w - ctr},${y}`;
  if (ctr > 0) {
    d += ` A ${ctr},${ctr} 0 0 1 ${x + w},${y + ctr}`;
  } else {
    d += ` L ${x + w},${y}`;
  }
  d += ` L ${x + w},${y + h - cbr}`;
  if (cbr > 0) {
    d += ` A ${cbr},${cbr} 0 0 1 ${x + w - cbr},${y + h}`;
  } else {
    d += ` L ${x + w},${y + h}`;
  }
  d += ` L ${x + cbl},${y + h}`;
  if (cbl > 0) {
    d += ` A ${cbl},${cbl} 0 0 1 ${x},${y + h - cbl}`;
  } else {
    d += ` L ${x},${y + h}`;
  }
  d += ` L ${x},${y + ctl}`;
  if (ctl > 0) {
    d += ` A ${ctl},${ctl} 0 0 1 ${x + ctl},${y}`;
  } else {
    d += ` L ${x},${y}`;
  }
  d += ' Z';
  return d.replace(/\s+/g, ' ').trim();
};

export const ButtonEditor = ({
  selectedElement,
  selectedLayerId,
  selectedElementProps,
  updateElementAttribute,
  activePageIndex,
  onUpdate
}) => {
  // Resolve active button element
  const resolveTargetElement = () => {
    if (selectedElement && typeof selectedElement.getAttribute === 'function') {
      return selectedElement.closest?.('[data-is-element-button="true"], [data-type="button"], g[id^="button-"]') || selectedElement;
    }
    const targetId = selectedElementProps?.buttonId || selectedLayerId;
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const base = (targetId ? editorDoc.getElementById(targetId) : null) || (targetId ? document.getElementById(targetId) : null);
    return base?.closest?.('[data-is-element-button="true"], [data-type="button"], g[id^="button-"]') || base;
  };

  const currentElement = resolveTargetElement();

  // ─── 1. Button Content States ───────────────────────────────────
  const [buttonText, setButtonText] = useState('Button');
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [fontSize, setFontSize] = useState(12);
  const [fontWeight, setFontWeight] = useState('600'); // Semi Bold
  const [textFillColor, setTextFillColor] = useState('#000000');
  const [textOpacity, setTextOpacity] = useState(100);

  // Icon States
  const [hasIcon, setHasIcon] = useState(true);
  const [iconName, setIconName] = useState('Check');
  const [iconHtml, setIconHtml] = useState('');
  const [iconViewBox, setIconViewBox] = useState('0 0 24 24');
  const [iconPlacement, setIconPlacement] = useState('Left');
  const [iconColor, setIconColor] = useState('#000000');
  const [iconOpacity, setIconOpacity] = useState(100);
  const [iconBgColor, setIconBgColor] = useState('none');
  const [iconBgOpacity, setIconBgOpacity] = useState(100);
  const [isIconGalleryOpen, setIsIconGalleryOpen] = useState(false);

  // ─── 2. Size & Spacing States ───────────────────────────────────
  const [paddingW, setPaddingW] = useState(0);
  const [paddingH, setPaddingH] = useState(0);
  const [isPaddingLinked, setIsPaddingLinked] = useState(true);
  const [iconGap, setIconGap] = useState(4);

  // ─── 3. Button Color States ─────────────────────────────────────
  const [shapeFillColor, setShapeFillColor] = useState('#000000');
  const [shapeOpacity, setShapeOpacity] = useState(100);

  // ─── 4. Stoke Color States ──────────────────────────────────────
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeOpacity, setStrokeOpacity] = useState(100);
  const [strokeAlignment, setStrokeAlignment] = useState('Outside');
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [lineStyle, setLineStyle] = useState('Solid'); // 'Solid', 'Dashed', 'Dotted'
  const [dashL, setDashL] = useState(8);
  const [dashG, setDashG] = useState(4);
  const [lineCorner, setLineCorner] = useState('Square'); // 'Square', 'Rounded'

  // ─── 5. Corner Radius States ────────────────────────────────────
  const [radius, setRadius] = useState(() => {
    if (currentElement) {
      const rawTl = currentElement.getAttribute('data-tl');
      const rawTr = currentElement.getAttribute('data-tr');
      const rawBl = currentElement.getAttribute('data-bl');
      const rawBr = currentElement.getAttribute('data-br');
      const rectEl = currentElement.querySelector('rect.btn-bg') || currentElement.querySelector('rect');
      const rxVal = rectEl?.getAttribute('rx');
      const isSlanted = currentElement.getAttribute('data-button-template') === 'slanted-border' ||
        currentElement.getAttribute('data-button-template') === 'slanted-pastel' ||
        (rawTl === '24' && rawTr === '0');

      const parseR = (val, fb) => {
        if (val === null || val === undefined || val === '') return fb;
        const n = parseInt(val, 10);
        return !isNaN(n) ? n : fb;
      };
      const defTl = isSlanted ? 24 : (rxVal !== null && !isNaN(parseInt(rxVal, 10)) ? parseInt(rxVal, 10) : 12);
      const defTr = isSlanted ? 0 : (rxVal !== null && !isNaN(parseInt(rxVal, 10)) ? parseInt(rxVal, 10) : 12);
      const defBl = isSlanted ? 0 : (rxVal !== null && !isNaN(parseInt(rxVal, 10)) ? parseInt(rxVal, 10) : 12);
      const defBr = isSlanted ? 24 : (rxVal !== null && !isNaN(parseInt(rxVal, 10)) ? parseInt(rxVal, 10) : 12);

      return {
        tl: parseR(rawTl !== null ? rawTl : rxVal, defTl),
        tr: parseR(rawTr !== null ? rawTr : rxVal, defTr),
        bl: parseR(rawBl !== null ? rawBl : rxVal, defBl),
        br: parseR(rawBr !== null ? rawBr : rxVal, defBr)
      };
    }
    return { tl: 12, tr: 12, bl: 12, br: 12 };
  });
  const [isRadiusLinked, setIsRadiusLinked] = useState(() => {
    if (currentElement) {
      const savedCornerLinked = currentElement.getAttribute('data-corner-linked');
      if (savedCornerLinked !== null) return savedCornerLinked !== 'false';
      const rawTl = currentElement.getAttribute('data-tl');
      const rawTr = currentElement.getAttribute('data-tr');
      const rawBl = currentElement.getAttribute('data-bl');
      const rawBr = currentElement.getAttribute('data-br');
      if (rawTl !== null && rawTr !== null && rawBl !== null && rawBr !== null) {
        return rawTl === rawTr && rawTl === rawBl && rawTl === rawBr;
      }
    }
    const isSlanted = currentElement?.getAttribute('data-button-template') === 'slanted-border' ||
      currentElement?.getAttribute('data-button-template') === 'slanted-pastel' ||
      (currentElement?.getAttribute('data-tl') === '24' && currentElement?.getAttribute('data-tr') === '0');
    return isSlanted ? false : true;
  });

  // ─── 6. Effects States ──────────────────────────────────────────
  const [activeEffects, setActiveEffects] = useState(['Drop Shadow']);
  const [effectSettings, setEffectSettings] = useState({
    'Drop Shadow': {
      x: 2,
      y: 2,
      blur: 0,
      spread: 0,
      color: '#000000',
      opacity: 35
    }
  });

  const [openSection, setOpenSection] = useState(null);
  const [activeColorPicker, setActiveColorPicker] = useState(null);

  const lastElementIdRef = useRef(null);

  // Read current values from targetElement on initial select or id change
  useEffect(() => {
    const el = resolveTargetElement();
    if (!el) return;

    const currentId = el.id || selectedLayerId;
    const isNewElement = currentId !== lastElementIdRef.current;
    lastElementIdRef.current = currentId;

    if (!isNewElement) return;

    // 1. Text Properties
    const textEl = el.querySelector('text') || (el.tagName?.toLowerCase() === 'text' ? el : null);
    let textWasHidden = false;
    let cleanFF = 'Poppins';
    let parsedFs = 14;
    if (textEl) {
      setButtonText(textEl.textContent || 'Button');

      const ff = textEl.style.fontFamily || textEl.getAttribute('font-family') || '';
      if (ff) {
        cleanFF = ff.replace(/['"]/g, '').split(',')[0].trim() || 'Poppins';
      }
      setFontFamily(cleanFF);

      const fw = textEl.style.fontWeight || textEl.getAttribute('font-weight') || '600';
      setFontWeight(fw);

      const fs = textEl.getAttribute('font-size') || textEl.style.fontSize;
      parsedFs = fs ? parseInt(fs) : 12;
      if (!parsedFs || parsedFs <= 0) {
        parsedFs = 12;
        textWasHidden = true;
        textEl.setAttribute('font-size', '12');
        if (textEl.style) textEl.style.fontSize = '12px';
      }
      setFontSize(parsedFs);

      const tfc = extractColorOrGradient(textEl, 'fill', '#ffffff');
      setTextFillColor(tfc === 'none' ? '#ffffff' : tfc);

      const to = textEl.getAttribute('fill-opacity') || textEl.getAttribute('opacity') || '1';
      let parsedTo = Math.round(parseFloat(to) * 100);
      if (parsedTo <= 0) {
        parsedTo = 100;
        textWasHidden = true;
        textEl.setAttribute('opacity', '1');
        textEl.setAttribute('fill-opacity', '1');
      }
      setTextOpacity(parsedTo);

      if (textEl.getAttribute('display') === 'none' || textEl.style?.display === 'none') {
        textWasHidden = true;
        textEl.removeAttribute('display');
        if (textEl.style) textEl.style.display = '';
      }
    }

    // 2. Icon Properties
    const iconEl = el.querySelector('.btn-icon');
    const rawHasIcon = el.getAttribute('data-has-icon');
    const currentHasIcon = rawHasIcon !== null ? rawHasIcon === 'true' : (iconEl !== null ? true : true);
    setHasIcon(currentHasIcon);

    const savedIconName = el.getAttribute('data-icon-name') || iconEl?.getAttribute('data-icon-name') || 'Check';
    setIconName(savedIconName);

    const existingSvg = iconEl?.querySelector('svg');
    const savedIconHtml = existingSvg ? existingSvg.innerHTML : '';
    const savedIconViewBox = existingSvg ? (existingSvg.getAttribute('viewBox') || '0 0 24 24') : '0 0 24 24';
    if (savedIconHtml) {
      setIconHtml(savedIconHtml);
      setIconViewBox(savedIconViewBox);
    }

    const savedPlacement = el.getAttribute('data-icon-placement') || 'Left';
    setIconPlacement(savedPlacement);

    const existingSvgStroke = existingSvg?.getAttribute('stroke') || existingSvg?.style?.stroke;
    const existingSvgFill = existingSvg?.getAttribute('fill') || existingSvg?.style?.fill;
    const detectedIconColor = (existingSvgStroke && existingSvgStroke !== 'none')
      ? existingSvgStroke
      : ((existingSvgFill && existingSvgFill !== 'none') ? existingSvgFill : null);

    const savedIconColor = el.getAttribute('data-icon-color') || detectedIconColor || '#ffffff';
    setIconColor(savedIconColor);

    const savedIconOpacity = el.getAttribute('data-icon-opacity') || '100';
    setIconOpacity(parseInt(savedIconOpacity) || 100);

    let savedIconBgColor = el.getAttribute('data-icon-bg-color');
    const badgeEl = el.querySelector('.btn-badge-circle, .btn-badge-block, .btn-icon-bg') ||
      el.querySelector('polygon:not(.btn-main-poly)');

    if (!savedIconBgColor && badgeEl) {
      savedIconBgColor = extractColorOrGradient(badgeEl, 'fill', null) || badgeEl.getAttribute('fill');
    }
    if (!savedIconBgColor) {
      const btnTemplate = el.getAttribute('data-button-template');
      if (btnTemplate === 'white-pill-badge' || btnTemplate === 'rect-badge') {
        savedIconBgColor = '#1e1b4b';
      } else if (btnTemplate === 'social-badge') {
        savedIconBgColor = '#ffffff';
      } else if (btnTemplate === 'lavender-badge') {
        savedIconBgColor = '#a855f7';
      } else {
        savedIconBgColor = badgeEl ? '#1e1b4b' : 'none';
      }
    }
    setIconBgColor(savedIconBgColor || 'none');

    const savedIconBgOpacity = el.getAttribute('data-icon-bg-opacity') ||
      (badgeEl ? Math.round(parseFloat(badgeEl.getAttribute('fill-opacity') || badgeEl.getAttribute('opacity') || '1') * 100) : 100);
    setIconBgOpacity(parseInt(savedIconBgOpacity) || 100);

    const savedIconGap = el.getAttribute('data-icon-gap') || '4';
    setIconGap(parseInt(savedIconGap) || 4);

    // 3. Padding Properties
    const savedPaddingW = el.getAttribute('data-padding-w');
    const savedPaddingH = el.getAttribute('data-padding-h');
    setPaddingW(savedPaddingW !== null ? (parseInt(savedPaddingW, 10) || 0) : 0);
    setPaddingH(savedPaddingH !== null ? (parseInt(savedPaddingH, 10) || 0) : 0);
    const savedPadLinked = el.getAttribute('data-padding-linked');
    setIsPaddingLinked(savedPadLinked !== 'false');

    // 4. Shape Fill & Stroke Properties
    const mainPoly = el.querySelector('.btn-main-poly');
    const rectEl = el.querySelector('rect.btn-bg') || el.querySelector('rect') || (el.tagName?.toLowerCase() === 'rect' ? el : null);
    const shapeEl = mainPoly || rectEl;

    if (shapeEl) {
      const sfc = extractColorOrGradient(shapeEl, 'fill', '#000000');
      setShapeFillColor(sfc);

      const soFill = shapeEl.getAttribute('fill-opacity') || shapeEl.getAttribute('opacity') || '1';
      setShapeOpacity(Math.round(parseFloat(soFill) * 100));

      const sc = extractColorOrGradient(shapeEl, 'stroke', '#000000');
      setStrokeColor(sc || '#000000');

      const rawSw = shapeEl.getAttribute('data-stroke-width') || shapeEl.getAttribute('stroke-width') || shapeEl.style?.strokeWidth || '1';
      const actualSw = shapeEl.hasAttribute('data-stroke-width')
        ? parseFloat(shapeEl.getAttribute('data-stroke-width')) || 0
        : (shapeEl.getAttribute('paint-order') === 'stroke fill' ? (parseFloat(rawSw) || 0) / 2 : (parseFloat(rawSw) || 0));
      setStrokeWidth(actualSw || (shapeEl.getAttribute('stroke') && shapeEl.getAttribute('stroke') !== 'none' ? 1 : 0));

      const so = shapeEl.getAttribute('stroke-opacity') || shapeEl.style?.strokeOpacity || '1';
      setStrokeOpacity(Math.round(parseFloat(so) * 100));

      const sa = 'Outside';
      setStrokeAlignment(sa);

      const sda = shapeEl.getAttribute('stroke-dasharray');
      if (!sda || sda === 'none') {
        setLineStyle('Solid');
      } else if (sda.includes('2,') || sda.includes('1,')) {
        setLineStyle('Dotted');
      } else {
        setLineStyle('Dashed');
      }

      const slc = shapeEl.getAttribute('stroke-linecap') || 'round';
      setLineCorner(slc === 'round' ? 'Rounded' : 'Square');

      const savedDashL = el.getAttribute('data-dash-l') || '8';
      const savedDashG = el.getAttribute('data-dash-g') || '4';
      setDashL(parseInt(savedDashL) || 8);
      setDashG(parseInt(savedDashG) || 4);
    }

    // 5. Corner Radius
    const isSlantedBorder = el.getAttribute('data-button-template') === 'slanted-border' ||
      el.getAttribute('data-button-template') === 'slanted-pastel' ||
      (el.getAttribute('data-tl') === '24' && el.getAttribute('data-tr') === '0');

    const parseRadiusAttr = (attrVal, fallback) => {
      if (attrVal === null || attrVal === undefined || attrVal === '') return fallback;
      const num = parseInt(attrVal, 10);
      return !isNaN(num) ? num : fallback;
    };

    const defaultTl = isSlantedBorder ? 24 : 12;
    const defaultTr = isSlantedBorder ? 0 : 12;
    const defaultBl = isSlantedBorder ? 0 : 12;
    const defaultBr = isSlantedBorder ? 24 : 12;

    const rawTl = el.getAttribute('data-tl');
    const rawTr = el.getAttribute('data-tr');
    const rawBl = el.getAttribute('data-bl');
    const rawBr = el.getAttribute('data-br');

    const loadedRadius = {
      tl: parseRadiusAttr(rawTl !== null ? rawTl : rectEl?.getAttribute('rx'), defaultTl),
      tr: parseRadiusAttr(rawTr !== null ? rawTr : rectEl?.getAttribute('rx'), defaultTr),
      bl: parseRadiusAttr(rawBl !== null ? rawBl : rectEl?.getAttribute('rx'), defaultBl),
      br: parseRadiusAttr(rawBr !== null ? rawBr : rectEl?.getAttribute('rx'), defaultBr)
    };
    setRadius(loadedRadius);

    if (isSlantedBorder) {
      el.setAttribute('data-tl', loadedRadius.tl.toString());
      el.setAttribute('data-tr', loadedRadius.tr.toString());
      el.setAttribute('data-bl', loadedRadius.bl.toString());
      el.setAttribute('data-br', loadedRadius.br.toString());
      if (!el.getAttribute('data-corner-linked')) el.setAttribute('data-corner-linked', 'false');
    }

    const savedCornerLinked = el.getAttribute('data-corner-linked');
    const isLinked = savedCornerLinked !== null
      ? savedCornerLinked !== 'false'
      : (isSlantedBorder ? false : (loadedRadius.tl === loadedRadius.tr && loadedRadius.tl === loadedRadius.bl && loadedRadius.tl === loadedRadius.br));
    setIsRadiusLinked(isLinked);

    const mainPolyPath = el.querySelector('path.btn-main-poly');
    if (mainPolyPath && rectEl) {
      const rw = parseFloat(rectEl.getAttribute('width') || 0);
      const rh = parseFloat(rectEl.getAttribute('height') || 0);
      const rx = parseFloat(rectEl.getAttribute('x') || 0);
      const ry = parseFloat(rectEl.getAttribute('y') || 0);
      if (rw > 0 && rh > 0) {
        mainPolyPath.setAttribute('d', getRoundedPathD(rx, ry, rw, rh, loadedRadius.tl, loadedRadius.tr, loadedRadius.br, loadedRadius.bl));
      }
    }

    const curW = rectEl ? parseFloat(rectEl.getAttribute('width') || 0) : 0;
    const curH = rectEl ? parseFloat(rectEl.getAttribute('height') || 0) : 0;
    const sizeNeedsFix = (curW > 0 && curW < 140) || (curH > 0 && curH < 42);

    if ((textWasHidden || sizeNeedsFix) && textEl) {
      updateButtonDimensions(
        textEl.textContent || buttonText || 'Button',
        parsedFs || 14,
        cleanFF,
        currentHasIcon,
        savedIconName,
        savedIconHtml || iconHtml,
        savedIconViewBox || iconViewBox,
        savedPaddingW !== null ? (parseInt(savedPaddingW, 10) || 0) : 0,
        savedPaddingH !== null ? (parseInt(savedPaddingH, 10) || 0) : 0,
        parseInt(savedIconGap) || 4,
        savedPlacement,
        loadedRadius,
        savedIconColor,
        savedIconBgColor
      );
      syncButtonToCanvas();
    }

    // 6. Effects
    const effects = [];
    if (el.getAttribute('data-effect-drop-shadow') === 'true' || el.getAttribute('data-effect-drop-shadow') === null) {
      effects.push('Drop Shadow');
    }
    setActiveEffects(effects);

    setEffectSettings(prev => ({
      ...prev,
      'Drop Shadow': {
        color: el.getAttribute('data-effect-drop-shadow-color') || '#000000',
        opacity: parseFloat(el.getAttribute('data-effect-drop-shadow-opacity') || 35),
        x: parseFloat(el.getAttribute('data-effect-drop-shadow-x') || 2),
        y: parseFloat(el.getAttribute('data-effect-drop-shadow-y') || 2),
        blur: parseFloat(el.getAttribute('data-effect-drop-shadow-blur') || 0),
        spread: parseFloat(el.getAttribute('data-effect-drop-shadow-spread') || 0)
      }
    }));

    // Restrict access to sub layers: enforce pointer-events: none on all children
    el.setAttribute('cursor', 'pointer');
    el.setAttribute('pointer-events', 'all');
    if (el.style) {
      el.style.cursor = 'pointer';
      el.style.pointerEvents = 'all';
    }
    Array.from(el.children).forEach(child => {
      child.setAttribute('pointer-events', 'none');
      if (child.style) child.style.pointerEvents = 'none';
      if (child.tagName?.toLowerCase() === 'text') {
        child.removeAttribute('data-type');
      }
    });
  }, [selectedElement, selectedLayerId]);

  // Apply or remove SVG filter for Drop Shadow
  const applyDropShadowFilter = (hasDropShadow, dsSettings = effectSettings['Drop Shadow']) => {
    const el = resolveTargetElement();
    if (!el) return;

    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const svgRoot = el.closest('svg') || editorDoc.querySelector('.page-svg-container svg') || editorDoc.querySelector('svg');
    if (!svgRoot) return;

    const ownerDoc = svgRoot.ownerDocument || document;
    let defs = svgRoot.querySelector('defs');
    if (!defs) {
      defs = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "defs");
      svgRoot.insertBefore(defs, svgRoot.firstChild);
    }

    const baseFilterId = `filter-${el.id || selectedLayerId}`;
    Array.from(defs.querySelectorAll(`[id^="${baseFilterId}"]`)).forEach(old => old.remove());

    if (!hasDropShadow) {
      el.removeAttribute('filter');
      return;
    }

    const filterId = `${baseFilterId}-${Math.random().toString(36).substr(2, 4)}`;
    const filterEl = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "filter");
    filterEl.setAttribute('id', filterId);
    filterEl.setAttribute('x', '-50%');
    filterEl.setAttribute('y', '-50%');
    filterEl.setAttribute('width', '200%');
    filterEl.setAttribute('height', '200%');

    const color = dsSettings?.color || '#000000';
    const opacity = (parseFloat(dsSettings?.opacity !== undefined ? dsSettings.opacity : 35)) / 100;
    const dx = dsSettings?.x !== undefined ? dsSettings.x.toString() : '2';
    const dy = dsSettings?.y !== undefined ? dsSettings.y.toString() : '2';
    const blur = parseFloat(dsSettings?.blur !== undefined ? dsSettings.blur : 2);
    const spread = parseFloat(dsSettings?.spread !== undefined ? dsSettings.spread : 0);

    let dsSource = 'SourceAlpha';
    if (spread !== 0) {
      const morph = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "feMorphology");
      morph.setAttribute('operator', spread >= 0 ? 'dilate' : 'erode');
      morph.setAttribute('radius', Math.abs(spread).toString());
      morph.setAttribute('in', 'SourceAlpha');
      morph.setAttribute('result', 'ds_morph');
      filterEl.appendChild(morph);
      dsSource = 'ds_morph';
    }

    const gauss = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
    gauss.setAttribute('stdDeviation', blur.toString());
    gauss.setAttribute('in', dsSource);
    gauss.setAttribute('result', 'ds_blur');
    filterEl.appendChild(gauss);

    const offset = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "feOffset");
    offset.setAttribute('dx', dx);
    offset.setAttribute('dy', dy);
    offset.setAttribute('in', 'ds_blur');
    offset.setAttribute('result', 'ds_offset');
    filterEl.appendChild(offset);

    const flood = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "feFlood");
    flood.setAttribute('flood-color', color);
    flood.setAttribute('flood-opacity', opacity.toString());
    flood.setAttribute('result', 'ds_flood');
    filterEl.appendChild(flood);

    const comp = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "feComposite");
    comp.setAttribute('in', 'ds_flood');
    comp.setAttribute('in2', 'ds_offset');
    comp.setAttribute('operator', 'in');
    comp.setAttribute('result', 'ds_final');
    filterEl.appendChild(comp);

    const merge = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "feMerge");
    const nodeShadow = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
    nodeShadow.setAttribute('in', 'ds_final');
    const nodeGraphic = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
    nodeGraphic.setAttribute('in', 'SourceGraphic');
    merge.appendChild(nodeShadow);
    merge.appendChild(nodeGraphic);
    filterEl.appendChild(merge);

    defs.appendChild(filterEl);
    el.setAttribute('filter', `url(#${filterId})`);
  };

  // Helper to generate and inject SVG linear/radial gradient in <defs>
  const applySvgGradient = (colorVal, targetAttr, targetElName) => {
    const el = resolveTargetElement();
    if (!el) return colorVal;

    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const svgRoot = el.closest('svg') || editorDoc.querySelector('.page-svg-container svg') || editorDoc.querySelector('svg');
    const ownerDoc = svgRoot?.ownerDocument || el.ownerDocument || document;

    // 1. Maintain defs inside button group itself so gradients travel with the button
    let elDefs = el.querySelector(':scope > defs') || el.querySelector('defs');
    if (!elDefs) {
      elDefs = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "defs");
      el.insertBefore(elDefs, el.firstChild);
    }

    // 2. Also maintain defs in top-level svgRoot if available
    let rootDefs = svgRoot ? (svgRoot.querySelector(':scope > defs') || svgRoot.querySelector('defs')) : null;
    if (svgRoot && !rootDefs) {
      rootDefs = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "defs");
      svgRoot.insertBefore(rootDefs, svgRoot.firstChild);
    }

    const baseGradId = `grad-${el.id || selectedLayerId}-${targetElName}-${targetAttr}`;
    Array.from(elDefs.querySelectorAll(`[id^="${baseGradId}"]`)).forEach(old => old.remove());
    if (rootDefs) {
      Array.from(rootDefs.querySelectorAll(`[id^="${baseGradId}"]`)).forEach(old => old.remove());
    }

    if (!colorVal || !colorVal.includes('gradient')) {
      return colorVal;
    }

    const parsed = parseGradient(colorVal);
    if (!parsed || !parsed.stops || parsed.stops.length === 0) {
      return colorVal;
    }

    const gradId = `${baseGradId}-${Math.random().toString(36).substr(2, 4)}`;
    let gradEl;

    if (parsed.type === 'Linear') {
      gradEl = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      const angleRad = ((parsed.angle || 0) * Math.PI) / 180;
      const dx = Math.sin(angleRad) * 50;
      const dy = -Math.cos(angleRad) * 50;
      gradEl.setAttribute('x1', `${Math.round(50 - dx)}%`);
      gradEl.setAttribute('y1', `${Math.round(50 - dy)}%`);
      gradEl.setAttribute('x2', `${Math.round(50 + dx)}%`);
      gradEl.setAttribute('y2', `${Math.round(50 + dy)}%`);
    } else {
      gradEl = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
      gradEl.setAttribute('cx', '50%');
      gradEl.setAttribute('cy', '50%');
      gradEl.setAttribute('r', `${parsed.radius || 50}%`);
    }

    gradEl.setAttribute('id', gradId);
    parsed.stops.forEach(stop => {
      const stopEl = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "stop");
      stopEl.setAttribute('offset', `${stop.offset}%`);
      stopEl.setAttribute('stop-color', stop.color);
      stopEl.setAttribute('stop-opacity', ((stop.opacity !== undefined ? stop.opacity : 100) / 100).toString());
      gradEl.appendChild(stopEl);
    });

    elDefs.appendChild(gradEl);
    if (rootDefs) {
      rootDefs.appendChild(gradEl.cloneNode(true));
    }
    return `url(#${gradId})`;
  };

  // Synchronize entire button SVG to MainEditor
  const syncButtonToCanvas = (withFilterSync = false, dsActive = null, dsSettings = null) => {
    const el = resolveTargetElement();
    if (!el) return;

    if (withFilterSync) {
      const isDs = dsActive !== null ? dsActive : activeEffects.includes('Drop Shadow');
      applyDropShadowFilter(isDs, dsSettings || effectSettings['Drop Shadow']);
    }

    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const svgRoot = el.closest('svg') || editorDoc.querySelector('.page-svg-container svg') || editorDoc.querySelector('svg');
    if (!svgRoot) return;

    if (onUpdate) {
      onUpdate();
    } else if (updateElementAttribute) {
      const serializer = new XMLSerializer();
      updateElementAttribute(activePageIndex, el.id || selectedLayerId, '__dom_sync__', serializer.serializeToString(svgRoot));
    }
    window.dispatchEvent(new CustomEvent('force-update-selection-box'));
  };

  // Dynamically update button width, height, position text & icon with padding & gap
  const updateButtonDimensions = (
    textVal = buttonText,
    currentFontSize = fontSize,
    currentFontFamily = fontFamily,
    hasIconVal = hasIcon,
    currentIconName = iconName,
    currentIconHtml = iconHtml,
    currentIconViewBox = iconViewBox,
    currentPaddingW = paddingW,
    currentPaddingH = paddingH,
    currentIconGap = iconGap,
    currentPlacement = iconPlacement,
    currentRadius = radius,
    currentIconColor = iconColor,
    currentIconBgColor = iconBgColor
  ) => {
    const el = resolveTargetElement();
    if (!el) return;

    const textEl = el.querySelector('text') || (el.tagName?.toLowerCase() === 'text' ? el : null);
    const rectEl = el.querySelector('rect.btn-bg') || el.querySelector('rect') || (el.tagName?.toLowerCase() === 'rect' ? el : null);
    if (!textEl || !rectEl) return;

    // Estimate text width accurately
    let measuredWidth = 0;
    try {
      if (typeof textEl.getComputedTextLength === 'function' && textEl.getComputedTextLength() > 0) {
        measuredWidth = textEl.getComputedTextLength();
      }
    } catch (_) {}

    if (!measuredWidth || measuredWidth < 10) {
      const charRatio = currentFontFamily.toLowerCase().includes('banger') ? 0.6 : 0.58;
      measuredWidth = (textVal.length || 1) * (currentFontSize * charRatio);
    }

    const iconSize = Math.max(10, Math.round(currentFontSize));

    // Check if icon has a badge circle or background
    let badgeEl = el.querySelector('.btn-badge-circle, .btn-badge-block, .btn-icon-bg') ||
      el.querySelector('polygon:not(.btn-main-poly)');

    const hasIconBg = Boolean(
      hasIconVal &&
      currentIconBgColor &&
      currentIconBgColor !== 'none' &&
      currentIconBgColor !== 'transparent'
    );

    const badgeRadius = Math.max(14, Math.round(iconSize * 0.85));
    const effectiveIconWidth = (hasIconBg || (badgeEl && badgeEl.getAttribute('display') !== 'none' && badgeEl.getAttribute('fill') !== 'none'))
      ? Math.max(iconSize, badgeRadius * 2)
      : iconSize;

    const totalContentWidth = hasIconVal
      ? measuredWidth + currentIconGap + effectiveIconWidth
      : measuredWidth;

    // Padding scaling
    const horizPad = Math.max(currentPaddingW * 4, 16);
    const vertPad = Math.max(currentPaddingH * 3, 10);
    const curW = parseFloat(rectEl.getAttribute('width') || 0);
    const curH = parseFloat(rectEl.getAttribute('height') || 0);
    const minW = curW > 0 ? Math.max(140, curW) : 140;
    const minH = curH > 0 ? Math.max(42, curH) : 42;
    const newButtonWidth = Math.max(minW, Math.round(totalContentWidth + horizPad * 2));
    const newButtonHeight = Math.max(minH, Math.round(Math.max(currentFontSize, hasIconVal ? Math.max(iconSize, (hasIconBg || badgeEl) ? badgeRadius * 2 : 0) : 0) + vertPad * 2));

    const rectX = parseFloat(rectEl.getAttribute('x') || 0);
    const rectY = parseFloat(rectEl.getAttribute('y') || 0);

    // Update rect width & height
    rectEl.setAttribute('width', newButtonWidth.toString());
    rectEl.setAttribute('height', newButtonHeight.toString());

    // Apply corner radius & shape geometry
    const isPill = el.getAttribute('data-button-template') === 'solid-pill' ||
      el.getAttribute('data-button-template') === 'white-pill-badge' ||
      el.getAttribute('data-button-template') === 'gradient-pill' ||
      el.getAttribute('data-button-template') === 'lavender-badge' ||
      el.getAttribute('data-button-template') === 'mint-frost' ||
      el.getAttribute('data-button-template') === 'pearl-pill' ||
      el.getAttribute('data-button-template') === 'diagonal-pastel';
    const isSlanted = el.getAttribute('data-button-template') === 'slanted-border' ||
      el.getAttribute('data-button-template') === 'slanted-pastel' ||
      (el.getAttribute('data-tl') === '24' && el.getAttribute('data-tr') === '0');

    const savedTl = el.getAttribute('data-tl');
    const savedTr = el.getAttribute('data-tr');
    const savedBl = el.getAttribute('data-bl');
    const savedBr = el.getAttribute('data-br');

    const parseR = (val, fb) => {
      if (val === undefined || val === null || val === '') return fb;
      const n = Number(val);
      return !isNaN(n) ? n : fb;
    };

    let radTl = parseR(currentRadius?.tl, parseR(savedTl, isPill ? newButtonHeight / 2 : (isSlanted ? 24 : 12)));
    let radTr = parseR(currentRadius?.tr, parseR(savedTr, isPill ? newButtonHeight / 2 : (isSlanted ? 0 : 12)));
    let radBl = parseR(currentRadius?.bl, parseR(savedBl, isPill ? newButtonHeight / 2 : (isSlanted ? 0 : 12)));
    let radBr = parseR(currentRadius?.br, parseR(savedBr, isPill ? newButtonHeight / 2 : (isSlanted ? 24 : 12)));

    const maxR = Math.max(radTl, radTr, radBl, radBr);
    const areCornersEqual = radTl === radTr && radTl === radBl && radTl === radBr;

    el.setAttribute('data-tl', radTl.toString());
    el.setAttribute('data-tr', radTr.toString());
    el.setAttribute('data-bl', radBl.toString());
    el.setAttribute('data-br', radBr.toString());

    rectEl.setAttribute('rx', maxR.toString());
    rectEl.setAttribute('ry', maxR.toString());

    let mainPoly = el.querySelector('.btn-main-poly');
    const btnTemplate = el.getAttribute('data-button-template');

    if (mainPoly) {
      if (mainPoly.tagName?.toLowerCase() === 'path') {
        const pathD = getRoundedPathD(rectX, rectY, newButtonWidth, newButtonHeight, radTl, radTr, radBr, radBl);
        mainPoly.setAttribute('d', pathD);
      } else if (mainPoly.tagName?.toLowerCase() === 'polygon') {
        if (btnTemplate === 'like-chevron') {
          mainPoly.setAttribute('points', `${rectX},${rectY} ${rectX + newButtonWidth - 12},${rectY} ${rectX + newButtonWidth},${rectY + newButtonHeight / 2} ${rectX + newButtonWidth - 12},${rectY + newButtonHeight} ${rectX},${rectY + newButtonHeight}`);
        }
      }
    } else if (!areCornersEqual) {
      // If user sets asymmetrical corner radii on a regular button, convert visual body to <path class="btn-main-poly">
      const ownerDoc = el.ownerDocument || document;
      mainPoly = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "path");
      mainPoly.setAttribute('class', 'btn-main-poly');

      ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'data-fill-color', 'data-stroke-color'].forEach(attr => {
        const val = rectEl.getAttribute(attr);
        if (val !== null) mainPoly.setAttribute(attr, val);
      });
      if (rectEl.style?.fill) mainPoly.style.fill = rectEl.style.fill;
      if (rectEl.style?.stroke) mainPoly.style.stroke = rectEl.style.stroke;

      const pathD = getRoundedPathD(rectX, rectY, newButtonWidth, newButtonHeight, radTl, radTr, radBr, radBl);
      mainPoly.setAttribute('d', pathD);

      rectEl.parentNode.insertBefore(mainPoly, rectEl.nextSibling);
      rectEl.setAttribute('fill', 'none');
      rectEl.setAttribute('stroke', 'none');
      rectEl.setAttribute('opacity', '0');
    }

    // Update clipPath & border rect if they exist
    const ownerDoc = el.ownerDocument || document;
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const svgRoot = el.closest('svg') || editorDoc.querySelector('.page-svg-container svg') || editorDoc.querySelector('svg');

    // Identify accent shapes
    const placement = currentPlacement || el.getAttribute('data-icon-placement') || 'Left';
    const blockPoly = el.querySelector('polygon:not(.btn-main-poly)');
    const ribbonPoly = el.querySelector('polygon:not(.btn-main-poly)') || (btnTemplate === 'upload-ribbon' || btnTemplate === 'lemon-ribbon' ? el.querySelector('polygon') : null);
    const slicePoly = el.querySelector('g[clip-path] polygon');
    const badgeBlock = el.querySelector('.btn-badge-block');
    let badgeCircle = el.querySelector('.btn-badge-circle, .btn-icon-bg');
    if (!badgeCircle && badgeEl && badgeEl.tagName?.toLowerCase() === 'circle') {
      badgeCircle = badgeEl;
    }

    // Ensure clipPath exists and clips ribbons / accent shapes cleanly to corner radius
    let clipEl = el.querySelector('clipPath') || (svgRoot ? svgRoot.querySelector(`clipPath[id*="${el.id}"]`) : null);
    const clipId = clipEl?.getAttribute('id') || `clip-${el.id || selectedLayerId || Date.now()}`;

    if (!clipEl && (ribbonPoly || slicePoly || badgeBlock || btnTemplate === 'upload-ribbon' || btnTemplate === 'lemon-ribbon' || btnTemplate === 'angled-slice' || btnTemplate === 'diagonal-pastel' || btnTemplate === 'rect-badge')) {
      let defs = el.querySelector(':scope > defs') || el.querySelector('defs');
      if (!defs) {
        defs = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "defs");
        el.insertBefore(defs, el.firstChild);
      }
      clipEl = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      clipEl.setAttribute('id', clipId);
      defs.appendChild(clipEl);
    }

    if (clipEl) {
      if (!clipEl.getAttribute('id')) clipEl.setAttribute('id', clipId);
      const activeClipId = clipEl.getAttribute('id');

      // Wrap ribbon in clip-path group if not already wrapped
      if (ribbonPoly && !ribbonPoly.getAttribute('clip-path') && !ribbonPoly.parentElement?.getAttribute('clip-path')) {
        const ribbonWrap = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "g");
        ribbonWrap.setAttribute('clip-path', `url(#${activeClipId})`);
        ribbonWrap.setAttribute('pointer-events', 'none');
        ribbonWrap.style.pointerEvents = 'none';
        ribbonPoly.parentNode.insertBefore(ribbonWrap, ribbonPoly);
        ribbonWrap.appendChild(ribbonPoly);
      }

      // Update clipping geometry according to corner radius
      if (areCornersEqual) {
        clipEl.innerHTML = `<rect class="btn-clip-rect" x="${rectX}" y="${rectY}" width="${newButtonWidth}" height="${newButtonHeight}" rx="${maxR}" ry="${maxR}" />`;
      } else {
        const pathD = getRoundedPathD(rectX, rectY, newButtonWidth, newButtonHeight, radTl, radTr, radBr, radBl);
        clipEl.innerHTML = `<path class="btn-clip-path" d="${pathD}" />`;
      }

      const rootClip = svgRoot?.querySelector(`#${activeClipId}`);
      if (rootClip && rootClip !== clipEl) {
        rootClip.innerHTML = clipEl.innerHTML;
      }
    }

    const borderRect = el.querySelector('rect.btn-border');
    if (borderRect) {
      borderRect.setAttribute('x', rectX.toString());
      borderRect.setAttribute('y', rectY.toString());
      borderRect.setAttribute('width', newButtonWidth.toString());
      borderRect.setAttribute('height', newButtonHeight.toString());
      borderRect.setAttribute('rx', maxR.toString());
      borderRect.setAttribute('ry', maxR.toString());
    }

    let iconWrap = el.querySelector('.btn-icon');

    if (!hasIconVal) {
      if (iconWrap) iconWrap.remove();
      if (blockPoly) blockPoly.setAttribute('display', 'none');
      if (ribbonPoly) ribbonPoly.setAttribute('display', 'none');
      if (slicePoly) slicePoly.setAttribute('display', 'none');
      if (badgeBlock) badgeBlock.setAttribute('display', 'none');
      if (badgeCircle) badgeCircle.setAttribute('display', 'none');
      if (badgeEl) badgeEl.setAttribute('display', 'none');

      const centerX = rectX + newButtonWidth / 2;
      const centerY = rectY + newButtonHeight / 2;
      textEl.setAttribute('x', centerX.toString());
      textEl.setAttribute('y', centerY.toString());
      textEl.setAttribute('text-anchor', 'middle');
      textEl.setAttribute('dominant-baseline', 'middle');
      textEl.style.textAnchor = 'middle';
      textEl.style.dominantBaseline = 'middle';
    } else {
      if (!iconWrap) {
        iconWrap = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "g");
        iconWrap.setAttribute('class', 'btn-icon');
        el.appendChild(iconWrap);
      }
      iconWrap.setAttribute('data-icon-name', currentIconName || 'Check');

      let svgMarkup = '';
      if (currentIconHtml) {
        svgMarkup = `<svg width="${iconSize}" height="${iconSize}" viewBox="${currentIconViewBox || '0 0 24 24'}" fill="none" stroke="${currentIconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${currentIconHtml}</svg>`;
      } else {
        svgMarkup = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${currentIconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      }
      iconWrap.innerHTML = svgMarkup;

      const centerY = rectY + newButtonHeight / 2;
      let iconX, iconY, textX, textY, badgeCenterX;

      if (btnTemplate === 'like-chevron' && blockPoly) {
        blockPoly.removeAttribute('display');
        if (blockPoly.style) blockPoly.style.display = '';
        const blockW = Math.max(38, iconSize + 16);
        if (placement === 'Left') {
          blockPoly.setAttribute('points', `${rectX},${rectY} ${rectX + blockW},${rectY} ${rectX + blockW},${rectY + newButtonHeight} ${rectX},${rectY + newButtonHeight}`);
          iconX = rectX + (blockW - iconSize) / 2;
          iconY = centerY - iconSize / 2;
          textX = (rectX + blockW) + (newButtonWidth - 12 - blockW) / 2;
          textY = centerY;
        } else {
          blockPoly.setAttribute('points', `${rectX + newButtonWidth - blockW},${rectY} ${rectX + newButtonWidth - 12},${rectY} ${rectX + newButtonWidth},${rectY + newButtonHeight / 2} ${rectX + newButtonWidth - 12},${rectY + newButtonHeight} ${rectX + newButtonWidth - blockW},${rectY + newButtonHeight}`);
          iconX = rectX + newButtonWidth - blockW + (blockW - 6 - iconSize) / 2;
          iconY = centerY - iconSize / 2;
          textX = rectX + (newButtonWidth - blockW) / 2;
          textY = centerY;
        }
      } else if ((btnTemplate === 'upload-ribbon' || btnTemplate === 'lemon-ribbon') && ribbonPoly) {
        ribbonPoly.removeAttribute('display');
        if (ribbonPoly.style) ribbonPoly.style.display = '';
        if (placement === 'Left') {
          const leftR = Math.max(0, Math.min(newButtonHeight / 2, Math.max(radTl, radBl)));
          const cornerOffset = leftR > 4 ? Math.round((leftR - 4) * 0.45) : 0;
          const flatW = 34 + cornerOffset;
          const ribbonPointW = flatW + 8;
          ribbonPoly.setAttribute('points', `${rectX},${rectY} ${rectX + flatW},${rectY} ${rectX + ribbonPointW},${centerY} ${rectX + flatW},${rectY + newButtonHeight} ${rectX},${rectY + newButtonHeight}`);
          iconX = rectX + 10 + cornerOffset;
          iconY = centerY - iconSize / 2;
          textX = (rectX + ribbonPointW) + (newButtonWidth - ribbonPointW) / 2;
          textY = centerY;
        } else {
          const rightR = Math.max(0, Math.min(newButtonHeight / 2, Math.max(radTr, radBr)));
          const cornerOffset = rightR > 4 ? Math.round((rightR - 4) * 0.45) : 0;
          const flatW = 34 + cornerOffset;
          const ribbonPointW = flatW + 8;
          ribbonPoly.setAttribute('points', `${rectX + newButtonWidth},${rectY} ${rectX + newButtonWidth - flatW},${rectY} ${rectX + newButtonWidth - ribbonPointW},${centerY} ${rectX + newButtonWidth - flatW},${rectY + newButtonHeight} ${rectX + newButtonWidth},${rectY + newButtonHeight}`);
          iconX = rectX + newButtonWidth - flatW + (flatW - iconSize) / 2 - cornerOffset;
          iconY = centerY - iconSize / 2;
          textX = rectX + (newButtonWidth - ribbonPointW) / 2;
          textY = centerY;
        }
      } else if (btnTemplate === 'rect-badge' && badgeBlock) {
        badgeBlock.removeAttribute('display');
        if (badgeBlock.style) badgeBlock.style.display = '';
        if (placement === 'Left') {
          const leftR = Math.max(0, Math.min(newButtonHeight / 2, Math.max(radTl, radBl)));
          const cornerOffset = leftR > 4 ? Math.round((leftR - 4) * 0.45) : 0;
          const badgeW = 38 + cornerOffset;
          badgeBlock.setAttribute('d', `M ${rectX},${rectY} L ${rectX + badgeW},${rectY} L ${rectX + badgeW},${rectY + newButtonHeight} L ${rectX},${rectY + newButtonHeight} Z`);
          iconX = rectX + 11 + cornerOffset;
          iconY = centerY - iconSize / 2;
          textX = (rectX + badgeW) + (newButtonWidth - badgeW) / 2;
          textY = centerY;
        } else {
          const rightR = Math.max(0, Math.min(newButtonHeight / 2, Math.max(radTr, radBr)));
          const cornerOffset = rightR > 4 ? Math.round((rightR - 4) * 0.45) : 0;
          const badgeW = 38 + cornerOffset;
          badgeBlock.setAttribute('d', `M ${rectX + newButtonWidth - badgeW},${rectY} L ${rectX + newButtonWidth},${rectY} L ${rectX + newButtonWidth},${rectY + newButtonHeight} L ${rectX + newButtonWidth - badgeW},${rectY + newButtonHeight} Z`);
          iconX = rectX + newButtonWidth - badgeW + (badgeW - iconSize) / 2 - cornerOffset;
          iconY = centerY - iconSize / 2;
          textX = rectX + (newButtonWidth - badgeW) / 2;
          textY = centerY;
        }
      } else if ((btnTemplate === 'angled-slice' || btnTemplate === 'diagonal-pastel') && slicePoly) {
        slicePoly.removeAttribute('display');
        if (slicePoly.style) slicePoly.style.display = '';
        const sliceW = Math.max(42, iconSize + 22);
        if (placement === 'Left') {
          slicePoly.setAttribute('points', `${rectX - 5},${rectY - 5} ${rectX + sliceW},${rectY - 5} ${rectX + sliceW - 16},${rectY + newButtonHeight + 5} ${rectX - 5},${rectY + newButtonHeight + 5}`);
          iconX = rectX + 12;
          iconY = centerY - iconSize / 2;
          textX = (rectX + sliceW - 8) + (newButtonWidth - (sliceW - 8)) / 2;
          textY = centerY;
        } else {
          slicePoly.setAttribute('points', `${rectX + newButtonWidth - sliceW + 16},${rectY - 5} ${rectX + newButtonWidth + 5},${rectY - 5} ${rectX + newButtonWidth + 5},${rectY + newButtonHeight + 5} ${rectX + newButtonWidth - sliceW},${rectY + newButtonHeight + 5}`);
          iconX = rectX + newButtonWidth - 12 - iconSize;
          iconY = centerY - iconSize / 2;
          textX = rectX + (newButtonWidth - (sliceW - 8)) / 2;
          textY = centerY;
        }
      } else if ((btnTemplate === 'white-pill-badge' || btnTemplate === 'social-badge' || btnTemplate === 'lavender-badge') && (badgeCircle || (badgeEl && badgeEl.tagName?.toLowerCase() === 'circle'))) {
        const circleEl = badgeCircle || badgeEl;
        const bRadius = Math.max(14, Math.round(newButtonHeight / 2 - 4));
        if (placement === 'Left') {
          badgeCenterX = rectX + newButtonHeight / 2;
          iconX = badgeCenterX - iconSize / 2;
          iconY = centerY - iconSize / 2;
          textX = (rectX + newButtonHeight) + (newButtonWidth - newButtonHeight - 16) / 2;
          textY = centerY;
        } else {
          badgeCenterX = rectX + newButtonWidth - newButtonHeight / 2;
          iconX = badgeCenterX - iconSize / 2;
          iconY = centerY - iconSize / 2;
          textX = (rectX + 16) + (newButtonWidth - newButtonHeight - 16) / 2;
          textY = centerY;
        }
        circleEl.setAttribute('cx', badgeCenterX.toString());
        circleEl.setAttribute('cy', centerY.toString());
        circleEl.setAttribute('r', bRadius.toString());
        circleEl.removeAttribute('display');
        if (circleEl.style) circleEl.style.display = '';
      } else {
        // Standard buttons (with or without icon background circle)
        const startX = rectX + (newButtonWidth - totalContentWidth) / 2;
        if (placement === 'Left') {
          const badgeStartX = startX;
          badgeCenterX = badgeStartX + effectiveIconWidth / 2;
          iconX = badgeCenterX - iconSize / 2;
          iconY = centerY - iconSize / 2;
          textX = startX + effectiveIconWidth + currentIconGap + measuredWidth / 2;
          textY = centerY;
        } else {
          textX = startX + measuredWidth / 2;
          textY = centerY;
          const badgeStartX = startX + measuredWidth + currentIconGap;
          badgeCenterX = badgeStartX + effectiveIconWidth / 2;
          iconX = badgeCenterX - iconSize / 2;
          iconY = centerY - iconSize / 2;
        }

        if (hasIconBg) {
          let circ = el.querySelector('.btn-badge-circle, .btn-icon-bg');
          if (!circ) {
            circ = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
            circ.setAttribute('class', 'btn-badge-circle');
            circ.setAttribute('stroke', 'none');
            if (iconWrap) {
              el.insertBefore(circ, iconWrap);
            } else {
              el.appendChild(circ);
            }
          }
          const fillVal = applySvgGradient(currentIconBgColor, 'fill', 'icon-bg');
          circ.setAttribute('fill', fillVal);
          circ.setAttribute('data-fill-color', currentIconBgColor);
          circ.setAttribute('cx', badgeCenterX.toString());
          circ.setAttribute('cy', centerY.toString());
          circ.setAttribute('r', badgeRadius.toString());
          circ.removeAttribute('display');
          if (circ.style) circ.style.display = '';
        } else {
          const circ = el.querySelector('.btn-badge-circle, .btn-icon-bg');
          if (circ && btnTemplate !== 'white-pill-badge' && btnTemplate !== 'social-badge' && btnTemplate !== 'lavender-badge') {
            circ.setAttribute('display', 'none');
          }
        }
      }

      iconWrap.setAttribute('transform', `translate(${iconX}, ${iconY})`);
      textEl.setAttribute('x', textX.toString());
      textEl.setAttribute('y', textY.toString());
      textEl.setAttribute('text-anchor', 'middle');
      textEl.setAttribute('dominant-baseline', 'middle');
      textEl.style.textAnchor = 'middle';
      textEl.style.dominantBaseline = 'middle';
    }

    // Restrict access to sub layers on canvas: enforce pointer-events: none on all children
    el.setAttribute('cursor', 'pointer');
    el.setAttribute('pointer-events', 'all');
    if (el.style) {
      el.style.cursor = 'pointer';
      el.style.pointerEvents = 'all';
    }
    rectEl.setAttribute('pointer-events', 'none');
    if (rectEl.style) rectEl.style.pointerEvents = 'none';

    textEl.setAttribute('pointer-events', 'none');
    textEl.removeAttribute('data-type');
    if (textEl.style) textEl.style.pointerEvents = 'none';

    if (mainPoly) {
      mainPoly.setAttribute('pointer-events', 'none');
      if (mainPoly.style) mainPoly.style.pointerEvents = 'none';
    }
    if (borderRect) {
      borderRect.setAttribute('pointer-events', 'none');
      if (borderRect.style) borderRect.style.pointerEvents = 'none';
    }
    if (blockPoly) {
      blockPoly.setAttribute('pointer-events', 'none');
      if (blockPoly.style) blockPoly.style.pointerEvents = 'none';
    }
    if (ribbonPoly) {
      ribbonPoly.setAttribute('pointer-events', 'none');
      if (ribbonPoly.style) ribbonPoly.style.pointerEvents = 'none';
    }
    if (slicePoly) {
      slicePoly.setAttribute('pointer-events', 'none');
      if (slicePoly.style) slicePoly.style.pointerEvents = 'none';
    }
    if (badgeEl) {
      badgeEl.setAttribute('pointer-events', 'none');
      if (badgeEl.style) badgeEl.style.pointerEvents = 'none';
    }
    if (iconWrap) {
      iconWrap.setAttribute('pointer-events', 'none');
      if (iconWrap.style) iconWrap.style.pointerEvents = 'none';
      const iconSvg = iconWrap.querySelector('svg');
      if (iconSvg) {
        iconSvg.setAttribute('pointer-events', 'none');
        if (iconSvg.style) iconSvg.style.pointerEvents = 'none';
      }
    }
  };

  // ─── Event Handlers ─────────────────────────────────────────────

  // Text Handlers
  const handleTextChange = (newVal) => {
    setButtonText(newVal);
    const el = resolveTargetElement();
    if (!el) return;

    const textEl = el.querySelector('text') || (el.tagName?.toLowerCase() === 'text' ? el : null);
    if (textEl) {
      textEl.textContent = newVal;
      updateButtonDimensions(newVal, fontSize, fontFamily);
      syncButtonToCanvas();
    }
  };

  const handleFontFamilyChange = (val) => {
    setFontFamily(val);
    const el = resolveTargetElement();
    if (!el) return;

    const textEl = el.querySelector('text') || (el.tagName?.toLowerCase() === 'text' ? el : null);
    if (textEl) {
      textEl.setAttribute('font-family', val);
      textEl.style.fontFamily = val;
      updateButtonDimensions(buttonText, fontSize, val);
      syncButtonToCanvas();
    }
  };

  const handleFontSizeChange = (val) => {
    setFontSize(val);
    const el = resolveTargetElement();
    if (!el) return;

    const textEl = el.querySelector('text') || (el.tagName?.toLowerCase() === 'text' ? el : null);
    if (textEl) {
      textEl.setAttribute('font-size', val.toString());
      textEl.style.fontSize = `${val}px`;
      updateButtonDimensions(buttonText, val, fontFamily);
      syncButtonToCanvas();
    }
  };

  const handleFontWeightChange = (val) => {
    setFontWeight(val);
    const el = resolveTargetElement();
    if (!el) return;

    const textEl = el.querySelector('text') || (el.tagName?.toLowerCase() === 'text' ? el : null);
    if (textEl) {
      textEl.setAttribute('font-weight', val);
      textEl.style.fontWeight = val;
      syncButtonToCanvas();
    }
  };

  const handleTextFillColorChange = (color) => {
    setTextFillColor(color);
    const el = resolveTargetElement();
    if (!el) return;

    const textEl = el.querySelector('text') || (el.tagName?.toLowerCase() === 'text' ? el : null);
    if (textEl) {
      const fillVal = applySvgGradient(color, 'fill', 'text');
      textEl.setAttribute('fill', fillVal);
      textEl.style.fill = fillVal;
      textEl.setAttribute('data-fill-color', color);
      syncButtonToCanvas();
    }
  };

  // Icon Handlers
  const handleToggleIcon = (val) => {
    setHasIcon(val);
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-has-icon', val ? 'true' : 'false');
    updateButtonDimensions(buttonText, fontSize, fontFamily, val);
    syncButtonToCanvas();
  };

  const handleIconPlacementChange = (val) => {
    setIconPlacement(val);
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-icon-placement', val);
    updateButtonDimensions(buttonText, fontSize, fontFamily, hasIcon, iconName, iconHtml, iconViewBox, paddingW, paddingH, iconGap, val, radius, iconColor, iconBgColor);
    syncButtonToCanvas();
  };

  const handleIconColorChange = (color) => {
    setIconColor(color);
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-icon-color', color);
    updateButtonDimensions(buttonText, fontSize, fontFamily, hasIcon, iconName, iconHtml, iconViewBox, paddingW, paddingH, iconGap, iconPlacement, radius, color, iconBgColor);
    syncButtonToCanvas();
  };

  const handleIconBgColorChange = (color) => {
    setIconBgColor(color);
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-icon-bg-color', color);

    let badgeEl = el.querySelector('.btn-badge-circle, .btn-badge-block, .btn-icon-bg') ||
      el.querySelector('polygon:not(.btn-main-poly)');

    const hasBg = Boolean(color && color !== 'none' && color !== 'transparent');

    if (hasBg) {
      if (!badgeEl) {
        const ownerDoc = el.ownerDocument || document;
        const iconWrap = el.querySelector('.btn-icon');
        badgeEl = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
        badgeEl.setAttribute('class', 'btn-badge-circle');
        badgeEl.setAttribute('stroke', 'none');
        if (iconWrap) {
          el.insertBefore(badgeEl, iconWrap);
        } else {
          el.appendChild(badgeEl);
        }
      }

      const fillVal = applySvgGradient(color, 'fill', 'icon-bg');
      badgeEl.setAttribute('fill', fillVal);
      badgeEl.setAttribute('data-fill-color', color);
      badgeEl.setAttribute('display', '');
      badgeEl.style.display = '';
    } else {
      if (badgeEl) {
        badgeEl.setAttribute('fill', 'none');
        badgeEl.setAttribute('data-fill-color', 'none');
        badgeEl.setAttribute('display', 'none');
      }
    }

    updateButtonDimensions(
      buttonText,
      fontSize,
      fontFamily,
      hasIcon,
      iconName,
      iconHtml,
      iconViewBox,
      paddingW,
      paddingH,
      iconGap,
      iconPlacement,
      radius,
      iconColor,
      color
    );
    syncButtonToCanvas();
  };

  const handleIconBgOpacityChange = (val) => {
    setIconBgOpacity(val);
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-icon-bg-opacity', val.toString());
    const badgeEl = el.querySelector('.btn-badge-circle, .btn-badge-block, .btn-icon-bg') ||
      el.querySelector('polygon:not(.btn-main-poly)');
    if (badgeEl) {
      badgeEl.setAttribute('fill-opacity', (val / 100).toString());
    }
    syncButtonToCanvas();
  };

  const handleTextOpacityChange = (val) => {
    setTextOpacity(val);
    const el = resolveTargetElement();
    if (!el) return;
    const textEl = el.querySelector('text') || (el.tagName?.toLowerCase() === 'text' ? el : null);
    if (textEl) {
      textEl.setAttribute('fill-opacity', (val / 100).toString());
      textEl.setAttribute('opacity', (val / 100).toString());
      syncButtonToCanvas();
    }
  };

  const handleIconOpacityChange = (val) => {
    setIconOpacity(val);
    const el = resolveTargetElement();
    if (!el) return;
    el.setAttribute('data-icon-opacity', val.toString());
    const iconWrap = el.querySelector('.btn-icon');
    if (iconWrap) {
      iconWrap.setAttribute('opacity', (val / 100).toString());
      syncButtonToCanvas();
    }
  };

  const handleShapeOpacityChange = (val) => {
    setShapeOpacity(val);
    const el = resolveTargetElement();
    if (!el) return;
    const mainPoly = el.querySelector('.btn-main-poly');
    const rectEl = el.querySelector('rect.btn-bg') || el.querySelector('rect');
    const targetEl = mainPoly || rectEl;
    if (targetEl) {
      targetEl.setAttribute('fill-opacity', (val / 100).toString());
      syncButtonToCanvas();
    }
  };

  const handleStrokeOpacityChange = (val) => {
    setStrokeOpacity(val);
    const el = resolveTargetElement();
    if (!el) return;
    const mainPoly = el.querySelector('.btn-main-poly');
    const rectEl = el.querySelector('rect.btn-bg') || el.querySelector('rect');
    const targetEl = mainPoly || rectEl;
    if (targetEl) {
      targetEl.setAttribute('stroke-opacity', (val / 100).toString());
      syncButtonToCanvas();
    }
  };

  const handleIconGapChange = (gap) => {
    setIconGap(gap);
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-icon-gap', gap.toString());
    updateButtonDimensions(buttonText, fontSize, fontFamily, hasIcon, iconName, iconHtml, iconViewBox, paddingW, paddingH, gap);
    syncButtonToCanvas();
  };

  // Padding Handlers
  const handlePaddingChange = (type, val) => {
    const num = Math.max(0, val);
    const el = resolveTargetElement();
    if (type === 'w') {
      setPaddingW(num);
      if (isPaddingLinked) setPaddingH(num);
      if (el) {
        el.setAttribute('data-padding-w', num.toString());
        if (isPaddingLinked) el.setAttribute('data-padding-h', num.toString());
        updateButtonDimensions(buttonText, fontSize, fontFamily, hasIcon, iconName, iconHtml, iconViewBox, num, isPaddingLinked ? num : paddingH);
        syncButtonToCanvas();
      }
    } else {
      setPaddingH(num);
      if (isPaddingLinked) setPaddingW(num);
      if (el) {
        el.setAttribute('data-padding-h', num.toString());
        if (isPaddingLinked) el.setAttribute('data-padding-w', num.toString());
        updateButtonDimensions(buttonText, fontSize, fontFamily, hasIcon, iconName, iconHtml, iconViewBox, isPaddingLinked ? num : paddingW, num);
        syncButtonToCanvas();
      }
    }
  };

  const handleTogglePaddingLink = (linked) => {
    setIsPaddingLinked(linked);
    const el = resolveTargetElement();
    if (el) {
      el.setAttribute('data-padding-linked', linked ? 'true' : 'false');
      if (linked) {
        setPaddingH(paddingW);
        el.setAttribute('data-padding-h', paddingW.toString());
        updateButtonDimensions(buttonText, fontSize, fontFamily, hasIcon, iconName, iconHtml, iconViewBox, paddingW, paddingW);
        syncButtonToCanvas();
      }
    }
  };

  // Button Color Handler
  const handleShapeFillColorChange = (color) => {
    setShapeFillColor(color);
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-fill-color', color);

    const mainPoly = el.querySelector('.btn-main-poly');
    if (mainPoly) {
      const fillVal = applySvgGradient(color, 'fill', 'poly');
      mainPoly.setAttribute('fill', fillVal);
      mainPoly.style.fill = fillVal;
      mainPoly.setAttribute('data-fill-color', color);
    }

    const rectEl = el.querySelector('rect.btn-bg') || el.querySelector('rect') || (el.tagName?.toLowerCase() === 'rect' ? el : null);
    if (rectEl) {
      const fillVal = applySvgGradient(color, 'fill', 'rect');
      rectEl.setAttribute('fill', fillVal);
      rectEl.style.fill = fillVal;
      rectEl.setAttribute('data-fill-color', color);
    }

    syncButtonToCanvas();
  };

  // Stoke Color Handlers
  const handleStrokeColorChange = (color) => {
    setStrokeColor(color);
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-stroke-color', color);
    el.setAttribute('data-stroke-alignment', 'Outside');
    el.setAttribute('data-stroke-position', 'Outside');

    const mainPoly = el.querySelector('.btn-main-poly');
    const rectEl = el.querySelector('rect.btn-bg') || el.querySelector('rect') || (el.tagName?.toLowerCase() === 'rect' ? el : null);
    const targetEl = mainPoly || rectEl;

    if (targetEl) {
      targetEl.setAttribute('paint-order', 'stroke fill');
      targetEl.style.paintOrder = 'stroke fill';
      const strokeVal = applySvgGradient(color, 'stroke', 'shape');
      targetEl.setAttribute('stroke', strokeVal);
      targetEl.style.stroke = strokeVal;
      targetEl.setAttribute('data-stroke-color', color);

      if (color !== 'none' && strokeWidth === 0) {
        setStrokeWidth(1);
        targetEl.setAttribute('data-stroke-width', '1');
        targetEl.setAttribute('stroke-width', '2');
        targetEl.style.strokeWidth = '2px';
      }
    }

    const borderRect = el.querySelector('rect.btn-border');
    if (borderRect) {
      borderRect.setAttribute('paint-order', 'stroke fill');
      borderRect.style.paintOrder = 'stroke fill';
      const strokeVal = applySvgGradient(color, 'stroke', 'border');
      borderRect.setAttribute('stroke', strokeVal);
      borderRect.style.stroke = strokeVal;
    }

    syncButtonToCanvas();
  };

  const handleStrokeWidthChange = (val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setStrokeWidth(num);
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-stroke-alignment', 'Outside');
    el.setAttribute('data-stroke-position', 'Outside');

    const mainPoly = el.querySelector('.btn-main-poly');
    const rectEl = el.querySelector('rect.btn-bg') || el.querySelector('rect') || (el.tagName?.toLowerCase() === 'rect' ? el : null);
    const targetEl = mainPoly || rectEl;

    if (targetEl) {
      targetEl.setAttribute('data-stroke-width', num.toString());
      targetEl.setAttribute('paint-order', 'stroke fill');
      targetEl.style.paintOrder = 'stroke fill';
      targetEl.setAttribute('stroke-width', (num * 2).toString());
      targetEl.style.strokeWidth = `${num * 2}px`;
    }

    const borderRect = el.querySelector('rect.btn-border');
    if (borderRect) {
      borderRect.setAttribute('paint-order', 'stroke fill');
      borderRect.style.paintOrder = 'stroke fill';
      borderRect.setAttribute('stroke-width', (num * 2).toString());
    }

    syncButtonToCanvas();
  };

  const handleStrokeAlignmentChange = (val) => {
    setStrokeAlignment('Outside');
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-stroke-alignment', 'Outside');
    el.setAttribute('data-stroke-position', 'Outside');
    syncButtonToCanvas();
  };

  const handleLineStyleChange = (style) => {
    setLineStyle(style);
    const el = resolveTargetElement();
    if (!el) return;

    const mainPoly = el.querySelector('.btn-main-poly');
    const rectEl = el.querySelector('rect.btn-bg') || el.querySelector('rect') || (el.tagName?.toLowerCase() === 'rect' ? el : null);
    const targetEl = mainPoly || rectEl;

    let dashArray = 'none';
    if (style === 'Dashed') {
      dashArray = `${dashL},${dashG}`;
    } else if (style === 'Dotted') {
      dashArray = '2,4';
    }

    if (targetEl) {
      targetEl.setAttribute('stroke-dasharray', dashArray);
    }
    const borderRect = el.querySelector('rect.btn-border');
    if (borderRect) {
      borderRect.setAttribute('stroke-dasharray', dashArray);
    }

    syncButtonToCanvas();
  };

  const handleDashChange = (type, val) => {
    const num = Math.max(1, parseInt(val) || 1);
    const newL = type === 'l' ? num : dashL;
    const newG = type === 'g' ? num : dashG;

    if (type === 'l') setDashL(num);
    if (type === 'g') setDashG(num);

    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-dash-l', newL.toString());
    el.setAttribute('data-dash-g', newG.toString());

    if (lineStyle === 'Dashed') {
      const mainPoly = el.querySelector('.btn-main-poly');
      const rectEl = el.querySelector('rect.btn-bg') || el.querySelector('rect') || (el.tagName?.toLowerCase() === 'rect' ? el : null);
      const targetEl = mainPoly || rectEl;
      if (targetEl) {
        targetEl.setAttribute('stroke-dasharray', `${newL},${newG}`);
      }
      const borderRect = el.querySelector('rect.btn-border');
      if (borderRect) {
        borderRect.setAttribute('stroke-dasharray', `${newL},${newG}`);
      }
    }

    syncButtonToCanvas();
  };

  const handleLineCornerChange = (val) => {
    setLineCorner(val);
    const el = resolveTargetElement();
    if (!el) return;

    const isRound = val === 'Rounded';
    const lineCap = isRound ? 'round' : 'butt';
    const lineJoin = isRound ? 'round' : 'miter';

    const mainPoly = el.querySelector('.btn-main-poly');
    const rectEl = el.querySelector('rect.btn-bg') || el.querySelector('rect') || (el.tagName?.toLowerCase() === 'rect' ? el : null);
    const targetEl = mainPoly || rectEl;

    if (targetEl) {
      targetEl.setAttribute('stroke-linecap', lineCap);
      targetEl.setAttribute('stroke-linejoin', lineJoin);
    }
    const borderRect = el.querySelector('rect.btn-border');
    if (borderRect) {
      borderRect.setAttribute('stroke-linecap', lineCap);
      borderRect.setAttribute('stroke-linejoin', lineJoin);
    }

    syncButtonToCanvas();
  };

  // Corner Radius Handlers
  const handleCornerChange = (corner, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    const newRadius = isRadiusLinked
      ? { tl: num, tr: num, bl: num, br: num }
      : { ...radius, [corner]: num };

    setRadius(newRadius);
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-tl', newRadius.tl.toString());
    el.setAttribute('data-tr', newRadius.tr.toString());
    el.setAttribute('data-bl', newRadius.bl.toString());
    el.setAttribute('data-br', newRadius.br.toString());
    el.setAttribute('data-corner-linked', isRadiusLinked ? 'true' : 'false');

    const maxR = Math.max(newRadius.tl, newRadius.tr, newRadius.bl, newRadius.br);
    const rectEl = el.querySelector('rect.btn-bg') || el.querySelector('rect') || (el.tagName?.toLowerCase() === 'rect' ? el : null);
    if (rectEl) {
      rectEl.setAttribute('rx', maxR.toString());
      rectEl.setAttribute('ry', maxR.toString());
    }
    const borderRect = el.querySelector('rect.btn-border');
    if (borderRect) {
      borderRect.setAttribute('rx', maxR.toString());
      borderRect.setAttribute('ry', maxR.toString());
    }

    updateButtonDimensions(buttonText, fontSize, fontFamily, hasIcon, iconName, iconHtml, iconViewBox, paddingW, paddingH, iconGap, iconPlacement, newRadius);
    syncButtonToCanvas();
  };

  const handleToggleRadiusLink = (linked) => {
    setIsRadiusLinked(linked);
    const el = resolveTargetElement();
    if (!el) return;

    el.setAttribute('data-corner-linked', linked ? 'true' : 'false');
    if (linked) {
      const maxR = Math.max(radius.tl, radius.tr, radius.bl, radius.br);
      const unifiedRadius = { tl: maxR, tr: maxR, bl: maxR, br: maxR };
      setRadius(unifiedRadius);
      el.setAttribute('data-tl', maxR.toString());
      el.setAttribute('data-tr', maxR.toString());
      el.setAttribute('data-bl', maxR.toString());
      el.setAttribute('data-br', maxR.toString());
      updateButtonDimensions(buttonText, fontSize, fontFamily, hasIcon, iconName, iconHtml, iconViewBox, paddingW, paddingH, iconGap, iconPlacement, unifiedRadius);
    }
    syncButtonToCanvas();
  };

  // Effects Handlers
  const handleSetActiveEffects = (updater) => {
    const next = typeof updater === 'function' ? updater(activeEffects) : updater;
    setActiveEffects(next);
    const el = resolveTargetElement();
    if (!el) return;

    const hasDropShadow = next.includes('Drop Shadow');

    el.setAttribute('data-effect-drop-shadow', hasDropShadow ? 'true' : 'false');
    el.removeAttribute('data-effect-inner-shadow');
    el.removeAttribute('data-effect-blur');

    syncButtonToCanvas(true, hasDropShadow);
  };

  const handleSetEffectSettings = (updater) => {
    const next = typeof updater === 'function' ? updater(effectSettings) : updater;
    setEffectSettings(next);
    const el = resolveTargetElement();
    if (!el) return;

    if (next['Drop Shadow']) {
      const ds = next['Drop Shadow'];
      if (ds.x !== undefined) el.setAttribute('data-effect-drop-shadow-x', ds.x.toString());
      if (ds.y !== undefined) el.setAttribute('data-effect-drop-shadow-y', ds.y.toString());
      if (ds.blur !== undefined) el.setAttribute('data-effect-drop-shadow-blur', ds.blur.toString());
      if (ds.spread !== undefined) el.setAttribute('data-effect-drop-shadow-spread', ds.spread.toString());
      if (ds.color !== undefined) el.setAttribute('data-effect-drop-shadow-color', ds.color);
      if (ds.opacity !== undefined) el.setAttribute('data-effect-drop-shadow-opacity', ds.opacity.toString());
    }

    syncButtonToCanvas(true, activeEffects.includes('Drop Shadow'), next['Drop Shadow']);
  };

  // Helper to dynamically adjust icon markup colors to match color
  const cleanIconHtml = (html, color = '#ffffff') => {
    if (!html) return '';
    return html
      .replace(/stroke="(?!(?:none))[^"]*"/gi, `stroke="${color}"`)
      .replace(/fill="(?!(?:none|transparent))[^"]*"/gi, `fill="${color}"`);
  };

  // Render Icon in Preview Card (Fixed black and white preview, disconnected from button colors)
  const renderIconPreview = () => {
    const IconCmp = LucideIcons[iconName] || LucideIcons.Check;

    const iconElement = iconHtml ? (
      <svg
        viewBox={iconViewBox || "0 0 24 24"}
        className="w-[1.8vw] h-[1.8vw]"
        stroke="#ffffff"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          color: '#ffffff',
          stroke: '#ffffff'
        }}
        dangerouslySetInnerHTML={{ __html: cleanIconHtml(iconHtml, '#ffffff') }}
      />
    ) : (
      <IconCmp
        size="1.8vw"
        strokeWidth={2.5}
        color="#ffffff"
        style={{
          color: '#ffffff',
          stroke: '#ffffff'
        }}
      />
    );

    return (
      <div className="w-[3.4vw] h-[3.4vw] rounded-full bg-[#000000] flex items-center justify-center shadow-sm">
        {iconElement}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-[0.6vw] font-sans text-gray-800 pt-[0.2vw] pr-[0.2vw] select-none pb-[2vw]">
      {/* Scoped CSS for Coral Orange Range Slider */}
      <style>{`
        .button-icon-gap-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0.9vw;
          height: 0.9vw;
          border-radius: 50%;
          background: #ffffff;
          border: 0.15vw solid #E05638;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }
        .button-icon-gap-slider::-moz-range-thumb {
          width: 0.9vw;
          height: 0.9vw;
          border-radius: 50%;
          background: #ffffff;
          border: 0.15vw solid #E05638;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }
      `}</style>

      {/* ─── 1. BUTTON CONTENT SECTION ──────────────────────────── */}
      <SectionHeader title="Button Properties" />

      {/* Row 1: Button Text */}
      <PropertyRow label="Button Text">
        <div className="relative w-full">
          <input
            type="text"
            value={buttonText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Button"
            className="w-full h-[2.5vw] bg-white border border-gray-200 rounded-[0.5vw] px-[0.6vw] pr-[1.8vw] text-[0.8vw] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E05638] shadow-2xs font-semibold"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-[0.6vw] text-gray-400">
            <Pencil className="w-[0.85vw] h-[0.85vw]" />
          </div>
        </div>
      </PropertyRow>

      {/* Row 2: Font Family & Font Size */}
      <div className="flex items-center gap-[0.5vw]">
        <div className="w-[5.6vw] shrink-0" />
        <div className="flex-1 min-w-0 grid grid-cols-2 gap-[0.4vw]">
          {/* Font Family Dropdown */}
          <ElementDropdown
            value={fontFamily}
            onChange={handleFontFamilyChange}
            options={fontFamilies}
            isFont={true}
          />

          {/* Font Size Dropdown */}
          <ElementDropdown
            value={fontSize}
            onChange={(val) => handleFontSizeChange(parseInt(val))}
            options={fontSizes}
          />
        </div>
      </div>

      {/* Row 3: Font Weight Dropdown */}
      <div className="flex items-center gap-[0.5vw]">
        <div className="w-[5.6vw] shrink-0" />
        <div className="flex-1 min-w-0">
          <ElementDropdown
            value={fontWeight}
            onChange={handleFontWeightChange}
            options={fontWeights.map(w => ({ label: w.name, value: w.value }))}
          />
        </div>
      </div>

      {/* Row 4: Text Color */}
      <PropertyRow label="Text Color">
        <ColorInput
          color={textFillColor}
          onChange={handleTextFillColorChange}
          opacity={textOpacity}
          onOpenPicker={() => setActiveColorPicker('textColor')}
          isActive={activeColorPicker === 'textColor'}
        />
      </PropertyRow>

      {/* Row 5: Add Icon Toggle */}
      <div className="flex items-center justify-between pl-[0.5vw] pr-[0.1vw] py-[0.2vw]">
        <span className="text-[0.8vw] font-semibold text-gray-900">Add Icon to the button</span>
        <ElementToggle
          checked={hasIcon}
          onChange={handleToggleIcon}
        />
      </div>

      {/* Rows when Icon is enabled */}
      {hasIcon && (
        <>
          {/* Icon Card */}
          <PropertyRow label="Icon">
            <div
              onClick={() => setIsIconGalleryOpen(true)}
              className="w-full h-[5vw] border border-gray-200 hover:border-gray-300 rounded-[0.5vw] bg-[#f8fafc] p-[0.4vw] relative flex items-center justify-center cursor-pointer group transition-all shadow-2xs hover:shadow-sm"
              title="Click to change icon"
            >
              {/* Swap Icon button in top-right */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsIconGalleryOpen(true);
                }}
                className="absolute top-[0.35vw] right-[0.35vw] text-gray-400 group-hover:text-gray-700 transition-colors p-[0.2vw] rounded-[0.2vw] hover:bg-gray-50 cursor-pointer"
                title="Change icon"
              >
                <ArrowLeftRight className="w-[0.9vw] h-[0.9vw]" />
              </button>

              {/* Centered preview of icon */}
              <div className="w-[4.5vw] h-[4.5vw] flex items-center justify-center group-hover:scale-105 transition-transform">
                {renderIconPreview()}
              </div>
            </div>
          </PropertyRow>

          {/* Placement Dropdown */}
          <PropertyRow label="Placement">
            <ElementDropdown
              value={iconPlacement}
              onChange={handleIconPlacementChange}
              options={['Left', 'Right']}
            />
          </PropertyRow>

          {/* Icon Color */}
          <PropertyRow label="Icon Color">
            <ColorInput
              color={iconColor}
              onChange={handleIconColorChange}
              opacity={iconOpacity}
              onOpenPicker={() => setActiveColorPicker('iconColor')}
              isActive={activeColorPicker === 'iconColor'}
            />
          </PropertyRow>

          {/* Icon BG Color */}
          <PropertyRow label="Icon BG Color">
            <ColorInput
              color={iconBgColor}
              onChange={handleIconBgColorChange}
              opacity={iconBgOpacity}
              onOpenPicker={() => setActiveColorPicker('iconBgColor')}
              isActive={activeColorPicker === 'iconBgColor'}
            />
          </PropertyRow>
        </>
      )}

      {/* ─── 3. BUTTON COLOR SECTION ────────────────────────────── */}
      <SectionHeader title="Button Color" />

      <div className="pl-[0.5vw]">
        <ColorInputWithFormat
          color={shapeFillColor}
          onChange={handleShapeFillColorChange}
          opacity={shapeOpacity}
          onOpenPicker={() => setActiveColorPicker('buttonColor')}
          isActive={activeColorPicker === 'buttonColor'}
        />
      </div>

      {/* ─── 4. STROKE COLOR SECTION ─────────────────────────────── */}
      <SectionHeader title="Stroke Color" />

      {/* Row 1: Swatch, Hex, Format */}
      <div className="pl-[0.5vw]">
        <ColorInputWithFormat
          color={strokeColor}
          onChange={handleStrokeColorChange}
          opacity={strokeOpacity}
          onOpenPicker={() => setActiveColorPicker('strokeColor')}
          isActive={activeColorPicker === 'strokeColor'}
        />
      </div>

      {/* Stroke Settings Grid */}
      <div className="flex flex-col gap-[0.75vw] pl-[0.5vw] mt-[0.25vw]">
        {/* Stroke Width & Line Corner */}
        <div className="grid grid-cols-2 gap-[0.6vw]">
          {/* Stroke Width */}
          <div className="flex flex-col gap-[0.25vw]">
            <span className="text-[0.76vw] text-[#546274] font-semibold">Stroke Width</span>
            <div className="flex items-center gap-[0.3vw] h-[1.8vw] min-h-[28px]">
              <button
                type="button"
                onClick={() => handleStrokeWidthChange(Math.max(0, strokeWidth - 1))}
                className="w-[1.8vw] min-w-[28px] h-full bg-[#f4f6f8] hover:bg-slate-200 active:scale-95 border border-[#e2e8f0] rounded-[0.45vw] flex items-center justify-center text-slate-800 font-semibold text-[1.15vw] leading-none transition-all cursor-pointer shadow-2xs select-none"
              >
                −
              </button>
              <div className="flex-1 h-full bg-white border border-[#e2e8f0] rounded-[0.45vw] flex items-center justify-center shadow-2xs">
                <input
                  type="number"
                  value={strokeWidth}
                  onChange={(e) => handleStrokeWidthChange(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full text-center text-[0.8vw] font-semibold text-slate-800 outline-none bg-transparent no-spin"
                />
              </div>
              <button
                type="button"
                onClick={() => handleStrokeWidthChange(strokeWidth + 1)}
                className="w-[1.8vw] min-w-[28px] h-full bg-[#f4f6f8] hover:bg-slate-200 active:scale-95 border border-[#e2e8f0] rounded-[0.45vw] flex items-center justify-center text-slate-800 font-semibold text-[1.15vw] leading-none transition-all cursor-pointer shadow-2xs select-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Line Corner */}
          <div className="flex flex-col gap-[0.25vw] relative">
            <span className="text-[0.76vw] text-[#546274] font-semibold">Line Corner</span>
            <ElementDropdown
              value={lineCorner}
              onChange={handleLineCornerChange}
              options={['Square', 'Rounded']}
              buttonClassName="!h-[1.8vw] !min-h-[28px] !text-[0.78vw]"
            />
          </div>
        </div>
      </div>

      {/* ─── 6. EFFECTS SECTION ─────────────────────────────────── */}
      <SectionHeader title="Effects" />

      <div className="pl-[0.5vw]">
        <Effect
          isShape={true}
          hideBlur={true}
          hideInnerShadow={true}
          hideHeader={true}
          openSubSection={openSection === 'effect' ? 'effect' : null}
          setOpenSubSection={(s) => setOpenSection(s === 'effect' ? 'effect' : null)}
          activeEffects={activeEffects}
          setActiveEffects={handleSetActiveEffects}
          effectSettings={effectSettings}
          setEffectSettings={handleSetEffectSettings}
          activeColorPicker={activeColorPicker}
          setActiveColorPicker={setActiveColorPicker}
          showDetailedPicker={false}
          setShowDetailedPicker={() => {}}
        />
      </div>

      {/* ─── PORTALS ────────────────────────────────────────────── */}

      {/* Color Picker Portal */}
      {activeColorPicker && createPortal(
        <div
          className="fixed z-[5000]"
          style={{ top: '50%', right: '19.5vw', transform: 'translateY(-50%)' }}
        >
          <ColorPicker
            color={
              activeColorPicker === 'textColor' ? textFillColor :
              activeColorPicker === 'iconColor' ? iconColor :
              activeColorPicker === 'iconBgColor' ? iconBgColor :
              activeColorPicker === 'buttonColor' ? shapeFillColor :
              activeColorPicker === 'strokeColor' ? strokeColor : '#000000'
            }
            opacity={
              activeColorPicker === 'textColor' ? textOpacity :
              activeColorPicker === 'iconColor' ? iconOpacity :
              activeColorPicker === 'iconBgColor' ? iconBgOpacity :
              activeColorPicker === 'buttonColor' ? shapeOpacity :
              activeColorPicker === 'strokeColor' ? strokeOpacity : 100
            }
            onOpacityChange={(op) => {
              if (activeColorPicker === 'textColor') handleTextOpacityChange(op);
              else if (activeColorPicker === 'iconColor') handleIconOpacityChange(op);
              else if (activeColorPicker === 'iconBgColor') handleIconBgOpacityChange(op);
              else if (activeColorPicker === 'buttonColor') handleShapeOpacityChange(op);
              else if (activeColorPicker === 'strokeColor') handleStrokeOpacityChange(op);
            }}
            onChange={(c) => {
              if (activeColorPicker === 'textColor') handleTextFillColorChange(c);
              else if (activeColorPicker === 'iconColor') handleIconColorChange(c);
              else if (activeColorPicker === 'iconBgColor') handleIconBgColorChange(c);
              else if (activeColorPicker === 'buttonColor') handleShapeFillColorChange(c);
              else if (activeColorPicker === 'strokeColor') handleStrokeColorChange(c);
            }}
            onClose={() => setActiveColorPicker(null)}
            disableGradient={false}
          />
        </div>,
        document.body
      )}

      {/* Icon Gallery Portal */}
      {isIconGalleryOpen && createPortal(
        <IconsModal
          isOpen={isIconGalleryOpen}
          position="right"
          onClose={() => setIsIconGalleryOpen(false)}
          onSelect={(iconData) => {
            setIconName(iconData.name);
            setIconHtml(iconData.html || '');
            setIconViewBox(iconData.viewBox || '0 0 24 24');
            setIsIconGalleryOpen(false);

            const el = resolveTargetElement();
            if (el) {
              el.setAttribute('data-icon-name', iconData.name);
              el.setAttribute('data-icon-html', iconData.html || '');
              el.setAttribute('data-icon-viewbox', iconData.viewBox || '0 0 24 24');
              updateButtonDimensions(buttonText, fontSize, fontFamily, true, iconData.name, iconData.html, iconData.viewBox);
              syncButtonToCanvas();
            }
          }}
        />,
        document.body
      )}
    </div>
  );
};

export const ElementButtonProperties = ButtonEditor;
export default ButtonEditor;
