import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen } from 'lucide-react';

const resolveUploadsPath = (path) => path || '';

// Lazy-load preview iframe: only fetches HTML when card is visible in viewport
export default function LazyPreview({ v_id, emailId, backendUrl, iframeBaseUrl, title, imageUrl }) {
    const containerRef = useRef(null);
    const [html, setHtml] = useState(null);
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
                    // Always fetch first-page HTML for both PDF and template books
                    axios
                        .get(`${backendUrl}/api/flipbook/preview/${v_id}`, { params: { emailId } })
                        .then((res) => {
                            if (res.data?.html) {
                                // Extract and dynamically load Google Fonts found in the SVG
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
                        .catch(() => {})
                        .finally(() => { setFetching(false); setLoaded(true); });
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [v_id, loaded, fetching, backendUrl, emailId]);

    const isLoading = !loaded || fetching;

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gray-50">
            {/* Skeleton shimmer — visible while loading */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200/80 overflow-hidden">
                    {/* Shimmer sweep animation */}
                    <div
                        className="absolute inset-0 z-10 pointer-events-none"
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
                return (
                    <iframe
                        title={`Preview of ${title}`}
                        className="w-full h-full border-none pointer-events-none"
                        srcDoc={`<!DOCTYPE html><html><head>${html.fontImports}<base href="${effectiveBaseHref}"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:transparent;}svg{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;}[data-name="Free Frame"]{stroke:transparent !important;fill:transparent !important;}</style></head><body>${processedContent.replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet"')}</body></html>`}
                    />
                );
            })() : loaded && imageUrl ? (
                // Fallback: asset image if no HTML was found
                <img src={resolveUploadsPath(imageUrl)} alt={title} className="w-full h-full object-contain" />
            ) : loaded && !html ? (
                // Loaded but nothing available
                <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full">
                    <BookOpen size="1.8vw" strokeWidth={1.5} />
                    <span className="text-[0.7vw] mt-1 font-semibold">No Preview</span>
                </div>
            ) : null}
        </div>
    );
}
