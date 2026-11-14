// Frontend/src/pages/Forum/Forum.jsx
import React, { useMemo, useState } from 'react';
import { 
  Plus, 
  Inbox, 
  AlertCircle, 
  Menu, 
  X, 
  Loader2 
} from 'lucide-react';
import { Icon } from '@iconify/react';
import ForumSidebar from './ForumSidebar';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import PostDetailView from './PostDetailView';
import CustomDropdown from '../../components/CustomDropdown';
import { useForum } from './hooks';
import { FORUM_MODULES } from './data/forumData';

export default function Forum() {
  const {
    posts,
    isLoading,
    loadError,
    activeArea,
    setActiveArea,
    selectedModuleId,
    setSelectedModuleId,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedPostId,
    activePost,
    currentUser,
    currentUserId,
    moduleCounts,
    loadPosts,
    handleSelectPost,
    handleBackToList,
    handleCreatePost,
    handleToggleVote,
    handleAddComment,
    handleDeletePost
  } = useForum();

  // Sub-filter tabs inside feed (All | Suggestions | Questions)
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'suggestions' | 'questions'
  const [filterDropdown, setFilterDropdown] = useState('All'); // 'All' | 'Answered' | 'Unanswered'
  const [sortDropdown, setSortDropdown] = useState('Most Popular'); // 'Most Popular' | 'Newest' | 'Recently Updated'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const activeModule = useMemo(() => {
    return FORUM_MODULES.find(m => m.id === selectedModuleId) || FORUM_MODULES[0];
  }, [selectedModuleId]);

  const onSelectModuleFromSidebar = (modId) => {
    setSelectedModuleId(modId);
    setActiveArea('modules');
    setSearchQuery('');
    setCurrentPage(1);
    handleBackToList();
  };

  const onSelectAreaFromSidebar = (area) => {
    setActiveArea(area);
    setSearchQuery('');
    setCurrentPage(1);
    handleBackToList();
  };

  // Filter posts according to type filter, status filter, and sort
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter by type: 'suggestions' or 'questions'
    if (typeFilter === 'suggestions') {
      result = result.filter(p => p.postType === 'suggestion');
    } else if (typeFilter === 'questions') {
      result = result.filter(p => p.postType !== 'suggestion');
    }

    // Filter by dropdown status (Answered / Unanswered)
    if (filterDropdown === 'Answered') {
      result = result.filter(p => p.adminReply || p.status === 'answered' || (Array.isArray(p.comments) && p.comments.length > 0));
    } else if (filterDropdown === 'Unanswered') {
      result = result.filter(p => !p.adminReply && p.status !== 'answered');
    }

    // Sort order
    if (sortDropdown === 'Most Popular') {
      result.sort((a, b) => (b.viewsCount || b.sameQuestionCount || 0) - (a.viewsCount || a.sameQuestionCount || 0));
    } else if (sortDropdown === 'Newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortDropdown === 'Recently Updated') {
      result.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }

    return result;
  }, [posts, typeFilter, filterDropdown, sortDropdown]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / itemsPerPage));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPosts.slice(start, start + itemsPerPage);
  }, [filteredPosts, currentPage, itemsPerPage]);

  // Group consecutive posts by same author
  const groupedPosts = useMemo(() => {
    const groups = [];
    (paginatedPosts || []).forEach((post) => {
      if (!post) return;
      const authorKey = post.author?.email || post.author?.name || 'unknown';
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.authorKey === authorKey) {
        lastGroup.posts.push(post);
      } else {
        groups.push({
          authorKey,
          author: post.author,
          createdAt: post.createdAt,
          postType: post.postType,
          posts: [post]
        });
      }
    });
    return groups;
  }, [paginatedPosts]);

  return (
    <div className="flex h-full w-full bg-[#fafafa] overflow-hidden relative font-sans select-none">
      {/* 1. Left Sidebar: Dark Theme preserved */}
      <div className="hidden sm:block h-full flex-shrink-0 transition-all duration-300 ease-in-out">
        <ForumSidebar
          selectedModuleId={selectedModuleId}
          onSelectModule={onSelectModuleFromSidebar}
          activeArea={activeArea}
          onSelectArea={onSelectAreaFromSidebar}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          moduleCounts={moduleCounts}
        />
      </div>

      {/* Mobile Drawer (Left Sidebar on Mobile) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex">
          <div 
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-[clamp(260px,75vw,320px)] bg-[#151c28] h-full shadow-2xl flex flex-col z-10 text-white">
            <div className="p-3.5 border-b border-[#243042] flex items-center justify-between">
              <span className="font-bold text-white text-sm">Categories</span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ForumSidebar
                selectedModuleId={selectedModuleId}
                onSelectModule={(modId) => {
                  onSelectModuleFromSidebar(modId);
                  setIsMobileDrawerOpen(false);
                }}
                activeArea={activeArea}
                onSelectArea={(area) => {
                  onSelectAreaFromSidebar(area);
                  setIsMobileDrawerOpen(false);
                }}
                isCollapsed={false}
                moduleCounts={moduleCounts}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content View Area */}
      {activePost ? (
        <PostDetailView
          post={activePost}
          allPosts={posts}
          onBack={handleBackToList}
          onAddUserComment={handleAddComment}
          onToggleSameQuestion={handleToggleVote}
          onDeletePost={handleDeletePost}
          currentUserId={currentUserId}
          currentUser={currentUser}
        />
      ) : (
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
          {/* Top Header: Forum + Create Post button */}
          <header className="px-3 sm:px-6 pt-3.5 sm:pt-4 pb-3 flex items-center justify-between border-b border-stone-100 flex-shrink-0 bg-white gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile Menu trigger */}
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="sm:hidden p-1.5 -ml-1 text-stone-600 hover:text-[#ec5137] rounded-lg transition-colors cursor-pointer shrink-0"
                aria-label="Open categories menu"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-stone-900 tracking-tight truncate">
                  Forum
                </h1>
                <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5 truncate hidden xs:block">
                  Share ideas, solve problems, and improve your workflow.
                </p>
              </div>
            </div>

            {/* + Create Post button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Plus size={16} />
              <span className="hidden xs:inline">Create Post</span>
              <span className="xs:hidden">Post</span>
            </button>
          </header>

          {/* Subheader Toolbar & Discussions Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3.5 sm:py-4 space-y-3.5 sm:space-y-4">
            {/* Title & Toolbar Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              {/* Section Sub-heading */}
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 truncate">
                  {activeArea === 'all' 
                    ? 'All Discussions' 
                    : activeArea === 'favourites' 
                      ? 'Favourites' 
                      : activeArea === 'my_posts' 
                        ? 'My Posts' 
                        : activeModule.name}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5 hidden sm:block">
                  Share ideas, solve problems, and improve your workflow.
                </p>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                {/* Search Forum input */}
                <div className="relative flex-1 sm:flex-initial sm:w-56 md:w-64 min-w-[150px]">
                  <Icon 
                    icon="lineicons:search-2" 
                    className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#ec5137]" 
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search Forum..."
                    className="w-full pl-9 pr-7 py-1.5 sm:py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#ec5137] transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs p-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filters Dropdown */}
                <div className="flex items-center gap-1.5 border border-stone-200 rounded-lg px-2 sm:px-2.5 py-1 bg-white shadow-2xs">
                  <span className="text-[11px] sm:text-xs text-stone-600 font-medium whitespace-nowrap">Filters :</span>
                  <CustomDropdown
                    options={[
                      { value: 'All', label: 'All' },
                      { value: 'Answered', label: 'Answered' },
                      { value: 'Unanswered', label: 'Unanswered' }
                    ]}
                    value={filterDropdown}
                    onChange={(val) => {
                      setFilterDropdown(val);
                      setCurrentPage(1);
                    }}
                    width="w-[105px] sm:w-[115px]"
                    buttonClassName="!py-0.5 sm:!py-1 !px-2 !bg-[#F4F4F5] !border-transparent text-xs rounded-md text-stone-700 !shadow-none !ring-0"
                    itemClassName="hover:!bg-stone-100 !text-stone-700 font-normal"
                  />
                </div>

                {/* Sort by Dropdown */}
                <div className="flex items-center gap-1.5 border border-stone-200 rounded-lg px-2 sm:px-2.5 py-1 bg-white shadow-2xs">
                  <span className="text-[11px] sm:text-xs text-stone-600 font-medium whitespace-nowrap">Sort by :</span>
                  <CustomDropdown
                    options={[
                      { value: 'Most Popular', label: 'Most Popular' },
                      { value: 'Newest', label: 'Newest' },
                      { value: 'Recently Updated', label: 'Recently Updated' }
                    ]}
                    value={sortDropdown}
                    onChange={(val) => {
                      setSortDropdown(val);
                      setCurrentPage(1);
                    }}
                    width="w-[125px] sm:w-[135px]"
                    buttonClassName="!py-0.5 sm:!py-1 !px-2 !bg-[#F4F4F5] !border-transparent text-xs rounded-md text-stone-700 font-normal !shadow-none !ring-0"
                    itemClassName="hover:!bg-stone-100 !text-stone-700 font-normal"
                  />
                </div>
              </div>
            </div>

            {/* Filter Tabs Under Header: All | Suggestions | Questions */}
            <div className="flex items-center gap-4 sm:gap-6 border-b border-stone-100 text-xs font-medium overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('all');
                  setCurrentPage(1);
                }}
                className={`pb-2.5 transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'text-[#ec5137] border-b-2 border-[#ec5137] font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('suggestions');
                  setCurrentPage(1);
                }}
                className={`pb-2.5 transition-all cursor-pointer ${
                  typeFilter === 'suggestions'
                    ? 'text-[#ec5137] border-b-2 border-[#ec5137] font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Suggestions
              </button>
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('questions');
                  setCurrentPage(1);
                }}
                className={`pb-2.5 transition-all cursor-pointer ${
                  typeFilter === 'questions'
                    ? 'text-[#ec5137] border-b-2 border-[#ec5137] font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Questions
              </button>
            </div>

            {/* Discussion Feed Cards */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-20 text-center text-stone-500 bg-white rounded-xl border border-stone-100">
                  <Loader2 size={26} className="animate-spin text-[#ec5137] mx-auto mb-3" />
                  <p className="text-xs font-semibold text-stone-700">Loading discussions...</p>
                </div>
              ) : loadError ? (
                <div className="py-12 text-center bg-white rounded-xl border border-red-100 p-6">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-2">
                    <AlertCircle size={20} />
                  </div>
                  <h3 className="text-xs font-semibold text-stone-900">Failed to connect to forum server</h3>
                  <p className="text-xs text-stone-500 mt-1">{loadError}</p>
                  <button
                    onClick={loadPosts}
                    className="mt-3 px-4 py-1.5 text-xs font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] rounded-lg cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : paginatedPosts.length > 0 ? (
                groupedPosts.map((group, gIdx) => (
                  <PostCard
                    key={group.posts[0].id || gIdx}
                    group={group}
                    onSelectPost={handleSelectPost}
                  />
                ))
              ) : (
                <div className="py-16 text-center text-stone-500 bg-white rounded-xl border border-stone-100 p-8">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ec5137] flex items-center justify-center mx-auto mb-3 border border-orange-100">
                    <Inbox size={22} />
                  </div>
                  <h3 className="text-sm font-semibold text-stone-900">
                    No discussions found
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    {searchQuery 
                      ? `No results matching "${searchQuery}".` 
                      : `No posts available under this filter.`}
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] transition-all cursor-pointer shadow-xs"
                  >
                    Create the first post
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Controls - only show when there is more than 1 page and posts exist */}
            {!isLoading && !loadError && totalPages > 1 && (
              <div className="flex items-center justify-center pt-5 pb-4">
                <div className="inline-flex items-stretch border border-stone-200 rounded-md overflow-hidden bg-white shadow-2xs divide-x divide-stone-200">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#ec5137] text-white font-semibold'
                            : 'bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {currentPage < totalPages && (
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="px-3 h-8 flex items-center justify-center text-xs font-normal text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ask Question / Suggestion Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        targetModuleId={selectedModuleId}
        existingPosts={posts}
      />
    </div>
  );
}
