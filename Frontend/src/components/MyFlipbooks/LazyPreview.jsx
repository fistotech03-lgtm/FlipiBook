import React, { useRef, useState, useEffect, memo } from 'react';
import axios from 'axios';
import { BookOpen } from 'lucide-react';
import { flipbookApi } from '../../api/flipbookApi';
import { resolveUploadsPath } from '../../utils/assetUtils';

// Global font cache across all preview cards to prevent duplicate Google Fonts requests
const globallyRequestedFonts = new Set();

function LazyPreviewComponent({
    v_id,
    emailId,
    backendUrl,
    iframeBaseUrl,
    title,
    imageUrl,
    firstPageFileName = 'Page 1.svg',
    firstPageContent = null,
}) {
    const containerRef = useRef(null);
    const [html, setHtml] = useState(() => {
        if (firstPageContent && typeof firstPageContent === 'string' && firstPageContent.includes('<svg')) {
            return { content: firstPageContent, fontImports: '' };
        }
        return null;
    });
    const [loaded, setLoaded] = useState(Boolean(firstPageContent));
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (!v_id || loaded || html) return;

        let isMounted = true;
        const abortController = new AbortController();

        const loadPreview = async () => {
            if (fetching) return;
            setFetching(true);

            try {
                // 1. Primary: fetch preview HTML/SVG from flipbookApi
                const res = await flipbookApi.getPreview(v_id, emailId, abortController.signal);
                if (!isMounted) return;

                if (res.data?.html && typeof res.data.html === 'string' && res.data.html.trim().length > 0) {
                    const fontsToLoad = new Set();
                    const cssRegex = /font-family\s*:\s*(?:['"]([^'"]+)['"]|([^;}'"\s]+))/g;
                    const attrRegex = /font-family\s*=\s*['"]([^'"]+)['"]/g;
                    let match;
                    while ((match = cssRegex.exec(res.data.html)) !== null) {
                        let f = match[1] || match[2];
                        if (f) f = f.split(',')[0].replace(/['"]/g, '').trim();
                        if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) {
                            fontsToLoad.add(f);
                        }
                    }
                    while ((match = attrRegex.exec(res.data.html)) !== null) {
                        let f = match[1].split(',')[0].replace(/['"]/g, '').trim();
                        if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) {
                            fontsToLoad.add(f);
                        }
                    }

                    const newFonts = Array.from(fontsToLoad).filter(f => !globallyRequestedFonts.has(f));
                    newFonts.forEach(f => globallyRequestedFonts.add(f));

                    let fontImports = '';
                    if (fontsToLoad.size > 0) {
                        const fontList = Array.from(fontsToLoad).map(f => f.replace(/\s+/g, '+')).join('|');
                        fontImports = `<link href="https://fonts.googleapis.com/css?family=${fontList}:300,400,500,600,700,800,900&display=swap" rel="stylesheet">`;
                    }

                    setHtml({ content: res.data.html, fontImports });
                    setLoaded(true);
                    return;
                }
            } catch (err) {
                if (axios.isCancel(err)) return;
            }

            // 2. Secondary fallback: directly fetch first-page SVG file from static storage
            if (iframeBaseUrl && isMounted) {
                const cleanBase = iframeBaseUrl.endsWith('/') ? iframeBaseUrl : `${iframeBaseUrl}/`;
                const candidates = [
                    `${cleanBase}pages/${firstPageFileName || 'Page 1.svg'}`,
                    `${cleanBase}pages/1.svg`,
                    `${cleanBase}pages/Page 1.svg`,
                    `${cleanBase}${firstPageFileName || 'Page 1.svg'}`,
                    `${cleanBase}1.svg`
                ];

                for (const candUrl of new Set(candidates)) {
                    if (!isMounted) return;
                    try {
                        const staticRes = await axios.get(candUrl, { signal: abortController.signal, timeout: 5000 });
                        if (typeof staticRes.data === 'string' && staticRes.data.includes('<svg')) {
                            setHtml({ content: staticRes.data, fontImports: '' });
                            setLoaded(true);
                            return;
                        }
                    } catch (e) {
                        if (axios.isCancel(e)) return;
                    }
                }
            }

            if (isMounted) {
                setLoaded(true);
            }
        };

        // Trigger load immediately without waiting for intersection delays
        loadPreview().finally(() => {
            if (isMounted) setFetching(false);
        });

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [v_id, loaded, html, emailId, iframeBaseUrl, firstPageFileName]);

    const isLoading = !loaded || fetching;

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gray-100">
            {/* Skeleton shimmer — visible while loading */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200/80 overflow-hidden z-10">
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'skeletonShimmer 1.5s infinite ease-in-out',
                        }}
                    />
                    <style>{`
                        @keyframes skeletonShimmer {
                            0% { background-position: -200% 0; }
                            100% { background-position: 200% 0; }
                        }
                    `}</style>
                </div>
            )}

            {/* Actual preview — rendered on top once ready */}
            {html ? (() => {
                let processedContent = html.content || '';
                const cleanBaseUrl = (iframeBaseUrl || '').trim();
                let effectiveBaseHref = cleanBaseUrl;
                if (cleanBaseUrl) {
                    const bookBaseUrl = cleanBaseUrl.endsWith('/') ? cleanBaseUrl : `${cleanBaseUrl}/`;
                    effectiveBaseHref = `${bookBaseUrl}pages/`;
                    const assetsBaseUrl = `${bookBaseUrl}assets/`;
                    processedContent = processedContent
                        .replace(/(?:href|xlink:href)=["'](?:\.\.\/|\.\/)?assets\/([^"']+)["']/gi, `href="${assetsBaseUrl}$1" xlink:href="${assetsBaseUrl}$1"`)
                        .replace(/src=["'](?:\.\.\/|\.\/)?assets\/([^"']+)["']/gi, `src="${assetsBaseUrl}$1"`);
                }

                if (!processedContent.includes('preserveAspectRatio')) {
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
                        sandbox="allow-same-origin"
                        srcDoc={`<!DOCTYPE html><html><head>${html.fontImports || ''}<base href="${effectiveBaseHref}"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#f3f4f6;}svg{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;display:block;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.12));}[data-name="Free Frame"]{stroke:transparent !important;fill:transparent !important;}</style></head><body>${processedContent}</body></html>`}
                    />
                );
            })() : loaded && imageUrl ? (
                <img src={resolveUploadsPath(imageUrl)} alt={title} className="w-full h-full object-contain" />
            ) : loaded && !html ? (
                <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full">
                    <BookOpen size="1.8vw" strokeWidth={1.5} />
                    <span className="text-[0.7vw] mt-1 font-semibold">No Preview</span>
                </div>
            ) : null}
        </div>
    );
}

export const LazyPreview = memo(LazyPreviewComponent);
export default LazyPreview;
