import React from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  CircleDot, 
  X, 
  AlertTriangle, 
  RotateCcw, 
  Paperclip, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import RaiseTicketModal from './RaiseTicketModal';
import { TICKET_MODULES } from './data/ticketData';
import CustomDropdown from '../../CustomDropdown';
import { useTickets } from './hooks';
import { formatDateTime, formatDateOnly } from './utils';

export default function Tickets() {
  const {
    currentUser,
    isAdminUser,
    filteredTickets,
    paginatedTickets,
    counts,
    isLoading,
    hasLoadedOnce,
    totalPages,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    dateFilter,
    setDateFilter,
    customDate,
    setCustomDate,
    isRaiseModalOpen,
    setIsRaiseModalOpen,
    ticketToDelete,
    setTicketToDelete,
    hasActiveFilters,
    clearFilters,
    handleRaiseTicket,
    handleConfirmDelete,
    handleSelectTicket
  } = useTickets(8);

  const ITEMS_PER_PAGE = 8;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#fbfbfb] select-none font-sans">
      {/* Top Header */}
      <header className="bg-[#fbfbfb] px-[1.5vw] pt-[1.2vw] pb-[0.8vw] flex flex-col sm:flex-row sm:items-center justify-between gap-[0.8vw] flex-shrink-0">
        <div>
          <div className="flex items-center gap-[0.6vw]">
            <h1 className="text-[1.35vw] font-bold text-stone-900 tracking-tight leading-tight">
              Support Tickets
            </h1>
            {isAdminUser && (
              <span className="px-[0.55vw] py-[0.15vw] rounded-full text-[0.68vw] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                Staff Admin View
              </span>
            )}
          </div>
          <p className="text-[0.78vw] text-stone-600 mt-[0.2vw] font-normal">
            Track and manage your support inquiries with Flipibook engineering
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-[0.6vw]">
          <button
            onClick={() => setIsRaiseModalOpen(true)}
            className="px-[1vw] py-[0.55vw] rounded-[0.6vw] text-[0.82vw] font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] transition-all flex items-center justify-center gap-[0.45vw] cursor-pointer shadow-sm hover:shadow active:scale-[0.99] shrink-0"
          >
            <Plus className="w-[0.95vw] h-[0.95vw]" />
            <span>Raise Ticket</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-[1.5vw] pb-[1.5vw] pt-0 space-y-[0.9vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Filter Area - White Card */}
        <div className="w-full bg-white rounded-[0.8vw] border border-stone-300 shadow-2xs p-[0.85vw]">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-[0.75vw]">
            
            {/* Status Segmented Tabs */}
            <div className="flex items-center p-[0.25vw] bg-stone-100/90 rounded-[0.6vw] border border-stone-200/90 self-start sm:self-auto overflow-x-auto max-w-full shadow-2xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex items-center gap-[0.45vw] px-[0.8vw] py-[0.45vw] rounded-[0.45vw] text-[0.78vw] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#0f52bdcf] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>All Tickets</span>
                <span className={`px-[0.45vw] py-[0.1vw] rounded-full text-[0.65vw] font-semibold ${
                  statusFilter === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}>
                  {counts.total}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('open')}
                className={`flex items-center gap-[0.45vw] px-[0.8vw] py-[0.45vw] rounded-[0.45vw] text-[0.78vw] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'open'
                    ? 'bg-[#0f52bdcf] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CircleDot className={`w-[0.75vw] h-[0.75vw] ${statusFilter === 'open' ? 'text-white' : 'text-emerald-600'}`} />
                <span>Open</span>
                <span className={`px-[0.45vw] py-[0.1vw] rounded-full text-[0.65vw] font-semibold ${
                  statusFilter === 'open'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {counts.open}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('closed')}
                className={`flex items-center gap-[0.45vw] px-[0.8vw] py-[0.45vw] rounded-[0.45vw] text-[0.78vw] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'closed'
                    ? 'bg-[#0f52bdcf] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CheckCircle2 className={`w-[0.75vw] h-[0.75vw] ${statusFilter === 'closed' ? 'text-white' : 'text-stone-500'}`} />
                <span>Closed</span>
                <span className={`px-[0.45vw] py-[0.1vw] rounded-full text-[0.65vw] font-semibold ${
                  statusFilter === 'closed'
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}>
                  {counts.closed}
                </span>
              </button>
            </div>

            {/* Right Controls: Category, Date & Search Input */}
            <div className="flex flex-wrap items-center gap-[0.6vw]">
              {/* Category / Department Dropdown */}
              <CustomDropdown
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                options={[
                  { value: 'all', label: 'All Modules' },
                  ...TICKET_MODULES.filter(m => m.id !== 'all').map(mod => ({ value: mod.id, label: mod.name }))
                ]}
                width="w-[10vw] min-w-[130px]"
                buttonClassName="h-[2.3vw] py-[0.35vw] text-[0.78vw] rounded-[0.55vw]"
              />

              {/* Date Filter Dropdown */}
              <CustomDropdown
                value={dateFilter}
                onChange={(val) => setDateFilter(val)}
                options={[
                  { value: 'all', label: 'All Dates' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'Past 7 Days' },
                  { value: 'month', label: 'Past 30 Days' },
                  { value: 'custom', label: 'Custom Date' }
                ]}
                width="w-[9.5vw] min-w-[125px]"
                buttonClassName="h-[2.3vw] py-[0.35vw] text-[0.78vw] rounded-[0.55vw]"
              />

              {/* Custom Date Input (Shown when 'custom' selected) */}
              {dateFilter === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="h-[2.3vw] px-[0.75vw] text-[0.78vw] font-medium rounded-[0.55vw] border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#ec5137]/20 focus:border-[#ec5137] shadow-2xs cursor-pointer"
                />
              )}

              {/* Live Search Input */}
              <div className="relative flex-1 sm:w-[13vw]">
                <Search className="w-[0.85vw] h-[0.85vw] text-stone-400 absolute left-[0.75vw] top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject, ID..."
                  className="w-full h-[2.3vw] pl-[2vw] pr-[1.8vw] text-[0.78vw] rounded-[0.55vw] border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#ec5137]/20 focus:border-[#ec5137] text-stone-900 placeholder:text-stone-400 font-normal shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-[0.6vw] top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-[0.2vw] rounded-full cursor-pointer"
                  >
                    <X className="w-[0.75vw] h-[0.75vw]" />
                  </button>
                )}
              </div>

              {/* Clear active filters button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="h-[2.3vw] px-[0.75vw] rounded-[0.55vw] bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 text-[0.75vw] font-semibold flex items-center gap-[0.35vw] transition-colors cursor-pointer shrink-0"
                  title="Reset all active filters"
                >
                  <RotateCcw className="w-[0.75vw] h-[0.75vw]" />
                  <span>Clear</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Ticket Table View */}
        <div className="w-full">
          {!hasLoadedOnce && isLoading ? (
            <div className="bg-white rounded-[0.8vw] border border-stone-200 p-[3vw] text-center shadow-xs flex flex-col items-center justify-center min-h-[16vw]">
              <Loader2 className="w-[1.8vw] h-[1.8vw] animate-spin text-[#ec5137] mb-[0.6vw]" />
              <p className="text-[0.85vw] font-semibold text-stone-700">Loading support tickets...</p>
              <p className="text-[0.72vw] text-stone-400 mt-[0.2vw]">Retrieving latest tickets from server</p>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="bg-white rounded-[0.8vw] border border-stone-300 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-orange-200 bg-[#fff5f2] text-[0.72vw] font-bold text-[#b83822] uppercase tracking-wider select-none divide-x divide-orange-100">
                      <th className="py-[0.7vw] px-[0.85vw] text-center whitespace-nowrap w-[3vw]">S.No</th>
                      <th className="py-[0.7vw] px-[0.85vw] whitespace-nowrap">Ticket ID</th>
                      {isAdminUser && (
                        <th className="py-[0.7vw] px-[0.85vw] whitespace-nowrap">Requester</th>
                      )}
                      <th className="py-[0.7vw] px-[0.85vw] whitespace-nowrap min-w-[15vw]">Subject</th>
                      <th className="py-[0.7vw] px-[0.85vw] whitespace-nowrap">Category</th>
                      <th className="py-[0.7vw] px-[0.85vw] whitespace-nowrap">Date Raised</th>
                      <th className="py-[0.7vw] px-[0.85vw] whitespace-nowrap">Last Activity</th>
                      <th className="py-[0.7vw] px-[0.85vw] whitespace-nowrap text-center">Messages</th>
                      <th className="py-[0.7vw] px-[0.85vw] whitespace-nowrap text-center">Attachments</th>
                      <th className="py-[0.7vw] px-[0.85vw] whitespace-nowrap text-center">Status</th>
                      <th className="py-[0.7vw] px-[0.85vw] whitespace-nowrap text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {paginatedTickets.map((ticket, index) => {
                      const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';
                      const messageCount = (ticket.messages && ticket.messages.length) || 1;
                      const attachmentCount = (ticket.attachments && ticket.attachments.length) || 0;
                      const hasAdminReplied = Boolean(
                        ticket.messages && 
                        ticket.messages.some(m => m.sender === 'agent' || m.sender === 'staff' || m.sender === 'admin')
                      );

                      const categoryName = ticket.department || ticket.moduleName || 'General';
                      const dateRaised = formatDateOnly(ticket.createdAt || ticket.submittedAt);
                      const lastActivity = formatDateTime(ticket.updatedAt || ticket.lastUpdated || ticket.createdAt || ticket.submittedAt);
                      const serialNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                      const requesterName = ticket.requester?.name || 'User';
                      const requesterEmail = ticket.requester?.email || '';

                      return (
                        <tr 
                          key={ticket.id}
                          onClick={() => handleSelectTicket(ticket)}
                          className="hover:bg-orange-50/40 transition-colors cursor-pointer group divide-x divide-stone-200"
                        >
                          {/* S.No */}
                          <td className="py-[0.75vw] px-[0.85vw] text-center whitespace-nowrap align-middle text-[0.8vw] font-medium text-stone-800">
                            {serialNumber}
                          </td>

                          {/* Ticket ID */}
                          <td className="py-[0.75vw] px-[0.85vw] whitespace-nowrap align-middle">
                            <span className="font-mono text-[0.8vw] font-medium text-stone-900 group-hover:text-[#ec5137] transition-colors">
                              #{ticket.id}
                            </span>
                          </td>

                          {/* Requester (Admin Mode only) */}
                          {isAdminUser && (
                            <td className="py-[0.75vw] px-[0.85vw] whitespace-nowrap align-middle">
                              <div className="flex flex-col">
                                <span className="font-semibold text-[0.8vw] text-stone-950">
                                  {requesterName}
                                </span>
                                {requesterEmail && (
                                  <span className="text-[0.68vw] text-stone-700">
                                    {requesterEmail}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Subject & Description */}
                          <td className="py-[0.75vw] px-[0.85vw] align-middle">
                            <div className="max-w-[24vw]">
                              <p className="text-[0.85vw] font-semibold text-stone-950 group-hover:text-[#ec5137] transition-colors line-clamp-1">
                                {ticket.subject}
                              </p>
                              {ticket.description && (
                                <p className="text-[0.72vw] text-stone-700 line-clamp-1 mt-[0.15vw] font-normal">
                                  {ticket.description}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-[0.75vw] px-[0.85vw] whitespace-nowrap align-middle text-[0.8vw] text-stone-900 font-medium">
                            {categoryName}
                          </td>

                          {/* Date Ticket Raised */}
                          <td className="py-[0.75vw] px-[0.85vw] whitespace-nowrap align-middle text-[0.8vw] text-stone-900 font-normal">
                            {dateRaised}
                          </td>

                          {/* Last Activity */}
                          <td className="py-[0.75vw] px-[0.85vw] whitespace-nowrap align-middle">
                            <div className="flex flex-col text-[0.8vw] text-stone-900">
                              <span className="font-medium text-stone-950">{lastActivity}</span>
                              <span className="text-[0.68vw] text-stone-700">
                                {hasAdminReplied ? 'Staff reply' : (isAdminUser ? requesterName : 'by you')}
                              </span>
                            </div>
                          </td>

                          {/* Messages */}
                          <td className="py-[0.75vw] px-[0.85vw] whitespace-nowrap text-center align-middle">
                            <span className="inline-flex items-center justify-center gap-[0.35vw] text-[0.8vw] font-medium text-stone-900">
                              <MessageSquare className="w-[0.85vw] h-[0.85vw] text-stone-700" />
                              <span>{messageCount}</span>
                            </span>
                          </td>

                          {/* Attachments */}
                          <td className="py-[0.75vw] px-[0.85vw] whitespace-nowrap text-center align-middle">
                            <span className="inline-flex items-center justify-center gap-[0.35vw] text-[0.8vw] font-medium text-stone-900">
                              <Paperclip className="w-[0.85vw] h-[0.85vw] text-stone-700" />
                              <span>{attachmentCount}</span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-[0.75vw] px-[0.85vw] whitespace-nowrap text-center align-middle">
                            {isClosed ? (
                              <div className="inline-flex items-center justify-center gap-[0.35vw] text-[0.8vw] font-medium text-stone-800">
                                <CheckCircle2 className="w-[0.9vw] h-[0.9vw] text-stone-600" />
                                <span>Closed</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center gap-[0.35vw] text-[0.8vw] font-semibold text-emerald-800">
                                <CircleDot className="w-[0.9vw] h-[0.9vw] text-emerald-600 animate-pulse" />
                                <span>Open</span>
                              </div>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-[0.75vw] px-[0.85vw] whitespace-nowrap text-center align-middle">
                            <div className="inline-flex items-center justify-center gap-[0.45vw]">
                              {!hasAdminReplied && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTicketToDelete(ticket);
                                  }}
                                  className="text-stone-700 hover:text-red-700 p-[0.35vw] rounded-[0.4vw] hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Withdraw / Cancel ticket"
                                >
                                  <Trash2 className="w-[0.85vw] h-[0.85vw]" />
                                </button>
                              )}
                              <span className="text-stone-600 group-hover:text-[#ec5137] group-hover:translate-x-0.5 transition-all">
                                <ChevronRight className="w-[0.95vw] h-[0.95vw]" />
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Count and Pagination */}
              <div className="py-[0.75vw] px-[1.2vw] bg-stone-100/70 border-t border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw] text-[0.78vw] text-stone-800 font-medium">
                <span>
                  Showing <strong className="font-semibold text-stone-950">
                    {filteredTickets.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
                    -
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)}
                  </strong> of <strong className="font-semibold text-stone-950">{filteredTickets.length}</strong> tickets
                </span>
                <div className="flex items-center gap-[0.35vw]">
                  <button 
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-[0.35vw] rounded-[0.45vw] border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:text-stone-300 disabled:bg-stone-100 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-[0.9vw] h-[0.9vw]" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-[0.65vw] py-[0.2vw] rounded-[0.45vw] font-semibold text-[0.75vw] transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#ec5137] text-white shadow-2xs'
                          : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-[0.35vw] rounded-[0.45vw] border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:text-stone-300 disabled:bg-stone-100 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="w-[0.9vw] h-[0.9vw]" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Filter State */
            <div className="bg-white rounded-[0.8vw] border border-stone-200 p-[3.5vw] text-center shadow-xs flex flex-col items-center justify-center">
              <div className="w-[3.5vw] h-[3.5vw] rounded-full bg-orange-50 text-[#ec5137] flex items-center justify-center mb-[0.9vw]">
                <Search className="w-[1.8vw] h-[1.8vw]" />
              </div>
              <h3 className="text-[1.05vw] font-bold text-stone-900 mb-[0.35vw]">No tickets found</h3>
              <p className="text-[0.78vw] text-stone-500 max-w-[22vw] mb-[1.2vw] font-normal leading-relaxed">
                {hasActiveFilters 
                  ? 'No tickets match the selected status, module, or search filters. Try clearing filters to see all tickets.'
                  : 'You have not submitted any support tickets yet. Click "Raise Ticket" whenever you need assistance.'}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-[1vw] py-[0.45vw] rounded-[0.55vw] bg-stone-100 hover:bg-stone-200 text-stone-800 text-[0.78vw] font-semibold transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  onClick={() => setIsRaiseModalOpen(true)}
                  className="px-[1vw] py-[0.5vw] rounded-[0.55vw] bg-[#ec5137] hover:bg-[#d9442b] text-white text-[0.8vw] font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-[0.35vw]"
                >
                  <Plus className="w-[0.85vw] h-[0.85vw]" />
                  <span>Raise Your First Ticket</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete / Cancel Ticket Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-[1vw] bg-stone-900/60 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div className="bg-white rounded-[1vw] shadow-2xl w-full max-w-[28vw] p-[1.5vw] border border-stone-200 flex flex-col">
            <div className="flex items-center gap-[0.7vw] mb-[0.8vw]">
              <div className="w-[2.4vw] h-[2.4vw] rounded-[0.6vw] bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-[1.2vw] h-[1.2vw]" />
              </div>
              <div>
                <h3 className="text-[1vw] font-bold text-stone-900">
                  Cancel Ticket #{ticketToDelete.id}?
                </h3>
                <p className="text-[0.72vw] text-stone-500 font-normal">
                  This will remove your request before support team replies
                </p>
              </div>
            </div>

            <p className="text-[0.78vw] text-stone-600 mb-[1.2vw] leading-relaxed font-normal bg-stone-50 p-[0.7vw] rounded-[0.5vw] border border-stone-200">
              Are you sure you want to cancel & delete <strong className="text-stone-900 font-semibold">"{ticketToDelete.subject}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-[0.6vw]">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-[0.9vw] py-[0.45vw] text-[0.78vw] font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Keep Ticket
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-[1vw] py-[0.45vw] text-[0.78vw] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-[0.55vw] transition-colors shadow-xs cursor-pointer flex items-center gap-[0.35vw]"
              >
                <Trash2 className="w-[0.8vw] h-[0.8vw]" />
                <span>Yes, Cancel Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raise Ticket Modal */}
      <RaiseTicketModal 
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        onSubmit={handleRaiseTicket}
        defaultModuleId={categoryFilter === 'all' ? 'my-flipbooks' : categoryFilter}
        currentUser={currentUser}
      />
    </div>
  );
}
