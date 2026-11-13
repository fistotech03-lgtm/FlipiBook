import React from 'react';
import { Icon } from '@iconify/react';
import ShelfBookSlot from './ShelfBookSlot';

// Orange Shelf Assets
import orangeShelfImg from '../../../../assets/Bookshelf/orange_shelf/orange_shelf.png';
import orangeSheet from '../../../../assets/Bookshelf/orange_shelf/orangesheet.png';
import orangeBase from '../../../../assets/Bookshelf/orange_shelf/base.png';
import orangeLeftWood from '../../../../assets/Bookshelf/orange_shelf/leftwood.png';
import orangeWaveShelf from '../../../../assets/Bookshelf/orange_shelf/shelf.png';
import orangeLamp from '../../../../assets/Bookshelf/orange_shelf/lamp.png';
import orangeGlobe from '../../../../assets/Bookshelf/orange_shelf/globedecor.png';
import orangeShelfPlant from '../../../../assets/Bookshelf/orange_shelf/shelfplant.png';
import orangeBookDecor from '../../../../assets/Bookshelf/orange_shelf/bookdecor.png';
import orangePlant from '../../../../assets/Bookshelf/orange_shelf/plant.png';
import orangeSwitch from '../../../../assets/Bookshelf/orange_shelf/switch.png';

// ============================================================================
// MANUAL PERCENTAGE ADJUSTMENT CONFIGURATION FOR ORANGE SHELF
// Adjust percentages directly here for both Non-Full View (normal) and Full View (fullView)
// ============================================================================
export const ORANGE_SHELF_CONFIG = {
  // Non-Full View (Default Inline Shelf Screen)
  normal: {
    upperShelf: {
      left: '28.3%',           // Shift portrait book left / right
      landscapeLeft: '26.5%',  // Shift landscape book left / right
      top: '21%',            // Vertical position (lands flush at 46.9% on upper wave tier)
      height: '24.8%',
      portraitWidth: '9.8%',
      landscapeWidth: '13.5%',
      squareWidth: '11.5%'
    },
    lowerShelf: {
      left: '52.1%',           // Shift portrait book left / right
      landscapeLeft: '50.2%',  // Shift landscape book left / right
      top: '33.5%',            // Vertical position (lands flush at 57.3% on lower wave tier)
      height: '24.8%',
      portraitWidth: '9.8%',
      landscapeWidth: '13.5%',
      squareWidth: '11.5%'
    }
  },

  // Full View (Fullscreen Mode) - Coupled to wave shelf baseline
  fullView: {
    upperShelf: {
      left: '28.3%',
      landscapeLeft: '26.5%',
      top: '21%',
      height: '24.8%',
      portraitWidth: '9.8%',
      landscapeWidth: '13.5%',
      squareWidth: '11.5%'
    },
    lowerShelf: {
      left: '52.1%',
      landscapeLeft: '50.2%',
      top: '33.5%',
      height: '24.8%',
      portraitWidth: '9.8%',
      landscapeWidth: '13.5%',
      squareWidth: '11.5%'
    }
  }
};

const OrangeShelf = ({
  filteredBooks,
  decors,
  setDecors,
  showLightSwitch = true,
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
      {/* 1. Right Wood Slats Panel */}
      <div
        className="absolute right-0 top-0 pointer-events-none z-10"
        style={{
          width: '9.63%',
          bottom: '10.6%'
        }}
      >
        <img
          src={orangeLeftWood}
          alt="Wood Panel"
          className="w-full h-full block object-cover object-top"
        />
      </div>

      {/* 1b. Wall Light Switch on right side wood top */}
      {showLightSwitch && (
        <div
          onClick={() => {
            if (typeof setDecors === 'function') {
              setDecors(prev => ({ ...prev, lights: !prev.lights }));
            }
          }}
          className="absolute pointer-events-auto cursor-pointer z-25 transition-transform duration-150 active:scale-95 hover:scale-105 group"
          style={{
            right: '3.3%',
            top: '7.5%',
            width: '3.0%'
          }}
          title={decors.lights ? "Turn Lights Off" : "Turn Lights On"}
        >
          <img
            src={orangeSwitch}
            alt="Switch"
            className="w-full h-auto block drop-shadow-md transition-all duration-200 opacity-100"
          />
        </div>
      )}

      {/* 2. Base Credenza along the bottom */}
      <div
        className="absolute left-0 w-full pointer-events-none z-10"
        style={{
          bottom: 0,
          height: '10.6%'
        }}
      >
        <img
          src={orangeBase}
          alt="Base Credenza"
          className="w-full h-full block object-fill"
        />
      </div>

      {/* 3. Floating Modern Wave Shelf */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          left: '18.4%',
          top: '43.5%',
          width: '52.6%'
        }}
      >
        <img
          src={orangeWaveShelf}
          alt="Wave Shelf"
          className="w-full h-auto block drop-shadow-md"
        />
      </div>

      {/* 4. Globe Decor on upper wave shelf tier - resting firmly on the shelf left edge */}
      {decors.globeDecor !== false && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: '19.2%',
            top: '32.6%',
            width: '9.2%'
          }}
        >
          <img
            src={orangeGlobe}
            alt="Globe Decor"
            className="w-full h-auto block drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
          />
        </div>
      )}

      {/* 5. Shelf Plant on lower wave shelf tier - resting firmly on the shelf edge */}
      {decors.shelfPlant !== false && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: '62.2%',
            top: '43.2%',
            width: '10.2%'
          }}
        >
          <img
            src={orangeShelfPlant}
            alt="Shelf Plant"
            className="w-full h-auto block drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
          />
        </div>
      )}

      {/* 6. Wall Sconce Lamp with Light Glow on Right Slats */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          right: '11.2%',
          top: '6.8%',
          width: '11.0%'
        }}
      >
        {/* Ambient Wall Wash radiating smoothly behind the entire lamp */}
        {decors.lights && (
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-0"
            style={{
              left: '38%',
              top: '22%',
              width: '360%',
              height: '360%',
              background: selectedLightTheme === 'light1'
                ? 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.18) 35%, rgba(217, 119, 6, 0.04) 65%, transparent 100%)'
                : selectedLightTheme === 'light2'
                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(248, 250, 252, 0.18) 35%, rgba(226, 232, 240, 0.04) 65%, transparent 100%)'
                  : 'radial-gradient(circle, rgba(186, 230, 253, 0.45) 0%, rgba(147, 197, 253, 0.20) 35%, rgba(96, 165, 250, 0.04) 65%, transparent 100%)',
              filter: 'blur(30px)',
              mixBlendMode: 'screen'
            }}
          />
        )}

        {/* 1. Base Lamp Image: Always in its original golden metal tones (untouched holder/plate) */}
        <img
          src={orangeLamp}
          alt="Wall Sconce"
          className="w-full h-auto block drop-shadow-md relative z-10 transition-all duration-300"
          style={{
            filter: decors.lights
              ? (selectedLightTheme === 'light1'
                ? 'brightness(1.15) contrast(1.02) drop-shadow(0 0 16px rgba(251, 191, 36, 0.55))'
                : selectedLightTheme === 'light2'
                  ? 'brightness(1.18) contrast(1.02) drop-shadow(0 0 16px rgba(255, 255, 255, 0.65))'
                  : 'brightness(1.15) contrast(1.02) drop-shadow(0 0 16px rgba(96, 165, 250, 0.60))')
              : 'none'
          }}
        />

        {/* 2. Top Shade Color Transformation: Strictly clipped to the upper lampshade (0% - 41.5% height), keeping the metallic holder & arm 100% golden */}
        {decors.lights && selectedLightTheme !== 'light1' && (
          <div
            className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 41.5%, 0% 41.5%)'
            }}
          >
            <img
              src={orangeLamp}
              alt="Lamp Shade Glow"
              className="w-full h-auto block transition-all duration-300"
              style={{
                filter: selectedLightTheme === 'light2'
                  ? 'brightness(1.22) contrast(1.05) saturate(0.12)'
                  : 'brightness(1.20) contrast(1.05) hue-rotate(185deg) saturate(1.4)'
              }}
            />
          </div>
        )}
      </div>

      {/* 7. Decors on Credenza: Books Stack and Plant in Pot - firmly landed on bottom credenza tabletop */}
      {decors.bookDecor !== false && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            right: '10.8%',
            bottom: '7.0%',
            width: '7.8%'
          }}
        >
          <img
            src={orangeBookDecor}
            alt="Books Decor"
            className="w-full h-auto block drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
          />
        </div>
      )}

      {decors.basePlant !== false && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            right: '3.6%',
            bottom: '7.0%',
            width: '9.8%'
          }}
        >
          <img
            src={orangePlant}
            alt="Plant Decor"
            className="w-full h-auto block drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
          />
        </div>
      )}

      {/* 8. Book 1 on Upper Shelf Tier (Adjustable via ORANGE_SHELF_CONFIG above) */}
      {(() => {
        const modeKey = isFs ? 'fullView' : 'normal';
        const cfg = ORANGE_SHELF_CONFIG[modeKey].upperShelf;
        const book = filteredBooks && filteredBooks[0];
        const rawOri = (book?.orientation || book?.rawBook?.orientation || '').toLowerCase();
        const isLandscape = rawOri.includes('landscape') || rawOri.includes('horizontal') || book?.isLandscape || /landscape/i.test(book?.title || '') || /landscape/i.test(book?.rawBook?.flipbookName || '');
        return (
          <div
            className={`absolute flex items-end justify-center pointer-events-auto ${
              (hoveredInfoId?.includes('orange-shelf-0') || openMenuId?.includes('orange-shelf-0')) ? 'z-[100]' : 'z-20'
            }`}
            style={{
              left: isLandscape ? cfg.landscapeLeft : cfg.left,
              top: cfg.top,
              width: isLandscape ? cfg.landscapeWidth : cfg.portraitWidth,
              height: cfg.height
            }}
          >
            {!book ? (
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 0)}
                className="w-full h-full flex flex-col justify-end items-center z-10"
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
                    <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-white leading-none">+</span>
                  </div>
                  <span className="text-[9px] font-medium text-white/90 group-hover:text-white tracking-wide">
                    Add Book
                  </span>
                </div>
              </div>
            ) : (
              <ShelfBookSlot
                key={book.v_id || 'orange-book-0'}
                book={book}
                bookIndex={0}
                bIdx={0}
                tooltipPlacement="right"
                shelfKey={isFs ? 'fs-orange-shelf-0' : 'orange-shelf-0'}
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
            )}
          </div>
        );
      })()}

      {/* 9. Book 2 on Lower Shelf Tier (Adjustable via ORANGE_SHELF_CONFIG above) */}
      {(() => {
        const modeKey = isFs ? 'fullView' : 'normal';
        const cfg = ORANGE_SHELF_CONFIG[modeKey].lowerShelf;
        const book = filteredBooks && filteredBooks[1];
        const rawOri = (book?.orientation || book?.rawBook?.orientation || '').toLowerCase();
        const isLandscape = rawOri.includes('landscape') || rawOri.includes('horizontal') || book?.isLandscape || /landscape/i.test(book?.title || '') || /landscape/i.test(book?.rawBook?.flipbookName || '');
        return (
          <div
            className={`absolute flex items-end justify-center pointer-events-auto ${
              (hoveredInfoId?.includes('orange-shelf-1') || openMenuId?.includes('orange-shelf-1')) ? 'z-[100]' : 'z-20'
            }`}
            style={{
              left: isLandscape ? cfg.landscapeLeft : cfg.left,
              top: cfg.top,
              width: isLandscape ? cfg.landscapeWidth : cfg.portraitWidth,
              height: cfg.height
            }}
          >
            {!book ? (
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 1)}
                className="w-full h-full flex flex-col justify-end items-center z-10"
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
                    <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-white leading-none">+</span>
                  </div>
                  <span className="text-[9px] font-medium text-white/90 group-hover:text-white tracking-wide">
                    Add Book
                  </span>
                </div>
              </div>
            ) : (
              <ShelfBookSlot
                key={book.v_id || 'orange-book-1'}
                book={book}
                bookIndex={1}
                bIdx={1}
                tooltipPlacement="left"
                shelfKey={isFs ? 'fs-orange-shelf-1' : 'orange-shelf-1'}
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
            )}
          </div>
        );
      })()}
    </>
  );
};

export default OrangeShelf;

