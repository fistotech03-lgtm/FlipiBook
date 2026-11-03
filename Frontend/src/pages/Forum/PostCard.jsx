// Frontend/src/pages/Forum/PostCard.jsx
import React from 'react';
import { 
  MessageSquare, 
  ChevronRight,
  HelpCircle,   
  Lightbulb,
  Clock
} from 'lucide-react';
import { formatForumDate } from './utils';

export default function PostCard({ 
  post, 
  onSelectPost
}) {
  const authorInitials = post.author?.initials || (post.author?.name ? post.author.name.slice(0, 2).toUpperCase() : 'U');
  const avatarColor = post.author?.avatarColor || '#ec5137';
  const isSuggestion = post.postType === 'suggestion';

  const typeClass = isSuggestion
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-orange-50 text-[#c23d26] border-orange-200';

  // Assemble all replies for preview in the card
  const replies = [];

  if (post.adminReply) {
    replies.push({
      id: post.adminReply.id || 'admin-initial',
      author: post.adminReply.author?.name || 'Support Team',
      initials: post.adminReply.author?.initials || 'ST',
      avatarColor: post.adminReply.author?.avatarColor || '#ec5137',
      content: post.adminReply.content,
      createdAt: post.adminReply.createdAt
    });
  }

  if (Array.isArray(post.authorFollowUps)) {
    post.authorFollowUps.forEach((fu, idx) => {
      replies.push({
        id: fu.id || `fu-${idx}`,
        author: fu.author?.name || post.author?.name || 'Author',
        initials: fu.author?.initials || authorInitials,
        avatarColor: fu.author?.avatarColor || avatarColor,
        content: fu.question,
        createdAt: fu.createdAt
      });
      if (fu.adminReply) {
        replies.push({
          id: fu.adminReply.id || `fu-rep-${idx}`,
          author: fu.adminReply.author?.name || 'Support Team',
          initials: fu.adminReply.author?.initials || 'ST',
          avatarColor: fu.adminReply.author?.avatarColor || '#ec5137',
          content: fu.adminReply.content,
          createdAt: fu.adminReply.createdAt
        });
      }
    });
  }

  if (Array.isArray(post.comments)) {
    post.comments.forEach((c, idx) => {
      replies.push({
        id: c.id || c._id || `comment-${idx}`,
        author: c.author?.name || 'Community Member',
        initials: c.author?.initials || 'U',
        avatarColor: c.author?.avatarColor || '#6366f1',
        content: c.content,
        createdAt: c.createdAt
      });
    });
  }

  const totalReplies = replies.length;
  const visibleReplies = replies.slice(0, 2);
  const hasMoreReplies = totalReplies > 2;

  return (
    <article
      onClick={() => onSelectPost(post)}
      className="group bg-white hover:bg-[#fffdfd] p-3.5 sm:p-[clamp(14px,1.1vw,20px)] rounded-xl sm:rounded-[0.8vw] border border-stone-300 hover:border-[#ec5137]/50 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs"
    >
      <div className="flex items-start gap-3 sm:gap-[clamp(12px,0.9vw,18px)]">
        {/* Author Avatar */}
        <div 
          className="w-9 h-9 sm:w-[clamp(36px,2.3vw,44px)] sm:h-[clamp(36px,2.3vw,44px)] rounded-full flex items-center justify-center text-white text-xs sm:text-[clamp(11px,0.75vw,13px)] font-semibold flex-shrink-0 shadow-xs ring-2 ring-orange-100/80"
          style={{ backgroundColor: avatarColor }}
        >
          {authorInitials}
        </div>

        {/* Main Post Content */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Author & Time on Left, Type Tag on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-[clamp(6px,0.5vw,12px)] mb-1.5 sm:mb-[clamp(6px,0.4vh,10px)]">
            <div className="flex items-center gap-2 text-xs sm:text-[clamp(12px,0.82vw,14px)] text-stone-600 truncate min-w-0">
              <span className="font-semibold text-stone-900 truncate">{post.author?.name}</span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-500 font-normal shrink-0 text-[11px] sm:text-[clamp(10px,0.7vw,12px)]">
                {formatForumDate(post.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-[clamp(6px,0.4vw,10px)] flex-wrap shrink-0">
              <div className={`inline-flex items-center gap-1 px-2.5 py-1 sm:px-[clamp(8px,0.55vw,12px)] sm:py-[clamp(3px,0.25vh,6px)] rounded-md sm:rounded-[clamp(4px,0.35vw,7px)] text-xs sm:text-[clamp(11px,0.72vw,13px)] font-medium border ${typeClass}`}>
                {isSuggestion ? (
                  <Lightbulb className="w-3 h-3 sm:w-[clamp(12px,0.75vw,14px)] sm:h-[clamp(12px,0.75vw,14px)] text-amber-600" />
                ) : (
                  <HelpCircle className="w-3 h-3 sm:w-[clamp(12px,0.75vw,14px)] sm:h-[clamp(12px,0.75vw,14px)] text-[#ec5137]" />
                )}
                <span>{isSuggestion ? 'Suggestion' : 'Question'}</span>
              </div>

              <div className="hidden sm:block text-stone-300 group-hover:text-[#ec5137] transition-colors ml-0.5">
                <ChevronRight className="w-4 h-4 sm:w-[clamp(14px,0.9vw,17px)] sm:h-[clamp(14px,0.9vw,17px)]" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-[clamp(14px,1.05vw,18px)] font-semibold text-stone-900 group-hover:text-[#ec5137] transition-colors leading-snug">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-[clamp(12px,0.82vw,14px)] text-stone-600 line-clamp-2 mt-1 sm:mt-[clamp(4px,0.3vh,8px)] leading-relaxed font-normal">
            {post.description}
          </p>

          {/* Conversation Preview in Card (Up to 2 replies) */}
          {visibleReplies.length > 0 && (
            <div className="mt-3 pt-2.5 sm:mt-[clamp(10px,0.8vh,16px)] sm:pt-[clamp(8px,0.6vh,14px)] border-t border-stone-100 space-y-2">
              <div className="text-[11px] sm:text-[clamp(10px,0.68vw,12px)] font-semibold tracking-wide uppercase text-stone-400 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-[#ec5137]" />
                <span>Recent Discussion</span>
              </div>

              <div className="space-y-1.5 sm:space-y-[clamp(6px,0.4vh,10px)]">
                {visibleReplies.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-2 sm:p-[clamp(8px,0.6vw,12px)] rounded-lg sm:rounded-[clamp(6px,0.5vw,10px)] border border-stone-200/80 bg-stone-50/70 text-xs sm:text-[clamp(11px,0.75vw,13px)] text-stone-700"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                          style={{ backgroundColor: item.avatarColor }}
                        >
                          {item.initials}
                        </span>
                        <span className="font-semibold text-stone-800">{item.author}</span>
                      </div>
                      {item.createdAt && (
                        <span className="text-[10px] text-stone-400 font-normal">
                          {formatForumDate(item.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-stone-700 pl-5 leading-relaxed font-normal">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>

              {hasMoreReplies && (
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPost(post);
                    }}
                    className="text-xs sm:text-[clamp(11px,0.72vw,13px)] font-semibold text-[#ec5137] hover:text-[#c23d26] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all {totalReplies} replies</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center justify-between pt-2.5 sm:pt-[clamp(8px,0.6vh,14px)] mt-2.5 sm:mt-[clamp(8px,0.6vh,14px)] text-xs sm:text-[clamp(11px,0.72vw,13px)] text-stone-500 border-t border-stone-100">
            <div className="flex items-center gap-1.5 text-stone-500 font-normal">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Updated {formatForumDate(post.updatedAt || post.createdAt)}</span>
            </div>

            {totalReplies > 0 ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 group-hover:bg-white text-stone-700 border border-stone-200/80 font-medium">
                <MessageSquare className="w-3 h-3 text-[#ec5137]" />
                <span>{totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}</span>
              </span>
            ) : (
              <span className="text-stone-400">No replies yet</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
