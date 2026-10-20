const fs = require('fs');
const path = require('path');
const Texture = require('../models/Texture');
const TextureCategory = require('../models/TextureCategory');
const {
  getUserTextureDir,
  getTempChunkDir,
  assembleChunks,
  toStorageUrl
} = require('../utils/storageHelper');

/**
 * POST /api/textures/add
 */
const addTexture = async (req, res) => {
  try {
    const materialName = req.body.materialName;
    const materialCategory = req.body.materialCategory;
    const userEmail = req.body.userEmail || req.body.email || req.body.emailId;
    const existingMaps = req.body.maps;

    if (!materialName || !materialCategory || !userEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let mappedUrls = {
      preview: null,
      base: null,
      metallic: null,
      roughness: null,
      normal: null,
      ao: null,
      displacement: null,
      opacity: null,
      emissive: null
    };

    if (existingMaps) {
      try {
        const parsed = typeof existingMaps === 'string' ? JSON.parse(existingMaps) : existingMaps;
        mappedUrls = { ...mappedUrls, ...parsed };
      } catch (_) {}
    }

    // Direct file uploads if provided
    if (req.files && Object.keys(req.files).length > 0) {
      const userDir = await getUserTextureDir(userEmail, materialName, req);
      for (const field of ['preview', 'base', 'metallic', 'roughness', 'normal', 'ao', 'displacement', 'opacity', 'emissive']) {
        if (req.files[field] && req.files[field][0]) {
          const file = req.files[field][0];
          const ext = path.extname(file.originalname);
          const destName = `${field}${ext}`;
          const destPath = path.join(userDir, destName);
          fs.copyFileSync(file.path, destPath);
          try { fs.unlinkSync(file.path); } catch (_) {}
          mappedUrls[field] = toStorageUrl(destPath);
        }
      }
    }

    // Resolve materialCategory
    let categoryId = materialCategory;
    if (typeof materialCategory === 'string') {
      const existingCat = await TextureCategory.findOne({
        $or: [{ _id: materialCategory }, { userEmail, name: materialCategory }]
      });
      if (!existingCat) {
        const newCat = await TextureCategory.findOneAndUpdate(
          { userEmail, name: materialCategory },
          { userEmail, name: materialCategory },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        categoryId = newCat._id;
      } else {
        categoryId = existingCat._id;
      }
    }

    const newTexture = new Texture({
      userEmail,
      materialName: materialName.trim(),
      materialCategory: categoryId,
      maps: mappedUrls
    });

    await newTexture.save();

    res.status(201).json({
      success: true,
      message: 'Texture added successfully',
      texture: newTexture
    });
  } catch (error) {
    console.error('[Textures] Error adding texture:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * POST /api/textures/upload-chunk
 */
const uploadTextureChunk = async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, fileName, userEmail, materialName, fieldName } = req.body;

    if (!uploadId || !userEmail || !fileName || !materialName) {
      return res.status(400).json({ message: 'Missing required chunk metadata' });
    }

    const curIndex = parseInt(chunkIndex, 10);
    const total = parseInt(totalChunks, 10);
    const tempDir = await getTempChunkDir(`tex_${uploadId}`, userEmail, req);

    if (req.file) {
      const chunkFileDest = path.join(tempDir, `chunk_${curIndex}`);
      if (req.file.path !== chunkFileDest) {
        fs.copyFileSync(req.file.path, chunkFileDest);
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
    }

    if (curIndex === total - 1) {
      const userDir = await getUserTextureDir(userEmail, materialName, req);
      const ext = path.extname(fileName);
      const safeField = (fieldName || 'map').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFileName = `${safeField}${ext}`;
      const finalPath = path.join(userDir, uniqueFileName);

      await assembleChunks(tempDir, finalPath, total);

      const mapUrl = toStorageUrl(finalPath);
      return res.status(200).json({
        message: 'Chunk merged successfully',
        url: mapUrl,
        fieldName
      });
    }

    res.status(200).json({ message: `Chunk ${curIndex} accepted` });
  } catch (error) {
    console.error('[Textures] Chunk upload error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * GET /api/textures/get
 */
const getUserTextures = async (req, res) => {
  try {
    const email = req.query.email || req.query.userEmail || req.query.emailId || req.user?.emailId || req.user?.email;
    const userID = req.query.userID || req.user?.userID || req.user?.userId;
    if (!email && !userID) {
      return res.status(400).json({ message: 'User email or userID required' });
    }

    const queryConditions = [];
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      queryConditions.push({ userEmail: cleanEmail }, { emailId: cleanEmail }, { userEmail: email }, { emailId: email });
    }
    if (userID) {
      queryConditions.push({ userEmail: userID }, { emailId: userID }, { userID: userID });
    }

    const textures = await Texture.find({ $or: queryConditions }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: textures.length, textures });
  } catch (error) {
    console.error('[Textures] Error fetching textures:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * PUT /api/textures/update/:id
 */
const updateTexture = async (req, res) => {
  try {
    const { id } = req.params;
    const { materialName, materialCategory, maps } = req.body;

    const texture = await Texture.findById(id);
    if (!texture) {
      return res.status(404).json({ message: 'Texture not found' });
    }

    if (materialName) texture.materialName = materialName.trim();
    if (materialCategory) texture.materialCategory = materialCategory;
    if (maps) {
      const parsedMaps = typeof maps === 'string' ? JSON.parse(maps) : maps;
      texture.maps = { ...texture.maps.toObject(), ...parsedMaps };
    }

    await texture.save();

    res.status(200).json({ success: true, message: 'Texture updated', texture });
  } catch (error) {
    console.error('[Textures] Update error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * DELETE /api/textures/delete/:id
 */
const deleteTexture = async (req, res) => {
  try {
    const { id } = req.params;
    const texture = await Texture.findById(id);
    if (!texture) {
      return res.status(404).json({ message: 'Texture not found' });
    }

    // Delete texture folder if exists
    try {
      const userDir = await getUserTextureDir(texture.userEmail, texture.materialName, req);
      if (fs.existsSync(userDir)) {
        fs.rmSync(userDir, { recursive: true, force: true });
      }
    } catch (_) {}

    await Texture.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Texture deleted successfully' });
  } catch (error) {
    console.error('[Textures] Delete error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  addTexture,
  uploadTextureChunk,
  getUserTextures,
  updateTexture,
  deleteTexture
};
