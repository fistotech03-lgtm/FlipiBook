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
      <div className="w-full h-full flex flex-col bg-white overflow-hidden pointer-events-none select-none">
        <div className="relative w-full flex-1 bg-slate-50 border border-gray-200 rounded-[0.3vw] flex flex-col items-center justify-center p-[0.4vw] group-hover:border-indigo-400 transition-colors">
          <div className="w-[85%] h-[75%] border-2 border-dashed border-blue-400 rounded-md bg-white flex flex-col items-center justify-center relative shadow-2xs">
            <div className="w-full h-[22%] bg-gray-200 border-b border-gray-300 rounded-t-[0.2vw] flex items-center px-[0.3vw] gap-[0.15vw]">
              <div className="w-[0.25vw] h-[0.25vw] rounded-full bg-red-400" />
              <div className="w-[0.25vw] h-[0.25vw] rounded-full bg-yellow-400" />
              <div className="w-[0.25vw] h-[0.25vw] rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex items-center justify-center text-blue-500">
              <Icon icon="lucide:link" className="w-[1vw] h-[1vw]" />
            </div>
          </div>
        </div>
        <div className="pt-[0.3vw] flex items-center justify-between">
          <span className="text-[0.65vw] font-medium text-gray-800 truncate">
            Embed Frame
          </span>
          <span className="text-[0.52vw] font-semibold px-[0.3vw] py-[0.05vw] rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
            HTML/URL
          </span>
        </div>
      </div>
    ),
    insert: (cx, cy) => createEmbedElementNode(cx, cy),
    getSvgString: (isDrag) => getEmbedSvgCode(!isDrag)
  }
];
