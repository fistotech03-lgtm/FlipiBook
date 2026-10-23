const mongoose = require('mongoose');

const pageEditorSettingsSchema = new mongoose.Schema(
  {
    userObjectID: {
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
  mongoose.models.PageEditorSettings ||
  mongoose.model('PageEditorSettings', pageEditorSettingsSchema, 'pageEditorSettings');
