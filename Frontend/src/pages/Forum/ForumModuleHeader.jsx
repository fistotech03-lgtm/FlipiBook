// Frontend/src/pages/Forum/ForumModuleHeader.jsx
import React from 'react';
import { 
  BookOpen, 
  PenTool, 
  SlidersHorizontal, 
  Box, 
  Layers, 
  Plus, 
  CheckCircle2, 
  MessageSquare,
  FileText,
  Settings,
  Repeat,
  User
} from 'lucide-react';
import { FORUM_MODULES } from './data/forumData';

const iconMap = {
  BookOpen,
  PenTool,
  SlidersHorizontal,
  Box,
  Layers,
  FileText,
  Settings,
  Repeat,
  User
};

export default function ForumModuleHeader({ 
  selectedModuleId, 
  onOpenCreateModal, 
  postsCount = 0,
  solvedCount = 0 
}) {
  const currentModule = FORUM_MODULES.find(m => m.id === selectedModuleId) || FORUM_MODULES[0];
  const IconComponent = iconMap[currentModule.icon] || BookOpen;

  return (
    <div className="bg-white border-b border-gray-200 px-3.5 sm:px-[clamp(14px,1.4vw,26px)] py-3 sm:py-[clamp(10px,1vh,18px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-[clamp(8px,0.8vh,14px)]">
        {/* Module Title & Details */}
        <div className="flex items-center gap-2.5 sm:gap-[clamp(10px,0.8vw,16px)]">
          <div 
            className="w-9 h-9 sm:w-[clamp(34px,2.4vw,44px)] sm:h-[clamp(34px,2.4vw,44px)] rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] flex items-center justify-center text-white shadow-xs flex-shrink-0"
            style={{ backgroundColor: currentModule.color }}
          >
            <IconComponent className="w-4 h-4 sm:w-[clamp(16px,1.2vw,20px)] sm:h-[clamp(16px,1.2vw,20px)]" />
          </div>

          <div>
            <div className="flex items-center gap-2 sm:gap-[clamp(6px,0.4vw,10px)]">
              <h1 className="text-sm sm:text-[clamp(15px,1.2vw,20px)] font-bold text-gray-900 tracking-tight leading-none">
                {currentModule.name} Forum
              </h1>
              <span className="text-[10px] sm:text-[clamp(10px,0.65vw,12px)] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                {currentModule.badgeText}
              </span>
            </div>
            <p className="text-xs sm:text-[clamp(11px,0.75vw,13px)] text-gray-500 mt-1 max-w-[55vw] leading-tight">
              {currentModule.tagline}
            </p>
          </div>
        </div>

        {/* Action Button: Locked to this module */}
        <div className="flex items-center gap-2 sm:gap-[clamp(8px,0.8vw,14px)]">
          {/* Quick Counter */}
          <div className="hidden md:flex items-center gap-2.5 sm:gap-[clamp(8px,0.7vw,14px)] text-xs sm:text-[clamp(11px,0.72vw,13px)] text-gray-500 pr-2.5 border-r border-gray-200">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#ec5137]" />
              <span className="font-bold text-gray-800">{postsCount}</span>
              <span>Topics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-bold text-gray-800">{solvedCount}</span>
              <span>Solved</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenCreateModal}
            className="w-full sm:w-auto px-3.5 sm:px-[clamp(12px,1vw,20px)] py-2 sm:py-[clamp(7px,0.55vh,11px)] rounded-xl sm:rounded-[clamp(8px,0.55vw,12px)] font-semibold text-xs sm:text-[clamp(12px,0.8vw,14px)] text-white bg-[#ec5137] hover:bg-[#d9442b] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report / Ask in {currentModule.shortName}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
