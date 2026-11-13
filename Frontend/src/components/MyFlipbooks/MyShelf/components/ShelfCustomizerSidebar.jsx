import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { wallThemeList, lightThemeList } from '../constants';
import CustomScrollbar from '../../../CustomScrollbar';

const ShelfCustomizerSidebar = ({
  view,
  shelfLogo,
  logoInputRef,
  handleLogoUpload,
  handleLogoFile,
  setShowLogoModal,
  handleRemoveLogo,
  logoFixType,
  setLogoFixType,
  logoOpacity,
  setLogoOpacity,
  selectedWallTheme,
  setSelectedWallTheme,
  defaultLightType,
  setDefaultLightType,
  showLightSwitch,
  setShowLightSwitch,
  selectedLightTheme,
  setSelectedLightTheme,
  lightOpacity,
  setLightOpacity,
  decors,
  setDecors,
  activeShelfStyle,
  activeAssets,
  booksData = [],
}) => {
  const [showLogoFixDropdown, setShowLogoFixDropdown] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  if (view === 'shelf') {
    return (
      <div className="w-[21vw] min-w-[270px] max-w-[340px] shrink-0 flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden h-full max-h-full">
        {/* Header: Customize your shelf with icon */}
        <div className="flex items-center gap-2.5 px-6 py-4.5 border-b border-gray-100 shrink-0">
          <div className="w-5 h-5 flex items-center justify-center text-[#FF5733]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
              <path d="M9 3v18" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Customize your shelf
          </h3>
        </div>

        <CustomScrollbar
          color="#d1d5db"
          hoverColor="#9ca3af"
          width="4px"
          className="flex-1 flex flex-col gap-6 p-6 pb-8"
        >
          {/* Add Logo Section */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="text-xs font-bold text-gray-900 tracking-tight whitespace-nowrap">Add Logo</span>
              <div className="flex-1 h-[1px] bg-gray-200/80" />
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={logoInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
              className="hidden"
              onChange={handleLogoUpload}
            />

            {!shelfLogo ? (
              /* Initial Add Logo Box */
              <div
                onClick={() => setShowLogoModal(true)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    handleLogoFile(file);
                  }
                }}
                className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:bg-gray-50/70 hover:border-[#FF5733]/60 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF5733] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon icon="lucide:plus" className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  + Add Logo
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  PNG, JPG, SVG up to 10MB
                </span>
              </div>
            ) : (
              <>
                {/* Logo fix type dropdown */}
                <div className="flex items-center justify-between gap-2 mb-3.5 relative z-30">
                  <span className="text-xs text-gray-700 font-medium">Logo fix type :</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowLogoFixDropdown(!showLogoFixDropdown)}
                      className="flex items-center justify-between gap-2 min-w-[90px] h-8 px-3 bg-white border border-gray-300 rounded-lg shadow-2xs hover:bg-gray-50 hover:border-gray-400 text-xs font-semibold text-gray-800 transition-colors cursor-pointer"
                    >
                      <span>{logoFixType === 'Fill' ? 'Fill' : 'Fit'}</span>
                      <Icon
                        icon="lucide:chevron-down"
                        className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showLogoFixDropdown ? 'rotate-180 text-orange-500' : ''}`}
                      />
                    </button>

                    {showLogoFixDropdown && (
                      <div className="absolute right-0 top-full mt-1.5 w-28 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {[
                          { label: 'Fit', desc: 'Proportional inside box' },
                          { label: 'Fill', desc: 'Stretch to edges' }
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => {
                              setLogoFixType(opt.label);
                              setShowLogoFixDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              logoFixType === opt.label
                                ? 'bg-orange-50 text-[#FF5733] font-bold'
                                : 'text-gray-700 hover:bg-gray-50 font-medium'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {logoFixType === opt.label && (
                              <Icon icon="lucide:check" className="w-3.5 h-3.5 text-[#FF5733]" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo Image Preview Card */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-2xs mb-3.5">
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0 flex items-center justify-center shadow-2xs group">
                    <img
                      src={typeof shelfLogo === 'object' ? (shelfLogo.url || '') : shelfLogo}
                      alt={shelfLogo?.name || 'Shelf Logo'}
                      className="w-full h-full transition-opacity duration-150"
                      style={{
                        objectFit: logoFixType === 'Fill' ? 'fill' : 'contain',
                        opacity: (logoOpacity ?? 100) / 100
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLogoModal(true)}
                      title="Replace image"
                      className="absolute top-1 right-1 w-6 h-6 rounded-md bg-white/90 hover:bg-white text-gray-700 shadow-2xs border border-gray-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Icon icon="lucide:sliders-horizontal" className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-semibold text-gray-900 truncate" title={shelfLogo?.name || 'Shelf Logo'}>
                      {shelfLogo?.name || 'Shelf Logo'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium mb-2">
                      {shelfLogo?.dimensions ? `${shelfLogo.dimensions} • ` : ''}{shelfLogo?.size || 'Image'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowLogoModal(true)}
                        className="px-2.5 h-7 bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-medium rounded-md border border-gray-300 shadow-2xs hover:border-gray-400 cursor-pointer transition-colors active:scale-95"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        title="Delete image"
                        className="h-7 px-2 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-md border border-gray-300 shadow-2xs hover:border-red-200 cursor-pointer transition-colors active:scale-95"
                      >
                        <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-700 font-medium whitespace-nowrap">Opacity :</span>
                  <div className="relative flex-1 flex items-center h-6">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={logoOpacity}
                      onChange={(e) => setLogoOpacity(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF5733]"
                      style={{
                        background: `linear-gradient(to right, #FF5733 0%, #FF5733 ${logoOpacity}%, #E5E7EB ${logoOpacity}%, #E5E7EB 100%)`
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 min-w-[36px] text-right">
                    {logoOpacity} %
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Wall Themes Section */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="text-xs font-bold text-gray-900 tracking-tight whitespace-nowrap">Wall Themes</span>
              <div className="flex-1 h-[1px] bg-gray-200/80" />
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {wallThemeList.map((wt) => {
                const isSelected = selectedWallTheme === wt.img;
                return (
                  <button
                    key={wt.id}
                    type="button"
                    onClick={() => setSelectedWallTheme(wt.img)}
                    className={`aspect-square rounded-xl overflow-hidden transition-all duration-200 p-0 flex items-center justify-center cursor-pointer border shadow-2xs hover:scale-105 active:scale-95 ${
                      isSelected
                        ? 'border-[#FF5733] ring-2 ring-orange-200/70 shadow-sm'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img
                      src={wt.img}
                      alt="Wall theme"
                      className="w-full h-full object-cover rounded-[10px]"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Light Theme Section */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="text-xs font-bold text-gray-900 tracking-tight whitespace-nowrap">Light Theme</span>
              <div className="flex-1 h-[1px] bg-gray-200/80" />
            </div>

            {/* Default Light Type Row */}
            <div className="flex items-center justify-between mb-3.5 relative">
              <span className="text-xs text-gray-700 font-medium">Default Light type</span>
              <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'default_light' ? null : 'default_light')}
                  className="flex items-center justify-between gap-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg px-3 h-8 focus:outline-none hover:border-gray-400 transition-colors shadow-2xs cursor-pointer min-w-[96px]"
                >
                  <span>{defaultLightType}</span>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                      openDropdown === 'default_light' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'default_light' && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-28 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150">
                      {['Turn on', 'Turn off'].map((option) => {
                        const isSelected = defaultLightType === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setDefaultLightType(option);
                              setDecors(prev => ({ ...prev, lights: option === 'Turn on' }));
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-orange-50/70 text-[#FF5733] font-bold'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                            }`}
                          >
                            <span>{option}</span>
                            {isSelected && (
                              <Icon icon="lucide:check" className="w-3.5 h-3.5 text-[#FF5733]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* On / Off Light switch Row */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-700 font-medium">On / Off Light switch</span>
              <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
              <button
                type="button"
                onClick={() => setShowLightSwitch(prev => !prev)}
                className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                  showLightSwitch ? 'bg-[#FF5733]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                    showLightSwitch ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Light Theme Cards */}
            <div className="grid grid-cols-3 gap-2.5 mb-3.5">
              {lightThemeList.map((lt) => {
                const isSelected = selectedLightTheme === lt.id;
                return (
                  <button
                    key={lt.id}
                    type="button"
                    onClick={() => setSelectedLightTheme(lt.id)}
                    className={`aspect-[4/3] rounded-xl overflow-hidden transition-all duration-200 p-0 flex items-center justify-center cursor-pointer border shadow-2xs hover:scale-105 active:scale-95 ${
                      isSelected
                        ? 'border-[#FF5733] ring-2 ring-orange-200/70 shadow-sm'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img
                      src={lt.img}
                      alt="Light theme"
                      className="w-full h-full object-cover rounded-[10px]"
                    />
                  </button>
                );
              })}
            </div>

            {/* Light Opacity Slider */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-gray-700 font-medium whitespace-nowrap">Light Opacity :</span>
              <div className="relative flex-1 flex items-center h-6">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lightOpacity}
                  onChange={(e) => setLightOpacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF5733]"
                  style={{
                    background: `linear-gradient(to right, #FF5733 0%, #FF5733 ${lightOpacity}%, #E5E7EB ${lightOpacity}%, #E5E7EB 100%)`
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 min-w-[36px] text-right">
                {lightOpacity} %
              </span>
            </div>
          </div>

          {/* Decors (Optional) Section */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="text-xs font-bold text-gray-900 tracking-tight whitespace-nowrap">
                Decors <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
              </span>
              <div className="flex-1 h-[1px] bg-gray-200/80" />
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Shelf-specific Decors */}
              {activeShelfStyle === 'customize_windowshelf' ? (
                <>
                  {/* Light (Pendant Lights) Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:lightbulb" className="w-4 h-4 text-amber-500 stroke-[1.75]" />
                      <span>Light</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, lightFixture: prev.lightFixture === false ? true : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.lightFixture !== false ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.lightFixture !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Plant (Shelf Hanging Vine Plant) Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:sprout" className="w-4 h-4 text-emerald-600 stroke-[1.75]" />
                      <span>Plant</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, plant: prev.plant === false ? true : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.plant !== false ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.plant !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </>
              ) : activeShelfStyle === 'customize_golden' ? (
                <>
                  {/* Plant Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:sprout" className="w-4 h-4 text-emerald-600 stroke-[1.75]" />
                      <span>Plant</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, plant: !prev.plant }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.plant ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.plant ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Decor Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:flower-2" className="w-4 h-4 text-amber-600 stroke-[1.75]" />
                      <span>Decor</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, decor: !prev.decor }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.decor ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.decor ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </>
              ) : activeShelfStyle === 'customize_orange' ? (
                <>
                  {/* Shelf Plant Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:flower-2" className="w-4 h-4 text-emerald-600 stroke-[1.75]" />
                      <span>Shelf Plant</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, shelfPlant: !prev.shelfPlant }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.shelfPlant ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.shelfPlant ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Globe Decor Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:globe" className="w-4 h-4 text-amber-700 stroke-[1.75]" />
                      <span>Globe Decor</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, globeDecor: !prev.globeDecor }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.globeDecor ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.globeDecor ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Base Plant Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:sprout" className="w-4 h-4 text-emerald-700 stroke-[1.75]" />
                      <span>Base Plant</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, basePlant: !prev.basePlant }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.basePlant ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.basePlant ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Book Decor Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:book-marked" className="w-4 h-4 text-stone-600 stroke-[1.75]" />
                      <span>Book Decor</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, bookDecor: !prev.bookDecor }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.bookDecor ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.bookDecor ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </>
              ) : activeAssets?.type === 'green_shelf' ? (
                <>
                  {/* Lamp Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:lamp" className="w-4 h-4 text-gray-600 stroke-[1.75]" />
                      <span>Lamp</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, lamp: !prev.lamp }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.lamp ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.lamp ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Decor Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:flower-2" className="w-4 h-4 text-amber-600 stroke-[1.75]" />
                      <span>Decor</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, decor: prev.decor === false ? true : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.decor !== false ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.decor !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </>
              ) : activeAssets?.type === 'light_shelf' ? (
                <>
                  {/* Lamp Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:lamp" className="w-4 h-4 text-gray-600 stroke-[1.75]" />
                      <span>Lamp</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, lamp: !prev.lamp }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.lamp ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.lamp ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Plant Pot Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:sprout" className="w-4 h-4 text-emerald-600 stroke-[1.75]" />
                      <span>Plant Pot</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, plant: prev.plant === false ? true : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.plant !== false ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.plant !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </>
              ) : (activeShelfStyle === 'customize_greenlight' || activeAssets?.type === 'green_light_shelf') ? (
                <>
                  {/* Lamp Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:lamp" className="w-4 h-4 text-gray-600 stroke-[1.75]" />
                      <span>Lamp</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, lamp: prev.lamp === false ? true : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.lamp !== false ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.lamp !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Plant Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:sprout" className="w-4 h-4 text-emerald-600 stroke-[1.75]" />
                      <span>Plant</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, plant: prev.plant === false ? true : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.plant !== false ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.plant !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </>
              ) : activeShelfStyle === 'customize4' ? (
                <>
                  {/* Lamp Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:lamp" className="w-4 h-4 text-gray-600 stroke-[1.75]" />
                      <span>Lamp</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, lamp: !prev.lamp }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.lamp ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.lamp ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Book with Pot Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:flower-2" className="w-4 h-4 text-amber-700 stroke-[1.75]" />
                      <span>Book with Pot</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, bookWithPot: prev.bookWithPot === false ? true : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.bookWithPot !== false ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.bookWithPot !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </>
              ) : (activeShelfStyle === 'customize_plantlight' || activeAssets?.type === 'plant_light_shelf') ? (
                <>
                  {/* Lamp Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:lamp" className="w-4 h-4 text-gray-600 stroke-[1.75]" />
                      <span>Lamp</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, lamp: prev.lamp === false ? true : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.lamp !== false ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.lamp !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Decor Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:flower-2" className="w-4 h-4 text-amber-600 stroke-[1.75]" />
                      <span>Decor</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, decor: prev.decor === false ? true : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.decor !== false ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.decor !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Plant Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:sprout" className="w-4 h-4 text-emerald-600 stroke-[1.75]" />
                      <span>Plant</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, plant: prev.plant === false ? true : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.plant !== false ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.plant !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Leaf Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Icon icon="lucide:leaf" className="w-4 h-4 text-emerald-700 stroke-[1.75]" />
                      <span>Leaf</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, leaf: prev.leaf === false ? true : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.leaf !== false ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.leaf !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </>
              ) : (
                /* Lamp Toggle for other shelves */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                    <Icon icon="lucide:lamp" className="w-4 h-4 text-gray-600 stroke-[1.75]" />
                    <span>Lamp</span>
                  </div>
                  <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                  <button
                    type="button"
                    onClick={() => setDecors(prev => ({ ...prev, lamp: !prev.lamp }))}
                    className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                      decors.lamp ? 'bg-[#FF5733]' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                        decors.lamp ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    ></div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </CustomScrollbar>
      </div>
    );
  }

  // List View Sidebar (Shelf Usage + Tips)
  return (
    <div className="w-[20vw] min-w-[260px] max-w-[320px] shrink-0 flex flex-col justify-end gap-6 h-full pb-4">
      {/* Shelf Usage */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Shelf Usage</h3>
        <div className="h-2 w-full bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-[#FF5733] rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (booksData.length / 50) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-medium text-gray-600">
          <span>{booksData.length} of 50 Flipbooks Used</span>
          <span className="font-semibold text-gray-900">{Math.round(Math.min(100, (booksData.length / 50) * 100))}%</span>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-[#fef9f4] border border-[#faedd9] rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">💡</span>
          <h3 className="font-semibold text-sm text-gray-900">Tips</h3>
        </div>
        <p className="text-xs text-gray-600 font-medium mb-4 leading-relaxed">
          Drag and Drop flipbooks to rearrange them on your shelf
        </p>
        <div className="flex justify-center items-end gap-3 relative px-2 mt-2">
          <Icon icon="duo-icons:book" className="w-10 h-10 text-gray-600" />
          <Icon icon="duo-icons:book" className="w-10 h-10 text-gray-600" />

          <div className="relative z-10 -translate-y-2">
            <Icon icon="duo-icons:book" className="w-12 h-12 text-yellow-500 drop-shadow-md" />
            <Icon icon="game-icons:click" className="absolute -bottom-2 -right-2 w-7 h-7 text-gray-900" />
          </div>

          <Icon icon="duo-icons:book" className="w-10 h-10 text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default ShelfCustomizerSidebar;
