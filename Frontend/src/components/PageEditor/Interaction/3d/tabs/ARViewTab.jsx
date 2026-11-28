import React from 'react';
import { Icon } from '@iconify/react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ARViewTab = ({
  CustomQRCode,
  mainQrRef,
  enableAR,
  setEnableAR,
  safeQrValue,
  qrText,
  setQrText,
  qrThemes,
  activeThemeIdx,
  applyTheme,
  qrColor,
  setQrColor,
  qrBgType,
  setQrBgType,
  qrBgColor,
  setQrBgColor,
  qrLevel,
  setQrLevel,
  qrDotType,
  setQrDotType,
  qrCornerSquareType,
  setQrCornerSquareType,
  qrCornerDotType,
  setQrCornerDotType,
  qrLogo,
  setQrLogo,
  showQrColorPicker,
  setShowQrColorPicker,
  showQrBgColorPicker,
  setShowQrBgColorPicker,
  qrColorPickerPos,
  setQrColorPickerPos,
  qrBgColorPickerPos,
  setQrBgColorPickerPos,
  showQrBgTypeDropdown,
  setShowQrBgTypeDropdown,
  showDotTypeDropdown,
  setShowDotTypeDropdown,
  showQrCornerSquareTypeDropdown,
  setShowQrCornerSquareTypeDropdown,
  showQrCornerDotTypeDropdown,
  setShowQrCornerDotTypeDropdown,
  dropdownDir,
  toggleDropdown,
  handleOpenPicker,
  renderPortalColorPicker,
}) => {
  return (
    <div className="space-y-[1.2vw]">
      {/* Enable AR View */}
      <div className="space-y-[0.35vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Enable AR View</span>
          <div className="flex-1 h-[1px] bg-gray-200" />
          <div
            className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${enableAR ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
            onClick={() => setEnableAR(!enableAR)}
          >
            <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${enableAR ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
          </div>
        </div>
        <span className="text-[0.72vw] text-gray-400 font-medium block">Allow user to view this model in AR</span>
      </div>

      <AnimatePresence>
        {enableAR && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-[1.2vw]"
          >
            {/* QR Preview & Download */}
            <div className="flex items-center gap-[0.8vw] p-[0.7vw] bg-white rounded-[0.55vw] border border-gray-200 shadow-2xs">
              <div
                className="w-[5.2vw] h-[5.2vw] rounded-[0.45vw] overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center p-[0.35vw]"
                style={{ backgroundColor: qrBgType === 'Solid' ? qrBgColor : '#f9fafb' }}
              >
                <CustomQRCode
                  ref={mainQrRef}
                  value={enableAR ? safeQrValue : qrText}
                  size={1024}
                  margin={4}
                  fgColor={qrColor}
                  bgColor={qrBgType === 'Solid' ? qrBgColor : 'transparent'}
                  dotType={qrDotType}
                  cornerSquareType={qrCornerSquareType}
                  cornerDotType={qrCornerDotType}
                  level={qrLevel || 'L'}
                  logo={qrLogo}
                />
              </div>

              <div className="flex flex-col flex-1 min-w-0 justify-between gap-[0.55vw]">
                <div className="flex flex-col gap-[0.15vw]">
                  <span className="text-[0.8vw] font-semibold text-gray-900 truncate">AR QR Code</span>
                  <span className="text-[0.72vw] text-gray-500 font-medium truncate">Scan to open in AR</span>
                </div>

                <div className="flex items-center gap-[0.4vw]">
                  <button
                    type="button"
                    onClick={() => mainQrRef.current?.download({ name: 'ar-qr-code', extension: 'png' })}
                    className="flex-1 h-[1.85vw] bg-white hover:bg-gray-50 text-gray-700 text-[0.72vw] font-medium rounded-[0.4vw] border border-gray-300 shadow-2xs hover:border-gray-400 flex items-center justify-center gap-[0.25vw] cursor-pointer transition-colors"
                    title="Download QR Code as PNG"
                  >
                    <Icon icon="lucide:download" className="w-[0.78vw] h-[0.78vw]" />
                    <span>PNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => mainQrRef.current?.download({ name: 'ar-qr-code', extension: 'svg' })}
                    className="flex-1 h-[1.85vw] bg-white hover:bg-gray-50 text-gray-700 text-[0.72vw] font-medium rounded-[0.4vw] border border-gray-300 shadow-2xs hover:border-gray-400 flex items-center justify-center gap-[0.25vw] cursor-pointer transition-colors"
                    title="Download QR Code as SVG"
                  >
                    <Icon icon="lucide:download" className="w-[0.78vw] h-[0.78vw]" />
                    <span>SVG</span>
                  </button>
                </div>
              </div>
            </div>

            {/* QR Themes */}
            <div className="space-y-[0.65vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">QR Themes</span>
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>

              <div className="flex items-center justify-between gap-[0.4vw]">
                {qrThemes.map((theme, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyTheme(idx)}
                    title={theme.name}
                    className={`w-[2.7vw] h-[2.7vw] border rounded-[0.45vw] flex items-center justify-center bg-white cursor-pointer transition-all shadow-2xs ${activeThemeIdx === idx ? 'border-[#EC5137] ring-1 ring-[#EC5137]/30 bg-orange-50/40' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <div className="w-[1.8vw] h-[1.8vw] pointer-events-none">
                      <CustomQRCode
                        value="theme"
                        size={1024}
                        margin={0}
                        fgColor={theme.fg}
                        bgColor={theme.bg}
                        dotType={theme.dotType}
                        cornerSquareType={theme.cornerSquareType}
                        cornerDotType={theme.cornerDotType}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* QR Properties */}
            <div className="space-y-[0.75vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">QR Properties</span>
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>

              {/* QR Text */}
              <div className="flex items-center justify-between gap-[0.6vw]">
                <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">QR Text</span>
                <div className="w-[10.8vw] h-[2vw] px-[0.6vw] bg-white border border-gray-300 focus-within:border-[#EC5137] rounded-[0.4vw] shadow-2xs flex items-center gap-[0.35vw] transition-colors">
                  <input
                    type="text"
                    placeholder="Scan Me"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    className="flex-1 min-w-0 outline-none text-[0.76vw] text-gray-700 bg-transparent font-medium"
                  />
                  <Icon icon="lucide:pencil" className="text-gray-400 w-[0.8vw] h-[0.8vw] shrink-0" />
                </div>
              </div>

              {/* QR Color */}
              <div className="flex items-center justify-between gap-[0.6vw] relative">
                <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">QR Color</span>
                <div className="w-[10.8vw] flex items-center gap-[0.4vw]">
                  <button
                    type="button"
                    onClick={(e) => {
                      handleOpenPicker(e, setQrColorPickerPos, setShowQrColorPicker, true, showQrColorPicker);
                      setShowQrBgColorPicker(false);
                    }}
                    className="w-[2vw] h-[2vw] rounded-[0.4vw] overflow-hidden shrink-0 border border-gray-300 shadow-2xs cursor-pointer"
                    style={{ backgroundColor: qrColor }}
                  />
                  {renderPortalColorPicker(
                    showQrColorPicker,
                    qrColorPickerPos,
                    () => setShowQrColorPicker(false),
                    qrColor,
                    (color) => setQrColor(color)
                  )}
                  <div className="flex-1 h-[2vw] border border-gray-300 rounded-[0.4vw] bg-white shadow-2xs flex items-center justify-between px-[0.55vw]">
                    <input
                      type="text"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      onClick={(e) => {
                        handleOpenPicker(e, setQrColorPickerPos, setShowQrColorPicker);
                        setShowQrBgColorPicker(false);
                      }}
                      className="w-full text-[0.74vw] text-gray-700 font-medium uppercase outline-none bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Background Type */}
              <div className="flex items-center justify-between gap-[0.6vw]">
                <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">Background</span>
                <div className="w-[10.8vw] relative">
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown(e, 'qrBgType', showQrBgTypeDropdown, setShowQrBgTypeDropdown)}
                    className="w-full h-[2vw] bg-white border border-gray-300 rounded-[0.4vw] px-[0.6vw] text-[0.75vw] font-medium text-gray-700 outline-none flex items-center justify-between shadow-2xs cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <span>{qrBgType}</span>
                    <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform ${showQrBgTypeDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showQrBgTypeDropdown && (
                    <>
                      <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowQrBgTypeDropdown(false)} />
                      <div className={`absolute right-0 w-full bg-white border border-gray-100 rounded-[0.45vw] shadow-2xl z-[60] py-[0.25vw] ${dropdownDir.qrBgType === 'up' ? 'bottom-full mb-[0.3vw]' : 'top-full mt-[0.3vw]'}`}>
                        {['Solid', 'Transparent'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setQrBgType(type);
                              setShowQrBgTypeDropdown(false);
                            }}
                            className={`w-full text-left px-[0.65vw] py-[0.35vw] text-[0.74vw] font-medium transition-colors hover:bg-gray-50 flex items-center justify-between cursor-pointer ${qrBgType === type ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700'}`}
                          >
                            {type}
                            {qrBgType === type && <Check size="0.7vw" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* BG Color */}
              <AnimatePresence>
                {qrBgType === 'Solid' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between gap-[0.6vw] relative overflow-visible"
                  >
                    <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">BG Color</span>
                    <div className="w-[10.8vw] flex items-center gap-[0.4vw]">
                      <button
                        type="button"
                        onClick={(e) => {
                          handleOpenPicker(e, setQrBgColorPickerPos, setShowQrBgColorPicker, true, showQrBgColorPicker);
                          setShowQrColorPicker(false);
                        }}
                        className="w-[2vw] h-[2vw] rounded-[0.4vw] overflow-hidden shrink-0 border border-gray-300 shadow-2xs cursor-pointer"
                        style={{ backgroundColor: qrBgColor === 'transparent' ? '#ffffff' : qrBgColor }}
                      />
                      {renderPortalColorPicker(
                        showQrBgColorPicker,
                        qrBgColorPickerPos,
                        () => setShowQrBgColorPicker(false),
                        qrBgColor,
                        (color) => setQrBgColor(color)
                      )}
                      <div className="flex-1 h-[2vw] border border-gray-300 rounded-[0.4vw] bg-white shadow-2xs flex items-center justify-between px-[0.55vw]">
                        <input
                          type="text"
                          value={qrBgColor}
                          onChange={(e) => setQrBgColor(e.target.value)}
                          onClick={(e) => {
                            handleOpenPicker(e, setQrBgColorPickerPos, setShowQrBgColorPicker);
                            setShowQrColorPicker(false);
                          }}
                          className="w-full text-[0.74vw] text-gray-700 font-medium uppercase outline-none bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* QR Level */}
              <div className="flex items-center justify-between gap-[0.6vw]">
                <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">QR Level</span>
                <div className="w-[10.8vw] flex items-center bg-gray-100/80 border border-gray-200 rounded-[0.4vw] p-[0.18vw] gap-[0.18vw]">
                  {[
                    { label: 'Low', value: 'L' },
                    { label: 'Med', value: 'M' },
                    { label: 'High', value: 'H' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setQrLevel(level.value)}
                      className={`flex-1 py-[0.22vw] rounded-[0.3vw] text-[0.72vw] cursor-pointer font-semibold transition-all ${qrLevel === level.value ? 'bg-[#EC5137] text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dot Style */}
              <div className="flex items-center justify-between gap-[0.6vw]">
                <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">Dot Style</span>
                <div className="w-[10.8vw] relative">
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown(e, 'dotType', showDotTypeDropdown, setShowDotTypeDropdown)}
                    className="w-full h-[2vw] bg-white border border-gray-300 rounded-[0.4vw] px-[0.6vw] text-[0.75vw] font-medium text-gray-700 outline-none flex items-center justify-between shadow-2xs cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <span className="capitalize truncate">{qrDotType.replace('-', ' ')}</span>
                    <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform ${showDotTypeDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showDotTypeDropdown && (
                    <>
                      <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowDotTypeDropdown(false)} />
                      <div className={`absolute right-0 w-full bg-white border border-gray-100 rounded-[0.45vw] shadow-2xl z-[60] py-[0.25vw] max-h-[11vw] overflow-y-auto model3d-custom-scrollbar ${dropdownDir.dotType === 'up' ? 'bottom-full mb-[0.3vw]' : 'top-full mt-[0.3vw]'}`}>
                        {['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setQrDotType(type);
                              setShowDotTypeDropdown(false);
                            }}
                            className={`w-full text-left px-[0.65vw] py-[0.35vw] text-[0.74vw] font-medium capitalize transition-colors hover:bg-gray-50 flex items-center justify-between cursor-pointer ${qrDotType === type ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700'}`}
                          >
                            {type.replace('-', ' ')}
                            {qrDotType === type && <Check size="0.7vw" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Eye Frame */}
              <div className="flex items-center justify-between gap-[0.6vw]">
                <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">Eye Frame</span>
                <div className="w-[10.8vw] relative">
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown(e, 'cornerSquare', showQrCornerSquareTypeDropdown, setShowQrCornerSquareTypeDropdown)}
                    className="w-full h-[2vw] bg-white border border-gray-300 rounded-[0.4vw] px-[0.6vw] text-[0.75vw] font-medium text-gray-700 outline-none flex items-center justify-between shadow-2xs cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <span className="capitalize truncate">{qrCornerSquareType.replace('-', ' ')}</span>
                    <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform ${showQrCornerSquareTypeDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showQrCornerSquareTypeDropdown && (
                    <>
                      <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowQrCornerSquareTypeDropdown(false)} />
                      <div className={`absolute right-0 w-full bg-white border border-gray-100 rounded-[0.45vw] shadow-2xl z-[60] py-[0.25vw] ${dropdownDir.cornerSquare === 'up' ? 'bottom-full mb-[0.3vw]' : 'top-full mt-[0.3vw]'}`}>
                        {['square', 'dot', 'extra-rounded'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setQrCornerSquareType(type);
                              setShowQrCornerSquareTypeDropdown(false);
                            }}
                            className={`w-full text-left px-[0.65vw] py-[0.35vw] text-[0.74vw] font-medium capitalize transition-colors hover:bg-gray-50 flex items-center justify-between cursor-pointer ${qrCornerSquareType === type ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700'}`}
                          >
                            {type.replace('-', ' ')}
                            {qrCornerSquareType === type && <Check size="0.7vw" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Eye Ball */}
              <div className="flex items-center justify-between gap-[0.6vw]">
                <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">Eye Ball</span>
                <div className="w-[10.8vw] relative">
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown(e, 'cornerDot', showQrCornerDotTypeDropdown, setShowQrCornerDotTypeDropdown)}
                    className="w-full h-[2vw] bg-white border border-gray-300 rounded-[0.4vw] px-[0.6vw] text-[0.75vw] font-medium text-gray-700 outline-none flex items-center justify-between shadow-2xs cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <span className="capitalize truncate">{qrCornerDotType.replace('-', ' ')}</span>
                    <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform ${showQrCornerDotTypeDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showQrCornerDotTypeDropdown && (
                    <>
                      <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowQrCornerDotTypeDropdown(false)} />
                      <div className={`absolute right-0 w-full bg-white border border-gray-100 rounded-[0.45vw] shadow-2xl z-[60] py-[0.25vw] ${dropdownDir.cornerDot === 'up' ? 'bottom-full mb-[0.3vw]' : 'top-full mt-[0.3vw]'}`}>
                        {['square', 'dot'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setQrCornerDotType(type);
                              setShowQrCornerDotTypeDropdown(false);
                            }}
                            className={`w-full text-left px-[0.65vw] py-[0.35vw] text-[0.74vw] font-medium capitalize transition-colors hover:bg-gray-50 flex items-center justify-between cursor-pointer ${qrCornerDotType === type ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700'}`}
                          >
                            {type.replace('-', ' ')}
                            {qrCornerDotType === type && <Check size="0.7vw" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Add Logo */}
              <div className="flex items-center justify-between gap-[0.6vw]">
                <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">Add Logo</span>
                <div className="w-[10.8vw]">
                  <label className="w-full h-[2.4vw] border border-dashed border-gray-300 rounded-[0.4vw] flex items-center justify-center gap-[0.35vw] bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer group relative overflow-hidden shadow-2xs">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setQrLogo(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {qrLogo ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white p-[0.2vw]">
                        <img
                          src={qrLogo}
                          alt="QR Logo"
                          className="h-full object-contain"
                        />
                        <div
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          onClick={(e) => {
                            e.preventDefault();
                            setQrLogo(null);
                          }}
                        >
                          <Icon icon="lucide:trash-2" className="text-white w-[1vw] h-[1vw]" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Icon icon="lucide:upload-cloud" className="w-[0.95vw] h-[0.95vw] text-gray-400 group-hover:text-[#EC5137] transition-colors" />
                        <span className="text-[0.72vw] font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Upload Logo</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ARViewTab;
