const mongoose = require('mongoose');

const editorPresetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
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
    presetName: {
      type: String,
      required: true,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

editorPresetSchema.index({ userId: 1, presetName: 1 }, { unique: true });

module.exports =
  (mongoose.models.editorPreset || mongoose.models.EditorPreset) ||
  mongoose.model('editorPreset', editorPresetSchema);
