import React from 'react';
import { Icon } from '@iconify/react';
import PremiumDropdown from '../components/PremiumDropdown';
import { TransparentSheetSection } from '../components/TransparentSheetUI';
import Switch from '../components/Switch';

const BookAppearanceSection = ({
  onBack,
  bookAppearanceSettings,
  onUpdateBookAppearance,
  pages = [],
  folder,
  flipbookName,
  v_id
}) => {

  return (
    <div className="flex flex-col h-full bg-white font-sans relative">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Panel Header */}
      <div className="h-[7.5vh] flex items-center justify-between px-[1.2vw] border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-[0.75vw] text-gray-800">
          <Icon icon="basil:book-open-outline" className="w-[1.4vw] h-[1.4vw] text-black" />
          <h2 className="text-[1vw] font-semibold text-gray-900">Book Appearance</h2>
        </div>
        {onBack && (
          <button 
            onClick={onBack} 
            className="w-[2vw] h-[2vw] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all active:scale-90"
          >
            <Icon icon="ph:arrow-left-bold" className="w-[1.1vw] h-[1.1vw]" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-white pb-[2.5vw] hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="p-[1vw] ">

      {/* Hard Cover Settings - Designed From Image */}
      <div className="space-y-[0.5vw] pt-[0.5vw]">
        <div className="flex items-center gap-[0.5vw]">
          <h3 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">Hard Cover Settings</h3>
          <div className="h-[0.0925vw] bg-gray-200 flex-1" style={{ marginRight: '-1vw' }}> </div>
        </div>

        <div className="flex flex-col gap-[1vw]">
          <div className="flex items-center justify-between px-[0.2vw]">
            <span className="text-[0.75vw] font-semibold text-gray-700">Make First & Last Page Hard</span>
            <Switch
              enabled={bookAppearanceSettings?.makeFirstLastPageHard}
              onChange={(newValue) => {
                let currentHardPages = [...(bookAppearanceSettings?.customHardPages || [])];

                if (newValue) {
                  // When enabling first/last, ensure they are in customHardPages
                  const firstIdx = 0;
                  const lastIdxGroupStart = (Math.ceil(pages.length / 2) - 1) * 2;

                  const pagesToAdd = [firstIdx, firstIdx + 1, lastIdxGroupStart];
                  if (lastIdxGroupStart + 1 < pages.length) pagesToAdd.push(lastIdxGroupStart + 1);

                  currentHardPages = Array.from(new Set([...currentHardPages, ...pagesToAdd]));
                }

                onUpdateBookAppearance({
                  ...bookAppearanceSettings,
                  makeFirstLastPageHard: newValue,
                  hardCover: newValue ? (newValue || bookAppearanceSettings?.selectCustomHardPages) : false,
                  selectCustomHardPages: newValue ? bookAppearanceSettings?.selectCustomHardPages : false,
                  customHardPages: newValue ? currentHardPages : []
                });
              }}
            />
          </div>

          {/* Select Custom Hard Pages */}
          <div className={`flex items-center justify-between px-[0.2vw] ${!bookAppearanceSettings?.makeFirstLastPageHard ? 'opacity-50' : ''}`}>
            <span className="text-[0.75vw] font-semibold text-gray-700">Select Custom Hard Pages</span>
            <Switch
              disabled={!bookAppearanceSettings?.makeFirstLastPageHard}
              enabled={bookAppearanceSettings?.selectCustomHardPages}
              onChange={(isEnabling) => {
                let newCustomHardPages = bookAppearanceSettings?.customHardPages || [];

                // Do not auto-select all pages when enabling
                // if (isEnabling) {
                //   newCustomHardPages = pages.map((_, i) => i);
                // }

                onUpdateBookAppearance({
                  ...bookAppearanceSettings,
                  selectCustomHardPages: isEnabling,
                  customHardPages: newCustomHardPages
                });
              }}
            />
          </div>

          {/* Custom Pages Selection List - Only visible when the toggle is turned ON */}
          {bookAppearanceSettings?.selectCustomHardPages && (
            <div className="mt-[0.2vw] border border-gray-200 rounded-[0.5vw] overflow-hidden bg-[#F8F9FA] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-[#F1F3F4] px-[0.5vw] py-[0.6vw] border-b border-gray-200">
                <span className="text-[0.75vw] font-semibold text-gray-800">Select Pages</span>
              </div>
              <div className="max-h-[10vw] overflow-y-auto pl-[0.9vw] pt-[0.5vw] pb-[0.5vw] space-y-[0.1vw] bg-white custom-scrollbar">
                {pages.length > 0 ? (
                  Array.from({ length: Math.ceil(pages.length / 2) }).map((_, groupIdx) => {
                    const idx1 = groupIdx * 2;
                    const idx2 = idx1 + 1;
                    const hasIdx2 = idx2 < pages.length;

                    const isFirstSpread = groupIdx === 0;
                    const isLastSpread = groupIdx === (Math.ceil(pages.length / 2) - 1);
                    const isForced = bookAppearanceSettings?.makeFirstLastPageHard && (isFirstSpread || isLastSpread);

                    const isSelected = isForced || (bookAppearanceSettings?.customHardPages || []).includes(idx1);
                    const label = hasIdx2 ? `Page ${idx1 + 1}-${idx2 + 1}` : `Page ${idx1 + 1}`;

                    return (
                      <label
                        key={groupIdx}
                        className={`flex items-center gap-[0.8vw] px-[0.6vw] py-[0.45vw] transition-colors rounded-[0.4vw] ${isForced ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer group'
                          }`}
                      >
                        <div
                          className={`w-[1vw] h-[1vw] rounded-[0.15vw] border-[0.15vw] flex items-center justify-center transition-all ${isSelected
                            ? 'bg-[#5551FF] border-[#5551FF]'
                            : 'border-gray-500 bg-white group-hover:border-gray-600'
                            } ${isForced ? 'cursor-not-allowed' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            if (isForced) return;

                            const currentHardPages = bookAppearanceSettings?.customHardPages || [];
                            let newHardPages;
                            if (isSelected) {
                              newHardPages = currentHardPages.filter(p => p !== idx1 && p !== idx2);
                            } else {
                              newHardPages = [...currentHardPages, idx1];
                              if (hasIdx2) newHardPages.push(idx2);
                            }
                            onUpdateBookAppearance({ ...bookAppearanceSettings, customHardPages: newHardPages });
                          }}
                        >
                          {isSelected && (
                            <Icon icon="lucide:check" className="text-white w-[0.75vw] h-[0.75vw]" strokeWidth={4} />
                          )}
                        </div>
                        <span className={`text-[0.75vw] font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                          {label}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div className="text-center py-[2vw] text-gray-400 text-[0.7vw]">
                    No pages available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transparent Sheet */}
      <TransparentSheetSection 
        bookAppearanceSettings={bookAppearanceSettings} 
        onUpdateBookAppearance={onUpdateBookAppearance} 
        pages={pages}
        folder={folder}
        flipbookName={flipbookName}
        v_id={v_id}
      />

      {/* Page Flipping Styles */}
      <div className="space-y-[0.5vw] pt-[1.5vw]">
        <div className="flex items-center gap-[1.5vw]">
          <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">Page Flipping Styles</span>
          <div className="h-[0.0925vw] bg-gray-200 flex-1" style={{ marginRight: '-1vw' }}> </div>
        </div>
        <div className="flex items-center justify-between  pl-[0.5vw]">
          <span className="text-[0.75vw] font-semibold text-gray-700">Flip Style :</span>
          <PremiumDropdown
            options={['Classic Flip', 'Smooth Flip', 'Fast Flip']}
            value={bookAppearanceSettings?.flipStyle || 'Classic Flip'}
            onChange={(opt) => onUpdateBookAppearance({ ...bookAppearanceSettings, flipStyle: opt })}
            width="10vw"
            buttonClassName="!border-gray-600 !rounded-[0.5vw]"
            align="right"
          />
        </div>
        <div className="flex items-center justify-between pl-[0.5vw] pb-[1vw]">
          <span className="text-[0.75vw] font-semibold text-gray-700">Flip Speed :</span>
          <PremiumDropdown
            options={['Slow', 'Medium', 'Fast']}
            value={bookAppearanceSettings?.flipSpeed || 'Fast'}
            onChange={(opt) => onUpdateBookAppearance({ ...bookAppearanceSettings, flipSpeed: opt, speedChanged: true })}
            width="10vw"
            buttonClassName="!border-gray-600 !rounded-[0.5vw]"
            align="right"
          />
        </div>
      </div>

      {/* Book Corner Radius */}
      <div className="space-y-[0.5vw] pt-[0.5vw]">
        <div className="flex items-center gap-[1vw]">
          <h3 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">Book Corner Radius</h3>
          <div className="h-[0.0925vw] bg-gray-200 flex-1" style={{ marginRight: '-1vw' }}> </div>
        </div>
        <div className="flex items-center justify-between pl-[0.5vw]">
          <div className="flex items-center gap-[0.3vw]">
            <Icon icon="material-symbols:rounded-corner" className="w-[1vw] h-[1vw] text-gray-900" />
            <span className="text-[0.75vw] font-semibold text-gray-700">Corner Radius :</span>
          </div>
          <PremiumDropdown
            options={['Sharp', 'Soft', 'Round']}
            value={bookAppearanceSettings?.corner || 'Sharp'}
            onChange={(opt) => onUpdateBookAppearance({ ...bookAppearanceSettings, corner: opt })}
            width="10vw"
            buttonClassName="!border-gray-600 !rounded-[0.5vw]"
            align="right"
          />
        </div>
      </div>

      {/* Drop Shadow */}
      <div className="space-y-[0.5vw] pt-[0.5vw]">
        <div className="flex items-center gap-[1vw]">
          <h3 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">Drop Shadow</h3>
          <div className="h-[0.0925vw] bg-gray-200 flex-1" style={{ marginRight: '-1vw' }}> </div>
        </div>

        <div className="flex flex-col gap-[1vw]">
          <div className="flex items-center justify-between  pl-[0.5vw]">
            <span className="text-[0.75vw] font-semibold text-gray-700">Shadow Position :</span>
            <PremiumDropdown
              options={['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right']}
              value={bookAppearanceSettings?.dropShadow?.position || 'Bottom Right'}
              onChange={(opt) => onUpdateBookAppearance({ ...bookAppearanceSettings, dropShadow: { ...bookAppearanceSettings.dropShadow, position: opt } })}
              width="10vw"
              buttonClassName="!border-gray-600 !rounded-[0.5vw]"
              align="right"
            />
          </div>

          {[
            { label: 'Strength :', key: 'strength', min: 0, max: 100 },
            { label: 'Softness :', key: 'softness', min: 0, max: 100 }
          ].map((item) => {
            const val = bookAppearanceSettings?.dropShadow?.[item.key] ?? 35;

            return (
              <div key={item.key} className="flex items-center justify-between pl-[0.5vw]">
                <span className="text-[0.75vw] font-semibold text-gray-700">{item.label}</span>
                <div className="flex items-center gap-[1vw] w-[14.5vw]">
                  <div className="flex-1 relative h-[1.2vw] flex items-center">
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      value={val}
                      onChange={(e) => onUpdateBookAppearance({
                        ...bookAppearanceSettings,
                        dropShadow: { ...bookAppearanceSettings.dropShadow, [item.key]: parseInt(e.target.value) }
                      })}
                      className="w-full h-[0.4vw] rounded-full appearance-none cursor-pointer z-10 bg-transparent relative [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[0.8vw] [&::-webkit-slider-thumb]:h-[0.8vw] [&::-webkit-slider-thumb]:bg-[#5551FF] [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:w-[0.8vw] [&::-moz-range-thumb]:h-[0.8vw] [&::-moz-range-thumb]:bg-[#5551FF] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none"
                      style={{ margin: 0 }}
                    />
                    <div className="absolute inset-x-0 h-[0.25vw] rounded-full bg-gray-200 pointer-events-none">
                      <div
                        className="h-full bg-[#5551FF] rounded-full"
                        style={{
                          width: `${((val - item.min) / (item.max - item.min)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[0.7vw] font-semibold text-gray-900 w-[2vw] text-right whitespace-nowrap">
                    {val} %
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export const BookAppearancePanel = BookAppearanceSection;
export { BookAppearanceSection };
export default BookAppearancePanel;
