const fs = require('fs');
const path = require('path');
const ThreedModel = require('../models/ThreedModel');
const InteractionThreedModel = require('../models/InteractionThreedModel');
const {
  generateId,
  getUser3DDir,
  getTempChunkDir,
  getConvertedDir,
  assembleChunks,
  toStorageUrl,
  sanitizeFileName
} = require('../utils/storageHelper');
const { isGlbFormat, convertWithAssimp } = require('../utils/assimpConverter');

/**
 * GET /api/3d-models/get-models
 * Get all 3D models for user
 */
const getModels = async (req, res) => {
  try {
    const emailId =
      req.query.emailId ||
      req.query.userEmail ||
      (req.user && (req.user.emailId || req.user.email)) ||
      '';

    if (!emailId) {
      return res.status(400).json({ success: false, message: 'Email ID is required' });
    }

    const cleanEmail = emailId.trim().toLowerCase();
    const dbModels = await ThreedModel.find({
      $or: [{ userEmail: cleanEmail }, { emailId: cleanEmail }, { userEmail: emailId }, { emailId }]
    }).sort({ createdAt: -1 });

    const models = dbModels.map((m) => ({
      modelId: m.modelId,
      name: m.name,
      displayName: m.displayName || null,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      size: m.size,
      type: m.type || 'glb',
      hotspots: Array.isArray(m.hotspots) ? m.hotspots : [],
      materialSettings: m.materialSettings || null,
      transformValues: m.transformValues || null,
      sceneModels: Array.isArray(m.sceneModels) ? m.sceneModels : [],
      uploadedAt: m.createdAt,
      updatedAt: m.updatedAt || m.createdAt
    }));

    res.status(200).json({ success: true, count: models.length, models });
  } catch (error) {
    console.error('[3D Models] Error fetching models:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * GET /api/3d-models/get-model/:modelId
 * Get single 3D model metadata
 */
const getModelById = async (req, res) => {
  try {
    const { modelId } = req.params;
    if (!modelId) {
      return res.status(400).json({ success: false, message: 'Model ID is required' });
    }

    let model = await ThreedModel.findOne({ modelId });
    if (model) {
      const modelObj = model.toObject ? model.toObject() : model;
      return res.status(200).json({
        ...modelObj,
        materialSettings: model.materialSettings || null,
        transformValues: model.transformValues || null,
        sceneModels: Array.isArray(model.sceneModels) ? model.sceneModels : [],
        hotspots: Array.isArray(model.hotspots) ? model.hotspots : [],
        updatedAt: model.updatedAt || model.createdAt
      });
    }

    const interactionModel = await InteractionThreedModel.findOne({ v_id: modelId });
    if (interactionModel) {
      const modelObj = interactionModel.toObject ? interactionModel.toObject() : interactionModel;
      return res.status(200).json({
        ...modelObj,
        modelId: interactionModel.v_id,
        name: interactionModel.fileName,
        displayName: interactionModel.displayName || null,
        materialSettings: interactionModel.materialSettings || null,
        transformValues: interactionModel.transformValues || null,
        sceneModels: Array.isArray(interactionModel.sceneModels) ? interactionModel.sceneModels : [],
        hotspots: Array.isArray(interactionModel.hotspots) ? interactionModel.hotspots : [],
        updatedAt: interactionModel.updatedAt || interactionModel.createdAt
      });
    }

    return res.status(404).json({ success: false, message: 'Model not found' });
  } catch (error) {
    console.error('[3D Models] Error fetching model by ID:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * POST /api/3d-models/upload-chunk
 * Receive file chunks and assemble
 */
const uploadChunk = async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, fileName, emailId, modelId } = req.body;

    if (!uploadId || !fileName) {
      return res.status(400).json({ message: 'Missing required chunk metadata' });
    }

    const curIndex = parseInt(chunkIndex, 10);
    const total = parseInt(totalChunks, 10);
    const tempDir = getTempChunkDir(uploadId);

    // Save uploaded chunk
    if (req.file) {
      const chunkFileDest = path.join(tempDir, `chunk_${curIndex}`);
      if (req.file.path !== chunkFileDest) {
        fs.copyFileSync(req.file.path, chunkFileDest);
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
    }

    // When last chunk arrives, assemble
    if (curIndex === total - 1) {
      const userDir = getUser3DDir(emailId);
      const ext = path.extname(fileName);
      const rawBase = path.basename(fileName, ext);
      const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
      const forceNew = req.body.forceNew === 'true' || req.body.forceNew === true;

      let candidateBase = safeBase;
      if (forceNew && !modelId) {
        let counter = 1;
        let checkName = `${candidateBase}${ext}`;
        while (await ThreedModel.findOne({ userEmail: emailId, name: checkName })) {
          checkName = `${candidateBase}_(${counter})${ext}`;
          counter++;
        }
        candidateBase = path.basename(checkName, ext);
      }

      const tempMergedPath = path.join(tempDir, `${candidateBase}_merged${ext}`);
      await assembleChunks(tempDir, tempMergedPath, total);

      let finalFilePath = tempMergedPath;
      let finalFileName = `${candidateBase}${ext}`;

      // Convert to GLB if needed
      if (!isGlbFormat(fileName)) {
        finalFileName = `${candidateBase}.glb`;
        const convertedGlbPath = path.join(tempDir, finalFileName);
        try {
          await convertWithAssimp(tempMergedPath, convertedGlbPath);
          finalFilePath = convertedGlbPath;
        } catch (convErr) {
          console.warn('[3D Models] Conversion warning:', convErr.message);
        }
      }

      // Move into permanent user directory
      const destPath = path.join(userDir, finalFileName);
      if (fs.existsSync(destPath)) {
        try { fs.unlinkSync(destPath); } catch (_) {}
      }
      fs.copyFileSync(finalFilePath, destPath);

      // Clean up temp
      try {
        if (fs.existsSync(tempMergedPath)) fs.unlinkSync(tempMergedPath);
        if (fs.existsSync(finalFilePath) && finalFilePath !== destPath) fs.unlinkSync(finalFilePath);
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (_) {}

      const stats = fs.statSync(destPath);
      const sizeStr = `${(stats.size / (1024 * 1024)).toFixed(2)} MB`;
      const modelUrl = toStorageUrl(destPath);

      let parsedHotspots = [];
      if (req.body.hotspots) {
        try {
          parsedHotspots = typeof req.body.hotspots === 'string' ? JSON.parse(req.body.hotspots) : req.body.hotspots;
        } catch (_) {}
      }

      let parsedMaterialSettings = null;
      if (req.body.materialSettings) {
        try {
          parsedMaterialSettings = typeof req.body.materialSettings === 'string' ? JSON.parse(req.body.materialSettings) : req.body.materialSettings;
        } catch (_) {}
      }

      let parsedTransformValues = null;
      if (req.body.transformValues) {
        try {
          parsedTransformValues = typeof req.body.transformValues === 'string' ? JSON.parse(req.body.transformValues) : req.body.transformValues;
        } catch (_) {}
      }

      let parsedSceneModels = [];
      if (req.body.sceneModels) {
        try {
          parsedSceneModels = typeof req.body.sceneModels === 'string' ? JSON.parse(req.body.sceneModels) : req.body.sceneModels;
        } catch (_) {}
      }

      // Find or create model record in DB
      let model = null;
      if (modelId) {
        model = await ThreedModel.findOne({ modelId });
      }
      if (!forceNew && !model) {
        model = await ThreedModel.findOne({ userEmail: emailId, name: finalFileName });
      }

      if (model) {
        model.name = finalFileName;
        model.url = modelUrl;
        model.size = sizeStr;
        if (parsedHotspots.length > 0) model.hotspots = parsedHotspots;
        if (parsedMaterialSettings) model.materialSettings = parsedMaterialSettings;
        if (parsedTransformValues) model.transformValues = parsedTransformValues;
        if (parsedSceneModels.length > 0) model.sceneModels = parsedSceneModels;
        model.updatedAt = new Date();
        await model.save();
      } else {
        const newModelId = modelId || generateId(20);
        model = new ThreedModel({
          modelId: newModelId,
          userEmail: emailId,
          name: finalFileName,
          displayName: rawBase,
          url: modelUrl,
          size: sizeStr,
          type: 'glb',
          hotspots: parsedHotspots,
          materialSettings: parsedMaterialSettings,
          transformValues: parsedTransformValues,
          sceneModels: parsedSceneModels
        });
        await model.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Model uploaded successfully',
        model: {
          modelId: model.modelId,
          name: model.name,
          displayName: model.displayName || model.name,
          url: model.url,
          thumbnailUrl: model.thumbnailUrl,
          size: model.size,
          type: model.type,
          hotspots: model.hotspots,
          materialSettings: model.materialSettings,
          transformValues: model.transformValues,
          sceneModels: model.sceneModels
        }
      });
    }

    res.status(200).json({ success: true, message: `Chunk ${curIndex} accepted` });
  } catch (error) {
    console.error('[3D Models] Error in uploadChunk:', error);
    res.status(500).json({ success: false, message: error.message || 'Chunk upload failed' });
  }
};

/**
 * POST /api/3d-models/convert-model
 * Convert any 3D model to GLB
 */
const convertModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded for conversion' });
    }

    const convertedDir = getConvertedDir();
    const originalExt = path.extname(req.file.originalname).toLowerCase();
    const baseName = path.basename(req.file.originalname, originalExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const outputGlbName = `${baseName}_converted_${Date.now()}.glb`;
    const outputGlbPath = path.join(convertedDir, outputGlbName);

    if (originalExt === '.glb') {
      fs.copyFileSync(req.file.path, outputGlbPath);
    } else {
      await convertWithAssimp(req.file.path, outputGlbPath);
    }

    const stats = fs.statSync(outputGlbPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    const downloadUrl = `/api/3d-models/converted/${outputGlbName}`;

    res.status(200).json({
      success: true,
      message: 'Model converted successfully',
      url: downloadUrl,
      name: baseName,
      sizeInMB
    });
  } catch (error) {
    console.error('[3D Models] Convert error:', error);
    res.status(500).json({ success: false, message: error.message || 'Conversion failed' });
  }
};

/**
 * GET /api/3d-models/converted/:filename
 * Serve converted GLB file
 */
const getConvertedFile = (req, res) => {
  const { filename } = req.params;
  const safeName = sanitizeFileName(filename);
  const filePath = path.join(getConvertedDir(), safeName);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.status(404).json({ message: 'Converted file not found' });
};

/**
 * POST /api/3d-models/save-settings
 * Save materialSettings, transformValues, hotspots, sceneModels
 */
const saveSettings = async (req, res) => {
  try {
    const { modelId, materialSettings, transformValues, hotspots, sceneModels, models } = req.body;
    if (!modelId) {
      return res.status(400).json({ message: 'modelId is required' });
    }

    const update = { updatedAt: new Date() };
    if (materialSettings !== undefined) update.materialSettings = materialSettings;
    if (transformValues !== undefined) update.transformValues = transformValues;
    if (hotspots !== undefined) update.hotspots = Array.isArray(hotspots) ? hotspots : [];
    if (sceneModels !== undefined) update.sceneModels = Array.isArray(sceneModels) ? sceneModels : [];
    else if (models !== undefined) update.sceneModels = Array.isArray(models) ? models : [];

    let updated = await ThreedModel.findOneAndUpdate({ modelId }, { $set: update }, { new: true });
    if (!updated) {
      updated = await InteractionThreedModel.findOneAndUpdate({ v_id: modelId }, { $set: update }, { new: true });
    }

    res.status(200).json({ success: true, model: updated });
  } catch (error) {
    console.error('[3D Models] Save settings error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to save settings' });
  }
};

/**
 * POST /api/3d-models/save-hotspots
 * Dedicated hotspots save
 */
const saveHotspots = async (req, res) => {
  try {
    const { modelId, hotspots } = req.body;
    if (!modelId) {
      return res.status(400).json({ message: 'modelId is required' });
    }

    const cleanHotspots = Array.isArray(hotspots) ? hotspots : [];
    let updated = await ThreedModel.findOneAndUpdate(
      { modelId },
      { $set: { hotspots: cleanHotspots, updatedAt: new Date() } },
      { new: true }
    );
    if (!updated) {
      updated = await InteractionThreedModel.findOneAndUpdate(
        { v_id: modelId },
        { $set: { hotspots: cleanHotspots, updatedAt: new Date() } },
        { new: true }
      );
    }

    res.status(200).json({ success: true, modelId, hotspots: cleanHotspots });
  } catch (error) {
    console.error('[3D Models] Save hotspots error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to save hotspots' });
  }
};

/**
 * POST /api/3d-models/save-session & GET /api/3d-models/get-session
 */
const saveSession = async (req, res) => {
  try {
    const { emailId, state } = req.body;
    if (!emailId || !state) {
      return res.status(400).json({ message: 'Email and state are required' });
    }

    const userDir = getUser3DDir(emailId);
    const sessionFile = path.join(userDir, 'session.json');
    await fs.promises.writeFile(sessionFile, JSON.stringify(state, null, 2), 'utf-8');

    res.status(200).json({ success: true, message: '3D Session saved successfully' });
  } catch (error) {
    console.error('[3D Models] Save session error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const getSession = async (req, res) => {
  try {
    const emailId = req.query.emailId || req.query.userEmail;
    if (!emailId) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userDir = getUser3DDir(emailId);
    const sessionFile = path.join(userDir, 'session.json');
    if (fs.existsSync(sessionFile)) {
      const content = await fs.promises.readFile(sessionFile, 'utf-8');
      const state = JSON.parse(content);
      return res.status(200).json({ success: true, state, session: state });
    }

    res.status(404).json({ success: false, message: 'No active session found' });
  } catch (error) {
    console.warn('[3D Models] Notice: No session found:', error.message);
    res.status(404).json({ success: false, message: 'No active session found' });
  }
};

/**
 * POST /api/3d-models/rename-model
 */
const renameModel = async (req, res) => {
  try {
    const { emailId, oldName, newName, modelId } = req.body;
    if (!emailId || !oldName || !newName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const ext = path.extname(oldName);
    let cleanNewName = newName.replace(/[^a-z0-9._-]/gi, '_');
    if (!cleanNewName.toLowerCase().endsWith(ext.toLowerCase())) {
      cleanNewName += ext;
    }

    const userDir = getUser3DDir(emailId);
    const oldPath = path.join(userDir, oldName);
    const newPath = path.join(userDir, cleanNewName);

    if (fs.existsSync(oldPath)) {
      try {
        fs.renameSync(oldPath, newPath);
      } catch (rErr) {
        fs.copyFileSync(oldPath, newPath);
        fs.unlinkSync(oldPath);
      }
    }

    const newUrl = toStorageUrl(newPath);
    let model = null;
    if (modelId) {
      model = await ThreedModel.findOne({ modelId });
    }
    if (!model) {
      model = await ThreedModel.findOne({ userEmail: emailId, name: oldName });
    }

    if (model) {
      model.name = cleanNewName;
      model.url = newUrl;
      model.updatedAt = new Date();
      await model.save();
    }

    res.status(200).json({
      success: true,
      message: 'Model renamed successfully',
      newName: cleanNewName,
      url: newUrl
    });
  } catch (error) {
    console.error('[3D Models] Rename error:', error);
    res.status(500).json({ success: false, message: error.message || 'Rename failed' });
  }
};

/**
 * POST /api/3d-models/rename-label
 */
const renameLabel = async (req, res) => {
  try {
    const { emailId, modelId, newName } = req.body;
    if (!modelId || !newName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const cleanLabel = newName.trim();
    let model = await ThreedModel.findOneAndUpdate(
      { modelId },
      { $set: { displayName: cleanLabel, updatedAt: new Date() } },
      { new: true }
    );
    if (!model) {
      model = await InteractionThreedModel.findOneAndUpdate(
        { v_id: modelId },
        { $set: { displayName: cleanLabel, updatedAt: new Date() } },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Model label updated',
      displayName: cleanLabel
    });
  } catch (error) {
    console.error('[3D Models] Rename label error:', error);
    res.status(500).json({ success: false, message: error.message || 'Label rename failed' });
  }
};

/**
 * DELETE /api/3d-models/delete-model/:emailId/:modelId or /api/3d-models/delete-model/:modelId
 */
const deleteModel = async (req, res) => {
  try {
    const { emailId, modelId } = req.params;
    const targetModelId = modelId || emailId; // handles both URL shapes

    let model = await ThreedModel.findOne({
      $or: [{ modelId: targetModelId }, { _id: targetModelId.match(/^[0-9a-fA-F]{24}$/) ? targetModelId : null }]
    });

    if (model) {
      // Delete file on disk if exists
      const userDir = getUser3DDir(model.userEmail || emailId);
      const filePath = path.join(userDir, model.name);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
      }
      await ThreedModel.deleteOne({ modelId: model.modelId });
      return res.status(200).json({ success: true, message: 'Model deleted successfully' });
    }

    const interactionModel = await InteractionThreedModel.findOne({ v_id: targetModelId });
    if (interactionModel) {
      await InteractionThreedModel.deleteOne({ v_id: targetModelId });
      return res.status(200).json({ success: true, message: 'Interaction model deleted successfully' });
    }

    res.status(404).json({ success: false, message: 'Model record not found' });
  } catch (error) {
    console.error('[3D Models] Delete error:', error);
    res.status(500).json({ success: false, message: error.message || 'Delete failed' });
  }
};

/**
 * POST /api/3d-models/delete-multiple-models
 */
const deleteMultipleModels = async (req, res) => {
  try {
    const { emailId, modelIds } = req.body;
    if (!Array.isArray(modelIds) || modelIds.length === 0) {
      return res.status(400).json({ message: 'modelIds array is required' });
    }

    const models = await ThreedModel.find({ modelId: { $in: modelIds } });
    for (const m of models) {
      const userDir = getUser3DDir(m.userEmail || emailId);
      const filePath = path.join(userDir, m.name);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
      }
    }

    await ThreedModel.deleteMany({ modelId: { $in: modelIds } });
    await InteractionThreedModel.deleteMany({ v_id: { $in: modelIds } });

    res.status(200).json({ success: true, message: `${modelIds.length} models deleted` });
  } catch (error) {
    console.error('[3D Models] Multiple delete error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete models' });
  }
};

module.exports = {
  getModels,
  getModelById,
  uploadChunk,
  convertModel,
  getConvertedFile,
  saveSettings,
  saveHotspots,
  saveSession,
  getSession,
  renameModel,
  renameLabel,
  deleteModel,
  deleteMultipleModels
};
