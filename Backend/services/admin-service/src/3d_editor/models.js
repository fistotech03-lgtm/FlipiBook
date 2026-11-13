const mongoose = require('mongoose');
const crypto = require('crypto');

const generateId = () => crypto.randomBytes(8).toString('hex');

// 1. Default / Predefined 3D Model Schema
const defaultModelSchema = new mongoose.Schema({
  id: {
    type: String,
    default: generateId,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General',
    index: true
  },
  description: {
    type: String,
    default: ''
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
    default: '0 MB'
  },
  type: {
    type: String,
    default: 'glb'
  },
  order: {
    type: Number,
    default: 0
  },
  materialSettings: {
    type: Object,
    default: null
  },
  transformValues: {
    type: Object,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 2. Preset HDRI Environment Schema
const presetHdriSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  aliases: {
    type: [String],
    default: []
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  preview: {
    type: String,
    required: true
  },
  file: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 3. Preset PBR Material Schema
const presetMaterialSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  preview: {
    type: String,
    default: null
  },
  maps: {
    map: { type: String, default: null },
    normalMap: { type: String, default: null },
    roughnessMap: { type: String, default: null },
    displacementMap: { type: String, default: null },
    metalnessMap: { type: String, default: null },
    aoMap: { type: String, default: null },
    alphaMap: { type: String, default: null },
    emissiveMap: { type: String, default: null },
    bumpMap: { type: String, default: null }
  },
  color: {
    type: String,
    default: null
  },
  metallic: {
    type: Number,
    default: null
  },
  roughness: {
    type: Number,
    default: null
  },
  alpha: {
    type: Number,
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DefaultModel =
  (mongoose.models.defaultModel || mongoose.models.DefaultModel) ||
  mongoose.model('defaultModel', defaultModelSchema);

const PresetHdri =
  (mongoose.models.presetHdri || mongoose.models.PresetHdri) ||
  mongoose.model('presetHdri', presetHdriSchema);

const PresetMaterial =
  (mongoose.models.presetMaterial || mongoose.models.PresetMaterial) ||
  mongoose.model('presetMaterial', presetMaterialSchema);

module.exports = {
  DefaultModel,
  PresetHdri,
  PresetMaterial
};

