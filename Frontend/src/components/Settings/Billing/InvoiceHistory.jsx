import React from 'react';
import { Icon } from '@iconify/react';

const InvoiceHistory = ({ onDownload, onViewAll }) => {
  const invoices = [
    { id: 'INV-2026-004', date: '14 Oct 2026', plan: 'Pro plan (Yearly)', amount: '₹ 4,999' },
    { id: 'INV-2025-003', date: '14 Oct 2025', plan: 'Pro plan (Yearly)', amount: '₹ 4,999' },
    { id: 'INV-2024-002', date: '14 Oct 2024', plan: 'Pro plan (Yearly)', amount: '₹ 4,999' },
    { id: 'INV-2023-001', date: '14 Oct 2023', plan: 'Pro plan (Yearly)', amount: '₹ 3,999' },
  ];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-[1vw] p-[1.5vw] shadow-sm mb-[1.5vw]">
      {/* Header: Icon + Title, Subtitle, Filter Dropdown, and View All link */}
      <div className="flex items-start justify-between gap-[1vw] mb-[1.3vw]">
        <div>
          <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
            <Icon icon="solar:document-bold" className="w-[1.1vw] h-[1.1vw] text-[#4b5563]" />
            <h2 className="text-[0.98vw] font-medium text-gray-800">Invoice History</h2>
          </div>
          <p className="text-[0.72vw] text-gray-500 pl-[1.65vw] font-normal">
            View and download your past invoices
          </p>
        </div>

        {/* Right Controls: Filter Dropdown & View All */}
        <div className="flex items-center gap-[0.9vw]">
          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-between gap-[0.6vw] bg-white border border-gray-200 hover:border-gray-300 px-[0.85vw] py-[0.4vw] rounded-[0.5vw] text-[0.78vw] font-medium text-gray-700 transition-colors shadow-xs cursor-pointer"
            >
              <span>All Invoices</span>
              <Icon icon="lucide:chevron-down" className="w-[0.85vw] h-[0.85vw] text-gray-500" strokeWidth="2" />
            </button>
          </div>

          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-[0.35vw] text-[#EC5137] hover:text-[#d63f2b] text-[0.78vw] font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>View All</span>
            <Icon icon="lucide:arrow-right" className="w-[0.85vw] h-[0.85vw]" strokeWidth="2.2" />
          </button>
        </div>
      </div>

      {/* Invoices Table Container */}
      <div className="w-full border border-gray-200 rounded-[0.75vw] overflow-hidden">
        {/* Table Header Row */}
        <div className="w-full grid grid-cols-12 bg-[#f8f9fa] border-b border-gray-200 px-[1.2vw] py-[0.75vw] text-[0.76vw] font-medium text-gray-700 items-center">
          <div className="col-span-3">Invoice</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Plan</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-right pr-[0.6vw]">Action</div>
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-gray-100 text-[0.75vw]">
          {invoices.map((invoice, index) => (
            <div
              key={index}
              className="w-full grid grid-cols-12 items-center px-[1.2vw] py-[0.95vw] hover:bg-gray-50/50 transition-colors"
            >
              {/* Column 1: Invoice ID */}
              <div className="col-span-3 font-medium text-gray-800">{invoice.id}</div>

              {/* Column 2: Date */}
              <div className="col-span-2 text-gray-500 font-normal">{invoice.date}</div>

              {/* Column 3: Plan */}
              <div className="col-span-2 text-gray-500 font-normal">{invoice.plan}</div>

              {/* Column 4: Amount */}
              <div className="col-span-2 font-medium text-gray-800">{invoice.amount}</div>

              {/* Column 5: Status Pill */}
              <div className="col-span-1 flex justify-center">
                <span className="bg-[#DCFCE7] text-[#16A34A] text-[0.68vw] font-medium px-[0.75vw] py-[0.18vw] rounded-full inline-block">
                  Paid
                </span>
              </div>

              {/* Column 6: Action / Download Button */}
              <div className="col-span-2 flex justify-end items-center gap-[0.45vw]">
                {/* PDF Icon */}
                <div className="w-[1.2vw] h-[1.2vw] flex items-center justify-center shrink-0">
                  <Icon icon="teenyicons:pdf-solid" className="w-[1.05vw] h-[1.05vw] text-[#EF4444]" />
                </div>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={() => onDownload?.(invoice)}
                  className="flex items-center gap-[0.3vw] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[0.74vw] font-medium px-[0.75vw] py-[0.38vw] rounded-[0.45vw] shadow-xs transition-colors cursor-pointer"
                >
                  <span>Download</span>
                  <Icon icon="lucide:download" className="w-[0.8vw] h-[0.8vw]" strokeWidth="2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View More Expander at the bottom */}
      <div className="w-full flex items-center justify-center pt-[1vw]">
        <button
          type="button"
          className="flex items-center gap-[0.3vw] text-gray-600 hover:text-gray-900 text-[0.78vw] font-medium transition-colors cursor-pointer"
        >
          <span>View More</span>
          <Icon icon="lucide:chevron-down" className="w-[0.9vw] h-[0.9vw]" strokeWidth="2" />
        </button>
      </div>
    </div>
  );
};

export default InvoiceHistory;

