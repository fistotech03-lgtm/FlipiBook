import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { resolveUploadsPath } from './constants';

const LazyPreview = ({ v_id, emailId, backendUrl, iframeBaseUrl, title, imageUrl }) => {
  const containerRef = useRef(null);
  const [html, setHtml] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Detect aspect ratio from SVG viewBox or dimensions if available
  const [svgRatio, setSvgRatio] = useState(null);

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
              if (res.data?.html) {
                const rawSvg = res.data.html;
                const vbMatch = rawSvg.match(/viewBox=["']\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*["']/i);
                if (vbMatch) {
                  const vbW = parseFloat(vbMatch[3]);
                  const vbH = parseFloat(vbMatch[4]);
                  if (vbW > 0 && vbH > 0) {
                    setSvgRatio(vbW / vbH);
                  }
                }

                const fontsToLoad = new Set();
                const cssRegex = /font-family\s*:\s*(?:['"]([^'"]+)['"]|([^;}'"\s]+))/g;
                const attrRegex = /font-family\s*=\s*['"]([^'"]+)['"]/g;
                let match;
                while ((match = cssRegex.exec(rawSvg)) !== null) {
                  let f = match[1] || match[2];
                  if (f) f = f.split(',')[0].replace(/['"]/g, '').trim();
                  if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
                }
                while ((match = attrRegex.exec(rawSvg)) !== null) {
                  let f = match[1].split(',')[0].replace(/['"]/g, '').trim();
                  if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
                }

                let fontImports = '';
                if (fontsToLoad.size > 0) {
                  const fontList = Array.from(fontsToLoad).map(f => f.replace(/\s+/g, '+')).join('|');
                  fontImports = `<link href="https://fonts.googleapis.com/css?family=${fontList}:300,400,500,600,700,800,900&display=swap" rel="stylesheet">`;
                }

                setHtml({ content: rawSvg, fontImports });
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
  }, [v_id, loaded, fetching, backendUrl, emailId]);

  const isLoading = !loaded || fetching;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative bg-white overflow-hidden rounded-[3px]">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[0.4vw] bg-[#E8E6E1] overflow-hidden border border-[#d5d2c9]">
          <Icon icon="eos-icons:loading" className="w-[1.5vw] h-[1.5vw] text-gray-400" />
        </div>
      )}

      {html ? (
        <iframe
          title={`Preview of ${title}`}
          className="w-full h-full border-none pointer-events-none"
          srcDoc={`<!DOCTYPE html><html><head>${html.fontImports}<base href="${iframeBaseUrl}"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:white;}svg{width:100%;height:100%;max-width:100%;max-height:100%;display:block;}[data-name="Free Frame"]{stroke:transparent !important;fill:transparent !important;}</style></head><body>${html.content.replace(/<svg\b([^>]*)/i, (m, attrs) => {
            if (/preserveAspectRatio=/i.test(attrs)) {
              return m;
            }
            return `<svg preserveAspectRatio="xMidYMid meet"${attrs}`;
          })}</body></html>`}
        />
      ) : loaded && imageUrl ? (
        <img src={resolveUploadsPath(imageUrl)} alt={title} className="w-full h-full object-fill bg-white" />
      ) : loaded && !html ? (
        <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full bg-white border border-[#d5d2c9]">
          <Icon icon="mdi:book-open-blank-variant" className="w-[2vw] h-[2vw] text-gray-400 mb-1" />
          <span className="text-[0.7vw] font-medium leading-tight text-gray-500">No Preview</span>
        </div>
      ) : null}
    </div>
  );
};

export default LazyPreview;

