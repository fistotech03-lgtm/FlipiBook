import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Copy,
  Check
} from 'lucide-react';
import ColorPicker from '../../../properties/ColorPicker';
import Effect from '../../../properties/Effect';
import { ElementToggle, ElementDropdown } from './ElementUIControls';

// Section header matching editor design standards
// Helper to sync live SVG filters on the DOM element for Drop Shadow
const syncLiveFilters = (el) => {
  if (!el) return;
  const doc = el.ownerDocument || document;
  let svgRoot = el;
  while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
    svgRoot = svgRoot.parentElement;
  }
  if (!svgRoot) {
    const container = el.closest('.page-svg-container');
    if (container) {
      const canvasContent = container.querySelector('[id^="canvas-content-"]');
      svgRoot = canvasContent ? canvasContent.querySelector('svg') : container.querySelector('svg');
    }
  }
  if (!svgRoot) return;

  let defs = svgRoot.querySelector('defs');
  if (!defs) {
    defs = doc.createElementNS("http://www.w3.org/2000/svg", "defs");
    svgRoot.insertBefore(defs, svgRoot.firstChild);
  }

  const baseFilterId = `filter-${el.id || 'embed'}`;
  Array.from(defs.querySelectorAll(`[id^="${baseFilterId}"]`)).forEach(old => old.remove());

  const hasDropShadow = el.getAttribute('data-effect-drop-shadow') === 'true';
  if (!hasDropShadow) {
    el.removeAttribute('filter');
    el.style.filter = '';
    return;
  }

  const getVal = (attr, def) => el.getAttribute(attr) || def;
  const color = getVal('data-effect-drop-shadow-color', '#000000');
  const opacity = parseFloat(getVal('data-effect-drop-shadow-opacity', '35')) / 100;
  const dx = parseFloat(getVal('data-effect-drop-shadow-x', '2'));
  const dy = parseFloat(getVal('data-effect-drop-shadow-y', '2'));
  const blur = parseFloat(getVal('data-effect-drop-shadow-blur', '4'));
  const spread = parseFloat(getVal('data-effect-drop-shadow-spread', '0'));

  // Convert hex color to rgba for CSS filter backup (Chromium foreignObject rendering)
  let rgbaColor = `rgba(0, 0, 0, ${opacity})`;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } else if (color.startsWith('rgb')) {
    rgbaColor = color;
  }

  // Set CSS filter on element (ensures foreignObject renders drop shadow in Chromium)
  el.style.filter = `drop-shadow(${dx}px ${dy}px ${blur}px ${rgbaColor})`;

  // Also construct SVG filter in <defs> for SVG serialization/rendering
  const filterId = `${baseFilterId}-${Math.random().toString(36).substr(2, 4)}`;
  const filterEl = doc.createElementNS("http://www.w3.org/2000/svg", "filter");
  filterEl.id = filterId;
  filterEl.setAttribute('x', '-50%');
  filterEl.setAttribute('y', '-50%');
  filterEl.setAttribute('width', '200%');
  filterEl.setAttribute('height', '200%');
  defs.appendChild(filterEl);

  let dsSource = 'SourceAlpha';
  if (spread !== 0) {
    const morph = doc.createElementNS("http://www.w3.org/2000/svg", "feMorphology");
    morph.setAttribute('operator', spread >= 0 ? 'dilate' : 'erode');
    morph.setAttribute('radius', Math.abs(spread));
    morph.setAttribute('in', 'SourceAlpha');
    morph.setAttribute('result', 'ds_morph');
    filterEl.appendChild(morph);
    dsSource = 'ds_morph';
  }

  const gauss = doc.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
  gauss.setAttribute('stdDeviation', blur);
  gauss.setAttribute('in', dsSource);
  gauss.setAttribute('result', 'ds_blur');
  filterEl.appendChild(gauss);

  const offset = doc.createElementNS("http://www.w3.org/2000/svg", "feOffset");
  offset.setAttribute('dx', dx.toString());
  offset.setAttribute('dy', dy.toString());
  offset.setAttribute('in', 'ds_blur');
  offset.setAttribute('result', 'ds_offset');
  filterEl.appendChild(offset);

  const flood = doc.createElementNS("http://www.w3.org/2000/svg", "feFlood");
  flood.setAttribute('flood-color', color);
  flood.setAttribute('flood-opacity', opacity.toString());
  flood.setAttribute('result', 'ds_flood');
  filterEl.appendChild(flood);

  const comp = doc.createElementNS("http://www.w3.org/2000/svg", "feComposite");
  comp.setAttribute('in', 'ds_flood');
  comp.setAttribute('in2', 'ds_offset');
  comp.setAttribute('operator', 'in');
  comp.setAttribute('result', 'ds_final');
  filterEl.appendChild(comp);

  const merge = doc.createElementNS("http://www.w3.org/2000/svg", "feMerge");
  const nodeShadow = doc.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
  nodeShadow.setAttribute('in', 'ds_final');
  const nodeInput = doc.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
  nodeInput.setAttribute('in', 'SourceGraphic');
  merge.appendChild(nodeShadow);
  merge.appendChild(nodeInput);
  filterEl.appendChild(merge);

  el.setAttribute('filter', `url(#${filterId})`);
};

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-[0.4vw] mt-[0.3vw]">
    <span className="text-[0.9vw] font-medium text-black whitespace-nowrap">{title}</span>
    <div className="h-[0.06vw] bg-gray-200 flex-1 ml-[0.3vw]" />
  </div>
);

// PropertyRow matching editor alignment
const PropertyRow = ({ label, children, className = '' }) => (
  <div className={`flex items-center gap-[0.5vw] ${className}`}>
    <div className="w-[5.6vw] shrink-0 flex items-center pl-[0.5vw] justify-between text-gray-700 font-medium">
      <span className={`${label.length > 12 ? 'text-[0.68vw]' : 'text-[0.78vw]'} tracking-tight whitespace-nowrap`}>
        {label}
      </span>
      <span className="text-gray-500 font-medium text-[0.8vw]">:</span>
    </div>
    <div className="flex-1 min-w-0">
      {children}
    </div>
  </div>
);

// Custom Dropdown matching exact reference design
const CustomSelect = ElementDropdown;

// Color Swatch + Hex Input Box
const ColorInput = ({ color, onChange, opacity = 100, onOpenPicker, isActive = false }) => {
  const displayColor = color && color.startsWith('#') ? color.toUpperCase() : color || '#000000';

  return (
    <div className="flex items-center gap-[0.4vw] w-full">
      <div
        onClick={onOpenPicker}
        className={`color-box color-box-trigger w-[2vw] h-[2vw] rounded-[0.5vw] border flex-shrink-0 relative overflow-hidden flex items-center justify-center cursor-pointer shadow-2xs hover:scale-105 transition-all ${
          isActive ? 'border-[#E05638] ring-2 ring-[#E05638]/40 scale-105 shadow-xs' : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{ backgroundColor: color === 'none' || color === 'transparent' ? '#ffffff' : color }}
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
          className="w-[5.2vw] font-mono text-[0.8vw] text-gray-800 bg-transparent focus:outline-none uppercase font-medium"
          maxLength={7}
        />
        <span className="text-gray-400 text-[0.75vw] font-medium">{opacity}%</span>
      </div>
    </div>
  );
};

// RadioButton component with signature accent
const RadioButton = ({ label, checked, onChange }) => (
  <label onClick={onChange} className="flex items-center gap-[0.4vw] cursor-pointer select-none">
    <div
      className={`w-[1.05vw] h-[1.05vw] rounded-full border-2 flex items-center justify-center transition-all ${
        checked ? 'border-[#E05638]' : 'border-gray-400 hover:border-gray-600'
      }`}
    >
      {checked && <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-[#E05638]" />}
    </div>
    <span className="text-[0.78vw] text-gray-700 font-medium">{label}</span>
  </label>
);

const escapeHtml = (unsafe) => {
  return (unsafe || '')
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatEmbedUrl = (rawUrl, allowFs = true) => {
  if (!rawUrl) return '';
  let trimmed = String(rawUrl).trim();
  if (!trimmed) return '';

  // If user pasted an iframe tag in URL input, extract the src URL
  if (trimmed.startsWith('<')) {
    const srcMatch = trimmed.match(/src=["']([^"']*)["']/i);
    if (srcMatch && srcMatch[1]) {
      trimmed = srcMatch[1];
    }
  }

  // Prepend protocol if missing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }

  // YouTube transformation
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0${allowFs ? '&fs=1' : '&fs=0'}`;
  }

  // Vimeo transformation
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return trimmed;
};

const getEmbedIframeContent = ({ via, targetUrl, code, allowFs }) => {
  const defaultPlaceholderHtml = `
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%; height:100%; background:#f8fafc; color:#64748b; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align:center; box-sizing:border-box; padding:20px; border-radius:0px; border:2px dashed #cbd5e1;">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:10px;">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
      <div style="font-size:18px; font-weight:600; color:#1e293b; margin-bottom:4px;">3rd Party Embed Frame</div>
      <div style="font-size:13px; color:#64748b;">Enter URL or HTML code in Properties to display live embed</div>
    </div>
  `.trim();

  const placeholderDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;width:100vw;height:100vh;overflow:hidden;border-radius:0px;}</style></head><body>${defaultPlaceholderHtml}</body></html>`;

  const fsAttrs = allowFs ? 'allowfullscreen' : '';
  const allowPolicy = `accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture${allowFs ? '; fullscreen' : ''}`;

  if (via === 'URL') {
    const formatted = formatEmbedUrl(targetUrl, allowFs);
    if (!formatted) {
      return {
        type: 'placeholder',
        src: '',
        srcdoc: placeholderDoc,
        html: `<iframe srcdoc="${escapeHtml(placeholderDoc)}" width="100%" height="100%" style="border:none; background:transparent; border-radius:0px;" scrolling="auto"></iframe>`
      };
    }
    return {
      type: 'url',
      src: formatted,
      srcdoc: '',
      html: `<iframe src="${escapeHtml(formatted)}" width="100%" height="100%" style="border:none; background:transparent; border-radius:0px;" scrolling="auto" allow="${allowPolicy}" ${fsAttrs} allowtransparency="true"></iframe>`
    };
  } else {
    // Embed Code mode
    const trimmedCode = (code || '').trim();
    if (!trimmedCode) {
      return {
        type: 'placeholder',
        src: '',
        srcdoc: placeholderDoc,
        html: `<iframe srcdoc="${escapeHtml(placeholderDoc)}" width="100%" height="100%" style="border:none; background:transparent; border-radius:0px;" scrolling="auto"></iframe>`
      };
    }

    let processedContent = trimmedCode;
    if (trimmedCode.startsWith('<')) {
      if (!allowFs) {
        processedContent = processedContent.replace(/\sallowfullscreen(="[^"]*")?/gi, '');
      } else if (!processedContent.includes('allowfullscreen')) {
        processedContent = processedContent.replace(/<iframe/i, '<iframe allowfullscreen');
      }
    } else {
      // If user pasted a URL in embed code mode
      const formatted = formatEmbedUrl(trimmedCode, allowFs);
      processedContent = `<iframe src="${escapeHtml(formatted)}" width="100%" height="100%" frameborder="0" allow="${allowPolicy}" ${fsAttrs} allowtransparency="true"></iframe>`;
    }

    const rawHtmlDocument = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;width:100vw;height:100vh;overflow:hidden;border-radius:0px;} video::-webkit-media-controls { zoom: 1.5; } video, iframe, img { width: 100%; height: 100%; border: none; display: block; border-radius:0px; }</style></head><body>${processedContent}</body></html>`;

    return {
      type: 'code',
      src: '',
      srcdoc: rawHtmlDocument,
      html: `<iframe srcdoc="${escapeHtml(rawHtmlDocument)}" width="100%" height="100%" style="border:none; background:transparent; border-radius:0px;" scrolling="auto" allow="${allowPolicy}" ${fsAttrs} allowtransparency="true"></iframe>`
    };
  }
};

// Toggle switch matching exact reference design
const ToggleSwitch = ElementToggle;

const BEHAVIOR_OPTIONS = [
  { value: 'Open in - Current Tab', label: 'Open in - Current Tab' },
  { value: 'Open in - New Tab', label: 'Open in - New Tab' }
];

const LINE_CORNER_OPTIONS = [
  { value: 'Rounded', label: 'Rounded' },
  { value: 'Square', label: 'Square' }
];

const ElementEmbedProperties = ({
  selectedElementProps,
  activePageIndex,
  selectedLayerId,
  updateElementAttribute,
  selectedElement
}) => {
  // --- 1. Embed Via & Source ---
  const [embedVia, setEmbedVia] = useState('URL');
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // --- 2. Embed Controls ---
  const [openWebsiteBtn, setOpenWebsiteBtn] = useState(true);
  const [allowFullscreen, setAllowFullscreen] = useState(true);
  const [behavior, setBehavior] = useState('Open in - Current Tab');

  // --- 3. Stoke Color & Width ---
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeOpacity, setStrokeOpacity] = useState(100);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [lineCorner, setLineCorner] = useState('Rounded');
  const [activeColorPicker, setActiveColorPicker] = useState(null);

  // --- Dimensions ---
  const [embedWidth, setEmbedWidth] = useState('650');
  const [embedHeight, setEmbedHeight] = useState('400');

  // --- 4. Effects ---
  const [openSection, setOpenSection] = useState(null);
  const [showDetailedPicker, setShowDetailedPicker] = useState(false);

  // Active Effects and Drop Shadow settings state
  const [activeEffects, setActiveEffects] = useState([]);
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

  // Colors on page list for ColorPicker
  const colorsOnPageList = useMemo(() => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const elements = doc.querySelectorAll('[data-fill-color], [data-stroke-color], [fill], [stroke]');
    const colors = new Set();
    elements.forEach(el => {
      const fill = el.getAttribute('data-fill-color') || el.getAttribute('fill');
      const stroke = el.getAttribute('data-stroke-color') || el.getAttribute('stroke');
      if (fill && fill !== 'none' && fill !== '#' && !fill.includes('gradient')) colors.add(fill.toUpperCase());
      if (stroke && stroke !== 'none' && stroke !== '#' && !stroke.includes('gradient')) colors.add(stroke.toUpperCase());
    });
    colors.add('#000000');
    colors.add('#FFFFFF');
    return Array.from(colors).slice(0, 12);
  }, [selectedElementProps, activePageIndex]);

  // Helper to sync changes to page state and trigger debounced DOM sync
  const syncEmbedDomToPage = useCallback(() => {
    if (!updateElementAttribute || !selectedElement) return;
    let node = selectedElement;
    let lastSvg = null;
    while (node) {
      if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
      node = node.parentElement;
    }
    if (lastSvg) {
      window.__skipCanvasUpdateForPage = activePageIndex;
      const cloneSvg = lastSvg.cloneNode(true);
      cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary').forEach(el => el.remove());
      const serializer = new XMLSerializer();
      const html = serializer.serializeToString(cloneSvg);
      updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
    }
  }, [updateElementAttribute, selectedElement, activePageIndex, selectedLayerId]);

  const handleSetActiveEffects = (updater) => {
    const next = typeof updater === 'function' ? updater(activeEffects) : updater;
    setActiveEffects(next);
    const hasDropShadow = next.includes('Drop Shadow');

    if (selectedElement) {
      const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
      if (frameGroup) {
        frameGroup.setAttribute('data-effect-drop-shadow', hasDropShadow ? 'true' : 'false');
        syncLiveFilters(frameGroup);
      }
    }

    if (updateElementAttribute) {
      updateElementAttribute(activePageIndex, selectedLayerId, {
        'data-effect-drop-shadow': hasDropShadow ? 'true' : 'false'
      });
    }

    syncEmbedDomToPage();
  };

  const handleSetEffectSettings = (updater) => {
    const next = typeof updater === 'function' ? updater(effectSettings) : updater;
    if (!next) return;
    setEffectSettings(next);

    const ds = next['Drop Shadow'];
    if (!ds) return;

    const updates = {
      'data-effect-drop-shadow-x': ds.x.toString(),
      'data-effect-drop-shadow-y': ds.y.toString(),
      'data-effect-drop-shadow-blur': ds.blur.toString(),
      'data-effect-drop-shadow-spread': ds.spread.toString(),
      'data-effect-drop-shadow-color': ds.color,
      'data-effect-drop-shadow-opacity': ds.opacity.toString()
    };

    if (selectedElement) {
      const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
      if (frameGroup) {
        frameGroup.setAttribute('data-effect-drop-shadow-x', ds.x.toString());
        frameGroup.setAttribute('data-effect-drop-shadow-y', ds.y.toString());
        frameGroup.setAttribute('data-effect-drop-shadow-blur', ds.blur.toString());
        frameGroup.setAttribute('data-effect-drop-shadow-spread', ds.spread.toString());
        frameGroup.setAttribute('data-effect-drop-shadow-color', ds.color);
        frameGroup.setAttribute('data-effect-drop-shadow-opacity', ds.opacity.toString());
        syncLiveFilters(frameGroup);
      }
    }

    if (updateElementAttribute) {
      updateElementAttribute(activePageIndex, selectedLayerId, updates);
    }

    syncEmbedDomToPage();
  };

  const isHydratingRef = useRef(false);
  const lastElementIdRef = useRef(null);
  const lastAppliedSnapshotRef = useRef(null);

  // Sync state from DOM on element selection
  useEffect(() => {
    if (!selectedElement) return;
    const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
    if (!frameGroup) return;

    isHydratingRef.current = true;
    lastElementIdRef.current = frameGroup.id || selectedLayerId;

    let currentUrl = frameGroup.getAttribute('data-url') || '';
    let currentCode = frameGroup.getAttribute('data-custom-code') || '';
    const savedVia = frameGroup.getAttribute('data-embed-via') || 'URL';

    // Backward-compatibility: if legacy element had URL stored only in data-custom-code
    if (!currentUrl && currentCode && savedVia === 'URL' && !currentCode.startsWith('<')) {
      currentUrl = currentCode;
    }

    setUrl(currentUrl);
    setCustomCode(currentCode);
    setEmbedVia(savedVia);

    // Width & height
    let currentW = '650';
    let currentH = '400';
    const rect = frameGroup.querySelector('.embed-fill-layer') || frameGroup.querySelector('.svg-image-stroke-overlay');
    if (rect) {
      currentW = Math.round(parseFloat(rect.getAttribute('width')) || 650).toString();
      currentH = Math.round(parseFloat(rect.getAttribute('height')) || 400).toString();
    }
    setEmbedWidth(currentW);
    setEmbedHeight(currentH);

    // Embed Controls
    const savedOpenBtn = frameGroup.getAttribute('data-open-website-btn');
    if (savedOpenBtn !== null) setOpenWebsiteBtn(savedOpenBtn === 'true');

    const savedAllowFs = frameGroup.getAttribute('data-allow-fullscreen');
    if (savedAllowFs !== null) setAllowFullscreen(savedAllowFs === 'true');

    const savedBehavior = frameGroup.getAttribute('data-behavior');
    if (savedBehavior) setBehavior(savedBehavior);

    // Stroke
    const sColor = frameGroup.getAttribute('data-stroke-color') || frameGroup.getAttribute('stroke') || '#000000';
    const sOp = frameGroup.getAttribute('data-stroke-opacity') || frameGroup.getAttribute('stroke-opacity');
    const sW = frameGroup.getAttribute('data-stroke-width') || frameGroup.getAttribute('stroke-width') || '1';
    const sCorner = frameGroup.getAttribute('data-line-corner') || (frameGroup.getAttribute('stroke-linecap') === 'round' ? 'Rounded' : 'Rounded');

    const cleanStrokeCol = sColor === 'none' || sColor === 'transparent' ? '#000000' : sColor;
    const cleanStrokeOp = sOp ? Math.round(parseFloat(sOp) * 100) : 100;
    const cleanStrokeW = parseFloat(sW) || 1;
    setStrokeColor(cleanStrokeCol);
    setStrokeOpacity(cleanStrokeOp);
    setStrokeWidth(cleanStrokeW);
    setLineCorner(sCorner);

    // Hydrate Drop Shadow Effect from element attributes
    const hasDropShadow = frameGroup.getAttribute('data-effect-drop-shadow') === 'true';
    setActiveEffects(hasDropShadow ? ['Drop Shadow'] : []);

    const dsX = parseInt(frameGroup.getAttribute('data-effect-drop-shadow-x') || 2);
    const dsY = parseInt(frameGroup.getAttribute('data-effect-drop-shadow-y') || 2);
    const dsBlur = parseInt(frameGroup.getAttribute('data-effect-drop-shadow-blur') || 0);
    const dsSpread = parseInt(frameGroup.getAttribute('data-effect-drop-shadow-spread') || 0);
    const dsColor = frameGroup.getAttribute('data-effect-drop-shadow-color') || '#000000';
    const dsOpacity = parseInt(frameGroup.getAttribute('data-effect-drop-shadow-opacity') || 35);

    setEffectSettings({
      'Drop Shadow': {
        x: isNaN(dsX) ? 2 : dsX,
        y: isNaN(dsY) ? 2 : dsY,
        blur: isNaN(dsBlur) ? 0 : dsBlur,
        spread: isNaN(dsSpread) ? 0 : dsSpread,
        color: dsColor,
        opacity: isNaN(dsOpacity) ? 35 : dsOpacity
      }
    });

    // Make sure live canvas element has filter properly rendered
    syncLiveFilters(frameGroup);

    // Record hydrated snapshot to prevent redundant sync effects from modifying DOM
    lastAppliedSnapshotRef.current = {
      code: currentCode,
      url: currentUrl,
      w: currentW,
      h: currentH,
      sCol: cleanStrokeCol,
      sOp: cleanStrokeOp,
      sW: cleanStrokeW,
      sCorner: sCorner,
      allowFs: savedAllowFs !== null ? savedAllowFs === 'true' : true,
      openBtn: savedOpenBtn !== null ? savedOpenBtn === 'true' : true,
      beh: savedBehavior || 'Open in - Current Tab',
      via: savedVia
    };

    const timer = setTimeout(() => {
      isHydratingRef.current = false;
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedElement, selectedLayerId]);

  // Sync to DOM and Debounced History update (no blinking, in-place updates)
  useEffect(() => {
    if (!selectedElement) return;
    if (isHydratingRef.current) return;

    const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
    if (!frameGroup) return;

    const snap = lastAppliedSnapshotRef.current;
    if (
      snap &&
      snap.code === customCode &&
      snap.url === url &&
      snap.w === embedWidth &&
      snap.h === embedHeight &&
      snap.sCol === strokeColor &&
      snap.sOp === strokeOpacity &&
      snap.sW === strokeWidth &&
      snap.sCorner === lineCorner &&
      snap.allowFs === allowFullscreen &&
      snap.openBtn === openWebsiteBtn &&
      snap.beh === behavior &&
      snap.via === embedVia
    ) {
      // Nothing changed: do not touch DOM or trigger canvas re-renders
      return;
    }

    const isTextTyping = snap && (snap.url !== url || snap.code !== customCode);
    const delay = isTextTyping ? 200 : 0;

    const timeoutId = setTimeout(() => {
      frameGroup.setAttribute('data-url', url);
      frameGroup.setAttribute('data-custom-code', customCode);
      frameGroup.setAttribute('data-embed-type', embedVia === 'URL' ? 'url' : 'embed-code');
      frameGroup.setAttribute('data-embed-via', embedVia);
      frameGroup.setAttribute('data-open-website-btn', openWebsiteBtn ? 'true' : 'false');
      frameGroup.setAttribute('data-allow-fullscreen', allowFullscreen ? 'true' : 'false');
      frameGroup.setAttribute('data-behavior', behavior);
      frameGroup.setAttribute('data-stroke-color', strokeColor);
      frameGroup.setAttribute('data-stroke-width', strokeWidth.toString());
      frameGroup.setAttribute('data-stroke-opacity', (strokeOpacity / 100).toString());
      frameGroup.setAttribute('data-line-corner', lineCorner);
      frameGroup.setAttribute('stroke-linecap', lineCorner === 'Rounded' ? 'round' : 'square');
      frameGroup.setAttribute('stroke-linejoin', lineCorner === 'Rounded' ? 'round' : 'miter');
      frameGroup.removeAttribute('data-tl');
      frameGroup.removeAttribute('data-tr');
      frameGroup.removeAttribute('data-bl');
      frameGroup.removeAttribute('data-br');
      frameGroup.removeAttribute('rx');

      let w = parseFloat(embedWidth) || 650;
      let h = parseFloat(embedHeight) || 400;

      const strokeCol = strokeColor === 'none' ? 'transparent' : strokeColor;
      const strokeW = strokeWidth;
      const strokeOp = strokeOpacity / 100;
      const strokeCap = lineCorner === 'Rounded' ? 'round' : 'square';
      const strokeJoin = lineCorner === 'Rounded' ? 'round' : 'miter';

      // 1. Update Stroke Layer in-place (without wiping innerHTML)
      let strokeLayer = frameGroup.querySelector('.svg-image-stroke-overlay');
      if (strokeLayer) {
        if (strokeLayer.tagName.toLowerCase() === 'rect') {
          strokeLayer.setAttribute('x', '0');
          strokeLayer.setAttribute('y', '0');
          strokeLayer.setAttribute('width', w.toString());
          strokeLayer.setAttribute('height', h.toString());
          strokeLayer.removeAttribute('rx');
          strokeLayer.removeAttribute('ry');
          strokeLayer.setAttribute('stroke', strokeCol);
          strokeLayer.setAttribute('stroke-width', strokeW.toString());
          strokeLayer.setAttribute('stroke-opacity', strokeOp.toString());
          strokeLayer.setAttribute('stroke-linecap', strokeCap);
          strokeLayer.setAttribute('stroke-linejoin', strokeJoin);
        } else {
          const newStrokeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          newStrokeEl.setAttribute('class', 'svg-image-stroke-overlay');
          newStrokeEl.setAttribute('fill', 'transparent');
          newStrokeEl.setAttribute('pointer-events', 'all');
          newStrokeEl.setAttribute('stroke', strokeCol);
          newStrokeEl.setAttribute('stroke-width', strokeW.toString());
          newStrokeEl.setAttribute('stroke-opacity', strokeOp.toString());
          newStrokeEl.setAttribute('stroke-linecap', strokeCap);
          newStrokeEl.setAttribute('stroke-linejoin', strokeJoin);
          newStrokeEl.setAttribute('x', '0');
          newStrokeEl.setAttribute('y', '0');
          newStrokeEl.setAttribute('width', w.toString());
          newStrokeEl.setAttribute('height', h.toString());
          strokeLayer.replaceWith(newStrokeEl);
        }
      }

      // 2. Update Fill Layer in-place
      let fillLayer = frameGroup.querySelector('.embed-fill-layer');
      const fillColor = frameGroup.getAttribute('data-fill-color') || 'transparent';
      const fillOpacity = frameGroup.getAttribute('data-fill-opacity') || '1';
      if (fillLayer) {
        if (fillLayer.tagName.toLowerCase() === 'rect') {
          fillLayer.setAttribute('width', w.toString());
          fillLayer.setAttribute('height', h.toString());
          fillLayer.removeAttribute('rx');
          fillLayer.removeAttribute('ry');
        } else {
          const newFillEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          newFillEl.setAttribute('class', 'embed-fill-layer');
          newFillEl.setAttribute('x', '0');
          newFillEl.setAttribute('y', '0');
          newFillEl.setAttribute('width', w.toString());
          newFillEl.setAttribute('height', h.toString());
          newFillEl.setAttribute('fill', fillColor);
          newFillEl.setAttribute('opacity', fillOpacity);
          newFillEl.setAttribute('pointer-events', 'none');
          fillLayer.replaceWith(newFillEl);
        }
      }

      // 3. Update foreignObject and iframe in-place
      const iframeInfo = getEmbedIframeContent({
        via: embedVia,
        targetUrl: url,
        code: customCode,
        allowFs: allowFullscreen
      });

      let fo = frameGroup.querySelector('foreignObject');
      if (fo) {
        fo.setAttribute('width', w.toString());
        fo.setAttribute('height', h.toString());
        fo.style.borderRadius = '0px';
        fo.style.overflow = 'hidden';

        const existingIframe = fo.querySelector('iframe');
        let needsReload = false;
        if (!existingIframe) {
          needsReload = true;
        } else if (iframeInfo.type === 'url') {
          if (existingIframe.getAttribute('src') !== iframeInfo.src || existingIframe.hasAttribute('srcdoc')) {
            needsReload = true;
          }
        } else {
          // 'placeholder' or 'code'
          if (existingIframe.getAttribute('srcdoc') !== iframeInfo.srcdoc || existingIframe.hasAttribute('src')) {
            needsReload = true;
          }
        }

        if (needsReload) {
          fo.innerHTML = iframeInfo.html;
        } else {
          existingIframe.style.borderRadius = '0px';
        }
      } else {
        const strokeAttrs = `stroke="${strokeCol}" stroke-width="${strokeW}" stroke-opacity="${strokeOp}" stroke-linecap="${strokeCap}" stroke-linejoin="${strokeJoin}"`;
        const fillLayerHtml = `<rect class="embed-fill-layer" x="0" y="0" width="${w}" height="${h}" fill="${fillColor}" opacity="${fillOpacity}" pointer-events="none" />`;
        const strokeLayerHtml = `<rect class="svg-image-stroke-overlay" x="0" y="0" width="${w}" height="${h}" fill="transparent" pointer-events="all" ${strokeAttrs} />`;

        frameGroup.innerHTML = `
          ${fillLayerHtml}
          <g class="embed-content-group" pointer-events="none">
            <foreignObject x="0" y="0" width="${w}" height="${h}" pointer-events="all" style="border-radius: 0px; overflow: hidden;">
              ${iframeInfo.html}
            </foreignObject>
          </g>
          ${strokeLayerHtml}
        `;
      }

      // Record snapshot of applied values
      lastAppliedSnapshotRef.current = {
        code: customCode,
        url: url,
        w: embedWidth,
        h: embedHeight,
        sCol: strokeColor,
        sOp: strokeOpacity,
        sW: strokeWidth,
        sCorner: lineCorner,
        allowFs: allowFullscreen,
        openBtn: openWebsiteBtn,
        beh: behavior,
        via: embedVia
      };

      // Save to page state without wiping out canvas
      if (updateElementAttribute && selectedElement) {
        let node = selectedElement;
        let lastSvg = null;
        while (node) {
          if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
          node = node.parentElement;
        }
        if (lastSvg) {
          window.__skipCanvasUpdateForPage = activePageIndex;
          const cloneSvg = lastSvg.cloneNode(true);
          cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary').forEach(el => el.remove());
          const serializer = new XMLSerializer();
          const html = serializer.serializeToString(cloneSvg);
          updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
        }
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [
    customCode,
    url,
    embedVia,
    embedWidth,
    embedHeight,
    strokeColor,
    strokeWidth,
    strokeOpacity,
    lineCorner,
    openWebsiteBtn,
    allowFullscreen,
    behavior
  ]);

  // Handlers for Embed Via, URL, and Embed Code
  const handleEmbedViaChange = (val) => {
    setEmbedVia(val);
    if (!selectedElement) return;
    const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
    if (frameGroup) {
      frameGroup.setAttribute('data-embed-via', val);
      frameGroup.setAttribute('data-embed-type', val === 'URL' ? 'url' : 'embed-code');
    }
  };

  const handleUrlChange = (val) => {
    setUrl(val);
  };

  const handleCustomCodeChange = (val) => {
    setCustomCode(val);
  };

  // Handlers for Embed Controls
  const handleOpenWebsiteBtnChange = (val) => {
    setOpenWebsiteBtn(val);
    if (!selectedElement) return;
    const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
    if (frameGroup) {
      frameGroup.setAttribute('data-open-website-btn', val ? 'true' : 'false');
    }
  };

  const handleAllowFullscreenChange = (val) => {
    setAllowFullscreen(val);
    if (!selectedElement) return;
    const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
    if (frameGroup) {
      frameGroup.setAttribute('data-allow-fullscreen', val ? 'true' : 'false');
    }
  };

  const handleBehaviorChange = (val) => {
    setBehavior(val);
    if (!selectedElement) return;
    const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
    if (frameGroup) {
      frameGroup.setAttribute('data-behavior', val);
    }
  };

  // Handlers for Stoke Color & Width
  const handleStrokeColorChange = (newColor) => {
    setStrokeColor(newColor);
    if (!selectedElement) return;
    const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
    if (frameGroup) {
      frameGroup.setAttribute('data-stroke-color', newColor);
      frameGroup.setAttribute('stroke', newColor);
      const strokeOverlay = frameGroup.querySelector('.svg-image-stroke-overlay');
      if (strokeOverlay) {
        strokeOverlay.setAttribute('stroke', newColor);
      }
    }
    if (updateElementAttribute) {
      updateElementAttribute(activePageIndex, selectedLayerId, {
        'stroke': newColor,
        'data-stroke-color': newColor
      });
    }
  };

  const handleStrokeOpacityChange = (newOpacity) => {
    setStrokeOpacity(newOpacity);
    if (!selectedElement) return;
    const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
    if (frameGroup) {
      frameGroup.setAttribute('data-stroke-opacity', (newOpacity / 100).toString());
      frameGroup.setAttribute('stroke-opacity', (newOpacity / 100).toString());
      const strokeOverlay = frameGroup.querySelector('.svg-image-stroke-overlay');
      if (strokeOverlay) {
        strokeOverlay.setAttribute('stroke-opacity', (newOpacity / 100).toString());
      }
    }
    if (updateElementAttribute) {
      updateElementAttribute(activePageIndex, selectedLayerId, {
        'stroke-opacity': (newOpacity / 100).toString(),
        'data-stroke-opacity': (newOpacity / 100).toString()
      });
    }
  };

  const handleStrokeWidthChange = (newWidth) => {
    const val = Math.max(0, newWidth);
    setStrokeWidth(val);
    if (!selectedElement) return;
    const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
    if (frameGroup) {
      frameGroup.setAttribute('data-stroke-width', val.toString());
      frameGroup.setAttribute('stroke-width', val.toString());
      const strokeOverlay = frameGroup.querySelector('.svg-image-stroke-overlay');
      if (strokeOverlay) {
        strokeOverlay.setAttribute('stroke-width', val.toString());
      }
    }
    if (updateElementAttribute) {
      updateElementAttribute(activePageIndex, selectedLayerId, {
        'stroke-width': val.toString(),
        'data-stroke-width': val.toString()
      });
    }
  };

  const handleLineCornerChange = (corner) => {
    setLineCorner(corner);
    const linecap = corner === 'Rounded' ? 'round' : 'square';
    const linejoin = corner === 'Rounded' ? 'round' : 'miter';
    if (!selectedElement) return;
    const frameGroup = selectedElement.querySelector('[data-type="embed-frame"]') || (selectedElement.getAttribute('data-type') === 'embed-frame' ? selectedElement : null);
    if (frameGroup) {
      frameGroup.setAttribute('data-line-corner', corner);
      frameGroup.setAttribute('stroke-linecap', linecap);
      frameGroup.setAttribute('stroke-linejoin', linejoin);
      const strokeOverlay = frameGroup.querySelector('.svg-image-stroke-overlay');
      if (strokeOverlay) {
        strokeOverlay.setAttribute('stroke-linecap', linecap);
        strokeOverlay.setAttribute('stroke-linejoin', linejoin);
      }
    }
    if (updateElementAttribute) {
      updateElementAttribute(activePageIndex, selectedLayerId, {
        'data-line-corner': corner,
        'stroke-linecap': linecap,
        'stroke-linejoin': linejoin
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-[0.6vw] font-sans text-gray-800 pt-[0.2vw] pr-[0.2vw] select-none">

      {/* ─── 1. 3RD PARTY EMBED PROPERTY ─── */}
      <SectionHeader title="3rd Party Embed Property" />

      {/* Embed Via row */}
      <PropertyRow label="Embed Via">
        <div className="flex items-center gap-[1.2vw]">
          <RadioButton
            label="URL"
            checked={embedVia === 'URL'}
            onChange={() => handleEmbedViaChange('URL')}
          />
          <RadioButton
            label="Embed Code"
            checked={embedVia === 'Embed Code'}
            onChange={() => handleEmbedViaChange('Embed Code')}
          />
        </div>
      </PropertyRow>

      <div className="flex flex-col gap-[0.25vw] pl-[0.5vw] pr-[0.2vw]">
        <span className="text-[0.7vw] text-gray-500 font-medium">
          {embedVia === 'Embed Code' ? 'Code' : 'Source URL'}
        </span>

        {embedVia === 'Embed Code' ? (
          <textarea
            placeholder="Paste HTML code here"
            value={customCode}
            onChange={(e) => handleCustomCodeChange(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-[0.5vw] p-[0.6vw] text-[0.78vw] font-normal text-gray-800 placeholder-gray-400 outline-none focus:border-[#E05638] focus:ring-1 focus:ring-[#E05638] bg-white h-[5.5vw] resize-none shadow-2xs font-mono"
          />
        ) : (
          <div className="flex border border-gray-200 rounded-[0.5vw] overflow-hidden focus-within:border-[#E05638] focus-within:ring-1 focus-within:ring-[#E05638] transition-all bg-white shadow-2xs">
            <input
              type="text"
              placeholder="e.g. https://..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="flex-1 px-[0.6vw] py-[0.5vw] text-[0.78vw] font-normal outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            />
            <button
              type="button"
              onClick={() => {
                if (url) {
                  navigator.clipboard.writeText(url.startsWith('http') ? url : 'https://' + url);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 1500);
                }
              }}
              className="px-[0.6vw] flex items-center justify-center text-gray-500 hover:text-[#E05638] transition-colors bg-gray-50 border-l border-gray-200 cursor-pointer"
              title={copiedUrl ? 'Copied!' : 'Copy Link'}
            >
              {copiedUrl ? (
                <Check className="w-[0.85vw] h-[0.85vw] text-green-600" />
              ) : (
                <Copy className="w-[0.85vw] h-[0.85vw]" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* ─── 2. EMBED CONTROLS ─── */}
      <SectionHeader title="Embed Controls" />

      {/* Open website button */}
      <div className="flex items-center justify-between pl-[0.5vw] pr-[0.2vw] h-[2.2vw]">
        <span className="text-[0.78vw] text-gray-700 font-medium whitespace-nowrap">Open website button</span>
        <ToggleSwitch
          checked={openWebsiteBtn}
          onChange={handleOpenWebsiteBtnChange}
        />
      </div>

      {/* Allow Fullscreen */}
      <div className="flex items-center justify-between pl-[0.5vw] pr-[0.2vw] h-[2.2vw]">
        <div className="flex items-center gap-[0.25vw]">
          <span className="text-[0.78vw] text-gray-700 font-medium">Allow Fullscreen</span>
          <span className="text-gray-400 text-[0.68vw] font-normal">(if available)</span>
        </div>
        <ToggleSwitch
          checked={allowFullscreen}
          onChange={handleAllowFullscreenChange}
        />
      </div>

      {/* Behavior */}
      <PropertyRow label="Behavior">
        <CustomSelect
          value={behavior}
          onChange={handleBehaviorChange}
          options={BEHAVIOR_OPTIONS}
        />
      </PropertyRow>

      {/* ─── 3. STROKE COLOR ─── */}
      <SectionHeader title="Stroke Color" />

      {/* Color row */}
      <PropertyRow label="Color">
        <ColorInput
          color={strokeColor}
          onChange={handleStrokeColorChange}
          opacity={strokeOpacity}
          onOpenPicker={() => setActiveColorPicker(activeColorPicker === 'strokeColor' ? null : 'strokeColor')}
          isActive={activeColorPicker === 'strokeColor'}
        />
      </PropertyRow>

      {/* Stroke Width */}
      <PropertyRow label="Stroke Width">
        <div className="flex items-center gap-[0.3vw] h-[2.5vw] w-full">
          <button
            type="button"
            onClick={() => handleStrokeWidthChange(Math.max(0, strokeWidth - 1))}
            className="w-[2vw] h-full flex items-center justify-center bg-gray-100 rounded-[0.4vw] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer text-[1vw]"
          >
            -
          </button>
          <div className="flex-1 h-full bg-white border border-gray-200 rounded-[0.5vw] flex items-center justify-center shadow-2xs focus-within:border-[#E05638]">
            <input
              type="number"
              value={strokeWidth}
              onChange={(e) => handleStrokeWidthChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full text-center text-[0.8vw] text-gray-700 outline-none bg-transparent font-medium no-spin"
            />
          </div>
          <button
            type="button"
            onClick={() => handleStrokeWidthChange(strokeWidth + 1)}
            className="w-[2vw] h-full flex items-center justify-center bg-gray-100 rounded-[0.4vw] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer text-[1vw]"
          >
            +
          </button>
        </div>
      </PropertyRow>

      {/* Line Corner */}
      <PropertyRow label="Line Corner">
        <CustomSelect
          value={lineCorner}
          onChange={handleLineCornerChange}
          options={LINE_CORNER_OPTIONS}
        />
      </PropertyRow>

      {/* ─── 4. EFFECTS ─── */}
      <SectionHeader title="Effects" />

      <div>
        <Effect
          isShape={false}
          openSubSection={openSection}
          setOpenSubSection={setOpenSection}
          activeEffects={activeEffects}
          setActiveEffects={handleSetActiveEffects}
          effectSettings={effectSettings}
          setEffectSettings={handleSetEffectSettings}
          activeColorPicker={activeColorPicker}
          setActiveColorPicker={setActiveColorPicker}
          showDetailedPicker={showDetailedPicker}
          setShowDetailedPicker={setShowDetailedPicker}
          hideBlur={true}
          hideInnerShadow={true}
          hideHeader={true}
        />
      </div>

      {/* ─── PORTALS ─── */}
      {/* Official ColorPicker Portal Popup */}
      {activeColorPicker === 'strokeColor' && createPortal(
        <div
          className="fixed z-[5000]"
          style={{
            top: '50%',
            right: '19.5vw',
            transform: 'translateY(-50%)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <ColorPicker
              color={strokeColor}
              opacity={strokeOpacity}
              onOpacityChange={handleStrokeOpacityChange}
              onChange={handleStrokeColorChange}
              onClose={() => setActiveColorPicker(null)}
              disableGradient={false}
              colorsOnPage={colorsOnPageList}
            />
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default ElementEmbedProperties;
