// Frontend/src/pages/Forum/PostDetailView.jsx
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  Send 
} from 'lucide-react';
import { formatForumDate } from './utils';
import { useToast } from '../../components/CustomToast';

export default function PostDetailView({ 
  post, 
  allPosts = [],
  onBack, 
  onAddUserComment,
  currentUserId, 
  currentUser
}) {
  const toast = useToast();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!post) return null;

  // Group all questions by user so same user's questions appear in one single box
  const userGroups = useMemo(() => {
    // Collect all posts for the conversation context (or current user's posts)
    const authorKey = post.author?.email || post.author?.name || 'author';

    // Same author's posts
    const sameUserPosts = allPosts.filter(p => {
      const pKey = p.author?.email || p.author?.name;
      return pKey === authorKey;
    });

    const primaryList = sameUserPosts.length > 0 ? sameUserPosts : [post];

    // Other users' posts
    const otherUserPosts = allPosts.filter(p => {
      const pKey = p.author?.email || p.author?.name;
      return pKey && pKey !== authorKey;
    });

    // Group other users
    const otherGroups = [];
    otherUserPosts.forEach(p => {
      const k = p.author?.email || p.author?.name;
      const last = otherGroups[otherGroups.length - 1];
      if (last && last.authorKey === k) {
        last.posts.push(p);
      } else {
        otherGroups.push({
          authorKey: k,
          author: p.author,
          createdAt: p.createdAt,
          posts: [p]
        });
      }
    });

    return [
      {
        authorKey,
        author: post.author,
        createdAt: post.createdAt,
        posts: primaryList,
        isPrimary: true
      },
      ...otherGroups
    ];
  }, [post, allPosts]);

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
          avatarColor: '#0a6674'
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
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-white font-sans">
      {/* Top Header: "← Back to Flipbook" */}
      <header className="px-4 sm:px-6 pt-4 pb-3 border-b border-stone-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-stone-700 hover:text-[#ec5137] p-1 -ml-1 transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 className="text-base sm:text-base font-semibold text-stone-900 tracking-tight">
              Back to Flipbook
            </h1>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Share ideas, solve problems, and improve your workflow.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-3 sm:px-6 py-3.5 sm:py-4 space-y-3.5 sm:space-y-4 w-full">
        {userGroups.map((group, gIdx) => {
          const author = group.author;
          const authorInitials = author?.initials || (author?.name ? author.name.slice(0, 2).toUpperCase() : 'U');

          return (
            <div 
              key={group.authorKey || gIdx}
              className="bg-white border border-stone-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3.5 sm:space-y-4"
            >
              {/* Author Header Row - Rendered only ONCE per user box */}
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#7a1215] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-xs">
                    {authorInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-stone-900 text-xs sm:text-sm truncate">
                      {author?.name || 'Creator'}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">
                      {formatForumDate(group.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Save Button on primary user card */}
                {group.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setIsSaved(!isSaved)}
                    className="px-2.5 sm:px-3 py-1 rounded-lg border border-[#ec5137] text-[#ec5137] hover:bg-orange-50/50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Bookmark size={13} className={isSaved ? "fill-[#ec5137]" : ""} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                )}
              </div>

              {/* Stack of all questions submitted by this same user */}
              <div className="space-y-3">
                {group.posts.map((postItem, pIdx) => {
                  const hasAdminReply = postItem.adminReply && postItem.adminReply.content;
                  const isSecondary = pIdx > 0;

                  return (
                    <div 
                      key={postItem.id || pIdx} 
                      className={isSecondary ? "bg-[#FBFBFB] rounded-xl p-3 sm:p-3.5" : "pt-1"}
                    >
                      {/* Question Title */}
                      <h2 className="text-sm sm:text-[15px] font-semibold text-stone-900">
                        {postItem.title}
                      </h2>

                      {/* Question Description */}
                      <p className="mt-1.5 text-xs text-stone-500 leading-relaxed font-normal">
                        {postItem.description}
                      </p>

                      {/* Admin reply with L-shaped arrow */}
                      {hasAdminReply && (
                        <div className="mt-3 pl-1 sm:pl-4">
                          <div className="flex items-center gap-2 sm:gap-2.5">
                            {/* L-shaped Arrow SVG */}
                            <div className="w-5 h-7 sm:w-7 sm:h-8 -mt-3 sm:-mt-4 flex-shrink-0 relative">
                              <svg
                                className="w-full h-full overflow-visible"
                                viewBox="0 0 32 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M 2 0 V 26 H 26"
                                  stroke="#d1d5db"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M 21 21.5 L 26.5 26 L 21 30.5"
                                  stroke="#d1d5db"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>

                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0a6674] text-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold uppercase shrink-0 shadow-xs">
                              {postItem.adminReply.author?.initials || 'AD'}
                            </div>

                            <div>
                              <div className="text-xs font-semibold text-stone-900 leading-tight">
                                {postItem.adminReply.author?.name || 'Admin'}
                              </div>
                              <div className="text-[10px] text-stone-400 font-normal">
                                {formatForumDate(postItem.adminReply.createdAt || postItem.updatedAt)}
                              </div>
                            </div>
                          </div>

                          <div className="pl-7 sm:pl-[38px] mt-1.5">
                            <p className="text-xs text-stone-500 leading-relaxed font-normal">
                              {postItem.adminReply.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* 3. Reply Input Box */}
        <div className="bg-white border border-stone-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs">
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <label className="block text-xs font-semibold text-stone-800">
              Add a Comment or Follow-up Question
            </label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your reply or question here..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#ec5137] focus:bg-white transition-all resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Send size={14} />
                <span>{isSubmittingComment ? 'Posting...' : 'Post Reply'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
