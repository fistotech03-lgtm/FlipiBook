// Backend/services/myflipibook-service/src/forum/forumModel.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const generateId = (prefix) => `${prefix}-${crypto.randomBytes(5).toString('hex')}`;

/**
 * Sub-schema for Author details
 */
const AuthorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, index: true },
  initials: { type: String, default: '' },
  avatarColor: { type: String, default: '#ec5137' },
  role: { type: String, default: 'User' },
  isAdmin: { type: Boolean, default: false }
}, { _id: false });

/**
 * Sub-schema for Official Admin Replies
 */
const AdminReplySchema = new mongoose.Schema({
  id: { type: String, default: () => generateId('admin-rep') },
  author: { type: AuthorSchema, required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

/**
 * Sub-schema for Author Follow-ups
 */
const AuthorFollowUpSchema = new mongoose.Schema({
  id: { type: String, default: () => generateId('fu') },
  author: { type: AuthorSchema, required: true },
  question: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  adminReply: {
    id: { type: String },
    author: { type: AuthorSchema },
    content: { type: String, trim: true },
    createdAt: { type: Date }
  }
}, { _id: false });

/**
 * Sub-schema for Community Comments
 */
const CommentSchema = new mongoose.Schema({
  id: { type: String, default: () => generateId('c') },
  author: { type: AuthorSchema, required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  isAuthorFollowUp: { type: Boolean, default: false }
}, { _id: false });

/**
 * Primary Forum Post Schema
 */
const forumPostSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => generateId('post'),
    unique: true,
    index: true
  },
  moduleId: {
    type: String,
    required: true,
    index: true,
    enum: [
      'my-flipbooks',
      'page-editor',
      'customised-editor',
      '3d-editor',
      'converter',
      'account-workspace'
    ]
  },
  moduleName: {
    type: String,
    required: true
  },
  postType: {
    type: String,
    enum: ['question', 'suggestion'],
    default: 'question',
    index: true
  },
  status: {
    type: String,
    enum: [
      'awaiting_admin',
      'answered',
      'under_review',
      'planned',
      'implemented',
      'declined'
    ],
    default: function () {
      return this.postType === 'suggestion' ? 'under_review' : 'awaiting_admin';
    },
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: 'text'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: AuthorSchema,
    required: true
  },
  sameQuestionUsers: {
    type: [String],
    default: []
  },
  followedBy: {
    type: [String],
    default: []
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  adminReply: {
    type: AdminReplySchema,
    default: null
  },
  authorFollowUps: {
    type: [AuthorFollowUpSchema],
    default: []
  },
  comments: {
    type: [CommentSchema],
    default: []
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

forumPostSchema.index({ moduleId: 1, createdAt: -1 });
forumPostSchema.index({ 'author.email': 1, createdAt: -1 });
forumPostSchema.index({ status: 1, createdAt: -1 });
forumPostSchema.index({ postType: 1, createdAt: -1 });
forumPostSchema.index({ title: 'text', description: 'text' });

const ForumPost = mongoose.models.ForumPost || mongoose.model('ForumPost', forumPostSchema);

module.exports = ForumPost;
