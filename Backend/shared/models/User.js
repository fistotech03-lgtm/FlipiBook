const mongoose = require('mongoose');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      default: '',
      index: true
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      default: '',
      required: false,
      select: false // Exclude from normal queries for security
    },
    name: {
      type: String,
      default: ''
    },
    picture: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator', 'staff'],
      default: 'user',
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      default: 'local'
    },
    phone: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    company: {
      type: String,
      default: ''
    },
    designation: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: ''
    },
    pincode: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    socials: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
      instagram: { type: String, default: '' }
    },
    otp: {
      code: {
        type: String,
        default: null
      },
      expiresAt: {
        type: Date,
        default: null
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Auto-generate userID (e.g. FLIPI0001) if not set
userSchema.pre('save', async function () {
  if (this.userID) return;

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    this.userID = `FLIPI${String(counter.seq).padStart(4, '0')}`;
  } catch (err) {
    throw err;
  }
});

// Asynchronous non-blocking backup mirror hook
userSchema.post('save', function (doc) {
  try {
    const backupService = require('../backupService');
    backupService.syncUser(doc);
  } catch (_) {}
});

userSchema.post('findOneAndUpdate', function (doc) {
  if (doc) {
    try {
      const backupService = require('../backupService');
      backupService.syncUser(doc);
    } catch (_) {}
  }
});

module.exports = (mongoose.models.user || mongoose.models.User) || mongoose.model('user', userSchema, 'users');

