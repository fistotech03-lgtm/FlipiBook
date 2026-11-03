import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * ElementToggle - Signature toggle switch matching reference design.
 * OFF: White pill, #E05638 border, solid #E05638 circle on the left.
 * ON:  Solid #E05638 pill, #E05638 border, solid White circle on the right.
 */
export const ElementToggle = ({
  checked,
  enabled,
  onChange,
  disabled = false,
  title = '',
  className = ''
}) => {
  const isChecked = checked !== undefined ? Boolean(checked) : Boolean(enabled);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onChange) onChange(!isChecked);
      }}
      className={`relative w-[2.2vw] h-[1.2vw] min-w-[34px] min-h-[19px] flex items-center rounded-full border-2 cursor-pointer transition-all duration-200 select-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${
        isChecked
          ? 'bg-[#E05638] border-[#E05638]'
          : 'bg-white border-[#E05638]'
      } ${className}`}
    >
      <span
        className={`block w-[0.8vw] h-[0.8vw] min-w-[13px] min-h-[13px] rounded-full shadow-sm transform transition-all duration-200 ${
          isChecked
            ? 'translate-x-[0.95vw] bg-white'
            : 'translate-x-0 bg-[#E05638]'
        }`}
        style={{
          marginLeft: '0.12vw'
        }}
      />
    </button>
  );
};

/**
 * ElementSlider - Signature process dragging pointer slider.
 * Track: Thin bar with active progress filled in #E05638 and remaining in #E5E7EB.
 * Thumb: White circular disc with #E05638 border and soft drop shadow.
 */
export const ElementSlider = ({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className = '',
  style = {},
  onPointerUp,
  ...rest
}) => {
  const numVal = parseFloat(value) || 0;
  const pct = Math.max(0, Math.min(100, ((numVal - min) / ((max - min) || 1)) * 100));

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={numVal}
      disabled={disabled}
      onPointerUp={onPointerUp}
      onChange={(e) => {
        if (!onChange) return;
        const rawVal = e.target.value;
        const parsed = step && step.toString().includes('.') ? parseFloat(rawVal) : Number(rawVal);
        try {
          const fnStr = typeof onChange === 'function' ? onChange.toString() : '';
          if (fnStr.includes('.target')) {
            onChange(e, parsed);
            return;
          }
        } catch (_) {}
        onChange(parsed, e);
      }}
      className={`element-slider-input w-full h-[0.25vw] min-h-[3.5px] appearance-none cursor-pointer rounded-full outline-none disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[0.85vw] [&::-webkit-slider-thumb]:min-w-[13px] [&::-webkit-slider-thumb]:h-[0.85vw] [&::-webkit-slider-thumb]:min-h-[13px] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#E05638] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-[0.85vw] [&::-moz-range-thumb]:min-w-[13px] [&::-moz-range-thumb]:h-[0.85vw] [&::-moz-range-thumb]:min-h-[13px] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#E05638] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md ${className}`}
      style={{
        background: disabled
          ? '#e5e7eb'
          : `linear-gradient(to right, #E05638 0%, #E05638 ${pct}%, #E5E7EB ${pct}%, #E5E7EB 100%)`,
        ...style
      }}
      {...rest}
    />
  );
};

/**
 * ElementDropdown / ElementSelect - Signature dropdown component.
 * Closed: Rounded button with gray border and ChevronDown.
 * Open: Active button with bold #E05638 border and ChevronUp.
 * Menu: Floating white card with soft shadow.
 * Selected item: Light peach background (#FFF2EE), #E05638 text, and orange Checkmark on right.
 */
export const ElementDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  isFont = false,
  align = 'left'
}) => {
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

  // Normalize options into { label, value }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        label: opt.label !== undefined ? opt.label : opt.name || opt.value,
        value: opt.value !== undefined ? opt.value : opt.label
      };
    }
    return { label: String(opt), value: opt };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value).toLowerCase() === String(value).toLowerCase()
  ) || normalizedOptions.find((opt) => String(opt.value) === String(value)) || null;

  const displayLabel = selectedOption?.label || value || placeholder;

  return (
    <div ref={containerRef} className={`relative w-full ${className} ${isOpen ? 'z-[105]' : ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full h-[2.4vw] min-h-[32px] flex items-center justify-between bg-white px-[0.65vw] rounded-[0.45vw] text-[0.78vw] font-semibold transition-all cursor-pointer shadow-2xs select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isOpen
            ? 'border-2 border-[#E05638] shadow-xs'
            : 'border border-gray-200 hover:border-gray-300'
        } ${buttonClassName}`}
      >
        <span
          className="truncate font-semibold text-gray-800 text-left"
          style={isFont && value ? { fontFamily: `'${value}', sans-serif` } : {}}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-[0.9vw] h-[0.9vw] min-w-[14px] min-h-[14px] text-gray-500 transition-transform duration-200 flex-shrink-0 ml-[0.3vw] ${
            isOpen ? 'rotate-180 text-[#E05638]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-[0.35vw] bg-white border border-gray-100 rounded-[0.55vw] shadow-xl overflow-hidden z-[110] flex flex-col py-[0.3vw] max-h-[14vw] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
          style={align === 'right' ? { right: 0, left: 'auto', minWidth: '100%' } : {}}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value).toLowerCase() === String(value).toLowerCase() || String(opt.value) === String(value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-[0.85vw] py-[0.45vw] text-[0.78vw] font-semibold transition-colors text-left flex items-center justify-between cursor-pointer group ${
                  isSelected
                    ? 'text-[#E05638] bg-[#FFF2EE] font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isFont ? { fontFamily: `'${opt.value}', sans-serif` } : {}}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="w-[0.85vw] h-[0.85vw] min-w-[13px] min-h-[13px] text-[#E05638] flex-shrink-0 ml-[0.4vw]" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ElementSelect = ElementDropdown;

export default {
  ElementToggle,
  ElementSlider,
  ElementDropdown,
  ElementSelect
};
