/**
 * propertiesShared.jsx
 * Common shared utility functions and UI components for editor properties panels.
 */
import React, { useState, useRef, useEffect } from 'react';
import { ElementSlider } from '../../LeftActionMenu/Elements/properties/ElementUIControls';

/**
 * Common horizontal scrub helper for dragging to change numbers.
 */
import { handleScrubHelper } from '../../utils/scrubValue';
export { handleScrubHelper };

/**
 * Percentage input:
 * - Hovering the number shows the normal cursor; clicking selects the full number for inline editing on the same background while keeping `%` visible.
 * - Hovering `%` shows the ew-resize cursor and dragging adjusts the value.
 */
export const ScrubPercentInput = ({
  value = 100,
  onChange,
  min = 0,
  max = 100,
  title = 'Drag horizontally on % to adjust opacity',
  className = 'flex items-center select-none px-[0.2vw]',
  textClassName = 'text-[0.8vw] font-medium text-gray-700',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isEditing) {
      setDraft(String(value));
    }
  }, [value, isEditing]);

  const commit = () => {
    setIsEditing(false);
    const num = parseInt(draft, 10);
    if (!isNaN(num)) {
      const clamped = Math.min(Math.max(num, min), max);
      setDraft(String(clamped));
      onChange(clamped);
    } else {
      setDraft(String(value));
    }
  };

  const displayText = isEditing ? draft : String(value);
  const charCount = Math.max(1, displayText.length);

  return (
    <div className={className.replace(/\bcursor-ew-resize\b/g, '').replace(/\bhover:bg-gray-50\b/g, '')}>
      <input
        ref={inputRef}
        type="text"
        value={displayText}
        onFocus={(e) => {
          setIsEditing(true);
          setDraft(String(value));
          requestAnimationFrame(() => e.target?.select?.());
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.target?.select?.();
        }}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit();
            e.target.blur();
          }
          if (e.key === 'Escape') {
            setIsEditing(false);
            setDraft(String(value));
            e.target.blur();
          }
        }}
        onPointerDown={(e) => e.stopPropagation()}
        style={{ width: `${charCount}ch` }}
        className={`${textClassName} bg-transparent border-none outline-none text-right p-0 m-0 cursor-default focus:cursor-text`}
        maxLength={3}
      />
      <span
        className={`${textClassName} cursor-ew-resize select-none`}
        title={title}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          handleScrubHelper(
            e,
            value,
            (val) => {
              const num = parseInt(val, 10);
              onChange(Math.min(Math.max(isNaN(num) ? value : num, min), max));
            },
            5
          );
        }}
      >
        %
      </span>
    </div>
  );
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
        className="text-[0.78vw] font-semibold text-gray-700 min-w-[5.2vw] whitespace-nowrap flex-shrink-0 cursor-ew-resize select-none hover:text-[#E05638] transition-colors"
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

