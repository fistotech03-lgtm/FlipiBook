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
          <div className="absolute top-[5%] left-1/2 -translate-x-1/2 rounded-full py-[0.08vw] px-[0.35vw] flex items-center gap-[0.2vw] shadow-xs border z-10" style={{ backgroundColor: badgeBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
            <div className="w-[0.75vw] h-[0.75vw] rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:map-marker" className="text-red-500 text-[0.5vw]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[0.42vw] font-bold" style={{ color: textTitle }}>Fisto Tech</span>
              <span className="text-[0.34vw]" style={{ color: textSubtitle }}>Coimbatore</span>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 rounded-t-lg p-[0.3vw] shadow-md flex flex-col gap-[0.15vw] border-t" style={{ backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
            <div className="w-[1vw] h-[0.1vw] rounded-full mx-auto mb-[0.05vw]" style={{ backgroundColor: isDark ? '#475569' : '#d1d5db' }} />
            <div className="flex items-center gap-[0.25vw]">
              <img 
                src={DEFAULT_MAP_DATA.image} 
                alt="" 
                className="w-[1.3vw] h-[1.3vw] rounded object-cover flex-shrink-0" 
              />
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-[0.45vw] font-bold truncate leading-tight" style={{ color: textTitle }}>Fisto Tech Private Limited</span>
                <span className="text-[0.36vw] truncate" style={{ color: textSubtitle }}>Coimbatore , India</span>
                <div className="flex items-center gap-[0.12vw] mt-[0.02vw]">
                  <span className="text-amber-500 text-[0.38vw]">★</span>
                  <span className="text-[0.36vw] font-bold" style={{ color: textTitle }}>4.9</span>
                  <span className="text-[0.32vw]" style={{ color: textSubtitle }}>(1500)</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-[0.15vw] mt-[0.05vw]">
              <div className="text-white rounded text-[0.34vw] font-medium py-[0.1vw] flex items-center justify-center gap-[0.08vw]" style={{ backgroundColor: buttonColor || '#000000' }}>
                <Icon icon="mdi:directions" className="text-[0.38vw]" />
                <span>Directions</span>
              </div>
              <div className="rounded text-[0.34vw] font-medium py-[0.1vw] flex items-center justify-center gap-[0.08vw]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6', color: isDark ? '#f9fafb' : '#1f2937' }}>
                <Icon icon="mdi:phone" className="text-[0.38vw]" />
                <span>Call</span>
              </div>
              <div className="rounded text-[0.34vw] font-medium py-[0.1vw] flex items-center justify-center gap-[0.08vw]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6', color: isDark ? '#f9fafb' : '#1f2937' }}>
                <Icon icon="mdi:share-variant" className="text-[0.38vw]" />
                <span>Share</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* PREVIEW 2: Callout */}
      {templateId === 'callout' && (
        <>
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[88%] rounded-md p-[0.25vw] shadow-sm border flex items-center gap-[0.25vw]" style={{ backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
            <img 
              src={DEFAULT_MAP_DATA.image} 
              alt="" 
              className="w-[1.2vw] h-[1.2vw] rounded object-cover flex-shrink-0" 
            />
            <div className="flex-1 min-w-0 flex flex-col leading-tight">
              <span className="text-[0.44vw] font-bold truncate" style={{ color: textTitle }}>Fisto Tech Private Limited</span>
              <span className="text-[0.35vw] truncate" style={{ color: textSubtitle }}>Coimbatore , India</span>
              <div className="flex items-center gap-[0.12vw] mt-[0.03vw]">
                <span className="text-amber-500 text-[0.35vw]">★</span>
                <span className="text-[0.35vw] font-bold" style={{ color: textTitle }}>4.9</span>
                <span className="text-[0.32vw]" style={{ color: textSubtitle }}>(1500)</span>
              </div>
            </div>
            <div className="absolute -bottom-[0.25vw] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[0.2vw] border-x-transparent border-t-[0.25vw]" style={{ borderTopColor: cardBg }} />
          </div>

          <div className="absolute top-[58%] left-1/2 -translate-x-1/2 rounded-full py-[0.08vw] px-[0.3vw] flex items-center gap-[0.15vw] shadow-xs border" style={{ backgroundColor: badgeBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            <Icon icon="mdi:map-marker" className="text-red-500 text-[0.5vw]" />
            <span className="text-[0.38vw] font-bold" style={{ color: textTitle }}>Fisto Tech</span>
          </div>
        </>
      )}

      {/* PREVIEW 3: Gallery */}
      {templateId === 'gallery' && (
        <>
          <div className="absolute top-[5%] left-1/2 -translate-x-1/2 rounded-full py-[0.08vw] px-[0.35vw] flex items-center gap-[0.15vw] shadow-xs border z-10" style={{ backgroundColor: badgeBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            <Icon icon="mdi:map-marker" className="text-red-500 text-[0.48vw]" />
            <span className="text-[0.4vw] font-bold" style={{ color: textTitle }}>Fisto Tech</span>
          </div>

          <div className="absolute bottom-0 inset-x-0 rounded-t-lg p-[0.25vw] shadow-md flex flex-col gap-[0.15vw] border-t" style={{ backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
            <div className="w-[1vw] h-[0.1vw] rounded-full mx-auto" style={{ backgroundColor: isDark ? '#475569' : '#d1d5db' }} />
            <div className="flex items-center gap-[0.25vw]">
              <img 
                src={DEFAULT_MAP_DATA.image} 
                alt="" 
                className="w-[1.2vw] h-[1.2vw] rounded object-cover flex-shrink-0" 
              />
              <div className="flex-1 min-w-0 flex flex-col leading-tight">
                <span className="text-[0.42vw] font-bold truncate" style={{ color: textTitle }}>Fisto Tech Private Limited</span>
                <span className="text-[0.34vw] truncate" style={{ color: textSubtitle }}>Coimbatore , India</span>
                <div className="flex items-center gap-[0.1vw]">
                  <span className="text-amber-500 text-[0.35vw]">★</span>
                  <span className="text-[0.34vw] font-bold" style={{ color: textTitle }}>4.9</span>
                  <span className="text-[0.3vw]" style={{ color: textSubtitle }}>(1500)</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-[0.1vw]">
              {DEFAULT_MAP_DATA.gallery.slice(0, 4).map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-[0.7vw] rounded-[2px] object-cover" />
              ))}
              <div className="relative w-full h-[0.7vw] rounded-[2px] overflow-hidden bg-black/60 flex items-center justify-center text-white text-[0.35vw] font-bold">
                +
              </div>
            </div>
            <div className="w-full text-white rounded text-[0.34vw] font-semibold py-[0.1vw] text-center" style={{ backgroundColor: buttonColor || '#000000' }}>
              View Details
            </div>
          </div>
        </>
      )}

      {/* PREVIEW 4: Carousel */}
      {templateId === 'carousel' && (
        <>
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 rounded-full py-[0.08vw] px-[0.3vw] flex items-center gap-[0.15vw] shadow-xs border z-10" style={{ backgroundColor: badgeBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            <Icon icon="mdi:map-marker" className="text-red-500 text-[0.48vw]" />
            <span className="text-[0.4vw] font-bold" style={{ color: textTitle }}>Fisto Tech</span>
          </div>

          <div className="absolute bottom-[0.5vw] inset-x-[0.25vw] rounded-md p-[0.25vw] shadow-sm flex items-center gap-[0.25vw] border" style={{ backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
            <img 
              src={DEFAULT_MAP_DATA.image} 
              alt="" 
              className="w-[1.2vw] h-[1.2vw] rounded object-cover flex-shrink-0" 
            />
            <div className="flex-1 min-w-0 flex flex-col leading-tight">
              <span className="text-[0.42vw] font-bold truncate" style={{ color: textTitle }}>Fisto Tech Private L...</span>
              <span className="text-[0.34vw] truncate" style={{ color: textSubtitle }}>Coimbatore , India</span>
              <div className="flex items-center gap-[0.08vw]">
                <span className="text-amber-500 text-[0.35vw]">★</span>
                <span className="text-[0.34vw] font-bold" style={{ color: textTitle }}>4.9</span>
                <span className="text-[0.3vw]" style={{ color: textSubtitle }}>(1500)</span>
              </div>
            </div>
            <div className="w-[0.75vw] h-[0.75vw] rounded-full border flex items-center justify-center flex-shrink-0" style={{ borderColor: buttonColor || '#000000', color: buttonColor || '#000000' }}>
              <Icon icon="mdi:chevron-right" className="text-[0.45vw]" />
            </div>
          </div>

          <div className="absolute bottom-[0.12vw] left-1/2 -translate-x-1/2 flex items-center gap-[0.12vw]">
            <div className="w-[0.15vw] h-[0.15vw] rounded-full" style={{ backgroundColor: buttonColor || '#000000' }} />
            <div className="w-[0.15vw] h-[0.15vw] rounded-full bg-cyan-200" />
            <div className="w-[0.15vw] h-[0.15vw] rounded-full bg-cyan-200" />
            <div className="w-[0.15vw] h-[0.15vw] rounded-full bg-cyan-200" />
          </div>
        </>
      )}

      {/* PREVIEW 5: Map Only */}
      {templateId === 'none' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-1">
          <div className="w-[1.5vw] h-[1.5vw] rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#ef4444]">
            <Icon icon="mdi:map-marker" className="text-[0.9vw]" />
          </div>
          <span className="text-[0.4vw] font-semibold text-gray-700 bg-white/85 px-[0.35vw] py-[0.08vw] rounded mt-[0.2vw] shadow-2xs">
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
      <div className="w-full h-full flex items-center justify-center p-[0.15vw] pointer-events-none select-none">
        <div className="relative w-full h-[88%] bg-slate-100 overflow-hidden rounded-[0.35vw] border border-gray-200/90 shadow-2xs group-hover:scale-105 transition-transform duration-200">
          <MapTemplateThumbnail templateId={tmpl.id} />
        </div>
      </div>
    );
  },
  insert: (cx, cy) => createMapElementNode(tmpl.id, {}, cx, cy),
  getSvgString: (isDrag) => getMapSvgCode(tmpl.id, !isDrag)
}));

export default MAP_ITEMS;
