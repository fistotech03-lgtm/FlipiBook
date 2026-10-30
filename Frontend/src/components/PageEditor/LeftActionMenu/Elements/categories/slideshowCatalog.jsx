/**
 * slideshowCatalog.jsx
 * Slideshow Presets Catalog for FlipiBook Elements Panel
 * Inspired by Slideshow Studio Pro Multi-Engine System
 */
import React from 'react';
import {
  createSlideshowElementNode,
  getFilmstripSvg,
  get3DStackSvg,
  get3DCoverflowSvg,
  getFadeshowSvg,
  getInfiniteCarouselSvg,
  getMonochromeMinimalSvg,
  getFlatGallerySvg
} from '../utils/slideshowElementUtils';

export const SLIDESHOW_ITEMS = [
  {
    id: 'slideshow-card-filmstrip',
    name: 'Card Filmstrip',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-blue-50/70 border border-blue-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="8" width="12" height="22" rx="2" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5" fill="#eff6ff" opacity="0.7" />
            <rect x="46" y="8" width="12" height="22" rx="2" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5" fill="#eff6ff" opacity="0.7" />
            <rect x="16" y="3" width="28" height="28" rx="2.5" stroke="#3b82f6" strokeWidth="2" fill="white" />
            <path d="M5 19L3 20L5 21" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" />
            <path d="M55 19L57 20L55 21" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" />
            <rect x="23" y="34" width="6" height="2" rx="1" fill="#3b82f6" />
            <circle cx="33" cy="35" r="1" fill="#93c5fd" />
            <circle cx="37" cy="35" r="1" fill="#93c5fd" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('filmstrip', cx, cy),
    getSvgString: (isDrag) => getFilmstripSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"')
  },
  {
    id: 'slideshow-3d-stack',
    name: '3D Pop-Out Stack',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-cyan-50/70 border border-cyan-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="7" width="20" height="25" rx="2" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.5" fill="#ecfeff" transform="skewY(4)" opacity="0.7" />
            <rect x="35" y="7" width="20" height="25" rx="2" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.5" fill="#ecfeff" transform="skewY(-4)" opacity="0.7" />
            <rect x="16" y="2" width="28" height="34" rx="3" stroke="#06b6d4" strokeWidth="2" fill="white" />
            <circle cx="26" cy="31" r="1.2" fill="#06b6d4" />
            <circle cx="30" cy="31" r="1" fill="#a5f3fc" />
            <circle cx="34" cy="31" r="1" fill="#a5f3fc" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('stack', cx, cy),
    getSvgString: (isDrag) => get3DStackSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"')
  },
  {
    id: 'slideshow-3d-coverflow',
    name: '3D Coverflow',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-purple-50/60 border border-purple-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="8" width="20" height="24" rx="2" stroke="#a855f7" strokeWidth="1.5" fill="#faf5ff" opacity="0.7" />
            <rect x="38" y="8" width="20" height="24" rx="2" stroke="#a855f7" strokeWidth="1.5" fill="#faf5ff" opacity="0.7" />
            <rect x="15" y="2" width="30" height="36" rx="3" stroke="#a855f7" strokeWidth="2" fill="white" />
            <path d="M22 20L25 17V23L22 20Z" fill="#a855f7" />
            <path d="M38 20L35 17V23L38 20Z" fill="#a855f7" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('coverflow', cx, cy),
    getSvgString: (isDrag) => get3DCoverflowSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"')
  },
  {
    id: 'slideshow-css-fadeshow',
    name: 'CSS Fadeshow',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-orange-50/70 border border-orange-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="3" width="52" height="34" rx="3" stroke="#f97316" strokeWidth="1.8" fill="white" />
            <rect x="4" y="23" width="52" height="14" rx="1" fill="#ea580c" fillOpacity="0.12" />
            <rect x="8" y="26" width="20" height="3" rx="1" fill="#f97316" />
            <rect x="8" y="31" width="12" height="2" rx="0.5" fill="#fdba74" />
            <circle cx="44" cy="32" r="1.2" fill="#f97316" />
            <circle cx="48" cy="32" r="1" fill="#fdba74" />
            <circle cx="52" cy="32" r="1" fill="#fdba74" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('fade', cx, cy),
    getSvgString: (isDrag) => getFadeshowSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"')
  },
  {
    id: 'slideshow-pure-infinite',
    name: 'Infinite Carousel',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-indigo-50/70 border border-indigo-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="7" width="16" height="26" rx="2" stroke="#818cf8" strokeWidth="1" strokeOpacity="0.6" fill="#e0e7ff" opacity="0.6" />
            <rect x="42" y="7" width="16" height="26" rx="2" stroke="#818cf8" strokeWidth="1" strokeOpacity="0.6" fill="#e0e7ff" opacity="0.6" />
            <rect x="18" y="3" width="24" height="34" rx="2.5" stroke="#6366f1" strokeWidth="2" fill="white" />
            <path d="M10 37H50" stroke="#6366f1" strokeWidth="1" strokeDasharray="2,2" opacity="0.7" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('pure', cx, cy),
    getSvgString: (isDrag) => getInfiniteCarouselSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"')
  },
  {
    id: 'slideshow-monochrome-minimal',
    name: 'Monochrome Minimal',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="6" width="52" height="28" rx="2" stroke="#475569" strokeWidth="1.5" fill="#0f172a" />
            <rect x="7" y="9" width="46" height="22" rx="1" fill="#334155" opacity="0.8" />
            <rect x="10" y="24" width="18" height="2.5" rx="0.5" fill="#f8fafc" opacity="0.9" />
            <circle cx="28" cy="27" r="1" fill="#f8fafc" />
            <circle cx="32" cy="27" r="1" fill="#94a3b8" />
            <circle cx="36" cy="27" r="1" fill="#94a3b8" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('mono', cx, cy),
    getSvgString: (isDrag) => getMonochromeMinimalSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"')
  },
  {
    id: 'slideshow-flat-gallery',
    name: 'Flat Gallery',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-sky-50/60 border border-sky-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="14" height="22" rx="2" stroke="#0ea5e9" strokeWidth="1.5" fill="#f0f9ff" opacity="0.6" />
            <rect x="44" y="3" width="14" height="22" rx="2" stroke="#0ea5e9" strokeWidth="1.5" fill="#f0f9ff" opacity="0.6" />
            <rect x="18" y="2" width="24" height="25" rx="3" stroke="#0ea5e9" strokeWidth="2" fill="white" />
            <rect x="4" y="30" width="8" height="6" rx="1" stroke="#94a3b8" strokeWidth="0.8" fill="#f8fafc" />
            <rect x="14" y="30" width="8" height="6" rx="1" stroke="#94a3b8" strokeWidth="0.8" fill="#f8fafc" />
            <rect x="24" y="30" width="12" height="7" rx="1" stroke="#0ea5e9" strokeWidth="1.2" fill="white" />
            <rect x="38" y="30" width="8" height="6" rx="1" stroke="#94a3b8" strokeWidth="0.8" fill="#f8fafc" />
            <rect x="48" y="30" width="8" height="6" rx="1" stroke="#94a3b8" strokeWidth="0.8" fill="#f8fafc" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('flat', cx, cy),
    getSvgString: (isDrag) => getFlatGallerySvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"')
  }
];

export default SLIDESHOW_ITEMS;
