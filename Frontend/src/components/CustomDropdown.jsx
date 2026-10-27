// Frontend/src/components/CustomDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomDropdown
 * A premium, reusable dropdown component designed for forms, filters, and toolbars.
 *
 * Props:
 * - options: Array<string | { value: string|number, label: string, icon?: React.ReactNode, disabled?: boolean, description?: string }>
 * - value: string | number
 * - onChange: (value: string | number, option?: object) => void
 * - placeholder?: string
 * - label?: string
 * - required?: boolean
 * - width?: string (e.g. '100%', '16vw', 'w-full')
 * - menuWidth?: string (default 'w-full')
 * - className?: string
 * - buttonClassName?: string
 * - menuClassName?: string
 * - itemClassName?: string
 * - align?: 'left' | 'right'
 * - disabled?: boolean
 */
export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  label,
  required = false,
  width = 'w-full',
  menuWidth = 'w-full',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  itemClassName = '',
  align = 'left',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options to objects with value & label
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    if (option.disabled) return;
    onChange?.(option.value, option);
    setIsOpen(false);
  };

  const isWidthClass = width.startsWith('w-');
  const styleWidth = !isWidthClass ? { width } : {};

  return (
    <div
      ref={dropdownRef}
      className={`relative select-none ${isWidthClass ? width : ''} ${className} ${isOpen ? 'z-[1001]' : 'z-10'}`}
      style={styleWidth}
    >
      {label && (
        <label className="block text-[11px] sm:text-[clamp(10px,0.7vw,12px)] font-semibold text-stone-700 uppercase tracking-wide mb-1.5">
          {label} {required && <span className="text-[#ec5137]">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 sm:px-[clamp(12px,0.9vw,16px)] sm:py-[clamp(8px,0.55vh,12px)] rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] border transition-all text-left cursor-pointer bg-white ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-stone-100 border-stone-200'
            : isOpen
            ? 'border-[#ec5137] ring-2 ring-[#ec5137]/15 shadow-xs'
            : 'border-stone-300 hover:border-stone-400 shadow-2xs'
        } ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="shrink-0 text-stone-500">{selectedOption.icon}</span>
          )}
          <span
            className={`truncate text-xs sm:text-[clamp(12px,0.82vw,14px)] font-medium ${
              selectedOption ? 'text-stone-900' : 'text-stone-400'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 sm:w-[clamp(14px,0.9vw,16px)] sm:h-[clamp(14px,0.9vw,16px)] text-stone-400 shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#ec5137]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            menuWidth === 'w-full' ? 'w-full' : ''
          } bg-white rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] shadow-xl border border-stone-200/90 z-[9999] overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
          style={menuWidth !== 'w-full' ? { width: menuWidth } : {}}
          role="listbox"
        >
          <div className="max-h-[clamp(180px,18vw,280px)] overflow-y-auto px-1 space-y-0.5 custom-scrollbar">
            {normalizedOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-stone-400 text-center">
                No options available
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between px-3 py-2 sm:px-[clamp(10px,0.75vw,14px)] sm:py-[clamp(6px,0.45vh,10px)] rounded-lg text-xs sm:text-[clamp(12px,0.82vw,14px)] text-left font-medium transition-all cursor-pointer ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-orange-50 text-[#c23d26] font-semibold'
                        : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                    } ${itemClassName}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.icon && (
                        <span className={`shrink-0 ${isSelected ? 'text-[#ec5137]' : 'text-stone-400'}`}>
                          {opt.icon}
                        </span>
                      )}
                      <div className="truncate">
                        <span className="block truncate">{opt.label}</span>
                        {opt.description && (
                          <span className="block text-[10px] text-stone-400 font-normal truncate">
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 sm:w-[clamp(13px,0.85vw,15px)] sm:h-[clamp(13px,0.85vw,15px)] text-[#ec5137] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
