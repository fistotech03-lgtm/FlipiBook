import React from 'react';
import { Icon } from '@iconify/react';

// Green Shelf Assets
import greenLeftWood from '../../../../assets/Bookshelf/greenshelf/Leftwood.png';
import greenBase from '../../../../assets/Bookshelf/greenshelf/base.png';
import greenLamp from '../../../../assets/Bookshelf/greenshelf/lamp.png';
import greenDecor from '../../../../assets/Bookshelf/greenshelf/decor.png';
import greenSwitch from '../../../../assets/Bookshelf/greenshelf/switch.png';

const GreenShelf = ({
  filteredBooks,
  decors,
  setDecors,
  showLightSwitch = true,
  lightOpacity = 100,
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

                              {/* 2. Beautiful luminous LED under-shelf glow spreading downwards */}
                              {decors.lights && (
                                <>
                                  {/* Golden LED light source along the bottom edge */}
                                  <div
                                    className="absolute left-[2%] right-[2%] pointer-events-none z-0 transition-opacity duration-300"
                                    style={{
                                      top: '97%',
                                      height: '0.18vw',
                                      opacity: ((lightOpacity ?? 100) / 100) * 0.75,
                                      background: selectedLightTheme === 'light1'
                                        ? 'linear-gradient(90deg, transparent 0%, #FFF3B0 20%, #FFDF6D 50%, #FFF3B0 80%, transparent 100%)'
                                        : selectedLightTheme === 'light2'
                                        ? 'linear-gradient(90deg, transparent 0%, #FFFFFF 20%, #F1F5F9 50%, #FFFFFF 80%, transparent 100%)'
                                        : 'linear-gradient(90deg, transparent 0%, #E0F2FE 20%, #BAE6FD 50%, #E0F2FE 80%, transparent 100%)',
                                      boxShadow: selectedLightTheme === 'light1'
                                        ? '0 0 6px 1px #FBBF24, 0 0 12px 2px rgba(245, 158, 11, 0.35)'
                                        : selectedLightTheme === 'light2'
                                        ? '0 0 6px 1px #FFFFFF, 0 0 12px 2px rgba(226, 232, 240, 0.45)'
                                        : '0 0 6px 1px #38BDF8, 0 0 12px 2px rgba(56, 189, 248, 0.35)',
                                      filter: 'blur(1px)'
                                    }}
                                  />

                                  {/* Primary bright downward light beam spreading onto the green wall */}
                                  <div
                                    className="absolute left-[0%] right-[0%] pointer-events-none z-0 transition-opacity duration-300"
                                    style={{
                                      top: '100%',
                                      height: '1.6vw',
                                      opacity: ((lightOpacity ?? 100) / 100) * 0.65,
                                      background: selectedLightTheme === 'light1'
                                        ? 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.30) 40%, rgba(245, 158, 11, 0.06) 70%, transparent 100%)'
                                        : selectedLightTheme === 'light2'
                                        ? 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255, 255, 255, 0.70) 0%, rgba(241, 245, 249, 0.35) 40%, rgba(203, 213, 225, 0.08) 70%, transparent 100%)'
                                        : 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(224, 242, 254, 0.65) 0%, rgba(186, 230, 253, 0.30) 40%, rgba(147, 197, 253, 0.06) 70%, transparent 100%)',
                                      mixBlendMode: 'screen',
                                      filter: 'blur(2.5px)'
                                    }}
                                  />

                                  {/* Wider soft ambient diffusion spreading out */}
                                  <div
                                    className="absolute left-[-4%] right-[-4%] pointer-events-none z-0 transition-opacity duration-300"
                                    style={{
                                      top: '100%',
                                      height: '2.8vw',
                                      opacity: ((lightOpacity ?? 100) / 100) * 0.55,
                                      background: selectedLightTheme === 'light1'
                                        ? 'radial-gradient(ellipse 75% 100% at 50% 0%, rgba(253, 224, 71, 0.32) 0%, rgba(245, 158, 11, 0.10) 45%, transparent 80%)'
                                        : selectedLightTheme === 'light2'
                                        ? 'radial-gradient(ellipse 75% 100% at 50% 0%, rgba(255, 255, 255, 0.35) 0%, rgba(226, 232, 240, 0.12) 45%, transparent 80%)'
                                        : 'radial-gradient(ellipse 75% 100% at 50% 0%, rgba(186, 230, 253, 0.32) 0%, rgba(125, 211, 252, 0.10) 45%, transparent 80%)',
                                      mixBlendMode: 'screen',
                                      filter: 'blur(6px)'
                                    }}
                                  />
                                </>
                              )}

                              {/* Subtle natural contact shadow directly under plank */}
                              <div
                                className="absolute left-[0.5%] right-[0.5%] pointer-events-none -z-10"
                                style={{
                                  top: '100%',
                                  height: '0.6vw',
                                  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.18) 0%, transparent 100%)',
                                  filter: 'blur(1px)'
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
                    {/* Left Wood Panel on left wall */}
                    <div
                      className="absolute left-0 top-0 pointer-events-none z-10"
                      style={{
                        bottom: '12.5%',
                        aspectRatio: '140 / 950'
                      }}
                    >
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
                    {decors?.lamp !== false && (
                      <div
                        className="absolute pointer-events-none z-20 transition-all duration-300"
                        style={{
                          left: '3.8%',
                          bottom: '10.0%',
                          width: '18.5%'
                        }}
                      >
                        {/* Natural Vivid Lamp Light Effects (placed relative to the lamp so light is inside the shade) */}
                        {decors?.lights && (
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
                            filter: decors?.lights
                              ? (selectedLightTheme === 'light1'
                                  ? 'brightness(1.06) contrast(1.02)'
                                  : selectedLightTheme === 'light2'
                                  ? 'brightness(1.15) contrast(1.02)'
                                  : 'brightness(1.04) contrast(1.02)')
                              : 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Wall Light Switch on right side */}
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
                          src={greenSwitch}
                          alt="Switch"
                          className="w-full h-auto block drop-shadow-md transition-all duration-200 opacity-100"
                        />
                      </div>
                    )}

                    {/* Bottom Right: decor.png placed on credenza (moved to right edge) */}
                    {decors?.decor !== false && (
                      <div
                        className="absolute pointer-events-none z-20 transition-all duration-300"
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
                    )}
                  </>
    </>
  );
};

export default GreenShelf;
