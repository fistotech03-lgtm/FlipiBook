import React, { useState } from 'react';
import { Icon } from '@iconify/react';

/**
 * CategorySidebarList
 * Renders the category filter sidebar with:
 * - Collapsed state: shows only icons
 * - Hover state: smoothly expands as a sliding drawer with animation to show text labels
 */
export function CategorySidebarList({
  categories = [],
  selectedCategory,
  onSelectCategory,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative z-30 h-full flex-shrink-0 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Placeholder spacer to reserve icon-only space in the flex layout */}
      <div className="w-[3.1vw] min-w-[46px] h-full" />

      {/* Actual sliding sidebar drawer */}
      <div
        className={`absolute top-0 left-0 bottom-0 bg-white border-r border-gray-200 overflow-y-auto py-[0.6vh] flex flex-col gap-[0.25vh] transition-all duration-300 ease-in-out ${
          isHovered
            ? 'w-[10.5vw] min-w-[155px] shadow-[4px_0_18px_rgba(0,0,0,0.08)] [scrollbar-width:thin] custom-scrollbar'
            : 'w-[3.1vw] min-w-[46px] shadow-none overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        }`}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              title={cat.name}
              className={`relative flex items-center h-[3.8vh] min-h-[32px] px-[0.6vw] mx-[0.25vw] rounded-[0.45vw] transition-colors cursor-pointer group/item ${
                isActive
                  ? 'bg-red-50/70 text-[#ea543a] font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {/* Active left indicator pill */}
              {isActive && (
                <div className="absolute left-0 top-[18%] bottom-[18%] w-[3px] bg-[#ea543a] rounded-r-full" />
              )}

              {/* Icon (centered in the icon slot) */}
              <div className="w-[1.8vw] min-w-[26px] flex items-center justify-center flex-shrink-0">
                <Icon
                  icon={cat.icon}
                  className={`w-[1.1vw] h-[1.1vw] flex-shrink-0 transition-transform duration-200 group-hover/item:scale-110 ${
                    isActive ? 'text-[#ea543a]' : 'text-gray-500 group-hover/item:text-gray-800'
                  }`}
                />
              </div>

              {/* Category Text (fades and slides in on hover) */}
              <span
                className={`text-[0.72vw] whitespace-nowrap overflow-hidden transition-all duration-200 ml-[0.35vw] ${
                  isHovered
                    ? 'opacity-100 max-w-[120px] translate-x-0'
                    : 'opacity-0 max-w-0 -translate-x-1 pointer-events-none'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(CategorySidebarList);
