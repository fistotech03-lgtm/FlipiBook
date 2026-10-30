import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const PremiumDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  width = '9vw', 
  menuWidth = 'w-full',
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  isFont = false,
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative dropdown-container ${className} ${isOpen ? 'z-[1001]' : ''}`} ref={dropdownRef} style={{ width }}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[2.2vw] min-h-[32px] bg-white rounded-[0.45vw] px-[0.65vw] py-[0.45vw] flex items-center justify-between shadow-2xs transition-all cursor-pointer select-none ${
          isOpen ? 'border-2 border-[#E05638] shadow-xs' : 'border border-gray-200 hover:border-gray-300'
        } group ${buttonClassName}`}
      >
        <span 
          className="text-[0.78vw] font-medium text-gray-800 text-left flex-1 truncate"
          style={isFont ? { fontFamily: value } : {}}
        >
          {value || placeholder}
        </span>
        <ChevronDown className={`w-[0.9vw] h-[0.9vw] min-w-[14px] min-h-[14px] text-gray-500 transition-transform duration-200 ml-[0.3vw] flex-shrink-0 ${isOpen ? 'rotate-180 text-[#E05638]' : 'group-hover:text-gray-700'}`} />
      </button>
      
      {isOpen && (
        <div 
          className={`absolute top-full mt-[0.35vw] ${align === 'right' ? 'right-0' : 'left-0'} ${menuWidth === 'w-full' ? 'w-full' : ''} bg-white rounded-[0.55vw] shadow-xl border border-gray-100 z-[9999] overflow-hidden py-[0.3vw] animate-in fade-in zoom-in-95 duration-150`}
          style={menuWidth !== 'w-full' ? { width: menuWidth, zIndex: 9999 } : { zIndex: 9999 }}
        >
          <div className="max-h-[14vw] overflow-y-auto custom-scrollbar">
            {options.map((opt) => {
              const optionValue = typeof opt === 'string' ? opt : opt.value;
              const optionLabel = typeof opt === 'string' ? opt : opt.label;
              const isSelected = String(value).toLowerCase() === String(optionValue).toLowerCase();
              
              return (
                <button
                  key={optionValue}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    if (!opt.disabled) {
                      onChange(optionValue);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full text-left px-[0.85vw] py-[0.45vw] text-[0.78vw] flex items-center justify-between font-medium transition-colors cursor-pointer ${
                    opt.disabled 
                      ? 'opacity-40 cursor-not-allowed' 
                      : isSelected 
                        ? 'text-[#E05638] bg-[#FFF2EE] font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={isFont ? { fontFamily: optionValue } : {}}
                >
                  <span className="truncate">{optionLabel}</span>
                  {isSelected && (
                    <Check className="w-[0.85vw] h-[0.85vw] min-w-[13px] min-h-[13px] text-[#E05638] shrink-0 ml-[0.4vw]" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumDropdown;
