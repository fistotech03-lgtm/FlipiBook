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
      className={`relative block w-[1.8vw] h-[1vw] rounded-[1vw] transition-all duration-200 ease-in-out shadow-[inset_0_0.05vw_0.1vw_rgba(0,0,0,0.3)] outline-none shrink-0 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isChecked ? 'bg-[#4A3AFF]' : 'bg-[#bbbbbb]'} ${className}`}
    >
      <div
        className={`absolute top-[0.1vw] w-[0.8vw] h-[0.8vw] bg-white rounded-full transition-all duration-200 ease-in-out shadow-[0_0.05vw_0.1vw_rgba(0,0,0,0.4)] ${isChecked ? 'left-[0.9vw]' : 'left-[0.1vw]'}`}
      />
    </button>
  );
};

export default Switch;
