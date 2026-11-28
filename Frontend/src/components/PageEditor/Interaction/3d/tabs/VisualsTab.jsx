import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VisualsTab = ({
  lightIntensity,
  setLightIntensity,
  addShadow,
  setAddShadow,
  shadowStrength,
  setShadowStrength,
  shadowSoftness,
  setShadowSoftness,
  bgType,
  setBgType,
  bgColor,
  setBgColor,
  customBg,
  setCustomBg,
  showBgTypeDropdown,
  setShowBgTypeDropdown,
  showBgColorPicker,
  setShowBgColorPicker,
  bgPickerPos,
  setBgPickerPos,
  dropdownDir,
  toggleDropdown,
  handleOpenPicker,
  renderPortalColorPicker,
}) => {
  return (
    <div className="space-y-[1.1vw]">
      {/* Lighting */}
      <div className="space-y-[0.65vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Lighting</span>
          <div className="h-[0.08vw] bg-gray-200 flex-1" />
        </div>

        <div className="space-y-[0.3vw] pl-[0.2vw]">
          <span className="text-[0.76vw] font-medium text-gray-600 block">Light Intensity</span>
          <div className="flex items-center gap-[0.6vw]">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={lightIntensity}
              onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
              className="model3d-range-slider flex-1"
              style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(Number(lightIntensity) / 2) * 100}%, #E5E7EB ${(Number(lightIntensity) / 2) * 100}%, #E5E7EB 100%)` }}
            />
            <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
              {Number(lightIntensity).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Add Shadow */}
      <div className="space-y-[0.65vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Add Shadow</span>
          <div className="h-[0.08vw] bg-gray-200 flex-1" />
          <div
            className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${addShadow ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
            onClick={() => setAddShadow(!addShadow)}
          >
            <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${addShadow ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
          </div>
        </div>

        <div className={`space-y-[0.75vw] pl-[0.2vw] transition-opacity ${addShadow ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
          <div className="space-y-[0.3vw]">
            <span className="text-[0.76vw] font-medium text-gray-600 block">Shadow Opacity</span>
            <div className="flex items-center gap-[0.6vw]">
              <input
                type="range"
                min="0"
                max="100"
                value={shadowStrength}
                onChange={(e) => setShadowStrength(e.target.value)}
                className="model3d-range-slider flex-1"
                style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${shadowStrength}%, #E5E7EB ${shadowStrength}%, #E5E7EB 100%)` }}
              />
              <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                {shadowStrength}%
              </span>
            </div>
          </div>

          <div className="space-y-[0.3vw]">
            <span className="text-[0.76vw] font-medium text-gray-600 block">Shadow Softness</span>
            <div className="flex items-center gap-[0.6vw]">
              <input
                type="range"
                min="0"
                max="100"
                value={shadowSoftness}
                onChange={(e) => setShadowSoftness(e.target.value)}
                className="model3d-range-slider flex-1"
                style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${shadowSoftness}%, #E5E7EB ${shadowSoftness}%, #E5E7EB 100%)` }}
              />
              <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                {shadowSoftness}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Color Group */}
      <div className="space-y-[0.75vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Background Color</span>
          <div className="h-[0.08vw] bg-gray-200 flex-1" />
        </div>

        <div className="flex flex-col pl-[0.2vw]">
          <div className="flex items-center gap-[0.8vw]">
            <span className="text-[0.76vw] font-medium text-gray-600 w-[4vw] flex justify-between">Type <span>:</span></span>
            <div className="flex-1 relative">
              <button
                onClick={(e) => toggleDropdown(e, 'bgType', showBgTypeDropdown, setShowBgTypeDropdown)}
                className="w-full bg-white border border-gray-300 rounded-[0.4vw] px-[0.6vw] py-[0.35vw] text-[0.75vw] font-semibold text-gray-700 outline-none flex items-center justify-between cursor-pointer hover:border-gray-400 transition-all"
              >
                <span>{bgType}</span>
                <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform duration-200 ${showBgTypeDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showBgTypeDropdown && (
                <>
                  <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowBgTypeDropdown(false)} />
                  <div className={`absolute left-0 w-full bg-white border border-gray-100 rounded-[0.5vw] shadow-xl z-[60] py-[0.3vw] ${dropdownDir.bgType === 'up' ? 'bottom-full mb-[0.3vw]' : 'top-full mt-[0.3vw]'}`}>
                    {['Solid', 'Transparent'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setBgType(type);
                          setShowBgTypeDropdown(false);
                        }}
                        className={`w-full text-left px-[0.6vw] py-[0.4vw] text-[0.72vw] font-semibold transition-all hover:bg-gray-50 flex items-center justify-between cursor-pointer ${bgType === type ? 'text-[#EC5137]' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {type}
                        {bgType === type && <Check size="0.7vw" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <AnimatePresence>
            {bgType === 'Solid' && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: '0.75vw' }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-[0.8vw] relative"
              >
                <span className="text-[0.76vw] font-medium text-gray-600 w-[4vw] flex justify-between">Color <span>:</span></span>
                <div className="flex items-center gap-[0.5vw] flex-1">
                  <button
                    onClick={(e) => handleOpenPicker(e, setBgPickerPos, setShowBgColorPicker, true, showBgColorPicker)}
                    className="w-[2vw] h-[2vw] rounded-[0.45vw] border border-gray-300 overflow-hidden shrink-0 flex items-center justify-center relative cursor-pointer"
                    style={{ backgroundColor: bgColor }}
                  />
                  {renderPortalColorPicker(
                    showBgColorPicker,
                    bgPickerPos,
                    () => setShowBgColorPicker(false),
                    bgColor,
                    (color) => setBgColor(color)
                  )}
                  <div className="flex-1 border border-gray-300 rounded-[0.45vw] h-[2vw] bg-white flex items-center justify-between px-[0.65vw]">
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      onClick={(e) => handleOpenPicker(e, setBgPickerPos, setShowBgColorPicker)}
                      className="w-full text-[0.78vw] text-gray-700 font-medium uppercase outline-none bg-transparent cursor-pointer"
                    />
                    <span className="text-[0.75vw] text-gray-400">100%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Background */}
      <div className="flex items-center gap-[0.6vw]">
        <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Custom Background</span>
        <div className="h-[0.08vw] bg-gray-200 flex-1" />
        <div
          className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${customBg ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
          onClick={() => setCustomBg(!customBg)}
        >
          <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${customBg ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
        </div>
      </div>
    </div>
  );
};

export default VisualsTab;
