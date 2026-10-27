const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    pageNumber: { type: Number, required: true },
    name: { type: String, required: true },
    fileName: { type: String, default: '' },
    page_v_id: { type: String, required: true },
    size: { type: Number, default: 0 },
    hide: { type: Number, default: 0 }
  },
  {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

pageSchema.virtual('v_id')
  .get(function () { return this.page_v_id; })
  .set(function (val) { this.page_v_id = val; });

const flipbookSchema = new mongoose.Schema(
  {
    userObjectID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true
    },
    userID: {
      type: String, // e.g. "FLIPI0001"
      trim: true,
      index: true
    },
    folder_id: {
      type: String, // fol_v_id of single folder
      required: true,
      default: 'fol_default',
      trim: true,
      index: true
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
    book_v_id: {
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
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'user',
      default: []
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for backward-compatibility with v_id
flipbookSchema.virtual('v_id')
  .get(function () { return this.book_v_id; })
  .set(function (val) { this.book_v_id = val; });

// Indexes
flipbookSchema.index({ userObjectID: 1, trash: 1, updatedAt: -1 });
flipbookSchema.index({ userObjectID: 1, folder_id: 1, trash: 1 });
flipbookSchema.index({ isFavorite: 1, trash: 1 });
flipbookSchema.index({ book_v_id: 1 });

module.exports = (mongoose.models.flipbook || mongoose.models.Flipbook) || mongoose.model('flipbook', flipbookSchema, 'flipbooks');
