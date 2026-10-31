import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Icon } from '@iconify/react';
import { X, Search } from 'lucide-react';
import { ELEMENT_CATEGORIES, searchElementCatalog } from './elementCatalog';
import { useRulerState, useElementInsertion, useCanvasDropListener } from './hooks';
import { CategorySidebarList, ElementGridCard } from './components';

export const AddElementsModal = ({
  isOpen = false,
  onClose,
  isRulerEnabled = true,
  activePageIndex = 0,
  saveModifiedPageHtml,
  setSelectedLayerId,
  selectedLayerIdRef,
  setMultiSelectedIds,
  multiSelectedIdsRef,
  setCurrentFrameId,
  currentFrameIdRef,
  drawOverlayHighlight,
  setActiveMainTool,
  baseWidth = 210,
  baseHeight = 297,
  dragConstraintsRef,
}) => {
  const dragControls = useDragControls();
  const modalRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('shapes');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial viewport coordinates for fixed portal positioning
  const [modalPos, setModalPos] = useState({ x: 100, y: 70 });

  // Synchronized ruler state custom hook
  const [rulerActive] = useRulerState(isRulerEnabled);

  // Dynamic drag constraints covering the full browser viewport (above layer, sidebar, top toolbar)
  const [dragConstraints, setDragConstraints] = useState({
    top: -50,
    left: -200,
    right: 1200,
    bottom: 600,
  });

  // Calculate initial viewport position when modal opens next to the "Add Elements" button (below navbar)
  useEffect(() => {
    if (!isOpen) return;

    const nav = document.querySelector('nav');
    const navbarBottom = nav ? nav.getBoundingClientRect().bottom : Math.round(window.innerHeight * 0.07);
    const minAllowedTop = navbarBottom + 8;

    const elementsBtn = document.querySelector('button[title="Add Elements"]');
    const container = dragConstraintsRef?.current;
    let initialX = 100;
    let initialY = minAllowedTop + 10;

    if (elementsBtn) {
      const btnRect = elementsBtn.getBoundingClientRect();
      initialX = Math.round(btnRect.right + 12);
      initialY = Math.max(minAllowedTop, Math.round(btnRect.top));
    } else if (container) {
      const cRect = container.getBoundingClientRect();
      initialX = Math.round(cRect.left + (rulerActive ? window.innerWidth * 0.062 : window.innerWidth * 0.05));
      initialY = Math.max(minAllowedTop, Math.round(cRect.top + (rulerActive ? window.innerWidth * 0.022 : window.innerWidth * 0.01)));
    }

    setModalPos({ x: initialX, y: initialY });
  }, [isOpen, rulerActive, dragConstraintsRef]);

  // Compute travel constraints relative to modal's initial position across full window
  const updateDragConstraints = useCallback(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const mRect = modal.getBoundingClientRect();

    // Get current transform offset if already dragged
    let currentX = 0;
    let currentY = 0;
    try {
      const transform = window.getComputedStyle(modal).transform;
      if (transform && transform !== 'none') {
        const MatrixClass = window.DOMMatrixReadOnly || window.DOMMatrix || window.WebKitCSSMatrix;
        if (MatrixClass) {
          const matrix = new MatrixClass(transform);
          currentX = matrix.m41;
          currentY = matrix.m42;
        }
      }
    } catch {
      // fallback
    }

    // Modal's initial un-transformed position on screen
    const baseLeft = mRect.left - currentX;
    const baseTop = mRect.top - currentY;
    const mWidth = mRect.width || 380;

    // Detect navbar bottom boundary so modal never enters/covers the navbar
    const nav = document.querySelector('nav');
    const navbarBottom = nav ? nav.getBoundingClientRect().bottom : Math.round(window.innerHeight * 0.07);
    const minAllowedTop = navbarBottom + 8;

    // Up: can move up only until minAllowedTop (stops below Navbar, can float over Top Toolbar)
    const maxUp = minAllowedTop - baseTop;
    // Left: can move left to 10px from screen left (above Layer Sidebar)
    const maxLeft = -(baseLeft - 10);
    // Right: can move right across full window (above RightSidebar)
    const maxRight = Math.max(50, window.innerWidth - baseLeft - mWidth - 10);
    // Down: can move down until header remains accessible
    const maxDown = Math.max(50, window.innerHeight - baseTop - 60);

    setDragConstraints({
      top: Math.min(0, maxUp),
      left: Math.min(0, maxLeft),
      right: maxRight,
      bottom: maxDown,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const frameId = requestAnimationFrame(() => {
      updateDragConstraints();
    });

    window.addEventListener('resize', updateDragConstraints);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateDragConstraints);
    };
  }, [isOpen, modalPos, updateDragConstraints]);

  // Element insertion workflow custom hook
  const { handleInsert } = useElementInsertion({
    activePageIndex,
    baseWidth,
    baseHeight,
    saveModifiedPageHtml,
    setSelectedLayerId,
    selectedLayerIdRef,
    setMultiSelectedIds,
    multiSelectedIdsRef,
    setCurrentFrameId,
    currentFrameIdRef,
    drawOverlayHighlight,
    setActiveMainTool,
  });

  // Canvas drop event listener custom hook
  useCanvasDropListener(handleInsert);

  // High-performance search via Inverted Index + Memoization Cache
  const filteredElements = useMemo(() => {
    if (!isOpen) return [];
    return searchElementCatalog(searchQuery, selectedCategory);
  }, [isOpen, searchQuery, selectedCategory]);

  const activeCategoryObj = useMemo(() => {
    return ELEMENT_CATEGORIES.find((c) => c.id === selectedCategory) || ELEMENT_CATEGORIES[0];
  }, [selectedCategory]);

  const handleHeaderPointerDown = (e) => {
    // Prevent dragging when clicking interactive controls (search input, close button)
    if (e.target.closest('button, input, textarea, select, a, [role="button"]')) {
      return;
    }
    dragControls.start(e);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="add-elements-modal"
          ref={modalRef}
          drag
          dragListener={false}
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={dragConstraints}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed z-[9999] bg-white rounded-[0.75vw] border border-gray-300 shadow-[0_12px_45px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden select-none"
          style={{
            width: '26.5vw',
            minWidth: '380px',
            height: '74vh',
            maxHeight: 'calc(100vh - 40px)',
            left: modalPos.x,
            top: modalPos.y,
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header & Drag Handle Area */}
          <div
            onPointerDown={handleHeaderPointerDown}
            className="px-[1.2vw] pt-[0.6vh] pb-[0.8vh] cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: 'none' }}
          >
            {/* Centered Six-Dot Drag Handle */}
            <div className="flex justify-center items-center">
              <div
                className="flex items-center justify-center py-[0.1vh] px-[0.6vw] rounded-[0.35vw] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing select-none"
                title="Drag to move panel"
              >
                <Icon icon="ph:dots-six-bold" className="w-[1.3vw] h-[1.3vw] text-gray-400 hover:text-gray-600" />
              </div>
            </div>

            {/* Title & Close Row */}
            <div className="flex items-start justify-between mt-[0.3vh]">
              <div className="pointer-events-none">
                <div className="flex items-center gap-[0.45vw]">
                  <Icon icon="ph:diamonds-four" className="w-[1.2vw] h-[1.2vw] text-gray-900" />
                  <h2 className="text-[1.18vw] font-bold text-gray-900 leading-tight">Add Elements</h2>
                </div>
                <p className="text-[0.7vw] text-gray-400 mt-[0.2vh]">Drag and Drop elements to your page</p>
              </div>

              <button
                onClick={onClose}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-[1.7vw] h-[1.7vw] rounded-[0.45vw] flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer mt-[-0.2vh] pointer-events-auto"
                title="Close"
              >
                <X size="1.1vw" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-[0.9vh] pointer-events-auto">
              <div className="relative flex items-center">
                <Search size="0.95vw" className="absolute left-[0.75vw] text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Elements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-full pl-[2.4vw] pr-[0.8vw] py-[0.75vh] text-[0.78vw] bg-[#F4F5F6] rounded-[0.45vw] border border-transparent hover:border-gray-200 focus:border-gray-400 focus:bg-white outline-none transition-all text-gray-800 placeholder-gray-400 cursor-text"
                />
              </div>
            </div>
          </div>

          {/* Body: 2 Columns */}
          <div className="flex-1 min-h-0 flex border-t border-gray-100 mt-[0.2vh] overflow-hidden">
            {/* Left Categories Sidebar Component */}
            <CategorySidebarList
              categories={ELEMENT_CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Right Elements Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-[0.5vw] flex flex-col">
              <span className="text-[0.8vw] font-bold text-gray-700 mb-[0.9vh] block">
                {activeCategoryObj.name}
              </span>

              {selectedCategory === 'text' && !searchQuery.trim() ? (
                (() => {
                  const titleItems = filteredElements.filter((item) => item.subtopic === 'Titles');
                  const typographyItems = filteredElements.filter((item) => item.subtopic === 'Typography' || !item.subtopic);

                  return (
                    <div className="flex flex-col gap-[2vh]">
                      {/* Titles Section (JSON animations only) */}
                      {titleItems.length > 0 && (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-[0.4vw] pt-[0.8vh] pb-[1.2vh]">
                            <span className="text-[0.8vw] font-semibold text-gray-800">
                              Titles
                            </span>
                            <div className="flex-1 h-[1px] bg-gray-200" />
                          </div>
                          <div className="grid grid-cols-3 gap-x-[0.5vw] gap-y-[1vh]">
                            {titleItems.map((item) => (
                              <ElementGridCard key={item.id} item={item} onInsert={handleInsert} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Typography Section */}
                      {typographyItems.length > 0 && (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-[0.4vw] pt-[1.8vh] pb-[1.8vh]">
                            <span className="text-[0.8vw] font-semibold text-gray-800 ">
                              Typography
                            </span>
                            <div className="flex-1 h-[1px] bg-gray-200" />
                          </div>
                          <div className="grid grid-cols-3 gap-x-[0.5vw] gap-y-[1vh]">
                            {typographyItems.map((item) => (
                              <ElementGridCard key={item.id} item={item} onInsert={handleInsert} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className={`grid ${selectedCategory === 'google-maps' ? 'grid-cols-1 p-[1vw] gap-x-[0.8vw] gap-y-[1.5vh]' : 'grid-cols-3 gap-x-[0.5vw] gap-y-[1vh]'}`}>
                  {filteredElements.map((item) => (
                    <ElementGridCard key={item.id} item={item} onInsert={handleInsert} />
                  ))}

                  {filteredElements.length === 0 && (
                    <div className="col-span-full py-[4vh] text-center text-gray-400 text-[0.75vw]">
                      No elements found in {activeCategoryObj.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AddElementsModal;
