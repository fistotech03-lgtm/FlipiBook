// Frontend/src/pages/Forum/ForumSidebar.jsx
import React from 'react';
import { 
  BookOpen, 
  FileText, 
  Settings, 
  Box, 
  Repeat, 
  User, 
  PanelLeftClose, 
  PanelLeftOpen,
  Folder
} from 'lucide-react';
import { FORUM_MODULES } from './data/forumData';

const iconMap = {
  BookOpen,
  FileText,
  Settings,
  Box,
  Repeat,
  User
};

export default function ForumSidebar({ 
  selectedModuleId, 
  onSelectModule, 
  isCollapsed, 
  onToggleCollapse, 
  moduleCounts = {} 
}) {
  return (
    <aside 
      className={`h-full bg-[#151c28] border-r border-[#1f293d] flex flex-col transition-[width,padding] duration-300 ease-in-out flex-shrink-0 select-none z-20 text-white overflow-hidden ${
        isCollapsed 
          ? 'w-[clamp(56px,4.5vw,72px)] p-[0.6vw]' 
          : 'w-full sm:w-[18vw] p-[1.2vw]'
      }`}
    >
      {/* Top Header Row (Exact MyFlipbooks Section Header Style) */}
      {!isCollapsed ? (
        <div className="flex items-center justify-between mb-[0.75vw] flex-none px-[0.2vw]">
          <span className="text-[0.95vw] font-bold text-white tracking-tight">
            Modules
          </span>
          <button
            onClick={onToggleCollapse}
            className="p-[0.35vw] text-gray-400 hover:text-white hover:bg-[#1e2738] rounded-[0.4vw] transition-colors cursor-pointer"
            title="Minimize sidebar"
          >
            <PanelLeftClose className="w-[1.05vw] h-[1.05vw]" />
          </button>
        </div>
      ) : (
        <div className="flex justify-center mb-[0.8vw] flex-none">
          <button
            onClick={onToggleCollapse}
            className="p-[0.45vw] text-gray-400 hover:text-white hover:bg-[#1e2738] rounded-[0.4vw] transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-[1.15vw] h-[1.15vw]" />
          </button>
        </div>
      )}

      {/* Module Navigation List (Exact MyFlipbooks item text-[0.875vw], gap-[0.75vw], px-[0.85vw] py-[0.55vw]) */}
      <nav className="flex-1 overflow-y-auto space-y-[0.25vw] pr-[0.1vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {FORUM_MODULES.map((module) => {
          const isSelected = module.id === selectedModuleId;
          const IconComponent = iconMap[module.icon] || Folder;
          const count = moduleCounts[module.id] || 0;

          if (isCollapsed) {
            return (
              <div
                key={module.id}
                onClick={() => onSelectModule(module.id)}
                className={`relative group w-[clamp(36px,2.4vw,44px)] h-[clamp(36px,2.4vw,44px)] mx-auto rounded-[0.5vw] flex items-center justify-center transition-all duration-150 cursor-pointer select-none ${
                  isSelected 
                    ? 'bg-[#2c3749] text-white shadow-xs' 
                    : 'text-gray-300 hover:bg-[#1e2738] hover:text-white'
                }`}
              >
                <IconComponent className={`w-[1.15vw] h-[1.15vw] shrink-0 ${
                  isSelected ? 'text-white' : 'text-gray-300'
                }`} />

                {/* Floating tooltip on hover */}
                <div className="absolute left-full ml-[0.6vw] px-[0.7vw] py-[0.35vw] bg-[#1e2738] text-white border border-[#243042] text-[0.75vw] rounded-[0.4vw] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                  <div className="font-medium text-white">{module.name}</div>
                  <div className="text-[0.68vw] text-gray-400">{count} discussions</div>
                </div>
              </div>
            );
          }

          // Expanded layout (matches MyFlipbooks item classes 1:1)
          return (
            <div
              key={module.id}
              onClick={() => onSelectModule(module.id)}
              className={`w-full flex items-center justify-between px-[0.85vw] py-[0.55vw] rounded-[0.5vw] transition-all text-[0.875vw] cursor-pointer select-none ${
                isSelected 
                  ? 'bg-[#2c3749] text-white font-medium shadow-xs' 
                  : 'text-gray-300 hover:bg-[#1e2738] hover:text-white font-normal'
              }`}
            >
              <div className="flex items-center gap-[0.75vw] min-w-0">
                <IconComponent className={`w-[1.15vw] h-[1.15vw] shrink-0 ${
                  isSelected ? 'text-white' : 'text-gray-300'
                }`} />
                <span className="truncate">{module.name}</span>
              </div>

              <span className={`text-[0.8vw] flex-shrink-0 ${
                isSelected ? 'text-white font-medium' : 'text-gray-400'
              }`}>
                {count}
              </span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
