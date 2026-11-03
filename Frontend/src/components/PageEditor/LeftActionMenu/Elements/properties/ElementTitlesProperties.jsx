import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Sliders,
  X,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List
} from 'lucide-react';
import { ElementDropdown, ElementSlider } from './ElementUIControls';
import ColorPicker from '../../../../ColorPicker';
import {
  MOTION_GRAPHIC_TEMPLATES,
  getMotionGraphicProperties,
  updateMotionGraphicAttributes
} from '../utils/motionGraphicUtils';

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-[0.4vw] my-[0.4vw]">
    <span className="text-[0.9vw] font-bold text-gray-900 whitespace-nowrap">{title}</span>
    <div className="h-[1px] bg-gray-200 flex-1 ml-[0.3vw]" />
  </div>
);

// Color swatch + hex & opacity box with ColorPicker connectivity
const ColorInput = ({ color, onChange, opacity = 100, onOpenPicker, isActive = false }) => {
  const isGradient = Boolean(color && typeof color === 'string' && color.includes('gradient'));
  const isNone = color === 'none' || color === 'transparent';
  const displayColor = isGradient
    ? 'GRADIENT'
    : isNone
      ? 'NONE'
      : color && color.startsWith('#')
        ? color.toUpperCase()
        : color || '#000000';

  return (
    <div className="flex items-center gap-[0.4vw] w-full">
      <div
        onClick={onOpenPicker}
        className={`color-box color-box-trigger w-[2vw] h-[2vw] rounded-[0.5vw] border flex-shrink-0 relative overflow-hidden flex items-center justify-center cursor-pointer shadow-2xs hover:scale-105 transition-all ${isActive
            ? 'border-[#E05638] ring-2 ring-[#E05638]/40 scale-105 shadow-xs'
            : 'border-gray-200 hover:border-gray-300'
          }`}
        style={{ background: isNone ? '#ffffff' : color || '#000000' }}
        title="Click to open color palette"
      >
        {isNone && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1.5px] bg-red-500 rotate-45" />
        )}
      </div>
      <div className="flex-1 h-[2.5vw] flex items-center justify-between border border-gray-200 rounded-[0.5vw] bg-white px-[0.6vw] text-[0.8vw] text-gray-800 focus-within:border-[#E05638] shadow-2xs">
        <input
          type="text"
          value={displayColor}
          onChange={(e) => {
            let val = e.target.value;
            if (!val.startsWith('#') && val.length > 0 && !val.includes('gradient')) val = '#' + val;
            onChange(val);
          }}
          className="w-[5.2vw] font-mono text-[0.8vw] text-gray-600 bg-transparent focus:outline-none uppercase font-normal"
          maxLength={isGradient ? 10 : 7}
        />
        <span className="text-gray-400 text-[0.75vw] font-semibold">{opacity}%</span>
      </div>
    </div>
  );
};

const FONT_FAMILIES = [
  'Poppins',
  'Inter',
  'Roboto',
  'Outfit',
  'Montserrat',
  'Impact',
  'Arial',
  'Arial Black',
  'Playfair Display'
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 64];

const FONT_WEIGHTS = ['Thin', 'Light', 'Regular', 'Medium', 'Semi Bold', 'Bold', 'Extra Bold', 'Black'];

/**
 * TextPropertyInlinePopup
 * Exactly matches the card in the reference image:
 * Header: "Text Property" with close "X" icon.
 * Row 1: [FontFamily dropdown (e.g. Poppins)] [FontSize dropdown (e.g. 24)]
 * Row 2: [FontWeight dropdown (e.g. Semi Bold)] [Auto <-> (spacing)] [Auto ^v (line height)]
 * Row 3: [Align button] [Bold B button] [Dash / Strikethrough button] [List button]
 */
const TextPropertyInlinePopup = ({
  targetType = 'primary', // 'primary' | 'secondary'
  fontFamily = 'Poppins',
  fontSize = 24,
  fontWeight = 'Semi Bold',
  letterSpacing = 'Auto',
  lineHeight = 'Auto',
  textAlign = 'center',
  isBold = false,
  isStrikethrough = false,
  isList = false,
  onClose,
  onUpdate
}) => {
  const [openDropdown, setOpenDropdown] = useState(null); // 'family' | 'size' | 'weight' | null

  return (
    <div className="w-full bg-white border border-gray-200/90 rounded-[0.8vw] p-[0.9vw] shadow-md flex flex-col gap-[0.7vw] animate-in fade-in zoom-in-95 duration-150 relative z-20">
      {/* Title + Close */}
      <div className="flex items-center justify-between pb-[0.1vw]">
        <span className="text-[0.95vw] font-bold text-gray-900 tracking-tight">Text Property</span>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition-colors p-[0.1vw] cursor-pointer"
        >
          <X size="0.95vw" strokeWidth={2.2} />
        </button>
      </div>

      {/* Row 1: Font Family + Font Size */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-[0.5vw]">
        {/* Font Family Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'family' ? null : 'family')}
            className="w-full h-[2.3vw] flex items-center justify-between border border-gray-200 rounded-[0.5vw] px-[0.7vw] bg-white hover:border-gray-300 transition-all text-gray-800 shadow-2xs"
          >
            <span className="text-[0.78vw] font-medium truncate" style={{ fontFamily }}>
              {fontFamily}
            </span>
            <ChevronDown size="0.85vw" className="text-gray-500 flex-shrink-0 ml-[0.3vw]" />
          </button>
          {openDropdown === 'family' && (
            <div className="absolute top-[2.5vw] left-0 right-0 bg-white border border-gray-200 rounded-[0.45vw] shadow-xl z-50 py-[0.3vw] max-h-[11vw] overflow-y-auto">
              {FONT_FAMILIES.map((ff) => (
                <div
                  key={ff}
                  onClick={() => {
                    onUpdate({ fontFamily: ff });
                    setOpenDropdown(null);
                  }}
                  className={`px-[0.7vw] py-[0.35vw] text-[0.75vw] cursor-pointer hover:bg-gray-50 transition-colors ${fontFamily === ff ? 'bg-[#E05638]/10 font-bold text-[#E05638]' : 'text-gray-700'
                    }`}
                  style={{ fontFamily: ff }}
                >
                  {ff}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'size' ? null : 'size')}
            className="w-full h-[2.3vw] flex items-center justify-between border border-gray-200 rounded-[0.5vw] px-[0.7vw] bg-white hover:border-gray-300 transition-all text-gray-800 shadow-2xs"
          >
            <span className="text-[0.78vw] font-medium">{fontSize}</span>
            <ChevronDown size="0.85vw" className="text-gray-500 flex-shrink-0 ml-[0.3vw]" />
          </button>
          {openDropdown === 'size' && (
            <div className="absolute top-[2.5vw] left-0 right-0 bg-white border border-gray-200 rounded-[0.45vw] shadow-xl z-50 py-[0.3vw] max-h-[11vw] overflow-y-auto">
              {FONT_SIZES.map((sz) => (
                <div
                  key={sz}
                  onClick={() => {
                    onUpdate({ fontSize: sz });
                    setOpenDropdown(null);
                  }}
                  className={`px-[0.7vw] py-[0.35vw] text-[0.75vw] cursor-pointer hover:bg-gray-50 transition-colors ${fontSize === sz ? 'bg-[#E05638]/10 font-bold text-[#E05638]' : 'text-gray-700'
                    }`}
                >
                  {sz}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Font Weight + Auto (letter spacing) + Auto (line height) */}
      <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-[0.5vw]">
        {/* Font Weight */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'weight' ? null : 'weight')}
            className="w-full h-[2.3vw] flex items-center justify-between border border-gray-200 rounded-[0.5vw] px-[0.7vw] bg-white hover:border-gray-300 transition-all text-gray-800 shadow-2xs"
          >
            <span className="text-[0.78vw] font-medium truncate">{fontWeight}</span>
            <ChevronDown size="0.85vw" className="text-gray-500 flex-shrink-0 ml-[0.3vw]" />
          </button>
          {openDropdown === 'weight' && (
            <div className="absolute top-[2.5vw] left-0 right-0 bg-white border border-gray-200 rounded-[0.45vw] shadow-xl z-50 py-[0.3vw] max-h-[10vw] overflow-y-auto">
              {FONT_WEIGHTS.map((fw) => (
                <div
                  key={fw}
                  onClick={() => {
                    onUpdate({ fontWeight: fw, isBold: fw.toLowerCase().includes('bold') });
                    setOpenDropdown(null);
                  }}
                  className={`px-[0.7vw] py-[0.35vw] text-[0.75vw] cursor-pointer hover:bg-gray-50 transition-colors ${fontWeight === fw ? 'bg-[#E05638]/10 font-bold text-[#E05638]' : 'text-gray-700'
                    }`}
                >
                  {fw}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto Letter Spacing button */}
        <button
          type="button"
          onClick={() => {
            const next = letterSpacing === 'Auto' ? '2px' : letterSpacing === '2px' ? '4px' : 'Auto';
            onUpdate({ letterSpacing: next });
          }}
          className="h-[2.3vw] flex items-center justify-center gap-[0.3vw] border border-gray-200 rounded-[0.5vw] px-[0.4vw] bg-white hover:border-gray-300 transition-all text-gray-700 shadow-2xs"
          title="Letter Spacing"
        >
          <span className="text-[0.72vw] font-medium">{letterSpacing}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            <path d="M4 12h16" />
            <polyline points="7 9 4 12 7 15" />
            <polyline points="17 9 20 12 17 15" />
            <line x1="3" y1="4" x2="3" y2="20" />
            <line x1="21" y1="4" x2="21" y2="20" />
          </svg>
        </button>

        {/* Auto Line Height button */}
        <button
          type="button"
          onClick={() => {
            const next = lineHeight === 'Auto' ? '1.2' : lineHeight === '1.2' ? '1.5' : 'Auto';
            onUpdate({ lineHeight: next });
          }}
          className="h-[2.3vw] flex items-center justify-center gap-[0.3vw] border border-gray-200 rounded-[0.5vw] px-[0.4vw] bg-white hover:border-gray-300 transition-all text-gray-700 shadow-2xs"
          title="Line Height"
        >
          <span className="text-[0.72vw] font-medium">{lineHeight}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            <path d="M12 4v16" />
            <polyline points="9 7 12 4 15 7" />
            <polyline points="9 17 12 20 15 17" />
            <line x1="4" y1="3" x2="20" y2="3" />
            <line x1="4" y1="21" x2="20" y2="21" />
          </svg>
        </button>
      </div>

      {/* Row 3: Format Bar [Align] [Bold] [Strikethrough / Dash] [List] */}
      <div className="flex items-center gap-[0.5vw]">
        {/* Align Button */}
        <button
          type="button"
          onClick={() => {
            const next = textAlign === 'center' ? 'left' : textAlign === 'left' ? 'right' : 'center';
            onUpdate({ textAlign: next });
          }}
          className="w-[2.3vw] h-[2.3vw] flex items-center justify-center rounded-[0.45vw] bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors shadow-2xs"
          title="Text Alignment"
        >
          {textAlign === 'left' ? (
            <AlignLeft size="0.95vw" strokeWidth={2.2} />
          ) : textAlign === 'right' ? (
            <AlignRight size="0.95vw" strokeWidth={2.2} />
          ) : (
            <AlignCenter size="0.95vw" strokeWidth={2.2} />
          )}
        </button>

        {/* Bold Button */}
        <button
          type="button"
          onClick={() => onUpdate({ isBold: !isBold, fontWeight: !isBold ? 'Bold' : 'Regular' })}
          className={`w-[2.3vw] h-[2.3vw] flex items-center justify-center rounded-[0.45vw] transition-colors shadow-2xs ${isBold ? 'bg-gray-200 text-black font-extrabold' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          title="Bold"
        >
          <span className="font-bold text-[0.9vw]">B</span>
        </button>

        {/* Dash / Strikethrough Button */}
        <button
          type="button"
          onClick={() => onUpdate({ isStrikethrough: !isStrikethrough })}
          className={`w-[2.3vw] h-[2.3vw] flex items-center justify-center rounded-[0.45vw] transition-colors shadow-2xs ${isStrikethrough ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          title="Strikethrough"
        >
          <span className="font-bold text-[1vw] leading-none">—</span>
        </button>

        {/* List Button */}
        <button
          type="button"
          onClick={() => onUpdate({ isList: !isList })}
          className={`w-[2.3vw] h-[2.3vw] flex items-center justify-center rounded-[0.45vw] transition-colors shadow-2xs ${isList ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          title="List"
        >
          <List size="0.95vw" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};

const ElementTitlesProperties = ({
  selectedElement,
  selectedLayerId,
  activePageIndex = 0,
  updateElementAttribute
}) => {
  const effectiveElement = selectedElement || (() => {
    if (!selectedLayerId) return null;
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    return editorDoc.getElementById(selectedLayerId) || document.getElementById(selectedLayerId);
  })();

  // Read initial properties from element
  const initialProps = getMotionGraphicProperties(effectiveElement || selectedElement);

  const hasSecondaryText = Boolean(
    effectiveElement?.getAttribute('data-subtext') ||
    effectiveElement?.querySelector('.motion-text-subcontent, .flipi-text-b, .box-title-b, .sq-b')
  );

  const [animation, setAnimation] = useState(
    initialProps.animation === 'Infinity' ? 'Infinite' : (initialProps.animation || 'Infinite')
  );
  const [customAnimationCount, setCustomAnimationCount] = useState(initialProps.customCount || '4');
  const [speed, setSpeed] = useState(initialProps.speed !== undefined ? initialProps.speed : 80);
  const [primaryText, setPrimaryText] = useState(initialProps.primaryText || 'Animation');
  const [secondaryText, setSecondaryText] = useState(initialProps.secondaryText || 'Animation');
  // Color states
  const [textColor1, setTextColor1] = useState(initialProps.primaryTextColor || '#0f291e');
  const [textColor2, setTextColor2] = useState(initialProps.secondaryTextColor || '#0f291e');
  const [strokeColor, setStrokeColor] = useState(initialProps.strokeColor || '#00E5FF');
  const [backgroundColor, setBackgroundColor] = useState(initialProps.backgroundColor || 'transparent');

  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [activeTextSettings, setActiveTextSettings] = useState(null); // 'primary' | 'secondary' | null

  // Typography settings states for primary & secondary
  const [primaryFontSize, setPrimaryFontSize] = useState(initialProps.primaryFontSize || 24);
  const [primaryFontFamily, setPrimaryFontFamily] = useState(initialProps.primaryFontFamily || 'Poppins');
  const [primaryFontWeight, setPrimaryFontWeight] = useState(initialProps.primaryFontWeight || 'Semi Bold');
  const [primaryLetterSpacing, setPrimaryLetterSpacing] = useState(initialProps.primaryLetterSpacing || 'Auto');
  const [primaryLineHeight, setPrimaryLineHeight] = useState(initialProps.primaryLineHeight || 'Auto');
  const [primaryTextAlign, setPrimaryTextAlign] = useState(initialProps.primaryTextAlign || 'center');
  const [primaryIsBold, setPrimaryIsBold] = useState(initialProps.primaryIsBold || false);
  const [primaryIsStrikethrough, setPrimaryIsStrikethrough] = useState(initialProps.primaryIsStrikethrough || false);
  const [primaryIsList, setPrimaryIsList] = useState(initialProps.primaryIsList || false);

  const [secondaryFontSize, setSecondaryFontSize] = useState(initialProps.secondaryFontSize || 24);
  const [secondaryFontFamily, setSecondaryFontFamily] = useState(initialProps.secondaryFontFamily || 'Poppins');
  const [secondaryFontWeight, setSecondaryFontWeight] = useState(initialProps.secondaryFontWeight || 'Semi Bold');
  const [secondaryLetterSpacing, setSecondaryLetterSpacing] = useState(initialProps.secondaryLetterSpacing || 'Auto');
  const [secondaryLineHeight, setSecondaryLineHeight] = useState(initialProps.secondaryLineHeight || 'Auto');
  const [secondaryTextAlign, setSecondaryTextAlign] = useState(initialProps.secondaryTextAlign || 'center');
  const [secondaryIsBold, setSecondaryIsBold] = useState(initialProps.secondaryIsBold || false);
  const [secondaryIsStrikethrough, setSecondaryIsStrikethrough] = useState(initialProps.secondaryIsStrikethrough || false);
  const [secondaryIsList, setSecondaryIsList] = useState(initialProps.secondaryIsList || false);

  const loadedKeyRef = useRef(null);
  const currentKey = `${selectedLayerId}-${selectedElement?.id || ''}`;

  useEffect(() => {
    const targetEl = effectiveElement;
    if (targetEl && loadedKeyRef.current !== currentKey) {
      loadedKeyRef.current = currentKey;
      const p = getMotionGraphicProperties(targetEl);
      setAnimation(p.animation === 'Infinity' ? 'Infinite' : (p.animation || 'Infinite'));
      setCustomAnimationCount(p.customCount || '4');
      setSpeed(p.speed !== undefined ? p.speed : 80);
      setPrimaryText(p.primaryText || 'Animation');
      setSecondaryText(p.secondaryText || 'Animation');
      setTextColor1(p.primaryTextColor || '#0f291e');
      setTextColor2(p.secondaryTextColor || '#0f291e');
      setStrokeColor(p.strokeColor || '#00E5FF');
      setBackgroundColor(p.backgroundColor || 'transparent');

      setPrimaryFontSize(p.primaryFontSize || 24);
      setPrimaryFontFamily(p.primaryFontFamily || 'Poppins');
      setPrimaryFontWeight(p.primaryFontWeight || 'Semi Bold');
      setPrimaryLetterSpacing(p.primaryLetterSpacing || 'Auto');
      setPrimaryLineHeight(p.primaryLineHeight || 'Auto');
      setPrimaryTextAlign(p.primaryTextAlign || 'center');
      setPrimaryIsBold(p.primaryIsBold || false);
      setPrimaryIsStrikethrough(p.primaryIsStrikethrough || false);
      setPrimaryIsList(p.primaryIsList || false);

      setSecondaryFontSize(p.secondaryFontSize || 24);
      setSecondaryFontFamily(p.secondaryFontFamily || 'Poppins');
      setSecondaryFontWeight(p.secondaryFontWeight || 'Semi Bold');
      setSecondaryLetterSpacing(p.secondaryLetterSpacing || 'Auto');
      setSecondaryLineHeight(p.secondaryLineHeight || 'Auto');
      setSecondaryTextAlign(p.secondaryTextAlign || 'center');
      setSecondaryIsBold(p.secondaryIsBold || false);
      setSecondaryIsStrikethrough(p.secondaryIsStrikethrough || false);
      setSecondaryIsList(p.secondaryIsList || false);
    }
  }, [selectedElement, selectedLayerId, currentKey]);

  // Synchronize helper
  const syncUpdates = (newAttributes = {}) => {
    const targetEl = effectiveElement;
    if (!targetEl) return;
    updateMotionGraphicAttributes(targetEl, newAttributes);

    // Sync via DOM serializer
    const svgRoot = (() => {
      const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = editorDoc.getElementById(selectedLayerId) || targetEl;
      if (!el) return null;
      const container = el.closest('.page-svg-container');
      if (container) return container.querySelector('svg');
      let node = el;
      let lastSvg = null;
      while (node) {
        if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
        node = node.parentElement;
      }
      return lastSvg;
    })();

    if (svgRoot && typeof updateElementAttribute === 'function') {
      const serializer = new XMLSerializer();
      const html = serializer.serializeToString(svgRoot);
      updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
    } else if (typeof updateElementAttribute === 'function') {
      updateElementAttribute(activePageIndex, selectedLayerId, newAttributes);
    }
  };

  const handleAnimationChange = (newAnim, customCountVal) => {
    setAnimation(newAnim);
    const countToSync = customCountVal !== undefined ? customCountVal : customAnimationCount;
    syncUpdates({ animation: newAnim, customCount: countToSync });
  };

  const handleCustomCountChange = (val) => {
    setCustomAnimationCount(val);
    syncUpdates({ animation: 'Custom', customCount: val });
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    syncUpdates({ speed: newSpeed });
  };

  const handlePrimaryTextChange = (val) => {
    setPrimaryText(val);
    syncUpdates({ primaryText: val });
  };

  const handleSecondaryTextChange = (val) => {
    setSecondaryText(val);
    syncUpdates({ secondaryText: val });
  };

  const handleTextColor1Change = (col) => {
    setTextColor1(col);
    syncUpdates({ textColor1: col, primaryTextColor: col });
  };

  const handleTextColor2Change = (col) => {
    setTextColor2(col);
    syncUpdates({ textColor2: col, secondaryTextColor: col });
  };

  const handleStrokeColorChange = (col) => {
    setStrokeColor(col);
    syncUpdates({ strokeColor: col, object1Color: col });
  };

  const handleBackgroundColorChange = (col) => {
    setBackgroundColor(col);
    syncUpdates({ backgroundColor: col, object3Color: col });
  };

  const triggerPreviewAnimation = () => {
    if (!selectedElement) return;
    const styles = selectedElement.querySelectorAll('style');
    styles.forEach((st) => {
      const content = st.textContent;
      st.textContent = '';
      void st.offsetHeight;
      st.textContent = content;
    });
    window.dispatchEvent(new CustomEvent('force-update-selection-box'));
  };

  const [isAnimationDropdownOpen, setIsAnimationDropdownOpen] = useState(false);
  const animationDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (animationDropdownRef.current && !animationDropdownRef.current.contains(e.target)) {
        setIsAnimationDropdownOpen(false);
      }
    };
    if (isAnimationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAnimationDropdownOpen]);

  const animationOptions = [
    { label: 'Once', value: 'Once' },
    { label: 'Twice', value: 'Twice' },
    { label: 'Thrice', value: 'Thrice' },
    { label: 'Infinite', value: 'Infinite' }
  ];

  const colorMapping = {
    primaryText: {
      value: textColor1,
      onChange: handleTextColor1Change
    },
    secondaryText: {
      value: textColor2,
      onChange: handleTextColor2Change
    },
    textColor1: {
      value: textColor1,
      onChange: handleTextColor1Change
    },
    textColor2: {
      value: textColor2,
      onChange: handleTextColor2Change
    },
    strokeColor: {
      value: strokeColor,
      onChange: handleStrokeColorChange
    },
    backgroundColor: {
      value: backgroundColor,
      onChange: handleBackgroundColorChange
    }
  };

  return (
    <div className="flex flex-col gap-[1vw] w-full text-left select-none pb-[2vw]">
      {/* ── Top Preview Banner ── */}
      <button
        type="button"
        onClick={triggerPreviewAnimation}
        className="w-full flex items-center gap-[0.8vw] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-gray-200/80 rounded-[0.7vw] px-[1vw] py-[0.8vw] shadow-xs cursor-pointer transition-all active:scale-[0.99] group text-left"
      >
        <span className="text-[1.3vw] leading-none select-none filter drop-shadow-xs">⭐</span>
        <span className="text-[0.82vw] font-semibold text-gray-800 tracking-tight">
          Click to preview Animations
        </span>
      </button>

      {/* ── Animation Row ── */}
      <div className="flex items-center gap-[0.5vw]">
        <div className="w-[5.8vw] shrink-0 flex items-center justify-between text-gray-800 font-semibold text-[0.8vw]">
          <span>Animation</span>
          <span>:</span>
        </div>
        <div className="flex-1 min-w-0">
          <div ref={animationDropdownRef} className={`relative w-full ${isAnimationDropdownOpen ? 'z-[105]' : ''}`}>
            <button
              type="button"
              onClick={() => setIsAnimationDropdownOpen((prev) => !prev)}
              className={`w-full h-[2.4vw] min-h-[32px] flex items-center justify-between bg-white px-[0.75vw] rounded-[0.55vw] text-[0.82vw] font-semibold transition-all cursor-pointer shadow-2xs select-none ${isAnimationDropdownOpen
                  ? 'border-2 border-[#E05638] shadow-xs'
                  : 'border border-gray-200 hover:border-gray-300'
                }`}
            >
              <span className="truncate text-gray-800 font-medium">
                {animation === 'Custom' ? `Custom (${customAnimationCount}x)` : animation}
              </span>
              {isAnimationDropdownOpen ? (
                <ChevronUp className="w-[0.9vw] h-[0.9vw] min-w-[14px] min-h-[14px] text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-[0.9vw] h-[0.9vw] min-w-[14px] min-h-[14px] text-gray-500 flex-shrink-0" />
              )}
            </button>

            {isAnimationDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-[0.35vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-lg overflow-hidden z-[110] flex flex-col py-[0.3vw] animate-in fade-in zoom-in-95 duration-150">
                {animationOptions.map((opt) => {
                  const isSelected = animation === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        handleAnimationChange(opt.value);
                        setIsAnimationDropdownOpen(false);
                      }}
                      className={`px-[0.9vw] py-[0.5vw] text-[0.82vw] font-medium transition-colors text-left flex items-center cursor-pointer ${isSelected
                          ? 'text-[#FF4500] font-semibold bg-[#FF4500]/10'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}

                <div className="h-[1px] bg-gray-100 my-[0.2vw]" />

                {/* Custom Option with Input Box and "times" label */}
                <div
                  className={`px-[0.7vw] py-[0.45vw] flex items-center gap-[0.5vw] cursor-pointer ${animation === 'Custom' ? 'bg-[#FF4500]/10' : 'hover:bg-gray-50'
                    }`}
                  onClick={() => {
                    handleAnimationChange('Custom', customAnimationCount || '4');
                  }}
                >
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={customAnimationCount}
                    placeholder="Custom"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleCustomCountChange(val);
                    }}
                    onFocus={() => {
                      if (animation !== 'Custom') {
                        handleAnimationChange('Custom', customAnimationCount || '4');
                      }
                    }}
                    className={`w-[4.8vw] h-[2vw] px-[0.5vw] border rounded-[0.4vw] text-[0.78vw] font-medium text-gray-800 bg-white outline-none placeholder:text-gray-400 focus:border-[#5B50E5] focus:ring-1 focus:ring-[#5B50E5]/30 ${animation === 'Custom' ? 'border-[#5B50E5]' : 'border-gray-200'
                      }`}
                  />
                  <span className="text-[0.78vw] font-semibold text-gray-600 select-none">
                    times
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Speed Row ── */}
      <div className="flex items-center gap-[0.5vw]">
        <div className="w-[5.8vw] shrink-0 flex items-center justify-between text-gray-800 font-semibold text-[0.8vw]">
          <span>Speed</span>
          <span>:</span>
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-[0.7vw]">
          <ElementSlider
            min={10}
            max={200}
            step={1}
            value={speed}
            onChange={handleSpeedChange}
            className="flex-1"
          />
          <div className="w-[3.4vw] h-[2vw] flex items-center justify-center bg-white border border-gray-200 rounded-[0.45vw] shadow-2xs shrink-0">
            <span className="text-[0.78vw] font-bold text-gray-800">{speed} %</span>
          </div>
        </div>
      </div>

      {/* ── Text Appearance Section ── */}
      <div className="flex flex-col gap-[0.7vw] mt-[0.3vw]">
        <SectionHeader title="Text Appearance" />

        {/* Primary Text */}
        <div className="flex flex-col gap-[0.4vw]">
          <label className="text-[0.8vw] font-semibold text-gray-900">Primary Text</label>
          <div className="flex items-center gap-[0.5vw] w-full">
            <input
              type="text"
              value={primaryText}
              onChange={(e) => handlePrimaryTextChange(e.target.value)}
              placeholder="Animation"
              className="flex-1 h-[2.4vw] px-[0.75vw] text-[0.82vw] font-normal text-gray-700 bg-white border border-gray-200 rounded-[0.5vw] shadow-2xs outline-none focus:border-[#E05638]"
            />
            {/* Color Swatch */}
            <div
              onClick={() => setActiveColorPicker((prev) => (prev === 'textColor1' ? null : 'textColor1'))}
              className={`w-[2.4vw] h-[2.4vw] rounded-[0.5vw] border flex-shrink-0 cursor-pointer shadow-2xs hover:scale-105 transition-all flex items-center justify-center ${activeColorPicker === 'textColor1' || activeColorPicker === 'primaryText'
                  ? 'border-[#E05638] ring-2 ring-[#E05638]/40 scale-105'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
              style={{ background: textColor1 }}
              title="Click to pick Text Color 1"
            />
            {/* Sliders edit option button */}
            <button
              type="button"
              onClick={() => setActiveTextSettings((prev) => (prev === 'primary' ? null : 'primary'))}
              className={`w-[2.4vw] h-[2.4vw] rounded-[0.5vw] border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-2xs ${activeTextSettings === 'primary'
                  ? 'bg-gray-100 border-[#E05638] text-[#E05638]'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              title="Text Property"
            >
              <Sliders className="w-[1vw] h-[1vw]" />
            </button>
          </div>

          {/* Inline Text Property Card below Primary Text input box */}
          {activeTextSettings === 'primary' && (
            <div className="mt-[0.2vw]">
              <TextPropertyInlinePopup
                targetType="primary"
                fontFamily={primaryFontFamily}
                fontSize={primaryFontSize}
                fontWeight={primaryFontWeight}
                letterSpacing={primaryLetterSpacing}
                lineHeight={primaryLineHeight}
                textAlign={primaryTextAlign}
                isBold={primaryIsBold}
                isStrikethrough={primaryIsStrikethrough}
                isList={primaryIsList}
                onClose={() => setActiveTextSettings(null)}
                onUpdate={(updates) => {
                  if (updates.fontFamily !== undefined) setPrimaryFontFamily(updates.fontFamily);
                  if (updates.fontSize !== undefined) setPrimaryFontSize(updates.fontSize);
                  if (updates.fontWeight !== undefined) setPrimaryFontWeight(updates.fontWeight);
                  if (updates.letterSpacing !== undefined) setPrimaryLetterSpacing(updates.letterSpacing);
                  if (updates.lineHeight !== undefined) setPrimaryLineHeight(updates.lineHeight);
                  if (updates.textAlign !== undefined) setPrimaryTextAlign(updates.textAlign);
                  if (updates.isBold !== undefined) setPrimaryIsBold(updates.isBold);
                  if (updates.isStrikethrough !== undefined) setPrimaryIsStrikethrough(updates.isStrikethrough);
                  if (updates.isList !== undefined) setPrimaryIsList(updates.isList);

                  syncUpdates({
                    ...(updates.fontFamily !== undefined ? { primaryFontFamily: updates.fontFamily } : {}),
                    ...(updates.fontSize !== undefined ? { primaryFontSize: updates.fontSize } : {}),
                    ...(updates.fontWeight !== undefined ? { primaryFontWeight: updates.fontWeight } : {}),
                    ...(updates.letterSpacing !== undefined ? { primaryLetterSpacing: updates.letterSpacing } : {}),
                    ...(updates.lineHeight !== undefined ? { primaryLineHeight: updates.lineHeight } : {}),
                    ...(updates.textAlign !== undefined ? { primaryTextAlign: updates.textAlign } : {}),
                    ...(updates.isBold !== undefined ? { primaryIsBold: updates.isBold } : {}),
                    ...(updates.isStrikethrough !== undefined ? { primaryIsStrikethrough: updates.isStrikethrough } : {})
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* Secondary Text (only shown if title has secondary text) */}
        {hasSecondaryText && (
          <div className="flex flex-col gap-[0.4vw]">
            <label className="text-[0.8vw] font-semibold text-gray-900">Secondary Text</label>
            <div className="flex items-center gap-[0.5vw] w-full">
              <input
                type="text"
                value={secondaryText}
                onChange={(e) => handleSecondaryTextChange(e.target.value)}
                placeholder="Animation"
                className="flex-1 h-[2.4vw] px-[0.75vw] text-[0.82vw] font-normal text-gray-700 bg-white border border-gray-200 rounded-[0.5vw] shadow-2xs outline-none focus:border-[#E05638]"
              />
              {/* Color Swatch */}
              <div
                onClick={() => setActiveColorPicker((prev) => (prev === 'textColor2' ? null : 'textColor2'))}
                className={`w-[2.4vw] h-[2.4vw] rounded-[0.5vw] border flex-shrink-0 cursor-pointer shadow-2xs hover:scale-105 transition-all flex items-center justify-center ${activeColorPicker === 'textColor2' || activeColorPicker === 'secondaryText'
                    ? 'border-[#E05638] ring-2 ring-[#E05638]/40 scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
                style={{ background: textColor2 }}
                title="Click to pick Text Color 2"
              />
              {/* Sliders edit option button */}
              <button
                type="button"
                onClick={() => setActiveTextSettings((prev) => (prev === 'secondary' ? null : 'secondary'))}
                className={`w-[2.4vw] h-[2.4vw] rounded-[0.5vw] border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-2xs ${activeTextSettings === 'secondary'
                    ? 'bg-gray-100 border-[#E05638] text-[#E05638]'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                title="Text Property"
              >
                <Sliders className="w-[1vw] h-[1vw]" />
              </button>
            </div>

            {/* Inline Text Property Card below Secondary Text input box */}
            {activeTextSettings === 'secondary' && (
              <div className="mt-[0.2vw]">
                <TextPropertyInlinePopup
                  targetType="secondary"
                  fontFamily={secondaryFontFamily}
                  fontSize={secondaryFontSize}
                  fontWeight={secondaryFontWeight}
                  letterSpacing={secondaryLetterSpacing}
                  lineHeight={secondaryLineHeight}
                  textAlign={secondaryTextAlign}
                  isBold={secondaryIsBold}
                  isStrikethrough={secondaryIsStrikethrough}
                  isList={secondaryIsList}
                  onClose={() => setActiveTextSettings(null)}
                  onUpdate={(updates) => {
                    if (updates.fontFamily !== undefined) setSecondaryFontFamily(updates.fontFamily);
                    if (updates.fontSize !== undefined) setSecondaryFontSize(updates.fontSize);
                    if (updates.fontWeight !== undefined) setSecondaryFontWeight(updates.fontWeight);
                    if (updates.letterSpacing !== undefined) setSecondaryLetterSpacing(updates.letterSpacing);
                    if (updates.lineHeight !== undefined) setSecondaryLineHeight(updates.lineHeight);
                    if (updates.textAlign !== undefined) setSecondaryTextAlign(updates.textAlign);
                    if (updates.isBold !== undefined) setSecondaryIsBold(updates.isBold);
                    if (updates.isStrikethrough !== undefined) setSecondaryIsStrikethrough(updates.isStrikethrough);
                    if (updates.isList !== undefined) setSecondaryIsList(updates.isList);

                    syncUpdates({
                      ...(updates.fontFamily !== undefined ? { secondaryFontFamily: updates.fontFamily } : {}),
                      ...(updates.fontSize !== undefined ? { secondaryFontSize: updates.fontSize } : {}),
                      ...(updates.fontWeight !== undefined ? { secondaryFontWeight: updates.fontWeight } : {}),
                      ...(updates.letterSpacing !== undefined ? { secondaryLetterSpacing: updates.letterSpacing } : {}),
                      ...(updates.lineHeight !== undefined ? { secondaryLineHeight: updates.lineHeight } : {}),
                      ...(updates.textAlign !== undefined ? { secondaryTextAlign: updates.textAlign } : {}),
                      ...(updates.isBold !== undefined ? { secondaryIsBold: updates.isBold } : {}),
                      ...(updates.isStrikethrough !== undefined ? { secondaryIsStrikethrough: updates.isStrikethrough } : {})
                    });
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Object Color Section ── */}
      <div className="flex flex-col gap-[0.6vw] mt-[0.3vw]">
        <SectionHeader title="Object Color" />

        {/* Stroke Color */}
        <div className="flex items-center gap-[0.5vw]">
          <div className="w-[7.2vw] shrink-0 flex items-center justify-between text-gray-800 font-semibold text-[0.8vw]">
            <span>Stroke Color</span>
            <span>:</span>
          </div>
          <div className="flex-1 min-w-0">
            <ColorInput
              color={strokeColor}
              onChange={handleStrokeColorChange}
              onOpenPicker={() => setActiveColorPicker((prev) => (prev === 'strokeColor' ? null : 'strokeColor'))}
              isActive={activeColorPicker === 'strokeColor'}
            />
          </div>
        </div>

        {/* Background Color */}
        <div className="flex items-center gap-[0.5vw]">
          <div className="w-[7.2vw] shrink-0 flex items-center justify-between text-gray-800 font-semibold text-[0.8vw]">
            <span>Background Color</span>
            <span>:</span>
          </div>
          <div className="flex-1 min-w-0">
            <ColorInput
              color={backgroundColor}
              onChange={handleBackgroundColorChange}
              onOpenPicker={() => setActiveColorPicker((prev) => (prev === 'backgroundColor' ? null : 'backgroundColor'))}
              isActive={activeColorPicker === 'backgroundColor'}
            />
          </div>
        </div>
      </div>

      {/* ── ColorPicker Portal Popup ── */}
      {activeColorPicker && colorMapping[activeColorPicker] && createPortal(
        <div
          className="fixed z-[5000]"
          style={{
            top: '50%',
            right: '19.5vw',
            transform: 'translateY(-50%)'
          }}
        >
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setActiveColorPicker(null)}
          />
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <ColorPicker
              color={colorMapping[activeColorPicker].value}
              onChange={(newVal) => {
                if (colorMapping[activeColorPicker]) {
                  colorMapping[activeColorPicker].onChange(newVal);
                }
              }}
              opacity={100}
              onOpacityChange={() => { }}
              onClose={() => setActiveColorPicker(null)}
              disableGradient={true}
              colorsOnPage={[]}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ElementTitlesProperties;
