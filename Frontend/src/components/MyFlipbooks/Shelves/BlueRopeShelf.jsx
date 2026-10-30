import React from 'react';
import { Icon } from '@iconify/react';

// Blue Rope Shelf Assets
import blueFrameBase from '../../../assets/Bookshelf/blue_frame/base.png';
import blueFrameLeftShelf from '../../../assets/Bookshelf/blue_frame/leftshelf.png';
import blueFrameLight from '../../../assets/Bookshelf/blue_frame/light.png';
import blueFrameDecor from '../../../assets/Bookshelf/blue_frame/decor.png';
import blueFrameRopeShelf from '../../../assets/Bookshelf/blue_frame/rope_shelf.png';

const BlueRopeShelf = ({
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
                    {/* 1. Left Bookcase Shelf on left wall */}
                    <div
                      className="absolute left-0 top-0 pointer-events-none z-10"
                      style={{
                        bottom: '8.4%',
                        width: '12.4%'
                      }}
                    >
                      <img
                        src={blueFrameLeftShelf}
                        alt="Left Shelf"
                        className="w-full h-full block object-fill"
                      />
                    </div>

                    {/* 2. Base Credenza along bottom */}
                    <div
                      className="absolute left-0 w-full pointer-events-none z-10"
                      style={{
                        bottom: 0,
                        height: '9.4%'
                      }}
                    >
                      <img
                        src={blueFrameBase}
                        alt="Base"
                        className="w-full h-full block object-fill"
                      />
                    </div>

                    {/* 3. Top-Right Ceiling Hanging Pendant Lamp with Realistic Downward Spread Light Effect */}
                    <div
                      className="absolute top-0 pointer-events-none z-20"
                      style={{
                        right: '4.8%',
                        width: '11.9%'
                      }}
                    >
                      {/* Realistic Downward Spreading Light & Ambiance Effects */}
                      {decors.lights && (
                        <>
                          {/* 1. Large Ambient Wall Glow behind the lamp fixture */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
                            style={{
                              left: '50%',
                              top: '93%',
                              width: '380%',
                              height: '380%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                                : 'radial-gradient(circle, rgba(186, 230, 253, 0.42) 0%, rgba(147, 197, 253, 0.18) 35%, rgba(191, 219, 254, 0.05) 60%, transparent 80%)',
                              filter: 'blur(22px)',
                              mixBlendMode: 'screen'
                            }}
                          />

                          {/* 2. Wide Downward Spreading Conical Beam (Spread Light Wall Wash) */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 -z-10"
                            style={{
                              left: '50%',
                              top: '93%',
                              width: '420%',
                              height: '460%',
                              clipPath: 'polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)',
                              background: selectedLightTheme === 'light1'
                                ? 'linear-gradient(to bottom, rgba(255, 250, 220, 0.88) 0%, rgba(254, 240, 138, 0.45) 25%, rgba(251, 191, 36, 0.18) 60%, rgba(245, 158, 11, 0.03) 85%, transparent 100%)'
                                : selectedLightTheme === 'light2'
                                ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.50) 25%, rgba(203, 213, 225, 0.18) 60%, rgba(203, 213, 225, 0.03) 85%, transparent 100%)'
                                : 'linear-gradient(to bottom, rgba(240, 249, 255, 0.92) 0%, rgba(186, 230, 253, 0.44) 25%, rgba(147, 197, 253, 0.15) 60%, rgba(147, 197, 253, 0.03) 85%, transparent 100%)',
                              filter: 'blur(16px)',
                              mixBlendMode: 'screen'
                            }}
                          />

                          {/* 3. Inner Focused Light Core Shaft */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 -z-10"
                            style={{
                              left: '50%',
                              top: '93%',
                              width: '240%',
                              height: '320%',
                              clipPath: 'polygon(42% 0%, 58% 0%, 100% 100%, 0% 100%)',
                              background: selectedLightTheme === 'light1'
                                ? 'linear-gradient(to bottom, rgba(255, 255, 240, 0.95) 0%, rgba(254, 240, 138, 0.58) 25%, rgba(251, 191, 36, 0.18) 65%, transparent 100%)'
                                : selectedLightTheme === 'light2'
                                ? 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(248, 250, 252, 0.62) 25%, rgba(203, 213, 225, 0.18) 65%, transparent 100%)'
                                : 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(224, 242, 254, 0.58) 25%, rgba(186, 230, 253, 0.15) 65%, transparent 100%)',
                              filter: 'blur(8px)',
                              mixBlendMode: 'screen'
                            }}
                          />

                          {/* 4. Downward Pool of Light on Lower Space / Credenza */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 -z-10"
                            style={{
                              left: '50%',
                              top: '280%',
                              width: '320%',
                              height: '140%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(ellipse 65% 45% at 50% 50%, rgba(254, 240, 138, 0.35) 0%, rgba(251, 191, 36, 0.15) 45%, transparent 75%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(ellipse 65% 45% at 50% 50%, rgba(255, 255, 255, 0.40) 0%, rgba(241, 245, 249, 0.16) 45%, transparent 75%)'
                                : 'radial-gradient(ellipse 65% 45% at 50% 50%, rgba(240, 249, 255, 0.38) 0%, rgba(186, 230, 253, 0.15) 45%, transparent 75%)',
                              filter: 'blur(16px)',
                              mixBlendMode: 'screen'
                            }}
                          />

                          {/* 5. Glowing Bulb Hotspot Opening at Dome Rim */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-30"
                            style={{
                              left: '50%',
                              top: '93%',
                              width: '68%',
                              height: '14%',
                              borderRadius: '50%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(255, 255, 240, 1) 0%, rgba(254, 240, 138, 0.95) 45%, rgba(251, 191, 36, 0.60) 80%, transparent 100%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.95) 45%, rgba(203, 213, 225, 0.50) 80%, transparent 100%)'
                                : 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(224, 242, 254, 0.95) 45%, rgba(147, 197, 253, 0.50) 80%, transparent 100%)',
                              boxShadow: selectedLightTheme === 'light1'
                                ? '0 0 16px 4px rgba(251, 191, 36, 0.85), 0 0 28px 8px rgba(245, 158, 11, 0.40)'
                                : selectedLightTheme === 'light2'
                                ? '0 0 16px 4px rgba(255, 255, 255, 0.90), 0 0 28px 8px rgba(203, 213, 225, 0.40)'
                                : '0 0 16px 4px rgba(186, 230, 253, 0.85), 0 0 28px 8px rgba(147, 197, 253, 0.35)',
                              filter: 'blur(1.5px)',
                              mixBlendMode: 'screen'
                            }}
                          />
                        </>
                      )}

                      <img
                        src={blueFrameLight}
                        alt="Ceiling Light"
                        className="w-full h-auto block drop-shadow-md relative z-20 transition-all duration-300"
                        style={{
                          filter: decors.lights
                            ? (selectedLightTheme === 'light1'
                                ? 'brightness(1.10) contrast(1.02) drop-shadow(0 0 16px rgba(251, 191, 36, 0.45))'
                                : selectedLightTheme === 'light2'
                                ? 'brightness(1.18) contrast(1.02) drop-shadow(0 0 16px rgba(255, 255, 255, 0.50))'
                                : 'brightness(1.08) contrast(1.02) drop-shadow(0 0 16px rgba(186, 230, 253, 0.45))')
                            : 'none'
                        }}
                      />
                    </div>

                    {/* 4. Bottom-Left Vase/Plant Decor placed on credenza */}
                    <div
                      className="absolute pointer-events-none z-20"
                      style={{
                        left: '13.6%',
                        bottom: '8.5%',
                        width: '12.6%'
                      }}
                    >
                      <img
                        src={blueFrameDecor}
                        alt="Decor"
                        className="w-full h-auto block drop-shadow-md"
                      />
                    </div>

                    {/* 5. Upper-Left Rope Shelf Tier */}
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        left: '16.8%',
                        top: '21.5%',
                        width: '36.4%'
                      }}
                    >
                      <img
                        src={blueFrameRopeShelf}
                        alt="Upper Rope Shelf"
                        className="w-full h-auto block drop-shadow-md"
                      />
                    </div>

                    {/* 6. Lower-Right Rope Shelf Tier */}
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        left: '55.8%',
                        top: '51.5%',
                        width: '36.4%'
                      }}
                    >
                      <img
                        src={blueFrameRopeShelf}
                        alt="Lower Rope Shelf"
                        className="w-full h-auto block drop-shadow-md"
                      />
                    </div>

                    {/* 7. Books on Upper-Left Rope Shelf (2 books matching screenshot) */}
                    <div
                      className="absolute z-20 flex items-end justify-center pointer-events-auto"
                      style={{
                        left: '23.8%',
                        top: '19.8%',
                        width: '22.5%',
                        height: '24.8%',
                        gap: '5.2%'
                      }}
                    >
                      {[0, 1].map((slotIdx) => {
                        const book = filteredBooks && filteredBooks[slotIdx];
                        if (!book) {
                          return (
                            <div
                              key={`upper-rope-empty-${slotIdx}`}
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
                            key={book.v_id || `upper-rope-${slotIdx}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, slotIdx)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, slotIdx)}
                            onDragEnd={handleDragEnd}
                            className={`relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer ${openMenuId === `bluerope-${slotIdx}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === slotIdx ? 'opacity-50' : ''}`}
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
                                  setOpenMenuId(openMenuId === `bluerope-${slotIdx}` ? null : `bluerope-${slotIdx}`);
                                }}
                                className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                              >
                                <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                              </button>
                              <div
                                className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                                onMouseEnter={() => setHoveredInfoId(`bluerope-${slotIdx}`)}
                                onMouseLeave={() => setHoveredInfoId(null)}
                              >
                                <Icon icon="si:info-fill" className="w-4 h-4" />
                                <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `bluerope-${slotIdx}` ? 'block' : 'hidden'} z-[60]`}>
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
                            {openMenuId === `bluerope-${slotIdx}` && (
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

                    {/* 8. Books on Lower-Right Rope Shelf (2 books matching screenshot) */}
                    <div
                      className="absolute z-20 flex items-end justify-center pointer-events-auto"
                      style={{
                        left: '62.8%',
                        top: '49.8%',
                        width: '22.5%',
                        height: '24.8%',
                        gap: '5.2%'
                      }}
                    >
                      {[2, 3].map((slotIdx) => {
                        const book = filteredBooks && filteredBooks[slotIdx];
                        if (!book) {
                          return (
                            <div
                              key={`lower-rope-empty-${slotIdx}`}
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
                            key={book.v_id || `lower-rope-${slotIdx}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, slotIdx)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, slotIdx)}
                            onDragEnd={handleDragEnd}
                            className={`relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer ${openMenuId === `bluerope-${slotIdx}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === slotIdx ? 'opacity-50' : ''}`}
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
                                  setOpenMenuId(openMenuId === `bluerope-${slotIdx}` ? null : `bluerope-${slotIdx}`);
                                }}
                                className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                              >
                                <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                              </button>
                              <div
                                className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                                onMouseEnter={() => setHoveredInfoId(`bluerope-${slotIdx}`)}
                                onMouseLeave={() => setHoveredInfoId(null)}
                              >
                                <Icon icon="si:info-fill" className="w-4 h-4" />
                                <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `bluerope-${slotIdx}` ? 'block' : 'hidden'} z-[60]`}>
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
                            {openMenuId === `bluerope-${slotIdx}` && (
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

export default BlueRopeShelf;
