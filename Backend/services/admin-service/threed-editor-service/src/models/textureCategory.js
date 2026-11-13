const mongoose = require('mongoose');
const crypto = require('crypto');

const generateId = () => crypto.randomBytes(6).toString('hex');

const textureCategorySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: generateId
  },
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  emailId: {
    type: String,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

textureCategorySchema.pre('save', function (next) {
  if (this.userEmail && !this.emailId) {
    this.emailId = this.userEmail;
  } else if (this.emailId && !this.userEmail) {
    this.userEmail = this.emailId;
  }
  if (typeof next === 'function') next();
});

textureCategorySchema.index({ userEmail: 1, name: 1 }, { unique: true });

const TextureCategory = (mongoose.models.textureCategory || mongoose.models.TextureCategory) || mongoose.model('textureCategory', textureCategorySchema);

module.exports = TextureCategory;
