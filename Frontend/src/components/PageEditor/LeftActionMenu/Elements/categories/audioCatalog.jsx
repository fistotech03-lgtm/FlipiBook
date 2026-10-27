/**
 * audioCatalog.jsx
 * Audio Presets Catalog for FlipiBook Elements Panel
 * Uses the Audio Element UI templates from Audio.jsx
 */
import React from 'react';
import { AUDIO_TEMPLATES, createAudioElementNode, getAudioSvgCode } from '../utils/audioElementUtils';

/**
 * AudioPreview
 * Renders the accurate miniature audio player preview matching Audio.jsx
 */
export const AudioPreview = ({ template }) => {
  const tpl = template;

  return (
    <div className="w-full h-full flex flex-col justify-between p-[0.2vw] pointer-events-none select-none">
      {/* Header row with badge */}
      <div className="flex items-center justify-between w-full mb-[0.15vw]">
        <span className="text-[0.48vw] font-semibold px-[0.35vw] py-[0.05vw] rounded-full bg-orange-50 text-orange-600 border border-orange-200/60 shrink-0">
          {tpl.badge}
        </span>
        <span className="text-[0.4vw] text-gray-400 truncate ml-1 text-right">
          {tpl.subtitle}
        </span>
      </div>

      {/* Miniature Player Preview Card */}
      <div className="flex-1 w-full rounded-[0.4vw] flex items-center justify-center p-[0.15vw] overflow-hidden select-none">
        {tpl.id === 'glassmorphism' && (
          <div className="w-full h-full bg-slate-100/90 rounded-[0.4vw] border border-white shadow-2xs p-[0.3vw] flex flex-col justify-between">
            <div className="flex items-center gap-[0.3vw]">
              <div className="w-[1vw] h-[1vw] rounded bg-slate-200 flex items-center justify-center text-[0.5vw] text-slate-700">♪</div>
              <div className="leading-tight">
                <div className="text-[0.48vw] font-bold text-slate-900 truncate">Dynamic Track</div>
                <div className="text-[0.4vw] text-slate-400">Artist Name</div>
              </div>
            </div>
            <div className="w-full h-[2px] bg-slate-200 rounded-full relative">
              <div className="w-[35%] h-full bg-slate-700 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between text-[0.4vw] text-slate-600">
              <span>🔁</span>
              <div className="w-[0.9vw] h-[0.9vw] rounded-full bg-slate-200 flex items-center justify-center text-[0.45vw]">▶</div>
              <span>🔊</span>
            </div>
          </div>
        )}

        {tpl.id === 'forest-moss' && (
          <div className="w-full h-full bg-[#16291a] text-[#c9e4b7] rounded-[0.4vw] border border-[#23422a] p-[0.3vw] flex items-center gap-[0.4vw]">
            <div className="w-[1.8vw] h-[1.8vw] rounded border border-[#52845c] bg-[#193520] flex items-center justify-center text-[0.5vw] shrink-0">
              🖼️
            </div>
            <div className="flex-1 flex flex-col justify-between h-full py-[0.1vw]">
              <div className="flex items-center justify-between">
                <span className="text-[0.48vw] font-semibold text-[#e0f7d0] truncate">Song title</span>
                <div className="flex gap-[1px] items-end h-[0.6vw]">
                  <span className="w-[1.5px] h-[60%] bg-[#c9e4b7] rounded"></span>
                  <span className="w-[1.5px] h-[100%] bg-[#c9e4b7] rounded"></span>
                  <span className="w-[1.5px] h-[40%] bg-[#c9e4b7] rounded"></span>
                </div>
              </div>
              <div className="w-full h-[2px] bg-[#27462c] rounded-full">
                <div className="w-[45%] h-full bg-[#c9e4b7] rounded-full"></div>
              </div>
              <div className="flex items-center justify-between text-[0.4vw]">
                <span>🔁</span>
                <div className="w-[0.8vw] h-[0.8vw] rounded-full border border-[#c9e4b7] flex items-center justify-center text-[0.4vw]">▶</div>
                <span>🔊</span>
              </div>
            </div>
          </div>
        )}

        {tpl.id === 'cyber-blue' && (
          <div className="w-full h-full bg-[#0c1421] text-[#00f2fe] rounded-[0.4vw] border border-[#182840] p-[0.3vw] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[0.42vw]">
              <span>🔁</span>
              <span>⏮</span>
              <div className="w-[0.9vw] h-[0.9vw] rounded-full bg-[#00f2fe]/10 border border-[#00f2fe] flex items-center justify-center text-[0.45vw] shadow-[0_0_6px_#00f2fe]">▶</div>
              <span>⏭</span>
              <span>🔊</span>
            </div>
            <div className="flex items-center gap-[0.3vw] text-[0.4vw] font-mono">
              <span>0:10</span>
              <div className="flex-1 h-[2px] bg-[#16273c] rounded-full">
                <div className="w-[20%] h-full bg-[#00f2fe] rounded-full shadow-[0_0_4px_#00f2fe]"></div>
              </div>
              <span className="text-cyan-200">4:30</span>
            </div>
          </div>
        )}

        {tpl.id === 'silver-mono' && (
          <div
            style={{ background: 'linear-gradient(180deg, #b8b8b8, #8c8c8c 50%, #747474)' }}
            className="w-full h-[1.8vw] rounded-full px-[0.5vw] flex items-center justify-between text-slate-900 shadow-sm border border-white/40"
          >
            <span className="text-[0.4vw]">🔁</span>
            <span className="text-[0.4vw]">⏮</span>
            <div className="w-[0.9vw] h-[0.9vw] rounded-full border border-slate-900 flex items-center justify-center text-[0.4vw]">▶</div>
            <span className="text-[0.4vw]">⏭</span>
            <span className="text-[0.4vw] font-mono">1:20</span>
            <div className="w-[2vw] h-[2px] bg-black/25 rounded-full">
              <div className="w-[30%] h-full bg-slate-900 rounded-full"></div>
            </div>
            <span className="text-[0.4vw] font-mono">3:45</span>
            <span className="text-[0.4vw]">🔊</span>
          </div>
        )}

        {tpl.id === 'sunset-vibrant' && (
          <div
            style={{
              background: 'linear-gradient(90deg, #ff4328 0%, #ff2a55 35%, #e61972 70%, #c4188b 100%)',
              boxShadow: '0 4px 12px -2px rgba(230, 25, 114, 0.45)'
            }}
            className="w-full h-[1.8vw] rounded-full px-[0.5vw] flex items-center justify-between text-white shadow-sm"
          >
            <span className="text-[0.4vw]">🔁</span>
            <span className="text-[0.4vw]">⏮</span>
            <span className="text-[0.45vw] font-bold">▶</span>
            <span className="text-[0.4vw]">⏭</span>
            <span className="text-[0.38vw] font-medium whitespace-nowrap">1:20/2:59</span>
            <div className="flex-1 max-w-[2.5vw] h-[2px] bg-white/35 rounded-full mx-[0.2vw]">
              <div className="w-[45%] h-full bg-white rounded-full"></div>
            </div>
            <span className="text-[0.4vw]">🔊</span>
          </div>
        )}

        {tpl.id === 'cyberpunk-wide' && (
          <div className="w-full h-full bg-[#080d15] text-[#c084fc] rounded-[0.4vw] border border-[#162133] p-[0.3vw] flex flex-col justify-between">
            <div className="w-full h-[2px] bg-[#0e1a2b] rounded-full shadow-[0_0_4px_#00f2fe88]">
              <div className="w-[35%] h-full bg-[#00f2fe] rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[0.3vw]">
                <span className="text-[#00f2fe] text-[0.45vw]">▶</span>
                <span className="text-[0.38vw]">⏮</span>
                <span className="text-[0.38vw]">⏭</span>
                <span className="text-[0.38vw]">🔁</span>
              </div>
              <div className="flex items-center gap-[0.2vw] text-[0.38vw] font-mono">
                <span className="text-[#00f2fe]">0:00</span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-400">0:19</span>
                <span>🔊</span>
              </div>
            </div>
          </div>
        )}

        {tpl.id === 'audio-icon' && (
          <div className="w-[2.4vw] h-[1.5vw] bg-white rounded-[0.3vw] border border-red-900/60 flex items-center justify-center gap-[0.2vw] shadow-2xs">
            <span className="text-[0.4vw] text-gray-400">⏮</span>
            <span className="text-[0.55vw] text-black">▶</span>
            <span className="text-[0.4vw] text-gray-400">⏭</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const AUDIO_ITEMS = AUDIO_TEMPLATES.map((tpl) => ({
  id: `audio-${tpl.id}`,
  name: tpl.name,
  category: 'audio',
  type: 'audio',
  template: tpl,
  renderPreview: () => <AudioPreview template={tpl} />,
  insert: (cx, cy) => createAudioElementNode(tpl, cx, cy),
  getSvgString: (isDrag) => getAudioSvgCode(tpl, Date.now())
}));

export default AUDIO_ITEMS;
