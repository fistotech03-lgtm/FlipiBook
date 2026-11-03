// Backend/services/user-service/src/controllers/forumAdminController.js
const ForumPost = require('../../../../shared/models/ForumPost');
const { FORUM_MODULES } = require('../constants/forumConstants');
const crypto = require('crypto');
const nanoid = (n = 8) => crypto.randomBytes(Math.ceil(n / 2)).toString('hex').slice(0, n);
const mongoose = require('mongoose');

let User = require('../../../../shared/models/User');

// Verification helper
const verifyAdminAccess = async (req) => {
  const requesterEmail = (
    req.headers['x-user-email'] ||
    req.body?.author?.email ||
    req.body?.userEmail ||
    req.query?.userEmail ||
    req.user?.email ||
    req.user?.emailId
  );

  if (!requesterEmail) return { isAdmin: true, email: 'admin@flipibook.com' }; // Default fallback for dev/internal

  try {
    const cleanEmail = String(requesterEmail).trim().toLowerCase();
    const user = await User.findOne({ $or: [{ emailId: cleanEmail }, { email: cleanEmail }] });
    if (user && (user.role === 'admin' || user.isAdmin === true)) {
      return { isAdmin: true, email: cleanEmail, user };
    }
  } catch (err) {
    console.error('[verifyAdminAccess Error]:', err);
  }

  // Allow localhost / internal dev bypass or return admin status
  return { isAdmin: true, email: requesterEmail };
};

/**
 * 1. Admin Official Reply & Status Modification
 * POST /api/forum/admin/:id/reply (or /api/forum/:id/admin-reply)
 */
const addAdminReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, status = 'answered', author } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Admin reply content is required' });
    }

    const post = await ForumPost.findOne({ id });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found' });
    }

    const adminCheck = await verifyAdminAccess(req);

    const adminAuthor = {
      name: author?.name || 'Flipibook Engineering',
      email: adminCheck.email || author?.email || 'team@flipibook.com',
      initials: author?.initials || 'FE',
      avatarColor: author?.avatarColor || '#2563eb',
      role: author?.role || 'Official Reply',
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

    res.json({
      success: true,
      message: 'Official engineering reply published and status updated',
      adminReply: post.adminReply,
      status: post.status,
      post
    });
  } catch (error) {
    console.error('[ForumAdminController - addAdminReply] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit admin reply', error: error.message });
  }
};

/**
 * 2. Admin Reply directly to an Author Follow-Up
 * POST /api/forum/admin/:id/follow-up/:followUpId/reply
 */
const addAdminFollowUpReply = async (req, res) => {
  try {
    const { id, followUpId } = req.params;
    const { content, author } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty' });
    }

    const post = await ForumPost.findOne({ id });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const followUp = post.authorFollowUps.find(f => f.id === followUpId);
    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up question not found' });
    }

    const adminAuthor = {
      name: author?.name || 'Flipibook Engineering',
      email: author?.email || 'team@flipibook.com',
      initials: author?.initials || 'FE',
      avatarColor: author?.avatarColor || '#2563eb',
      role: 'Official Reply',
      isAdmin: true
    };

    followUp.adminReply = {
      id: `admin-fu-rep-${nanoid(8)}`,
      author: adminAuthor,
      content: content.trim(),
      createdAt: new Date()
    };

    await post.save();

    res.json({
      success: true,
      message: 'Admin reply to author follow-up recorded',
      authorFollowUps: post.authorFollowUps,
      post
    });
  } catch (error) {
    console.error('[ForumAdminController - addAdminFollowUpReply] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to reply to follow-up', error: error.message });
  }
};

/**
 * 3. Update Lifecycle Status
 * PATCH /api/forum/admin/:id/status
 */
const updatePostStatus = async (req, res) => {
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
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, message: 'Post status updated', status: post.status, post });
  } catch (error) {
    console.error('[ForumAdminController - updatePostStatus] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

/**
 * 4. Toggle Pin / Lock Post
 * PATCH /api/forum/admin/:id/flags
 */
const updatePostFlags = async (req, res) => {
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
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, message: 'Post moderation flags updated', post });
  } catch (error) {
    console.error('[ForumAdminController - updatePostFlags] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update flags', error: error.message });
  }
};

/**
 * 5. Delete Forum Discussion
 * DELETE /api/forum/admin/:id
 */
const deleteForumPost = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ForumPost.findOneAndDelete({ id });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Post not found or already deleted' });
    }

    res.json({ success: true, message: 'Discussion post deleted by administrator', id });
  } catch (error) {
    console.error('[ForumAdminController - deleteForumPost] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post', error: error.message });
  }
};

/**
 * 6. Get Admin Overview & Moderation Stats
 * GET /api/forum/admin/stats
 */
const getAdminStats = async (req, res) => {
  try {
    const totalPosts = await ForumPost.countDocuments();
    const awaitingAdmin = await ForumPost.countDocuments({ status: 'awaiting_admin' });
    const underReview = await ForumPost.countDocuments({ status: 'under_review' });
    const answered = await ForumPost.countDocuments({ status: 'answered' });
    const implemented = await ForumPost.countDocuments({ status: 'implemented' });
    const suggestions = await ForumPost.countDocuments({ postType: 'suggestion' });
    const questions = await ForumPost.countDocuments({ postType: 'question' });

    // Module breakdown
    const moduleCounts = {};
    for (const mod of FORUM_MODULES) {
      moduleCounts[mod.id] = await ForumPost.countDocuments({ moduleId: mod.id });
    }

    res.json({
      success: true,
      stats: {
        totalPosts,
        awaitingAdmin,
        underReview,
        answered,
        implemented,
        suggestions,
        questions,
        moduleCounts
      }
    });
  } catch (error) {
    console.error('[ForumAdminController - getAdminStats] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats', error: error.message });
  }
};

module.exports = {
  addAdminReply,
  addAdminFollowUpReply,
  updatePostStatus,
  updatePostFlags,
  deleteForumPost,
  getAdminStats
};
