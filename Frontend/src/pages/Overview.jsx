import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Eye, Share2, Clock, Plus, Sparkles, TrendingUp, ArrowRight, HardDrive, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Overview() {
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || 'Creator';

  return (
    <div className="min-h-full bg-[#f8f9fb] text-slate-800 p-6 md:p-10 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 md:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#ec5137]/20 text-[#ff8166] border border-[#ec5137]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace Overview</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Manage your flipbooks, monitor viewer engagement, explore interactive 3D templates, and publish digital publications with ease.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/my-flipbooks"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ec5137] hover:bg-[#d4432c] text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create or View Flipbooks</span>
            </Link>
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition-all cursor-pointer"
            >
              <span>Explore Templates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ec5137]/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Flipbooks</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2 published this month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Views</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">14.8k</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% from last week</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg. Read Time</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">3m 42s</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>High engagement</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Storage Used</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">42 MB <span className="text-xs font-normal text-gray-400">/ 1 GB</span></div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="bg-[#ec5137] h-1.5 rounded-full" style={{ width: '4.2%' }}></div>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Flipbooks</h2>
            <Link to="/my-flipbooks" className="text-xs font-semibold text-[#ec5137] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Interactive Annual Catalog 2026', pages: 16, views: '3.4k', updated: '2 hours ago' },
              { title: 'Modern Architecture Portfolio', pages: 24, views: '6.1k', updated: 'Yesterday' },
              { title: 'Brand Guidelines & Stylebook', pages: 12, views: '1.2k', updated: '3 days ago' },
            ].map((book, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#ec5137]/10 text-[#ec5137] flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{book.title}</h3>
                    <div className="text-xs text-gray-500">{book.pages} Pages • Updated {book.updated}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-medium hidden sm:inline">{book.views} views</span>
                  <Link
                    to="/my-flipbooks"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 shadow-2xs transition-colors"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Guide & Support Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Quick Resources</h2>

          <div className="space-y-3">
            <Link
              to="/guide"
              className="block p-4 rounded-xl border border-gray-100 hover:border-[#ec5137]/40 bg-gray-50/50 hover:bg-[#fff7f5] transition-all group"
            >
              <div className="font-bold text-sm text-gray-900 group-hover:text-[#ec5137] transition-colors">
                User Guide & Documentation →
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Learn how to add 3D objects, audio hotspots, and customized themes to your flipbooks.
              </p>
            </Link>

            <Link
              to="/templates"
              className="block p-4 rounded-xl border border-gray-100 hover:border-[#ec5137]/40 bg-gray-50/50 hover:bg-[#fff7f5] transition-all group"
            >
              <div className="font-bold text-sm text-gray-900 group-hover:text-[#ec5137] transition-colors">
                Templates Gallery →
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pre-built layouts for magazines, brochures, menus, and photo albums.
              </p>
            </Link>

            <Link
              to="/forum"
              className="block p-4 rounded-xl border border-gray-100 hover:border-[#ec5137]/40 bg-gray-50/50 hover:bg-[#fff7f5] transition-all group"
            >
              <div className="font-bold text-sm text-gray-900 group-hover:text-[#ec5137] transition-colors">
                Community Forum →
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Get answers from expert designers and the FlipiBook product team.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
