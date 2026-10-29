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
    <div className="space-y-[1.2vw]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.35vw] font-semibold text-gray-800 tracking-tight flex items-center gap-[0.5vw]">
            <MessageSquare className="w-[1.25vw] h-[1.25vw] text-[#ec5137]" />
            <span>Developer & Community Forum Governance</span>
          </h1>
          <p className="text-[0.74vw] text-gray-500 font-normal mt-[0.25vw]">
            Publish verified official answers, pin announcements, and manage feedback status
          </p>
        </div>

        <button
          onClick={fetchDiscussionsList}
          disabled={loading}
          className="flex items-center gap-[0.45vw] px-[0.85vw] py-[0.42vw] rounded-[0.5vw] text-[0.78vw] font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-[0.9vw] h-[0.9vw] text-[#ec5137] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[1vw]">
        <div className="bg-white p-[1.2vw] rounded-[1vw] border border-gray-200 shadow-sm">
          <p className="text-[0.72vw] font-medium text-gray-500 tracking-tight">Total Discussions</p>
          <p className="text-[1.5vw] font-semibold text-gray-800 mt-[0.2vw] leading-tight">{stats?.total || 0}</p>
        </div>
        <div className="bg-white p-[1.2vw] rounded-[1vw] border border-gray-200 shadow-sm">
          <p className="text-[0.72vw] font-medium text-amber-700 tracking-tight">Awaiting Admin</p>
          <p className="text-[1.5vw] font-semibold text-amber-600 mt-[0.2vw] leading-tight">{stats?.awaitingAdmin || 0}</p>
        </div>
        <div className="bg-white p-[1.2vw] rounded-[1vw] border border-gray-200 shadow-sm">
          <p className="text-[0.72vw] font-medium text-[#ec5137] tracking-tight">Under Review</p>
          <p className="text-[1.5vw] font-semibold text-[#ec5137] mt-[0.2vw] leading-tight">{stats?.underReview || 0}</p>
        </div>
        <div className="bg-white p-[1.2vw] rounded-[1vw] border border-gray-200 shadow-sm">
          <p className="text-[0.72vw] font-medium text-emerald-700 tracking-tight">Answered & Solved</p>
          <p className="text-[1.5vw] font-semibold text-emerald-600 mt-[0.2vw] leading-tight">{stats?.answered || 0}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-[1vw] border border-gray-200 p-[0.9vw] shadow-sm flex flex-wrap items-center justify-between gap-[0.8vw]">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[15vw] max-w-[22vw]">
          <Search size="0.95vw" className="absolute left-[0.75vw] top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions by topic or author..."
            className="w-full pl-[2.2vw] pr-[0.8vw] py-[0.45vw] bg-[#f8f9fa] hover:bg-white focus:bg-white border border-gray-200 rounded-[0.5vw] text-[0.78vw] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ec5137] transition"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-[0.45vw] flex-wrap">
          {['all', 'unanswered', 'answered', 'under_review', 'planned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-[0.85vw] py-[0.38vw] rounded-[0.5vw] text-[0.75vw] font-medium capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#ec5137] text-white shadow-xs'
                  : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 shadow-xs'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Discussion Feed */}
      <div className="space-y-[0.8vw]">
        {loading ? (
          <div className="py-[4vw] text-center bg-white rounded-[1vw] border border-gray-200 shadow-sm">
            <Loader2 className="animate-spin text-[#ec5137] mx-auto mb-[0.5vw]" size="1.5vw" />
            <p className="text-[0.78vw] font-medium text-gray-600">Loading forum inquiries...</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="py-[3vw] text-center bg-white rounded-[1vw] border border-gray-200 p-[1.5vw] shadow-sm">
            <MessageSquare size="2vw" className="mx-auto text-gray-300 mb-[0.4vw]" />
            <p className="text-[0.88vw] font-medium text-gray-800">No discussions found matching criteria</p>
          </div>
        ) : (
          discussions.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-[0.75vw] border border-gray-200 p-[1.2vw] shadow-xs hover:border-gray-300 transition space-y-[0.9vw]"
            >
              {/* Header: Module, status, author */}
              <div className="flex flex-wrap items-center justify-between gap-[0.8vw]">
                <div className="flex items-center gap-[0.55vw] flex-wrap">
                  <span className="text-[0.68vw] font-medium px-[0.55vw] py-[0.12vw] rounded-full bg-orange-50 text-[#ec5137] border border-orange-200">
                    {post.moduleName || post.moduleId}
                  </span>
                  <span className="text-[0.66vw] font-medium px-[0.55vw] py-[0.12vw] rounded-full bg-gray-100 text-gray-600 uppercase border border-gray-200">
                    {post.postType}
                  </span>
                  <span className="text-[0.74vw] text-gray-500 font-normal">
                    by <strong className="text-gray-700 font-medium">{post.author?.name}</strong> ({post.author?.email})
                  </span>
                </div>

                <div className="flex items-center gap-[0.5vw]">
                  {/* Status selector */}
                  <select
                    value={post.status || 'awaiting_admin'}
                    onChange={(e) => handleStatusUpdate(post.id, e.target.value)}
                    className="bg-[#f8f9fa] text-gray-800 border border-gray-200 rounded-[0.5vw] px-[0.65vw] py-[0.3vw] text-[0.72vw] font-medium outline-none cursor-pointer"
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
                    className={`p-[0.35vw] rounded-[0.4vw] border transition cursor-pointer ${
                      post.isPinned
                        ? 'bg-amber-50 text-amber-600 border-amber-300'
                        : 'bg-[#f8f9fa] hover:bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    <Pin size="0.9vw" className={post.isPinned ? 'fill-current' : ''} />
                  </button>

                  {/* Lock button */}
                  <button
                    onClick={() => handleToggleLock(post.id, post.isLocked)}
                    title={post.isLocked ? 'Unlock discussion' : 'Lock discussion'}
                    className={`p-[0.35vw] rounded-[0.4vw] border transition cursor-pointer ${
                      post.isLocked
                        ? 'bg-rose-50 text-rose-600 border-rose-300'
                        : 'bg-[#f8f9fa] hover:bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    <Lock size="0.9vw" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteDiscussion(post.id, post.title)}
                    title="Delete discussion"
                    className="p-[0.35vw] rounded-[0.4vw] text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 size="0.9vw" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-[0.98vw] font-medium text-gray-800">{post.title}</h3>
                <p className="text-[0.78vw] text-gray-600 mt-[0.2vw] leading-relaxed whitespace-pre-line font-normal">
                  {post.description}
                </p>
              </div>

              {/* Existing Official Reply (if any) */}
              {post.adminReply && (
                <div className="p-[1vw] rounded-[0.6vw] bg-[#fff8f6] border border-[#fecaca] space-y-[0.4vw]">
                  <div className="flex items-center justify-between text-[0.72vw]">
                    <div className="flex items-center gap-[0.4vw] text-[#ec5137] font-medium">
                      <ShieldCheck size="0.9vw" />
                      <span>Official Support Reply published:</span>
                    </div>
                    <span className="text-[0.7vw] text-gray-400 font-mono font-normal">
                      {new Date(post.adminReply.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[0.78vw] text-gray-800 leading-relaxed whitespace-pre-line pl-[1.3vw] font-normal">
                    {post.adminReply.content}
                  </p>
                </div>
              )}

              {/* Reply Accordion / Composer */}
              {activeReplyId === post.id ? (
                <div className="pt-[0.8vw] border-t border-gray-100 space-y-[0.7vw]">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.78vw] font-medium text-[#ec5137] flex items-center gap-[0.35vw]">
                      <Sparkles size="0.85vw" />
                      <span>Compose Official Engineering Response</span>
                    </span>
                    <div className="flex items-center gap-[0.4vw] text-[0.75vw]">
                      <span className="text-gray-500 font-normal">Set Status:</span>
                      <select
                        value={replyStatus}
                        onChange={(e) => setReplyStatus(e.target.value)}
                        className="bg-[#f8f9fa] border border-gray-200 rounded-[0.35vw] px-[0.5vw] py-[0.2vw] text-[0.72vw] text-gray-700 outline-none"
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
                    className="w-full p-[0.75vw] text-[0.78vw] bg-[#f8f9fa] border border-gray-200 rounded-[0.5vw] focus:outline-none focus:bg-white focus:border-[#ec5137] text-gray-800 resize-y transition"
                  />

                  <div className="flex justify-end gap-[0.5vw]">
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(null)}
                      className="px-[0.85vw] py-[0.42vw] rounded-[0.5vw] border border-gray-300 text-[0.78vw] font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendReply(post)}
                      disabled={!replyText.trim() || isSubmittingReply}
                      className="px-[1.05vw] py-[0.48vw] rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] text-white text-[0.78vw] font-medium transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-[0.35vw]"
                    >
                      <Send size="0.8vw" />
                      <span>{isSubmittingReply ? 'Publishing...' : 'Publish Official Reply'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-[0.6vw] border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[0.74vw] text-gray-400 font-normal">
                    {post.adminReply ? 'Revise or update response:' : 'Needs official review:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReplyId(post.id);
                      setReplyText(post.adminReply?.content || '');
                    }}
                    className="inline-flex items-center gap-[0.35vw] px-[0.85vw] py-[0.42vw] rounded-[0.5vw] bg-white hover:bg-gray-50 border border-gray-300 text-[0.78vw] font-medium text-[#ec5137] shadow-xs transition cursor-pointer active:scale-[0.98]"
                  >
                    <Send size="0.8vw" />
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
