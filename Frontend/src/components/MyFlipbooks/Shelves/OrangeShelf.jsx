import React from 'react';
import { Icon } from '@iconify/react';

// Orange Shelf Assets
import orangeShelfImg from '../../../assets/Bookshelf/orange_shelf/orange_shelf.png';
import orangeSheet from '../../../assets/Bookshelf/orange_shelf/orangesheet.png';
import orangeBase from '../../../assets/Bookshelf/orange_shelf/base.png';
import orangeLeftWood from '../../../assets/Bookshelf/orange_shelf/leftwood.png';
import orangeWaveShelf from '../../../assets/Bookshelf/orange_shelf/shelf.png';
import orangeLamp from '../../../assets/Bookshelf/orange_shelf/lamp.png';
import orangeGlobe from '../../../assets/Bookshelf/orange_shelf/globedecor.png';
import orangeShelfPlant from '../../../assets/Bookshelf/orange_shelf/shelfplant.png';
import orangeBookDecor from '../../../assets/Bookshelf/orange_shelf/bookdecor.png';
import orangePlant from '../../../assets/Bookshelf/orange_shelf/plant.png';

const OrangeShelf = ({
  filteredBooks,
  decors,
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
  currentUserEmail
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

      {/* 4. Globe Decor on upper wave shelf tier */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          left: '21.4%',
          top: '31.5%',
          width: '5.2%'
        }}
      >
        <img
          src={orangeGlobe}
          alt="Globe Decor"
          className="w-full h-auto block drop-shadow-md"
        />
      </div>

      {/* 5. Shelf Plant on lower wave shelf tier */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          left: '64.2%',
          top: '39.5%',
          width: '6.4%'
        }}
      >
        <img
          src={orangeShelfPlant}
          alt="Shelf Plant"
          className="w-full h-auto block drop-shadow-md"
        />
      </div>

      {/* 6. Wall Sconce Lamp with Light Glow on Right Slats */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          right: '8.2%',
          top: '8.0%',
          width: '8.2%'
        }}
      >
        {decors.lights && (
          <>
            {/* Ambient Wall Wash behind Sconce */}
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
              style={{
                left: '50%',
                top: '40%',
                width: '320%',
                height: '320%',
                background: selectedLightTheme === 'light1'
                  ? 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                  : selectedLightTheme === 'light2'
                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                  : 'radial-gradient(circle, rgba(186, 230, 253, 0.42) 0%, rgba(147, 197, 253, 0.18) 35%, rgba(191, 219, 254, 0.05) 60%, transparent 80%)',
                filter: 'blur(20px)',
                mixBlendMode: 'screen'
              }}
            />
          </>
        )}

        <img
          src={orangeLamp}
          alt="Wall Sconce"
          className="w-full h-auto block drop-shadow-md"
          style={{
            filter: decors.lights
              ? (selectedLightTheme === 'light1'
                  ? 'brightness(1.15) contrast(1.02) drop-shadow(0 0 16px rgba(251, 191, 36, 0.55))'
                  : selectedLightTheme === 'light2'
                  ? 'brightness(1.20) contrast(1.02) drop-shadow(0 0 16px rgba(255, 255, 255, 0.60))'
                  : 'brightness(1.12) contrast(1.02) drop-shadow(0 0 16px rgba(186, 230, 253, 0.55))')
              : 'none'
          }}
        />
      </div>

      {/* 7. Decors on Credenza: Books Stack and Plant in Pot */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          right: '9.2%',
          bottom: '10.6%',
          width: '7.2%'
        }}
      >
        <img
          src={orangeBookDecor}
          alt="Books Decor"
          className="w-full h-auto block drop-shadow-md"
        />
      </div>

      <div
        className="absolute pointer-events-none z-20"
        style={{
          right: '5.0%',
          bottom: '10.6%',
          width: '9.2%'
        }}
      >
        <img
          src={orangePlant}
          alt="Plant Decor"
          className="w-full h-auto block drop-shadow-md"
        />
      </div>

      {/* 8. Book 1 on Upper Shelf Tier */}
      <div
        className="absolute z-20 flex items-end justify-center pointer-events-auto"
        style={{
          left: '28.3%',
          top: '18.5%',
          width: '9.8%',
          height: '24.8%'
        }}
      >
        {(() => {
          const book = filteredBooks && filteredBooks[0];
          if (!book) {
            return (
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 0)}
                className="w-full h-full flex flex-col justify-end items-center"
              >
                <div
                  onClick={() => {
                    setSelectedBookIdsToAdd([]);
                    setAddBookSearch('');
                    setShowAddBookModal(true);
                  }}
                  className="w-full aspect-[2.5/3.4] rounded-[6px] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/20 backdrop-blur-[1px] shadow-sm"
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

          const targetShareId = book.shareId || book.v_id;
          const rawAcc = String(book.access || 'public').toLowerCase();

          return (
            <div
              key={book.v_id || 'orange-book-0'}
              draggable
              onDragStart={(e) => handleDragStart(e, 0)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 0)}
              onDragEnd={handleDragEnd}
              className={`relative w-full h-full flex flex-col justify-end items-center group cursor-pointer ${openMenuId === 'orange-0' ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === 0 ? 'opacity-50' : ''}`}
              onClick={() => {
                if (targetShareId) {
                  window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                }
              }}
            >
              <div className="w-full aspect-[2.5/3.4] relative rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.22)] transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
                <LazyPreview
                  v_id={book.v_id}
                  emailId={book.rawBook?.userEmail || currentUserEmail}
                  backendUrl={backendUrl}
                  iframeBaseUrl=""
                  title={book.title}
                  imageUrl={null}
                />
              </div>

              {/* Hover Menu Pill */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-[2%] -right-[0.4vw] w-[1vw] h-[3vw] bg-[#E8E6E1] rounded-full flex flex-col items-center justify-between py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30 pointer-events-none group-hover:pointer-events-auto"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === 'orange-0' ? null : 'orange-0');
                  }}
                  className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                >
                  <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                </button>
                <div
                  className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                  onMouseEnter={() => setHoveredInfoId('orange-0')}
                  onMouseLeave={() => setHoveredInfoId(null)}
                >
                  <Icon icon="si:info-fill" className="w-4 h-4" />
                </div>
              </div>

              {/* Dropdown Menu */}
              {openMenuId === 'orange-0' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-[2%] -right-[0.5vw] bg-white rounded-[0.5vw] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-[0.2vw] w-[7vw] z-50 overflow-hidden"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (targetShareId) {
                        window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                      }
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    Open Book
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBook(book.v_id);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Remove Book
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* 9. Book 2 on Lower Shelf Tier */}
      <div
        className="absolute z-20 flex items-end justify-center pointer-events-auto"
        style={{
          left: '52.1%',
          top: '35.2%',
          width: '9.8%',
          height: '24.8%'
        }}
      >
        {(() => {
          const book = filteredBooks && filteredBooks[1];
          if (!book) {
            return (
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 1)}
                className="w-full h-full flex flex-col justify-end items-center"
              >
                <div
                  onClick={() => {
                    setSelectedBookIdsToAdd([]);
                    setAddBookSearch('');
                    setShowAddBookModal(true);
                  }}
                  className="w-full aspect-[2.5/3.4] rounded-[6px] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/20 backdrop-blur-[1px] shadow-sm"
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

          const targetShareId = book.shareId || book.v_id;
          const rawAcc = String(book.access || 'public').toLowerCase();

          return (
            <div
              key={book.v_id || 'orange-book-1'}
              draggable
              onDragStart={(e) => handleDragStart(e, 1)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 1)}
              onDragEnd={handleDragEnd}
              className={`relative w-full h-full flex flex-col justify-end items-center group cursor-pointer ${openMenuId === 'orange-1' ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === 1 ? 'opacity-50' : ''}`}
              onClick={() => {
                if (targetShareId) {
                  window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                }
              }}
            >
              <div className="w-full aspect-[2.5/3.4] relative rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.22)] transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
                <LazyPreview
                  v_id={book.v_id}
                  emailId={book.rawBook?.userEmail || currentUserEmail}
                  backendUrl={backendUrl}
                  iframeBaseUrl=""
                  title={book.title}
                  imageUrl={null}
                />
              </div>

              {/* Hover Menu Pill */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-[2%] -right-[0.4vw] w-[1vw] h-[3vw] bg-[#E8E6E1] rounded-full flex flex-col items-center justify-between py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30 pointer-events-none group-hover:pointer-events-auto"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === 'orange-1' ? null : 'orange-1');
                  }}
                  className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                >
                  <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                </button>
                <div
                  className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                  onMouseEnter={() => setHoveredInfoId('orange-1')}
                  onMouseLeave={() => setHoveredInfoId(null)}
                >
                  <Icon icon="si:info-fill" className="w-4 h-4" />
                </div>
              </div>

              {/* Dropdown Menu */}
              {openMenuId === 'orange-1' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-[2%] -right-[0.5vw] bg-white rounded-[0.5vw] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-[0.2vw] w-[7vw] z-50 overflow-hidden"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (targetShareId) {
                        window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                      }
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    Open Book
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBook(book.v_id);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Remove Book
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </>
  );
};

export default OrangeShelf;

