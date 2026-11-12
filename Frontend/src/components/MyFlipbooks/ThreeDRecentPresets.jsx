import React, { useState, useEffect } from 'react';
import { ArrowRight, MoreVertical, Heart, Info, Edit2, Trash2 } from 'lucide-react';
import { Icon } from '@iconify/react';
import { RECENT_3D_PRESETS } from './recent3dPresets';

export default function ThreeDRecentPresets({
  models = [],
  favorites = new Set(),
  toggleFavorite,
  onViewPreset,
  onAddToFlipbook,
  onLaunchEditor,
  onRename,
  onDelete,
  onViewAll,
  formatModelSize,
  ModelCardPreview
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Close menu on click outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (!e.target.closest('.preset-more-menu')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Use models from backend if present; otherwise fallback to the default sample presets
  const displayModels = (models && models.length > 0)
    ? models.slice(0, 5)
    : RECENT_3D_PRESETS;

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

      {/* Cards Grid: Matching the exact old card style from screenshot */}
      <div className="grid grid-cols-5 gap-[0.85vw]">
        {displayModels.map((model) => {
          const id = model.modelId || model.id;
          const title = model.displayName || model.name || 'Untitled 3D Model';
          const fileType = (model.type || model.name?.split('.').pop() || 'glb').toUpperCase();
          const sizeMB = formatModelSize ? formatModelSize(model.size) : model.size;
          const createdDate = model.uploadedAt
            ? new Date(model.uploadedAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : '12 Nov 2026';
          const isFav = favorites?.has ? favorites.has(id) : false;
          const isMenuOpen = activeMenuId === id;

          return (
            <div
              key={id || title}
              className={`group bg-white rounded-[0.9vw] border transition-all duration-200 flex flex-col justify-between relative ${
                isMenuOpen ? 'z-30 ring-1 ring-gray-300' : 'z-10'
              } border-gray-200/80 hover:border-gray-300 hover:shadow-md`}
            >
              {/* Top Thumbnail Container */}
              <div className="w-full h-[9.5vw] min-h-[140px] rounded-t-[0.9vw] bg-slate-50 border-b border-gray-100 relative flex items-center justify-center overflow-hidden">
                {ModelCardPreview && model.url ? (
                  <ModelCardPreview model={model} />
                ) : model.image ? (
                  <img
                    src={model.image}
                    alt={title}
                    className="w-full h-full object-contain p-[0.6vw] transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Icon icon="ph:cube-duotone" className="w-[2.4vw] h-[2.4vw] text-slate-300 group-hover:text-[#ea543a] transition-colors" />
                  </div>
                )}

                {/* Format Badge Top Left (e.g. GLB) */}
                <span className="absolute top-[0.45vw] left-[0.45vw] bg-black/65 backdrop-blur-xs text-white text-[0.58vw] font-bold px-[0.38vw] py-[0.12vw] rounded-[0.25vw] pointer-events-none z-10 uppercase">
                  {fileType}
                </span>

                {/* Favorite Heart Top Right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite && toggleFavorite(id);
                  }}
                  className="absolute top-[0.45vw] right-[0.45vw] w-[1.6vw] h-[1.6vw] rounded-full bg-white/80 backdrop-blur-xs hover:bg-white text-gray-400 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer shadow-xs z-10"
                  title="Favorite"
                >
                  <Heart className={`w-[0.85vw] h-[0.85vw] ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Card Main Body */}
              <div className="p-[0.75vw] flex flex-col justify-between flex-1 space-y-[0.55vw]">
                <div>
                  <div className="flex items-start justify-between gap-[0.4vw]">
                    <h3
                      className="text-[0.82vw] font-bold text-gray-800 line-clamp-1 hover:text-[#ea543a] cursor-pointer transition-colors"
                      onClick={() => onLaunchEditor && onLaunchEditor(id)}
                      title={title}
                    >
                      {title}
                    </h3>

                    {/* Three Dots More Menu Dropdown */}
                    <div className="relative preset-more-menu shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : id);
                        }}
                        className="p-[0.2vw] text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="w-[0.85vw] h-[0.85vw]" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-[0.25vw] w-[8.8vw] min-w-[120px] bg-white border border-gray-200/90 rounded-[0.55vw] shadow-xl py-[0.25vw] z-50">
                          {/* 1. File Info */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              onViewPreset && onViewPreset(model);
                            }}
                            className="w-full text-left px-[0.7vw] py-[0.38vw] text-[0.74vw] font-medium text-gray-700 hover:bg-[#fff5f3] hover:text-[#ea543a] flex items-center gap-[0.4vw] cursor-pointer transition-colors"
                          >
                            <Info className="w-[0.8vw] h-[0.8vw]" />
                            <span>File info</span>
                          </button>

                          {/* 2. Rename */}
                          {onRename && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                onRename(model);
                              }}
                              className="w-full text-left px-[0.7vw] py-[0.38vw] text-[0.74vw] font-medium text-gray-700 hover:bg-[#fff5f3] hover:text-[#ea543a] flex items-center gap-[0.4vw] cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-[0.8vw] h-[0.8vw]" />
                              <span>Rename</span>
                            </button>
                          )}

                          {/* 3. Delete */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              onDelete && onDelete(model);
                            }}
                            className="w-full text-left px-[0.7vw] py-[0.38vw] text-[0.74vw] font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-[0.4vw] cursor-pointer transition-colors border-t border-gray-100"
                          >
                            <Trash2 className="w-[0.8vw] h-[0.8vw]" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata (e.g., 2.44 MB • 12 Nov 2026) */}
                  <p className="text-[0.68vw] text-gray-400 font-medium mt-[0.15vw]">
                    {[sizeMB, createdDate].filter(Boolean).join(' • ') || 'WebGL Model'}
                  </p>
                </div>

                {/* Bottom Action Button: Open 3D Editor */}
                <button
                  type="button"
                  onClick={() => onLaunchEditor && onLaunchEditor(id)}
                  className="w-full py-[0.38vw] bg-[#fff5f3] hover:bg-[#ea543a] text-[#ea543a] hover:text-white rounded-[0.45vw] text-[0.74vw] font-semibold transition-all flex items-center justify-center gap-[0.3vw] cursor-pointer"
                >
                  <Icon icon="ph:cube-bold" className="w-[0.8vw] h-[0.8vw]" />
                  <span>Open 3D Editor</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
