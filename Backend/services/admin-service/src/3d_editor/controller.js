const path = require('path');
const fs = require('fs');
const { DefaultModel, PresetHdri, PresetMaterial } = require('./models');
const { storageRoot } = require('./uploadMiddleware');

// Format file size helper
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

// Convert stored absolute/relative paths to web-accessible URLs
const toStorageUrl = (fullPath) => {
  if (!fullPath) return null;
  if (fullPath.startsWith('http://') || fullPath.startsWith('https://')) return fullPath;
  const rel = path.relative(storageRoot, fullPath).replace(/\\/g, '/');
  return `/storage/${rel}`;
};

// Helper to delete a folder recursively if empty or when deleting asset
const removeFolderSafely = (folderPath) => {
  try {
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn('[Admin 3D] Failed to remove asset directory:', folderPath, err.message);
  }
};

// ============================================================================
// 1. PREDEFINED 3D MODELS
// ============================================================================

const listModels = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const models = await DefaultModel.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      count: models.length,
      data: models.map((m) => ({
        ...m,
        url: toStorageUrl(m.url),
        thumbnailUrl: toStorageUrl(m.thumbnailUrl)
      }))
    });
  } catch (error) {
    console.error('[Admin 3D] Error fetching models:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createModel = async (req, res) => {
  try {
    const { name, category, description, order } = req.body;
    if (!req.files || !req.files.modelFile || req.files.modelFile.length === 0) {
      return res.status(400).json({ success: false, message: 'Model file (.glb/.gltf/.obj) is required' });
    }

    const modelFile = req.files.modelFile[0];
    const thumbFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

    const ext = path.extname(modelFile.originalname).toLowerCase().replace('.', '');
    const modelRecord = new DefaultModel({
      name: name || path.basename(modelFile.originalname, path.extname(modelFile.originalname)),
      category: category || 'General',
      description: description || '',
      url: toStorageUrl(modelFile.path),
      thumbnailUrl: thumbFile ? toStorageUrl(thumbFile.path) : null,
      size: formatBytes(modelFile.size),
      type: ext || 'glb',
      order: order ? Number(order) : 0
    });

    await modelRecord.save();
    res.status(201).json({ success: true, message: '3D Model uploaded successfully', data: modelRecord });
  } catch (error) {
    console.error('[Admin 3D] Error creating model:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteModel = async (req, res) => {
  try {
    const { id } = req.params;
    const model = await DefaultModel.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }

    // Clean up entire asset folder if it resides in storage/3d_assets/models/
    if (model.url && model.url.startsWith('/storage/3d_assets/models/')) {
      const rel = model.url.replace('/storage/', '');
      const itemFolder = path.dirname(path.join(storageRoot, rel));
      removeFolderSafely(itemFolder);
    } else {
      if (model.url && model.url.startsWith('/storage/')) {
        const filePath = path.join(storageRoot, model.url.replace('/storage/', ''));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      if (model.thumbnailUrl && model.thumbnailUrl.startsWith('/storage/')) {
        const thumbPath = path.join(storageRoot, model.thumbnailUrl.replace('/storage/', ''));
        if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
      }
    }

    await DefaultModel.deleteOne({ _id: model._id });
    res.status(200).json({ success: true, message: 'Model deleted successfully' });
  } catch (error) {
    console.error('[Admin 3D] Error deleting model:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const model = await DefaultModel.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }

    const { name, category, description, order } = req.body;
    if (name !== undefined) model.name = name;
    if (category !== undefined) model.category = category;
    if (description !== undefined) model.description = description;
    if (order !== undefined) model.order = Number(order);

    if (req.files && req.files.modelFile && req.files.modelFile.length > 0) {
      const modelFile = req.files.modelFile[0];
      // remove old file if exists
      if (model.url && model.url.startsWith('/storage/')) {
        const oldPath = path.join(storageRoot, model.url.replace('/storage/', ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      model.url = toStorageUrl(modelFile.path);
      model.size = formatBytes(modelFile.size);
      model.type = path.extname(modelFile.originalname).toLowerCase().replace('.', '') || 'glb';
    }

    if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
      const thumbFile = req.files.thumbnail[0];
      if (model.thumbnailUrl && model.thumbnailUrl.startsWith('/storage/')) {
        const oldThumb = path.join(storageRoot, model.thumbnailUrl.replace('/storage/', ''));
        if (fs.existsSync(oldThumb)) fs.unlinkSync(oldThumb);
      }
      model.thumbnailUrl = toStorageUrl(thumbFile.path);
    } else if (req.body.removedFiles) {
      try {
        const removed = JSON.parse(req.body.removedFiles);
        if (removed.includes('thumbnail')) {
          if (model.thumbnailUrl && model.thumbnailUrl.startsWith('/storage/')) {
            const oldThumb = path.join(storageRoot, model.thumbnailUrl.replace('/storage/', ''));
            if (fs.existsSync(oldThumb)) fs.unlinkSync(oldThumb);
          }
          model.thumbnailUrl = null;
        }
      } catch (_) {}
    }

    await model.save();
    res.status(200).json({ success: true, message: 'Model updated successfully', data: model });
  } catch (error) {
    console.error('[Admin 3D] Error updating model:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 2. PREDEFINED HDRIs (Environments)
// ============================================================================

const listHdris = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const hdris = await PresetHdri.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      count: hdris.length,
      data: hdris.map((h) => ({
        ...h,
        file: toStorageUrl(h.file),
        preview: toStorageUrl(h.preview)
      }))
    });
  } catch (error) {
    console.error('[Admin 3D] Error listing HDRIs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createHdri = async (req, res) => {
  try {
    const { name, category, order, aliases } = req.body;
    if (!req.files || !req.files.hdriFile || req.files.hdriFile.length === 0) {
      return res.status(400).json({ success: false, message: 'HDRI (.hdr / .exr) file is required' });
    }

    const hdriFile = req.files.hdriFile[0];
    const previewFile = req.files.preview ? req.files.preview[0] : null;

    const baseId = (name || path.basename(hdriFile.originalname))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const parsedAliases = aliases
      ? (Array.isArray(aliases) ? aliases : aliases.split(',').map((s) => s.trim()))
      : [];

    const hdriRecord = new PresetHdri({
      id: `${baseId}_${Date.now()}`,
      name: name || 'Custom Environment',
      category: category || 'Studio',
      aliases: parsedAliases,
      file: toStorageUrl(hdriFile.path),
      preview: previewFile ? toStorageUrl(previewFile.path) : toStorageUrl(hdriFile.path),
      order: order ? Number(order) : 0
    });

    await hdriRecord.save();
    res.status(201).json({ success: true, message: 'HDRI uploaded successfully', data: hdriRecord });
  } catch (error) {
    console.error('[Admin 3D] Error uploading HDRI:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteHdri = async (req, res) => {
  try {
    const { id } = req.params;
    const hdri = await PresetHdri.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!hdri) {
      return res.status(404).json({ success: false, message: 'HDRI not found' });
    }

    if (hdri.file && hdri.file.startsWith('/storage/3d_assets/hdris/')) {
      const rel = hdri.file.replace('/storage/', '');
      const itemFolder = path.dirname(path.join(storageRoot, rel));
      removeFolderSafely(itemFolder);
    } else {
      if (hdri.file && hdri.file.startsWith('/storage/')) {
        const filePath = path.join(storageRoot, hdri.file.replace('/storage/', ''));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      if (hdri.preview && hdri.preview.startsWith('/storage/')) {
        const prevPath = path.join(storageRoot, hdri.preview.replace('/storage/', ''));
        if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
      }
    }

    await PresetHdri.deleteOne({ _id: hdri._id });
    res.status(200).json({ success: true, message: 'HDRI deleted successfully' });
  } catch (error) {
    console.error('[Admin 3D] Error deleting HDRI:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateHdri = async (req, res) => {
  try {
    const { id } = req.params;
    const hdri = await PresetHdri.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!hdri) {
      return res.status(404).json({ success: false, message: 'HDRI not found' });
    }

    const { name, category, aliases, order } = req.body;
    if (name !== undefined) hdri.name = name;
    if (category !== undefined) hdri.category = category;
    if (aliases !== undefined) {
      hdri.aliases = Array.isArray(aliases) ? aliases : aliases.split(',').map((s) => s.trim());
    }
    if (order !== undefined) hdri.order = Number(order);

    if (req.files && req.files.hdriFile && req.files.hdriFile.length > 0) {
      const hdriFile = req.files.hdriFile[0];
      if (hdri.file && hdri.file.startsWith('/storage/')) {
        const oldFile = path.join(storageRoot, hdri.file.replace('/storage/', ''));
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }
      hdri.file = toStorageUrl(hdriFile.path);
    }

    if (req.files && req.files.preview && req.files.preview.length > 0) {
      const previewFile = req.files.preview[0];
      if (hdri.preview && hdri.preview.startsWith('/storage/')) {
        const oldPrev = path.join(storageRoot, hdri.preview.replace('/storage/', ''));
        if (fs.existsSync(oldPrev)) fs.unlinkSync(oldPrev);
      }
      hdri.preview = toStorageUrl(previewFile.path);
    } else if (req.body.removedFiles) {
      try {
        const removed = JSON.parse(req.body.removedFiles);
        if (removed.includes('preview')) {
          if (hdri.preview && hdri.preview.startsWith('/storage/')) {
            const oldPrev = path.join(storageRoot, hdri.preview.replace('/storage/', ''));
            if (fs.existsSync(oldPrev)) fs.unlinkSync(oldPrev);
          }
          hdri.preview = null;
        }
      } catch (_) {}
    }

    await hdri.save();
    res.status(200).json({ success: true, message: 'HDRI updated successfully', data: hdri });
  } catch (error) {
    console.error('[Admin 3D] Error updating HDRI:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 3. PREDEFINED PBR MATERIALS
// ============================================================================

const listMaterials = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const materials = await PresetMaterial.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials.map((m) => {
        const mappedMaps = { ...(m.maps || {}) };
        for (const k in mappedMaps) {
          if (mappedMaps[k]) mappedMaps[k] = toStorageUrl(mappedMaps[k]);
        }
        return {
          ...m,
          preview: toStorageUrl(m.preview),
          maps: mappedMaps
        };
      })
    });
  } catch (error) {
    console.error('[Admin 3D] Error listing materials:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createMaterial = async (req, res) => {
  try {
    const { name, category, color, metallic, roughness, alpha, order } = req.body;
    const files = req.files || {};

    const previewFile = files.preview ? files.preview[0] : null;

    const maps = {
      map: files.map ? toStorageUrl(files.map[0].path) : null,
      normalMap: files.normalMap ? toStorageUrl(files.normalMap[0].path) : null,
      roughnessMap: files.roughnessMap ? toStorageUrl(files.roughnessMap[0].path) : null,
      metalnessMap: files.metalnessMap ? toStorageUrl(files.metalnessMap[0].path) : null,
      aoMap: files.aoMap ? toStorageUrl(files.aoMap[0].path) : null,
      displacementMap: files.displacementMap ? toStorageUrl(files.displacementMap[0].path) : null
    };

    const baseId = (name || 'material')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const materialRecord = new PresetMaterial({
      id: `${baseId}_${Date.now()}`,
      name: name || 'Custom Material',
      category: category || 'General',
      preview: previewFile ? toStorageUrl(previewFile.path) : (maps.map || null),
      maps,
      color: color || null,
      metallic: metallic !== undefined && metallic !== '' ? Number(metallic) : null,
      roughness: roughness !== undefined && roughness !== '' ? Number(roughness) : null,
      alpha: alpha !== undefined && alpha !== '' ? Number(alpha) : null,
      order: order ? Number(order) : 0
    });

    await materialRecord.save();
    res.status(201).json({ success: true, message: 'Material created successfully', data: materialRecord });
  } catch (error) {
    console.error('[Admin 3D] Error creating material:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await PresetMaterial.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Clean up dedicated folder if stored in subfolder
    let cleanedFolder = false;
    const previewUrl = typeof material.preview === 'string' ? material.preview : '';
    if (previewUrl.startsWith('/storage/3d_assets/materials/')) {
      const rel = previewUrl.replace('/storage/', '');
      const itemFolder = path.dirname(path.join(storageRoot, rel));
      removeFolderSafely(itemFolder);
      cleanedFolder = true;
    }

    if (!cleanedFolder) {
      if (previewUrl && previewUrl.startsWith('/storage/')) {
        const prevPath = path.join(storageRoot, previewUrl.replace('/storage/', ''));
        if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
      }

      if (material.maps) {
        const mapsObj = typeof material.maps.toObject === 'function' ? material.maps.toObject() : material.maps;
        for (const k of Object.keys(mapsObj)) {
          const mUrl = mapsObj[k];
          if (typeof mUrl === 'string' && mUrl.startsWith('/storage/')) {
            const mPath = path.join(storageRoot, mUrl.replace('/storage/', ''));
            if (fs.existsSync(mPath)) fs.unlinkSync(mPath);
          }
        }
      }
    }

    await PresetMaterial.deleteOne({ _id: material._id });
    res.status(200).json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    console.error('[Admin 3D] Error deleting material:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await PresetMaterial.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const { name, category, color, metallic, roughness, alpha, order } = req.body;
    if (name !== undefined) material.name = name;
    if (category !== undefined) material.category = category;
    if (color !== undefined) material.color = color || null;
    if (metallic !== undefined) material.metallic = metallic !== '' && metallic !== null ? Number(metallic) : null;
    if (roughness !== undefined) material.roughness = roughness !== '' && roughness !== null ? Number(roughness) : null;
    if (alpha !== undefined) material.alpha = alpha !== '' && alpha !== null ? Number(alpha) : null;
    if (order !== undefined) material.order = Number(order);

    const files = req.files || {};
    let removedList = [];
    if (req.body.removedFiles) {
      try {
        removedList = typeof req.body.removedFiles === 'string' ? JSON.parse(req.body.removedFiles) : req.body.removedFiles;
      } catch (_) {
        removedList = [];
      }
    }

    if (files.preview && files.preview.length > 0) {
      if (material.preview && material.preview.startsWith('/storage/')) {
        const oldP = path.join(storageRoot, material.preview.replace('/storage/', ''));
        if (fs.existsSync(oldP)) fs.unlinkSync(oldP);
      }
      material.preview = toStorageUrl(files.preview[0].path);
    } else if (removedList.includes('preview')) {
      if (material.preview && material.preview.startsWith('/storage/')) {
        const oldP = path.join(storageRoot, material.preview.replace('/storage/', ''));
        if (fs.existsSync(oldP)) fs.unlinkSync(oldP);
      }
      material.preview = null;
    }

    // Replace maps if provided or remove if marked as removed
    const mapKeys = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'displacementMap'];
    if (!material.maps) material.maps = {};
    for (const key of mapKeys) {
      if (files[key] && files[key].length > 0) {
        if (typeof material.maps[key] === 'string' && material.maps[key].startsWith('/storage/')) {
          const oldM = path.join(storageRoot, material.maps[key].replace('/storage/', ''));
          if (fs.existsSync(oldM)) fs.unlinkSync(oldM);
        }
        material.maps[key] = toStorageUrl(files[key][0].path);
      } else if (removedList.includes(key)) {
        if (typeof material.maps[key] === 'string' && material.maps[key].startsWith('/storage/')) {
          const oldM = path.join(storageRoot, material.maps[key].replace('/storage/', ''));
          if (fs.existsSync(oldM)) fs.unlinkSync(oldM);
        }
        material.maps[key] = null;
      }
    }

    // If preview was removed or never set, fallback to albedo map if available
    if (!material.preview && material.maps && material.maps.map) {
      material.preview = material.maps.map;
    }

    material.markModified('maps');

    await material.save();
    res.status(200).json({ success: true, message: 'Material updated successfully', data: material });
  } catch (error) {
    console.error('[Admin 3D] Error updating material:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listModels,
  createModel,
  updateModel,
  deleteModel,
  listHdris,
  createHdri,
  updateHdri,
  deleteHdri,
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
