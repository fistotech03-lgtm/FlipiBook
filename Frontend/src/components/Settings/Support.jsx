import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const mockTickets = [
  {
    id: '#FB-1024',
    subject: 'Flipbook not loading after upload',
    category: 'Technical Issue',
    categoryColor: 'bg-orange-50 text-orange-600 border-orange-100',
    lastUpdated: '16 Oct 2026, 10:32 AM',
    status: 'Resolved',
    statusColor: 'text-emerald-600',
    statusIcon: 'lucide:check-circle',
    iconBg: 'bg-red-50 text-red-500',
  },
  {
    id: '#FB-1024',
    subject: 'Payment deducted but plan not updated',
    category: 'Billing & Payment',
    categoryColor: 'bg-blue-50 text-blue-600 border-blue-100',
    lastUpdated: '16 Oct 2026, 10:32 AM',
    status: 'In Progress',
    statusColor: 'text-orange-500',
    statusIcon: 'lucide:clock',
    iconBg: 'bg-red-50 text-red-500',
  },
  {
    id: '#FB-1024',
    subject: 'Unable to upload PDF File',
    category: 'Upload Issue',
    categoryColor: 'bg-red-50 text-red-500 border-red-100',
    lastUpdated: '16 Oct 2026, 10:32 AM',
    status: 'Waiting for you',
    statusColor: 'text-blue-600',
    statusIcon: 'lucide:message-square',
    iconBg: 'bg-red-50 text-red-500',
  },
  {
    id: '#FB-1024',
    subject: '3D Model Viewer Issue',
    category: '3D Model',
    categoryColor: 'bg-purple-50 text-purple-600 border-purple-100',
    lastUpdated: '16 Oct 2026, 10:32 AM',
    status: 'Resolved',
    statusColor: 'text-emerald-600',
    statusIcon: 'lucide:check-circle',
    iconBg: 'bg-red-50 text-red-500',
  },
  {
    id: '#FB-1024',
    subject: '3D Model Viewer Issue',
    category: '3D Model',
    categoryColor: 'bg-purple-50 text-purple-600 border-purple-100',
    lastUpdated: '16 Oct 2026, 10:32 AM',
    status: 'Resolved',
    statusColor: 'text-emerald-600',
    statusIcon: 'lucide:check-circle',
    iconBg: 'bg-red-50 text-red-500',
  },
  {
    id: '#FB-1024',
    subject: '3D Model Viewer Issue',
    category: '3D Model',
    categoryColor: 'bg-purple-50 text-purple-600 border-purple-100',
    lastUpdated: '16 Oct 2026, 10:32 AM',
    status: 'Resolved',
    statusColor: 'text-emerald-600',
    statusIcon: 'lucide:check-circle',
    iconBg: 'bg-red-50 text-red-500',
  },
];

const Support = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRaiseTicketModal, setShowRaiseTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Technical Issue',
    description: '',
  });

  const stats = [
    {
      id: 'total',
      count: 13,
      label: 'Total Tickets Raised',
      barColor: 'bg-[#FF5733]',
      icon: 'lucide:ticket',
      iconColor: 'text-[#FF5733]',
      iconBg: 'bg-red-50/80',
    },
    {
      id: 'open',
      count: 3,
      label: 'Open Tickets',
      barColor: 'bg-amber-400',
      icon: 'lucide:clock',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50/80',
    },
    {
      id: 'waiting',
      count: 2,
      label: 'Waiting for you',
      barColor: 'bg-blue-600',
      icon: 'lucide:message-square',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50/80',
    },
    {
      id: 'resolved',
      count: 7,
      label: 'Resolved',
      barColor: 'bg-emerald-500',
      icon: 'lucide:check-circle',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50/80',
    },
  ];

  const tabs = [
    { id: 'all', label: 'All Tickets (12)' },
    { id: 'open', label: 'Open (3)' },
    { id: 'waiting', label: 'Waiting for you (2)' },
    { id: 'resolved', label: 'Resolved (7)' },
  ];

  const filteredTickets = mockTickets.filter((ticket) => {
    if (activeTab === 'open' && ticket.status !== 'In Progress') return false;
    if (activeTab === 'waiting' && ticket.status !== 'Waiting for you') return false;
    if (activeTab === 'resolved' && ticket.status !== 'Resolved') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ticket.subject.toLowerCase().includes(q) ||
        ticket.id.toLowerCase().includes(q) ||
        ticket.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 bg-[#F9F9F9] min-h-full px-[2vw] py-[1.8vw] overflow-y-auto">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-[1.6vw]">
        <div>
          <h1 className="text-[1.45vw] font-bold text-gray-900 tracking-tight leading-tight">
            Help & Support
          </h1>
          <p className="text-[0.75vw] text-gray-400 mt-[0.2vw]">
            Facing an issue or have a question? Raise a support ticket and we'll get back to you.
          </p>
        </div>

        <button
          onClick={() => setShowRaiseTicketModal(true)}
          className="flex items-center gap-[0.5vw] px-[1.2vw] py-[0.55vw] bg-[#FF5733] hover:bg-[#E04D2D] text-white text-[0.8vw] font-semibold rounded-[0.6vw] shadow-sm transition-all duration-150 active:scale-95"
        >
          <Icon icon="lucide:headset" className="w-[1vw] h-[1vw]" />
          <span>Raise a Ticket</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-4 gap-[1.2vw] mb-[1.8vw]">
        {stats.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-[0.8vw] p-[1.2vw] border border-gray-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-start gap-[1vw]">
              <div
                className={`w-[2.8vw] h-[2.8vw] rounded-full ${card.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon icon={card.icon} className={`w-[1.3vw] h-[1.3vw] ${card.iconColor}`} />
              </div>
              <div>
                <span className="text-[1.8vw] font-bold text-gray-900 leading-none block">
                  {card.count}
                </span>
                <span className="text-[0.78vw] font-medium text-gray-500 mt-[0.3vw] block whitespace-nowrap">
                  {card.label}
                </span>
              </div>
            </div>

            {/* Bottom colored progress bar indicator */}
            <div className="w-full bg-gray-100 h-[0.25vw] rounded-full mt-[1.2vw] overflow-hidden">
              <div className={`h-full ${card.barColor} rounded-full w-[35%]`} />
            </div>
          </div>
        ))}
      </div>

      {/* Ticket List Container */}
      <div className="bg-white rounded-[0.9vw] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Filter Controls Row */}
        <div className="px-[1.4vw] py-[1.1vw] flex items-center justify-between border-b border-gray-100 flex-wrap gap-[1vw]">
          {/* Tabs */}
          <div className="flex items-center gap-[1.4vw]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-[0.82vw] font-semibold pb-[0.2vw] transition-all relative ${
                  activeTab === tab.id
                    ? 'text-[#FF5733] border-b-2 border-[#FF5733]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-[0.8vw]">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Icon
                icon="lucide:search"
                className="w-[0.9vw] h-[0.9vw] text-gray-400 absolute left-[0.7vw] pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-[2vw] pr-[0.8vw] py-[0.4vw] bg-white border border-gray-200 rounded-[0.5vw] text-[0.75vw] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#FF5733] focus:ring-1 focus:ring-orange-200 w-[14vw] transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none pl-[2vw] pr-[1.8vw] py-[0.4vw] bg-white border border-gray-200 rounded-[0.5vw] text-[0.75vw] font-medium text-gray-700 focus:outline-none focus:border-[#FF5733] cursor-pointer"
              >
                <option value="recent">Recent First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <Icon
                icon="lucide:arrow-up-down"
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[0.75vw] font-bold text-gray-700">
                <th className="py-[0.8vw] px-[1.4vw] w-[15%]">Ticket No</th>
                <th className="py-[0.8vw] px-[1.2vw] w-[35%]">Subject</th>
                <th className="py-[0.8vw] px-[1.2vw] w-[18%]">Category</th>
                <th className="py-[0.8vw] px-[1.2vw] w-[16%]">Last Updated</th>
                <th className="py-[0.8vw] px-[1.2vw] w-[12%]">Status</th>
                <th className="py-[0.8vw] px-[1.2vw] text-right w-[4%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.map((ticket, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50/60 transition-colors cursor-pointer group"
                >
                  {/* Ticket No */}
                  <td className="py-[0.9vw] px-[1.4vw]">
                    <div className="flex items-center gap-[0.5vw]">
                      <div className="w-[1.6vw] h-[1.6vw] rounded-[0.35vw] bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                        <Icon icon="lucide:file-text" className="w-[0.85vw] h-[0.85vw]" />
                      </div>
                      <span className="text-[0.78vw] font-medium text-gray-700">
                        {ticket.id}
                      </span>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="py-[0.9vw] px-[1.2vw]">
                    <span className="text-[0.8vw] font-medium text-gray-900 group-hover:text-[#FF5733] transition-colors">
                      {ticket.subject}
                    </span>
                  </td>

                  {/* Category Pill */}
                  <td className="py-[0.9vw] px-[1.2vw]">
                    <span
                      className={`inline-block px-[0.7vw] py-[0.25vw] rounded-full text-[0.72vw] font-semibold border ${ticket.categoryColor}`}
                    >
                      {ticket.category}
                    </span>
                  </td>

                  {/* Last Updated */}
                  <td className="py-[0.9vw] px-[1.2vw]">
                    <span className="text-[0.75vw] text-gray-500 whitespace-nowrap">
                      {ticket.lastUpdated}
                    </span>
                  </td>

                  {/* Status Indicator */}
                  <td className="py-[0.9vw] px-[1.2vw]">
                    <div className="flex items-center gap-[0.4vw]">
                      <Icon
                        icon={ticket.statusIcon}
                        className={`w-[0.85vw] h-[0.85vw] ${ticket.statusColor}`}
                      />
                      <span className={`text-[0.76vw] font-semibold ${ticket.statusColor}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </td>

                  {/* Action Arrow */}
                  <td className="py-[0.9vw] px-[1.2vw] text-right">
                    <button className="text-gray-400 group-hover:text-gray-700 transition-colors p-[0.2vw]">
                      <Icon icon="lucide:chevron-right" className="w-[1vw] h-[1vw]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        <div className="px-[1.4vw] py-[1.1vw] flex items-center justify-center border-t border-gray-100 gap-[0.4vw]">
          {[1, 2, 3, 4].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-[1.8vw] h-[1.8vw] rounded-[0.4vw] text-[0.75vw] font-semibold flex items-center justify-center transition-all ${
                currentPage === page
                  ? 'bg-[#FF5733] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="px-[0.6vw] py-[0.25vw] text-[0.75vw] font-medium text-gray-500 hover:text-gray-800 transition-colors">
            See More
          </button>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {showRaiseTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[1vw] w-full max-w-lg shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF5733] flex items-center justify-center">
                  <Icon icon="lucide:headset" className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Raise Support Ticket</h3>
              </div>
              <button
                onClick={() => setShowRaiseTicketModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-[#FF5733]"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Billing & Payment">Billing & Payment</option>
                  <option value="Upload Issue">Upload Issue</option>
                  <option value="3D Model">3D Model</option>
                  <option value="General Query">General Query</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of your issue"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-[#FF5733]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide detailed information regarding the problem..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-[#FF5733]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowRaiseTicketModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newTicket.subject) {
                    alert('Please enter a ticket subject.');
                    return;
                  }
                  alert('Ticket submitted successfully!');
                  setShowRaiseTicketModal(false);
                  setNewTicket({ subject: '', category: 'Technical Issue', description: '' });
                }}
                className="px-5 py-2 bg-[#FF5733] hover:bg-[#E04D2D] text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
