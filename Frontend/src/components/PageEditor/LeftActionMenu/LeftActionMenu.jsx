import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

// Iconify icons matching the visual mockup
export const ElementsIcon = ({ className = "w-[1.1vw] h-[1.1vw]" }) => (
  <Icon icon="ph:diamonds-four" className={className} />
);

export const TempletsIcon = ({ className = "w-[1.1vw] h-[1.1vw]" }) => (
  <Icon icon="lucide:layout-template" className={className} />
);

export const StylesIcon = ({ className = "w-[1.1vw] h-[1.1vw]" }) => (
  <Icon icon="lucide:palette" className={className} />
);

export const IconsMenuIcon = ({ className = "w-[1.1vw] h-[1.1vw]" }) => (
  <Icon icon="lucide:shapes" className={className} />
);

export const LeftActionMenu = ({
  isPdfProject = false,
  isPdfMode = false,
  isRulerEnabled = true,
  activePageIndex = 0,
  onOpenTemplateModal,
  isElementsModalOpen = false,
  onToggleElementsModal,
  onCloseElementsModal,
  isStylesModalOpen = false,
  onToggleStylesModal,
  onCloseStylesModal,
  isIconsModalOpen = false,
  onToggleIconsModal,
  onCloseIconsModal,
}) => {
  if (isPdfProject || isPdfMode) return null;

  const [rulerActive, setRulerActive] = useState(isRulerEnabled);
  const menuContainerRef = useRef(null);

  // Sync with prop
  useEffect(() => {
    setRulerActive(isRulerEnabled);
  }, [isRulerEnabled]);

  // Listen to global ruler toggle event
  useEffect(() => {
    const handleToggleRuler = (e) => {
      if (e.detail !== undefined) {
        const val = typeof e.detail === 'object' && e.detail !== null
          ? (e.detail.isRulerEnabled !== undefined ? e.detail.isRulerEnabled : e.detail)
          : e.detail;
        setRulerActive(Boolean(val));
      } else {
        setRulerActive(prev => !prev);
      }
    };
    window.addEventListener('editor_toggleRuler', handleToggleRuler);
    return () => window.removeEventListener('editor_toggleRuler', handleToggleRuler);
  }, []);

  // Handle menu item click
  const handleItemClick = (menuKey) => {
    if (menuKey === 'elements') {
      if (onCloseStylesModal) onCloseStylesModal();
      if (onCloseIconsModal) onCloseIconsModal();
      if (onToggleElementsModal) onToggleElementsModal();
      return;
    }
    if (menuKey === 'templets') {
      if (onCloseElementsModal) onCloseElementsModal();
      if (onCloseStylesModal) onCloseStylesModal();
      if (onCloseIconsModal) onCloseIconsModal();
      if (onOpenTemplateModal) onOpenTemplateModal(activePageIndex);
      return;
    }
    if (menuKey === 'styles') {
      if (onCloseElementsModal) onCloseElementsModal();
      if (onCloseIconsModal) onCloseIconsModal();
      if (onToggleStylesModal) onToggleStylesModal();
      return;
    }
    if (menuKey === 'icons') {
      if (onCloseElementsModal) onCloseElementsModal();
      if (onCloseStylesModal) onCloseStylesModal();
      if (onToggleIconsModal) onToggleIconsModal();
      return;
    }
  };

  return (
    <div
      ref={menuContainerRef}
      className="absolute z-40 select-none transition-all duration-300 ease-in-out"
      style={{
        left: rulerActive ? '2.2vw' : '1vw',
        top: rulerActive ? '2.2vw' : '1vw',
      }}
    >
      {/* ── Main Vertical Menu ── */}
      <div className="bg-white rounded-[0.7vw] border border-gray-300 shadow-sm p-[0.28vw] flex flex-col items-center gap-[0.45vw] w-[3.4vw]">
        {/* 1. Elements */}
        <button
          onClick={() => handleItemClick('elements')}
          title="Add Elements"
          className={`flex flex-col items-center justify-center w-full aspect-square p-[0.2vw] rounded-[0.42vw] transition-all cursor-pointer group ${
            isElementsModalOpen
              ? 'bg-black text-white shadow-xs'
              : 'text-[#9EA1A7] hover:bg-black hover:text-white'
          }`}
        >
          <ElementsIcon className={`w-[1.05vw] h-[1.05vw] transition-colors ${isElementsModalOpen ? 'text-white' : 'text-[#9EA1A7] group-hover:text-white'}`} />
          <span className={`text-[0.54vw] leading-none mt-[0.25vw] font-medium tracking-tight transition-colors ${isElementsModalOpen ? 'text-white' : 'text-gray-600 group-hover:text-white'}`}>Elements</span>
        </button>

        {/* 2. Templets */}
        <button
          onClick={() => handleItemClick('templets')}
          title="Templates"
          className="flex flex-col items-center justify-center w-full aspect-square p-[0.2vw] rounded-[0.42vw] transition-all cursor-pointer group text-[#9EA1A7] hover:bg-black hover:text-white"
        >
          <TempletsIcon className="w-[1.05vw] h-[1.05vw] transition-colors text-[#9EA1A7] group-hover:text-white" />
          <span className="text-[0.54vw] leading-none mt-[0.25vw] font-medium tracking-tight transition-colors text-gray-600 group-hover:text-white">Templets</span>
        </button>

        {/* 3. Styles */}
        <button
          onClick={() => handleItemClick('styles')}
          title="Styles & Themes"
          className={`flex flex-col items-center justify-center w-full aspect-square p-[0.2vw] rounded-[0.42vw] transition-all cursor-pointer group ${
            isStylesModalOpen
              ? 'bg-black text-white shadow-xs'
              : 'text-[#9EA1A7] hover:bg-black hover:text-white'
          }`}
        >
          <StylesIcon className={`w-[1.05vw] h-[1.05vw] transition-colors ${isStylesModalOpen ? 'text-white' : 'text-[#9EA1A7] group-hover:text-white'}`} />
          <span className={`text-[0.54vw] leading-none mt-[0.25vw] font-medium tracking-tight transition-colors ${isStylesModalOpen ? 'text-white' : 'text-gray-600 group-hover:text-white'}`}>Styles</span>
        </button>

        {/* 4. Icons */}
        <button
          onClick={() => handleItemClick('icons')}
          title="Icons"
          className={`flex flex-col items-center justify-center w-full aspect-square p-[0.2vw] rounded-[0.42vw] transition-all cursor-pointer group ${
            isIconsModalOpen
              ? 'bg-black text-white shadow-xs'
              : 'text-[#9EA1A7] hover:bg-black hover:text-white'
          }`}
        >
          <IconsMenuIcon className={`w-[1.05vw] h-[1.05vw] transition-colors ${isIconsModalOpen ? 'text-white' : 'text-[#9EA1A7] group-hover:text-white'}`} />
          <span className={`text-[0.54vw] leading-none mt-[0.25vw] font-medium tracking-tight transition-colors ${isIconsModalOpen ? 'text-white' : 'text-gray-600 group-hover:text-white'}`}>Icons</span>
        </button>
      </div>
    </div>
  );
};

export default LeftActionMenu;
