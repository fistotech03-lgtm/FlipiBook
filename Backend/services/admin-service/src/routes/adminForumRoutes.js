const express = require('express');
const {
  listDiscussions,
  replyToDiscussion,
  updateDiscussionStatus,
  toggleDiscussionFlags,
  deleteDiscussion,
  getForumStats
} = require('../controllers/adminForumController');

const router = express.Router();

router.get('/discussions', listDiscussions);
router.get('/stats', getForumStats);
router.post('/discussions/:id/reply', replyToDiscussion);
router.patch('/discussions/:id/status', updateDiscussionStatus);
router.patch('/discussions/:id/flags', toggleDiscussionFlags);
router.delete('/discussions/:id', deleteDiscussion);

module.exports = router;
