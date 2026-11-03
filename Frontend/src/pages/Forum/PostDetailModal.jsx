// Frontend/src/pages/Forum/PostDetailModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  ArrowBigUp, 
  ArrowBigDown, 
  Check, 
  CheckCircle2, 
  Share2, 
  MessageSquare
} from 'lucide-react';
import { formatForumDate } from './utils';

export default function PostDetailModal({ 
  post, 
  isOpen, 
  onClose, 
  onVotePost, 
  onVoteComment, 
  onAddComment, 
  onToggleSolved,
  currentUserId,
  currentUser 
}) {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !post) return null;

  const isUpvoted = post.upvotedBy && post.upvotedBy.includes(currentUserId);
  const isDownvoted = post.downvotedBy && post.downvotedBy.includes(currentUserId);
  const isSolved = post.status === 'resolved' || post.hasAcceptedSolution;

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    const newComment = {
      id: `c-${Date.now()}`,
      author: {
        name: currentUser?.name || currentUser?.email?.split('@')[0] || 'Community Member',
        username: currentUser?.email?.split('@')[0] || 'user',
        email: currentUser?.email || currentUser?.emailId || 'user@example.com',
        avatarColor: currentUser?.avatarBgColor || '#2563eb',
        role: 'Community Member'
      },
      createdAt: 'Just now',
      content: replyText.trim(),
      isAcceptedAnswer: false,
      votes: 0,
      upvotedBy: [],
      downvotedBy: []
    };

    setTimeout(() => {
      if (onAddComment) onAddComment(post.id, newComment);
      setReplyText('');
      setIsSubmitting(false);
    }, 200);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-[clamp(12px,1.5vw,24px)] bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl sm:rounded-[0.8vw] shadow-2xl w-full max-w-[clamp(320px,58vw,880px)] max-h-[92vh] flex flex-col overflow-hidden border border-stone-300"
        role="dialog"
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-[clamp(16px,1.4vw,24px)] py-3 sm:py-[clamp(10px,0.7vh,16px)] border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[clamp(10px,0.68vw,12px)] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700">
              {post.moduleName}
            </span>
            {isSolved && (
              <span className="text-[10px] sm:text-[clamp(10px,0.68vw,12px)] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Check size={12} className="text-emerald-600 stroke-[3]" />
                Accepted Solution
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-2.5 sm:px-[clamp(10px,0.7vw,14px)] py-1 sm:py-[clamp(4px,0.3vh,7px)] rounded-lg border border-gray-200 text-xs sm:text-[clamp(11px,0.7vw,13px)] font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 size={13} />
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            {onToggleSolved && (
              <button
                onClick={() => onToggleSolved(post.id)}
                className={`px-2.5 sm:px-[clamp(10px,0.7vw,14px)] py-1 sm:py-[clamp(4px,0.3vh,7px)] rounded-lg border text-xs sm:text-[clamp(11px,0.7vw,13px)] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSolved 
                    ? 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70' 
                    : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-100'
                }`}
              >
                <CheckCircle2 size={13} className={isSolved ? 'text-emerald-600' : 'text-gray-400'} />
                <span>{isSolved ? 'Marked Solved' : 'Mark as Solved'}</span>
              </button>
            )}

            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-200/60 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Thread Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-[clamp(16px,1.5vw,26px)] space-y-4 sm:space-y-[clamp(14px,1.1vh,20px)]">
          {/* Question Title & Meta Header */}
          <div className="border-b border-gray-200 pb-3 sm:pb-[clamp(10px,0.8vh,16px)]">
            <h1 className="text-base sm:text-[clamp(18px,1.3vw,24px)] font-bold text-gray-950 leading-snug">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-[clamp(11px,0.7vw,13px)] text-gray-500 mt-2">
              <span>Asked <strong className="text-gray-700">{formatForumDate(post.createdAt)}</strong></span>
              <span>•</span>
              <span>Module <strong className="text-gray-700">{post.moduleName}</strong></span>
            </div>
          </div>

          {/* Question Body */}
          <div className="flex gap-3 sm:gap-[clamp(12px,1vw,18px)] items-start">
            {/* Left Voting Column */}
            <div className="flex flex-col items-center bg-gray-50/80 p-1.5 rounded-xl border border-gray-200/80 flex-shrink-0">
              <button
                onClick={() => onVotePost && onVotePost(post.id, 1)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isUpvoted ? 'text-[#ec5137] bg-orange-100' : 'text-gray-400 hover:text-[#ec5137]'
                }`}
              >
                <ArrowBigUp className="w-5 h-5 sm:w-[clamp(20px,1.5vw,26px)] sm:h-[clamp(20px,1.5vw,26px)]" />
              </button>

              <span className="text-xs sm:text-[clamp(12px,0.85vw,15px)] font-bold my-1 text-gray-800 select-none">
                {post.votes ?? (post.sameQuestionCount || 0)}
              </span>

              <button
                onClick={() => onVotePost && onVotePost(post.id, -1)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDownvoted ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-blue-600'
                }`}
              >
                <ArrowBigDown className="w-5 h-5 sm:w-[clamp(20px,1.5vw,26px)] sm:h-[clamp(20px,1.5vw,26px)]" />
              </button>
            </div>

            {/* Main Question Body */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="text-xs sm:text-[clamp(13px,0.88vw,16px)] text-gray-800 leading-relaxed whitespace-pre-line">
                {post.description}
              </div>

              {/* Author signature box */}
              <div className="flex justify-end pt-2">
                <div className="bg-orange-50/50 border border-orange-200/50 rounded-xl p-2.5 w-48 sm:w-[clamp(180px,14vw,230px)] flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0"
                    style={{ backgroundColor: post.author?.avatarColor || '#ec5137' }}
                  >
                    {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 block">{formatForumDate(post.createdAt)}</span>
                    <span className="text-xs font-bold text-gray-900 truncate block">
                      {post.author?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="border-t border-gray-200 pt-4 sm:pt-[clamp(12px,1vh,18px)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-[clamp(14px,1vw,17px)] font-bold text-gray-950 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#ec5137]" />
                <span>{post.comments ? post.comments.length : 0} Answers</span>
              </h2>
            </div>

            {/* Answers List */}
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-3">
                {post.comments.map((comment, cIdx) => (
                  <div 
                    key={comment.id || cIdx}
                    className="p-3 sm:p-[clamp(12px,0.9vw,18px)] rounded-xl border bg-white border-gray-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: comment.author?.avatarColor || '#2563eb' }}
                        >
                          {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="text-xs font-semibold text-gray-800">{comment.author?.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{formatForumDate(comment.createdAt)}</span>
                    </div>

                    <div className="text-xs sm:text-[clamp(12px,0.82vw,14px)] text-gray-800 leading-relaxed whitespace-pre-line pl-1 font-normal">
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-xs sm:text-[clamp(11px,0.75vw,13px)]">
                Know the answer or have a troubleshooting step? Be the first to help below!
              </div>
            )}

            {/* Answer Box */}
            <form onSubmit={handleReplySubmit} className="mt-4 pt-3 border-t border-gray-200 space-y-2.5">
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your explanation or step-by-step solution here..."
                className="w-full p-3 text-xs sm:text-[clamp(12px,0.82vw,14px)] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ec5137]/30 focus:border-[#ec5137] transition-all resize-y"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSubmitting}
                  className="px-4 py-2 sm:px-[clamp(14px,1vw,20px)] sm:py-[clamp(6px,0.45vh,10px)] rounded-xl font-bold text-xs sm:text-[clamp(12px,0.82vw,14px)] text-white bg-[#ec5137] hover:bg-[#d9442b] transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Your Answer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
