import React from 'react';
import { Icon } from '@iconify/react';

// Window Shelf Assets
import windowShelfWindow from '../../../assets/Bookshelf/window_shelf/window.png';
import windowShelfBase from '../../../assets/Bookshelf/window_shelf/base.png';
import windowShelfPlank from '../../../assets/Bookshelf/window_shelf/shelf.png';
import windowShelfPlant from '../../../assets/Bookshelf/window_shelf/plant.png';
import windowShelfLight from '../../../assets/Bookshelf/window_shelf/light.png';

const WindowShelf = ({
  filteredBooks,
  decors,
  defaultLightType,
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
                    {/* 1. Window with Flower Vases docked on the left wall */}
                    <div
                      className="absolute left-0 top-0 pointer-events-none z-10"
                      style={{
                        width: '14.74%',
                        height: '100%'
                      }}
                    >
                      <img
                        src={windowShelfWindow}
                        alt="Window"
                        className="w-full h-full block object-fill"
                      />
                    </div>

                    {/* 2. White Skirting Base along the bottom wall */}
                    <div
                      className="absolute right-0 pointer-events-none z-10"
                      style={{
                        left: '14.7%',
                        bottom: 0,
                        height: '10%'
                      }}
                    >
                      <img
                        src={windowShelfBase}
                        alt="Base"
                        className="w-full h-full block object-fill"
                      />
                    </div>

                    {/* 3. Triple Hanging Bulb Pendant Lights in Top-Right Corner */}
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        right: '4.9%',
                        top: 0,
                        width: '8.6%'
                      }}
                    >
                      <img
                        src={windowShelfLight}
                        alt="Pendant Lights"
                        className="w-full h-auto block drop-shadow-md"
                        style={{
                          filter: (decors?.lights && defaultLightType !== 'Turn off')
                            ? selectedLightTheme === 'light1'
                              ? 'brightness(1.22) drop-shadow(0 0 16px rgba(245, 158, 11, 0.55))'
                              : selectedLightTheme === 'light2'
                              ? 'brightness(1.2) drop-shadow(0 0 16px rgba(255, 255, 255, 0.6))'
                              : 'brightness(1.18) drop-shadow(0 0 16px rgba(186, 230, 253, 0.55))'
                            : 'none'
                        }}
                      />
                    </div>

                    {/* 4. White Wall Floating Shelf */}
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        left: '33.65%',
                        top: '42.22%',
                        width: '67.55%'
                      }}
                    >
                      <img
                        src={windowShelfPlank}
                        alt="Shelf"
                        className="w-full h-auto block drop-shadow-lg"
                      />
                    </div>

                    {/* 5. Hanging Vine Plant on the Left Edge of Shelf */}
                    <div
                      className="absolute pointer-events-none z-20"
                      style={{
                        left: '30.16%',
                        top: '40.37%',
                        width: '11.72%'
                      }}
                    >
                      <img
                        src={windowShelfPlant}
                        alt="Plant"
                        className="w-full h-auto block drop-shadow-md"
                      />
                    </div>

                    {/* 6. Interactive Books on the Floating Shelf */}
                    <div
                      className="absolute z-20 flex items-end justify-center pointer-events-auto"
                      style={{
                        left: '44.5%',
                        top: '35.5%',
                        width: '24.0%',
                        height: '24.5%',
                        gap: '12.5%'
                      }}
                    >
                      {[0, 1].map((slotIdx) => {
                        const book = filteredBooks && filteredBooks[slotIdx];
                        if (!book) {
                          return (
                            <div
                              key={`window-shelf-empty-${slotIdx}`}
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

                        const targetShareId = book.shareId || book.v_id;
                        const rawAcc = String(book.access || 'public').toLowerCase();

                        return (
                          <div
                            key={book.v_id || `window-shelf-${slotIdx}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, slotIdx)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, slotIdx)}
                            onDragEnd={handleDragEnd}
                            className={`relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer ${openMenuId === `window-shelf-${slotIdx}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === slotIdx ? 'opacity-50' : ''}`}
                            onClick={() => {
                              if (targetShareId) {
                                window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                              }
                            }}
                          >
                            <div className="w-full aspect-[2.5/3.4] relative rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
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
                                  setOpenMenuId(openMenuId === `window-shelf-${slotIdx}` ? null : `window-shelf-${slotIdx}`);
                                }}
                                className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                              >
                                <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                              </button>
                              <div
                                className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                                onMouseEnter={() => setHoveredInfoId(`window-shelf-${slotIdx}`)}
                                onMouseLeave={() => setHoveredInfoId(null)}
                              >
                                <Icon icon="si:info-fill" className="w-4 h-4" />
                                <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `window-shelf-${slotIdx}` ? 'block' : 'hidden'} z-[60]`}>
                                  <div className="w-[170px] bg-white rounded-xl p-4 text-gray-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col gap-3 cursor-default text-left border border-gray-100 relative">
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
                                          style={{ backgroundColor: book.authorBgColor }}
                                        >
                                          {(book.authorName || 'U').charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div className="flex flex-col min-w-0 pr-1">
                                        <span className="text-[13px] font-semibold text-gray-900 leading-tight truncate">{book.authorName}</span>
                                        <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5 truncate">
                                          <Icon icon="lucide:map-pin" className="w-3 h-3 text-gray-400 shrink-0" />
                                          <span className="truncate">{String(book.location).replace(/📍/g, '').trim()}</span>
                                        </span>
                                      </div>
                                    </div>
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
                                    <div className="relative">
                                      <h4 className="text-[14px] font-semibold text-black truncate tracking-tight mb-1">{book.title}</h4>
                                      <p className="text-[11px] text-gray-500 leading-relaxed pr-10 line-clamp-2">{book.description}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Dropdown Menu */}
                            {openMenuId === `window-shelf-${slotIdx}` && (
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

export default WindowShelf;
