import React from 'react';
import { Icon } from '@iconify/react';

// Golden Shelf Assets
import goldenShelfBase from '../../../../assets/Bookshelf/golden_shelf/base.png';
import goldenShelfPlank from '../../../../assets/Bookshelf/golden_shelf/shelf.png';
import goldenShelfLight from '../../../../assets/Bookshelf/golden_shelf/light.png';
import goldenShelfDecor from '../../../../assets/Bookshelf/golden_shelf/decor.png';
import goldenShelfPlant from '../../../../assets/Bookshelf/golden_shelf/plant.png';
import goldenShelfSwitch from '../../../../assets/Bookshelf/golden_shelf/switch.png';

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

      {/* 6. Exactly 4 Books Placed Side-by-Side on the Shelf - Each directly centered under its spotlight bulb */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
      >
        {[
          { center: '25.4%' },
          { center: '40.3%' },
          { center: '53.6%' },
          { center: '68.2%' }
        ].map(({ center }, slotIdx) => {
          const book = filteredBooks && filteredBooks[slotIdx];
          if (!book) {
            return (
              <div
                key={`golden-empty-${slotIdx}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slotIdx)}
                className="absolute pointer-events-auto -translate-x-1/2 flex flex-col justify-end items-center"
                style={{
                  left: center,
                  top: '33.5%',
                  width: '9.8%',
                  height: '26.5%'
                }}
              >
                <div
                  onClick={() => {
                    setSelectedBookIdsToAdd([]);
                    setAddBookSearch('');
                    setShowAddBookModal(true);
                  }}
                  className="w-full aspect-[2.5/3.25] rounded-[6px] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/15 backdrop-blur-[1px] shadow-sm"
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
          const isLandscape = Boolean(
            book.isLandscape ||
            book.orientation === 'landscape' ||
            book.rawBook?.orientation === 'landscape' ||
            (book.width && book.height && Number(book.width) > Number(book.height)) ||
            (book.title && /landscape/i.test(book.title)) ||
            (book.rawBook?.flipbookName && /landscape/i.test(book.rawBook.flipbookName))
          );

          return (
            <div
              key={book.v_id || `golden-book-${slotIdx}`}
              draggable
              onDragStart={(e) => handleDragStart(e, slotIdx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slotIdx)}
              onDragEnd={handleDragEnd}
              className={`absolute pointer-events-auto -translate-x-1/2 flex flex-col justify-end items-center group cursor-pointer ${openMenuId === `golden-${slotIdx}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === slotIdx ? 'opacity-50' : ''}`}
              style={{
                left: center,
                top: isLandscape ? '36.5%' : '33.5%',
                width: isLandscape ? '14%' : '9.8%',
                height: '26.5%'
              }}
              onClick={() => {
                if (targetShareId) {
                  window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                }
              }}
            >
              <div className={`w-full ${isLandscape ? 'aspect-[3.25/2.1]' : 'aspect-[2.5/3.25]'} relative rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.22)] transition-transform origin-bottom group-hover:scale-105 overflow-hidden`}>
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

                  {/* Info Tooltip Bridge & Container */}
                  <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `golden-${slotIdx}` ? 'block' : 'hidden'} z-[60]`}>
                    <div className="w-[170px] bg-white rounded-xl p-4 text-gray-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col gap-3 cursor-default text-left border border-gray-100 relative">
                      {/* Author Info */}
                      <div className="flex items-center gap-2">
                        {book.authorPicture && book.authorPicture !== 'color_only' ? (
                          <img
                            src={book.authorPicture}
                            alt={book.authorName}
                            className="w-8 h-8 rounded-full border border-gray-200 object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-inner"
                            style={{ backgroundColor: book.authorBgColor || '#3B82F6' }}
                          >
                            {(book.authorName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0 pr-1">
                          <span className="text-[13px] font-semibold text-gray-900 leading-tight truncate">{book.authorName || 'Creator'}</span>
                          <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5 truncate">
                            <Icon icon="lucide:map-pin" className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{String(book.location || 'Coimbatore').replace(/📍/g, '').trim()}</span>
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-2 justify-start text-[11px] text-gray-700 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-black font-semibold">{book.pages || 0}</span>
                          <span className="font-normal text-gray-500">Pages</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1">
                          <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-gray-400" />
                          {book.views || '1.2k'}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1">
                          <Icon icon="material-symbols:star" className="w-3.5 h-3.5 text-yellow-400" />
                          {book.rating || 4.5}
                        </span>
                      </div>

                      {/* Title & Desc & Button */}
                      <div className="relative">
                        <h4 className="text-[14px] font-semibold text-black truncate tracking-tight mb-1">{book.title}</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed pr-10 line-clamp-2">{book.description}</p>

                        {/* Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (targetShareId) {
                              window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                            }
                          }}
                          className="absolute bottom-0 right-0 bg-black text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                        >
                          <Icon icon="mdi:arrow-top-right" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
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
