const ForumPost = require('../models/ForumPost');
const { recordAdminLog } = require('../middlewares/adminAuthMiddleware');
const crypto = require('crypto');
const nanoid = (n = 8) => crypto.randomBytes(Math.ceil(n / 2)).toString('hex').slice(0, n);

/**
 * 1. List Forum Discussions (Admin view)
 * GET /api/admin/forum/discussions
 */
const listDiscussions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      moduleId,
      status = 'all',
      postType = 'all',
      search = '',
      sort = 'newest'
    } = req.query;

    const filter = {};

    if (moduleId && moduleId !== 'all') {
      filter.moduleId = moduleId;
    }

    if (status && status !== 'all') {
      if (status === 'unanswered') {
        filter.status = { $in: ['awaiting_admin', 'under_review'] };
      } else if (status === 'answered') {
        filter.status = { $in: ['answered', 'implemented'] };
      } else {
        filter.status = status;
      }
    }

    if (postType && postType !== 'all') {
      filter.postType = postType;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { moduleName: { $regex: q, $options: 'i' } },
        { 'author.name': { $regex: q, $options: 'i' } },
        { 'author.email': { $regex: q, $options: 'i' } }
      ];
    }

    const sortOptions = { isPinned: -1 };
    if (sort === 'popular') {
      sortOptions.viewsCount = -1;
    } else if (sort === 'updated') {
      sortOptions.updatedAt = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      ForumPost.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ForumPost.countDocuments(filter)
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      posts
    });
  } catch (error) {
    console.error('[AdminForumController - listDiscussions] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch discussions', error: error.message });
  }
};

/**
 * 2. Post Official Admin Reply & Update Status
 * POST /api/admin/forum/discussions/:id/reply
 */
const replyToDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, status = 'answered', author } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty' });
    }

    const post = await ForumPost.findOne({ id });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found' });
    }

    const adminAuthor = {
      name: author?.name || req.admin?.name || 'Flipibook Engineering',
      email: req.admin?.emailId || author?.email || 'team@flipibook.com',
      initials: req.admin?.name ? req.admin.name.slice(0, 2).toUpperCase() : 'FE',
      avatarColor: '#2563eb',
      role: 'Official Reply',
      isAdmin: true
    };

    post.adminReply = {
      id: `admin-rep-${nanoid(8)}`,
      author: adminAuthor,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    post.status = status;
    await post.save();

    await recordAdminLog({
      adminEmail: adminAuthor.email,
      adminName: adminAuthor.name,
      action: 'ADMIN_FORUM_REPLY',
      targetType: 'forum_post',
      targetId: id,
      details: { postTitle: post.title, updatedStatus: status }
    });

    res.json({
      success: true,
      message: 'Official response submitted and status updated',
      adminReply: post.adminReply,
      status: post.status,
      post
    });
  } catch (error) {
    console.error('[AdminForumController - replyToDiscussion] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit official reply', error: error.message });
  }
};

/**
 * 3. Update Discussion Lifecycle Status
 * PATCH /api/admin/forum/discussions/:id/status
 */
const updateDiscussionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'awaiting_admin',
      'answered',
      'under_review',
      'planned',
      'implemented',
      'declined'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const post = await ForumPost.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found' });
    }

    await recordAdminLog({
      adminEmail: req.admin?.emailId || 'admin@flipibook.com',
      adminName: req.admin?.name || 'Administrator',
      action: 'UPDATE_FORUM_STATUS',
      targetType: 'forum_post',
      targetId: id,
      details: { newStatus: status, title: post.title }
    });

    res.json({ success: true, message: 'Discussion status updated', post });
  } catch (error) {
    console.error('[AdminForumController - updateDiscussionStatus] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

/**
 * 4. Toggle Pin / Lock
 * PATCH /api/admin/forum/discussions/:id/flags
 */
const toggleDiscussionFlags = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned, isLocked } = req.body;

    const updateFields = {};
    if (typeof isPinned === 'boolean') updateFields.isPinned = isPinned;
    if (typeof isLocked === 'boolean') updateFields.isLocked = isLocked;

    const post = await ForumPost.findOneAndUpdate(
      { id },
      { $set: updateFields },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found' });
    }

    await recordAdminLog({
      adminEmail: req.admin?.emailId || 'admin@flipibook.com',
      adminName: req.admin?.name || 'Administrator',
      action: 'TOGGLE_FORUM_FLAGS',
      targetType: 'forum_post',
      targetId: id,
      details: updateFields
    });

    res.json({ success: true, message: 'Discussion flags updated', post });
  } catch (error) {
    console.error('[AdminForumController - toggleDiscussionFlags] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update flags', error: error.message });
  }
};

/**
 * 5. Delete Discussion
 * DELETE /api/admin/forum/discussions/:id
 */
const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await ForumPost.findOneAndDelete({ id });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found' });
    }

    await recordAdminLog({
      adminEmail: req.admin?.emailId || 'admin@flipibook.com',
      adminName: req.admin?.name || 'Administrator',
      action: 'DELETE_FORUM_DISCUSSION',
      targetType: 'forum_post',
      targetId: id,
      details: { title: post.title, moduleId: post.moduleId }
    });

    res.json({ success: true, message: 'Discussion post deleted successfully', id });
  } catch (error) {
    console.error('[AdminForumController - deleteDiscussion] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete discussion', error: error.message });
  }
};

/**
 * 6. Get Forum Stats
 * GET /api/admin/forum/stats
 */
const getForumStats = async (req, res) => {
  try {
    const [
      total,
      awaitingAdmin,
      underReview,
      answered,
      planned,
      implemented,
      declined,
      questions,
      suggestions
    ] = await Promise.all([
      ForumPost.countDocuments(),
      ForumPost.countDocuments({ status: 'awaiting_admin' }),
      ForumPost.countDocuments({ status: 'under_review' }),
      ForumPost.countDocuments({ status: 'answered' }),
      ForumPost.countDocuments({ status: 'planned' }),
      ForumPost.countDocuments({ status: 'implemented' }),
      ForumPost.countDocuments({ status: 'declined' }),
      ForumPost.countDocuments({ postType: 'question' }),
      ForumPost.countDocuments({ postType: 'suggestion' })
    ]);

    res.json({
      success: true,
      stats: {
        total,
        awaitingAdmin,
        underReview,
        answered,
        planned,
        implemented,
        declined,
        questions,
        suggestions
      }
    });
  } catch (error) {
    console.error('[AdminForumController - getForumStats] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch forum stats', error: error.message });
  }
};

module.exports = {
  listDiscussions,
  replyToDiscussion,
  updateDiscussionStatus,
  toggleDiscussionFlags,
  deleteDiscussion,
  getForumStats
};
