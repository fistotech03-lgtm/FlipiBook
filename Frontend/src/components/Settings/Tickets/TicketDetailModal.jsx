// Frontend/src/components/Settings/Tickets/TicketDetailModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  Send, 
  ChevronUp, 
  ChevronDown, 
  Reply, 
  Plus, 
  Star, 
  User, 
  HelpCircle, 
  FileText, 
  Download, 
  Activity, 
  Radio, 
  ArrowLeft
} from 'lucide-react';
import { TICKET_PRIORITIES } from './data/ticketData';

export default function TicketDetailModal({ 
  ticket, 
  isOpen, 
  onClose, 
  onAddMessage, 
  onUpdateStatus, 
  currentUser 
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CC Recipients input state
  const [ccList, setCcList] = useState(() => {
    return ticket?.ccRecipients || [
      'atchaya@fist-o.com',
      'project.manager@fist-o.com',
      'dev.team@flipibook.com'
    ];
  });
  const [newCcEmail, setNewCcEmail] = useState('');

  // Accordion collapsibles
  const [infoOpen, setInfoOpen] = useState(true);
  const [ccOpen, setCcOpen] = useState(true);
  const [supportOpen, setSupportOpen] = useState(true);

  if (!isOpen || !ticket) return null;

  const priorityObj = TICKET_PRIORITIES.find(p => p.id === ticket.priority) || { label: 'Medium' };
  const statusLabel = ticket.status === 'answered' ? 'Answered' : (ticket.status || 'Open');

  const handleAddCc = (e) => {
    e.preventDefault();
    if (newCcEmail.trim() && !ccList.includes(newCcEmail.trim())) {
      setCcList([...ccList, newCcEmail.trim()]);
      setNewCcEmail('');
    }
  };

  const handleRemoveCc = (emailToRemove) => {
    setCcList(ccList.filter(e => e !== emailToRemove));
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      authorName: currentUser?.name || ticket.requester?.name || 'Authorized User',
      badge: 'Authorized User',
      email: currentUser?.email || ticket.requester?.email || 'user@flipibook.com',
      timestamp: 'Just now',
      content: replyText.trim()
    };

    setTimeout(() => {
      onAddMessage(ticket.id, newMessage);
      setReplyText('');
      setIsSubmitting(false);
      setShowReplyForm(false);
    }, 200);
  };

  const allMessages = ticket.messages && ticket.messages.length > 0
    ? ticket.messages
    : [
        {
          id: 'initial',
          sender: 'user',
          authorName: ticket.requester?.name || 'Requester',
          badge: 'Authorized User',
          email: ticket.requester?.email || '',
          timestamp: ticket.submittedAt || 'Earlier',
          content: ticket.description
        }
      ];

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150 select-none font-sans">
      <div 
        className="bg-white w-full h-full flex flex-col text-gray-800 overflow-hidden"
        role="dialog"
      >
        {/* Top Title & Close Bar */}
        <div className="bg-[#f8f9fa] px-[1.5vw] py-[0.9vw] border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-[0.75vw]">
            <button
              type="button"
              onClick={onClose}
              className="px-[0.75vw] py-[0.45vw] rounded-[0.5vw] border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-[0.4vw] text-[0.78vw] font-medium shadow-xs"
              title="Back to Tickets"
            >
              <ArrowLeft className="w-[0.9vw] h-[0.9vw]" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex flex-col">
              <h1 className="text-[1.1vw] font-semibold text-gray-800 tracking-tight leading-snug">
                Ticket #{ticket.id} - Sub : {ticket.subject}
              </h1>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-[0.3vw] rounded-[0.4vw] hover:bg-gray-100 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-[1vw] h-[1vw]" strokeWidth="2.2" />
          </button>
        </div>

        {/* Action Top Bar */}
        <div className="px-[1.5vw] py-[0.6vw] bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <button 
            type="button"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="inline-flex items-center gap-[0.35vw] px-[0.9vw] py-[0.4vw] rounded-[0.5vw] bg-[#EC5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.76vw] transition-all cursor-pointer shadow-xs"
          >
            <Reply className="w-[0.8vw] h-[0.8vw]" />
            <span>Reply</span>
          </button>

          <button 
            type="button"
            onClick={() => setShowReplyForm(true)}
            className="text-gray-500 hover:text-gray-800 p-[0.3vw] rounded-[0.4vw] hover:bg-gray-100 transition-colors cursor-pointer"
            title="Add response"
          >
            <Plus className="w-[0.9vw] h-[0.9vw]" />
          </button>
        </div>

        {/* Main Content 2-Column Full-Width Layout */}
        <div className="flex-1 p-[1.5vw] grid grid-cols-1 lg:grid-cols-12 gap-[1.5vw] bg-[#f8f9fa] overflow-y-auto">
          {/* Left Column (Ticket Info Sidebar) */}
          <div className="lg:col-span-4 space-y-[1vw]">
            {/* Box 1: Ticket Information */}
            <div className="bg-white rounded-[1vw] border border-gray-200 overflow-hidden shadow-sm">
              <div 
                onClick={() => setInfoOpen(!infoOpen)}
                className="bg-[#f8f9fa] px-[1.1vw] py-[0.75vw] border-b border-gray-100 flex items-center justify-between cursor-pointer select-none text-gray-800 font-medium text-[0.8vw] tracking-wide"
              >
                <div className="flex items-center gap-[0.45vw]">
                  <FileText className="w-[0.85vw] h-[0.85vw] text-gray-500" />
                  <span>Ticket Information</span>
                </div>
                {infoOpen ? <ChevronUp className="w-[0.85vw] h-[0.85vw]" /> : <ChevronDown className="w-[0.85vw] h-[0.85vw]" />}
              </div>

              {infoOpen && (
                <div className="p-[1.1vw] space-y-[0.75vw] text-[0.76vw] text-gray-700">
                  <div>
                    <span className="text-[0.7vw] text-gray-400 font-normal">Requestor</span>
                    <div className="mt-[0.1vw] flex items-center gap-[0.4vw] font-medium text-gray-800 text-[0.82vw]">
                      <span>{ticket.requester?.name || 'Authorized User'}</span>
                      <span className="text-[0.66vw] bg-gray-100 text-gray-600 px-[0.5vw] py-[0.1vw] rounded-full font-medium">
                        {ticket.requester?.badge || 'Authorized User'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[0.7vw] text-gray-400 font-normal">Department</span>
                    <div className="mt-[0.1vw] font-medium text-gray-800 text-[0.82vw]">
                      {ticket.department || ticket.moduleName || 'IDC Support'}
                    </div>
                  </div>

                  <div>
                    <span className="text-[0.7vw] text-gray-400 font-normal">Submitted</span>
                    <div className="mt-[0.1vw] text-gray-600 font-normal text-[0.78vw]">
                      {ticket.submittedAt || 'Recently'}
                    </div>
                  </div>

                  <div>
                    <span className="text-[0.7vw] text-gray-400 font-normal">Last Updated</span>
                    <div className="mt-[0.1vw] text-gray-600 font-normal text-[0.78vw]">
                      {ticket.lastUpdated || 'Recently'}
                    </div>
                  </div>

                  <div>
                    <span className="text-[0.7vw] text-gray-400 font-normal">Status/Priority</span>
                    <div className="mt-[0.2vw] flex items-center gap-[0.5vw]">
                      <span className="bg-gray-100 text-gray-700 px-[0.65vw] py-[0.15vw] rounded-full text-[0.68vw] font-medium">
                        {statusLabel}
                      </span>
                      <span className="text-gray-600 font-medium text-[0.74vw]">
                        {priorityObj.label || 'Medium'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-[0.5vw] flex items-center gap-[0.55vw]">
                    <button 
                      type="button"
                      onClick={() => setShowReplyForm(true)}
                      className="flex-1 py-[0.45vw] px-[0.75vw] rounded-[0.5vw] bg-[#EC5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.76vw] flex items-center justify-center gap-[0.35vw] transition-all cursor-pointer shadow-xs"
                    >
                      <Reply className="w-[0.8vw] h-[0.8vw]" />
                      <span>Reply</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => onUpdateStatus?.(ticket.id, 'closed')}
                      className="flex-1 py-[0.45vw] px-[0.75vw] rounded-[0.5vw] bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium text-[0.76vw] flex items-center justify-center gap-[0.35vw] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <X className="w-[0.8vw] h-[0.8vw]" />
                      <span>Close</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Box 2: CC Recipients */}
            <div className="bg-white rounded-[1vw] border border-gray-200 overflow-hidden shadow-sm">
              <div 
                onClick={() => setCcOpen(!ccOpen)}
                className="bg-[#f8f9fa] px-[1.1vw] py-[0.75vw] border-b border-gray-100 flex items-center justify-between cursor-pointer select-none text-gray-800 font-medium text-[0.8vw] tracking-wide"
              >
                <div className="flex items-center gap-[0.45vw]">
                  <User className="w-[0.85vw] h-[0.85vw] text-gray-500" />
                  <span>CC Recipients</span>
                </div>
                {ccOpen ? <ChevronUp className="w-[0.85vw] h-[0.85vw]" /> : <ChevronDown className="w-[0.85vw] h-[0.85vw]" />}
              </div>

              {ccOpen && (
                <div className="p-[1.1vw] space-y-[0.75vw] text-[0.76vw]">
                  <div className="space-y-[0.4vw]">
                    {ccList.map((email, idx) => (
                      <div key={idx} className="flex items-center justify-between text-gray-700 group hover:text-gray-900 py-[0.1vw]">
                        <span className="truncate pr-[0.5vw] font-mono text-[0.72vw]">{email}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveCc(email)}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-[0.2vw]"
                          title="Remove email"
                        >
                          <X className="w-[0.75vw] h-[0.75vw]" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddCc} className="pt-[0.3vw] flex items-center gap-[0.4vw]">
                    <input 
                      type="email"
                      value={newCcEmail}
                      onChange={(e) => setNewCcEmail(e.target.value)}
                      placeholder="Enter Email Address"
                      className="flex-1 border border-gray-200 rounded-[0.5vw] px-[0.75vw] py-[0.4vw] text-[0.76vw] text-gray-800 focus:outline-none focus:border-[#4c5add]"
                    />
                    <button 
                      type="submit"
                      className="px-[0.85vw] py-[0.4vw] bg-white hover:bg-gray-50 border border-gray-300 rounded-[0.5vw] text-[0.76vw] font-medium text-gray-700 cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Box 3: Support Navigation */}
            <div className="bg-white rounded-[1vw] border border-gray-200 overflow-hidden shadow-sm">
              <div 
                onClick={() => setSupportOpen(!supportOpen)}
                className="bg-[#f8f9fa] px-[1.1vw] py-[0.75vw] border-b border-gray-100 flex items-center justify-between cursor-pointer select-none text-gray-800 font-medium text-[0.8vw] tracking-wide"
              >
                <div className="flex items-center gap-[0.45vw]">
                  <HelpCircle className="w-[0.85vw] h-[0.85vw] text-gray-500" />
                  <span>Support</span>
                </div>
                {supportOpen ? <ChevronUp className="w-[0.85vw] h-[0.85vw]" /> : <ChevronDown className="w-[0.85vw] h-[0.85vw]" />}
              </div>

              {supportOpen && (
                <div className="divide-y divide-gray-100 text-[0.76vw]">
                  <div className="px-[1.1vw] py-[0.6vw] flex items-center justify-between text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <span>My Support Tickets</span>
                    <FileText className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                  </div>
                  <div className="px-[1.1vw] py-[0.6vw] flex items-center justify-between text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <span>Announcements</span>
                    <Radio className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                  </div>
                  <div className="px-[1.1vw] py-[0.6vw] flex items-center justify-between text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <span>Knowledgebase</span>
                    <HelpCircle className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                  </div>
                  <div className="px-[1.1vw] py-[0.6vw] flex items-center justify-between font-medium text-gray-900 border-l-2 border-[#EC5137] bg-gray-50/50">
                    <span>Downloads</span>
                    <Download className="w-[0.8vw] h-[0.8vw] text-gray-500" />
                  </div>
                  <div className="px-[1.1vw] py-[0.6vw] flex items-center justify-between text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <span>Network Status</span>
                    <Activity className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                  </div>
                  <div className="px-[1.1vw] py-[0.6vw] flex items-center justify-between text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <span>Open Ticket</span>
                    <Send className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Ticket Messages & Replies) */}
          <div className="lg:col-span-8 space-y-[1.2vw]">
            {/* Conditional Inline Reply Box */}
            {showReplyForm && (
              <form onSubmit={handleReplySubmit} className="bg-white rounded-[1vw] border border-gray-200 p-[1.5vw] shadow-sm space-y-[0.85vw] animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[0.85vw] font-medium text-gray-800">
                    Post Reply to Staff
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setShowReplyForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-[0.74vw] font-medium"
                  >
                    Cancel
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide your feedback or further issue details..."
                  className="w-full p-[0.85vw] text-[0.78vw] border border-gray-200 rounded-[0.5vw] focus:outline-none focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] text-gray-800 font-sans leading-relaxed"
                />

                <div className="flex items-center justify-between pt-[0.4vw]">
                  <div className="text-[0.74vw] text-gray-500 font-normal">
                    Replying as: <strong className="text-gray-800 font-medium">{ticket.requester?.name || 'Authorized User'}</strong>
                  </div>
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSubmitting}
                    className="px-[1.2vw] py-[0.48vw] rounded-[0.5vw] bg-[#EC5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.78vw] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isSubmitting ? 'Submitting...' : 'Post Reply'}
                  </button>
                </div>
              </form>
            )}

            {/* Conversation Messages Thread */}
            <div className="space-y-[1.2vw]">
              {allMessages.map((msg) => {
                const isAgent = msg.sender === 'agent';

                return (
                  <div 
                    key={msg.id}
                    className="bg-white rounded-[1vw] border border-gray-200 overflow-hidden shadow-sm"
                  >
                    {/* Header */}
                    <div className="bg-[#f8f9fa] px-[1.2vw] py-[0.8vw] border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-[0.55vw]">
                      <div className="flex items-center gap-[0.75vw]">
                        <div className={`w-[2.2vw] h-[2.2vw] rounded-full flex items-center justify-center text-white text-[0.78vw] font-medium ${
                          isAgent ? 'bg-gray-800' : 'bg-[#EC5137]'
                        }`}>
                          <User className="w-[1.1vw] h-[1.1vw]" />
                        </div>

                        <div>
                          <div className="flex items-center gap-[0.45vw]">
                            <span className="text-[0.85vw] font-medium text-gray-800">
                              {msg.authorName}
                            </span>
                            {msg.badge && (
                              <span className={`text-[0.66vw] px-[0.5vw] py-[0.1vw] rounded-full font-medium ${
                                isAgent ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {msg.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[0.68vw] text-gray-400 font-normal">
                            {msg.subRole || msg.email || ''}
                          </div>
                        </div>
                      </div>

                      <div className="text-[0.72vw] text-gray-400 font-normal">
                        {msg.timestamp}
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="p-[1.2vw] text-[0.78vw] text-gray-700 font-normal leading-relaxed whitespace-pre-line">
                      {msg.content}
                    </div>

                    {/* Rating stars */}
                    {isAgent && (
                      <div className="px-[1.2vw] pb-[0.8vw] flex justify-end items-center gap-[0.25vw] text-gray-300">
                        <Star className="w-[0.85vw] h-[0.85vw] hover:text-amber-400 cursor-pointer" />
                        <Star className="w-[0.85vw] h-[0.85vw] hover:text-amber-400 cursor-pointer" />
                        <Star className="w-[0.85vw] h-[0.85vw] hover:text-amber-400 cursor-pointer" />
                        <Star className="w-[0.85vw] h-[0.85vw] hover:text-amber-400 cursor-pointer" />
                        <Star className="w-[0.85vw] h-[0.85vw] hover:text-amber-400 cursor-pointer" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
