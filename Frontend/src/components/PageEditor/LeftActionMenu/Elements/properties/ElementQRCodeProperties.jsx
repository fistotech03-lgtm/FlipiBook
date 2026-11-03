import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  ChevronUp,
  Upload,
  Pencil,
  Check,
  Copy,
  Image as ImageIcon,
  ArrowRightLeft,
  Trash2,
  Download
} from 'lucide-react';
import { renderQRWithFrame, generateStyledQRImage, drawRoundRect, loadImg, FONT_WEIGHT_MAP } from '../utils/qrFrameRenderer';
import Effect from '../../../properties/Effect';
import ColorPicker from '../../../properties/ColorPicker';
import MediaGalleryPopup from '../../../modals/MediaGalleryPopup';
import ReplaceMediaModal from '../../../modals/ReplaceMediaModal';
import { ElementToggle, ElementSlider } from './ElementUIControls';

// Predefined brand logos (clean inline SVG data URIs)
const PREDEFINED_LOGOS = [
  {
    name: 'Website',
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23E05638" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
  },
  {
    name: 'Instagram',
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23E1306C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>'
  },
  {
    name: 'WhatsApp',
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2325D366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'
  },
  {
    name: 'YouTube',
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23FF0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>'
  },
  {
    name: 'Facebook',
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%231877F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>'
  },
  {
    name: 'LinkedIn',
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%230A66C2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>'
  },
  {
    name: 'Location',
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23E05638" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
  },
  {
    name: 'Phone',
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
  },
  {
    name: 'Mail',
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
  }
];

// Dropdown Option Definitions
const PATTERN_OPTIONS = [
  { value: 'classic-square', label: 'Classic Square' },
  { value: 'rounded-square', label: 'Rounded Square' },
  { value: 'circular-dots', label: 'Circular Dots' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'horizontal-bars', label: 'Horizontal Bars' },
  { value: 'vertical-bars', label: 'Vertical Bars' },
  { value: 'tiny-pixel', label: 'Tiny Pixel' }
];

const EYE_FRAME_OPTIONS = [
  { value: 'classic-square', label: 'Classic Square' },
  { value: 'rounded-square', label: 'Rounded Square' },
  { value: 'circular-frame', label: 'Circular Frame' },
  { value: 'octagon', label: 'Octagon' },
  { value: 'squircle', label: 'Squircle' },
  { value: 'cut-corners', label: 'Cut Corners' },
  { value: 'double-border', label: 'Double Border' },
  { value: 'soft-corners', label: 'Soft Corners' }
];

const EYE_BALL_OPTIONS = [
  { value: 'square', label: 'Square' },
  { value: 'rounded-square', label: 'Rounded Square' },
  { value: 'circle', label: 'Circle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'small-dot', label: 'Small Dot' },
  { value: 'cross', label: 'Cross' },
  { value: 'star', label: 'Star' },
  { value: 'ring', label: 'Ring' }
];

const FONT_FAMILY_OPTIONS = [
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Caveat', label: 'Caveat' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Arial', label: 'Arial' }
];

const FONT_SIZE_OPTIONS = [
  { value: 14, label: '14' },
  { value: 16, label: '16' },
  { value: 18, label: '18' },
  { value: 20, label: '20' },
  { value: 22, label: '22' },
  { value: 24, label: '24' },
  { value: 28, label: '28' },
  { value: 32, label: '32' }
];

const FONT_WEIGHT_OPTIONS = [
  { value: 'Regular', label: 'Regular' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Semi Bold', label: 'Semi Bold' },
  { value: 'Bold', label: 'Bold' }
];

const DIMENSION_OPTIONS = [
  { value: '200x200', label: '200 × 200 px' },
  { value: '256x256', label: '256 × 256 px' },
  { value: '512x512', label: '512 × 512 px' },
  { value: 'custom', label: 'Custom' }
];

const DOWNLOAD_FORMAT_OPTIONS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' }
];

// Visual mini-icon representation for each style
const TypeIcon = ({ category, value, className = 'w-[0.9vw] h-[0.9vw] flex-shrink-0' }) => {
  if (category === 'pattern') {
    switch (value) {
      case 'rounded-square':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" fill="currentColor" />
          </svg>
        );
      case 'circular-dots':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <circle cx="8" cy="8" r="6.2" fill="currentColor" />
          </svg>
        );
      case 'extra-rounded':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="1.5" y="1.5" width="13" height="13" rx="5.5" fill="currentColor" />
          </svg>
        );
      case 'diamond':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <polygon points="8,1.5 14.5,8 8,14.5 1.5,8" fill="currentColor" />
          </svg>
        );
      case 'horizontal-bars':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="1.5" y="2.5" width="13" height="2.8" rx="1.2" fill="currentColor" />
            <rect x="1.5" y="6.6" width="13" height="2.8" rx="1.2" fill="currentColor" />
            <rect x="1.5" y="10.7" width="13" height="2.8" rx="1.2" fill="currentColor" />
          </svg>
        );
      case 'vertical-bars':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="2.5" y="1.5" width="2.8" height="13" rx="1.2" fill="currentColor" />
            <rect x="6.6" y="1.5" width="2.8" height="13" rx="1.2" fill="currentColor" />
            <rect x="10.7" y="1.5" width="2.8" height="13" rx="1.2" fill="currentColor" />
          </svg>
        );
      case 'tiny-pixel':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="2" y="2" width="3.5" height="3.5" fill="currentColor" />
            <rect x="10.5" y="2" width="3.5" height="3.5" fill="currentColor" />
            <rect x="6.2" y="6.2" width="3.5" height="3.5" fill="currentColor" />
            <rect x="2" y="10.5" width="3.5" height="3.5" fill="currentColor" />
            <rect x="10.5" y="10.5" width="3.5" height="3.5" fill="currentColor" />
          </svg>
        );
      case 'classic-square':
      default:
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="1.5" y="1.5" width="13" height="13" rx="1" fill="currentColor" />
          </svg>
        );
    }
  }

  if (category === 'eyeFrame') {
    switch (value) {
      case 'rounded-square':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="2" y="2" width="12" height="12" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
          </svg>
        );
      case 'circular-frame':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
          </svg>
        );
      case 'octagon':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <polygon points="5,2 11,2 14,5 14,11 11,14 5,14 2,11 2,5" fill="none" stroke="currentColor" strokeWidth="2.2" />
          </svg>
        );
      case 'squircle':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="2" y="2" width="12" height="12" rx="5" fill="none" stroke="currentColor" strokeWidth="2.4" />
          </svg>
        );
      case 'cut-corners':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <polygon points="5,2 14,2 14,11 11,14 2,14 2,5" fill="none" stroke="currentColor" strokeWidth="2.2" />
          </svg>
        );
      case 'double-border':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="1.5" y="1.5" width="13" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="4.5" y="4.5" width="7" height="7" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        );
      case 'soft-corners':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="2" y="2" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
          </svg>
        );
      case 'classic-square':
      default:
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="2" y="2" width="12" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="2.4" />
          </svg>
        );
    }
  }

  if (category === 'eyeBall') {
    switch (value) {
      case 'rounded-square':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="3.5" y="3.5" width="9" height="9" rx="2.5" fill="currentColor" />
          </svg>
        );
      case 'circle':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <circle cx="8" cy="8" r="4.5" fill="currentColor" />
          </svg>
        );
      case 'diamond':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <polygon points="8,2.5 13.5,8 8,13.5 2.5,8" fill="currentColor" />
          </svg>
        );
      case 'small-dot':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <circle cx="8" cy="8" r="3" fill="currentColor" />
          </svg>
        );
      case 'cross':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="6.5" y="2.5" width="3" height="11" rx="0.5" fill="currentColor" />
            <rect x="2.5" y="6.5" width="11" height="3" rx="0.5" fill="currentColor" />
          </svg>
        );
      case 'star':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <polygon points="8,2 9.8,6 14,6.5 10.8,9.5 11.8,14 8,11.8 4.2,14 5.2,9.5 2,6.5 6.2,6" fill="currentColor" />
          </svg>
        );
      case 'ring':
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'square':
      default:
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <rect x="3.5" y="3.5" width="9" height="9" rx="0.5" fill="currentColor" />
          </svg>
        );
    }
  }

  return null;
};

// Custom Select Component with embedded visual icons
const CustomSelect = ({ value, onChange, options, category, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[2.5vw] flex items-center justify-between bg-white border ${isOpen ? 'border-2 border-[#E05638] shadow-xs' : 'border border-gray-200 hover:border-gray-300'
          } rounded-[0.5vw] px-[0.6vw] text-[0.78vw] text-gray-800 transition-colors cursor-pointer shadow-2xs font-semibold`}
      >
        <div className="flex items-center gap-[0.4vw] min-w-0">
          {category && selectedOption && (
            <TypeIcon category={category} value={selectedOption.value} className="w-[0.9vw] h-[0.9vw] text-gray-700 shrink-0" />
          )}
          <span className="truncate font-semibold">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          className={`w-[0.9vw] h-[0.9vw] text-gray-500 transition-transform duration-200 flex-shrink-0 ml-[0.3vw] ${isOpen ? 'rotate-180 text-[#E05638]' : ''
            }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-[0.35vw] bg-white border border-gray-100 rounded-[0.6vw] shadow-2xl overflow-hidden z-[100] flex flex-col py-[0.3vw] max-h-[14vw] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-[0.7vw] py-[0.45vw] text-[0.78vw] font-semibold transition-colors text-left flex items-center justify-between cursor-pointer ${isSelected
                    ? 'text-[#E05638] bg-[#E05638]/10 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#E05638]'
                    }`}
                >
                  <div className="flex items-center gap-[0.45vw] min-w-0">
                    {category && (
                      <TypeIcon category={category} value={opt.value} className={`w-[0.9vw] h-[0.9vw] shrink-0 ${isSelected ? 'text-[#E05638]' : 'text-gray-600'}`} />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-[0.8vw] h-[0.8vw] text-[#E05638] flex-shrink-0 ml-[0.3vw]" />}
                </button>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
};

// Helper row with fixed-width label
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

// Color swatch + hex input box
const ColorInput = ({ color, onChange, opacity = 100, onOpenPicker, isActive = false }) => {
  const displayColor = color && color.startsWith('#') ? color.toUpperCase() : color || '#000000';

  return (
    <div className="flex items-center gap-[0.4vw] w-full">
      <div
        onClick={onOpenPicker}
        className={`color-box color-box-trigger w-[2vw] h-[2vw] rounded-[0.5vw] border flex-shrink-0 relative overflow-hidden flex items-center justify-center cursor-pointer shadow-2xs hover:scale-105 transition-all ${isActive ? 'border-[#E05638] ring-2 ring-[#E05638]/40 scale-105 shadow-xs' : 'border-gray-200 hover:border-gray-300'
          }`}
        style={{ backgroundColor: color || '#000000' }}
        title="Click to open color palette"
      />
      <div className="flex-1 h-[2vw] flex items-center justify-between border border-gray-200 rounded-[0.5vw] bg-white px-[0.6vw] text-[0.8vw] text-gray-800 focus-within:border-[#E05638] shadow-2xs">
        <input
          type="text"
          value={displayColor}
          onChange={(e) => {
            let val = e.target.value;
            if (!val.startsWith('#') && val.length > 0) val = '#' + val;
            onChange(val);
          }}
          className="w-[5.2vw] font-mono text-[0.8vw] text-gray-500 bg-transparent focus:outline-none uppercase font-normal"
          maxLength={7}
        />
        <span className="text-gray-400 text-[0.75vw] font-semibold">{opacity}%</span>
      </div>

    </div>
  );
};

// Helper to sync live SVG filters on DOM element for Drop Shadow
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

  const baseFilterId = `filter-${el.id || 'qrcode'}`;
  Array.from(defs.querySelectorAll(`[id^="${baseFilterId}"]`)).forEach(old => old.remove());

  const hasDropShadow = el.getAttribute('data-effect-drop-shadow') === 'true';
  if (!hasDropShadow) {
    el.removeAttribute('filter');
    return;
  }

  const filterId = `${baseFilterId}-${Math.random().toString(36).substr(2, 4)}`;
  const filterEl = doc.createElementNS("http://www.w3.org/2000/svg", "filter");
  filterEl.id = filterId;
  filterEl.setAttribute('x', '-50%');
  filterEl.setAttribute('y', '-50%');
  filterEl.setAttribute('width', '200%');
  filterEl.setAttribute('height', '200%');
  defs.appendChild(filterEl);

  const getVal = (attr, def) => el.getAttribute(attr) || def;
  const color = getVal('data-effect-drop-shadow-color', '#000000');
  const opacity = parseFloat(getVal('data-effect-drop-shadow-opacity', '35')) / 100;
  const dx = getVal('data-effect-drop-shadow-x', '2');
  const dy = getVal('data-effect-drop-shadow-y', '2');
  const blur = parseFloat(getVal('data-effect-drop-shadow-blur', '4'));
  const spread = parseFloat(getVal('data-effect-drop-shadow-spread', '0'));

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
  offset.setAttribute('dx', dx);
  offset.setAttribute('dy', dy);
  offset.setAttribute('in', 'ds_blur');
  offset.setAttribute('result', 'ds_offset');
  filterEl.appendChild(offset);

  const flood = doc.createElementNS("http://www.w3.org/2000/svg", "feFlood");
  flood.setAttribute('flood-color', color);
  flood.setAttribute('flood-opacity', opacity);
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

const ElementQRCodeProperties = ({
  selectedElement,
  selectedLayerId,
  activePageIndex,
  updateElementAttribute,
  selectedElementProps,
  onUpdate
}) => {
  // Content state
  const [url, setUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Preview & QR matrix styling
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [qrColor, setQrColor] = useState('#000000');
  const [backdrop, setBackdrop] = useState('#FFFFFF');
  const [patternStyle, setPatternStyle] = useState('classic-square');
  const [eyeFrame, setEyeFrame] = useState('classic-square');
  const [eyeBall, setEyeBall] = useState('square');

  // Center logo states
  const [hasLogo, setHasLogo] = useState(true);
  const [isLogoSectionOpen, setIsLogoSectionOpen] = useState(true);
  const [logoTab, setLogoTab] = useState('upload'); // 'upload' | 'predefined' | 'gallery'
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [logoSrc, setLogoSrc] = useState(null);
  const [logoName, setLogoName] = useState('Logo.png');
  const [logoMeta, setLogoMeta] = useState(null);
  const [logoSize, setLogoSize] = useState(80);
  const [logoRadius, setLogoRadius] = useState(12);
  const [logoBgColor, setLogoBgColor] = useState('#FFFFFF');
  const fileInputRef = useRef(null);
  const galleryBtnRef = useRef(null);

  // Frames & Typography states
  const [frame, setFrame] = useState('frame-curved-arrow');
  const [text, setText] = useState('Scan Me');
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState('Semi Bold');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [frameBgColor, setFrameBgColor] = useState('#FFFFFF');
  const [arrowColor, setArrowColor] = useState('#000000');

  // Export / Dimension & Download states
  const [dimension, setDimension] = useState('256x256');
  const [customWidth, setCustomWidth] = useState(256);
  const [customHeight, setCustomHeight] = useState(256);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDimensionOpen, setIsDimensionOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const dimensionRef = useRef(null);
  const downloadRef = useRef(null);

  // Close Dimension & Download dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dimensionRef.current && !dimensionRef.current.contains(e.target)) {
        setIsDimensionOpen(false);
      }
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setIsDownloadOpen(false);
      }
    };
    if (isDimensionOpen || isDownloadOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDimensionOpen, isDownloadOpen]);

  // Handler to export / download the QR Code
  const handleDownloadQR = async (format) => {
    setIsDownloadOpen(false);
    setIsDownloading(true);

    try {
      let targetW = 256;
      let targetH = 256;
      if (dimension === 'custom') {
        targetW = Math.max(32, Math.min(4096, parseInt(customWidth) || 256));
        targetH = Math.max(32, Math.min(4096, parseInt(customHeight) || 256));
      } else {
        const [w, h] = dimension.split('x').map(Number);
        targetW = w || 256;
        targetH = h || 256;
      }

      if (format === 'svg') {
        // High quality vector SVG download
        let svgContent = '';
        if (previewDataUrl && previewDataUrl.startsWith('data:image/svg+xml')) {
          if (previewDataUrl.includes(';base64,')) {
            const base64Part = previewDataUrl.split(';base64,')[1];
            svgContent = decodeURIComponent(escape(atob(base64Part)));
          } else {
            svgContent = decodeURIComponent(previewDataUrl.split(',')[1]);
          }
        } else {
          // Render SVG wrapper
          const currentDataUrl = previewDataUrl;
          svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${targetW}" height="${targetH}" viewBox="0 0 ${targetW} ${targetH}">
  <image width="${targetW}" height="${targetH}" href="${currentDataUrl}" xlink:href="${currentDataUrl}" preserveAspectRatio="xMidYMid meet" />
</svg>`;
        }

        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `qrcode_${targetW}x${targetH}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        // Render crisp raster at requested dimensions
        // Compute scale so the output canvas precisely matches target dimensions
        const testRender = await renderQRWithFrame({
          url,
          frame,
          text,
          logoSrc: hasLogo ? logoSrc : null,
          logoSize: Math.round((logoSize / 100) * 28),
          logoRadius,
          logoBg: true,
          logoBgColor,
          qrColor,
          backdrop,
          patternStyle,
          eyeFrame,
          eyeBall,
          fontFamily,
          fontSize,
          fontWeight,
          textColor,
          frameBgColor,
          arrowColor,
          scale: 1
        });

        const naturalW = testRender.totalWidth || 256;
        const naturalH = testRender.totalHeight || 256;
        const scaleX = targetW / naturalW;
        const scaleY = targetH / naturalH;
        const uniformScale = Math.max(scaleX, scaleY);

        const rendered = await renderQRWithFrame({
          url,
          frame,
          text,
          logoSrc: hasLogo ? logoSrc : null,
          logoSize: Math.round((logoSize / 100) * 28),
          logoRadius,
          logoBg: true,
          logoBgColor,
          qrColor,
          backdrop,
          patternStyle,
          eyeFrame,
          eyeBall,
          fontFamily,
          fontSize,
          fontWeight,
          textColor,
          frameBgColor,
          arrowColor,
          scale: uniformScale
        });

        // Fit onto an exact targetW x targetH canvas
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = targetW;
        exportCanvas.height = targetH;
        const ctx = exportCanvas.getContext('2d');

        if (format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
        }

        const img = await loadImg(rendered.dataUrl);
        if (img) {
          // Draw centered / fitted
          const imgAspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
          const canvasAspect = targetW / targetH;
          let drawW = targetW;
          let drawH = targetH;
          let drawX = 0;
          let drawY = 0;

          if (imgAspect > canvasAspect) {
            drawW = targetW;
            drawH = targetW / imgAspect;
            drawY = (targetH - drawH) / 2;
          } else {
            drawH = targetH;
            drawW = targetH * imgAspect;
            drawX = (targetW - drawW) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        }

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const fileExt = format === 'jpeg' ? 'jpg' : 'png';
        const exportDataUrl = exportCanvas.toDataURL(mimeType, 0.95);

        const link = document.createElement('a');
        link.href = exportDataUrl;
        link.download = `qrcode_${targetW}x${targetH}.${fileExt}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download QR Code error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderSeqRef = useRef(0);

  // Effects states for Effect.jsx (Drop Shadow only)
  const [openSubSection, setOpenSubSection] = useState(null);
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [showDetailedPicker, setShowDetailedPicker] = useState(false);
  const [activeEffects, setActiveEffects] = useState([]);

  // Close color picker on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeColorPicker) setActiveColorPicker(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeColorPicker]);

  const handleToggleColorPicker = (pickerKey) => {
    setActiveColorPicker((prev) => (prev === pickerKey ? null : pickerKey));
    if (setShowDetailedPicker) {
      setShowDetailedPicker(false);
    }
  };
  const [effectSettings, setEffectSettings] = useState({
    'Drop Shadow': {
      x: 2,
      y: 2,
      blur: 4,
      spread: 0,
      color: '#000000',
      opacity: 35
    }
  });

  const handleSetActiveEffects = (updater) => {
    const next = typeof updater === 'function' ? updater(activeEffects) : updater;
    setActiveEffects(next);
    const hasDropShadow = next.includes('Drop Shadow');

    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const targetId = selectedLayerId;
    const targetEl = (targetId ? editorDoc.getElementById(targetId) : null) || (targetId ? document.getElementById(targetId) : null) || selectedElement;

    if (targetEl) {
      targetEl.setAttribute('data-effect-drop-shadow', hasDropShadow ? 'true' : 'false');
      syncLiveFilters(targetEl);
    }

    if (updateElementAttribute && activePageIndex !== undefined && targetId) {
      updateElementAttribute(activePageIndex, targetId, {
        'data-effect-drop-shadow': hasDropShadow ? 'true' : 'false'
      });
    }

    if (targetEl && onUpdate) {
      let svgRoot = targetEl;
      while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
        svgRoot = svgRoot.parentElement;
      }
      if (!svgRoot) {
        const container = targetEl.closest('.page-svg-container');
        if (container) {
          const canvasContent = container.querySelector('[id^="canvas-content-"]');
          svgRoot = canvasContent ? canvasContent.querySelector('svg') : container.querySelector('svg');
        }
      }
      if (svgRoot) {
        const cloneSvg = svgRoot.cloneNode(true);
        cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary, #ghost-layer, .selection-overlay-layer').forEach(el => el.remove());
        const serializer = new XMLSerializer();
        onUpdate(serializer.serializeToString(cloneSvg));
      }
    }
  };

  const handleSetEffectSettings = (updater) => {
    const next = typeof updater === 'function' ? updater(effectSettings) : updater;
    setEffectSettings(next);
    const ds = next?.['Drop Shadow'] || {};

    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const targetId = selectedLayerId;
    const targetEl = (targetId ? editorDoc.getElementById(targetId) : null) || (targetId ? document.getElementById(targetId) : null) || selectedElement;

    const updates = {
      'data-effect-drop-shadow-x': (ds.x ?? 2).toString(),
      'data-effect-drop-shadow-y': (ds.y ?? 2).toString(),
      'data-effect-drop-shadow-blur': (ds.blur ?? 4).toString(),
      'data-effect-drop-shadow-spread': (ds.spread ?? 0).toString(),
      'data-effect-drop-shadow-color': ds.color || '#000000',
      'data-effect-drop-shadow-opacity': (ds.opacity ?? 35).toString(),
    };

    if (targetEl) {
      Object.entries(updates).forEach(([k, v]) => targetEl.setAttribute(k, v));
      syncLiveFilters(targetEl);
    }

    if (updateElementAttribute && activePageIndex !== undefined && targetId) {
      updateElementAttribute(activePageIndex, targetId, updates);
    }

    if (targetEl && onUpdate) {
      let svgRoot = targetEl;
      while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
        svgRoot = svgRoot.parentElement;
      }
      if (!svgRoot) {
        const container = targetEl.closest('.page-svg-container');
        if (container) {
          const canvasContent = container.querySelector('[id^="canvas-content-"]');
          svgRoot = canvasContent ? canvasContent.querySelector('svg') : container.querySelector('svg');
        }
      }
      if (svgRoot) {
        const cloneSvg = svgRoot.cloneNode(true);
        cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary, #ghost-layer, .selection-overlay-layer').forEach(el => el.remove());
        const serializer = new XMLSerializer();
        onUpdate(serializer.serializeToString(cloneSvg));
      }
    }
  };

  // Initialize state from selected element DOM attributes
  useEffect(() => {
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const targetId = selectedLayerId;
    const targetEl = (targetId ? editorDoc.getElementById(targetId) : null) || (targetId ? document.getElementById(targetId) : null) || selectedElement;

    if (targetEl) {
      const storedUrl = targetEl.getAttribute('data-qr-url');
      setUrl(storedUrl !== null ? storedUrl : '');

      setQrColor(targetEl.getAttribute('data-qr-color') || '#000000');
      setBackdrop(targetEl.getAttribute('data-qr-backdrop') || '#FFFFFF');
      setPatternStyle(targetEl.getAttribute('data-qr-pattern') || 'classic-square');
      setEyeFrame(targetEl.getAttribute('data-qr-eye-frame') || 'classic-square');
      setEyeBall(targetEl.getAttribute('data-qr-eye-ball') || 'square');

      const existingLogo = targetEl.getAttribute('data-qr-logo');
      const isPredefined = PREDEFINED_LOGOS.some(item => item.src === existingLogo);
      setLogoTab(isPredefined ? 'predefined' : 'upload');
      const hasLogoAttr = targetEl.getAttribute('data-qr-has-logo');
      setHasLogo(hasLogoAttr !== null ? hasLogoAttr === 'true' : !!existingLogo);
      setLogoSrc(existingLogo || null);
      setLogoName(targetEl.getAttribute('data-qr-logo-name') || 'Logo.png');
      setLogoMeta(targetEl.getAttribute('data-qr-logo-meta') || null);
      setLogoSize(parseInt(targetEl.getAttribute('data-qr-logo-size')) || 80);
      setLogoRadius(targetEl.getAttribute('data-qr-logo-radius') !== null ? parseInt(targetEl.getAttribute('data-qr-logo-radius')) : 12);
      setLogoBgColor(targetEl.getAttribute('data-qr-logo-bg-color') || '#FFFFFF');

      const currentFrame = targetEl.getAttribute('data-qr-frame') || 'frame-none';
      const isLightBg = currentFrame === 'frame-curved-arrow' || currentFrame === 'frame-simple-text';
      const defaultTextColor = isLightBg ? '#000000' : '#FFFFFF';
      const defaultFontFamily = currentFrame === 'frame-curved-arrow' ? 'Caveat' : 'Poppins';

      setFrame(currentFrame);
      setText(targetEl.getAttribute('data-qr-text') ?? (currentFrame === 'frame-curved-arrow' ? 'Scan Me' : (currentFrame === 'frame-none' ? '' : 'SCAN ME')));
      setFontFamily(targetEl.getAttribute('data-qr-font-family') || defaultFontFamily);
      setFontSize(parseInt(targetEl.getAttribute('data-qr-font-size')) || 24);
      setFontWeight(targetEl.getAttribute('data-qr-font-weight') || 'Semi Bold');
      setTextColor(targetEl.getAttribute('data-qr-text-color') || defaultTextColor);
      setFrameBgColor(targetEl.getAttribute('data-qr-frame-bg') || '#FFFFFF');
      setArrowColor(targetEl.getAttribute('data-qr-arrow-color') || '#000000');

      const hasDs = (targetEl.getAttribute('data-effect-drop-shadow') === 'true') ||
        (selectedElementProps?.['data-effect-drop-shadow'] === 'true');
      setActiveEffects(hasDs ? ['Drop Shadow'] : []);
      setEffectSettings({
        'Drop Shadow': {
          x: parseFloat(targetEl.getAttribute('data-effect-drop-shadow-x') || selectedElementProps?.['data-effect-drop-shadow-x'] || 2),
          y: parseFloat(targetEl.getAttribute('data-effect-drop-shadow-y') || selectedElementProps?.['data-effect-drop-shadow-y'] || 2),
          blur: parseFloat(targetEl.getAttribute('data-effect-drop-shadow-blur') || selectedElementProps?.['data-effect-drop-shadow-blur'] || 4),
          spread: parseFloat(targetEl.getAttribute('data-effect-drop-shadow-spread') || selectedElementProps?.['data-effect-drop-shadow-spread'] || 0),
          color: targetEl.getAttribute('data-effect-drop-shadow-color') || selectedElementProps?.['data-effect-drop-shadow-color'] || '#000000',
          opacity: parseFloat(targetEl.getAttribute('data-effect-drop-shadow-opacity') || selectedElementProps?.['data-effect-drop-shadow-opacity'] || 35),
        }
      });

      // Initialize preview from existing image href
      const imgNode = targetEl.querySelector('image');
      if (imgNode && (imgNode.getAttribute('href') || imgNode.getAttribute('xlink:href'))) {
        setPreviewDataUrl(imgNode.getAttribute('href') || imgNode.getAttribute('xlink:href'));
      }
    }
  }, [selectedElement, selectedLayerId, selectedElementProps]);

  // Update canvas element and refresh preview
  const updateQR = async (overrides = {}) => {
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const targetId = selectedLayerId;
    const targetEl = (targetId ? editorDoc.getElementById(targetId) : null) || (targetId ? document.getElementById(targetId) : null) || selectedElement;
    if (!targetEl) return;

    const currentUrl = overrides.url !== undefined ? overrides.url : url;
    const currentQrColor = overrides.qrColor !== undefined ? overrides.qrColor : qrColor;
    const currentBackdrop = overrides.backdrop !== undefined ? overrides.backdrop : backdrop;
    const currentPattern = overrides.patternStyle !== undefined ? overrides.patternStyle : patternStyle;
    const currentEyeFrame = overrides.eyeFrame !== undefined ? overrides.eyeFrame : eyeFrame;
    const currentEyeBall = overrides.eyeBall !== undefined ? overrides.eyeBall : eyeBall;

    const currentHasLogo = overrides.hasLogo !== undefined ? overrides.hasLogo : hasLogo;
    const currentLogoSrc = currentHasLogo ? (overrides.logoSrc !== undefined ? overrides.logoSrc : logoSrc) : null;
    const currentLogoSize = overrides.logoSize !== undefined ? overrides.logoSize : logoSize;
    const currentLogoRadius = overrides.logoRadius !== undefined ? overrides.logoRadius : logoRadius;
    const currentLogoBgColor = overrides.logoBgColor !== undefined ? overrides.logoBgColor : logoBgColor;

    const currentFrame = overrides.frame !== undefined ? overrides.frame : frame;
    const currentText = overrides.text !== undefined ? overrides.text : text;
    const currentFontFamily = overrides.fontFamily !== undefined ? overrides.fontFamily : fontFamily;
    const currentFontSize = overrides.fontSize !== undefined ? overrides.fontSize : fontSize;
    const currentFontWeight = overrides.fontWeight !== undefined ? overrides.fontWeight : fontWeight;
    const currentTextColor = overrides.textColor !== undefined ? overrides.textColor : textColor;
    const currentFrameBg = overrides.frameBgColor !== undefined ? overrides.frameBgColor : frameBgColor;
    const currentArrowColor = overrides.arrowColor !== undefined ? overrides.arrowColor : arrowColor;

    // Sync attributes onto SVG element
    targetEl.setAttribute('data-qr-url', currentUrl);
    targetEl.setAttribute('data-qr-color', currentQrColor);
    targetEl.setAttribute('data-qr-backdrop', currentBackdrop);
    targetEl.setAttribute('data-qr-pattern', currentPattern);
    targetEl.setAttribute('data-qr-eye-frame', currentEyeFrame);
    targetEl.setAttribute('data-qr-eye-ball', currentEyeBall);

    targetEl.setAttribute('data-qr-has-logo', currentHasLogo ? 'true' : 'false');
    targetEl.setAttribute('data-qr-logo', currentLogoSrc || '');
    targetEl.setAttribute('data-qr-logo-name', overrides.logoName !== undefined ? overrides.logoName : logoName);
    if (overrides.logoMeta !== undefined || logoMeta) {
      targetEl.setAttribute('data-qr-logo-meta', overrides.logoMeta !== undefined ? overrides.logoMeta : (logoMeta || ''));
    }
    targetEl.setAttribute('data-qr-logo-size', currentLogoSize.toString());
    targetEl.setAttribute('data-qr-logo-radius', currentLogoRadius.toString());
    targetEl.setAttribute('data-qr-logo-bg-color', currentLogoBgColor);

    targetEl.setAttribute('data-qr-frame', currentFrame);
    targetEl.setAttribute('data-qr-text', currentText !== undefined && currentText !== null ? currentText : '');
    targetEl.setAttribute('data-qr-font-family', currentFontFamily);
    targetEl.setAttribute('data-qr-font-size', currentFontSize.toString());
    targetEl.setAttribute('data-qr-font-weight', currentFontWeight);
    targetEl.setAttribute('data-qr-text-color', currentTextColor);
    targetEl.setAttribute('data-qr-frame-bg', currentFrameBg);
    targetEl.setAttribute('data-qr-arrow-color', currentArrowColor);

    const seq = ++renderSeqRef.current;
    try {
      const { dataUrl, totalWidth, totalHeight } = await renderQRWithFrame({
        url: currentUrl,
        frame: currentFrame,
        text: currentText,
        logoSrc: currentLogoSrc,
        logoSize: Math.round((currentLogoSize / 100) * 28), // proportional scale
        logoRadius: currentLogoRadius,
        logoBg: true,
        logoBgColor: currentLogoBgColor,
        qrColor: currentQrColor,
        backdrop: currentBackdrop,
        patternStyle: currentPattern,
        eyeFrame: currentEyeFrame,
        eyeBall: currentEyeBall,
        fontFamily: currentFontFamily,
        fontSize: currentFontSize,
        fontWeight: currentFontWeight,
        textColor: currentTextColor,
        frameBgColor: currentFrameBg,
        arrowColor: currentArrowColor
      });

      if (seq !== renderSeqRef.current) return;

      setPreviewDataUrl(dataUrl);

      const imageNode = targetEl.querySelector('image');
      let currentDisplayWidth = 50;

      if (imageNode) {
        const existingW = parseFloat(imageNode.getAttribute('width'));
        if (!isNaN(existingW) && existingW > 0) {
          currentDisplayWidth = existingW;
        }
        const newDisplayHeight = currentDisplayWidth * (totalHeight / totalWidth);
        imageNode.setAttribute('href', dataUrl);
        imageNode.setAttribute('xlink:href', dataUrl);
        imageNode.setAttribute('width', currentDisplayWidth.toString());
        imageNode.setAttribute('height', newDisplayHeight.toString());
      }

      const rectNode = targetEl.querySelector('rect');
      if (rectNode) {
        const existingW = parseFloat(rectNode.getAttribute('width'));
        const displayW = (!isNaN(existingW) && existingW > 0) ? existingW : currentDisplayWidth;
        const displayH = displayW * (totalHeight / totalWidth);
        rectNode.setAttribute('width', displayW.toString());
        rectNode.setAttribute('height', displayH.toString());
      }

      if (targetEl.getAttribute('data-effect-drop-shadow') === 'true') {
        syncLiveFilters(targetEl);
      }

      // Recompute selection box on canvas
      window.dispatchEvent(new CustomEvent('force-update-selection-box', { detail: { elementId: targetEl.id } }));

      // Find root svg and serialize full SVG for dom sync
      window.__skipCanvasUpdateForPage = activePageIndex;
      let svgRoot = targetEl;
      while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
        svgRoot = svgRoot.parentElement;
      }
      if (!svgRoot) {
        const container = targetEl.closest('.page-svg-container');
        if (container) {
          const canvasContent = container.querySelector('[id^="canvas-content-"]');
          svgRoot = canvasContent ? canvasContent.querySelector('svg') : container.querySelector('svg');
        }
      }

      if (svgRoot) {
        const cloneSvg = svgRoot.cloneNode(true);
        cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary, #ghost-layer, .selection-overlay-layer').forEach(el => el.remove());
        const serializer = new XMLSerializer();
        const fullSvgHtml = serializer.serializeToString(cloneSvg);

        if (updateElementAttribute && activePageIndex !== undefined && targetId) {
          updateElementAttribute(activePageIndex, targetId, '__dom_sync__', fullSvgHtml);
        }
        if (onUpdate) {
          onUpdate(fullSvgHtml);
        }
      } else {
        if (onUpdate) onUpdate();
      }
    } catch (e) {
      console.error('Error rendering QR composite:', e);
    }
  };

  const handleChange = (key, value) => {
    let sanitizedValue = value;
    if (key === 'url' && typeof value === 'string') {
      // Clean up accidental duplicate protocols like https://https:// or http://https://
      sanitizedValue = value.replace(/^(?:https?:\/\/)+(https?:\/\/)/i, '$1');
    }

    const overrides = { [key]: sanitizedValue };

    if (key === 'url') setUrl(sanitizedValue);
    if (key === 'qrColor') setQrColor(value);
    if (key === 'backdrop') setBackdrop(value);
    if (key === 'patternStyle') setPatternStyle(value);
    if (key === 'eyeFrame') setEyeFrame(value);
    if (key === 'eyeBall') setEyeBall(value);

    if (key === 'hasLogo') setHasLogo(value);
    if (key === 'logoSrc') setLogoSrc(value);
    if (key === 'logoName') setLogoName(value);
    if (key === 'logoMeta') setLogoMeta(value);
    if (key === 'logoSize') setLogoSize(value);
    if (key === 'logoRadius') setLogoRadius(value);
    if (key === 'logoBgColor') setLogoBgColor(value);

    if (key === 'frame') {
      setFrame(value);
      const isNewLightBg = value === 'frame-curved-arrow' || value === 'frame-simple-text';

      if (value === 'frame-curved-arrow' && (!text || text === 'SCAN ME')) {
        setText('Scan Me');
        overrides.text = 'Scan Me';
      } else if (value !== 'frame-curved-arrow' && text === 'Scan Me') {
        setText('SCAN ME');
        overrides.text = 'SCAN ME';
      }

      // If switching to light-bg frame and textColor is currently white, auto-switch to black so it remains visible
      if (isNewLightBg && (!textColor || textColor.toUpperCase() === '#FFFFFF' || textColor.toUpperCase() === '#FFF')) {
        setTextColor('#000000');
        overrides.textColor = '#000000';
      } else if (!isNewLightBg && (textColor === '#000000' || textColor === '#000')) {
        setTextColor('#FFFFFF');
        overrides.textColor = '#FFFFFF';
      }

      if (value === 'frame-curved-arrow' && fontFamily === 'Poppins') {
        setFontFamily('Caveat');
        overrides.fontFamily = 'Caveat';
      } else if (value !== 'frame-curved-arrow' && fontFamily === 'Caveat') {
        setFontFamily('Poppins');
        overrides.fontFamily = 'Poppins';
      }
    }
    if (key === 'text') setText(value);
    if (key === 'fontFamily') setFontFamily(value);
    if (key === 'fontSize') setFontSize(value);
    if (key === 'fontWeight') setFontWeight(value);
    if (key === 'textColor') setTextColor(value);
    if (key === 'frameBgColor') setFrameBgColor(value);
    if (key === 'arrowColor') setArrowColor(value);

    updateQR(overrides);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('logoSrc', event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const QR_COLOR_MAP = {
    qrColor: {
      label: 'QR Color',
      value: qrColor,
      onChange: (val) => handleChange('qrColor', val)
    },
    backdrop: {
      label: 'Backdrop',
      value: backdrop,
      onChange: (val) => handleChange('backdrop', val)
    },
    logoBgColor: {
      label: 'Background',
      value: logoBgColor,
      onChange: (val) => handleChange('logoBgColor', val)
    },
    textColor: {
      label: 'Text Color',
      value: textColor,
      onChange: (val) => handleChange('textColor', val)
    },
    frameBgColor: {
      label: 'Bg Color',
      value: frameBgColor,
      onChange: (val) => handleChange('frameBgColor', val)
    },
    arrowColor: {
      label: 'Arrow Color',
      value: arrowColor,
      onChange: (val) => handleChange('arrowColor', val)
    }
  };

  const isQrColorPickerOpen = Boolean(activeColorPicker && QR_COLOR_MAP[activeColorPicker]);
  const colorsOnPageList = useMemo(() => {
    return [qrColor, backdrop, logoBgColor, textColor, frameBgColor, arrowColor].filter(
      (c) => typeof c === 'string' && c.startsWith('#')
    );
  }, [qrColor, backdrop, logoBgColor, textColor, frameBgColor, arrowColor]);

  return (
    <div className="w-full flex flex-col gap-[0.6vw] font-sans text-gray-800 pt-[0.2vw] select-none overflow-x-hidden">
      {/* 1. Header: QR Property */}
      <div className="flex items-center gap-[0.4vw]">
        <span className="text-[0.9vw] font-semibold text-black whitespace-nowrap">QR Property</span>
        <div className="h-[0.06vw] bg-gray-200 flex-1 ml-[0.3vw]" />
      </div>

      {/* 2. URL */}
      <PropertyRow label="URL">
        <div className="flex border border-gray-200 rounded-[0.5vw] overflow-hidden focus-within:border-[#E05638] focus-within:ring-1 focus-within:ring-[#E05638] transition-all bg-white shadow-2xs">
          <input
            type="text"
            placeholder="e.g. https://..."
            value={url}
            onChange={(e) => handleChange('url', e.target.value)}
            className="flex-1 px-[0.6vw] py-[0.5vw] text-[0.78vw] font-semibold outline-none text-gray-800 placeholder-gray-400 bg-transparent"
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
      </PropertyRow>

      {/* 3. QR Code Preview with Dimension & Download */}
      <div className="flex items-center justify-between gap-[0.8vw] my-[0.4vw] p-[0.3vw] bg-gray-50/50 rounded-[0.6vw] border border-gray-100">
        {/* Left side: QR Code Preview */}
        <div className="flex flex-col items-center">
          <div className="w-[6.5vw] h-[6.5vw] max-w-[130px] max-h-[130px] min-w-[85px] min-h-[85px] bg-white rounded-[0.5vw] p-[0.3vw] border border-gray-200 shadow-2xs flex items-center justify-center overflow-hidden">
            {previewDataUrl ? (
              <img src={previewDataUrl} alt="QR Code Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[0.62vw]">Generating...</div>
            )}
          </div>
          <span className="text-[0.68vw] text-gray-600 font-semibold mt-[0.25vw] text-center whitespace-nowrap">QR Code Preview</span>
        </div>

        {/* Right side: Dimension and Download Controls */}
        <div className="flex-1 flex flex-col gap-[0.45vw] justify-center min-w-0 pr-[0.2vw]">
          {/* Dimension Dropdown */}
          <div ref={dimensionRef} className="relative w-full">
            <label className="text-[0.68vw] font-semibold text-gray-700 block mb-[0.15vw]">Dimension</label>
            <button
              type="button"
              onClick={() => {
                setIsDimensionOpen(!isDimensionOpen);
                setIsDownloadOpen(false);
              }}
              className={`w-full h-[2.1vw] min-h-[30px] px-[0.6vw] flex items-center justify-between bg-white border ${
                isDimensionOpen ? 'border-2 border-[#E05638] shadow-xs' : 'border border-gray-200 hover:border-gray-300'
              } rounded-[0.45vw] text-[0.74vw] font-semibold text-gray-800 cursor-pointer transition-all shadow-2xs`}
              title="Select Dimension"
            >
              <span className="truncate">
                {dimension === 'custom'
                  ? `${customWidth} × ${customHeight} px`
                  : (DIMENSION_OPTIONS.find(d => d.value === dimension)?.label || 'Select size...')}
              </span>
              <ChevronDown
                className={`w-[0.8vw] h-[0.8vw] text-gray-500 transition-transform duration-200 flex-shrink-0 ml-[0.2vw] ${
                  isDimensionOpen ? 'rotate-180 text-[#E05638]' : ''
                }`}
              />
            </button>

            {isDimensionOpen && (
              <div className="absolute right-0 left-0 top-full mt-[0.3vw] bg-white border border-gray-100 rounded-[0.55vw] shadow-xl overflow-hidden z-[110] flex flex-col py-[0.3vw] animate-in fade-in zoom-in-95 duration-150">
                {DIMENSION_OPTIONS.map((opt) => {
                  const isSelected = dimension === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setDimension(opt.value);
                        if (opt.value !== 'custom') {
                          setIsDimensionOpen(false);
                        }
                      }}
                      className={`px-[0.7vw] py-[0.4vw] text-[0.74vw] font-semibold transition-colors text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'text-[#E05638] bg-[#FFF2EE]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-[0.8vw] h-[0.8vw] text-[#E05638]" />}
                    </button>
                  );
                })}

                {/* Custom Size Inputs */}
                {dimension === 'custom' && (
                  <div className="px-[0.6vw] pt-[0.4vw] pb-[0.3vw] border-t border-gray-100 flex flex-col gap-[0.3vw] bg-gray-50/70">
                    <div className="flex items-center gap-[0.3vw]">
                      <div className="flex-1">
                        <label className="text-[0.6vw] text-gray-500 block mb-[0.1vw]">Width</label>
                        <input
                          type="number"
                          min="32"
                          max="4096"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(parseInt(e.target.value) || 256)}
                          className="w-full h-[1.7vw] min-h-[22px] bg-white border border-gray-200 rounded-[0.3vw] px-[0.3vw] text-[0.7vw] font-semibold text-gray-800 outline-none focus:border-[#E05638]"
                        />
                      </div>
                      <span className="text-gray-400 text-[0.7vw] mt-[0.7vw]">×</span>
                      <div className="flex-1">
                        <label className="text-[0.6vw] text-gray-500 block mb-[0.1vw]">Height</label>
                        <input
                          type="number"
                          min="32"
                          max="4096"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(parseInt(e.target.value) || 256)}
                          className="w-full h-[1.7vw] min-h-[22px] bg-white border border-gray-200 rounded-[0.3vw] px-[0.3vw] text-[0.7vw] font-semibold text-gray-800 outline-none focus:border-[#E05638]"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDimensionOpen(false)}
                      className="w-full mt-[0.15vw] py-[0.25vw] bg-[#E05638] text-white rounded-[0.35vw] text-[0.68vw] font-semibold hover:bg-[#c94a2f] transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Download Dropdown */}
          <div ref={downloadRef} className="relative w-full">
            <label className="text-[0.68vw] font-semibold text-gray-700 block mb-[0.15vw]">Download</label>
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => {
                setIsDownloadOpen(!isDownloadOpen);
                setIsDimensionOpen(false);
              }}
              className={`w-full h-[2.1vw] min-h-[30px] px-[0.7vw] flex items-center justify-between bg-[#E05638] hover:bg-[#c94a2f] text-white rounded-[0.45vw] text-[0.74vw] font-semibold cursor-pointer transition-all shadow-2xs ${
                isDownloading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="Download QR Code"
            >
              <div className="flex items-center gap-[0.4vw]">
                <Download className="w-[0.8vw] h-[0.8vw]" />
                <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
              </div>
              <ChevronDown
                className={`w-[0.8vw] h-[0.8vw] text-white/90 transition-transform duration-200 ${
                  isDownloadOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDownloadOpen && (
              <div className="absolute right-0 left-0 top-full mt-[0.3vw] bg-white border border-gray-100 rounded-[0.55vw] shadow-xl overflow-hidden z-[110] flex flex-col p-[0.35vw] gap-[0.25vw] animate-in fade-in zoom-in-95 duration-150">
                {/* JPEG Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadQR('jpeg')}
                  className="w-full h-[2.2vw] min-h-[30px] px-[0.6vw] flex items-center gap-[0.5vw] bg-white border border-gray-200 hover:border-[#E05638] hover:bg-[#FFF2EE] rounded-[0.4vw] text-gray-800 hover:text-[#E05638] text-[0.76vw] font-semibold cursor-pointer transition-all group"
                >
                  <svg viewBox="0 0 24 24" className="w-[1vw] h-[1vw] text-gray-500 group-hover:text-[#E05638] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>JPEG</span>
                </button>

                {/* PNG Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadQR('png')}
                  className="w-full h-[2.2vw] min-h-[30px] px-[0.6vw] flex items-center gap-[0.5vw] bg-white border border-gray-200 hover:border-[#E05638] hover:bg-[#FFF2EE] rounded-[0.4vw] text-gray-800 hover:text-[#E05638] text-[0.76vw] font-semibold cursor-pointer transition-all group"
                >
                  <svg viewBox="0 0 24 24" className="w-[1vw] h-[1vw] text-gray-500 group-hover:text-[#E05638] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>PNG</span>
                </button>

                {/* SVG Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadQR('svg')}
                  className="w-full h-[2.2vw] min-h-[30px] px-[0.6vw] flex items-center gap-[0.5vw] bg-white border border-gray-200 hover:border-[#E05638] hover:bg-[#FFF2EE] rounded-[0.4vw] text-gray-800 hover:text-[#E05638] text-[0.76vw] font-semibold cursor-pointer transition-all group"
                >
                  <svg viewBox="0 0 24 24" className="w-[1vw] h-[1vw] text-gray-500 group-hover:text-[#E05638] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <rect x="1" y="1" width="4" height="4" />
                    <rect x="19" y="1" width="4" height="4" />
                    <rect x="1" y="19" width="4" height="4" />
                    <rect x="19" y="19" width="4" height="4" />
                  </svg>
                  <span>SVG</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. QR Color */}
      <PropertyRow label="QR Color">
        <ColorInput
          color={qrColor}
          onChange={(val) => handleChange('qrColor', val)}
          opacity={100}
          onOpenPicker={() => handleToggleColorPicker('qrColor')}
          isActive={activeColorPicker === 'qrColor'}
        />
      </PropertyRow>

      {/* 7. Backdrop */}
      <PropertyRow label="Backdrop">
        <ColorInput
          color={backdrop}
          onChange={(val) => handleChange('backdrop', val)}
          opacity={100}
          onOpenPicker={() => handleToggleColorPicker('backdrop')}
          isActive={activeColorPicker === 'backdrop'}
        />
      </PropertyRow>

      {/* 8. Pattern Style */}
      <PropertyRow label="Pattern Style">
        <CustomSelect
          value={patternStyle}
          onChange={(val) => handleChange('patternStyle', val)}
          options={PATTERN_OPTIONS}
          category="pattern"
        />
      </PropertyRow>

      {/* 9. Eye Frame */}
      <PropertyRow label="Eye Frame">
        <CustomSelect
          value={eyeFrame}
          onChange={(val) => handleChange('eyeFrame', val)}
          options={EYE_FRAME_OPTIONS}
          category="eyeFrame"
        />
      </PropertyRow>

      {/* 10. Eye Ball */}
      <PropertyRow label="Eye Ball">
        <CustomSelect
          value={eyeBall}
          onChange={(val) => handleChange('eyeBall', val)}
          options={EYE_BALL_OPTIONS}
          category="eyeBall"
        />
      </PropertyRow>

      {/* 11. Center Logo Box (Collapsible Card Style like Fill Color) */}
      <div className="bg-white border border-gray-200 rounded-[0.75vw] shadow-sm overflow-hidden my-[0.2vw]">
        {/* Card Header */}
        <div
          className={`flex items-center justify-between px-[1vw] py-[0.8vw] ${hasLogo ? 'border-b border-gray-100 rounded-t-[0.75vw]' : 'rounded-[0.75vw]'}`}
        >
          <div className="flex items-center gap-[0.5vw]">
            <span className="font-semibold text-[0.85vw] text-gray-900">
              Add logo at center of QR
            </span>
          </div>
          <div className="flex items-center">
            {/* Toggle Switch */}
            <ElementToggle
              checked={hasLogo}
              onChange={(checked) => handleChange('hasLogo', checked)}
            />
          </div>
        </div>

        {/* Content (Expanded when toggle is ON) */}
        <div className={`grid transition-all duration-300 ease-in-out ${hasLogo ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="p-[1vw] pt-[0.75vw] flex flex-col gap-[0.6vw]">
              {/* Pill Tab Switcher */}
              <div className="flex bg-[#F8F9FA] p-[0.25vw] rounded-[0.4vw] border border-gray-200 w-fit">
                <button
                  type="button"
                  onClick={() => setLogoTab('upload')}
                  className={`px-[0.7vw] py-[0.3vw] text-[0.72vw] font-semibold rounded-[0.3vw] transition-colors cursor-pointer ${logoTab === 'upload' ? 'bg-[#E05638] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setLogoTab('predefined')}
                  className={`px-[0.7vw] py-[0.3vw] text-[0.72vw] font-semibold rounded-[0.3vw] transition-colors cursor-pointer ${logoTab === 'predefined' ? 'bg-[#E05638] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Predefined
                </button>
              </div>

              {logoTab === 'upload' ? (
                <div className="flex flex-col gap-[0.4vw]">
                  {/* Upload Logo Box */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    {logoSrc ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center justify-between p-[0.45vw] px-[0.6vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-2xs cursor-default"
                      >
                        <div className="flex items-center gap-[0.55vw] min-w-0 flex-1">
                          {/* Thumbnail */}
                          <div className="w-[2.4vw] h-[2.2vw] rounded-[0.35vw] border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                            <img src={logoSrc} alt={logoName} className="w-full h-full object-contain" />
                          </div>
                          {/* Info */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[0.76vw] font-semibold text-gray-900 truncate" title={logoName}>
                              {logoName}
                            </span>
                            {logoMeta && (
                              <span className="text-[0.65vw] text-gray-400 font-semibold truncate">
                                {logoMeta}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-[0.25vw] shrink-0 ml-[0.4vw]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowReplaceModal(true);
                            }}
                            className="p-[0.3vw] text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-[0.35vw] transition-colors cursor-pointer"
                            title="Replace Logo"
                          >
                            <ArrowRightLeft size="0.9vw" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChange('logoSrc', null);
                            }}
                            className="p-[0.3vw] text-[#e02424] hover:text-red-700 hover:bg-red-50 rounded-[0.35vw] transition-colors cursor-pointer"
                            title="Remove Logo"
                          >
                            <Trash2 size="0.9vw" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 hover:border-[#E05638] rounded-[0.5vw] p-[0.8vw] flex flex-col items-center justify-center cursor-pointer transition-colors group bg-white/50 hover:bg-white"
                        >
                          <Upload className="w-[1vw] h-[1vw] text-gray-400 group-hover:text-[#E05638] transition-colors mb-[0.3vw]" />
                          <span className="text-[0.78vw] text-gray-900 font-semibold group-hover:text-[#E05638] transition-colors">
                            Upload Logo
                          </span>
                        </div>

                        {/* OR divider */}
                        <div className="flex items-center gap-[0.4vw] my-[0.1vw]">
                          <div className="h-[1px] flex-1 bg-gray-200"></div>
                          <span className="text-[0.58vw] font-semibold text-gray-400 uppercase tracking-wider">OR</span>
                          <div className="h-[1px] flex-1 bg-gray-200"></div>
                        </div>

                        {/* Image Gallery Button */}
                        <button
                          ref={galleryBtnRef}
                          type="button"
                          onClick={() => setIsMediaGalleryOpen(true)}
                          className="w-full h-[2.4vw] rounded-[0.4vw] border border-gray-200 bg-white hover:bg-orange-50/40 hover:border-[#E05638] flex items-center justify-center gap-[0.5vw] cursor-pointer transition-all shadow-2xs group"
                        >
                          <ImageIcon className="w-[1vw] h-[1vw] text-gray-700 group-hover:text-[#E05638] transition-colors" />
                          <span className="text-[0.8vw] font-semibold text-gray-900 group-hover:text-[#E05638] transition-colors">
                            Choose from Image Gallery
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-[0.35vw] p-[0.7vw] bg-white rounded-[0.4vw] border border-gray-200">
                  {PREDEFINED_LOGOS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleChange('logoSrc', item.src)}
                      title={item.name}
                      className={`p-[0.3vw] rounded-[0.3vw] border flex items-center justify-center hover:border-[#E05638] transition-colors cursor-pointer ${logoSrc === item.src ? 'border-[#E05638] bg-orange-50/50' : 'border-gray-200'
                        }`}
                    >
                      <img src={item.src} alt={item.name} className="w-[1.5vw] h-[1.5vw] object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Logo Size */}
              <PropertyRow label="Logo Size">
                <div className="flex items-center gap-[0.4vw]">
                  <div className="flex-1">
                    <ElementSlider
                      min={20}
                      max={95}
                      value={logoSize}
                      onChange={(e) => handleChange('logoSize', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="border border-gray-200 rounded-[0.5vw] bg-white px-[0.6vw] h-[2.5vw] flex items-center justify-center text-[0.8vw] text-gray-700 min-w-[3.2vw] text-center  shadow-2xs">
                    {logoSize} %
                  </div>
                </div>
              </PropertyRow>

              {/* Corner Radius */}
              <PropertyRow label="Corner Radius">
                <div className="flex items-center gap-[0.4vw]">
                  <div className="flex-1">
                    <ElementSlider
                      min={0}
                      max={30}
                      value={logoRadius}
                      onChange={(e) => handleChange('logoRadius', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="border border-gray-200 rounded-[0.5vw] bg-white px-[0.6vw] h-[2.5vw] flex items-center justify-center text-[0.8vw] text-gray-700 min-w-[3.2vw] text-center shadow-2xs">
                    {logoRadius} px
                  </div>
                </div>
              </PropertyRow>

              {/* Background */}
              <PropertyRow label="Background">
                <ColorInput
                  color={logoBgColor}
                  onChange={(val) => handleChange('logoBgColor', val)}
                  opacity={100}
                  onOpenPicker={() => handleToggleColorPicker('logoBgColor')}
                  isActive={activeColorPicker === 'logoBgColor'}
                />
              </PropertyRow>
            </div>
          </div>
        </div>
      </div>

      {/* 12. Frames Section */}
      {frame && frame !== 'frame-none' && (
        <>
          <div className="flex items-center gap-[0.4vw] mt-[0.3vw]">
            <span className="text-[0.9vw] font-semibold text-black whitespace-nowrap">Frames</span>
            <div className="h-[0.06vw] bg-gray-200 flex-1 ml-[0.3vw]" />
          </div>

          {/* Frame Text */}
          <PropertyRow label="Frame Text">
            <div className="relative w-full">
              <input
                type="text"
                value={text}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Scan Me"
                className="w-full h-[2.5vw] bg-white border border-gray-200 rounded-[0.5vw] px-[0.6vw] pr-[1.6vw] text-[0.7vw] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#E05638] shadow-2xs font-semibold"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-[0.5vw] text-gray-400">
                <Pencil className="w-[0.8vw] h-[0.8vw]" />
              </div>
            </div>
          </PropertyRow>

          {/* Font Family & Size Dropdowns */}
          <div className="flex items-center gap-[0.5vw]">
            <div className="w-[5.6vw] shrink-0" />
            <div className="flex-1 grid grid-cols-2 gap-[0.4vw]">
              {/* Font Family */}
              <CustomSelect
                value={fontFamily}
                onChange={(val) => handleChange('fontFamily', val)}
                options={FONT_FAMILY_OPTIONS}
              />

              {/* Font Size */}
              <CustomSelect
                value={fontSize}
                onChange={(val) => handleChange('fontSize', parseInt(val))}
                options={FONT_SIZE_OPTIONS}
              />
            </div>
          </div>

          {/* Font Weight Dropdown */}
          <div className="flex items-center gap-[0.5vw]">
            <div className="w-[5.6vw] shrink-0" />
            <div className="flex-1">
              <CustomSelect
                value={fontWeight}
                onChange={(val) => handleChange('fontWeight', val)}
                options={FONT_WEIGHT_OPTIONS}
              />
            </div>
          </div>

          {/* Text Color */}
          <PropertyRow label="Text Color">
            <ColorInput
              color={textColor}
              onChange={(val) => handleChange('textColor', val)}
              opacity={100}
              onOpenPicker={() => handleToggleColorPicker('textColor')}
              isActive={activeColorPicker === 'textColor'}
            />
          </PropertyRow>

          {/* Bg Color */}
          <PropertyRow label="Bg Color">
            <ColorInput
              color={frameBgColor}
              onChange={(val) => handleChange('frameBgColor', val)}
              opacity={100}
              onOpenPicker={() => handleToggleColorPicker('frameBgColor')}
              isActive={activeColorPicker === 'frameBgColor'}
            />
          </PropertyRow>

          {/* Arrow Color / Frame Accent Color */}
          <PropertyRow label="Arrow Color">
            <ColorInput
              color={arrowColor}
              onChange={(val) => handleChange('arrowColor', val)}
              opacity={100}
              onOpenPicker={() => handleToggleColorPicker('arrowColor')}
              isActive={activeColorPicker === 'arrowColor'}
            />
          </PropertyRow>
        </>
      )}

      {/* 13. Effects Section */}
      <div className="flex items-center gap-[0.4vw] mt-[0.3vw]">
        <span className="text-[0.9vw] font-semibold text-black whitespace-nowrap">Effects</span>
        <div className="h-[0.06vw] bg-gray-200 flex-1 ml-[0.3vw]" />
      </div>

      <Effect
        isShape={false}
        openSubSection={openSubSection}
        setOpenSubSection={setOpenSubSection}
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

      {/* ── Official ColorPicker Portal Popup ── */}
      {isQrColorPickerOpen && QR_COLOR_MAP[activeColorPicker] && createPortal(
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
              color={QR_COLOR_MAP[activeColorPicker].value}
              onChange={(newVal) => {
                if (QR_COLOR_MAP[activeColorPicker]) {
                  QR_COLOR_MAP[activeColorPicker].onChange(newVal);
                }
              }}
              opacity={100}
              onOpacityChange={() => { }}
              onClose={() => setActiveColorPicker(null)}
              disableGradient={true}
              colorsOnPage={colorsOnPageList}
            />
          </div>
        </div>,
        document.body
      )}
      {/* ── Replace Media Modal ── */}
      <ReplaceMediaModal
        show={showReplaceModal}
        onClose={() => setShowReplaceModal(false)}
        mediaType="image"
        onReplace={(file) => {
          setShowReplaceModal(false);
          if (!file) return;
          if (file.isUrl || typeof file === 'string' || (typeof file.url === 'string' && !file.type)) {
            const rawUrl = file.url || file;
            const fileName = file.name || (typeof rawUrl === 'string' ? rawUrl.split('/').pop().split('?')[0] : 'image.png');
            const img = new Image();
            img.onload = () => {
              const metaStr = `${img.naturalWidth || img.width} X ${img.naturalHeight || img.height}`;
              setLogoName(fileName);
              setLogoMeta(metaStr);
              updateQR({ logoSrc: rawUrl, logoName: fileName, logoMeta: metaStr });
              setLogoSrc(rawUrl);
            };
            img.src = rawUrl;
          } else {
            const fileName = file.name || 'image.png';
            const fileSizeFormatted = file.size
              ? (file.size >= 1024 * 1024
                ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
                : `${Math.max(1, Math.round(file.size / 1024))}KB`)
              : '';
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target.result;
              const img = new Image();
              img.onload = () => {
                const metaStr = `${img.naturalWidth || img.width} X ${img.naturalHeight || img.height}${fileSizeFormatted ? ' • ' + fileSizeFormatted : ''}`;
                setLogoName(fileName);
                setLogoMeta(metaStr);
                updateQR({ logoSrc: dataUrl, logoName: fileName, logoMeta: metaStr });
                setLogoSrc(dataUrl);
              };
              img.src = dataUrl;
            };
            reader.readAsDataURL(file);
          }
        }}
      />

      {/* ── Media Gallery Popup Portal ── */}
      <MediaGalleryPopup
        isOpen={isMediaGalleryOpen}
        onClose={() => setIsMediaGalleryOpen(false)}
        anchorRef={galleryBtnRef}
        imageOnly={true}
        initialGalleryType="Image Gallery"
        onFileSelect={(file, asset) => {
          setIsMediaGalleryOpen(false);
          if (asset?.url) {
            handleChange('logoSrc', asset.url);
          } else if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              handleChange('logoSrc', e.target.result);
            };
            reader.readAsDataURL(file);
          }
        }}
      />
    </div>
  );
};

export default ElementQRCodeProperties;
