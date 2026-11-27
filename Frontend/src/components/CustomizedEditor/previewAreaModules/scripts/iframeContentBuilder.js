import sanitizeHtmlForPreview from './sanitizeHtml';
import { rewriteHtmlUploads } from '../../../../utils/assets/assetUtils';
import { getCachedRaster } from '../../../../utils/customizedEditor/pageRasterCache';
import getSlideshowScript from './slideshowScript';
import getAnimationScript from './animationScript';
import getInteractionScript from './interactionScript';
import getVideoControlsScript from './videoControlsScript';
import getAudioControlsScript from './audioControlsScript';
import getEmbedScript from './embedScript';
import getDecoratorStyles from './decoratorScript';

export const getIframeContent = (html, pageNumber, watermarkSettings = null, pagesCount = 0, singlePage = false, baseUrl = null) => {
    let rawCleanHtml = sanitizeHtmlForPreview(html);
    if (baseUrl) {
        if (rawCleanHtml.includes('../assets/')) {
            rawCleanHtml = rawCleanHtml.split('../assets/').join(`${baseUrl}assets/`);
        }
        if (rawCleanHtml.includes('./assets/')) {
            rawCleanHtml = rawCleanHtml.split('./assets/').join(`${baseUrl}assets/`);
        }
        if (rawCleanHtml.includes('nullassets/')) {
            rawCleanHtml = rawCleanHtml.split('nullassets/').join(`${baseUrl}assets/`);
        }
        rawCleanHtml = rawCleanHtml.replace(/(src|href|xlink:href)=(['"])(?:\.\.\/|\.\/)?assets\//gi, `$1=$2${baseUrl}assets/`);
    } else {
        rawCleanHtml = rawCleanHtml.replace(/(src|href|xlink:href)=(['"])(?:\.\.\/|\.\/)?assets\//gi, '$1=$2/assets/');
    }
    let cleanHtml = rewriteHtmlUploads(rawCleanHtml);

    // Extract and dynamically load Google Fonts found in the SVG
    const fontsToLoad = new Set();
    if (cleanHtml) {
        const cssRegex = /font-family\s*:\s*(?:['"]([^'"]+)['"]|([^;}'"\s]+))/g;
        const attrRegex = /font-family\s*=\s*['"]([^'"]+)['"]/g;
        const dataFontRegex = /data-(?:[^"'>]*font-family|font)\s*=\s*['"]([^'"]+)['"]/g;
        let match;
        while ((match = cssRegex.exec(cleanHtml)) !== null) {
            let f = match[1] || match[2];
            if (f) f = f.split(',')[0].replace(/['"]/g, '').trim();
            if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
        }
        while ((match = attrRegex.exec(cleanHtml)) !== null) {
            let f = match[1].split(',')[0].replace(/['"]/g, '').trim();
            if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
        }
        while ((match = dataFontRegex.exec(cleanHtml)) !== null) {
            let f = match[1].split(',')[0].replace(/['"]/g, '').trim();
            if (f && !['sans-serif', 'serif', 'monospace', 'inherit', 'initial'].includes(f.toLowerCase())) fontsToLoad.add(f);
        }
    }

    let fontImports = '';
    if (fontsToLoad.size > 0) {
        const fontArray = Array.from(fontsToLoad).map(f => f.replace(/['"]/g, '').trim()).filter(Boolean);
        const css2Params = fontArray.map(f => `family=${encodeURIComponent(f).replace(/%20/g, '+')}`).join('&');
        const css1Params = fontArray.map(f => encodeURIComponent(f).replace(/%20/g, '+')).join('|');
        fontImports = `
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?${css2Params}&display=swap" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css?family=${css1Params}:300,400,500,600,700,800,900&display=swap" rel="stylesheet">`;
    }

    // Inject scripts
    const content = `
        <!DOCTYPE html>
        <html>
            <head>
                ${fontImports}
                <style>
                    html, body { cursor: default !important; -webkit-user-select: none; user-select: none; }
                    body { margin: 0; padding: 0; overflow: hidden; background: transparent; width: 100%; height: 100%; }
                    body > svg {
                        width: 100% !important;
                        height: 100% !important;
                        display: block !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        shape-rendering: geometricPrecision !important;
                    }
                    * { box-sizing: border-box; -webkit-user-select: none; user-select: none; }
                    ::-webkit-scrollbar { width: 0px; background: transparent; }
                    [data-interaction="open-link"][data-interaction-value]:not([data-interaction-value=""]),
                    [data-interaction="link"][data-interaction-value]:not([data-interaction-value=""]),
                    [data-interaction="navigate-to"][data-interaction-value]:not([data-interaction-value=""]),
                    [data-interaction="download"][data-interaction-value]:not([data-interaction-value=""]),
                    [data-interaction="zoom"],
                    [data-interaction="tooltip"],
                    [data-interaction="info-box"],
                    [data-interaction="popup"],
                    [data-interaction="slideshow"],
                    [data-interaction="whatsapp"],
                    [data-interaction="call"],
                    [data-interaction="email"],
                    [data-interaction="audio"],
                    [data-interaction="3d-viewer"] {
                        cursor: pointer !important;
                    }

                    /* Children pointer events */
                    [data-interaction="open-link"] *,
                    [data-interaction="link"] *,
                    [data-interaction="navigate-to"] *,
                    [data-interaction="download"] *,
                    [data-interaction="zoom"] *,
                    [data-interaction="tooltip"] *,
                    [data-interaction="info-box"] *,
                    [data-interaction="popup"] *,
                    [data-interaction="slideshow"] *,
                    [data-interaction="whatsapp"] *,
                    [data-interaction="call"] *,
                    [data-interaction="email"] *,
                    [data-interaction="audio"] *,
                    [data-interaction="3d-viewer"] * {
                        cursor: pointer !important;
                    }

                    /* Hide Free Frame dashed border in preview */
                    [data-name="Free Frame"] {
                        stroke: transparent !important;
                    }

                    /* Ensure text inside contentEditable boxes and scrollable features wrap correctly */
                    .text-edit-box,
                    [contenteditable="true"],
                    [data-scrollable="true"],
                    foreignObject:not([data-type="map"]):not([data-type="slideshow"]):not(.slideshow-foreign-object) div:not(.map-root-container):not(.map-card-overlay):not(.map-card-overlay *):not(.flipibook-swiper-container):not(.flipibook-swiper-container *) {
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
                    g[data-type="map"] foreignObject {
                        overflow: hidden !important;
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

                    .flipbook-text-scrollbar {
                        scrollbar-color: var(--scrollbar-color, #4B5563) transparent !important;
                        scrollbar-width: thin !important;
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
                        background: transparent !important;
                        border-radius: 10px !important;
                    }

                    .flipbook-text-scrollbar::-webkit-scrollbar-thumb,
                    [data-scrollable="true"]::-webkit-scrollbar-thumb,
                    [data-scrollable="true"] *::-webkit-scrollbar-thumb {
                        background: var(--scrollbar-color, #4B5563) !important;
                        border-radius: 10px !important;
                        border: none !important;
                    }

                    .flipbook-text-scrollbar::-webkit-scrollbar-thumb:hover,
                    [data-scrollable="true"]::-webkit-scrollbar-thumb:hover,
                    [data-scrollable="true"] *::-webkit-scrollbar-thumb:hover {
                        background: var(--scrollbar-color, #4B5563) !important;
                    }

                    .flipbook-text-scrollbar::-webkit-scrollbar-thumb:active,
                    [data-scrollable="true"]::-webkit-scrollbar-thumb:active,
                    [data-scrollable="true"] *::-webkit-scrollbar-thumb:active {
                        background: var(--scrollbar-color, #4B5563) !important;
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

                    /* Disable editor selection/stroke overlay blockers in preview so embeds, maps and links can be clicked */
                    .svg-image-stroke-overlay,
                    .svg-table-overlay,
                    .bbox-anchor,
                    g[data-type="map"] > rect:last-child,
                    g[data-type="embed-frame"] > rect.svg-image-stroke-overlay,
                    g[data-type="qrcode"] > rect:last-child {
                        pointer-events: none !important;
                    }

                    /* Map element strict isolation in preview */
                    g[data-type="map"] foreignObject,
                    foreignObject[data-type="map"],
                    .map-root-container {
                        overflow: hidden !important;
                    }
                    g[data-type="map"] foreignObject * {
                        -webkit-user-select: auto !important;
                        user-select: auto !important;
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
                        pointer-events: auto !important; /* interactive map (see sanitizeHtml) */
                    }

                    /* Enable pointer events only on interactive action buttons and overlay cards */
                    .map-open-maps-btn,
                    .map-action-btn-circle,
                    .map-card-overlay,
                    .map-sheet-btn,
                    .map-sheet-link-btn {
                        pointer-events: auto !important;
                    }

                    foreignObject[data-type="embed-frame"],
                    foreignObject[data-type="embed-frame"] iframe,
                    g[data-type="embed-frame"] foreignObject,
                    g[data-type="embed-frame"] foreignObject iframe,
                    .embed-root-container,
                    .embed-root-container iframe,
                    .embed-overlay-wrapper,
                    .embed-open-btn,
                    .embed-open-btn *,
                    .embed-fullscreen-btn,
                    .embed-fullscreen-btn * {
                        pointer-events: auto !important;
                    }

                    .embed-open-btn:hover,
                    .embed-fullscreen-btn:hover {
                        background: rgba(15, 23, 42, 0.98) !important;
                        border-color: rgba(255, 255, 255, 0.38) !important;
                        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35) !important;
                        transform: translateY(-1px);
                    }

                    .embed-open-btn:active,
                    .embed-fullscreen-btn:active {
                        transform: translateY(0);
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25) !important;
                    }

                    .embed-root-container:fullscreen,
                    .embed-root-container:-webkit-full-screen,
                    .embed-root-container:-moz-full-screen {
                        width: 100vw !important;
                        height: 100vh !important;
                        background: #000000 !important;
                        position: fixed !important;
                        inset: 0 !important;
                        z-index: 9999999 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .embed-root-container:fullscreen iframe,
                    .embed-root-container:-webkit-full-screen iframe,
                    .embed-root-container:-moz-full-screen iframe {
                        width: 100% !important;
                        height: 100% !important;
                    }

                    .embed-root-container:fullscreen .embed-overlay-wrapper,
                    .embed-root-container:-webkit-full-screen .embed-overlay-wrapper,
                    .embed-root-container:-moz-full-screen .embed-overlay-wrapper {
                        top: 16px !important;
                        right: 16px !important;
                        z-index: 10000000 !important;
                    }

                    foreignObject[data-sizing-mode="fixed"]>div {
                        display: block !important;
                    }

                    foreignObject[data-scrollable="true"]>div {
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        display: block !important;
                        box-sizing: border-box !important;
                        pointer-events: auto !important;
                        -webkit-user-select: text !important;
                        user-select: text !important;
                    }

                    .flipbook-text-outer,
                    foreignObject[data-scrollable="true"]>div.flipbook-text-outer {
                        width: 100% !important;
                        height: 100% !important;
                        display: block !important;
                        box-sizing: border-box !important;
                        padding: 0 !important; /* match editor layout */
                        background-color: var(--bg-fill, transparent) !important;
                        border: calc(var(--bg-stroke-width, 0) * 1px) solid var(--bg-stroke, transparent) !important;
                        border-radius: var(--bg-rx, 0px) !important;
                        position: relative;
                        overflow: hidden !important;
                    }
                    
                    .flipbook-text-viewport {
                        width: 100% !important;
                        height: 100% !important;
                        overflow: hidden !important;
                        position: relative;
                    }
                    
                    .flipbook-text-viewport::after {
                        display: none; /* no dark fade over the text (editor has none) */
                        content: "";
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 14px;
                        height: 24px;
                        background: linear-gradient(to top, rgba(0,0,0,0.15), transparent);
                        pointer-events: none;
                        z-index: 10;
                        border-bottom-left-radius: var(--bg-rx, 16px);
                        border-bottom-right-radius: var(--bg-rx, 16px);
                    }
                    
                    .flipbook-text-scrollbar {
                        width: 100% !important;
                        height: 100% !important;
                        overflow-y: auto !important;
                        overflow-x: hidden !important;
                        display: block !important;
                        box-sizing: border-box !important;
                    }


                    /* Scrollable text must clip to its box (generic rule above forces overflow: visible) */
                    foreignObject[data-scrollable="true"]:not([data-type="map"]):not([data-type="embed-frame"]) {
                        overflow: hidden !important;
                    }
                    foreignObject[data-scrollable="true"] .flipbook-text-viewport,
                    foreignObject[data-scrollable="true"] .flipbook-text-scrollbar {
                        max-height: 100% !important;
                    }
                    foreignObject[data-scrollable="true"] > div.flipbook-text-scrollbar {
                        overflow-y: auto !important;
                        overflow-x: hidden !important;
                    }

                    foreignObject[data-scrollable="true"] * {
                        -webkit-user-select: text !important;
                        user-select: text !important;
                        pointer-events: auto !important;
                    }
                </style>
                ${getDecoratorStyles()}
                ${getSlideshowScript()}
                ${getAnimationScript(pageNumber)}
                ${getInteractionScript(pageNumber)}
                ${getVideoControlsScript()}
                ${getAudioControlsScript()}
                ${getEmbedScript()}
                <script>
                    (function() {
                        // Per-box scrollbar color -> CSS variable (runs after the page content is parsed)
                        var applySbColors = function() {
                            document.querySelectorAll('[data-scrollbar-color]').forEach(function(el) {
                                var c = el.getAttribute('data-scrollbar-color');
                                if (c) el.style.setProperty('--scrollbar-color', c);
                            });
                        };
                        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applySbColors);
                        else applySbColors();
                    })();
                    (function() {
                        const isRightPage = ${pageNumber} % 2 !== 0;
                        const handleMove = (e) => {
                            if (!document.hasFocus()) window.focus();
                            try {
                                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                                window.parent.postMessage({
                                    type: 'IFRAME_MOUSEMOVE',
                                    originalClientX: clientX,
                                    originalClientY: clientY,
                                    pageNumber: window._pageNumber
                                }, '*');

                                // Dynamic cursor for drag corners inside iframe
                                const nearCornerX = isRightPage 
                                    ? (window.innerWidth - clientX < 50) 
                                    : (clientX < 50);
                                const nearCornerY = (clientY < 50) || (window.innerHeight - clientY < 50);
                                if (nearCornerX && nearCornerY) {
                                    document.documentElement.style.setProperty('cursor', 'grab', 'important');
                                    document.body.style.setProperty('cursor', 'grab', 'important');
                                } else {
                                    document.documentElement.style.removeProperty('cursor');
                                    document.body.style.removeProperty('cursor');
                                }
                            } catch (err) {}
                        };
                        document.addEventListener('mousemove', handleMove);
                        document.addEventListener('touchmove', handleMove, { passive: true });

                        const handleEnd = (e) => {
                            try {
                                const clientX = (e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0].clientX : e.clientX;
                                const clientY = (e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0].clientY : e.clientY;
                                window.parent.postMessage({
                                    type: 'IFRAME_MOUSEUP',
                                    originalClientX: clientX,
                                    originalClientY: clientY,
                                    pageNumber: window._pageNumber
                                }, '*');
                            } catch (err) {}
                        };
                        document.addEventListener('mouseup', handleEnd);
                        document.addEventListener('touchend', handleEnd, { passive: true });
                        
                        document.addEventListener('wheel', (e) => {
                            try {
                                const isScrollable = e.target.closest('[data-scrollable="true"], .flipbook-text-scrollbar, .flipbook-text-outer, .flipbook-text-viewport');
                                if (isScrollable) return;
                                window.parent.postMessage({
                                    type: 'IFRAME_WHEEL',
                                    deltaY: e.deltaY,
                                    ctrlKey: e.ctrlKey,
                                    deltaMode: e.deltaMode
                                }, '*');
                            } catch (err) {}
                        }, { passive: true });
                    })();
                </script>
            </head>
            <body>
                ${cleanHtml || ''}
                ${(function () {
            if (!watermarkSettings?.src) return '';
            const f = watermarkSettings.adjustments || { exposure: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, highlights: 0, shadows: 0 };
            const exposure = f.exposure || 0;
            const contrast = f.contrast || 0;
            const saturation = f.saturation || 0;
            const temperature = f.temperature || 0;
            const tint = f.tint || 0;
            const hl = f.highlights || 0;
            const sd = f.shadows || 0;
            let filterStr = "";
            filterStr += `brightness(${100 + exposure + (hl / 5)}%) `;
            filterStr += `contrast(${100 + contrast + (sd / 5)}%) `;
            filterStr += `saturate(${100 + saturation}%) `;
            if (tint !== 0) filterStr += `hue-rotate(${tint}deg) `;
            if (temperature > 0) filterStr += `sepia(${temperature / 2}%) `;
            else if (temperature < 0) filterStr += `hue-rotate(180deg) sepia(${Math.abs(temperature) / 2}%) hue-rotate(-180deg) `;

            const opacity = (watermarkSettings.opacity ?? 100) / 100;
            const wmType = watermarkSettings.type || 'Fit';
            const isFullPage = wmType === 'Fill' || wmType === 'Stretch';
            const objectFit = wmType === 'Fill' ? 'cover' : wmType === 'Stretch' ? 'fill' : 'contain';

            let positionStyle = "";
            let transformOrigin = "center center";
            const offset = '4%';
            const posX = watermarkSettings.positionX ?? 0;
            const posY = watermarkSettings.positionY ?? 0;

            if (isFullPage) {
                positionStyle = `top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; transform: none;`;
            } else {
                let tx = '0%';
                let ty = '0%';
                switch (watermarkSettings.position) {
                    case 'Top Left':
                        positionStyle = `top: ${offset}; left: ${offset};`;
                        transformOrigin = 'top left';
                        break;
                    case 'Top Center':
                        positionStyle = `top: ${offset}; left: 50%;`;
                        tx = '-50%';
                        transformOrigin = 'top center';
                        break;
                    case 'Top Right':
                        positionStyle = `top: ${offset}; right: ${offset};`;
                        transformOrigin = 'top right';
                        break;
                    case 'Middle Left':
                        positionStyle = `top: 50%; left: ${offset};`;
                        ty = '-50%';
                        transformOrigin = 'center left';
                        break;
                    case 'Center':
                        positionStyle = `top: 50%; left: 50%;`;
                        tx = '-50%';
                        ty = '-50%';
                        transformOrigin = 'center center';
                        break;
                    case 'Middle Right':
                        positionStyle = `top: 50%; right: ${offset};`;
                        ty = '-50%';
                        transformOrigin = 'center right';
                        break;
                    case 'Bottom Left':
                        positionStyle = `bottom: ${offset}; left: ${offset};`;
                        transformOrigin = 'bottom left';
                        break;
                    case 'Bottom Center':
                        positionStyle = `bottom: ${offset}; left: 50%;`;
                        tx = '-50%';
                        transformOrigin = 'bottom center';
                        break;
                    case 'Bottom Right':
                    default:
                        positionStyle = `bottom: ${offset}; right: ${offset};`;
                        transformOrigin = 'bottom right';
                        break;
                }
                positionStyle += ` width: 22%; height: auto; transform: translate(calc(${tx} + ${posX}%), calc(${ty} + ${posY}%));`;
            }

            const scale = (watermarkSettings.scale ?? 100) / 100;
            const rotate = watermarkSettings.rotate ?? 0;
            const imgHeight = isFullPage ? '100%' : 'auto';

            return `
                        <div id="flipbook-watermark-container" style="position: absolute; z-index: 9999; pointer-events: none; opacity: ${opacity}; overflow: ${isFullPage ? 'hidden' : 'visible'}; ${positionStyle}">
                            <img id="flipbook-watermark-img" src="${watermarkSettings.src}" style="width: 100%; height: ${imgHeight}; object-fit: ${objectFit}; filter: ${filterStr}; transform: scale(${scale}) rotate(${rotate}deg); transform-origin: ${transformOrigin};" />
                        </div>
                    `;
        })()}
            </body>
        </html>
    `;
    return content;
};


export default getIframeContent;
