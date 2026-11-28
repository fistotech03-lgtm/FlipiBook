import React, { useRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import ShareModal from '../../../ShareModal';
import TabletTableOfContentsPopup from './TabletTableOfContentsPopup';
import TabletGalleryPopup from './TabletGalleryPopup';
import { AnimatePresence, motion } from 'framer-motion';

const getLayoutColor = (id, defaultColor) => `var(--${id}, ${defaultColor})`;

const getLayoutColorAlpha = (id, defaultRgb, alpha) => {
    return `rgba(var(--${id}-rgb, ${defaultRgb}), ${alpha})`;
};

const PageThumbnail = React.memo(({ html, index, scale = 0.15 }) => {
    const cleanHtml = (html || '')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi, '<div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:20px;color:#9ca3af">Video</div>')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '<div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:20px;color:#9ca3af">Frame</div>')
        .replace(/<img\b([^>]*src=['"]https:\/\/codia-f2c\.s3\.us-west-1\.amazonaws\.com\/[^'"]*['"])([^>]*)>/gi, '<img $1 crossOrigin="anonymous" $2>');

    const srcDoc = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; background: white; width: 400px; height: 566px; position: relative; }
                    * { box-sizing: border-box; }
                    ::-webkit-scrollbar { width: 0px; background: transparent; }
                    img { max-width: 100%; height: auto; display: block; }
                </style>
            </head>
            <body>
                 <div style="width: 400px; height: 566px; overflow: hidden; position: relative; background: white;">
                    ${cleanHtml}
                 </div>
            </body>
        </html>
    `;

    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
            <iframe
                title={`Thumbnail ${index}`}
                srcDoc={srcDoc}
                style={{
                    width: '400px',
                    height: '566px',
                    border: 'none',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    background: 'white'
                }}
                sandbox="allow-same-origin allow-scripts"
                scrolling="no"
                loading="lazy"
            />
        </div>
    );
});


const TabletLayout7 = ({ 
    children, 
    bookRef, 
    currentPage = 0, 
    pages, 
    offset = 0, 
    bookName,
    onPageClick,
    zoom = 1,
    currentZoom,
    currentBook,
    activeLayout,
    settings,
    layoutColors,
    showSoundPopup,
    setShowSoundPopupMemo,
    setShowProfilePopup,
    setShowTOCMemo,
    setShowThumbnailBarMemo,
    showGalleryPopup,
    setShowGalleryPopupMemo,
    handleDownload,
    handleFullScreen,
    isAutoFlipping,
    setIsPlaying,
    searchQuery,
    setSearchQuery,
    handleQuickSearch
}) => {
    const textFont = settings?.navigation?.addTextToIconsSettings?.font || settings?.addTextToIconsSettings?.font || settings?.toolbar?.textProperties?.font || 'Arial';
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [showTOC, setShowTOC] = useState(false);

    useEffect(() => {
        if (settings?.navigation?.tableOfContents === false) {
            setShowTOC(false);
        }
    }, [settings?.navigation?.tableOfContents]);

    const [showThumbnails, setShowThumbnails] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [pageInputValue, setPageInputValue] = useState(String(currentPage + 1));
    const progressRef = useRef(null);
    const thumbScrollRef = useRef(null);
    
    const pagesCount = pages ? (Array.isArray(pages) ? pages.length : pages) : 12;

    useEffect(() => {
        setPageInputValue(String(currentPage + 1));
    }, [currentPage]);

    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                if (bookRef?.current?.pageFlip) {
                    // Stop playing if we reach the end
                    if (currentPage >= pagesCount - 1) {
                        setIsAutoPlaying(false);
                    } else {
                        bookRef.current.pageFlip().flipNext();
                    }
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, currentPage, pagesCount, bookRef]);
    
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
        <div className="relative w-full h-full flex flex-col font-sans overflow-hidden " style={{ containerType: 'inline-size' }}>
      <div id="tablet-download-portal" className="absolute inset-0 z-[60] pointer-events-none"></div>
            
            {/* Top Bar - Floating/Transparent */}
            <div className="absolute top-[2cqw] left-0 w-full px-[3cqw] flex items-center justify-between z-20 pointer-events-none">
                
                {/* Left Controls (Search & Zoom) */}
                <div className="pointer-events-auto flex items-center gap-[1cqw]">
                    {/* Search Bar */}
                    {(settings?.interaction?.search ?? true) && (
                        <div className="flex items-center bg-white rounded-full px-[1cqw] py-[0.5cqw] w-[18cqw] shadow-sm">
                            <Icon icon="lucide:search" className="text-[#8986B3] w-[1.4cqw] h-[1.4cqw]" />
                            <input 
                                type="text" 
                                placeholder="Quick Search..." 
                                value={searchQuery || ''}
                                onChange={(e) => setSearchQuery?.(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch?.(e.target.value)}
                                className="bg-transparent outline-none border-none text-[1.1cqw] ml-[0.5cqw] text-gray-700 w-full placeholder-[#A3A1C6]" 
                            />
                        </div>
                    )}

                    {/* Zoom Controls */}
                    {(settings?.viewing?.zoom ?? settings?.toolbar?.zoom ?? true) && (
                        <div className="flex items-center bg-[#DEDDF0]/50 rounded-full px-[1cqw] py-[0.4cqw] gap-[0.8cqw] backdrop-blur-md">
                            <button style={{ color: getLayoutColor('dropdown-bg', '#5C5898') }} className="hover:opacity-80 transition-opacity relative group">
                                <Icon icon="ph:magnifying-glass-minus" className="w-[1.2cqw] h-[1.2cqw]" />
                                <div className="absolute top-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)' }}>
                                    Zoom Out
                                    <div className="absolute bottom-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-b-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderBottomColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            </button>
                            <span style={{ color: getLayoutColor('dropdown-bg', '#5C5898') }} className="font-bold text-[1cqw]">100%</span>
                            <button style={{ color: getLayoutColor('dropdown-bg', '#5C5898') }} className="hover:opacity-80 transition-opacity relative group">
                                <Icon icon="ph:magnifying-glass-plus" className="w-[1.2cqw] h-[1.2cqw]" />
                                <div className="absolute top-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)' }}>
                                    Zoom In
                                    <div className="absolute bottom-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-b-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderBottomColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            </button>
                            <button className="bg-white text-[#5C5898] font-bold text-[0.9cqw] px-[1cqw] py-[0.3cqw] rounded-full ml-[0.2cqw] shadow-sm hover:bg-gray-50 transition-colors relative group">
                                Reset
                                <div className="absolute top-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)' }}>
                                    Reset
                                    <div className="absolute bottom-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-b-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderBottomColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {/* Title (Center Absolute) */}
                <div className="absolute left-1/2 -translate-x-1/2 font-bold text-[1.6cqw] tracking-wide filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] pointer-events-auto" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}>
                    {/* bookName hidden */}
                </div>
            </div>

            {/* Middle Content Area */}
            <div className="flex-1 min-h-0 w-full relative flex items-center justify-center overflow-hidden">
                {/* Left Chevron */}
                {(settings?.navigation?.nextPrevButtons ?? true) && (
                    <button 
                        onClick={() => bookRef?.current?.pageFlip()?.flipPrev()}
                        className="absolute left-[3cqw] z-10 p-[1cqw] hover:opacity-80 transition-opacity"
                        style={{ color: getLayoutColor('dropdown-bg', '#5C5898') }}
                    >
                        <Icon icon="lucide:chevron-left" className="w-[3.5cqw] h-[4cqw]" />
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
                        className="absolute right-[3cqw] z-10 p-[1cqw] hover:opacity-80 transition-opacity"
                        style={{ color: getLayoutColor('dropdown-bg', '#5C5898') }}
                    >
                        <Icon icon="lucide:chevron-right" className="w-[3.5cqw] h-[4cqw]" />
                    </button>
                )}
                
                {/* Bottom Left Floating Badge */}
                {(settings?.navigation?.pageQuickAccess ?? true) && (
                    <div 
                        className="absolute left-[3cqw] bottom-[2cqw] rounded-[0.4cqw] px-[1cqw] py-[0.4cqw] shadow-lg z-20 flex items-center" 
                        style={{ backgroundColor: getLayoutColor('page-number-bg', getLayoutColor('toolbar-bg', '#5C5898')) }}
                    >
                        <span className="font-medium text-[1cqw]" style={{ color: getLayoutColor('page-number-text', getLayoutColor('toolbar-text-main', '#FFFFFF')) }}>Page </span>
                        <input
                            type="text"
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
                                    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pagesCount) {
                                        onPageClick && onPageClick(pageNum - 1);
                                        if (bookRef?.current?.pageFlip) bookRef.current.pageFlip().turnToPage(pageNum - 1);
                                    } else {
                                        setPageInputValue(String(currentPage + 1));
                                    }
                                    e.target.blur();
                                }
                            }}
                            onBlur={() => {
                                const pageNum = parseInt(pageInputValue, 10);
                                if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pagesCount) {
                                    onPageClick && onPageClick(pageNum - 1);
                                    if (bookRef?.current?.pageFlip) bookRef.current.pageFlip().turnToPage(pageNum - 1);
                                } else {
                                    setPageInputValue(String(currentPage + 1));
                                }
                            }}
                            className="text-[1cqw] mx-[0.4cqw] px-[0.3cqw] py-[0.15cqw] font-medium rounded-[0.25cqw] outline-none text-center transition-colors shadow-inner box-border"
                            style={{
                                color: getLayoutColor('page-number-text', getLayoutColor('toolbar-text-main', '#FFFFFF')), 
                                width: `${Math.max(String(pageInputValue || '').length, String(pagesCount || 0).length) + 1.6}ch`,
                                minWidth: '3.2ch',
                                backgroundColor: getLayoutColorAlpha('page-number-text', '255, 255, 255', 0.2),
                                border: `1px solid ${getLayoutColorAlpha('page-number-text', '255, 255, 255', 0.35)}`
                            }}
                            onFocus={(e) => {
                                e.target.style.backgroundColor = getLayoutColorAlpha('page-number-text', '255, 255, 255', 0.3);
                                e.target.style.borderColor = getLayoutColorAlpha('page-number-text', '255, 255, 255', 0.6);
                            }}
                            onMouseOver={(e) => {
                                if(document.activeElement !== e.target) {
                                    e.target.style.backgroundColor = getLayoutColorAlpha('page-number-text', '255, 255, 255', 0.25);
                                }
                            }}
                            onMouseOut={(e) => {
                                if(document.activeElement !== e.target) {
                                    e.target.style.backgroundColor = getLayoutColorAlpha('page-number-text', '255, 255, 255', 0.2);
                                }
                            }}
                        />
                        <span className="font-medium text-[1cqw]" style={{ color: getLayoutColor('page-number-text', getLayoutColor('toolbar-text-main', '#FFFFFF')) }}> / {pagesCount}</span>
                    </div>
                )}
            </div>

            {/* Bottom Bar */}
            <div id="tablet-sound-portal" className="absolute inset-0 z-50 pointer-events-none"></div>
            <div className="w-full h-[8%] flex flex-col justify-center px-[4cqw] py-[0.5cqw] flex-shrink-0 z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.15)]" style={{ backgroundColor: getLayoutColor('toolbar-bg', '#5C5898') }}>
                
                {/* Icons Row */}
                <div className="flex items-center justify-center gap-[3cqw] w-full mb-[0.8cqw]">
                    {(settings?.navigation?.tableOfContents ?? true) && (
                        <button className="hover:opacity-80 active:scale-95 transition-opacity relative group flex flex-col items-center justify-center" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }} onClick={() => setShowTOC(!showTOC)}>
                            <Icon icon="fluent:text-bullet-list-24-filled" className="w-[1.6cqw] h-[1.6cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>TOC</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    TOC
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.navigation?.pageThumbnails ?? true) && (
                        <button className="rounded-[0.4cqw] p-[0.4cqw] hover:opacity-80 active:scale-95 transition-opacity relative group flex flex-col items-center justify-center" style={{ backgroundColor: getLayoutColorAlpha('toolbar-text-main', '255,255,255', 0.2), color: getLayoutColor('toolbar-text-main', '#FFFFFF') }} onClick={() => setShowThumbnails(!showThumbnails)}>
                            <Icon icon="ph:squares-four-fill" className="w-[1.6cqw] h-[1.6cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Thumbnails</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Thumbnails
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.toolbar?.gallery ?? settings?.interaction?.gallery ?? true) && (
                        <button 
                            className={`hover:opacity-80 active:scale-95 transition-opacity relative group flex flex-col items-center justify-center ${showGalleryPopup ? 'opacity-70' : ''}`} 
                            style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }} 
                            onClick={() => {
                                setShowGalleryPopupMemo?.(!showGalleryPopup);
                                setShowTOC?.(false);
                                setShowThumbnails?.(false);
                            }}
                        >
                            <Icon icon="clarity:image-gallery-solid" className="w-[1.6cqw] h-[1.6cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Gallery</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Gallery
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}

                    {(settings?.navigation?.startEndNav ?? true) && (
                        <button onClick={() => onPageClick && onPageClick(0)} className="hover:opacity-80 active:scale-95 transition-opacity relative group flex flex-col items-center justify-center" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}>
                            <Icon icon="ph:skip-back" className="w-[1.5cqw] h-[1.5cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>First</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    First
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.media?.autoFlip ?? true) && (
                        <button 
                            onClick={() => {
                                if (setIsPlaying) {
                                    setIsPlaying(!isAutoFlipping);
                                } else {
                                    setIsAutoPlaying(!isAutoPlaying);
                                }
                            }} 
                            className="hover:opacity-80 active:scale-95 transition-opacity relative group flex flex-col items-center justify-center" 
                            style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}
                        >
                            <Icon icon={(isAutoFlipping || isAutoPlaying) ? "ph:pause-fill" : "ph:play-fill"} className="w-[1.8cqw] h-[1.8cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>{(isAutoFlipping || isAutoPlaying) ? 'Pause' : 'Play'}</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    {(isAutoFlipping || isAutoPlaying) ? 'Pause' : 'Play'}
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.navigation?.startEndNav ?? true) && (
                        <button onClick={() => onPageClick && onPageClick(pagesCount - 1)} className="hover:opacity-80 active:scale-95 transition-opacity relative group flex flex-col items-center justify-center" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }}>
                            <Icon icon="ph:skip-forward" className="w-[1.5cqw] h-[1.5cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Last</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Last
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}

                    {(settings?.audio?.backgroundAudio ?? settings?.audio?.audio ?? settings?.media?.backgroundAudio ?? settings?.media?.audio ?? true) && (
                        <button 
                            className={`hover:opacity-80 active:scale-95 transition-opacity relative group flex flex-col items-center justify-center ${showSoundPopup ? 'opacity-70' : ''}`} 
                            style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }} 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSoundPopupMemo?.(!showSoundPopup);
                                setShowTOC?.(false);
                                setShowThumbnails?.(false);
                                setShowGalleryPopupMemo?.(false);
                            }}
                        >
                            <Icon icon="solar:music-notes-bold" className="w-[1.6cqw] h-[1.6cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Sound</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Sound
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}

                    {(settings?.interaction?.share ?? settings?.shareExport?.share ?? true) && (
                        <button className="hover:opacity-80 active:scale-95 transition-opacity relative group flex flex-col items-center justify-center" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }} onClick={() => setIsShareOpen(true)}>
                            <Icon icon="mage:share-fill" className="w-[1.6cqw] h-[1.6cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Share</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Share
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.interaction?.download ?? settings?.shareExport?.download ?? true) && (
                        <button className="hover:opacity-80 active:scale-95 transition-opacity relative group flex flex-col items-center justify-center" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }} onClick={handleDownload}>
                            <Icon icon="meteor-icons:download" className="w-[1.6cqw] h-[1.6cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Download</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Download
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                    {(settings?.interaction?.fullScreen ?? settings?.viewing?.fullScreen ?? true) && (
                        <button className="hover:opacity-80 active:scale-95 transition-opacity relative group flex flex-col items-center justify-center" style={{ color: getLayoutColor('toolbar-text-main', '#FFFFFF') }} onClick={handleFullScreen}>
                            <Icon icon="lucide:fullscreen" className="w-[1.6cqw] h-[1.6cqw]" />
                            {settings?.toolbar?.addTextBelowIcons && (
                                <span className="text-[0.8cqw] font-medium leading-tight mt-[0.2cqw] whitespace-nowrap" style={{ fontFamily: textFont }}>Fullscreen</span>
                            )}
                            {!settings?.toolbar?.addTextBelowIcons && (
                                <div className="absolute bottom-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]" style={{ background: 'rgba(10, 10, 12, 0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.3cqw 0.8cqw', borderRadius: '0.4cqw', fontSize: '0.85cqw', fontWeight: 600, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', fontFamily: textFont }}>
                                    Fullscreen
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-t-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]" style={{ borderTopColor: 'rgba(10, 10, 12, 0.65)' }} />
                                </div>
                            )}
                        </button>
                    )}
                </div>

                {/* Progress Bar (Full Width Bottom) */}
                <div className="w-full relative flex items-center cursor-pointer h-[1.5cqw] group" ref={progressRef} onClick={handleProgressClick}>
                    <div className="w-full h-[0.25cqw] rounded-full overflow-hidden relative" style={{ backgroundColor: getLayoutColorAlpha('toolbar-text-main', '255, 255, 255', 0.3) }}>
                        <div className="absolute left-0 top-0 h-full transition-all duration-300" style={{ width: `${progressPercentage}%`, backgroundColor: getLayoutColor('toolbar-text-main', '#FFFFFF') }}></div>
                    </div>
                </div>

            </div>
            
            <AnimatePresence>
                {showTOC && (
                    <TabletTableOfContentsPopup
                        settings={settings}
                        layoutColors={layoutColors}
                        onClose={() => setShowTOC(false)}
                        onNavigate={(idx) => {
                            if (onPageClick) onPageClick(idx);
                            if (bookRef?.current?.pageFlip) bookRef.current.pageFlip().turnToPage(idx);
                        }}
                        variant="layout7"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(settings?.navigation?.pageThumbnails ?? true) && showThumbnails && (
                    <React.Fragment key="thumb-panel-wrapper">
                        {/* Invisible backdrop to close thumbnails on click outside */}
                        <div 
                            className="absolute inset-0 z-[100]" 
                            onClick={(e) => { e.stopPropagation(); setShowThumbnails(false); }} 
                        />
                        <motion.div
                        key="thumb-panel"
                        initial={{ y: '100%', x: '-50%' }}
                        animate={{ y: 0, x: '-50%' }}
                        exit={{ y: '100%', x: '-50%' }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute z-[101] rounded-t-[1cqw] overflow-hidden pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            left: '50%',
                            bottom: '8%',
                            width: '65cqw',
                            backgroundColor: '#FFFFFF',
                            maxHeight: '45cqh',
                            boxShadow: '0 -1cqw 3cqw rgba(0,0,0,0.2)',
                            opacity: 1
                        }}
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-[2cqw] py-[1cqw] relative"
                            style={{ backgroundColor: getLayoutColor('dropdown-bg', '#555555') }}
                        >
                            <span className="text-[1.3cqw] font-bold tracking-wide" style={{ color: getLayoutColor('dropdown-text', '#FFFFFF') }}>Thumbnails</span>

                            {/* Drag handle */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                                <div className="w-[4cqw] h-[0.3cqw] rounded-full" style={{ backgroundColor: getLayoutColor('dropdown-text', '#FFFFFF'), opacity: 0.3 }} />
                            </div>

                            <button
                                onClick={() => setShowThumbnails(false)}
                                className="hover:scale-110 transition-all"
                                style={{ color: getLayoutColor('dropdown-text', '#FFFFFF'), opacity: 0.7 }}
                            >
                                <Icon icon="lucide:x" className="w-[1.6cqw] h-[1.6cqw]" />
                            </button>
                        </div>

                        {/* Scrollable thumbnail row */}
                        <div
                            ref={thumbScrollRef}
                            className="flex flex-wrap gap-[1.5cqw] px-[1.5cqw] py-[2cqw] pb-[3cqw] overflow-y-auto max-h-[35cqh]"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', backgroundColor: getLayoutColor('dropdown-text', '#FFFFFF') }}
                        >
                            {Array.from({ length: pagesCount }).map((_, idx) => {
                                const page = pages ? (Array.isArray(pages) ? pages[idx] : null) : null;
                                return (
                                    <div
                                        key={idx}
                                        data-thumb-index={idx}
                                        onClick={() => { if(onPageClick) onPageClick(idx); if(bookRef?.current?.pageFlip) bookRef.current.pageFlip().turnToPage(idx); setShowThumbnails(false); }}
                                        className="flex-shrink-0 flex flex-col items-center gap-[0.5cqw] cursor-pointer group"
                                    >
                                        <div
                                            className="rounded-[0.5cqw] overflow-hidden transition-all duration-200"
                                            style={{
                                                width: '9cqw',
                                                height: '6.5cqw',
                                                border: idx === currentPage ? `0.2cqw solid ${getLayoutColor('dropdown-bg', '#555555')}` : '0.2cqw solid transparent',
                                                boxShadow: idx === currentPage ? `0 0 0 0.2cqw ${getLayoutColor('dropdown-bg', '#555555')}` : '0 0.2cqw 0.5cqw rgba(0,0,0,0.1)',
                                                padding: '0.2cqw',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <div className="w-full h-full overflow-hidden bg-white rounded-[0.2cqw] relative flex items-center justify-center">
                                                {page && (
                                                    <PageThumbnail
                                                        html={page.html || page.content || ''}
                                                        index={idx}
                                                        scale={0.16}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[1cqw] font-medium transition-colors" style={{ color: getLayoutColor('dropdown-bg', '#555555'), opacity: idx === currentPage ? 1 : 0.6 }}>
                                            Page {idx + 1}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        </motion.div>
                    </React.Fragment>
                )}
            </AnimatePresence>

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                isTabletLayout={true}
                currentBook={currentBook || settings}
                activeLayout={activeLayout || '8'}
            />

            <AnimatePresence>
                {showGallery && (
                    <TabletGalleryPopup
                        onClose={() => setShowGallery(false)}
                        settings={settings}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TabletLayout7;
