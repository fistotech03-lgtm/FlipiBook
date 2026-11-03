import React from 'react';
import { Icon } from '@iconify/react';

// Window Shelf Assets
import windowShelfWindow from '../../../assets/Bookshelf/window_shelf/window.png';
import windowShelfBase from '../../../assets/Bookshelf/window_shelf/base.png';
import windowShelfPlank from '../../../assets/Bookshelf/window_shelf/shelf.png';
import windowShelfPlant from '../../../assets/Bookshelf/window_shelf/plant.png';
import windowShelfLight from '../../../assets/Bookshelf/window_shelf/light.png';
import windowShelfSwitch from '../../../assets/Bookshelf/window_shelf/switch.png';

const WindowShelf = ({
  filteredBooks,
  decors,
  setDecors,
  showLightSwitch = true,
  defaultLightType,
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
                    {/* 3a. 3 Hanging Pendant Lights on Right */}
                    {decors?.lightFixture !== false && (
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        right: '4.9%',
                        top: 0,
                        width: '8.6%'
                      }}
                    >
                      {/* Ambient Wall Light Glow behind Pendant Bulbs */}
                      {(decors?.lights && defaultLightType !== 'Turn off') && (
                        <div className="contents" style={{ opacity: lightOpacity / 100 }}>
                          {/* Soft Ambient Wall Spread from the 3 Bulbs */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-0"
                            style={{
                              left: '48%',
                              top: '65%',
                              width: '480%',
                              height: '210%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(254, 240, 138, 0.48) 0%, rgba(251, 191, 36, 0.28) 35%, rgba(245, 158, 11, 0.12) 65%, transparent 100%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.25) 40%, rgba(203, 213, 225, 0.08) 70%, transparent 100%)'
                                : 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(186, 230, 253, 0.50) 0%, rgba(147, 197, 253, 0.25) 40%, rgba(96, 165, 250, 0.08) 70%, transparent 100%)',
                              filter: 'blur(42px)',
                              mixBlendMode: 'screen'
                            }}
                          />

                          {/* Bulb 1 (Top-Left) Inner Glowing Filament Core */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-20"
                            style={{
                              left: '26.1%',
                              top: '41.5%',
                              width: '34%',
                              height: '13.0%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(circle, #ffffff 15%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.60) 75%, transparent 100%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(circle, #ffffff 25%, rgba(255, 255, 255, 0.98) 55%, rgba(241, 245, 249, 0.80) 75%, transparent 100%)'
                                : 'radial-gradient(circle, #ffffff 20%, rgba(224, 242, 254, 0.95) 50%, rgba(147, 197, 253, 0.85) 75%, transparent 100%)',
                              filter: selectedLightTheme === 'light1' ? 'blur(3.2px)' : 'blur(3.5px)',
                              boxShadow: selectedLightTheme === 'light1'
                                ? '0 0 10px rgba(251, 191, 36, 0.65)'
                                : 'none'
                            }}
                          />

                          {/* Bulb 2 (Mid-Right) Inner Glowing Filament Core */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-20"
                            style={{
                              left: '78.2%',
                              top: '67.6%',
                              width: '34%',
                              height: '13.0%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(circle, #ffffff 15%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.60) 75%, transparent 100%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(circle, #ffffff 25%, rgba(255, 255, 255, 0.98) 55%, rgba(241, 245, 249, 0.80) 75%, transparent 100%)'
                                : 'radial-gradient(circle, #ffffff 20%, rgba(224, 242, 254, 0.95) 50%, rgba(147, 197, 253, 0.85) 75%, transparent 100%)',
                              filter: selectedLightTheme === 'light1' ? 'blur(3.2px)' : 'blur(3.5px)',
                              boxShadow: selectedLightTheme === 'light1'
                                ? '0 0 10px rgba(251, 191, 36, 0.65)'
                                : 'none'
                            }}
                          />

                          {/* Bulb 3 (Bottom-Center) Inner Glowing Filament Core */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-20"
                            style={{
                              left: '49.7%',
                              top: '83.1%',
                              width: '35%',
                              height: '13.5%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(circle, #ffffff 15%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.60) 75%, transparent 100%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(circle, #ffffff 25%, rgba(255, 255, 255, 0.98) 55%, rgba(241, 245, 249, 0.80) 75%, transparent 100%)'
                                : 'radial-gradient(circle, #ffffff 20%, rgba(224, 242, 254, 0.95) 50%, rgba(147, 197, 253, 0.85) 75%, transparent 100%)',
                              filter: selectedLightTheme === 'light1' ? 'blur(3.2px)' : 'blur(3.5px)',
                              boxShadow: selectedLightTheme === 'light1'
                                ? '0 0 10px rgba(251, 191, 36, 0.65)'
                                : 'none'
                            }}
                          />
                        </div>
                      )}

                      <img
                        src={windowShelfLight}
                        alt="Pendant Lights"
                        className="w-full h-auto block drop-shadow-md relative z-10 transition-all duration-300"
                        style={{
                          filter: (decors?.lights && defaultLightType !== 'Turn off')
                            ? selectedLightTheme === 'light1'
                              ? 'brightness(1.20) contrast(1.04) drop-shadow(0 0 16px rgba(254, 240, 138, 0.65)) drop-shadow(0 0 32px rgba(251, 191, 36, 0.40))'
                              : selectedLightTheme === 'light2'
                              ? 'brightness(1.28) contrast(1.05) saturate(0.2) drop-shadow(0 0 16px rgba(255, 255, 255, 0.85))'
                              : 'brightness(1.22) contrast(1.05) hue-rotate(185deg) saturate(1.4) drop-shadow(0 0 16px rgba(96, 165, 250, 0.75))'
                            : 'none'
                        }}
                      />
                    </div>
                    )}

                    {/* 3b. Light Switch on Right Side of Pendant Lights */}
                    {showLightSwitch && decors?.lightFixture !== false && (
                      <div
                        onClick={() => {
                          if (typeof setDecors === 'function') {
                            setDecors(prev => ({ ...prev, lights: !prev.lights }));
                          }
                        }}
                        className="absolute pointer-events-auto cursor-pointer z-30 transition-transform duration-150 active:scale-95 hover:scale-105 group"
                        style={{
                          right: '2.5%',
                          top: '12.0%',
                          width: '3.2%'
                        }}
                        title={decors?.lights ? "Turn Lights Off" : "Turn Lights On"}
                      >
                        <img
                          src={windowShelfSwitch}
                          alt="Switch"
                          className="w-full h-auto block drop-shadow-md transition-all duration-200 opacity-100"
                        />
                      </div>
                    )}

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
                    {decors?.plant !== false && (
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
                    )}

                    {/* 6. Interactive Books on the Floating Shelf */}
                    <div
                      className="absolute z-20 flex items-end justify-center pointer-events-auto"
                      style={{
                        left: '46.0%',
                        top: '33.2%',
                        width: '21.0%',
                        height: '26.0%',
                        gap: '12%'
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
                            <div className="w-full h-full relative rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
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
