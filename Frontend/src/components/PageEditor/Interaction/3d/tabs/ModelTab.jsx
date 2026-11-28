import React from 'react';
import { Icon } from '@iconify/react';
import { Check } from 'lucide-react';

const ModelTab = ({
  initialRotation,
  setInitialRotation,
  modelScale,
  setModelScale,
  arHorizontalSurface,
  setArHorizontalSurface,
  arVerticalSurface,
  setArVerticalSurface,
  topText,
  setTopText,
  bottomText,
  setBottomText,
  localHotspots,
  activeHotspotId,
  onHotspotClick,
}) => {
  return (
    <div className="space-y-[1.1vw]">
      {/* Model Transform */}
      <div className="space-y-[0.75vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Model Transform</span>
          <div className="h-[0.08vw] bg-gray-200 flex-1" />
        </div>

        {/* Initial Rotation (Degrees) */}
        <div className="space-y-[0.4vw] pl-[0.2vw]">
          <span className="text-[0.76vw] font-medium text-gray-600 block">Initial Rotation (Degrees)</span>
          <div className="grid grid-cols-3 gap-[0.5vw]">
            {['x', 'y', 'z'].map((axis) => (
              <div
                key={axis}
                className="flex items-center justify-between bg-gray-100 rounded-[0.4vw] px-[0.55vw] h-[2vw] border border-transparent focus-within:border-[#EC5137] focus-within:bg-white transition-colors"
              >
                <span className="text-[0.74vw] font-semibold text-gray-800 uppercase">{axis}</span>
                <input
                  type="number"
                  value={initialRotation?.[axis] ?? 0}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    setInitialRotation({
                      x: initialRotation?.x ?? 0,
                      y: initialRotation?.y ?? 0,
                      z: initialRotation?.z ?? 0,
                      [axis]: val,
                    });
                  }}
                  className="w-[2.6vw] text-right bg-transparent outline-none text-[0.74vw] font-medium text-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Model Scale */}
        <div className="space-y-[0.3vw] pl-[0.2vw]">
          <span className="text-[0.76vw] font-medium text-gray-600 block">Model Scale</span>
          <div className="flex items-center gap-[0.6vw]">
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={modelScale}
              onChange={(e) => setModelScale(parseFloat(e.target.value))}
              className="model3d-range-slider flex-1"
              style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${((Number(modelScale) - 0.2) / 2.8) * 100}%, #E5E7EB ${((Number(modelScale) - 0.2) / 2.8) * 100}%, #E5E7EB 100%)` }}
            />
            <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
              {Number(modelScale).toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      {/* AR Placement */}
      <div className="space-y-[0.65vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">AR Placement</span>
          <div className="h-[0.08vw] bg-gray-200 flex-1" />
        </div>

        <div className="space-y-[0.55vw] pl-[0.2vw]">
          <label
            className="flex items-center gap-[0.55vw] cursor-pointer select-none"
            onClick={() => setArHorizontalSurface(!arHorizontalSurface)}
          >
            <span className={`w-[1vw] h-[1vw] rounded-[0.22vw] flex items-center justify-center border transition-colors ${arHorizontalSurface ? 'bg-[#EC5137] border-[#EC5137] text-white' : 'bg-white border-gray-300'}`}>
              {arHorizontalSurface && <Check size="0.7vw" strokeWidth={3} />}
            </span>
            <span className="text-[0.76vw] font-medium text-gray-600">Horizontal Surface</span>
          </label>

          <label
            className="flex items-center gap-[0.55vw] cursor-pointer select-none"
            onClick={() => setArVerticalSurface(!arVerticalSurface)}
          >
            <span className={`w-[1vw] h-[1vw] rounded-[0.22vw] flex items-center justify-center border transition-colors ${arVerticalSurface ? 'bg-[#EC5137] border-[#EC5137] text-white' : 'bg-white border-gray-300'}`}>
              {arVerticalSurface && <Check size="0.7vw" strokeWidth={3} />}
            </span>
            <span className="text-[0.76vw] font-medium text-gray-600">Vertical Surface</span>
          </label>
        </div>
      </div>

      {/* Text Customization */}
      <div className="space-y-[0.65vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Text Overlays</span>
          <div className="h-[0.08vw] bg-gray-200 flex-1" />
        </div>

        <div className="flex flex-col gap-[0.65vw] pl-[0.2vw]">
          <div className="flex items-center gap-[0.75vw]">
            <span className="text-[0.76vw] font-medium text-gray-600 w-[5.5vw] whitespace-nowrap flex justify-between">Pop up Text<span>:</span></span>
            <div className="flex-1 h-[2vw] border border-gray-300 focus-within:border-[#EC5137] bg-white rounded-[0.4vw] flex items-center px-[0.6vw] gap-[0.4vw] transition-colors">
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[0.76vw] text-gray-800"
              />
              <Icon icon="lucide:pencil" className="text-gray-400 w-[0.8vw] h-[0.8vw]" />
            </div>
          </div>
          <div className="flex items-center gap-[0.75vw]">
            <span className="text-[0.76vw] font-medium text-gray-600 w-[5.5vw] whitespace-nowrap flex justify-between">Modal Name<span>:</span></span>
            <div className="flex-1 h-[2vw] border border-gray-300 focus-within:border-[#EC5137] bg-white rounded-[0.4vw] flex items-center px-[0.6vw] gap-[0.4vw] transition-colors">
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[0.76vw] text-gray-800"
              />
              <Icon icon="lucide:pencil" className="text-gray-400 w-[0.8vw] h-[0.8vw]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3D Hotspots Section */}
      <div className="space-y-[0.65vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">3D Hotspots</span>
          {localHotspots && localHotspots.length > 0 && (
            <span className="bg-orange-50 text-[#EC5137] border border-[#EC5137]/30 text-[0.68vw] font-bold px-[0.45vw] py-[0.05vw] rounded-full">
              {localHotspots.length}
            </span>
          )}
          <div className="h-[0.08vw] bg-gray-200 flex-1" />
        </div>

        {(!localHotspots || localHotspots.length === 0) ? (
          <div className="py-[0.5vw] pl-[0.2vw]">
            <span className="text-[0.74vw] text-gray-400 font-medium">No hotspots configured for this model</span>
          </div>
        ) : (
          <div className="flex flex-col gap-[0.45vw] max-h-[16vw] overflow-y-auto no-scrollbar pl-[0.2vw]">
            {localHotspots.map((hs, i) => {
              const isSelected = activeHotspotId != null && (
                String(activeHotspotId) === String(hs.id) ||
                String(activeHotspotId) === String(hs.id || `hs_${i}`) ||
                activeHotspotId === i
              );
              return (
                <div
                  key={hs.id || i}
                  onClick={() => typeof onHotspotClick === 'function' && onHotspotClick(hs, i)}
                  className={`flex items-center justify-between p-[0.55vw] rounded-[0.45vw] border bg-white transition-all cursor-pointer ${
                    isSelected ? 'border-[#EC5137] ring-1 ring-[#EC5137]/40 bg-orange-50/20' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title="Click to view hotspot on 3D model"
                >
                  <div className="flex items-center gap-[0.6vw] min-w-0">
                    <div
                      className="w-[1.4vw] h-[1.4vw] rounded-full flex items-center justify-center text-white text-[0.7vw] font-bold shrink-0"
                      style={{ backgroundColor: hs.color || '#EC5137' }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-[0.76vw] font-semibold text-gray-800 truncate">
                      {hs.label || `Hotspot ${i + 1}`}
                    </span>
                  </div>
                  {hs.description && (
                    <span className="text-[0.7vw] text-gray-400 truncate max-w-[8vw] shrink-0 ml-[0.5vw]">
                      {hs.description}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelTab;
