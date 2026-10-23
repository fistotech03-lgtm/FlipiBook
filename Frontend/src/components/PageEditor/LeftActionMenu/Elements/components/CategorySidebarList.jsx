import React from 'react';
import { Icon } from '@iconify/react';

/**
 * CategorySidebarList
 * Renders the category filter sidebar buttons with active state indicators
 */
export function CategorySidebarList({ categories = [], selectedCategory, onSelectCategory }) {
  return (
    <div className="w-[35%] border-r border-gray-100 overflow-y-auto custom-scrollbar py-[0.6vh] flex flex-col gap-[0.25vh]">
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory && onSelectCategory(cat.id)}
            className={`relative flex items-center gap-[0.55vw] px-[0.75vw] py-[0.75vh] mx-[0.3vw] text-left rounded-[0.45vw] transition-colors cursor-pointer ${
              isActive
                ? 'bg-red-50/70 text-[#ea543a] font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
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
  );
}

export default React.memo(CategorySidebarList);
