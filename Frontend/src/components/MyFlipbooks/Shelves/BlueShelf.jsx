import React from 'react';
import { Icon } from '@iconify/react';

// Blue Shelf Assets
import blueshelfwood from '../../../assets/Bookshelf/blueshelf/blueshelfwood.webp';
import bluedecor from '../../../assets/Bookshelf/blueshelf/bluedecor.webp';
import blueLamp from '../../../assets/Bookshelf/blueshelf/Lamp.png';
import blueBookWithPot from '../../../assets/Bookshelf/blueshelf/bookwithpot.png';
import blueSwitch from '../../../assets/Bookshelf/blueshelf/switch.png';

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
  currentUserEmail
}) => {
  const booksPerRow = 4;
  const rowCount = 2;
  const rowTops = ['13.5%', '44%'];

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

          return (
            <div
              key={`blue-shelf-row-${i}`}
              className="absolute left-0 w-full pointer-events-auto"
              style={{
                top: rowTops[i] || '13.5%',
                padding: '0 4% 0 26%'
              }}
            >
              <div className="relative w-full">
                {/* Floating Wood Shelf Plank */}
                <img
                  src={blueshelfwood}
                  alt="Shelf"
                  className="w-full h-auto drop-shadow-lg"
                />

                {/* Books & Slots Container */}
                <div
                  className="absolute inset-x-0 flex items-end justify-center gap-[2vw]"
                  style={{ bottom: '51.8%', padding: '0 6% 0 0' }}
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
                          className="relative flex justify-center items-end translate-y-0"
                          style={{ width: '15%' }}
                        >
                          <div
                            onClick={() => {
                              if (setSelectedBookIdsToAdd) setSelectedBookIdsToAdd([]);
                              if (setAddBookSearch) setAddBookSearch('');
                              if (setShowAddBookModal) setShowAddBookModal(true);
                            }}
                            className="w-full aspect-[2.5/3.25] rounded-[6px] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/15 backdrop-blur-[1px]"
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
                    const emailFolder = book.rawBook?.userEmail
                      ? book.rawBook.userEmail.replace(/[@.]/g, '_')
                      : '';
                    const folderName =
                      book.rawBook?.folderName && book.rawBook.folderName.length > 0
                        ? book.rawBook.folderName[0]
                        : book.rawBook?.folder || '';
                    const bookName = book.rawBook?.flipbookName || book.rawBook?.title || '';
                    const basePath = '';

                    return (
                      <div
                        key={book.v_id || `book-${i}-${bIdx}`}
                        draggable
                        onDragStart={(e) => handleDragStart && handleDragStart(e, bookIndex)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop && handleDrop(e, bookIndex)}
                        onDragEnd={handleDragEnd}
                        className={`relative group cursor-pointer flex justify-center items-end translate-y-0 ${openMenuId === `${i}-${bIdx}` ? 'z-40' : 'hover:z-30'
                          } ${draggedBookIndex === bookIndex ? 'opacity-50' : ''}`}
                        style={{ width: '15%' }}
                      >
                        <div className="w-[100%] aspect-[2.5/3.25] relative rounded-[3px] drop-shadow-md transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
                          {LazyPreview && (
                            <LazyPreview
                              v_id={book.v_id}
                              emailId={book.rawBook?.userEmail || currentUserEmail}
                              backendUrl={backendUrl}
                              iframeBaseUrl={basePath}
                              title={book.title}
                              imageUrl={null}
                            />
                          )}
                        </div>

                        {/* Hover Menu Pill */}
                        <div className="absolute top-[2%] right-[0vw] w-[1vw] h-[3vw] bg-[#E8E6E1] rounded-full flex flex-col items-center justify-between py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30 pointer-events-none group-hover:pointer-events-auto">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId &&
                              setOpenMenuId(openMenuId === `${i}-${bIdx}` ? null : `${i}-${bIdx}`)
                            }
                            className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                          >
                            <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                          </button>
                          <div
                            className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                            onMouseEnter={() => setHoveredInfoId && setHoveredInfoId(`blue-shelf-${i}-${bIdx}`)}
                            onMouseLeave={() => setHoveredInfoId && setHoveredInfoId(null)}
                          >
                            <Icon icon="si:info-fill" className="w-4 h-4" />
                            <div className={`absolute top-1/2 left-full pl-3 -translate-y-1/2 ${hoveredInfoId === `blue-shelf-${i}-${bIdx}` ? 'block' : 'hidden'} z-[60]`}>
                              <div
                                style={{ backgroundColor: 'rgba(52, 52, 52, 0.8)' }}
                                className="w-[170px] backdrop-blur-sm rounded-xl p-4 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col gap-3 cursor-default text-left border border-white/10 relative"
                              >
                                <div className="flex items-center gap-2">
                                  {book.authorPicture && book.authorPicture !== 'color_only' ? (
                                    <img
                                      src={book.authorPicture}
                                      alt={book.authorName}
                                      className="w-8 h-8 rounded-full border border-gray-600 object-cover shrink-0"
                                    />
                                  ) : (
                                    <div
                                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-inner"
                                      style={{ backgroundColor: book.authorBgColor || '#4f46e5' }}
                                    >
                                      {(book.authorName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="flex flex-col min-w-0 pr-1">
                                    <span className="text-[13px] font-semibold text-white leading-tight truncate">{book.authorName || 'Author'}</span>
                                    {book.location && (
                                      <span className="flex items-center gap-1 text-[10px] text-gray-300 mt-0.5 truncate">
                                        <Icon icon="lucide:map-pin" className="w-3 h-3 text-gray-400 shrink-0" />
                                        <span className="truncate">{String(book.location).replace(/📍/g, '').replace(/≡ƒôì/g, '').trim()}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 justify-start text-[11px] text-gray-200 font-medium whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    <span className="text-white font-semibold">{book.pages || book.pageCount || 0}</span>
                                    <span className="font-normal text-gray-300">Pages</span>
                                  </div>
                                  <span className="text-gray-500">|</span>
                                  <span className="flex items-center gap-1">
                                    <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-gray-300" />
                                    {book.views || '1.2k'}
                                  </span>
                                  <span className="text-gray-500">|</span>
                                  <span className="flex items-center gap-1">
                                    <Icon icon="material-symbols:star" className="w-3.5 h-3.5 text-yellow-400" />
                                    {book.rating || 4.5}
                                  </span>
                                </div>
                                <div className="relative">
                                  <h4 className="text-[14px] font-semibold text-white truncate tracking-tight mb-1">{book.title || 'Untitled'}</h4>
                                  {book.description && (
                                    <p className="text-[11px] text-gray-300 leading-relaxed pr-10 line-clamp-2">{book.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dropdown Menu */}
                        {openMenuId === `${i}-${bIdx}` && (
                          <div className="absolute right-0 top-[110%] w-36 bg-white rounded-lg shadow-xl py-1 z-50 text-left border border-gray-100 animate-in fade-in zoom-in-95 duration-100">
                            <button
                              type="button"
                              onClick={() => {
                                if (handleRemoveBook) handleRemoveBook(book.v_id);
                                if (setOpenMenuId) setOpenMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Icon icon="mdi:trash-can-outline" className="text-sm" />
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
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

