const mongoose = require('mongoose');
const crypto = require('crypto');

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      default: () => crypto.randomBytes(8).toString('hex'),
      unique: true,
      index: true
    },
    // The flipbook owner's userId is the primary accessor
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userID: {
      type: String,
      trim: true,
      index: true
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    v_id: {
      type: String,
      required: true,
      index: true
    },
    shareId: {
      type: String,
      index: true
    },
    flipbookName: {
      type: String,
      default: 'Flipbook'
    },
    leadData: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    viewerIp: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

leadSchema.index({ userId: 1, createdAt: -1 });
leadSchema.index({ v_id: 1, createdAt: -1 });

module.exports = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
