import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pipette, X } from 'lucide-react';

// Helpers
const hexToHsv = (hex, currentHue = 0) => {
  if (!hex || typeof hex !== 'string') return { h: currentHue, s: 0, v: 100 };
  let color = hex.startsWith('#') ? hex.substring(1) : hex;
  if (color.length === 3) color = color.split('').map((c) => c + c).join('');
  if (color.length !== 6) return { h: currentHue, s: 0, v: 100 };

  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  if (isNaN(r) || isNaN(g) || isNaN(b)) return { h: currentHue, s: 0, v: 100 };

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  let h = currentHue;

  if (max !== min && d > 0.0001) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = h * 60;
  }
  return { h, s: s * 100, v: v * 100 };
};

const hsvToHex = ({ h, s, v }) => {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h <= 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n) =>
    Math.round(Math.max(0, Math.min(255, (n + m) * 255)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export default function CustomColorPicker({
  color = '#FFFFFF',
  onChange,
  opacity = 100,
  onOpacityChange,
  onClose,
  className = '',
  style
}) {
  const [hsv, setHsv] = useState(() => hexToHsv(color, 0));
  const currentOpacity = typeof opacity === 'number' && !isNaN(opacity) ? opacity : 100;
  const pickerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const hsvRef = useRef(hsv);
  hsvRef.current = hsv;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        if (onClose) onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (isDraggingRef.current) return;
    setHsv((prev) => hexToHsv(color, prev?.h ?? 0));
  }, [color]);

  const handleSaturationChange = useCallback(
    (e, container) => {
      if (!container) return;
      const { width, height, left, top } = container.getBoundingClientRect();
      const x = Math.min(Math.max((e.clientX - left) / width, 0), 1);
      const y = Math.min(Math.max((e.clientY - top) / height, 0), 1);

      const curH = hsvRef.current?.h ?? 0;
      const newHsv = { h: curH, s: x * 100, v: (1 - y) * 100 };
      setHsv(newHsv);
      if (onChange) onChange(hsvToHex(newHsv));
    },
    [onChange]
  );

  const handleHueChange = useCallback(
    (e, container) => {
      if (!container) return;
      const { height, top } = container.getBoundingClientRect();
      const y = Math.min(Math.max((e.clientY - top) / height, 0), 1);

      const curS = hsvRef.current?.s ?? 100;
      const curV = hsvRef.current?.v ?? 100;
      const newHsv = { h: Math.min(360, Math.max(0, y * 360)), s: curS, v: curV };
      setHsv(newHsv);
      if (onChange) onChange(hsvToHex(newHsv));
    },
    [onChange]
  );

  const useDrag = (handler) => {
    const containerRef = useRef(null);
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      if (containerRef.current) {
        handlerRef.current(e, containerRef.current);
      }

      const onMouseMove = (moveEvent) => {
        if (isDraggingRef.current && containerRef.current) {
          moveEvent.preventDefault();
          handlerRef.current(moveEvent, containerRef.current);
        }
      };

      const onMouseUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    return { onMouseDown, ref: containerRef };
  };

  const satDrag = useDrag(handleSaturationChange);
  const hueDrag = useDrag(handleHueChange);

  const hueColor = hsvToHex({ h: hsv.h, s: 100, v: 100 });

  return (
    <div
      ref={pickerRef}
      className={`z-50 w-[15.5vw] min-w-[240px] bg-white rounded-[0.8vw] shadow-[0_0.5vw_2vw_-0.25vw_rgba(0,0,0,0.18)] border border-gray-200 p-[0.9vw] animate-in fade-in zoom-in-95 duration-150 select-none font-sans ${className}`}
      style={style}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-[0.8vw]">
        <div className="flex items-center gap-[0.45vw] flex-grow">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Colors Pallet</span>
          <div className="h-[1px] w-full bg-gray-200"></div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-[0.25vw] rounded-[0.35vw] cursor-pointer text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all ml-[0.3vw]"
          >
            <X className="w-[0.9vw] h-[0.9vw]" />
          </button>
        )}
      </div>

      {/* Main Gradient Box + Vertical Hue Slider */}
      <div className="flex gap-[0.65vw] h-[9vw] mb-[0.9vw]">
        {/* Saturation/Value Box */}
        <div
          ref={satDrag.ref}
          onMouseDown={satDrag.onMouseDown}
          className="flex-1 rounded-[0.5vw] relative cursor-crosshair overflow-hidden border border-black/5"
          style={{ backgroundColor: hueColor }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>

          {/* Circular Thumb */}
          <div
            className="absolute w-[0.85vw] h-[0.85vw] border-2 border-white rounded-full shadow-lg -ml-[0.425vw] -mt-[0.425vw] pointer-events-none"
            style={{
              left: `${Math.max(0, Math.min(100, hsv.s))}%`,
              top: `${Math.max(0, Math.min(100, 100 - hsv.v))}%`
            }}
          />
        </div>

        {/* Vertical Hue Slider */}
        <div
          ref={hueDrag.ref}
          onMouseDown={hueDrag.onMouseDown}
          className="w-[1.1vw] rounded-full relative cursor-pointer shadow-inner"
          style={{
            background:
              'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
          }}
        >
          {/* Thumb */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[1.3vw] h-[1.3vw] pointer-events-none"
            style={{
              top: `${Math.max(0, Math.min(100, (hsv.h / 360) * 100))}%`,
              marginTop: '-0.65vw'
            }}
          >
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[0.7vw] h-[0.7vw] bg-white border-2 border-white rounded-full shadow-md">
              <div
                className="w-full h-full rounded-full border border-gray-200"
                style={{ backgroundColor: hsvToHex(hsv) }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-[0.75vw]">
        {/* Hex Input */}
        <div className="flex items-center justify-between">
          <span className="text-[0.76vw] font-semibold text-gray-800">Color Code :</span>
          <div className="flex items-center gap-[0.35vw] border-2 border-gray-200 rounded-[0.45vw] px-[0.45vw] py-[0.25vw] w-[7.5vw] focus-within:border-[#5d5efc] transition-all bg-white">
            <span className="text-gray-400 text-[0.68vw] font-medium">#</span>
            <input
              type="text"
              value={color && typeof color === 'string' ? color.replace('#', '').toUpperCase() : ''}
              onChange={(e) => onChange && onChange(`#${e.target.value}`)}
              className="w-full text-[0.72vw] font-semibold text-gray-800 outline-none uppercase"
              maxLength={6}
            />
            <button
              type="button"
              className="text-gray-500 hover:text-[#5d5efc] transition-colors p-[0.1vw] cursor-pointer"
              onClick={async () => {
                if (!window.EyeDropper) {
                  alert('Your browser does not support the EyeDropper API');
                  return;
                }
                const eyeDropper = new window.EyeDropper();
                try {
                  const result = await eyeDropper.open();
                  if (onChange) onChange(result.sRGBHex.toUpperCase());
                } catch (_) {}
              }}
              title="EyeDropper"
            >
              <Pipette className="w-[0.9vw] h-[0.9vw]" />
            </button>
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center justify-between">
          <span className="text-[0.76vw] font-semibold text-gray-800">Opacity :</span>
          <div className="flex items-center gap-[0.5vw] w-[7.5vw]">
            <div className="relative flex-1 h-[0.32vw] bg-gray-200 rounded-full">
              <div
                className="absolute top-0 left-0 h-full bg-[#7c5dff] rounded-full"
                style={{ width: `${currentOpacity}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentOpacity}
                onChange={(e) => onOpacityChange && onOpacityChange(parseInt(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-[0.8vw] h-[0.8vw] bg-[#7c5dff] border-2 border-white rounded-full shadow-md pointer-events-none"
                style={{ left: `${currentOpacity}%`, marginLeft: '-0.4vw' }}
              ></div>
            </div>
            <span className="text-[0.66vw] font-mono font-medium text-gray-600 min-w-[2vw] text-right">
              {currentOpacity}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
