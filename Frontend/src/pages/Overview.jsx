import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Eye,
  Clock,
  Plus,
  Sparkles,
  TrendingUp,
  ArrowRight,
  HardDrive,
  CheckCircle2,
  Layers,
  FileText,
  LifeBuoy,
  MessageSquare,
  LayoutTemplate,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchFlipbookBooks } from '../queryClient';
import { useUserStorage } from '../hooks/useUserStorage';
import dashboardBannerImg from '../assets/Dashboard/Main.png';

export default function Overview() {
  const { user } = useAuth();
  const emailId = user?.emailId || user?.email;

  const rawName = user?.name || user?.fullName || user?.firstName || (emailId ? emailId.split('@')[0] : 'Creator');
  const displayName = rawName ? (rawName.charAt(0).toUpperCase() + rawName.slice(1)) : 'Creator';

  // Fetch real user flipbooks
  const { data: books = [], isLoading: isLoadingBooks } = useQuery({
    queryKey: ['flipbookBooks', emailId],
    queryFn: () => fetchFlipbookBooks(emailId),
    enabled: Boolean(emailId),
    staleTime: 1000 * 60 * 3,
  });

  // Fetch user storage allocation
  const { storage } = useUserStorage(emailId);

  // Metrics aggregation
  const totalBooksCount = books.length;
  const totalViews = books.reduce((acc, b) => acc + (Number(b.views) || 0), 0);
  const totalPagesProduced = books.reduce((acc, b) => acc + (Number(b.pages) || Number(b.pagesCount) || 1), 0);

  const usedBytes = storage?.used || 0;
  const totalBytes = storage?.total || 300 * 1024 * 1024;
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(0);
  const storagePercent = Math.min(100, Math.round((usedBytes / (totalBytes || 1)) * 100));

  // Sort recent books by updatedAt or createdAt
  const recentBooks = [...books].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  }).slice(0, 4);

  return (
    <div className="w-full max-w-[92vw] mx-auto p-[1.5vw] font-sans space-y-[1.4vw]">
      {/* 1. Welcome Banner Card */}
      <div className="w-full relative rounded-[1vw] py-[1.2vw] px-[1.6vw] border border-gray-200 shadow-sm flex justify-between items-center overflow-hidden select-none bg-gradient-to-r from-white via-white to-[#fff8f6]">
        {/* Ambient Glows */}
        <div className="absolute -top-[5vw] right-[14vw] w-[18vw] h-[18vw] bg-gradient-to-br from-orange-400/10 via-rose-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-[4vw] right-[2vw] w-[14vw] h-[14vw] bg-gradient-to-tl from-amber-400/10 via-orange-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Left Side: Greeting & Description */}
        <div className="flex flex-col z-10 max-w-[65%]">
          <div className="inline-flex items-center gap-[0.35vw] px-[0.6vw] py-[0.18vw] rounded-full text-[0.66vw] font-medium bg-[#fff1ee] text-[#ec5137] border border-[#fecaca] w-fit mb-[0.5vw]">
            <Sparkles className="w-[0.8vw] h-[0.8vw]" />
            <span>Workspace Executive Overview</span>
          </div>

          <h1 className="text-[1.35vw] font-semibold text-gray-800 tracking-tight leading-tight flex items-center gap-[0.45vw]">
            <span>Welcome back,</span>
            <span className="text-[#ec5137]">{displayName}</span>
          </h1>

          <p className="text-[0.74vw] text-gray-500 font-normal mt-[0.25vw] mb-[0.9vw] max-w-[44vw] leading-relaxed">
            Manage your publications, monitor viewer engagement, explore interactive 3D templates, and craft high-performance digital publications with ease.
          </p>

          <div className="flex flex-wrap items-center gap-[0.65vw]">
            <Link
              to="/my-flipbooks"
              className="inline-flex items-center gap-[0.4vw] px-[1.05vw] py-[0.48vw] rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.78vw] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-[0.85vw] h-[0.85vw]" />
              <span>Create or View Flipbooks</span>
            </Link>
            <Link
              to="/templates"
              className="inline-flex items-center gap-[0.4vw] px-[0.85vw] py-[0.42vw] rounded-[0.5vw] bg-white border border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-medium text-[0.78vw] shadow-xs transition-all cursor-pointer"
            >
              <LayoutTemplate className="w-[0.85vw] h-[0.85vw] text-gray-500" />
              <span>Explore Templates</span>
            </Link>
            <Link
              to="/guide"
              className="inline-flex items-center gap-[0.4vw] px-[0.85vw] py-[0.42vw] rounded-[0.5vw] bg-white border border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-medium text-[0.78vw] shadow-xs transition-all cursor-pointer"
            >
              <BookOpen className="w-[0.85vw] h-[0.85vw] text-gray-500" />
              <span>Learning Center</span>
            </Link>
          </div>
        </div>

        {/* Right Graphic */}
        <div className="relative flex-shrink-0 z-10 pl-[1vw]">
          <img
            src={dashboardBannerImg}
            alt="FlipiBook Platform"
            className="h-[9vw] w-auto object-contain drop-shadow-sm pointer-events-none"
          />
        </div>
      </div>

      {/* 2. Analytics KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[0.9vw]">
        {/* Metric 1: Total Flipbooks */}
        <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[0.72vw] font-medium text-gray-500 tracking-tight">Total Flipbooks</span>
            <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-[1.05vw] h-[1.05vw]" />
            </div>
          </div>
          <div className="mt-[0.6vw]">
            <p className="text-[1.5vw] font-semibold text-gray-800 leading-tight">
              {isLoadingBooks ? '—' : totalBooksCount}
            </p>
            <div className="mt-[0.25vw] flex items-center gap-[0.35vw] text-[0.72vw] text-emerald-600 font-medium">
              <TrendingUp className="w-[0.8vw] h-[0.8vw]" />
              <span>Active publications catalog</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Views */}
        <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[0.72vw] font-medium text-gray-500 tracking-tight">Total Impressions</span>
            <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-orange-50 text-[#ec5137] flex items-center justify-center">
              <Eye className="w-[1.05vw] h-[1.05vw]" />
            </div>
          </div>
          <div className="mt-[0.6vw]">
            <p className="text-[1.5vw] font-semibold text-gray-800 leading-tight">
              {isLoadingBooks ? '—' : (totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews)}
            </p>
            <div className="mt-[0.25vw] flex items-center gap-[0.35vw] text-[0.72vw] text-gray-500 font-normal">
              <CheckCircle2 className="w-[0.8vw] h-[0.8vw] text-[#16A34A]" />
              <span>Lifetime reader engagements</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total Pages Produced */}
        <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[0.72vw] font-medium text-gray-500 tracking-tight">Pages Produced</span>
            <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-[1.05vw] h-[1.05vw]" />
            </div>
          </div>
          <div className="mt-[0.6vw]">
            <p className="text-[1.5vw] font-semibold text-gray-800 leading-tight">
              {isLoadingBooks ? '—' : totalPagesProduced}
            </p>
            <div className="mt-[0.25vw] text-[0.72vw] text-gray-500 font-normal">
              Interactive pages across books
            </div>
          </div>
        </div>

        {/* Metric 4: Storage Allocation */}
        <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[0.72vw] font-medium text-gray-500 tracking-tight">Cloud Storage</span>
            <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <HardDrive className="w-[1.05vw] h-[1.05vw]" />
            </div>
          </div>
          <div className="mt-[0.6vw]">
            <p className="text-[1.5vw] font-semibold text-gray-800 leading-tight">
              {usedMB} MB <span className="text-[0.72vw] font-normal text-gray-400">/ {totalMB} MB</span>
            </p>
            <div className="w-full bg-gray-100 rounded-full h-[0.35vw] mt-[0.45vw] overflow-hidden">
              <div
                className="bg-[#ec5137] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(4, storagePercent)}%` }}
              />
            </div>
            <div className="mt-[0.25vw] text-[0.68vw] text-gray-500 font-normal flex items-center justify-between">
              <span>{storagePercent}% used</span>
              <Link to="/settings/billing" className="text-[#ec5137] hover:underline font-medium">Manage plan</Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1.2vw]">
        {/* Left Column: Recent Flipbooks */}
        <div className="lg:col-span-2 bg-white rounded-[1vw] border border-gray-200 p-[1.5vw] shadow-sm space-y-[1vw]">
          <div className="flex items-center justify-between pb-[0.75vw] border-b border-gray-100">
            <div>
              <h2 className="text-[0.98vw] font-medium text-gray-800 flex items-center gap-[0.45vw]">
                <BookOpen className="w-[1.05vw] h-[1.05vw] text-[#ec5137]" />
                <span>Recent Publications</span>
              </h2>
              <p className="text-[0.72vw] text-gray-500 font-normal mt-[0.1vw]">
                Your recently created and updated interactive publications
              </p>
            </div>
            <Link
              to="/my-flipbooks"
              className="text-[0.74vw] font-medium text-[#ec5137] hover:underline flex items-center gap-[0.2vw]"
            >
              <span>View All</span>
              <ChevronRight className="w-[0.85vw] h-[0.85vw]" />
            </Link>
          </div>

          <div className="space-y-[0.65vw]">
            {isLoadingBooks ? (
              <div className="py-[3vw] text-center text-[0.78vw] text-gray-500 font-normal">
                Loading your publications...
              </div>
            ) : recentBooks.length === 0 ? (
              <div className="py-[3vw] text-center bg-[#f8f9fa] rounded-[0.75vw] border border-dashed border-gray-200 p-[1.5vw]">
                <BookOpen className="w-[2vw] h-[2vw] mx-auto text-gray-300 mb-[0.4vw]" />
                <h3 className="text-[0.88vw] font-medium text-gray-800">No flipbooks created yet</h3>
                <p className="text-[0.72vw] text-gray-400 font-normal mt-[0.15vw] mb-[0.8vw]">
                  Upload a PDF document or choose a pre-built template to start.
                </p>
                <Link
                  to="/my-flipbooks"
                  className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.42vw] rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] text-white text-[0.75vw] font-medium shadow-xs transition"
                >
                  <Plus className="w-[0.85vw] h-[0.85vw]" />
                  <span>Create Your First Flipbook</span>
                </Link>
              </div>
            ) : (
              recentBooks.map((book, idx) => {
                const bookTitle = book.title || book.bookName || 'Untitled Flipbook';
                const pageCount = book.pages || book.pagesCount || 1;
                const bookViews = Number(book.views) || 0;
                const updatedTime = book.updatedAt || book.createdAt;
                const dateFormatted = updatedTime ? new Date(updatedTime).toLocaleDateString() : 'Recent';

                return (
                  <div
                    key={book._id || book.id || idx}
                    className="flex items-center justify-between p-[0.85vw] rounded-[0.75vw] border border-gray-200 bg-white hover:bg-gray-50/50 hover:border-gray-300 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-[0.85vw] min-w-0 flex-1">
                      {/* Thumbnail container */}
                      <div className="w-[3.6vw] h-[4.8vw] rounded-[0.45vw] bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative">
                        {book.thumbnailUrl || book.coverImage ? (
                          <img
                            src={book.thumbnailUrl || book.coverImage}
                            alt={bookTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-[1.3vw] h-[1.3vw] text-gray-300" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1 pr-[0.8vw]">
                        <h3 className="text-[0.85vw] font-medium text-gray-800 truncate leading-snug hover:text-[#ec5137] transition-colors">
                          {bookTitle}
                        </h3>
                        <p className="text-[0.7vw] text-gray-500 font-normal mt-[0.15vw]">
                          {pageCount} {pageCount === 1 ? 'Page' : 'Pages'} • Folder: <span className="font-medium text-gray-700">{book.folder || 'My Flipbooks'}</span>
                        </p>
                        <span className="text-[0.66vw] text-gray-400 font-normal mt-[0.1vw] block">
                          Updated {dateFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-[0.8vw] shrink-0">
                      <span className="text-[0.68vw] text-gray-500 font-normal hidden sm:inline-flex items-center gap-[0.25vw] bg-gray-50 border border-gray-200 px-[0.55vw] py-[0.18vw] rounded-full">
                        <Eye className="w-[0.75vw] h-[0.75vw] text-gray-400" />
                        <span>{bookViews} {bookViews === 1 ? 'view' : 'views'}</span>
                      </span>

                      <Link
                        to="/my-flipbooks"
                        className="px-[0.85vw] py-[0.42vw] rounded-[0.5vw] text-[0.76vw] font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-xs transition active:scale-[0.98]"
                      >
                        Open Studio
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Quick Resources & Support */}
        <div className="space-y-[1.2vw]">
          <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.5vw] shadow-sm space-y-[0.8vw]">
            <div>
              <h2 className="text-[0.98vw] font-medium text-gray-800">Learning & Resources</h2>
              <p className="text-[0.72vw] text-gray-500 font-normal mt-[0.1vw]">
                Guides, templates, and designer community
              </p>
            </div>

            <div className="space-y-[0.55vw]">
              <Link
                to="/guide"
                className="block p-[0.85vw] rounded-[0.75vw] border border-gray-100 hover:border-[#ec5137]/30 bg-[#f8f9fa] hover:bg-[#fff8f6] transition group shadow-xs"
              >
                <div className="font-medium text-[0.8vw] text-gray-800 group-hover:text-[#ec5137] transition-colors flex items-center justify-between">
                  <span>User Guide & Documentation</span>
                  <ArrowRight className="w-[0.8vw] h-[0.8vw] text-gray-400 group-hover:text-[#ec5137] group-hover:translate-x-[2px] transition-all" />
                </div>
                <p className="text-[0.7vw] text-gray-500 font-normal mt-[0.15vw] leading-relaxed">
                  Learn to embed 3D models, audio hotspots, and customized themes.
                </p>
              </Link>

              <Link
                to="/templates"
                className="block p-[0.85vw] rounded-[0.75vw] border border-gray-100 hover:border-[#ec5137]/30 bg-[#f8f9fa] hover:bg-[#fff8f6] transition group shadow-xs"
              >
                <div className="font-medium text-[0.8vw] text-gray-800 group-hover:text-[#ec5137] transition-colors flex items-center justify-between">
                  <span>Templates Gallery</span>
                  <ArrowRight className="w-[0.8vw] h-[0.8vw] text-gray-400 group-hover:text-[#ec5137] group-hover:translate-x-[2px] transition-all" />
                </div>
                <p className="text-[0.7vw] text-gray-500 font-normal mt-[0.15vw] leading-relaxed">
                  Pre-built layouts for magazines, brochures, menus, and portfolios.
                </p>
              </Link>

              <Link
                to="/forum"
                className="block p-[0.85vw] rounded-[0.75vw] border border-gray-100 hover:border-[#ec5137]/30 bg-[#f8f9fa] hover:bg-[#fff8f6] transition group shadow-xs"
              >
                <div className="font-medium text-[0.8vw] text-gray-800 group-hover:text-[#ec5137] transition-colors flex items-center justify-between">
                  <span>Community Forum</span>
                  <ArrowRight className="w-[0.8vw] h-[0.8vw] text-gray-400 group-hover:text-[#ec5137] group-hover:translate-x-[2px] transition-all" />
                </div>
                <p className="text-[0.7vw] text-gray-500 font-normal mt-[0.15vw] leading-relaxed">
                  Get answers, tips, and inspiration from the creator community.
                </p>
              </Link>

              <Link
                to="/settings/support"
                className="block p-[0.85vw] rounded-[0.75vw] border border-gray-100 hover:border-[#ec5137]/30 bg-[#f8f9fa] hover:bg-[#fff8f6] transition group shadow-xs"
              >
                <div className="font-medium text-[0.8vw] text-gray-800 group-hover:text-[#ec5137] transition-colors flex items-center justify-between">
                  <span>Support & Helpdesk</span>
                  <ArrowRight className="w-[0.8vw] h-[0.8vw] text-gray-400 group-hover:text-[#ec5137] group-hover:translate-x-[2px] transition-all" />
                </div>
                <p className="text-[0.7vw] text-gray-500 font-normal mt-[0.15vw] leading-relaxed">
                  Direct ticket submission and priority inquiry assistance.
                </p>
              </Link>
            </div>
          </div>

          {/* Pro Tip Highlight Callout */}
          <div className="p-[1vw] rounded-[0.75vw] bg-[#fff8f6] border border-[#fecaca] text-[0.72vw] text-gray-700 space-y-[0.25vw] shadow-xs">
            <div className="flex items-center gap-[0.35vw] text-[#ec5137] font-medium">
              <Sparkles className="w-[0.85vw] h-[0.85vw]" />
              <span>Pro Creator Tip</span>
            </div>
            <p className="text-gray-600 font-normal leading-relaxed">
              Enhance your digital publications by uploading GLB/OBJ 3D models with real-time orbit controls or ambient page turn sounds inside the Customized Editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
