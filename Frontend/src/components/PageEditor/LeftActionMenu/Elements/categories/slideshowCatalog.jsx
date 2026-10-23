/**
 * slideshowCatalog.jsx
 * Slideshow Presets Catalog for FlipiBook Elements Panel
 */
import React from 'react';
import { createSlideshowElementNode, get3DCoverflowSvg, getFlatGallerySvg } from '../utils/slideshowElementUtils';

export const SLIDESHOW_ITEMS = [
  {
    id: 'slideshow-3d-coverflow',
    name: '3D Coverflow',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex flex-col items-center justify-between p-[0.35vw] pointer-events-none select-none">
        <div className="w-full h-[65%] rounded-[0.25vw] bg-purple-50/60 border border-purple-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width="40" height="28" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="8" width="20" height="24" rx="2" stroke="#a855f7" strokeWidth="2" fill="#f3f4f6" />
            <rect x="38" y="8" width="20" height="24" rx="2" stroke="#a855f7" strokeWidth="2" fill="#f3f4f6" />
            <rect x="15" y="2" width="30" height="36" rx="3" stroke="#a855f7" strokeWidth="2" fill="white" />
            <path d="M22 20L25 17V23L22 20Z" fill="#a855f7" />
            <path d="M38 20L35 17V23L38 20Z" fill="#a855f7" />
          </svg>
        </div>
        <div className="w-full text-center py-[0.15vw]">
          <span className="text-[0.6vw] font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
            3D Coverflow
          </span>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('coverflow', cx, cy),
    getSvgString: (isDrag) => get3DCoverflowSvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"')
  },
  {
    id: 'slideshow-flat-gallery',
    name: 'Flat Gallery',
    category: 'slideshow',
    type: 'slideshow',
    renderPreview: () => (
      <div className="w-full h-full flex flex-col items-center justify-between p-[0.35vw] pointer-events-none select-none">
        <div className="w-full h-[65%] rounded-[0.25vw] bg-sky-50/60 border border-sky-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width="40" height="28" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="14" height="32" rx="2" stroke="#0ea5e9" strokeWidth="1.5" fill="#f0f9ff" opacity="0.6" />
            <rect x="44" y="4" width="14" height="32" rx="2" stroke="#0ea5e9" strokeWidth="1.5" fill="#f0f9ff" opacity="0.6" />
            <rect x="18" y="2" width="24" height="36" rx="3" stroke="#0ea5e9" strokeWidth="2" fill="white" />
          </svg>
        </div>
        <div className="w-full text-center py-[0.15vw]">
          <span className="text-[0.6vw] font-medium text-gray-700 group-hover:text-sky-600 transition-colors">
            Flat Carousel
          </span>
        </div>
      </div>
    ),
    insert: (cx, cy) => createSlideshowElementNode('flat', cx, cy),
    getSvgString: (isDrag) => getFlatGallerySvg(Date.now(), isDrag ? '' : 'transform="translate(100, 150)"')
  }
];
