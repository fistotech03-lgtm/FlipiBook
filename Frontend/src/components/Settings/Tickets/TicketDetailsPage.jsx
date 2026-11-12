import React from 'react';
import { 
  ArrowLeft, 
  Download,
  MoreVertical,
  Check,
  Send,
  Paperclip, 
  Loader2, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { useTicketDetails } from './hooks';
import { formatDateTime, formatFileSize } from './utils';
import { resolveUploadsPath } from '../../../utils/assetUtils';

export default function TicketDetailsPage() {
  const {
    ticketId,
    currentTicket,
    isLoadingTicket,
    isAdminUser,
    currentUser,
    replyText,
    setReplyText,
    replyAttachments,
    isCompressingReply,
    replyError,
    isSubmitting,
    showCloseConfirm,
    setShowCloseConfirm,
    replyFileInputRef,
    handleBack,
    handleImageFilesChange,
    removeAttachment,
    handleAddReply,
    handleToggleStatus
  } = useTicketDetails();

  if (isLoadingTicket) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-[2vw] text-center select-none font-sans">
        <Loader2 className="w-[1.8vw] h-[1.8vw] animate-spin text-[#FF5733] mb-[0.6vw]" />
        <h2 className="text-[0.88vw] font-medium text-gray-800">Loading ticket #{ticketId}...</h2>
      </div>
    );
  }

  if (!currentTicket) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-[2vw] text-center select-none font-sans">
        <div className="w-[3vw] h-[3vw] rounded-[0.8vw] bg-orange-50 text-[#FF5733] flex items-center justify-center mb-[0.8vw]">
          <FileText className="w-[1.5vw] h-[1.5vw]" />
        </div>
        <h2 className="text-[1.1vw] font-semibold text-gray-800">Ticket not found</h2>
        <p className="text-[0.75vw] text-gray-500 mt-[0.2vw] max-w-[20vw] font-normal">
          Ticket #{ticketId} doesn't exist or may have been deleted.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-[1vw] px-[1.2vw] py-[0.5vw] text-[0.78vw] font-medium text-white bg-[#FF5733] hover:bg-[#E04D2D] rounded-[0.5vw] cursor-pointer shadow-xs transition-all active:scale-[0.98]"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  const ticket = currentTicket;
  const isResolved = ticket.status === 'closed' || ticket.status === 'resolved';
  const isWaiting = ticket.status === 'waiting' || (ticket.statusText && ticket.statusText.toLowerCase().includes('waiting'));
  
  let statusBadgeLabel = 'In Progress';
  let statusBadgeColor = 'bg-[#FF5733] text-white';
  if (isResolved) {
    statusBadgeLabel = 'Resolved';
    statusBadgeColor = 'bg-emerald-600 text-white';
  } else if (isWaiting) {
    statusBadgeLabel = 'Waiting for you';
    statusBadgeColor = 'bg-blue-600 text-white';
  }

  const ticketIdStr = String(ticket.id).startsWith('#') ? ticket.id : `#FB-${ticket.id}`;
  const categoryName = ticket.department || ticket.moduleName || 'Technical Issue';
  const createdDateStr = formatDateTime(ticket.createdAt || ticket.submittedAt);
  const lastUpdatedStr = formatDateTime(ticket.updatedAt || ticket.lastUpdated || ticket.createdAt || ticket.submittedAt);
  const requesterName = ticket.requester?.name || currentUser?.name || 'Luffy';
  const requesterEmail = ticket.requester?.email || currentUser?.email || currentUser?.emailId || 'luffyonepiece@gmail.com';

  const allMessages = ticket.messages && ticket.messages.length > 0
    ? ticket.messages
    : [
        {
          id: 'initial',
          sender: 'user',
          authorName: requesterName,
          email: requesterEmail,
          timestamp: ticket.submittedAt || ticket.createdAt || 'Earlier',
          content: ticket.description || ticket.subject,
          attachments: ticket.attachments
        }
      ];

  // Collect all unique attachments across ticket and replies for the right sidebar
  const allAttachmentsList = [];
  if (ticket.attachments && Array.isArray(ticket.attachments)) {
    allAttachmentsList.push(...ticket.attachments);
  }
  allMessages.forEach(m => {
    if (m.attachments && Array.isArray(m.attachments)) {
      m.attachments.forEach(att => {
        const attId = typeof att === 'object' ? (att.url || att.name) : att;
        if (!allAttachmentsList.some(item => (typeof item === 'object' ? (item.url || item.name) : item) === attId)) {
          allAttachmentsList.push(att);
        }
      });
    }
  });

  return (
    <div className="w-full flex-1 bg-[#F9F9F9] min-h-full px-[2vw] py-[1.8vw] overflow-y-auto select-none font-sans">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-[0.4vw] text-[0.74vw] text-gray-400 mb-[1.2vw]">
        <button 
          type="button"
          onClick={handleBack}
          className="hover:text-gray-700 transition-colors cursor-pointer"
        >
          Help & Support
        </button>
        <span>&gt;</span>
        <span className="text-[#FF5733] font-medium">New{ticketIdStr.toLowerCase()}</span>
      </div>

      {/* Main 2-Column Content Grid matching Screenshot 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-[1.6vw] items-start">
        {/* Left / Center Section: Messages and Chat Feed */}
        <div className="xl:col-span-9 bg-white rounded-[1vw] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-[1.8vw] flex flex-col justify-between min-h-[75vh]">
          {/* Top Banner Row inside Card */}
          <div>
            {/* Top Navigation Row: Back to Requests & Status Badge */}
            <div className="flex items-center justify-between mb-[0.6vw]">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-[0.4vw] text-gray-500 hover:text-gray-900 text-[0.8vw] font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-[0.9vw] h-[0.9vw]" />
                <span>Back to Requests</span>
              </button>

              <div className="flex items-center gap-[0.8vw]">
                {/* Status Pill */}
                <div className="flex items-center gap-[0.4vw] px-[0.9vw] py-[0.3vw] rounded-full text-[0.74vw] font-semibold shadow-xs bg-[#FF5733] text-white">
                  <span className="w-[0.4vw] h-[0.4vw] rounded-full bg-white animate-pulse" />
                  <span>{statusBadgeLabel}</span>
                </div>

                <button 
                  type="button" 
                  onClick={() => setShowCloseConfirm(true)}
                  className="p-[0.35vw] text-gray-400 hover:text-gray-600 rounded-[0.4vw] hover:bg-gray-50 transition-colors"
                  title="Ticket options"
                >
                  <MoreVertical className="w-[1vw] h-[1vw]" />
                </button>
              </div>
            </div>

            {/* Ticket Title Header with Message Icon (Just below Back to Requests, above the horizontal line) */}
            <div className="flex items-start gap-[0.65vw] pb-[0.8vw] mb-[1.2vw] border-b border-gray-100">
              <div className="w-[2vw] h-[2vw] rounded-[0.45vw] bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-[0.1vw]">
                <Icon icon="lucide:message-square" className="w-[1vw] h-[1vw]" />
              </div>
              <div>
                <h1 className="text-[1.1vw] font-bold text-gray-900 leading-snug">
                  {ticket.subject}
                </h1>
                <p className="text-[0.7vw] text-gray-400 mt-[0.15vw] font-normal">
                  {ticketIdStr} Created on {createdDateStr}
                </p>
              </div>
            </div>

            {/* Messages Thread: User bubbles on right, Admin/Support bubbles on left */}
            <div className="space-y-[1.6vw] mb-[2vw]">
              {allMessages.map((msg, index) => {
                const isAgent = msg.sender === 'agent' || msg.sender === 'staff' || msg.sender === 'admin';
                const messageAttachments = msg.attachments || (index === 0 ? ticket.attachments : null);
                const timeStr = formatDateTime(msg.createdAt || msg.timestamp);

                if (isAgent) {
                  {/* Support / Admin Message on the Left */}
                  return (
                    <div key={msg.id || index} className="flex items-start gap-[0.8vw] max-w-[85%]">
                      {/* Red Logo Avatar */}
                      <div className="w-[2.2vw] h-[2.2vw] rounded-[0.45vw] bg-[#FF5733] flex items-center justify-center text-white font-bold text-[0.8vw] flex-shrink-0 shadow-xs">
                        F
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[0.6vw] text-[0.75vw] text-gray-400 mb-[0.4vw]">
                          <span className="font-semibold text-gray-800">Flipibook Admin</span>
                          <span>{timeStr}</span>
                        </div>
                        <div className="bg-[#FFF5F3] border border-red-50 text-gray-800 text-[0.8vw] p-[1vw] rounded-[0.75vw] rounded-tl-none leading-relaxed font-normal whitespace-pre-line shadow-2xs">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                }

                {/* User Message on the Right */}
                return (
                  <div key={msg.id || index} className="flex flex-col items-end">
                    <div className="flex items-center gap-[0.5vw] text-[0.75vw] text-gray-400 mb-[0.4vw]">
                      <span>{timeStr}</span>
                      <span className="font-semibold text-gray-800">{msg.authorName || requesterName}</span>
                      {/* User Avatar */}
                      <div className="w-[1.6vw] h-[1.6vw] rounded-full overflow-hidden bg-gray-200 border border-gray-100 flex-shrink-0">
                        {currentUser?.picture ? (
                          <img src={currentUser.picture} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-700 text-white text-[0.65vw] font-bold">
                            {(msg.authorName || requesterName)[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="max-w-[75%] bg-[#F5F5F7] text-gray-800 text-[0.8vw] p-[1vw] rounded-[0.75vw] rounded-tr-none leading-relaxed font-normal whitespace-pre-line shadow-2xs mb-[0.6vw]">
                      {msg.content}
                    </div>

                    {/* Inline Attachment Cards below message bubble */}
                    {messageAttachments && messageAttachments.length > 0 && (
                      <div className="flex flex-wrap justify-end gap-[0.6vw] max-w-[75%]">
                        {messageAttachments.map((att, attIdx) => {
                          const isObj = typeof att === 'object';
                          const name = isObj ? att.name : att;
                          const url = isObj ? att.url : (att.dataUrl || null);
                          const size = isObj ? formatFileSize(att.size) : null;
                          const resolvedUrl = url ? resolveUploadsPath(url) : null;
                          const isPdf = name?.toLowerCase().endsWith('.pdf');

                          return (
                            <div 
                              key={attIdx}
                              className="flex items-center gap-[0.6vw] bg-white border border-gray-200 rounded-[0.5vw] p-[0.4vw] pl-[0.5vw] pr-[0.8vw] shadow-2xs max-w-[13vw]"
                            >
                              {resolvedUrl && !isPdf ? (
                                <img 
                                  src={resolvedUrl} 
                                  alt={name} 
                                  className="w-[2.2vw] h-[2.2vw] rounded-[0.35vw] object-cover border border-gray-100 flex-shrink-0" 
                                />
                              ) : (
                                <div className="w-[2.2vw] h-[2.2vw] rounded-[0.35vw] bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                                  <Icon icon={isPdf ? "lucide:file-text" : "lucide:image"} className="w-[1.1vw] h-[1.1vw]" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="text-[0.72vw] font-medium text-gray-800 truncate block" title={name}>
                                  {name}
                                </span>
                                <span className="text-[0.62vw] text-gray-400 block">{size || 'Ready'}</span>
                              </div>
                              {resolvedUrl && (
                                <a 
                                  href={resolvedUrl} 
                                  download={name}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-gray-700 p-[0.15vw] rounded transition-colors"
                                  title="Download attachment"
                                >
                                  <Download className="w-[0.8vw] h-[0.8vw]" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Chat Reply Input Box matching Screenshot 2 */}
          <form onSubmit={handleAddReply} className="border-t border-gray-100 pt-[1.2vw]">
            <div className="w-full bg-white border border-gray-200 rounded-[0.8vw] shadow-xs p-[0.9vw] focus-within:border-[#FF5733] transition-colors">
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your replay here..."
                className="w-full text-[0.8vw] text-gray-800 placeholder-gray-400 focus:outline-none resize-none bg-transparent"
              />

              {/* Attachments preview if selected */}
              {replyAttachments.length > 0 && (
                <div className="flex flex-wrap gap-[0.5vw] py-[0.4vw] mb-[0.4vw] border-t border-gray-100">
                  {replyAttachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-[0.35vw] bg-gray-50 border border-gray-200 rounded-[0.35vw] px-[0.4vw] py-[0.15vw] text-[0.68vw]">
                      <span className="truncate max-w-[8vw]">{att.name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(idx)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {replyError && (
                <p className="text-[0.68vw] text-red-500 mb-[0.3vw]">{replyError}</p>
              )}

              {/* Toolbar Row */}
              <div className="flex items-center justify-between pt-[0.4vw] border-t border-gray-100/70">
                <div className="flex items-center gap-[0.6vw]">
                  <label className="flex items-center gap-[0.3vw] px-[0.7vw] py-[0.35vw] rounded-[0.45vw] border border-gray-200 hover:bg-gray-50 text-[0.74vw] font-medium text-gray-700 cursor-pointer transition-colors shadow-2xs">
                    <Paperclip className="w-[0.8vw] h-[0.8vw] text-gray-500" />
                    <span>Attach file</span>
                    <input 
                      ref={replyFileInputRef}
                      type="file" 
                      accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf" 
                      multiple
                      disabled={replyAttachments.length >= 5 || isCompressingReply}
                      onChange={handleImageFilesChange} 
                      className="hidden" 
                    />
                  </label>
                  <span className="text-[0.68vw] text-gray-400 font-normal">
                    You can attach image, Pdf or Videos (Max 20MB each)
                  </span>
                </div>

                <div className="flex items-center gap-[0.6vw]">
                  {/* Mark as Resolved button */}
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className="flex items-center gap-[0.35vw] px-[0.8vw] py-[0.45vw] rounded-[0.5vw] border border-gray-200 hover:bg-gray-50 text-[0.74vw] font-medium text-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="w-[0.9vw] h-[0.9vw] rounded-full bg-gray-800 text-white flex items-center justify-center">
                      <Check className="w-[0.55vw] h-[0.55vw]" />
                    </div>
                    <span>{isResolved ? 'Reopen Ticket' : 'Mark as Resolved'}</span>
                  </button>

                  {/* Send Replay button (Orange theme) */}
                  <button
                    type="submit"
                    disabled={(!replyText.trim() && replyAttachments.length === 0) || isSubmitting || isCompressingReply}
                    className="flex items-center gap-[0.4vw] px-[1.2vw] py-[0.45vw] rounded-[0.5vw] bg-[#FF5733] hover:bg-[#E04D2D] text-white text-[0.78vw] font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Send Replay'}</span>
                    <Send className="w-[0.8vw] h-[0.8vw]" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Section: Participants & Attachments Sidebar matching Screenshot 2 */}
        <div className="xl:col-span-3 space-y-[1.2vw]">
          {/* 1. Participants Card */}
          <div className="bg-white rounded-[1vw] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-[1.4vw]">
            <h3 className="text-[0.88vw] font-bold text-gray-900 pb-[1vw] border-b border-gray-100 mb-[0.8vw]">
              Participants
            </h3>

            <div className="space-y-[0.9vw]">
              {/* User Participant */}
              <div className="flex items-center gap-[0.7vw]">
                <div className="w-[2vw] h-[2vw] rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {currentUser?.picture ? (
                    <img src={currentUser.picture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Icon icon="lucide:user" className="w-[1vw] h-[1vw] text-emerald-700" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[0.78vw] font-semibold text-gray-800 leading-tight truncate">
                    {requesterName}
                  </p>
                  <p className="text-[0.68vw] text-gray-400 truncate mt-[0.1vw]">
                    {requesterEmail}
                  </p>
                </div>
              </div>

              {/* Support Staff Participant */}
              <div className="flex items-center gap-[0.7vw]">
                <div className="w-[2vw] h-[2vw] rounded-[0.4vw] bg-[#FF5733] text-white flex items-center justify-center font-bold text-[0.85vw] flex-shrink-0 shadow-2xs">
                  F
                </div>
                <div className="min-w-0">
                  <p className="text-[0.78vw] font-semibold text-gray-800 leading-tight">
                    Flipibook Support
                  </p>
                  <p className="text-[0.68vw] text-gray-400 truncate mt-[0.1vw]">
                    support@flipibook.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Attachments Summary Sidebar Card */}
          <div className="bg-white rounded-[1vw] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-[1.4vw]">
            <div className="flex items-center justify-between pb-[1vw] border-b border-gray-100 mb-[0.8vw]">
              <h3 className="text-[0.88vw] font-bold text-gray-900">
                Attachments ({allAttachmentsList.length})
              </h3>
              {allAttachmentsList.length > 0 && (
                <span className="text-[0.7vw] font-semibold text-[#FF5733] cursor-pointer hover:underline">
                  View All
                </span>
              )}
            </div>

            {allAttachmentsList.length > 0 ? (
              <div className="space-y-[0.7vw]">
                {allAttachmentsList.map((att, idx) => {
                  const isObj = typeof att === 'object';
                  const name = isObj ? att.name : att;
                  const url = isObj ? att.url : (att.dataUrl || null);
                  const size = isObj ? formatFileSize(att.size) : 'Ready';
                  const resolvedUrl = url ? resolveUploadsPath(url) : null;
                  const isPdf = name?.toLowerCase().endsWith('.pdf');

                  return (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-[0.4vw] rounded-[0.5vw] hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-[0.6vw] min-w-0 flex-1">
                        {resolvedUrl && !isPdf ? (
                          <img 
                            src={resolvedUrl} 
                            alt={name} 
                            className="w-[2vw] h-[2vw] rounded-[0.35vw] object-cover border border-gray-100 flex-shrink-0" 
                          />
                        ) : (
                          <div className="w-[2vw] h-[2vw] rounded-[0.35vw] bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                            <Icon icon={isPdf ? "lucide:file-text" : "lucide:image"} className="w-[1vw] h-[1vw]" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.74vw] font-medium text-gray-800 truncate" title={name}>
                            {name}
                          </p>
                          <p className="text-[0.62vw] text-gray-400">{size}</p>
                        </div>
                      </div>

                      {resolvedUrl && (
                        <a 
                          href={resolvedUrl} 
                          download={name}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-700 p-[0.2vw] rounded transition-colors ml-[0.4vw]"
                        >
                          <Download className="w-[0.85vw] h-[0.85vw]" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[0.72vw] text-gray-400 py-[0.5vw]">No attachments uploaded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Close Ticket Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-[1vw] bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div className="bg-white rounded-[1vw] shadow-xl max-w-[28vw] w-full p-[1.5vw] border border-gray-200 space-y-[0.85vw]">
            <div className="flex items-center gap-[0.7vw] text-gray-800">
              <div className="w-[2.4vw] h-[2.4vw] rounded-[0.6vw] bg-orange-50 flex items-center justify-center shrink-0 text-[#FF5733]">
                <AlertTriangle className="w-[1.2vw] h-[1.2vw]" />
              </div>
              <div>
                <h3 className="text-[1vw] font-semibold text-gray-800">
                  {isResolved ? 'Reopen Ticket?' : 'Close Ticket?'}
                </h3>
                <p className="text-[0.72vw] text-gray-500 font-normal">
                  {isResolved ? 'Reactivate this inquiry for assistance.' : 'Mark this support ticket as resolved/closed.'}
                </p>
              </div>
            </div>

            <p className="text-[0.76vw] text-gray-600 leading-relaxed font-normal bg-[#f8f9fa] p-[0.75vw] rounded-[0.5vw] border border-gray-200">
              {isResolved
                ? `Reopening "${ticket.subject}" will notify support engineers that you still need help.`
                : `Are you sure you want to mark "${ticket.subject}" as closed? You can still view conversation history.`}
            </p>

            <div className="flex items-center justify-end gap-[0.6vw] pt-[0.45vw]">
              <button
                type="button"
                onClick={() => setShowCloseConfirm(false)}
                className="px-[0.9vw] py-[0.45vw] text-[0.76vw] font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className="px-[1vw] py-[0.48vw] text-[0.76vw] font-medium text-white bg-[#FF5733] hover:bg-[#E04D2D] rounded-[0.5vw] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                {isResolved ? 'Yes, Reopen' : 'Yes, Close Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
