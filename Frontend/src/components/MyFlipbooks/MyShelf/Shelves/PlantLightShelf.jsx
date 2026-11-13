import React from 'react';
import { Icon } from '@iconify/react';
import ShelfBookSlot from './ShelfBookSlot';

// Plant-Light Shelf Assets
import plantLightShadowSheet from '../../../../assets/Bookshelf/plant-light/shadowsheet.png';
import plantLightLeftDecor from '../../../../assets/Bookshelf/plant-light/leftdecor.png';
import plantLightBase from '../../../../assets/Bookshelf/plant-light/base.png';
import plantLightShelf1 from '../../../../assets/Bookshelf/plant-light/shelf1.png';
import plantLightShelf2 from '../../../../assets/Bookshelf/plant-light/shelf2.png';
import plantLightPlant from '../../../../assets/Bookshelf/plant-light/plant.png';
import plantLightDecor from '../../../../assets/Bookshelf/plant-light/decor.png';
import plantLightLeaf from '../../../../assets/Bookshelf/plant-light/leaf.png';
import plantLightLamp from '../../../../assets/Bookshelf/plant-light/lamp.png';
import plantLightSwitch from '../../../../assets/Bookshelf/plant-light/switch.png';

// ============================================================================
// PLANT LIGHT SHELF CONFIGURATION - Adjust percentages easily here!
// Both 'normal' (inline shelf view) and 'fullView' (fullscreen view) can be tweaked independently.
// ============================================================================
export const PLANT_LIGHT_SHELF_CONFIG = {
  normal: {
    tier0: {
      shelfTop: '35.5%',
      left: '8.25%',
      width: '91.75%'
    },
    tier1: {
      shelfTop: '70.46%',
      left: '8.37%',
      width: '77.08%'
    },
    centers: ['30.5%', '44.5%', '58.5%', '72.5%'],
    books: {
      portraitWidth: '11.5%',
      landscapeWidth: '16.5%'
    }
  },
  fullView: {
    tier0: {
      shelfTop: '35.5%',
      left: '8.25%',
      width: '91.75%'
    },
    tier1: {
      shelfTop: '70.46%',
      left: '8.37%',
      width: '77.08%'
    },
    centers: ['30.5%', '44.5%', '58.5%', '72.5%'],
    books: {
      portraitWidth: '11.5%',
      landscapeWidth: '16.5%'
    }
  }
};

const PlantLightShelf = ({
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
  const cfg = PLANT_LIGHT_SHELF_CONFIG[isFs ? 'fullView' : 'normal'] || PLANT_LIGHT_SHELF_CONFIG.normal;
  return (
    <>
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Shadow Sheet Overlay: when a custom wall theme is selected, blend the window sunlight shadows onto it */}
                    {selectedWallTheme && (
                      <div
                        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80 z-0"
                        style={{
                          backgroundImage: `url('${plantLightShadowSheet}')`,
                          backgroundSize: '100% 100%',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}

                    {/* Left Wall Molding / Decor Column (leftdecor.png) */}
                    <div
                      className="absolute left-0 top-0 pointer-events-none z-10"
                      style={{
                        width: '7.19%',
                        height: '100%'
                      }}
                    >
                      <img
                        src={plantLightLeftDecor}
                        alt="Left Wall Decor"
                        className="w-full h-full block object-fill"
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
                          top: '9.0%',
                          width: '2.5%'
                        }}
                        title={decors?.lights ? "Turn Lights Off" : "Turn Lights On"}
                      >
                        <img
                          src={plantLightSwitch}
                          alt="Switch"
                          className="w-full h-auto block drop-shadow-md transition-all duration-200"
                        />
                      </div>
                    )}

                    {/* Shelf 1 (Top Tier Plank): spans from left 8.25% to right 100% */}
                    <div
                      className="absolute pointer-events-none z-10 transition-all duration-300"
                      style={{
                        top: cfg.tier0.shelfTop,
                        left: cfg.tier0.left,
                        width: cfg.tier0.width
                      }}
                    >
                      <img
                        src={plantLightShelf1}
                        alt="Plant Shelf Tier 1"
                        className="w-full h-auto block drop-shadow-md transition-all duration-300"
                        style={{
                          filter: decors.lights !== false ? 'none' : 'brightness(0.78) contrast(0.92)'
                        }}
                      />
                    </div>

                    {/* Shelf 1 Plant Image (Over Shelf 1 on Left Side): Reduced size placed over left side of shelf */}
                    {decors.plant !== false && (
                      <div
                        className="absolute pointer-events-none z-25"
                        style={{
                          top: cfg.tier0.shelfTop,
                          left: '8.8%',
                          width: '14.0%',
                          transform: 'translateY(-62%)'
                        }}
                      >
                        <img
                          src={plantLightPlant}
                          alt="Shelf 1 Plant"
                          className="w-full h-auto block drop-shadow-md"
                        />
                      </div>
                    )}

                    {/* Shelf 2 (Bottom Tier Plank): shorter plank width matching asset aspect and screenshot */}
                    <div
                      className="absolute pointer-events-none z-10 transition-all duration-300"
                      style={{
                        top: cfg.tier1.shelfTop,
                        left: cfg.tier1.left,
                        width: cfg.tier1.width
                      }}
                    >
                      <img
                        src={plantLightShelf2}
                        alt="Plant Shelf Tier 2"
                        className="w-full h-auto block drop-shadow-md transition-all duration-300"
                        style={{
                          filter: decors.lights !== false ? 'none' : 'brightness(0.78) contrast(0.92)'
                        }}
                      />
                    </div>

                    {/* Shelf 2 Decor (Over Shelf 2 on Left Side): Incense, candle & book stack */}
                    {decors.decor !== false && (
                      <div
                        className="absolute pointer-events-none z-25"
                        style={{
                          top: cfg.tier1.shelfTop,
                          left: '8.97%',
                          width: '13.0%',
                          transform: 'translateY(-85%)'
                        }}
                      >
                        <img
                          src={plantLightDecor}
                          alt="Shelf 2 Decor"
                          className="w-full h-auto block drop-shadow-sm"
                        />
                      </div>
                    )}

                    {/* 2 Tiers of Books: Tier 0 (Shelf 1) & Tier 1 (Shelf 2) */}
                    {[
                      { tierIdx: 0, shelfTop: cfg.tier0.shelfTop, books: [0, 1, 2, 3] },
                      { tierIdx: 1, shelfTop: cfg.tier1.shelfTop, books: [4, 5, 6, 7] }
                    ].map(({ tierIdx, shelfTop, books }) => (
                      <div
                        key={`plantlight-tier-${tierIdx}`}
                        className={`absolute pointer-events-none ${
                          books.some(bIdx => (
                            (hoveredInfoId && (hoveredInfoId.includes(`plantlight-info-${bIdx}`) || hoveredInfoId.includes(`-${bIdx}`))) ||
                            (openMenuId && (openMenuId.includes(`plantlight-${bIdx}`) || openMenuId.includes(`-${bIdx}`)))
                          )) ? 'z-[80]' : 'z-20'
                        }`}
                        style={{
                          top: shelfTop,
                          left: 0,
                          width: '100%',
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
                                key={`plantlight-empty-${tierIdx}-${slotIdx}`}
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

                          const isSlotActive = (hoveredInfoId && (hoveredInfoId.includes(`plantlight-info-${bookIndex}`) || hoveredInfoId.includes(`-${bookIndex}`))) ||
                            (openMenuId && (openMenuId.includes(`plantlight-${bookIndex}`) || openMenuId.includes(`-${bookIndex}`)));

                          return (
                            <div
                              key={book.v_id || `plantlight-book-${bookIndex}`}
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
                                shelfKey="plantlight"
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
                    ))}
                  </div>
                  <>
                    {/* Shelf Base (Credenza): placed at bottom */}
                    <div
                      className="absolute left-0 w-full pointer-events-none z-10"
                      style={{ bottom: 0 }}
                    >
                      <img
                        src={plantLightBase}
                        alt="Plant-Light Shelf Base"
                        className="w-full h-auto block object-cover"
                      />
                    </div>

                    {/* Left Side Bottom Corner: leaf.png (Tropical Leaves in Foreground) */}
                    {decors.leaf !== false && (
                      <div
                        className="absolute pointer-events-none z-30"
                        style={{
                          left: 0,
                          bottom: 0,
                          width: '16.35%'
                        }}
                      >
                        <img
                          src={plantLightLeaf}
                          alt="Bottom Left Leaf"
                          className="w-full h-auto block"
                        />
                      </div>
                    )}

                    {/* Right Side Bottom Corner: lamp.png (Warm Mushroom Table Lamp on Credenza) */}
                    {decors.lamp !== false && (
                      <div
                        className="absolute pointer-events-none z-20 transition-all duration-300"
                        style={{
                          right: '3.0%',
                          bottom: '6.5%',
                          width: '10.5%',
                          filter: 'none'
                        }}
                      >
                        {/* Light inside the lamp dome & warm ambient glow */}
                        {decors.lights && (
                          <>
                            {/* 1. Large ambient wall glow behind the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
                              style={{
                                left: '50%',
                                top: '35%',
                                width: '250%',
                                height: '250%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                                  : 'radial-gradient(circle, rgba(186, 230, 253, 0.40) 0%, rgba(147, 197, 253, 0.18) 35%, rgba(191, 219, 254, 0.05) 60%, transparent 80%)',
                                filter: 'blur(20px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 2. Downward pool of light on credenza top under the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 -z-10"
                              style={{
                                left: '50%',
                                top: '42%',
                                width: '240%',
                                height: '130%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.30) 40%, transparent 75%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.70) 0%, rgba(241, 245, 249, 0.32) 40%, transparent 75%)'
                                  : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(240, 249, 255, 0.65) 0%, rgba(186, 230, 253, 0.28) 40%, transparent 75%)',
                                filter: 'blur(10px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 3. Direct light inside the mushroom lamp dome */}
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-30"
                              style={{
                                left: '5%',
                                top: '2%',
                                width: '90%',
                                height: '48%',
                                borderRadius: '50% 50% 20% 20% / 78% 78% 22% 22%',
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
                          src={plantLightLamp}
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
                  </>
    </>
  );
};

export default PlantLightShelf;
