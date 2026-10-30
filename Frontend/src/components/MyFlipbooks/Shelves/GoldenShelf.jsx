import React from 'react';
import { Icon } from '@iconify/react';

// Golden Shelf Assets
import goldenShelfBase from '../../../assets/Bookshelf/golden_shelf/base.png';
import goldenShelfPlank from '../../../assets/Bookshelf/golden_shelf/shelf.png';
import goldenShelfLight from '../../../assets/Bookshelf/golden_shelf/light.png';
import goldenShelfDecor from '../../../assets/Bookshelf/golden_shelf/decor.png';
import goldenShelfPlant from '../../../assets/Bookshelf/golden_shelf/plant.png';

const GoldenShelf = ({
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

      {/* 2. Top Spotlight Beam / Fixture */}
      <div
        className="absolute pointer-events-none z-15"
        style={{
          left: '21.7%',
          top: '14.0%',
          width: '61.6%'
        }}
      >
        {decors.lights && (
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{
              background: selectedLightTheme === 'light1'
                ? 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.20) 45%, transparent 75%)'
                : selectedLightTheme === 'light2'
                ? 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.22) 45%, transparent 75%)'
                : 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(186, 230, 253, 0.42) 0%, rgba(147, 197, 253, 0.18) 45%, transparent 75%)',
              filter: 'blur(20px)',
              mixBlendMode: 'screen'
            }}
          />
        )}
        <img
          src={goldenShelfLight}
          alt="Lights"
          className="w-full h-auto block drop-shadow-md"
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
      </div>

      {/* 3. Main Center Shelf Plank */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          left: '16.5%',
          top: '40.1%',
          width: '86.8%'
        }}
      >
        <img
          src={goldenShelfPlank}
          alt="Golden Shelf Plank"
          className="w-full h-auto block drop-shadow-md"
        />
      </div>

      {/* 4. Plant sitting at the right edge of the shelf plank */}
      <div
        className="absolute pointer-events-none z-25"
        style={{
          left: '77.5%',
          top: '39.8%',
          width: '13.5%'
        }}
      >
        <img
          src={goldenShelfPlant}
          alt="Hanging Plant"
          className="w-full h-auto block drop-shadow-md"
        />
      </div>

      {/* 5. Decor (Ceramic vase & books) sitting on bottom-left just above base credenza */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          left: '1.2%',
          bottom: '14.8%',
          width: '12.0%'
        }}
      >
        <img
          src={goldenShelfDecor}
          alt="Decor"
          className="w-full h-auto block drop-shadow-md"
        />
      </div>

      {/* 6. Exactly 4 Books Placed Side-by-Side on the Shelf */}
      <div
        className="absolute z-20 flex items-end pointer-events-auto"
        style={{
          left: '24.2%',
          top: '37.3%',
          width: '52.3%',
          height: '22.8%',
          gap: '4.5%'
        }}
      >
        {[0, 1, 2, 3].map((slotIdx) => {
          const book = filteredBooks && filteredBooks[slotIdx];
          if (!book) {
            return (
              <div
                key={`golden-empty-${slotIdx}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slotIdx)}
                className="relative flex-1 h-full flex flex-col justify-end items-center"
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
              key={book.v_id || `golden-book-${slotIdx}`}
              draggable
              onDragStart={(e) => handleDragStart(e, slotIdx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slotIdx)}
              onDragEnd={handleDragEnd}
              className={`relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer ${openMenuId === `golden-${slotIdx}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === slotIdx ? 'opacity-50' : ''}`}
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
                    setOpenMenuId(openMenuId === `golden-${slotIdx}` ? null : `golden-${slotIdx}`);
                  }}
                  className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                >
                  <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                </button>
                <div
                  className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                  onMouseEnter={() => setHoveredInfoId(`golden-${slotIdx}`)}
                  onMouseLeave={() => setHoveredInfoId(null)}
                >
                  <Icon icon="si:info-fill" className="w-4 h-4" />
                </div>
              </div>

              {/* Dropdown Menu */}
              {openMenuId === `golden-${slotIdx}` && (
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
        })}
      </div>
    </>
  );
};

export default GoldenShelf;
