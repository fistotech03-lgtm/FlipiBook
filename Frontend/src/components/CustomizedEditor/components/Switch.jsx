import React from 'react';

/**
 * Reusable Switch toggle component for CustomizedEditor panels & settings.
 */
const Switch = ({ checked, enabled, onChange, disabled = false, className = '' }) => {
  const isChecked = Boolean(checked !== undefined ? checked : enabled);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        if (onChange) onChange(!isChecked);
      }}
      className={`relative block w-[1.8vw] h-[1vw] min-w-[32px] min-h-[18px] rounded-[1vw] border-2 transition-all duration-200 ease-in-out outline-none shrink-0 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isChecked ? 'bg-[#E05638] border-[#E05638]' : 'bg-white border-[#E05638]'} ${className}`}
    >
      <div
        className={`absolute top-[0.1vw] w-[0.8vw] h-[0.8vw] min-w-[12px] min-h-[12px] rounded-full transition-all duration-200 ease-in-out shadow-xs ${isChecked ? 'left-[0.9vw] bg-white' : 'left-[0.1vw] bg-[#E05638]'}`}
      />
    </button>
  );
};

export default Switch;
