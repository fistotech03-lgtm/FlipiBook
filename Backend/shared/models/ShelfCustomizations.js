const mongoose = global.mongoose || require('mongoose');
const crypto = require('crypto');

const generateShelfId = () => 'sh_' + crypto.randomBytes(6).toString('hex');

const shelfBookSchema = new mongoose.Schema(
  {
    v_id: {
      type: String,
      required: true
    },
    row: {
      type: Number,
      default: 1
    },
    order: {
      type: Number,
      default: 1
    }
  },
  { _id: false }
);

const shelfFolderSchema = new mongoose.Schema(
  {
    shelfId: {
      type: String,
      default: generateShelfId,
      index: true
    },
    folderName: {
      type: String,
      default: ''
    },
    shelf_design: {
      type: mongoose.Schema.Types.Mixed,
      default: 'customize4'
    },
    defaultLightType: {
      type: String,
      default: 'Turn on'
    },
    lights: {
      type: Boolean,
      default: true
    },
    selectedWallTheme: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    selectedLightTheme: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    showLightSwitch: {
      type: Boolean,
      default: true
    },
    lightOpacity: {
      type: Number,
      default: 100
    },
    decors: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    logo: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    logoFixType: {
      type: String,
      default: 'Fit'
    },
    logoOpacity: {
      type: Number,
      default: 80
    },
    books: [shelfBookSchema]
  },
  { _id: false, strict: false }
);

const shelfCustomizationsSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      default: '',
      index: true
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    shelfCount: {
      type: Number,
      default: 1
    },
    folders: [shelfFolderSchema]
  },
  {
    timestamps: true,
    strict: false
  }
);

// Asynchronous non-blocking backup mirror hook
shelfCustomizationsSchema.post('save', function (doc) {
  try {
    const backupService = require('../backupService');
    if (backupService && typeof backupService.syncShelfCustomizations === 'function') {
      backupService.syncShelfCustomizations(doc);
    }
  } catch (_) {}
});

shelfCustomizationsSchema.post('findOneAndUpdate', function (doc) {
  if (doc) {
    try {
      const backupService = require('../backupService');
      if (backupService && typeof backupService.syncShelfCustomizations === 'function') {
        backupService.syncShelfCustomizations(doc);
      }
    } catch (_) {}
  }
});

module.exports =
  (mongoose.models.ShelfCustomizations || mongoose.models.shelfCustomizations) ||
  mongoose.model('ShelfCustomizations', shelfCustomizationsSchema, 'ShelfCustomizations');

