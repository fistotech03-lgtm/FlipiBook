/**
 * slideshowCatalog.jsx
 * Clean, Code-Generated Swiper.js Presets for FlipiBook Elements Panel
 * Features ONLY the 5 official Swiper effects: Fade, Cube, Coverflow, Flip, Cards
 * 100% vector SVG previews, zero external images
 */
import React from 'react';
import {
  createSlideshowElementNode,
  getBannerSliderSvg,
  SLIDESHOW_PRESET_CONFIGS
} from '../utils/slideshowElementUtils';

export const SLIDESHOW_ITEMS = [
  {
    id: 'slideshow-fade',
    name: 'Effect Fade',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-amber-50/70 border border-amber-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="56" height="34" rx="3" stroke="#f59e0b" strokeWidth="1.2" fill="#fffbeb" />
            <rect x="6" y="6" width="48" height="26" rx="2.5" fill="#fde68a" stroke="#f59e0b" strokeWidth="0.8" />
            <rect x="10" y="8" width="40" height="22" rx="2" fill="#f59e0b" fillOpacity="0.85" />
            <circle cx="30" cy="18" r="4" fill="#ffffff" fillOpacity="0.75" />
            <rect x="23" y="33.5" width="8" height="1.8" rx="0.9" fill="#f59e0b" />
            <circle cx="34" cy="34.4" r="0.9" fill="#fcd34d" />
            <circle cx="37" cy="34.4" r="0.9" fill="#fcd34d" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('fade', cx, cy),
    getSvgString: (isDrag) => getBannerSliderSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"', SLIDESHOW_PRESET_CONFIGS.fade)
  },
  {
    id: 'slideshow-cube',
    name: 'Effect Cube',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-emerald-50/70 border border-emerald-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="56" height="34" rx="3" stroke="#10b981" strokeWidth="1.2" fill="#ecfdf5" />
            {/* 3D Cube Faces */}
            <path d="M30 7L46 13L30 19L14 13Z" fill="#6ee7b7" stroke="#059669" strokeWidth="0.8" />
            <path d="M14 13L30 19V31L14 25Z" fill="#10b981" stroke="#059669" strokeWidth="0.8" />
            <path d="M30 19L46 13V25L30 31Z" fill="#047857" stroke="#059669" strokeWidth="0.8" />
            <path d="M10 20C8 23 9 27 13 29" stroke="#10b981" strokeWidth="1" strokeLinecap="round" />
            <path d="M50 20C52 23 51 27 47 29" stroke="#10b981" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('cube', cx, cy),
    getSvgString: (isDrag) => getBannerSliderSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"', SLIDESHOW_PRESET_CONFIGS.cube)
  },
  {
    id: 'slideshow-coverflow',
    name: 'Effect Coverflow',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-blue-50/70 border border-blue-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="56" height="34" rx="3" stroke="#3b82f6" strokeWidth="1.2" fill="#f8fafc" />
            {/* Left Side Perspective Card */}
            <rect x="6" y="8" width="16" height="22" rx="2" fill="#93c5fd" fillOpacity="0.5" stroke="#60a5fa" strokeWidth="0.8" />
            {/* Right Side Perspective Card */}
            <rect x="38" y="8" width="16" height="22" rx="2" fill="#93c5fd" fillOpacity="0.5" stroke="#60a5fa" strokeWidth="0.8" />
            {/* Center Front Card */}
            <rect x="18" y="6" width="24" height="26" rx="2.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
            <circle cx="30" cy="17" r="3" fill="#ffffff" fillOpacity="0.9" />
            <path d="M24 23C24 20.5 27 19.5 30 19.5C33 19.5 36 20.5 36 23" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="8" cy="19" r="1.5" fill="#3b82f6" />
            <circle cx="52" cy="19" r="1.5" fill="#3b82f6" />
            <rect x="24" y="33" width="6" height="1.8" rx="0.9" fill="#3b82f6" />
            <circle cx="33" cy="33.9" r="0.9" fill="#93c5fd" />
            <circle cx="36" cy="33.9" r="0.9" fill="#93c5fd" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('coverflow', cx, cy),
    getSvgString: (isDrag) => getBannerSliderSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"', SLIDESHOW_PRESET_CONFIGS.coverflow)
  },
  {
    id: 'slideshow-flip',
    name: 'Effect Flip',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-pink-50/70 border border-pink-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="56" height="34" rx="3" stroke="#ec4899" strokeWidth="1.2" fill="#fdf2f8" />
            {/* Flipping Card */}
            <path d="M22 8L40 10L36 29L18 27Z" fill="#f472b6" stroke="#db2777" strokeWidth="0.9" />
            <path d="M23 10L38 12L35 27L20 25Z" fill="#ec4899" />
            <path d="M46 14C49 18 48 23 44 26" stroke="#ec4899" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,2" />
            <polygon points="43,26 46,28 46,24" fill="#ec4899" />
            <circle cx="26" cy="33.5" r="1" fill="#ec4899" />
            <circle cx="30" cy="33.5" r="1" fill="#fbcfe8" />
            <circle cx="34" cy="33.5" r="1" fill="#fbcfe8" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('flip', cx, cy),
    getSvgString: (isDrag) => getBannerSliderSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"', SLIDESHOW_PRESET_CONFIGS.flip)
  },
  {
    id: 'slideshow-cards',
    name: 'Effect Cards',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="w-full h-[88%] rounded-[0.35vw] bg-purple-50/70 border border-purple-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <svg viewBox="0 0 60 40" className="w-[85%] h-[85%] object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="56" height="34" rx="3" stroke="#8b5cf6" strokeWidth="1.2" fill="#faf5ff" />
            <rect x="18" y="5" width="24" height="23" rx="2" fill="#ddd6fe" stroke="#c4b5fd" strokeWidth="0.8" />
            <rect x="15" y="8" width="28" height="23" rx="2.5" fill="#a78bfa" stroke="#8b5cf6" strokeWidth="0.9" />
            <rect x="12" y="11" width="34" height="22" rx="3" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="1" />
            <circle cx="29" cy="20" r="3" fill="#ffffff" fillOpacity="0.8" />
            <rect x="25" y="34" width="7" height="1.8" rx="0.9" fill="#8b5cf6" />
            <circle cx="34.5" cy="34.9" r="0.9" fill="#c4b5fd" />
          </svg>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('cards', cx, cy),
    getSvgString: (isDrag) => getBannerSliderSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"', SLIDESHOW_PRESET_CONFIGS.cards)
  }
];

export default SLIDESHOW_ITEMS;
