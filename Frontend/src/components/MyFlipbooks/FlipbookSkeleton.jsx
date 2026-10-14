import React from 'react';
import { motion } from 'framer-motion';

/**
 * Single Flipbook Card Skeleton matching the exact layout and aspect-ratio of FlipbookCard
 */
export function FlipbookCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-[0.9vw] p-[0.9vw] flex gap-[1.2vw] items-center border border-gray-100 shadow-xs select-none">
      {/* Thumbnail placeholder (matches 7.6vw x 5.7vw aspect 4:3) */}
      <div className="w-[7.6vw] h-[5.7vw] aspect-[4/3] rounded-[0.6vw] bg-gradient-to-br from-gray-100 via-gray-200/70 to-gray-100 animate-pulse flex-shrink-0 relative overflow-hidden flex items-center justify-center">
        <div className="w-[2vw] h-[2vw] rounded bg-gray-300/40" />
      </div>

      {/* Book details & metadata */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-[0.1vw] gap-[0.6vw]">
        {/* Title + Badges row */}
        <div className="flex items-center gap-[0.8vw]">
          <div className="h-[1.1vw] w-[14vw] rounded-[0.3vw] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          <div className="h-[1.1vw] w-[4.5vw] rounded-full bg-gray-100 animate-pulse" />
        </div>

        {/* Folder & Date row */}
        <div className="flex items-center gap-[1vw]">
          <div className="h-[0.75vw] w-[6.5vw] rounded-[0.2vw] bg-gray-100 animate-pulse" />
          <div className="h-[0.75vw] w-[9vw] rounded-[0.2vw] bg-gray-100 animate-pulse" />
        </div>

        {/* Stats chips row (Pages, Size, Views) */}
        <div className="flex items-center gap-[1vw] pt-[0.2vw]">
          <div className="h-[0.7vw] w-[4.5vw] rounded bg-gray-100 animate-pulse" />
          <div className="h-[0.7vw] w-[5vw] rounded bg-gray-100 animate-pulse" />
          <div className="h-[0.7vw] w-[4vw] rounded bg-gray-100 animate-pulse" />
        </div>
      </div>

      {/* Action buttons placeholder */}
      <div className="flex items-center gap-[0.4vw] pr-[0.5vw]">
        <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-gray-100 animate-pulse" />
        <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-gray-100 animate-pulse" />
        <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-gray-100 animate-pulse" />
        <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * List of Card Skeletons with subtle staggered fade-in animation
 */
export function FlipbookSkeletonList({ count = 5 }) {
  return (
    <div className="flex-1 pr-[0.3vw] pb-[2vw] space-y-[0.85vw] min-h-0">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={`skeleton-card-${index}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.05 }}
        >
          <FlipbookCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Folder Sidebar Skeleton
 */
export function FolderSkeleton({ count = 4 }) {
  return (
    <div className="space-y-[0.3vw] py-[0.3vw]">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-folder-${index}`}
          className="flex items-center gap-[0.6vw] px-[0.75vw] py-[0.55vw] rounded-[0.5vw] bg-gray-50/70"
        >
          <div className="w-[1.1vw] h-[1.1vw] rounded bg-gray-200/80 animate-pulse flex-shrink-0" />
          <div
            className="h-[0.8vw] rounded bg-gray-200/70 animate-pulse"
            style={{ width: `${4.5 + (index % 3) * 1.5}vw` }}
          />
        </div>
      ))}
    </div>
  );
}

export default FlipbookSkeletonList;
