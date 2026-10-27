import React from 'react';
import { 
  Paperclip, 
  Clock, 
  ChevronRight,
  Trash2,
  CheckCircle2,
  CircleDot,
  MessageSquare
} from 'lucide-react';
import { getModuleInfo } from './utils';

export default function TicketCard({ ticket, onSelectTicket, onDeleteTicket }) {
  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';
  const hasAttachments = ticket.attachments && ticket.attachments.length > 0;
  const messageCount = (ticket.messages && ticket.messages.length) || 1;

  const moduleInfo = getModuleInfo(ticket.moduleId, ticket.department, ticket.moduleName);

  // Check if admin/staff has already replied
  const hasAdminReplied = Boolean(
    ticket.messages && 
    ticket.messages.some(m => m.sender === 'agent' || m.sender === 'staff' || m.sender === 'admin')
  );

  return (
    <article 
      onClick={() => onSelectTicket(ticket)}
      className="group relative bg-white hover:bg-[#fffcfb] p-[1.2vw] rounded-[0.9vw] border border-stone-200/90 hover:border-[#ec5137]/40 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-[1vw]">
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-[0.55vw]">
          
          {/* Top Row: Ticket ID, Module badge, Created timestamp */}
          <div className="flex flex-wrap items-center gap-[0.5vw] text-[0.72vw]">
            <span className="font-mono font-bold px-[0.6vw] py-[0.15vw] rounded-[0.4vw] bg-stone-100 text-stone-800 tracking-wide group-hover:bg-orange-100/80 group-hover:text-[#c23d26] transition-colors">
              #{ticket.id}
            </span>

            {/* Department / Module Pill */}
            <span className="inline-flex items-center gap-[0.35vw] px-[0.6vw] py-[0.15vw] rounded-[0.4vw] text-[0.7vw] font-semibold bg-stone-100/90 text-stone-700 border border-stone-200/70">
              <span 
                className="w-[0.45vw] h-[0.45vw] rounded-full shrink-0" 
                style={{ backgroundColor: moduleInfo.color }}
              />
              <span className="truncate max-w-[9vw]">{ticket.department || ticket.moduleName || moduleInfo.name}</span>
            </span>

            <span className="text-stone-300 hidden sm:inline">•</span>

            <span className="text-stone-400 font-normal text-[0.72vw] flex items-center gap-[0.25vw]">
              <Clock className="w-[0.75vw] h-[0.75vw] text-stone-400 shrink-0" />
              <span>{ticket.createdAt || ticket.submittedAt || 'Recently'}</span>
            </span>
          </div>

          {/* Ticket Subject */}
          <h3 className="text-[0.95vw] font-bold text-stone-900 group-hover:text-[#ec5137] transition-colors leading-snug">
            {ticket.subject}
          </h3>

          {/* Description Preview */}
          {ticket.description && (
            <p className="text-[0.78vw] text-stone-600 line-clamp-2 leading-relaxed font-normal">
              {ticket.description}
            </p>
          )}

          {/* Footer Metadata */}
          <div className="flex flex-wrap items-center gap-y-[0.35vw] gap-x-[1vw] pt-[0.35vw] text-[0.72vw] text-stone-500">
            <span className="flex items-center gap-[0.35vw]">
              <span className="text-stone-400 font-normal">Last activity:</span>
              <strong className="font-semibold text-stone-700">
                {ticket.updatedAt || ticket.lastUpdated || ticket.createdAt || 'Just now'}
              </strong>
            </span>

            <span className="text-stone-300 hidden sm:inline">•</span>

            {/* Conversation Messages Count */}
            <span className="flex items-center gap-[0.35vw] text-stone-600">
              <MessageSquare className="w-[0.8vw] h-[0.8vw] text-stone-400 shrink-0" />
              <span>{messageCount} {messageCount === 1 ? 'message' : 'messages'}</span>
            </span>

            {/* Attachments indicator */}
            {hasAttachments && (
              <>
                <span className="text-stone-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-[0.35vw] text-stone-600 font-medium">
                  <Paperclip className="w-[0.8vw] h-[0.8vw] text-stone-400 shrink-0" />
                  <span>{ticket.attachments.length} attachment{ticket.attachments.length > 1 ? 's' : ''}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Action / Status Column */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-[0.75vw] shrink-0 sm:pl-[1vw] sm:border-l sm:border-stone-100 sm:min-w-[7.5vw]">
          
          {/* Status Indicator */}
          {isClosed ? (
            <div 
              className="inline-flex items-center gap-[0.35vw] px-[0.7vw] py-[0.3vw] rounded-full text-[0.72vw] font-semibold bg-stone-100 text-stone-600 border border-stone-200/80 shadow-2xs"
              title="Status: Closed"
            >
              <CheckCircle2 className="w-[0.85vw] h-[0.85vw] text-stone-400 shrink-0" />
              <span>Closed</span>
            </div>
          ) : (
            <div 
              className="inline-flex items-center gap-[0.35vw] px-[0.7vw] py-[0.3vw] rounded-full text-[0.72vw] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs"
              title="Status: Open"
            >
              <CircleDot className="w-[0.85vw] h-[0.85vw] text-emerald-500 animate-pulse shrink-0" />
              <span>Open</span>
            </div>
          )}

          {/* Bottom Actions: Cancel or View link */}
          <div className="flex items-center gap-[0.5vw] sm:mt-auto">
            {/* Cancel Ticket Action: Only available before admin has replied */}
            {onDeleteTicket && !hasAdminReplied && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTicket(ticket);
                }}
                className="opacity-70 group-hover:opacity-100 text-stone-400 hover:text-red-600 px-[0.5vw] py-[0.25vw] rounded-[0.4vw] hover:bg-red-50 transition-all flex items-center gap-[0.25vw] text-[0.68vw] font-medium cursor-pointer"
                title="Cancel this ticket before support team replies"
              >
                <Trash2 className="w-[0.75vw] h-[0.75vw] shrink-0" />
                <span>Cancel</span>
              </button>
            )}

            {/* View Arrow Button */}
            <div className="w-[1.9vw] h-[1.9vw] rounded-[0.55vw] bg-stone-50 group-hover:bg-[#ec5137] text-stone-400 group-hover:text-white flex items-center justify-center transition-all duration-150 shadow-2xs">
              <ChevronRight className="w-[0.95vw] h-[0.95vw]" />
            </div>
          </div>

        </div>

      </div>
    </article>
  );
}
