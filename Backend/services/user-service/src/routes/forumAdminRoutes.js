const express = require('express');
const {
  addAdminReply,
  addAdminFollowUpReply,
  updatePostStatus,
  updatePostFlags,
  deleteForumPost,
  getAdminStats
} = require('../controllers/forumAdminController');

const router = express.Router();

/**
 * Forum Admin Routes
 */

// GET stats
router.get('/stats', getAdminStats);

// Reply to discussion & update status
router.post('/:id/reply', addAdminReply);
router.post('/:id/admin-reply', addAdminReply);

// Reply to author follow-up
router.post('/:id/follow-up/:followUpId/reply', addAdminFollowUpReply);
router.post('/:id/follow-up/:followUpId/admin-reply', addAdminFollowUpReply);

// Moderation & status update
router.patch('/:id/status', updatePostStatus);
router.patch('/:id/flags', updatePostFlags);

// Delete
router.delete('/:id', deleteForumPost);

module.exports = router;
