const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      default: ''
    },
    picture: {
      type: String,
      default: ''
    },
    userID: {
      type: String,
      default: '',
      index: true
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator', 'staff'],
      default: 'user',
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      default: 'local'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    strict: false
  }
);

userSchema.index({ createdAt: -1 });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
