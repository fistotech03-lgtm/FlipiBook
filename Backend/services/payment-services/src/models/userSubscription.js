const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema(
  {
    userObjectID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
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
    planId: {
      type: String,
      required: true,
      default: 'free',
      trim: true,
      lowercase: true
    },
    planRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'plan'
    },
    planName: {
      type: String,
      default: 'Free Plan'
    },
    // Exact storage quota allocated to the user
    storageQuota: {
      maxStorage: {
        type: Number,
        required: true,
        default: 300 * 1024 * 1024 // Bytes
      },
      bonusStorage: {
        type: Number,
        default: 0
      },
      formattedStorage: {
        type: String,
        default: '300 MB'
      }
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'expired'],
      default: 'active',
      index: true
    },
    billingCycle: {
      type: String,
      enum: ['free', 'monthly', 'yearly', 'lifetime'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null // null indicates unlimited / free tier
    },
    autoRenew: {
      type: Boolean,
      default: false
    },
    paymentGateway: {
      provider: {
        type: String,
        enum: ['free', 'manual', 'stripe', 'razorpay', 'paypal'],
        default: 'free'
      },
      customerId: {
        type: String,
        default: null
      },
      subscriptionId: {
        type: String,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  (mongoose.models.userSubscription || mongoose.models.UserSubscription) ||
  mongoose.model('userSubscription', userSubscriptionSchema, 'userSubscriptions');
