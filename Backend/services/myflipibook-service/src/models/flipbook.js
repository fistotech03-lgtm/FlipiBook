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
      type: String, // sequence ID e.g. "FLIP001"
      alias: 'userId',
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
      alias: 'v_id',
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

// Pre-validate hook to ensure required fields are always populated
flipbookSchema.pre('validate', async function () {
  if (!this.userObjectID && this.userID) {
    try {
      const UserModel = mongoose.models.user || (mongoose.modelNames().includes('user') ? mongoose.model('user') : null);
      if (UserModel) {
        const found = await UserModel.findOne({ userID: this.userID }).select('_id').lean();
        if (found) {
          this.userObjectID = found._id;
        }
      }
    } catch (_) {}
  }
  if (!this.folder_id) {
    this.folder_id = 'fol_default';
  }
});

// Indexes
flipbookSchema.index({ userObjectID: 1, trash: 1, updatedAt: -1 });
flipbookSchema.index({ userObjectID: 1, folder_id: 1, trash: 1 });
flipbookSchema.index({ isFavorite: 1, trash: 1 });

module.exports = (mongoose.models.flipbook || mongoose.models.Flipbook) || mongoose.model('flipbook', flipbookSchema, 'flipbooks');
