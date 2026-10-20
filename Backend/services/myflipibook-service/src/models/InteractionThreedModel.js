const mongoose = require('mongoose');
const crypto = require('crypto');

const generateId = () => crypto.randomBytes(10).toString('hex');

const InteractionThreedModelSchema = new mongoose.Schema({
  v_id: {
    type: String,
    default: generateId,
    unique: true,
    index: true
  },
  flipbook_v_id: {
    type: String,
    default: null,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  flipbookName: {
    type: String,
    required: true
  },
  folderName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    default: null
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: '0 MB'
  },
  type: {
    type: String,
    default: 'glb'
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

const InteractionThreedModel =
  mongoose.models.InteractionThreedModel || mongoose.model('InteractionThreedModel', InteractionThreedModelSchema);

module.exports = InteractionThreedModel;
