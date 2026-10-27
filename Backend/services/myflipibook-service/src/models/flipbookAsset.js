const mongoose = require('mongoose');

const flipbookMediaItemSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      default: '',
      trim: true
    },
    convertedName: {
      type: String,
      required: true,
      trim: true // e.g. "asset_abc123.png"
    },
    page_v_id: {
      type: String,
      default: 'global',
      index: true
    },
    url: {
      type: String,
      required: true // Relative path: "../assets/Image/asset_abc123.png"
    },
    size: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const flipbookAssetSchema = new mongoose.Schema(
  {
    userObjectID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true
    },
    userID: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    book_v_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    flipbookName: {
      type: String,
      required: true,
      trim: true
    },
    folder_id: {
      type: String,
      default: 'fol_default',
      trim: true
    },
    assets: {
      images: {
        type: [flipbookMediaItemSchema],
        default: []
      },
      video: {
        type: [flipbookMediaItemSchema],
        default: []
      },
      gif: {
        type: [flipbookMediaItemSchema],
        default: []
      }
    }
  },
  {
    timestamps: true
  }
);

flipbookAssetSchema.index({ userObjectID: 1 });
flipbookAssetSchema.index({ book_v_id: 1 });

module.exports = (mongoose.models.flipbookAsset || mongoose.models.FlipbookAsset) || mongoose.model('flipbookAsset', flipbookAssetSchema, 'flipbookAssets');
