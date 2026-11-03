/**
 * propertiesShared.jsx
 * Common shared utility functions and UI components for editor properties panels.
 */
import React, { useState, useRef, useEffect } from 'react';
import { ElementSlider } from '../LeftActionMenu/Elements/properties/ElementUIControls';

/**
 * Common horizontal scrub helper for dragging to change numbers.
 */
export const handleScrubHelper = (e, initialVal, updateFn, sensitivity = 5) => {
  const sValue = parseFloat(initialVal) || 0;
  let accumulatedDelta = 0;
  let virtualX = e.clientX;
  let virtualY = e.clientY;

  document.body.classList.add('is-scrubbing');

  if (e.pointerId !== undefined) {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { }
  }

  const vCursor = document.createElement('div');
  vCursor.className = 'virtual-scrub-cursor';
  vCursor.style.left = `${virtualX}px`;
  vCursor.style.top = `${virtualY}px`;
  vCursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 15L21 12L18 9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 9L3 12L6 15" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 12H20" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 15L21 12L18 9" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 9L3 12L6 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 12H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  document.body.appendChild(vCursor);

  const onMouseMove = (moveEvent) => {
    const dx = moveEvent.movementX || 0;
    accumulatedDelta += dx;

    virtualX += dx;
    if (virtualX < 0) virtualX = window.innerWidth;
    if (virtualX > window.innerWidth) virtualX = 0;
    vCursor.style.left = `${virtualX}px`;

    const newVal = sValue + Math.round(accumulatedDelta / sensitivity);
    updateFn(newVal.toString());
  };

  const onMouseUp = (moveEvent) => {
    if (moveEvent.pointerId !== undefined) {
      try { moveEvent.target.releasePointerCapture(moveEvent.pointerId); } catch { }
    }
    if (vCursor.parentNode) vCursor.parentNode.removeChild(vCursor);
    document.body.classList.remove('is-scrubbing');
    window.removeEventListener('pointermove', onMouseMove);
    window.removeEventListener('pointerup', onMouseUp);
  };

  window.addEventListener('pointermove', onMouseMove);
  window.addEventListener('pointerup', onMouseUp);
};

/**
 * Format raw byte size into human readable string (KB, MB, GB).
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Normalize any color string (hex, rgb, rgb) to standard lowercased 6-digit hex.
 */
export const normalizeHex = (colorStr) => {
  if (!colorStr || colorStr === 'none' || colorStr === 'transparent' || colorStr.startsWith('url(')) return null;
  if (colorStr.startsWith('#')) {
    if (colorStr.length === 4) {
      return '#' + colorStr[1] + colorStr[1] + colorStr[2] + colorStr[2] + colorStr[3] + colorStr[3];
    }
    return colorStr.toLowerCase();
  }
  if (colorStr.startsWith('rgb')) {
    const nums = colorStr.match(/\d+/g);
    if (nums && nums.length >= 3) {
      const r = parseInt(nums[0], 10).toString(16).padStart(2, '0');
      const g = parseInt(nums[1], 10).toString(16).padStart(2, '0');
      const b = parseInt(nums[2], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toLowerCase();
    }
  }
  return colorStr.toLowerCase();
};

/**
 * Safely parse integer attribute with default value.
 */
export const getIntAttr = (node, attr, defVal = 0) => {
  const val = node?.getAttribute?.(attr);
  if (val === null || val === undefined || val === '') return defVal;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defVal : parsed;
};

/**
 * Safely parse float attribute with default value.
 */
export const getFloatAttr = (node, attr, defVal = 0) => {
  const val = node?.getAttribute?.(attr);
  if (val === null || val === undefined || val === '') return defVal;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? defVal : parsed;
};

/**
 * Common reusable PropertySlider with label, scrubbing, and manual input.
 */
export const PropertySlider = ({ label, value, onChange, min = 0, max = 100, disabled = false, unit = '', onPointerUp }) => {
  const [localVal, setLocalVal] = useState(value);
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setLocalVal(value);
    }
  }, [value]);

  const handleManualInput = (val) => {
    if (disabled) return;
    setLocalVal(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      onChange(val);
    }
  };

  const handleBlur = () => {
    isFocused.current = false;
    if (disabled) return;
    let num = parseInt(localVal, 10);
    if (isNaN(num)) num = min;

    const corrected = Math.min(Math.max(num, min), max);
    setLocalVal(corrected);
    onChange(corrected.toString());
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  return (
    <div
      className={`flex items-center gap-[0.8vw] py-[0.4vw] transition-opacity duration-200 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      onPointerUp={onPointerUp}
    >
      <span
        className="text-[0.78vw] font-semibold text-gray-700 w-[4.5vw] flex-shrink-0 cursor-ew-resize select-none hover:text-[#E05638] transition-colors"
        onPointerDown={(e) => {
          handleScrubHelper(e, value, (v) => {
            const num = parseFloat(v);
            const corrected = Math.min(Math.max(num, min), max);
            onChange(corrected.toString());
          });
        }}
      >
        {label} :
      </span>
      <div className="flex-grow flex items-center gap-[0.8vw]">
        <div className="flex-1">
          <ElementSlider
            min={min}
            max={max}
            step={1}
            value={value || 0}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <div className="w-[3.2vw] h-[1.8vw] flex items-center justify-center bg-white border border-gray-200 rounded-[0.4vw] shadow-2xs overflow-hidden">
          <input
            type="number"
            min={min}
            max={max}
            value={localVal === undefined ? '' : localVal}
            onChange={(e) => handleManualInput(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className="w-full text-center text-[0.8vw] text-gray-700 font-semibold outline-none bg-transparent no-spin disabled:text-gray-400"
          />
          {unit && <span className="text-[0.68vw] text-gray-400 font-semibold pr-[0.2vw]">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

