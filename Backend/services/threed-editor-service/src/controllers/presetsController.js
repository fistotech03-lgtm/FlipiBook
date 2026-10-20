const PresetHdri = require('../models/PresetHdri');
const PresetMaterial = require('../models/PresetMaterial');
const DefaultModel = require('../models/DefaultModel');
const { resolveUrl, generateId } = require('../utils/storageHelper');

/**
 * GET /api/presets/hdri
 */
const getHdriPresets = async (req, res) => {
  try {
    const list = await PresetHdri.find().sort({ order: 1, createdAt: 1 }).lean();
    const mapped = list.map((item) => ({
      ...item,
      preview: item.preview ? resolveUrl(req, item.preview) : null,
      file: item.file ? resolveUrl(req, item.file) : null
    }));

    res.status(200).json({ success: true, count: mapped.length, hdris: mapped });
  } catch (error) {
    console.error('[Presets] Error fetching HDRIs:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * GET /api/presets/materials
 */
const getMaterialPresets = async (req, res) => {
  try {
    const list = await PresetMaterial.find().sort({ order: 1, createdAt: 1 }).lean();
    const mapped = list.map((item) => {
      const mapsWithUrls = { ...(item.maps || {}) };
      for (const k in mapsWithUrls) {
        if (mapsWithUrls[k]) {
          mapsWithUrls[k] = resolveUrl(req, mapsWithUrls[k]);
        }
      }
      return {
        ...item,
        preview: item.preview ? resolveUrl(req, item.preview) : null,
        maps: mapsWithUrls
      };
    });

    res.status(200).json({ success: true, count: mapped.length, materials: mapped });
  } catch (error) {
    console.error('[Presets] Error fetching materials:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * GET /api/presets/models
 */
const getPresetModels = async (req, res) => {
  try {
    const models = await DefaultModel.find().sort({ order: 1, createdAt: 1 }).lean();
    const mapped = models.map((item) => ({
      ...item,
      url: resolveUrl(req, item.url),
      thumbnailUrl: item.thumbnailUrl ? resolveUrl(req, item.thumbnailUrl) : null
    }));

    res.status(200).json({ success: true, count: mapped.length, models: mapped });
  } catch (error) {
    console.error('[Presets] Error fetching default models:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * POST /api/presets/models
 */
const addPresetModel = async (req, res) => {
  try {
    const { name, category, description, modelUrl, thumbnailUrl } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Model name is required' });
    }

    const id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + Date.now().toString(36);
    const count = await DefaultModel.countDocuments();

    const newModel = new DefaultModel({
      id,
      name: name.trim(),
      category: (category && category.trim()) || 'General',
      description: description || '',
      url: modelUrl || '',
      thumbnailUrl: thumbnailUrl || null,
      size: '0 MB',
      type: 'glb',
      order: count
    });

    await newModel.save();

    res.status(201).json({
      success: true,
      message: 'Default model added successfully',
      model: {
        ...newModel.toObject(),
        url: resolveUrl(req, newModel.url),
        thumbnailUrl: newModel.thumbnailUrl ? resolveUrl(req, newModel.thumbnailUrl) : null
      }
    });
  } catch (error) {
    console.error('[Presets] Add default model error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * PUT /api/presets/models/:id
 */
const updatePresetModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, modelUrl, thumbnailUrl, order } = req.body;

    const existing = await DefaultModel.findOne({ id });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Default model not found' });
    }

    if (name) existing.name = name.trim();
    if (category) existing.category = category.trim();
    if (description !== undefined) existing.description = description;
    if (order !== undefined) existing.order = Number(order);
    if (modelUrl) existing.url = modelUrl;
    if (thumbnailUrl !== undefined) existing.thumbnailUrl = thumbnailUrl;

    await existing.save();

    res.status(200).json({
      success: true,
      message: 'Default model updated successfully',
      model: {
        ...existing.toObject(),
        url: resolveUrl(req, existing.url),
        thumbnailUrl: existing.thumbnailUrl ? resolveUrl(req, existing.thumbnailUrl) : null
      }
    });
  } catch (error) {
    console.error('[Presets] Update default model error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * DELETE /api/presets/models/:id
 */
const deletePresetModel = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DefaultModel.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Default model not found' });
    }
    res.status(200).json({ success: true, message: 'Default model deleted successfully', id });
  } catch (error) {
    console.error('[Presets] Delete default model error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getHdriPresets,
  getMaterialPresets,
  getPresetModels,
  addPresetModel,
  updatePresetModel,
  deletePresetModel
};
