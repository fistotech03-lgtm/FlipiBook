import React from 'react';
import { Icon } from '@iconify/react';

/**
 * CategorySidebarList
 * Renders the category filter sidebar buttons with active state indicators
 */
export function CategorySidebarList({
  categories = [],
  selectedCategory,
  onSelectCategory,
  subtopics = [],
  selectedSubtopic = 'all',
  onSelectSubtopic
}) {
  return (
    <div className="w-[35%] border-r border-gray-100 overflow-y-auto custom-scrollbar py-[0.6vh] flex flex-col gap-[0.25vh]">
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.id;
        const isMasking = cat.id === 'masking';

        return (
          <React.Fragment key={cat.id}>
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory(cat.id);
                if (isMasking && onSelectSubtopic) onSelectSubtopic('all');
              }}
              className={`relative flex items-center justify-between px-[0.75vw] py-[0.75vh] mx-[0.3vw] text-left rounded-[0.45vw] transition-colors cursor-pointer ${
                isActive
                  ? 'bg-red-50/70 text-[#ea543a] font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-[0.55vw] min-w-0">
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
              </div>
              {isMasking && (
                <Icon
                  icon={isActive ? 'lucide:chevron-down' : 'lucide:chevron-right'}
                  className={`w-[0.8vw] h-[0.8vw] flex-shrink-0 transition-transform ${
                    isActive ? 'text-[#ea543a]' : 'text-gray-400'
                  }`}
                />
              )}
            </button>

            {/* Expandable subtopics tree under Image Framing & Masking */}
            {isMasking && isActive && subtopics && subtopics.length > 0 && (
              <div className="flex flex-col gap-[0.15vh] pl-[1.8vw] pr-[0.4vw] my-[0.2vh]">
                <button
                  onClick={() => onSelectSubtopic && onSelectSubtopic('all')}
                  className={`flex items-center justify-between px-[0.55vw] py-[0.5vh] rounded-[0.35vw] text-[0.66vw] transition-colors cursor-pointer ${
                    selectedSubtopic === 'all'
                      ? 'bg-red-50/80 text-[#ea543a] font-semibold'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>All</span>
                </button>
                {subtopics.map((sub) => {
                  const isSubActive = selectedSubtopic === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectSubtopic && onSelectSubtopic(sub.id)}
                      className={`flex items-center justify-between px-[0.55vw] py-[0.5vh] rounded-[0.35vw] text-[0.66vw] transition-colors cursor-pointer ${
                        isSubActive
                          ? 'bg-red-50/80 text-[#ea543a] font-semibold'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{sub.name}</span>
                      <span
                        className={`text-[0.56vw] px-[0.3vw] py-[0.05vh] rounded-full font-medium ${
                          isSubActive ? 'bg-[#ea543a]/15 text-[#ea543a]' : 'text-gray-400'
                        }`}
                      >
                        {sub.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default React.memo(CategorySidebarList);
