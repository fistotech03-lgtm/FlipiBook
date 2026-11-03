import React from 'react';
import { Icon } from '@iconify/react';

// Green Shelf Assets
import greenLeftWood from '../../../assets/Bookshelf/greenshelf/Leftwood.png';
import greenBase from '../../../assets/Bookshelf/greenshelf/base.png';
import greenLamp from '../../../assets/Bookshelf/greenshelf/lamp.png';
import greenDecor from '../../../assets/Bookshelf/greenshelf/decor.png';

const GreenShelf = ({
  filteredBooks,
  decors,
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
  currentUserEmail
}) => {
  return (
    <>
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* 2 Tiers of Shelves: Top tier and Bottom tier */}
                    {[
                      { tierIdx: 0, top: '38%', books: [0, 1, 2, 3] },
                      { tierIdx: 1, top: '69%', books: [4, 5, 6, 7] }
                    ].map(({ tierIdx, top, books }) => (
                      <React.Fragment key={`green-tier-${tierIdx}`}>
                        {/* Two split shelves per tier: Left shelf and Right shelf */}
                        {[
                          { side: 'left', left: '23.5%', width: '28.8%', bookIndices: [books[0], books[1]] },
                          { side: 'right', left: '55.0%', width: '30.1%', bookIndices: [books[2], books[3]] }
                        ].map(({ side, left, width, bookIndices }) => (
                          <div
                            key={`green-shelf-${tierIdx}-${side}`}
                            className="absolute pointer-events-auto"
                            style={{
                              top,
                              left,
                              width
                            }}
                          >
                            <div className="relative w-full">
                              {/* 1. Wood Shelf Plank (Crisp warm off-white floating shelf matching Screenshot 3) */}
                              <div
                                className="w-full relative z-10 rounded-[2px]"
                                style={{
                                  height: '1.15vw',
                                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F4 55%, #ECE7DD 92%, #DDD7CB 100%)',
                                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08), inset 0 1px 0 #FFFFFF'
                                }}
                              />

                              {/* 2. Delicate warm LED strip glow directly underneath the shelf matching Screenshot 3 */}
                              {decors.lights && (
                                <>
                                  {/* Crisp thin warm LED light line under plank */}
                                  <div
                                    className="absolute left-[0.5%] right-[0.5%] pointer-events-none z-0"
                                    style={{
                                      top: '98%',
                                      height: '0.22vw',
                                      background: '#FFDE82',
                                      borderRadius: '0 0 1px 1px',
                                      boxShadow: '0 0 6px 1px #FBBF24, 0 0 12px 2px rgba(245, 158, 11, 0.5)'
                                    }}
                                  />
                                  {/* Soft luminous warm glow spreading downwards onto the green wall */}
                                  <div
                                    className="absolute left-[2%] right-[2%] pointer-events-none z-0"
                                    style={{
                                      top: '100%',
                                      height: '1.4vw',
                                      background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(254, 240, 138, 0.5) 0%, rgba(251, 191, 36, 0.2) 40%, rgba(245, 158, 11, 0.04) 70%, transparent 100%)',
                                      mixBlendMode: 'screen',
                                      filter: 'blur(1px)'
                                    }}
                                  />
                                </>
                              )}

                              {/* Soft ambient drop shadow underneath */}
                              <div
                                className="absolute left-[0.5%] right-[0.5%] pointer-events-none -z-10"
                                style={{
                                  top: '100%',
                                  height: '0.8vw',
                                  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.03) 60%, transparent 100%)',
                                  filter: 'blur(2px)'
                                }}
                              />

                              {/* 3. Books sitting on top of the shelf (2 books per shelf plank = 4 books per tier = 8 total) */}
                              <div
                                className="absolute inset-x-0 bottom-[100%] flex justify-around items-end z-20"
                                style={{ padding: '0 4%', marginBottom: '-1px' }}
                              >
                                {bookIndices.map((bGlobalIdx, slotIdx) => {
                                  const book = filteredBooks[bGlobalIdx];
                                  if (!book) {
                                    return (
                                      <div
                                        key={`green-empty-${tierIdx}-${side}-${slotIdx}`}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, bGlobalIdx)}
                                        className="relative flex justify-center items-end"
                                        style={{ width: '34%' }}
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

                                  const emailFolder = book.rawBook?.userEmail ? book.rawBook.userEmail.replace(/[@.]/g, "_") : '';
                                  const folderName = (book.rawBook?.folderName && book.rawBook.folderName.length > 0) ? book.rawBook.folderName[0] : (book.rawBook?.folder || '');
                                  const bookName = book.rawBook?.flipbookName || book.rawBook?.title || '';
                                  const basePath = '';

                                  return (
                                    <div
                                      key={book.v_id || `green-book-${bGlobalIdx}`}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, bGlobalIdx)}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleDrop(e, bGlobalIdx)}
                                      onDragEnd={handleDragEnd}
                                      className={`relative group cursor-pointer flex justify-center items-end ${openMenuId === `green-${bGlobalIdx}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === bGlobalIdx ? 'opacity-50' : ''}`}
                                      style={{ width: '34%' }}
                                    >
                                      {/* Book Cover with 3D drop shadow resting on wood shelf */}
                                      <div className="w-full aspect-[2.5/3.4] relative rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
                                        <LazyPreview
                                          v_id={book.v_id}
                                          emailId={book.rawBook?.userEmail || currentUserEmail}
                                          backendUrl={backendUrl}
                                          iframeBaseUrl={basePath}
                                          title={book.title}
                                          imageUrl={null}
                                        />
                                      </div>

                                      {/* Hover Menu Pill */}
                                      <div className="absolute top-[2%] -right-[0.4vw] w-[1vw] h-[3vw] bg-[#E8E6E1] rounded-full flex flex-col items-center justify-between py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30 pointer-events-none group-hover:pointer-events-auto">
                                        <button
                                          onClick={() => setOpenMenuId(openMenuId === `green-${bGlobalIdx}` ? null : `green-${bGlobalIdx}`)}
                                          className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                                        >
                                          <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                                        </button>
                                        <div
                                          className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                                          onMouseEnter={() => setHoveredInfoId(`green-${bGlobalIdx}`)}
                                          onMouseLeave={() => setHoveredInfoId(null)}
                                        >
                                          <Icon icon="si:info-fill" className="w-4 h-4" />

                                          {/* Info Tooltip Bridge & Container */}
                                          <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `green-${bGlobalIdx}` ? 'block' : 'hidden'} z-[60]`}>
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
                                                    const targetShareId = book.shareId || book.v_id;
                                                    const rawAcc = String(book.access || 'public').toLowerCase();
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
                                      {openMenuId === `green-${bGlobalIdx}` && (
                                        <div className="absolute top-[2%] -right-[0.5vw] bg-white rounded-[0.5vw] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-[0.2vw] w-[7vw] z-50 overflow-hidden">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const targetShareId = book.shareId || book.v_id;
                                              const rawAcc = String(book.access || 'public').toLowerCase();
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
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                  <>
                    {/* Left Wood Panel on left wall with natural tight light & shadow on right side */}
                    <div
                      className="absolute left-0 top-0 pointer-events-none z-10"
                      style={{
                        bottom: '12.5%',
                        aspectRatio: '140 / 950'
                      }}
                    >
                      {/* 1. Bright intense vertical LED strip directly behind the panel edge */}
                      <div
                        className="absolute top-0 right-0 h-full pointer-events-none z-0"
                        style={{
                          width: '16px',
                          transform: 'translateX(30%)',
                          background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 245, 205, 0.98) 40%, rgba(253, 224, 71, 0.85) 75%, transparent 100%)',
                          filter: 'blur(3px)',
                          mixBlendMode: 'screen'
                        }}
                      />

                      {/* 2. Primary bright warm core glow */}
                      <div
                        className="absolute top-0 right-0 h-full pointer-events-none z-0"
                        style={{
                          width: '65px',
                          transform: 'translateX(60%)',
                          background: 'linear-gradient(90deg, rgba(255, 241, 168, 0.95) 0%, rgba(252, 211, 77, 0.75) 35%, rgba(245, 158, 11, 0.40) 65%, transparent 100%)',
                          filter: 'blur(10px)',
                          mixBlendMode: 'screen'
                        }}
                      />

                      {/* 3. Wide soft ambient light diffusion spreading onto the green wall */}
                      <div
                        className="absolute top-0 right-0 h-full pointer-events-none z-0"
                        style={{
                          width: '130px',
                          transform: 'translateX(55%)',
                          background: 'linear-gradient(90deg, rgba(254, 240, 138, 0.60) 0%, rgba(251, 191, 36, 0.35) 40%, rgba(217, 119, 6, 0.12) 75%, transparent 100%)',
                          filter: 'blur(20px)',
                          mixBlendMode: 'screen'
                        }}
                      />

                      <img
                        src={greenLeftWood}
                        alt="Left Wood Panel"
                        className="w-full h-full block object-contain object-left relative z-10"
                      />
                    </div>

                    {/* Shelf Base Credenza across the bottom */}
                    <div
                      className="absolute left-0 w-full pointer-events-none z-10"
                      style={{ bottom: 0, height: '12.5%' }}
                    >
                      <img
                        src={greenBase}
                        alt="Green Shelf Base"
                        className="w-full h-full block object-fill"
                      />
                    </div>

                    {/* Bottom Left: lamp.png placed on credenza with internal lamp light effects */}
                    <div
                      className="absolute pointer-events-none z-20 transition-all duration-300"
                      style={{
                        left: '3.8%',
                        bottom: '10.0%',
                        width: '18.5%'
                      }}
                    >
                      {/* Natural Vivid Lamp Light Effects (placed relative to the lamp so light is inside the shade) */}
                      {decors.lamp && decors.lights && (
                        <>
                          {/* 1. Ambient wall wash behind the lamp */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-0"
                            style={{
                              left: '26%',
                              top: '42%',
                              width: '170%',
                              height: '170%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, rgba(245, 158, 11, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(circle, rgba(255, 255, 255, 0.55) 0%, rgba(248, 250, 252, 0.26) 35%, rgba(226, 232, 240, 0.06) 60%, transparent 80%)'
                                : 'radial-gradient(circle, rgba(186, 230, 253, 0.42) 0%, rgba(147, 197, 253, 0.18) 35%, rgba(191, 219, 254, 0.05) 60%, transparent 80%)',
                              filter: 'blur(16px)',
                              mixBlendMode: 'screen'
                            }}
                          />

                          {/* 2. Downward pool of light on the credenza surface */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 z-0"
                            style={{
                              left: '26%',
                              top: '46%',
                              width: '160%',
                              height: '90%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.70) 0%, rgba(251, 191, 36, 0.35) 40%, transparent 75%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.80) 0%, rgba(241, 245, 249, 0.38) 40%, transparent 75%)'
                                : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(240, 249, 255, 0.70) 0%, rgba(186, 230, 253, 0.32) 40%, rgba(147, 197, 253, 0.08) 65%, transparent 80%)',
                              filter: 'blur(10px)',
                              mixBlendMode: 'screen'
                            }}
                          />

                          {/* 3. Lampshade inner glow layer (light directly inside the dome) */}
                          <div
                            className="absolute pointer-events-none transition-all duration-300 z-25"
                            style={{
                              left: '4%',
                              top: '12%',
                              width: '44%',
                              height: '42%',
                              borderRadius: '50% 50% 18% 18% / 78% 78% 22% 22%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 251, 235, 0.98) 0%, rgba(251, 191, 36, 0.80) 50%, rgba(217, 119, 6, 0.35) 85%, transparent 100%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.85) 50%, rgba(203, 213, 225, 0.35) 85%, transparent 100%)'
                                : 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(240, 249, 255, 0.98) 0%, rgba(186, 230, 253, 0.65) 50%, rgba(147, 197, 253, 0.22) 85%, transparent 100%)',
                              mixBlendMode: 'screen',
                              filter: 'blur(2px)'
                            }}
                          />

                          {/* 4. Color tint on the shade surface for unmistakable theme differentiation */}
                          {selectedLightTheme === 'light3' && (
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-26"
                              style={{
                                left: '5%',
                                top: '13%',
                                width: '42%',
                                height: '40%',
                                borderRadius: '50% 50% 18% 18% / 78% 78% 22% 22%',
                                background: 'linear-gradient(180deg, rgba(147, 197, 253, 0.32) 0%, rgba(186, 230, 253, 0.18) 100%)',
                                mixBlendMode: 'color'
                              }}
                            />
                          )}
                        </>
                      )}

                      <img
                        src={greenLamp}
                        alt="Lamp"
                        className="w-full h-auto block drop-shadow-md relative z-20 transition-all duration-300"
                        style={{
                          filter: !decors.lamp
                            ? 'none'
                            : decors.lights
                            ? (selectedLightTheme === 'light1'
                                ? 'brightness(1.06) contrast(1.02)'
                                : selectedLightTheme === 'light2'
                                ? 'brightness(1.15) contrast(1.02)'
                                : 'brightness(1.04) contrast(1.02)')
                            : 'none'
                        }}
                      />
                    </div>

                    {/* Bottom Right: decor.png placed on credenza (moved to right edge) */}
                    <div
                      className="absolute pointer-events-none z-20"
                      style={{
                        right: '2.5%',
                        bottom: '10.0%',
                        width: '13.5%'
                      }}
                    >
                      <img
                        src={greenDecor}
                        alt="Decor"
                        className="w-full h-auto block drop-shadow-md"
                      />
                    </div>
                  </>
    </>
  );
};

export default GreenShelf;
