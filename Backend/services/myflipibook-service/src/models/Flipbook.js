const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    pageNumber: { type: Number, required: true },
    name: { type: String, required: true },
    fileName: { type: String, default: '' },
    v_id: { type: String, required: true },
    size: { type: Number, default: 0 },
    hide: { type: Number, default: 0 }
  },
  { _id: false }
);

const flipbookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
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
    folderName: {
      type: mongoose.Schema.Types.Mixed,
      default: ['My_Flipbooks']
    },
    flipbookName: {
      type: String,
      required: true,
      trim: true
    },
    pages: {
      type: [pageSchema],
      default: []
    },
    fileSize: {
      type: Number,
      default: 0
    },
    v_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    trash: {
      type: Boolean,
      default: false,
      index: true
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true
    },
    trashedAt: {
      type: Date,
      default: null
    },
    Customized_Settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// High-performance compound indexes for user dashboard, favorites, and trash sorting
flipbookSchema.index({ userEmail: 1, trash: 1, updatedAt: -1 });
flipbookSchema.index({ userEmail: 1, folderName: 1, trash: 1 });
flipbookSchema.index({ userEmail: 1, isFavorite: 1, trash: 1 });

module.exports = mongoose.models.Flipbook || mongoose.model('Flipbook', flipbookSchema);
