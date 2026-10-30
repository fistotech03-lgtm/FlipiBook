const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // e.g. FLIPI0001
      default: '',
      index: true
    },
    userObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      index: true
    },
    emailId: {
      type: String,
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    deviceId: {
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
    lastActiveAt: {
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
    },
    loginMethod: {
      type: String,
      enum: ['EMAIL_PASSWORD', 'GOOGLE'],
      default: 'EMAIL_PASSWORD'
    }
  },
  { timestamps: true }
);

// Asynchronous non-blocking backup mirror hook
loginLogSchema.post('save', function (doc) {
  try {
    const backupService = require('../../../../shared/backupService');
    backupService.syncLoginLog(doc);
  } catch (_) {}
});

module.exports = mongoose.model('loginLog', loginLogSchema);
