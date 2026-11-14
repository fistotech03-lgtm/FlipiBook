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
  Loader2,
  Ticket as TicketIcon,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Icon } from '@iconify/react';
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

  // 4 Top Summary Cards (matching screenshot)
  const statCards = [
    {
      id: 'total',
      count: counts.total,
      label: 'Total Tickets Raised',
      barColor: 'bg-[#FF5733]',
      icon: 'lucide:ticket',
      iconColor: 'text-[#FF5733]',
      iconBg: 'bg-red-50/80'
    },
    {
      id: 'open',
      count: counts.open,
      label: 'Open Tickets',
      barColor: 'bg-amber-400',
      icon: 'lucide:clock',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50/80'
    },
    {
      id: 'waiting',
      count: counts.waiting || 0,
      label: 'Waiting for you',
      barColor: 'bg-blue-600',
      icon: 'lucide:message-square',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50/80'
    },
    {
      id: 'resolved',
      count: counts.resolved || counts.closed || 0,
      label: 'Resolved',
      barColor: 'bg-emerald-600',
      icon: 'lucide:check-circle',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50/80'
    }
  ];

  // Tab definitions matching screenshot: All Tickets, Open, Waiting for you, Resolved
  const tabs = [
    { id: 'all', label: `All Tickets (${counts.total})` },
    { id: 'open', label: `Open (${counts.open})` },
    { id: 'waiting', label: `Waiting for you (${counts.waiting || 0})` },
    { id: 'resolved', label: `Resolved (${counts.resolved || counts.closed || 0})` }
  ];

  // Helper for category badge styling matching screenshot
  const getCategoryBadgeStyle = (categoryName = '') => {
    const c = categoryName.toLowerCase();
    if (c.includes('technical')) return 'bg-orange-50 text-orange-600 border-orange-100';
    if (c.includes('billing') || c.includes('payment')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (c.includes('upload')) return 'bg-red-50 text-red-500 border-red-100';
    if (c.includes('3d')) return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="w-full flex-1 bg-white min-h-full p-[1.5vw] overflow-y-auto select-none font-sans">
      {/* Top Header: Title, Subtitle & Orange "Raise a Ticket" Button */}
      <div className="flex items-start justify-between gap-[2vw] mb-[1.6vw]">
        <div>
          <div className="flex items-center gap-[0.55vw]">
            <h1 className="text-[1.35vw] font-bold text-gray-900 tracking-tight leading-none">
              Help & Support
            </h1>
            {isAdminUser && (
              <span className="px-[0.65vw] py-[0.15vw] rounded-full text-[0.68vw] font-medium bg-purple-100 text-purple-700 border border-purple-200">
                Staff Admin View
              </span>
            )}
          </div>
          <p className="text-[0.78vw] text-gray-500 mt-[0.35vw] font-normal">
            Facing an issue or have a question ? Raise a support ticket and we'll get back to you.
          </p>
        </div>

        {/* Raise a Ticket Button (Matching Billing action button style) */}
        <button
          type="button"
          onClick={() => setIsRaiseModalOpen(true)}
          className="h-[2.15vw] flex items-center gap-[0.35vw] bg-[#FF5733] hover:bg-[#E04D2D] active:scale-[0.98] text-white text-[0.78vw] font-semibold px-[0.95vw] rounded-[0.55vw] shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <Icon icon="lucide:headset" className="w-[0.85vw] h-[0.85vw]" />
          <span>Raise a Ticket</span>
        </button>
      </div>

      {/* 4 Summary Cards Row */}
      <div className="grid grid-cols-4 gap-[1.2vw] mb-[1.5vw]">
        {statCards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-[0.9vw] p-[1.3vw] border border-gray-100 shadow-xs flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-start gap-[0.9vw]">
              <div
                className={`w-[2.6vw] h-[2.6vw] rounded-full ${card.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon icon={card.icon} className={`w-[1.2vw] h-[1.2vw] ${card.iconColor}`} />
              </div>
              <div>
                <span className="text-[1.6vw] font-bold text-gray-900 leading-none block">
                  {card.count}
                </span>
                <span className="text-[0.74vw] font-medium text-gray-500 mt-[0.3vw] block whitespace-nowrap">
                  {card.label}
                </span>
              </div>
            </div>

            {/* Bottom colored progress indicator (dynamic based on count vs total) */}
            <div className="w-full bg-gray-100 h-[0.25vw] rounded-full mt-[1.1vw] overflow-hidden">
              <div 
                className={`h-full ${card.barColor} rounded-full transition-all duration-300`} 
                style={{
                  width: counts.total > 0 
                    ? `${card.id === 'total' ? 100 : Math.min(100, Math.round((card.count / counts.total) * 100))}%` 
                    : '0%'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Ticket List Container */}
      <div className="bg-white rounded-[0.9vw] border border-gray-100 shadow-xs overflow-hidden">
        {/* Controls Bar: Tabs + Search + Dropdown Filter */}
        <div className="px-[1.3vw] py-[1.1vw] flex items-center justify-between border-b border-gray-100 flex-wrap gap-[1vw]">
          {/* Status Tabs */}
          <div className="flex items-center gap-[1.4vw]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`text-[0.78vw] font-medium pb-[0.2vw] transition-all relative cursor-pointer ${
                  statusFilter === tab.id
                    ? 'text-[#FF5733] font-semibold border-b-2 border-[#FF5733]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-[0.8vw]">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Icon
                icon="lucide:search"
                className="w-[0.85vw] h-[0.85vw] text-gray-400 absolute left-[0.7vw] pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[2.15vw] pl-[2vw] pr-[0.8vw] bg-white border border-gray-200 rounded-[0.55vw] text-[0.78vw] font-normal text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#FF5733] shadow-xs w-[14vw] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-[0.6vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-[0.1vw] cursor-pointer"
                >
                  <X className="w-[0.75vw] h-[0.75vw]" />
                </button>
              )}
            </div>

            {/* Module Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-[2.15vw] appearance-none pl-[2vw] pr-[1.8vw] bg-white border border-gray-200 rounded-[0.55vw] text-[0.78vw] font-medium text-gray-700 focus:outline-none focus:border-[#FF5733] shadow-xs cursor-pointer"
              >
                <option value="all">Recent First</option>
                {TICKET_MODULES.filter(m => m.id !== 'all').map(mod => (
                  <option key={mod.id} value={mod.id}>{mod.name}</option>
                ))}
              </select>
              <Icon
                icon="iconoir:sort"
                className="w-[0.8vw] h-[0.8vw] text-gray-500 absolute left-[0.7vw] top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <Icon
                icon="lucide:chevron-down"
                className="w-[0.8vw] h-[0.8vw] text-gray-400 absolute right-[0.6vw] top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        {!hasLoadedOnce && isLoading ? (
          <div className="w-full p-[3vw] text-center flex flex-col items-center justify-center min-h-[16vw]">
            <Loader2 className="w-[1.8vw] h-[1.8vw] animate-spin text-[#FF5733] mb-[0.6vw]" />
            <p className="text-[0.85vw] font-medium text-gray-800">Loading support tickets...</p>
            <p className="text-[0.72vw] text-gray-400 mt-[0.2vw]">Retrieving latest tickets from server</p>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="p-[1.2vw]">
            {/* Inner Bordered Table Card matching Billing Invoice table */}
            <div className="rounded-[0.65vw] border border-gray-200 overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-gray-200 text-[0.74vw] font-semibold text-gray-700 select-none">
                    <th className="py-[0.7vw] px-[1.2vw] w-[16%]">Ticket No</th>
                    <th className="py-[0.7vw] px-[1.2vw] w-[20%]">Subject</th>
                    <th className="py-[0.7vw] px-[1.2vw] w-[18%]">Category</th>
                    <th className="py-[0.7vw] px-[1.2vw] w-[22%]">Last Updated</th>
                    <th className="py-[0.7vw] px-[1.2vw] w-[17%]">Status</th>
                    <th className="py-[0.7vw] pl-[1vw] pr-[1.5vw] text-right w-[7%]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTickets.map((ticket, index) => {
                    const isResolved = ticket.status === 'closed' || ticket.status === 'resolved';
                    const isWaiting = ticket.status === 'waiting' || (ticket.statusText && ticket.statusText.toLowerCase().includes('waiting'));
                    
                    const categoryName = ticket.department || ticket.moduleName || 'General';
                    const lastUpdated = formatDateTime(ticket.updatedAt || ticket.lastUpdated || ticket.createdAt || ticket.submittedAt);
                    const ticketIdStr = String(ticket.id).startsWith('#') ? ticket.id : `#FB-${ticket.id}`;

                    let statusLabel = 'In Progress';
                    let statusColor = 'text-orange-500';
                    let statusIcon = 'lucide:clock';

                    if (isResolved) {
                      statusLabel = 'Resolved';
                      statusColor = 'text-emerald-600';
                      statusIcon = 'lucide:check-circle';
                    } else if (isWaiting) {
                      statusLabel = 'Waiting for you';
                      statusColor = 'text-blue-600';
                      statusIcon = 'lucide:message-square';
                    }

                    return (
                      <tr
                        key={ticket.id || index}
                        onClick={() => handleSelectTicket(ticket)}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      >
                        {/* Ticket No with File Icon */}
                        <td className="py-[0.85vw] px-[1.2vw]">
                          <div className="flex items-center gap-[0.55vw]">
                            <div className="w-[1.6vw] h-[1.6vw] rounded-[0.4vw] bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                              <Icon icon="lucide:file-text" className="w-[0.85vw] h-[0.85vw]" />
                            </div>
                            <span className="text-[0.76vw] font-semibold text-gray-800">
                              {ticketIdStr}
                            </span>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="py-[0.85vw] px-[1.2vw] truncate">
                          <span className="text-[0.76vw] font-medium text-gray-800 group-hover:text-[#FF5733] transition-colors truncate block">
                            {ticket.subject}
                          </span>
                        </td>

                        {/* Category Pill */}
                        <td className="py-[0.85vw] px-[1.2vw]">
                          <span
                            className={`inline-block px-[0.65vw] py-[0.18vw] rounded-full text-[0.68vw] font-medium ${getCategoryBadgeStyle(categoryName)}`}
                          >
                            {categoryName}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td className="py-[0.85vw] px-[1.2vw]">
                          <span className="text-[0.74vw] text-gray-500 font-normal whitespace-nowrap">
                            {lastUpdated}
                          </span>
                        </td>

                        {/* Status Indicator */}
                        <td className="py-[0.85vw] px-[1.2vw]">
                          <div className="flex items-center gap-[0.4vw]">
                            <Icon
                              icon={statusIcon}
                              className={`w-[0.85vw] h-[0.85vw] ${statusColor}`}
                            />
                            <span className={`text-[0.74vw] font-medium ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                        </td>

                        {/* Action Chevron */}
                        <td className="py-[0.85vw] pl-[1vw] pr-[1.5vw] text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTicket(ticket);
                            }}
                            className="text-gray-400 group-hover:text-gray-700 transition-colors p-[0.2vw] cursor-pointer inline-flex items-center justify-center"
                          >
                            <Icon icon="lucide:chevron-right" className="w-[0.85vw] h-[0.85vw]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Row */}
            <div className="px-[1.4vw] pb-[1.4vw] pt-[0.4vw] flex items-center justify-center gap-[0.4vw]">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-[1.9vw] h-[1.9vw] rounded-[0.45vw] text-[0.74vw] font-medium flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-[#FF5733] text-white shadow-xs font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              {totalPages > 4 && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-[0.6vw] py-[0.25vw] text-[0.74vw] font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  See More
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Empty State (when no tickets exist) */
          <div className="w-full p-[3.5vw] text-center flex flex-col items-center justify-center">
            <div className="w-[3.2vw] h-[3.2vw] rounded-full bg-orange-50 text-[#FF5733] flex items-center justify-center mb-[0.9vw]">
              <Search className="w-[1.6vw] h-[1.6vw]" />
            </div>
            <h3 className="text-[1vw] font-semibold text-gray-800 mb-[0.3vw]">No tickets found</h3>
            <p className="text-[0.74vw] text-gray-500 max-w-[22vw] mb-[1.2vw] font-normal leading-relaxed">
              {hasActiveFilters 
                ? 'No tickets match the selected status, category, or search filters. Try clearing filters to see all tickets.'
                : 'You have not submitted any support tickets yet. Click "Raise a Ticket" whenever you need assistance.'}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="h-[2.15vw] px-[1vw] rounded-[0.55vw] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[0.78vw] font-medium transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRaiseModalOpen(true)}
                className="h-[2.15vw] px-[1.1vw] bg-[#FF5733] hover:bg-[#E04D2D] text-white text-[0.78vw] font-semibold rounded-[0.55vw] shadow-xs transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-[0.4vw]"
              >
                <Icon icon="lucide:headset" className="w-[0.85vw] h-[0.85vw]" />
                <span>Raise Your First Ticket</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete / Cancel Ticket Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-[1vw] bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div className="bg-white rounded-[0.9vw] shadow-xl w-full max-w-[28vw] p-[1.4vw] border border-gray-100 flex flex-col">
            <div className="flex items-center gap-[0.7vw] mb-[0.8vw]">
              <div className="w-[2.4vw] h-[2.4vw] rounded-[0.55vw] bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-[1.2vw] h-[1.2vw]" />
              </div>
              <div>
                <h3 className="text-[0.95vw] font-semibold text-gray-800">
                  Cancel Ticket #{ticketToDelete.id}?
                </h3>
                <p className="text-[0.72vw] text-gray-500 font-normal">
                  This will remove your request before support team replies
                </p>
              </div>
            </div>

            <p className="text-[0.74vw] text-gray-600 mb-[1.2vw] leading-relaxed font-normal bg-[#f8f9fa] p-[0.75vw] rounded-[0.55vw] border border-gray-200">
              Are you sure you want to cancel & delete <strong className="text-gray-900 font-medium">"{ticketToDelete.subject}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-[0.6vw]">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="h-[2.15vw] px-[0.95vw] rounded-[0.55vw] border border-gray-200 hover:bg-gray-50 text-[0.78vw] font-medium text-gray-700 transition-colors cursor-pointer shadow-xs"
              >
                Keep Ticket
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-[2.15vw] px-[1vw] text-[0.78vw] font-medium text-white bg-red-600 hover:bg-red-700 rounded-[0.55vw] transition-colors shadow-xs cursor-pointer flex items-center gap-[0.35vw] active:scale-[0.98]"
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
