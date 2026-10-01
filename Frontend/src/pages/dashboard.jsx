import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, 
  Plus, 
  Upload, 
  Eye, 
  Users, 
  TrendingUp, 
  LogOut, 
  Search, 
  Sparkles,
  FileText,
  Clock,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import { useToast } from '../components/CustomToast';
import { clearSession } from '../utils/authUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState({ name: 'Creator', picture: '' });
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  // Fetch session data from backend using secure HttpOnly cookie
  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/auth/verify`, {
          withCredentials: true
        });

        if (res.data?.success && isMounted) {
          setUser(res.data.user || { name: 'Creator', picture: '' });
        }
      } catch (err) {
        console.warn('Session check notice:', err.response?.data?.message || err.message);
        // If session is expired or invalid, clearSession and redirect
        if (err.response?.status === 401) {
          clearSession();
          navigate('/login', { replace: true });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSession();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSession();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    }
  };

  const sampleFlipbooks = [
    {
      id: 1,
      title: 'Company Annual Report 2026',
      pages: 28,
      views: '1.4k',
      updatedAt: '2 hours ago',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 2,
      title: 'Product Catalog - Spring Edition',
      pages: 42,
      views: '3.8k',
      updatedAt: 'Yesterday',
      thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 3,
      title: 'Interactive Real Estate Portfolio',
      pages: 16,
      views: '890',
      updatedAt: '3 days ago',
      thumbnail: 'https://images.unsplash.com/photo-1507842229458-57793d56f481?w=500&auto=format&fit=crop&q=60'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EC5137] to-[#FF7B60] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                FlipiBook
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-[#EC5137]">
                Studio
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search flipbooks, assets, templates..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#EC5137] focus:ring-2 focus:ring-orange-200 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/70 border border-slate-200/50">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-white"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                {user.name || 'Creator'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-100"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e293b] p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-[#EC5137]/20 to-orange-500/0 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-medium text-orange-200">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Welcome to your digital publishing workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Hello, {user.name ? user.name.split(' ')[0] : 'Creator'} 👋
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Transform static documents and presentations into engaging, interactive page-turn flipbooks with rich media and real-time reader analytics.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EC5137] hover:bg-[#d6452d] text-white text-xs font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all cursor-pointer">
                <Plus className="w-4 h-4" />
                Create New Flipbook
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/15 backdrop-blur-sm transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload PDF Document
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Books</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">12</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span>↑ +3</span> this month
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#EC5137] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Impressions</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">28.4k</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span>↑ +18%</span> vs last week
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Unique Readers</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">6,920</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span>↑ +12.4%</span> engagement
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Read Time</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">4m 32s</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span>↑ +45s</span> retention
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Recent Publications Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Flipbooks</h2>
              <p className="text-xs text-slate-500">Manage, share, and track your interactive publications</p>
            </div>
            <button className="text-xs font-semibold text-[#EC5137] hover:text-orange-700 transition-colors">
              View all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleFlipbooks.map((book) => (
              <div
                key={book.id}
                className="group bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Book Preview Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {book.pages} Pages
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-[#EC5137] transition-colors">
                      {book.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {book.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {book.updatedAt}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EC5137] hover:text-[#d6452d] transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Flipbook
                    </button>
                    <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
