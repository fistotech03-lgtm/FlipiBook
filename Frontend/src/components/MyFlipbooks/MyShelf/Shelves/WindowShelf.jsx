import React from 'react';
import { Icon } from '@iconify/react';
import ShelfBookSlot from './ShelfBookSlot';

// Window Shelf Assets
import windowShelfWindow from '../../../../assets/Bookshelf/window_shelf/window.png';
import windowShelfBase from '../../../../assets/Bookshelf/window_shelf/base.png';
import windowShelfPlank from '../../../../assets/Bookshelf/window_shelf/shelf.png';
import windowShelfPlant from '../../../../assets/Bookshelf/window_shelf/plant.png';
import windowShelfLight from '../../../../assets/Bookshelf/window_shelf/light.png';
import windowShelfSwitch from '../../../../assets/Bookshelf/window_shelf/switch.png';

// ============================================================================
// MANUAL PERCENTAGE ADJUSTMENT CONFIGURATION FOR WINDOW SHELF
// Adjust percentages directly here for both Non-Full View (normal) and Full View (fullView)
// ============================================================================
export const WINDOW_SHELF_CONFIG = {
  // Non-Full View (Default Inline Shelf Screen)
  normal: {
    container: {
      left: '44.5%',      // Shift books left / right on the shelf
      top: '29.8%',       // Vertical position (lands flush on white floating shelf)
      width: '25.0%',     // Total container width
      height: '26.0%',    // Container height
      gap: '12%',         // Gap between Book 1 and Book 2 (adjust percentage here!)
      portraitWidth: '40%',
      landscapeWidth: '48%',
      squareWidth: '44%'
    }
  },

  // Full View (Fullscreen Mode) - Coupled to shelf baseline
  fullView: {
    container: {
      left: '44.5%',
      top: '29.8%',
      width: '25.0%',
      height: '26.0%',
      gap: '10%',
      portraitWidth: '40%',
      landscapeWidth: '50%',
      squareWidth: '44%'
    }
  }
};

const WindowShelf = ({
  filteredBooks,
  decors,
  setDecors,
  showLightSwitch = true,
  defaultLightType,
  lightOpacity = 100,
  selectedLightTheme,
  openMenuId,
  setOpenMenuId,
  hoveredInfoId,
  setHoveredInfoId,
  draggedBookIndex,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  handleRemoveBook,
  setSelectedBookIdsToAdd,
  setAddBookSearch,
  setShowAddBookModal,
  LazyPreview,
  backendUrl,
  currentUserEmail,
  isFs = false
}) => {
  return (
    <>
      {/* 1. Window with Flower Vases docked on the left wall */}
      <div
        className="absolute left-0 top-0 pointer-events-none z-10"
        style={{
          width: '14.74%',
          height: '100%'
        }}
      >
        <img
          src={windowShelfWindow}
          alt="Window"
          className="w-full h-full block object-fill"
        />
      </div>

      {/* 2. White Skirting Base along the bottom wall */}
      <div
        className="absolute right-0 pointer-events-none z-10"
        style={{
          left: '14.7%',
          bottom: 0,
          height: '10%'
        }}
      >
        <img
          src={windowShelfBase}
          alt="Base"
          className="w-full h-full block object-fill"
        />
      </div>

      {/* 3. Triple Hanging Bulb Pendant Lights in Top-Right Corner */}
      {/* 3a. 3 Hanging Pendant Lights on Right */}
      {decors?.lightFixture !== false && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            right: '4.9%',
            top: 0,
            width: '8.6%'
          }}
        >
          {/* Ambient Wall Light Glow behind Pendant Bulbs */}
          {(decors?.lights && defaultLightType !== 'Turn off') && (
            <div className="contents" style={{ opacity: lightOpacity / 100 }}>
              {/* Soft Ambient Wall Spread from the 3 Bulbs */}
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-0"
                style={{
                  left: '48%',
                  top: '65%',
                  width: '480%',
                  height: '210%',
                  background: selectedLightTheme === 'light1'
                    ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(254, 240, 138, 0.48) 0%, rgba(251, 191, 36, 0.28) 35%, rgba(245, 158, 11, 0.12) 65%, transparent 100%)'
                    : selectedLightTheme === 'light2'
                      ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.25) 40%, rgba(203, 213, 225, 0.08) 70%, transparent 100%)'
                      : 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(186, 230, 253, 0.50) 0%, rgba(147, 197, 253, 0.25) 40%, rgba(96, 165, 250, 0.08) 70%, transparent 100%)',
                  filter: 'blur(42px)',
                  mixBlendMode: 'screen'
                }}
              />

              {/* Bulb 1 (Top-Left) Inner Glowing Filament Core */}
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-20"
                style={{
                  left: '26.1%',
                  top: '41.5%',
                  width: '34%',
                  height: '13.0%',
                  background: selectedLightTheme === 'light1'
                    ? 'radial-gradient(circle, #ffffff 15%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.60) 75%, transparent 100%)'
                    : selectedLightTheme === 'light2'
                      ? 'radial-gradient(circle, #ffffff 25%, rgba(255, 255, 255, 0.98) 55%, rgba(241, 245, 249, 0.80) 75%, transparent 100%)'
                      : 'radial-gradient(circle, #ffffff 20%, rgba(224, 242, 254, 0.95) 50%, rgba(147, 197, 253, 0.85) 75%, transparent 100%)',
                  filter: selectedLightTheme === 'light1' ? 'blur(3.2px)' : 'blur(3.5px)',
                  boxShadow: selectedLightTheme === 'light1'
                    ? '0 0 10px rgba(251, 191, 36, 0.65)'
                    : 'none'
                }}
              />

              {/* Bulb 2 (Mid-Right) Inner Glowing Filament Core */}
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-20"
                style={{
                  left: '78.2%',
                  top: '67.6%',
                  width: '34%',
                  height: '13.0%',
                  background: selectedLightTheme === 'light1'
                    ? 'radial-gradient(circle, #ffffff 15%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.60) 75%, transparent 100%)'
                    : selectedLightTheme === 'light2'
                      ? 'radial-gradient(circle, #ffffff 25%, rgba(255, 255, 255, 0.98) 55%, rgba(241, 245, 249, 0.80) 75%, transparent 100%)'
                      : 'radial-gradient(circle, #ffffff 20%, rgba(224, 242, 254, 0.95) 50%, rgba(147, 197, 253, 0.85) 75%, transparent 100%)',
                  filter: selectedLightTheme === 'light1' ? 'blur(3.2px)' : 'blur(3.5px)',
                  boxShadow: selectedLightTheme === 'light1'
                    ? '0 0 10px rgba(251, 191, 36, 0.65)'
                    : 'none'
                }}
              />

              {/* Bulb 3 (Bottom-Center) Inner Glowing Filament Core */}
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-20"
                style={{
                  left: '49.7%',
                  top: '83.1%',
                  width: '35%',
                  height: '13.5%',
                  background: selectedLightTheme === 'light1'
                    ? 'radial-gradient(circle, #ffffff 15%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.60) 75%, transparent 100%)'
                    : selectedLightTheme === 'light2'
                      ? 'radial-gradient(circle, #ffffff 25%, rgba(255, 255, 255, 0.98) 55%, rgba(241, 245, 249, 0.80) 75%, transparent 100%)'
                      : 'radial-gradient(circle, #ffffff 20%, rgba(224, 242, 254, 0.95) 50%, rgba(147, 197, 253, 0.85) 75%, transparent 100%)',
                  filter: selectedLightTheme === 'light1' ? 'blur(3.2px)' : 'blur(3.5px)',
                  boxShadow: selectedLightTheme === 'light1'
                    ? '0 0 10px rgba(251, 191, 36, 0.65)'
                    : 'none'
                }}
              />
            </div>
          )}

          <img
            src={windowShelfLight}
            alt="Pendant Lights"
            className="w-full h-auto block drop-shadow-md relative z-10 transition-all duration-300"
            style={{
              filter: (decors?.lights && defaultLightType !== 'Turn off')
                ? selectedLightTheme === 'light1'
                  ? 'brightness(1.20) contrast(1.04) drop-shadow(0 0 16px rgba(254, 240, 138, 0.65)) drop-shadow(0 0 32px rgba(251, 191, 36, 0.40))'
                  : selectedLightTheme === 'light2'
                    ? 'brightness(1.28) contrast(1.05) saturate(0.2) drop-shadow(0 0 16px rgba(255, 255, 255, 0.85))'
                    : 'brightness(1.22) contrast(1.05) hue-rotate(185deg) saturate(1.4) drop-shadow(0 0 16px rgba(96, 165, 250, 0.75))'
                : 'none'
            }}
          />
        </div>
      )}

      {/* 3b. Light Switch on Right Side of Pendant Lights */}
      {showLightSwitch && decors?.lightFixture !== false && (
        <div
          onClick={() => {
            if (typeof setDecors === 'function') {
              setDecors(prev => ({ ...prev, lights: !prev.lights }));
            }
          }}
          className="absolute pointer-events-auto cursor-pointer z-30 transition-transform duration-150 active:scale-95 hover:scale-105 group"
          style={{
            right: '2.5%',
            top: '12.0%',
            width: '3.2%'
          }}
          title={decors?.lights ? "Turn Lights Off" : "Turn Lights On"}
        >
          <img
            src={windowShelfSwitch}
            alt="Switch"
            className="w-full h-auto block drop-shadow-md transition-all duration-200 opacity-100"
          />
        </div>
      )}

      {/* 4. White Wall Floating Shelf */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          left: '33.65%',
          top: '42.22%',
          width: '67.55%'
        }}
      >
        <img
          src={windowShelfPlank}
          alt="Shelf"
          className="w-full h-auto block drop-shadow-lg"
        />
      </div>

      {/* 5. Hanging Vine Plant on the Left Edge of Shelf */}
      {decors?.plant !== false && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: '30.16%',
            top: '40.37%',
            width: '11.72%'
          }}
        >
          <img
            src={windowShelfPlant}
            alt="Plant"
            className="w-full h-auto block drop-shadow-md"
          />
        </div>
      )}

      {/* 6. Interactive Books on the Floating Shelf (Adjustable via WINDOW_SHELF_CONFIG above) */}
      {(() => {
        const modeKey = isFs ? 'fullView' : 'normal';
        const cfg = WINDOW_SHELF_CONFIG[modeKey].container;
        return (
          <div
            className={`absolute flex items-end justify-center pointer-events-auto ${
              [0, 1].some(slotIdx => (hoveredInfoId && (hoveredInfoId.includes(`window-shelf-${slotIdx}`) || hoveredInfoId.includes(`fs-window-shelf-${slotIdx}`))) || (openMenuId && (openMenuId.includes(`window-shelf-${slotIdx}`) || openMenuId.includes(`fs-window-shelf-${slotIdx}`)))) ? 'z-[90]' : 'z-20'
            }`}
            style={{
              left: cfg.left,
              top: cfg.top,
              width: cfg.width,
              height: cfg.height,
              gap: cfg.gap
            }}
          >
            {[0, 1].map((slotIdx) => {
              const book = filteredBooks && filteredBooks[slotIdx];
              if (!book) {
                return (
                  <div
                    key={`window-shelf-empty-${slotIdx}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, slotIdx)}
                    className="relative flex flex-col justify-end items-center z-10"
                    style={{ width: cfg.portraitWidth || '40%' }}
                  >
                    <div
                      onClick={() => {
                        setSelectedBookIdsToAdd([]);
                        setAddBookSearch('');
                        setShowAddBookModal(true);
                      }}
                      className="w-full aspect-[1/1.42] rounded-[0.35vw] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/20 backdrop-blur-[1px] shadow-sm"
                      title="Add Book"
                    >
                      <div className="relative flex items-center justify-center text-white transition-transform group-hover:scale-110">
                        <Icon icon="mdi:book-open-outline" className="w-5 h-5 text-white/90" />
                        <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-white leading-none">
                          +
                        </span>
                      </div>
                      <span className="text-[9px] font-medium text-white/90 group-hover:text-white tracking-wide">
                        Add Book
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <ShelfBookSlot
                  key={book.v_id || `window-shelf-${slotIdx}`}
                  book={book}
                  bookIndex={slotIdx}
                  bIdx={slotIdx}
                  tooltipPlacement={slotIdx === 1 ? 'left' : 'right'}
                  shelfKey={isFs ? `fs-window-shelf-${slotIdx}` : `window-shelf-${slotIdx}`}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  hoveredInfoId={hoveredInfoId}
                  setHoveredInfoId={setHoveredInfoId}
                  handleDragStart={handleDragStart}
                  handleDragOver={handleDragOver}
                  handleDrop={handleDrop}
                  handleDragEnd={handleDragEnd}
                  draggedBookIndex={draggedBookIndex}
                  handleRemoveBook={handleRemoveBook}
                  backendUrl={backendUrl}
                  currentUserEmail={currentUserEmail}
                  LazyPreviewComponent={LazyPreview}
                  landscapeWidth={cfg.landscapeWidth || '48%'}
                  portraitWidth={cfg.portraitWidth || '40%'}
                  squareWidth={cfg.squareWidth || '44%'}
                />
              );
            })}
          </div>
        );
      })()}
    </>
  );
};

export default WindowShelf;
