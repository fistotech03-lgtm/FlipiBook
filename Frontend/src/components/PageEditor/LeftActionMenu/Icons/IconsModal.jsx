import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Icon } from '@iconify/react';
import { X, Search, Shapes } from 'lucide-react';
import { icons } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Precompute catalog of all Lucide icons (1,800+ icons)
export const ALL_LUCIDE_ICONS = Object.keys(icons).map((key) => {
  const displayName = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return {
    key,
    name: displayName,
    searchKey: `${key.toLowerCase()} ${displayName.toLowerCase()}`,
  };
});

// Cache for extracted SVG markup to prevent re-extracting on every click/drag
const svgCache = new Map();

const extractIconSvg = (key, IconComp) => {
  if (svgCache.has(key)) return svgCache.get(key);
  if (!IconComp) return { html: '', viewBox: '0 0 24 24' };

  try {
    const markup = renderToStaticMarkup(
      React.createElement(IconComp, { size: 24, strokeWidth: 2 })
    );
    const parser = new DOMParser();
    const doc = parser.parseFromString(markup, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    const data = {
      html: svgEl ? svgEl.innerHTML : '',
      viewBox: svgEl?.getAttribute('viewBox') || '0 0 24 24',
    };
    svgCache.set(key, data);
    return data;
  } catch (err) {
    console.error('[IconsModal] Failed to extract SVG markup:', err);
    return { html: '', viewBox: '0 0 24 24' };
  }
};

export const IconsModal = ({
  isOpen = false,
  onClose,
  onSelect,
  isRulerEnabled = true,
  activePageIndex = 0,
  dragConstraintsRef,
  position = 'left',
  style: customStyle = {},
  className: customClassName = '',
}) => {
  const dragControls = useDragControls();
  const modalRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rulerActive, setRulerActive] = useState(Boolean(isRulerEnabled));
  const isRight = position === 'right';

  // Close modal when clicking outside if docked to right side
  useEffect(() => {
    if (!isOpen || !isRight) return;
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        if (onClose) onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, isRight, onClose]);

  // Sync with prop
  useEffect(() => {
    setRulerActive(Boolean(isRulerEnabled));
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
        setRulerActive((prev) => !prev);
      }
    };
    window.addEventListener('editor_toggleRuler', handleToggleRuler);
    return () => window.removeEventListener('editor_toggleRuler', handleToggleRuler);
  }, []);

  // Filtered icons matching search
  const filteredIcons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ALL_LUCIDE_ICONS;
    const cleanQuery = query.replace(/[\s-_]+/g, '');
    return ALL_LUCIDE_ICONS.filter(
      (item) => item.searchKey.includes(query) || item.key.toLowerCase().includes(cleanQuery)
    );
  }, [searchQuery]);

  // Lazy loading on scroll (chunk size 60)
  const PAGE_SIZE = 60;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when search query changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  // Handle container scroll to load remaining icons
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredIcons.length));
    }
  };

  // Click to add icon to page center or select for target component
  const handleAddIcon = (item) => {
    const IconComp = icons[item.key];
    const svgData = extractIconSvg(item.key, IconComp);

    if (onSelect) {
      onSelect({
        name: item.key,
        displayName: item.name,
        html: svgData.html,
        viewBox: svgData.viewBox,
      });
      return;
    }

    window.dispatchEvent(
      new CustomEvent('add-icon-to-editor', {
        detail: {
          pageIndex: activePageIndex,
          icon: {
            name: item.name,
            iconKey: item.key,
            html: svgData.html,
            viewBox: svgData.viewBox,
          },
        },
      })
    );
  };

  // Drag start to place icon at dropped position
  const handleDragStart = (e, item) => {
    const IconComp = icons[item.key];
    const svgData = extractIconSvg(item.key, IconComp);

    const payload = {
      type: 'icon',
      name: item.name,
      iconName: item.key,
      icon: {
        name: item.name,
        iconKey: item.key,
        html: svgData.html,
        viewBox: svgData.viewBox,
      },
    };

    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (!isOpen) return null;

  const displayedIcons = filteredIcons.slice(0, visibleCount);

  const defaultPosition = isRight
    ? {
        right: '24.5vw',
        top: '8vh',
        left: 'auto',
      }
    : {
        left: rulerActive ? '6.2vw' : '5vw',
        top: rulerActive ? '2.2vw' : '1vw',
        right: 'auto',
      };

  const defaultClasses = isRight
    ? 'fixed z-[5000] bg-white rounded-[0.75vw] border border-gray-300 shadow-[0_12px_45px_rgba(0,0,0,0.14)] flex flex-col overflow-hidden select-none transition-[right,top] duration-300 ease-in-out'
    : 'absolute z-50 bg-white rounded-[0.75vw] border border-gray-300 shadow-[0_12px_45px_rgba(0,0,0,0.14)] flex flex-col overflow-hidden select-none transition-[left,top] duration-300 ease-in-out';

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
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
        className={`${defaultClasses} ${customClassName}`.trim()}
        style={{
          width: '21.5vw',
          minWidth: '310px',
          height: '68vh',
          maxHeight: '640px',
          ...defaultPosition,
          ...customStyle,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header & Drag Handle ── */}
        <div className="px-[0.9vw] pt-[0.5vh] pb-[0.7vh]">
          {/* Centered Six-Dot Drag Handle */}
          <div className="flex justify-center items-center">
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex items-center justify-center py-[0.1vh] px-[0.6vw] rounded-[0.35vw] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing select-none"
              title="Drag to move panel"
            >
              <Icon icon="ph:dots-six-bold" className="w-[1.2vw] h-[1.2vw] text-gray-400 hover:text-gray-600" />
            </div>
          </div>

          {/* Title & Close Row */}
          <div className="flex items-center justify-between mt-[0.2vh]">
            <div className="flex items-center gap-[0.45vw]">
              <Shapes className="w-[1.1vw] h-[1.1vw] text-gray-900" />
              <div className="flex items-baseline gap-[0.35vw]">
                <h2 className="text-[1.05vw] font-bold text-gray-900 leading-tight">Icons</h2>
                <span className="text-[0.6vw] text-gray-400 font-semibold bg-gray-100 px-[0.4vw] py-[0.1vh] rounded-full">
                  {filteredIcons.length.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-[1.5vw] h-[1.5vw] rounded-[0.4vw] flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X size="1vw" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-[0.75vh]">
            <div className="relative flex items-center">
              <Search size="0.85vw" className="absolute left-[0.65vw] text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search icons (e.g. arrow, heart)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-[2vw] pr-[1.8vw] py-[0.55vh] text-[0.74vw] bg-[#F4F5F6] rounded-[0.45vw] border border-transparent hover:border-gray-200 focus:border-gray-400 focus:bg-white outline-none transition-all text-gray-800 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-[0.55vw] text-gray-400 hover:text-gray-600 text-[0.65vw] cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Icons Grid Body with Lazy Infinite Scroll ── */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scrollbar p-[0.75vw] border-t border-gray-100"
        >
          <div className="grid grid-cols-5 gap-[0.45vw]">
            {displayedIcons.map((item) => {
              const IconComp = icons[item.key];
              if (!IconComp) return null;

              return (
                <button
                  key={item.key}
                  onClick={() => handleAddIcon(item)}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, item)}
                  title={`Click to add or drag to place ${item.name}`}
                  className="flex flex-col items-center justify-center p-[0.4vw] rounded-[0.45vw] border border-gray-100 hover:border-gray-300 hover:shadow-xs bg-gray-50/50 hover:bg-white transition-all group cursor-grab active:cursor-grabbing aspect-square select-none"
                >
                  <IconComp
                    className="w-[1.6vw] h-[1.6vw] min-w-[22px] min-h-[22px] text-gray-700 group-hover:text-black group-hover:scale-110 transition-transform pointer-events-none"
                    strokeWidth={1.8}
                  />
                  <span className="text-[0.52vw] font-medium text-gray-500 group-hover:text-gray-900 mt-[0.3vh] truncate w-full text-center pointer-events-none leading-tight">
                    {item.name}
                  </span>
                </button>
              );
            })}

            {displayedIcons.length === 0 && (
              <div className="col-span-5 py-[4vh] text-center text-gray-400 text-[0.75vw]">
                No icons found for "{searchQuery}"
              </div>
            )}

            {visibleCount < filteredIcons.length && (
              <div className="col-span-5 py-[1.2vh] text-center text-gray-400 text-[0.62vw] flex items-center justify-center gap-[0.35vw]">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></span>
                Loading more icons... ({visibleCount} of {filteredIcons.length})
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IconsModal;
