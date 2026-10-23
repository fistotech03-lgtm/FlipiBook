/**
 * mapCatalog.jsx
 * Google Maps Presets Catalog for FlipiBook Elements Panel
 */
import React from 'react';
import { Icon } from '@iconify/react';
import { MAP_TEMPLATES, createMapElementNode, getMapSvgCode } from '../utils/mapElementUtils';

export const MAP_ITEMS = MAP_TEMPLATES.map((tmpl) => ({
  id: `map-${tmpl.id}`,
  name: tmpl.name,
  category: 'google-maps',
  type: 'map',
  badge: tmpl.badge,
  renderPreview: () => {
    return (
      <div className="w-full h-full flex flex-col items-center justify-between p-[0.35vw] pointer-events-none select-none">
        {/* Map Header Card */}
        <div className="w-full h-[65%] rounded-[0.25vw] bg-blue-50/60 border border-blue-100 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
          {/* Subtle map grid texture lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:6px_6px]" />
          <Icon icon="fluent-color:location-24" className="w-[1.8vw] h-[1.8vw] drop-shadow-sm z-10" />
          <span className="text-[0.55vw] font-bold text-gray-700 mt-[0.1vw] z-10 truncate px-[0.2vw]">
            Google Maps
          </span>
        </div>

        {/* Layout description pill */}
        <div className="w-full text-center py-[0.15vw]">
          <span className="text-[0.6vw] font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
            {tmpl.name}
          </span>
        </div>
      </div>
    );
  },
  insert: (cx, cy) => createMapElementNode(tmpl.id, {}, cx, cy),
  getSvgString: (isDrag) => getMapSvgCode(tmpl.id, !isDrag)
}));
