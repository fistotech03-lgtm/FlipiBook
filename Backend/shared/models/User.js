const mongoose = require('mongoose');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema(
  {
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      default: '',
      required: false
    },
    name: {
      type: String,
      default: ''
    },
    picture: {
      type: String,
      default: ''
    },
    userID: {
      type: String,
      default: '',
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false
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
  { timestamps: true }
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
