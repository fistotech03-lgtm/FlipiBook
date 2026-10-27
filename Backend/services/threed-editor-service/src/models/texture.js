const mongoose = require('mongoose');

const textureSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  emailId: {
    type: String,
    index: true
  },
  materialName: {
    type: String,
    required: true
  },
  materialCategory: {
    type: String,
    ref: 'textureCategory',
    required: true
  },
  maps: {
    preview: { type: String, default: null },
    base: { type: String, default: null },
    metallic: { type: String, default: null },
    roughness: { type: String, default: null },
    normal: { type: String, default: null },
    ao: { type: String, default: null },
    displacement: { type: String, default: null },
    opacity: { type: String, default: null },
    emissive: { type: String, default: null }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

textureSchema.pre('save', function (next) {
  if (this.userEmail && !this.emailId) {
    this.emailId = this.userEmail;
  } else if (this.emailId && !this.userEmail) {
    this.userEmail = this.emailId;
  }
  if (typeof next === 'function') next();
});

const Texture = (mongoose.models.texture || mongoose.models.Texture) || mongoose.model('texture', textureSchema);

module.exports = Texture;
