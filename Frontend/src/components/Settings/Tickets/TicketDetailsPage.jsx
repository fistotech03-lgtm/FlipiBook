import React from 'react';
import { 
  ArrowLeft, 
  Reply, 
  FileText, 
  Paperclip, 
  Loader2, 
  Trash2, 
  Image as ImageIcon, 
  AlertTriangle, 
  ShieldCheck, 
  X 
} from 'lucide-react';
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
    showReplyForm,
    setShowReplyForm,
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
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-[1.5vw] text-center select-none font-sans">
        <Loader2 className="w-[1.8vw] h-[1.8vw] animate-spin text-[#EC5137] mb-[0.6vw]" />
        <h2 className="text-[0.88vw] font-medium text-gray-800">Loading ticket #{ticketId}...</h2>
      </div>
    );
  }

  if (!currentTicket) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-[1.5vw] text-center select-none font-sans">
        <div className="w-[2.8vw] h-[2.8vw] rounded-[0.8vw] bg-orange-50 text-[#EC5137] flex items-center justify-center mb-[0.6vw]">
          <FileText className="w-[1.4vw] h-[1.4vw]" />
        </div>
        <h2 className="text-[1.1vw] font-semibold text-gray-800">Ticket not found</h2>
        <p className="text-[0.74vw] text-gray-500 mt-[0.2vw] max-w-[20vw] font-normal">
          Ticket #{ticketId} doesn't exist or may have been deleted.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-[0.9vw] px-[1.05vw] py-[0.48vw] text-[0.78vw] font-medium text-white bg-[#EC5137] hover:bg-[#d94229] rounded-[0.5vw] cursor-pointer shadow-xs transition-all active:scale-[0.98]"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  const ticket = currentTicket;
  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  const allMessages = ticket.messages && ticket.messages.length > 0
    ? ticket.messages
    : [
        {
          id: 'initial',
          sender: 'user',
          authorName: ticket.requester?.name || 'Requester',
          badge: 'Authorized User',
          email: ticket.requester?.email || '',
          timestamp: ticket.submittedAt || ticket.createdAt || 'Earlier',
          content: ticket.description,
          attachments: ticket.attachments
        }
      ];

  return (
    <div className="w-full flex flex-col p-[1.5vw] font-sans relative select-none">
      {/* Top Navigation: Back to Tickets */}
      <div className="mb-[1.4vw] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-[0.7vw]">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-[0.4vw] text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 px-[0.8vw] py-[0.45vw] rounded-[0.5vw] shadow-xs text-[0.78vw] font-medium transition-colors cursor-pointer group active:scale-[0.98]"
            title="Back to Tickets"
          >
            <ArrowLeft className="w-[0.9vw] h-[0.9vw] text-gray-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Tickets</span>
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-[0.76vw] text-gray-500 font-medium">
            Support Tickets &gt; #{ticket.id}
          </span>
        </div>

        {/* Reply Action button in header */}
        <button 
          type="button"
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="inline-flex items-center gap-[0.4vw] px-[1.05vw] py-[0.48vw] rounded-[0.5vw] bg-[#EC5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.78vw] transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Reply className="w-[0.85vw] h-[0.85vw]" />
          <span>{showReplyForm ? 'Close Reply' : 'Reply to Ticket'}</span>
        </button>
      </div>

      {/* Ticket Subject Header Banner */}
      <div className="mb-[1.5vw]">
        <div className="flex items-center gap-[0.6vw]">
          <span className="font-mono text-[0.85vw] font-medium text-gray-400">
            #{ticket.id}
          </span>
          <h1 className="text-[1.25vw] font-semibold text-gray-800 tracking-tight leading-tight">
            {ticket.subject}
          </h1>
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
      </div>

      {/* Main Content 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[1.5vw] items-start">
        {/* Left Column (Ticket Info Sidebar) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-[1.2vw]">
          <div className="w-full bg-white rounded-[1vw] border border-gray-200 p-[1.5vw] shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
              <FileText className="w-[1.1vw] h-[1.1vw] text-[#4b5563]" />
              <h2 className="text-[0.98vw] font-medium text-gray-800">
                Ticket Information
              </h2>
            </div>
            <p className="text-[0.72vw] text-gray-500 mb-[1.2vw] pl-[1.65vw] font-normal">
              Key ticket details and resolution status
            </p>

            {/* Inner Gray Sub-Container */}
            <div className="w-full bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.75vw] p-[1.1vw] space-y-[0.75vw] shadow-xs">
              <div>
                <span className="text-[0.7vw] text-gray-400 font-normal">Requestor</span>
                <div className="mt-[0.1vw] font-medium text-gray-800 text-[0.82vw]">
                  {ticket.requester?.name || 'Authorized User'}
                </div>
              </div>

              <div>
                <span className="text-[0.7vw] text-gray-400 font-normal">Department / Module</span>
                <div className="mt-[0.1vw] font-medium text-gray-800 text-[0.82vw]">
                  {ticket.department || ticket.moduleName || 'IDC Support'}
                </div>
              </div>

              <div>
                <span className="text-[0.7vw] text-gray-400 font-normal">Submitted</span>
                <div className="mt-[0.1vw] text-gray-700 font-normal text-[0.78vw]">
                  {formatDateTime(ticket.createdAt || ticket.submittedAt)}
                </div>
              </div>

              <div>
                <span className="text-[0.7vw] text-gray-400 font-normal">Last Updated</span>
                <div className="mt-[0.1vw] text-gray-700 font-normal text-[0.78vw]">
                  {formatDateTime(ticket.updatedAt || ticket.lastUpdated || ticket.createdAt || ticket.submittedAt)}
                </div>
              </div>

              <div>
                <span className="text-[0.7vw] text-gray-400 font-normal">Status</span>
                <div className="mt-[0.2vw]">
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
              </div>

              <div className="pt-[0.6vw] flex items-center gap-[0.55vw]">
                <button 
                  type="button"
                  onClick={() => setShowReplyForm(true)}
                  className="flex-1 py-[0.48vw] px-[0.75vw] rounded-[0.5vw] bg-[#EC5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.78vw] flex items-center justify-center gap-[0.4vw] transition-all cursor-pointer shadow-xs"
                >
                  <Reply className="w-[0.8vw] h-[0.8vw]" />
                  <span>Reply</span>
                </button>

                {isClosed ? (
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className="flex-1 py-[0.48vw] px-[0.75vw] rounded-[0.5vw] bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium text-[0.78vw] flex items-center justify-center gap-[0.35vw] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <span>Reopen</span>
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setShowCloseConfirm(true)}
                    className="flex-1 py-[0.48vw] px-[0.75vw] rounded-[0.5vw] bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium text-[0.78vw] flex items-center justify-center gap-[0.35vw] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <X className="w-[0.8vw] h-[0.8vw]" />
                    <span>Close</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Ticket Messages & Replies) */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-[1.2vw]">
          {/* Conditional Inline Reply Box */}
          {showReplyForm && (
            <form onSubmit={handleAddReply} className="w-full bg-white rounded-[1vw] border border-gray-200 p-[1.5vw] shadow-sm space-y-[0.85vw] animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[0.5vw]">
                  <span className="text-[0.85vw] font-medium text-gray-800">
                    {isAdminUser ? 'Post Staff / Admin Reply' : 'Post Reply to Staff'}
                  </span>
                  {isAdminUser && (
                    <span className="inline-flex items-center gap-[0.25vw] px-[0.5vw] py-[0.1vw] rounded text-[0.66vw] font-medium bg-amber-100 text-amber-900 border border-amber-300">
                      <ShieldCheck className="w-[0.75vw] h-[0.75vw] text-amber-700" />
                      Staff Mode
                    </span>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowReplyForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-[0.74vw] font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={isAdminUser ? "Write official engineering or support response to the user..." : "Provide your feedback or further issue details..."}
                className="w-full p-[0.85vw] text-[0.78vw] border border-gray-200 rounded-[0.5vw] focus:outline-none focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] font-sans leading-relaxed text-gray-800 placeholder:text-gray-400"
              />

              {/* Reply Image Upload Area */}
              <div className="p-[0.75vw] rounded-[0.5vw] border border-dashed border-gray-200 bg-[#f8f9fa]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[0.45vw] text-[0.74vw] text-gray-600 font-normal">
                    <ImageIcon className="w-[0.85vw] h-[0.85vw] text-gray-400" />
                    <span>Attach images (max 5, JPG, PNG, WebP)</span>
                  </div>
                  <label className={`px-[0.75vw] py-[0.35vw] rounded-[0.45vw] border border-gray-200 bg-white text-[0.74vw] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-xs flex items-center gap-[0.35vw] ${
                    replyAttachments.length >= 5 || isCompressingReply ? 'opacity-50 pointer-events-none' : ''
                  }`}>
                    {isCompressingReply ? (
                      <>
                        <Loader2 className="w-[0.75vw] h-[0.75vw] animate-spin text-gray-600" />
                        <span>Optimizing...</span>
                      </>
                    ) : (
                      <span>Add Images ({replyAttachments.length}/5)</span>
                    )}
                    <input 
                      ref={replyFileInputRef}
                      type="file" 
                      accept="image/png,image/jpeg,image/jpg,image/webp" 
                      multiple
                      disabled={replyAttachments.length >= 5 || isCompressingReply}
                      onChange={handleImageFilesChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {replyError && (
                  <p className="mt-[0.45vw] text-[0.72vw] text-red-600 font-normal">
                    {replyError}
                  </p>
                )}

                {replyAttachments.length > 0 && (
                  <div className="mt-[0.65vw] grid grid-cols-1 sm:grid-cols-2 gap-[0.5vw]">
                    {replyAttachments.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between p-[0.45vw] rounded-[0.45vw] bg-white border border-gray-200 text-[0.74vw] shadow-xs">
                        <div className="flex items-center gap-[0.5vw] min-w-0">
                          <img src={att.dataUrl} alt={att.name} className="w-[1.8vw] h-[1.8vw] rounded-[0.35vw] object-cover border border-gray-200 shrink-0" />
                          <div className="min-w-0">
                            <span className="truncate block font-medium text-gray-800 text-[0.72vw]">{att.name}</span>
                            <span className="text-[0.65vw] text-gray-400 font-normal">{formatFileSize(att.size)}</span>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          onClick={() => removeAttachment(idx)}
                          className="text-gray-400 hover:text-red-500 p-[0.25vw] rounded-[0.3vw] hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-[0.85vw] h-[0.85vw]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-[0.4vw]">
                <div className="text-[0.74vw] text-gray-500 font-normal">
                  Replying as: <strong className="text-gray-800 font-medium">{isAdminUser ? (currentUser?.name || 'Support Engineer') : (ticket.requester?.name || 'Authorized User')}</strong>
                </div>
                <button
                  type="submit"
                  disabled={(!replyText.trim() && replyAttachments.length === 0) || isSubmitting || isCompressingReply}
                  className="px-[1.2vw] py-[0.48vw] rounded-[0.5vw] bg-[#EC5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.78vw] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          )}

          {/* Conversation Messages Thread */}
          <div className="space-y-[1.2vw]">
            {allMessages.map((msg) => {
              const isAgent = msg.sender === 'agent' || msg.sender === 'staff' || msg.sender === 'admin';
              const messageAttachments = msg.attachments || (msg.id === 'initial' || msg.id === allMessages[0]?.id ? ticket.attachments : null);

              return (
                <div 
                  key={msg.id}
                  className="w-full bg-white rounded-[1vw] border border-gray-200 overflow-hidden shadow-sm"
                >
                  {/* Message Header */}
                  <div className="bg-[#f8f9fa] px-[1.2vw] py-[0.8vw] border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-[0.55vw]">
                    <div className="flex items-center gap-[0.75vw]">
                      {/* Avatar Circle with Initials */}
                      <div 
                        className="w-[2.3vw] h-[2.3vw] rounded-full flex items-center justify-center text-white text-[0.78vw] font-semibold shrink-0 shadow-xs ring-1 ring-gray-200"
                        style={{ 
                          backgroundColor: isAgent 
                            ? '#2563eb' 
                            : (ticket.requester?.avatarColor || '#ec5137') 
                        }}
                      >
                        {(msg.authorName || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-[0.5vw]">
                          <span className="text-[0.85vw] font-medium text-gray-800">
                            {msg.authorName}
                          </span>
                          {msg.badge && (
                            <span className={`text-[0.66vw] px-[0.55vw] py-[0.1vw] rounded-full font-medium ${
                              isAgent 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {msg.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[0.68vw] text-gray-400 mt-[0.1vw] font-normal">
                          {msg.subRole || msg.email || ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-[0.72vw] text-gray-400 font-normal">
                      {formatDateTime(msg.createdAt || msg.timestamp)}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="p-[1.3vw] text-[0.8vw] text-gray-700 font-normal leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </div>

                  {/* Message Attachments Gallery */}
                  {messageAttachments && messageAttachments.length > 0 && (
                    <div className="px-[1.2vw] pb-[1.2vw] pt-[0.2vw]">
                      <div className="text-[0.68vw] font-medium text-gray-500 uppercase tracking-wider mb-[0.45vw] flex items-center gap-[0.35vw]">
                        <Paperclip className="w-[0.75vw] h-[0.75vw]" />
                        <span>Attached Images ({messageAttachments.length})</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[0.7vw]">
                        {messageAttachments.map((att, attIdx) => {
                          const isObj = typeof att === 'object';
                          const name = isObj ? att.name : att;
                          const url = isObj ? att.url : null;
                          const size = isObj ? formatFileSize(att.size) : null;
                          const resolvedUrl = url ? resolveUploadsPath(url) : null;

                          return (
                            <div 
                              key={attIdx} 
                              className="group relative rounded-[0.5vw] border border-gray-200 overflow-hidden bg-gray-50 hover:shadow-xs transition-shadow"
                            >
                              {resolvedUrl ? (
                                <a href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="block aspect-video overflow-hidden bg-gray-100">
                                  <img 
                                    src={resolvedUrl} 
                                    alt={name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                                  />
                                </a>
                              ) : (
                                <div className="aspect-video flex items-center justify-center bg-gray-100 text-gray-400">
                                  <ImageIcon className="w-[1.4vw] h-[1.4vw]" />
                                </div>
                              )}
                              <div className="p-[0.35vw] bg-white border-t border-gray-100">
                                <p className="text-[0.68vw] font-medium text-gray-800 truncate" title={name}>
                                  {name}
                                </p>
                                {size && (
                                  <p className="text-[0.62vw] text-gray-400 font-normal">{size}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Close Ticket Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-[1vw] bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div className="bg-white rounded-[1vw] shadow-xl max-w-[28vw] w-full p-[1.5vw] border border-gray-200 space-y-[0.85vw]">
            <div className="flex items-center gap-[0.7vw] text-gray-800">
              <div className="w-[2.4vw] h-[2.4vw] rounded-[0.6vw] bg-orange-50 flex items-center justify-center shrink-0 text-[#EC5137]">
                <AlertTriangle className="w-[1.2vw] h-[1.2vw]" />
              </div>
              <div>
                <h3 className="text-[1vw] font-semibold text-gray-800">
                  Close Ticket #{ticket.id}?
                </h3>
                <p className="text-[0.72vw] text-gray-500 font-normal">
                  Mark this support ticket as resolved/closed.
                </p>
              </div>
            </div>

            <p className="text-[0.76vw] text-gray-600 leading-relaxed font-normal bg-[#f8f9fa] p-[0.75vw] rounded-[0.5vw] border border-gray-200">
              Are you sure you want to mark <strong className="text-gray-900 font-medium">"{ticket.subject}"</strong> as closed? You will still be able to view the full discussion history at any time.
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
                className="px-[1vw] py-[0.48vw] text-[0.76vw] font-medium text-white bg-gray-900 hover:bg-black rounded-[0.5vw] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                Yes, Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
