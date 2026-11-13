import React from 'react';
import { Icon } from '@iconify/react';
import ShelfBookSlot from './ShelfBookSlot';

// Golden Shelf Assets
import goldenShelfBase from '../../../../assets/Bookshelf/golden_shelf/base.png';
import goldenShelfPlank from '../../../../assets/Bookshelf/golden_shelf/shelf.png';
import goldenShelfLight from '../../../../assets/Bookshelf/golden_shelf/light.png';
import goldenShelfDecor from '../../../../assets/Bookshelf/golden_shelf/decor.png';
import goldenShelfPlant from '../../../../assets/Bookshelf/golden_shelf/plant.png';
import goldenShelfSwitch from '../../../../assets/Bookshelf/golden_shelf/switch.png';

// ============================================================================
// MANUAL PERCENTAGE ADJUSTMENT CONFIGURATION FOR GOLDEN SHELF
// Adjust percentages directly here for both Non-Full View (normal) and Full View (fullView)
// ============================================================================
export const GOLDEN_SHELF_CONFIG = {
  // Non-Full View (Default Inline Shelf Screen)
  normal: {
    top: '32.3%',         // Height from top (lands flush at 57.8% on shelf plank)
    height: '26.5%',      // Container height
    portraitWidth: '10.5%',
    landscapeWidth: '14.0%',
    squareWidth: '12.0%',
    // Individual book centers under each spotlight
    slots: {
      0: { center: '25.4%' }, // Book 1 (Spotlight 1)
      1: { center: '40.3%' }, // Book 2 (Spotlight 2)
      2: { center: '53.6%' }, // Book 3 (Spotlight 3)
      3: { center: '67.5%' }, // Book 4 (Spotlight 4)
    }
  },

  // Full View (Fullscreen Mode) - Coupled to shelf plank baseline
  fullView: {
    top: '32.3%',
    height: '26.5%',
    portraitWidth: '10.5%',
    landscapeWidth: '14.0%',
    squareWidth: '12.0%',
    slots: {
      0: { center: '25.4%' },
      1: { center: '40.3%' },
      2: { center: '53.6%' },
      3: { center: '67.5%' },
    }
  }
};

const GoldenShelf = ({
  filteredBooks,
  decors,
  setDecors,
  showLightSwitch = true,
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
      {/* 1. Base Credenza along the bottom */}
      <div
        className="absolute left-0 w-full pointer-events-none z-10"
        style={{
          bottom: 0,
          height: '14.8%'
        }}
      >
        <img
          src={goldenShelfBase}
          alt="Base Credenza"
          className="w-full h-full block object-fill"
        />
      </div>

      {/* 1b. Wall Light Switch in top-right - Clickable to toggle lights on/off; hidden/disabled when toggle is off */}
      {showLightSwitch && (
        <div
          onClick={() => {
            if (typeof setDecors === 'function') {
              setDecors(prev => ({ ...prev, lights: !prev.lights }));
            }
          }}
          className="absolute pointer-events-auto cursor-pointer z-15 transition-transform duration-150 active:scale-95 hover:scale-105 group"
          style={{
            right: '5.2%',
            top: '10.5%',
            width: '3.2%'
          }}
          title={decors.lights ? "Turn Lights Off" : "Turn Lights On"}
        >
          <img
            src={goldenShelfSwitch}
            alt="Switch"
            className="w-full h-auto block drop-shadow-sm transition-all duration-200 opacity-100"
          />
        </div>
      )}

      {/* 2. Top Spotlight Beam / Fixture */}
      <div
        className="absolute pointer-events-none z-15"
        style={{
          left: '18.0%',
          top: '14.0%',
          width: '80.0%'
        }}
      >
        <img
          src={goldenShelfLight}
          alt="Lights"
          className="w-full h-auto block drop-shadow-md relative z-20"
          style={{
            filter: decors.lights
              ? (selectedLightTheme === 'light1'
                ? 'brightness(1.15) contrast(1.02)'
                : selectedLightTheme === 'light2'
                  ? 'brightness(1.20) contrast(1.02)'
                  : 'brightness(1.10) contrast(1.02)')
              : 'none'
          }}
        />

        {/* Realistic Studio Spotlight Wall-Wash Beams: vertical downward spread from each bulb down over the books */}
        {decors.lights !== false && (
          <div
            className="absolute inset-0 pointer-events-none z-15 transition-opacity duration-150"
            style={{
              opacity: (Number(lightOpacity ?? 100) / 100)
            }}
          >
            {[
              { center: '9.24%' },
              { center: '27.85%' },
              { center: '44.50%' },
              { center: '62.78%' }
            ].map(({ center }, beamIdx) => (
              <React.Fragment key={`golden-beam-${beamIdx}`}>
                {/* 1. Vertical Soft Diffuse Wall-Wash - strictly within book width, no left/right spill */}
                <div
                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                  style={{
                    left: center,
                    top: '16%',
                    width: '9.2%',
                    height: '75%',
                    background:
                      selectedLightTheme === 'light1'
                        ? 'linear-gradient(to bottom, rgba(255, 250, 220, 0.95) 0%, rgba(254, 240, 138, 0.52) 32%, rgba(251, 191, 36, 0.16) 75%, transparent 95%)'
                        : selectedLightTheme === 'light2'
                          ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.58) 32%, rgba(203, 213, 225, 0.16) 75%, transparent 95%)'
                          : 'linear-gradient(to bottom, rgba(240, 249, 255, 0.95) 0%, rgba(186, 230, 253, 0.42) 30%, rgba(147, 197, 253, 0.10) 75%, transparent 95%)',
                    borderRadius: '50% 50% 45% 45% / 25% 25% 75% 75%',
                    filter: 'blur(5px)',
                    mixBlendMode: 'screen'
                  }}
                />

                {/* 2. Narrow Focused Core Shaft - vertical down center of book */}
                <div
                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                  style={{
                    left: center,
                    top: '15%',
                    width: '4.2%',
                    height: '58%',
                    background:
                      selectedLightTheme === 'light1'
                        ? 'linear-gradient(to bottom, rgba(255, 255, 240, 0.95) 0%, rgba(254, 240, 138, 0.60) 25%, rgba(251, 191, 36, 0.15) 70%, transparent 92%)'
                        : selectedLightTheme === 'light2'
                          ? 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(248, 250, 252, 0.65) 25%, rgba(203, 213, 225, 0.15) 70%, transparent 92%)'
                          : 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(224, 242, 254, 0.60) 25%, rgba(186, 230, 253, 0.12) 70%, transparent 92%)',
                    borderRadius: '50% 50% 45% 45% / 20% 20% 80% 80%',
                    filter: 'blur(3.5px)',
                    mixBlendMode: 'screen'
                  }}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* 3. Main Center Shelf Plank */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          left: '12.5%',
          top: '40.1%',
          width: '94.0%'
        }}
      >
        <img
          src={goldenShelfPlank}
          alt="Golden Shelf Plank"
          className="w-full h-auto block drop-shadow-md"
        />
      </div>

      {/* 4. Plant sitting on the shelf plank */}
      {decors.plant !== false && (
        <div
          className="absolute pointer-events-none z-25"
          style={{
            left: '72.5%',
            top: '41.2%',
            width: '13.5%'
          }}
        >
          <img
            src={goldenShelfPlant}
            alt="Hanging Plant"
            className="w-full h-auto block drop-shadow-md"
          />
        </div>
      )}

      {/* 5. Decor (Ceramic vase & books) sitting firmly landed on bottom base credenza tabletop */}
      {decors.decor !== false && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: '1.2%',
            bottom: '12.2%',
            width: '12.0%'
          }}
        >
          <img
            src={goldenShelfDecor}
            alt="Decor"
            className="w-full h-auto block drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
          />
        </div>
      )}

      {/* 6. Exactly 4 Books Placed Side-by-Side on the Shelf (Adjustable via GOLDEN_SHELF_CONFIG above) */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
      >
        {(() => {
          const modeKey = isFs ? 'fullView' : 'normal';
          const cfg = GOLDEN_SHELF_CONFIG[modeKey];
          return [0, 1, 2, 3].map((slotIdx) => {
            const slotCfg = cfg.slots[slotIdx] || { center: '25.4%' };
            const book = filteredBooks && filteredBooks[slotIdx];
            const isSlotActive = (hoveredInfoId && (hoveredInfoId.includes(`golden-${slotIdx}`) || hoveredInfoId.includes(`fs-golden-${slotIdx}`))) ||
              (openMenuId && (openMenuId.includes(`golden-${slotIdx}`) || openMenuId.includes(`fs-golden-${slotIdx}`)));

            if (!book) {
              return (
                <div
                  key={`golden-empty-${slotIdx}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, slotIdx)}
                  className="absolute pointer-events-auto -translate-x-1/2 flex flex-col justify-end items-center z-10"
                  style={{
                    left: slotCfg.center,
                    top: cfg.top,
                    width: cfg.portraitWidth,
                    height: cfg.height
                  }}
                >
                  <div
                    onClick={() => {
                      setSelectedBookIdsToAdd([]);
                      setAddBookSearch('');
                      setShowAddBookModal(true);
                    }}
                    className="w-full aspect-[1/1.42] rounded-[0.35vw] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/15 backdrop-blur-[1px] shadow-sm"
                    title="Add Book"
                  >
                    <div className="relative flex items-center justify-center text-white transition-transform group-hover:scale-110">
                      <Icon icon="mdi:book-open-outline" className="w-5 h-5 text-white/90" />
                      <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-white leading-none">+</span>
                    </div>
                    <span className="text-[9px] font-medium text-white/90 group-hover:text-white tracking-wide">
                      Add Book
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={book.v_id || `golden-book-${slotIdx}`}
                className={`absolute pointer-events-auto -translate-x-1/2 flex flex-col justify-end items-center ${
                  isSlotActive ? 'z-[100]' : 'z-20'
                }`}
                style={{
                  left: slotCfg.center,
                  top: cfg.top,
                  width: cfg.landscapeWidth,
                  height: cfg.height
                }}
              >
                <ShelfBookSlot
                  book={book}
                  bookIndex={slotIdx}
                  bIdx={slotIdx}
                  tooltipPlacement={slotIdx >= 2 ? 'left' : 'right'}
                  shelfKey={isFs ? `fs-golden-${slotIdx}` : `golden-${slotIdx}`}
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
                  landscapeWidth="100%"
                  portraitWidth="75%"
                  squareWidth="85%"
                />
              </div>
            );
          });
        })()}
      </div>
    </>
  );
};

export default GoldenShelf;
