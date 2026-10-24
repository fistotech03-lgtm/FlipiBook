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
      type: [String],
      set: function (val) {
        if (!val) return ['default'];
        const arr = Array.isArray(val) ? val.flat(Infinity) : [val];
        const cleaned = arr
          .filter((f) => f !== null && f !== undefined && String(f).trim() !== '')
          .map((f) => String(f).trim());
        return [...new Set(cleaned.length > 0 ? cleaned : ['default'])];
      },
      default: ['default']
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
    viewers: {
      type: [String],
      default: []
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    bookRating: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    addedToShelfCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

flipbookSchema.index({ userEmail: 1, trash: 1, updatedAt: -1 });
flipbookSchema.index({ 'Visibility.shareId': 1 }, { sparse: true });
flipbookSchema.index({ 'share.shareId': 1 }, { sparse: true });

module.exports = mongoose.models.Flipbook || mongoose.model('Flipbook', flipbookSchema);
