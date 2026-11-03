import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { X } from 'lucide-react';

export const AdjustmentIcon = ({ className = "w-[0.95vw] h-[0.95vw]" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="3" x2="5" y2="21" />
    <circle cx="5" cy="8.5" r="2.5" fill="white" stroke="currentColor" strokeWidth="2.2" />
    <line x1="12" y1="3" x2="12" y2="21" />
    <circle cx="12" cy="15.5" r="2.5" fill="white" stroke="currentColor" strokeWidth="2.2" />
    <line x1="19" y1="3" x2="19" y2="21" />
    <circle cx="19" cy="8.5" r="2.5" fill="white" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);

const TONE_CONTROLS = [
  { key: 'exposure', label: 'Exposure', min: -100, max: 100 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
  { key: 'highlights', label: 'Highlights', min: -100, max: 100 },
  { key: 'shadows', label: 'Shadows', min: -100, max: 100 }
];

const COLOR_CONTROLS = [
  { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
  { key: 'temperature', label: 'Temperature', min: -100, max: 100 },
  { key: 'tint', label: 'Tint', min: -100, max: 100 }
];

const ModalSlider = ({ label, value = 0, onChange, onReset, min = -100, max = 100 }) => {
  const num = parseFloat(value) || 0;
  const percentage = ((num - min) / (max - min)) * 100;
  const isNegative = num < 0;
  const activeLeft = isNegative ? percentage : 50;
  const activeWidth = Math.abs(percentage - 50);

  return (
    <div className="flex flex-col gap-[0.2vw]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[0.35vw]">
          <span className="text-[0.78vw] font-medium text-gray-800">{label}</span>
          <button
            type="button"
            onClick={onReset}
            className={`transition-colors p-[0.1vw] cursor-pointer ${num !== 0 ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 hover:text-gray-500'}`}
            title={`Reset ${label}`}
          >
            <Icon icon="ix:reset" className="w-[0.75vw] h-[0.75vw]" />
          </button>
        </div>
        <span className="text-[0.75vw] font-medium text-gray-500 tabular-nums">
          {num > 0 ? `+${num}` : num}
        </span>
      </div>

      <div className="relative flex items-center h-[1.3vw] w-full group">
        {/* Inactive track */}
        <div className="absolute w-full h-[0.25vw] bg-[#E2E8F0] rounded-full" />

        {/* Center mark indicator (0%) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[0.12vw] h-[0.5vw] bg-gray-300 rounded-full pointer-events-none" />

        {/* Active colored track */}
        {num !== 0 && (
          <div
            className="absolute h-[0.25vw] bg-[#4D47FF] rounded-full pointer-events-none"
            style={{
              left: `${activeLeft}%`,
              width: `${activeWidth}%`,
              borderTopLeftRadius: isNegative ? '999px' : '0',
              borderBottomLeftRadius: isNegative ? '999px' : '0',
              borderTopRightRadius: isNegative ? '0' : '999px',
              borderBottomRightRadius: isNegative ? '0' : '999px',
            }}
          />
        )}

        {/* Knob */}
        <div
          className="absolute w-[0.9vw] h-[0.9vw] bg-[#4D47FF] rounded-full pointer-events-none shadow-[0_0.1vw_0.4vw_rgba(77,71,255,0.45)] group-hover:scale-110 transition-transform duration-100"
          style={{
            left: `calc(${percentage}% - 0.45vw)`,
            border: '0.12vw solid #ffffff'
          }}
        />

        {/* Interactive range input */}
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={num}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="absolute w-full h-full opacity-0 cursor-pointer m-0 z-10"
        />
      </div>
    </div>
  );
};

const ImageAdjustmentModal = ({
  isOpen,
  onClose,
  filters = {},
  onChange,
  onResetAll
}) => {
  const containerRef = useRef(null);

  // Dragging state for popup (exact behavior like ColorPicker)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const isDraggingPopup = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, scale: 1 });
  const [isPopupDragging, setIsPopupDragging] = useState(false);

  const handlePopupPointerDown = (e) => {
    // Avoid dragging if the user is interacting with interactive controls
    const isInteractive = e.target.closest('button, input, [role="button"], .cursor-pointer, .cursor-text, .cursor-crosshair, .cursor-ew-resize');
    if (isInteractive) return;

    let scale = 1;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const offsetWidth = containerRef.current.offsetWidth;
      if (offsetWidth > 0) scale = rect.width / offsetWidth;
    }

    isDraggingPopup.current = true;
    setIsPopupDragging(true);

    dragStartRef.current = {
      x: e.clientX - (dragPosition.x * scale),
      y: e.clientY - (dragPosition.y * scale),
      scale
    };

    const handlePointerMove = (moveEvent) => {
      if (!isDraggingPopup.current) return;
      const s = dragStartRef.current.scale;
      const newX = (moveEvent.clientX - dragStartRef.current.x) / s;
      const newY = (moveEvent.clientY - dragStartRef.current.y) / s;
      setDragPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      isDraggingPopup.current = false;
      setIsPopupDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (isDraggingPopup.current) return;
      if (containerRef.current && containerRef.current.contains(e.target)) {
        return;
      }
      if (e.target.closest('[data-adjustment-trigger]')) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentFilters = {
    exposure: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
    ...filters
  };

  const hasAnyFilter = Object.values(currentFilters).some((val) => val !== 0);

  const combinedStyle = {
    top: '50%',
    right: '19.5vw',
    transform: `translateY(-50%) translate(${dragPosition.x}px, ${dragPosition.y}px)`,
    ...(isPopupDragging ? { transition: 'none', cursor: 'grabbing' } : {})
  };

  return createPortal(
    <div
      ref={containerRef}
      className="fixed z-[5000] w-[19vw] min-w-[280px] p-[1.2vw] rounded-[0.8vw] bg-white shadow-[0_1vw_3vw_-0.5vw_rgba(0,0,0,0.2)] border border-gray-400 animate-in fade-in zoom-in-95 duration-200 select-none font-sans pointer-events-auto cursor-grab active:cursor-grabbing"
      style={combinedStyle}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={handlePopupPointerDown}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between w-full mb-[1vw]">
        <div className="flex items-center gap-[0.4vw] px-[0.6vw] py-[0.3vw] bg-gray-50 border border-gray-200 rounded-[0.4vw]">
          <AdjustmentIcon className="w-[0.85vw] h-[0.85vw] text-gray-800" />
          <span className="text-[0.82vw] font-semibold text-gray-900">Adjustment</span>
        </div>

        <div className="flex items-center gap-[0.4vw]">
          <button
            type="button"
            onClick={onResetAll}
            className={`flex items-center gap-[0.2vw] px-[0.5vw] py-[0.25vw] text-[0.72vw] font-medium rounded-[0.3vw] border transition-colors cursor-pointer ${
              hasAnyFilter
                ? 'text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border-gray-300 shadow-2xs'
                : 'text-gray-400 bg-gray-50/50 border-gray-200 hover:text-gray-600'
            }`}
            title="Reset all adjustments"
          >
            <Icon icon="ix:reset" className="w-[0.75vw] h-[0.75vw]" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-[0.2vw] rounded-[0.4vw] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X size="1.1vw" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[1.1vw]">
        {/* Section 1: Light & Tone */}
        <div>
          <div className="flex items-center gap-[0.8vw] mb-[0.6vw]">
            <span className="text-[0.82vw] font-semibold text-gray-900 whitespace-nowrap">Light & Tone</span>
            <div className="h-[0.0925vw] bg-gray-200 flex-1" />
          </div>
          <div className="flex flex-col gap-[0.55vw]">
            {TONE_CONTROLS.map(({ key, label, min, max }) => (
              <ModalSlider
                key={key}
                label={label}
                value={currentFilters[key]}
                onChange={(val) => onChange(key, val)}
                onReset={() => onChange(key, 0)}
                min={min}
                max={max}
              />
            ))}
          </div>
        </div>

        {/* Section 2: Color & Detail */}
        <div>
          <div className="flex items-center gap-[0.8vw] mb-[0.6vw]">
            <span className="text-[0.82vw] font-semibold text-gray-900 whitespace-nowrap">Color & Detail</span>
            <div className="h-[0.0925vw] bg-gray-200 flex-1" />
          </div>
          <div className="flex flex-col gap-[0.55vw]">
            {COLOR_CONTROLS.map(({ key, label, min, max }) => (
              <ModalSlider
                key={key}
                label={label}
                value={currentFilters[key]}
                onChange={(val) => onChange(key, val)}
                onReset={() => onChange(key, 0)}
                min={min}
                max={max}
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageAdjustmentModal;
