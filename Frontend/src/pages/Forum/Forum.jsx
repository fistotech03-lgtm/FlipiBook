// Frontend/src/pages/Forum/Forum.jsx
import React, { useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Layers, 
  UserCheck, 
  Inbox, 
  AlertCircle, 
  Menu, 
  X, 
  Loader2 
} from 'lucide-react';
import ForumSidebar from './ForumSidebar';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import PostDetailView from './PostDetailView';
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

  const activeModule = useMemo(() => {
    return FORUM_MODULES.find(m => m.id === selectedModuleId) || FORUM_MODULES[0];
  }, [selectedModuleId]);

  // Count user's personal posts
  const myPostsCount = useMemo(() => {
    return posts.filter(p => p.author?.email === currentUserId || p.author?.name === currentUser?.name).length;
  }, [posts, currentUserId, currentUser]);

  const onSelectModuleFromSidebar = (modId) => {
    setSelectedModuleId(modId);
    setActiveArea('modules');
    setSearchQuery('');
    handleBackToList();
  };

  return (
    <div className="flex h-full w-full bg-[#fbfbfb] overflow-hidden relative font-sans select-none">
      {/* 1. Left Sidebar: MyFlipbooks Dark Theme with Smooth Open/Close Animation */}
      <div className="hidden sm:block h-full flex-shrink-0 transition-all duration-300 ease-in-out">
        <ForumSidebar
          selectedModuleId={selectedModuleId}
          onSelectModule={onSelectModuleFromSidebar}
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
              <span className="font-bold text-white text-sm">Modules & Feeds</span>
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
          onBack={handleBackToList}
          onAddUserComment={handleAddComment}
          onToggleSameQuestion={handleToggleVote}
          onDeletePost={handleDeletePost}
          currentUserId={currentUserId}
          currentUser={currentUser}
        />
      ) : (
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#fbfbfb]">
          {/* Top Main Forum Header (Matched to Ticket Header) */}
          <header className="bg-[#fbfbfb] px-[1.5vw] pt-[1.2vw] pb-[0.8vw] flex flex-col sm:flex-row sm:items-center justify-between gap-[0.8vw] flex-shrink-0">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-[0.6vw]">
                {/* Mobile Hamburger Button */}
                <button
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="sm:hidden p-1.5 -ml-1 text-stone-600 hover:text-[#ec5137] hover:bg-stone-200/60 rounded-[0.6vw] transition-colors cursor-pointer"
                  title="Open Modules"
                >
                  <Menu size={20} />
                </button>

                <div>
                  <h1 className="text-[1.35vw] text-lg font-bold text-stone-900 tracking-tight leading-tight">
                    Community Forum
                  </h1>
                  <p className="text-[0.78vw] text-xs text-stone-600 mt-[0.2vw] font-normal hidden sm:block">
                    Ask questions, share ideas, and connect with other creators
                  </p>
                </div>
              </div>
            </div>

            {/* Top Right Controls: Search & Ask Button (Ticket Rounded Style) */}
            <div className="flex items-center gap-[0.6vw] w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-[16vw]">
                <Search className="w-[0.9vw] h-[0.9vw] min-w-[14px] min-h-[14px] absolute left-[0.75vw] top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search discussions & ideas..."
                  className="w-full pl-[2.2vw] pr-[1.8vw] py-[0.45vw] bg-white border border-stone-300 rounded-[0.6vw] text-[0.78vw] text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#ec5137] focus:ring-1 focus:ring-[#ec5137]/20 shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-[0.6vw] top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-[0.78vw] cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Action Button: Ask Question or Suggest */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-[1vw] py-[0.55vw] rounded-[0.6vw] text-[0.82vw] text-xs font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] transition-all flex items-center justify-center gap-[0.45vw] cursor-pointer shadow-sm hover:shadow active:scale-[0.99] shrink-0"
              >
                <Plus className="w-[0.95vw] h-[0.95vw] min-w-[14px] min-h-[14px]" />
                <span>Ask Question or Suggest</span>
              </button>
            </div>
          </header>

          {/* Main Scrollable Content Area (Matched to Ticket Layout & Rounded Corner Cards) */}
          <div className="flex-1 overflow-y-auto px-[1.5vw] pb-[1.5vw] pt-0 space-y-[0.9vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* Filter Area - White Card Rounded like Ticket */}
            <div className="w-full bg-white rounded-[0.8vw] border border-stone-300 shadow-2xs p-[0.85vw]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.75vw]">
                {/* Segmented Tabs: All Discussions / My Posts */}
                <div className="flex items-center p-[0.25vw] bg-stone-100/90 rounded-[0.6vw] border border-stone-200/90 self-start sm:self-auto overflow-x-auto max-w-full shadow-2xs">
                  <button
                    onClick={() => {
                      setActiveArea('all');
                      handleBackToList();
                    }}
                    className={`flex items-center gap-[0.45vw] px-[0.8vw] py-[0.45vw] rounded-[0.45vw] text-[0.78vw] text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      activeArea === 'all'
                        ? 'bg-[#ec5137] text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Layers className="w-[0.9vw] h-[0.9vw] min-w-[13px] min-h-[13px]" />
                    <span>All Discussions</span>
                    <span className={`px-[0.45vw] py-[0.1vw] rounded-full text-[0.65vw] text-[10px] font-semibold ${
                      activeArea === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      {posts.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveArea('my_posts');
                      handleBackToList();
                    }}
                    className={`flex items-center gap-[0.45vw] px-[0.8vw] py-[0.45vw] rounded-[0.45vw] text-[0.78vw] text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      activeArea === 'my_posts'
                        ? 'bg-[#ec5137] text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <UserCheck className="w-[0.9vw] h-[0.9vw] min-w-[13px] min-h-[13px]" />
                    <span>My Posts</span>
                    {myPostsCount > 0 && (
                      <span className={`px-[0.45vw] py-[0.1vw] rounded-full text-[0.65vw] text-[10px] font-semibold ${
                        activeArea === 'my_posts'
                          ? 'bg-white/20 text-white'
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {myPostsCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Right Side: Sorting Toolbar & Counter */}
                <div className="flex items-center gap-[0.6vw] self-end sm:self-auto">
                  <span className="text-[0.75vw] text-xs text-stone-500 font-medium hidden md:inline">
                    Showing {posts.length} {posts.length === 1 ? 'discussion' : 'discussions'}
                  </span>

                  <div className="flex items-center p-[0.2vw] bg-stone-100 rounded-[0.5vw] border border-stone-200 shadow-2xs">
                    <button
                      onClick={() => setSortOrder('newest')}
                      className={`px-[0.6vw] py-[0.25vw] rounded-[0.4vw] text-[0.72vw] text-xs transition-all cursor-pointer ${
                        sortOrder === 'newest'
                          ? 'bg-white text-stone-900 font-semibold shadow-2xs border border-stone-300'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                      title="Shows newest discussions first"
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => setSortOrder('updated')}
                      className={`px-[0.6vw] py-[0.25vw] rounded-[0.4vw] text-[0.72vw] text-xs transition-all cursor-pointer ${
                        sortOrder === 'updated'
                          ? 'bg-white text-stone-900 font-semibold shadow-2xs border border-stone-300'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                      title="Shows recently replied discussions"
                    >
                      Recently Updated
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Discussions Feed / Empty State / List with Ticket Rounded Corner */}
            <div className="w-full space-y-[0.8vw]">
              {isLoading ? (
                <div className="py-20 text-center text-stone-500 bg-white rounded-[0.8vw] border border-stone-300 shadow-2xs">
                  <Loader2 size={28} className="animate-spin text-[#ec5137] mx-auto mb-3" />
                  <p className="text-[0.85vw] text-sm font-semibold text-stone-700">Loading discussions from server...</p>
                  <p className="text-[0.72vw] text-xs text-stone-400 mt-1">Fetching live forum data</p>
                </div>
              ) : loadError ? (
                <div className="py-12 text-center bg-white rounded-[0.8vw] border border-red-200 p-[1.5vw] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-2">
                    <AlertCircle size={20} />
                  </div>
                  <h3 className="text-[0.85vw] text-sm font-semibold text-stone-900">Failed to connect to forum server</h3>
                  <p className="text-[0.75vw] text-xs text-stone-500 mt-1">{loadError}</p>
                  <button
                    onClick={loadPosts}
                    className="mt-3 px-[1vw] py-[0.4vw] text-[0.78vw] text-xs font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] rounded-[0.5vw] cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelectPost={() => handleSelectPost(post.id)}
                  />
                ))
              ) : (
                /* Empty State Box matching Ticket rounded-[0.8vw] border border-stone-300 */
                <div className="py-16 text-center text-stone-500 bg-white rounded-[0.8vw] border border-stone-300 p-[2vw] shadow-2xs">
                  <div className="w-12 h-12 rounded-[0.8vw] bg-orange-50 text-[#ec5137] flex items-center justify-center mx-auto mb-3 border border-orange-100">
                    <Inbox size={24} />
                  </div>
                  <h3 className="text-[1vw] text-base font-semibold text-stone-900">
                    No discussions found
                  </h3>
                  <p className="text-[0.78vw] text-xs text-stone-500 mt-1 max-w-sm mx-auto font-normal">
                    {searchQuery 
                      ? `No results matching "${searchQuery}". Try a different keyword.` 
                      : activeArea === 'my_posts'
                        ? 'You have not submitted any questions or suggestions yet.'
                        : `No posts found under this filter for ${activeArea === 'modules' ? activeModule.name : 'the forum'}.`
                    }
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 px-[1.2vw] py-[0.55vw] rounded-[0.6vw] text-[0.82vw] text-xs font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    Create the first discussion
                  </button>
                </div>
              )}
            </div>

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
