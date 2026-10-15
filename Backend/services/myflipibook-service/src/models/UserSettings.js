const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
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
    emailId: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    editorSettings: {
      isAutoSaveEnabled: {
        type: Boolean,
        default: true
      },
      isTrimViewEnabled: {
        type: Boolean,
        default: false
      },
      isRulerEnabled: {
        type: Boolean,
        default: true
      }
    },
    maxStorage: {
      type: Number,
      default: 300 * 1024 * 1024 // 300 MB default quota
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('UserSettings', userSettingsSchema, 'UserSettings');
