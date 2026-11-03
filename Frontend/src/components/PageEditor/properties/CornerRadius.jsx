import React, { useRef, useState, useEffect } from 'react';
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
  className = '',
  openSubSection,
  setOpenSubSection,
  tagName = 'rect',
  noAccordion = false
}) => {
  const containerRef = useRef(null);
  const [internalLinked, setInternalLinked] = useState(Boolean(isRadiusLinked));

  useEffect(() => {
    if (isRadiusLinked !== undefined) {
      setInternalLinked(Boolean(isRadiusLinked));
    }
  }, [isRadiusLinked]);

  const effectiveLinked = isRadiusLinked !== undefined ? Boolean(isRadiusLinked) : internalLinked;

  const handleCornerValueChange = (corner, nextVal) => {
    const clamped = Math.max(0, parseInt(nextVal, 10) || 0);

    if (onCornerChange) {
      onCornerChange(corner, clamped);
      return;
    }

    if (effectiveLinked) {
      const allLinked = { tl: clamped, tr: clamped, bl: clamped, br: clamped };
      if (setRadius) setRadius(allLinked);
    } else {
      const updated = {
        tl: parseInt(radius?.tl || 0, 10),
        tr: parseInt(radius?.tr || 0, 10),
        bl: parseInt(radius?.bl || 0, 10),
        br: parseInt(radius?.br || 0, 10),
        [corner]: clamped
      };
      if (setRadius) setRadius(updated);
    }
  };

  const handleStepCorner = (corner, delta) => {
    const currentVal = parseInt(radius?.[corner] || 0, 10);
    handleCornerValueChange(corner, currentVal + delta);
  };

  const handleToggle = () => {
    const nextLinked = !effectiveLinked;
    setInternalLinked(nextLinked);
    if (onToggleLinked) {
      onToggleLinked(nextLinked);
      return;
    }

    if (setIsRadiusLinked) {
      setIsRadiusLinked(nextLinked);
    }
    if (nextLinked) {
      const maxR = Math.max(
        parseInt(radius?.tl || 0, 10),
        parseInt(radius?.tr || 0, 10),
        parseInt(radius?.bl || 0, 10),
        parseInt(radius?.br || 0, 10)
      );
      if (setRadius) {
        setRadius({ tl: maxR, tr: maxR, bl: maxR, br: maxR });
      } else if (onCornerChange) {
        ['tl', 'tr', 'bl', 'br'].forEach(k => onCornerChange(k, maxR));
      }
    }
  };

  const corners = [
    { key: 'tl', label: 'Top-Left', roundedClass: 'rounded-tl-[0.9vw] rounded-tr-none rounded-bl-none rounded-br-none' },
    { key: 'tr', label: 'Top-Right', roundedClass: 'rounded-tr-[0.9vw] rounded-tl-none rounded-bl-none rounded-br-none' },
    { key: 'bl', label: 'Bottom-Left', roundedClass: 'rounded-bl-[0.9vw] rounded-tl-none rounded-tr-none rounded-br-none' },
    { key: 'br', label: 'Bottom-Right', roundedClass: 'rounded-br-[0.9vw] rounded-tl-none rounded-tr-none rounded-bl-none' },
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
        <div className="flex items-center gap-[0.8vw]">
          <span className="text-[0.82vw] font-semibold text-gray-900 whitespace-nowrap">{title}</span>
          <div className="h-[1px] flex-1 bg-gray-200" />
        </div>
      )}

      <div className="relative flex items-center justify-center my-[0.4vw]">
        <div className="grid grid-cols-2 gap-x-[2.5vw] gap-y-[1.2vw] relative">
          {corners.map(({ key, roundedClass }) => (
            <div
              key={key}
              onPointerDown={(e) => {
                if (e.target.tagName === 'INPUT' || e.target.closest('button')) return;
                handleScrubHelper(e, radius?.[key] ?? 0, (newVal) => handleCornerValueChange(key, newVal));
              }}
              className={`w-[5.2vw] h-[2.3vw] bg-white border border-gray-300 ${roundedClass} flex items-center justify-between px-[0.4vw] shadow-2xs hover:border-gray-400 transition-colors cursor-ew-resize select-none relative`}
            >
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStepCorner(key, -1);
                }}
                className="text-gray-300 hover:text-gray-600 transition-colors cursor-pointer h-full flex items-center justify-center px-[0.2vw] z-10"
                title="Decrease"
              >
                <ChevronLeft size="0.8vw" />
              </button>
              <input
                type="number"
                min="0"
                max="100"
                value={radius?.[key] ?? 0}
                onChange={(e) => handleCornerValueChange(key, e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-center text-[0.8vw] font-medium text-gray-700 outline-none bg-transparent no-spin cursor-text z-10"
              />
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStepCorner(key, 1);
                }}
                className="text-gray-300 hover:text-gray-600 transition-colors cursor-pointer h-full flex items-center justify-center px-[0.2vw] z-10"
                title="Increase"
              >
                <ChevronRight size="0.8vw" />
              </button>
            </div>
          ))}

          {/* Center Link Icon Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              className="bg-white p-[0.35vw] rounded-full shadow-sm border border-gray-200 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title={effectiveLinked ? 'Unlink Corners' : 'Link All Corners'}
            >
              {effectiveLinked ? (
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
