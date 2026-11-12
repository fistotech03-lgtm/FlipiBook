import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Icon } from '@iconify/react';
import { X, Search } from 'lucide-react';
import { ELEMENT_CATEGORIES, searchElementCatalog, getElementItemById } from './elementCatalog';
import { useRulerState, useElementInsertion, useCanvasDropListener } from './hooks';
import { CategorySidebarList, ElementGridCard } from './components';

const RECENT_ELEMENTS_STORAGE_KEY = 'flipibook_recent_elements';
const MAX_RECENT_ELEMENTS = 24;

const getStoredRecentElementIds = () => {
  try {
    const raw = localStorage.getItem(RECENT_ELEMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

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

  const [recentElementIds, setRecentElementIds] = useState(getStoredRecentElementIds);
  const [isDraggingElement, setIsDraggingElement] = useState(false);

  // Sync recent elements whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setRecentElementIds(getStoredRecentElementIds());
    }
  }, [isOpen]);

  // Listen for element drag start & end to hide modal while dragging onto canvas
  useEffect(() => {
    const handleDragStartEvt = () => setIsDraggingElement(true);
    const handleDragEndEvt = () => setIsDraggingElement(false);

    window.addEventListener('element-drag-start', handleDragStartEvt);
    window.addEventListener('element-drag-end', handleDragEndEvt);
    window.addEventListener('dragend', handleDragEndEvt);
    window.addEventListener('drop', handleDragEndEvt);
    window.addEventListener('add-element-to-editor', handleDragEndEvt);
    window.addEventListener('mouseup', handleDragEndEvt);

    return () => {
      window.removeEventListener('element-drag-start', handleDragStartEvt);
      window.removeEventListener('element-drag-end', handleDragEndEvt);
      window.removeEventListener('dragend', handleDragEndEvt);
      window.removeEventListener('drop', handleDragEndEvt);
      window.removeEventListener('add-element-to-editor', handleDragEndEvt);
      window.removeEventListener('mouseup', handleDragEndEvt);
    };
  }, []);

  const recordRecentElement = useCallback((item) => {
    if (!item || !item.id) return;
    try {
      const existing = getStoredRecentElementIds();
      const updated = [item.id, ...existing.filter((id) => id !== item.id)].slice(0, MAX_RECENT_ELEMENTS);
      localStorage.setItem(RECENT_ELEMENTS_STORAGE_KEY, JSON.stringify(updated));
      setRecentElementIds(updated);
    } catch (e) {
      console.warn('[AddElementsModal] Failed to record recent element:', e);
    }
  }, []);

  const handleClearRecent = useCallback((e) => {
    e?.stopPropagation();
    try {
      localStorage.removeItem(RECENT_ELEMENTS_STORAGE_KEY);
      setRecentElementIds([]);
    } catch (e) {
      console.warn('[AddElementsModal] Failed to clear recent elements:', e);
    }
  }, []);

  // Element insertion workflow custom hook
  const { handleInsert: baseHandleInsert } = useElementInsertion({
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

  const handleInsert = useCallback((item, customX, customY, targetPageIndex) => {
    recordRecentElement(item);
    baseHandleInsert(item, customX, customY, targetPageIndex);
  }, [baseHandleInsert, recordRecentElement]);

  // Canvas drop event listener custom hook
  useCanvasDropListener(handleInsert);

  // High-performance search via Inverted Index + Memoization Cache
  const filteredElements = useMemo(() => {
    if (!isOpen) return [];
    if (selectedCategory === 'recent') {
      const items = recentElementIds
        .map((id) => getElementItemById(id))
        .filter(Boolean);
      if (!searchQuery.trim()) return items;
      const q = searchQuery.toLowerCase().trim();
      return items.filter((el) => {
        return (
          el.name?.toLowerCase().includes(q) ||
          el.category?.toLowerCase().includes(q) ||
          el.subtopic?.toLowerCase().includes(q) ||
          el.type?.toLowerCase().includes(q)
        );
      });
    }
    return searchElementCatalog(searchQuery, selectedCategory);
  }, [isOpen, searchQuery, selectedCategory, recentElementIds]);

  const [selectedSubtopic, setSelectedSubtopic] = useState('all');

  // Reset selectedSubtopic whenever selectedCategory changes
  useEffect(() => {
    setSelectedSubtopic('all');
  }, [selectedCategory]);

  const maskingSubtopics = useMemo(() => {
    const SUBTOPIC_ORDER = ['Typography Grid', 'Shapes', 'Letters', 'Numbers'];
    return SUBTOPIC_ORDER.map((name) => ({
      id: name,
      name,
      count: filteredElements.filter((el) => el.subtopic === name).length
    })).filter((item) => item.count > 0);
  }, [filteredElements]);

  // Extract distinct subtopics from elements in the selected category
  const availableSubtopics = useMemo(() => {
    if (!isOpen || selectedCategory === 'recent') return [];
    const subs = new Set();
    filteredElements.forEach((el) => {
      if (el.subtopic) subs.add(el.subtopic);
    });
    const SUBTOPIC_ORDER = ['Typography Grid', 'Shapes', 'Letters', 'Numbers'];
    return Array.from(subs).sort((a, b) => {
      const idxA = SUBTOPIC_ORDER.indexOf(a);
      const idxB = SUBTOPIC_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [filteredElements, isOpen]);

  const displayedElements = useMemo(() => {
    if (selectedSubtopic === 'all') return filteredElements;
    return filteredElements.filter((el) => el.subtopic === selectedSubtopic);
  }, [filteredElements, selectedSubtopic]);

  const groupedBySubtopic = useMemo(() => {
    if (availableSubtopics.length === 0 || selectedSubtopic !== 'all') return null;
    const groups = [];
    availableSubtopics.forEach((sub) => {
      const items = filteredElements.filter((el) => el.subtopic === sub);
      if (items.length > 0) {
        groups.push({ title: sub, items });
      }
    });
    const noSubItems = filteredElements.filter((el) => !el.subtopic);
    if (noSubItems.length > 0) {
      groups.push({ title: 'Other', items: noSubItems });
    }
    return groups;
  }, [availableSubtopics, filteredElements, selectedSubtopic]);

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
          animate={{
            opacity: isDraggingElement ? 0 : 1,
            scale: isDraggingElement ? 0.96 : 1,
          }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{
            duration: isDraggingElement ? 0.28 : 0.24,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed z-[9999] bg-white rounded-[0.75vw] border border-gray-300 shadow-[0_12px_45px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden select-none"
          style={{
            width: '28.5vw',
            minWidth: '420px',
            height: '75vh',
            maxHeight: 'calc(100vh - 40px)',
            left: modalPos.x,
            top: modalPos.y,
            pointerEvents: isDraggingElement ? 'none' : 'auto',
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
            <div className="flex-1 overflow-y-auto p-[0.6vw] flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden hover:[scrollbar-width:thin] hover:[&::-webkit-scrollbar]:block custom-scrollbar transition-all duration-200">
              {groupedBySubtopic ? (
                <div className="flex flex-col gap-[2vh]">
                  {groupedBySubtopic.map(({ title, items }) => (
                    <div key={title} className="flex flex-col">
                      <div className="flex items-center justify-between mb-[0.6vh]">
                        <span className="text-[0.74vw] font-bold text-gray-800 tracking-tight">
                          {title}
                        </span>
                        <span className="text-[0.58vw] text-gray-400 font-semibold bg-gray-100 px-[0.35vw] py-[0.1vh] rounded-[0.25vw]">
                          {items.length}
                        </span>
                      </div>
                      <div className={`grid ${selectedCategory === 'google-maps' ? 'grid-cols-2 gap-x-[0.6vw] gap-y-[1.2vh] p-[0.2vw]' : 'grid-cols-4 gap-x-[0.45vw] gap-y-[0.8vh]'}`}>
                        {items.map((item) => (
                          <ElementGridCard key={item.id} item={item} onInsert={handleInsert} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-[0.6vh]">
                    <span className="text-[0.74vw] font-bold text-gray-800 tracking-tight">
                      {selectedCategory === 'masking' && selectedSubtopic !== 'all' ? selectedSubtopic : activeCategoryObj.name}
                    </span>
                    <div className="flex items-center gap-[0.4vw]">
                      {selectedCategory === 'recent' && displayedElements.length > 0 && (
                        <button
                          onClick={handleClearRecent}
                          className="text-[0.62vw] text-gray-400 hover:text-red-500 font-medium transition-colors cursor-pointer mr-[0.2vw]"
                          title="Clear recent elements"
                        >
                          Clear
                        </button>
                      )}
                      <span className="text-[0.58vw] text-gray-400 font-semibold bg-gray-100 px-[0.35vw] py-[0.1vh] rounded-[0.25vw]">
                        {displayedElements.length}
                      </span>
                    </div>
                  </div>
                  <div className={`grid ${selectedCategory === 'google-maps' ? 'grid-cols-2 gap-x-[0.6vw] gap-y-[1.2vh] p-[0.2vw]' : 'grid-cols-4 gap-x-[0.45vw] gap-y-[0.8vh]'}`}>
                    {displayedElements.map((item) => (
                      <ElementGridCard key={item.id} item={item} onInsert={handleInsert} />
                    ))}

                    {displayedElements.length === 0 && (
                      <div className="col-span-full py-[4vh] flex flex-col items-center justify-center text-center text-gray-400">
                        {selectedCategory === 'recent' ? (
                          <>
                            <Icon icon="lucide:clock" className="w-[1.8vw] h-[1.8vw] text-gray-300 mb-[0.8vh]" />
                            <p className="text-[0.78vw] font-medium text-gray-500 mb-[0.3vh]">No recent elements yet</p>
                            <p className="text-[0.68vw] text-gray-400 max-w-[17vw] leading-relaxed">
                              Elements you click or drag onto your page will appear here for fast access.
                            </p>
                          </>
                        ) : (
                          <span className="text-[0.75vw]">
                            No elements found in {selectedSubtopic !== 'all' ? selectedSubtopic : activeCategoryObj.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
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
