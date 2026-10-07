const mongoose = require('mongoose');

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
      required: true
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

const Counter = require('./Counter');

userSchema.pre('save', async function () {
  if (this.userID) return;

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.userID = `FLIPI${String(counter.seq).padStart(4, '0')}`;
  } catch (err) {
    throw err;
  }
});

module.exports = mongoose.model('User', userSchema);
