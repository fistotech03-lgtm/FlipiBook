const mongoose = require('mongoose');

const folderItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    _id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

folderItemSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : null;
});

const userFolderSchema = new mongoose.Schema(
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
    folders: {
      type: [folderItemSchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('UserFolder', userFolderSchema, 'UserFolders');
