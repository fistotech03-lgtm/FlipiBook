const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema(
  {
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    userID: {
      type: String,
      default: '',
      index: true
    },
    theme: {
      type: String,
      enum: ['system', 'light', 'dark', 'medium-dark', 'medium-light'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    autoSaveInterval: {
      type: Number,
      default: 30 // seconds
    },
    editorSettings: {
      isAutoSaveEnabled: { type: Boolean, default: true },
      isTrimViewEnabled: { type: Boolean, default: false },
      isRulerEnabled: { type: Boolean, default: true },
      defaultFont: { type: String, default: 'Inter' },
      defaultFontSize: { type: Number, default: 16 }
    },
    notifications: {
      emailMarketing: { type: Boolean, default: false },
      bookViews: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.UserPreference ||
  mongoose.model('UserPreference', userPreferenceSchema, 'user_preferences');
