const mongoose = require('mongoose');

const pageEditorSettingsSchema = new mongoose.Schema(
  {
    userObjectID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: false,
      index: true
    },
    userID: {
      type: String,
      trim: true,
      index: true
    },
    editorSettings: {
      isAutoSaveEnabled: {
        type: Boolean,
        default: false
      },
      isTrimViewEnabled: {
        type: Boolean,
        default: false
      },
      isRulerEnabled: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  (mongoose.models.pageEditorSettings || mongoose.models.PageEditorSettings) ||
  mongoose.model('pageEditorSettings', pageEditorSettingsSchema, 'pageEditorSettings');
