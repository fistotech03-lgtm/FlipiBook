import React from 'react';
import { 
  BookOpen, 
  PenTool, 
  SlidersHorizontal, 
  Box, 
  CreditCard, 
  Layers, 
  PanelLeftClose, 
  PanelLeftOpen,
  LifeBuoy,
  Inbox,
  Clock,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { TICKET_MODULES } from './data/ticketData';

const iconMap = {
  Layers,
  BookOpen,
  PenTool,
  SlidersHorizontal,
  Box,
  CreditCard,
  HelpCircle
};

export default function TicketSidebar({ 
  selectedModuleId, 
  onSelectModule, 
  isCollapsed, 
  onToggleCollapse, 
  ticketCounts = {},
  statusFilter,
  onSelectStatusFilter
}) {
  return (
    <aside 
      className={`h-full bg-white border-r border-stone-200 flex flex-col transition-all duration-200 flex-shrink-0 select-none ${
        isCollapsed ? 'w-[4.2vw]' : 'w-[15vw]'
      }`}
    >
      {/* Top Header */}
      <div className="h-[3.6vw] border-b border-stone-200 px-[0.9vw] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-[0.6vw]">
            <div className="w-[1.9vw] h-[1.9vw] rounded-[0.5vw] bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ec5137]">
              <LifeBuoy className="w-[1vw] h-[1vw]" />
            </div>
            <div>
              <span className="text-[0.88vw] font-bold text-stone-900 tracking-tight block leading-tight">Support Desk</span>
              <span className="text-[0.65vw] text-stone-400 font-medium">Flipibook Helpdesk</span>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`p-[0.45vw] rounded-[0.4vw] text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-[1vw] h-[1vw]" /> : <PanelLeftClose className="w-[1vw] h-[1vw]" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-[0.6vw] space-y-[0.9vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Module Department Folders */}
        <div>
          {!isCollapsed && (
            <div className="px-[0.7vw] py-[0.25vw] text-[0.68vw] font-bold text-stone-400 uppercase tracking-wider">
              Departments
            </div>
          )}

          <nav className="space-y-[0.2vw] mt-[0.2vw]">
            {TICKET_MODULES.map((module) => {
              const isSelected = module.id === selectedModuleId;
              const IconComponent = iconMap[module.icon] || Layers;
              const count = ticketCounts[module.id] || 0;

              return (
                <button
                  key={module.id}
                  onClick={() => onSelectModule(module.id)}
                  className={`w-full flex items-center rounded-[0.55vw] transition-all cursor-pointer ${
                    isCollapsed 
                      ? 'justify-center p-[0.7vw]' 
                      : 'px-[0.8vw] py-[0.55vw] justify-between'
                  } ${
                    isSelected 
                      ? 'bg-orange-50 text-[#c23d26] font-semibold ring-1 ring-orange-200/80 shadow-xs' 
                      : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                  title={isCollapsed ? `${module.name} (${count})` : undefined}
                >
                  <div className="flex items-center gap-[0.6vw] min-w-0">
                    <IconComponent 
                      className={`w-[1vw] h-[1vw] shrink-0 ${isSelected ? 'text-[#ec5137]' : 'text-stone-400 group-hover:text-stone-600'}`} 
                    />
                    {!isCollapsed && (
                      <span className="text-[0.82vw] truncate">
                        {module.name}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && (
                    <span className={`text-[0.7vw] px-[0.5vw] py-[0.15vw] rounded-full font-medium ${
                      isSelected ? 'bg-orange-200/80 text-[#c23d26] font-bold' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Status Views */}
        {!isCollapsed && (
          <div className="pt-[0.5vw] border-t border-stone-100">
            <div className="px-[0.7vw] py-[0.25vw] text-[0.68vw] font-bold text-stone-400 uppercase tracking-wider">
              Quick Views
            </div>

            <div className="space-y-[0.2vw] mt-[0.2vw]">
              <button
                onClick={() => onSelectStatusFilter('all')}
                className={`w-full flex items-center justify-between px-[0.7vw] py-[0.45vw] rounded-[0.45vw] text-[0.75vw] font-medium cursor-pointer transition-colors ${
                  statusFilter === 'all' ? 'bg-stone-100 text-stone-900 font-bold' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-[0.5vw]">
                  <Inbox className="w-[0.85vw] h-[0.85vw] text-stone-400" />
                  <span>All Inquiries</span>
                </div>
              </button>

              <button
                onClick={() => onSelectStatusFilter('open')}
                className={`w-full flex items-center justify-between px-[0.7vw] py-[0.45vw] rounded-[0.45vw] text-[0.75vw] font-medium cursor-pointer transition-colors ${
                  statusFilter === 'open' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-[0.5vw]">
                  <span className="w-[0.45vw] h-[0.45vw] rounded-full bg-blue-500"></span>
                  <span>Open Tickets</span>
                </div>
              </button>

              <button
                onClick={() => onSelectStatusFilter('answered')}
                className={`w-full flex items-center justify-between px-[0.7vw] py-[0.45vw] rounded-[0.45vw] text-[0.75vw] font-medium cursor-pointer transition-colors ${
                  statusFilter === 'answered' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-[0.5vw]">
                  <span className="w-[0.45vw] h-[0.45vw] rounded-full bg-emerald-500"></span>
                  <span>Answered</span>
                </div>
              </button>

              <button
                onClick={() => onSelectStatusFilter('in_progress')}
                className={`w-full flex items-center justify-between px-[0.7vw] py-[0.45vw] rounded-[0.45vw] text-[0.75vw] font-medium cursor-pointer transition-colors ${
                  statusFilter === 'in_progress' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-[0.5vw]">
                  <Clock className="w-[0.85vw] h-[0.85vw] text-purple-500" />
                  <span>In Progress</span>
                </div>
              </button>

              <button
                onClick={() => onSelectStatusFilter('resolved')}
                className={`w-full flex items-center justify-between px-[0.7vw] py-[0.45vw] rounded-[0.45vw] text-[0.75vw] font-medium cursor-pointer transition-colors ${
                  statusFilter === 'resolved' ? 'bg-stone-100 text-stone-900 font-bold' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-[0.5vw]">
                  <CheckCircle2 className="w-[0.85vw] h-[0.85vw] text-stone-600" />
                  <span>Resolved</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
