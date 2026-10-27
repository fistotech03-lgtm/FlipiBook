import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Search,
  Send,
  CheckCircle2,
  CircleDot,
  Clock,
  Sparkles,
  Loader2,
  RefreshCw,
  Paperclip,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  getAdminTickets,
  replyToTicket,
  updateTicketStatus
} from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

export default function TicketsModerationPage() {
  const { adminUser, showToast } = useAdmin();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [counts, setCounts] = useState({ total: 0, open: 0, closed: 0 });

  // Active expanded ticket for details & reply
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatusAction, setReplyStatusAction] = useState('open'); // 'open' | 'closed'
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchTicketsList = async () => {
    try {
      setLoading(true);
      const res = await getAdminTickets({
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        limit: 50
      });

      if (res && res.success) {
        setTickets(res.data || []);
        if (res.counts) {
          setCounts(res.counts);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to retrieve support tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsList();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTicketsList();
  };

  const handleStatusToggle = async (ticket) => {
    const newStatus = ticket.status === 'open' ? 'closed' : 'open';
    try {
      await updateTicketStatus(ticket.id, newStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: newStatus } : t))
      );
      setCounts((prev) => ({
        ...prev,
        open: newStatus === 'open' ? prev.open + 1 : Math.max(0, prev.open - 1),
        closed: newStatus === 'closed' ? prev.closed + 1 : Math.max(0, prev.closed - 1)
      }));
      showToast(`Ticket #${ticket.id} marked as ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update ticket status', 'error');
    }
  };

  const handleSendReply = async (ticket) => {
    if (!replyText.trim()) return;
    try {
      setIsSubmittingReply(true);
      const res = await replyToTicket(ticket.id, {
        content: replyText.trim(),
        authorName: adminUser?.name || 'Platform Administrator',
        authorEmail: adminUser?.email || 'admin@flipibook.com',
        sender: 'admin'
      });

      // If admin selected to close ticket on reply
      if (replyStatusAction === 'closed' && ticket.status !== 'closed') {
        await updateTicketStatus(ticket.id, 'closed');
      }

      const updatedTicket = res.data;
      if (replyStatusAction === 'closed') {
        updatedTicket.status = 'closed';
      }

      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? updatedTicket : t))
      );

      setReplyText('');
      showToast(`Official reply posted to Ticket #${ticket.id}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to post reply', 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Modules' },
    { id: 'my-flipbooks', label: 'My Flipbooks' },
    { id: 'template-editor', label: 'Template Editor' },
    { id: 'customised-editor', label: 'Customised Editor' },
    { id: '3d-editor', label: '3D Editor' },
    { id: 'billing-account', label: 'Billing & Account' },
    { id: 'others', label: 'Others' }
  ];

  return (
    <div className="space-y-[1.2vw]">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-[0.8vw] p-[1.2vw] shadow-xs">
        <div>
          <div className="flex items-center gap-[0.6vw]">
            <span className="p-[0.45vw] bg-orange-50 text-[#ec5137] rounded-[0.5vw]">
              <LifeBuoy size="1.2vw" />
            </span>
            <h1 className="text-[1.3vw] font-bold text-slate-800">Support Tickets Moderation</h1>
          </div>
          <p className="text-[0.8vw] text-slate-500 mt-[0.2vw]">
            Inspect client inquiries, filter by department & status, and dispatch official staff replies.
          </p>
        </div>
        <button
          onClick={fetchTicketsList}
          disabled={loading}
          className="flex items-center gap-[0.4vw] px-[0.9vw] py-[0.5vw] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[0.8vw] font-medium rounded-[0.5vw] transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw size="0.85vw" className={loading ? 'animate-spin text-[#ec5137]' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-[1vw]">
        <div className="bg-white border border-slate-200 rounded-[0.8vw] p-[1vw] shadow-xs">
          <p className="text-[0.75vw] text-slate-400 font-semibold uppercase tracking-wider">Total Tickets</p>
          <p className="text-[1.6vw] font-extrabold text-slate-800 mt-[0.2vw]">{counts.total || tickets.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[0.8vw] p-[1vw] shadow-xs">
          <p className="text-[0.75vw] text-slate-400 font-semibold uppercase tracking-wider">Open Inquiries</p>
          <p className="text-[1.6vw] font-extrabold text-emerald-600 mt-[0.2vw]">
            {counts.open || tickets.filter((t) => t.status === 'open').length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[0.8vw] p-[1vw] shadow-xs">
          <p className="text-[0.75vw] text-slate-400 font-semibold uppercase tracking-wider">Closed Tickets</p>
          <p className="text-[1.6vw] font-extrabold text-slate-600 mt-[0.2vw]">
            {counts.closed || tickets.filter((t) => t.status === 'closed').length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[0.8vw] p-[1vw] shadow-xs">
          <p className="text-[0.75vw] text-slate-400 font-semibold uppercase tracking-wider">Replied by Staff</p>
          <p className="text-[1.6vw] font-extrabold text-[#ec5137] mt-[0.2vw]">
            {tickets.filter((t) => t.messages?.some((m) => m.sender === 'admin' || m.sender === 'agent' || m.sender === 'staff')).length}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-[0.8vw] p-[0.9vw] shadow-xs flex flex-wrap items-center justify-between gap-[0.8vw]">
        <div className="flex items-center gap-[0.5vw]">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-[0.2vw] rounded-[0.5vw]">
            {['all', 'open', 'closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-[0.9vw] py-[0.35vw] text-[0.78vw] font-semibold rounded-[0.4vw] capitalize transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Module Selector */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-[0.78vw] px-[0.7vw] py-[0.45vw] rounded-[0.5vw] outline-hidden focus:border-[#ec5137]"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-[18vw]">
          <Search size="0.9vw" className="absolute left-[0.7vw] top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by ID, subject, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-[2.2vw] pr-[0.8vw] py-[0.45vw] bg-slate-50 border border-slate-200 rounded-[0.5vw] text-[0.78vw] focus:bg-white focus:border-[#ec5137] outline-hidden transition-all"
          />
        </form>
      </div>

      {/* Tickets List */}
      <div className="space-y-[0.8vw]">
        {loading ? (
          <div className="h-[25vh] bg-white border border-slate-200 rounded-[0.8vw] flex flex-col items-center justify-center text-slate-400 gap-[0.5vw]">
            <Loader2 size="1.6vw" className="animate-spin text-[#ec5137]" />
            <p className="text-[0.85vw] font-medium">Loading support tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="h-[25vh] bg-white border border-slate-200 rounded-[0.8vw] flex flex-col items-center justify-center text-slate-400 gap-[0.5vw]">
            <LifeBuoy size="2.5vw" className="text-slate-300 stroke-[1.2]" />
            <p className="text-[0.9vw] font-semibold text-slate-700">No support tickets found</p>
            <p className="text-[0.78vw] text-slate-400">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const isClosed = ticket.status === 'closed';
            const isExpanded = expandedTicketId === ticket.id;
            const messages = ticket.messages || [];
            const hasAdminReplied = messages.some(
              (m) => m.sender === 'admin' || m.sender === 'agent' || m.sender === 'staff'
            );

            return (
              <div
                key={ticket.id}
                className="bg-white border border-slate-200 rounded-[0.8vw] overflow-hidden shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Main Card Summary Header */}
                <div className="p-[1.1vw] flex items-start justify-between gap-[1vw]">
                  <div className="space-y-[0.4vw] flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-[0.6vw]">
                      <span className="font-mono text-[0.75vw] font-bold px-[0.5vw] py-[0.15vw] bg-slate-100 text-slate-700 rounded-[0.35vw]">
                        #{ticket.id}
                      </span>
                      <span className="text-[0.72vw] font-semibold px-[0.55vw] py-[0.15vw] rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {ticket.department || ticket.moduleName || ticket.moduleId}
                      </span>
                      <span
                        className={`text-[0.72vw] font-semibold px-[0.55vw] py-[0.15vw] rounded-full uppercase tracking-wider ${
                          ticket.priority === 'urgent'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : ticket.priority === 'high'
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {ticket.priority || 'medium'}
                      </span>
                      {hasAdminReplied && (
                        <span className="text-[0.72vw] font-semibold px-[0.55vw] py-[0.15vw] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-[0.2vw]">
                          <ShieldCheck size="0.75vw" /> Replied
                        </span>
                      )}
                      <span className="text-[0.75vw] text-slate-400 flex items-center gap-[0.25vw] ml-auto">
                        <Clock size="0.75vw" />
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'Recently'}
                      </span>
                    </div>

                    <h3 className="text-[1.05vw] font-bold text-slate-900 hover:text-[#ec5137] transition-colors">
                      {ticket.subject}
                    </h3>

                    <p className="text-[0.82vw] text-slate-600 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>

                    {/* Requester & Meta Row */}
                    <div className="flex flex-wrap items-center gap-[1.2vw] pt-[0.2vw] text-[0.75vw] text-slate-500">
                      <div className="flex items-center gap-[0.35vw]">
                        <User size="0.75vw" className="text-slate-400" />
                        <span className="font-semibold text-slate-700">
                          {ticket.requester?.name || 'Customer'}
                        </span>
                        <span className="text-slate-400">({ticket.requester?.email || 'No email'})</span>
                      </div>

                      <div className="flex items-center gap-[0.35vw]">
                        <MessageSquare size="0.75vw" className="text-slate-400" />
                        <span>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
                      </div>

                      {ticket.attachments?.length > 0 && (
                        <div className="flex items-center gap-[0.35vw]">
                          <Paperclip size="0.75vw" className="text-slate-400" />
                          <span>{ticket.attachments.length} attachment{ticket.attachments.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Status Badge & Inspect Toggle */}
                  <div className="flex flex-col items-end gap-[0.6vw] flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(ticket)}
                      className={`inline-flex items-center gap-[0.3vw] px-[0.7vw] py-[0.3vw] rounded-full text-[0.75vw] font-semibold transition-all cursor-pointer ${
                        isClosed
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                      title={isClosed ? 'Click to Reopen Ticket' : 'Click to Mark as Closed'}
                    >
                      {isClosed ? (
                        <>
                          <CheckCircle2 size="0.85vw" className="text-slate-400" />
                          <span>Closed</span>
                        </>
                      ) : (
                        <>
                          <CircleDot size="0.85vw" className="text-emerald-500 animate-pulse" />
                          <span>Open</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                      className="inline-flex items-center gap-[0.35vw] px-[0.8vw] py-[0.4vw] rounded-[0.45vw] text-[0.78vw] font-semibold text-slate-700 bg-slate-100 hover:bg-[#ec5137] hover:text-white transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? 'Collapse' : 'Inspect & Reply'}</span>
                      {isExpanded ? <ChevronUp size="0.85vw" /> : <ChevronDown size="0.85vw" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section: Conversation Thread & Reply Composer */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/70 p-[1.2vw] space-y-[1.2vw]">
                    {/* Attachments Preview if any */}
                    {ticket.attachments?.length > 0 && (
                      <div className="bg-white p-[0.9vw] rounded-[0.6vw] border border-slate-200">
                        <p className="text-[0.75vw] font-bold text-slate-700 uppercase tracking-wider mb-[0.5vw]">
                          Attachments ({ticket.attachments.length})
                        </p>
                        <div className="flex flex-wrap gap-[0.6vw]">
                          {ticket.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-[0.4vw] p-[0.4vw] bg-slate-50 hover:bg-orange-50 border border-slate-200 rounded-[0.4vw] text-[0.75vw] font-medium text-slate-700 transition-colors"
                            >
                              {att.url && att.url.startsWith('data:image') ? (
                                <img src={att.url} alt={att.name} className="w-[1.8vw] h-[1.8vw] object-cover rounded-[0.25vw]" />
                              ) : (
                                <Paperclip size="0.85vw" className="text-slate-400" />
                              )}
                              <span className="truncate max-w-[12vw]">{att.name || `Attachment ${idx + 1}`}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conversation Messages */}
                    <div className="space-y-[0.8vw]">
                      <h4 className="text-[0.8vw] font-bold text-slate-700 uppercase tracking-wider">
                        Conversation Thread ({messages.length})
                      </h4>

                      <div className="space-y-[0.6vw] max-h-[35vh] overflow-y-auto pr-[0.4vw]">
                        {messages.map((msg, idx) => {
                          const isAdminMsg = msg.sender === 'admin' || msg.sender === 'agent' || msg.sender === 'staff';
                          return (
                            <div
                              key={msg.id || idx}
                              className={`p-[0.9vw] rounded-[0.6vw] border ${
                                isAdminMsg
                                  ? 'bg-orange-50/70 border-orange-200 ml-[2vw]'
                                  : 'bg-white border-slate-200 mr-[2vw]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-[0.4vw]">
                                <div className="flex items-center gap-[0.4vw]">
                                  <span
                                    className={`w-[1.4vw] h-[1.4vw] rounded-full flex items-center justify-center text-[0.65vw] font-bold ${
                                      isAdminMsg
                                        ? 'bg-[#ec5137] text-white'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {isAdminMsg ? 'AD' : 'CU'}
                                  </span>
                                  <span className="text-[0.78vw] font-bold text-slate-800">
                                    {msg.authorName || (isAdminMsg ? 'Staff Support' : 'Customer')}
                                  </span>
                                  {isAdminMsg && (
                                    <span className="text-[0.65vw] font-semibold px-[0.4vw] py-[0.1vw] rounded bg-[#ec5137]/10 text-[#ec5137]">
                                      Official Response
                                    </span>
                                  )}
                                </div>
                                <span className="text-[0.7vw] text-slate-400">
                                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              <p className="text-[0.82vw] text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Official Reply Box */}
                    <div className="bg-white p-[1vw] rounded-[0.6vw] border border-slate-200 space-y-[0.7vw]">
                      <div className="flex items-center justify-between">
                        <label className="text-[0.8vw] font-bold text-slate-800 flex items-center gap-[0.4vw]">
                          <Send size="0.85vw" className="text-[#ec5137]" />
                          <span>Compose Official Reply</span>
                        </label>

                        {/* Status transition on reply */}
                        <div className="flex items-center gap-[0.4vw] text-[0.75vw]">
                          <span className="text-slate-500 font-medium">After sending:</span>
                          <select
                            value={replyStatusAction}
                            onChange={(e) => setReplyStatusAction(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-[0.35vw] px-[0.5vw] py-[0.2vw] font-medium outline-hidden"
                          >
                            <option value="open">Keep Ticket Open</option>
                            <option value="closed">Close Ticket</option>
                          </select>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Write an official reply to ${ticket.requester?.name || 'the customer'}...`}
                        className="w-full p-[0.7vw] bg-slate-50 border border-slate-200 rounded-[0.5vw] text-[0.82vw] focus:bg-white focus:border-[#ec5137] outline-hidden transition-all resize-y"
                      />

                      <div className="flex items-center justify-end gap-[0.6vw]">
                        <button
                          type="button"
                          onClick={() => setExpandedTicketId(null)}
                          className="px-[0.9vw] py-[0.45vw] text-[0.78vw] font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!replyText.trim() || isSubmittingReply}
                          onClick={() => handleSendReply(ticket)}
                          className="flex items-center gap-[0.4vw] px-[1.1vw] py-[0.45vw] bg-[#ec5137] hover:bg-[#d9442b] text-white text-[0.78vw] font-semibold rounded-[0.5vw] transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                        >
                          {isSubmittingReply ? (
                            <>
                              <Loader2 size="0.85vw" className="animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send size="0.85vw" />
                              <span>Dispatch Reply</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
