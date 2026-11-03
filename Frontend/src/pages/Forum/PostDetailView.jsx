// Frontend/src/pages/Forum/PostDetailView.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ThumbsUp, 
  Send,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Share2,
  Trash2,
  MessageSquare,
  Clock,
  CornerDownRight
} from 'lucide-react';
import { formatForumDate } from './utils';
import { useToast } from '../../components/CustomToast';

export default function PostDetailView({ 
  post, 
  onBack, 
  onAddUserComment,
  onToggleSameQuestion,
  onDeletePost,
  currentUserId, 
  currentUser
}) {
  const toast = useToast();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!post) return null;

  const isOwner = post.author?.email === currentUserId || 
                  post.author?.name === currentUser?.name;

  const isSuggestion = post.postType === 'suggestion';
  const authorInitials = post.author?.initials || (post.author?.name ? post.author.name.slice(0, 2).toUpperCase() : 'U');
  const avatarColor = post.author?.avatarColor || '#ec5137';

  const sameQuestionUsers = post.sameQuestionUsers || [];
  const hasSameQuestion = sameQuestionUsers.includes(currentUserId);
  const sameQuestionCount = sameQuestionUsers.length;

  // Unify all conversation items/comments into a single clean replies stream
  const replies = [];

  // Historical admin reply if present
  if (post.adminReply) {
    replies.push({
      id: post.adminReply.id || 'admin-initial',
      author: post.adminReply.author || { name: 'Support Team', initials: 'ST', avatarColor: '#ec5137' },
      content: post.adminReply.content,
      createdAt: post.adminReply.createdAt
    });
  }

  // Follow-ups if present
  if (Array.isArray(post.authorFollowUps)) {
    post.authorFollowUps.forEach((fu, idx) => {
      replies.push({
        id: fu.id || `fu-${idx}`,
        author: fu.author || { name: post.author?.name || 'Author', initials: authorInitials, avatarColor },
        content: fu.question,
        createdAt: fu.createdAt,
        isAuthor: true
      });
      if (fu.adminReply) {
        replies.push({
          id: fu.adminReply.id || `fu-reply-${idx}`,
          author: fu.adminReply.author || { name: 'Support Team', initials: 'ST', avatarColor: '#ec5137' },
          content: fu.adminReply.content,
          createdAt: fu.adminReply.createdAt
        });
      }
    });
  }

  // Community comments
  if (Array.isArray(post.comments)) {
    post.comments.forEach((c, idx) => {
      replies.push({
        id: c.id || c._id || `comment-${idx}`,
        author: c.author || { name: 'Community Member', initials: 'U', avatarColor: '#6366f1' },
        content: c.content,
        createdAt: c.createdAt
      });
    });
  }

  const handleCopyLink = () => {
    try {
      const url = `${window.location.origin}/forum?post=${post.id}`;
      navigator.clipboard?.writeText(url);
      setCopiedLink(true);
      if (toast?.showToast) toast.showToast('Discussion link copied!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      if (toast?.showToast) toast.showToast('Link copied!', 'success');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const newComment = {
        content: commentText.trim(),
        author: {
          name: currentUser?.name || currentUser?.email?.split('@')[0] || 'Community Member',
          email: currentUserId,
          initials: currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'ME',
          avatarColor: currentUser?.avatarBgColor || '#4f46e5'
        }
      };

      if (onAddUserComment) {
        await onAddUserComment(post.id, newComment);
      }
      setCommentText('');
      if (toast?.showToast) toast.showToast('Reply posted successfully!', 'success');
    } catch (err) {
      console.error('Error posting comment:', err);
      if (toast?.showToast) toast.showToast('Failed to post reply', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#fbfbfb]">
      {/* Top Header Bar */}
      <div className="px-[1.5vw] py-[0.8vw] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 border-b border-stone-200 bg-[#fbfbfb] sticky top-0 z-10 shadow-2xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-[clamp(12px,0.82vw,14px)] font-semibold text-stone-700 hover:text-[#ec5137] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 sm:w-[clamp(14px,0.9vw,17px)] sm:h-[clamp(14px,0.9vw,17px)]" />
          <span>Back to Forum</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-[clamp(8px,0.6vw,14px)] flex-wrap">
          {/* Share Link */}
          <button
            onClick={handleCopyLink}
            className="px-2.5 sm:px-[clamp(8px,0.6vw,13px)] py-1 sm:py-[clamp(4px,0.3vh,7px)] rounded-[0.6vw] border border-stone-300 hover:border-orange-200 hover:bg-orange-50/50 text-xs sm:text-[clamp(11px,0.72vw,13px)] font-medium text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-500" />
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>

          {/* Owner Deletion when no replies */}
          {isOwner && replies.length === 0 && (
            <button
              onClick={() => onDeletePost(post.id)}
              className="p-1 sm:p-[clamp(4px,0.3vw,7px)] rounded-[0.6vw] text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
              title="Delete discussion"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Module Badge */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-[clamp(8px,0.6vw,13px)] py-1 sm:py-[clamp(4px,0.3vh,7px)] rounded-[0.6vw] border border-orange-200 text-xs sm:text-[clamp(11px,0.72vw,13px)] font-semibold text-[#c23d26] bg-orange-50/70 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-[#ec5137]" />
            <span className="truncate max-w-[140px] sm:max-w-none">{post.moduleName}</span>
          </div>
        </div>
      </div>

      {/* Main Discussion Container */}
      <div className="w-full px-[1.5vw] py-[1.2vw] space-y-[1vw]">
        {/* 1. Original Post Card - Rounded like Ticket */}
        <div className="bg-white rounded-[0.8vw] border border-stone-300 p-[1.5vw] shadow-2xs space-y-[0.9vw]">
          {/* Top Meta Header */}
          <div className="flex items-center gap-2 sm:gap-[clamp(8px,0.6vw,14px)] flex-wrap text-xs sm:text-[clamp(11px,0.75vw,13px)]">
            {/* Post Type Tag */}
            <span className={`px-2.5 py-0.5 sm:px-[clamp(8px,0.55vw,12px)] sm:py-[clamp(3px,0.25vh,6px)] rounded-md sm:rounded-[clamp(4px,0.35vw,7px)] font-medium text-xs sm:text-[clamp(11px,0.72vw,13px)] border flex items-center gap-1.5 ${
              isSuggestion 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-orange-50 text-[#c23d26] border-orange-200'
            }`}>
              {isSuggestion ? <Lightbulb className="w-3 h-3 text-amber-600" /> : <HelpCircle className="w-3 h-3 text-[#ec5137]" />}
              <span>{isSuggestion ? 'Suggestion' : 'Question'}</span>
            </span>

            <span className="text-stone-500 font-normal">
              Posted by <strong className="text-stone-800 font-semibold">{post.author?.name}</strong> • {formatForumDate(post.createdAt)}
            </span>
          </div>

          {/* Post Header & Content */}
          <div className="flex items-start gap-3 sm:gap-[clamp(12px,0.9vw,18px)] pt-0.5">
            <div 
              className="w-9 h-9 sm:w-[clamp(36px,2.4vw,44px)] sm:h-[clamp(36px,2.4vw,44px)] rounded-full flex items-center justify-center text-white text-xs sm:text-[clamp(11px,0.75vw,13px)] font-semibold flex-shrink-0 shadow-xs ring-2 ring-orange-50"
              style={{ backgroundColor: avatarColor }}
            >
              {authorInitials}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-[clamp(18px,1.35vw,24px)] font-bold text-stone-900 leading-snug">
                {post.title}
              </h1>

              {/* Description directly follows Title */}
              <div className="pt-2 sm:pt-[clamp(8px,0.6vh,14px)] text-xs sm:text-[clamp(13px,0.88vw,16px)] text-stone-700 leading-relaxed font-normal whitespace-pre-line">
                {post.description}
              </div>
            </div>
          </div>

          {/* Action Row: "I have this question too" */}
          <div className="flex items-center justify-between pt-3 sm:pt-[clamp(10px,0.8vh,16px)] border-t border-stone-100 flex-wrap gap-2">
            <button
              onClick={() => onToggleSameQuestion(post.id)}
              className={`px-3 sm:px-[clamp(12px,0.9vw,18px)] py-1.5 sm:py-[clamp(6px,0.45vh,10px)] rounded-lg sm:rounded-[clamp(6px,0.45vw,10px)] border text-xs sm:text-[clamp(12px,0.82vw,14px)] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                hasSameQuestion 
                  ? 'bg-[#ec5137] text-white border-[#ec5137] shadow-xs' 
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-orange-50/50 hover:border-orange-200'
              }`}
              title="Click to indicate this is relevant to you as well"
            >
              <ThumbsUp className={`w-3.5 h-3.5 sm:w-[clamp(14px,0.9vw,17px)] sm:h-[clamp(14px,0.9vw,17px)] ${hasSameQuestion ? 'fill-current' : 'text-[#ec5137]'}`} />
              <span>{isSuggestion ? 'I want this too' : 'I have this question too'}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-xs sm:text-[clamp(11px,0.72vw,13px)] font-mono font-medium ${
                hasSameQuestion ? 'bg-[#d9442b] text-white' : 'bg-stone-100 text-stone-800'
              }`}>
                {sameQuestionCount}
              </span>
            </button>

            <span className="text-xs sm:text-[clamp(11px,0.7vw,13px)] text-stone-500 font-normal">
              Updated {formatForumDate(post.updatedAt || post.createdAt)}
            </span>
          </div>
        </div>

        {/* 2. Replies & Discussion Section - Rounded like Ticket */}
        <div className="bg-white rounded-[0.8vw] border border-stone-300 overflow-hidden shadow-2xs">
          <div className="bg-stone-50/80 px-3.5 sm:px-[clamp(14px,1.1vw,20px)] py-2.5 sm:py-[clamp(10px,0.65vh,14px)] border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#ec5137]" />
              <h3 className="text-xs sm:text-[clamp(13px,0.85vw,15px)] font-bold text-stone-900">
                Discussion & Community Replies
              </h3>
            </div>
            <span className="text-xs sm:text-[clamp(11px,0.72vw,13px)] text-stone-500 font-medium">
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </span>
          </div>

          <div className="p-3.5 sm:p-[clamp(16px,1.3vw,24px)] space-y-4 sm:space-y-[clamp(14px,1.1vh,20px)]">
            {/* List of Replies */}
            {replies.length > 0 ? (
              <div className="space-y-3 sm:space-y-[clamp(10px,0.7vh,16px)]">
                {replies.map((reply, idx) => {
                  const replyAuthorName = reply.author?.name || 'Community Member';
                  const replyInitials = reply.author?.initials || (replyAuthorName ? replyAuthorName.slice(0, 2).toUpperCase() : 'U');
                  const replyColor = reply.author?.avatarColor || '#ec5137';
                  const isPostAuthor = reply.author?.email === post.author?.email || replyAuthorName === post.author?.name;

                  return (
                    <div 
                      key={reply.id || idx}
                      className="p-3 sm:p-[clamp(12px,0.9vw,18px)] rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] border border-stone-200/90 bg-[#faf9f8] space-y-2 transition-colors hover:border-orange-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-7 h-7 sm:w-[clamp(28px,1.8vw,34px)] sm:h-[clamp(28px,1.8vw,34px)] rounded-full flex items-center justify-center text-white text-[10px] sm:text-[clamp(10px,0.68vw,12px)] font-semibold shadow-xs"
                            style={{ backgroundColor: replyColor }}
                          >
                            {replyInitials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-[clamp(12px,0.82vw,14px)] font-semibold text-stone-900">
                                {replyAuthorName}
                              </span>
                              {isPostAuthor && (
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-orange-100 text-[#c23d26] border border-orange-200">
                                  Author
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] sm:text-[clamp(10px,0.65vw,12px)] text-stone-500">
                              {formatForumDate(reply.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs sm:text-[clamp(12px,0.82vw,14px)] text-stone-800 leading-relaxed whitespace-pre-line pl-1 sm:pl-[clamp(30px,2vw,38px)] font-normal">
                        {reply.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 sm:py-[clamp(24px,2.5vh,40px)] text-center text-stone-500">
                <MessageSquare className="w-6 h-6 mx-auto text-stone-400 mb-2" />
                <h4 className="text-xs sm:text-[clamp(13px,0.85vw,15px)] font-semibold text-stone-800">No replies yet</h4>
                <p className="text-xs sm:text-[clamp(11px,0.72vw,13px)] text-stone-500 mt-1 max-w-md mx-auto font-normal">
                  Be the first to share your thoughts, answer this question, or suggest a workaround.
                </p>
              </div>
            )}

            {/* Reply Composer Form */}
            <form onSubmit={handleCommentSubmit} className="pt-4 sm:pt-[clamp(12px,1vh,18px)] border-t border-stone-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs sm:text-[clamp(11px,0.75vw,13px)] font-semibold text-stone-800">
                <CornerDownRight className="w-3.5 h-3.5 text-[#ec5137]" />
                <span>Join the conversation:</span>
              </div>

              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your experience, solution, or thoughts..."
                className="w-full p-3 sm:p-[clamp(10px,0.8vw,16px)] text-xs sm:text-[clamp(12px,0.82vw,14px)] border border-stone-300 rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] focus:outline-none focus:ring-2 focus:ring-[#ec5137]/20 focus:border-[#ec5137] text-stone-800 placeholder-stone-400"
              />

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] sm:text-[clamp(10px,0.68vw,12px)] text-stone-500">
                  Please be respectful and helpful to other community members.
                </span>

                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="px-4 sm:px-[clamp(14px,1.1vw,20px)] py-1.5 sm:py-[clamp(6px,0.45vh,10px)] rounded-lg sm:rounded-[clamp(6px,0.45vw,10px)] text-xs sm:text-[clamp(12px,0.82vw,14px)] font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingComment ? 'Posting...' : 'Post Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
