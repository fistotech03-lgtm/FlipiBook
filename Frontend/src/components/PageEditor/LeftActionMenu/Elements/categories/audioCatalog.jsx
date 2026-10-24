/**
 * audioCatalog.jsx
 * Audio Presets Catalog for FlipiBook Elements Panel
 */
import React from 'react';
import { AUDIO_OPTIONS, createAudioElementNode } from '../utils/audioElementUtils';

export const AUDIO_ITEMS = AUDIO_OPTIONS.map((opt) => ({
  id: `audio-${opt.id}`,
  name: opt.name,
  category: 'audio',
  type: 'audio',
  renderPreview: () => (
    <div className="w-full h-full flex flex-col items-center justify-between p-[0.35vw] pointer-events-none select-none">
      <div className="w-full h-[65%] rounded-[0.25vw] bg-emerald-50/60 border border-emerald-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
        {opt.id === 'audio-icon' ? (
          <div className="flex items-center gap-[0.2vw] bg-white border border-gray-200 px-[0.5vw] py-[0.25vw] rounded-full shadow-xs">
            <svg width="0.9vw" height="0.9vw" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-600">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="text-[0.5vw] font-bold text-gray-700">Audio Pill</span>
          </div>
        ) : (
          <div className="w-[85%] h-[1.4vw] bg-white rounded-full border border-gray-200 flex items-center px-[0.3vw] gap-[0.2vw] shadow-xs">
            <div className="w-[0.8vw] h-[0.8vw] bg-emerald-600 rounded-full flex items-center justify-center">
              <svg width="0.35vw" height="0.35vw" viewBox="0 0 24 24" fill="white">
                <polygon points="6 4 18 12 6 20 6 4" />
              </svg>
            </div>
            <div className="flex-1 h-[2px] bg-gray-200 rounded-full"></div>
            <span className="text-[0.45vw] text-gray-500 font-medium">0:00</span>
          </div>
        )}
      </div>
      <div className="w-full text-center py-[0.1vw]">
        <span className="text-[0.58vw] font-medium text-gray-700 group-hover:text-emerald-600 transition-colors truncate block">
          {opt.name}
        </span>
      </div>
    </div>
  ),
  insert: (cx, cy) => createAudioElementNode(opt.id, cx, cy),
  getSvgString: (isDrag) => opt.svg
}));
