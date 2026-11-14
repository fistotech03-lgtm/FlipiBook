// Frontend/src/pages/Forum/ForumSidebar.jsx
import React from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen 
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { FORUM_MODULES } from './data/forumData';

export default function ForumSidebar({ 
  selectedModuleId, 
  onSelectModule, 
  isCollapsed, 
  onToggleCollapse, 
  moduleCounts = {},
  activeArea = 'modules',
  onSelectArea
}) {
  return (
    <aside 
      className={`h-full bg-[#151c28] border-r border-[#1f293d] flex flex-col transition-[width,padding] duration-300 ease-in-out flex-shrink-0 select-none z-20 text-white overflow-hidden ${
        isCollapsed 
          ? 'w-14 sm:w-16 lg:w-[clamp(56px,4.5vw,72px)] p-2' 
          : 'w-full sm:w-56 md:w-60 lg:w-[18vw] lg:min-w-[220px] max-w-[320px] p-3 sm:p-4'
      }`}
    >
      {/* Top Header Row */}
      {!isCollapsed ? (
        <div className="flex items-center justify-between mb-3 flex-none px-1">
          <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Categories
          </span>
          <button
            onClick={onToggleCollapse}
            className="p-1 sm:p-1.5 text-gray-400 hover:text-white hover:bg-[#1e2738] rounded-lg transition-colors cursor-pointer"
            title="Minimize sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex justify-center mb-3 flex-none">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1e2738] rounded-lg transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1 pr-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* All Items Option (iconamoon:profile) */}
        {isCollapsed ? (
          <div
            onClick={() => onSelectArea && onSelectArea('all')}
            className={`relative group w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer select-none ${
              activeArea === 'all'
                ? 'bg-[#ec5137]/20 text-[#ec5137] border border-[#ec5137]/30'
                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white'
            }`}
          >
            <Icon icon="iconamoon:profile" className="w-5 h-5 shrink-0" />
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1e2738] text-white border border-[#243042] text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              <div className="font-medium text-white">All</div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onSelectArea && onSelectArea('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-xs sm:text-sm cursor-pointer select-none ${
              activeArea === 'all'
                ? 'bg-[#ec5137]/15 text-[#ec5137] font-semibold border-l-2 border-[#ec5137]'
                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon icon="iconamoon:profile" className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
              <span className="truncate">All</span>
            </div>
          </div>
        )}

        {/* Modules List */}
        {FORUM_MODULES.map((module) => {
          const isSelected = activeArea === 'modules' && module.id === selectedModuleId;
          const count = moduleCounts[module.id] || 0;
          const iconName = module.iconify || 'lucide:folder';

          if (isCollapsed) {
            return (
              <div
                key={module.id}
                onClick={() => onSelectModule(module.id)}
                className={`relative group w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer select-none ${
                  isSelected 
                    ? 'bg-[#ec5137]/20 text-[#ec5137] border border-[#ec5137]/30 shadow-xs' 
                    : 'text-gray-300 hover:bg-[#1e2738] hover:text-white'
                }`}
              >
                <Icon icon={iconName} className={`w-4.5 h-4.5 shrink-0 ${
                  isSelected ? 'text-[#ec5137]' : 'text-gray-300'
                }`} />

                {/* Floating tooltip on hover */}
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1e2738] text-white border border-[#243042] text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                  <div className="font-medium text-white">{module.name}</div>
                  <div className="text-[11px] text-gray-400">{count} discussions</div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={module.id}
              onClick={() => onSelectModule(module.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-xs sm:text-sm cursor-pointer select-none ${
                isSelected 
                  ? 'bg-[#ec5137]/15 text-[#ec5137] font-semibold border-l-2 border-[#ec5137]' 
                  : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon icon={iconName} className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${
                  isSelected ? 'text-[#ec5137]' : 'text-gray-300'
                }`} />
                <span className="truncate">{module.name}</span>
              </div>

              {count > 0 && (
                <span className={`text-[11px] sm:text-xs flex-shrink-0 ${
                  isSelected ? 'text-[#ec5137] font-medium' : 'text-gray-400'
                }`}>
                  {count}
                </span>
              )}
            </div>
          );
        })}

        {/* Separator & Your Activity Section */}
        <div className="pt-3 pb-1">
          {!isCollapsed ? (
            <div className="border-t border-[#1f293d] pt-3 pb-1 px-1">
              <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Your Activity
              </span>
            </div>
          ) : (
            <div className="border-t border-[#1f293d] my-2" />
          )}
        </div>

        {/* Favourites (lucide:bookmark outline) */}
        {isCollapsed ? (
          <div
            onClick={() => onSelectArea && onSelectArea('favourites')}
            className={`relative group w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer select-none ${
              activeArea === 'favourites'
                ? 'bg-[#ec5137]/20 text-[#ec5137]'
                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white'
            }`}
          >
            <Icon icon="lucide:bookmark" className="w-4.5 h-4.5 shrink-0" />
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1e2738] text-white border border-[#243042] text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              <div className="font-medium text-white">Favourites</div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onSelectArea && onSelectArea('favourites')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-xs sm:text-sm cursor-pointer select-none ${
              activeArea === 'favourites'
                ? 'bg-[#ec5137]/15 text-[#ec5137] font-semibold border-l-2 border-[#ec5137]'
                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon icon="lucide:bookmark" className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
              <span className="truncate">Favourites</span>
            </div>
          </div>
        )}

        {/* My Posts (ant-design:history-outlined) */}
        {isCollapsed ? (
          <div
            onClick={() => onSelectArea && onSelectArea('my_posts')}
            className={`relative group w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer select-none ${
              activeArea === 'my_posts'
                ? 'bg-[#ec5137]/20 text-[#ec5137]'
                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white'
            }`}
          >
            <Icon icon="ant-design:history-outlined" className="w-4.5 h-4.5 shrink-0" />
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1e2738] text-white border border-[#243042] text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              <div className="font-medium text-white">My Posts</div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onSelectArea && onSelectArea('my_posts')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-xs sm:text-sm cursor-pointer select-none ${
              activeArea === 'my_posts'
                ? 'bg-[#ec5137]/15 text-[#ec5137] font-semibold border-l-2 border-[#ec5137]'
                : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon icon="ant-design:history-outlined" className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
              <span className="truncate">My Posts</span>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
