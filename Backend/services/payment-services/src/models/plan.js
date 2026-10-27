const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    tier: {
      type: Number,
      required: true,
      default: 1 // 1: Free, 2: Starter, 3: Pro, 4: Enterprise
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true
    },
    billingCycle: {
      type: String,
      enum: ['free', 'monthly', 'yearly', 'lifetime'],
      default: 'monthly'
    },
    // Storage configuration for the plan
    storage: {
      maxStorage: {
        type: Number,
        required: true,
        default: 300 * 1024 * 1024 // Bytes (e.g. 300 MB default)
      },
      formattedStorage: {
        type: String,
        default: '300 MB'
      }
    },
    // Usage limits
    limits: {
      maxFlipbooks: {
        type: Number,
        default: 5 // -1 for unlimited
      }
    },
    // Feature toggles
    features: {
      customBranding: { type: Boolean, default: false },
      passwordProtection: { type: Boolean, default: false },
      leadForm: { type: Boolean, default: false },
      customDomain: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
      downloadPdf: { type: Boolean, default: true },
      removeWatermark: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = (mongoose.models.plan || mongoose.models.Plan) || mongoose.model('plan', planSchema, 'plans');
