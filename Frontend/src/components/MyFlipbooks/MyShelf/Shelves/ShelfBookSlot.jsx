import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getAssetBaseUrl } from '../../../../utils/assetUtils';

const ShelfBookSlot = ({
  book,
  bookIndex = 0,
  i = 0,
  bIdx = 0,
  tooltipPlacement,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  draggedBookIndex,
  openMenuId,
  setOpenMenuId,
  hoveredInfoId,
  setHoveredInfoId,
  handleRemoveBook,
  backendUrl,
  currentUserEmail,
  LazyPreviewComponent,
  shelfKey = 'shelf',
  landscapeWidth = '22%',
  squareWidth = '18%',
  portraitWidth = '15%',
  widthOverride,
  className = '',
}) => {
  const getInitialOrientation = () => {
    const raw = (book?.orientation || book?.rawBook?.orientation || book?.Customized_Settings?.FlipbookInfo?.orientation || '').toLowerCase();
    if (raw.includes('horizontal') || raw.includes('landscape') || book?.isLandscape) return 'landscape';
    if (raw.includes('square')) return 'square';
    if (raw.includes('vertical') || raw.includes('portrait')) return 'portrait';
    const w = book?.Customized_Settings?.FlipbookInfo?.width || book?.width || book?.rawBook?.width;
    const h = book?.Customized_Settings?.FlipbookInfo?.height || book?.height || book?.rawBook?.height;
    if (w && h) {
      return Number(w) > Number(h) ? 'landscape' : Number(w) < Number(h) ? 'portrait' : 'square';
    }
    if (book?.title && /landscape/i.test(book.title)) return 'landscape';
    if (book?.rawBook?.flipbookName && /landscape/i.test(book.rawBook.flipbookName)) return 'landscape';
    return 'portrait';
  };

  const [orientation, setOrientation] = useState(getInitialOrientation);

  useEffect(() => {
    setOrientation(getInitialOrientation());
  }, [book?.orientation, book?.rawBook?.orientation, book?.isLandscape, book?.v_id]);

  const isLandscape = orientation === 'landscape';
  const isSquare = orientation === 'square';

  const userFolder =
    book?.rawBook?.userID ||
    book?.rawBook?.userId ||
    book?.rawBook?.userEmail?.replace(/[@.]/g, '_') ||
    book?.userEmail?.replace(/[@.]/g, '_') ||
    currentUserEmail?.replace(/[@.]/g, '_');
  const folderName =
    (book?.rawBook?.folderName && Array.isArray(book.rawBook.folderName) && book.rawBook.folderName[0]) ||
    book?.rawBook?.folderName ||
    book?.rawBook?.folder ||
    'default';
  const resolvedTitle = typeof book?.title === 'string'
    ? book.title
    : (book?.rawBook?.flipbookName || book?.rawBook?.realName || 'Flipbook');
  const resolvedIframeBaseUrl = getAssetBaseUrl(userFolder, folderName, resolvedTitle);

  const resolvedPagesCount = Array.isArray(book?.pages)
    ? book.pages.length
    : typeof book?.pages === 'number'
    ? book.pages
    : Array.isArray(book?.rawBook?.pages)
    ? book.rawBook.pages.length
    : typeof book?.rawBook?.pages === 'number'
    ? book.rawBook.pages
    : typeof book?.pageCount === 'number'
    ? book.pageCount
    : 0;

  const resolvedAuthorName = typeof book?.authorName === 'string' && book.authorName.trim()
    ? book.authorName
    : 'Author';

  const resolvedViews = typeof book?.views === 'object' ? '1.2k' : (book?.views || '1.2k');
  const resolvedRating = typeof book?.rating === 'object' ? 4.5 : (book?.rating || 4.5);

  const effectiveWidth = widthOverride || (isLandscape ? landscapeWidth : isSquare ? squareWidth : portraitWidth);
  const menuIdentifier = `${shelfKey}-${bookIndex}`;
  const infoIdentifier = `${shelfKey}-info-${bookIndex}`;
  const isMenuOpen = openMenuId === menuIdentifier;
  const [isLocalInfoHovered, setIsLocalInfoHovered] = useState(false);
  const isInfoHovered = isLocalInfoHovered || (hoveredInfoId === infoIdentifier);

  const handleOpen = () => {
    const targetShareId = book?.shareId || book?.v_id;
    const rawAcc = String(book?.access || 'public').toLowerCase();
    if (targetShareId) {
      window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
    }
  };

  const onDragStartHandler = (e) => {
    setIsLocalInfoHovered(false);
    if (setHoveredInfoId) setHoveredInfoId(null);
    if (handleDragStart) handleDragStart(e, bookIndex);
  };

  return (
    <div
      key={book?.v_id || `${shelfKey}-book-${bookIndex}`}
      draggable
      onDragStart={onDragStartHandler}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop && handleDrop(e, bookIndex)}
      onDragEnd={handleDragEnd}
      onClick={handleOpen}
      className={`relative group cursor-pointer flex flex-col items-center justify-end ${
        isInfoHovered ? 'z-[100]' : isMenuOpen ? 'z-50' : 'z-20 hover:z-30'
      } ${draggedBookIndex === bookIndex ? 'opacity-50' : ''} ${className}`}
      style={{ width: effectiveWidth }}
    >
      {/* Book Cover Thumbnail with Viewport Scaling, Realistic 3D Shadow and Spine */}
      <div className="w-full flex items-end justify-center">
        <div
          className={`relative transition-transform duration-200 group-hover:scale-105 ${
            isLandscape
              ? 'w-full aspect-[1.42/1]'
              : isSquare
              ? 'w-[85%] aspect-square'
              : 'w-full aspect-[1/1.42]'
          }`}
        >
          {/* Inner Book Cover with overflow-hidden for 3D Spine and LazyPreview */}
          <div className="w-full h-full rounded-[0.35vw] overflow-hidden shadow-[4px_6px_14px_rgba(0,0,0,0.22),1px_2px_4px_rgba(0,0,0,0.1)] group-hover:shadow-[6px_10px_18px_rgba(0,0,0,0.28)] bg-white relative">
            {LazyPreviewComponent && (
              <LazyPreviewComponent
                v_id={book?.v_id}
                emailId={book?.rawBook?.userEmail || currentUserEmail}
                backendUrl={backendUrl}
                iframeBaseUrl={resolvedIframeBaseUrl}
                title={book?.title || 'Flipbook'}
                imageUrl={book?.rawBook?.image || null}
                onOrientationDetected={(detected) => {
                  if (detected && detected !== orientation) {
                    setOrientation(detected);
                  }
                }}
              />
            )}
            {/* 3D Spine Overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-[0.35vw] bg-gradient-to-r from-black/25 via-white/15 to-transparent pointer-events-none z-10" />
          </div>

          {/* Hover Action Pill (Three dots & Info) - Positioned cleanly inside top-right corner of the book */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-[0.35vw] right-[0.35vw] w-[1.1vw] min-w-[20px] h-[2.9vw] min-h-[44px] bg-[#E8E6E1]/95 hover:bg-[#E8E6E1] backdrop-blur-[2px] rounded-full flex flex-col items-center justify-between py-[0.25vw] transition-all duration-200 shadow-md ${
              isInfoHovered || isMenuOpen
                ? 'opacity-100 pointer-events-auto z-[60]'
                : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto z-30'
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId && setOpenMenuId(isMenuOpen ? null : menuIdentifier);
              }}
              className="text-black hover:bg-black/10 rounded-full w-[1vw] min-w-[16px] h-[1vw] min-h-[16px] flex items-center justify-center transition-colors pointer-events-auto cursor-pointer"
              title="More options"
            >
              <Icon icon="mdi:dots-vertical" className="text-[clamp(11px,0.75vw,14px)]" />
            </button>

            <div
              className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-[0.1vw] transition-colors relative cursor-pointer pointer-events-auto"
              onMouseEnter={() => {
                setIsLocalInfoHovered(true);
                if (setHoveredInfoId) setHoveredInfoId(infoIdentifier);
              }}
              onMouseLeave={() => {
                setIsLocalInfoHovered(false);
                if (setHoveredInfoId) setHoveredInfoId(null);
              }}
              title="Book Details"
            >
              <Icon icon="si:info-fill" className="w-[0.9vw] min-w-[14px] h-[0.9vw] min-h-[14px]" />

              {/* Book Detail Card in Viewport Units with Adaptive Left/Right Position */}
              <div
                className={`absolute top-1/2 ${
                  (tooltipPlacement === 'left' || (!tooltipPlacement && bIdx >= 2))
                    ? 'right-full pr-[0.7vw]'
                    : 'left-full pl-[0.7vw]'
                } -translate-y-1/2 ${isInfoHovered ? 'block' : 'hidden'} z-[110] pointer-events-auto`}
              >
                <div className="w-[15.5vw] min-w-[210px] max-w-[260px] bg-white rounded-[0.85vw] p-[0.9vw] text-gray-800 shadow-[0_16px_40px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.08)] flex flex-col gap-[0.65vw] cursor-default text-left border border-gray-100 relative z-[120]">
                  {/* Author Info */}
                  <div className="flex items-center gap-[0.6vw]">
                    {book?.authorPicture && book.authorPicture !== 'color_only' ? (
                      <img
                        src={book.authorPicture}
                        alt={resolvedAuthorName}
                        className="w-[2.2vw] h-[2.2vw] min-w-[32px] min-h-[32px] rounded-full border border-gray-200 object-cover shrink-0 shadow-sm"
                      />
                    ) : (
                      <div
                        className="w-[2.2vw] h-[2.2vw] min-w-[32px] min-h-[32px] rounded-full flex items-center justify-center text-white text-[clamp(11px,0.85vw,13px)] font-bold shrink-0 shadow-inner"
                        style={{ backgroundColor: book?.authorBgColor || '#4f46e5' }}
                      >
                        {resolvedAuthorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 pr-[0.2vw]">
                      <span className="text-[clamp(12px,0.82vw,14px)] font-bold text-gray-900 leading-tight truncate">
                        {resolvedAuthorName}
                      </span>
                      {book?.location && typeof book.location === 'string' && (
                        <span className="flex items-center gap-[0.2vw] text-[clamp(10px,0.68vw,12px)] text-gray-400 mt-[0.15vw] truncate">
                          <Icon icon="lucide:map-pin" className="w-[0.75vw] min-w-[11px] h-[0.75vw] min-h-[11px] text-gray-400 shrink-0" />
                          <span className="truncate">
                            {String(book.location).replace(/📍/g, '').replace(/≡ƒôì/g, '').trim()}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subtle Divider */}
                  <div className="h-px bg-gray-100 w-full" />

                  {/* Stats Row */}
                  <div className="flex items-center gap-[0.5vw] justify-start text-[clamp(10.5px,0.72vw,12.5px)] text-gray-600 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-[0.2vw]">
                      <span className="text-gray-900 font-bold">{resolvedPagesCount}</span>
                      <span className="font-normal text-gray-400">Pages</span>
                    </div>
                    <span className="text-gray-200">|</span>
                    <span className="flex items-center gap-[0.2vw]">
                      <Icon icon="lucide:eye" className="w-[0.8vw] min-w-[12px] h-[0.8vw] min-h-[12px] text-gray-400" />
                      {resolvedViews}
                    </span>
                    <span className="text-gray-200">|</span>
                    <span className="flex items-center gap-[0.2vw]">
                      <Icon icon="material-symbols:star" className="w-[0.8vw] min-w-[12px] h-[0.8vw] min-h-[12px] text-yellow-400" />
                      {resolvedRating}
                    </span>
                  </div>

                  {/* Title & Action Button perfectly aligned inside card */}
                  <div className="flex items-center justify-between gap-[0.5vw] pt-[0.2vw]">
                    <h4
                      className="text-[clamp(12px,0.85vw,15px)] font-bold text-gray-900 truncate tracking-tight flex-1"
                      title={resolvedTitle}
                    >
                      {resolvedTitle}
                    </h4>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen();
                      }}
                      className="bg-black hover:bg-gray-800 text-white w-[1.7vw] min-w-[24px] h-[1.7vw] min-h-[24px] rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer shrink-0 group/btn"
                      title="Open Book"
                    >
                      <Icon
                        icon="mdi:arrow-top-right"
                        className="w-[0.9vw] min-w-[13px] h-[0.9vw] min-h-[13px] transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dropdown Menu - Viewport Scaled */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-[105%] w-[8vw] min-w-[120px] bg-white rounded-[0.5vw] shadow-xl py-[0.3vw] z-[120] text-left border border-gray-100 animate-in fade-in zoom-in-95 duration-100 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleOpen();
                    if (setOpenMenuId) setOpenMenuId(null);
                  }}
                  className="w-full px-[0.7vw] py-[0.35vw] text-[clamp(11px,0.75vw,13px)] text-gray-700 hover:bg-gray-50 flex items-center gap-[0.4vw] transition-colors"
                >
                  <Icon icon="mdi:open-in-new" className="text-[clamp(12px,0.85vw,14px)]" />
                  Open Book
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (handleRemoveBook) handleRemoveBook(book?.v_id);
                    if (setOpenMenuId) setOpenMenuId(null);
                  }}
                  className="w-full px-[0.7vw] py-[0.35vw] text-[clamp(11px,0.75vw,13px)] text-red-600 hover:bg-red-50 flex items-center gap-[0.4vw] transition-colors"
                >
                  <Icon icon="mdi:trash-can-outline" className="text-[clamp(12px,0.85vw,14px)]" />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelfBookSlot;
