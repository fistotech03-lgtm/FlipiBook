const mongoose = require('mongoose');
const crypto = require('crypto');

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
      alias: 'userId',
      required: true,
      trim: true,
      index: true
    },
    book_v_id: {
      type: String,
      required: true,
      unique: true,
      alias: 'v_id',
      index: true
    },
    flipbookName: {
      type: String,
      required: true,
      trim: true
    },
    folder_id: {
      type: String,
      default: () => 'fol_' + crypto.randomBytes(6).toString('hex'),
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = (mongoose.models.flipbookAsset || mongoose.models.FlipbookAsset) || mongoose.model('flipbookAsset', flipbookAssetSchema, 'flipbookAssets');
