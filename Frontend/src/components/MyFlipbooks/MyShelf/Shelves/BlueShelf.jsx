import React from 'react';
import { Icon } from '@iconify/react';
import ShelfBookSlot from './ShelfBookSlot';

// Blue Shelf Assets
import blueshelfwood from '../../../../assets/Bookshelf/blueshelf/blueshelfwood.webp';
import bluedecor from '../../../../assets/Bookshelf/blueshelf/bluedecor.webp';
import blueLamp from '../../../../assets/Bookshelf/blueshelf/Lamp.png';
import blueBookWithPot from '../../../../assets/Bookshelf/blueshelf/bookwithpot.png';
import blueSwitch from '../../../../assets/Bookshelf/blueshelf/switch.png';

// ============================================================================
// MANUAL PERCENTAGE ADJUSTMENT CONFIGURATION FOR BLUE SHELF (8 BOOKS)
// Adjust percentages directly here for both Non-Full View (normal) and Full View (fullView)
// ============================================================================
export const BLUE_SHELF_CONFIG = {
  // Non-Full View (Default Inline Shelf Screen)
  normal: {
    rowTops: ['13.5%', '44%'], // Top position of Row 1 and Row 2 shelves
    bottom: '51.8%',           // Vertical baseline resting on wooden shelf plank
    gap: '1.2vw',              // Gap between books (e.g. '1.2vw', '1.5vw', '10px', '2%')
    portraitWidth: '15%',
    landscapeWidth: '22%',
    squareWidth: '18%',
  },

  // Full View (Fullscreen Mode)
  fullView: {
    rowTops: ['13.5%', '44%'],
    bottom: '51.8%',
    gap: '1.2vw',
    portraitWidth: '15%',
    landscapeWidth: '22%',
    squareWidth: '18%',
  }
};

const BlueShelf = ({
  filteredBooks = [],
  decors = { lights: true, lamp: true },
  setDecors,
  showLightSwitch = true,
  lightOpacity = 100,
  selectedLightTheme = 'light1',
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
  const booksPerRow = 4;
  const rowCount = 2;
  const modeKey = isFs ? 'fullView' : 'normal';
  const cfg = BLUE_SHELF_CONFIG[modeKey];
  const rowTops = cfg.rowTops;

  return (
    <>
      {/* 1. Two floating wooden shelves and book slots */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {Array.from({ length: rowCount }, (_, i) => {
          const rowBooks = filteredBooks.slice(i * booksPerRow, (i + 1) * booksPerRow) || [];
          const paddedBooks = [
            ...rowBooks,
            ...Array.from({ length: booksPerRow - rowBooks.length }).fill(null)
          ];

          // Check if this row contains any landscape book
          const hasLandscapeBook = rowBooks.some(b => b && Boolean(
            b.isLandscape ||
            b.orientation === 'landscape' ||
            b.rawBook?.orientation === 'landscape' ||
            b.rawBook?.Customized_Settings?.FlipbookInfo?.orientation === 'landscape' ||
            (b.width && b.height && Number(b.width) > Number(b.height)) ||
            (b.rawBook?.width && b.rawBook?.height && Number(b.rawBook.width) > Number(b.rawBook.height)) ||
            (b.title && /landscape/i.test(b.title)) ||
            (b.rawBook?.flipbookName && /landscape/i.test(b.rawBook.flipbookName))
          ));

          return (
            <div
              key={`blue-shelf-row-${i}`}
              className="absolute left-0 w-full pointer-events-auto"
              style={{
                top: rowTops[i] || '13.5%',
                padding: hasLandscapeBook ? '0 0% 0 26%' : '0 4% 0 26%'
              }}
            >
              <div className="relative w-full">
                {/* Floating Wood Shelf Plank: expands to w-[106%] if landscape, original w-full for portrait */}
                <img
                  src={blueshelfwood}
                  alt="Shelf"
                  className={`${hasLandscapeBook ? 'w-[106%] max-w-none' : 'w-full'} h-auto drop-shadow-lg`}
                />

                {/* Books & Slots Container (Adjustable via BLUE_SHELF_CONFIG above) */}
                <div
                  className={`absolute inset-x-0 flex items-end justify-center pointer-events-auto ${
                    paddedBooks.some((_, bIdx) => {
                      const bookIndex = i * booksPerRow + bIdx;
                      return (
                        (hoveredInfoId && (hoveredInfoId.includes(`blue-shelf-info-${bookIndex}`) || hoveredInfoId.includes(`fs-blue-shelf-${i}`) || hoveredInfoId.includes(`-${bookIndex}`))) ||
                        (openMenuId && (openMenuId.includes(`blue-shelf-${bookIndex}`) || openMenuId.includes(`fs-blue-shelf-${i}`)))
                      );
                    }) ? 'z-[90]' : 'z-20'
                  }`}
                  style={{
                    bottom: cfg.bottom || '51.8%',
                    gap: cfg.gap || '1.2vw',
                    padding: hasLandscapeBook ? '0 5% 0 0' : '0 6% 0 0'
                  }}
                >
                  {paddedBooks.map((book, bIdx) => {
                    const bookIndex = i * booksPerRow + bIdx;

                    // Empty slot -> Add Book button
                    if (!book) {
                      return (
                        <div
                          key={`empty-${i}-${bIdx}`}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop && handleDrop(e, bookIndex)}
                          className="relative flex justify-center items-end translate-y-0 z-10"
                          style={{ width: cfg.portraitWidth || '15%' }}
                        >
                          <div
                            onClick={() => {
                              if (setSelectedBookIdsToAdd) setSelectedBookIdsToAdd([]);
                              if (setAddBookSearch) setAddBookSearch('');
                              if (setShowAddBookModal) setShowAddBookModal(true);
                            }}
                            className="w-full aspect-[1/1.42] rounded-[0.35vw] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/15 backdrop-blur-[1px]"
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

                    // Populated book slot
                    return (
                      <ShelfBookSlot
                        key={book.v_id || `book-${i}-${bIdx}`}
                        book={book}
                        bookIndex={bookIndex}
                        i={i}
                        bIdx={bIdx}
                        shelfKey={isFs ? `fs-blue-shelf-${i}` : 'blue-shelf'}
                        handleDragStart={handleDragStart}
                        handleDragOver={handleDragOver}
                        handleDrop={handleDrop}
                        handleDragEnd={handleDragEnd}
                        draggedBookIndex={draggedBookIndex}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        hoveredInfoId={hoveredInfoId}
                        setHoveredInfoId={setHoveredInfoId}
                        handleRemoveBook={handleRemoveBook}
                        backendUrl={backendUrl}
                        currentUserEmail={currentUserEmail}
                        LazyPreviewComponent={LazyPreview}
                        landscapeWidth={cfg.landscapeWidth || '22%'}
                        portraitWidth={cfg.portraitWidth || '15%'}
                        squareWidth={cfg.squareWidth || '18%'}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Wall Light Switch on right side */}
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
            src={blueSwitch}
            alt="Switch"
            className="w-full h-auto block drop-shadow-md transition-all duration-200 opacity-100"
          />
        </div>
      )}

      {/* 3. Credenza Base along the bottom (bluedecor.webp) with Lamp and Pots */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          left: '-2%',
          width: '104%',
          bottom: '-22%'
        }}
      >
        <div className="relative w-full">
          {/* Console Credenza Image */}
          <img
            src={bluedecor}
            alt="Shelf Credenza"
            className="w-full h-auto block object-cover drop-shadow-md"
          />

          {/* Lamp with Light Wash & Spotlight Glow */}
          {decors?.lamp && (
            <div
              className="absolute pointer-events-none z-20 transition-all duration-300"
              style={{
                left: '5.2%',
                bottom: '54%',
                width: '9.2%'
              }}
            >
              {decors?.lights && (
                <div
                  className="pointer-events-none transition-opacity duration-150"
                  style={{
                    opacity: Number(lightOpacity ?? 100) / 100
                  }}
                >
                  {/* Ambient wall wash behind lamp */}
                  <div
                    className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-0"
                    style={{
                      left: '50%',
                      top: '28%',
                      width: '340%',
                      height: '340%',
                      background:
                        selectedLightTheme === 'light1'
                          ? 'radial-gradient(circle, rgba(251, 191, 36, 0.42) 0%, rgba(245, 158, 11, 0.20) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                          : selectedLightTheme === 'light2'
                            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                            : 'radial-gradient(circle, rgba(186, 230, 253, 0.42) 0%, rgba(147, 197, 253, 0.18) 35%, rgba(191, 219, 254, 0.05) 60%, transparent 80%)',
                      filter: 'blur(22px)',
                      mixBlendMode: 'screen'
                    }}
                  />

                  {/* Downward pool of light on the wooden credenza tabletop */}
                  <div
                    className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 z-0"
                    style={{
                      left: '50%',
                      top: '32%',
                      width: '320%',
                      height: '160%',
                      background:
                        selectedLightTheme === 'light1'
                          ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.32) 40%, transparent 75%)'
                          : selectedLightTheme === 'light2'
                            ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.75) 0%, rgba(241, 245, 249, 0.35) 40%, transparent 75%)'
                            : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(240, 249, 255, 0.70) 0%, rgba(186, 230, 253, 0.32) 40%, rgba(147, 197, 253, 0.08) 65%, transparent 80%)',
                      filter: 'blur(12px)',
                      mixBlendMode: 'screen'
                    }}
                  />

                  {/* Lampshade color transformation layer */}
                  <div
                    className="absolute pointer-events-none transition-all duration-300 z-25"
                    style={{
                      left: '7%',
                      top: '4%',
                      width: '86%',
                      height: '35%',
                      borderRadius: '50% 50% 16% 16% / 78% 78% 22% 22%',
                      background:
                        selectedLightTheme === 'light1'
                          ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 251, 235, 0.95) 0%, rgba(251, 191, 36, 0.70) 50%, rgba(217, 119, 6, 0.30) 85%, transparent 100%)'
                          : selectedLightTheme === 'light2'
                            ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.80) 50%, rgba(203, 213, 225, 0.30) 85%, transparent 100%)'
                            : 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(240, 249, 255, 0.98) 0%, rgba(186, 230, 253, 0.65) 50%, rgba(147, 197, 253, 0.22) 85%, transparent 100%)',
                      mixBlendMode: 'screen',
                      filter: 'blur(3px)'
                    }}
                  />

                  {/* Blue theme color tint on shade */}
                  {selectedLightTheme === 'light3' && (
                    <div
                      className="absolute pointer-events-none transition-all duration-300 z-26"
                      style={{
                        left: '8%',
                        top: '5%',
                        width: '84%',
                        height: '33%',
                        borderRadius: '50% 50% 16% 16% / 78% 78% 22% 22%',
                        background:
                          'linear-gradient(180deg, rgba(147, 197, 253, 0.32) 0%, rgba(186, 230, 253, 0.18) 100%)',
                        mixBlendMode: 'color'
                      }}
                    />
                  )}
                </div>
              )}

              <img
                src={blueLamp}
                alt="Desk Lamp"
                className="w-full h-auto block drop-shadow-md relative z-20 transition-all duration-300"
                style={{
                  filter: decors?.lights
                    ? selectedLightTheme === 'light1'
                      ? 'brightness(1.06) contrast(1.02)'
                      : selectedLightTheme === 'light2'
                        ? 'brightness(1.15) contrast(1.02)'
                        : 'brightness(1.04) contrast(1.02)'
                    : 'none'
                }}
              />
            </div>
          )}

          {/* Ceramic pots & vases sitting on the credenza */}
          {decors?.bookWithPot !== false && (
            <div
              className="absolute pointer-events-none z-15 transition-all duration-300"
              style={{
                left: '14.8%',
                bottom: '50%',
                width: '84%'
              }}
            >
              <img
                src={blueBookWithPot}
                alt="Shelf Decor"
                className="w-full h-auto block object-contain drop-shadow-md"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlueShelf;

