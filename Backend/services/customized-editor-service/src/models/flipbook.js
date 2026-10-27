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
      alias: 'userId',
      index: true
    },
    userID: {
      type: String, // e.g. "FLIPI0001"
      trim: true,
      index: true
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    folder_id: {
      type: String, // fol_v_id of single folder
      required: true,
      default: 'fol_default',
      trim: true,
      index: true
    },
    folderName: {
      type: mongoose.Schema.Types.Mixed,
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
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Note: alias: 'v_id' and alias: 'userId' automatically create virtual getters and setters on the schema.

// Pre-validate hook to ensure required fields are always populated
flipbookSchema.pre('validate', async function () {
  if (!this.userObjectID && this.userId) {
    this.userObjectID = this.userId;
  }
  if (!this.userObjectID && (this.userID || this.userEmail)) {
    try {
      const UserModel = mongoose.models.user || (mongoose.modelNames().includes('user') ? mongoose.model('user') : null);
      if (UserModel) {
        const conds = [];
        if (this.userID) conds.push({ userID: this.userID });
        if (this.userEmail) conds.push({ emailId: this.userEmail.toLowerCase() });
        if (conds.length > 0) {
          const found = await UserModel.findOne({ $or: conds }).select('_id userID').lean();
          if (found) {
            this.userObjectID = found._id;
            if (!this.userID && found.userID) this.userID = found.userID;
          }
        }
      }
    } catch (_) {}
  }
  if (!this.book_v_id && this.v_id) {
    this.book_v_id = this.v_id;
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
