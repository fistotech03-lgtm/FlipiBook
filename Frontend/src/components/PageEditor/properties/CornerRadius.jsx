import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Link2, Link2Off } from 'lucide-react';
import { handleScrubHelper } from './Color';

const CornerRadius = ({
  radius,
  setRadius,
  onCornerChange,
  isRadiusLinked = false,
  setIsRadiusLinked,
  onToggleLinked,
  hideHeader = false,
  title = 'Corner Radius',
  className = ''
}) => {
  const containerRef = useRef(null);

  const handleCornerValueChange = (corner, nextVal) => {
    const clamped = Math.max(0, parseInt(nextVal) || 0);

    if (onCornerChange) {
      onCornerChange(corner, clamped);
      return;
    }

    if (isRadiusLinked) {
      const allLinked = { tl: clamped, tr: clamped, bl: clamped, br: clamped };
      if (setRadius) setRadius(allLinked);
    } else {
      const updated = {
        tl: parseInt(radius?.tl || 0),
        tr: parseInt(radius?.tr || 0),
        bl: parseInt(radius?.bl || 0),
        br: parseInt(radius?.br || 0),
        [corner]: clamped
      };
      if (setRadius) setRadius(updated);
    }
  };

  const handleStepCorner = (corner, delta) => {
    const currentVal = parseInt(radius?.[corner] || 0);
    handleCornerValueChange(corner, currentVal + delta);
  };

  const handleToggle = () => {
    const nextLinked = !isRadiusLinked;
    if (onToggleLinked) {
      onToggleLinked(nextLinked);
      return;
    }

    if (setIsRadiusLinked) {
      setIsRadiusLinked(nextLinked);
    }
    if (nextLinked && setRadius) {
      const maxR = Math.max(
        parseInt(radius?.tl || 0),
        parseInt(radius?.tr || 0),
        parseInt(radius?.bl || 0),
        parseInt(radius?.br || 0)
      );
      setRadius({ tl: maxR, tr: maxR, bl: maxR, br: maxR });
    }
  };

  const corners = [
    { key: 'tl', label: 'Top-Left', roundedClass: 'rounded-tl-[1vw] rounded-tr-0 rounded-bl-0 rounded-br-0' },
    { key: 'tr', label: 'Top-Right', roundedClass: 'rounded-tr-[1vw] rounded-tl-0 rounded-bl-0 rounded-br-0' },
    { key: 'bl', label: 'Bottom-Left', roundedClass: 'rounded-bl-[1vw] rounded-tl-0 rounded-tr-0 rounded-br-0' },
    { key: 'br', label: 'Bottom-Right', roundedClass: 'rounded-br-[1vw] rounded-tl-0 rounded-tr-0 rounded-bl-0' },
  ];

  return (
    <div ref={containerRef} className={`flex flex-col gap-[0.5vw] font-sans ${className}`}>
      <style>{`
        .no-spin::-webkit-inner-spin-button, .no-spin::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>

      {!hideHeader && (
        <div className="flex items-center gap-[0.5vw]">
          <span className="text-[0.85vw] font-semibold text-black whitespace-nowrap">{title}</span>
          <div className="h-[1px] flex-1 bg-gray-200" />
        </div>
      )}

      <div className="relative flex items-center justify-center my-[0.4vw]">
        <div className="grid grid-cols-2 gap-x-[2.5vw] gap-y-[1.2vw] relative">
          {corners.map(({ key, roundedClass }) => (
            <div
              key={key}
              onPointerDown={(e) => {
                if (e.target.tagName === 'INPUT') return;
                handleScrubHelper(e, radius?.[key] ?? 0, (newVal) => handleCornerValueChange(key, newVal));
              }}
              className={`w-[5vw] h-[2.5vw] min-h-[38px] bg-white border border-gray-300 ${roundedClass} flex items-center justify-between px-[0.4vw] shadow-2xs hover:border-gray-400 transition-colors cursor-ew-resize select-none`}
            >
              <button
                type="button"
                onClick={() => handleStepCorner(key, -1)}
                className="text-gray-300 hover:text-gray-600 transition-colors cursor-pointer h-full flex items-center justify-center px-[0.2vw]"
              >
                <ChevronLeft size="0.9vw" />
              </button>
              <input
                type="number"
                min="0"
                max="100"
                value={radius?.[key] ?? 0}
                onChange={(e) => handleCornerValueChange(key, e.target.value)}
                className="w-full text-center text-[0.85vw] font-medium text-gray-700 outline-none bg-transparent no-spin cursor-text"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                onClick={() => handleStepCorner(key, 1)}
                className="text-gray-300 hover:text-gray-600 transition-colors cursor-pointer h-full flex items-center justify-center px-[0.2vw]"
              >
                <ChevronRight size="0.9vw" />
              </button>
            </div>
          ))}

          {/* Center Link Icon Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
            <button
              type="button"
              onClick={handleToggle}
              className="bg-white p-[0.35vw] rounded-full shadow-sm border border-gray-200 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title={isRadiusLinked ? 'Unlink Corners' : 'Link All Corners'}
            >
              {isRadiusLinked ? (
                <Link2 size="1.1vw" className="text-black" />
              ) : (
                <Link2Off size="1.1vw" className="text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CornerRadius;
