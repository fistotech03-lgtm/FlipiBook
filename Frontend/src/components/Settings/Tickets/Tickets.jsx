import React from 'react';
import { 
  Plus, 
  Search, 
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
    <div className="w-full flex flex-col p-[1.5vw] font-sans relative select-none">
      {/* Top Header: Title, Subtitle & Action Button */}
      <div className="flex items-start justify-between gap-[2vw] mb-[1.8vw]">
        <div>
          <div className="flex items-center gap-[0.55vw]">
            <h1 className="text-[1.35vw] font-semibold text-gray-800 tracking-tight leading-tight">
              Support Tickets
            </h1>
            {isAdminUser && (
              <span className="px-[0.55vw] py-[0.15vw] rounded-full text-[0.66vw] font-medium bg-purple-100 text-purple-700 border border-purple-200">
                Staff Admin View
              </span>
            )}
          </div>
          <p className="text-[0.74vw] text-gray-500 mt-[0.25vw] font-normal">
            Track and manage your support inquiries with Flipibook engineering
          </p>
        </div>

        {/* Raise Ticket Button */}
        <button
          type="button"
          onClick={() => setIsRaiseModalOpen(true)}
          className="flex items-center gap-[0.35vw] bg-[#EC5137] hover:bg-[#d94229] active:scale-[0.98] text-white text-[0.78vw] font-medium px-[1.05vw] py-[0.48vw] rounded-[0.5vw] shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-[0.85vw] h-[0.85vw]" />
          <span>Raise Ticket</span>
        </button>
      </div>

      {/* Filter Card */}
      <div className="w-full bg-white border border-gray-200 rounded-[1vw] p-[1.2vw] shadow-sm mb-[1.5vw]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-[0.75vw]">
          
          {/* Status Segmented Tabs */}
          <div className="flex items-center p-[0.25vw] bg-gray-100 rounded-[0.55vw] border border-gray-200 self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`flex items-center gap-[0.45vw] px-[0.8vw] py-[0.38vw] rounded-[0.45vw] text-[0.76vw] font-medium transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#222428] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>All Tickets</span>
              <span className={`px-[0.45vw] py-[0.1vw] rounded-full text-[0.65vw] font-medium ${
                statusFilter === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {counts.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('open')}
              className={`flex items-center gap-[0.45vw] px-[0.8vw] py-[0.38vw] rounded-[0.45vw] text-[0.76vw] font-medium transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'open'
                  ? 'bg-[#222428] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CircleDot className={`w-[0.75vw] h-[0.75vw] ${statusFilter === 'open' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Open</span>
              <span className={`px-[0.45vw] py-[0.1vw] rounded-full text-[0.65vw] font-medium ${
                statusFilter === 'open'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#DCFCE7] text-[#16A34A]'
              }`}>
                {counts.open}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('closed')}
              className={`flex items-center gap-[0.45vw] px-[0.8vw] py-[0.38vw] rounded-[0.45vw] text-[0.76vw] font-medium transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'closed'
                  ? 'bg-[#222428] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle2 className={`w-[0.75vw] h-[0.75vw] ${statusFilter === 'closed' ? 'text-white' : 'text-gray-500'}`} />
              <span>Closed</span>
              <span className={`px-[0.45vw] py-[0.1vw] rounded-full text-[0.65vw] font-medium ${
                statusFilter === 'closed'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-700'
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
              buttonClassName="h-[2.2vw] py-[0.35vw] text-[0.76vw] rounded-[0.5vw] border-gray-200 text-gray-700 font-medium"
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
              buttonClassName="h-[2.2vw] py-[0.35vw] text-[0.76vw] rounded-[0.5vw] border-gray-200 text-gray-700 font-medium"
            />

            {/* Custom Date Input */}
            {dateFilter === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="h-[2.2vw] px-[0.75vw] text-[0.76vw] font-medium rounded-[0.5vw] border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] shadow-xs cursor-pointer"
              />
            )}

            {/* Live Search Input */}
            <div className="relative flex-1 sm:w-[13vw]">
              <Search className="w-[0.85vw] h-[0.85vw] text-gray-400 absolute left-[0.75vw] top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, ID..."
                className="w-full h-[2.2vw] pl-[2vw] pr-[1.8vw] text-[0.76vw] rounded-[0.5vw] border border-gray-200 bg-white focus:outline-none focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] text-gray-800 placeholder:text-gray-400 font-normal shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-[0.6vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-[0.2vw] rounded-full cursor-pointer"
                >
                  <X className="w-[0.75vw] h-[0.75vw]" />
                </button>
              )}
            </div>

            {/* Clear active filters button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-[2.2vw] px-[0.75vw] rounded-[0.5vw] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-[0.74vw] font-medium flex items-center gap-[0.35vw] transition-colors cursor-pointer shrink-0 shadow-xs active:scale-[0.98]"
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
          <div className="w-full bg-white rounded-[1vw] border border-gray-200 p-[3vw] text-center shadow-sm flex flex-col items-center justify-center min-h-[16vw]">
            <Loader2 className="w-[1.8vw] h-[1.8vw] animate-spin text-[#EC5137] mb-[0.6vw]" />
            <p className="text-[0.85vw] font-medium text-gray-800">Loading support tickets...</p>
            <p className="text-[0.72vw] text-gray-400 mt-[0.2vw]">Retrieving latest tickets from server</p>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="w-full bg-white rounded-[1vw] border border-gray-200 shadow-sm overflow-hidden mb-[1.5vw]">
            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed text-left border-collapse">
                <colgroup>
                  <col className="w-[4%]" />
                  <col className="w-[11%]" />
                  <col className="w-[24%]" />
                  <col className="w-[11%]" />
                  <col className="w-[10%]" />
                  <col className="w-[13%]" />
                  <col className="w-[7.5%]" />
                  <col className="w-[8.5%]" />
                  <col className="w-[6%]" />
                  <col className="w-[5%]" />
                </colgroup>
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-gray-200 text-[0.76vw] font-medium text-gray-700 select-none">
                    <th className="py-[0.75vw] px-[0.6vw] text-center whitespace-nowrap">S.No</th>
                    <th className="py-[0.75vw] px-[0.6vw] whitespace-nowrap">Ticket ID</th>
                    <th className="py-[0.75vw] px-[0.6vw] whitespace-nowrap">Subject</th>
                    <th className="py-[0.75vw] px-[0.6vw] whitespace-nowrap">Category</th>
                    <th className="py-[0.75vw] px-[0.6vw] whitespace-nowrap">Date Raised</th>
                    <th className="py-[0.75vw] px-[0.6vw] whitespace-nowrap">Last Activity</th>
                    <th className="py-[0.75vw] px-[0.4vw] whitespace-nowrap text-center">Messages</th>
                    <th className="py-[0.75vw] px-[0.4vw] whitespace-nowrap text-center">Attachments</th>
                    <th className="py-[0.75vw] px-[0.4vw] whitespace-nowrap text-center">Status</th>
                    <th className="py-[0.75vw] px-[0.4vw] whitespace-nowrap text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[0.75vw]">
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

                    return (
                      <tr 
                        key={ticket.id}
                        onClick={() => handleSelectTicket(ticket)}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      >
                        {/* S.No */}
                        <td className="py-[0.9vw] px-[0.6vw] text-center whitespace-nowrap align-middle text-[0.76vw] font-medium text-gray-700">
                          {serialNumber}
                        </td>

                        {/* Ticket ID */}
                        <td className="py-[0.9vw] px-[0.6vw] whitespace-nowrap align-middle">
                          <span className="font-mono text-[0.78vw] font-medium text-gray-800 group-hover:text-[#EC5137] transition-colors">
                            #{ticket.id}
                          </span>
                        </td>

                        {/* Subject & Description */}
                        <td className="py-[0.9vw] px-[0.6vw] align-middle overflow-hidden">
                          <div className="min-w-0 pr-[0.4vw]">
                            <p className="text-[0.82vw] font-medium text-gray-800 group-hover:text-[#EC5137] transition-colors truncate">
                              {ticket.subject}
                            </p>
                            {ticket.description && (
                              <p className="text-[0.72vw] text-gray-500 truncate mt-[0.1vw] font-normal">
                                {ticket.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-[0.9vw] px-[0.6vw] align-middle text-[0.76vw] text-gray-700 font-medium overflow-hidden">
                          <span className="truncate block" title={categoryName}>
                            {categoryName}
                          </span>
                        </td>

                        {/* Date Ticket Raised */}
                        <td className="py-[0.9vw] px-[0.6vw] whitespace-nowrap align-middle text-[0.76vw] text-gray-500 font-normal">
                          {dateRaised}
                        </td>

                        {/* Last Activity */}
                        <td className="py-[0.9vw] px-[0.6vw] whitespace-nowrap align-middle">
                          <div className="flex flex-col text-[0.76vw] text-gray-700 leading-tight">
                            <span className="font-medium text-gray-800">{lastActivity}</span>
                            <span className="text-[0.68vw] text-gray-400 font-normal mt-[0.1vw]">
                              {hasAdminReplied ? 'Staff reply' : (isAdminUser ? requesterName : 'by you')}
                            </span>
                          </div>
                        </td>

                        {/* Messages */}
                        <td className="py-[0.9vw] px-[0.4vw] whitespace-nowrap text-center align-middle">
                          <span className="inline-flex items-center justify-center gap-[0.25vw] text-[0.74vw] font-medium text-gray-600">
                            <MessageSquare className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                            <span>{messageCount}</span>
                          </span>
                        </td>

                        {/* Attachments */}
                        <td className="py-[0.9vw] px-[0.4vw] whitespace-nowrap text-center align-middle">
                          <span className="inline-flex items-center justify-center gap-[0.25vw] text-[0.74vw] font-medium text-gray-600">
                            <Paperclip className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                            <span>{attachmentCount}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-[0.9vw] px-[0.4vw] whitespace-nowrap text-center align-middle">
                          {isClosed ? (
                            <span className="bg-gray-100 text-gray-600 text-[0.68vw] font-medium px-[0.65vw] py-[0.18vw] rounded-full inline-block">
                              Closed
                            </span>
                          ) : (
                            <span className="bg-[#DCFCE7] text-[#16A34A] text-[0.68vw] font-medium px-[0.65vw] py-[0.18vw] rounded-full inline-block">
                              Open
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-[0.9vw] px-[0.4vw] whitespace-nowrap text-center align-middle">
                          <div className="inline-flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTicketToDelete(ticket);
                              }}
                              className="text-gray-400 hover:text-red-600 p-[0.35vw] rounded-[0.4vw] hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete ticket"
                            >
                              <Trash2 className="w-[0.85vw] h-[0.85vw]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Count and Pagination */}
            <div className="py-[0.75vw] px-[1.2vw] bg-[#f8f9fa] border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw] text-[0.76vw] text-gray-700 font-medium">
              <span>
                Showing <strong className="font-semibold text-gray-900">
                  {filteredTickets.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
                  -
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)}
                </strong> of <strong className="font-semibold text-gray-900">{filteredTickets.length}</strong> tickets
              </span>
              <div className="flex items-center gap-[0.3vw]">
                <button 
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-[0.35vw] rounded-[0.45vw] border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-[0.85vw] h-[0.85vw]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-[0.65vw] py-[0.2vw] rounded-[0.45vw] font-medium text-[0.74vw] transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#EC5137] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button 
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-[0.35vw] rounded-[0.45vw] border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="w-[0.85vw] h-[0.85vw]" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Filter State */
          <div className="w-full bg-white rounded-[1vw] border border-gray-200 p-[3.5vw] text-center shadow-sm flex flex-col items-center justify-center">
            <div className="w-[3.2vw] h-[3.2vw] rounded-full bg-orange-50 text-[#EC5137] flex items-center justify-center mb-[0.9vw]">
              <Search className="w-[1.6vw] h-[1.6vw]" />
            </div>
            <h3 className="text-[1vw] font-semibold text-gray-800 mb-[0.3vw]">No tickets found</h3>
            <p className="text-[0.74vw] text-gray-500 max-w-[22vw] mb-[1.2vw] font-normal leading-relaxed">
              {hasActiveFilters 
                ? 'No tickets match the selected status, module, or search filters. Try clearing filters to see all tickets.'
                : 'You have not submitted any support tickets yet. Click "Raise Ticket" whenever you need assistance.'}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="px-[1vw] py-[0.45vw] rounded-[0.5vw] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[0.76vw] font-medium transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRaiseModalOpen(true)}
                className="px-[1.1vw] py-[0.48vw] rounded-[0.5vw] bg-[#EC5137] hover:bg-[#d94229] active:scale-[0.98] text-white text-[0.78vw] font-medium transition-all shadow-xs cursor-pointer flex items-center gap-[0.35vw]"
              >
                <Plus className="w-[0.85vw] h-[0.85vw]" />
                <span>Raise Your First Ticket</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete / Cancel Ticket Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-[1vw] bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div className="bg-white rounded-[1vw] shadow-xl w-full max-w-[28vw] p-[1.5vw] border border-gray-200 flex flex-col">
            <div className="flex items-center gap-[0.7vw] mb-[0.8vw]">
              <div className="w-[2.4vw] h-[2.4vw] rounded-[0.6vw] bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-[1.2vw] h-[1.2vw]" />
              </div>
              <div>
                <h3 className="text-[1vw] font-semibold text-gray-800">
                  Cancel Ticket #{ticketToDelete.id}?
                </h3>
                <p className="text-[0.72vw] text-gray-500 font-normal">
                  This will remove your request before support team replies
                </p>
              </div>
            </div>

            <p className="text-[0.76vw] text-gray-600 mb-[1.2vw] leading-relaxed font-normal bg-[#f8f9fa] p-[0.75vw] rounded-[0.5vw] border border-gray-200">
              Are you sure you want to cancel & delete <strong className="text-gray-900 font-medium">"{ticketToDelete.subject}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-[0.6vw]">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-[0.9vw] py-[0.45vw] text-[0.76vw] font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Keep Ticket
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-[1vw] py-[0.48vw] text-[0.76vw] font-medium text-white bg-red-600 hover:bg-red-700 rounded-[0.5vw] transition-colors shadow-xs cursor-pointer flex items-center gap-[0.35vw] active:scale-[0.98]"
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
