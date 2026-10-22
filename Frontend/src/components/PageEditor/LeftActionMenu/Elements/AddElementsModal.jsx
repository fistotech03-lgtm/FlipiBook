import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Icon } from '@iconify/react';
import { X, Search } from 'lucide-react';
import { ELEMENT_CATEGORIES, ELEMENT_ITEMS } from './elementCatalog';

export const AddElementsModal = ({
  isOpen = false,
  onClose,
  isRulerEnabled = true,
  activePageIndex = 0,
  pages = [],
  saveModifiedPageHtml,
  setSelectedLayerId,
  setActiveMainTool,
  baseWidth = 210,
  baseHeight = 297,
  dragConstraintsRef,
}) => {
  const dragControls = useDragControls();
  const lastInsertTimeRef = useRef(0);
  const [selectedCategory, setSelectedCategory] = useState('shapes');
  const [searchQuery, setSearchQuery] = useState('');
  const [rulerActive, setRulerActive] = useState(Boolean(isRulerEnabled));

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

  // Handle inserting item into canvas (either at center or drop point)
  const handleInsert = (item, customX, customY, targetPageIndex) => {
    const now = Date.now();
    if (now - lastInsertTimeRef.current < 250) return;
    lastInsertTimeRef.current = now;

    const pageIdx = targetPageIndex !== undefined ? targetPageIndex : activePageIndex;
    const container = document.querySelector(`.page-svg-container[data-page-index="${pageIdx}"]`);
    const svg = container?.querySelector('svg');
    if (!svg) return;

    let cx = customX;
    let cy = customY;

    // ViewBox boundary calculations for clamping drop coordinates
    let vbMinX = 0, vbMinY = 0, vbWidth = baseWidth || 210, vbHeight = baseHeight || 297;
    const vb = svg.getAttribute('viewBox');
    if (vb) {
      const parts = vb.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3])) {
        vbMinX = parts[0];
        vbMinY = parts[1];
        vbWidth = parts[2];
        vbHeight = parts[3];
      }
    }

    if (cx === undefined || cx === null || isNaN(cx) || cy === undefined || cy === null || isNaN(cy)) {
      cx = vbMinX + vbWidth / 2;
      cy = vbMinY + vbHeight / 2;
    } else {
      // Clamp coordinates within the canvas viewBox so dropped elements are always on the page
      const margin = 20;
      cx = Math.max(vbMinX + margin, Math.min(vbMinX + vbWidth - margin, cx));
      cy = Math.max(vbMinY + margin, Math.min(vbMinY + vbHeight - margin, cy));
    }

    const id = `el-${Math.random().toString(36).substr(2, 9)}`;

    const el = item.insert(cx, cy);
    if (!el) return;

    el.setAttribute('id', id);
    if (!el.getAttribute('data-name')) {
      el.setAttribute('data-name', item.name);
    }
    if (!el.getAttribute('data-type')) {
      el.setAttribute('data-type', 'shape');
    }

    // Target the page frame group (e.g. Page 1) rather than the SVG root
    const pageGroup = svg.querySelector('[data-type="frame"]') ||
                      svg.querySelector('[data-name="Overlay"]')?.parentElement ||
                      svg.querySelector('g[id^="g-"]') ||
                      svg.querySelector('g') ||
                      svg;

    // Migrate any orphaned elements directly on SVG into the page frame group
    if (pageGroup !== svg) {
      Array.from(svg.children).forEach(child => {
        if (child === pageGroup) return;
        if (['defs', 'metadata', 'style', 'title', 'desc'].includes(child.tagName.toLowerCase())) return;
        if (child.getAttribute('data-name') === 'Document Shield' || child.getAttribute('data-type') === 'shield') return;
        pageGroup.appendChild(child);
      });
    }

    pageGroup.appendChild(el);

    if (saveModifiedPageHtml) {
      saveModifiedPageHtml(pageIdx, svg);
    }
    if (setSelectedLayerId) {
      setSelectedLayerId(id);
    }
    if (setActiveMainTool) {
      setActiveMainTool('select');
    }
  };

  // Listen for canvas drop events
  useEffect(() => {
    const handleAddElementEvent = (e) => {
      const { pageIndex, elementId, dropPoint } = e.detail || {};
      const item = ELEMENT_ITEMS.find((it) => it.id === elementId);
      if (!item) return;
      handleInsert(item, dropPoint?.x, dropPoint?.y, pageIndex);
    };

    window.addEventListener('add-element-to-editor', handleAddElementEvent);
    return () => {
      window.removeEventListener('add-element-to-editor', handleAddElementEvent);
    };
  }, [activePageIndex, baseWidth, baseHeight, saveModifiedPageHtml, setSelectedLayerId, setActiveMainTool]);

  if (!isOpen) return null;

  // Filter elements
  const filteredElements = ELEMENT_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const activeCategoryObj = ELEMENT_CATEGORIES.find((c) => c.id === selectedCategory) || ELEMENT_CATEGORIES[0];

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
          width: '26.5vw',
          minWidth: '380px',
          height: '78vh',
          left: rulerActive ? '6.2vw' : '5vw',
          top: rulerActive ? '2.2vw' : '1vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header & Drag Handle (matching screenshot) ── */}
        <div className="px-[1.2vw] pt-[0.6vh] pb-[0.8vh]">
          {/* Centered Six-Dot Drag Handle at the very top */}
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
          <div className="flex items-start justify-between mt-[0.3vh]">
            <div>
              <div className="flex items-center gap-[0.45vw]">
                <Icon icon="ph:diamonds-four" className="w-[1.2vw] h-[1.2vw] text-gray-900" />
                <h2 className="text-[1.18vw] font-bold text-gray-900 leading-tight">Add Elements</h2>
              </div>
              <p className="text-[0.7vw] text-gray-400 mt-[0.2vh]">Drag and Drop elements to your page</p>
            </div>

            <button
              onClick={onClose}
              className="w-[1.7vw] h-[1.7vw] rounded-[0.45vw] flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer mt-[-0.2vh]"
              title="Close"
            >
              <X size="1.1vw" />
            </button>
          </div>

          {/* Search Bar (seamless, without border divider) */}
          <div className="mt-[0.9vh]">
            <div className="relative flex items-center">
              <Search size="0.95vw" className="absolute left-[0.75vw] text-gray-400" />
              <input
                type="text"
                placeholder="Search Elements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-[2.4vw] pr-[0.8vw] py-[0.75vh] text-[0.78vw] bg-[#F4F5F6] rounded-[0.45vw] border border-transparent hover:border-gray-200 focus:border-gray-400 focus:bg-white outline-none transition-all text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* ── Body: 2 Columns ── */}
        <div className="flex-1 min-h-0 flex border-t border-gray-100 mt-[0.2vh] overflow-hidden">
          {/* Left Categories Sidebar with custom scroll */}
          <div className="w-[35%] border-r border-gray-100 overflow-y-auto custom-scrollbar py-[0.6vh] flex flex-col gap-[0.25vh]">
            {ELEMENT_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative flex items-center gap-[0.55vw] px-[0.75vw] py-[0.75vh] mx-[0.3vw] text-left rounded-[0.45vw] transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-red-50/70 text-[#ea543a] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {/* Left indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-[15%] bottom-[15%] w-[3px] bg-[#ea543a] rounded-r-full" />
                  )}
                  <Icon
                    icon={cat.icon}
                    className={`w-[1.05vw] h-[1.05vw] flex-shrink-0 ${
                      isActive ? 'text-[#ea543a]' : 'text-gray-500'
                    }`}
                  />
                  <span className="text-[0.72vw] truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Elements Grid with custom scroll */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-[0.9vw] flex flex-col">
            <span className="text-[0.8vw] font-bold text-gray-700 mb-[0.9vh] block">
              {activeCategoryObj.name === 'Shapes' ? 'Vector Graphic' : activeCategoryObj.name}
            </span>

            <div className="grid grid-cols-3 gap-[0.65vw]">
              {filteredElements.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleInsert(item)}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      'application/json',
                      JSON.stringify({
                        type: 'element',
                        elementId: item.id,
                      })
                    );
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  title={`Click to add or drag to place ${item.name}`}
                  className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md rounded-[0.45vw] p-[0.6vw] aspect-square flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all hover:scale-105 active:scale-95 group"
                >
                  <div className="flex-1 flex items-center justify-center pointer-events-none">
                    {item.renderPreview()}
                  </div>
                  <span className="text-[0.62vw] font-medium text-gray-500 group-hover:text-gray-800 truncate w-full text-center mt-[0.3vh] pointer-events-none">
                    {item.name}
                  </span>
                </button>
              ))}

              {filteredElements.length === 0 && (
                <div className="col-span-3 py-[4vh] text-center text-gray-400 text-[0.75vw]">
                  No elements found in {activeCategoryObj.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddElementsModal;
