const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: '',
      index: true
    },
    userId: {
      type: String, // e.g. FLIPI0001 or Admin ID
      default: '',
      index: true
    },
    userObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      index: true
    },
    deviceId: {
      type: String,
      default: '',
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
    browser: {
      type: String,
      default: 'Unknown'
    },
    operatingSystem: {
      type: String,
      default: 'Unknown'
    },
    deviceType: {
      type: String,
      default: 'desktop' // 'desktop' | 'mobile' | 'tablet'
    },
    location: {
      type: String,
      default: 'Unknown Location'
    },
    loginTime: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastActiveTime: {
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
      enum: ['ACTIVE', 'LOGGED_OUT', 'REVOKED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    },
    eventType: {
      type: String,
      enum: ['SUCCESSFUL_LOGIN', 'FAILED_LOGIN', 'LOGOUT', 'NEW_DEVICE_LOGIN'],
      default: 'SUCCESSFUL_LOGIN',
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'adminlogs'
  }
);

adminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.AdminLog || mongoose.model('AdminLog', adminLogSchema, 'adminlogs');

