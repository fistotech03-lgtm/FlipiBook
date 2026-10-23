import React, { useState, useMemo } from 'react';
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
  setActiveMainTool,
  baseWidth = 210,
  baseHeight = 297,
  dragConstraintsRef,
}) => {
  const dragControls = useDragControls();
  const [selectedCategory, setSelectedCategory] = useState('shapes');
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronized ruler state custom hook
  const [rulerActive] = useRulerState(isRulerEnabled);

  // Element insertion workflow custom hook
  const { handleInsert } = useElementInsertion({
    activePageIndex,
    baseWidth,
    baseHeight,
    saveModifiedPageHtml,
    setSelectedLayerId,
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
          width: '26.5vw',
          minWidth: '380px',
          height: '78vh',
          left: rulerActive ? '6.2vw' : '5vw',
          top: rulerActive ? '2.2vw' : '1vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Drag Handle */}
        <div className="px-[1.2vw] pt-[0.6vh] pb-[0.8vh]">
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

          {/* Search Bar */}
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

        {/* Body: 2 Columns */}
        <div className="flex-1 min-h-0 flex border-t border-gray-100 mt-[0.2vh] overflow-hidden">
          {/* Left Categories Sidebar Component */}
          <CategorySidebarList
            categories={ELEMENT_CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Right Elements Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-[0.9vw] flex flex-col">
            <span className="text-[0.8vw] font-bold text-gray-700 mb-[0.9vh] block">
              {activeCategoryObj.name}
            </span>

            <div className="grid grid-cols-3 gap-[0.65vw]">
              {filteredElements.map((item) => (
                <ElementGridCard key={item.id} item={item} onInsert={handleInsert} />
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
