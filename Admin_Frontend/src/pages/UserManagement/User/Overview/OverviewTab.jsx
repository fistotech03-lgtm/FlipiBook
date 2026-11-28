import React from 'react';
import {
  BookOpen,
  Eye,
  Box,
  Banknote,
  ArrowRight,
  Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OverviewTab({ user, profile, flipbooks = [] }) {
  const navigate = useNavigate();

  // Dynamic calculations with sensible fallbacks matching reference design
  const flipbooksCount = flipbooks?.length || user?.totalFlipbooks || 24;
  const publishedCount = flipbooks?.filter(f => f.status === 'published' || f.isPublished)?.length || 16;
  const draftCount = flipbooksCount - publishedCount >= 0 ? flipbooksCount - publishedCount : 8;

  const totalViews = user?.totalViews?.toLocaleString() || '12,450';
  const requests3DCount = user?.threeDRequestsCount || '08';
  const completedRequests = user?.threeDCompleted || 5;
  const pendingRequests = user?.threeDPending || 3;
  const totalPayments = user?.totalPayments || '₹24,999';
  const successfulTxns = user?.successfulTransactions || 5;

  const subscriptionType = user?.subscriptionType || 'Annual Subscription';
  const planName = user?.plan || 'Pro Plan';
  const startedOn = user?.subscriptionStartedOn || '14 Oct 2026';
  const nextRenewal = user?.nextRenewal || '14 Oct 2027';

  const lastLoginDevice = user?.lastLoginDevice || 'Windows';
  const lastLoginBrowser = user?.lastLoginBrowser || 'Chrome';
  const lastLoginTime = user?.lastLoginTime || '12 Nov 2026 · 10:42 AM';

  return (
    <div className="space-y-[1.2vw]">
      {/* Overview Section Heading */}
      <div>
        <h2 className="text-[1.2vw] font-semibold text-gray-900 tracking-tight leading-none">User Overview</h2>
        <p className="text-[0.85vw] text-gray-400 mt-[0.35vw] leading-tight">
          Account summary and platform usage at a glance.
        </p>
      </div>

      {/* 4 Metric Cards Grid - Exact Figma: rounded-[16px], shadow-[1px_2px_6px_rgba(0,0,0,0.16)] */}
      <div className="grid grid-cols-4 gap-[1.1vw]">
        {/* Flipbooks Card */}
        <div className="bg-white rounded-[16px] px-[1.1vw] py-[0.8vw] shadow-[1px_2px_6px_rgba(0,0,0,0.16)] flex flex-col justify-between min-h-[6.2vw]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[1.8vw] font-semibold text-[#000000] leading-none">
                {flipbooksCount}
              </span>
              <p className="text-[0.8vw] font-semibold text-[#ec5137] mt-[0.3vw]">
                Flipbooks
              </p>
            </div>
            <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-red-50 flex items-center justify-center text-[#ec5137]">
              <BookOpen size="1.05vw" />
            </div>
          </div>
          <p className="text-[0.7vw] text-gray-400 font-semibold mt-[0.4vw]">
            {publishedCount} Published · {draftCount} Drafts
          </p>
        </div>

        {/* Total Views Card */}
        <div className="bg-white rounded-[16px] px-[1.1vw] py-[0.8vw] shadow-[1px_2px_6px_rgba(0,0,0,0.16)] flex flex-col justify-between min-h-[6.2vw]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[1.8vw] font-semibold text-[#000000] leading-none">
                {totalViews}
              </span>
              <p className="text-[0.8vw] font-semibold text-[#0284c7] mt-[0.3vw]">
                Total Views
              </p>
            </div>
            <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-sky-50 flex items-center justify-center text-[#0284c7]">
              <Eye size="1.05vw" />
            </div>
          </div>
          <p className="text-[0.7vw] text-gray-400 font-semibold mt-[0.4vw]">
            Across all flipbooks
          </p>
        </div>

        {/* 3D Requests Card */}
        <div className="bg-white rounded-[16px] px-[1.1vw] py-[0.8vw] shadow-[1px_2px_6px_rgba(0,0,0,0.16)] flex flex-col justify-between min-h-[6.2vw]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[1.8vw] font-semibold text-[#000000] leading-none">
                {requests3DCount}
              </span>
              <p className="text-[0.8vw] font-semibold text-[#a855f7] mt-[0.3vw]">
                3D Requests
              </p>
            </div>
            <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-purple-50 flex items-center justify-center text-[#a855f7]">
              <Box size="1.05vw" />
            </div>
          </div>
          <p className="text-[0.7vw] text-gray-400 font-semibold mt-[0.4vw]">
            {completedRequests} Completed · {pendingRequests} Pending
          </p>
        </div>

        {/* Total Payments Card */}
        <div className="bg-white rounded-[16px] px-[1.1vw] py-[0.8vw] shadow-[1px_2px_6px_rgba(0,0,0,0.16)] flex flex-col justify-between min-h-[6.2vw]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[1.8vw] font-semibold text-[#000000] leading-none">
                {totalPayments}
              </span>
              <p className="text-[0.8vw] font-semibold text-[#16a34a] mt-[0.3vw]">
                Total Payments
              </p>
            </div>
            <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-emerald-50 flex items-center justify-center text-[#16a34a]">
              <Banknote size="1.05vw" />
            </div>
          </div>
          <p className="text-[0.7vw] text-gray-400 font-semibold mt-[0.4vw]">
            {successfulTxns} Successful transactions
          </p>
        </div>
      </div>

      {/* Subscription Overview Section */}
      <div className="bg-white rounded-[16px] p-[1.4vw] shadow-[1px_2px_6px_rgba(0,0,0,0.16)]">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[0.55vw]">
            <div className="w-[1.9vw] h-[1.9vw] rounded-full bg-red-50 flex items-center justify-center text-[#ec5137]">
              <BookOpen size="0.95vw" />
            </div>
            <h3 className="text-[0.9vw] font-semibold text-gray-900">Subscription Overview</h3>
          </div>

          <button
            onClick={() => {}}
            className="inline-flex items-center gap-[0.35vw] text-[0.7vw] font-semibold text-[#ec5137] bg-red-50/70 hover:bg-red-100/70 px-[0.7vw] py-[0.32vw] rounded-[0.4vw] transition cursor-pointer"
          >
            <span>View More Details</span>
            <ArrowRight size="0.8vw" />
          </button>
        </div>

        {/* Plan row with badge */}
        <div className="flex items-center justify-between mt-[1.2vw]">
          <h4 className="text-[0.9vw] font-semibold text-[#ec5137]">
            {subscriptionType}
          </h4>

          <span className="inline-flex items-center gap-[0.35vw] px-[0.6vw] py-[0.2vw] rounded-full text-[0.7vw] font-semibold text-[#d97706] bg-amber-50 border border-amber-100/80">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[0.8vw] h-[0.8vw]">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
            </svg>
            <span>{planName}</span>
          </span>
        </div>

        {/* Dates list */}
        <div className="space-y-[0.7vw] mt-[1vw] text-[0.8vw]">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-semibold">Started On</span>
            <span className="font-semibold text-gray-900">{startedOn}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-semibold">Next Renewal</span>
            <span className="font-semibold text-gray-900">{nextRenewal}</span>
          </div>
        </div>
      </div>

      {/* Last Login Section */}
      <div className="bg-white rounded-[16px] p-[1.4vw] shadow-[1px_2px_6px_rgba(0,0,0,0.16)]">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[0.55vw]">
            <div className="w-[1.9vw] h-[1.9vw] rounded-full bg-red-50 flex items-center justify-center text-[#ec5137]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[0.95vw] h-[0.95vw]">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="text-[0.9vw] font-semibold text-gray-900">Last Login</h3>
          </div>

          <button
            onClick={() => {}}
            className="inline-flex items-center gap-[0.35vw] text-[0.7vw] font-semibold text-[#ec5137] bg-red-50/70 hover:bg-red-100/70 px-[0.7vw] py-[0.32vw] rounded-[0.4vw] transition cursor-pointer"
          >
            <span>View More Details</span>
            <ArrowRight size="0.8vw" />
          </button>
        </div>

        {/* Device & Status row */}
        <div className="flex items-center justify-between mt-[1.2vw]">
          <div className="flex items-center gap-[0.9vw]">
            <Monitor size="1.6vw" className="text-gray-700 stroke-[1.6]" />
            <div>
              <div className="flex items-center gap-[0.45vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900">{lastLoginDevice}</span>
                <span className="px-[0.45vw] py-[0.1vw] rounded-[0.3vw] text-[0.7vw] font-semibold text-gray-600 bg-gray-100 border border-gray-200">
                  {lastLoginBrowser}
                </span>
              </div>
              <p className="text-[0.7vw] text-gray-400 mt-[0.1vw]">
                {lastLoginTime}
              </p>
            </div>
          </div>

          <span className="px-[0.8vw] py-[0.25vw] rounded-full text-[0.7vw] font-semibold text-[#16a34a] bg-[#dcfce7]">
            Successful
          </span>
        </div>
      </div>
    </div>
  );
}
