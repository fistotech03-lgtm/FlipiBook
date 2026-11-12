import React from 'react';
import { ArrowRight, MoreVertical, Eye, Plus } from 'lucide-react';
import { RECENT_3D_PRESETS } from './recent3dPresets';

export default function ThreeDRecentPresets({
  onViewPreset,
  onAddToFlipbook,
  onViewAll
}) {
  return (
    <div className="w-full bg-white rounded-[1vw] p-[1.1vw] shadow-[0_2px_12px_rgba(15,23,42,0.04)] border border-slate-100 flex-shrink-0 select-none">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-[0.9vw]">
        <h2 className="text-[1.15vw] font-bold text-slate-900 tracking-tight">
          Recent 3D Models
        </h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-[0.35vw] text-[0.82vw] font-bold text-[#ec5137] hover:text-[#d4432c] cursor-pointer transition-colors group"
        >
          <span>View All</span>
          <ArrowRight size="0.9vw" className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Cards Grid: Exactly 5 items side by side */}
      <div className="grid grid-cols-5 gap-[0.85vw]">
        {RECENT_3D_PRESETS.map((preset) => (
          <div
            key={preset.id}
            className="group bg-white rounded-[0.9vw] p-[0.7vw] border border-slate-200/90 hover:border-slate-300 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between"
          >
            {/* Image Box */}
            <div className="w-full h-[6.8vw] min-h-[90px] rounded-[0.6vw] bg-[#f8f9fc] flex items-center justify-center relative overflow-hidden">
              <img
                src={preset.image}
                alt={preset.name}
                className="w-full h-full object-contain p-[0.4vw] group-hover:scale-105 transition-transform duration-300"
              />
              <button
                type="button"
                className="absolute top-[0.4vw] right-[0.4vw] w-[1.5vw] h-[1.5vw] rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
              >
                <MoreVertical size="0.85vw" />
              </button>
            </div>

            {/* Meta */}
            <div className="mt-[0.6vw] flex flex-col space-y-[0.3vw]">
              <h3 className="text-[0.84vw] font-bold text-slate-900 truncate" title={preset.name}>
                {preset.name}
              </h3>

              <div className="flex items-center text-[0.68vw] text-slate-400 font-medium">
                <span>{preset.format}</span>
                <span className="mx-[0.3vw]">•</span>
                <span>{preset.size}</span>
              </div>

              {/* Tag / Category Badge */}
              <div className="pt-[0.1vw]">
                <span className={`inline-block px-[0.55vw] py-[0.12vw] rounded-[0.3vw] text-[0.62vw] font-semibold border ${preset.categoryColor}`}>
                  {preset.category}
                </span>
              </div>

              {/* Action Buttons: View & Add to Flipbook */}
              <div className="grid grid-cols-[auto_1fr] gap-[0.4vw] pt-[0.4vw]">
                <button
                  type="button"
                  onClick={() => onViewPreset && onViewPreset(preset)}
                  className="flex items-center justify-center gap-[0.25vw] px-[0.65vw] py-[0.42vw] rounded-[0.45vw] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[0.72vw] font-semibold cursor-pointer shadow-2xs transition-colors"
                >
                  <Eye size="0.75vw" className="text-slate-500" />
                  <span>View</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddToFlipbook && onAddToFlipbook(preset)}
                  className="flex items-center justify-center gap-[0.25vw] px-[0.65vw] py-[0.42vw] rounded-[0.45vw] bg-[#ec5137] hover:bg-[#d4432c] text-white text-[0.72vw] font-semibold cursor-pointer shadow-2xs transition-colors truncate"
                >
                  <Plus size="0.75vw" strokeWidth={2.5} />
                  <span className="truncate">Add to Flipbook</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

