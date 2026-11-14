import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveUploadsPath, getSupabaseBaseUrl, getAssetBaseUrl } from '../utils/assetUtils';
import { sanitizeSvgXml } from '../utils/editorUtils';
import { useAuth } from '../context/AuthContext';
import { getInitialUser } from '../utils/authUtils';
import { useToast } from '../components/CustomToast';
import p1 from '../assets/Explore/p1.png';
import cover1 from '../assets/Explore/c-bg1.png';
import cover2 from '../assets/Explore/c-bg2.png';
import cover3 from '../assets/Explore/c-bg3.png';
import cover4 from '../assets/Explore/c-bg4.png';
import cover5 from '../assets/Explore/c-bg5.png';
const covers = [cover1, cover2, cover3, cover4, cover5];

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');

const defaultColors = [
    '#4c5add', '#2563eb', '#059669', '#d97706', '#dc2626',
    '#7c3aed', '#db2777', '#0891b2', '#8a4419', '#597810'
];

const getAvatarColor = (identifier, customColor) => {
    if (customColor && customColor !== '#E8D4C8' && customColor !== '#ffffff' && customColor !== 'transparent') {
        return customColor;
    }
    if (!identifier) return defaultColors[0];
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
        hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    return defaultColors[Math.abs(hash) % defaultColors.length];
};

const defaultMockBooks = [
    { title: "Thinking, Fast and Slow", cover: cover1, pages: 28, views: '12.5k', rating: 4.5, orientation: 'portrait' },
    { title: "The Art of Spending Money", cover: cover2, pages: 32, views: '8.1k', rating: 4.8, orientation: 'landscape' },
    { title: "Games People Play", cover: cover3, pages: 24, views: '15.3k', rating: 4.6, orientation: 'portrait' },
    { title: "The Psychology of Leadership", cover: cover4, pages: 40, views: '9.4k', rating: 4.9, orientation: 'landscape' },
    { title: "Just Keep Buying", cover: cover5, pages: 36, views: '11.2k', rating: 4.7, orientation: 'portrait' },
    { title: "Seduction", cover: cover1, pages: 20, views: '6.5k', rating: 4.3, orientation: 'landscape' },
    { title: "Thinking, Fast and Slow 2", cover: cover2, pages: 28, views: '10.1k', rating: 4.5, orientation: 'portrait' },
    { title: "The Art of Spending Money 2", cover: cover3, pages: 30, views: '7.8k', rating: 4.6, orientation: 'landscape' },
];

const LazyPreview = ({ v_id, emailId, backendUrl, iframeBaseUrl, title, imageUrl, onOrientationDetected }) => {
    const containerRef = useRef(null);
    const [html, setHtml] = useState(null);
    const [fetchedBaseUrl, setFetchedBaseUrl] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (!v_id || loaded) return;
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loaded && !fetching) {
                    observer.disconnect();
                    setFetching(true);
                    axios
                        .get(`${backendUrl}/api/flipbook/preview/${v_id}`, { withCredentials: true })
                        .then((res) => {
                            if (res.data?.book) {
                                const b = res.data.book;
                                const uFolder = b.userID || b.userFolder || b.userId || emailId?.replace(/[@.]/g, '_');
                                const fName = b.folderName || 'default';
                                const bName = b.realName || b.flipbookName || b.title || title;
                                if (uFolder && bName) {
                                    setFetchedBaseUrl(getAssetBaseUrl(uFolder, fName, bName));
                                }
                            }

                            if (res.data?.html) {
                                const htmlStr = res.data.html;

                                // Auto-detect orientation from SVG viewBox or width/height
                                let detectedOrient = null;
                                const vbMatch = htmlStr.match(/viewBox=["']\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*["']/i);
                                if (vbMatch) {
                                    const w = parseFloat(vbMatch[3]);
                                    const h = parseFloat(vbMatch[4]);
                                    if (w > 0 && h > 0) {
                                        detectedOrient = w > h * 1.05 ? 'landscape' : (h > w * 1.05 ? 'portrait' : 'square');
                                    }
                                }
                                if (!detectedOrient) {
                                    const wm = htmlStr.match(/<svg[^>]*?\bwidth=["']([\d.]+)(?:px)?["']/i);
                                    const hm = htmlStr.match(/<svg[^>]*?\bheight=["']([\d.]+)(?:px)?["']/i);
                                    if (wm && hm) {
                                        const w = parseFloat(wm[1]);
                                        const h = parseFloat(hm[1]);
                                        if (w > 0 && h > 0) {
                                            detectedOrient = w > h * 1.05 ? 'landscape' : (h > w * 1.05 ? 'portrait' : 'square');
                                        }
                                    }
                                }
                                if (detectedOrient && onOrientationDetected) {
                                    onOrientationDetected(detectedOrient);
                                }

                                const fontsToLoad = new Set();
                                const cssRegex = /font-family\s*:\s*(?:['"]([^'"]+)['"]|([^;}'"\s]+))/g;
                                const attrRegex = /font-family\s*=\s*['"]([^'"]+)['"]/g;
                                let match;
                                while ((match = cssRegex.exec(res.data.html)) !== null) {
                                    let f = match[1] || match[2];
                                    if (f) f = f.split(',')[0].replace(/['"]/g, '').trim();
                                    if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
                                }
                                while ((match = attrRegex.exec(res.data.html)) !== null) {
                                    let f = match[1].split(',')[0].replace(/['"]/g, '').trim();
                                    if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
                                }

                                let fontImports = '';
                                if (fontsToLoad.size > 0) {
                                    const fontList = Array.from(fontsToLoad).map(f => f.replace(/\s+/g, '+')).join('|');
                                    fontImports = `<link href="https://fonts.googleapis.com/css?family=${fontList}:300,400,500,600,700,800,900&display=swap" rel="stylesheet">`;
                                }

                                setHtml({ content: res.data.html, fontImports });
                            }
                        })
                        .catch(() => { })
                        .finally(() => { setFetching(false); setLoaded(true); });
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [v_id, loaded, fetching, backendUrl, emailId, onOrientationDetected]);

    const isLoading = !loaded || fetching;

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center relative bg-white overflow-hidden rounded-[3px]">
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-[0.4vw] bg-[#E8E6E1] overflow-hidden border border-[#d5d2c9]">
                    <Icon icon="eos-icons:loading" className="w-[1.5vw] h-[1.5vw] text-gray-400" />
                </div>
            )}

            {html ? (() => {
                let processedContent = sanitizeSvgXml(html.content || '');
                const cleanBaseUrl = (iframeBaseUrl || fetchedBaseUrl || '').trim();
                let effectiveBaseHref = cleanBaseUrl;
                if (cleanBaseUrl) {
                    const bookBaseUrl = cleanBaseUrl.endsWith('/') ? cleanBaseUrl : `${cleanBaseUrl}/`;
                    effectiveBaseHref = `${bookBaseUrl}pages/`;
                    const assetsBaseUrl = `${bookBaseUrl}assets/`;
                    processedContent = processedContent.replace(
                        /(\b(?:href|xlink:href|src)=["'])(?:\.\.\/|\.\/)*assets\/([^"']+)["']/gi,
                        (match, prefix, path) => `${prefix}${assetsBaseUrl}${path}"`
                    );
                }

                const backend = (backendUrl || BACKEND_URL || (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_BACKEND_URL : '') || '').trim().replace(/\/+$/, '');
                if (backend) {
                    processedContent = processedContent.replace(
                        /(\b(?:href|xlink:href|src)=["'])\/(storage|uploads)\/([^"']+)["']/gi,
                        `$1${backend}/$2/$3"`
                    );
                }

                // Normalize vector-effect so strokes scale down proportionally with the thumbnail viewBox
                processedContent = processedContent
                    .replace(/\bvector-effect\s*=\s*["']non-scaling-stroke["']/gi, 'vector-effect="none"')
                    .replace(/\bvectorEffect\s*=\s*["']non-scaling-stroke["']/gi, 'vectorEffect="none"')
                    .replace(/vector-effect\s*:\s*non-scaling-stroke\s*;?/gi, 'vector-effect: none;');

                if (processedContent.includes('preserveAspectRatio')) {
                    processedContent = processedContent.replace(/preserveAspectRatio=["'][^"']*["']/i, 'preserveAspectRatio="xMidYMid meet"');
                } else {
                    processedContent = processedContent.replace(/<svg\b/i, '<svg preserveAspectRatio="xMidYMid meet" ');
                }
                if (!processedContent.includes('viewBox')) {
                    const wMatch = processedContent.match(/width=["'](\d+(?:\.\d+)?)/i);
                    const hMatch = processedContent.match(/height=["'](\d+(?:\.\d+)?)/i);
                    if (wMatch && hMatch) {
                        processedContent = processedContent.replace(/<svg\b/i, `<svg viewBox="0 0 ${wMatch[1]} ${hMatch[1]}" `);
                    }
                }

                return (
                    <iframe
                        title={`Preview of ${title}`}
                        className="w-full h-full border-none pointer-events-none select-none"
                        sandbox="allow-same-origin allow-scripts"
                        srcDoc={`<!DOCTYPE html><html><head>${html.fontImports || ''}<base href="${effectiveBaseHref}"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#f3f4f6;}svg{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;display:block;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.12));}svg,svg *{vector-effect:none !important;}[data-name="Free Frame"]{stroke:transparent !important;fill:transparent !important;}</style></head><body>${processedContent}</body></html>`}
                    />
                );
            })() : loaded && imageUrl ? (
                <img src={resolveUploadsPath(imageUrl)} alt={title} className="w-full h-full object-contain" />
            ) : loaded && !html ? (
                <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full bg-white border border-[#d5d2c9]">
                    <Icon icon="mdi:book-open-blank-variant" className="w-[2vw] h-[2vw] text-gray-400 mb-1" />
                    <span className="text-[0.7vw] font-medium leading-tight text-gray-500">No Preview</span>
                </div>
            ) : null}
        </div>
    );
};

const BookCoverItem = ({ book, onOpenBook, backendUrl, className = "" }) => {
    const getInitialOrientation = () => {
        const raw = (book.orientation || book.Customized_Settings?.FlipbookInfo?.orientation || '').toLowerCase();
        if (raw.includes('horizontal') || raw.includes('landscape') || book.isLandscape) return 'landscape';
        if (raw.includes('square')) return 'square';
        if (raw.includes('vertical') || raw.includes('portrait')) return 'portrait';
        const w = book.Customized_Settings?.FlipbookInfo?.width || book.width || book.pageWidth;
        const h = book.Customized_Settings?.FlipbookInfo?.height || book.height || book.pageHeight;
        if (w && h) {
            return Number(w) > Number(h) ? 'landscape' : Number(w) < Number(h) ? 'portrait' : 'square';
        }
        return 'portrait';
    };

    const [orientation, setOrientation] = useState(getInitialOrientation);

    useEffect(() => {
        setOrientation(getInitialOrientation());
    }, [book.orientation, book.isLandscape, book.v_id]);

    const isLandscape = orientation === 'landscape';
    const isSquare = orientation === 'square';
    const defaultWidthClass = className.includes('w-') ? '' : (isLandscape ? 'w-[12.5vw]' : isSquare ? 'w-[8.5vw]' : 'w-[7.5vw]');

    return (
        <div
            onClick={() => onOpenBook && onOpenBook(book)}
            className={`flex flex-col items-center cursor-pointer group flex-shrink-0 ${defaultWidthClass} ${className}`}
        >
            <div className="h-[9.5vw] w-full flex items-end justify-center">
                <div
                    className={`relative rounded-[0.35vw] overflow-hidden shadow-[4px_6px_14px_rgba(0,0,0,0.22),1px_2px_4px_rgba(0,0,0,0.1)] transition-transform duration-200 group-hover:scale-105 group-hover:shadow-[6px_10px_18px_rgba(0,0,0,0.28)] ${
                        isLandscape
                            ? 'w-[12vw] max-w-full aspect-[1.42/1]'
                            : isSquare
                            ? 'h-[8.5vw] aspect-square'
                            : 'h-full aspect-[1/1.42]'
                    }`}
                >
                    {book.v_id ? (() => {
                        const userFolder = book.rawBook?.userID || book.rawBook?.userId || book.rawBook?.userEmail?.replace(/[@.]/g, '_') || book.userEmail?.replace(/[@.]/g, '_');
                        const folderName = book.rawBook?.folderName || 'default';
                        const resolvedTitle = book.rawBook?.flipbookName || book.rawBook?.realName || book.title;
                        const resolvedIframeBaseUrl = getAssetBaseUrl(userFolder, folderName, resolvedTitle);
                        return (
                            <LazyPreview
                                v_id={book.v_id}
                                emailId={book.rawBook?.userEmail}
                                backendUrl={backendUrl || BACKEND_URL}
                                iframeBaseUrl={resolvedIframeBaseUrl}
                                title={book.title || 'Flipbook'}
                                imageUrl={book.rawBook?.image || null}
                                onOrientationDetected={(detected) => {
                                    if (detected && detected !== orientation) {
                                        setOrientation(detected);
                                    }
                                }}
                            />
                        );
                    })() : (
                        <img
                            src={book.cover}
                            alt={book.title || 'Flipbook'}
                            className="w-full h-full object-cover"
                            onLoad={(e) => {
                                const { naturalWidth, naturalHeight } = e.target;
                                if (naturalWidth && naturalHeight) {
                                    if (naturalWidth > naturalHeight * 1.15) {
                                        setOrientation('landscape');
                                    } else if (Math.abs(naturalWidth - naturalHeight) < naturalWidth * 0.1) {
                                        setOrientation('square');
                                    } else {
                                        setOrientation('portrait');
                                    }
                                }
                            }}
                        />
                    )}
                    <div className="absolute left-0 top-0 bottom-0 w-[0.35vw] bg-gradient-to-r from-black/25 via-white/15 to-transparent pointer-events-none"></div>
                </div>
            </div>
            <span
                className="text-[0.75vw] text-gray-700 font-medium truncate w-full text-center mt-[0.5vw]"
                title={book.title || 'Book Name'}
            >
                {book.title || 'Book Name'}
            </span>
        </div>
    );
};

const CreatorFlipbookCard = ({ book, creator, onOpenBook, isFavorited: propIsFavorited, onToggleFavorite }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [localIsFavorited, setLocalIsFavorited] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const menuRef = useRef(null);

    const isFavorited = propIsFavorited !== undefined ? propIsFavorited : localIsFavorited;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const rawBook = book?.rawBook || book || {};
    const v_id = book?.v_id || rawBook?.v_id || rawBook?.vId;
    const bookTitle = book?.title || rawBook?.title || rawBook?.book_name || rawBook?.bookName || 'Flipbook';
    const pages = rawBook?.pages || book?.pages || rawBook?.pageCount || 10;
    const pagesCount = Array.isArray(pages) ? pages.length : (typeof pages === 'number' ? pages : (book?.pagesCount || 10));
    const views = book?.views || rawBook?.views || rawBook?.totalViews || '12.5k';
    const rating = book?.rating || rawBook?.rating || 4.5;

    const authorName = book?.authorName || rawBook?.authorName || (creator && (creator.name || creator.fullName)) || 'Creator';
    const authorAvatar = book?.authorPicture || rawBook?.authorPicture || (creator?.profileImg && creator?.profileImg !== 'color_only' ? creator?.profileImg : (creator?.picture && creator?.picture !== 'color_only' ? creator?.picture : null));
    const resolvedAvatar = authorAvatar ? (authorAvatar.startsWith('http') || authorAvatar.startsWith('blob:') || authorAvatar.startsWith('data:') ? authorAvatar : resolveUploadsPath(authorAvatar)) : null;
    const authorLocation = book?.location || rawBook?.location || creator?.city || creator?.location || 'Coimbatore';
    const authorBgColor = book?.authorBgColor || rawBook?.authorBgColor || creator?.avatarBgColor;
    const avatarColor = getAvatarColor(authorName || creator?.email, authorBgColor);

    const handleOpen = () => {
        if (onOpenBook) {
            onOpenBook(book);
        } else {
            const targetShareId = (book.shareId && book.shareId !== book.v_id ? book.shareId : null) || book.Customized_Settings?.Visibility?.shareId || book.Visibility?.shareId || book.shareId || book.v_id;
            const rawAcc = String(book.access || 'public').toLowerCase();
            if (targetShareId) {
                window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
            }
        }
    };

    const handleShare = (e) => {
        e?.stopPropagation();
        const targetShareId = (book.shareId && book.shareId !== book.v_id ? book.shareId : null) || book.Customized_Settings?.Visibility?.shareId || book.Visibility?.shareId || book.shareId || book.v_id;
        const rawAcc = String(book.access || 'public').toLowerCase();
        const shareUrl = `${window.location.origin}/share=${rawAcc}/${targetShareId}`;
        if (navigator.share) {
            navigator.share({ title: bookTitle, url: shareUrl }).catch(() => {});
        } else {
            navigator.clipboard?.writeText(shareUrl);
            alert("Flipbook link copied to clipboard!");
        }
    };

    const handleDownload = (e) => {
        e?.stopPropagation();
        if (book.pdfUrl || rawBook?.pdfUrl) {
            window.open(book.pdfUrl || rawBook?.pdfUrl, '_blank');
        } else {
            alert("Download not available for this flipbook.");
        }
    };

    const handleReport = (e) => {
        e?.stopPropagation();
        alert("Flipbook reported successfully. Our team will review it.");
    };

    const menuItems = [
        {
            name: 'View Book',
            icon: <Icon icon="solar:eye-linear" className="w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px]" />,
            action: handleOpen
        },
        {
            name: 'Share',
            icon: <Icon icon="solar:share-linear" className="w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px]" />,
            action: handleShare
        },
        {
            name: 'Download',
            icon: <Icon icon="solar:download-linear" className="w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px]" />,
            action: handleDownload
        },
        {
            name: 'Report',
            icon: <Icon icon="solar:danger-circle-linear" className="w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px]" />,
            action: handleReport
        }
    ];

    return (
        <div
            onClick={handleOpen}
            className="bg-white rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow border border-gray-100/80 relative group cursor-pointer"
        >
            {/* Image Area Wrapper (1st page preview) */}
            <div className="relative w-full aspect-[4/3] bg-white rounded-t-xl overflow-hidden flex items-center justify-center border-b border-gray-100">
                {(() => {
                    const userFolder = rawBook?.userID || rawBook?.userId || rawBook?.userEmail?.replace(/[@.]/g, '_') || creator?.emailId?.replace(/[@.]/g, '_') || creator?.email?.replace(/[@.]/g, '_');
                    const folderName = rawBook?.folderName || 'default';
                    const bookTitleResolved = rawBook?.flipbookName || rawBook?.realName || bookTitle;
                    const resolvedIframeBaseUrl = getAssetBaseUrl(userFolder, folderName, bookTitleResolved);
                    return (
                        <LazyPreview
                            v_id={v_id}
                            emailId={rawBook?.userEmail || creator?.emailId || creator?.email}
                            backendUrl={BACKEND_URL}
                            iframeBaseUrl={resolvedIframeBaseUrl}
                            title={bookTitle || "Flipbook"}
                            imageUrl={rawBook?.image || book?.cover || null}
                        />
                    );
                })()}
            </div>

            {/* Top Right Floating Action Buttons (Heart + Three-Dots) - Visible on hover */}
            <div
                className={`absolute top-[0.6vw] right-[0.6vw] flex flex-col items-center gap-[0.35vw] z-30 transition-opacity duration-200 ${isMenuOpen || isFavorited ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Heart Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleFavorite) {
                            onToggleFavorite(rawBook || book);
                        } else {
                            setLocalIsFavorited(!localIsFavorited);
                        }
                    }}
                    className="w-[2vw] h-[2vw] min-w-[30px] min-h-[30px] rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-red-500 hover:scale-105 transition-all cursor-pointer focus:outline-none"
                    title={isFavorited ? "Favorited" : "Add to Favorites"}
                >
                    <Icon icon="lucide:heart" className={`w-[1vw] h-[1vw] min-w-[15px] min-h-[15px] transition-colors ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
                </button>

                {/* Three-Dot Button & Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="w-[2vw] h-[2vw] min-w-[30px] min-h-[30px] rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-black hover:scale-105 transition-all cursor-pointer focus:outline-none"
                        title="More Options"
                    >
                        <Icon icon="mdi:dots-vertical" className="w-[1.05vw] h-[1.05vw] min-w-[16px] min-h-[16px]" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute top-[110%] right-0 w-[9.5vw] min-w-[140px] bg-white rounded-[0.7vw] shadow-[0_10px_35px_rgba(0,0,0,0.15)] py-[0.6vh] z-50 border border-gray-100 flex flex-col">
                            {menuItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(false);
                                        item.action(e);
                                    }}
                                    className="w-full flex items-center gap-[0.6vw] px-[0.8vw] py-[0.6vh] text-[0.78vw] font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors text-left cursor-pointer"
                                >
                                    <span className="flex items-center justify-center text-gray-700">{item.icon}</span>
                                    <span className="whitespace-nowrap">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Card Details (Enhanced Size & Compact Spacing) */}
            <div className="p-[1vw] flex flex-col flex-1 bg-white rounded-b-xl">
                {/* Stats (Split evenly across width) */}
                <div className="flex items-center justify-between w-full text-[0.76vw] text-gray-700 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-[0.25vw]">
                        <span className="text-black font-semibold">{pagesCount}</span>
                        <span className="font-normal text-gray-500">Pages</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-[0.25vw]">
                        <Icon icon="lucide:eye" className="w-[0.85vw] h-[0.85vw] text-gray-400" />
                        <span>{views}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-[0.25vw]">
                        <Icon icon="material-symbols:star" className="w-[0.9vw] h-[0.9vw] text-yellow-400" />
                        <span>{rating}</span>
                    </div>
                </div>

                {/* Book Title */}
                <h4 className="text-[0.98vw] font-semibold text-black truncate tracking-tight mt-[0.6vw]" title={bookTitle}>
                    {bookTitle}
                </h4>

                {/* Author Info & Action Button */}
                <div className="flex items-center justify-between mt-[0.6vw]">
                    <div className="flex items-center gap-[0.55vw] min-w-0 pr-2">
                        {resolvedAvatar && !avatarError ? (
                            <img
                                src={resolvedAvatar}
                                alt={authorName || 'Creator'}
                                className="w-[2.1vw] h-[2.1vw] min-w-[32px] min-h-[32px] rounded-full border border-gray-200 object-cover shrink-0 hover:opacity-85 transition-opacity"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <div
                                className="w-[2.1vw] h-[2.1vw] min-w-[32px] min-h-[32px] rounded-full flex items-center justify-center text-white text-[0.85vw] font-bold shrink-0 shadow-inner hover:opacity-85 transition-opacity"
                                style={{ backgroundColor: avatarColor }}
                            >
                                {(authorName || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0 pr-1">
                            <span className="text-[0.88vw] font-semibold text-gray-900 leading-tight truncate hover:text-[#ea543a] transition-colors">
                                {authorName}
                            </span>
                            <span className="flex items-center gap-[0.2vw] text-[0.68vw] text-gray-400 mt-0.5 truncate">
                                <Icon icon="lucide:map-pin" className="w-[0.75vw] h-[0.75vw] min-w-[10px] min-h-[10px] text-gray-400 shrink-0" />
                                <span className="truncate">{authorLocation ? String(authorLocation).replace(/📍/g, '').trim() : 'Coimbatore'}</span>
                            </span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpen();
                        }}
                        className="bg-[#ea543a] hover:bg-[#d9442a] text-white w-[2.1vw] h-[2.1vw] min-w-[32px] min-h-[32px] rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-md cursor-pointer flex-shrink-0"
                        title="View Book"
                    >
                        <Icon icon="mdi:arrow-top-right" className="w-[1.1vw] h-[1.1vw] min-w-[16px] min-h-[16px]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CreatorProfileModal({
    isOpen,
    onClose,
    creator,
    isPreview = false,
    isMobile = false,
    isTablet = false,
    isSidebarOpen = false,
    isFullscreen = false,
    favoriteBookIds: propFavoriteBookIds,
    onToggleFavorite: propOnToggleFavorite
}) {
    const toast = useToast();
    const [isViewAll, setIsViewAll] = useState(false);
    const [displayView, setDisplayView] = useState('book'); // 'book' | 'card'
    const [profileData, setProfileData] = useState(null);
    const [booksData, setBooksData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [hoveredInfoId, setHoveredInfoId] = useState(null);
    const [internalFavoriteBookIds, setInternalFavoriteBookIds] = useState([]);

    const favoriteBookIds = propFavoriteBookIds || internalFavoriteBookIds;

    const { user } = useAuth();
    const currentUserEmail = (
        user?.emailId ||
        user?.email ||
        user?.userEmail ||
        getInitialUser()?.emailId ||
        getInitialUser()?.email ||
        localStorage.getItem('userEmail') ||
        ''
    ).trim().toLowerCase();

    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const targetEmail = creator?.emailId || creator?.email || creator?.userEmail || '';

    // If favoriteBookIds wasn't passed down, fetch favorites for currentUserEmail
    useEffect(() => {
        if (propFavoriteBookIds || !currentUserEmail || !isOpen) return;
        const fetchFavs = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/flipbook/list?emailId=${encodeURIComponent(currentUserEmail)}`, { withCredentials: true });
                if (res.data && res.data.books) {
                    const favIds = res.data.books.filter(b => b.isFavorite).map(b => b.v_id).filter(Boolean);
                    setInternalFavoriteBookIds(favIds);
                }
            } catch (err) {
                console.error("Error fetching favorites in CreatorProfileModal:", err);
            }
        };
        fetchFavs();
    }, [propFavoriteBookIds, currentUserEmail, isOpen, backendUrl]);

    const handleToggleFavorite = async (book) => {
        if (propOnToggleFavorite) {
            propOnToggleFavorite(book);
            return;
        }

        if (!currentUserEmail) {
            toast?.error?.("Please log in to add books to your favorites.");
            return;
        }

        const raw = book?.rawBook || book || {};
        const targetVId = book?.v_id || raw?.v_id || raw?.book_v_id || raw?.vId;
        if (!targetVId) {
            toast?.error?.("Flipbook identifier missing.");
            return;
        }

        const authorEmail = (raw?.userEmail || raw?.emailId || creator?.email || creator?.emailId || targetEmail || '').trim().toLowerCase();
        if (authorEmail && authorEmail === currentUserEmail) {
            toast?.error?.("You cannot favorite your own book.");
            return;
        }

        const isFav = favoriteBookIds.includes(targetVId);
        const next = !isFav;

        setInternalFavoriteBookIds(prev => next ? [...prev, targetVId] : prev.filter(id => id !== targetVId));

        try {
            const res = await axios.post(`${backendUrl}/api/flipbook/favorite`, {
                emailId: currentUserEmail,
                v_id: targetVId,
                isFavorite: next
            }, { withCredentials: true });

            if (res.data?.success) {
                toast?.success?.(next ? "Book added to your Favorites!" : "Book removed from your Favorites.");
            } else {
                setInternalFavoriteBookIds(prev => next ? prev.filter(id => id !== targetVId) : [...prev, targetVId]);
                toast?.error?.(res.data?.message || "Failed to update favorites");
            }
        } catch (err) {
            setInternalFavoriteBookIds(prev => next ? prev.filter(id => id !== targetVId) : [...prev, targetVId]);
            toast?.error?.(err.response?.data?.message || "Error updating favorites");
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setIsViewAll(false);
            setDisplayView('book');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const initialProfile = {
            name: creator?.name || '',
            email: targetEmail,
            emailId: targetEmail,
            picture: creator?.picture || creator?.profileImg || null,
            avatarBgColor: creator?.avatarBgColor || '#E8D4C8',
            about: creator?.about || '',
            mobile: creator?.mobile || '',
            companyName: creator?.companyName || '',
            industryType: creator?.industryType || '',
            companyEmail: creator?.companyEmail || '',
            website: creator?.website || '',
            services: creator?.services || [],
            address1: creator?.address1 || '',
            address2: creator?.address2 || '',
            city: creator?.city || creator?.location || '',
            pincode: creator?.pincode || '',
            state: creator?.state || '',
            country: creator?.country || 'INDIA',
            socials: creator?.socials || {},
            followers: creator?.followers || [],
            following: creator?.following || [],
            bannerBg: creator?.bannerBg || { type: 'gradient', value: 'linear-gradient(120deg, #9fe6cb 0%, #72ceaf 50%, #9fe6cb 100%)' },
            companyLogo: creator?.companyLogo || ''
        };

        setProfileData(initialProfile);

        const fetchCreatorData = async () => {
            setIsLoading(true);
            try {
                const params = {};
                if (currentUserEmail) params.currentEmail = currentUserEmail;
                if (targetEmail) {
                    params.emailId = targetEmail;
                } else if (creator?.shareId) {
                    params.shareId = creator.shareId;
                } else if (creator?.v_id) {
                    params.v_id = creator.v_id;
                } else if (typeof window !== 'undefined') {
                    const match = window.location.pathname.match(/\/share=[^/]+\/([^/?#]+)/);
                    if (match && match[1]) params.shareId = match[1];
                }

                if (!params.emailId && !params.shareId && !params.v_id) {
                    setIsLoading(false);
                    return;
                }

                const res = await axios.get(`${backendUrl}/api/explore/creator`, {
                    params
                });
                if (res.data?.success) {
                    const creatorObj = res.data.profile || res.data.creator;
                    if (creatorObj) {
                        setProfileData(creatorObj);
                    }
                    const rawBooks = res.data.books || [];
                    // Ensure only published books are shown in creator modal
                    const visibleBooks = rawBooks.filter(b => b && (b.isPublished === true || b.isPublished === 'true'));
                    const formatted = visibleBooks.map((b, idx) => {
                        const isMyBook = true;

                        let aName = b.authorName || creatorObj?.displayName || creatorObj?.name;
                        let aPic = b.authorPicture || (creatorObj?.picture !== 'color_only' ? creatorObj?.picture : null);
                        let aBg = b.authorBgColor || creatorObj?.avatarBgColor || '#4c5add';
                        let aLoc = b.city || b.location || creatorObj?.city || creatorObj?.state || 'Coimbatore';

                        aName = aName || (b.userEmail ? b.userEmail.split('@')[0] : 'Creator');

                        let rawOrient = (b.orientation || b.Customized_Settings?.FlipbookInfo?.orientation || '').toLowerCase();
                        let isLandscape = false;
                        if (rawOrient.includes('horizontal') || rawOrient.includes('landscape') || Boolean(b.isLandscape)) {
                            rawOrient = 'landscape';
                            isLandscape = true;
                        } else if (rawOrient.includes('square')) {
                            rawOrient = 'square';
                        } else if (rawOrient.includes('vertical') || rawOrient.includes('portrait')) {
                            rawOrient = 'portrait';
                        } else {
                            const w = b.Customized_Settings?.FlipbookInfo?.width || b.width || b.pageWidth;
                            const h = b.Customized_Settings?.FlipbookInfo?.height || b.height || b.pageHeight;
                            if (w && h) {
                                if (Number(w) > Number(h)) {
                                    rawOrient = 'landscape';
                                    isLandscape = true;
                                } else if (Number(w) < Number(h)) {
                                    rawOrient = 'portrait';
                                } else {
                                    rawOrient = 'square';
                                }
                            } else {
                                rawOrient = 'portrait';
                            }
                        }

                        return {
                            rawBook: b,
                            v_id: b.v_id,
                            shareId: b.Customized_Settings?.Visibility?.shareId || b.Visibility?.shareId || (b.share?.shareId && b.share.shareId !== b.v_id ? b.share.shareId : null) || (b.shareId && b.shareId !== b.v_id ? b.shareId : null) || b.v_id,
                            access: b.Customized_Settings?.Visibility?.access || b.Visibility?.access || 'public',
                            title: b.flipbookName || b.title || `Flipbook ${idx + 1}`,
                            cover: b.image || covers[idx % covers.length],
                            orientation: rawOrient,
                            isLandscape,
                            pages: Array.isArray(b.pages) ? b.pages.length : (typeof b.pages === 'number' ? b.pages : 0),
                            views: b.views || b.viewsCount || '1.2k',
                            rating: b.averageRating || b.rating || 4.5,
                            description: b.Customized_Settings?.FlipbookInfo?.quotes || b.quotes || '“Bring your content to life with a real, interactive experience”',
                            authorName: aName,
                            authorPicture: aPic,
                            authorBgColor: aBg,
                            location: aLoc
                        };
                    });
                    setBooksData(formatted);
                }
            } catch (err) {
                console.error("[CreatorProfileModal] Error fetching creator details from backend:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCreatorData();
    }, [isOpen, targetEmail, backendUrl, creator, currentUserEmail]);

    const profileUser = profileData || creator || {};
    const books = booksData.length > 0 ? booksData : (isPreview ? defaultMockBooks : (targetEmail ? [] : defaultMockBooks));

    const handleToggleFollowModal = async () => {
        const resolvedCurrentEmail = (
            currentUserEmail ||
            user?.emailId ||
            user?.email ||
            getInitialUser()?.emailId ||
            getInitialUser()?.email ||
            localStorage.getItem('userEmail') ||
            ''
        ).trim().toLowerCase();

        if (!resolvedCurrentEmail) {
            alert("Please log in to follow creators.");
            return;
        }

        const targetEmail = (
            profileUser?.emailId ||
            profileUser?.email ||
            creator?.emailId ||
            creator?.email ||
            creator?.userEmail ||
            ''
        ).trim().toLowerCase();

        if (!targetEmail) {
            console.error("Target email missing for creator:", profileUser);
            return;
        }

        const wasFollowing = Boolean(
            profileUser?.isFollowing ||
            (Array.isArray(profileUser?.followers) && profileUser.followers.some(f => f && f.toLowerCase() === resolvedCurrentEmail))
        );

        // Optimistic update
        setProfileData(prev => {
            if (!prev) return prev;
            const currentFollowers = Array.isArray(prev.followers) ? prev.followers : [];
            const newFollowers = wasFollowing
                ? currentFollowers.filter(f => f && f.toLowerCase() !== resolvedCurrentEmail)
                : [...currentFollowers, resolvedCurrentEmail];
            return {
                ...prev,
                isFollowing: !wasFollowing,
                followers: newFollowers,
                followersCount: newFollowers.length
            };
        });

        setIsFollowLoading(true);
        try {
            const res = await axios.post(
                `${BACKEND_URL || backendUrl}/api/explore/toggle-follow`,
                {
                    currentEmail: resolvedCurrentEmail,
                    targetEmail
                },
                { withCredentials: true }
            );

            if (res.data?.success) {
                setProfileData(prev => ({
                    ...prev,
                    isFollowing: res.data.isFollowing,
                    followersCount: res.data.followersCount,
                    followers: res.data.followers
                }));
            }
        } catch (err) {
            console.error("Error toggling follow in modal:", err);
            // Rollback optimistic update on error
            setProfileData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    isFollowing: wasFollowing
                };
            });
        } finally {
            setIsFollowLoading(false);
        }
    };

    const handleOpenBook = (book) => {
        const targetShareId = (book.shareId && book.shareId !== book.v_id ? book.shareId : null) || book.Customized_Settings?.Visibility?.shareId || book.Visibility?.shareId || book.shareId;
        const rawAcc = String(book.access || 'public').toLowerCase();
        if (targetShareId) {
            window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${profileUser?.name || 'Creator'} - FlipiBook`,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard?.writeText(window.location.href);
            alert("Creator profile link copied to clipboard!");
        }
    };

    if (isMobile) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <div 
                        className="absolute inset-0 z-[2000] flex items-center justify-center bg-gray-900/30 backdrop-blur-[2px] p-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#f8f9fa] w-[90%] max-w-[400px] h-auto max-h-[85vh] rounded-2xl flex flex-col relative shadow-2xl overflow-hidden p-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col flex-1 h-full min-h-0 bg-white relative overflow-y-auto no-scrollbar rounded-xl shadow-sm border border-gray-100">
                                {/* Banner */}
                                <div className="relative w-full h-[110px] rounded-t-xl shrink-0">
                                    {isLoading ? (
                                        <div className="absolute inset-0 rounded-t-xl bg-gray-200 animate-pulse"></div>
                                    ) : (
                                        <div
                                            className="absolute inset-0 rounded-t-xl overflow-hidden"
                                            style={{
                                                background: profileUser?.bannerBg?.type === 'solid' ? profileUser?.bannerBg?.value : undefined,
                                                backgroundImage: (profileUser?.bannerBg?.type === 'gradient' || profileUser?.bannerBg?.type === 'media')
                                                    ? profileUser?.bannerBg?.value
                                                    : (profileUser?.bannerBg?.value || 'linear-gradient(120deg, #9fe6cb 0%, #72ceaf 50%, #9fe6cb 100%)'),
                                                backgroundSize: profileUser?.bannerBg?.type === 'media' ? 'cover' : undefined,
                                                backgroundPosition: 'center'
                                            }}
                                        >
                                            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 150%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% -50%, rgba(255,255,255,0.4) 0%, transparent 50%)' }}></div>
                                        </div>
                                    )}
                                    {/* Close Button */}
                                    <button
                                        onClick={onClose}
                                        className="absolute top-3 right-3 z-50 bg-white/50 hover:bg-white rounded-md p-1 shadow-sm transition-colors border border-gray-900/10 cursor-pointer"
                                    >
                                        <Icon icon="mingcute:close-fill" className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>

                                {/* Avatar & Actions Wrapper */}
                                <div className="relative flex flex-col items-center">
                                    {/* Avatar */}
                                    <div className="absolute -top-10 flex justify-center z-30">
                                        <div className="w-[84px] h-[84px] rounded-full bg-white p-1.5 flex items-center justify-center">
                                            {isLoading ? (
                                                <div className="w-full h-full rounded-full bg-gray-200 animate-pulse shadow-inner"></div>
                                            ) : (
                                                <div
                                                    className="w-full h-full rounded-full overflow-hidden relative shadow-inner flex items-center justify-center"
                                                    style={{ backgroundColor: (profileUser?.picture && profileUser?.picture !== 'color_only') ? '#ffffff' : getAvatarColor(profileUser?.name || profileUser?.email, profileUser?.avatarBgColor) }}
                                                >
                                                    {(profileUser?.picture && profileUser?.picture !== 'color_only') ? (
                                                        <img src={profileUser?.picture.startsWith('blob:') || profileUser?.picture.startsWith('data:') ? profileUser?.picture : resolveUploadsPath(profileUser?.picture)} alt={profileUser?.name || "Profile Avatar"} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-white text-3xl font-bold drop-shadow-md">
                                                            {profileUser?.name ? profileUser?.name.charAt(0).toUpperCase() : 'U'}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Share Button */}
                                    {!isLoading && (
                                        <div className="w-full flex justify-end px-3 pt-2">
                                            <button className="flex items-center gap-1 px-2 py-1 text-[13px] font-semibold text-gray-700 cursor-pointer">
                                                <Icon icon="ic:round-share" className="w-[16px] h-[16px]" /> Share
                                            </button>
                                        </div>
                                    )}

                                    {/* Name & Details */}
                                    <div className="flex flex-col items-center w-full px-4 mt-6 pb-6">
                                        {isLoading ? (
                                            <div className="flex flex-col items-center gap-2 w-full">
                                                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
                                                <div className="h-3 w-32 bg-gray-100 rounded animate-pulse mt-1"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <h2 className="text-[18px] font-bold text-gray-900 text-center truncate w-full">{profileUser?.name || 'Creator'}</h2>
                                                {profileUser?.email && (
                                                    <p className="text-[11px] text-gray-400 text-center truncate w-full">{profileUser?.email}</p>
                                                )}
                                                {/* Followers & Following Stats */}
                                                <div className="flex items-center justify-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[13px] font-bold text-gray-900 leading-none">
                                                            {profileUser?.followers?.length || 0}
                                                        </span>
                                                        <span className="text-[11px] text-gray-500 font-medium leading-none">Followers</span>
                                                    </div>
                                                    <div className="w-[1px] h-3 bg-gray-300"></div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[13px] font-bold text-gray-900 leading-none">
                                                            {profileUser?.following?.length || 0}
                                                        </span>
                                                        <span className="text-[11px] text-gray-500 font-medium leading-none">Following</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Additional Details Container */}
                                    {!isLoading && (
                                        <div className="w-full flex flex-col pb-8">
                                            {/* About */}
                                            <div className="px-4 py-3">
                                                <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700 mb-1.5">
                                                    <Icon icon="mdi:information" className="w-4 h-4 text-gray-600" /> About
                                                </h3>
                                                <p className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-wrap pl-5 pr-2">
                                                    {profileUser?.about || "“Bring your content to life with a real, interactive experience”"}
                                                </p>
                                            </div>

                                            {/* Contact Number */}
                                            {profileUser?.mobile ? (
                                                <div className="px-4 py-3 bg-[#FAFAFA]">
                                                    <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700 mb-1.5">
                                                        <Icon icon="ph:phone-call-fill" className="w-4 h-4 text-gray-600" /> Contact Number
                                                    </h3>
                                                    <p className="text-[11px] text-gray-500 pl-5">{profileUser?.mobile}</p>
                                                </div>
                                            ) : null}

                                            {/* Company Details */}
                                            <div className="px-4 py-3">
                                                <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700 mb-2">
                                                    {profileUser?.companyLogo ? (
                                                        <img src={profileUser.companyLogo} alt="Company Logo" className="w-4 h-4 object-contain rounded-sm" />
                                                    ) : (
                                                        <Icon icon="mingcute:qrcode-2-fill" className="w-4 h-4 text-gray-600" />
                                                    )}
                                                    Company / Organization Details
                                                </h3>
                                                <div className="flex flex-col gap-1.5 text-[11px] pl-5 pr-2">
                                                    <p><span className="font-semibold text-gray-700">Name :</span> <span className="text-gray-500">{profileUser?.companyName || 'Not specified'}</span></p>
                                                    <p><span className="font-semibold text-gray-700">Industry Type :</span> <span className="text-gray-500">{profileUser?.industryType || 'Not specified'}</span></p>
                                                    <p><span className="font-semibold text-gray-700">Gmail :</span> <span className="text-gray-500">{profileUser?.companyEmail || profileUser?.email || 'Not specified'}</span></p>
                                                    {profileUser?.website ? (
                                                        <p><span className="font-semibold text-gray-700">Website :</span> <a href={profileUser?.website.startsWith('http') ? profileUser?.website : `https://${profileUser?.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{profileUser?.website}</a></p>
                                                    ) : (
                                                        <p><span className="font-semibold text-gray-700">Website :</span> <span className="text-gray-500">Not specified</span></p>
                                                    )}
                                                    <p><span className="font-semibold text-gray-700">Services :</span> <span className="text-gray-500">{Array.isArray(profileUser?.services) && profileUser?.services.length > 0 ? profileUser?.services.join(', ') : (typeof profileUser?.services === 'string' && profileUser?.services ? profileUser?.services : 'Not specified')}</span></p>
                                                </div>
                                            </div>

                                            {/* Address */}
                                            {(profileUser?.address1 || profileUser?.address2 || profileUser?.city || profileUser?.state) ? (
                                                <div className="px-4 py-3 bg-[#FAFAFA] rounded-b-xl">
                                                    <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700 mb-1.5">
                                                        <Icon icon="carbon:location-filled" className="w-4 h-4 text-gray-600" /> Address
                                                    </h3>
                                                    <div className="text-[11px] flex flex-col gap-1 text-gray-500 pl-5">
                                                        {profileUser?.address1 && <div>{profileUser?.address1}</div>}
                                                        {profileUser?.address2 && <div>{profileUser?.address2}</div>}
                                                        <div>{[profileUser?.city, profileUser?.state, profileUser?.pincode].filter(Boolean).join(', ')}</div>
                                                        {profileUser?.country && <div>{profileUser?.country}</div>}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Bottom Fade Shadow for scroll effect */}
                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-xl z-50"></div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className={
                        isPreview
                            ? "absolute inset-0 z-[2000] flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px]"
                            : "fixed inset-0 z-[5000] flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px] p-[1.5vw]"
                    }
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className={
                            isPreview
                                ? `bg-[#f8f9fa] ${isFullscreen ? 'w-[75%] h-[75%] m-auto' : isSidebarOpen ? 'w-[95%] h-[85%]' : `w-[85%] ${isMobile ? 'h-[75%]' : 'h-[85%]'}`} p-[1vw] rounded-[1.5vw] flex flex-col relative shadow-2xl overflow-hidden`
                                : `bg-[#f8f9fa] ${isMobile ? 'w-[95vw] h-[80vh]' : 'w-[85vw] h-[85vh]'} p-[1vw] rounded-[1.5vw] flex flex-col relative shadow-2xl overflow-hidden`
                        }
                        style={isPreview ? { zoom: isFullscreen ? 0.95 : isSidebarOpen ? 0.8 : 0.95 } : {}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-[1.5vw] right-[1.5vw] z-50 bg-white/50 hover:bg-white rounded-[0.4vw] p-[0.4vw] shadow-sm transition-colors border border-gray-900/10 cursor-pointer"
                        >
                            <Icon icon="mingcute:close-fill" className="w-[1vw] h-[1vw] text-gray-600" />
                        </button>

                        {/* Overall Container (Fixed view, no full modal scroll) */}
                        <div id="creator-profile-container" className="flex flex-col flex-1 h-full min-h-0 bg-transparent relative overflow-hidden">
                            <style>{`
                                .custom-scrollbar::-webkit-scrollbar {
                                    width: 0.4vw;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                    background: transparent;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background-color: #cbd5e1;
                                    border-radius: 1vw;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background-color: #94a3b8;
                                }
                            `}</style>

                            {/* Fixed Banner (No scroll shrink) */}
                            <div className="relative w-full h-[9vw] rounded-[1vw] z-10 flex-shrink-0 overflow-hidden shadow-sm">
                                {isLoading ? (
                                    <div className="absolute inset-0 rounded-[1vw] bg-gray-200 animate-pulse"></div>
                                ) : (
                                    <div
                                        className="absolute inset-0 rounded-[1vw] overflow-hidden"
                                        style={{
                                            background: profileUser?.bannerBg?.type === 'solid' ? profileUser?.bannerBg?.value : undefined,
                                            backgroundImage: (profileUser?.bannerBg?.type === 'gradient' || profileUser?.bannerBg?.type === 'media')
                                                ? profileUser?.bannerBg?.value
                                                : (profileUser?.bannerBg?.value || 'linear-gradient(120deg, #9fe6cb 0%, #72ceaf 50%, #9fe6cb 100%)'),
                                            backgroundSize: profileUser?.bannerBg?.type === 'media' ? 'cover' : undefined,
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 150%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% -50%, rgba(255,255,255,0.4) 0%, transparent 50%)' }}></div>
                                    </div>
                                )}
                            </div>

                            {/* Main Unified Profile Card */}
                            <div className="flex flex-col md:flex-row relative bg-white border-2 border-gray-200 rounded-[1vw] shadow-sm w-full z-[40] mt-[1vw] flex-1 min-h-0">
                                {/* Left Column (Avatar + Info) */}
                                <div className="w-full md:w-[22vw] flex-shrink-0 border-r-2 border-gray-200 relative flex flex-col items-center px-[1.5vw] pb-[1.5vw] h-full">
                                    {/* Top border eraser across notch */}
                                    <div className="absolute top-[-0.2vw] left-[calc(50%-5.76vw)] w-[11.52vw] h-[0.4vw] bg-white z-10 pointer-events-none"></div>

                                    {/* Seamless Continuous Notch Line around Avatar Bottom */}
                                    <svg
                                        className="absolute top-[-1px] left-0 w-full h-[5vw] pointer-events-none z-[75] overflow-visible"
                                        viewBox="0 0 220 50"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M 52.398 0 A 8 8 0 0 1 60.015 5.554 A 52.5 52.5 0 0 0 159.985 5.554 A 8 8 0 0 1 167.602 0"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="2"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </svg>

                                    {/* Share Button at Top Right */}
                                    <button
                                        onClick={handleShare}
                                        className="absolute top-[0.8vw] right-[0.8vw] z-[80] flex items-center gap-[0.35vw] text-[0.78vw] font-medium text-gray-700 hover:text-black cursor-pointer bg-transparent hover:bg-gray-50 px-[0.5vw] py-[0.25vw] rounded-[0.4vw] transition-colors"
                                    >
                                        <Icon icon="solar:share-linear" className="w-[1vw] h-[1vw]" />
                                        <span>Share</span>
                                    </button>

                                    {/* Avatar Wrapper */}
                                    <div className="relative flex justify-center items-center z-[70] w-[10.5vw] h-[10.5vw] mt-[-6.3vw]">
                                        <div className="w-full h-full rounded-full bg-white p-[0.75vw] relative flex items-center justify-center">
                                            {isLoading ? (
                                                <div className="w-[9vw] h-[9vw] rounded-full bg-gray-200 animate-pulse shadow-inner"></div>
                                            ) : (
                                                <div
                                                    className="w-[9vw] h-[9vw] rounded-full overflow-hidden relative shadow-inner z-10 bg-white flex items-center justify-center transition-colors duration-300"
                                                    style={{ backgroundColor: (profileUser?.picture && profileUser?.picture !== 'color_only') ? '#ffffff' : getAvatarColor(profileUser?.name || profileUser?.email, profileUser?.avatarBgColor) }}
                                                >
                                                    {(profileUser?.picture && profileUser?.picture !== 'color_only') ? (
                                                        <img
                                                            src={profileUser?.picture.startsWith('blob:') || profileUser?.picture.startsWith('data:') ? profileUser?.picture : resolveUploadsPath(profileUser?.picture)}
                                                            alt={profileUser?.name || "Profile Avatar"}
                                                            className="w-full h-full object-cover"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    ) : (
                                                        <span className="text-white text-[3.6vw] font-bold drop-shadow-md">
                                                            {profileUser?.name ? profileUser?.name.charAt(0).toUpperCase() : 'U'}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Creator Name */}
                                    <h2 className="text-[1.3vw] font-bold text-gray-900 mt-[0.6vw] text-center truncate max-w-full">
                                        {profileUser?.displayName || profileUser?.name || 'Creator'}
                                    </h2>

                                    {/* Subtitle / Company */}
                                    <p className="text-[0.75vw] text-gray-500 text-center font-normal truncate max-w-full mt-[0.1vw]">
                                        {profileUser?.companyName || profileUser?.professionalTitle || profileUser?.industryType || (profileUser?.email || profileUser?.emailId || 'Creator')}
                                    </p>

                                    {/* Verified Creator Badge */}
                                    <div className="mt-[0.5vw] inline-flex items-center gap-[0.3vw] px-[0.7vw] py-[0.2vw] bg-[#eaf8f0] text-[#16a34a] rounded-full text-[0.65vw] font-semibold">
                                        <Icon icon="solar:check-circle-bold" className="w-[0.85vw] h-[0.85vw] text-[#16a34a]" />
                                        <span>Verified Creator</span>
                                    </div>

                                    {/* Stats Row with Equal 3-Column Partitions */}
                                    <div className="grid grid-cols-3 w-full mt-[1.2vw] divide-x divide-gray-200">
                                        {/* Flipbooks */}
                                        <div className="flex flex-col items-center justify-center text-center px-[0.2vw]">
                                            <div className="flex items-center justify-center gap-[0.35vw]">
                                                <Icon icon="solar:book-2-linear" className="w-[0.95vw] h-[0.95vw] text-gray-800 flex-shrink-0" />
                                                <span className="text-[0.9vw] font-bold text-gray-900 leading-none">{books ? books.length : 0}</span>
                                            </div>
                                            <span className="text-[0.65vw] text-gray-500 font-normal mt-[0.35vw] leading-none whitespace-nowrap">Flipbooks</span>
                                        </div>

                                        {/* Followers */}
                                        <div className="flex flex-col items-center justify-center text-center px-[0.2vw]">
                                            <div className="flex items-center justify-center gap-[0.35vw]">
                                                <Icon icon="solar:users-group-rounded-linear" className="w-[0.95vw] h-[0.95vw] text-gray-800 flex-shrink-0" />
                                                <span className="text-[0.9vw] font-bold text-gray-900 leading-none">
                                                    {(() => {
                                                        const raw = profileUser?.followers;
                                                        const count = Array.isArray(raw) ? raw.length : (typeof raw === 'number' ? raw : parseFloat(raw) || 0);
                                                        if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                                                        if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                                                        return String(count || 0);
                                                    })()}
                                                </span>
                                            </div>
                                            <span className="text-[0.65vw] text-gray-500 font-normal mt-[0.35vw] leading-none whitespace-nowrap">Followers</span>
                                        </div>

                                        {/* Total Views */}
                                        <div className="flex flex-col items-center justify-center text-center px-[0.2vw]">
                                            <div className="flex items-center justify-center gap-[0.35vw]">
                                                <Icon icon="solar:eye-linear" className="w-[0.95vw] h-[0.95vw] text-gray-800 flex-shrink-0" />
                                                <span className="text-[0.9vw] font-bold text-gray-900 leading-none">
                                                    {(() => {
                                                        let totalViews = 0;
                                                        (books || []).forEach(b => {
                                                            const rawV = b.viewsCount ?? b.rawBook?.viewsCount ?? b.views ?? b.rawBook?.views ?? 0;
                                                            const str = String(rawV).trim();
                                                            if (/m/i.test(str)) {
                                                                totalViews += (parseFloat(str) || 0) * 1000000;
                                                            } else if (/k/i.test(str)) {
                                                                totalViews += (parseFloat(str) || 0) * 1000;
                                                            } else {
                                                                totalViews += parseFloat(str) || 0;
                                                            }
                                                        });

                                                        if (totalViews >= 1000000) {
                                                            return (totalViews / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                                                        }
                                                        if (totalViews >= 1000) {
                                                            return (totalViews / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                                                        }
                                                        return String(Math.round(totalViews) || 0);
                                                    })()}
                                                </span>
                                            </div>
                                            <span className="text-[0.65vw] text-gray-500 font-normal mt-[0.35vw] leading-none whitespace-nowrap">Total Views</span>
                                        </div>
                                    </div>

                                    {/* Follow Button */}
                                    <button
                                        onClick={handleToggleFollowModal}
                                        disabled={isFollowLoading}
                                        className={`w-full mt-[1.2vw] py-[0.6vw] rounded-full text-[0.85vw] font-semibold flex items-center justify-center gap-[0.45vw] shadow-sm transition-all cursor-pointer ${
                                            profileUser?.isFollowing
                                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
                                                : 'bg-[#ea543a] hover:bg-[#d9442a] text-white'
                                        }`}
                                    >
                                        {isFollowLoading ? (
                                            <Icon icon="line-md:loading-loop" className="w-[1vw] h-[1vw]" />
                                        ) : profileUser?.isFollowing ? (
                                            <>
                                                <Icon icon="solar:user-check-bold" className="w-[1.05vw] h-[1.05vw] text-emerald-600" />
                                                <span>Following</span>
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="solar:user-plus-bold" className="w-[1.05vw] h-[1.05vw]" />
                                                <span>Follow</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Contact With Me & Socials (Render ONLY if creator has added links) */}
                                    {(() => {
                                        const site = (profileUser?.website || profileUser?.socials?.website || '').trim();
                                        const hasWebsite = Boolean(site && site !== '#' && site !== 'null');

                                        const linkedin = (profileUser?.socials?.linkedin || profileUser?.linkedin || '').trim();
                                        const hasLinkedin = Boolean(linkedin && linkedin !== '#' && linkedin !== 'null');

                                        const instagram = (profileUser?.socials?.instagram || profileUser?.instagram || '').trim();
                                        const hasInstagram = Boolean(instagram && instagram !== '#' && instagram !== 'null');

                                        const facebook = (profileUser?.socials?.facebook || profileUser?.facebook || '').trim();
                                        const hasFacebook = Boolean(facebook && facebook !== '#' && facebook !== 'null');

                                        const whatsapp = (profileUser?.socials?.whatsapp || profileUser?.whatsapp || '').trim();
                                        const hasWhatsapp = Boolean(whatsapp && whatsapp !== '#' && whatsapp !== 'null');

                                        const hasAnySocial = hasWebsite || hasLinkedin || hasInstagram || hasFacebook || hasWhatsapp;
                                        if (!hasAnySocial) return null;

                                        return (
                                            <div className="w-full flex flex-col items-center mt-[1.2vw]">
                                                <span className="text-[0.75vw] font-semibold text-gray-800 mb-[0.6vw]">Contact With Me</span>
                                                <div className="flex items-center justify-center gap-[0.7vw] flex-wrap">
                                                    {/* Website */}
                                                    {hasWebsite && (
                                                        <a
                                                            href={site.startsWith('http') ? site : `https://${site}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-[1.8vw] h-[1.8vw] min-w-[28px] min-h-[28px] rounded-full flex items-center justify-center bg-gray-900 text-white hover:opacity-85 transition-opacity"
                                                            title={site}
                                                        >
                                                            <Icon icon="solar:global-linear" className="w-[1vw] h-[1vw]" />
                                                        </a>
                                                    )}
                                                    {/* LinkedIn */}
                                                    {hasLinkedin && (
                                                        <a
                                                            href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-[1.8vw] h-[1.8vw] min-w-[28px] min-h-[28px] rounded-full flex items-center justify-center bg-[#0a66c2] text-white hover:opacity-85 transition-opacity"
                                                            title={linkedin}
                                                        >
                                                            <Icon icon="ri:linkedin-fill" className="w-[1vw] h-[1vw]" />
                                                        </a>
                                                    )}
                                                    {/* Instagram */}
                                                    {hasInstagram && (
                                                        <a
                                                            href={instagram.startsWith('http') ? instagram : `https://${instagram}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-[1.8vw] h-[1.8vw] min-w-[28px] min-h-[28px] rounded-full flex items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:opacity-85 transition-opacity"
                                                            title={instagram}
                                                        >
                                                            <Icon icon="ri:instagram-fill" className="w-[1vw] h-[1vw]" />
                                                        </a>
                                                    )}
                                                    {/* Facebook */}
                                                    {hasFacebook && (
                                                        <a
                                                            href={facebook.startsWith('http') ? facebook : `https://${facebook}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-[1.8vw] h-[1.8vw] min-w-[28px] min-h-[28px] rounded-full flex items-center justify-center bg-[#1877f2] text-white hover:opacity-85 transition-opacity"
                                                            title={facebook}
                                                        >
                                                            <Icon icon="ri:facebook-fill" className="w-[1vw] h-[1vw]" />
                                                        </a>
                                                    )}
                                                    {/* WhatsApp */}
                                                    {hasWhatsapp && (
                                                        <a
                                                            href={whatsapp.startsWith('http') ? whatsapp : `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-[1.8vw] h-[1.8vw] min-w-[28px] min-h-[28px] rounded-full flex items-center justify-center bg-[#25d366] text-white hover:opacity-85 transition-opacity"
                                                            title={whatsapp}
                                                        >
                                                            <Icon icon="ri:whatsapp-fill" className="w-[1vw] h-[1vw]" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Right Column (Bio, Professional Details, Services, Location, Flipibooks OR View All) */}
                                <div className="flex-1 p-[1.8vw] flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar pr-[1.2vw] rounded-r-[0.9vw]">
                                    {isViewAll ? (
                                        /* Mode 2: View All Flipibooks */
                                        <div className="flex flex-col flex-1 h-full min-h-0">
                                            {/* Back Button */}
                                            <div className="mb-[0.8vw]">
                                                <button
                                                    onClick={() => setIsViewAll(false)}
                                                    className="flex items-center gap-[0.35vw] text-[#ea543a] hover:text-[#d9442a] text-[0.85vw] font-semibold cursor-pointer transition-colors"
                                                >
                                                    <Icon icon="solar:alt-arrow-left-linear" className="w-[1.05vw] h-[1.05vw]" />
                                                    <span>Back</span>
                                                </button>
                                            </div>

                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-[1.2vw]">
                                                <div className="flex items-center gap-[0.5vw]">
                                                    <Icon icon="solar:book-2-bold" className="w-[1.1vw] h-[1.1vw] text-gray-900" />
                                                    <h3 className="text-[0.95vw] font-bold text-gray-900">Flipibooks</h3>
                                                </div>

                                                {/* View Toggles */}
                                                <div className="flex items-center gap-[0.5vw]">
                                                    <button
                                                        onClick={() => setDisplayView('book')}
                                                        className={`flex items-center gap-[0.35vw] px-[0.7vw] py-[0.3vw] rounded-[0.4vw] text-[0.75vw] font-medium transition-all cursor-pointer border ${displayView === 'book' ? 'border-[#ea543a] text-[#ea543a] bg-white shadow-xs' : 'border-gray-200 text-gray-500 bg-white hover:text-gray-800'}`}
                                                    >
                                                        <Icon icon="solar:book-2-linear" className={`w-[0.9vw] h-[0.9vw] ${displayView === 'book' ? 'text-[#ea543a]' : 'text-gray-400'}`} />
                                                        <span>Book View</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setDisplayView('card')}
                                                        className={`flex items-center gap-[0.35vw] px-[0.7vw] py-[0.3vw] rounded-[0.4vw] text-[0.75vw] font-medium transition-all cursor-pointer border ${displayView === 'card' ? 'border-[#ea543a] text-[#ea543a] bg-white shadow-xs' : 'border-gray-200 text-gray-500 bg-white hover:text-gray-800'}`}
                                                    >
                                                        <Icon icon="solar:widget-2-linear" className={`w-[0.9vw] h-[0.9vw] ${displayView === 'card' ? 'text-[#ea543a]' : 'text-gray-400'}`} />
                                                        <span>Card View</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Books Grid */}
                                            {displayView === 'book' ? (
                                                <div className="grid grid-cols-6 gap-[1.2vw] pb-[1vw] items-end">
                                                    {books.map((book, bIdx) => (
                                                        <BookCoverItem
                                                            key={book.v_id || bIdx}
                                                            book={book}
                                                            onOpenBook={handleOpenBook}
                                                            backendUrl={backendUrl}
                                                            className="w-full"
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1.2vw] pb-[1vw]">
                                                    {books.map((book, bIdx) => (
                                                        <CreatorFlipbookCard
                                                            key={bIdx}
                                                            book={book}
                                                            creator={profileUser}
                                                            onOpenBook={handleOpenBook}
                                                            isFavorited={favoriteBookIds.includes(book.v_id || book.rawBook?.v_id)}
                                                            onToggleFavorite={handleToggleFavorite}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Mode 1: Normal View (Spacious layout with internal right-card scroll) */
                                        <div className="flex flex-col gap-[1.2vw] pb-[1vw]">
                                            {/* 1. About / Bio */}
                                            <div>
                                                <div className="flex items-center gap-[0.5vw]">
                                                    <Icon icon="solar:user-bold" className="w-[1.1vw] h-[1.1vw] text-gray-900" />
                                                    <h3 className="text-[0.95vw] font-bold text-gray-900">About / Bio</h3>
                                                </div>
                                                <p className="text-[0.78vw] text-gray-600 leading-relaxed mt-[0.5vw]">
                                                    {profileUser?.about || profileUser?.bio || "“Bring your content to life with a real, interactive experience”"}
                                                </p>
                                            </div>

                                            <div className="w-full h-[1px] bg-gray-100 my-[0.4vw]"></div>

                                            {/* 2. Professional Details (Dynamic based on Profile Type) */}
                                            <div>
                                                <div className="flex items-center gap-[0.5vw] mb-[0.7vw]">
                                                    <Icon icon="solar:case-round-bold" className="w-[1.1vw] h-[1.1vw] text-gray-900" />
                                                    <h3 className="text-[0.95vw] font-bold text-gray-900">Professional Details</h3>
                                                </div>
                                                {(() => {
                                                    const pType = (profileUser?.profileType || 'Individual').trim();
                                                    const normalizedType = pType.toLowerCase();
                                                    let professionalFields = [];

                                                    if (normalizedType === 'company') {
                                                        professionalFields = [
                                                            { label: 'Profile Type', value: 'Company' },
                                                            { label: 'Industry', value: profileUser?.industryType || profileUser?.industry || 'Not specified' },
                                                            { label: 'Company', value: profileUser?.companyName || profileUser?.businessName || 'Not specified' },
                                                            {
                                                                label: 'Company Email',
                                                                value: profileUser?.companyEmail || profileUser?.businessEmail || profileUser?.email || profileUser?.emailId || 'Not specified',
                                                                isEmail: true
                                                            },
                                                            { label: 'Company Size', value: profileUser?.companySize || 'Not specified' }
                                                        ];
                                                    } else if (normalizedType === 'agency') {
                                                        professionalFields = [
                                                            { label: 'Profile Type', value: 'Agency' },
                                                            { label: 'Industry', value: profileUser?.industryType || profileUser?.industry || 'Not specified' },
                                                            { label: 'Agency Name', value: profileUser?.agencyName || profileUser?.companyName || profileUser?.businessName || 'Not specified' },
                                                            {
                                                                label: 'Business Email',
                                                                value: profileUser?.businessEmail || profileUser?.companyEmail || profileUser?.email || profileUser?.emailId || 'Not specified',
                                                                isEmail: true
                                                            },
                                                            { label: 'Team Size', value: profileUser?.teamSize || profileUser?.companySize || 'Not specified' }
                                                        ];
                                                    } else if (normalizedType === 'freelancer') {
                                                        professionalFields = [
                                                            { label: 'Profile Type', value: 'Freelancer' },
                                                            { label: 'Industry', value: profileUser?.industryType || profileUser?.industry || 'Not specified' },
                                                            { label: 'Brand / Business', value: profileUser?.businessName || profileUser?.companyName || profileUser?.brandName || 'Not specified' },
                                                            { label: 'Experience', value: profileUser?.experience || 'Not specified' },
                                                            {
                                                                label: 'Business Email',
                                                                value: profileUser?.businessEmail || profileUser?.companyEmail || profileUser?.email || profileUser?.emailId || 'Not specified',
                                                                isEmail: true
                                                            }
                                                        ];
                                                    } else {
                                                        // Individual
                                                        professionalFields = [
                                                            { label: 'Profile Type', value: 'Individual' },
                                                            { label: 'Professional Title', value: profileUser?.professionalTitle || profileUser?.title || profileUser?.designation || profileUser?.role || 'Not specified' },
                                                            { label: 'Industry', value: profileUser?.industryType || profileUser?.industry || 'Not specified' }
                                                        ];
                                                        if (profileUser?.website || profileUser?.portfolio) {
                                                            professionalFields.push({
                                                                label: 'Portfolio / Website',
                                                                value: profileUser?.website || profileUser?.portfolio,
                                                                isLink: true
                                                            });
                                                        }
                                                    }

                                                    return (
                                                        <div className="flex items-center divide-x divide-gray-200 py-[0.2vw] w-full">
                                                            {professionalFields.map((field, fIdx) => (
                                                                <div key={fIdx} className="flex-1 px-[0.9vw] first:pl-0 last:pr-0 min-w-0">
                                                                    <p className="text-[0.7vw] text-gray-400 font-normal">{field.label}</p>
                                                                    {field.isEmail ? (
                                                                        field.value && field.value !== 'Not specified' ? (
                                                                            <a
                                                                                href={`mailto:${field.value}`}
                                                                                className="text-[0.78vw] text-[#2563eb] hover:underline font-medium mt-[0.25vw] truncate block max-w-[14vw]"
                                                                                title={field.value}
                                                                            >
                                                                                {field.value}
                                                                            </a>
                                                                        ) : (
                                                                            <p className="text-[0.78vw] text-gray-800 font-medium mt-[0.25vw] truncate">Not specified</p>
                                                                        )
                                                                    ) : field.isLink ? (
                                                                        field.value && field.value !== 'Not specified' ? (
                                                                            <a
                                                                                href={field.value.startsWith('http') ? field.value : `https://${field.value}`}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="text-[0.78vw] text-[#2563eb] hover:underline font-medium mt-[0.25vw] truncate block max-w-[14vw]"
                                                                                title={field.value}
                                                                            >
                                                                                {field.value}
                                                                            </a>
                                                                        ) : (
                                                                            <p className="text-[0.78vw] text-gray-800 font-medium mt-[0.25vw] truncate">Not specified</p>
                                                                        )
                                                                    ) : (
                                                                        <p className="text-[0.78vw] text-gray-800 font-medium mt-[0.25vw] truncate" title={field.value}>
                                                                            {field.value || 'Not specified'}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            <div className="w-full h-[1px] bg-gray-100 my-[0.4vw]"></div>

                                            {/* 3. Service & Expertise */}
                                            <div>
                                                <div className="flex items-center gap-[0.5vw] mb-[0.7vw]">
                                                    <Icon icon="solar:users-group-rounded-bold" className="w-[1.1vw] h-[1.1vw] text-gray-900" />
                                                    <h3 className="text-[0.95vw] font-bold text-gray-900">Service & Expertise</h3>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-[0.7vw]">
                                                    {(() => {
                                                        let sList = [];
                                                        if (Array.isArray(profileUser?.services) && profileUser.services.length > 0) {
                                                            sList = profileUser.services;
                                                        } else if (typeof profileUser?.services === 'string' && profileUser.services.trim()) {
                                                            sList = profileUser.services.split(',').map(s => s.trim()).filter(Boolean);
                                                        } else if (Array.isArray(profileUser?.skills) && profileUser.skills.length > 0) {
                                                            sList = profileUser.skills;
                                                        } else if (typeof profileUser?.skills === 'string' && profileUser.skills.trim()) {
                                                            sList = profileUser.skills.split(',').map(s => s.trim()).filter(Boolean);
                                                        }

                                                        if (sList.length === 0) {
                                                            return <span className="text-[0.78vw] text-gray-400">None specified</span>;
                                                        }

                                                        return sList.map((service, sIdx) => (
                                                            <span
                                                                key={sIdx}
                                                                className="px-[0.95vw] py-[0.35vw] rounded-full bg-[#fff1ee] text-[#ea543a] text-[0.75vw] font-medium border border-[#ffdcd6]"
                                                            >
                                                                {service}
                                                            </span>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>

                                            <div className="w-full h-[1px] bg-gray-100 my-[0.4vw]"></div>

                                            {/* 4. Location & Contact */}
                                            <div>
                                                <div className="flex items-center gap-[0.5vw] mb-[0.7vw]">
                                                    <Icon icon="solar:map-point-bold" className="w-[1.1vw] h-[1.1vw] text-gray-900" />
                                                    <h3 className="text-[0.95vw] font-bold text-gray-900">Location & Contact</h3>
                                                </div>
                                                <div className="flex items-start justify-between gap-[2vw]">
                                                    {/* Address */}
                                                    <div className="text-[0.78vw] text-gray-600 leading-relaxed">
                                                        {profileUser?.address1 && <p>{profileUser.address1}</p>}
                                                        {profileUser?.address2 && <p>{profileUser.address2}</p>}
                                                        {(profileUser?.city || profileUser?.pincode) && (
                                                            <p>{[profileUser?.city, profileUser?.pincode ? `- ${profileUser.pincode}` : ''].filter(Boolean).join(' ')}</p>
                                                        )}
                                                        {(profileUser?.state || (profileUser?.country && profileUser.country !== 'None' && profileUser.country !== 'INDIA')) && (
                                                            <p>{[profileUser?.state, (profileUser?.country && profileUser.country !== 'None' && profileUser.country !== 'INDIA') ? profileUser.country : ''].filter(Boolean).join(', ')}</p>
                                                        )}
                                                        {!profileUser?.address1 && !profileUser?.address2 && !profileUser?.city && !profileUser?.state && (
                                                            <p className="text-gray-400">Address not specified</p>
                                                        )}
                                                    </div>
                                                    {/* Contacts with proper labels */}
                                                    {(() => {
                                                        const contact1Val = profileUser?.contact1 || profileUser?.mobile;
                                                        const contact1LabelRaw = (profileUser?.contact1Label || '').trim();
                                                        const contact1Label = (contact1LabelRaw && !['contact 1', 'contact1'].includes(contact1LabelRaw.toLowerCase()))
                                                            ? contact1LabelRaw
                                                            : 'Mobile Number';

                                                        const contact2Val = profileUser?.contact2 || profileUser?.secondaryMobile;
                                                        const contact2LabelRaw = (profileUser?.contact2Label || '').trim();
                                                        const contact2Label = (contact2LabelRaw && !['contact 2', 'contact2'].includes(contact2LabelRaw.toLowerCase()))
                                                            ? contact2LabelRaw
                                                            : 'Secondary Mobile';

                                                        const contact3Val = profileUser?.contact3;
                                                        const contact3LabelRaw = (profileUser?.contact3Label || '').trim();
                                                        const contact3Label = (contact3LabelRaw && !['contact 3', 'contact3'].includes(contact3LabelRaw.toLowerCase()))
                                                            ? contact3LabelRaw
                                                            : 'Alternate Mobile';

                                                        return (
                                                            <div className="flex flex-col gap-[0.5vw] text-[0.78vw] min-w-[13vw]">
                                                                {contact1Val ? (
                                                                    <div className="flex items-center gap-[0.6vw]">
                                                                        <span className="text-[#ea543a] font-medium whitespace-nowrap">{contact1Label} :</span>
                                                                        <span className="text-gray-700">
                                                                            {(profileUser?.contact1CountryCode || profileUser?.countryCode || '+91')} {contact1Val}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-[0.6vw]">
                                                                        <span className="text-[#ea543a] font-medium whitespace-nowrap">{contact1Label} :</span>
                                                                        <span className="text-gray-400">Not specified</span>
                                                                    </div>
                                                                )}
                                                                {contact2Val && (
                                                                    <div className="flex items-center gap-[0.6vw]">
                                                                        <span className="text-[#ea543a] font-medium whitespace-nowrap">{contact2Label} :</span>
                                                                        <span className="text-gray-700">
                                                                            {(profileUser?.contact2CountryCode || '+91')} {contact2Val}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {contact3Val && (
                                                                    <div className="flex items-center gap-[0.6vw]">
                                                                        <span className="text-[#ea543a] font-medium whitespace-nowrap">{contact3Label} :</span>
                                                                        <span className="text-gray-700">
                                                                            {(profileUser?.contact3CountryCode || '+91')} {contact3Val}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            <div className="w-full h-[1px] bg-gray-100 my-[0.4vw]"></div>

                                            {/* 5. Flipibooks Bottom Row */}
                                            <div>
                                                {/* Header */}
                                                <div className="flex items-center justify-between mb-[0.9vw]">
                                                    <div className="flex items-center gap-[0.5vw]">
                                                        <Icon icon="solar:book-2-bold" className="w-[1.1vw] h-[1.1vw] text-gray-900" />
                                                        <h3 className="text-[0.95vw] font-bold text-gray-900">Flipibooks</h3>
                                                    </div>

                                                    {/* View Toggles */}
                                                    <div className="flex items-center gap-[0.5vw]">
                                                        <button
                                                            onClick={() => setDisplayView('book')}
                                                            className={`flex items-center gap-[0.35vw] px-[0.7vw] py-[0.3vw] rounded-[0.4vw] text-[0.75vw] font-medium transition-all cursor-pointer border ${displayView === 'book' ? 'border-[#ea543a] text-[#ea543a] bg-white shadow-xs' : 'border-gray-200 text-gray-500 bg-white hover:text-gray-800'}`}
                                                        >
                                                            <Icon icon="solar:book-2-linear" className={`w-[0.9vw] h-[0.9vw] ${displayView === 'book' ? 'text-[#ea543a]' : 'text-gray-400'}`} />
                                                            <span>Book View</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setDisplayView('card')}
                                                            className={`flex items-center gap-[0.35vw] px-[0.7vw] py-[0.3vw] rounded-[0.4vw] text-[0.75vw] font-medium transition-all cursor-pointer border ${displayView === 'card' ? 'border-[#ea543a] text-[#ea543a] bg-white shadow-xs' : 'border-gray-200 text-gray-500 bg-white hover:text-gray-800'}`}
                                                        >
                                                            <Icon icon="solar:widget-2-linear" className={`w-[0.9vw] h-[0.9vw] ${displayView === 'card' ? 'text-[#ea543a]' : 'text-gray-400'}`} />
                                                            <span>Card View</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Books Row */}
                                                {displayView === 'book' ? (
                                                    <div className="flex items-end justify-start gap-[2vw] pt-[0.4vw] pb-[0.8vw] overflow-x-auto custom-scrollbar">
                                                        {books.slice(0, 3).map((book, bIdx) => (
                                                            <BookCoverItem
                                                                key={book.v_id || bIdx}
                                                                book={book}
                                                                onOpenBook={handleOpenBook}
                                                                backendUrl={backendUrl}
                                                            />
                                                        ))}

                                                        {/* View All Flipbooks Button - Only if more than 3 books */}
                                                        {books.length > 3 && (
                                                            <div
                                                                onClick={() => setIsViewAll(true)}
                                                                className="flex flex-col items-center justify-center cursor-pointer group flex-shrink-0 px-[0.8vw] self-center ml-[0.6vw]"
                                                            >
                                                                <div className="w-[2.6vw] h-[2.6vw] rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#ea543a] group-hover:bg-[#ea543a] group-hover:text-white group-hover:scale-110 transition-all mb-[0.4vw]">
                                                                    <Icon icon="solar:alt-arrow-right-linear" className="w-[1.3vw] h-[1.3vw]" />
                                                                </div>
                                                                <span className="text-[0.72vw] text-gray-600 font-medium text-center leading-tight group-hover:text-gray-900 transition-colors whitespace-nowrap">
                                                                    View All<br />Flipbooks
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-start gap-[1.2vw] pt-[0.4vw] pb-[0.8vw]">
                                                        <div className="grid grid-cols-3 gap-[1vw] w-full">
                                                            {books.slice(0, 3).map((book, bIdx) => (
                                                                <CreatorFlipbookCard
                                                                    key={bIdx}
                                                                    book={book}
                                                                    creator={profileUser}
                                                                    onOpenBook={handleOpenBook}
                                                                    isFavorited={favoriteBookIds.includes(book.v_id || book.rawBook?.v_id)}
                                                                    onToggleFavorite={handleToggleFavorite}
                                                                />
                                                            ))}
                                                        </div>

                                                        {/* Center Bottom View More Flipbooks Button - Only if more than 3 books */}
                                                        {books.length > 3 && (
                                                            <div className="flex justify-center w-full pt-[0.2vw]">
                                                                <button
                                                                    onClick={() => setIsViewAll(true)}
                                                                    className="px-[1.6vw] py-[0.55vw] rounded-full border border-[#ea543a] text-[#ea543a] hover:bg-[#ea543a] hover:text-white text-[0.82vw] font-semibold flex items-center justify-center gap-[0.45vw] shadow-xs hover:shadow-md transition-all cursor-pointer group"
                                                                >
                                                                    <span>View More Flipbooks</span>
                                                                    <Icon icon="solar:alt-arrow-right-linear" className="w-[1vw] h-[1vw] group-hover:translate-x-0.5 transition-transform" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
