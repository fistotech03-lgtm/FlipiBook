// Frontend/src/pages/Forum/ModuleSelector.jsx
import React from 'react';
import { 
  LayoutGrid, 
  BookOpen, 
  PenTool, 
  SlidersHorizontal, 
  Box, 
  HelpCircle, 
  Sparkles,
  FileText,
  Settings,
  Repeat,
  User
} from 'lucide-react';
import { FORUM_MODULES } from './data/forumData';

const iconMap = {
  LayoutGrid,
  BookOpen,
  PenTool,
  SlidersHorizontal,
  Box,
  HelpCircle,
  FileText,
  Settings,
  Repeat,
  User
};

export default function ModuleSelector({ selectedModuleId, onSelectModule, postCounts = {} }) {
  const currentModule = FORUM_MODULES.find(m => m.id === selectedModuleId) || FORUM_MODULES[0];

  return (
    <div className="w-full">
      {/* Module Tabs Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-[clamp(6px,0.7vh,12px)]">
        <div className="flex items-center gap-1.5 sm:gap-[clamp(6px,0.4vw,10px)]">
          <span className="text-[11px] sm:text-[clamp(11px,0.72vw,13px)] font-bold tracking-wider text-gray-400 uppercase">Select Module</span>
          <span className="text-[11px] sm:text-[clamp(11px,0.72vw,13px)] text-gray-400">• Filter discussions by editor tool</span>
        </div>
      </div>

      {/* Module Horizontal Grid / Scroller */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-[clamp(8px,0.7vw,14px)]">
        {FORUM_MODULES.map((module) => {
          const isSelected = module.id === selectedModuleId;
          const IconComponent = iconMap[module.icon] || LayoutGrid;
          const count = postCounts[module.id] !== undefined ? postCounts[module.id] : module.count;

          return (
            <button
              key={module.id}
              onClick={() => onSelectModule(module.id)}
              className={`group relative text-left p-2.5 sm:p-[clamp(10px,0.8vw,16px)] rounded-xl sm:rounded-[clamp(8px,0.7vw,14px)] border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'bg-white border-[#ec5137] shadow-[0_4px_16px_rgba(236,81,55,0.12)] ring-2 ring-[#ec5137]/20'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/70 shadow-sm'
              }`}
            >
              {/* Active Top Accent Line */}
              {isSelected && (
                <div 
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ backgroundColor: module.id === 'all' ? '#ec5137' : module.color }}
                />
              )}

              <div className="flex items-start justify-between mb-2 sm:mb-[clamp(6px,0.5vh,10px)]">
                <div 
                  className={`w-8 h-8 sm:w-[clamp(30px,2vw,38px)] sm:h-[clamp(30px,2vw,38px)] rounded-lg sm:rounded-[clamp(6px,0.5vw,10px)] flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isSelected ? 'shadow-sm' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected 
                      ? (module.id === 'all' ? '#ec5137' : module.color) 
                      : '#f3f4f6',
                    color: isSelected ? '#ffffff' : '#4b5563'
                  }}
                >
                  <IconComponent className="w-4 h-4 sm:w-[clamp(14px,1vw,18px)] sm:h-[clamp(14px,1vw,18px)]" />
                </div>

                <span 
                  className={`text-[10px] sm:text-[clamp(10px,0.68vw,12px)] font-bold px-1.5 py-0.2 sm:px-[clamp(6px,0.4vw,9px)] sm:py-[clamp(2px,0.15vh,4px)] rounded-full transition-colors ${
                    isSelected 
                      ? 'bg-orange-50 text-[#ec5137]' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}
                >
                  {count}
                </span>
              </div>

              <div>
                <h4 className={`text-xs sm:text-[clamp(12px,0.82vw,14px)] font-bold leading-snug line-clamp-1 ${
                  isSelected ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {module.name}
                </h4>
                <p className="text-[10px] sm:text-[clamp(10px,0.68vw,12px)] text-gray-400 line-clamp-1 mt-0.5">
                  {module.id === 'all' ? 'All categories' : `${count} discussions`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Module Brief Banner */}
      <div className="mt-2.5 sm:mt-[clamp(8px,0.9vh,14px)] bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200/80 rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] px-3 sm:px-[clamp(12px,1vw,20px)] py-2 sm:py-[clamp(6px,0.5vh,10px)] flex items-center justify-between text-xs sm:text-[clamp(11px,0.75vw,13px)]">
        <div className="flex items-center gap-2 sm:gap-[clamp(6px,0.5vw,12px)]">
          <span className="flex items-center justify-center w-5 h-5 sm:w-[clamp(18px,1.2vw,24px)] sm:h-[clamp(18px,1.2vw,24px)] rounded-full bg-[#ec5137]/10 text-[#ec5137]">
            <Sparkles className="w-3 h-3 sm:w-[clamp(11px,0.75vw,14px)] sm:h-[clamp(11px,0.75vw,14px)]" />
          </span>
          <span className="font-semibold text-gray-800">
            {currentModule.name}:
          </span>
          <span className="text-gray-600 line-clamp-1">
            {currentModule.description}
          </span>
        </div>
        <div className="text-[10px] sm:text-[clamp(10px,0.68vw,12px)] text-gray-400 font-medium whitespace-nowrap ml-2">
          Viewing {postCounts[selectedModuleId] || 0} topics
        </div>
      </div>
    </div>
  );
}
