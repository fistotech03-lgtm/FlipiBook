const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    moduleId: { type: String, index: true },
    moduleName: { type: String },
    postType: { type: String, enum: ['question', 'suggestion'], default: 'question', index: true },
    status: {
      type: String,
      enum: ['awaiting_admin', 'answered', 'under_review', 'planned', 'implemented', 'declined'],
      default: 'awaiting_admin',
      index: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    author: { type: Object, required: true },
    sameQuestionUsers: { type: [String], default: [] },
    followedBy: { type: [String], default: [] },
    viewsCount: { type: Number, default: 0 },
    adminReply: { type: Object, default: null },
    authorFollowUps: { type: Array, default: [] },
    comments: { type: Array, default: [] },
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    strict: false
  }
);

module.exports = mongoose.models.ForumPost || mongoose.model('ForumPost', forumPostSchema);
