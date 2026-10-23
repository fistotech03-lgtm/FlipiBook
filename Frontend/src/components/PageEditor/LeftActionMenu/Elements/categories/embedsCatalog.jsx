/**
 * embedsCatalog.jsx
 * 3rd-Party Web Embeds Catalog for FlipiBook Elements Panel
 */
import React from 'react';
import { Icon } from '@iconify/react';
import { createEmbedElementNode, getEmbedSvgCode } from '../utils/embedElementUtils';

export const EMBED_ITEMS = [
  {
    id: 'embed-frame-custom',
    name: 'Embed Frame',
    category: 'embeds',
    type: 'embed',
    renderPreview: () => (
      <div className="w-full h-full flex flex-col items-center justify-between p-[0.35vw] pointer-events-none select-none">
        <div className="w-full h-[65%] rounded-[0.25vw] bg-indigo-50/60 border border-indigo-100 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
          <Icon icon="lucide:code-2" className="w-[1.8vw] h-[1.8vw] text-indigo-500 drop-shadow-sm" />
          <span className="text-[0.55vw] font-bold text-gray-700 mt-[0.1vw]">
            Web Embed
          </span>
        </div>
        <div className="w-full text-center py-[0.15vw]">
          <span className="text-[0.6vw] font-medium text-gray-500 group-hover:text-indigo-600 transition-colors">
            HTML / URL Frame
          </span>
        </div>
      </div>
    ),
    insert: (cx, cy) => createEmbedElementNode(cx, cy),
    getSvgString: (isDrag) => getEmbedSvgCode(!isDrag)
  }
];
