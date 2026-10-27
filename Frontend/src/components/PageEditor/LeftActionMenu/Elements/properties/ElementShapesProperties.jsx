import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { createPortal } from 'react-dom';
import { handleScrubHelper } from '../../../properties/Color';
import CornerRadius from '../../../properties/CornerRadius';
import Effect from '../../../properties/Effect';
import ColorPicker from '../../../../ColorPicker';
import { getShapeCornerDefaults, buildCornerRadiusPath } from '../utils/shapeElementUtils';
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Plus, 
  GripVertical, 
  Trash2, 
  ArrowRightLeft,
  Link2,
  Link2Off,
  Check
} from 'lucide-react';
import { ElementSlider, ElementDropdown } from './ElementUIControls';

// Section Header matching audio/elements exact styling
const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-[0.4vw] mt-[0.3vw]">
    <span className="text-[0.9vw] font-medium text-black whitespace-nowrap">{title}</span>
    <div className="h-[0.06vw] bg-gray-200 flex-1 ml-[0.3vw]" />
  </div>
);

// PropertyRow matching exact alignment (w-[5.6vw] pl-[0.5vw])
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

// PropertySlider using PropertyRow with signature #E05638 styling
const PropertySlider = ({ label, value, onChange, min = 0, max = 100, disabled = false, unit = '', onPointerUp }) => {
  const [localVal, setLocalVal] = useState(value);
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setLocalVal(value);
    }
  }, [value]);

  const numVal = parseFloat(localVal !== undefined ? localVal : value) || 0;
  const pct = Math.max(0, Math.min(100, ((numVal - min) / (max - min)) * 100));

  return (
    <PropertyRow label={label} className={disabled ? 'opacity-40 pointer-events-none' : ''}>
      <div className="flex items-center gap-[0.5vw] w-full h-[2.5vw]" onPointerUp={onPointerUp}>
        <div className="flex-1 flex items-center relative">
          <ElementSlider
            min={min}
            max={max}
            step={1}
            value={numVal}
            disabled={disabled}
            onChange={(val) => {
              setLocalVal(val);
              onChange(val);
            }}
          />
        </div>
        <span className="text-[0.8vw] text-gray-800 font-medium w-[2.8vw] text-right shrink-0">
          {numVal}{unit}
        </span>
      </div>
    </PropertyRow>
  );
};

const ShapeAppearanceControls = ({
  backgroundColor,
  setBackgroundColor,
  activeColorPicker,
  setActiveColorPicker,
  colorsOnPage = [],
  radius,
  setRadius,
  isRadiusLinked,
  setIsRadiusLinked,
  hideCornerRadius = false,
  activeEffects = [],
  setActiveEffects,
  effectSettings = {},
  setEffectSettings,
  openSubSection,
  setOpenSubSection,
  showDetailedPicker,
  setShowDetailedPicker,
  isShape = true
}) => {
  // Local input states for text typing
  const [localFillHex, setLocalFillHex] = useState(null);
  const [localStrokeHex, setLocalStrokeHex] = useState(null);
  const [isAlignDropdownOpen, setIsAlignDropdownOpen] = useState(false);
  const [isCornerDropdownOpen, setIsCornerDropdownOpen] = useState(false);
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const [colorFormat, setColorFormat] = useState('HEX');

  const currentFillHex = localFillHex !== null ? localFillHex : (backgroundColor?.fill && backgroundColor.fill !== 'inherit' ? backgroundColor.fill : '#3194FC');
  const currentStrokeHex = localStrokeHex !== null ? localStrokeHex : (backgroundColor?.stroke && backgroundColor.stroke !== 'none' && backgroundColor.stroke !== 'inherit' ? backgroundColor.stroke : '#000000');

  // Hex input commit helpers
  const handleHexSubmit = (type, val) => {
    let clean = (val || '').trim();
    if (!clean.startsWith('#')) clean = '#' + clean;
    if (/^#[0-9A-Fa-f]{3,8}$/.test(clean)) {
      if (type === 'fill') {
        setLocalFillHex(null);
        setBackgroundColor(prev => ({ ...prev, fill: clean, fillType: 'solid' }));
      } else {
        setLocalStrokeHex(null);
        setBackgroundColor(prev => ({
          ...prev,
          stroke: clean,
          strokeType: 'solid',
          strokeWeight: (parseFloat(prev.strokeWeight) || 0) === 0 ? 2 : prev.strokeWeight
        }));
      }
    } else {
      if (type === 'fill') setLocalFillHex(null);
      else setLocalStrokeHex(null);
    }
  };

  return (
    <div className="flex flex-col gap-[1vw] font-sans select-none text-gray-800">
      
      {/* ===================== 1. FILL COLOR ===================== */}
      <div className="flex flex-col gap-[0.5vw]">
        <div className="flex items-center mt-[0.5vw] gap-[0.5vw]">
          <span className="text-[0.85vw] font-semibold text-black whitespace-nowrap">Fill Color</span>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>

        <div className="flex items-center ml-[0.5vw] mt-[0.5vw] gap-[0.5vw]">
          {/* Swatch */}
          <button
            type="button"
            onClick={() => setActiveColorPicker(activeColorPicker === 'fill' ? null : 'fill')}
            className="w-[2.2vw] h-[2.2vw] rounded-[0.45vw] border border-gray-200 shadow-sm cursor-pointer hover:border-gray-400 transition-all flex-shrink-0 relative overflow-hidden"
            style={{ backgroundColor: backgroundColor?.fill && backgroundColor.fill !== 'inherit' ? backgroundColor.fill : '#3194FC' }}
            title="Choose Fill Color"
          />

          {/* Hex & Opacity Input */}
          <div className="flex-1 h-[2.2vw] bg-white border border-gray-200 rounded-[0.45vw] flex items-center justify-between px-[0.6vw] shadow-sm focus-within:border-indigo-500 transition-all">
            <input
              type="text"
              value={currentFillHex.toUpperCase()}
              onChange={(e) => setLocalFillHex(e.target.value)}
              onBlur={() => handleHexSubmit('fill', currentFillHex)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleHexSubmit('fill', currentFillHex); }}
              className="text-[0.76vw] font-semibold text-gray-700 w-[5vw] outline-none uppercase bg-transparent"
            />
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(backgroundColor?.fillOpacity !== undefined ? backgroundColor.fillOpacity : 100)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    setBackgroundColor(prev => ({ ...prev, fillOpacity: Math.min(100, Math.max(0, val)) }));
                  }
                }}
                className="w-[2vw] text-right text-[0.74vw] text-gray-500 font-semibold outline-none bg-transparent no-spin"
              />
              <span className="text-[0.74vw] text-gray-500 font-semibold ml-[0.1vw]">%</span>
            </div>
          </div>

          {/* Format Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFormatDropdownOpen(prev => !prev)}
              className="h-[2.2vw] px-[0.6vw] bg-white border border-gray-200 rounded-[0.45vw] flex items-center gap-[0.3vw] text-[0.74vw] font-semibold text-gray-700 shadow-sm hover:border-gray-300 cursor-pointer transition-all"
            >
              <span>{colorFormat}</span>
              <ChevronDown size="0.75vw" className="text-gray-400" />
            </button>

            {isFormatDropdownOpen && (
              <div className="absolute top-[2.4vw] right-0 w-[5.5vw] bg-white border border-gray-200 rounded-[0.45vw] shadow-lg z-50 py-[0.2vw]">
                {['HEX', 'RGB', 'HSL'].map(fmt => (
                  <div
                    key={fmt}
                    onClick={() => {
                      setColorFormat(fmt);
                      setIsFormatDropdownOpen(false);
                    }}
                    className={`px-[0.6vw] py-[0.3vw] text-[0.72vw] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                      colorFormat === fmt ? 'font-bold text-indigo-600' : 'text-gray-700'
                    }`}
                  >
                    <span>{fmt}</span>
                    {colorFormat === fmt && <Check size="0.7vw" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================== 2. STROKE COLOR ===================== */}
      <div className="flex flex-col gap-[0.5vw]">
        <div className="flex items-center gap-[0.5vw]">
          <span className="text-[0.85vw] font-semibold text-black whitespace-nowrap">Stroke Color</span>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>

        {/* Row 1: Swatch + Hex/Opacity + Format */}
        <div className="flex items-center ml-[0.5vw] mt-[0.5vw] gap-[0.5vw]">
          <button
            type="button"
            onClick={() => setActiveColorPicker(activeColorPicker === 'stroke' ? null : 'stroke')}
            className="w-[2.2vw] h-[2.2vw] rounded-[0.45vw] border border-gray-200 shadow-sm cursor-pointer hover:border-gray-400 transition-all flex-shrink-0 relative overflow-hidden"
            style={{ backgroundColor: backgroundColor?.stroke && backgroundColor.stroke !== 'none' && backgroundColor.stroke !== 'inherit' ? backgroundColor.stroke : '#000000' }}
            title="Choose Stroke Color"
          />

          <div className="flex-1 h-[2.2vw] bg-white border border-gray-200 rounded-[0.45vw] flex items-center justify-between px-[0.6vw] shadow-sm focus-within:border-indigo-500 transition-all">
            <input
              type="text"
              value={currentStrokeHex.toUpperCase()}
              onChange={(e) => setLocalStrokeHex(e.target.value)}
              onBlur={() => handleHexSubmit('stroke', currentStrokeHex)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleHexSubmit('stroke', currentStrokeHex); }}
              className="text-[0.76vw] font-semibold text-gray-700 w-[5vw] outline-none uppercase bg-transparent"
            />
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(backgroundColor?.strokeOpacity !== undefined ? backgroundColor.strokeOpacity : 100)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    setBackgroundColor(prev => ({ ...prev, strokeOpacity: Math.min(100, Math.max(0, val)) }));
                  }
                }}
                className="w-[2vw] text-right text-[0.74vw] text-gray-500 font-semibold outline-none bg-transparent no-spin"
              />
              <span className="text-[0.74vw] text-gray-500 font-semibold ml-[0.1vw]">%</span>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              className="h-[2.2vw] px-[0.6vw] bg-white border border-gray-200 rounded-[0.45vw] flex items-center gap-[0.3vw] text-[0.74vw] font-semibold text-gray-700 shadow-sm cursor-default"
            >
              <span>{colorFormat}</span>
              <ChevronDown size="0.75vw" className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stroke Settings (Exact match to image) */}
        <div className="flex flex-col gap-[0.8vw] ml-[0.5vw] mt-[0.25vw]">
          {/* Row 1: Alignment & Stroke Width */}
          <div className="grid grid-cols-2 gap-[0.75vw]">
            {/* Alignment */}
            <div className="flex flex-col gap-[0.3vw]">
              <span className="text-[0.76vw] font-semibold text-[#546274]">Alignment</span>
              <ElementDropdown
                value={backgroundColor?.strokePosition || 'Outside'}
                onChange={(val) => setBackgroundColor(prev => ({ ...prev, strokePosition: val }))}
                options={['Outside', 'Center', 'Inside']}
                buttonClassName="!h-[2.2vw]"
              />
            </div>

            {/* Stroke Width Stepper */}
            <div className="flex flex-col gap-[0.3vw]">
              <span className="text-[0.76vw] font-semibold text-[#546274]">Stroke Width</span>
              <div className="flex items-center gap-[0.3vw] h-[2.2vw]">
                <button
                  type="button"
                  onClick={() => setBackgroundColor(prev => ({
                    ...prev,
                    strokeWeight: Math.max(0, (parseFloat(prev.strokeWeight) || 0) - 1)
                  }))}
                  className="w-[2.2vw] h-full bg-[#f4f6f8] hover:bg-slate-200 active:scale-95 border border-[#e2e8f0] rounded-[0.45vw] flex items-center justify-center text-slate-800 font-bold text-[0.95vw] transition-all cursor-pointer shadow-2xs"
                >
                  −
                </button>
                <div className="flex-1 h-full bg-white border border-[#e2e8f0] rounded-[0.45vw] flex items-center justify-center shadow-2xs focus-within:border-indigo-500">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(parseFloat(backgroundColor?.strokeWeight) || 0)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setBackgroundColor(prev => ({ ...prev, strokeWeight: Math.max(0, val) }));
                      }
                    }}
                    className="w-full text-center text-[0.82vw] font-medium text-slate-800 outline-none bg-transparent no-spin"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setBackgroundColor(prev => ({
                    ...prev,
                    strokeWeight: (parseFloat(prev.strokeWeight) || 0) + 1
                  }))}
                  className="w-[2.2vw] h-full bg-[#f4f6f8] hover:bg-slate-200 active:scale-95 border border-[#e2e8f0] rounded-[0.45vw] flex items-center justify-center text-slate-800 font-bold text-[0.95vw] transition-all cursor-pointer shadow-2xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Line style & Line Corner */}
          <div className="grid grid-cols-2 gap-[0.75vw]">
            <div className="flex flex-col gap-[0.3vw]">
              <span className="text-[0.76vw] font-semibold text-[#546274]">Line style</span>
              <div className="flex items-center h-[2.2vw]">
                {/* Solid */}
                <button
                  type="button"
                  onClick={() => setBackgroundColor(prev => ({ ...prev, strokeDashStyle: 'Solid', strokeDasharrayValue: 'none' }))}
                  className="w-[9.5vw] h-full rounded-[0.5vw] border border-[#e2e8f0] bg-white hover:border-slate-300 shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                  title="Solid Line"
                >
                  <div className="w-[5vw] h-[2.5px] bg-[#243042] rounded-full"></div>
                </button>
              </div>
            </div>

            {/* Line Corner */}
            <div className="flex flex-col gap-[0.3vw]">
              <span className="text-[0.76vw] font-semibold text-[#546274]">Line Corner</span>
              <ElementDropdown
                value={backgroundColor?.strokeLinecap === 'round' ? 'Rounded' : 'Square'}
                onChange={(val) => setBackgroundColor(prev => ({ ...prev, strokeLinecap: val === 'Rounded' ? 'round' : 'square' }))}
                options={['Square', 'Rounded']}
                buttonClassName="!h-[2.2vw]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===================== 3. CORNER RADIUS ===================== */}
      {!hideCornerRadius && (
        <CornerRadius
          radius={radius}
          setRadius={setRadius}
          isRadiusLinked={isRadiusLinked}
          setIsRadiusLinked={setIsRadiusLinked}
        />
      )}

      {/* ===================== 4. EFFECTS ===================== */}
      <div className="flex flex-col mt-[0.5vw] gap-[0.5vw]">
        <div className="flex items-center gap-[0.5vw]">
          <span className="text-[0.85vw] font-semibold text-black whitespace-nowrap">Effects</span>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>

        {/* Use Effect component with hideHeader={true} to preserve exact popup UI & alignment */}
        <Effect
          hideHeader={true}
          isShape={isShape}
          openSubSection={openSubSection}
          setOpenSubSection={setOpenSubSection}
          activeEffects={activeEffects}
          setActiveEffects={setActiveEffects}
          effectSettings={effectSettings}
          setEffectSettings={setEffectSettings}
          activeColorPicker={activeColorPicker}
          setActiveColorPicker={setActiveColorPicker}
          showDetailedPicker={showDetailedPicker}
          setShowDetailedPicker={setShowDetailedPicker}
        />
      </div>

      {/* ===================== COLOR PICKER PORTAL ===================== */}
      {activeColorPicker && !activeColorPicker.startsWith('effect-') && !activeColorPicker.startsWith('data-effect-') && createPortal(
        <div
          className="fixed z-[5000]"
          style={{
            top: '50%',
            right: '19.5vw',
            transform: 'translateY(-50%)'
          }}
        >
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <ColorPicker
              key={activeColorPicker}
              color={activeColorPicker === 'fill' ? (backgroundColor?.fill || '#3194FC') : (backgroundColor?.stroke || '#000000')}
              opacity={activeColorPicker === 'fill' ? (backgroundColor?.fillOpacity ?? 100) : (backgroundColor?.strokeOpacity ?? 100)}
              onChange={(newColor) => {
                if (activeColorPicker === 'fill') {
                  setLocalFillHex(null);
                  setBackgroundColor(prev => ({ ...prev, fill: newColor, fillType: 'solid' }));
                } else {
                  setLocalStrokeHex(null);
                  setBackgroundColor(prev => ({
                    ...prev,
                    stroke: newColor,
                    strokeType: 'solid',
                    strokeWeight: (parseFloat(prev.strokeWeight) || 0) === 0 ? 2 : prev.strokeWeight
                  }));
                }
              }}
              onOpacityChange={(newOpacity) => {
                const num = parseFloat(newOpacity);
                if (!isNaN(num)) {
                  if (activeColorPicker === 'fill') {
                    setBackgroundColor(prev => ({ ...prev, fillOpacity: num }));
                  } else {
                    setBackgroundColor(prev => ({ ...prev, strokeOpacity: num }));
                  }
                }
              }}
              onClose={() => setActiveColorPicker(null)}
              colorsOnPage={colorsOnPage || []}
              disableGradient={activeColorPicker === 'stroke'}
            />
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

const ElementShapesProperties = ({
  selectedElementProps,
  activePageIndex,
  selectedLayerId,
  updateElementAttribute,
  activeMainTool,
  hideCornerRadius = false
}) => {
  const [openSubSection, setOpenSubSection] = useState('color');

  // UI states for Color
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [showStrokeSettings, setShowStrokeSettings] = useState(false);
  const [isStrokeStyleOpen, setIsStrokeStyleOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [strokeSettingsPos, setStrokeSettingsPos] = useState({ top: 0, right: 0 });
  const [isDashPosOpen, setIsDashPosOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [showDetailedPicker, setShowDetailedPicker] = useState(false);

  const isCircleShape = Boolean(
    selectedElementProps['data-shape-id'] === 'true-circle' ||
    selectedElementProps['data-shape-title'] === 'Circle' ||
    selectedElementProps['data-name'] === 'Circle' ||
    selectedElementProps.name === 'Circle'
  );

  const isDiamondShape = Boolean(
    !isCircleShape &&
    (
      selectedElementProps['data-shape-id'] === 'rounded-diamond' ||
      selectedElementProps['data-shape-title'] === 'Diamond' ||
      selectedElementProps['data-name'] === 'Diamond' ||
      selectedElementProps.name === 'Diamond' ||
      selectedElementProps['data-shape-type'] === 'diamond' ||
      (selectedElementProps.d && (
        selectedElementProps.d.includes('50 10 L 90') ||
        selectedElementProps.d.includes('50,10 L 90') ||
        selectedElementProps.d.includes('50 12') ||
        selectedElementProps.d.includes('50 88') ||
        selectedElementProps.d.includes('85 43') ||
        selectedElementProps.d.includes('15 57')
      )) ||
      (() => {
        try {
          const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
          const el = doc.getElementById(selectedLayerId);
          if (!el) return false;
          const title = el.getAttribute('data-shape-title') || el.getAttribute('data-name');
          if (title === 'Diamond') return true;
          const id = el.getAttribute('data-shape-id') || el.querySelector('[data-shape-id]')?.getAttribute('data-shape-id');
          if (id === 'rounded-diamond') return true;
          const sType = el.getAttribute('data-shape-type') || el.querySelector('[data-shape-type]')?.getAttribute('data-shape-type');
          if (sType === 'diamond') return true;
          return false;
        } catch (e) {
          return false;
        }
      })()
    )
  );

  const isSquareShape = Boolean(
    !isDiamondShape &&
    !isCircleShape &&
    (
      selectedElementProps['data-shape-id'] === 'sharp-square' ||
      selectedElementProps['data-shape-title'] === 'Square' ||
      selectedElementProps['data-name'] === 'Square' ||
      selectedElementProps.name === 'Square' ||
      selectedElementProps['data-shape-type'] === 'square' ||
      (selectedElementProps['data-shape-type'] === 'polygon' && parseInt(selectedElementProps['data-count']) === 4) ||
      (selectedElementProps['data-shape-type'] === 'rectangle' && (
        (selectedElementProps.d && (selectedElementProps.d.includes('14 14') || selectedElementProps.d.includes('14,14'))) ||
        selectedElementProps['data-shape-title'] === 'Square'
      )) ||
      (() => {
        try {
          const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
          const el = doc.getElementById(selectedLayerId);
          if (!el) return false;
          const title = el.getAttribute('data-shape-title') || el.getAttribute('data-name');
          if (title === 'Square') return true;
          const id = el.getAttribute('data-shape-id') || el.querySelector('[data-shape-id]')?.getAttribute('data-shape-id');
          if (id === 'sharp-square') return true;
          return false;
        } catch (e) {
          return false;
        }
      })()
    )
  );

  const is4SidedShape = isSquareShape || isDiamondShape;

  const rawShapeType = selectedElementProps['data-shape-type'] ||
    selectedElementProps.innerTagName ||
    (selectedElementProps.tagName?.toLowerCase() === 'rect' ? 'rectangle' :
      (selectedElementProps.tagName?.toLowerCase() === 'circle' || selectedElementProps.tagName?.toLowerCase() === 'ellipse' ? 'ellipse' :
        (selectedElementProps.tagName?.toLowerCase() === 'line' ? 'line' :
          (selectedElementProps.tagName?.toLowerCase() === 'polygon' ? 'polygon' : 'vector-path'))));

  const shapeType = is4SidedShape ? 'polygon' : rawShapeType;

  // --- IMAGE MASKING STATE ---
  const [slotImage, setSlotImage] = useState(null);
  const [slotOriginalImage, setSlotOriginalImage] = useState(null);
  const [slotImageName, setSlotImageName] = useState('Image Name .jpg');
  const [slotImageMeta, setSlotImageMeta] = useState('1920 X 1080 • 24MB');
  const [slotRotation, setSlotRotation] = useState(0);
  const [framePadding, setFramePadding] = useState(0);
  const [isMaskEnabled, setIsMaskEnabled] = useState(false);
  const fileInputRef = useRef(null);
  const adjustStateRef = useRef({ isAdjusting: false, slotId: null, isPanning: false, startX: 0, startY: 0, matrix: null, rotateStr: '', imgNode: null, bbox: null, startMatrix: null, path: null });

  const [isNodeEditActive, setIsNodeEditActive] = useState(false);
  const [activeNodeType, setActiveNodeType] = useState(null);
  const [selectedNodeCount, setSelectedNodeCount] = useState(1);
  const [canJoinNodes, setCanJoinNodes] = useState(false);
  const [isLineSelected, setIsLineSelected] = useState(false);

  useEffect(() => {
    const handleNodeSelected = (e) => {
      if (e.detail?.nodeType) {
        setActiveNodeType(e.detail.nodeType);
      }
      const count = e.detail?.selectedCount !== undefined ? e.detail.selectedCount : e.detail?.count;
      if (count !== undefined) {
        setSelectedNodeCount(count);
      }
      if (e.detail?.canJoin !== undefined) {
        setCanJoinNodes(Boolean(e.detail.canJoin) && count === 2);
      } else {
        setCanJoinNodes(count === 2);
      }
      if (e.detail?.isLineSelected !== undefined) {
        setIsLineSelected(Boolean(e.detail.isLineSelected));
      } else {
        setIsLineSelected(false);
      }
    };
    const handleNodeEditChange = (e) => {
      setIsNodeEditActive(Boolean(e.detail?.active));
      if (e.detail?.active) {
        setSelectedNodeCount(1);
        setCanJoinNodes(false);
        setIsLineSelected(false);
        setActiveNodeType(null);
      }
    };
    window.addEventListener('node-selected', handleNodeSelected);
    window.addEventListener('node-edit-mode-changed', handleNodeEditChange);
    return () => {
      window.removeEventListener('node-selected', handleNodeSelected);
      window.removeEventListener('node-edit-mode-changed', handleNodeEditChange);
    };
  }, []);

  // Listen for mask toggle events
  useEffect(() => {
    const handleShapeMaskToggled = (e) => {
      if (!e.detail || e.detail.layerId === selectedLayerId) {
        const enabled = Boolean(e.detail?.enabled);
        setIsMaskEnabled(enabled);
        if (!enabled) {
          setSlotImage(null);
          setSlotOriginalImage(null);
          setSlotRotation(0);
        }
      }
    };
    window.addEventListener('shape-mask-toggled', handleShapeMaskToggled);
    return () => window.removeEventListener('shape-mask-toggled', handleShapeMaskToggled);
  }, [selectedLayerId]);

  const syncDomChanges = useCallback(() => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const selectedElement = doc.getElementById(selectedLayerId);
    if (!selectedElement) return;

    window.__skipCanvasUpdateForPage = activePageIndex;
    let svgRoot = selectedElement;
    while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
      svgRoot = svgRoot.parentElement;
    }
    if (svgRoot) {
      const cloneSvg = svgRoot.cloneNode(true);
      cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(el => el.remove());
      const serializer = new XMLSerializer();
      const html = serializer.serializeToString(cloneSvg);
      updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
    }
  }, [selectedLayerId, activePageIndex, updateElementAttribute]);

  useEffect(() => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const selectedElement = doc.getElementById(selectedLayerId);
    if (!selectedElement) return;

    setFramePadding(parseFloat(selectedElement.getAttribute('data-frame-padding')) || 0);

    const hasMaskEnabledAttr = selectedElement.getAttribute('data-mask-enabled') === 'true' ||
      selectedElement.querySelector('[data-mask-enabled="true"]') !== null;
    setIsMaskEnabled(hasMaskEnabledAttr);

    let svgRoot = selectedElement;
    while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
      svgRoot = svgRoot.parentElement;
    }

    const listeners = [];

    const updateAdjustTransform = () => {
        if (!adjustStateRef.current.matrix) return;
        const m = adjustStateRef.current.matrix;
        const transformStr = `${adjustStateRef.current.rotateStr || ''}matrix(${m[0]} ${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]})`;
        if (adjustStateRef.current.imgNode) {
            adjustStateRef.current.imgNode.setAttribute('transform', transformStr);
        }
        const ghost = selectedElement.querySelector('#ghost-layer');
        if (ghost) {
            const ghostImg = ghost.querySelector('image, img');
            const outline = ghost.querySelector('rect');
            if (ghostImg) ghostImg.setAttribute('transform', transformStr);
            if (outline) outline.setAttribute('transform', transformStr);
        }
    };

    const enterAdjustMode = (patternId, path) => {
        const pattern = (svgRoot || selectedElement).querySelector(`pattern[id="${patternId}"]`) || doc.getElementById(patternId);
        if (!pattern) return;
        const imgNode = pattern.querySelector('image, img');
        if (!imgNode) return;

        adjustStateRef.current.isAdjusting = true;
        adjustStateRef.current.slotId = patternId;
        adjustStateRef.current.imgNode = imgNode;
        adjustStateRef.current.path = path;
        adjustStateRef.current.bbox = path.getBBox();
        
        const transformStr = imgNode.getAttribute('transform');
        let matrix = [1, 0, 0, 1, 0, 0];
        let rotateStr = '';
        if (transformStr) {
            const rMatch = transformStr.match(/rotate\([^)]+\)/);
            if (rMatch) rotateStr = rMatch[0] + ' ';
            const match = transformStr.match(/matrix\(([^)]+)\)/);
            if (match) matrix = match[1].split(/[ ,]+/).map(parseFloat);
        }
        adjustStateRef.current.matrix = matrix;
        adjustStateRef.current.rotateStr = rotateStr;

        let ghost = selectedElement.querySelector('#ghost-layer');
        if (ghost) ghost.remove();
        
        ghost = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        ghost.id = 'ghost-layer';
        ghost.style.cursor = 'grab';
        
        let combinedTransform = path.getAttribute('transform') || '';
        const pt = pattern.getAttribute('patternTransform');
        if (pt) combinedTransform = `${combinedTransform} ${pt}`.trim();
        if (combinedTransform) ghost.setAttribute('transform', combinedTransform);
        
        const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const bbox = adjustStateRef.current.bbox;
        const pcu = pattern.getAttribute('patternContentUnits');
        if (!pcu || pcu === 'objectBoundingBox') {
            wrapper.setAttribute('transform', `translate(${bbox.x}, ${bbox.y}) scale(${bbox.width}, ${bbox.height})`);
        } else {
            wrapper.setAttribute('transform', `translate(0, 0)`);
        }
        
        const ghostImg = imgNode.cloneNode(true);
        ghostImg.setAttribute('opacity', '0.4');
        ghostImg.style.pointerEvents = 'auto';
        
        const outline = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        outline.setAttribute('fill', 'none');
        outline.setAttribute('stroke', '#f59e0b');
        outline.setAttribute('vector-effect', 'non-scaling-stroke');
        outline.setAttribute('stroke-dasharray', '5,5');
        outline.style.pointerEvents = 'none';
        
        let iw = imgNode.getAttribute('width');
        let ih = imgNode.getAttribute('height');
        if (!iw || iw.includes('%')) iw = (!pcu || pcu === 'objectBoundingBox') ? '1' : bbox.width.toString();
        if (!ih || ih.includes('%')) ih = (!pcu || pcu === 'objectBoundingBox') ? '1' : bbox.height.toString();
        outline.setAttribute('width', iw);
        outline.setAttribute('height', ih);
        
        const imgTransform = ghostImg.getAttribute('transform');
        if (imgTransform) outline.setAttribute('transform', imgTransform);
        
        wrapper.appendChild(ghostImg);
        wrapper.appendChild(outline);
        ghost.appendChild(wrapper);

        if (path.parentNode) {
            path.parentNode.insertBefore(ghost, path.nextSibling);
        } else {
            selectedElement.appendChild(ghost);
        }

        path.style.cursor = 'grab';

        ghost.addEventListener('pointerdown', (e) => {
            if (adjustStateRef.current.isAdjusting) {
                e.preventDefault();
                e.stopPropagation();
                adjustStateRef.current.isPanning = true;
                adjustStateRef.current.startX = e.clientX;
                adjustStateRef.current.startY = e.clientY;
                adjustStateRef.current.startMatrix = [...adjustStateRef.current.matrix];
                ghost.style.cursor = 'grabbing';
                if (adjustStateRef.current.path) adjustStateRef.current.path.style.cursor = 'grabbing';
            }
        });
        ghost.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            exitAdjustMode();
        });

        const highlightId = `highlight-${patternId}`;
        let highlight = selectedElement.querySelector(`[data-highlight-id="${highlightId}"]`);
        if (!highlight) {
            highlight = path.cloneNode(true);
            highlight.setAttribute('data-highlight-id', highlightId);
            highlight.setAttribute('pointer-events', 'none');
            highlight.setAttribute('fill', 'none');
            highlight.setAttribute('stroke', '#f59e0b');
            highlight.setAttribute('stroke-width', '2');
            highlight.setAttribute('vector-effect', 'non-scaling-stroke');
            highlight.setAttribute('stroke-dasharray', '8,4');
            if (path.parentNode) {
                path.parentNode.insertBefore(highlight, path.nextSibling);
            } else {
                selectedElement.appendChild(highlight);
            }
        } else {
            highlight.setAttribute('stroke', '#f59e0b');
            highlight.setAttribute('stroke-dasharray', '8,4');
        }
    };

    const exitAdjustMode = () => {
        adjustStateRef.current.isAdjusting = false;
        if (adjustStateRef.current.path) {
            adjustStateRef.current.path.style.cursor = '';
        }
        const ghost = selectedElement.querySelector('#ghost-layer');
        if (ghost) ghost.remove();
        if (adjustStateRef.current.slotId) {
            const highlightId = `highlight-${adjustStateRef.current.slotId}`;
            const highlight = selectedElement.querySelector(`[data-highlight-id="${highlightId}"]`);
            if (highlight) highlight.remove();
        }
        adjustStateRef.current.slotId = null;
        syncDomChanges();
    };

    // Auto-exit adjust mode when clicking outside the shape
    const handleOutsideClick = (e) => {
      if (!adjustStateRef.current.isAdjusting) return;
      const target = e.target;
      if (target && (target.closest?.('#ghost-layer') || target.closest?.(`#${selectedLayerId}`) || target.closest?.('[data-image-slots]'))) {
        return;
      }
      exitAdjustMode();
    };
    window.addEventListener('pointerdown', handleOutsideClick);

    const handlePointerMove = (e) => {
        if (!adjustStateRef.current.isPanning) return;
        e.preventDefault();
        e.stopPropagation();
        
        let dx = e.clientX - adjustStateRef.current.startX;
        let dy = e.clientY - adjustStateRef.current.startY;
        
        let pcu = 'objectBoundingBox';
        if (adjustStateRef.current.slotId && adjustStateRef.current.path) {
            const pattern = (svgRoot || selectedElement).querySelector(`pattern[id="${adjustStateRef.current.slotId}"]`) || doc.getElementById(adjustStateRef.current.slotId);
            if (pattern) {
                pcu = pattern.getAttribute('patternContentUnits') || 'objectBoundingBox';
                let rot = 0;
                const pt = pattern.getAttribute('patternTransform');
                if (pt) {
                    const match = pt.match(/rotate\(([-0-9.]+)/);
                    if (match) rot = parseFloat(match[1]);
                } else if (adjustStateRef.current.rotateStr) {
                    const match = adjustStateRef.current.rotateStr.match(/rotate\(([-0-9.]+)/);
                    if (match) rot = parseFloat(match[1]);
                }
                
                if (rot !== 0) {
                    const rad = -rot * Math.PI / 180;
                    const dxRot = dx * Math.cos(rad) - dy * Math.sin(rad);
                    const dyRot = dx * Math.sin(rad) + dy * Math.cos(rad);
                    dx = dxRot;
                    dy = dyRot;
                }
            }
        }

        let scaleX = 1;
        let scaleY = 1;
        if (adjustStateRef.current.path) {
            const ctm = adjustStateRef.current.path.getScreenCTM();
            if (ctm) {
                scaleX = ctm.a || 1;
                scaleY = ctm.d || 1;
            }
        }
        
        const bbox = adjustStateRef.current.bbox;
        let tx_delta, ty_delta;
        
        if (pcu === 'userSpaceOnUse') {
            tx_delta = dx / scaleX;
            ty_delta = dy / scaleY;
        } else {
            tx_delta = (dx / scaleX) / bbox.width;
            ty_delta = (dy / scaleY) / bbox.height;
        }
        
        const m = adjustStateRef.current.startMatrix;
        if (!m || !adjustStateRef.current.matrix) return;
        adjustStateRef.current.matrix[4] = m[4] + tx_delta;
        adjustStateRef.current.matrix[5] = m[5] + ty_delta;
        
        updateAdjustTransform();
    };

    const handlePointerUp = (e) => {
        if (adjustStateRef.current.isPanning) {
            adjustStateRef.current.isPanning = false;
            if (adjustStateRef.current.path) adjustStateRef.current.path.style.cursor = 'grab';
            const ghost = selectedElement?.querySelector('#ghost-layer');
            if (ghost) ghost.style.cursor = 'grab';
        }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const updateImageFromDOM = () => {
      let shapes = Array.from(selectedElement.querySelectorAll('path, polygon, rect, circle, ellipse'));
      if (['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(selectedElement.tagName?.toLowerCase())) {
          shapes.unshift(selectedElement);
      }
      
      let foundImage = false;
      
      listeners.forEach(({ shapeEl, handleDoubleClick, handlePointerDown, handleWheel }) => {
        shapeEl.removeEventListener('dblclick', handleDoubleClick);
        if (handlePointerDown) shapeEl.removeEventListener('pointerdown', handlePointerDown);
        shapeEl.removeEventListener('wheel', handleWheel);
      });
      listeners.length = 0;
      
      for (const shapeEl of shapes) {
        if (shapeEl.getAttribute('data-mask-enabled') === 'true') {
          setIsMaskEnabled(true);
        }
        const fill = shapeEl.getAttribute('fill');
        if (fill && fill.includes('url(')) {
          const match = fill.match(/url\(['"]?#([^)'"]+)['"]?\)/);
          if (match && match[1]) {
            const patternId = match[1];
            const pattern = (svgRoot || selectedElement).querySelector(`pattern[id="${patternId}"]`) || doc.getElementById(patternId);
            if (pattern) {
              const imgNode = pattern.querySelector('image, img');
              if (imgNode) {
                const newHref = imgNode.getAttribute('href') || imgNode.getAttribute('xlink:href');
                setSlotImage(prev => prev !== newHref ? newHref : prev);
                setIsMaskEnabled(true);

                const savedName = shapeEl.getAttribute('data-slot-image-name') || selectedElement.getAttribute('data-slot-image-name');
                if (savedName) setSlotImageName(savedName);

                const savedMeta = shapeEl.getAttribute('data-slot-image-meta') || selectedElement.getAttribute('data-slot-image-meta');
                if (savedMeta) setSlotImageMeta(savedMeta);

                const savedOrig = shapeEl.getAttribute('data-slot-original-url') || selectedElement.getAttribute('data-slot-original-url');
                if (savedOrig) setSlotOriginalImage(savedOrig);
                else setSlotOriginalImage(newHref);

                const tf = imgNode.getAttribute('transform') || '';
                const rMatch = tf.match(/rotate\(([-0-9.]+)/);
                if (rMatch) {
                  setSlotRotation(parseFloat(rMatch[1]));
                }

                // Seamless upgrade from legacy objectBoundingBox to userSpaceOnUse if needed
                const pcu = pattern.getAttribute('patternContentUnits');
                if (pcu !== 'userSpaceOnUse') {
                  try {
                    const b = shapeEl.getBBox();
                    if (b.width && b.height) {
                      const imgW = parseFloat(imgNode.getAttribute('width')) || b.width;
                      const imgH = parseFloat(imgNode.getAttribute('height')) || b.height;
                      let m = [1, 0, 0, 1, 0, 0];
                      const mMatch = tf.match(/matrix\(([^)]+)\)/);
                      if (mMatch) {
                        m = mMatch[1].split(/[ ,]+/).map(parseFloat);
                        m[0] = m[0] * b.width;
                        m[2] = m[2] * b.width;
                        m[1] = m[1] * b.height;
                        m[3] = m[3] * b.height;
                        m[4] = b.x + m[4] * b.width;
                        m[5] = b.y + m[5] * b.height;
                      } else {
                        const scale = Math.max(b.width / imgW, b.height / imgH);
                        const finalW = imgW * scale;
                        const finalH = imgH * scale;
                        m = [scale, 0, 0, scale, b.x + (b.width - finalW) / 2, b.y + (b.height - finalH) / 2];
                      }
                      pattern.setAttribute('patternContentUnits', 'userSpaceOnUse');
                      pattern.removeAttribute('patternTransform');
                      pattern.removeAttribute('viewBox');
                      imgNode.removeAttribute('preserveAspectRatio');
                      imgNode.removeAttribute('x');
                      imgNode.removeAttribute('y');
                      imgNode.setAttribute('width', imgW);
                      imgNode.setAttribute('height', imgH);
                      let rotStr = rMatch ? rMatch[0] + ' ' : '';
                      imgNode.setAttribute('transform', `${rotStr}matrix(${m.join(' ')})`);
                    }
                  } catch (e) {}
                }
                
                foundImage = true;

                const handleDoubleClick = (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (adjustStateRef.current.isAdjusting && adjustStateRef.current.slotId === patternId) {
                    exitAdjustMode();
                  } else {
                    if (adjustStateRef.current.isAdjusting) exitAdjustMode();
                    enterAdjustMode(patternId, shapeEl);
                  }
                };
      
                const handlePointerDown = (e) => {
                  if (adjustStateRef.current.isAdjusting && adjustStateRef.current.slotId === patternId) {
                      e.preventDefault();
                      e.stopPropagation();
                      adjustStateRef.current.isPanning = true;
                      adjustStateRef.current.startX = e.clientX;
                      adjustStateRef.current.startY = e.clientY;
                      adjustStateRef.current.startMatrix = [...adjustStateRef.current.matrix];
                      shapeEl.style.cursor = 'grabbing';
                      const ghost = selectedElement?.querySelector('#ghost-layer');
                      if (ghost) ghost.style.cursor = 'grabbing';
                  }
                };
      
                const handleWheel = (e) => {
                  if (adjustStateRef.current.isAdjusting && adjustStateRef.current.slotId === patternId) {
                      e.preventDefault();
                      e.stopPropagation();
                      const zoomDelta = e.deltaY < 0 ? 1.05 : 0.95;
                      const m = adjustStateRef.current.matrix;
                      
                      let pcu = 'objectBoundingBox';
                      const pat = (svgRoot || selectedElement).querySelector(`pattern[id="${patternId}"]`) || doc.getElementById(patternId);
                      if (pat) pcu = pat.getAttribute('patternContentUnits') || 'objectBoundingBox';
                      
                      let cx = 0.5;
                      let cy = 0.5;
                      if (pcu === 'userSpaceOnUse' && adjustStateRef.current.bbox) {
                          cx = adjustStateRef.current.bbox.x + adjustStateRef.current.bbox.width / 2;
                          cy = adjustStateRef.current.bbox.y + adjustStateRef.current.bbox.height / 2;
                      }
      
                      m[0] *= zoomDelta;
                      m[3] *= zoomDelta;
                      m[4] = cx + (m[4] - cx) * zoomDelta;
                      m[5] = cy + (m[5] - cy) * zoomDelta;
                      
                      updateAdjustTransform();
                  }
                };

                shapeEl.addEventListener('dblclick', handleDoubleClick);
                shapeEl.addEventListener('pointerdown', handlePointerDown);
                shapeEl.addEventListener('wheel', handleWheel, { passive: false });
                listeners.push({ shapeEl, handleDoubleClick, handlePointerDown, handleWheel });

                break;
              }
            }
          }
        }
      }
      
      if (!foundImage) {
        setSlotImage(null);
        const hasMaskAttr = selectedElement.getAttribute('data-mask-enabled') === 'true' ||
          selectedElement.querySelector('[data-mask-enabled="true"]') !== null;
        setIsMaskEnabled(hasMaskAttr);
      }
    };

    updateImageFromDOM();

    let observer = null;
    if (svgRoot) {
      observer = new MutationObserver(() => {
        updateImageFromDOM();
      });
      observer.observe(svgRoot, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['fill', 'href', 'xlink:href', 'transform', 'patternTransform', 'data-mask-enabled'] 
      });
    }

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointerdown', handleOutsideClick);
      listeners.forEach(({ shapeEl, handleDoubleClick, handlePointerDown, handleWheel }) => {
        shapeEl.removeEventListener('dblclick', handleDoubleClick);
        if (handlePointerDown) shapeEl.removeEventListener('pointerdown', handlePointerDown);
        shapeEl.removeEventListener('wheel', handleWheel);
      });
      const ghost = selectedElement?.querySelector('#ghost-layer');
      if (ghost) ghost.remove();
    };
  }, [selectedLayerId, activePageIndex, selectedElementProps?.fill]);

  const handleRemoveMask = () => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const selectedElement = doc.getElementById(selectedLayerId);
    if (!selectedElement) return;

    let shapeEl = selectedElement.querySelector('path, polygon, rect, circle, ellipse');
    if (!shapeEl && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(selectedElement.tagName?.toLowerCase())) {
      shapeEl = selectedElement;
    }

    let svgRoot = selectedElement;
    while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
      svgRoot = svgRoot.parentElement;
    }

    if (shapeEl) {
      shapeEl.removeAttribute('data-mask-enabled');
      const patternMatch = (shapeEl.getAttribute('fill') || '').match(/url\(['"]?#([^)'"]+)['"]?\)/);
      if (patternMatch && patternMatch[1]) {
        const pat = (svgRoot || selectedElement).querySelector(`pattern[id="${patternMatch[1]}"]`);
        if (pat) pat.remove();
      }
      const origFill = shapeEl.getAttribute('data-original-fill') || '#3194FC';
      shapeEl.setAttribute('fill', origFill);
      shapeEl.removeAttribute('data-pattern-id');
      shapeEl.removeAttribute('data-masked-image-url');
      shapeEl.removeAttribute('data-slot-image-name');
      shapeEl.removeAttribute('data-slot-image-meta');
      shapeEl.removeAttribute('data-slot-original-url');
    }

    selectedElement.removeAttribute('data-mask-enabled');
    selectedElement.removeAttribute('data-slot-image-name');
    selectedElement.removeAttribute('data-slot-image-meta');
    selectedElement.removeAttribute('data-slot-original-url');
    setSlotImage(null);
    setSlotOriginalImage(null);
    setSlotRotation(0);
    setIsMaskEnabled(false);

    window.__skipCanvasUpdateForPage = activePageIndex;
    if (svgRoot) {
      const cloneSvg = svgRoot.cloneNode(true);
      cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(el => el.remove());
      const serializer = new XMLSerializer();
      const html = serializer.serializeToString(cloneSvg);
      updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
    }
    window.dispatchEvent(new CustomEvent('shape-mask-toggled', { detail: { layerId: selectedLayerId, enabled: false } }));
  };

  const handleDeleteImage = () => {
    handleRemoveMask();
  };

  const updateRotation = (angle, skipSync = false) => {
    setSlotRotation(angle);
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const selectedElement = doc.getElementById(selectedLayerId);
    if (!selectedElement) return;

    let shapeEl = selectedElement.querySelector('path, polygon, rect, circle, ellipse');
    if (!shapeEl && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(selectedElement.tagName?.toLowerCase())) {
      shapeEl = selectedElement;
    }
    if (!shapeEl) return;

    const patternMatch = (shapeEl.getAttribute('fill') || '').match(/url\(['"]?#([^)'"]+)['"]?\)/);
    if (!patternMatch || !patternMatch[1]) return;
    const patternId = patternMatch[1];

    let svgRoot = selectedElement;
    while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
      svgRoot = svgRoot.parentElement;
    }
    const pattern = (svgRoot || selectedElement).querySelector(`pattern[id="${patternId}"]`) || doc.getElementById(patternId);
    if (!pattern) return;

    let bbox = { x: 0, y: 0, width: 100, height: 100 };
    try { bbox = shapeEl.getBBox(); } catch(e) {}
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;

    const pcu = pattern.getAttribute('patternContentUnits');
    const imgNode = pattern.querySelector('image, img');
    if (!imgNode) return;

    let tf = imgNode.getAttribute('transform') || '';
    let m = [1, 0, 0, 1, 0, 0];
    const mMatch = tf.match(/matrix\(([^)]+)\)/);
    if (mMatch) {
      m = mMatch[1].split(/[ ,]+/).map(parseFloat);
    }

    if (pcu !== 'userSpaceOnUse') {
      m[0] = m[0] * bbox.width;
      m[2] = m[2] * bbox.width;
      m[1] = m[1] * bbox.height;
      m[3] = m[3] * bbox.height;
      m[4] = bbox.x + m[4] * bbox.width;
      m[5] = bbox.y + m[5] * bbox.height;
      pattern.setAttribute('patternContentUnits', 'userSpaceOnUse');
      pattern.removeAttribute('patternTransform');
    }

    const matrixStr = `matrix(${m.join(' ')})`;
    if (angle !== 0) {
      imgNode.setAttribute('transform', `rotate(${angle}, ${cx}, ${cy}) ${matrixStr}`.trim());
    } else {
      imgNode.setAttribute('transform', matrixStr);
    }

    if (!skipSync) syncDomChanges();
  };

  const applyImageMask = useCallback((
    dataUrl,
    name = null,
    sizeStr = null,
    originalDataUrl = null
  ) => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const selectedElement = doc.getElementById(selectedLayerId);
    if (!selectedElement) return;

    let shapeEl = selectedElement.querySelector('path, polygon, rect, circle, ellipse');
    if (!shapeEl && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(selectedElement.tagName?.toLowerCase())) {
        shapeEl = selectedElement;
    }
    if (!shapeEl) return;

    shapeEl.setAttribute('data-mask-enabled', 'true');
    selectedElement.setAttribute('data-mask-enabled', 'true');
    if (!shapeEl.hasAttribute('data-original-fill')) {
      shapeEl.setAttribute('data-original-fill', shapeEl.getAttribute('fill') || '#3194FC');
    }
    setIsMaskEnabled(true);

    let defs = selectedElement.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      selectedElement.insertBefore(defs, selectedElement.firstChild);
    }

    const patternId = `pattern-${selectedLayerId}`;
    let pattern = defs.querySelector(`pattern[id="${patternId}"]`);
    if (!pattern) {
      pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      pattern.setAttribute('id', patternId);
      defs.appendChild(pattern);
    }
    pattern.setAttribute('patternUnits', 'objectBoundingBox');
    pattern.setAttribute('patternContentUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '1');
    pattern.setAttribute('height', '1');
    pattern.removeAttribute('patternTransform');
    pattern.removeAttribute('viewBox');

    shapeEl.setAttribute('fill', `url(#${patternId})`);

    const img = new window.Image();
    img.onload = () => {
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;

      const dims = `${imgW} X ${imgH}`;
      const meta = `${dims} • ${sizeStr || '24MB'}`;
      if (name) setSlotImageName(name);
      setSlotImageMeta(meta);

      const origToSave = originalDataUrl || dataUrl;
      setSlotOriginalImage(origToSave);

      if (shapeEl) {
        if (name) shapeEl.setAttribute('data-slot-image-name', name);
        shapeEl.setAttribute('data-slot-image-meta', meta);
        shapeEl.setAttribute('data-slot-original-url', origToSave);
      }
      if (selectedElement) {
        if (name) selectedElement.setAttribute('data-slot-image-name', name);
        selectedElement.setAttribute('data-slot-image-meta', meta);
        selectedElement.setAttribute('data-slot-original-url', origToSave);
      }

      let bbox = { width: 100, height: 100, x: 0, y: 0 };
      try {
        bbox = shapeEl.getBBox();
      } catch(e) {}
      if (bbox.width === 0 || bbox.height === 0) bbox = { width: 100, height: 100, x: 0, y: 0 };

      const slotW = bbox.width;
      const slotH = bbox.height;

      const scale = Math.max(slotW / imgW, slotH / imgH);
      const finalW = imgW * scale;
      const finalH = imgH * scale;

      const tx_user = bbox.x + (slotW - finalW) / 2;
      const ty_user = bbox.y + (slotH - finalH) / 2;

      let imageNode = pattern.querySelector('image, img');
      if (!imageNode) {
        imageNode = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        pattern.appendChild(imageNode);
      }

      imageNode.setAttribute('width', imgW);
      imageNode.setAttribute('height', imgH);
      imageNode.removeAttribute('preserveAspectRatio');
      imageNode.removeAttribute('x');
      imageNode.removeAttribute('y');

      const existingTf = imageNode.getAttribute('transform') || '';
      let rotateStr = '';
      const rMatch = existingTf.match(/rotate\([^)]+\)/);
      if (rMatch) rotateStr = rMatch[0] + ' ';

      imageNode.setAttribute('transform', `${rotateStr}matrix(${scale} 0 0 ${scale} ${tx_user} ${ty_user})`);
      imageNode.setAttribute('href', dataUrl);
      imageNode.setAttribute('xlink:href', dataUrl);

      setSlotImage(dataUrl);

      window.__skipCanvasUpdateForPage = activePageIndex;
      let svgRoot = selectedElement;
      while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
        svgRoot = svgRoot.parentElement;
      }
      if (svgRoot) {
        const cloneSvg = svgRoot.cloneNode(true);
        cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(el => el.remove());
        const serializer = new XMLSerializer();
        const html = serializer.serializeToString(cloneSvg);
        updateElementAttribute(activePageIndex, selectedLayerId, {
            '__dom_sync__': html,
            'fill': `url(#${patternId})`
        });
      }
    };
    img.src = dataUrl;
  }, [selectedLayerId, activePageIndex, updateElementAttribute]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only Image formats are allowed for shapes.');
      e.target.value = '';
      return;
    }

    const name = file.name || 'Image Name .jpg';
    setSlotImageName(name);

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
      : `${Math.round(file.size / 1024)}KB`;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setSlotOriginalImage(dataUrl);
      applyImageMask(dataUrl, name, sizeStr, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const colorsOnPage = React.useMemo(() => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const elements = doc.querySelectorAll('[data-fill-color], [data-stroke-color]');
    const colors = new Set();
    elements.forEach(el => {
      const fill = el.getAttribute('data-fill-color');
      const stroke = el.getAttribute('data-stroke-color');
      if (fill && fill !== 'none' && fill !== '#' && !fill.includes('gradient')) colors.add(fill.toUpperCase());
      if (stroke && stroke !== 'none' && stroke !== '#' && !stroke.includes('gradient')) colors.add(stroke.toUpperCase());
    });
    colors.add('#FFFFFF');
    colors.add('#000000');
    return Array.from(colors).slice(0, 12);
  }, [selectedElementProps, activePageIndex]);

  const hasShapeParameters = shapeType === 'polygon' || shapeType === 'star' || Boolean(selectedElementProps?.['data-count']) || Boolean(selectedElementProps?.['data-ratio']);

  const CORNER_RADIUS_SHAPE_IDS = [
    'true-circle',
    'squircle-superellipse',
    'stadium-pill-capsule',
    'arch-tombstone',
    'diagonal-leaf',
    'reverse-curved-petal'
  ];

  const CORNER_RADIUS_SHAPE_TITLES = [
    'circle',
    'squircle',
    'capsule',
    'arch',
    'leaf',
    'reverse leaf'
  ];

  const currentShapeId = (selectedElementProps['data-shape-id'] || '').toLowerCase().trim();
  const currentShapeTitle = (selectedElementProps['data-shape-title'] || selectedElementProps['data-name'] || selectedElementProps.name || '').toLowerCase().trim();

  const isCornerRadiusShape = Boolean(
    CORNER_RADIUS_SHAPE_IDS.includes(currentShapeId) ||
    CORNER_RADIUS_SHAPE_TITLES.includes(currentShapeTitle) ||
    (() => {
      try {
        const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
        const el = doc.getElementById(selectedLayerId);
        if (!el) return false;
        const id = (el.getAttribute('data-shape-id') || el.querySelector('[data-shape-id]')?.getAttribute('data-shape-id') || '').toLowerCase().trim();
        if (CORNER_RADIUS_SHAPE_IDS.includes(id)) return true;
        const title = (el.getAttribute('data-shape-title') || el.getAttribute('data-name') || el.querySelector('[data-shape-title]')?.getAttribute('data-shape-title') || '').toLowerCase().trim();
        return CORNER_RADIUS_SHAPE_TITLES.includes(title);
      } catch (e) {
        return false;
      }
    })()
  );

  const shouldHideCornerRadius = hideCornerRadius || !isCornerRadiusShape;

  if (!selectedElementProps) return null;

  const updateAttr = (attribute, value) => {
    try {
      const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = doc.getElementById(selectedLayerId) || doc.querySelector(`[data-name="${selectedLayerId}"]`);
      if (el) {
        let targetShape = el;
        if (el.tagName?.toLowerCase() === 'g') {
          const inner = el.querySelector('path, polygon, rect, circle, ellipse, line');
          if (inner) targetShape = inner;
        }

        // Apply attribute to both outer element and inner targetShape
        el.setAttribute(attribute, value);
        if (targetShape !== el) {
          targetShape.setAttribute(attribute, value);
        }

        // If this is a shape parameter (count, ratio, radius), recalculate the path immediately on live DOM
        if (['data-count', 'data-ratio', 'data-radius'].includes(attribute)) {
          const sType = targetShape.getAttribute('data-shape-type') || el.getAttribute('data-shape-type') || (shapeType === 'polygon' || shapeType === 'star' ? shapeType : null);
          if (sType === 'polygon' || sType === 'star') {
            let cx = parseFloat(targetShape.getAttribute('data-cx') || el.getAttribute('data-cx') || 0);
            let cy = parseFloat(targetShape.getAttribute('data-cy') || el.getAttribute('data-cy') || 0);
            let rx = parseFloat(targetShape.getAttribute('data-rx') || el.getAttribute('data-rx') || 0);
            const defaultCount = is4SidedShape ? 4 : (sType === 'polygon' ? 3 : 5);
            const count = parseInt(attribute === 'data-count' ? value : (targetShape.getAttribute('data-count') || el.getAttribute('data-count') || defaultCount));
            const isStarFish = targetShape.getAttribute('data-shape-id') === 'star-fish' || 
                               el.getAttribute('data-shape-id') === 'star-fish' ||
                               targetShape.getAttribute('data-shape-title') === 'Star Fish' ||
                               el.getAttribute('data-shape-title') === 'Star Fish' ||
                               selectedElementProps['data-shape-id'] === 'star-fish' ||
                               selectedElementProps['data-shape-title'] === 'Star Fish';
            const defaultRatio = isStarFish ? 20 : 40;
            const defaultRadius = isStarFish ? 25 : 0;
            const cr = parseFloat(attribute === 'data-radius' ? value : (targetShape.getAttribute('data-radius') || el.getAttribute('data-radius') || defaultRadius));
            const ratioVal = parseFloat(attribute === 'data-ratio' ? value : (targetShape.getAttribute('data-ratio') || el.getAttribute('data-ratio') || defaultRatio));

            if (!cx && !cy) { cx = 50; cy = 50; }
            if (!rx || rx <= 0) { rx = (count === 4) ? (isSquareShape ? 50.91 : 40) : 42; }

            targetShape.setAttribute('data-cx', cx.toString());
            targetShape.setAttribute('data-cy', cy.toString());
            targetShape.setAttribute('data-rx', rx.toString());
            targetShape.setAttribute('data-shape-type', sType);
            if (el !== targetShape) {
              el.setAttribute('data-cx', cx.toString());
              el.setAttribute('data-cy', cy.toString());
              el.setAttribute('data-rx', rx.toString());
              el.setAttribute('data-shape-type', sType);
            }

            const pts = [];
            if (sType === 'polygon') {
              const startAngle = (count === 4 && isSquareShape) ? (-3 * Math.PI / 4) : (-Math.PI / 2);
              const effectiveRx = (count === 4) ? (isSquareShape ? 50.91 : 40) : (rx > 45 ? 42 : rx);
              for (let i = 0; i < count; i++) {
                const angle = (i * 2 * Math.PI) / count + startAngle;
                pts.push({ x: cx + effectiveRx * Math.cos(angle), y: cy + effectiveRx * Math.sin(angle) });
              }
            } else if (sType === 'star') {
              const ratio = ratioVal / 100;
              const ri = rx * ratio;
              const sides = count * 2;
              const starAngleDeg = parseFloat(targetShape.getAttribute('data-angle') || el.getAttribute('data-angle') || selectedElementProps['data-angle'] || (isStarFish ? 25 : 0)) || (isStarFish ? 25 : 0);
              const starStartAngle = -Math.PI / 2 + (starAngleDeg * Math.PI / 180);
              for (let i = 0; i < sides; i++) {
                const r = (i % 2 === 0) ? rx : ri;
                const angle = (Math.PI / count) * i + starStartAngle;
                pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
              }
            }

            let pathData = "";
            if (cr > 0 && pts.length > 2) {
              const cornerPoints = pts.map((curr, i) => {
                const prev = pts[(i + pts.length - 1) % pts.length];
                const next = pts[(i + 1) % pts.length];
                const d1 = { x: curr.x - prev.x, y: curr.y - prev.y };
                const d2 = { x: next.x - curr.x, y: next.y - curr.y };
                const l1 = Math.hypot(d1.x, d1.y) || 1;
                const l2 = Math.hypot(d2.x, d2.y) || 1;
                const limit = Math.max(0, Math.min(cr, l1 / 2, l2 / 2));
                return {
                  limit,
                  q: { x: curr.x, y: curr.y },
                  p1: { x: curr.x - (d1.x / l1) * limit, y: curr.y - (d1.y / l1) * limit },
                  p2: { x: curr.x + (d2.x / l2) * limit, y: curr.y + (d2.y / l2) * limit }
                };
              });
              cornerPoints.forEach((cp, i) => {
                if (i === 0) pathData += `M ${cp.p1.x.toFixed(2)} ${cp.p1.y.toFixed(2)}`;
                else pathData += ` L ${cp.p1.x.toFixed(2)} ${cp.p1.y.toFixed(2)}`;
                if (cp.limit > 0) {
                  pathData += ` Q ${cp.q.x.toFixed(2)} ${cp.q.y.toFixed(2)}, ${cp.p2.x.toFixed(2)} ${cp.p2.y.toFixed(2)}`;
                }
              });
              pathData += " Z";
            } else {
              pathData = `M ${pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L ')} Z`;
            }

            targetShape.setAttribute('d', pathData);
            if (el !== targetShape && el.tagName?.toLowerCase() !== 'g') {
              el.setAttribute('d', pathData);
            }
          }
        }

        window.__skipCanvasUpdateForPage = activePageIndex;
        let svgRoot = el;
        while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') svgRoot = svgRoot.parentElement;
        if (svgRoot) {
          const cloneSvg = svgRoot.cloneNode(true);
          cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(e => e.remove());
          const serializer = new XMLSerializer();
          const html = serializer.serializeToString(cloneSvg);
          updateElementAttribute(activePageIndex, selectedLayerId, { [attribute]: value, '__dom_sync__': html });
          return;
        }
      }
    } catch (e) {
      console.error('Error updating shape parameter live:', e);
    }

    updateElementAttribute(activePageIndex, selectedLayerId, attribute, value);
  };

  // --- DERIVED STATE ---
  const backgroundColor = {
    fill: (selectedElementProps.fill && selectedElementProps.fill !== 'inherit') ? selectedElementProps.fill : (selectedElementProps['data-fill-color'] || '#000000'),
    fillOpacity: selectedElementProps['fill-opacity'] ? parseFloat(selectedElementProps['fill-opacity']) * 100 : (selectedElementProps.opacity ? parseFloat(selectedElementProps.opacity) * 100 : 100),
    stroke: (selectedElementProps.stroke && selectedElementProps.stroke !== 'inherit') ? selectedElementProps.stroke : (selectedElementProps['data-stroke-color'] || 'none'),
    strokeOpacity: selectedElementProps['stroke-opacity'] ? parseFloat(selectedElementProps['stroke-opacity']) * 100 : 100,
    fillType: selectedElementProps['fill-type'] || 'solid',
    fillGradientType: selectedElementProps['fill-gradient-type'] || 'linear',
    fillStops: selectedElementProps['fill-stops'],
    fillAngle: parseFloat(selectedElementProps['fill-angle'] || 0),
    fillRadius: parseFloat(selectedElementProps['fill-radius'] || 100),
    strokeType: selectedElementProps['stroke-type'] || 'solid',
    strokeGradientType: selectedElementProps['stroke-gradient-type'] || 'linear',
    strokeStops: selectedElementProps['stroke-stops'],
    strokeAngle: parseFloat(selectedElementProps['stroke-angle'] || 0),
    strokeRadius: parseFloat(selectedElementProps['stroke-radius'] || 100),
    strokeWeight: parseFloat(selectedElementProps['stroke-width'] || 0),
    strokeDashStyle: ((selectedElementProps['stroke-dasharray'] || selectedElementProps['data-stroke-dasharray'] || selectedElementProps.strokeDasharray) && (selectedElementProps['stroke-dasharray'] || selectedElementProps['data-stroke-dasharray'] || selectedElementProps.strokeDasharray) !== 'none') ? (
      (selectedElementProps['stroke-dasharray'] || selectedElementProps['data-stroke-dasharray'] || selectedElementProps.strokeDasharray).startsWith('2,') ? 'Dotted' : 'Dashed'
    ) : 'Solid',
    strokeDasharrayValue: selectedElementProps['stroke-dasharray'] || selectedElementProps['data-stroke-dasharray'] || selectedElementProps.strokeDasharray,
    strokeDashLength: parseInt(((selectedElementProps['stroke-dasharray'] || selectedElementProps['data-stroke-dasharray'] || selectedElementProps.strokeDasharray) === 'none' ? '8,4' : ((selectedElementProps['stroke-dasharray'] || selectedElementProps['data-stroke-dasharray'] || selectedElementProps.strokeDasharray) || '8,4')).split(',')[0]) || 8,
    strokeDashGap: parseInt((((selectedElementProps['stroke-dasharray'] || selectedElementProps['data-stroke-dasharray'] || selectedElementProps.strokeDasharray) === 'none' ? '8,4' : ((selectedElementProps['stroke-dasharray'] || selectedElementProps['data-stroke-dasharray'] || selectedElementProps.strokeDasharray) || '8,4')).split(',')[1] || ((selectedElementProps['stroke-dasharray'] || selectedElementProps['data-stroke-dasharray'] || selectedElementProps.strokeDasharray) === 'none' ? '8,4' : ((selectedElementProps['stroke-dasharray'] || selectedElementProps['data-stroke-dasharray'] || selectedElementProps.strokeDasharray) || '8,4')).split(',')[0])) || 4,
    strokeLinecap: selectedElementProps['stroke-linecap'] === 'round' ? 'round' : 'square',
    strokePosition: selectedElementProps['data-stroke-position'] || 'Outside',
  };

  const handleSetBackgroundColor = (updater) => {
    const next = typeof updater === 'function' ? updater(backgroundColor) : updater;

    const updates = {};
    if (backgroundColor.fill !== next.fill) {
      if (slotImage) {
        updates['data-fill-color'] = next.fill;
      } else {
        updates['fill'] = next.fill;
        updates['data-fill-color'] = next.fill;
      }
    }
    if (backgroundColor.fillOpacity !== next.fillOpacity) {
      updates['fill-opacity'] = (next.fillOpacity / 100).toString();
      updates['opacity'] = '1';
    }
    if (backgroundColor.stroke !== next.stroke) {
      updates['stroke'] = next.stroke;
      updates['data-stroke-color'] = next.stroke;
    }
    if (backgroundColor.strokeOpacity !== next.strokeOpacity) updates['stroke-opacity'] = (next.strokeOpacity / 100).toString();
    if (backgroundColor.strokeWeight !== next.strokeWeight) {
      updates['stroke-width'] = next.strokeWeight.toString();
      updates['strokeWidth'] = next.strokeWeight.toString();
      updates['data-stroke-width'] = next.strokeWeight.toString();
    }
    if (backgroundColor.strokeDashStyle !== next.strokeDashStyle || backgroundColor.strokeDashLength !== next.strokeDashLength || backgroundColor.strokeDashGap !== next.strokeDashGap || backgroundColor.strokeDasharrayValue !== next.strokeDasharrayValue) {
      if (next.strokeDashStyle === 'none' || next.strokeDashStyle === 'Solid') {
        updates['stroke-dasharray'] = 'none';
      } else {
        updates['stroke-dasharray'] = next.strokeDasharrayValue || `${next.strokeDashLength || 10},${next.strokeDashGap || 10}`;
      }
    }
    if (backgroundColor.strokePosition !== next.strokePosition) updates['data-stroke-position'] = next.strokePosition;
    if (backgroundColor.strokeLinecap !== next.strokeLinecap) {
      updates['stroke-linecap'] = next.strokeLinecap;
      updates['stroke-linejoin'] = next.strokeLinecap === 'round' ? 'round' : 'miter';
    }
    if (backgroundColor.fillType !== next.fillType) updates['fill-type'] = next.fillType;
    if (backgroundColor.fillGradientType !== next.fillGradientType) updates['fill-gradient-type'] = next.fillGradientType;
    if (backgroundColor.fillStops !== next.fillStops) updates['fill-stops'] = next.fillStops;
    if (backgroundColor.fillAngle !== next.fillAngle) updates['fill-angle'] = next.fillAngle;
    if (backgroundColor.fillRadius !== next.fillRadius) updates['fill-radius'] = next.fillRadius;

    if (backgroundColor.strokeType !== next.strokeType) updates['stroke-type'] = next.strokeType;
    if (backgroundColor.strokeGradientType !== next.strokeGradientType) updates['stroke-gradient-type'] = next.strokeGradientType;
    if (backgroundColor.strokeStops !== next.strokeStops) updates['stroke-stops'] = next.strokeStops;
    if (backgroundColor.strokeAngle !== next.strokeAngle) updates['stroke-angle'] = next.strokeAngle;
    if (backgroundColor.strokeRadius !== next.strokeRadius) updates['stroke-radius'] = next.strokeRadius;

    if (Object.keys(updates).length > 0) {
      const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const selectedElement = doc.getElementById(selectedLayerId);
      if (selectedElement) {
        const bgRect = selectedElement.querySelector('.frame-bg-rect');
        if (bgRect) {
          if (next.fill !== undefined) bgRect.setAttribute('fill', next.fill !== '#' ? next.fill : 'none');
          if (next.fillOpacity !== undefined) bgRect.setAttribute('fill-opacity', next.fillOpacity / 100);
          if (next.stroke !== undefined) bgRect.setAttribute('stroke', next.stroke !== '#' ? next.stroke : 'none');
          if (next.strokeOpacity !== undefined) bgRect.setAttribute('stroke-opacity', next.strokeOpacity / 100);
          if (next.strokeWeight !== undefined) bgRect.setAttribute('stroke-width', next.strokeWeight);
          if (next.strokeDashStyle !== undefined) {
            const dashValue = (next.strokeDashStyle === 'none' || next.strokeDashStyle === 'Solid') 
              ? 'none' 
              : (next.strokeDasharrayValue || `${next.strokeDashLength || 10},${next.strokeDashGap || 10}`);
            bgRect.setAttribute('stroke-dasharray', dashValue);
          }
          Object.entries(updates).forEach(([k, v]) => {
            if (k === 'fill' || k === 'stroke') return;
            selectedElement.setAttribute(k, v);
          });
          
          window.__skipCanvasUpdateForPage = activePageIndex;
          let svgRoot = selectedElement;
          while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') svgRoot = svgRoot.parentElement;
          if (svgRoot) {
            const cloneSvg = svgRoot.cloneNode(true);
            cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(el => el.remove());
            const serializer = new XMLSerializer();
            const html = serializer.serializeToString(cloneSvg);
            updateElementAttribute(activePageIndex, selectedLayerId, { ...updates, '__dom_sync__': html });
            return;
          }
        }
      }
      updateElementAttribute(activePageIndex, selectedLayerId, updates);
    }
  };

  const shapeCornerId = selectedElementProps['data-shape-id'] || (() => {
    try {
      const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = doc.getElementById(selectedLayerId);
      return el?.getAttribute('data-shape-id') || el?.querySelector('[data-shape-id]')?.getAttribute('data-shape-id');
    } catch (e) { return null; }
  })();
  const shapeCornerTitle = selectedElementProps['data-shape-title'] || selectedElementProps['data-name'] || selectedElementProps.name || (() => {
    try {
      const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = doc.getElementById(selectedLayerId);
      return el?.getAttribute('data-shape-title') || el?.getAttribute('data-name');
    } catch (e) { return null; }
  })();
  const cornerShapeDefaults = getShapeCornerDefaults(shapeCornerId, shapeCornerTitle);

  const radius = {
    tl: parseInt(selectedElementProps['data-tl'] !== undefined ? selectedElementProps['data-tl'] : (cornerShapeDefaults ? cornerShapeDefaults.tl : (selectedElementProps.rx || 0))),
    tr: parseInt(selectedElementProps['data-tr'] !== undefined ? selectedElementProps['data-tr'] : (cornerShapeDefaults ? cornerShapeDefaults.tr : (selectedElementProps.rx || 0))),
    bl: parseInt(selectedElementProps['data-bl'] !== undefined ? selectedElementProps['data-bl'] : (cornerShapeDefaults ? cornerShapeDefaults.bl : (selectedElementProps.rx || 0))),
    br: parseInt(selectedElementProps['data-br'] !== undefined ? selectedElementProps['data-br'] : (cornerShapeDefaults ? cornerShapeDefaults.br : (selectedElementProps.rx || 0)))
  };
  const isRadiusLinked = selectedElementProps['data-corner-linked'] !== undefined
    ? selectedElementProps['data-corner-linked'] !== 'false'
    : (cornerShapeDefaults ? cornerShapeDefaults.linked : true);

  const handleSetRadius = (updater) => {
    const next = typeof updater === 'function' ? updater(radius) : updater;
    const updates = {};
    updates['data-tl'] = (next.tl || 0).toString();
    updates['data-tr'] = (next.tr || 0).toString();
    updates['data-bl'] = (next.bl || 0).toString();
    updates['data-br'] = (next.br || 0).toString();

    const maxR = Math.max(next.tl || 0, next.tr || 0, next.bl || 0, next.br || 0);
    updates['rx'] = maxR.toString();
    updates['ry'] = maxR.toString();

    try {
      const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = doc.getElementById(selectedLayerId);
      if (el) {
        let target = el;
        if (el.tagName.toLowerCase() === 'g') {
          const inner = el.querySelector('path, polygon, rect, circle, ellipse, line');
          if (inner) target = inner;
        }

        // Apply corner attributes to both el and target
        el.setAttribute('data-tl', updates['data-tl']);
        el.setAttribute('data-tr', updates['data-tr']);
        el.setAttribute('data-bl', updates['data-bl']);
        el.setAttribute('data-br', updates['data-br']);
        el.setAttribute('rx', updates['rx']);
        el.setAttribute('ry', updates['ry']);
        if (target !== el) {
          target.setAttribute('data-tl', updates['data-tl']);
          target.setAttribute('data-tr', updates['data-tr']);
          target.setAttribute('data-bl', updates['data-bl']);
          target.setAttribute('data-br', updates['data-br']);
          target.setAttribute('rx', updates['rx']);
          target.setAttribute('ry', updates['ry']);
        }

        if (isCornerRadiusShape || cornerShapeDefaults) {
          const defaults = cornerShapeDefaults || getShapeCornerDefaults(
            target.getAttribute('data-shape-id') || el.getAttribute('data-shape-id'),
            target.getAttribute('data-shape-title') || el.getAttribute('data-shape-title')
          );
          let x = parseFloat(target.getAttribute('x') || el.getAttribute('x') || (defaults ? defaults.x : 10));
          let y = parseFloat(target.getAttribute('y') || el.getAttribute('y') || (defaults ? defaults.y : 10));
          let w = parseFloat(target.getAttribute('width') || el.getAttribute('width') || (defaults ? defaults.w : 80));
          let h = parseFloat(target.getAttribute('height') || el.getAttribute('height') || (defaults ? defaults.h : 80));

          const newPathData = buildCornerRadiusPath(x, y, w, h, next.tl || 0, next.tr || 0, next.br || 0, next.bl || 0);
          target.setAttribute('d', newPathData);
          updates['d'] = newPathData;
        }

        window.__skipCanvasUpdateForPage = activePageIndex;
        let svgRoot = el;
        while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') svgRoot = svgRoot.parentElement;
        if (svgRoot) {
          const cloneSvg = svgRoot.cloneNode(true);
          cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(e => e.remove());
          const serializer = new XMLSerializer();
          const html = serializer.serializeToString(cloneSvg);
          updateElementAttribute(activePageIndex, selectedLayerId, { ...updates, '__dom_sync__': html });
          return;
        }
      }
    } catch (e) {}

    updateElementAttribute(activePageIndex, selectedLayerId, updates);
  };

  const handleSetIsRadiusLinked = (val) => {
    if (val) {
      const maxR = Math.max(radius.tl || 0, radius.tr || 0, radius.bl || 0, radius.br || 0);
      handleSetRadius({ tl: maxR, tr: maxR, bl: maxR, br: maxR });
      updateElementAttribute(activePageIndex, selectedLayerId, {
        'data-corner-linked': 'true',
        'data-tl': maxR.toString(),
        'data-tr': maxR.toString(),
        'data-bl': maxR.toString(),
        'data-br': maxR.toString(),
        'rx': maxR.toString(),
        'ry': maxR.toString()
      });
    } else {
      updateElementAttribute(activePageIndex, selectedLayerId, 'data-corner-linked', 'false');
    }
  };

  const activeEffects = [];
  if (selectedElementProps['data-effect-drop-shadow'] === 'true') activeEffects.push('Drop Shadow');
  if (selectedElementProps['data-effect-inner-shadow'] === 'true') activeEffects.push('Inner Shadow');
  if (selectedElementProps['data-effect-blur'] === 'true') activeEffects.push('Blur');

  const handleSetActiveEffects = (updater) => {
    const currentActive = [];
    if (selectedElementProps['data-effect-drop-shadow'] === 'true') currentActive.push('Drop Shadow');
    if (selectedElementProps['data-effect-inner-shadow'] === 'true') currentActive.push('Inner Shadow');
    if (selectedElementProps['data-effect-blur'] === 'true') currentActive.push('Blur');

    const next = typeof updater === 'function' ? updater(currentActive) : updater;
    const updates = {};
    const hasDropShadow = next.includes('Drop Shadow');
    const hasInnerShadow = next.includes('Inner Shadow');
    const hasBlur = next.includes('Blur');

    if ((selectedElementProps['data-effect-drop-shadow'] === 'true') !== hasDropShadow) updates['data-effect-drop-shadow'] = hasDropShadow ? 'true' : 'false';
    if ((selectedElementProps['data-effect-inner-shadow'] === 'true') !== hasInnerShadow) updates['data-effect-inner-shadow'] = hasInnerShadow ? 'true' : 'false';
    if ((selectedElementProps['data-effect-blur'] === 'true') !== hasBlur) updates['data-effect-blur'] = hasBlur ? 'true' : 'false';

    if (Object.keys(updates).length > 0) updateElementAttribute(activePageIndex, selectedLayerId, updates);
  };

  const effectSettings = {
    'Drop Shadow': {
      x: parseInt(selectedElementProps['data-effect-drop-shadow-x'] || 2),
      y: parseInt(selectedElementProps['data-effect-drop-shadow-y'] || 2),
      blur: parseInt(selectedElementProps['data-effect-drop-shadow-blur'] || 0),
      spread: parseInt(selectedElementProps['data-effect-drop-shadow-spread'] || 0),
      color: selectedElementProps['data-effect-drop-shadow-color'] || '#000000',
      opacity: parseInt(selectedElementProps['data-effect-drop-shadow-opacity'] || 35),
    },
    'Inner Shadow': {
      x: parseInt(selectedElementProps['data-effect-inner-shadow-x'] || 2),
      y: parseInt(selectedElementProps['data-effect-inner-shadow-y'] || 2),
      blur: parseInt(selectedElementProps['data-effect-inner-shadow-blur'] || 0),
      spread: parseInt(selectedElementProps['data-effect-inner-shadow-spread'] || 0),
      color: selectedElementProps['data-effect-inner-shadow-color'] || '#000000',
      opacity: parseInt(selectedElementProps['data-effect-inner-shadow-opacity'] || 35),
    },
    'Blur': {
      blur: parseFloat(selectedElementProps['data-effect-blur-value'] !== undefined ? selectedElementProps['data-effect-blur-value'] : (selectedElementProps['data-effect-blur-blur'] || 0.3)),
      spread: parseInt(selectedElementProps['data-effect-blur-spread'] || 0),
      clipContent: selectedElementProps['data-effect-blur-clip'] === 'true'
    }
  };

  const handleSetEffectSettings = (updater) => {
    const next = typeof updater === 'function' ? updater(effectSettings) : updater;
    if (!next) return;
    const updates = {};
    ['Drop Shadow', 'Inner Shadow'].forEach(type => {
      const prefix = type === 'Drop Shadow' ? 'drop-shadow' : 'inner-shadow';
      if (next[type] && effectSettings[type]) {
        if (next[type].x !== undefined && effectSettings[type].x !== next[type].x) updates[`data-effect-${prefix}-x`] = next[type].x.toString();
        if (next[type].y !== undefined && effectSettings[type].y !== next[type].y) updates[`data-effect-${prefix}-y`] = next[type].y.toString();
        if (next[type].blur !== undefined && effectSettings[type].blur !== next[type].blur) updates[`data-effect-${prefix}-blur`] = next[type].blur.toString();
        if (next[type].spread !== undefined && effectSettings[type].spread !== next[type].spread) updates[`data-effect-${prefix}-spread`] = next[type].spread.toString();
        if (next[type].color !== undefined && effectSettings[type].color !== next[type].color) updates[`data-effect-${prefix}-color`] = next[type].color;
        if (next[type].opacity !== undefined && effectSettings[type].opacity !== next[type].opacity) updates[`data-effect-${prefix}-opacity`] = next[type].opacity.toString();
      }
    });

    if (next['Blur'] && effectSettings['Blur']) {
      if (next['Blur'].blur !== undefined && effectSettings['Blur'].blur !== next['Blur'].blur) updates[`data-effect-blur-value`] = next['Blur'].blur.toString();
      if (next['Blur'].spread !== undefined && effectSettings['Blur'].spread !== next['Blur'].spread) updates[`data-effect-blur-spread`] = next['Blur'].spread.toString();
      if (next['Blur'].clipContent !== undefined && effectSettings['Blur'].clipContent !== next['Blur'].clipContent) updates[`data-effect-blur-clip`] = next['Blur'].clipContent ? 'true' : 'false';
    }

    if (Object.keys(updates).length > 0) updateElementAttribute(activePageIndex, selectedLayerId, updates);
  };

  return (
    <div className="w-full flex flex-col gap-[0.6vw] font-sans text-gray-800 pt-[0.2vw] pr-[0.2vw] select-none">

      <SectionHeader title="Element Shape Properties" />

      {/* Image Slots / Masking Section */}
      {(isMaskEnabled || slotImage) && (
        <div className="flex flex-col gap-[0.5vw]" data-image-slots="true">
          <div className="flex items-center justify-between pl-[0.5vw] pr-[0.2vw]">
            <span className="text-[0.8vw] font-semibold text-gray-800">Image Slots</span>
            <button
              type="button"
              onClick={handleRemoveMask}
              className="text-[0.7vw] text-red-500 hover:text-red-700 font-medium cursor-pointer transition-colors"
            >
              Remove
            </button>
          </div>

          <div className="pl-[0.5vw] pr-[0.2vw] flex flex-col gap-[0.5vw]">
            <div className="flex flex-col gap-[0.35vw]">
              <span className="text-[0.8vw] text-gray-600 font-medium flex items-center justify-between">
                Image
                {slotImage && (
                  <span className="text-[0.6vw] text-green-600 bg-green-50 px-[0.3vw] py-[0.1vw] rounded font-medium">
                    Filled
                  </span>
                )}
              </span>
              <div
                className={`border border-dashed rounded-[0.5vw] flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group ${
                  slotImage
                    ? 'border-gray-300 hover:border-[#4c5add] bg-gray-50 h-[5vw]'
                    : 'border-[#4c5add] bg-blue-50/30 hover:bg-blue-50 p-[1vw]'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    handleFileChange({ target: { files } });
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {slotImage ? (
                  <>
                    <img src={slotImage} alt={slotImageName || 'Mask'} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size="1.2vw" className="text-white mb-[0.2vw]" />
                      <span className="text-[0.65vw] text-white font-medium">Replace</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size="1vw" className="text-[#4c5add] mb-[0.2vw]" />
                    <span className="text-[0.6vw] text-[#4c5add] font-semibold text-center leading-tight">
                      Drop on Slot<br />or Click
                    </span>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {slotImage && (
              <PropertySlider
                label="Rotation"
                value={slotRotation}
                onChange={(val) => updateRotation(val, true)}
                onPointerUp={syncDomChanges}
                min={-180}
                max={180}
              />
            )}
          </div>
        </div>
      )}

      {(shapeType === 'polygon' || shapeType === 'star') && (
        <div className="flex flex-col gap-[0.35vw]">
          <SectionHeader title="Shape Parameters" />
          <PropertySlider
            label={shapeType === 'polygon' ? "Sides" : "Points"}
            value={parseInt(selectedElementProps['data-count'] || (shapeType === 'polygon' ? (is4SidedShape ? 4 : 3) : 5))}
            onChange={(val) => updateAttr('data-count', val.toString())}
            min={3}
            max={shapeType === 'polygon' ? 50 : 24}
          />
          <PropertySlider
            label="Ratio"
            value={
              shapeType === 'star'
                ? Math.round(parseFloat(
                    selectedElementProps['data-ratio'] !== undefined
                      ? selectedElementProps['data-ratio']
                      : ((selectedElementProps['data-shape-id'] === 'star-fish' || selectedElementProps['data-shape-title'] === 'Star Fish') ? 20 : 40)
                  ))
                : 0
            }
            onChange={(val) => updateAttr('data-ratio', val)}
            disabled={shapeType === 'polygon'}
          />
          <PropertySlider
            label="Corner"
            value={Math.round(parseFloat(
              selectedElementProps['data-radius'] !== undefined
                ? selectedElementProps['data-radius']
                : ((selectedElementProps['data-shape-id'] === 'star-fish' || selectedElementProps['data-shape-title'] === 'Star Fish') ? 25 : 0)
            ))}
            onChange={(val) => updateAttr('data-radius', val)}
            max={50}
          />
        </div>
      )}

      <ShapeAppearanceControls
        backgroundColor={backgroundColor}
        setBackgroundColor={handleSetBackgroundColor}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={setActiveColorPicker}
        colorsOnPage={colorsOnPage}
        radius={radius}
        setRadius={handleSetRadius}
        isRadiusLinked={isRadiusLinked}
        setIsRadiusLinked={handleSetIsRadiusLinked}
        hideCornerRadius={shouldHideCornerRadius}
        activeEffects={activeEffects}
        setActiveEffects={handleSetActiveEffects}
        effectSettings={effectSettings}
        setEffectSettings={handleSetEffectSettings}
        openSubSection={openSubSection}
        setOpenSubSection={setOpenSubSection}
        showDetailedPicker={showDetailedPicker}
        setShowDetailedPicker={setShowDetailedPicker}
      />

      {/* Custom Scroller and Scrub Styling */}
      <style>{`
        .hide-opacity-bar .space-y-\\[1vw\\] > div:nth-child(2) {
          display: none !important;
        }
        input[type='range'] {
          position: relative;
        }
        input[type='range']::before {
          content: ""; position: absolute; top: -0.75vw; bottom: -0.75vw; left: 0; right: 0; cursor: pointer; z-index: 1;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 1.1vw;
          width: 1.1vw;
          border-radius: 50%;
          background: #ffffff;
          border: 0.1vw solid #e5e7eb;
          box-shadow: 0 0.1vw 0.3vw rgba(0,0,0,0.1);
          cursor: pointer;
          position: relative;
          z-index: 2;
        }
        input[type='range'].blue-thumb::-webkit-slider-thumb {
          background: #6366f1;
          border-color: #6366f1;
          height: 0.8vw;
          width: 0.8vw;
        }
        .no-spin::-webkit-inner-spin-button, .no-spin::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        body.is-scrubbing, body.is-scrubbing * {
          cursor: none !important;
          user-select: none !important;
        }
        .hide-cursor, .hide-cursor * {
          cursor: none !important;
        }
        .virtual-scrub-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 100000;
          width: 2vw;
          height: 2vw;
          margin-left: -1vw;
          margin-top: -1vw;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0.1vw 0.2vw rgba(0,0,0,0.3));
        }
      `}</style>
    </div>
  );
};

export { ShapeAppearanceControls };
export default ElementShapesProperties;
