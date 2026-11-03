import { useState, useEffect, useMemo, useCallback } from 'react';
import { FORUM_MODULES } from '../data/forumData';
import { 
  fetchForumPosts, 
  fetchPostById, 
  createPostApi, 
  toggleVoteApi, 
  addCommentApi, 
  deletePostApi 
} from '../../../api/forumApi';
import { useToast } from '../../../components/CustomToast';
import { useAuth } from '../../../context/AuthContext';

export function useForum() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  
  // Primary Forum Navigation Areas: 'all' | 'modules' | 'my_posts'
  const [activeArea, setActiveArea] = useState('all'); 
  const [selectedModuleId, setSelectedModuleId] = useState('my-flipbooks');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // Sorting: 'newest' | 'updated'
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Navigation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [activePost, setActivePost] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const toast = useToast();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.email || currentUser?.emailId || 'current_user';

  // Central function to load posts from Backend
  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const queryParams = {
        area: activeArea,
        moduleId: activeArea === 'modules' ? selectedModuleId : undefined,
        sort: sortOrder,
        search: searchQuery.trim() || undefined,
        userEmail: currentUserId
      };
      const res = await fetchForumPosts(queryParams);
      setPosts(res.posts || []);
    } catch (err) {
      console.error('[Forum loadPosts error]:', err);
      setLoadError(err.message || 'Failed to load forum discussions from server');
    } finally {
      setIsLoading(false);
    }
  }, [activeArea, selectedModuleId, sortOrder, searchQuery, currentUserId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Load individual post when selected
  useEffect(() => {
    if (!selectedPostId) {
      setActivePost(null);
      return;
    }

    const localMatch = posts.find(p => p.id === selectedPostId);
    if (localMatch) {
      setActivePost(localMatch);
    }

    let isMounted = true;
    setIsLoadingDetail(true);
    fetchPostById(selectedPostId, currentUserId)
      .then(fetchedPost => {
        if (isMounted && fetchedPost) {
          setActivePost(fetchedPost);
          setPosts(prev => prev.map(p => p.id === fetchedPost.id ? fetchedPost : p));
        }
      })
      .catch(err => {
        console.warn('Error fetching post by ID:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => { isMounted = false; };
  }, [selectedPostId, currentUserId]);

  // Check URL query on initial mount (for direct link sharing)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlPostId = params.get('post');
      if (urlPostId) {
        setSelectedPostId(urlPostId);
      }
    } catch (e) {}
  }, []);

  // Counts of posts per module for sidebar badge
  const moduleCounts = useMemo(() => {
    const counts = {};
    FORUM_MODULES.forEach(m => {
      counts[m.id] = posts.filter(p => p.moduleId === m.id).length;
    });
    return counts;
  }, [posts]);

  // Handlers
  const handleSelectPost = (postId) => {
    setSelectedPostId(postId);
    try {
      const url = new URL(window.location);
      url.searchParams.set('post', postId);
      window.history.pushState({}, '', url);
    } catch (e) {}
  };

  const handleBackToList = () => {
    setSelectedPostId(null);
    setActivePost(null);
    try {
      const url = new URL(window.location);
      url.searchParams.delete('post');
      window.history.pushState({}, '', url);
    } catch (e) {}
  };

  const handleCreatePost = async (postData) => {
    try {
      const created = await createPostApi({
        ...postData,
        author: {
          name: currentUser?.name || 'User',
          email: currentUserId,
          avatarColor: currentUser?.avatarBgColor || '#ec5137'
        }
      });
      if (created) {
        setPosts(prev => [created, ...prev]);
        if (toast?.showToast) {
          toast.showToast('Discussion published successfully!', 'success');
        }
        handleSelectPost(created.id);
      }
    } catch (err) {
      if (toast?.showToast) {
        toast.showToast(err.message || 'Failed to create discussion', 'error');
      }
    }
  };

  const handleToggleVote = async (postId) => {
    try {
      const res = await toggleVoteApi(postId, currentUser);
      if (res && res.post) {
        setPosts(prev => prev.map(p => p.id === postId ? res.post : p));
        if (activePost && activePost.id === postId) {
          setActivePost(res.post);
        }
      }
    } catch (err) {
      console.warn('Vote failed:', err);
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const res = await addCommentApi(postId, {
        content,
        author: {
          name: currentUser?.name || 'User',
          email: currentUserId,
          avatarColor: currentUser?.avatarBgColor || '#ec5137'
        }
      });
      if (res && res.post) {
        setPosts(prev => prev.map(p => p.id === postId ? res.post : p));
        if (activePost && activePost.id === postId) {
          setActivePost(res.post);
        }
        if (toast?.showToast) {
          toast.showToast('Comment added!', 'success');
        }
      }
    } catch (err) {
      if (toast?.showToast) {
        toast.showToast(err.message || 'Failed to add comment', 'error');
      }
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePostApi(postId, currentUserId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (activePost?.id === postId) {
        handleBackToList();
      }
      if (toast?.showToast) {
        toast.showToast('Post removed', 'info');
      }
    } catch (err) {
      if (toast?.showToast) {
        toast.showToast(err.message || 'Failed to delete post', 'error');
      }
    }
  };

  return {
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
    isLoadingDetail,
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
  };
}
