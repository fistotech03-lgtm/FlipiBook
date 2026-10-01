const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // e.g. FLIPI0001
      required: true,
      index: true
    },
    userObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    emailId: {
      type: String,
      required: true,
      index: true
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: ''
    },
    loginTime: {
      type: Date,
      default: Date.now,
      index: true
    },
    logoutTime: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'LOGGED_OUT', 'EXPIRED'],
      default: 'ACTIVE',
      index: true
    },
    loginMethod: {
      type: String,
      enum: ['EMAIL_PASSWORD', 'GOOGLE'],
      default: 'EMAIL_PASSWORD'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginLog', loginLogSchema);
