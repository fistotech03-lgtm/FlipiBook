const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema(
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
    planId: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    paymentGateway: {
      type: String,
      enum: ['free', 'manual', 'stripe', 'razorpay', 'paypal'],
      default: 'manual'
    },
    gatewayTransactionId: {
      type: String,
      default: null,
      index: true
    },
    invoiceNumber: {
      type: String,
      default: null
    },
    receiptUrl: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  (mongoose.models.paymentTransaction || mongoose.models.PaymentTransaction) ||
  mongoose.model('paymentTransaction', paymentTransactionSchema, 'paymentTransactions');
