import React from 'react';
import { 
  ArrowLeft, 
  Reply, 
  FileText, 
  ChevronUp, 
  ChevronDown, 
  Paperclip, 
  Loader2, 
  Trash2, 
  Image as ImageIcon, 
  AlertTriangle, 
  CircleDot, 
  CheckCircle2, 
  ShieldCheck, 
  X 
} from 'lucide-react';
import { useTicketDetails } from './hooks';
import { formatDateTime, formatFileSize } from './utils';

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
    infoOpen,
    setInfoOpen,
    handleBack,
    handleImageFilesChange,
    removeAttachment,
    handleAddReply,
    handleToggleStatus
  } = useTicketDetails();

  if (isLoadingTicket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-[1.5vw] text-center select-none font-sans">
        <Loader2 className="w-[1.8vw] h-[1.8vw] animate-spin text-[#ec5137] mb-[0.6vw]" />
        <h2 className="text-[0.9vw] font-semibold text-stone-800">Loading ticket #{ticketId}...</h2>
      </div>
    );
  }

  if (!currentTicket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-[1.5vw] text-center select-none font-sans">
        <div className="w-[2.8vw] h-[2.8vw] rounded-[0.8vw] bg-orange-50 text-[#ec5137] flex items-center justify-center mb-[0.6vw]">
          <FileText className="w-[1.4vw] h-[1.4vw]" />
        </div>
        <h2 className="text-[1.1vw] font-bold text-stone-900">Ticket not found</h2>
        <p className="text-[0.78vw] text-stone-500 mt-[0.2vw] max-w-[20vw]">
          Ticket #{ticketId} doesn't exist or may have been deleted.
        </p>
        <button
          onClick={handleBack}
          className="mt-[0.9vw] px-[1vw] py-[0.45vw] text-[0.78vw] font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] rounded-[0.55vw] cursor-pointer shadow-xs transition-all"
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
    <div className="flex-1 flex flex-col w-full h-full text-slate-800 bg-[#fcfcfc] overflow-y-auto select-none font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Top Title Bar */}
      <div className="bg-[#f8fafc] px-[1.5vw] py-[0.9vw] border-b border-slate-200 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-[0.75vw]">
          <button
            onClick={handleBack}
            className="px-[0.75vw] py-[0.45vw] rounded-[0.55vw] text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer flex items-center gap-[0.45vw] text-[0.8vw] font-semibold"
            title="Back to Tickets"
          >
            <ArrowLeft className="w-[0.95vw] h-[0.95vw]" />
            <span className="hidden sm:inline">Back to Tickets</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-[1.1vw] font-semibold text-[#2563eb] tracking-tight leading-snug">
              Ticket #{ticket.id} - Sub : {ticket.subject}
            </h1>
          </div>
        </div>

        {/* Reply Action button in header */}
        <button 
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="inline-flex items-center gap-[0.45vw] px-[1vw] py-[0.45vw] rounded-[0.55vw] bg-[#ec5137] hover:bg-[#d9442b] text-white font-semibold text-[0.8vw] transition-all shadow-xs hover:shadow cursor-pointer shrink-0"
        >
          <Reply className="w-[0.85vw] h-[0.85vw]" />
          <span>{showReplyForm ? 'Close Reply' : 'Reply to Ticket'}</span>
        </button>
      </div>

      {/* Main Content 2-Column Layout */}
      <div className="flex-1 p-[1.5vw] grid grid-cols-1 lg:grid-cols-12 gap-[1.2vw] bg-[#fbfbfb]">
        {/* Left Column (Ticket Info Sidebar) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-[0.85vw]">
          {/* Box: Ticket Information */}
          <div className="bg-white rounded-[0.85vw] border border-stone-200 overflow-hidden shadow-xs">
            <div 
              onClick={() => setInfoOpen(!infoOpen)}
              className="bg-stone-50/90 px-[1.1vw] py-[0.75vw] border-b border-stone-200 flex items-center justify-between cursor-pointer select-none text-stone-800 font-semibold text-[0.8vw] tracking-wide"
            >
              <div className="flex items-center gap-[0.5vw]">
                <FileText className="w-[0.85vw] h-[0.85vw] text-stone-500" />
                <span>Ticket Information</span>
              </div>
              {infoOpen ? <ChevronUp className="w-[0.85vw] h-[0.85vw]" /> : <ChevronDown className="w-[0.85vw] h-[0.85vw]" />}
            </div>

            {infoOpen && (
              <div className="p-[1.1vw] space-y-[0.85vw] text-[0.78vw] text-stone-700">
                <div>
                  <div className="text-[0.68vw] font-semibold text-stone-400 uppercase tracking-wider">Requestor</div>
                  <div className="mt-[0.2vw] font-medium text-stone-900 text-[0.85vw]">
                    {ticket.requester?.name || 'Authorized User'}
                  </div>
                </div>

                <div>
                  <div className="text-[0.68vw] font-semibold text-stone-400 uppercase tracking-wider">Department / Module</div>
                  <div className="mt-[0.2vw] font-semibold text-stone-800 text-[0.8vw]">
                    {ticket.department || ticket.moduleName || 'IDC Support'}
                  </div>
                </div>

                <div>
                  <div className="text-[0.68vw] font-semibold text-stone-400 uppercase tracking-wider">Submitted</div>
                  <div className="mt-[0.2vw] text-stone-700 font-sans text-[0.78vw]">
                    {formatDateTime(ticket.createdAt || ticket.submittedAt)}
                  </div>
                </div>

                <div>
                  <div className="text-[0.68vw] font-semibold text-stone-400 uppercase tracking-wider">Last Updated</div>
                  <div className="mt-[0.2vw] text-stone-700 font-sans text-[0.78vw]">
                    {formatDateTime(ticket.updatedAt || ticket.lastUpdated || ticket.createdAt || ticket.submittedAt)}
                  </div>
                </div>

                <div>
                  <div className="text-[0.68vw] font-semibold text-stone-400 uppercase tracking-wider">Status</div>
                  <div className="mt-[0.3vw] flex items-center gap-[0.45vw]">
                    {isClosed ? (
                      <div className="inline-flex items-center gap-[0.35vw] text-[0.78vw] font-semibold text-stone-600">
                        <CheckCircle2 className="w-[0.9vw] h-[0.9vw] text-stone-400" />
                        <span>Closed</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-[0.35vw] text-[0.78vw] font-semibold text-emerald-600">
                        <CircleDot className="w-[0.9vw] h-[0.9vw] text-emerald-500 animate-pulse" />
                        <span>Open</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-[0.6vw] flex items-center gap-[0.55vw]">
                  <button 
                    onClick={() => setShowReplyForm(true)}
                    className="flex-1 py-[0.5vw] px-[0.75vw] rounded-[0.55vw] bg-[#ec5137] hover:bg-[#d9442b] text-white font-semibold text-[0.78vw] flex items-center justify-center gap-[0.45vw] transition-all cursor-pointer shadow-xs hover:shadow"
                  >
                    <Reply className="w-[0.85vw] h-[0.85vw]" />
                    <span>Reply</span>
                  </button>

                  {isClosed ? (
                    <button
                      onClick={handleToggleStatus}
                      className="flex-1 py-[0.5vw] px-[0.75vw] rounded-[0.55vw] bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-semibold text-[0.78vw] flex items-center justify-center gap-[0.35vw] transition-colors cursor-pointer"
                    >
                      <span>Reopen Ticket</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowCloseConfirm(true)}
                      className="flex-1 py-[0.5vw] px-[0.75vw] rounded-[0.55vw] bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 font-semibold text-[0.78vw] flex items-center justify-center gap-[0.35vw] transition-colors cursor-pointer shadow-2xs"
                    >
                      <X className="w-[0.85vw] h-[0.85vw]" />
                      <span>Close Ticket</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Ticket Messages & Replies) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-[1.2vw]">
          {/* Conditional Inline Reply Box */}
          {showReplyForm && (
            <form onSubmit={handleAddReply} className="bg-white rounded-[0.9vw] border border-sky-300 p-[1.1vw] shadow-sm space-y-[0.85vw] animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[0.5vw]">
                  <span className="text-[0.78vw] font-bold text-sky-900 uppercase tracking-wider">
                    {isAdminUser ? 'Post Staff / Admin Reply' : 'Post Reply to Staff'}
                  </span>
                  {isAdminUser && (
                    <span className="inline-flex items-center gap-[0.25vw] px-[0.5vw] py-[0.1vw] rounded text-[0.68vw] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      <ShieldCheck className="w-[0.75vw] h-[0.75vw] text-amber-700" />
                      Staff Mode
                    </span>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowReplyForm(false)}
                  className="text-stone-400 hover:text-stone-700 text-[0.75vw] font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={isAdminUser ? "Write official engineering or support response to the user..." : "Provide your feedback or further issue details..."}
                className="w-full p-[0.85vw] text-[0.82vw] border border-stone-300 rounded-[0.55vw] focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 font-sans leading-relaxed text-stone-900"
              />

              {/* Reply Image Upload Area */}
              <div className="p-[0.75vw] rounded-[0.55vw] border border-dashed border-sky-300 bg-sky-50/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[0.45vw] text-[0.75vw] text-stone-700 font-medium">
                    <ImageIcon className="w-[0.9vw] h-[0.9vw] text-sky-600" />
                    <span>Attach images (max 5, JPG, PNG, WebP)</span>
                  </div>
                  <label className={`px-[0.75vw] py-[0.35vw] rounded-[0.45vw] border border-sky-300 bg-white text-[0.75vw] font-semibold text-sky-700 hover:bg-sky-50 cursor-pointer shadow-2xs flex items-center gap-[0.35vw] ${
                    replyAttachments.length >= 5 || isCompressingReply ? 'opacity-50 pointer-events-none' : ''
                  }`}>
                    {isCompressingReply ? (
                      <>
                        <Loader2 className="w-[0.75vw] h-[0.75vw] animate-spin text-sky-600" />
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
                  <p className="mt-[0.45vw] text-[0.72vw] text-red-600 font-medium">
                    {replyError}
                  </p>
                )}

                {replyAttachments.length > 0 && (
                  <div className="mt-[0.65vw] grid grid-cols-1 sm:grid-cols-2 gap-[0.5vw]">
                    {replyAttachments.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between p-[0.45vw] rounded-[0.45vw] bg-white border border-stone-200 text-[0.75vw] shadow-2xs">
                        <div className="flex items-center gap-[0.5vw] min-w-0">
                          <img src={att.dataUrl} alt={att.name} className="w-[1.8vw] h-[1.8vw] rounded-[0.35vw] object-cover border border-stone-200 shrink-0" />
                          <div className="min-w-0">
                            <span className="truncate block font-semibold text-stone-800 text-[0.72vw]">{att.name}</span>
                            <span className="text-[0.65vw] text-stone-400">{formatFileSize(att.size)}</span>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeAttachment(idx)}
                          className="text-stone-400 hover:text-red-500 p-[0.25vw] rounded-[0.3vw] hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-[0.85vw] h-[0.85vw]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-[0.4vw]">
                <div className="text-[0.75vw] text-stone-500">
                  Replying as: <strong className="text-stone-800 font-semibold">{isAdminUser ? (currentUser?.name || 'Support Engineer') : (ticket.requester?.name || 'Authorized User')}</strong>
                </div>
                <button
                  type="submit"
                  disabled={(!replyText.trim() && replyAttachments.length === 0) || isSubmitting || isCompressingReply}
                  className="px-[1.1vw] py-[0.45vw] rounded-[0.55vw] bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[0.78vw] transition-all shadow-xs hover:shadow cursor-pointer disabled:opacity-50"
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
                  className="bg-white rounded-[0.85vw] border border-stone-200 overflow-hidden shadow-xs hover:shadow-sm transition-shadow"
                >
                  {/* Message Header */}
                  <div className="bg-stone-50/80 px-[1.1vw] py-[0.75vw] border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-[0.55vw]">
                    <div className="flex items-center gap-[0.75vw]">
                      {/* Avatar Circle with Initials */}
                      <div 
                        className="w-[2.3vw] h-[2.3vw] rounded-full flex items-center justify-center text-white text-[0.78vw] font-bold shrink-0 shadow-2xs ring-2 ring-stone-200/80"
                        style={{ 
                          backgroundColor: isAgent 
                            ? '#2563eb' 
                            : (ticket.requester?.avatarColor || '#ec5137') 
                        }}
                      >
                        {(msg.authorName || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-[0.55vw]">
                          <span className="text-[0.88vw] font-bold text-stone-900">
                            {msg.authorName}
                          </span>
                          {msg.badge && (
                            <span className={`text-[0.68vw] px-[0.55vw] py-[0.1vw] rounded-full font-medium ${
                              isAgent 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                : 'bg-stone-100 text-stone-700 border border-stone-200'
                            }`}>
                              {msg.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[0.68vw] text-stone-400 mt-[0.1vw]">
                          {msg.subRole || msg.email || ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-[0.72vw] text-stone-400 font-sans">
                      {formatDateTime(msg.createdAt || msg.timestamp)}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="p-[1.3vw] text-[0.85vw] text-stone-800 font-normal leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </div>

                  {/* Message Attachments Gallery */}
                  {messageAttachments && messageAttachments.length > 0 && (
                    <div className="px-[1.1vw] pb-[1.1vw] pt-[0.2vw]">
                      <div className="text-[0.68vw] font-semibold text-slate-500 uppercase tracking-wider mb-[0.45vw] flex items-center gap-[0.35vw]">
                        <Paperclip className="w-[0.75vw] h-[0.75vw]" />
                        <span>Attached Images ({messageAttachments.length})</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[0.7vw]">
                        {messageAttachments.map((att, attIdx) => {
                          const isObj = typeof att === 'object';
                          const name = isObj ? att.name : att;
                          const url = isObj ? att.url : null;
                          const size = isObj ? formatFileSize(att.size) : null;

                          return (
                            <div 
                              key={attIdx} 
                              className="group relative rounded-[0.55vw] border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-xs transition-shadow"
                            >
                              {url ? (
                                <a href={url} target="_blank" rel="noopener noreferrer" className="block aspect-video overflow-hidden bg-slate-100">
                                  <img 
                                    src={url} 
                                    alt={name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                                  />
                                </a>
                              ) : (
                                <div className="aspect-video flex items-center justify-center bg-slate-100 text-slate-400">
                                  <ImageIcon className="w-[1.4vw] h-[1.4vw]" />
                                </div>
                              )}
                              <div className="p-[0.35vw] bg-white border-t border-slate-100">
                                <p className="text-[0.68vw] font-medium text-slate-800 truncate" title={name}>
                                  {name}
                                </p>
                                {size && (
                                  <p className="text-[0.62vw] text-slate-400">{size}</p>
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
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-[1vw] bg-stone-900/60 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div className="bg-white rounded-[1vw] shadow-xl max-w-[28vw] w-full p-[1.5vw] border border-stone-200 space-y-[0.85vw]">
            <div className="flex items-center gap-[0.7vw] text-stone-800">
              <div className="w-[2.4vw] h-[2.4vw] rounded-[0.6vw] bg-orange-50 flex items-center justify-center shrink-0 text-[#ec5137]">
                <AlertTriangle className="w-[1.2vw] h-[1.2vw]" />
              </div>
              <div>
                <h3 className="text-[1vw] font-bold text-stone-900">
                  Close Ticket #{ticket.id}?
                </h3>
                <p className="text-[0.72vw] text-stone-500">
                  Mark this support ticket as resolved/closed.
                </p>
              </div>
            </div>

            <p className="text-[0.78vw] text-stone-600 leading-relaxed font-normal bg-stone-50 p-[0.7vw] rounded-[0.55vw] border border-stone-200/80">
              Are you sure you want to mark <strong className="text-stone-900">"{ticket.subject}"</strong> as closed? You will still be able to view the full discussion history at any time.
            </p>

            <div className="flex items-center justify-end gap-[0.6vw] pt-[0.45vw]">
              <button
                type="button"
                onClick={() => setShowCloseConfirm(false)}
                className="px-[0.9vw] py-[0.45vw] text-[0.78vw] font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className="px-[1vw] py-[0.45vw] text-[0.78vw] font-semibold text-white bg-stone-800 hover:bg-stone-900 rounded-[0.55vw] transition-colors cursor-pointer shadow-2xs"
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
