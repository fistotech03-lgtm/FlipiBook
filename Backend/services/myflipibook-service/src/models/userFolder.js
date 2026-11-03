const mongoose = require('mongoose');
const crypto = require('crypto');

const folderItemSchema = new mongoose.Schema(
  {
    fol_v_id: {
      type: String,
      required: true,
      default: () => 'fol_' + crypto.randomBytes(6).toString('hex')
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    _id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

folderItemSchema.virtual('id').get(function () {
  return this.fol_v_id || (this._id ? this._id.toString() : null);
});

const userFolderSchema = new mongoose.Schema(
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
      trim: true,
      index: true
    },
    folders: {
      type: [folderItemSchema],
      default: []
    }
  },
  {
    timestamps: true,
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userFolderSchema.post('save', function (doc) {
  try {
    const backupService = require('../../../../shared/backupService');
    backupService.syncFolder(doc);
  } catch (_) {}
});

userFolderSchema.post('findOneAndUpdate', function (doc) {
  if (doc) {
    try {
      const backupService = require('../../../../shared/backupService');
      backupService.syncFolder(doc);
    } catch (_) {}
  }
});

module.exports = (mongoose.models.userFolder || mongoose.models.UserFolder) || mongoose.model('userFolder', userFolderSchema, 'UserFolders');
