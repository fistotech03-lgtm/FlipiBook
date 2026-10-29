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
      className="group relative bg-white hover:bg-gray-50/70 p-[1.2vw] rounded-[1vw] border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-[1vw]">
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-[0.55vw]">
          
          {/* Top Row: Ticket ID, Module badge, Created timestamp */}
          <div className="flex flex-wrap items-center gap-[0.5vw] text-[0.72vw]">
            <span className="font-mono font-medium px-[0.55vw] py-[0.12vw] rounded-[0.4vw] bg-gray-100 text-gray-700 tracking-wide group-hover:bg-orange-50 group-hover:text-[#EC5137] transition-colors">
              #{ticket.id}
            </span>

            {/* Department / Module Pill */}
            <span className="inline-flex items-center gap-[0.35vw] px-[0.55vw] py-[0.12vw] rounded-[0.4vw] text-[0.7vw] font-medium bg-gray-50 text-gray-700 border border-gray-200">
              <span 
                className="w-[0.4vw] h-[0.4vw] rounded-full shrink-0" 
                style={{ backgroundColor: moduleInfo.color }}
              />
              <span className="truncate max-w-[9vw]">{ticket.department || ticket.moduleName || moduleInfo.name}</span>
            </span>

            <span className="text-gray-300 hidden sm:inline">•</span>

            <span className="text-gray-400 font-normal text-[0.72vw] flex items-center gap-[0.25vw]">
              <Clock className="w-[0.75vw] h-[0.75vw] text-gray-400 shrink-0" />
              <span>{ticket.createdAt || ticket.submittedAt || 'Recently'}</span>
            </span>
          </div>

          {/* Ticket Subject */}
          <h3 className="text-[0.92vw] font-medium text-gray-800 group-hover:text-[#EC5137] transition-colors leading-snug">
            {ticket.subject}
          </h3>

          {/* Description Preview */}
          {ticket.description && (
            <p className="text-[0.74vw] text-gray-500 line-clamp-2 leading-relaxed font-normal">
              {ticket.description}
            </p>
          )}

          {/* Footer Metadata */}
          <div className="flex flex-wrap items-center gap-y-[0.35vw] gap-x-[1vw] pt-[0.35vw] text-[0.72vw] text-gray-400">
            <span className="flex items-center gap-[0.35vw]">
              <span className="font-normal">Last activity:</span>
              <strong className="font-medium text-gray-700">
                {ticket.updatedAt || ticket.lastUpdated || ticket.createdAt || 'Just now'}
              </strong>
            </span>

            <span className="text-gray-300 hidden sm:inline">•</span>

            {/* Conversation Messages Count */}
            <span className="flex items-center gap-[0.35vw] text-gray-500 font-normal">
              <MessageSquare className="w-[0.75vw] h-[0.75vw] text-gray-400 shrink-0" />
              <span>{messageCount} {messageCount === 1 ? 'message' : 'messages'}</span>
            </span>

            {/* Attachments indicator */}
            {hasAttachments && (
              <>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-[0.35vw] text-gray-500 font-normal">
                  <Paperclip className="w-[0.75vw] h-[0.75vw] text-gray-400 shrink-0" />
                  <span>{ticket.attachments.length} attachment{ticket.attachments.length > 1 ? 's' : ''}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status Pill & Action button */}
        <div className="flex items-center gap-[0.6vw] sm:flex-col sm:items-end sm:justify-between shrink-0">
          <div>
            {isClosed ? (
              <span className="bg-gray-100 text-gray-600 text-[0.68vw] font-medium px-[0.75vw] py-[0.18vw] rounded-full inline-block">
                Closed
              </span>
            ) : (
              <span className="bg-[#DCFCE7] text-[#16A34A] text-[0.68vw] font-medium px-[0.75vw] py-[0.18vw] rounded-full inline-block">
                Open
              </span>
            )}
          </div>

          <div className="flex items-center gap-[0.35vw]">
            {!hasAdminReplied && onDeleteTicket && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTicket(ticket);
                }}
                className="text-gray-400 hover:text-red-600 p-[0.3vw] rounded-[0.4vw] hover:bg-red-50 transition-colors cursor-pointer"
                title="Cancel ticket"
              >
                <Trash2 className="w-[0.8vw] h-[0.8vw]" />
              </button>
            )}
            <span className="text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all">
              <ChevronRight className="w-[0.9vw] h-[0.9vw]" />
            </span>
          </div>
        </div>

      </div>
    </article>
  );
}
