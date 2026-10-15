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
    const counter = await Counter.findOneAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, returnDocument: 'after' }
    );

    const seq = counter && counter.seq ? counter.seq : 1;
    this.userID = `FLIPI${String(seq).padStart(4, '0')}`;
  } catch (err) {
    console.error('[User Model] Counter error, using fallback count:', err.message);
    try {
      const count = await mongoose.model('User').countDocuments();
      this.userID = `FLIPI${String(count + 1).padStart(4, '0')}`;
    } catch (e) {
      this.userID = `FLIPI${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }
});

module.exports = mongoose.model('User', userSchema);
