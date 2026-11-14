import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { sanitizeSvgXml } from '../../../utils/editorUtils';
import { getAssetBaseUrl, resolveUploadsPath } from '../../../utils/assetUtils';

const BACKEND_URL = (import.meta.env?.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');

const LazyPreview = ({
  v_id,
  emailId,
  backendUrl,
  iframeBaseUrl,
  title,
  imageUrl,
  onOrientationDetected,
}) => {
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
          const effectiveBackend = (backendUrl || BACKEND_URL).trim().replace(/\/+$/, '');
          axios
            .get(`${effectiveBackend}/api/flipbook/preview/${v_id}`, { withCredentials: true })
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
                const vbMatch = htmlStr.match(/viewBox=["']\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*["']/i);
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
                while ((match = cssRegex.exec(htmlStr)) !== null) {
                  let f = match[1] || match[2];
                  if (f) f = f.split(',')[0].replace(/['"]/g, '').trim();
                  if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
                }
                while ((match = attrRegex.exec(htmlStr)) !== null) {
                  let f = match[1].split(',')[0].replace(/['"]/g, '').trim();
                  if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
                }

                let fontImports = '';
                if (fontsToLoad.size > 0) {
                  const fontList = Array.from(fontsToLoad).map(f => f.replace(/\s+/g, '+')).join('|');
                  fontImports = `<link href="https://fonts.googleapis.com/css?family=${fontList}:300,400,500,600,700,800,900&display=swap" rel="stylesheet">`;
                }

                setHtml({ content: htmlStr, fontImports });
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
  }, [v_id, loaded, fetching, backendUrl, emailId, onOrientationDetected, title]);

  const isLoading = !loaded || fetching;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative bg-white overflow-hidden rounded-[0.35vw]">
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

        const backend = (backendUrl || BACKEND_URL).trim().replace(/\/+$/, '');
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
            srcDoc={`<!DOCTYPE html><html><head>${html.fontImports || ''}<base href="${effectiveBaseHref}"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:white;}svg{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;display:block;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.12));}svg,svg *{vector-effect:none !important;}[data-name="Free Frame"]{stroke:transparent !important;fill:transparent !important;}</style></head><body>${processedContent}</body></html>`}
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

      {/* Realistic 3D book spine overlay matching CreatorProfileModal */}
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw] bg-gradient-to-r from-black/25 via-white/15 to-transparent pointer-events-none z-10" />
    </div>
  );
};

export { LazyPreview };
export default LazyPreview;
