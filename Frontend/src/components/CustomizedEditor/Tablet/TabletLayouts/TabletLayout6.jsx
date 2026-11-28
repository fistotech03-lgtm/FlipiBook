import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import ShareModal from '../../../ShareModal';
import TabletTableOfContentsPopup from './TabletTableOfContentsPopup';

const PageThumbnail = React.memo(({ html, index, scale = 0.15 }) => {
    if (!html) return <div className="w-full h-full bg-white flex items-center justify-center text-gray-300">Empty</div>;
    
    let processedHtml = html;
    processedHtml = processedHtml.replace(/<img\b([^>]*src=['"]https:\/\/codia-f2c\.s3\.us-west-1\.amazonaws\.com\/[^'"]*['"])([^>]*)>/gi, '<img $1 crossOrigin="anonymous" $2>');

    const srcDoc = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; background: white; width: 400px; height: 566px; position: relative; }
                    * { box-sizing: border-box; }
                    img { max-width: 100%; object-fit: contain; }
                </style>
            </head>
            <body>
                <div style="transform: scale(${scale}); transform-origin: top left; width: ${100 / scale}%; height: ${100 / scale}%;">
                    ${processedHtml}
                </div>
            </body>
        </html>
    `;

    return (
        <iframe
            srcDoc={srcDoc}
            title={`Thumbnail ${index + 1}`}
            className="w-full h-full border-none select-none pointer-events-none bg-white"
            scrolling="no"
            sandbox="allow-same-origin allow-scripts"
        />
    );
});

const TabletLayout6 = ({ 
    children, 
    bookRef, 
    currentPage = 0, 
    pages, 
    offset = 0, 
    bookName,
    onPageClick,
    currentZoom,
    zoom = 1,
    currentBook,
    activeLayout,
    settings,
    showTOC,
    setShowTOCMemo,
    showThumbnailBar,
    setShowThumbnailBarMemo,
    showSoundPopup,
    setShowSoundPopupMemo,
    showProfilePopup,
    setShowProfilePopupMemo,
    showGalleryPopup,
    setShowGalleryPopupMemo,
    isAutoFlipping = false,
    setIsPlaying,
    handleDownload,
    handleFullScreen,
    layoutColors: propLayoutColors,
    searchQuery = '',
    setSearchQuery,
    handleQuickSearch
}) => {
    const layoutColors = propLayoutColors || settings?.Layouts?.layoutColors || settings?.layoutColors;
    const layoutColorsArray = Array.isArray(layoutColors) ? layoutColors : (layoutColors?.[activeLayout || 6] || []);

    const getLayoutColor = (id, defaultColor) => {
        if (layoutColorsArray && layoutColorsArray.length > 0) {
            const colorObj = layoutColorsArray.find(c => c && c.id === id);
            if (colorObj && colorObj.hex) {
                return colorObj.hex;
            }
        }
        return `var(--${id}, ${defaultColor})`;
    };

    const getLayoutColorAlpha = (id, defaultRgb, alpha) => {
        let op = 1;
        if (layoutColorsArray && layoutColorsArray.length > 0) {
            const colorObj = layoutColorsArray.find(c => c && c.id === id);
            if (colorObj) {
                if (colorObj.opacity !== undefined) {
                    op = colorObj.opacity / 100;
                }
                if (colorObj.hex) {
                    const hex = colorObj.hex.replace('#', '');
                    const r = parseInt(hex.length === 3 ? hex.charAt(0) + hex.charAt(0) : hex.substring(0, 2), 16);
                    const g = parseInt(hex.length === 3 ? hex.charAt(1) + hex.charAt(1) : hex.substring(2, 4), 16);
                    const b = parseInt(hex.length === 3 ? hex.charAt(2) + hex.charAt(2) : hex.substring(4, 6), 16);
                    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                        const finalAlpha = alpha !== undefined ? (op * alpha) : op;
                        return `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
                    }
                }
            }
        }
        const finalAlpha = alpha !== undefined ? (op * alpha) : op;
        return `rgba(var(--${id}-rgb, ${defaultRgb}), ${finalAlpha})`;
    };

    const [isShareOpen, setIsShareOpen] = useState(false);
    const [tocSearchQuery, setTocSearchQuery] = useState('');
    const progressRef = useRef(null);
    const [pageInputValue, setPageInputValue] = useState(String(currentPage + 1));
    const textFont = settings?.navigation?.addTextToIconsSettings?.font || settings?.addTextToIconsSettings?.font || settings?.toolbar?.textProperties?.font || 'Arial';

    useEffect(() => {
        setPageInputValue(String(currentPage + 1));
    }, [currentPage]);

    const spreads = useMemo(() => {
        if (!pages || !pages.length) return [];
        const result = [];
        result.push({ 
            pages: [pages[0]], 
            indices: [0],
            label: 'Page 1'
        });
        for (let i = 1; i < pages.length; i += 2) {
            const spreadPages = [pages[i]];
            const indices = [i];
            let label = `Page ${i + 1}`;
            if (i + 1 < pages.length) {
                spreadPages.push(pages[i + 1]);
                indices.push(i + 1);
                label = `Page ${i + 1}-${i + 2}`;
            }
            result.push({ pages: spreadPages, indices, label });
        }
        return result;
    }, [pages]);
    
    const pagesCount = pages ? (Array.isArray(pages) ? pages.length : pages) : 12;
    let progressPercentage = 0;
    if (pagesCount > 1) {
        if (currentPage >= pagesCount - 1) {
            progressPercentage = 100;
        } else {
            progressPercentage = (currentPage / (pagesCount - 1)) * 100;
        }
    }

    const handleProgressClick = (e) => {
        if (!progressRef.current || pagesCount <= 1) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const targetIdx = Math.round(percentage * (pagesCount - 1));
        if (onPageClick) onPageClick(targetIdx);
    };

    return (
        <div className="relative w-full h-full flex flex-col font-sans overflow-hidden" style={{ containerType: 'inline-size' }}>
      <div id="tablet-download-portal" className="absolute inset-0 z-[60] pointer-events-none"></div>
      <div id="tablet-sound-portal" className="absolute inset-0 z-[60] pointer-events-none"></div>
            
            {/* Thumbnails Popup */}
            {showThumbnailBar && (
                <div 
                    className="absolute left-[7cqw] bottom-[7.5%] top-[14cqw] w-[26cqw] rounded-t-[1.5cqw] z-[100] flex flex-col shadow-[-10px_0px_40px_rgba(0,0,0,0.15)] overflow-hidden border-t-[0.1cqw] border-l-[0.1cqw] border-r-[0.1cqw] backdrop-blur-md pointer-events-auto"
                    style={{
                        backgroundColor: getLayoutColorAlpha('toc-bg', '85, 85, 85', 0.6),
                        borderColor: getLayoutColorAlpha('toc-text', '85, 85, 85', 0.3)
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="h-[7cqw] flex items-center justify-between px-[2cqw] border-b shrink-0" style={{ borderColor: getLayoutColorAlpha('toc-text', '85, 85, 85', 0.2) }}>
                        <span className="text-[1.8cqw] font-bold" style={{ color: getLayoutColor('toc-text', '#555555'), opacity: (layoutColorsArray.find(c => c && c.id === 'toc-text')?.opacity ?? 100) / 100 }}>
                            Thumbnails
                        </span>
                        <button onClick={() => setShowThumbnailBarMemo?.(false)} className="transition-colors" style={{ color: getLayoutColor('toc-icon', '#555555'), opacity: ((layoutColorsArray.find(c => c && c.id === 'toc-icon')?.opacity ?? 100) / 100) * 0.8 }}>
                            <Icon icon="lucide:x" className="w-[2cqw] h-[2cqw]" />
                        </button>
                    </div>

                    {/* Thumbnail Items List - 2 Column Grid like Layout 6 */}
                    <div className="flex-1 overflow-y-auto px-[1.5cqw] py-[1.5cqw]" style={{ scrollbarWidth: 'none' }}>
                        <div className="flex gap-[1cqw]">
                            {/* Left Column */}
                            <div className="flex-1 flex flex-col gap-[1.2cqw] min-w-0">
                                {spreads.filter((_, i) => i % 2 === 0).map((spread, idx) => {
                                    const isSelected = spread.indices.includes(currentPage);
                                    return (
                                        <div
                                            key={`l-${idx}`}
                                            className={`w-full bg-white rounded-[0.8cqw] flex flex-col cursor-pointer transition-all p-[0.4cqw] shadow-[0_0.2cqw_0.6cqw_rgba(0,0,0,0.08)] hover:shadow-[0_0.4cqw_1cqw_rgba(0,0,0,0.15)] ${isSelected ? 'ring-[0.2cqw] ring-white' : 'ring-[0.1cqw] ring-transparent'}`}
                                            onClick={() => {
                                                if (bookRef?.current?.pageFlip) {
                                                    bookRef.current.pageFlip().turnToPage(spread.indices[0]);
                                                } else if (onPageClick) {
                                                    onPageClick(spread.indices[0]);
                                                }
                                                setShowThumbnailBarMemo?.(false);
                                            }}
                                        >
                                            <div className="rounded-[0.5cqw] overflow-hidden bg-gray-50/50 mb-[0.3cqw] ring-1 ring-gray-100/50 aspect-[4/3] flex items-center justify-center">
                                                <div className="flex gap-0 w-full h-full justify-center">
                                                    {spread.pages.map((page, pIdx) => (
                                                        <div key={pIdx} className="flex-1 max-w-[50%] flex min-w-0 h-full">
                                                            <PageThumbnail
                                                                html={page.html || page.content}
                                                                index={spread.indices[pIdx]}
                                                                scale={0.12}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-center pb-[0.2cqw]">
                                                <span className="text-[1.1cqw] font-medium text-[#555555]">
                                                    {spread.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Column */}
                            <div className="flex-1 flex flex-col gap-[1.2cqw] min-w-0 pt-[3cqw]">
                                {spreads.filter((_, i) => i % 2 !== 0).map((spread, idx) => {
                                    const isSelected = spread.indices.includes(currentPage);
                                    return (
                                        <div
                                            key={`r-${idx}`}
                                            className={`w-full bg-white rounded-[0.8cqw] flex flex-col cursor-pointer transition-all p-[0.4cqw] shadow-[0_0.2cqw_0.6cqw_rgba(0,0,0,0.08)] hover:shadow-[0_0.4cqw_1cqw_rgba(0,0,0,0.15)] ${isSelected ? 'ring-[0.2cqw] ring-white' : 'ring-[0.1cqw] ring-transparent'}`}
                                            onClick={() => {
                                                if (bookRef?.current?.pageFlip) {
                                                    bookRef.current.pageFlip().turnToPage(spread.indices[0]);
                                                } else if (onPageClick) {
                                                    onPageClick(spread.indices[0]);
                                                }
                                                setShowThumbnailBarMemo?.(false);
                                            }}
                                        >
                                            <div className="rounded-[0.5cqw] overflow-hidden bg-gray-50/50 mb-[0.3cqw] ring-1 ring-gray-100/50 aspect-[4/3] flex items-center justify-center">
                                                <div className="flex gap-0 w-full h-full justify-center">
                                                    {spread.pages.map((page, pIdx) => (
                                                        <div key={pIdx} className="flex-1 max-w-[50%] flex min-w-0 h-full">
                                                            <PageThumbnail
                                                                html={page.html || page.content}
                                                                index={spread.indices[pIdx]}
                                                                scale={0.12}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-center pb-[0.2cqw]">
                                                <span className="text-[1.1cqw] font-medium text-[#555555]">
                                                    {spread.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TOC Popup */}
            {showTOC && (
                <div 
                    className="absolute left-[7cqw] bottom-[7.5%] top-[14cqw] w-[26cqw] rounded-t-[1.5cqw] z-[100] flex flex-col shadow-[-10px_0px_40px_rgba(0,0,0,0.15)] overflow-hidden border-t-[0.1cqw] border-l-[0.1cqw] border-r-[0.1cqw] backdrop-blur-md pointer-events-auto"
                    style={{
                        backgroundColor: getLayoutColorAlpha('toc-bg', '85, 85, 85', 0.6),
                        borderColor: getLayoutColorAlpha('toc-text', '85, 85, 85', 0.3)
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="h-[7cqw] flex items-center justify-between px-[2cqw] border-b shrink-0" style={{ borderColor: getLayoutColorAlpha('toc-text', '85, 85, 85', 0.2) }}>
                        <span className="text-[1.8cqw] font-bold" style={{ color: getLayoutColor('toc-text', '#555555'), opacity: (layoutColorsArray.find(c => c && c.id === 'toc-text')?.opacity ?? 100) / 100 }}>Table of Contents</span>
                        <button onClick={() => { setShowTOCMemo?.(false); setTocSearchQuery(''); }} className="transition-colors" style={{ color: getLayoutColor('toc-icon', '#555555'), opacity: ((layoutColorsArray.find(c => c && c.id === 'toc-icon')?.opacity ?? 100) / 100) * 0.6 }}>
                            <Icon icon="lucide:x" className="w-[2cqw] h-[2cqw]" />
                        </button>
                    </div>

                    {/* Search Box */}
                    {settings?.tocSettings?.addSearch !== false && (
                        <div className="px-[1.5cqw] py-[1.2cqw] border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                            <div
                                className="flex items-center rounded-[0.6cqw] px-[1cqw] py-[0.6cqw] border group transition-all"
                                style={{
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    borderColor: 'rgba(0,0,0,0.05)'
                                }}
                            >
                                <Icon icon="lucide:search" className="w-[1.4cqw] h-[1.4cqw]" style={{ color: getLayoutColor('toc-icon', '#555555'), opacity: ((layoutColorsArray.find(c => c && c.id === 'toc-icon')?.opacity ?? 100) / 100) * 0.4 }} />
                                <input
                                    type="text" autoComplete="off" spellCheck="false" autoCorrect="off"
                                    value={tocSearchQuery}
                                    onChange={(e) => setTocSearchQuery(e.target.value)}
                                    placeholder="Search in TOC..."
                                    className="bg-transparent border-0 outline-none text-[1.2cqw] ml-[0.8cqw] w-full font-sans"
                                    style={{ color: getLayoutColor('toc-text', '#555555'), opacity: (layoutColorsArray.find(c => c && c.id === 'toc-text')?.opacity ?? 100) / 100 }}
                                />
                                {tocSearchQuery && (
                                    <button onClick={() => setTocSearchQuery('')} style={{ color: getLayoutColor('toc-icon', '#555555'), opacity: ((layoutColorsArray.find(c => c && c.id === 'toc-icon')?.opacity ?? 100) / 100) * 0.4 }}>
                                        <Icon icon="lucide:x" className="w-[1.2cqw] h-[1.2cqw]" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        <div className="p-[1.5cqw] flex flex-col">
                            {settings?.tocSettings?.content?.length > 0 ? (
                                <div className="flex flex-col gap-[0.8cqw]">
                                    {settings.tocSettings.content
                                        .filter(item => {
                                            if (!tocSearchQuery) return true;
                                            const matchMain = item.title?.toLowerCase().includes(tocSearchQuery.toLowerCase());
                                            const matchSub = item.subheadings?.some(sub => sub.title?.toLowerCase().includes(tocSearchQuery.toLowerCase()));
                                            return matchMain || matchSub;
                                        })
                                        .map((item, idx) => (
                                            <div key={idx} className="flex flex-col mb-[0.8cqw]">
                                                <div
                                                    className="flex items-center justify-between py-[0.8cqw] px-[1cqw] hover:bg-white/10 rounded-[0.6cqw] cursor-pointer transition-all group"
                                                    style={{ color: getLayoutColor('toc-text', '#555555'), opacity: (layoutColorsArray.find(c => c && c.id === 'toc-text')?.opacity ?? 100) / 100 }}
                                                    onClick={() => {
                                                        if (bookRef?.current?.pageFlip) {
                                                            bookRef.current.pageFlip().turnToPage(item.page - 1);
                                                        } else if (onPageClick) {
                                                            onPageClick(item.page - 1);
                                                        }
                                                        setShowTOCMemo?.(false);
                                                        setTocSearchQuery('');
                                                    }}
                                                >
                                                    <div className="flex items-center gap-[0.6cqw] truncate pr-[0.8cqw]">
                                                        {settings.tocSettings?.addSerialNumberToHeading !== false && (
                                                            <span className="text-[1.2cqw] font-bold opacity-40 shrink-0">{idx + 1}.</span>
                                                        )}
                                                        <span className="text-[1.2cqw] font-semibold group-hover:opacity-100 truncate opacity-90">
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                    {settings.tocSettings?.addPageNumber !== false && (
                                                        <span className="text-[1.2cqw] font-bold opacity-40 group-hover:opacity-80 tabular-nums">
                                                            {(() => {
                                                                const num = parseInt(String(item.page || '').replace(/\D/g, ''), 10);
                                                                if (isNaN(num)) return '';
                                                                return num < 10 ? `0${num}` : `${num}`;
                                                            })()}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.subheadings && item.subheadings.length > 0 && (
                                                    <div className="flex flex-col mt-[0.2cqw]">
                                                        {item.subheadings
                                                            .filter(sub => !tocSearchQuery || sub.title?.toLowerCase().includes(tocSearchQuery.toLowerCase()))
                                                            .map((sub, sIdx) => (
                                                                <div
                                                                    key={sIdx}
                                                                    className="flex items-center justify-between py-[0.6cqw] px-[1cqw] hover:bg-white/10 rounded-[0.6cqw] cursor-pointer transition-all group"
                                                                    style={{ color: getLayoutColor('toc-text', '#555555'), opacity: (layoutColorsArray.find(c => c && c.id === 'toc-text')?.opacity ?? 100) / 100 }}
                                                                    onClick={() => {
                                                                        const p = parseInt(String(sub.page || '').replace(/\D/g, ''), 10);
                                                                        if (!isNaN(p) && p >= 1) {
                                                                            if (bookRef?.current?.pageFlip) {
                                                                                bookRef.current.pageFlip().turnToPage(p - 1);
                                                                            } else if (onPageClick) {
                                                                                onPageClick(p - 1);
                                                                            }
                                                                        }
                                                                        setShowTOCMemo?.(false);
                                                                        setTocSearchQuery('');
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-[0.6cqw] truncate pr-[0.8cqw] pl-[1cqw]">
                                                                        {settings.tocSettings?.addSerialNumberToSubheading !== false && (
                                                                            <span className="text-[1.1cqw] font-bold opacity-30 shrink-0">{idx + 1}.{sIdx + 1}</span>
                                                                        )}
                                                                        <span className="text-[1.1cqw] font-medium opacity-70 group-hover:opacity-100 truncate">
                                                                            {sub.title}
                                                                        </span>
                                                                    </div>
                                                                    {settings.tocSettings?.addPageNumber !== false && (
                                                                        <span className="text-[1.1cqw] font-semibold opacity-30 group-hover:opacity-60 tabular-nums">
                                                                            {(() => {
                                                                                const num = parseInt(String(sub.page || '').replace(/\D/g, ''), 10);
                                                                                if (isNaN(num)) return '';
                                                                                return num < 10 ? `0${num}` : `${num}`;
                                                                            })()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-[10cqw] opacity-30 select-none">
                                    <Icon icon="ph:list-bullets-bold" className="w-[4cqw] h-[4cqw] mb-[1.5cqw]" style={{ color: getLayoutColor('toc-icon', '#555555'), opacity: (layoutColorsArray.find(c => c && c.id === 'toc-icon')?.opacity ?? 100) / 100 }} />
                                    <span className="text-[1.4cqw] font-bold" style={{ color: getLayoutColor('toc-text', '#555555'), opacity: (layoutColorsArray.find(c => c && c.id === 'toc-text')?.opacity ?? 100) / 100 }}>No Table of Contents</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Top Bar - Floating/Transparent */}
            {(settings?.interaction?.search ?? true) && (
                <div className="absolute top-[2cqw] left-[2cqw] right-[2cqw] flex items-center justify-between z-20 pointer-events-none">
                    {/* Search Bar */}
                    <div 
                        className="pointer-events-auto flex items-center border rounded-[0.5cqw] px-[1cqw] py-[0.6cqw] w-[20cqw] backdrop-blur-md shadow-sm"
                        style={{
                            backgroundColor: getLayoutColorAlpha('search-bg-v2', '102, 102, 102', 0.6),
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        <Icon icon="lucide:search" className="w-[1.5cqw] h-[1.5cqw]" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF'), opacity: 0.7 }} />
                        <input 
                            type="text" 
                            placeholder="Quick Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery?.(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch?.(searchQuery)}
                            className={`bg-transparent outline-none border-none text-[1.2cqw] ml-[0.5cqw] w-full ${getLayoutColor('toolbar-text-main', '#FFFFFF')?.toLowerCase() === '#ffffff' ? 'placeholder:text-white/60' : 'placeholder:text-black/50'} font-medium`} 
                            style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}
                        />
                    </div>
                    {/* Title */}
                    <div className="text-white font-bold text-[1.8cqw] tracking-wide filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                        {/* bookName hidden */}
                    </div>
                    {/* Spacer to keep title centered */}
                    <div className="w-[20cqw]"></div>
                </div>
            )}

            {/* Middle Content Area */}
            <div className="flex-1 min-h-0 w-full relative flex items-center justify-center overflow-hidden pt-[6cqw]">
                {/* Left Chevron */}
                {(settings?.navigation?.nextPrevButtons ?? true) && (
                    <button 
                        onClick={() => bookRef?.current?.pageFlip()?.flipPrev()}
                        className="absolute left-[3cqw] z-10 p-[1cqw] transition-colors"
                        style={{ color: getLayoutColor('bottom-toolbar-bg', '#555555') }}
                    >
                        <Icon icon="lucide:chevron-left" className="w-[3cqw] h-[4cqw]" />
                    </button>
                )}

                {/* Flipbook Container */}
                <div 
                    className="flex items-center justify-center shrink-0 max-w-[calc(100%-14cqw)] z-0" 
                    style={{ 
                        translate: `${offset}px 0`, 
                        transform: `scale(${currentZoom || zoom || 1})`, 
                        transition: 'translate 0.85s cubic-bezier(0.45, 0, 0.2, 1), transform 0.5s ease-out',
                        transformOrigin: 'center center'
                    }}
                >
                    {children}
                </div>

                {/* Right Chevron */}
                {(settings?.navigation?.nextPrevButtons ?? true) && (
                    <button 
                        onClick={() => bookRef?.current?.pageFlip()?.flipNext()}
                        className="absolute right-[8cqw] z-10 p-[1cqw] transition-colors"
                        style={{ color: getLayoutColor('bottom-toolbar-bg', '#555555') }}
                    >
                        <Icon icon="lucide:chevron-right" className="w-[3cqw] h-[4cqw]" />
                    </button>
                )}

                {/* Left Vertical Toolbar */}
                <div 
                    className="absolute left-[1.5cqw] top-1/2 -translate-y-1/2 rounded-[1.2cqw] flex flex-col items-center py-[1.8cqw] gap-[1.8cqw] z-20 shadow-lg px-[1.2cqw]"
                    style={{ 
                        backgroundColor: getLayoutColor('toolbar-bg', '#555555'),
                        color: getLayoutColor('toolbar-text-main', '#FFFFFF')
                    }}
                >
                    {(settings?.navigation?.tableOfContents ?? true) && (
                        <button onClick={() => { setShowTOCMemo?.(!showTOC); setShowThumbnailBarMemo?.(false); setShowSoundPopupMemo?.(false); }} className={`hover:opacity-80 active:scale-95 transition-transform relative group flex flex-col items-center justify-center ${showTOC ? 'opacity-70' : ''}`} style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}>
                            <Icon icon="fluent:text-bullet-list-24-filled" className="w-[2.4cqw] h-[2.4cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>TOC</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute left-[calc(100%+0.8cqw)] top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    TOC
                                    <div className="absolute right-[100%] top-1/2 -translate-y-1/2 w-0 h-0 border-solid border-t-transparent border-b-transparent border-r-[0.4cqw] border-t-[0.4cqw] border-b-[0.4cqw]" style={{ borderRightColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.navigation?.pageThumbnails ?? true) && (
                        <button onClick={() => { setShowThumbnailBarMemo?.(!showThumbnailBar); setShowTOCMemo?.(false); setShowSoundPopupMemo?.(false); }} className={`hover:opacity-80 active:scale-95 transition-transform relative group flex flex-col items-center justify-center ${showThumbnailBar ? 'opacity-70' : ''}`} style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}>
                            <Icon icon="ph:squares-four-fill" className="w-[2.4cqw] h-[2.4cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Thumbnails</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute left-[calc(100%+0.8cqw)] top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Thumbnails
                                    <div className="absolute right-[100%] top-1/2 -translate-y-1/2 w-0 h-0 border-solid border-t-transparent border-b-transparent border-r-[0.4cqw] border-t-[0.4cqw] border-b-[0.4cqw]" style={{ borderRightColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.toolbar?.gallery ?? settings?.interaction?.gallery ?? true) && (
                        <button 
                            onClick={() => {
                                setShowGalleryPopupMemo?.(!showGalleryPopup);
                                setShowTOCMemo?.(false);
                                setShowThumbnailBarMemo?.(false);
                                setShowSoundPopupMemo?.(false);
                            }} 
                            className={`hover:opacity-80 active:scale-95 transition-transform relative group flex flex-col items-center justify-center ${showGalleryPopup ? 'opacity-70' : ''}`}
                            style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}
                        >
                            <Icon icon="clarity:image-gallery-solid" className="w-[2.4cqw] h-[2.4cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Gallery</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute left-[calc(100%+0.8cqw)] top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Gallery
                                    <div className="absolute right-[100%] top-1/2 -translate-y-1/2 w-0 h-0 border-solid border-t-transparent border-b-transparent border-r-[0.4cqw] border-t-[0.4cqw] border-b-[0.4cqw]" style={{ borderRightColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.audio?.backgroundAudio ?? settings?.audio?.audio ?? settings?.media?.backgroundAudio ?? settings?.media?.audio ?? true) && (
                        <button onClick={() => { setShowSoundPopupMemo?.(!showSoundPopup); setShowTOCMemo?.(false); setShowThumbnailBarMemo?.(false); }} className={`hover:opacity-80 active:scale-95 transition-transform relative group flex flex-col items-center justify-center ${showSoundPopup ? 'opacity-70' : ''}`} style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}>
                            <Icon icon="solar:music-notes-bold" className="w-[2.4cqw] h-[2.4cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Sound</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute left-[calc(100%+0.8cqw)] top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Sound
                                    <div className="absolute right-[100%] top-1/2 -translate-y-1/2 w-0 h-0 border-solid border-t-transparent border-b-transparent border-r-[0.4cqw] border-t-[0.4cqw] border-b-[0.4cqw]" style={{ borderRightColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}

                    {(settings?.interaction?.share ?? settings?.shareExport?.share ?? true) && (
                        <button className="hover:opacity-80 active:scale-95 transition-transform relative group flex flex-col items-center justify-center" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }} onClick={() => setIsShareOpen(true)}>
                            <Icon icon="mage:share-fill" className="w-[2.4cqw] h-[2.4cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Share</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute left-[calc(100%+0.8cqw)] top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Share
                                    <div className="absolute right-[100%] top-1/2 -translate-y-1/2 w-0 h-0 border-solid border-t-transparent border-b-transparent border-r-[0.4cqw] border-t-[0.4cqw] border-b-[0.4cqw]" style={{ borderRightColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.interaction?.download ?? settings?.shareExport?.download ?? true) && (
                        <button className="hover:opacity-80 active:scale-95 transition-transform relative group flex flex-col items-center justify-center" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }} onClick={handleDownload}>
                            <Icon icon="meteor-icons:download" className="w-[2.4cqw] h-[2.4cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Download</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute left-[calc(100%+0.8cqw)] top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Download
                                    <div className="absolute right-[100%] top-1/2 -translate-y-1/2 w-0 h-0 border-solid border-t-transparent border-b-transparent border-r-[0.4cqw] border-t-[0.4cqw] border-b-[0.4cqw]" style={{ borderRightColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.interaction?.fullScreen ?? settings?.viewing?.fullScreen ?? true) && (
                        <button className="hover:opacity-80 active:scale-95 transition-transform relative group flex flex-col items-center justify-center" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }} onClick={handleFullScreen}>
                            <Icon icon="lucide:fullscreen" className="w-[2.4cqw] h-[2.4cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Fullscreen</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute left-[calc(100%+0.8cqw)] top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Fullscreen
                                    <div className="absolute right-[100%] top-1/2 -translate-y-1/2 w-0 h-0 border-solid border-t-transparent border-b-transparent border-r-[0.4cqw] border-t-[0.4cqw] border-b-[0.4cqw]" style={{ borderRightColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                </div>

                {/* Page Counter Badge - Matching Layout 6 exactly */}
                {(settings?.navigation?.pageQuickAccess ?? true) && (
                    <div 
                        className="absolute right-[2cqw] bottom-[2cqw] rounded-[0.5cqw] px-[1.2cqw] py-[0.6cqw] shadow-lg z-20 border min-w-[7cqw] flex items-center justify-center transition-all duration-300"
                        style={{
                            backgroundColor: getLayoutColor('toolbar-text-main', '#FFFFFF'),
                            borderColor: 'rgba(0,0,0,0.05)'
                        }}
                    >
                        <span className="text-[1.1cqw] font-bold" style={{ color: getLayoutColor('bottom-toolbar-bg', '#555555') }}>Page </span>
                        <input
                            type="text" autoComplete="off" spellCheck="false" autoCorrect="off"
                            value={pageInputValue}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^\d+$/.test(val)) {
                                    setPageInputValue(val);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const pageNum = parseInt(pageInputValue, 10);
                                    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= (pages?.length || pagesCount)) {
                                        if (bookRef?.current?.pageFlip) {
                                            bookRef.current.pageFlip().turnToPage(pageNum - 1);
                                        } else if (onPageClick) {
                                            onPageClick(pageNum - 1);
                                        }
                                    } else {
                                        setPageInputValue(String(currentPage + 1));
                                    }
                                    e.target.blur();
                                }
                            }}
                            onBlur={() => {
                                const pageNum = parseInt(pageInputValue, 10);
                                if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= (pages?.length || pagesCount)) {
                                    if (bookRef?.current?.pageFlip) {
                                        bookRef.current.pageFlip().turnToPage(pageNum - 1);
                                    } else if (onPageClick) {
                                        onPageClick(pageNum - 1);
                                    }
                                } else {
                                    setPageInputValue(String(currentPage + 1));
                                }
                            }}
                            className="text-[1.1cqw] mx-[0.4cqw] px-[0.3cqw] py-[0.15cqw] font-bold rounded-[0.3cqw] outline-none text-center transition-colors shadow-inner box-border"
                            style={{
                                width: `${Math.max(String(pageInputValue || '').length, String(pages?.length || pagesCount || 0).length) + 1.6}ch`,
                                minWidth: '3.2ch',
                                color: getLayoutColor('bottom-toolbar-bg', '#555555'),
                                backgroundColor: getLayoutColorAlpha('bottom-toolbar-bg', '87, 92, 156', 0.2),
                                border: `1px solid ${getLayoutColorAlpha('bottom-toolbar-bg', '87, 92, 156', 0.35)}`
                            }}
                            onFocus={(e) => {
                                e.target.style.backgroundColor = getLayoutColorAlpha('bottom-toolbar-bg', '87, 92, 156', 0.3);
                                e.target.style.borderColor = getLayoutColorAlpha('bottom-toolbar-bg', '87, 92, 156', 0.6);
                            }}
                            onMouseOver={(e) => {
                                if (document.activeElement !== e.target) {
                                    e.target.style.backgroundColor = getLayoutColorAlpha('bottom-toolbar-bg', '87, 92, 156', 0.25);
                                }
                            }}
                            onMouseOut={(e) => {
                                if (document.activeElement !== e.target) {
                                    e.target.style.backgroundColor = getLayoutColorAlpha('bottom-toolbar-bg', '87, 92, 156', 0.2);
                                }
                            }}
                        />
                        <span className="text-[1.1cqw] font-bold" style={{ color: getLayoutColor('bottom-toolbar-bg', '#555555') }}> / {pagesCount}</span>
                    </div>
                )}
            </div>

            {/* Bottom Bar */}
            <div 
                className="w-full h-[7.5%] flex items-center justify-between px-[2cqw] flex-shrink-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]"
                style={{ 
                    backgroundColor: getLayoutColor('bottom-toolbar-bg', '#555555'),
                    color: getLayoutColor('toolbar-text-main', '#FFFFFF')
                }}
            >
                {/* Playback Controls */}
                <div className="flex items-center gap-[1.5cqw]">
                    {(settings?.navigation?.startEndNav ?? true) && (
                        <button onClick={() => onPageClick && onPageClick(0)} className="hover:opacity-100 opacity-80 active:scale-95 transition-all relative group flex flex-col items-center justify-center" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}>
                            <Icon icon="ph:skip-back" className="w-[1.4cqw] h-[1.4cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>First</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)' }}>
                                    First
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.media?.autoFlip ?? true) && (
                        <button 
                            className="hover:opacity-90 active:scale-95 transition-all relative group flex flex-col items-center justify-center" 
                            style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}
                            onClick={() => setIsPlaying?.(!isAutoFlipping)}
                        >
                            <Icon icon={isAutoFlipping ? "ph:pause-fill" : "ph:play-fill"} className="w-[1.6cqw] h-[1.6cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>{isAutoFlipping ? 'Pause' : 'Play'}</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)' }}>
                                    {isAutoFlipping ? 'Pause' : 'Play'}
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.navigation?.startEndNav ?? true) && (
                        <button onClick={() => onPageClick && onPageClick(pagesCount - 1)} className="hover:opacity-100 opacity-80 active:scale-95 transition-all relative group flex flex-col items-center justify-center" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}>
                            <Icon icon="ph:skip-forward" className="w-[1.4cqw] h-[1.4cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Last</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)' }}>
                                    Last
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="flex-1 mx-[4cqw] relative flex items-center cursor-pointer h-[2cqw] group" ref={progressRef} onClick={handleProgressClick}>
                    <div className="w-full h-[0.2cqw] rounded-full overflow-hidden relative">
                        {/* Track Underlay */}
                        <div className="absolute inset-0 transition-colors duration-300" style={{ backgroundColor: getLayoutColor('toolbar-text-main', '#FFFFFF'), opacity: 0.3 }} />
                        {/* Progress Fill */}
                        <div className="absolute left-0 top-0 h-full transition-all duration-300" style={{ width: `${progressPercentage}%`, backgroundColor: getLayoutColor('toolbar-text-main', '#FFFFFF') }}></div>
                    </div>
                </div>

                {/* Zoom Controls */}
                {(settings?.viewing?.zoom ?? settings?.toolbar?.zoom ?? true) && (
                    <div 
                        className="flex items-center rounded-[0.4cqw] border pl-[0.8cqw] pr-[0.4cqw] py-[0.4cqw] gap-[0.8cqw]"
                        style={{ 
                            backgroundColor: getLayoutColorAlpha('toolbar-text-main', '255, 255, 255', 0.15),
                            borderColor: getLayoutColorAlpha('toolbar-text-main', '255, 255, 255', 0.3)
                        }}
                    >
                        <button className="hover:opacity-100 opacity-80 relative group" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}>
                            <Icon icon="ph:magnifying-glass-minus" className="w-[1.2cqw] h-[1.2cqw]" />
                            <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)' }}>
                                Zoom Out
                                <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                            </div>
                        </button>
                        <span className="font-bold text-[1cqw]" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}>100%</span>
                        <button className="hover:opacity-100 opacity-80 relative group" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}>
                            <Icon icon="ph:magnifying-glass-plus" className="w-[1.2cqw] h-[1.2cqw]" />
                            <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)' }}>
                                Zoom In
                                <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                            </div>
                        </button>
                        <button 
                            className="font-bold text-[0.9cqw] px-[0.8cqw] py-[0.3cqw] rounded-[0.2cqw] ml-[0.3cqw] hover:opacity-90 transition-opacity relative group"
                            style={{ 
                                backgroundColor: getLayoutColor('toolbar-text-main', '#FFFFFF'),
                                color: getLayoutColor('bottom-toolbar-bg', '#555555')
                            }}
                        >
                            Reset
                            <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)' }}>
                                Reset
                                <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                            </div>
                        </button>
                    </div>
                )}
            </div>

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                isTabletLayout={true}
                currentBook={currentBook || settings}
                activeLayout={activeLayout || '7'}
            />
        </div>
    );
};

export default TabletLayout6;
