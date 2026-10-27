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

const User = (mongoose.models.user || mongoose.models.User) || mongoose.model('user', userSchema, 'users');

module.exports = User;
