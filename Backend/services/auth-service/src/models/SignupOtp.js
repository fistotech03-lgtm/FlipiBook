const mongoose = require('mongoose');

const signupOtpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: ''
    },
    emailId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    otp: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 600 } // Auto-delete document after 10 minutes
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SignupOtp', signupOtpSchema);
