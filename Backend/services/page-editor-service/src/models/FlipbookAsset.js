const mongoose = require('mongoose');

const flipbookAssetSchema = new mongoose.Schema(
  {
    flipbook_v_id: {
      type: String,
      index: true
    },
    file_v_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    assetType: {
      type: String, // 'Image', 'video', 'gif', 'audio', '3D_Model', 'download'
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      default: ''
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    isGallery: {
      type: Boolean,
      default: false,
      index: true
    },
    page_v_id: {
      type: String,
      default: 'global',
      index: true
    },
    flipbookName: {
      type: String,
      required: true,
      trim: true
    },
    folderName: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

flipbookAssetSchema.index({ userEmail: 1, isGallery: 1 });
flipbookAssetSchema.index({ flipbook_v_id: 1, page_v_id: 1 });

module.exports = mongoose.models.FlipbookAsset || mongoose.model('FlipbookAsset', flipbookAssetSchema);
