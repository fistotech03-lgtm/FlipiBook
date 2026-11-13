import React from 'react';
import { Icon } from '@iconify/react';
import ShelfBookSlot from './ShelfBookSlot';

// Light Shelf Assets
import lightShelfSheet from '../../../../assets/Bookshelf/light_shelf/lightsheet.png';
import lightShelfLeftWood from '../../../../assets/Bookshelf/light_shelf/leftwood.png';
import lightShelfSpotlights from '../../../../assets/Bookshelf/light_shelf/light.png';
import lightShelfTopTier from '../../../../assets/Bookshelf/light_shelf/lightwithshelf.png';
import lightShelfBottomTier from '../../../../assets/Bookshelf/light_shelf/shelf.png';
import lightShelfLamp from '../../../../assets/Bookshelf/light_shelf/lamp.png';
import lightShelfPlant from '../../../../assets/Bookshelf/light_shelf/plantpot.png';
import lightShelfBase from '../../../../assets/Bookshelf/light_shelf/base.png';
import lightShelfSwitch from '../../../../assets/Bookshelf/light_shelf/switch.png';

// ============================================================================
// LIGHT SHELF CONFIGURATION - Adjust percentages easily here!
// Both 'normal' (inline shelf view) and 'fullView' (fullscreen view) can be tweaked independently.
// ============================================================================
export const LIGHT_SHELF_CONFIG = {
  normal: {
    tier0: {
      shelfTop: '38.5%',
      lightTop: '10.0%'
    },
    tier1: {
      shelfTop: '69.0%',
      lightTop: '41.2%'
    },
    shelf: {
      left: '16.6%',
      width: '77.0%'
    },
    centers: ['9.57%', '36.50%', '63.50%', '90.43%'],
    books: {
      portraitWidth: '13.5%',
      landscapeWidth: '18.5%'
    }
  },
  fullView: {
    tier0: {
      shelfTop: '38.5%',
      lightTop: '10.0%'
    },
    tier1: {
      shelfTop: '69.0%',
      lightTop: '41.2%'
    },
    shelf: {
      left: '16.6%',
      width: '77.0%'
    },
    centers: ['9.57%', '36.50%', '63.50%', '90.43%'],
    books: {
      portraitWidth: '13.5%',
      landscapeWidth: '18.5%'
    }
  }
};

const LightShelf = ({
  filteredBooks,
  decors,
  setDecors,
  showLightSwitch = true,
  selectedLightTheme,
  selectedWallTheme,
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
  const cfg = LIGHT_SHELF_CONFIG[isFs ? 'fullView' : 'normal'] || LIGHT_SHELF_CONFIG.normal;
  return (
    <>
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Light Sheet Overlay: when a custom wall theme is selected, blend the warm lighting ambiance onto it */}
                    {selectedWallTheme && (
                      <div
                        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80 z-0"
                        style={{
                          backgroundImage: `url('${lightShelfSheet}')`,
                          backgroundSize: '100% 100%',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}

                    {/* Left Wood Slats Column (leftwood.png) */}
                    <div
                      className="absolute left-0 top-0 pointer-events-none z-10"
                      style={{
                        width: '6.46%',
                        bottom: '7.6%'
                      }}
                    >
                      <img
                        src={lightShelfLeftWood}
                        alt="Left Wood Slats"
                        className="w-full h-full block object-cover object-top"
                      />
                    </div>

                    {/* Ceiling Spotlights (light.png) directly above the 4 shelves */}
                    <div
                      className="absolute pointer-events-none z-20"
                      style={{
                        top: '9.5%',
                        left: '22.87%',
                        width: '64.48%'
                      }}
                    >
                      <img
                        src={lightShelfSpotlights}
                        alt="Ceiling Spotlights"
                        className="w-full h-auto block drop-shadow-sm"
                      />
                    </div>

                    {/* 2 Tiers of Shelves */}
                    {[
                      { tierIdx: 0, shelfTop: cfg.tier0.shelfTop, lightTop: cfg.tier0.lightTop, plankImg: lightShelfTopTier, books: [0, 1, 2, 3] },
                      { tierIdx: 1, shelfTop: cfg.tier1.shelfTop, lightTop: cfg.tier1.lightTop, plankImg: lightShelfBottomTier, books: [4, 5, 6, 7] }
                    ].map(({ tierIdx, shelfTop, lightTop, plankImg, books }) => (
                      <React.Fragment key={`lightshelf-tier-${tierIdx}`}>
                        {/* Shelf row: 4 floating shelf segments */}
                        <div
                          className="absolute pointer-events-none z-10"
                          style={{
                            top: shelfTop,
                            left: cfg.shelf.left,
                            width: cfg.shelf.width
                          }}
                        >
                          <img
                            src={plankImg}
                            alt="Light Shelf Plank"
                            className="w-full h-auto block drop-shadow-md relative z-20"
                          />
                        </div>

                        {/* Realistic Studio Spotlight Wall-Wash Beams: vertical downward spread from fixture down onto book */}
                        {decors.lights && (
                          <div
                            className="absolute pointer-events-none z-15"
                            style={{
                              top: lightTop,
                              left: cfg.shelf.left,
                              width: cfg.shelf.width,
                              height: '100%'
                            }}
                          >
                            {cfg.centers.map((center, beamIdx) => (
                              <React.Fragment key={`lightshelf-spotlight-beam-${tierIdx}-${beamIdx}`}>
                                {/* 1. Pure Vertical Downward Beam: Softer, lighter golden light shade */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '3.5%',
                                    width: '11.0%',
                                    height: '24%',
                                    background:
                                      selectedLightTheme === 'light2'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.50) 30%, rgba(203, 213, 225, 0.12) 75%, transparent 100%)'
                                        : selectedLightTheme === 'light3'
                                        ? 'linear-gradient(to bottom, rgba(240, 249, 255, 0.95) 0%, rgba(186, 230, 253, 0.42) 30%, rgba(147, 197, 253, 0.10) 75%, transparent 100%)'
                                        : 'linear-gradient(to bottom, rgba(255, 240, 180, 0.82) 0%, rgba(252, 211, 77, 0.38) 32%, rgba(245, 158, 11, 0.12) 72%, transparent 100%)',
                                    borderRadius: '50% 50% 45% 45% / 25% 25% 75% 75%',
                                    filter: 'blur(7px)',
                                    mixBlendMode: 'screen'
                                  }}
                                />

                                {/* 2. Narrow focused core shaft down center of book: Subtle light golden core */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '3%',
                                    width: '5.0%',
                                    height: '20%',
                                    background:
                                      selectedLightTheme === 'light2'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(248, 250, 252, 0.65) 25%, rgba(203, 213, 225, 0.15) 70%, transparent 100%)'
                                        : selectedLightTheme === 'light3'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(224, 242, 254, 0.60) 25%, rgba(186, 230, 253, 0.12) 70%, transparent 100%)'
                                        : 'linear-gradient(to bottom, rgba(255, 250, 220, 0.90) 0%, rgba(253, 224, 71, 0.52) 25%, rgba(245, 158, 11, 0.16) 65%, transparent 100%)',
                                    borderRadius: '50% 50% 45% 45% / 20% 20% 80% 80%',
                                    filter: 'blur(4px)',
                                    mixBlendMode: 'screen'
                                  }}
                                />

                                {/* 3. Intense bulb hotspot on the fixture lip: Softer golden glow */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '2.5%',
                                    width: '2.6%',
                                    height: '1.0%',
                                    borderRadius: '50%',
                                    background: selectedLightTheme === 'light2' ? '#ffffff' : selectedLightTheme === 'light3' ? '#f0f9ff' : '#fffbeb',
                                    filter: 'blur(1.2px)',
                                    boxShadow:
                                      selectedLightTheme === 'light2'
                                        ? '0 0 8px 2px rgba(255, 255, 255, 0.95)'
                                        : selectedLightTheme === 'light3'
                                        ? '0 0 8px 2px rgba(186, 230, 253, 0.85)'
                                        : '0 0 8px 2px rgba(245, 158, 11, 0.75), 0 0 14px 4px rgba(251, 191, 36, 0.30)'
                                  }}
                                />
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {/* 4 Book Positions for this tier */}
                        <div
                          className={`absolute pointer-events-none ${
                            books.some(bIdx => (
                              (hoveredInfoId && (hoveredInfoId.includes(`lightshelf-info-${bIdx}`) || hoveredInfoId.includes(`-${bIdx}`))) ||
                              (openMenuId && (openMenuId.includes(`lightshelf-${bIdx}`) || openMenuId.includes(`-${bIdx}`)))
                            )) ? 'z-[80]' : 'z-20'
                          }`}
                          style={{
                            top: shelfTop,
                            left: cfg.shelf.left,
                            width: cfg.shelf.width,
                            transform: 'translateY(-100%)',
                            height: '1px'
                          }}
                        >
                          {books.map((bookIndex, slotIdx) => {
                            const center = cfg.centers[slotIdx] || '50%';
                            const book = filteredBooks[bookIndex];
                            if (!book) {
                              return (
                                <div
                                  key={`lightshelf-empty-${tierIdx}-${slotIdx}`}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, bookIndex)}
                                  className="pointer-events-auto absolute -translate-x-1/2 bottom-0 flex justify-center items-end z-10"
                                  style={{
                                    left: center,
                                    width: cfg.books.portraitWidth,
                                    aspectRatio: '2.5 / 3.35'
                                  }}
                                >
                                  <div
                                    onClick={() => {
                                      setSelectedBookIdsToAdd([]);
                                      setAddBookSearch('');
                                      setShowAddBookModal(true);
                                    }}
                                    className="w-full h-full rounded-[6px] border border-dashed border-amber-900/30 hover:border-amber-900/60 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-[1px] shadow-sm"
                                    title="Add Book"
                                  >
                                    <div className="relative flex items-center justify-center text-amber-950 transition-transform group-hover:scale-110">
                                      <Icon icon="mdi:book-open-outline" className="w-5 h-5 text-amber-900/90" />
                                      <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-amber-950 leading-none">
                                        +
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-medium text-amber-950/90 group-hover:text-amber-950 tracking-wide">
                                      Add Book
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            const isSlotActive = (hoveredInfoId && (hoveredInfoId.includes(`lightshelf-info-${bookIndex}`) || hoveredInfoId.includes(`-${bookIndex}`))) ||
                              (openMenuId && (openMenuId.includes(`lightshelf-${bookIndex}`) || openMenuId.includes(`-${bookIndex}`)));

                          return (
                            <div
                              key={book.v_id || `lightshelf-book-${bookIndex}`}
                              className={`pointer-events-auto absolute -translate-x-1/2 bottom-0 flex justify-center items-end ${
                                isSlotActive ? 'z-[100]' : 'z-20'
                              }`}
                              style={{
                                left: center,
                                width: book?.card_orientation === 'landscape' ? cfg.books.landscapeWidth : cfg.books.portraitWidth
                              }}
                            >
                              <ShelfBookSlot
                                book={book}
                                bookIndex={bookIndex}
                                bIdx={bookIndex % 4}
                                tooltipPlacement={(bookIndex % 4) >= 2 ? 'left' : 'right'}
                                shelfKey="lightshelf"
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
                                widthOverride="100%"
                              />
                            </div>
                          );
                        })}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                  <>
                    {/* Shelf Base Credenza (base.png): placed at bottom */}
                      <div
                        className="absolute left-0 w-full pointer-events-none z-15"
                        style={{ bottom: 0 }}
                      >
                        <img
                          src={lightShelfBase}
                          alt="Light Shelf Base"
                          className="w-full h-auto block object-cover"
                        />
                      </div>

                    {/* Bottom Left: lamp.png on credenza */}
                    {decors.lamp && (
                      <div
                        className="absolute pointer-events-none z-20 transition-all duration-300"
                        style={{
                          left: '3.2%',
                          bottom: '4.2%',
                          width: '12.8%',
                          filter: 'none'
                        }}
                      >
                        {/* Light inside the lamp dome & warm ambient glow */}
                        {decors.lights && (
                          <>
                            {/* Ambient glow behind lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
                              style={{
                                left: '38%',
                                top: '30%',
                                width: '240%',
                                height: '240%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                                  : 'radial-gradient(circle, rgba(186, 230, 253, 0.40) 0%, rgba(147, 197, 253, 0.18) 35%, rgba(191, 219, 254, 0.05) 60%, transparent 80%)',
                                filter: 'blur(18px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* Downward pool of light on the credenza surface */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 -z-10"
                              style={{
                                left: '38%',
                                top: '36%',
                                width: '220%',
                                height: '130%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.30) 40%, transparent 75%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.70) 0%, rgba(241, 245, 249, 0.32) 40%, transparent 75%)'
                                  : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(240, 249, 255, 0.65) 0%, rgba(186, 230, 253, 0.28) 40%, transparent 75%)',
                                filter: 'blur(9px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* Direct light inside the lamp dome */}
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-30"
                              style={{
                                left: '3%',
                                top: '6%',
                                width: '68%',
                                height: '44%',
                                borderRadius: '50% 50% 18% 18% / 78% 78% 22% 22%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 240, 0.98) 0%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.50) 75%, transparent 100%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.90) 45%, rgba(203, 213, 225, 0.40) 75%, transparent 100%)'
                                  : 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(240, 249, 255, 1) 0%, rgba(186, 230, 253, 0.68) 45%, rgba(147, 197, 253, 0.25) 75%, transparent 100%)',
                                mixBlendMode: 'screen',
                                filter: 'blur(3px)'
                              }}
                            />
                          </>
                        )}

                        <img
                          src={lightShelfLamp}
                          alt="Lamp"
                          className="w-full h-auto block drop-shadow-md relative z-10 transition-all duration-300"
                          style={{
                            filter: decors.lights
                              ? (selectedLightTheme === 'light1'
                                  ? 'brightness(1.08) contrast(1.02)'
                                  : selectedLightTheme === 'light2'
                                  ? 'brightness(1.15) contrast(1.02)'
                                  : 'brightness(1.05) contrast(1.02)')
                              : 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Wall Light Switch on right side */}
                    {showLightSwitch && (
                      <div
                        onClick={() => {
                          if (typeof setDecors === 'function') {
                            setDecors(prev => ({ ...prev, lights: !prev.lights }));
                          }
                        }}
                        className="absolute pointer-events-auto cursor-pointer z-30 transition-transform duration-150 active:scale-95 hover:scale-105 group"
                        style={{
                          right: '4.2%',
                          top: '12.0%',
                          width: '2.8%'
                        }}
                        title={decors?.lights ? "Turn Lights Off" : "Turn Lights On"}
                      >
                        <img
                          src={lightShelfSwitch}
                          alt="Switch"
                          className="w-full h-auto block drop-shadow-md transition-all duration-200 opacity-100"
                        />
                      </div>
                    )}

                    {/* Bottom Right: plantpot.png on credenza */}
                    {decors?.plant !== false && (
                      <div
                        className="absolute pointer-events-none z-20"
                        style={{
                          right: '2.8%',
                          bottom: '4.2%',
                          width: '9.0%'
                        }}
                      >
                        <img
                          src={lightShelfPlant}
                          alt="Plant Pot"
                          className="w-full h-auto block drop-shadow-md"
                        />
                      </div>
                    )}
                  </>
    </>
  );
};

export default LightShelf;
