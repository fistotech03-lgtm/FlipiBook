const mongoose = require('mongoose');
const crypto = require('crypto');

const generateId = () => crypto.randomBytes(10).toString('hex');

const threedModelSchema = new mongoose.Schema({
  modelId: {
    type: String,
    default: generateId,
    unique: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  // Alias for compatibility
  emailId: {
    type: String,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  size: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'glb'
  },
  displayName: {
    type: String,
    default: null
  },
  hotspots: {
    type: Array,
    default: []
  },
  materialSettings: {
    type: Object,
    default: null
  },
  transformValues: {
    type: Object,
    default: null
  },
  sceneModels: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

threedModelSchema.pre('save', function (next) {
  if (this.userEmail && !this.emailId) {
    this.emailId = this.userEmail;
  } else if (this.emailId && !this.userEmail) {
    this.userEmail = this.emailId;
  }
  this.updatedAt = new Date();
  if (typeof next === 'function') next();
});

const ThreedModel = (mongoose.models.threedModel || mongoose.models.ThreedModel) || mongoose.model('threedModel', threedModelSchema);

module.exports = ThreedModel;
