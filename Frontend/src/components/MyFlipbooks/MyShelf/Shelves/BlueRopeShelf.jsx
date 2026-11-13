import React from 'react';
import { Icon } from '@iconify/react';
import ShelfBookSlot from './ShelfBookSlot';

// Blue Rope Shelf Assets
import blueFrameBase from '../../../../assets/Bookshelf/blue_frame/base.png';
import blueFrameLeftShelf from '../../../../assets/Bookshelf/blue_frame/leftshelf.png';
import blueFrameLight from '../../../../assets/Bookshelf/blue_frame/light.png';
import blueFrameDecor from '../../../../assets/Bookshelf/blue_frame/decor.png';
import blueFrameRopeShelf from '../../../../assets/Bookshelf/blue_frame/rope_shelf.png';
import blueFrameSwitch from '../../../../assets/Bookshelf/blue_frame/switch.png';

// ============================================================================
// MANUAL PERCENTAGE ADJUSTMENT CONFIGURATION FOR BLUE ROPE SHELF
// Adjust percentages directly here for both Non-Full View (normal) and Full View (fullView)
// ============================================================================
export const BLUE_ROPE_CONFIG = {
  // Non-Full View (Default Inline View on Shelf Detail Screen)
  normal: {
    // Upper Shelf (Books 1 & 2)
    upperShelf: {
      left: '16.8%',      // Shelf placement across wall
      top: '21.5%',       // Shelf vertical placement on wall
      width: '36.4%',     // Shelf total width
      bottom: '33.8%',    // <<-- Mathematical baseline on wood plank (% from bottom of shelf)
      innerLeft: '11.5%', // Book container offset between ropes
      innerWidth: '77.0%',// Usable width between ropes
      gap: '12.0%',       // Gap between Book 1 & Book 2
      portraitWidth: '37%',
      landscapeWidth: '47%',
      squareWidth: '40%'
    },
    // Lower Shelf (Books 3 & 4)
    lowerShelf: {
      left: '55.8%',      // Shelf placement across wall
      top: '51.5%',       // Shelf vertical placement on wall
      width: '36.4%',     // Shelf total width
      bottom: '33.8%',    // <<-- Mathematical baseline on wood plank (% from bottom of shelf)
      innerLeft: '11.5%', // Book container offset between ropes
      innerWidth: '77.0%',// Usable width between ropes
      gap: '12.0%',       // Gap between Book 3 & Book 4
      portraitWidth: '37%',
      landscapeWidth: '47%',
      squareWidth: '40%'
    }
  },

  // Full View (Fullscreen Mode) - Perfectly coupled to the wooden shelf plank across all aspect ratios
  fullView: {
    // Upper Shelf (Books 1 & 2)
    upperShelf: {
      left: '16.8%',
      top: '21.5%',
      width: '36.4%',
      bottom: '33.8%',    // <<-- Mathematical baseline on wood plank
      innerLeft: '11.5%',
      innerWidth: '77.0%',
      gap: '12.0%',
      portraitWidth: '37%',
      landscapeWidth: '47%',
      squareWidth: '40%'
    },
    // Lower Shelf (Books 3 & 4)
    lowerShelf: {
      left: '55.8%',
      top: '51.5%',
      width: '36.4%',
      bottom: '33.8%',    // <<-- Mathematical baseline on wood plank
      innerLeft: '11.5%',
      innerWidth: '77.0%',
      gap: '12.0%',
      portraitWidth: '37%',
      landscapeWidth: '47%',
      squareWidth: '40%'
    }
  }
};

const BlueRopeShelf = ({
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
                    {/* 1. Left Bookcase Shelf on left wall */}
                    <div
                      className="absolute left-0 top-0 pointer-events-none z-10"
                      style={{
                        bottom: '7.2%',
                        width: '12.4%'
                      }}
                    >
                      <img
                        src={blueFrameLeftShelf}
                        alt="Left Shelf"
                        className="w-full h-full block object-fill"
                      />
                    </div>

                    {/* 2. Base Credenza along bottom (expanded width to reach edges with zero gap) */}
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        left: '-2%',
                        width: '104%',
                        bottom: 0,
                        height: '9.4%'
                      }}
                    >
                      <img
                        src={blueFrameBase}
                        alt="Base"
                        className="w-full h-full block object-fill"
                      />
                    </div>

                    {/* 3. Top-Right Ceiling Hanging Pendant Lamp with Realistic Downward Spread Light Effect */}
                    <div
                      className="absolute top-0 pointer-events-none z-20"
                      style={{
                        right: '4.8%',
                        width: '11.9%'
                      }}
                    >
                      {/* Realistic Downward Spreading Light & Ambiance Effects */}
                      {decors.lights && (
                        <div
                          className="pointer-events-none transition-opacity duration-150"
                          style={{
                            opacity: (Number(lightOpacity ?? 100) / 100)
                          }}
                        >
                          {/* 1. Natural Ambient Radial Light Bloom: shifted downwards so light spreads down onto shelf */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
                            style={{
                              left: '50%',
                              top: '165%',
                              width: '380%',
                              height: '380%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.20) 28%, rgba(245, 158, 11, 0.04) 52%, transparent 70%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.52) 0%, rgba(248, 250, 252, 0.24) 28%, rgba(226, 232, 240, 0.04) 52%, transparent 70%)'
                                : 'radial-gradient(circle at 50% 50%, rgba(186, 230, 253, 0.44) 0%, rgba(147, 197, 253, 0.18) 28%, rgba(191, 219, 254, 0.04) 52%, transparent 70%)',
                              filter: 'blur(32px)',
                              mixBlendMode: 'screen'
                            }}
                          />

                          {/* 2. Soft Downward Core Pool directly beneath the lamp opening */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
                            style={{
                              left: '50%',
                              top: '135%',
                              width: '240%',
                              height: '240%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(circle at 50% 50%, rgba(255, 250, 220, 0.70) 0%, rgba(254, 240, 138, 0.35) 30%, rgba(251, 191, 36, 0.06) 58%, transparent 75%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.76) 0%, rgba(248, 250, 252, 0.40) 30%, rgba(203, 213, 225, 0.06) 58%, transparent 75%)'
                                : 'radial-gradient(circle at 50% 50%, rgba(240, 249, 255, 0.72) 0%, rgba(186, 230, 253, 0.36) 30%, rgba(147, 197, 253, 0.06) 58%, transparent 75%)',
                              filter: 'blur(20px)',
                              mixBlendMode: 'screen'
                            }}
                          />

                          {/* 5. Glowing Bulb Hotspot Opening at Dome Rim */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-30"
                            style={{
                              left: '50%',
                              top: '93%',
                              width: '68%',
                              height: '14%',
                              borderRadius: '50%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(255, 255, 240, 1) 0%, rgba(254, 240, 138, 0.95) 45%, rgba(251, 191, 36, 0.60) 80%, transparent 100%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.95) 45%, rgba(203, 213, 225, 0.50) 80%, transparent 100%)'
                                : 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(224, 242, 254, 0.95) 45%, rgba(147, 197, 253, 0.50) 80%, transparent 100%)',
                              boxShadow: selectedLightTheme === 'light1'
                                ? '0 0 16px 4px rgba(251, 191, 36, 0.85), 0 0 28px 8px rgba(245, 158, 11, 0.40)'
                                : selectedLightTheme === 'light2'
                                ? '0 0 16px 4px rgba(255, 255, 255, 0.90), 0 0 28px 8px rgba(203, 213, 225, 0.40)'
                                : '0 0 16px 4px rgba(186, 230, 253, 0.85), 0 0 28px 8px rgba(147, 197, 253, 0.35)',
                              filter: 'blur(1.5px)',
                              mixBlendMode: 'screen'
                            }}
                          />
                        </div>
                      )}

                      <img
                        src={blueFrameLight}
                        alt="Ceiling Light"
                        className="w-full h-auto block drop-shadow-md relative z-20 transition-all duration-300"
                        style={{
                          filter: decors.lights
                            ? (selectedLightTheme === 'light1'
                                ? `brightness(${1 + 0.10 * (Number(lightOpacity ?? 100) / 100)}) contrast(1.02) drop-shadow(0 0 ${16 * (Number(lightOpacity ?? 100) / 100)}px rgba(251, 191, 36, ${0.45 * (Number(lightOpacity ?? 100) / 100)}))`
                                : selectedLightTheme === 'light2'
                                ? `brightness(${1 + 0.18 * (Number(lightOpacity ?? 100) / 100)}) contrast(1.02) drop-shadow(0 0 ${16 * (Number(lightOpacity ?? 100) / 100)}px rgba(255, 255, 255, ${0.50 * (Number(lightOpacity ?? 100) / 100)}))`
                                : `brightness(${1 + 0.08 * (Number(lightOpacity ?? 100) / 100)}) contrast(1.02) drop-shadow(0 0 ${16 * (Number(lightOpacity ?? 100) / 100)}px rgba(186, 230, 253, ${0.45 * (Number(lightOpacity ?? 100) / 100)}))`)
                            : 'none'
                        }}
                      />
                    </div>

                    {/* 3b. Light Switch on Right Side of Lamp */}
                    {showLightSwitch && (
                      <div
                        onClick={() => {
                          if (typeof setDecors === 'function') {
                            setDecors(prev => ({ ...prev, lights: !prev.lights }));
                          }
                        }}
                        className="absolute pointer-events-auto cursor-pointer z-30 transition-transform duration-150 active:scale-95 hover:scale-105 group"
                        style={{
                          right: '2.4%',
                          top: '12.0%',
                          width: '2.8%'
                        }}
                        title={decors?.lights ? "Turn Lights Off" : "Turn Lights On"}
                      >
                        <img
                          src={blueFrameSwitch}
                          alt="Switch"
                          className="w-full h-auto block drop-shadow-md transition-all duration-200 opacity-100"
                        />
                      </div>
                    )}

                    {/* 4. Bottom-Left Vase/Plant Decor placed on credenza */}
                    <div
                      className="absolute pointer-events-none z-20"
                      style={{
                        left: '13.6%',
                        bottom: '7.2%',
                        width: '12.6%'
                      }}
                    >
                      <img
                        src={blueFrameDecor}
                        alt="Decor"
                        className="w-full h-auto block drop-shadow-md"
                      />
                    </div>

                    {/* 5 & 7. Upper-Left Rope Shelf & Books (Coupled directly with 698/341 aspect ratio) */}
                    {(() => {
                      const modeKey = isFs ? 'fullView' : 'normal';
                      const cfg = BLUE_ROPE_CONFIG[modeKey];
                      const isUpperActive = [0, 1].some(idx => 
                        (hoveredInfoId && (hoveredInfoId.includes(`bluerope-${idx}`) || hoveredInfoId.includes(`fs-bluerope-${idx}`))) || 
                        (openMenuId && (openMenuId.includes(`bluerope-${idx}`) || openMenuId.includes(`fs-bluerope-${idx}`)))
                      );
                      const isLowerActive = [2, 3].some(idx => 
                        (hoveredInfoId && (hoveredInfoId.includes(`bluerope-${idx}`) || hoveredInfoId.includes(`fs-bluerope-${idx}`))) || 
                        (openMenuId && (openMenuId.includes(`bluerope-${idx}`) || openMenuId.includes(`fs-bluerope-${idx}`)))
                      );

                      return (
                        <>
                          {/* Upper-Left Rope Shelf Tier with Integrated Books Container */}
                          <div
                            className={`absolute transition-all ${isUpperActive ? 'z-[90]' : 'z-10'}`}
                            style={{
                              left: cfg.upperShelf.left,
                              top: cfg.upperShelf.top,
                              width: cfg.upperShelf.width,
                              aspectRatio: '698 / 341'
                            }}
                          >
                            <img
                              src={blueFrameRopeShelf}
                              alt="Upper Rope Shelf"
                              className="w-full h-full block drop-shadow-md pointer-events-none"
                            />

                            {/* Books Container pinned directly to the wooden shelf plank baseline */}
                            <div
                              className="absolute inset-x-0 flex items-end justify-center pointer-events-auto"
                              style={{
                                left: cfg.upperShelf.innerLeft || '11.5%',
                                width: cfg.upperShelf.innerWidth || '77.0%',
                                bottom: cfg.upperShelf.bottom || '33.8%',
                                gap: cfg.upperShelf.gap || '12.0%'
                              }}
                            >
                              {[0, 1].map((slotIdx) => {
                                const book = filteredBooks && filteredBooks[slotIdx];
                                if (!book) {
                                  return (
                                    <div
                                      key={`upper-rope-empty-${slotIdx}`}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleDrop && handleDrop(e, slotIdx)}
                                      className="relative flex flex-col justify-end items-center z-10"
                                      style={{ width: cfg.upperShelf.portraitWidth || '37%' }}
                                    >
                                      <div
                                        onClick={() => {
                                          if (setSelectedBookIdsToAdd) setSelectedBookIdsToAdd([]);
                                          if (setAddBookSearch) setAddBookSearch('');
                                          if (setShowAddBookModal) setShowAddBookModal(true);
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
                                    key={book.v_id || `upper-rope-${slotIdx}`}
                                    book={book}
                                    bookIndex={slotIdx}
                                    bIdx={slotIdx}
                                    tooltipPlacement={slotIdx === 1 ? 'left' : 'right'}
                                    shelfKey={isFs ? `fs-bluerope-${slotIdx}` : `bluerope-${slotIdx}`}
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
                                    landscapeWidth={cfg.upperShelf.landscapeWidth || '47%'}
                                    portraitWidth={cfg.upperShelf.portraitWidth || '37%'}
                                    squareWidth={cfg.upperShelf.squareWidth || '40%'}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          {/* Lower-Right Rope Shelf Tier with Integrated Books Container */}
                          <div
                            className={`absolute transition-all ${isLowerActive ? 'z-[90]' : 'z-10'}`}
                            style={{
                              left: cfg.lowerShelf.left,
                              top: cfg.lowerShelf.top,
                              width: cfg.lowerShelf.width,
                              aspectRatio: '698 / 341'
                            }}
                          >
                            <img
                              src={blueFrameRopeShelf}
                              alt="Lower Rope Shelf"
                              className="w-full h-full block drop-shadow-md pointer-events-none"
                            />

                            {/* Books Container pinned directly to the wooden shelf plank baseline */}
                            <div
                              className="absolute inset-x-0 flex items-end justify-center pointer-events-auto"
                              style={{
                                left: cfg.lowerShelf.innerLeft || '11.5%',
                                width: cfg.lowerShelf.innerWidth || '77.0%',
                                bottom: cfg.lowerShelf.bottom || '33.8%',
                                gap: cfg.lowerShelf.gap || '12.0%'
                              }}
                            >
                              {[2, 3].map((slotIdx) => {
                                const book = filteredBooks && filteredBooks[slotIdx];
                                if (!book) {
                                  return (
                                    <div
                                      key={`lower-rope-empty-${slotIdx}`}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleDrop && handleDrop(e, slotIdx)}
                                      className="relative flex flex-col justify-end items-center z-10"
                                      style={{ width: cfg.lowerShelf.portraitWidth || '37%' }}
                                    >
                                      <div
                                        onClick={() => {
                                          if (setSelectedBookIdsToAdd) setSelectedBookIdsToAdd([]);
                                          if (setAddBookSearch) setAddBookSearch('');
                                          if (setShowAddBookModal) setShowAddBookModal(true);
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
                                    key={book.v_id || `lower-rope-${slotIdx}`}
                                    book={book}
                                    bookIndex={slotIdx}
                                    bIdx={slotIdx - 2}
                                    tooltipPlacement={slotIdx === 3 ? 'left' : 'right'}
                                    shelfKey={isFs ? `fs-bluerope-${slotIdx}` : `bluerope-${slotIdx}`}
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
                                    landscapeWidth={cfg.lowerShelf.landscapeWidth || '47%'}
                                    portraitWidth={cfg.lowerShelf.portraitWidth || '37%'}
                                    squareWidth={cfg.lowerShelf.squareWidth || '40%'}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </>
  );
};

export default BlueRopeShelf;
