const mongoose = require('mongoose');

const flipbookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    userID: {
      type: String,
      trim: true,
      index: true
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    flipbookName: {
      type: String,
      required: true,
      trim: true
    },
    folderName: {
      type: [String],
      default: ['default']
    },
    pages: {
      type: Array,
      default: []
    },
    fileSize: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isFlagged: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'flagged', 'archived'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    strict: false
  }
);

flipbookSchema.index({ userEmail: 1, createdAt: -1 });
flipbookSchema.index({ flipbookName: 'text' });
flipbookSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Flipbook || mongoose.model('Flipbook', flipbookSchema);
