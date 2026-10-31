import React from 'react';
import { Icon } from '@iconify/react';

// Green-Light Shelf Assets
import greenLightSheet from '../../../assets/Bookshelf/greenlight/sheet.png';
import greenLightLeftWood from '../../../assets/Bookshelf/greenlight/Leftwood.png';
import greenLightShelfPlank from '../../../assets/Bookshelf/greenlight/greenshelf.png';
import greenLightLamp from '../../../assets/Bookshelf/greenlight/lamp.png';
import greenLightPlant from '../../../assets/Bookshelf/greenlight/plant.png';
import greenLightBase from '../../../assets/Bookshelf/greenlight/base.png';
import greenLightFixture from '../../../assets/Bookshelf/greenlight/light.png';

const GreenLightShelf = ({
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
                    {/* Green Sheet Overlay: when a custom wall theme is selected, blend the green lighting ambiance onto it */}
                    {selectedWallTheme && (
                      <div
                        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80 z-0"
                        style={{
                          backgroundImage: `url('${greenLightSheet}')`,
                          backgroundSize: '100% 100%',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}

                    {/* Left Wood Slats Column (Leftwood.png): rests above base credenza */}
                    <div
                      className="absolute left-0 top-0 pointer-events-none z-10"
                      style={{
                        width: '7.29%',
                        bottom: '8.8%'
                      }}
                    >
                      <img
                        src={greenLightLeftWood}
                        alt="Left Wood Slats"
                        className="w-full h-full block object-cover object-top"
                      />
                    </div>

                    {/* 2 Tiers of Shelves and Spotlights */}
                    {[
                      { tierIdx: 0, shelfTop: '35.5%', lightTop: '5.5%', books: [0, 1, 2, 3] },
                      { tierIdx: 1, shelfTop: '70.0%', lightTop: '40.5%', books: [4, 5, 6, 7] }
                    ].map(({ tierIdx, shelfTop, lightTop, books }) => (
                      <React.Fragment key={`greenlight-tier-${tierIdx}`}>
                        {/* Shelf row: 4 floating shelf segments stretched across the width */}
                        <div
                          className="absolute pointer-events-none z-10"
                          style={{
                            top: shelfTop,
                            left: '24.0%',
                            width: '68.0%'
                          }}
                        >
                          <img
                            src={greenLightShelfPlank}
                            alt="Green Shelf"
                            className="w-full h-auto block drop-shadow-md"
                          />
                        </div>

                        {/* Top Spotlights for this row - moved up so they are clearly visible above books */}
                        <div
                          className="absolute pointer-events-none z-10"
                          style={{
                            top: lightTop,
                            left: '29.5%',
                            width: '57.0%'
                          }}
                        >
                          <img
                            src={greenLightFixture}
                            alt="Ceiling Spotlights"
                            className="w-full h-auto block drop-shadow-sm relative z-20"
                          />
                        </div>

                        {/* Realistic Studio Spotlight Wall-Wash Beams: vertical downward spread from fixture down onto book */}
                        {decors.lights && (
                          <div
                            className="absolute pointer-events-none z-15"
                            style={{
                              top: lightTop,
                              left: '24.0%',
                              width: '68.0%',
                              height: '100%'
                            }}
                          >
                            {[
                              { center: '9.91%' },
                              { center: '36.62%' },
                              { center: '63.33%' },
                              { center: '90.04%' }
                            ].map(({ center }, beamIdx) => (
                              <React.Fragment key={`spotlight-beam-${tierIdx}-${beamIdx}`}>
                                {/* 1. Pure Vertical Downward Beam: Narrow at top fixture, smoothly diffusing vertically down over the book */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '3.5%',
                                    width: '13.0%',
                                    height: '26%',
                                    background:
                                      selectedLightTheme === 'light1'
                                        ? 'linear-gradient(to bottom, rgba(255, 250, 220, 0.95) 0%, rgba(254, 240, 138, 0.52) 32%, rgba(251, 191, 36, 0.16) 75%, transparent 100%)'
                                        : selectedLightTheme === 'light2'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.58) 32%, rgba(203, 213, 225, 0.16) 75%, transparent 100%)'
                                        : 'linear-gradient(to bottom, rgba(240, 249, 255, 0.95) 0%, rgba(186, 230, 253, 0.42) 30%, rgba(147, 197, 253, 0.10) 75%, transparent 100%)',
                                    borderRadius: '50% 50% 45% 45% / 25% 25% 75% 75%',
                                    filter: 'blur(7.5px)',
                                    mixBlendMode: 'screen'
                                  }}
                                />

                                {/* 2. Narrow focused core shaft down center of book */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '3%',
                                    width: '5.2%',
                                    height: '20%',
                                    background:
                                      selectedLightTheme === 'light1'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 240, 0.95) 0%, rgba(254, 240, 138, 0.60) 25%, rgba(251, 191, 36, 0.15) 70%, transparent 100%)'
                                        : selectedLightTheme === 'light2'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(248, 250, 252, 0.65) 25%, rgba(203, 213, 225, 0.15) 70%, transparent 100%)'
                                        : 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(224, 242, 254, 0.60) 25%, rgba(186, 230, 253, 0.12) 70%, transparent 100%)',
                                    borderRadius: '50% 50% 45% 45% / 20% 20% 80% 80%',
                                    filter: 'blur(4.5px)',
                                    mixBlendMode: 'screen'
                                  }}
                                />

                                {/* 3. Intense bulb hotspot on the fixture lip */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '2.5%',
                                    width: '2.6%',
                                    height: '1.0%',
                                    borderRadius: '50%',
                                    background: '#ffffff',
                                    filter: 'blur(1.2px)',
                                    boxShadow:
                                      selectedLightTheme === 'light1'
                                        ? '0 0 8px 2px rgba(251, 191, 36, 0.90)'
                                        : selectedLightTheme === 'light2'
                                        ? '0 0 8px 2px rgba(255, 255, 255, 0.95)'
                                        : '0 0 8px 2px rgba(186, 230, 253, 0.85)'
                                  }}
                                />
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {/* 4 Book Positions for this tier - sized proportionally so spotlight & shadow are clearly visible above */}
                        <div
                          className="absolute pointer-events-none z-20"
                          style={{
                            top: shelfTop,
                            left: '24.0%',
                            width: '68.0%',
                            transform: 'translateY(-100%)',
                            height: '1px'
                          }}
                        >
                          {[
                            { bookIndex: books[0], center: '9.91%' },
                            { bookIndex: books[1], center: '36.62%' },
                            { bookIndex: books[2], center: '63.33%' },
                            { bookIndex: books[3], center: '90.04%' }
                          ].map(({ bookIndex, center }, slotIdx) => {
                            const book = filteredBooks[bookIndex];
                            if (!book) {
                              return (
                                <div
                                  key={`greenlight-empty-${tierIdx}-${slotIdx}`}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, bookIndex)}
                                  className="pointer-events-auto absolute -translate-x-1/2 bottom-0 flex justify-center items-end"
                                  style={{
                                    left: center,
                                    width: '13.0%',
                                    aspectRatio: '2.5 / 3.35'
                                  }}
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

                            const emailFolder = book.rawBook?.userEmail ? book.rawBook.userEmail.replace(/[@.]/g, "_") : '';
                            const folderName = (book.rawBook?.folderName && book.rawBook.folderName.length > 0) ? book.rawBook.folderName[0] : (book.rawBook?.folder || '');
                            const bookName = book.rawBook?.flipbookName || book.rawBook?.title || '';
                            const basePath = '';

                            return (
                              <div
                                key={book.v_id || `greenlight-book-${bookIndex}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, bookIndex)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, bookIndex)}
                                onDragEnd={handleDragEnd}
                                className={`pointer-events-auto absolute -translate-x-1/2 bottom-0 group cursor-pointer flex justify-center items-end ${openMenuId === `greenlight-${bookIndex}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === bookIndex ? 'opacity-50' : ''}`}
                                style={{
                                  left: center,
                                  width: '13.0%'
                                }}
                              >
                                <div className="w-full aspect-[2.5/3.35] relative rounded-[3px] shadow-sm transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
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
                                <div className="absolute top-[2%] -right-[0.2vw] w-[1vw] h-[3vw] bg-[#E8E6E1] rounded-full flex flex-col items-center justify-between py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30 pointer-events-none group-hover:pointer-events-auto">
                                  <button
                                    onClick={() => setOpenMenuId(openMenuId === `greenlight-${bookIndex}` ? null : `greenlight-${bookIndex}`)}
                                    className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                                  >
                                    <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                                  </button>
                                  <div
                                    className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                                    onMouseEnter={() => setHoveredInfoId(`greenlight-${bookIndex}`)}
                                    onMouseLeave={() => setHoveredInfoId(null)}
                                  >
                                    <Icon icon="si:info-fill" className="w-4 h-4" />

                                    {/* Info Tooltip Bridge & Container */}
                                    <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `greenlight-${bookIndex}` ? 'block' : 'hidden'} z-[60]`}>
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

                                {openMenuId === `greenlight-${bookIndex}` && (
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
                      </React.Fragment>
                    ))}
                  </div>
                  <>
                    {/* Shelf Base Credenza (base.png): placed at bottom */}
                      <div
                        className="absolute left-0 w-full pointer-events-none z-15"
                        style={{ bottom: 0 }}
                      >
                        <img
                          src={greenLightBase}
                          alt="Green-Light Shelf Base"
                          className="w-full h-auto block object-cover"
                        />
                      </div>

                    {/* Bottom Left: lamp.png with books placed on credenza */}
                    {decors.lamp && (
                      <div
                        className="absolute pointer-events-none z-20 transition-all duration-300"
                        style={{
                          left: '1.2%',
                          bottom: '6.5%',
                          width: '15.2%',
                          filter: 'none'
                        }}
                      >
                        {/* Light inside the lamp dome (lamp kulla light) & surrounding ambiance */}
                        {decors.lights && (
                          <>
                            {/* 1. Large ambient wall glow behind the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
                              style={{
                                left: '28%',
                                top: '24%',
                                width: '260%',
                                height: '260%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                                  : 'radial-gradient(circle, rgba(186, 230, 253, 0.40) 0%, rgba(147, 197, 253, 0.18) 35%, rgba(191, 219, 254, 0.05) 60%, transparent 80%)',
                                filter: 'blur(20px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 2. Downward pool of light on the wooden credenza tabletop under the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 -z-10"
                              style={{
                                left: '28%',
                                top: '30%',
                                width: '250%',
                                height: '140%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.30) 40%, transparent 75%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.70) 0%, rgba(241, 245, 249, 0.32) 40%, transparent 75%)'
                                  : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(240, 249, 255, 0.65) 0%, rgba(186, 230, 253, 0.28) 40%, transparent 75%)',
                                filter: 'blur(10px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 3. Direct light inside the lamp dome (lamp kulla irukura light) */}
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-30"
                              style={{
                                left: '2.5%',
                                top: '1.5%',
                                width: '53.5%',
                                height: '48%',
                                borderRadius: '50% 50% 18% 18% / 78% 78% 22% 22%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 240, 0.98) 0%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.50) 75%, transparent 100%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.90) 45%, rgba(203, 213, 225, 0.40) 75%, transparent 100%)'
                                  : 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(240, 249, 255, 1) 0%, rgba(186, 230, 253, 0.68) 45%, rgba(147, 197, 253, 0.25) 75%, transparent 100%)',
                                mixBlendMode: 'screen',
                                filter: 'blur(3px)'
                              }}
                            />

                            {/* 4. Soft halo rim glow around the lamp dome edge */}
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-20"
                              style={{
                                left: '0%',
                                top: '0%',
                                width: '58%',
                                height: '52%',
                                borderRadius: '50% 50% 20% 20% / 78% 78% 22% 22%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(254, 240, 138, 0.70) 0%, rgba(245, 158, 11, 0.35) 60%, transparent 90%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(255, 255, 255, 0.75) 0%, rgba(203, 213, 225, 0.35) 60%, transparent 90%)'
                                  : 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(240, 249, 255, 0.75) 0%, rgba(186, 230, 253, 0.28) 60%, transparent 90%)',
                                mixBlendMode: 'screen',
                                filter: 'blur(7px)'
                              }}
                            />
                          </>
                        )}

                        <img
                          src={greenLightLamp}
                          alt="Lamp and Books"
                          className="w-full h-auto block drop-shadow-md relative z-10 transition-all duration-300"
                          style={{
                            filter: decors.lights
                              ? (selectedLightTheme === 'light1'
                                  ? 'brightness(1.08) contrast(1.02)'
                                  : selectedLightTheme === 'light2'
                                  ? 'brightness(1.15) contrast(1.02)'
                                  : 'brightness(1.05) contrast(1.02)')
                              : 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Bottom Right: plant.png in vase with spherical decor placed on credenza */}
                    {decors.plant && (
                      <div
                        className="absolute pointer-events-none z-20"
                        style={{
                          right: '2.5%',
                          bottom: '6.5%',
                          width: '9.6%'
                        }}
                      >
                        <img
                          src={greenLightPlant}
                          alt="Plant with Vase"
                          className="w-full h-auto block drop-shadow-md"
                        />
                      </div>
                    )}
                  </>
    </>
  );
};

export default GreenLightShelf;
