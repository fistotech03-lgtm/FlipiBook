import React from 'react';
import { Icon } from '@iconify/react';
import ShelfBookSlot from './ShelfBookSlot';

// Green-Light Shelf Assets
import greenLightSheet from '../../../../assets/Bookshelf/greenlight/sheet.png';
import greenLightLeftWood from '../../../../assets/Bookshelf/greenlight/Leftwood.png';
import greenLightShelfPlank from '../../../../assets/Bookshelf/greenlight/greenshelf.png';
import greenLightLamp from '../../../../assets/Bookshelf/greenlight/lamp.png';
import greenLightPlant from '../../../../assets/Bookshelf/greenlight/plant.png';
import greenLightBase from '../../../../assets/Bookshelf/greenlight/base.png';
import greenLightFixture from '../../../../assets/Bookshelf/greenlight/light.png';
import greenLightSwitch from '../../../../assets/Bookshelf/greenlight/switch.png';

// ============================================================================
// GREEN LIGHT SHELF CONFIGURATION - Adjust percentages easily here!
// Both 'normal' (inline shelf view) and 'fullView' (fullscreen view) can be tweaked independently.
// ============================================================================
export const GREEN_LIGHT_SHELF_CONFIG = {
  normal: {
    tier0: {
      shelfTop: '35.5%',
      lightTop: '5.5%'
    },
    tier1: {
      shelfTop: '70.0%',
      lightTop: '40.5%'
    },
    shelf: {
      left: '24.0%',
      width: '68.0%'
    },
    centers: ['9.91%', '36.62%', '63.33%', '90.04%'],
    books: {
      portraitWidth: '13.5%',
      landscapeWidth: '18.5%'
    }
  },
  fullView: {
    tier0: {
      shelfTop: '35.5%',
      lightTop: '5.5%'
    },
    tier1: {
      shelfTop: '70.0%',
      lightTop: '40.5%'
    },
    shelf: {
      left: '24.0%',
      width: '68.0%'
    },
    centers: ['9.91%', '36.62%', '63.33%', '90.04%'],
    books: {
      portraitWidth: '13.5%',
      landscapeWidth: '18.5%'
    }
  }
};

const GreenLightShelf = ({
  filteredBooks,
  decors,
  setDecors,
  showLightSwitch = true,
  lightOpacity = 100,
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
  const cfg = GREEN_LIGHT_SHELF_CONFIG[isFs ? 'fullView' : 'normal'] || GREEN_LIGHT_SHELF_CONFIG.normal;
  return (
    <>
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Green Sheet Overlay: when a custom wall theme is selected, blend the green lighting ambiance onto it */}
                    {selectedWallTheme && (
                      <div
                        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80 z-0"
                        style={{
                          backgroundImage: `url('${greenLightSheet}')`,
                          backgroundSize: '100% 100%',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}

                    {/* Left Wood Slats Column (Leftwood.png): rests above base credenza */}
                    <div
                      className="absolute left-0 top-0 pointer-events-none z-10"
                      style={{
                        width: '7.29%',
                        bottom: '8.8%'
                      }}
                    >
                      <img
                        src={greenLightLeftWood}
                        alt="Left Wood Slats"
                        className="w-full h-full block object-cover object-top"
                      />
                    </div>

                    {/* Wall Light Switch in top-right */}
                    {showLightSwitch && (
                      <div
                        onClick={() => {
                          if (typeof setDecors === 'function') {
                            setDecors(prev => ({ ...prev, lights: !prev.lights }));
                          }
                        }}
                        className="absolute pointer-events-auto cursor-pointer z-35 transition-transform duration-150 active:scale-95 hover:scale-105 group"
                        style={{
                          right: '4.5%',
                          top: '10.0%',
                          width: '2.5%'
                        }}
                        title={decors?.lights !== false ? "Turn Lights Off" : "Turn Lights On"}
                      >
                        <img
                          src={greenLightSwitch}
                          alt="Switch"
                          className="w-full h-auto block drop-shadow-md transition-all duration-200"
                        />
                      </div>
                    )}

                    {/* 2 Tiers of Shelves and Spotlights */}
                    {[
                      { tierIdx: 0, shelfTop: cfg.tier0.shelfTop, lightTop: cfg.tier0.lightTop, books: [0, 1, 2, 3] },
                      { tierIdx: 1, shelfTop: cfg.tier1.shelfTop, lightTop: cfg.tier1.lightTop, books: [4, 5, 6, 7] }
                    ].map(({ tierIdx, shelfTop, lightTop, books }) => (
                      <React.Fragment key={`greenlight-tier-${tierIdx}`}>
                        {/* Shelf row: 4 floating shelf segments stretched across the width */}
                        <div
                          className="absolute pointer-events-none z-10"
                          style={{
                            top: shelfTop,
                            left: cfg.shelf.left,
                            width: cfg.shelf.width
                          }}
                        >
                          <img
                            src={greenLightShelfPlank}
                            alt="Green Shelf"
                            className="w-full h-auto block drop-shadow-md"
                          />
                        </div>

                        {/* Top Spotlights for this row - moved up so they are clearly visible above books */}
                        <div
                          className="absolute pointer-events-none z-10"
                          style={{
                            top: lightTop,
                            left: '29.5%',
                            width: '57.0%'
                          }}
                        >
                          <img
                            src={greenLightFixture}
                            alt="Ceiling Spotlights"
                            className="w-full h-auto block drop-shadow-sm relative z-20"
                          />
                        </div>

                        {/* Realistic Studio Spotlight Wall-Wash Beams: vertical downward spread from fixture down onto book */}
                        {decors.lights !== false && (
                          <div
                            className="absolute pointer-events-none z-15 transition-opacity duration-150"
                            style={{
                              top: lightTop,
                              left: cfg.shelf.left,
                              width: cfg.shelf.width,
                              height: '100%',
                              opacity: (Number(lightOpacity ?? 100) / 100)
                            }}
                          >
                            {cfg.centers.map((center, beamIdx) => (
                              <React.Fragment key={`spotlight-beam-${tierIdx}-${beamIdx}`}>
                                {/* 1. Pure Vertical Downward Beam: Narrow at top fixture, smoothly diffusing vertically down over the book */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '3.5%',
                                    width: '13.0%',
                                    height: '26%',
                                    background:
                                      selectedLightTheme === 'light1'
                                        ? 'linear-gradient(to bottom, rgba(255, 250, 220, 0.95) 0%, rgba(254, 240, 138, 0.52) 32%, rgba(251, 191, 36, 0.16) 75%, transparent 100%)'
                                        : selectedLightTheme === 'light2'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.58) 32%, rgba(203, 213, 225, 0.16) 75%, transparent 100%)'
                                        : 'linear-gradient(to bottom, rgba(240, 249, 255, 0.95) 0%, rgba(186, 230, 253, 0.42) 30%, rgba(147, 197, 253, 0.10) 75%, transparent 100%)',
                                    borderRadius: '50% 50% 45% 45% / 25% 25% 75% 75%',
                                    filter: 'blur(7.5px)',
                                    mixBlendMode: 'screen'
                                  }}
                                />

                                {/* 2. Narrow focused core shaft down center of book */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '3%',
                                    width: '5.2%',
                                    height: '20%',
                                    background:
                                      selectedLightTheme === 'light1'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 240, 0.95) 0%, rgba(254, 240, 138, 0.60) 25%, rgba(251, 191, 36, 0.15) 70%, transparent 100%)'
                                        : selectedLightTheme === 'light2'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(248, 250, 252, 0.65) 25%, rgba(203, 213, 225, 0.15) 70%, transparent 100%)'
                                        : 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(224, 242, 254, 0.60) 25%, rgba(186, 230, 253, 0.12) 70%, transparent 100%)',
                                    borderRadius: '50% 50% 45% 45% / 20% 20% 80% 80%',
                                    filter: 'blur(4.5px)',
                                    mixBlendMode: 'screen'
                                  }}
                                />

                                {/* 3. Intense bulb hotspot on the fixture lip */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '2.5%',
                                    width: '2.6%',
                                    height: '1.0%',
                                    borderRadius: '50%',
                                    background: '#ffffff',
                                    filter: 'blur(1.2px)',
                                    boxShadow:
                                      selectedLightTheme === 'light1'
                                        ? '0 0 8px 2px rgba(251, 191, 36, 0.90)'
                                        : selectedLightTheme === 'light2'
                                        ? '0 0 8px 2px rgba(255, 255, 255, 0.95)'
                                        : '0 0 8px 2px rgba(186, 230, 253, 0.85)'
                                  }}
                                />
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {/* 4 Book Positions for this tier - sized proportionally so spotlight & shadow are clearly visible above */}
                        <div
                          className={`absolute pointer-events-none ${
                            books.some(bIdx => (
                              (hoveredInfoId && (hoveredInfoId.includes(`greenlight-info-${bIdx}`) || hoveredInfoId.includes(`-${bIdx}`))) ||
                              (openMenuId && (openMenuId.includes(`greenlight-${bIdx}`) || openMenuId.includes(`-${bIdx}`)))
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
                                  key={`greenlight-empty-${tierIdx}-${slotIdx}`}
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
                                    className="w-full h-full rounded-[6px] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/20 backdrop-blur-[1px] shadow-sm"
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

                            const isSlotActive = (hoveredInfoId && (hoveredInfoId.includes(`greenlight-info-${bookIndex}`) || hoveredInfoId.includes(`-${bookIndex}`))) ||
                              (openMenuId && (openMenuId.includes(`greenlight-${bookIndex}`) || openMenuId.includes(`-${bookIndex}`)));

                          return (
                            <div
                              key={book.v_id || `greenlight-book-${bookIndex}`}
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
                                shelfKey="greenlight"
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
                          src={greenLightBase}
                          alt="Green-Light Shelf Base"
                          className="w-full h-auto block object-cover"
                        />
                      </div>

                    {/* Bottom Left: lamp.png with books placed on credenza */}
                    {decors.lamp !== false && (
                      <div
                        className="absolute pointer-events-none z-20 transition-all duration-300"
                        style={{
                          left: '1.2%',
                          bottom: '6.5%',
                          width: '15.2%',
                          filter: 'none'
                        }}
                      >
                        {/* Light inside the lamp dome (lamp kulla light) & surrounding ambiance */}
                        {decors.lights !== false && (
                          <div
                            className="pointer-events-none transition-opacity duration-150"
                            style={{
                              opacity: (Number(lightOpacity ?? 100) / 100)
                            }}
                          >
                            {/* 1. Large ambient wall glow behind the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
                              style={{
                                left: '28%',
                                top: '24%',
                                width: '260%',
                                height: '260%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                                  : 'radial-gradient(circle, rgba(186, 230, 253, 0.40) 0%, rgba(147, 197, 253, 0.18) 35%, rgba(191, 219, 254, 0.05) 60%, transparent 80%)',
                                filter: 'blur(20px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 2. Downward pool of light on the wooden credenza tabletop under the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 -z-10"
                              style={{
                                left: '28%',
                                top: '30%',
                                width: '250%',
                                height: '140%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.30) 40%, transparent 75%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.70) 0%, rgba(241, 245, 249, 0.32) 40%, transparent 75%)'
                                  : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(240, 249, 255, 0.65) 0%, rgba(186, 230, 253, 0.28) 40%, transparent 75%)',
                                filter: 'blur(10px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 3. Direct light inside the lamp dome (lamp kulla irukura light) */}
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-30"
                              style={{
                                left: '2.5%',
                                top: '1.5%',
                                width: '53.5%',
                                height: '48%',
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

                            {/* 4. Soft halo rim glow around the lamp dome edge */}
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-20"
                              style={{
                                left: '0%',
                                top: '0%',
                                width: '58%',
                                height: '52%',
                                borderRadius: '50% 50% 20% 20% / 78% 78% 22% 22%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(254, 240, 138, 0.70) 0%, rgba(245, 158, 11, 0.35) 60%, transparent 90%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(255, 255, 255, 0.75) 0%, rgba(203, 213, 225, 0.35) 60%, transparent 90%)'
                                  : 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(240, 249, 255, 0.75) 0%, rgba(186, 230, 253, 0.28) 60%, transparent 90%)',
                                mixBlendMode: 'screen',
                                filter: 'blur(7px)'
                              }}
                            />
                          </div>
                        )}

                        <img
                          src={greenLightLamp}
                          alt="Lamp and Books"
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

                    {/* Bottom Right: plant.png in vase with spherical decor placed on credenza */}
                    {decors.plant !== false && (
                      <div
                        className="absolute pointer-events-none z-20"
                        style={{
                          right: '2.5%',
                          bottom: '6.5%',
                          width: '9.6%'
                        }}
                      >
                        <img
                          src={greenLightPlant}
                          alt="Plant with Vase"
                          className="w-full h-auto block drop-shadow-md"
                        />
                      </div>
                    )}
                  </>
    </>
  );
};

export default GreenLightShelf;
