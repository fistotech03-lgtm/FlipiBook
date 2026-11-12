import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Sliders,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ElementDropdown, ElementSlider } from './ElementUIControls';
import ColorPicker from '../../../../ColorPicker';
import { IconsModal } from '../../Icons';
import {
  MOTION_GRAPHIC_TEMPLATES,
  getMotionGraphicProperties,
  updateMotionGraphicAttributes
} from '../utils/motionGraphicUtils';
import { handleScrubHelper } from '../../../properties/propertiesShared';

const SectionHeader = ({ title, rightElement }) => (
  <div className="flex items-center gap-[0.8vw]">
    <span className="text-[0.82vw] font-semibold text-gray-900 whitespace-nowrap">{title}</span>
    {rightElement}
    <div className="flex-1 h-[1px] bg-gray-200" />
  </div>
);

// Exact ColorBox matching user screenshot and Color.jsx
const ColorBoxRow = ({
  title,
  color,
  opacity = 100,
  onOpenPicker,
  onChange,
  onOpacityChange,
  isActive = false,
  titleRight,
}) => {
  const isTransparent = !color || color === 'none' || color === 'transparent';
  const displayColor = (() => {
    if (isTransparent) return '#';
    if (typeof color === 'string' && color.includes('gradient')) return 'Gradient';
    return typeof color === 'string' ? (color.startsWith('#') ? color.toUpperCase() : '#' + color.toUpperCase()) : '#000000';
  })();

  return (
    <div className="flex flex-col gap-[0.5vw]">
      {title && (
        <div className="flex items-center gap-[0.8vw] mb-[0.1vw]">
          <span className="text-[0.82vw] font-semibold text-gray-900 whitespace-nowrap">{title}</span>
          {titleRight}
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>
      )}
      <div className="flex items-center gap-[0.6vw]">
        {/* Swatch (3.6vw x 2.1vw rounded rectangle matching user screenshot) */}
        <div
          onClick={onOpenPicker}
          className={`w-[3.6vw] h-[2.1vw] rounded-[0.45vw] border border-gray-300 shadow-2xs cursor-pointer flex-shrink-0 relative overflow-hidden transition-transform hover:scale-105 ${
            isActive ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
          }`}
          title={`Change ${title || 'color'}`}
        >
          <div
            className="w-full h-full"
            style={{ background: isTransparent ? '#ffffff' : color }}
          />
          {isTransparent && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1.5px] bg-red-500 rotate-45 pointer-events-none" />
          )}
        </div>

        {/* Input box */}
        <div className="flex-1 h-[2.1vw] rounded-[0.45vw] border border-gray-300 bg-white flex items-center justify-between px-[0.75vw] hover:border-gray-400 focus-within:border-indigo-400 transition-colors shadow-2xs">
          <input
            type="text"
            value={displayColor}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || val === '#') {
                onChange('none');
              } else {
                const finalVal = val.startsWith('#') ? val : '#' + val;
                onChange(finalVal);
              }
            }}
            className="text-[0.8vw] font-mono font-medium text-gray-800 outline-none bg-transparent flex-1 uppercase"
            maxLength={9}
          />
          <div
            className="flex items-center cursor-ew-resize select-none px-[0.2vw] hover:bg-gray-50 rounded"
            onPointerDown={(e) => {
              const currentPct = Math.round(parseFloat(opacity !== undefined ? opacity : 100));
              handleScrubHelper(e, currentPct, (val) => {
                const num = parseInt(val);
                const clamped = Math.min(Math.max(num, 0), 100);
                if (onOpacityChange) onOpacityChange(clamped);
              });
            }}
            title="Drag horizontally to adjust opacity"
          >
            <span className="text-[0.8vw] font-medium text-gray-700">
              {Math.round(parseFloat(opacity !== undefined ? opacity : 100))}%
            </span>
          </div>
        </div>
      </div>
      {/* Scrubbing & Input styling */}
      <style>{`
        .no-spin::-webkit-inner-spin-button,
        .no-spin::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-spin {
          -moz-appearance: textfield;
        }
        body.is-scrubbing,
        body.is-scrubbing * {
          cursor: ew-resize !important;
          user-select: none !important;
        }
        .virtual-scrub-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 999999;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
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
    <div className="w-full bg-white border border-gray-300 rounded-[0.6vw] p-[0.8vw] shadow-md flex flex-col gap-[0.6vw] animate-in fade-in zoom-in-95 duration-150 relative z-20">
      {/* Title + Close */}
      <div className="flex items-center justify-between pb-[0.1vw]">
        <span className="text-[0.85vw] font-bold text-gray-900 tracking-tight">Text Property</span>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition-colors p-[0.1vw] cursor-pointer"
        >
          <X size="0.85vw" strokeWidth={2.2} />
        </button>
      </div>

      {/* Row 1: Font Family (Full Width) */}
      <div className="w-full">
        {/* Font Family Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'family' ? null : 'family')}
            className="w-full h-[2.1vw] flex items-center justify-between border border-gray-300 rounded-[0.45vw] px-[0.7vw] bg-white hover:border-gray-400 transition-all text-gray-800 shadow-2xs"
          >
            <span className="text-[0.8vw] font-medium truncate" style={{ fontFamily }}>
              {fontFamily}
            </span>
            <ChevronDown size="0.75vw" className="text-gray-400 flex-shrink-0 ml-[0.3vw]" />
          </button>
          {openDropdown === 'family' && (
            <div className="absolute top-[2.4vw] left-0 right-0 bg-white border border-gray-200 rounded-[0.45vw] shadow-xl z-50 py-[0.3vw] max-h-[11vw] overflow-y-auto custom-scrollbar">
              {FONT_FAMILIES.map((ff) => (
                <div
                  key={ff}
                  onClick={() => {
                    onUpdate({ fontFamily: ff });
                    setOpenDropdown(null);
                  }}
                  className={`px-[0.7vw] py-[0.35vw] text-[0.78vw] cursor-pointer hover:bg-gray-50 transition-colors ${fontFamily === ff ? 'bg-indigo-50 font-bold text-indigo-600' : 'text-gray-700'
                    }`}
                  style={{ fontFamily: ff }}
                >
                  {ff}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Font Weight + Font Size */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-[0.5vw]">
        {/* Font Weight Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'weight' ? null : 'weight')}
            className="w-full h-[2.1vw] flex items-center justify-between border border-gray-300 rounded-[0.45vw] px-[0.7vw] bg-white hover:border-gray-400 transition-all text-gray-800 shadow-2xs"
          >
            <span className="text-[0.8vw] font-medium truncate">{fontWeight}</span>
            <ChevronDown size="0.75vw" className="text-gray-400 flex-shrink-0 ml-[0.3vw]" />
          </button>
          {openDropdown === 'weight' && (
            <div className="absolute top-[2.4vw] left-0 right-0 bg-white border border-gray-200 rounded-[0.45vw] shadow-xl z-50 py-[0.3vw] max-h-[10vw] overflow-y-auto custom-scrollbar">
              {FONT_WEIGHTS.map((fw) => (
                <div
                  key={fw}
                  onClick={() => {
                    onUpdate({ fontWeight: fw, isBold: fw.toLowerCase().includes('bold') });
                    setOpenDropdown(null);
                  }}
                  className={`px-[0.7vw] py-[0.35vw] text-[0.78vw] cursor-pointer hover:bg-gray-50 transition-colors ${fontWeight === fw ? 'bg-indigo-50 font-bold text-indigo-600' : 'text-gray-700'
                    }`}
                >
                  {fw}
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
            className="w-full h-[2.1vw] flex items-center justify-between border border-gray-300 rounded-[0.45vw] px-[0.7vw] bg-white hover:border-gray-400 transition-all text-gray-800 shadow-2xs"
          >
            <span className="text-[0.8vw] font-medium">{fontSize} pt</span>
            <ChevronDown size="0.75vw" className="text-gray-400 flex-shrink-0 ml-[0.3vw]" />
          </button>
          {openDropdown === 'size' && (
            <div className="absolute top-[2.4vw] left-0 right-0 bg-white border border-gray-200 rounded-[0.45vw] shadow-xl z-50 py-[0.3vw] max-h-[11vw] overflow-y-auto custom-scrollbar">
              {FONT_SIZES.map((sz) => (
                <div
                  key={sz}
                  onClick={() => {
                    onUpdate({ fontSize: sz });
                    setOpenDropdown(null);
                  }}
                  className={`px-[0.7vw] py-[0.35vw] text-[0.78vw] cursor-pointer hover:bg-gray-50 transition-colors ${fontSize === sz ? 'bg-indigo-50 font-bold text-indigo-600' : 'text-gray-700'
                    }`}
                >
                  {sz} pt
                </div>
              ))}
            </div>
          )}
        </div>
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

  const currentTemplate = effectiveElement?.getAttribute('data-motion-template') || '';
  const hasLogoFeature = currentTemplate === 'youtube-channel' || currentTemplate === 'social-badge';

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

  // Icon / Logo states
  const [iconName, setIconName] = useState(initialProps.iconName || 'Play');
  const [iconHtml, setIconHtml] = useState(initialProps.iconHtml || '');
  const [iconViewBox, setIconViewBox] = useState(initialProps.iconViewBox || '0 0 24 24');
  const [iconColor, setIconColor] = useState(initialProps.iconColor || '#FFFFFF');
  const [iconBgColor, setIconBgColor] = useState(initialProps.iconBgColor || '#FF0024');
  const [isIconGalleryOpen, setIsIconGalleryOpen] = useState(false);

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

      setIconName(p.iconName || (currentTemplate === 'youtube-channel' ? 'Play' : 'Facebook'));
      setIconHtml(p.iconHtml || '');
      setIconViewBox(p.iconViewBox || '0 0 24 24');
      setIconColor(p.iconColor || '#FFFFFF');
      setIconBgColor(p.iconBgColor || (currentTemplate === 'youtube-channel' ? '#FF0024' : '#0E34A8'));

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

  // Helper to dynamically resolve target title element from DOM if stale
  const resolveTargetElement = () => {
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const targetId = selectedLayerId || selectedElement?.id;
    const found = (targetId ? editorDoc.getElementById(targetId) : null) || (targetId ? document.getElementById(targetId) : null) || selectedElement;
    if (found && typeof found.closest === 'function') {
      return found.closest('[data-typography-type="motion-graphic"], [data-motion-template]') || found;
    }
    return found;
  };

  // Synchronize helper
  const syncUpdates = (newAttributes = {}) => {
    const targetEl = resolveTargetElement() || effectiveElement;
    if (!targetEl) return;
    updateMotionGraphicAttributes(targetEl, newAttributes);

    // Sync via DOM serializer
    const svgRoot = (() => {
      const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = (selectedLayerId ? editorDoc.getElementById(selectedLayerId) : null) || (selectedLayerId ? document.getElementById(selectedLayerId) : null) || targetEl;
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
      updateElementAttribute(activePageIndex, targetEl.id || selectedLayerId, '__dom_sync__', html);
    } else if (typeof updateElementAttribute === 'function') {
      updateElementAttribute(activePageIndex, targetEl.id || selectedLayerId, newAttributes);
    }

    // Immediately notify selection engine to recalculate handles and bounding box
    window.dispatchEvent(new CustomEvent('force-update-selection-box'));
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

  const handleIconColorChange = (col) => {
    setIconColor(col);
    syncUpdates({ iconColor: col });
  };

  const handleIconBgColorChange = (col) => {
    setIconBgColor(col);
    syncUpdates({ iconBgColor: col });
  };

  // Helper to dynamically adjust icon markup colors to match color in preview
  const cleanIconHtml = (html, color = '#ffffff') => {
    if (!html) return '';
    return html
      .replace(/stroke="(?!(?:none))[^"]*"/gi, `stroke="${color}"`)
      .replace(/fill="(?!(?:none|transparent))[^"]*"/gi, `fill="${color}"`);
  };

  const renderIconPreview = () => {
    // If we have custom icon SVG HTML
    if (iconHtml) {
      return (
        <div className="w-[3.4vw] h-[3.4vw] rounded-full bg-[#000000] flex items-center justify-center shadow-sm">
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
        </div>
      );
    }

    // Default icon rendering for Facebook / YouTube templates
    if (currentTemplate === 'social-badge' || iconName === 'Facebook') {
      return (
        <div className="w-[3.4vw] h-[3.4vw] rounded-full bg-[#000000] flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 24 24" className="w-[1.8vw] h-[1.8vw]" fill="#ffffff">
            <path d="M13.4 21v-8.2h2.8l.4-3.2h-3.2V7.6c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.4H7.4v3.2h2.8V21h3.2z" />
          </svg>
        </div>
      );
    }

    if (currentTemplate === 'youtube-channel' || iconName === 'Play' || iconName === 'Youtube') {
      return (
        <div className="w-[3.4vw] h-[3.4vw] rounded-full bg-[#000000] flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 24 24" className="w-[1.8vw] h-[1.8vw]" fill="#ffffff">
            <polygon points="7,4 20,12 7,20" />
          </svg>
        </div>
      );
    }

    const IconCmp = LucideIcons[iconName] || LucideIcons.Heart;
    return (
      <div className="w-[3.4vw] h-[3.4vw] rounded-full bg-[#000000] flex items-center justify-center shadow-sm">
        <IconCmp
          size="1.8vw"
          strokeWidth={2.5}
          color="#ffffff"
          style={{
            color: '#ffffff',
            stroke: '#ffffff'
          }}
        />
      </div>
    );
  };

  const previewTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  const triggerPreviewAnimation = () => {
    const targetEl = effectiveElement || selectedElement;
    if (!targetEl) return;

    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    const styles = targetEl.querySelectorAll('style');
    if (!styles.length) return;

    // Save the original css content of each style tag
    const originalStyles = Array.from(styles).map((st) => ({
      el: st,
      originalText: st.textContent
    }));

    // Calculate maximum duration to know when to restore the configured loop count
    let maxDurationMs = 2500;
    originalStyles.forEach(({ originalText }) => {
      const match = originalText.match(/animation:\s*([a-zA-Z0-9_-]+)\s+([0-9.]+)ms/);
      if (match && match[2]) {
        const dur = parseFloat(match[2]);
        if (!isNaN(dur) && dur > maxDurationMs) {
          maxDurationMs = dur;
        }
      }
    });

    // Temporarily replace animation count to run only 1 time for the preview
    styles.forEach((st) => {
      let previewText = st.textContent.replace(
        /(animation:\s*[^;]+?)(\s+(?:infinite|[0-9]+))(\s+cubic-bezier|\s+ease|\s+linear|\s*;)/gi,
        '$1 1$3'
      );
      if (previewText.includes('animation-iteration-count:')) {
        previewText = previewText.replace(/animation-iteration-count:\s*[^;]+;/gi, 'animation-iteration-count: 1;');
      }
      // Force animation restart
      st.textContent = '';
      void st.offsetHeight;
      st.textContent = previewText;
    });

    window.dispatchEvent(new CustomEvent('force-update-selection-box'));

    // After running once (+ buffer), restore the original animation setting (e.g. Infinite / Twice) without disrupting editor state
    previewTimeoutRef.current = setTimeout(() => {
      originalStyles.forEach(({ el, originalText }) => {
        if (el && el.isConnected) {
          el.textContent = originalText;
        }
      });
      window.dispatchEvent(new CustomEvent('force-update-selection-box'));
    }, maxDurationMs + 200);
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
    },
    iconColor: {
      value: iconColor,
      onChange: handleIconColorChange
    },
    iconBgColor: {
      value: iconBgColor,
      onChange: handleIconBgColorChange
    }
  };

  return (
    <div className="relative flex flex-col gap-[1.7vw] w-full max-w-[25vw] pb-[2vw] font-sans select-none">
      {/* ── Titles Property Section ── */}
      <div className="flex flex-col gap-[0.7vw]">
        <SectionHeader title="Titles Property" />

        {/* Top Preview Banner */}
        <button
          type="button"
          onClick={triggerPreviewAnimation}
          className="w-full flex items-center gap-[0.8vw] bg-gray-100 hover:bg-gray-200/80 border border-gray-200 rounded-[0.45vw] px-[1vw] py-[0.7vw] shadow-2xs cursor-pointer transition-all active:scale-[0.99] group text-left"
        >
          <span className="text-[1.2vw] leading-none select-none">⭐</span>
          <span className="text-[0.82vw] font-medium text-gray-800 tracking-tight">
            Click to preview Animations
          </span>
        </button>

        {/* Animation Row */}
        <div className="flex flex-col gap-[0.45vw] mt-[0.2vw]">
          <span className="text-[0.78vw] font-medium text-gray-700">Animation</span>
          <div ref={animationDropdownRef} className={`relative w-full ${isAnimationDropdownOpen ? 'z-[105]' : ''}`}>
            <button
              type="button"
              onClick={() => setIsAnimationDropdownOpen((prev) => !prev)}
              className={`w-full h-[2.1vw] flex items-center justify-between bg-white px-[0.75vw] rounded-[0.45vw] text-[0.82vw] font-medium transition-all cursor-pointer shadow-2xs select-none ${
                isAnimationDropdownOpen
                  ? 'border-2 border-indigo-500 shadow-xs'
                  : 'border border-gray-300 hover:border-gray-400'
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
              <div className="absolute left-0 right-0 top-full mt-[0.35vw] bg-white border border-gray-200 rounded-[0.5vw] shadow-lg overflow-hidden z-[110] flex flex-col py-[0.3vw] animate-in fade-in zoom-in-95 duration-150">
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
                      className={`px-[0.9vw] py-[0.45vw] text-[0.82vw] font-medium transition-colors text-left flex items-center cursor-pointer ${
                        isSelected
                          ? 'text-indigo-600 font-semibold bg-indigo-50'
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
                  className={`px-[0.7vw] py-[0.45vw] flex items-center gap-[0.5vw] cursor-pointer ${
                    animation === 'Custom' ? 'bg-indigo-50' : 'hover:bg-gray-50'
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
                    className={`w-[4.8vw] h-[2vw] px-[0.5vw] border rounded-[0.4vw] text-[0.78vw] font-medium text-gray-800 bg-white outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 ${
                      animation === 'Custom' ? 'border-indigo-500' : 'border-gray-200'
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

        {/* Speed Row */}
        <div className="flex flex-col gap-[0.45vw]">
          <span className="text-[0.78vw] font-medium text-gray-700">Speed</span>
          <div className="flex items-center gap-[0.7vw]">
            <ElementSlider
              min={10}
              max={200}
              step={1}
              value={speed}
              onChange={handleSpeedChange}
              className="flex-1"
            />
            <div className="w-[3.6vw] h-[2.1vw] flex items-center justify-center bg-white border border-gray-300 rounded-[0.45vw] shadow-2xs shrink-0">
              <span className="text-[0.78vw] font-semibold text-gray-800">{speed}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Text Appearance Section ── */}
      <div className="flex flex-col gap-[0.7vw]">
        <SectionHeader title="Text Appearance" />

        {/* Primary Text */}
        <div className="flex flex-col gap-[0.45vw]">
          <div className="flex items-center justify-between">
            <label className="text-[0.78vw] font-medium text-gray-700">Primary Text</label>
            <span className="text-[0.68vw] text-gray-400 font-medium">
              {(primaryText || '').length}/30
            </span>
          </div>
          <div className="flex items-center gap-[0.5vw] w-full">
            <input
              type="text"
              maxLength={30}
              value={primaryText}
              onChange={(e) => handlePrimaryTextChange(e.target.value.slice(0, 30))}
              placeholder="Animation"
              className="flex-1 h-[2.1vw] px-[0.75vw] text-[0.82vw] text-gray-800 bg-white border border-gray-300 rounded-[0.45vw] shadow-2xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20"
            />
            {/* Color Swatch */}
            <div
              onClick={() => setActiveColorPicker((prev) => (prev === 'textColor1' ? null : 'textColor1'))}
              className={`w-[2.1vw] h-[2.1vw] rounded-[0.45vw] border flex-shrink-0 cursor-pointer shadow-2xs hover:scale-105 transition-all flex items-center justify-center ${
                activeColorPicker === 'textColor1' || activeColorPicker === 'primaryText'
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ background: textColor1 }}
              title="Click to pick Text Color 1"
            />
            {/* Sliders edit option button */}
            <button
              type="button"
              onClick={() => setActiveTextSettings((prev) => (prev === 'primary' ? null : 'primary'))}
              className={`w-[2.1vw] h-[2.1vw] rounded-[0.45vw] border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-2xs ${
                activeTextSettings === 'primary'
                  ? 'bg-indigo-50 border-indigo-400 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
              }`}
              title="Text Typography Settings"
            >
              <Sliders className="w-[0.95vw] h-[0.95vw]" />
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
          <div className="flex flex-col gap-[0.45vw]">
            <div className="flex items-center justify-between">
              <label className="text-[0.78vw] font-medium text-gray-700">Secondary Text</label>
              <span className="text-[0.68vw] text-gray-400 font-medium">
                {(secondaryText || '').length}/30
              </span>
            </div>
            <div className="flex items-center gap-[0.5vw] w-full">
              <input
                type="text"
                maxLength={30}
                value={secondaryText}
                onChange={(e) => handleSecondaryTextChange(e.target.value.slice(0, 30))}
                placeholder="Animation"
                className="flex-1 h-[2.1vw] px-[0.75vw] text-[0.82vw] text-gray-800 bg-white border border-gray-300 rounded-[0.45vw] shadow-2xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20"
              />
              {/* Color Swatch */}
              <div
                onClick={() => setActiveColorPicker((prev) => (prev === 'textColor2' ? null : 'textColor2'))}
                className={`w-[2.1vw] h-[2.1vw] rounded-[0.45vw] border flex-shrink-0 cursor-pointer shadow-2xs hover:scale-105 transition-all flex items-center justify-center ${
                  activeColorPicker === 'textColor2' || activeColorPicker === 'secondaryText'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ background: textColor2 }}
                title="Click to pick Text Color 2"
              />
              {/* Sliders edit option button */}
              <button
                type="button"
                onClick={() => setActiveTextSettings((prev) => (prev === 'secondary' ? null : 'secondary'))}
                className={`w-[2.1vw] h-[2.1vw] rounded-[0.45vw] border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-2xs ${
                  activeTextSettings === 'secondary'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                }`}
                title="Text Typography Settings"
              >
                <Sliders className="w-[0.95vw] h-[0.95vw]" />
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

      {/* ── Logo Section (Shown only for templates with icon/logo feature) ── */}
      {hasLogoFeature && (
        <div className="flex flex-col gap-[0.7vw]">
          <SectionHeader title="Logo" />
          <div
            onClick={() => setIsIconGalleryOpen(true)}
            className="w-full h-[4.8vw] border border-gray-300 hover:border-gray-400 rounded-[0.45vw] bg-[#f8fafc] p-[0.4vw] relative flex items-center justify-center cursor-pointer group transition-all shadow-2xs hover:shadow-sm"
            title="Click to change icon"
          >
            {/* Swap Icon button in top-right */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsIconGalleryOpen(true);
              }}
              className="absolute top-[0.4vw] right-[0.4vw] text-gray-400 group-hover:text-gray-700 transition-colors p-[0.2vw] rounded-[0.3vw] hover:bg-gray-100 cursor-pointer"
              title="Change icon"
            >
              <ArrowLeftRight className="w-[0.9vw] h-[0.9vw]" />
            </button>

            {/* Centered preview of icon */}
            <div className="w-[3.5vw] h-[3.5vw] flex items-center justify-center group-hover:scale-105 transition-transform">
              {renderIconPreview()}
            </div>
          </div>
        </div>
      )}

      {/* ── Object Color Section ── */}
      <div className="flex flex-col gap-[0.8vw]">
        {hasLogoFeature ? (
          <>
            <ColorBoxRow
              title="Icon Color"
              color={iconColor}
              onChange={handleIconColorChange}
              onOpenPicker={() => setActiveColorPicker((prev) => (prev === 'iconColor' ? null : 'iconColor'))}
              isActive={activeColorPicker === 'iconColor'}
            />
            <ColorBoxRow
              title="Icon BG Color"
              color={iconBgColor}
              onChange={handleIconBgColorChange}
              onOpenPicker={() => setActiveColorPicker((prev) => (prev === 'iconBgColor' ? null : 'iconBgColor'))}
              isActive={activeColorPicker === 'iconBgColor'}
            />
          </>
        ) : (
          <>
            <ColorBoxRow
              title="Stroke Color"
              color={strokeColor}
              onChange={handleStrokeColorChange}
              onOpenPicker={() => setActiveColorPicker((prev) => (prev === 'strokeColor' ? null : 'strokeColor'))}
              isActive={activeColorPicker === 'strokeColor'}
            />
            <ColorBoxRow
              title="Background Color"
              color={backgroundColor}
              onChange={handleBackgroundColorChange}
              onOpenPicker={() => setActiveColorPicker((prev) => (prev === 'backgroundColor' ? null : 'backgroundColor'))}
              isActive={activeColorPicker === 'backgroundColor'}
            />
          </>
        )}
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

      {/* ── Icon Gallery Modal Portal ── */}
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

            syncUpdates({
              iconName: iconData.name,
              iconHtml: iconData.html || '',
              iconViewBox: iconData.viewBox || '0 0 24 24'
            });
          }}
        />,
        document.body
      )}
    </div>
  );
};

export default ElementTitlesProperties;
