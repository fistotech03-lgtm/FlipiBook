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
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="relative w-full h-[88%] bg-slate-50 border border-gray-200 rounded-[0.35vw] flex flex-col items-center justify-center p-[0.3vw] group-hover:scale-105 group-hover:border-indigo-400 transition-all duration-200 shadow-2xs">
          <div className="w-[85%] h-[82%] border-2 border-dashed border-blue-400 rounded-md bg-white flex flex-col items-center justify-center relative shadow-2xs">
            <div className="w-full h-[22%] bg-gray-100 border-b border-gray-200 rounded-t-[0.2vw] flex items-center px-[0.3vw] gap-[0.15vw]">
              <div className="w-[0.25vw] h-[0.25vw] rounded-full bg-red-400" />
              <div className="w-[0.25vw] h-[0.25vw] rounded-full bg-yellow-400" />
              <div className="w-[0.25vw] h-[0.25vw] rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex items-center justify-center text-blue-500">
              <Icon icon="lucide:link" className="w-[1.1vw] h-[1.1vw]" />
            </div>
          </div>
        </div>
      </div>
    ),
    insert: (cx, cy) => createEmbedElementNode(cx, cy),
    getSvgString: (isDrag) => getEmbedSvgCode(!isDrag)
  }
];

export default EMBED_ITEMS;
