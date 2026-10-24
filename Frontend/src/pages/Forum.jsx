import React, { useState } from 'react';
import { Search, MessageSquare, ThumbsUp, Eye, Plus, Sparkles, Filter, Users, CheckCircle, Flame, Tag } from 'lucide-react';
import { Icon } from '@iconify/react';

const CATEGORIES = [
  { id: 'all', name: 'All Discussions', icon: 'lucide:layout-grid', count: 128 },
  { id: 'general', name: 'General Discussion', icon: 'lucide:messages-square', count: 45 },
  { id: 'showcase', name: 'Flipbook Showcase', icon: 'lucide:award', count: 32 },
  { id: 'features', name: 'Feature Requests', icon: 'lucide:lightbulb', count: 21 },
  { id: 'tutorials', name: 'Tips & Tutorials', icon: 'lucide:book-open', count: 18 },
  { id: 'help', name: 'Help & Q&A', icon: 'lucide:help-circle', count: 12 },
];

const INITIAL_TOPICS = [
  {
    id: 1,
    title: 'How to optimize 3D models for ultra-smooth flipbook rendering?',
    excerpt: 'Sharing best practices on reducing polygon counts and texture compression to ensure your flipbooks open instantly on mobile devices...',
    category: 'tutorials',
    categoryName: 'Tips & Tutorials',
    categoryColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    author: {
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      badge: 'Pro Creator'
    },
    replies: 24,
    likes: 89,
    views: '2.4k',
    isPinned: true,
    isPopular: true,
    timeAgo: '2 hours ago',
    tags: ['3D Modeling', 'Performance', 'WebGL']
  },
  {
    id: 2,
    title: 'Showcase: Interactive Product Catalog 2026 for Interior Studio',
    excerpt: 'Just published our new interactive catalog featuring 360-degree product views and embedded hotspot videos. Would love feedback!',
    category: 'showcase',
    categoryName: 'Flipbook Showcase',
    categoryColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      badge: 'Designer'
    },
    replies: 19,
    likes: 142,
    views: '3.8k',
    isPinned: false,
    isPopular: true,
    timeAgo: '5 hours ago',
    tags: ['Showcase', 'Catalog', 'Hotspots']
  },
  {
    id: 3,
    title: 'Feature Request: Audio voiceover sync per page',
    excerpt: 'It would be amazing to support audio tracks synchronized with individual pages for children storybooks and corporate training decks.',
    category: 'features',
    categoryName: 'Feature Requests',
    categoryColor: 'bg-amber-50 text-amber-600 border-amber-200',
    author: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      badge: 'Member'
    },
    replies: 38,
    likes: 210,
    views: '4.1k',
    isPinned: false,
    isPopular: true,
    timeAgo: '1 day ago',
    tags: ['Feature Request', 'Audio', 'Accessibility']
  },
  {
    id: 4,
    title: 'Best dimensions for high-resolution photography flipbooks?',
    excerpt: 'I am creating a photography monograph. Should I export images at 300 DPI or is 150 DPI sufficient for crisp desktop viewing?',
    category: 'help',
    categoryName: 'Help & Q&A',
    categoryColor: 'bg-rose-50 text-rose-600 border-rose-200',
    author: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      badge: 'Photographer'
    },
    replies: 15,
    likes: 34,
    views: '1.2k',
    isPinned: false,
    isPopular: false,
    timeAgo: '2 days ago',
    tags: ['Photography', 'Export', 'DPI']
  },
  {
    id: 5,
    title: 'FlipiBook v2.4 Community Update & Roadmap Discussion',
    excerpt: 'Welcome to the updated community hub! Here is our development roadmap for Q3/Q4 including real-time team collaboration...',
    category: 'general',
    categoryName: 'General Discussion',
    categoryColor: 'bg-blue-50 text-blue-600 border-blue-200',
    author: {
      name: 'FlipiBook Team',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      badge: 'Staff'
    },
    replies: 52,
    likes: 310,
    views: '6.9k',
    isPinned: true,
    isPopular: true,
    timeAgo: '3 days ago',
    tags: ['Announcement', 'Roadmap', 'Update']
  }
];

export default function Forum() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const filteredTopics = INITIAL_TOPICS.filter((topic) => {
    const matchesCategory = activeCategory === 'all' || topic.category === activeCategory;
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-full bg-[#f8f9fb] text-slate-800 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1f2937] text-white py-12 px-6 md:px-12 border-b border-slate-700">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#ec5137]/20 text-[#ff8166] border border-[#ec5137]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FlipiBook Community Hub</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Community Forum & Discussions
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-xl">
              Connect with fellow creators, ask questions, share showcase flipbooks, and discuss new feature ideas.
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ec5137] hover:bg-[#d4432c] text-white font-semibold text-sm shadow-lg shadow-[#ec5137]/25 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Start Discussion</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search discussions, tags, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ec5137] focus:ring-1 focus:ring-[#ec5137] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-500 font-medium">Sort by:</span>
            <div className="inline-flex p-1 bg-gray-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === 'popular' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Popular
              </button>
              <button
                type="button"
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === 'latest' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Latest
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Categories Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-2">
                Categories
              </h3>
              <nav className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-[#ec5137] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon icon={cat.icon} className="w-4 h-4 shrink-0" />
                      <span>{cat.name}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Community Stats Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#ec5137]" />
                <span>Community Pulse</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-900">1.8k+</div>
                  <div className="text-[11px] text-gray-500 font-medium">Members</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-900">420+</div>
                  <div className="text-[11px] text-gray-500 font-medium">Discussions</div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Active moderation 24/7</span>
              </div>
            </div>
          </aside>

          {/* Right Discussions List */}
          <main className="lg:col-span-3 space-y-4">
            {filteredTopics.map((topic) => (
              <article
                key={topic.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2.5 flex-1">
                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {topic.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Flame className="w-3 h-3 text-amber-600" />
                          <span>Pinned</span>
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${topic.categoryColor}`}>
                        {topic.categoryName}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#ec5137] transition-colors cursor-pointer leading-snug">
                      {topic.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {topic.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {topic.tags.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          <Tag className="w-2.5 h-2.5 text-gray-400" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Author & Stats Block */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="flex items-center gap-2">
                      <img
                        src={topic.author.avatar}
                        alt={topic.author.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-200"
                      />
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-bold text-gray-800">{topic.author.name}</div>
                        <div className="text-[10px] text-gray-400">{topic.timeAgo}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                        <span>{topic.replies}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
                        <span>{topic.likes}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        <span>{topic.views}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {filteredTopics.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800">No discussions found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  We couldn't find any discussions matching "{searchQuery}". Try selecting another category or start a new topic!
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#ec5137] bg-[#fff5f3] hover:bg-[#ffeae6] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
