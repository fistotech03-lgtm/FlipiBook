// Frontend/src/pages/Forum/PostCard.jsx
import React, { useState } from 'react';
import { 
  Bookmark, 
  ChevronDown 
} from 'lucide-react';
import { formatForumDate } from './utils';

export default function PostCard({ 
  group, 
  post: singlePost,
  onSelectPost
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Normalize whether passed as group or single post
  const postsList = group ? group.posts : [singlePost];
  const primaryPost = postsList[0];
  if (!primaryPost) return null;

  const author = group ? group.author : primaryPost.author;
  const authorInitials = author?.initials || (author?.name ? author.name.slice(0, 2).toUpperCase() : 'U');
  const isSuggestion = (group ? group.postType : primaryPost.postType) === 'suggestion';

  // Count all replies across the user's questions in this card
  let totalComments = 0;
  postsList.forEach(p => {
    if (p.adminReply && p.adminReply.content) totalComments += 1;
    if (Array.isArray(p.authorFollowUps)) {
      p.authorFollowUps.forEach(fu => {
        if (fu.adminReply && fu.adminReply.content) totalComments += 1;
      });
    }
    if (Array.isArray(p.comments)) totalComments += p.comments.length;
  });

  return (
    <article className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 transition-all hover:shadow-xs">
      {/* Top Author Header (Only once per user card, matching screenshot 2) */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {/* Avatar circle */}
          <div className="w-9 h-9 rounded-full bg-[#7a1215] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-xs">
            {authorInitials}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-stone-900 text-xs sm:text-sm">
                {author?.name || 'Anonymous Creator'}
              </span>

              {/* Tag (Questions / Suggestions) */}
              <span className="px-2 py-0.5 rounded-full border border-sky-400 text-sky-600 text-[11px] font-medium">
                {isSuggestion ? 'Suggestions' : 'Questions'}
              </span>

              {/* Status indicator icon (Green circle with dot) */}
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
            </div>

            <div className="text-[11px] text-stone-400 mt-0.5">
              {formatForumDate(primaryPost.createdAt)}
            </div>
          </div>
        </div>

        {/* Right Bookmark Action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsBookmarked(!isBookmarked);
          }}
          className="text-stone-400 hover:text-[#ec5137] transition-colors p-1 rounded-md"
          title={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
        >
          <Bookmark 
            size={16} 
            className={isBookmarked ? "fill-[#ec5137] text-[#ec5137]" : "text-[#ec5137]"} 
          />
        </button>
      </div>

      {/* List of Questions by this User inside the same box */}
      <div className="space-y-3.5 mt-3.5">
        {postsList.map((postItem, pIdx) => {
          // Gather comments for this question
          const replies = [];
          if (postItem.adminReply && postItem.adminReply.content) {
            replies.push({
              id: postItem.adminReply.id || 'admin-main',
              author: postItem.adminReply.author?.name || 'Admin',
              initials: postItem.adminReply.author?.initials || 'AD',
              content: postItem.adminReply.content,
              createdAt: postItem.adminReply.createdAt || postItem.updatedAt
            });
          }
          if (Array.isArray(postItem.authorFollowUps)) {
            postItem.authorFollowUps.forEach((fu, idx) => {
              if (fu.adminReply && fu.adminReply.content) {
                replies.push({
                  id: fu.adminReply.id || `fu-${idx}`,
                  author: fu.adminReply.author?.name || 'Admin',
                  initials: fu.adminReply.author?.initials || 'AD',
                  content: fu.adminReply.content,
                  createdAt: fu.adminReply.createdAt
                });
              }
            });
          }

          // From second question onwards: wrap in a light rounded box without border stroke as in screenshot
          const isSecondary = pIdx > 0;

          return (
            <div 
              key={postItem.id || pIdx} 
              className={isSecondary ? "bg-[#FBFBFB] rounded-xl p-3.5 sm:p-4" : ""}
            >
              {/* Question Title */}
              <h3 
                onClick={() => onSelectPost(postItem.id)}
                className="text-sm sm:text-[15px] font-semibold text-stone-900 hover:text-[#ec5137] cursor-pointer transition-colors"
              >
                {postItem.title}
              </h3>

              {/* Question Description */}
              <p className="mt-1.5 text-xs text-stone-500 leading-relaxed font-normal">
                {postItem.description}
              </p>

              {/* Admin Reply with Arrow pointing straight to avatar */}
              {replies.length > 0 && (
                <div className="mt-3 pt-1">
                  {replies.slice(0, 1).map((reply, idx) => (
                    <div key={reply.id || idx} className="pl-3.5 sm:pl-5">
                      <div className="flex items-center gap-2.5">
                        {/* L-shaped Arrow */}
                        <div className="w-7 h-8 -mt-4 flex-shrink-0 relative">
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

                        {/* Admin Avatar */}
                        <div className="w-7 h-7 rounded-full bg-[#0a6674] text-white flex items-center justify-center text-[10px] font-bold uppercase shrink-0 shadow-xs">
                          {reply.initials || 'AD'}
                        </div>

                        {/* Admin Name & Time */}
                        <div>
                          <div className="text-xs font-semibold text-stone-900 leading-tight">
                            {reply.author}
                          </div>
                          {reply.createdAt && (
                            <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                              {formatForumDate(reply.createdAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reply Text */}
                      <div className="pl-[38px] mt-1.5">
                        <p className="text-xs text-stone-500 leading-relaxed font-normal">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Footer: View Comments (X) */}
      <div className="mt-4 pt-2.5 border-t border-stone-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onSelectPost(primaryPost.id)}
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 font-normal cursor-pointer transition-colors"
        >
          <span>
            {totalComments > 0 
              ? `View Comments(${totalComments})` 
              : 'View Comments'}
          </span>
          <ChevronDown size={14} />
        </button>
      </div>
    </article>
  );
}
