import React from 'react';
import { Icon } from '@iconify/react';

// Plant-Light Shelf Assets
import plantLightShadowSheet from '../../../assets/Bookshelf/plant-light/shadowsheet.png';
import plantLightLeftDecor from '../../../assets/Bookshelf/plant-light/leftdecor.png';
import plantLightBase from '../../../assets/Bookshelf/plant-light/base.png';
import plantLightShelf1 from '../../../assets/Bookshelf/plant-light/shelf1.png';
import plantLightShelf2 from '../../../assets/Bookshelf/plant-light/shelf2.png';
import plantLightPlant from '../../../assets/Bookshelf/plant-light/plant.png';
import plantLightDecor from '../../../assets/Bookshelf/plant-light/decor.png';
import plantLightLeaf from '../../../assets/Bookshelf/plant-light/leaf.png';
import plantLightLamp from '../../../assets/Bookshelf/plant-light/lamp.png';

const PlantLightShelf = ({
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
                    {/* Shadow Sheet Overlay: when a custom wall theme is selected, blend the window sunlight shadows onto it */}
                    {selectedWallTheme && (
                      <div
                        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80 z-0"
                        style={{
                          backgroundImage: `url('${plantLightShadowSheet}')`,
                          backgroundSize: '100% 100%',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}

                    {/* Left Wall Molding / Decor Column (leftdecor.png) */}
                    <div
                      className="absolute left-0 top-0 pointer-events-none z-10"
                      style={{
                        width: '7.19%',
                        height: '100%'
                      }}
                    >
                      <img
                        src={plantLightLeftDecor}
                        alt="Left Wall Decor"
                        className="w-full h-full block object-fill"
                      />
                    </div>

                    {/* Shelf 1 (Top Tier Plank): spans from left 8.25% to right 100% */}
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        top: '35.5%',
                        left: '8.25%',
                        width: '91.75%'
                      }}
                    >
                      <img
                        src={plantLightShelf1}
                        alt="Plant Shelf Tier 1"
                        className="w-full h-auto block drop-shadow-md"
                      />
                    </div>

                    {/* Shelf 1 Plant Image (Over Shelf 1): Hanging leafy vine on left, dried floral vase on right */}
                    <div
                      className="absolute pointer-events-none z-25"
                      style={{
                        top: '35.5%',
                        left: '8.8%',
                        width: '85.0%',
                        transform: 'translateY(-58%)'
                      }}
                    >
                      <img
                        src={plantLightPlant}
                        alt="Shelf 1 Plants and Vase"
                        className="w-full h-auto block"
                      />
                    </div>

                    {/* Shelf 2 (Bottom Tier Plank): shorter plank width matching asset aspect and screenshot */}
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        top: '70.46%',
                        left: '8.37%',
                        width: '77.08%'
                      }}
                    >
                      <img
                        src={plantLightShelf2}
                        alt="Plant Shelf Tier 2"
                        className="w-full h-auto block drop-shadow-md"
                      />
                    </div>

                    {/* Shelf 2 Decor (Over Shelf 2 on Left Side): Incense, candle & book stack */}
                    {decors.plant && (
                      <div
                        className="absolute pointer-events-none z-25"
                        style={{
                          top: '70.46%',
                          left: '8.97%',
                          width: '13.0%',
                          transform: 'translateY(-85%)'
                        }}
                      >
                        <img
                          src={plantLightDecor}
                          alt="Shelf 2 Decor"
                          className="w-full h-auto block drop-shadow-sm"
                        />
                      </div>
                    )}

                    {/* 2 Tiers of Books: Tier 0 (Shelf 1) & Tier 1 (Shelf 2) */}
                    {[
                      { tierIdx: 0, shelfTop: '35.5%', books: [0, 1, 2, 3] },
                      { tierIdx: 1, shelfTop: '70.46%', books: [4, 5, 6, 7] }
                    ].map(({ tierIdx, shelfTop, books }) => (
                      <div
                        key={`plantlight-tier-${tierIdx}`}
                        className="absolute pointer-events-none z-20"
                        style={{
                          top: shelfTop,
                          left: 0,
                          width: '100%',
                          transform: 'translateY(-100%)',
                          height: '1px'
                        }}
                      >
                        {[
                          { bookIndex: books[0], center: '31.5%' },
                          { bookIndex: books[1], center: '44.7%' },
                          { bookIndex: books[2], center: '57.9%' },
                          { bookIndex: books[3], center: '71.1%' }
                        ].map(({ bookIndex, center }, slotIdx) => {
                          const book = filteredBooks[bookIndex];
                          if (!book) {
                            return (
                              <div
                                key={`plantlight-empty-${tierIdx}-${slotIdx}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, bookIndex)}
                                className="pointer-events-auto absolute -translate-x-1/2 bottom-0 flex justify-center items-end"
                                style={{
                                  left: center,
                                  width: '10.5%',
                                  aspectRatio: '2.5 / 3.35'
                                }}
                              >
                                <div
                                  onClick={() => {
                                    setSelectedBookIdsToAdd([]);
                                    setAddBookSearch('');
                                    setShowAddBookModal(true);
                                  }}
                                  className="w-full h-full rounded-[6px] border border-dashed border-amber-900/30 hover:border-amber-900/60 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-[1px] shadow-sm"
                                  title="Add Book"
                                >
                                  <div className="relative flex items-center justify-center text-amber-950 transition-transform group-hover:scale-110">
                                    <Icon icon="mdi:book-open-outline" className="w-5 h-5 text-amber-900/90" />
                                    <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-amber-950 leading-none">
                                      +
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-medium text-amber-950/90 group-hover:text-amber-950 tracking-wide">
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
                              key={book.v_id || `plantlight-book-${bookIndex}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, bookIndex)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, bookIndex)}
                              onDragEnd={handleDragEnd}
                              className={`pointer-events-auto absolute -translate-x-1/2 bottom-0 group cursor-pointer flex justify-center items-end ${openMenuId === `plantlight-${bookIndex}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === bookIndex ? 'opacity-50' : ''}`}
                              style={{
                                left: center,
                                width: '10.5%'
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
                                  onClick={() => setOpenMenuId(openMenuId === `plantlight-${bookIndex}` ? null : `plantlight-${bookIndex}`)}
                                  className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                                >
                                  <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                                </button>
                                <div
                                  className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                                  onMouseEnter={() => setHoveredInfoId(`plantlight-${bookIndex}`)}
                                  onMouseLeave={() => setHoveredInfoId(null)}
                                >
                                  <Icon icon="si:info-fill" className="w-4 h-4" />

                                  {/* Info Tooltip Bridge & Container */}
                                  <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `plantlight-${bookIndex}` ? 'block' : 'hidden'} z-[60]`}>
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

                              {openMenuId === `plantlight-${bookIndex}` && (
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
                    ))}
                  </div>
                  <>
                    {/* Shelf Base (Credenza): placed at bottom */}
                    <div
                      className="absolute left-0 w-full pointer-events-none z-10"
                      style={{ bottom: 0 }}
                    >
                      <img
                        src={plantLightBase}
                        alt="Plant-Light Shelf Base"
                        className="w-full h-auto block object-cover"
                      />
                    </div>

                    {/* Left Side Bottom Corner: leaf.png (Tropical Leaves in Foreground) */}
                    <div
                      className="absolute pointer-events-none z-30"
                      style={{
                        left: 0,
                        bottom: 0,
                        width: '16.35%'
                      }}
                    >
                      <img
                        src={plantLightLeaf}
                        alt="Bottom Left Leaf"
                        className="w-full h-auto block"
                      />
                    </div>

                    {/* Right Side Bottom Corner: lamp.png (Warm Mushroom Table Lamp on Credenza) */}
                    {decors.lamp && (
                      <div
                        className="absolute pointer-events-none z-20 transition-all duration-300"
                        style={{
                          right: '3.0%',
                          bottom: '6.5%',
                          width: '10.5%',
                          filter: 'none'
                        }}
                      >
                        {/* Light inside the lamp dome & warm ambient glow */}
                        {decors.lights && (
                          <>
                            {/* 1. Large ambient wall glow behind the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
                              style={{
                                left: '50%',
                                top: '35%',
                                width: '250%',
                                height: '250%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                                  : 'radial-gradient(circle, rgba(186, 230, 253, 0.40) 0%, rgba(147, 197, 253, 0.18) 35%, rgba(191, 219, 254, 0.05) 60%, transparent 80%)',
                                filter: 'blur(20px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 2. Downward pool of light on credenza top under the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 -z-10"
                              style={{
                                left: '50%',
                                top: '42%',
                                width: '240%',
                                height: '130%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.30) 40%, transparent 75%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.70) 0%, rgba(241, 245, 249, 0.32) 40%, transparent 75%)'
                                  : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(240, 249, 255, 0.65) 0%, rgba(186, 230, 253, 0.28) 40%, transparent 75%)',
                                filter: 'blur(10px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 3. Direct light inside the mushroom lamp dome */}
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-30"
                              style={{
                                left: '5%',
                                top: '2%',
                                width: '90%',
                                height: '48%',
                                borderRadius: '50% 50% 20% 20% / 78% 78% 22% 22%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 240, 0.98) 0%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.50) 75%, transparent 100%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.90) 45%, rgba(203, 213, 225, 0.40) 75%, transparent 100%)'
                                  : 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(240, 249, 255, 1) 0%, rgba(186, 230, 253, 0.68) 45%, rgba(147, 197, 253, 0.25) 75%, transparent 100%)',
                                mixBlendMode: 'screen',
                                filter: 'blur(3px)'
                              }}
                            />
                          </>
                        )}

                        <img
                          src={plantLightLamp}
                          alt="Lamp"
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
                  </>
    </>
  );
};

export default PlantLightShelf;
