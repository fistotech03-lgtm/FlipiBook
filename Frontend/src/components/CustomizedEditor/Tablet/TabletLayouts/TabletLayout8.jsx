import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import TabletTableOfContentsPopup from './TabletTableOfContentsPopup';
import TabletProfilePopup from './TabletProfilePopup';
import ShareModal from '../../../ShareModal';

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
                    body { 
                        margin: 0; 
                        padding: 0; 
                        overflow: hidden; 
                        background: white; 
                        width: 400px; 
                        height: 566px; 
                        position: relative;
                    }
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
        <div className="w-full h-full relative overflow-hidden bg-white flex items-center justify-center">
            <iframe
                className="border-none pointer-events-none"
                srcDoc={srcDoc}
                title={`Thumb ${index}`}
                loading="lazy"
                style={{
                    width: '400px',
                    height: '566px',
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    backgroundColor: 'white'
                }}
            />
        </div>
    );
});

const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return '255, 255, 255';
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `${r}, ${g}, ${b}`;
};

const getLayoutColor = (id, defaultColor) =>
    `rgba(var(--${id}-rgb, ${hexToRgb(defaultColor)}), var(--${id}-opacity, 1))`;

const getLayoutColorRgba = (tokenId, defaultRgb, defaultOpacity) => {
    return `rgba(var(--${tokenId}-rgb, ${defaultRgb}), var(--${tokenId}-opacity, ${defaultOpacity}))`;
};

const ToolbarBtn = ({ id, icon, label, onClick, bg, color }) => (
    <div className="relative group flex items-center justify-center">
        <button
            id={id}
            onClick={onClick}
            className="flex items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 shadow-sm"
            style={{ backgroundColor: bg || '#555555', color: color || 'white', width: '3cqw', height: '3cqw' }}
        >
            <Icon icon={icon} className="w-[1.6cqw] h-[1.6cqw]" />
        </button>
        {label && (
            <div
                className="absolute top-[calc(100%+0.8cqw)] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap pointer-events-none z-[9999]"
                style={{
                    background: 'rgba(10, 10, 12, 0.65)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '0.3cqw 0.8cqw',
                    borderRadius: '0.4cqw',
                    fontSize: '0.85cqw',
                    fontWeight: 600,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
                }}
            >
                {label}
                <div
                    className="absolute bottom-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-transparent border-r-transparent border-b-[0.4cqw] border-l-[0.4cqw] border-r-[0.4cqw]"
                    style={{ borderBottomColor: 'rgba(10, 10, 12, 0.65)' }}
                />
            </div>
        )}
    </div>
);

const TabletLayout8 = ({
    children,
    settings,
    bookName,
    searchQuery,
    setSearchQuery,
    handleQuickSearch,
    setShowThumbnailBarMemo,
    setShowTOCMemo,
    setShowProfilePopup,
    showProfilePopup,
    logoSettings,
    currentPage,
    pagesCount,
    pages,
    bookRef,
    showThumbnailBar,
    currentZoom,
    setCurrentZoom,
    onPageClick,
    handleDownload,
    handleFullScreen,
    isFullscreen,
    isMuted,
    setIsMuted,
    showSoundPopup,
    setShowSoundPopupMemo,
    profileSettings,
    setShowGalleryPopupMemo,
    showGalleryPopup,
    showTOC,
    backgroundStyle,
    showExportPopup,
    setShowExportPopupMemo,
    setIsPlaying,
    isAutoFlipping,
    offset = 0,
    currentBook,
    activeLayout
}) => {
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputPage, setInputPage] = useState(currentPage + 1);

    useEffect(() => {
        setInputPage(currentPage + 1);
    }, [currentPage]);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollRef = useRef(null);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [pages]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setTimeout(checkScroll, 350);
        }
    };

    const spreads = useMemo(() => {
        const result = [];
        if (pages && pages.length > 0) {
            result.push({ pages: [pages[0]], indices: [0], label: "Page 1" });
            for (let i = 1; i < pages.length; i += 2) {
                const spreadIndices = [i];
                const spreadPages = [pages[i]];
                if (i + 1 < pages.length) {
                    spreadIndices.push(i + 1);
                    spreadPages.push(pages[i + 1]);
                }
                result.push({
                    pages: spreadPages,
                    indices: spreadIndices,
                    label: spreadIndices.length === 1 ? `Page ${spreadIndices[0] + 1}` : `Page ${spreadIndices[0] + 1}-${spreadIndices[1] + 1}`
                });
            }
        }
        return result;
    }, [pages]);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            setSearchQuery(localSearchQuery);
            handleQuickSearch(localSearchQuery);
        }
    };

    const handleContactClick = (e, contact) => {
        e.stopPropagation();
        const value = contact.value?.trim();
        if (!value) return;

        const isEmail = contact.type === 'email' || value.includes('@');
        const isPhone = contact.type === 'phone' || /^[+\d\s-]+$/.test(value);

        if (isEmail) {
            if (value.startsWith('mailto:')) {
                window.location.href = value;
            } else {
                window.location.href = `mailto:${value}`;
            }
        }
        else if (isPhone) {
            window.location.href = `tel:${value}`;
        }
        else {
            const url = value.startsWith('http') ? value : `https://${value}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const totalPages = pagesCount;
    const primaryColor = getLayoutColor('toolbar-bg', '#555555');
    const secondaryColor = '#FFFFFF';

    return (
        <div className="flex flex-col w-full h-full min-h-0 overflow-hidden font-sans relative" style={{ ...backgroundStyle, backgroundColor: 'transparent', containerType: 'size' }}>

            {/* Click-away Overlay for Search Suggestions */}
            {showSuggestions && recommendations.length > 0 && (
                <div 
                    className="absolute inset-0 z-[45] pointer-events-auto" 
                    onClick={() => setShowSuggestions(false)} 
                />
            )}

            {/* Top Bar (Floating) */}
            <div className="absolute top-[2cqh] left-[2cqw] right-[2cqw] flex items-center justify-between z-[200] pointer-events-none">

                {/* Left: Search Bar */}
                <div className="w-[22cqw] pointer-events-auto">
                    {(settings?.interaction?.search ?? true) && (
                        <div
                            className="flex items-center px-[1.5cqw] py-[0.8cqh] rounded-full shadow-md transition-all relative"
                            style={{ backgroundColor: secondaryColor }}
                        >
                            <Icon
                                icon="ph:magnifying-glass-regular"
                                className="w-[1.6cqw] h-[1.6cqw]"
                                style={{ color: getLayoutColor('search-text-v1', '#555555') }}
                            />
                            <input
                                type="text" autoComplete="off" spellCheck="false" autoCorrect="off"
                                value={localSearchQuery}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setLocalSearchQuery(val);
                                    setShowSuggestions(true);
                                    if (val.trim().length >= 1) {
                                        const results = [];
                                        const lowerQuery = val.trim().toLowerCase();
                                        pages.forEach((page, index) => {
                                            const text = (page.html || page.content || '').replace(/<[^>]*>/g, ' ');
                                            const words = text.split(/\s+/).filter(Boolean);
                                            for (let i = 0; i < words.length; i++) {
                                                const cleanWord = words[i].replace(/[^a-zA-Z0-9-]/g, '');
                                                if (cleanWord.length >= val.trim().length && cleanWord.toLowerCase().startsWith(lowerQuery)) {
                                                    const nextWords = words.slice(i + 1, i + 3).join(' ').replace(/[^a-zA-Z0-9- ]/g, '');
                                                    const greyPart = nextWords.length > 12 ? nextWords.substring(0, 12) + '...' : nextWords + '...';
                                                    results.push({
                                                        boldPart: cleanWord,
                                                        greyPart: ' ' + greyPart,
                                                        pageNumber: index + 1
                                                    });
                                                }
                                            }
                                        });
                                        const uniqueResults = [];
                                        const seen = new Set();
                                        for (const r of results) {
                                            const key = r.boldPart + r.greyPart;
                                            if (!seen.has(key)) {
                                                seen.add(key);
                                                uniqueResults.push(r);
                                            }
                                        }
                                        setRecommendations(uniqueResults.slice(0, 4));
                                    } else {
                                        setRecommendations([]);
                                    }
                                }}
                                onFocus={() => { if (recommendations.length > 0) setShowSuggestions(true); }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setSearchQuery(localSearchQuery);
                                        handleQuickSearch(localSearchQuery);
                                        setRecommendations([]);
                                        setShowSuggestions(false);
                                    }
                                }}
                                placeholder="Quick Search..."
                                className="bg-transparent border-0 outline-none w-full ml-[0.8cqw] font-medium text-[1.4cqw]"
                                style={{ color: getLayoutColor('search-text-v1', '#9BA0C9') }}
                            />
                            <AnimatePresence>
                                {showSuggestions && recommendations.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -5 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        exit={{ opacity: 0, y: -5 }} 
                                        className="absolute top-full mt-[1cqw] left-0 w-full bg-white rounded-[1cqw] shadow-lg border border-black/10 z-[100] overflow-hidden pointer-events-auto"
                                    >
                                        <div className="flex flex-col py-[1cqw]">
                                            <div className="px-[1.5cqw] mb-[0.5cqw]">
                                                <span className="text-black/60 font-medium text-[1.2cqw]">Suggestions</span>
                                            </div>
                                            {recommendations.map((rec, idx) => (
                                                <button 
                                                    key={idx} 
                                                    className="flex items-center justify-between px-[1.5cqw] py-[0.8cqw] hover:bg-black/5 transition-colors text-left" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation();
                                                        onPageClick(rec.pageNumber - 1); 
                                                        setRecommendations([]); 
                                                        setShowSuggestions(false); 
                                                        setLocalSearchQuery(rec.boldPart); 
                                                    }}
                                                >
                                                    <div className="flex-1 truncate mr-[1cqw]">
                                                        <span className="text-black font-medium text-[1.3cqw]">{rec.boldPart}</span>
                                                        <span className="text-black/50 text-[1.3cqw]">{rec.greyPart}</span>
                                                    </div>
                                                    <span className="text-black/50 font-medium text-[1.2cqw] whitespace-nowrap">Pg {rec.pageNumber}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Center: Tools Container */}
                <div className="absolute left-[58%] -translate-x-1/2 flex items-center gap-[1.5cqw] pointer-events-auto">
                    
                    {/* Block 1: Navigation & Media */}
                    <div className="flex items-center gap-[1.5cqw]">
                        {(settings?.navigation?.tableOfContents ?? true) && (
                            <ToolbarBtn 
                                id="layout8-tablet-toc-btn"
                                icon="fluent:text-bullet-list-24-filled" 
                                label="TOC"
                                onClick={() => setShowTOCMemo(!showTOC)} 
                                bg={showTOC ? secondaryColor : primaryColor}
                                color={showTOC ? primaryColor : secondaryColor}
                            />
                        )}
                        {(settings?.navigation?.pageThumbnails ?? true) && (
                            <ToolbarBtn 
                                id="layout8-tablet-thumbnails-btn"
                                icon="ph:squares-four-fill" 
                                label="Thumbnails"
                                onClick={() => setShowThumbnailBarMemo(!showThumbnailBar)} 
                                bg={showThumbnailBar ? secondaryColor : primaryColor}
                                color={showThumbnailBar ? primaryColor : secondaryColor}
                            />
                        )}
                        <ToolbarBtn 
                            icon={isAutoFlipping ? 'ph:pause-fill' : 'ph:play-fill'} 
                            label={isAutoFlipping ? 'Pause' : 'Auto Play'}
                            onClick={() => setIsPlaying?.(!isAutoFlipping)} 
                            bg={primaryColor} 
                        />
                        {(settings?.interaction?.gallery ?? true) && (
                            <ToolbarBtn 
                                icon="clarity:image-gallery-solid" 
                                label="Gallery"
                                onClick={() => setShowGalleryPopupMemo(!showGalleryPopup)} 
                                bg={primaryColor} 
                            />
                        )}
                        <div className="relative" id="layout8-sound-icon-anchor">
                            {(settings?.media?.backgroundAudio ?? true) && (
                                <ToolbarBtn 
                                    id="layout8-tablet-sound-btn"
                                    icon={isMuted ? "solar:music-notes-bold-duotone" : "solar:music-notes-bold"} 
                                    label="Sound"
                                    onClick={(e) => { e.stopPropagation(); setShowSoundPopupMemo?.(!showSoundPopup); }} 
                                    bg={showSoundPopup ? secondaryColor : primaryColor}
                                    color={showSoundPopup ? primaryColor : secondaryColor}
                                />
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-[1.5px] h-[2cqw] rounded-full mx-[0.5cqw]" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}></div>

                    {/* Block 2: Zoom */}
                    {(settings?.viewing?.zoom ?? true) && (
                        <div className="flex items-center gap-[1.5cqw]">
                            <ToolbarBtn 
                                icon="ph:magnifying-glass-minus-bold" 
                                label="Zoom Out"
                                onClick={() => setCurrentZoom?.(Math.max(0.5, (currentZoom || 1) - 0.1))} 
                                bg={primaryColor} 
                            />
                            <span className="text-[1.4cqw] font-bold min-w-[3.5cqw] text-center whitespace-nowrap" style={{ color: secondaryColor, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                                {Math.round((currentZoom || 1) * 100)}%
                            </span>
                            <ToolbarBtn 
                                icon="ph:magnifying-glass-plus-bold" 
                                label="Zoom In"
                                onClick={() => setCurrentZoom?.(Math.min(3, (currentZoom || 1) + 0.1))} 
                                bg={primaryColor} 
                            />
                            <button
                                onClick={() => setCurrentZoom?.(1)}
                                className="px-[1.2cqw] py-[0.6cqh] rounded-full shadow-sm text-[1.3cqw] font-bold transition-transform hover:scale-105 active:scale-95"
                                style={{ backgroundColor: secondaryColor, color: primaryColor }}
                            >
                                Reset
                            </button>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="w-[1.5px] h-[2cqw] rounded-full mx-[0.5cqw]" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}></div>

                    {/* Block 3: Actions */}
                    <div className="flex items-center gap-[1.5cqw]">

                        {(settings?.shareExport?.share ?? true) && (
                            <ToolbarBtn 
                                icon="mage:share-fill" 
                                label="Share"
                                onClick={() => {
                                    setShowTOCMemo?.(false);
                                    setShowThumbnailBarMemo?.(false);
                                    setShowGalleryPopupMemo?.(false);
                                    setShowSoundPopupMemo?.(false);
                                    setShowProfilePopup?.(false);
                                    setShowExportPopupMemo?.(false);
                                    setIsShareOpen(true);
                                }} 
                                bg={primaryColor} 
                            />
                        )}
                        {(settings?.shareExport?.download ?? true) && (
                            <ToolbarBtn 
                                icon="meteor-icons:download" 
                                label="Download"
                                onClick={() => setShowExportPopupMemo?.(true)} 
                                bg={primaryColor} 
                            />
                        )}
                        {(settings?.viewing?.fullScreen ?? true) && (
                            <ToolbarBtn 
                                icon={isFullscreen ? "mingcute:fullscreen-exit-fill" : "lucide:fullscreen"} 
                                label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                onClick={handleFullScreen} 
                                bg={primaryColor} 
                            />
                        )}
                    </div>

                </div>

                {/* Right spacer for balance (optional, or just logo area if needed) */}
                <div className="flex-1 pointer-events-none"></div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center relative p-[4cqw] pt-[8cqh] pb-[10cqh]">

                {showProfilePopup && (
                    <TabletProfilePopup
                        activeLayout={5}
                        profileSettings={profileSettings}
                        layoutColors={settings?.layoutColors}
                        handleContactClick={handleContactClick}
                        fallbackText="#555555"
                        onClose={() => setShowProfilePopup(false)}
                    />
                )}

                {/* The Actual Book Content */}
                <div 
                    className="w-full h-full flex items-center justify-center z-0 relative"
                    style={{ translate: `${offset}px 0`, transition: 'translate 0.85s cubic-bezier(0.45, 0, 0.2, 1), transform 0.5s ease-out' }}
                >
                    {children}
                </div>
            </div>

            {/* Bottom Bar: Page Controls & Book Name */}
            <div className="absolute bottom-[3cqh] left-[2cqw] right-[2cqw] flex items-center justify-between z-50 pointer-events-none">
                
                {/* Left: Book Name */}
                <div className="flex-1 flex justify-start pointer-events-auto">
                    <span className="text-[1.5cqw] font-bold tracking-wide" style={{ color: primaryColor }}>
                        {/* bookName hidden */}
                    </span>
                </div>

                {/* Center: Page Controls */}
                <div className="flex items-center justify-center gap-[1.5cqw] pointer-events-auto shrink-0">
                    
                    {/* First Page */}
                    <ToolbarBtn 
                        icon="ph:skip-back-fill" 
                        onClick={() => onPageClick(0)} 
                        bg={primaryColor} 
                    />
                    
                    {/* Previous Page */}
                    <ToolbarBtn 
                        icon="ph:caret-left-fill" 
                        onClick={() => bookRef?.current?.pageFlip()?.flipPrev()} 
                        bg={primaryColor} 
                    />
                    
                    {/* Page Indicator Pill */}
                    {(settings?.navigation?.pageQuickAccess ?? true) && (
                        <div 
                            className="px-[2cqw] py-[0.8cqh] rounded-full shadow-md flex items-center justify-center min-w-[12cqw]"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <span className="text-[1.4cqw] font-semibold flex items-center text-white">
                                Page - 
                                <input 
                                    type="text" autoComplete="off" spellCheck="false" autoCorrect="off"
                                    value={inputPage}
                                    onChange={(e) => setInputPage(e.target.value)}
                                    onBlur={() => {
                                        let p = parseInt(inputPage);
                                        if (isNaN(p) || p < 1) p = 1;
                                        if (p > totalPages) p = totalPages;
                                        setInputPage(p);
                                        if (p - 1 !== currentPage) {
                                            onPageClick(p - 1);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.target.blur();
                                        }
                                    }}
                                    className="mx-[0.5cqw] w-[3cqw] text-center bg-transparent outline-none border-none text-white placeholder-white/70"
                                /> 
                                / {totalPages}
                            </span>
                        </div>
                    )}
                    
                    {/* Next Page */}
                    <ToolbarBtn 
                        icon="ph:caret-right-fill" 
                        onClick={() => bookRef?.current?.pageFlip()?.flipNext()} 
                        bg={primaryColor} 
                    />
                    
                    {/* Last Page */}
                    <ToolbarBtn 
                        icon="ph:skip-forward-fill" 
                        onClick={() => onPageClick(pagesCount - 1)} 
                        bg={primaryColor} 
                    />
                    
                </div>

                {/* Right Spacer for balance */}
                <div className="flex-1 pointer-events-none"></div>
            </div>

            {/* Popups at root level for accurate coordinate alignment */}
            {showTOC && (
                <TabletTableOfContentsPopup
                    variant="layout8"
                    onClose={() => setShowTOCMemo?.(false)} 
                    onNavigate={onPageClick} 
                    settings={settings}
                    layoutColors={settings?.layoutColors}
                />
            )}

            {/* Thumbnail Bar */}
            {showThumbnailBar && (
                <>
                    {/* Invisible click-to-close overlay */}
                    <div
                        className="fixed inset-0 z-[149] cursor-default"
                        onClick={() => setShowThumbnailBarMemo(false)}
                    />
                    <div
                        id="layout8-thumb-panel"
                        className="absolute w-[68cqw] h-[16cqw] z-[150] pointer-events-auto flex flex-col"
                        style={{
                            top: '0.8cqh',
                            left: '50%',
                            transform: 'translateX(-55.0%)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* SVG Background Layer */}
                        <div className="absolute inset-0 z-0 pointer-events-none drop-shadow-2xl">
                            <svg width="100%" height="100%" viewBox="0 0 780 195" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <defs>
                                    <clipPath id="tablet-thumb-shape-clip" clipPathUnits="objectBoundingBox">
                                        <path transform="scale(0.00128205, 0.005128205)" d="M0 87C0 75.9543 8.95431 67 20 67H760C771.046 67 780 75.9543 780 87V175C780 186.046 771.046 195 760 195H20C8.9543 195 0 186.046 0 175V87Z" />
                                        <path transform="scale(0.00128205, 0.005128205) translate(235.54, 67) scale(0.85, 0.9) translate(-361.9, -67)" d="M328.818 33.0909C328.818 14.8153 343.633 0 361.909 0C380.185 0 395 14.8153 395 33.0909V41.7377C395.011 60.2573 398.967 66.6391 417 67H304C322.752 67 328.818 52.7213 328.818 41.7377V33.0909Z" />
                                    </clipPath>
                                </defs>
                                <path d="M0 87C0 75.9543 8.95431 67 20 67H760C771.046 67 780 75.9543 780 87V175C780 186.046 771.046 195 760 195H20C8.9543 195 0 186.046 0 175V87Z" fill={getLayoutColor('dropdown-bg', primaryColor)} />
                                <path transform="translate(235.54, 67) scale(0.85, 0.9) translate(-361.9, -67)" d="M328.818 33.0909C328.818 14.8153 343.633 0 361.909 0C380.185 0 395 14.8153 395 33.0909V41.7377C395.011 60.2573 398.967 66.6391 417 67H304C322.752 67 328.818 52.7213 328.818 41.7377V33.0909Z" fill={getLayoutColor('dropdown-bg', primaryColor)} />
                            </svg>
                        </div>

                        {/* Content Layer */}
                        <div
                            className="relative z-10 w-full h-full flex items-center pt-[5.6cqw] pb-[0.4cqw] px-[1.5cqw]"
                            style={{ 
                                clipPath: 'url(#tablet-thumb-shape-clip)', 
                                WebkitClipPath: 'url(#tablet-thumb-shape-clip)' 
                            }}
                        >
                            {/* Left Arrow */}
                            {spreads.length > 5 && (
                                <button
                                    onClick={() => scroll('left')}
                                    className={`z-10 transition-opacity p-[0.5cqw] ${canScrollLeft ? 'opacity-100 hover:opacity-80 cursor-pointer' : 'opacity-30 cursor-default'}`}
                                    disabled={!canScrollLeft}
                                    style={{ color: getLayoutColor('dropdown-text', '#FFFFFF') }}
                                >
                                    <Icon icon="lucide:arrow-left" className="w-[1.6cqw] h-[1.6cqw]" />
                                </button>
                            )}

                            {/* Scrollable thumbnail row - Showing Double Spreads */}
                            <div
                                ref={scrollRef}
                                onScroll={checkScroll}
                                className="flex-1 flex gap-[1.2cqw] px-[0.8cqw] items-center overflow-x-auto h-full"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {spreads.map((spread, idx) => {
                                    const isSelected = spread.indices.includes(currentPage);

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                if (bookRef?.current?.pageFlip) {
                                                    bookRef.current.pageFlip().turnToPage(spread.indices[0]);
                                                } else if (onPageClick) {
                                                    onPageClick(spread.indices[0]);
                                                }
                                                setShowThumbnailBarMemo(false);
                                            }}
                                            className="flex-shrink-0 flex flex-col items-center cursor-pointer group py-[0.2cqw]"
                                        >
                                            <div
                                                className="rounded-[0.5cqw] overflow-hidden transition-all duration-300 bg-white shadow-lg flex flex-col items-center justify-center px-[0.3cqw] pt-[0.3cqw] pb-[0.2cqw]"
                                                style={{
                                                    border: isSelected ? `0.18cqw solid ${getLayoutColor('dropdown-bg', primaryColor)}` : 'none',
                                                    transform: isSelected ? 'scale(1.04)' : 'scale(1)'
                                                }}
                                            >
                                                {/* Pages Spread container */}
                                                <div className="flex w-full gap-0 items-center justify-center overflow-hidden bg-gray-50 rounded-[0.1cqw]" style={{ height: '5.5cqw' }}>
                                                    {spread.pages.map((page, pIdx) => (
                                                        <div key={`${idx}-${pIdx}`} className="bg-white overflow-hidden relative flex items-center justify-center border-0" style={{ width: '4cqw', height: '100%' }}>
                                                            <PageThumbnail
                                                                html={page.html || page.content || ''}
                                                                index={spread.indices[pIdx]}
                                                                scale={0.07}
                                                            />
                                                        </div>
                                                    ))}
                                                    {spread.pages.length === 1 && idx === spreads.length - 1 && (
                                                        <div className="bg-gray-50" style={{ width: '4cqw', height: '100%' }} />
                                                    )}
                                                </div>

                                                <div className="w-full flex justify-center py-[0.1cqw] mt-[0.2cqw]">
                                                    <span className="text-[0.8cqw] font-bold tracking-tight text-[#555555]">
                                                        {spread.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Arrow */}
                            {spreads.length > 5 && (
                                <button
                                    onClick={() => scroll('right')}
                                    className={`z-10 transition-opacity p-[0.5cqw] ${canScrollRight ? 'opacity-100 hover:opacity-80 cursor-pointer' : 'opacity-30 cursor-default'}`}
                                    disabled={!canScrollRight}
                                    style={{ color: getLayoutColor('dropdown-text', '#FFFFFF') }}
                                >
                                    <Icon icon="lucide:arrow-right" className="w-[1.6cqw] h-[1.6cqw]" />
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div id="tablet-sound-portal" className="absolute inset-0 z-50 pointer-events-none"></div>
            <div id="tablet-download-portal" className="absolute inset-0 z-50 pointer-events-none"></div>

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                isTabletLayout={true}
                currentBook={currentBook || settings}
                activeLayout={activeLayout || '9'}
            />
        </div>
    );
};

export default TabletLayout8;
