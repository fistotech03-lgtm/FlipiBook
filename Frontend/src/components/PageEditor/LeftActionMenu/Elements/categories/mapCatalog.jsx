/**
 * mapCatalog.jsx
 * Google Maps Presets Catalog for FlipiBook Elements Panel
 */
import React from 'react';
import { Icon } from '@iconify/react';
import { DEFAULT_MAP_DATA, MAP_TEMPLATES, createMapElementNode, getMapSvgCode } from '../utils/mapElementUtils';

export const MapTemplateThumbnail = ({ templateId, theme = 'Light Theme', buttonColor = '#000000' }) => {
  const isDark = String(theme).toLowerCase().includes('dark');
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textTitle = isDark ? '#f9fafb' : '#111827';
  const textSubtitle = isDark ? '#9ca3af' : '#4b5563';
  const badgeBg = isDark ? '#1e293b' : '#ffffff';

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden flex flex-col select-none">
      {/* Map Background Simulation */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter contrast-[1.05] brightness-[1.02]"
        style={{
          backgroundImage: `url('${DEFAULT_MAP_DATA.image}')`,
          backgroundSize: 'cover',
          filter: isDark ? 'invert(90%) hue-rotate(180deg) contrast(95%)' : 'none'
        }}
      />
      {/* Light Map overlay tint */}
      <div className={`absolute inset-0 ${isDark ? 'bg-black/20' : 'bg-sky-50/20'} backdrop-blur-[0.5px]`} />

      {/* PREVIEW 1: Actions */}
      {templateId === 'actions' && (
        <>
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 rounded-full py-[0.15vw] px-[0.45vw] flex items-center gap-[0.25vw] shadow-sm border" style={{ backgroundColor: badgeBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
            <div className="w-[0.9vw] h-[0.9vw] rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:map-marker" className="text-red-500 text-[0.6vw]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[0.48vw] font-bold" style={{ color: textTitle }}>Fisto Tech</span>
              <span className="text-[0.38vw]" style={{ color: textSubtitle }}>Coimbatore</span>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 rounded-t-xl p-[0.45vw] shadow-lg flex flex-col gap-[0.2vw] border-t" style={{ backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
            <div className="w-[1.2vw] h-[0.12vw] rounded-full mx-auto mb-[0.1vw]" style={{ backgroundColor: isDark ? '#475569' : '#d1d5db' }} />
            <div className="flex items-center gap-[0.35vw]">
              <img 
                src={DEFAULT_MAP_DATA.image} 
                alt="" 
                className="w-[1.8vw] h-[1.8vw] rounded-md object-cover flex-shrink-0" 
              />
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-[0.52vw] font-bold truncate leading-tight" style={{ color: textTitle }}>Fisto Tech Private Limited</span>
                <span className="text-[0.42vw] truncate" style={{ color: textSubtitle }}>Coimbatore , India</span>
                <div className="flex items-center gap-[0.15vw] mt-[0.05vw]">
                  <span className="text-amber-500 text-[0.45vw]">★</span>
                  <span className="text-[0.42vw] font-bold" style={{ color: textTitle }}>4.9</span>
                  <span className="text-[0.38vw]" style={{ color: textSubtitle }}>(1500)</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-[0.2vw] mt-[0.1vw]">
              <div className="text-white rounded text-[0.4vw] font-medium py-[0.2vw] flex items-center justify-center gap-[0.1vw]" style={{ backgroundColor: buttonColor || '#000000' }}>
                <Icon icon="mdi:directions" className="text-[0.45vw]" />
                <span>Directions</span>
              </div>
              <div className="rounded text-[0.4vw] font-medium py-[0.2vw] flex items-center justify-center gap-[0.1vw]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6', color: isDark ? '#f9fafb' : '#1f2937' }}>
                <Icon icon="mdi:phone" className="text-[0.45vw]" />
                <span>Call</span>
              </div>
              <div className="rounded text-[0.4vw] font-medium py-[0.2vw] flex items-center justify-center gap-[0.1vw]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6', color: isDark ? '#f9fafb' : '#1f2937' }}>
                <Icon icon="mdi:share-variant" className="text-[0.45vw]" />
                <span>Share</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* PREVIEW 2: Callout */}
      {templateId === 'callout' && (
        <>
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[86%] rounded-lg p-[0.35vw] shadow-md border flex items-center gap-[0.3vw]" style={{ backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
            <img 
              src={DEFAULT_MAP_DATA.image} 
              alt="" 
              className="w-[1.6vw] h-[1.6vw] rounded object-cover flex-shrink-0" 
            />
            <div className="flex-1 min-w-0 flex flex-col leading-tight">
              <span className="text-[0.5vw] font-bold truncate" style={{ color: textTitle }}>Fisto Tech Private Limited</span>
              <span className="text-[0.4vw] truncate" style={{ color: textSubtitle }}>Coimbatore , India</span>
              <div className="flex items-center gap-[0.15vw] mt-[0.05vw]">
                <span className="text-amber-500 text-[0.4vw]">★</span>
                <span className="text-[0.4vw] font-bold" style={{ color: textTitle }}>4.9</span>
                <span className="text-[0.36vw]" style={{ color: textSubtitle }}>(1500)</span>
              </div>
            </div>
            <div className="absolute -bottom-[0.3vw] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[0.25vw] border-x-transparent border-t-[0.3vw]" style={{ borderTopColor: cardBg }} />
          </div>

          <div className="absolute top-[52%] left-1/2 -translate-x-1/2 rounded-full py-[0.1vw] px-[0.35vw] flex items-center gap-[0.2vw] shadow-sm border" style={{ backgroundColor: badgeBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            <Icon icon="mdi:map-marker" className="text-red-500 text-[0.6vw]" />
            <span className="text-[0.45vw] font-bold" style={{ color: textTitle }}>Fisto Tech</span>
          </div>
        </>
      )}

      {/* PREVIEW 3: Gallery */}
      {templateId === 'gallery' && (
        <>
          <div className="absolute top-[6%] left-1/2 -translate-x-1/2 rounded-full py-[0.1vw] px-[0.4vw] flex items-center gap-[0.2vw] shadow-sm border" style={{ backgroundColor: badgeBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            <Icon icon="mdi:map-marker" className="text-red-500 text-[0.55vw]" />
            <span className="text-[0.45vw] font-bold" style={{ color: textTitle }}>Fisto Tech</span>
          </div>

          <div className="absolute bottom-0 inset-x-0 rounded-t-xl p-[0.4vw] shadow-lg flex flex-col gap-[0.2vw] border-t" style={{ backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
            <div className="w-[1.2vw] h-[0.12vw] rounded-full mx-auto" style={{ backgroundColor: isDark ? '#475569' : '#d1d5db' }} />
            <div className="flex items-center gap-[0.3vw]">
              <img 
                src={DEFAULT_MAP_DATA.image} 
                alt="" 
                className="w-[1.6vw] h-[1.6vw] rounded object-cover flex-shrink-0" 
              />
              <div className="flex-1 min-w-0 flex flex-col leading-tight">
                <span className="text-[0.48vw] font-bold truncate" style={{ color: textTitle }}>Fisto Tech Private Limited</span>
                <span className="text-[0.38vw] truncate" style={{ color: textSubtitle }}>Coimbatore , India</span>
                <div className="flex items-center gap-[0.1vw]">
                  <span className="text-amber-500 text-[0.4vw]">★</span>
                  <span className="text-[0.38vw] font-bold" style={{ color: textTitle }}>4.9</span>
                  <span className="text-[0.34vw]" style={{ color: textSubtitle }}>(1500)</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-[0.15vw]">
              {DEFAULT_MAP_DATA.gallery.slice(0, 4).map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-[0.9vw] rounded-[2px] object-cover" />
              ))}
              <div className="relative w-full h-[0.9vw] rounded-[2px] overflow-hidden bg-black/60 flex items-center justify-center text-white text-[0.4vw] font-bold">
                +
              </div>
            </div>
            <div className="w-full text-white rounded text-[0.4vw] font-semibold py-[0.2vw] text-center" style={{ backgroundColor: buttonColor || '#000000' }}>
              View Details
            </div>
          </div>
        </>
      )}

      {/* PREVIEW 4: Carousel */}
      {templateId === 'carousel' && (
        <>
          <div className="absolute top-[32%] left-1/2 -translate-x-1/2 rounded-full py-[0.1vw] px-[0.35vw] flex items-center gap-[0.2vw] shadow-sm border" style={{ backgroundColor: badgeBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            <Icon icon="mdi:map-marker" className="text-red-500 text-[0.55vw]" />
            <span className="text-[0.45vw] font-bold" style={{ color: textTitle }}>Fisto Tech</span>
          </div>

          <div className="absolute bottom-[0.8vw] inset-x-[0.3vw] rounded-lg p-[0.3vw] shadow-md flex items-center gap-[0.3vw] border" style={{ backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
            <img 
              src={DEFAULT_MAP_DATA.image} 
              alt="" 
              className="w-[1.6vw] h-[1.6vw] rounded object-cover flex-shrink-0" 
            />
            <div className="flex-1 min-w-0 flex flex-col leading-tight">
              <span className="text-[0.48vw] font-bold truncate" style={{ color: textTitle }}>Fisto Tech Private L...</span>
              <span className="text-[0.38vw] truncate" style={{ color: textSubtitle }}>Coimbatore , India</span>
              <div className="flex items-center gap-[0.1vw]">
                <span className="text-amber-500 text-[0.4vw]">★</span>
                <span className="text-[0.38vw] font-bold" style={{ color: textTitle }}>4.9</span>
                <span className="text-[0.34vw]" style={{ color: textSubtitle }}>(1500)</span>
              </div>
            </div>
            <div className="w-[0.9vw] h-[0.9vw] rounded-full border flex items-center justify-center flex-shrink-0" style={{ borderColor: buttonColor || '#000000', color: buttonColor || '#000000' }}>
              <Icon icon="mdi:chevron-right" className="text-[0.55vw]" />
            </div>
          </div>

          <div className="absolute bottom-[0.2vw] left-1/2 -translate-x-1/2 flex items-center gap-[0.15vw]">
            <div className="w-[0.15vw] h-[0.15vw] rounded-full" style={{ backgroundColor: buttonColor || '#000000' }} />
            <div className="w-[0.15vw] h-[0.15vw] rounded-full bg-cyan-200" />
            <div className="w-[0.15vw] h-[0.15vw] rounded-full bg-cyan-200" />
            <div className="w-[0.15vw] h-[0.15vw] rounded-full bg-cyan-200" />
          </div>
        </>
      )}

      {/* PREVIEW 5: Map Only */}
      {templateId === 'none' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2">
          <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#ef4444]">
            <Icon icon="mdi:map-marker" className="text-[1.1vw]" />
          </div>
          <span className="text-[0.45vw] font-semibold text-gray-700 bg-white/80 px-[0.4vw] py-[0.1vw] rounded mt-[0.3vw] shadow-xs">
            Clean Map Only
          </span>
        </div>
      )}
    </div>
  );
};

export const MAP_ITEMS = MAP_TEMPLATES.map((tmpl) => ({
  id: `map-${tmpl.id}`,
  name: tmpl.name,
  category: 'google-maps',
  type: 'map',
  badge: tmpl.badge,
  renderPreview: () => {
    return (
      <div className="w-full h-full flex flex-col bg-white overflow-hidden pointer-events-none select-none">
        {/* Card Preview Area */}
        <div className="relative w-full flex-1 bg-slate-100 overflow-hidden flex flex-col select-none rounded-[0.3vw]">
          <MapTemplateThumbnail templateId={tmpl.id} />
        </div>

        {/* Footer Info */}
        <div className="pt-[0.3vw] flex items-center justify-between">
          <span className="text-[0.65vw] font-medium text-gray-800 truncate">
            {tmpl.name}
          </span>
          {tmpl.badge && (
            <span className="text-[0.52vw] font-semibold px-[0.3vw] py-[0.05vw] rounded bg-teal-50 text-[#00828a] border border-teal-100">
              {tmpl.badge}
            </span>
          )}
        </div>
      </div>
    );
  },
  insert: (cx, cy) => createMapElementNode(tmpl.id, {}, cx, cy),
  getSvgString: (isDrag) => getMapSvgCode(tmpl.id, !isDrag)
}));
