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

userSchema.pre('save', async function () {
  if (this.userID) return;

  try {
    const lastUser = await this.constructor
      .findOne({ userID: { $regex: /^FLIPI/ } })
      .sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastUser && lastUser.userID) {
      const match = lastUser.userID.match(/\d+$/);
      if (match && match[0]) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    this.userID = `FLIPI${String(nextNumber).padStart(4, '0')}`;
  } catch (err) {
    throw err;
  }
});

module.exports = mongoose.model('User', userSchema);
