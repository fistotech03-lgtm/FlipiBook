const mongoose = require('mongoose');

const customizedAssetSchema = new mongoose.Schema(
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
    v_id: {
      type: String,
      index: true
    },
    flipbookName: {
      type: String
    },
    assetType: {
      type: String,
      required: true,
      enum: ['Logo', 'Watermark', 'Background', 'Video', 'Audio', 'Preloader', 'Gallery_Image', 'Texture', 'Transparent_Sheet', 'Other'],
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    originalName: {
      type: String
    },
    url: {
      type: String,
      required: true
    },
    storagePath: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String
    },
    dimensions: {
      width: { type: Number },
      height: { type: Number }
    }
  },
  {
    timestamps: true
  }
);

customizedAssetSchema.index({ userId: 1, assetType: 1 });
customizedAssetSchema.index({ userId: 1, v_id: 1 });

module.exports =
  mongoose.models.CustomizedAsset ||
  mongoose.model('CustomizedAsset', customizedAssetSchema);
