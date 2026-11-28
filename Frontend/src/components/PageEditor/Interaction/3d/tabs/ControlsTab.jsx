import React from 'react';
import { Icon } from '@iconify/react';

const ControlsTab = ({
  limitHorizontalRotation,
  setLimitHorizontalRotation,
  leftRotationLimit,
  setLeftRotationLimit,
  rightRotationLimit,
  setRightRotationLimit,
  limitVerticalRotation,
  setLimitVerticalRotation,
  upperViewLimit,
  setUpperViewLimit,
  lowerViewLimit,
  setLowerViewLimit,
  limitZoom,
  setLimitZoom,
  limitZoomIn,
  setLimitZoomIn,
  limitZoomOut,
  setLimitZoomOut,
  enablePan,
  setEnablePan,
  autoRotate,
  setAutoRotate,
  autoRotateSpeed,
  setAutoRotateSpeed,
}) => {
  return (
    <div className="space-y-[1.1vw]">
      {/* Limit Horizontal Rotation */}
      <div className="space-y-[0.65vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Limit Horizontal Rotation</span>
          <div className="h-[0.08vw] bg-gray-200 flex-1" />
          <div
            className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${limitHorizontalRotation ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
            onClick={() => setLimitHorizontalRotation(!limitHorizontalRotation)}
          >
            <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${limitHorizontalRotation ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
          </div>
        </div>

        <div className={`space-y-[0.75vw] pl-[0.2vw] transition-opacity ${limitHorizontalRotation ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
          {/* Left Rotation Limit */}
          <div className="space-y-[0.3vw]">
            <div className="flex items-center gap-[0.4vw]">
              <Icon icon="lucide:rotate-ccw" className="w-[0.9vw] h-[0.9vw] text-gray-500" />
              <span className="text-[0.76vw] font-medium text-gray-600">Left Rotation Limit</span>
            </div>
            <div className="flex items-center gap-[0.6vw]">
              <input
                type="range"
                min="0"
                max="180"
                value={leftRotationLimit}
                onChange={(e) => setLeftRotationLimit(Number(e.target.value))}
                className="model3d-range-slider flex-1"
                style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(leftRotationLimit / 180) * 100}%, #E5E7EB ${(leftRotationLimit / 180) * 100}%, #E5E7EB 100%)` }}
              />
              <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                {leftRotationLimit}°
              </span>
            </div>
          </div>

          {/* Right Rotation Limit */}
          <div className="space-y-[0.3vw]">
            <div className="flex items-center gap-[0.4vw]">
              <Icon icon="lucide:rotate-cw" className="w-[0.9vw] h-[0.9vw] text-gray-500" />
              <span className="text-[0.76vw] font-medium text-gray-600">Right Rotation Limit</span>
            </div>
            <div className="flex items-center gap-[0.6vw]">
              <input
                type="range"
                min="0"
                max="180"
                value={rightRotationLimit}
                onChange={(e) => setRightRotationLimit(Number(e.target.value))}
                className="model3d-range-slider flex-1"
                style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(rightRotationLimit / 180) * 100}%, #E5E7EB ${(rightRotationLimit / 180) * 100}%, #E5E7EB 100%)` }}
              />
              <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                {rightRotationLimit}°
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Limit Vertical Rotation */}
      <div className="space-y-[0.65vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Limit Vertical Rotation</span>
          <div className="h-[0.08vw] bg-gray-200 flex-1" />
          <div
            className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${limitVerticalRotation ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
            onClick={() => setLimitVerticalRotation(!limitVerticalRotation)}
          >
            <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${limitVerticalRotation ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
          </div>
        </div>

        <div className={`space-y-[0.75vw] pl-[0.2vw] transition-opacity ${limitVerticalRotation ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
          {/* Upper View Limit */}
          <div className="space-y-[0.3vw]">
            <div className="flex items-center gap-[0.4vw]">
              <Icon icon="lucide:arrow-up-circle" className="w-[0.9vw] h-[0.9vw] text-gray-500" />
              <span className="text-[0.76vw] font-medium text-gray-600">Upper View Limit</span>
            </div>
            <div className="flex items-center gap-[0.6vw]">
              <input
                type="range"
                min="0"
                max="180"
                value={upperViewLimit}
                onChange={(e) => setUpperViewLimit(Number(e.target.value))}
                className="model3d-range-slider flex-1"
                style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(upperViewLimit / 180) * 100}%, #E5E7EB ${(upperViewLimit / 180) * 100}%, #E5E7EB 100%)` }}
              />
              <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                {upperViewLimit}°
              </span>
            </div>
          </div>

          {/* Lower View Limit */}
          <div className="space-y-[0.3vw]">
            <div className="flex items-center gap-[0.4vw]">
              <Icon icon="lucide:arrow-down-circle" className="w-[0.9vw] h-[0.9vw] text-gray-500" />
              <span className="text-[0.76vw] font-medium text-gray-600">Lower View Limit</span>
            </div>
            <div className="flex items-center gap-[0.6vw]">
              <input
                type="range"
                min="0"
                max="180"
                value={lowerViewLimit}
                onChange={(e) => setLowerViewLimit(Number(e.target.value))}
                className="model3d-range-slider flex-1"
                style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(lowerViewLimit / 180) * 100}%, #E5E7EB ${(lowerViewLimit / 180) * 100}%, #E5E7EB 100%)` }}
              />
              <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                {lowerViewLimit}°
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Limit Zoom */}
      <div className="space-y-[0.65vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Limit Zoom</span>
          <div className="h-[0.08vw] bg-gray-200 flex-1" />
          <div
            className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${limitZoom ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
            onClick={() => setLimitZoom(!limitZoom)}
          >
            <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${limitZoom ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
          </div>
        </div>

        <div className={`space-y-[0.75vw] pl-[0.2vw] transition-opacity ${limitZoom ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
          {/* Limit Zoom In */}
          <div className="space-y-[0.3vw]">
            <span className="text-[0.76vw] font-medium text-gray-600 block">Limit Zoom In</span>
            <div className="flex items-center gap-[0.6vw]">
              <input
                type="range"
                min="0"
                max="100"
                value={limitZoomIn}
                onChange={(e) => setLimitZoomIn(Number(e.target.value))}
                className="model3d-range-slider flex-1"
                style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${limitZoomIn}%, #E5E7EB ${limitZoomIn}%, #E5E7EB 100%)` }}
              />
              <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                {limitZoomIn}%
              </span>
            </div>
          </div>

          {/* Limit Zoom Out */}
          <div className="space-y-[0.3vw]">
            <span className="text-[0.76vw] font-medium text-gray-600 block">Limit Zoom Out</span>
            <div className="flex items-center gap-[0.6vw]">
              <input
                type="range"
                min="0"
                max="100"
                value={limitZoomOut}
                onChange={(e) => setLimitZoomOut(Number(e.target.value))}
                className="model3d-range-slider flex-1"
                style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${limitZoomOut}%, #E5E7EB ${limitZoomOut}%, #E5E7EB 100%)` }}
              />
              <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                {limitZoomOut}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pan / Move */}
      <div className="flex items-center gap-[0.6vw]">
        <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Pan / Move</span>
        <div className="h-[0.08vw] bg-gray-200 flex-1" />
        <div
          className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${enablePan ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
          onClick={() => setEnablePan(!enablePan)}
        >
          <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${enablePan ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
        </div>
      </div>

      {/* Auto Rotate */}
      <div className="space-y-[0.65vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Auto Rotate</span>
          <div className="h-[0.08vw] bg-gray-200 flex-1" />
          <div
            className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${autoRotate ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${autoRotate ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
          </div>
        </div>
        <div className={`space-y-[0.3vw] pl-[0.2vw] transition-opacity ${autoRotate ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
          <span className="text-[0.76vw] font-medium text-gray-600 block">Rotation Speed</span>
          <div className="flex items-center gap-[0.6vw]">
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={autoRotateSpeed}
              onChange={(e) => setAutoRotateSpeed(parseFloat(e.target.value))}
              className="model3d-range-slider flex-1"
              style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(autoRotateSpeed / 5) * 100}%, #E5E7EB ${(autoRotateSpeed / 5) * 100}%, #E5E7EB 100%)` }}
            />
            <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
              {Number(autoRotateSpeed).toFixed(1)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlsTab;
