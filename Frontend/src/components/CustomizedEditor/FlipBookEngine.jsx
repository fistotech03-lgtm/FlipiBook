
/**
 * FlipBookEngine.jsx
 * ─────────────────────────────────────────────────────────────
External dependencies (served from /public/lib/ — no CDN needed):
 *   /lib/jquery.min.js
 *   /lib/turn.min.js
 */

import React, {
    useRef,
    useEffect,
    useLayoutEffect,
    useCallback,
    useState,
    forwardRef,
    useImperativeHandle,
    useMemo,
} from 'react';
import HTMLFlipBook from 'react-pageflip';
import { initGifRunner } from '../PageEditor/utils/AnimationRunner';
import { rewriteHtmlUploads } from '../../utils/assetUtils';
import { PageWindowManager, saveAllPagesToIDB, getPageFromIDB } from '../../utils/pageWindowStore';
import { usePageBuilderWorker } from '../../hooks/usePageBuilderWorker';
import { getOrRasterizePage, getCachedRaster, clearRasterCache, subscribeRasterCache } from '../../utils/pageRasterCache';

/* ─────────────────────────────── helpers ─────────────────────────────── */

const extractPageTexture = (rawContent, pageNum = '') => {
    if (!rawContent || typeof rawContent !== 'string') return null;
    let res = null;
    const trimmed = rawContent.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/') || trimmed.startsWith('/uploads/') || trimmed.startsWith('/storage/') || trimmed.startsWith('storage/') || trimmed.startsWith('blob:')) {
        res = trimmed;
    } else {
        // 1. Prefer explicit PDF/Document background layer image
        const pdfBgMatch = rawContent.match(/<g\b[^>]*data-type=["']pdf-vector-layer["'][^>]*>[\s\S]*?<image\b[^>]*(?:href|xlink:href)=["']([^"']+)["']/i);
        if (pdfBgMatch && pdfBgMatch[1]) {
            res = pdfBgMatch[1];
        } else {
            // Guard: If the SVG contains other visual components (<text>, <path>, <foreignObject>),
            // do not mistake an inner clip-art or child photo for the full-page texture!
            const hasOtherGraphics = /<text\b|<foreignObject\b|<path\b/i.test(rawContent);
            const match = rawContent.match(/<image\b[^>]*(?:href|xlink:href)=["']([^"']+)["']/i);
            if (match && match[1] && !hasOtherGraphics) {
                res = match[1];
            } else {
                const imgMatch = rawContent.match(/<img\b[^>]*src=["']([^"']+)["']/i);
                if (imgMatch && imgMatch[1] && !hasOtherGraphics) res = imgMatch[1];
            }
        }
    }
    return res;
};

const staticHtmlCache = new Map();
const cleanStaticHtml = (html) => {
    if (!html) return '';
    if (staticHtmlCache.has(html)) return staticHtmlCache.get(html);
    try {
        // Ultra-fast regex cleaning without allocating heavy DOMParser documents
        let cleaned = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '')
            .replace(/<g\b[^>]*data-type=["'](?:map|embed-frame)["'][^>]*>[\s\S]*?<\/g>/gi, '');

        // Ensure root SVG scales to 100% width and height
        cleaned = cleaned.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
            let updatedAttrs = attrs;
            if (!/viewBox=/i.test(updatedAttrs)) {
                const wMatch = updatedAttrs.match(/width=["']?(\d+(?:\.\d+)?)(?:px)?["']?/i);
                const hMatch = updatedAttrs.match(/height=["']?(\d+(?:\.\d+)?)(?:px)?["']?/i);
                if (wMatch && hMatch) {
                    updatedAttrs += ` viewBox="0 0 ${wMatch[1]} ${hMatch[1]}"`;
                }
            }
            updatedAttrs = updatedAttrs.replace(/\bwidth=["'][^"']*["']/i, 'width="100%"');
            updatedAttrs = updatedAttrs.replace(/\bheight=["'][^"']*["']/i, 'height="100%"');
            if (!/width="100%"/.test(updatedAttrs)) updatedAttrs += ' width="100%"';
            if (!/height="100%"/.test(updatedAttrs)) updatedAttrs += ' height="100%"';
            return `<svg ${updatedAttrs}>`;
        });

        if (staticHtmlCache.size > 200) staticHtmlCache.clear();
        staticHtmlCache.set(html, cleaned);
        return cleaned;
    } catch (e) {
        return html;
    }
};

const sanitizePageHtmlForPreview = (html) => {
    if (!html) return '';
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const rootSvg = doc.querySelector('svg');
        if (rootSvg) {
            const w = rootSvg.getAttribute('width');
            const h = rootSvg.getAttribute('height');
            const vb = rootSvg.getAttribute('viewBox');
            if (!vb && w && h && !w.includes('%') && !h.includes('%')) {
                const nw = parseFloat(w);
                const nh = parseFloat(h);
                if (!isNaN(nw) && !isNaN(nh)) {
                    rootSvg.setAttribute('viewBox', `0 0 ${nw} ${nh}`);
                }
            }
            rootSvg.setAttribute('width', '100%');
            rootSvg.setAttribute('height', '100%');
        }

        doc.querySelectorAll('iframe').forEach(iframe => {
            const fo = iframe.closest('foreignObject');
            const isMap = (fo && fo.getAttribute('data-type') === 'map') || iframe.closest('g[data-type="map"]') || iframe.closest('.map-root-container');
            const hideControls = (fo && fo.getAttribute('data-show-controls') === 'false') || iframe.getAttribute('data-show-controls') === 'false';

            const currentStyle = iframe.getAttribute('style') || '';
            if (isMap) {
                // Keep map iframe non-interactive so scroll/drag flips book pages without triggering "Use ctrl + scroll to zoom the map" overlay
                const cleanedStyle = currentStyle.replace(/pointer-events\s*:\s*(?:auto|none)\s*(?:!important)?\s*;?/gi, '');
                iframe.setAttribute('style', cleanedStyle + (cleanedStyle.endsWith(';') || !cleanedStyle ? '' : ';') + ' pointer-events: none !important;');
            } else if (currentStyle) {
                const cleanedStyle = currentStyle.replace(/pointer-events\s*:\s*none\s*(?:!important)?\s*;?/gi, '');
                iframe.setAttribute('style', cleanedStyle + (cleanedStyle.endsWith(';') || !cleanedStyle ? '' : ';') + ' pointer-events: auto !important;');
            }

            const src = iframe.getAttribute('src') || '';
            if (hideControls && (src.includes('youtube.com') || src.includes('youtu.be'))) {
                try {
                    const url = new URL(src);
                    url.searchParams.set('controls', '0');
                    iframe.setAttribute('src', url.toString());
                } catch (e) {
                    iframe.setAttribute('src', src.includes('controls=') ? src.replace(/controls=[^&"']+/i, 'controls=0') : `${src}${src.includes('?') ? '&' : '?'}controls=0`);
                }
            }

            iframe.setAttribute('allowfullscreen', 'true');
            const allow = iframe.getAttribute('allow') || '';
            if (!allow) {
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
            } else if (!allow.includes('fullscreen')) {
                iframe.setAttribute('allow', `${allow}; fullscreen`);
            }
        });

        return doc.body.innerHTML || html;
    } catch (e) {
        return html;
    }
};

const buildPageDoc = (rawHtml) => `<!DOCTYPE html>
<html>
<head>
<style>
  html, body {
    margin:0; padding:0; overflow:hidden; background:transparent; width:100%; height:100%;
    backface-visibility: hidden !important;
    -webkit-backface-visibility: hidden !important;
  }
  body > svg,
  svg:not(foreignObject svg):not([data-type="icon"]):not([data-type="button"] svg) {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    shape-rendering: geometricPrecision !important;
  }
  * { box-sizing: border-box; outline: none !important; }

  /* Ensure text inside contentEditable boxes and scrollable features wrap correctly */
  .text-edit-box,
  [contenteditable="true"],
  [data-scrollable="true"],
  foreignObject:not([data-type="map"]) div:not(.map-root-container):not(.map-card-overlay):not(.map-card-overlay *) {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
  }

  .map-nowrap,
  [data-nowrap="true"],
  .map-card-overlay .map-nowrap {
    white-space: nowrap !important;
    word-break: normal !important;
    overflow-wrap: normal !important;
  }

  foreignObject:not([data-type="map"]):not([data-type="embed-frame"]) {
    overflow: visible !important;
    clip-path: none !important;
  }

  foreignObject:not([data-type="map"]):not([data-type="embed-frame"]) * {
    clip-path: none !important;
  }

  foreignObject[data-type="map"],
  g[data-type="map"] foreignObject,
  .map-root-container {
    overflow: hidden !important;
  }

  .map-root-container,
  .embed-root-container,
  .table-card-wrapper,
  .table-container {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    position: relative !important;
    box-sizing: border-box !important;
  }

  .map-stage {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    overflow: hidden !important;
  }

  .map-stage iframe,
  .map-root-container iframe {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    border: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    pointer-events: none !important;
  }

  .map-open-maps-btn,
  .map-action-btn-circle,
  .map-card-overlay,
  .map-sheet-btn,
  .map-sheet-link-btn {
    pointer-events: auto !important;
  }

  foreignObject video {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    border: none !important;
    outline: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    pointer-events: auto !important;
  }
  foreignObject iframe {
    display: block !important;
    border: none !important;
    outline: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    pointer-events: auto !important;
    transform-origin: 0 0 !important;
  }

  foreignObject[data-type="video"] {
    overflow: hidden !important;
    pointer-events: auto !important;
  }

  foreignObject[data-type="video"] * {
    pointer-events: auto !important;
  }

  .flipbook-text-scrollbar::-webkit-scrollbar,
  [data-scrollable="true"]::-webkit-scrollbar,
  [data-scrollable="true"] *::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
    background: transparent !important;
    display: block !important;
    -webkit-appearance: none !important;
  }

  .flipbook-text-scrollbar::-webkit-scrollbar-track,
  [data-scrollable="true"]::-webkit-scrollbar-track,
  [data-scrollable="true"] *::-webkit-scrollbar-track {
    background: #E5E7EB !important;
    border-radius: 10px !important;
  }

  .flipbook-text-scrollbar::-webkit-scrollbar-thumb,
  [data-scrollable="true"]::-webkit-scrollbar-thumb,
  [data-scrollable="true"] *::-webkit-scrollbar-thumb {
    background: #4B5563 !important;
    border-radius: 10px !important;
    border: none !important;
  }

  .flipbook-text-scrollbar::-webkit-scrollbar-thumb:hover,
  [data-scrollable="true"]::-webkit-scrollbar-thumb:hover,
  [data-scrollable="true"] *::-webkit-scrollbar-thumb:hover {
    background: #374151 !important;
  }

  .flipbook-text-scrollbar::-webkit-scrollbar-thumb:active,
  [data-scrollable="true"]::-webkit-scrollbar-thumb:active,
  [data-scrollable="true"] *::-webkit-scrollbar-thumb:active {
    background: #1F2937 !important;
  }

  foreignObject:not([data-scrollable="true"]):not([data-editing="true"])>div:not(.map-root-container):not(.embed-root-container):not(.table-card-wrapper):not(.table-container) {
    width: 100% !important;
    height: auto !important;
  }

  foreignObject[data-sizing-mode="fixed"]>div {
    display: block !important;
  }

  foreignObject[data-scrollable="true"]>div {
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
    box-sizing: border-box !important;
    pointer-events: auto !important;
    -webkit-user-select: text !important;
    user-select: text !important;
  }

  foreignObject[data-scrollable="true"] * {
    -webkit-user-select: text !important;
    user-select: text !important;
    pointer-events: auto !important;
  }
</style>
</head>
<body>${rewriteHtmlUploads(sanitizePageHtmlForPreview(rawHtml || ''))}</body>
</html>`;

const scriptPromises = {};

const loadScript = (src) => {
    if (scriptPromises[src]) {
        return scriptPromises[src];
    }

    scriptPromises[src] = new Promise((resolve, reject) => {
        // If another script tag exists somehow, we might need to wait for it, 
        // but since we manage it here, we'll just create it.
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = resolve;
        s.onerror = () => {
            delete scriptPromises[src];
            reject(new Error(`Failed to load ${src}`));
        };
        document.head.appendChild(s);
    });

    return scriptPromises[src];
};

/* ─────────────────────────────── component ─────────────────────────────── */

const FlipPage = forwardRef(function FlipPage(props, ref) {
    const {
        className,
        style,
        children,
        'data-density': dataDensity,
        'data-page-index': dataPageIndex,
        onMouseDown,
        onMouseUp,
        onClick,
        pageNum,
        html,
        isPad,
        isTransparentSheet,
        textureStyle,
        singlePage,
        directionClass
    } = props;

    const [rasterUrl, setRasterUrl] = useState(() => getCachedRaster(pageNum));

    useEffect(() => {
        if (isPad) return;
        const current = getCachedRaster(pageNum);
        if (current && current !== rasterUrl) {
            setRasterUrl(current);
        }
        const unsubscribe = subscribeRasterCache((key, url) => {
            if (key === pageNum) {
                setRasterUrl(url);
            }
        });
        return unsubscribe;
    }, [pageNum, isPad, rasterUrl]);

    const staticContent = useMemo(() => {
        if (rasterUrl || !html || isPad) return null;
        return cleanStaticHtml(html);
    }, [rasterUrl, html, isPad]);

    return (
        <div
            ref={ref}
            data-density={dataDensity}
            data-page-index={dataPageIndex}
            className={className}
            style={style}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onClick={onClick}
        >
            {!isPad && (
                <>
                    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'inherit' }}>
                        <div
                            className="fbe-static-bg"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                overflow: 'hidden',
                                background: isTransparentSheet ? 'transparent' : '#fff',
                                borderRadius: 'inherit',
                                pointerEvents: 'none'
                            }}
                        >
                            {rasterUrl ? (
                                <img
                                    src={rasterUrl}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                                    alt={`Page ${pageNum}`}
                                />
                            ) : staticContent ? (
                                <div
                                    className="fbe-static-svg"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        pointerEvents: 'none',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: `<style>[data-name="Free Frame"] { stroke: transparent !important; } .fbe-static-svg svg { width: 100% !important; height: 100% !important; display: block !important; }</style>` + staticContent
                                    }}
                                />
                            ) : (
                                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isTransparentSheet ? 'transparent' : '#ffffff' }}>
                                    <div className="fbe-spinner" style={{ width: '26px', height: '26px', border: '2.5px solid rgba(234,114,51,0.2)', borderTopColor: '#ea7233', borderRadius: '50%', animation: 'fbe-spin 0.7s linear infinite' }} />
                                </div>
                            )}
                        </div>
                    </div>
                    {(!isTransparentSheet && textureStyle && (textureStyle.backgroundImage !== 'none' || textureStyle.backgroundColor)) && (
                        <div
                            className="absolute inset-0 z-10 pointer-events-none"
                            style={{
                                ...textureStyle,
                                borderRadius: 'inherit'
                            }}
                        />
                    )}
                    {singlePage ? (
                        <>
                            <div className="fbe-drag-overlay" style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '25px', zIndex: 20, cursor: 'grab', pointerEvents: 'auto' }} />
                            <div className="fbe-drag-overlay" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '25px', zIndex: 20, cursor: 'grab', pointerEvents: 'auto' }} />
                        </>
                    ) : (
                        <div
                            className="fbe-drag-overlay"
                            style={{ position: 'absolute', top: 0, bottom: 0, [directionClass]: 0, width: '25px', zIndex: 20, cursor: 'grab', pointerEvents: 'auto' }}
                        />
                    )}
                </>
            )}
        </div>
    );
});
FlipPage.displayName = 'FlipPage';

const pageDocCache = new Map();
const getCachedPageDoc = (builder, html, pageNum) => {
    if (!html) return '';
    const fn = builder || buildPageDoc;
    const cacheKey = `${pageNum}:${html.length}:${html.slice(0, 40)}`;
    if (pageDocCache.has(cacheKey)) {
        return pageDocCache.get(cacheKey);
    }
    const doc = fn(html, pageNum);
    if (pageDocCache.size > 200) pageDocCache.clear();
    pageDocCache.set(cacheKey, doc);
    return doc;
};

const checkTurnReady = ($book) => {
    if (!$book || !$book.length) return false;
    try {
        const d = $book.data();
        if (d && (d.totalPages || d.done)) return true;
        return Boolean($book.turn('pages'));
    } catch (_) {
        return false;
    }
};

const FlipBookEngine = forwardRef(function FlipBookEngine(
    {
        pages = [],
        v_id = null,          // Book ID — enables virtual sliding window + IDB per-page storage
        width = 400,
        height = 500,
        flipTime = 600,
        hardCovers = false,
        startPage = 0,
        onFlip,
        onTurning,
        autoplay = false,
        autoplayDuration = 3000,
        useMouseEvents = true,
        cornerEnable = true,
        makeFirstLastPageHard = false,
        selectCustomHardPages = false,
        customHardPages = [],
        cornerRadius = '0px',
        style = {},
        className = '',
        buildPageDoc: externalBuildPageDoc,
        activeLayout,
        flipStyle,
        textureStyle,
        pageOpacity,
        singlePage = false,
        hardCoverZoom,
    },
    ref
) {
    const containerRef = useRef(null); // DOM node for outer wrapper
    const bookEl = useRef(null);   // DOM node for turn.js
    const reactFlipRef = useRef(null);   // ref for react-pageflip
    const onFlipRef = useRef(onFlip); // always-current onFlip — avoids stale closure in turn.js
    const onTurningRef = useRef(onTurning);
    const queuedFlipRef = useRef(null);
    const [scriptsLoaded, setScriptsLoaded] = useState(() => Boolean(typeof window !== 'undefined' && window.jQuery?.fn?.turn));
    const [ready, setReady] = useState(() => Boolean(typeof window !== 'undefined' && window.jQuery?.fn?.turn));
    const buildPageDocRef = useRef(externalBuildPageDoc || buildPageDoc);
    useEffect(() => {
        buildPageDocRef.current = externalBuildPageDoc || buildPageDoc;
    }, [externalBuildPageDoc]);

    /* ── Virtual Sliding Window (Strategy 1) ──────────────────────────────
     * PageWindowManager keeps only WINDOW_SIZE pages in RAM.
     * When v_id is available, all pages are saved to IDB individually and
     * loaded on demand as the user flips or jumps.
     * When v_id is null (preview mode), falls back to full pages in memory.
     * ─────────────────────────────────────────────────────────────────────*/
    const windowManagerRef = useRef(null);
    const [isWindowLoading, setIsWindowLoading] = useState(false); // shimmer for random jumps

    // Initialise / re-initialise the window manager when v_id or pages change
    useEffect(() => {
        if (!v_id || pages.length === 0) return;

        const isNewBook = !windowManagerRef.current || windowManagerRef.current.v_id !== v_id;
        if (isNewBook) {
            windowManagerRef.current?.dispose();
            windowManagerRef.current = new PageWindowManager(v_id, pages.length, pages);
            // Persist all pages to IDB in background (batched, non-blocking)
            saveAllPagesToIDB(v_id, pages);
        } else {
            // On page update (edit/auto-save): update window manager's in-memory copy
            const mgr = windowManagerRef.current;
            mgr.totalPages = pages.length;
            pages.forEach((page, idx) => {
                // Only update pages that are currently in the window
                if (mgr.isInWindow(idx)) mgr.updatePage(idx, page);
            });
        }
    }, [v_id, pages]);

    // Cleanup on unmount
    useEffect(() => () => windowManagerRef.current?.dispose(), []);

    /* ── Web Worker for page-building (Strategy 2) ───────────────────────
     * buildPageDoc and cleanStaticHtml run in a background OS thread.
     * The main thread stays free for animations even during heavy SVG processing.
     * ─────────────────────────────────────────────────────────────────────*/
    const { buildDoc: workerBuildDoc } = usePageBuilderWorker(
        typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_BACKEND_URL || '') : ''
    );
    const [currentPage, setCurrentPage] = useState(startPage);
    const isFlippingRef = useRef(false);
    const [cloneUnderlay, setCloneUnderlay] = useState({ left: null, right: null });

    const [mobileShadowSide, setMobileShadowSide] = useState('left');
    const prevPageRef = useRef(currentPage);
    // Ref so in-place update effect can read currentPage without being a dep
    const currentPageRef = useRef(currentPage);
    useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

    // Subscribe to background WebP rasterization updates for legacy Turn.js fallback if active
    useEffect(() => {
        const unsubscribe = subscribeRasterCache((pageKey, url) => {
            try {
                const staticBg = bookEl.current?.querySelector(`.p${pageKey} .fbe-static-bg`);
                if (staticBg && (!staticBg.querySelector('img') || staticBg.querySelector('img')?.src !== url)) {
                    staticBg.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;" alt="Page ${pageKey}" />`;
                }
            } catch (_) {}
        });
        return unsubscribe;
    }, []);

    const [spreadView, setSpreadView] = useState(() => {
        if (singlePage) return [startPage + 1];
        const initialTurnPage = startPage + 1;
        if (initialTurnPage % 2 !== 0) {
            return [initialTurnPage - 1, initialTurnPage];
        } else {
            return [initialTurnPage, initialTurnPage + 1];
        }
    });

    // Guarantee the active spread overlay is never revealed with stale iframes:
    // Only remove flipping classes AFTER React has committed the new spreadView to the DOM
    useLayoutEffect(() => {
        isFlippingRef.current = false;
        if (containerRef.current) containerRef.current.classList.remove('fbe-is-dragging', 'fbe-is-turning', 'fbe-is-flipping');
        if (bookEl.current) bookEl.current.classList.remove('fbe-is-dragging', 'fbe-is-turning', 'fbe-is-flipping');
        document.querySelectorAll('.fbe-is-dragging, .fbe-is-turning, .fbe-is-flipping').forEach(el => el.classList.remove('fbe-is-dragging', 'fbe-is-turning', 'fbe-is-flipping'));
    }, [spreadView]);

    const leftIdx = singlePage 
        ? null 
        : (spreadView[0] > 0 ? spreadView[0] - 1 : null);
    const rightIdx = singlePage 
        ? (spreadView[0] > 0 ? spreadView[0] - 1 : 0)
        : (spreadView[1] > 0 ? spreadView[1] - 1 : null);

    useEffect(() => {
        if (!pages || pages.length === 0) return;
        
        const getNextSolidPage = (startIndex, direction) => {
            let idx = startIndex;
            while(idx >= 0 && idx < pages.length) {
                if (!pages[idx].isTransparentSheet && !pages[idx].isPad) {
                    return { page: pages[idx], index: idx };
                }
                idx += direction;
            }
            return null;
        };

        let leftInfo = null;
        let rightInfo = null;
        
        if (leftIdx !== null && leftIdx >= 0 && pages[leftIdx]?.isTransparentSheet) {
            leftInfo = getNextSolidPage(leftIdx - 1, -1);
            if (leftInfo) {
                const blurPercent = pages[leftIdx].sheetData?.blur ?? 100;
                leftInfo.blurPx = (blurPercent / 100) * 20;
            }
        }
        if (rightIdx !== null && rightIdx < pages.length && pages[rightIdx]?.isTransparentSheet) {
            rightInfo = getNextSolidPage(rightIdx + 1, 1);
            if (rightInfo) {
                const blurPercent = pages[rightIdx].sheetData?.blur ?? 100;
                rightInfo.blurPx = (blurPercent / 100) * 20;
            }
        }
        
        setCloneUnderlay(prev => {
            if (!leftInfo && !rightInfo && !prev.left && !prev.right) return prev;
            return { left: leftInfo, right: rightInfo };
        });
    }, [currentPage, pages, singlePage, leftIdx, rightIdx]);

    /* ── High-Performance Texture Renderer for 60fps GPU Turns ─────────── */
    const applyPageVisual = useCallback((staticBgEl, rawContent, pageNum) => {
        if (!staticBgEl) return;
        const isSkeleton = !rawContent || !rawContent.trim() || rawContent.includes('generateSkeletonPageSvg') || rawContent.includes('createDefaultPageData') || rawContent.includes('fbe-skeleton');
        
        // Guard already-loaded real texture from being wiped out by a skeleton or placeholder div
        if (isSkeleton) {
            const hasCompleteImg = staticBgEl.querySelector('img')?.complete && staticBgEl.querySelector('img')?.naturalWidth > 0;
            if (hasCompleteImg || (staticBgEl.getAttribute('data-loaded') === 'true' && !staticBgEl.getAttribute('data-placeholder'))) {
                return;
            }
        }

        const hasDirectContent = rawContent && !isSkeleton && rawContent.trim().length > 20;
        const fallbackTexture = (v_id && pageNum > 0 && !hasDirectContent) ? `/storage/books/${v_id}/pages/${pageNum}.webp` : null;
        const cached = getCachedRaster(pageNum, v_id);
        const texture = cached || (rawContent ? extractPageTexture(rawContent, pageNum) : null) || fallbackTexture;
        if (texture) {
            const existingImg = staticBgEl.querySelector('img');
            if (existingImg) {
                const rawCurrent = (existingImg.getAttribute('src') || existingImg.src || '').split('?')[0];
                const rawTexture = (texture || '').split('?')[0];
                const isSame = rawCurrent === rawTexture || 
                    (rawCurrent.endsWith(`/${pageNum}.webp`) && rawTexture.endsWith(`/${pageNum}.webp`)) ||
                    (rawCurrent.includes(`/pages/${pageNum}.webp`) && rawTexture.includes(`/pages/${pageNum}.webp`));
                
                if (isSame) {
                    const isImgLoaded = existingImg.complete && existingImg.naturalWidth > 0;
                    if (isImgLoaded) {
                        staticBgEl.setAttribute('data-loaded', 'true');
                        staticBgEl.removeAttribute('data-placeholder');
                        staticBgEl.removeAttribute('data-loading');
                        const loader = staticBgEl.querySelector('.fbe-page-loader');
                        if (loader) loader.style.display = 'none';
                        existingImg.style.opacity = '1';
                        return; // Already rendering this exact texture and verified loaded!
                    }
                    return;
                }

                // If existingImg is already present with a different src, preload in background before swapping
                // to prevent white flashing/blinking!
                const preloaderImg = new Image();
                preloaderImg.decoding = 'async';
                preloaderImg.onload = () => {
                    if (preloaderImg.naturalWidth > 0) {
                        existingImg.src = texture;
                        existingImg.style.opacity = '1';
                        staticBgEl.setAttribute('data-loaded', 'true');
                        staticBgEl.removeAttribute('data-placeholder');
                        staticBgEl.removeAttribute('data-loading');
                        const loader = staticBgEl.querySelector('.fbe-page-loader');
                        if (loader) loader.style.display = 'none';
                    }
                };
                preloaderImg.onerror = () => {
                    // Do not force broken image or retry loop
                };
                preloaderImg.src = texture;
                return;
            }
            staticBgEl.setAttribute('data-loading', 'true');
            staticBgEl.setAttribute('data-placeholder', 'true');
            const retryHandler = `onerror="this.style.display='none'; const p=this.parentElement; if(p){ const l=p.querySelector('.fbe-page-loader'); if(l) l.style.display='none'; p.removeAttribute('data-loading'); }"`;
            staticBgEl.innerHTML = `
                <div class="fbe-page-loader" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:transparent;z-index:2;pointer-events:none;">
                    <div class="fbe-spinner" style="width:26px;height:26px;border:2.5px solid rgba(234,114,51,0.2);border-top-color:#ea7233;border-radius:50%;animation:fbe-spin 0.7s linear infinite;"></div>
                </div>
                <img 
                    src="${texture}" 
                    onload="const p=this.parentElement;if(p){const l=p.querySelector('.fbe-page-loader');if(l)l.style.display='none';p.setAttribute('data-loaded','true');p.removeAttribute('data-placeholder');p.removeAttribute('data-loading');}this.style.opacity='1';" 
                    ${retryHandler} 
                    style="width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;user-select:none;-webkit-user-drag:none;position:relative;z-index:1;opacity:1;" 
                    alt="Page ${pageNum}" 
                    decoding="async" 
                />
            `;
            // If already complete from cache, dismiss loader immediately
            const newlyInsertedImg = staticBgEl.querySelector('img');
            if (newlyInsertedImg && newlyInsertedImg.complete && newlyInsertedImg.naturalWidth > 0) {
                const loader = staticBgEl.querySelector('.fbe-page-loader');
                if (loader) loader.style.display = 'none';
                staticBgEl.setAttribute('data-loaded', 'true');
                staticBgEl.removeAttribute('data-placeholder');
                staticBgEl.removeAttribute('data-loading');
            }
            return;
        }

        if (isSkeleton || !rawContent || !rawContent.trim()) {
            staticBgEl.setAttribute('data-placeholder', 'true');
            staticBgEl.removeAttribute('data-loaded');
            staticBgEl.innerHTML = `
                <div class="fbe-page-loader" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.92);z-index:2;pointer-events:none;">
                    <div class="fbe-spinner" style="width:26px;height:26px;border:2.5px solid rgba(234,114,51,0.2);border-top-color:#ea7233;border-radius:50%;animation:fbe-spin 0.7s linear infinite;"></div>
                </div>
            `;
            return;
        }

        const cleanSvg = cleanStaticHtml(rawContent);
        staticBgEl.innerHTML = `<style>[data-name="Free Frame"] { stroke: transparent !important; } .fbe-static-bg svg { width: 100% !important; height: 100% !important; display: block !important; }</style>` + cleanSvg;
        staticBgEl.setAttribute('data-loaded', 'true');
        staticBgEl.removeAttribute('data-placeholder');
    }, [v_id]);

    const prewarmedSetRef = useRef(new Set());
    // GPU Texture Pre-warmer: Pre-decodes upcoming/preceding 2 pages in background so turns are instant
    useEffect(() => {
        if (!pages || pages.length === 0) return;
        const radius = 2;
        const start = Math.max(0, currentPage - radius);
        const end = Math.min(pages.length - 1, currentPage + radius);

        for (let i = start; i <= end; i++) {
            const p = pages[i];
            if (!p || p.isPad) continue;
            const rawContent = p.html || p.content || '';
            if (!rawContent) continue;
            const texture = getCachedRaster(i + 1) || extractPageTexture(rawContent);
            if (texture && !prewarmedSetRef.current.has(texture)) {
                prewarmedSetRef.current.add(texture);
                const img = new Image();
                img.decoding = 'async';
                img.src = texture;
            }
        }
    }, [currentPage, pages]);



    useEffect(() => {
        if (!singlePage) return;

        const lastPageLogical = pages.length - (pages[pages.length - 1]?.isPad ? 2 : 1);
        const prev = prevPageRef.current;
        const current = currentPage;

        setMobileShadowSide(currentSide => {
            if (current === 0) return 'left';
            if (current >= lastPageLogical) return 'right';
            if (current > prev) return 'left';
            if (current < prev) return currentSide;
            return currentSide;
        });

        prevPageRef.current = current;
    }, [currentPage, singlePage, pages]);

    // Keep the ref in sync every render so turn.js always calls the latest onFlip
    useEffect(() => { onFlipRef.current = onFlip; }, [onFlip]);
    useEffect(() => { onTurningRef.current = onTurning; }, [onTurning]);

    const isProgrammaticRef = useRef(false);

    // Helper to focus the active iframe after a page turn, preventing the "first click is swallowed" bug
    const refocusActiveIframe = useCallback((logicalPage) => {
        try {
            if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
            const wrapper = document.querySelector('.fbe-wrapper');
            if (!wrapper) return;
            
            // Focus the active pages based on the logical page index
            const p1 = logicalPage + 1;
            const p2 = logicalPage + 2;
            const iframes = wrapper.querySelectorAll(`iframe[title="Page ${p1}"], iframe[title="Page ${p2}"]`);
            
            for (let i = 0; i < iframes.length; i++) {
                const iframe = iframes[i];
                iframe.focus();
                if (iframe.contentWindow) iframe.contentWindow.focus();
            }
        } catch (err) {}
    }, []);

    // The broken IFRAME_MOUSEMOVE listener was removed because it was blasting turn.js with invalid coordinates.

    /* ── Engine-selection logic ── */
    // Turn.js (Hardware-accelerated CSS3 3D Matrix / 60fps) handles all books (soft & hard cover)
    // with instant (0ms) clicks, true opaque double-sided pages, and realistic shadows
    const useFullTurnJs = true;

    const hasPages = Boolean(pages && pages.length > 0);
    const showingTurnJs = ready && useFullTurnJs && hasPages;
    const showingReactFlip = ready && !useFullTurnJs && hasPages;

    const augmentedPages = useMemo(() => {
        const arr = [...pages];
        return arr;
    }, [pages]);

    /* ── Memoize pages for react-pageflip to prevent iframe reloads ── */
    const memoizedReactPages = useMemo(() => {
        if (!showingReactFlip) return null;
        return augmentedPages.map((page, i) => {
            let isHardPage = false;

            if (makeFirstLastPageHard) {
                if (i === 0) isHardPage = true;
                if (augmentedPages.length % 2 === 0) {
                    if (i === augmentedPages.length - 1) isHardPage = true;
                }
            }

            if (selectCustomHardPages) {
                if ((customHardPages || []).includes(i)) isHardPage = true;
                // Pad after a custom hard page
                if (page.isPad && i > 0 && (customHardPages || []).includes(i - 1)) isHardPage = true;
            }

            if (!makeFirstLastPageHard && !selectCustomHardPages && hardCovers) {
                if (i === 0) isHardPage = true;
                if (augmentedPages.length % 2 === 0) {
                    if (i === augmentedPages.length - 1) isHardPage = true;
                }
            }

            let startX = 0;
            let startY = 0;
            
            const isLastPage = (i === augmentedPages.length - 1 || (i === augmentedPages.length - 2 && augmentedPages[i + 1]?.isPad));
            const directionClass = i % 2 === 0 ? 'right' : 'left';

            let sheetStyles = {};
            if (page.isTransparentSheet) {
                 sheetStyles = {
                     backgroundColor: 'rgba(236, 236, 236, 0.4)',
                     transform: 'translateZ(0)'
                 };
            } else {
                 sheetStyles = {
                     backgroundColor: page.isPad ? 'transparent' : '#fff',
                     opacity: pageOpacity
                 };
            }

            return (
                <FlipPage
                    key={i}
                    pageNum={i + 1}
                    html={page.html || page.content}
                    isPad={!!page.isPad}
                    isTransparentSheet={!!page.isTransparentSheet}
                    textureStyle={textureStyle}
                    singlePage={singlePage}
                    directionClass={directionClass}
                    data-page-index={i}
                    data-density={isHardPage ? 'hard' : 'soft'}
                    className={`fbe-react-page fbe-react-page--${directionClass} ${i === 0 ? 'fbe-page--first' : ''} ${isLastPage ? 'fbe-page--last' : ''}`}
                    style={{
                        ...sheetStyles
                    }}
                    onMouseDown={(e) => {
                        startX = e.clientX;
                        startY = e.clientY;
                    }}
                    onMouseUp={(e) => {
                        if (e.target.closest('.fbe-drag-overlay')) return;
                        const diffX = Math.abs(e.clientX - startX);
                        const diffY = Math.abs(e.clientY - startY);
                        if (diffX < 10 && diffY < 10) {
                            e.stopPropagation();
                        }
                    }}
                    onClick={(e) => {
                        if (e.target.closest('.fbe-drag-overlay')) return;
                        e.stopPropagation();
                    }}
                />
            );
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showingReactFlip, augmentedPages, makeFirstLastPageHard, selectCustomHardPages, customHardPages, hardCovers, cornerRadius, textureStyle, singlePage, pageOpacity]);

    /* ── High-Speed DOM Preloader from IndexedDB (Bypasses React Re-renders) ── */
    const preloadPageToDom = useCallback((pageNum) => {
        if (!v_id || pageNum < 1 || pageNum > augmentedPages.length) return;
        const pageIdx = pageNum - 1;

        let staticBg = staticBgElementsMapRef.current.get(pageNum);
        if (!staticBg && bookEl.current) {
            const pageEl = bookEl.current.querySelector(`.p${pageNum}`);
            staticBg = pageEl?.querySelector('.fbe-static-bg');
            if (staticBg) staticBgElementsMapRef.current.set(pageNum, staticBg);
        }
        if (!staticBg) return;

        // Only skip if real (non-placeholder) content has already been rendered
        const existingImg = staticBg.querySelector('img');
        const isAlreadyLoaded = staticBg.getAttribute('data-loaded') === 'true' && !staticBg.getAttribute('data-placeholder');
        if (isAlreadyLoaded || (existingImg && (existingImg.complete || staticBg.getAttribute('data-loaded') === 'true'))) return;

        // Check in-memory page content first (instant, 0ms)
        const memPage = augmentedPages[pageIdx];
        const memContent = memPage?.html || memPage?.content || '';
        const memIsPlaceholder = !memContent || memPage?.isPlaceholder || memContent.includes('generateSkeletonPageSvg') || memContent.includes('createDefaultPageData');
        const fallbackTexture = (v_id && pageNum > 0 && memIsPlaceholder) ? `/storage/books/${v_id}/pages/${pageNum}.webp` : null;
        const memTexture = getCachedRaster(pageNum, v_id) || extractPageTexture(memContent, pageNum) || memPage?.imageUrl || fallbackTexture;
        if (memTexture || !memIsPlaceholder) {
            applyPageVisual(staticBg, memContent || memTexture, pageNum);
            renderedContentMapRef.current.set(pageNum, `${pageNum}:${memTexture || ''}:${memContent.length}:${memPage?.sheetData ? JSON.stringify(memPage.sheetData) : ''}`);
            return;
        }

        getPageFromIDB(v_id, pageIdx).then((pageData) => {
            if (!pageData) return;
            const content = pageData.html || pageData.content || '';
            const idbIsPlaceholder = !content || pageData.isPlaceholder || content.includes('generateSkeletonPageSvg') || content.includes('createDefaultPageData');
            const texture = getCachedRaster(pageNum, v_id) || extractPageTexture(content, pageNum) || pageData.imageUrl || (idbIsPlaceholder ? fallbackTexture : null);
            if (texture && staticBg) {
                applyPageVisual(staticBg, content || texture, pageNum);
                renderedContentMapRef.current.set(pageNum, `${pageNum}:${texture}:${content.length}:${pageData.sheetData ? JSON.stringify(pageData.sheetData) : ''}`);
                return;
            }
            if (content && !idbIsPlaceholder && staticBg) {
                applyPageVisual(staticBg, content, pageNum);
                renderedContentMapRef.current.set(pageNum, `${pageNum}::${content.length}:${pageData.sheetData ? JSON.stringify(pageData.sheetData) : ''}`);
            }
        }).catch(() => {});
    }, [v_id, augmentedPages, applyPageVisual]);

    const preloadSurroundingPages = useCallback((centerPageNum) => {
        // Compute active double spread (both left and right page)
        const leftP = (centerPageNum % 2 === 0) ? centerPageNum : centerPageNum - 1;
        const rightP = (centerPageNum % 2 === 0) ? centerPageNum + 1 : centerPageNum;

        // Load both active spread pages together in parallel with top priority
        if (leftP >= 1 && leftP <= augmentedPages.length) {
            preloadPageToDom(leftP);
        }
        if (rightP >= 1 && rightP <= augmentedPages.length) {
            preloadPageToDom(rightP);
        }

        // Preload next upcoming spread and previous spread so flips are instantaneous
        [leftP - 2, leftP - 1, rightP + 1, rightP + 2].forEach(p => {
            if (p >= 1 && p <= augmentedPages.length) {
                preloadPageToDom(p);
            }
        });
    }, [augmentedPages.length, preloadPageToDom, v_id]);

    useEffect(() => {
        if (!ready || !v_id) return;
        const center = Math.max(1, currentPage + 1);
        preloadSurroundingPages(center);
    }, [currentPage, ready, v_id, preloadSurroundingPages]);

    /* ── Load Scripts from local /public/lib/ (no CDN) ── */
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                if (!window.jQuery) await loadScript('/lib/jquery.min.js');
                if (!window.jQuery?.fn?.turn) await loadScript('/lib/turn.min.js?v=15');
                if (alive) {
                    setScriptsLoaded(true);
                    setReady(true);
                }
            } catch (err) {
                console.error('[FlipBookEngine] Script load failed:', err);
            }
        })();

        // Global mouseup/touchend safeguard to ensure drag overlay class is removed if mouse is released outside
        const handleGlobalMouseUp = () => {
            if (containerRef.current) containerRef.current.classList.remove('fbe-is-dragging');
            if (bookEl.current) bookEl.current.classList.remove('fbe-is-dragging');
            document.querySelectorAll('.fbe-is-dragging').forEach(el => el.classList.remove('fbe-is-dragging'));
            document.querySelectorAll('.fbe-wrapper iframe, .fbe-book iframe').forEach(el => {
                el.style.pointerEvents = 'auto';
            });
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.addEventListener('touchend', handleGlobalMouseUp);

        return () => {
            alive = false;
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('touchend', handleGlobalMouseUp);
        };
    }, []);

    /* ── Preload Google Fonts into Parent Document for Static Background ── */
    useEffect(() => {
        const fontsToLoad = new Set();
        augmentedPages.forEach(page => {
            const html = page.html || page.content || '';
            const cssRegex = /font-family\s*:\s*(?:['"]([^'"]+)['"]|([^;}'"\s]+))/g;
            const attrRegex = /font-family\s*=\s*['"]([^'"]+)['"]/g;
            let match;
            while ((match = cssRegex.exec(html)) !== null) {
                let f = match[1] || match[2];
                if (f) f = f.split(',')[0].replace(/['"]/g, '').trim();
                if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
            }
            while ((match = attrRegex.exec(html)) !== null) {
                let f = match[1].split(',')[0].replace(/['"]/g, '').trim();
                if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
            }
        });

        if (fontsToLoad.size > 0) {
            const fontList = Array.from(fontsToLoad).map(f => f.replace(/\s+/g, '+')).join('|');
            const href = `https://fonts.googleapis.com/css?family=${fontList}:300,400,500,600,700,800,900&display=swap`;

            if (!document.querySelector(`link[href="${href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
            }
        }
    }, [augmentedPages]);

    /* ── Turn.js — "sheet" paper-curl for COVER PAGES only ── */
    const renderedContentMapRef = useRef(new Map());
    const staticBgElementsMapRef = useRef(new Map());

    // Lightweight structure key: triggers Turn.js re-initialization ONLY when page count or layout options change
    const structureKey = React.useMemo(() => {
        return [
            augmentedPages.length,
            singlePage ? '1' : '0',
            makeFirstLastPageHard ? '1' : '0',
            selectCustomHardPages ? '1' : '0',
            (customHardPages || []).join(','),
            hardCovers ? '1' : '0',
            flipStyle,
            flipTime,
            cornerRadius,
            useMouseEvents ? '1' : '0',
            textureStyle?.backgroundImage || '',
            textureStyle?.backgroundColor || ''
        ].join(':');
    }, [
        augmentedPages.length,
        singlePage,
        makeFirstLastPageHard,
        selectCustomHardPages,
        customHardPages,
        hardCovers,
        flipStyle,
        flipTime,
        cornerRadius,
        useMouseEvents,
        textureStyle?.backgroundImage,
        textureStyle?.backgroundColor
    ]);

    useEffect(() => {
        if (!ready || !bookEl.current || !pages.length || !window.jQuery?.fn?.turn || !useFullTurnJs) return;

        const $ = window.jQuery;
        const $book = $(bookEl.current);

        // ── Teardown: destroy old instance AND flush jQuery data ──────────
        // Without removeData(), stale $.data('turn.turn') causes widgetInterface
        // to treat the options object as a method name → TypeError on .apply().
        try {
            $book.find('*').addBack().each(function() {
                const elData = $(this).data();
                if (elData && elData.effect && elData.effect.handle) {
                    clearInterval(elData.effect.handle);
                    delete elData.effect;
                }
                try { $(this).turn('stop'); } catch (_) {}
            });
            const oldData = $book.data();
            if (oldData && oldData.pages) {
                // Wipe the pages from the old instance to neutralize leaked document closures in turn.js v3
                for (let k in oldData.pages) delete oldData.pages[k];
            }
            $book.turn('destroy');
        } catch (_) { /* noop */ }
        $book.off();          // unbind leaked $book listeners
        $book.removeData();   // wipe 'turn.turn' key so next init is always fresh
        $book.empty();

        // Clear signature & element cache on full rebuild
        renderedContentMapRef.current.clear();
        staticBgElementsMapRef.current.clear();

        // turn.js requires an even page count in double-display mode
        const augmented = augmentedPages;

        const initPage = Math.max(1, currentPage + 1);

        // Build page DOM elements using DocumentFragment for atomic 10x-50x faster insertion
        const pageFragment = document.createDocumentFragment();
        augmented.forEach((page, i) => {
            const pageDiv = document.createElement('div');

            // Determine if this specific page should be hard
            let isPageHard = false;

            // 1. First & Last (Covers only)
            if (makeFirstLastPageHard) {
                if (i === 0) isPageHard = true;
                if (augmented.length % 2 === 0) {
                    if (i === augmented.length - 1) isPageHard = true;
                }
            }

            // 2. Custom selected pages
            if (selectCustomHardPages) {
                if ((customHardPages || []).some(hp => Number(hp) === i)) isPageHard = true;
                if (page.isPad && i > 0 && (customHardPages || []).some(hp => Number(hp) === i - 1)) {
                    isPageHard = true;
                }
            }

            // 3. Fallback for master toggle
            if (!makeFirstLastPageHard && !selectCustomHardPages && hardCovers) {
                if (i === 0) isPageHard = true;
                if (augmented.length % 2 === 0) {
                    if (i === augmented.length - 1) isPageHard = true;
                }
            }

            // In turn.js, the "hard" class creates a rigid, non-curling fold. 
            // We use both 'hard' and 'cover' for maximum compatibility with custom patches.
            const isFirst = i === 0;
            const isLast = i === augmented.length - 1 || (i === augmented.length - 2 && augmented[i + 1]?.isPad);
            const positionClass = `${isFirst ? 'fbe-page--first' : ''} ${isLast ? 'fbe-page--last' : ''}`.trim();
            const directionClass = i % 2 === 0 ? 'right' : 'left';

            const pageNum = i + 1;

            if (isPageHard) {
                pageDiv.className = `hard cover fbe-page fbe-page--${directionClass} ${positionClass} p${pageNum}`;
                pageDiv.setAttribute('data-density', 'hard');
                pageDiv.style.backgroundColor = page.isTransparentSheet ? 'transparent' : '#ffffff';
                pageDiv.style.borderRadius = directionClass === 'right' ? `0 ${cornerRadius} ${cornerRadius} 0` : `${cornerRadius} 0 0 ${cornerRadius}`;
            } else {
                pageDiv.className = `fbe-page fbe-page--soft fbe-page--${directionClass} ${positionClass} p${pageNum}`;
                pageDiv.style.backgroundColor = page.isTransparentSheet ? 'transparent' : '#ffffff';
                pageDiv.style.borderRadius = directionClass === 'right' ? `0 ${cornerRadius} ${cornerRadius} 0` : `${cornerRadius} 0 0 ${cornerRadius}`;
            }
            pageDiv.setAttribute('data-page-num', pageNum);

            if (page.isTransparentSheet) {
                pageDiv.style.backgroundColor = 'rgba(236, 236, 236, 0.4)';
                pageDiv.style.transform = 'translateZ(0)';
            }

            if (!page.isPad) {
                const inner = document.createElement('div');
                inner.className = 'fbe-inner';
                inner.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden;background:#ffffff;';
                if (page.isTransparentSheet) inner.style.backgroundColor = 'transparent';

                const staticBg = document.createElement('div');
                staticBg.className = 'fbe-static-bg';
                const bgStyleColor = page.isTransparentSheet ? 'transparent' : '#fff';
                staticBg.style.cssText = `position:absolute;inset:0;width:100%;height:100%;overflow:hidden;background:${bgStyleColor};pointer-events:none;border-radius:inherit;`;

                const rawContent = page.html || page.content || '';
                const hasRealContent = rawContent && !rawContent.includes('generateSkeletonPageSvg') && !rawContent.includes('createDefaultPageData') && rawContent.trim().length > 20;
                const fallbackTexture = (v_id && pageNum > 0 && !hasRealContent) ? `/storage/books/${v_id}/pages/${pageNum}.webp` : null;
                const initTexture = extractPageTexture(rawContent, pageNum) || page.imageUrl || fallbackTexture || '';
                renderedContentMapRef.current.set(pageNum, `${pageNum}:${initTexture}:${rawContent.length}:${page.sheetData ? JSON.stringify(page.sheetData) : ''}`);

                // Populate page visual upfront ONLY for pages near current active window
                // (Prevents 100 parallel HTTP 404 image requests on large documents)
                const shouldWarmUp = pageNum <= 4 || Math.abs(pageNum - initPage) <= 3;
                if (shouldWarmUp) {
                    applyPageVisual(staticBg, rawContent || initTexture, pageNum);
                } else {
                    staticBg.setAttribute('data-unloaded', 'true');
                    staticBg.setAttribute('data-loading', 'true');
                    staticBg.setAttribute('data-placeholder', 'true');
                }
                staticBgElementsMapRef.current.set(pageNum, staticBg);
                inner.appendChild(staticBg);

                // Add texture overlay
                if (!page.isTransparentSheet && textureStyle && (textureStyle.backgroundImage !== 'none' || textureStyle.backgroundColor)) {
                    const textureOverlay = document.createElement('div');
                    textureOverlay.className = 'fbe-texture-overlay';
                    Object.assign(textureOverlay.style, {
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        pointerEvents: 'none',
                        borderRadius: 'inherit',
                        ...textureStyle
                    });
                    inner.appendChild(textureOverlay);
                }

                pageDiv.appendChild(inner);
            } else {
                // Invisible pad page
                pageDiv.style.cssText = 'opacity:0;pointer-events:none;background:transparent;';
            }

            pageFragment.appendChild(pageDiv);
        });
        bookEl.current.appendChild(pageFragment);

        // ── Initialize turn.js ──────────────────────────────────────────
        const totalPages = augmented.length;

        $book.turn({
            width: singlePage ? width : width * 2,
            height,
            display: singlePage ? 'single' : 'double',
            duration: (typeof flipTime === 'number' && flipTime > 50) ? flipTime : 450,
            acceleration: true, // GPU compositor handles CSS3 flip — frees the JS main thread during animation
            gradients: true, // Native Turn.js lighting and depth gradients for realistic paper folding
            cornerSize: 80, // Generous 80px corner target for smooth, natural paper peel
            elevation: 0, // 0px elevation ensures 1:1 smooth corner peel tracking with mouse cursor without sudden snapping
            pages: totalPages,
            page: initPage,
            autoCenter: false,
            when: {
                start: (e, pageObject, corner) => {
                    isFlippingRef.current = true;
                    if (containerRef.current) containerRef.current.classList.add('fbe-is-dragging', 'fbe-is-turning', 'fbe-is-flipping');
                    if (bookEl.current) bookEl.current.classList.add('fbe-is-dragging', 'fbe-is-turning', 'fbe-is-flipping');

                    // Prevent peel animation for the last page of an odd-numbered flipbook
                    if (!singlePage && augmented.length % 2 !== 0) {
                        if (pageObject && pageObject.page === augmented.length && (corner === 'r' || corner === 'tr' || corner === 'br')) {
                            e.preventDefault();
                        }
                    }
                },
                end: (e, pageObject, turned) => {
                    if (!turned) {
                        isFlippingRef.current = false;
                    }
                    if (containerRef.current) containerRef.current.classList.remove('fbe-is-dragging', 'fbe-is-turning', 'fbe-is-flipping');
                    if (bookEl.current) {
                        bookEl.current.classList.remove('fbe-is-dragging', 'fbe-is-turning', 'fbe-is-flipping');
                        if (window.jQuery) {
                            const $b = window.jQuery(bookEl.current);
                            const tData = $b.data();
                            if (tData?.fparent) {
                                tData.fparent.data().flips = 0;
                                tData.fparent.hide();
                            }
                            if (tData?.pageObjs) {
                                for (const p in tData.pageObjs) {
                                    if (tData.pageObjs[p]) {
                                        const pData = tData.pages && tData.pages[p] && tData.pages[p].data() ? tData.pages[p].data().f : null;
                                        const targetParent = (pData && pData.wrapper) ? pData.wrapper : (tData.pageWrap && tData.pageWrap[p]);
                                        if (targetParent && tData.pageObjs[p].parent()[0] !== targetParent[0]) {
                                            targetParent.prepend(tData.pageObjs[p]);
                                        }
                                        const domEl = tData.pageObjs[p][0];
                                        if (domEl) {
                                            domEl.style.transform = '';
                                            domEl.style.webkitTransform = '';
                                            domEl.style.transformOrigin = '';
                                            domEl.style.webkitTransformOrigin = '';
                                        }
                                        if (pData?.wrapper?.[0]) {
                                            pData.wrapper[0].style.transform = '';
                                            pData.wrapper[0].style.webkitTransform = '';
                                            pData.wrapper[0].style.transformOrigin = '';
                                            pData.wrapper[0].style.webkitTransformOrigin = '';
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                turning: (e, turnPage) => {
                    // Prevent turning past the last page in odd-numbered flipbooks
                    if (!singlePage && augmented.length % 2 !== 0 && turnPage > augmented.length) {
                        e.preventDefault();
                        return false;
                    }
                    isFlippingRef.current = true;
                    if (containerRef.current) containerRef.current.classList.add('fbe-is-turning', 'fbe-is-flipping');
                    if (bookEl.current) bookEl.current.classList.add('fbe-is-turning', 'fbe-is-flipping');

                    // Preload upcoming & surrounding pages into DOM ahead of animation landing
                    preloadSurroundingPages(turnPage);

                    const logical = turnPage - 1;
                    if (onTurningRef.current) onTurningRef.current({ data: logical });
                },
                turned: (_e, turnPage, view) => {
                    const activeView = view || (singlePage ? [turnPage] : (turnPage % 2 === 0 ? [turnPage, turnPage + 1] : [turnPage - 1, turnPage]));
                    const logical = turnPage - 1;

                    // Ensure prevStartPageRef tracks this turn so external sync doesn't re-trigger a jump
                    prevStartPageRef.current = logical;

                    // Ensure buffer pages ahead in direction are preloaded
                    preloadSurroundingPages(turnPage);

                    // Clean up any stray folding wrappers to guarantee 0 stuck rotated pages
                    if (bookEl.current && window.jQuery) {
                        const $b = window.jQuery(bookEl.current);
                        const tData = $b.data();
                        if (tData?.fparent) {
                            tData.fparent.data().flips = 0;
                            tData.fparent.hide();
                        }
                        if (tData?.pageObjs) {
                            for (const p in tData.pageObjs) {
                                if (tData.pageObjs[p]) {
                                    const pData = tData.pages && tData.pages[p] && tData.pages[p].data() ? tData.pages[p].data().f : null;
                                    const targetParent = (pData && pData.wrapper) ? pData.wrapper : (tData.pageWrap && tData.pageWrap[p]);
                                    if (targetParent && tData.pageObjs[p].parent()[0] !== targetParent[0]) {
                                        targetParent.prepend(tData.pageObjs[p]);
                                    }
                                    const domEl = tData.pageObjs[p][0];
                                    if (domEl) {
                                        domEl.style.transform = '';
                                        domEl.style.webkitTransform = '';
                                        domEl.style.transformOrigin = '';
                                        domEl.style.webkitTransformOrigin = '';
                                    }
                                    if (pData?.wrapper?.[0]) {
                                        pData.wrapper[0].style.transform = '';
                                        pData.wrapper[0].style.webkitTransform = '';
                                        pData.wrapper[0].style.transformOrigin = '';
                                        pData.wrapper[0].style.webkitTransformOrigin = '';
                                    }
                                }
                            }
                        }
                    }

                    // Update spreadView and currentPage together.
                    setSpreadView(activeView);
                    setCurrentPage(logical);
                    if (onFlipRef.current) onFlipRef.current({ data: logical });

                    // Execute queued rapid flip with full smooth page turn animation
                    if (queuedFlipRef.current && bookEl.current && window.jQuery) {
                        const queued = queuedFlipRef.current;
                        queuedFlipRef.current = null;
                        const $b = window.jQuery(bookEl.current);
                        setTimeout(() => {
                            if (!$b.turn('animating')) {
                                if (queued === 'next') $b.turn('next');
                                else if (queued === 'prev') $b.turn('previous');
                            }
                        }, 50);
                    }
                },
            },
        });

        if (!useMouseEvents) $book.turn('disable', true);

        // Warm up initial cover and first spread (Pages 1, 2, 3) from IDB for instant opening
        [initPage, initPage + 1, initPage + 2].forEach(p => preloadPageToDom(p));

        return () => {
            try {
                $book.find('*').addBack().each(function() {
                    const elData = $(this).data();
                    if (elData && elData.effect) {
                        if (elData.effect.handle) clearInterval(elData.effect.handle);
                        if (elData.effect.raf) cancelAnimationFrame(elData.effect.raf);
                        delete elData.effect;
                    }
                    try { $(this).turn('stop'); } catch (_) {}
                });
                $book.turn('destroy');
            } catch (_) { /* noop */ }
            $book.off();
            $book.removeData();
            $book.empty();
            staticBgElementsMapRef.current.clear();
        };
        // onFlip and buildPageDoc captured in stable refs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, scriptsLoaded, structureKey, useFullTurnJs]);

    // In-place content update effect for Turn.js pages (no teardown, zero freeze)
    useEffect(() => {
        if (!ready || !bookEl.current || !window.jQuery || !useFullTurnJs) return;
        const $book = window.jQuery(bookEl.current);
        const isTurnReady = checkTurnReady($book);
        if (!isTurnReady) return;

        augmentedPages.forEach((page, i) => {
            const pageNum = i + 1;
            const currentContent = page.html || page.content || '';
            const hasRealCurrentContent = currentContent && !currentContent.includes('generateSkeletonPageSvg') && !currentContent.includes('createDefaultPageData') && currentContent.trim().length > 20;
            const fallbackTexture = (v_id && pageNum > 0 && !hasRealCurrentContent) ? `/storage/books/${v_id}/pages/${pageNum}.webp` : null;
            const textureUrl = extractPageTexture(currentContent, pageNum) || page.imageUrl || fallbackTexture || '';
            const sheetKey = page.sheetData ? JSON.stringify(page.sheetData) : '';
            const contentSig = `${pageNum}:${textureUrl}:${currentContent.length}:${sheetKey}`;
            const prevSig = renderedContentMapRef.current.get(pageNum);

            if (prevSig === contentSig) return; // Unchanged

            renderedContentMapRef.current.set(pageNum, contentSig);

            // O(1) direct reference lookup from Map (no DOM queries!)
            let staticBg = staticBgElementsMapRef.current.get(pageNum);
            if (!staticBg) {
                const pageEl = bookEl.current.querySelector(`.p${pageNum}`);
                staticBg = pageEl?.querySelector('.fbe-static-bg');
                if (staticBg) staticBgElementsMapRef.current.set(pageNum, staticBg);
            }

            if (staticBg) {
                const isNearCurrent = Math.abs(pageNum - (currentPage + 1)) <= 3;
                if (isNearCurrent || staticBg.getAttribute('data-loaded') === 'true') {
                    applyPageVisual(staticBg, currentContent || textureUrl, pageNum);
                }
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [augmentedPages, ready, useFullTurnJs, applyPageVisual]);

    /* ── Handle Window / Container Resize dynamically ── */
    useEffect(() => {
        if (ready && bookEl.current && window.jQuery?.fn?.turn && useFullTurnJs) {
            try {
                window.jQuery(bookEl.current).turn('size', singlePage ? width : width * 2, height);
            } catch (e) { /* ignore */ }
        }
    }, [width, height, singlePage, ready, useFullTurnJs]);

    const lastFlipTimeRef = useRef(0);

    const flipNextFn = useCallback(() => {
        if (document.activeElement) document.activeElement.blur();
        
        // Block auto-turning past the last page if the pages count is odd
        if (!singlePage && pages.length % 2 !== 0 && currentPage >= pages.length - 2) {
            return;
        }

        const now = Date.now();
        if (now - lastFlipTimeRef.current < 350) return;
        lastFlipTimeRef.current = now;

        isProgrammaticRef.current = true;
        if (showingTurnJs && bookEl.current && window.jQuery) {
            const $book = window.jQuery(bookEl.current);
            const isTurnReady = checkTurnReady($book);
            if (isTurnReady) {
                // If a corner fold or peel is uncommitted, dismiss it immediately so button turns instantly
                $book.find('.turn-page').each(function() {
                    const $p = window.jQuery(this);
                    if ($p.data()?.f?.point) {
                        try { $p.flip('hide'); } catch (_) {}
                    }
                });

                if ($book.turn('animating')) {
                    queuedFlipRef.current = 'next';
                    return;
                }
                queuedFlipRef.current = null;
                $book.turn('next');
            }
        } else if (showingReactFlip && reactFlipRef.current) {
            reactFlipRef.current.pageFlip().flipNext();
        }
        setTimeout(() => isProgrammaticRef.current = false, 50);
    }, [showingTurnJs, showingReactFlip, pages.length, singlePage, currentPage]);

    const flipPrevFn = useCallback(() => {
        if (document.activeElement) document.activeElement.blur();

        const now = Date.now();
        if (now - lastFlipTimeRef.current < 350) return;
        lastFlipTimeRef.current = now;

        isProgrammaticRef.current = true;
        if (showingTurnJs && bookEl.current && window.jQuery) {
            const $book = window.jQuery(bookEl.current);
            const isTurnReady = checkTurnReady($book);
            if (isTurnReady) {
                // If a corner fold or peel is uncommitted, dismiss it immediately so button turns instantly
                $book.find('.turn-page').each(function() {
                    const $p = window.jQuery(this);
                    if ($p.data()?.f?.point) {
                        try { $p.flip('hide'); } catch (_) {}
                    }
                });

                if ($book.turn('animating')) {
                    queuedFlipRef.current = 'prev';
                    return;
                }
                queuedFlipRef.current = null;
                $book.turn('previous');
            }
        } else if (showingReactFlip && reactFlipRef.current) {
            reactFlipRef.current.pageFlip().flipPrev();
        }
        setTimeout(() => isProgrammaticRef.current = false, 50);
    }, [showingTurnJs, showingReactFlip]);

    const flipToPageFn = useCallback((idx) => {
        isProgrammaticRef.current = true;
        const wantedPage = idx + 1;
        if (showingTurnJs && bookEl.current && window.jQuery) {
            const $book = window.jQuery(bookEl.current);
            const isTurnReady = checkTurnReady($book);
            if (isTurnReady) {
                if ($book.turn('animating')) {
                    try {
                        $book.find('.turn-page').each(function() {
                            try { window.jQuery(this).flip('hide'); } catch (_) {}
                        });
                        $book.turn('stop');
                    } catch (_) {}
                }
                $book.turn('page', wantedPage);
            }
        } else if (reactFlipRef.current) {
            reactFlipRef.current.pageFlip().turnToPage(idx);
        }
        setTimeout(() => isProgrammaticRef.current = false, 50);
    }, [showingTurnJs]);

    useImperativeHandle(ref, () => ({
        flipNext: flipNextFn,
        flipPrev: flipPrevFn,
        flipToPage: flipToPageFn,
        getCurrentPageIndex: () => currentPage,
        isAnimating: () => isFlippingRef.current || (bookEl.current && window.jQuery && window.jQuery(bookEl.current).turn('animating')),
        pageFlip: () => ({
            flipNext: flipNextFn,
            flipPrev: flipPrevFn,
            turnToPage: flipToPageFn,
            getCurrentPageIndex: () => currentPage + 1,
            isAnimating: () => isFlippingRef.current || (bookEl.current && window.jQuery && window.jQuery(bookEl.current).turn('animating')),
        }),
    }), [flipNextFn, flipPrevFn, flipToPageFn, currentPage]);

    /* ── Sync turn.js when target/start page changes externally (thumbnails, direct jump) ── */
    const prevStartPageRef = useRef(startPage);
    useEffect(() => {
        if (!showingTurnJs || !bookEl.current || !window.jQuery) return;
        // Only trigger turn if startPage was explicitly changed from outside!
        if (prevStartPageRef.current === startPage) return;
        prevStartPageRef.current = startPage;

        const $book = window.jQuery(bookEl.current);
        const isTurnReady = checkTurnReady($book);
        if (!isTurnReady) return;

        const totalP = augmentedPages.length || pages.length;
        if (totalP === 0) return;
        const wantedPage = Math.max(1, Math.min(totalP, startPage + 1));
        
        // If current spread already displays wantedPage, do NOT trigger another turn!
        const currentView = $book.turn('view');
        if (Array.isArray(currentView) && currentView.includes(wantedPage)) {
            setCurrentPage(startPage);
            return;
        }

        const currentTurnPage = $book.turn('page');
        if (currentTurnPage === wantedPage) {
            setCurrentPage(startPage);
            return;
        }

        // Finish any in-progress flip cleanly before jumping
        if ($book.turn('animating')) {
            try {
                $book.find('.turn-page').each(function() {
                    try { window.jQuery(this).flip('hide'); } catch (_) {}
                });
                $book.turn('stop');
            } catch (_) {}
        }

        $book.turn('page', wantedPage);
        setCurrentPage(startPage);
    }, [startPage, showingTurnJs, augmentedPages.length, pages.length]);

    /* ── Sync turn.js size when width/height change dynamically ── */
    useEffect(() => {
        if (!showingTurnJs || !bookEl.current || !window.jQuery) return;
        const $book = window.jQuery(bookEl.current);
        const isTurnReady = checkTurnReady($book);
        if (isTurnReady) {
            $book.turn('size', singlePage ? width : width * 2, height);
        }
    }, [width, height, singlePage, showingTurnJs]);

    /* ── Sync react-pageflip size when width/height change dynamically ── */
    useEffect(() => {
        if (!showingReactFlip || !reactFlipRef.current) return;
        const pageFlip = reactFlipRef.current.pageFlip();
        if (pageFlip && typeof pageFlip.update === 'function') {
            // In 'stretch' mode, calling update() forces it to read the new container size
            pageFlip.update();
        }
    }, [width, height, showingReactFlip]);

    /* ── Sync react-pageflip when startPage changes externally (thumbnails, direct jump) ── */
    useEffect(() => {
        if (!showingReactFlip || !reactFlipRef.current) return;
        const pageFlip = reactFlipRef.current.pageFlip();
        if (!pageFlip) return;
        const cur = pageFlip.getCurrentPageIndex();
        if (cur !== startPage && !isFlippingRef.current) {
            try {
                pageFlip.turnToPage(startPage);
                setCurrentPage(startPage);
            } catch (_) {}
        }
    }, [startPage, showingReactFlip]);

    /* ── Autoplay ── */
    useEffect(() => {
        if (!autoplay || !ready) return;
        const timer = setInterval(flipNextFn, autoplayDuration);
        return () => clearInterval(timer);
    }, [autoplay, autoplayDuration, ready, flipNextFn]);

    // Purge cached textures whenever book identity changes to prevent cross-book content leaks
    useEffect(() => {
        if (v_id) {
            clearRasterCache(v_id);
        }
    }, [v_id]);

    const bookTransition = `transform ${(typeof flipTime === 'number' && flipTime >= 200) ? Math.min(1000, flipTime) : 600}ms ease`;

    const handleContainerMouseLeave = () => {
        if (!bookEl.current || isFlippingRef.current) return;
        if (bookEl.current.classList.contains('fbe-is-dragging') || 
            bookEl.current.classList.contains('fbe-is-turning') || 
            bookEl.current.classList.contains('fbe-is-flipping')) return;

        if (window.jQuery && bookEl.current) {
            const $ = window.jQuery;
            const $book = $(bookEl.current);
            if ($book.turn('animating')) return;

            $book.find('.turn-page').each(function() {
                const pageData = $(this).data('f');
                if (pageData && !$(this).flip('isTurning')) {
                    try { $(this).flip('hideFoldedPage', true); } catch (err) {}
                }
            });
        }
    };

    /* ── Render ── */
    return (
        <div
            ref={containerRef}
            className={`fbe-wrapper ${className}`}
            data-single-page={singlePage}
            data-mobile-shadow={mobileShadowSide}
            onMouseLeave={handleContainerMouseLeave}
            style={{
                width: singlePage ? width : width * 2, height, position: 'relative',
                background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...style,
                opacity: pageOpacity ?? 1,
            }}
        >
            <style>{`
                .fbe-is-dragging iframe, .fbe-is-turning iframe, .fbe-is-flipping iframe {
                    pointer-events: none !important;
                }
                .fbe-is-flipping .fbe-active-spread-overlay,
                .fbe-is-turning .fbe-active-spread-overlay,
                .fbe-is-dragging .fbe-active-spread-overlay {
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    transition: none !important;
                }
                .fbe-is-turning .fbe-spine-shadow,
                .fbe-is-flipping .fbe-spine-shadow,
                .fbe-is-dragging .fbe-spine-shadow {
                    visibility: hidden !important;
                    opacity: 0 !important;
                    display: none !important;
                    transition: none !important;
                }
                .fbe-is-flipping .fbe-corner-hotspot {
                    pointer-events: none !important;
                }
                .fbe-is-flipping .fbe-texture-overlay,
                .fbe-is-flipping .fbe-clone-underlay {
                    filter: none !important;
                }
                .fbe-static-bg {
                    backface-visibility: hidden;
                }
                @keyframes fbe-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            
            {/* Loading indicator */}
            {!ready && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7', color: '#999', fontSize: '13px', zIndex: 10 }}>
                    Loading FlipBook…
                </div>
            )}

            {/* ── CLONE UNDERLAY for Transparent Sheets ── */}
            <div className="fbe-clone-underlay" style={{
                position: 'absolute', zIndex: showingTurnJs ? 2 : 90, 
                display: 'flex', pointerEvents: 'none',
                width: singlePage ? width : width * 2, height,
                visibility: (showingTurnJs || showingReactFlip) ? 'visible' : 'hidden',
                background: 'transparent',
                transform: (showingReactFlip && hardCoverZoom) ? `scale(${hardCoverZoom.scale})` : 'none',
                transformOrigin: '0 0'
            }}>
                <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
                    {cloneUnderlay.left && (
                        <iframe 
                            title={`Clone Left`}
                            frameBorder="0"
                            srcDoc={(externalBuildPageDoc || buildPageDoc)(cloneUnderlay.left.page.html || cloneUnderlay.left.page.content || '', cloneUnderlay.left.index + 1)}
                            style={{position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', background: '#fff', filter: `blur(${cloneUnderlay.left.blurPx}px)`}} 
                        />
                    )}
                </div>
                {!singlePage && (
                    <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
                        {cloneUnderlay.right && (
                            <iframe 
                                title={`Clone Right`}
                                frameBorder="0"
                                srcDoc={(externalBuildPageDoc || buildPageDoc)(cloneUnderlay.right.page.html || cloneUnderlay.right.page.content || '', cloneUnderlay.right.index + 1)}
                                style={{position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', background: '#fff', filter: `blur(${cloneUnderlay.right.blurPx}px)`}} 
                            />
                        )}
                    </div>
                )}
            </div>

            {/* ── TURN.JS ENGINE — centering wrapper (optional fallback) ── */}
            {showingTurnJs && (
                <div
                    style={{
                        width: singlePage ? width : width * 2,
                        height,
                        position: 'relative',
                        transition: bookTransition,
                        zIndex: 5,
                    }}
                    onPointerDownCapture={(e) => {
                        if (!singlePage && pages.length % 2 !== 0 && currentPage >= pages.length - 2) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            if (clickX > rect.width / 2) {
                                e.stopPropagation();
                            }
                        }
                    }}
                >
                    <div
                        ref={bookEl}
                        className="fbe-book"
                        style={{
                            width: singlePage ? width : width * 2,
                            height,
                            position: 'relative',
                            background: 'transparent',
                        }}
                    />
                </div>
            )}

            {/* ── REACT-PAGEFLIP CANVAS ENGINE (Primary 60fps Engine) ── */}
            {showingReactFlip && (
                <div style={hardCoverZoom ? { transform: `scale(${hardCoverZoom.scale})`, transformOrigin: '0 0' } : {}} className="fbe-react-wrapper">
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        background: 'transparent',
                        transition: bookTransition,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <HTMLFlipBook
                            key={`react-flip-${v_id || 'preview'}-${augmentedPages.length}`}
                            ref={reactFlipRef}
                            renderOnlyPageLengthChange={true}
                            width={width} height={height} size={'stretch'}
                            minWidth={100} maxWidth={4000}
                            minHeight={100} maxHeight={4000}
                            drawShadow={flipStyle !== 'Fast Flip'}
                            useMouseEvents={useMouseEvents}
                            flippingTime={(typeof flipTime === 'number' && flipTime >= 200) ? Math.min(1200, flipTime) : 600}
                            startPage={Number(activeLayout) === 1 ? currentPage : startPage}
                            showCover={true}
                            usePortrait={singlePage}
                            autoCenter={false}
                            clickEventForward={false}
                            onChangeState={(e) => {
                                const isBusy = e.data !== 'read';
                                setIsFlipping(isBusy);
                                isFlippingRef.current = isBusy;
                                const wrapper = containerRef.current || document.querySelector('.fbe-react-wrapper');
                                if (wrapper) {
                                    if (isBusy) wrapper.classList.add('fbe-is-turning', 'fbe-is-flipping');
                                    else wrapper.classList.remove('fbe-is-turning', 'fbe-is-flipping');
                                }
                            }}
                            style={{ background: 'transparent', width: '100%', height: '100%' }}
                            onFlip={(e) => {
                                const logical = e.data;
                                setCurrentPage(logical);
                                setIsFlipping(false);
                                isFlippingRef.current = false;
                                if (onFlipRef.current) onFlipRef.current({ data: logical });
                                
                                const wrapper = containerRef.current || document.querySelector('.fbe-react-wrapper');
                                if (wrapper) wrapper.classList.remove('fbe-is-dragging', 'fbe-is-turning', 'fbe-is-flipping');
                                document.querySelectorAll('.fbe-is-dragging, .fbe-is-turning, .fbe-is-flipping').forEach(el => {
                                    el.classList.remove('fbe-is-dragging', 'fbe-is-turning', 'fbe-is-flipping');
                                });
                                
                                refocusActiveIframe(logical);
                            }}
                        >
                            {memoizedReactPages}
                        </HTMLFlipBook>
                    </div>
                </div>
            )}

            {/* ── Active Spread Interactive Overlay (Layer 2: Only 2 persistent iframes) ── */}
            {ready && (() => {
                const isInteractive = (rawHtml) => {
                    if (!rawHtml || typeof rawHtml !== 'string') return false;
                    return /<video|<audio|<iframe|data-type=["'](video|audio|embed|form|link)|class=["'][^"']*interactive|<a\s+href/i.test(rawHtml);
                };

                const hasInteractiveLeft = Boolean(!singlePage && leftIdx !== null && leftIdx >= 0 && pages[leftIdx] && isInteractive(pages[leftIdx].html || pages[leftIdx].content));
                const hasInteractiveRight = Boolean(rightIdx !== null && rightIdx >= 0 && pages[rightIdx] && isInteractive(pages[rightIdx].html || pages[rightIdx].content));
                const anyInteractive = hasInteractiveLeft || hasInteractiveRight;

                return (
                    <div
                        className="fbe-active-spread-overlay"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            zIndex: 110,
                            width: singlePage ? width : width * 2,
                            height,
                            pointerEvents: anyInteractive ? 'auto' : 'none'
                        }}
                    >
                        {!singlePage && (
                            <div style={{ position: 'relative', width, height, overflow: 'hidden', pointerEvents: hasInteractiveLeft ? 'auto' : 'none' }}>
                                {hasInteractiveLeft && leftIdx !== null && leftIdx >= 0 && leftIdx < pages.length && pages[leftIdx] && !pages[leftIdx].isPad && (
                                    <iframe
                                        key="spread-left"
                                        title={`Page ${leftIdx + 1}`}
                                        frameBorder="0"
                                        allowFullScreen={true}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                                        srcDoc={getCachedPageDoc(buildPageDocRef.current || buildPageDoc, pages[leftIdx].html || pages[leftIdx].content || '', leftIdx + 1)}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: '100%',
                                            height: '100%',
                                            border: 'none',
                                            outline: 'none',
                                            pointerEvents: 'auto',
                                            background: 'transparent',
                                            opacity: 1,
                                            transition: 'opacity 0.15s ease'
                                        }}
                                        onLoad={(e) => {
                                            try {
                                                if (e.target.contentDocument) initGifRunner(e.target.contentDocument);
                                            } catch (err) {}
                                        }}
                                    />
                                )}
                            </div>
                        )}
                        <div style={{ position: 'relative', width, height, overflow: 'hidden', pointerEvents: hasInteractiveRight ? 'auto' : 'none' }}>
                            {hasInteractiveRight && rightIdx !== null && rightIdx >= 0 && rightIdx < pages.length && pages[rightIdx] && !pages[rightIdx].isPad && (
                                <iframe
                                    key="spread-right"
                                    title={`Page ${rightIdx + 1}`}
                                    frameBorder="0"
                                    allowFullScreen={true}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                                    srcDoc={getCachedPageDoc(buildPageDocRef.current || buildPageDoc, pages[rightIdx].html || pages[rightIdx].content || '', rightIdx + 1)}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        outline: 'none',
                                        pointerEvents: 'auto',
                                        background: 'transparent',
                                        opacity: 1,
                                        transition: 'opacity 0.15s ease'
                                    }}
                                    onLoad={(e) => {
                                        try {
                                            if (e.target.contentDocument) initGifRunner(e.target.contentDocument);
                                        } catch (err) {}
                                    }}
                                />
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Corner Hotspots for non-TurnJS engines */}
            {ready && !singlePage && !showingTurnJs && (
                <>
                    {/* Top-Right Corner Hotspot */}
                    {rightIdx !== null && rightIdx < pages.length && (
                        <div
                            className="fbe-corner-hotspot fbe-corner-tr"
                            style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, zIndex: 125, cursor: 'pointer' }}
                            onClick={flipNextFn}
                        />
                    )}
                    {/* Bottom-Right Corner Hotspot */}
                    {rightIdx !== null && rightIdx < pages.length && (
                        <div
                            className="fbe-corner-hotspot fbe-corner-br"
                            style={{ position: 'absolute', bottom: 0, right: 0, width: 80, height: 80, zIndex: 125, cursor: 'pointer' }}
                            onClick={flipNextFn}
                        />
                    )}
                    {/* Top-Left Corner Hotspot */}
                    {leftIdx !== null && leftIdx >= 0 && (
                        <div
                            className="fbe-corner-hotspot fbe-corner-tl"
                            style={{ position: 'absolute', top: 0, left: 0, width: 80, height: 80, zIndex: 125, cursor: 'pointer' }}
                            onClick={flipPrevFn}
                        />
                    )}
                    {/* Bottom-Left Corner Hotspot */}
                    {leftIdx !== null && leftIdx >= 0 && (
                        <div
                            className="fbe-corner-hotspot fbe-corner-bl"
                            style={{ position: 'absolute', bottom: 0, left: 0, width: 80, height: 80, zIndex: 125, cursor: 'pointer' }}
                            onClick={flipPrevFn}
                        />
                    )}
                </>
            )}


            {/* Page styles */}
            <style>{`
                .fbe-wrapper, .fbe-wrapper * {
                    outline: none !important;
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -webkit-user-drag: none !important;
                }

                .fbe-page {
                    background: #fff;
                    overflow: hidden;
                    margin: 0;
                    padding: 0;
                    box-shadow: none !important;
                    border: none !important;
                    outline: none !important;
                }

                .fbe-inner {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    background: #fff;
                    margin: 0;
                    padding: 0;
                    box-shadow: none !important;
                    border: none !important;
                }

                .turn-page {
                    background-color: #fff;
                    box-shadow: none !important;
                    border: none !important;
                    outline: none !important;
                }

                .turn-page-wrapper {
                    background-color: transparent !important;
                    box-shadow: none !important;
                    border: none !important;
                    outline: none !important;
                }

                /* React-pageflip specific classes */
                .fbe-react-page {
                    width: 100%;
                    height: 100%;
                    overflow: hidden !important;
                    transition: border-radius 0.5s ease;
                }

                .fbe-react-page--left, .fbe-page--left {
                    border-radius: ${cornerRadius} 0 0 ${cornerRadius} !important;
                }

                .fbe-react-page--right, .fbe-page--right {
                    border-radius: 0 ${cornerRadius} ${cornerRadius} 0 !important;
                }

                .fbe-page--left .fbe-inner::after,
                .fbe-react-page--left .fbe-inner::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    right: 0;
                    width: 28px;
                    background: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.012) 35%, rgba(0,0,0,0.04) 75%, rgba(0,0,0,0.07) 100%);
                    pointer-events: none;
                    z-index: 2;
                }

                .fbe-page--right .fbe-inner::after,
                .fbe-react-page--right .fbe-inner::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    width: 28px;
                    background: linear-gradient(to left, transparent 0%, rgba(0,0,0,0.012) 35%, rgba(0,0,0,0.04) 75%, rgba(0,0,0,0.07) 100%);
                    pointer-events: none;
                    z-index: 2;
                }

                /* Realistic spine binding shadows on front cover and back cover */
                .fbe-page--first .fbe-inner::before,
                .fbe-react-page--first .fbe-inner::before,
                .p1 .fbe-inner::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    width: 36px;
                    background: linear-gradient(to right, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.14) 10%, rgba(0,0,0,0.05) 26%, rgba(0,0,0,0.01) 50%, transparent 100%);
                    pointer-events: none;
                    z-index: 15;
                    border-top-left-radius: inherit;
                    border-bottom-left-radius: inherit;
                }

                .fbe-page--last .fbe-inner::before,
                .fbe-react-page--last .fbe-inner::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    right: 0;
                    width: 36px;
                    background: linear-gradient(to left, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.14) 10%, rgba(0,0,0,0.05) 26%, rgba(0,0,0,0.01) 50%, transparent 100%);
                    pointer-events: none;
                    z-index: 15;
                    border-top-right-radius: inherit;
                    border-bottom-right-radius: inherit;
                }

                .fbe-page--first .fbe-inner::after,
                .fbe-page--last .fbe-inner::after,
                .fbe-react-page--first .fbe-inner::after,
                .fbe-react-page--last .fbe-inner::after {
                    display: none !important;
                }

                .fbe-react-page--left::after, .fbe-page--left::after {
                    display: none !important;
                }

                .fbe-react-page--right::after, .fbe-page--right::after {
                    display: none !important;
                }

                .fbe-wrapper[data-single-page="true"][data-mobile-shadow="left"] .fbe-react-page,
                .fbe-wrapper[data-single-page="true"][data-mobile-shadow="left"] .fbe-page {
                    border-radius: 0 ${cornerRadius} ${cornerRadius} 0 !important;
                }
                .fbe-wrapper[data-single-page="true"][data-mobile-shadow="left"] .fbe-react-page::after,
                .fbe-wrapper[data-single-page="true"][data-mobile-shadow="left"] .fbe-page::after {
                    left: 0 !important;
                    right: auto !important;
                    background: linear-gradient(to left, transparent 0%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.06) 45%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.4) 100%) !important;
                }

                .fbe-wrapper[data-single-page="true"][data-mobile-shadow="right"] .fbe-react-page,
                .fbe-wrapper[data-single-page="true"][data-mobile-shadow="right"] .fbe-page {
                    border-radius: ${cornerRadius} 0 0 ${cornerRadius} !important;
                }
                .fbe-wrapper[data-single-page="true"][data-mobile-shadow="right"] .fbe-react-page::after,
                .fbe-wrapper[data-single-page="true"][data-mobile-shadow="right"] .fbe-page::after {
                    right: 0 !important;
                    left: auto !important;
                    background: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.06) 45%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.4) 100%) !important;
                }

                .fbe-page--first::after, .fbe-page--last::after {
                    width: 40px !important;
                }


                /* Reset global cursor pointer applied by flipbook engines and their descendants */
                .stf__wrapper, .stf__block {
                    background: transparent !important;
                }
                .stf__wrapper, .stf__wrapper *, 
                .stf__block, .stf__block *, 
                .turn-page-wrapper, .turn-page-wrapper *, 
                .turn-page, .turn-page *, 
                .fbe-wrapper, .fbe-wrapper *, 
                .fbe-react-page, .fbe-react-page *,
                .fbe-book, .fbe-book * {
                    cursor: default;
                }
                
                /* Hand cursor for turn.js pages and drag overlays */
                .fbe-drag-overlay,
                .fbe-corner-hotspot {
                    cursor: grab !important;
                    pointer-events: auto !important;
                }
                .fbe-drag-overlay:active,
                .fbe-corner-hotspot:active {
                    cursor: grabbing !important;
                }
                .turn-page-wrapper, .turn-page {
                    cursor: default;
                }
                
                /* While flipping, dragging, or turning, hide all iframes using opacity: 0 (NEVER display: none, which destroys/reloads iframes!).
                   Turn.js will GPU-fold ONLY the lightweight flat image (.fbe-static-bg),
                   eliminating 100% of iframe re-parenting, reloads, and 3D compositor stalls! */
                .fbe-is-turning iframe,
                .fbe-is-dragging iframe,
                .fbe-is-flipping iframe,
                .fbe-is-turning .fbe-active-spread-overlay,
                .fbe-is-dragging .fbe-active-spread-overlay,
                .fbe-is-flipping .fbe-active-spread-overlay,
                .fbe-is-turning .fbe-spine-shadow,
                .fbe-is-dragging .fbe-spine-shadow,
                .fbe-is-flipping .fbe-spine-shadow,
                .fbe-wrapper.fbe-is-turning iframe,
                .fbe-wrapper.fbe-is-dragging iframe,
                .fbe-wrapper.fbe-is-flipping iframe,
                .fbe-wrapper.fbe-is-turning .fbe-spine-shadow,
                .fbe-wrapper.fbe-is-dragging .fbe-spine-shadow,
                .fbe-wrapper.fbe-is-flipping .fbe-spine-shadow,
                .fbe-book.fbe-is-turning iframe,
                .fbe-book.fbe-is-dragging iframe,
                .fbe-book.fbe-is-flipping iframe,
                .fbe-book.fbe-is-turning .fbe-spine-shadow,
                .fbe-book.fbe-is-dragging .fbe-spine-shadow,
                .fbe-book.fbe-is-flipping .fbe-spine-shadow {
                    visibility: hidden !important;
                    opacity: 0 !important;
                    display: none !important;
                    pointer-events: none !important;
                    transition: none !important;
                }

                /* Add a global invisible shield over the entire wrapper during a drag to guarantee mousemove tracking */
                .fbe-wrapper.fbe-is-dragging::after,
                .fbe-book.fbe-is-dragging::after {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 9999;
                    cursor: grabbing !important;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
});

const MemoizedFlipBookEngine = React.memo(FlipBookEngine);

export default MemoizedFlipBookEngine;

