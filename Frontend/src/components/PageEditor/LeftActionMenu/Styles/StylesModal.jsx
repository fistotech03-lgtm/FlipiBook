import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Icon } from '@iconify/react';
import { X } from 'lucide-react';

// Quick Page Background Presets (matching screenshot)
export const PAGE_BG_PRESETS = [
  { name: 'White', color: '#ffffff', border: true },
  { name: 'Ivory', color: '#fefce8' },
  { name: 'Cream', color: '#fef9c3' },
  { name: 'Light Gray', color: '#f3f4f6' },
  { name: 'Soft Blue', color: '#f0f9ff' },
  { name: 'Warm Sand', color: '#fef3c7' },
  { name: 'Charcoal', color: '#1f2937' },
  { name: 'Deep Navy', color: '#0f172a' },
];

// Curated Palettes for Styles panel (matching screenshot)
export const COLOR_PALETTES = [
  { name: 'Warm Sunset', colors: ['#ea543a', '#f97316', '#fbbf24', '#fef08a'] },
  { name: 'Ocean Tech', colors: ['#0284c7', '#38bdf8', '#0ea5e9', '#bae6fd'] },
  { name: 'Forest Fresh', colors: ['#059669', '#10b981', '#34d399', '#a7f3d0'] },
  { name: 'Royal Purple', colors: ['#7c3aed', '#a855f7', '#c084fc', '#e9d5ff'] },
  { name: 'Monochrome', colors: ['#111827', '#4b5563', '#9ca3af', '#f3f4f6'] },
  { name: 'Rose Bloom', colors: ['#e11d48', '#f43f5e', '#fb7185', '#ffe4e6'] },
];

export const StylesModal = ({
  isOpen = false,
  onClose,
  isRulerEnabled = true,
  activePageIndex = 0,
  saveModifiedPageHtml,
  dragConstraintsRef,
}) => {
  const dragControls = useDragControls();
  const [rulerActive, setRulerActive] = useState(Boolean(isRulerEnabled));

  useEffect(() => {
    setRulerActive(Boolean(isRulerEnabled));
  }, [isRulerEnabled]);

  useEffect(() => {
    const handleToggleRuler = (e) => {
      if (e.detail !== undefined) {
        const val = typeof e.detail === 'object' && e.detail !== null
          ? (e.detail.isRulerEnabled !== undefined ? e.detail.isRulerEnabled : e.detail)
          : e.detail;
        setRulerActive(Boolean(val));
      } else {
        setRulerActive((prev) => !prev);
      }
    };
    window.addEventListener('editor_toggleRuler', handleToggleRuler);
    return () => window.removeEventListener('editor_toggleRuler', handleToggleRuler);
  }, []);

  const handleApplyBackground = (color) => {
    const container = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`);
    const svg = container?.querySelector('svg');
    if (!svg) return;

    let bgRect = svg.querySelector('rect[data-name="Page Background"]') ||
                 svg.querySelector('rect[data-name="Background"]') ||
                 svg.querySelector('.page-bg-rect');

    if (!bgRect) {
      bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('id', `bg-${Math.random().toString(36).substr(2, 9)}`);
      bgRect.setAttribute('x', '0');
      bgRect.setAttribute('y', '0');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('data-name', 'Page Background');
      bgRect.classList.add('page-bg-rect');
      svg.insertBefore(bgRect, svg.firstChild);
    }

    bgRect.setAttribute('fill', color);

    if (saveModifiedPageHtml) {
      saveModifiedPageHtml(activePageIndex, svg);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={dragConstraintsRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="absolute z-50 bg-white rounded-[0.75vw] border border-gray-300 shadow-[0_12px_45px_rgba(0,0,0,0.14)] flex flex-col overflow-hidden select-none transition-[left,top] duration-300 ease-in-out"
        style={{
          width: '20vw',
          minWidth: '300px',
          maxHeight: '80vh',
          left: rulerActive ? '6.2vw' : '5vw',
          top: rulerActive ? '2.2vw' : '1vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header & Drag Handle ── */}
        <div className="px-[1.1vw] pt-[0.6vh] pb-[0.8vh]">
          {/* Centered Six-Dot Drag Handle */}
          <div className="flex justify-center items-center">
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex items-center justify-center py-[0.1vh] px-[0.6vw] rounded-[0.35vw] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing select-none"
              title="Drag to move panel"
            >
              <Icon icon="ph:dots-six-bold" className="w-[1.3vw] h-[1.3vw] text-gray-400 hover:text-gray-600" />
            </div>
          </div>

          {/* Title & Close Row */}
          <div className="flex items-center justify-between mt-[0.2vh]">
            <div className="flex items-center gap-[0.5vw]">
              <Icon icon="lucide:palette" className="w-[1.2vw] h-[1.2vw] text-gray-900" />
              <h2 className="text-[1.15vw] font-bold text-gray-900 leading-tight">Styles</h2>
            </div>

            <button
              onClick={onClose}
              className="w-[1.6vw] h-[1.6vw] rounded-[0.45vw] flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X size="1.05vw" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-[1.1vw] pb-[1.4vh] pt-[0.4vh] flex flex-col gap-[1.6vh] border-t border-gray-100">
          {/* PAGE BACKGROUND */}
          <div>
            <span className="text-[0.68vw] font-bold text-[#64748b] uppercase tracking-wider mb-[1vh] block">
              PAGE BACKGROUND
            </span>
            <div className="grid grid-cols-4 gap-[0.5vw]">
              {PAGE_BG_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyBackground(preset.color)}
                  className="flex flex-col items-center gap-[0.35vh] p-[0.3vw] rounded-[0.5vw] hover:bg-gray-50 transition-colors cursor-pointer group"
                  title={`Apply ${preset.name} background`}
                >
                  <div
                    className={`w-[2.3vw] h-[2.3vw] rounded-full shadow-2xs group-hover:scale-110 group-active:scale-95 transition-all ${
                      preset.border ? 'border border-gray-200' : ''
                    }`}
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-[0.6vw] text-gray-600 group-hover:text-gray-900 font-medium truncate w-full text-center">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* COLOR PALETTES */}
          <div>
            <span className="text-[0.68vw] font-bold text-[#64748b] uppercase tracking-wider mb-[1vh] block">
              COLOR PALETTES
            </span>
            <div className="flex flex-col gap-[0.7vh]">
              {COLOR_PALETTES.map((palette) => (
                <div
                  key={palette.name}
                  className="p-[0.6vw] rounded-[0.55vw] border border-gray-100 hover:border-gray-200 bg-[#fbfbfc] hover:bg-white transition-all flex items-center justify-between"
                >
                  <span className="text-[0.7vw] font-semibold text-gray-700">{palette.name}</span>
                  <div className="flex items-center gap-[0.3vw]">
                    {palette.colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleApplyBackground(c)}
                        className="w-[1.15vw] h-[1.15vw] rounded-full shadow-2xs hover:scale-125 transition-transform cursor-pointer"
                        style={{ backgroundColor: c }}
                        title={`Apply ${c}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StylesModal;
