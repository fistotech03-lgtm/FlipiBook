import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Pin,
  Lock,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import {
  getForumDiscussions,
  replyToDiscussion,
  updateDiscussionStatus,
  toggleDiscussionFlags,
  deleteDiscussion,
  getForumStats
} from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

export default function ForumModerationPage() {
  const { adminUser, showToast } = useAdmin();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState(null);

  // Active reply composer states
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('answered');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchDiscussionsList = async () => {
    try {
      setLoading(true);
      const [discRes, statsRes] = await Promise.all([
        getForumDiscussions({ search: search.trim() || undefined, status: statusFilter }),
        getForumStats()
      ]);
      setDiscussions(discRes.posts || []);
      setStats(statsRes.stats);
    } catch (err) {
      showToast(err.message || 'Failed to load discussions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussionsList();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDiscussionsList();
  };

  const handleSendReply = async (post) => {
    if (!replyText.trim()) return;
    try {
      setIsSubmittingReply(true);
      const res = await replyToDiscussion(post.id, {
        content: replyText.trim(),
        status: replyStatus,
        author: {
          name: adminUser.name,
          email: adminUser.email,
          role: 'Official Reply',
          isAdmin: true
        }
      });

      setDiscussions((prev) =>
        prev.map((d) => (d.id === post.id ? { ...d, adminReply: res.adminReply, status: res.status } : d))
      );

      setReplyText('');
      setActiveReplyId(null);
      showToast('Official response published to forum', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to publish reply', 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleStatusUpdate = async (postId, newStatus) => {
    try {
      await updateDiscussionStatus(postId, newStatus);
      setDiscussions((prev) =>
        prev.map((d) => (d.id === postId ? { ...d, status: newStatus } : d))
      );
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleTogglePin = async (postId, currentPin) => {
    try {
      await toggleDiscussionFlags(postId, { isPinned: !currentPin });
      setDiscussions((prev) =>
        prev.map((d) => (d.id === postId ? { ...d, isPinned: !currentPin } : d))
      );
      showToast(!currentPin ? 'Discussion pinned to top' : 'Discussion unpinned', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to pin discussion', 'error');
    }
  };

  const handleToggleLock = async (postId, currentLock) => {
    try {
      await toggleDiscussionFlags(postId, { isLocked: !currentLock });
      setDiscussions((prev) =>
        prev.map((d) => (d.id === postId ? { ...d, isLocked: !currentLock } : d))
      );
      showToast(!currentLock ? 'Discussion locked' : 'Discussion unlocked', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to lock discussion', 'error');
    }
  };

  const handleDeleteDiscussion = async (postId, title) => {
    if (!window.confirm(`Delete discussion "${title}"?`)) return;
    try {
      await deleteDiscussion(postId);
      setDiscussions((prev) => prev.filter((d) => d.id !== postId));
      showToast('Discussion post deleted', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete discussion', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#ec5137]" />
            <span>Developer & Community Forum Governance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publish verified official answers, pin announcements, and manage feedback status
          </p>
        </div>

        <button
          onClick={fetchDiscussionsList}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#ec5137] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Discussions</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats?.total || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
          <p className="text-[11px] font-bold text-amber-700 uppercase">Awaiting Admin</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats?.awaitingAdmin || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-xs">
          <p className="text-[11px] font-bold text-[#c23d26] uppercase">Under Review</p>
          <p className="text-2xl font-black text-[#ec5137] mt-1">{stats?.underReview || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-700 uppercase">Answered & Solved</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.answered || 0}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions by topic or author..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ec5137] transition"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'unanswered', 'answered', 'under_review', 'planned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#ec5137] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Discussion Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Loader2 className="animate-spin text-[#ec5137] mx-auto mb-2" size={24} />
            <p className="text-xs font-semibold text-slate-600">Loading forum inquiries...</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-800">No discussions found matching criteria</p>
          </div>
        ) : (
          discussions.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-[#ec5137]/30 transition space-y-4"
            >
              {/* Header: Module, status, author */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-orange-50 text-[#c23d26] border border-orange-200">
                    {post.moduleName || post.moduleId}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase border border-slate-200">
                    {post.postType}
                  </span>
                  <span className="text-xs text-slate-500">
                    by <strong className="text-slate-800 font-semibold">{post.author?.name}</strong> ({post.author?.email})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status selector */}
                  <select
                    value={post.status || 'awaiting_admin'}
                    onChange={(e) => handleStatusUpdate(post.id, e.target.value)}
                    className="bg-slate-50 text-slate-800 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer"
                  >
                    <option value="awaiting_admin">Awaiting Admin</option>
                    <option value="under_review">Under Review</option>
                    <option value="answered">Answered</option>
                    <option value="planned">Planned</option>
                    <option value="implemented">Implemented</option>
                  </select>

                  {/* Pin button */}
                  <button
                    onClick={() => handleTogglePin(post.id, post.isPinned)}
                    title={post.isPinned ? 'Unpin' : 'Pin to top'}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      post.isPinned
                        ? 'bg-amber-50 text-amber-600 border-amber-300'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <Pin size={14} className={post.isPinned ? 'fill-current' : ''} />
                  </button>

                  {/* Lock button */}
                  <button
                    onClick={() => handleToggleLock(post.id, post.isLocked)}
                    title={post.isLocked ? 'Unlock discussion' : 'Lock discussion'}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      post.isLocked
                        ? 'bg-rose-50 text-rose-600 border-rose-300'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <Lock size={14} />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteDiscussion(post.id, post.title)}
                    title="Delete discussion"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-bold text-slate-900">{post.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed whitespace-pre-line font-normal">
                  {post.description}
                </p>
              </div>

              {/* Existing Official Reply (if any) */}
              {post.adminReply && (
                <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#c23d26] font-bold">
                      <ShieldCheck size={14} className="text-[#ec5137]" />
                      <span>Official Support Reply published:</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(post.adminReply.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line pl-5 font-normal">
                    {post.adminReply.content}
                  </p>
                </div>
              )}

              {/* Reply Accordion / Composer */}
              {activeReplyId === post.id ? (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#ec5137] flex items-center gap-1">
                      <Sparkles size={13} />
                      <span>Compose Official Engineering Response</span>
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-400">Set Status:</span>
                      <select
                        value={replyStatus}
                        onChange={(e) => setReplyStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 text-xs text-slate-700 outline-none"
                      >
                        <option value="answered">Answered</option>
                        <option value="under_review">Under Review</option>
                        <option value="planned">Planned</option>
                        <option value="implemented">Implemented</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write authoritative official answer from the FlipiBook product engineering team..."
                    className="w-full p-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#ec5137] text-slate-800"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(null)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendReply(post)}
                      disabled={!replyText.trim() || isSubmittingReply}
                      className="px-4 py-1.5 rounded-xl bg-[#ec5137] hover:bg-[#d5452e] text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1"
                    >
                      <Send size={12} />
                      <span>{isSubmittingReply ? 'Publishing...' : 'Publish Official Reply'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {post.adminReply ? 'Revise or update response:' : 'Needs official review:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReplyId(post.id);
                      setReplyText(post.adminReply?.content || '');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-xs font-bold text-[#ec5137] transition cursor-pointer"
                  >
                    <Send size={12} />
                    <span>{post.adminReply ? 'Edit Official Reply' : 'Reply as Admin'}</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
