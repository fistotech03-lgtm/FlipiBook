const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema(
  {
    adminEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    adminName: {
      type: String,
      default: 'Administrator'
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    targetType: {
      type: String,
      enum: ['user', 'flipbook', 'forum_post', 'subscription', 'system'],
      required: true,
      index: true
    },
    targetId: {
      type: String,
      default: ''
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

adminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.AdminLog || mongoose.model('AdminLog', adminLogSchema);
