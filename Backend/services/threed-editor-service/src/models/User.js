const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    userID: {
      type: String,
      default: '',
      index: true,
    },
    name: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

module.exports = User;
