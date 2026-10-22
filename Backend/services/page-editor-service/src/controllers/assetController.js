const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Flipbook = require("../models/Flipbook");
const FlipbookAsset = require("../models/FlipbookAsset");
const ThreedModel = require("../models/ThreedModel");
const InteractionThreedModel = require("../models/InteractionThreedModel");
const { getAuthUser } = require("../utils/userHelper");
const {
  generateId,
  getStorageRoot,
  sanitizeEmail,
  sanitizeName,
  resolveFolder,
  resolveFlipbookPaths,
  initFlipbookStorage
} = require('../utils/storageHelper');

/**
 * Helper to resolve user's folder on disk (e.g. FLIPI0001 or fistotech04_gmail_com)
 */
const resolveUserFolder = async (emailId, dbDoc = null) => {
  const sanitizedEmail = sanitizeEmail(emailId);
  let resolvedUserId = dbDoc?.userID || (dbDoc?.userId ? String(dbDoc.userId) : null);

  if (!resolvedUserId && emailId) {
    try {
      const anyBook = await Flipbook.findOne({
        userEmail: new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      }).select('userID userId');
      if (anyBook) {
        resolvedUserId = anyBook.userID || (anyBook.userId ? String(anyBook.userId) : null);
      }
    } catch (e) {}
  }

  if (!resolvedUserId && emailId) {
    try {
      if (mongoose.connection && mongoose.connection.db) {
        const userRec = await mongoose.connection.db.collection('users').findOne({
          emailId: new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
        });
        if (userRec && userRec.userID) {
          resolvedUserId = userRec.userID;
        }
      }
    } catch (e) {}
  }

  const storageRoot = getStorageRoot();
  if (!resolvedUserId) {
    try {
      if (fs.existsSync(storageRoot)) {
        const topDirs = fs.readdirSync(storageRoot);
        const flipiDir = topDirs.find(d => /^FLIPI\d+/i.test(d));
        if (flipiDir) {
          resolvedUserId = flipiDir;
        }
      }
    } catch (e) {}
  }

  const userFolder = resolvedUserId || sanitizedEmail;
  const candidateDirs = Array.from(new Set([resolvedUserId, userFolder, sanitizedEmail].filter(Boolean)));
  return { userFolder, resolvedUserId, sanitizedEmail, candidateDirs };
};

/**
 * Upload an asset for a flipbook page or gallery
 * @route POST /api/page-editor/upload-asset
 */
const uploadAsset = async (req, res) => {
  const file = req.file;
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { emailId: reqEmail, type, replacing_file_v_id, replacing_file_url, page_v_id, isGallery: reqIsGallery } = req.body;
    const v_id = req.body.v_id || req.body.flipbook_v_id || req.body.flipbookVId;
    let { folderName, flipbookName } = req.body;
    const emailId = authEmail || reqEmail;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!emailId) {
      if (file && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) {}
      }
      return res.status(400).json({ success: false, message: 'Missing required field: emailId' });
    }

    let dbDoc = null;
    if (v_id) {
      dbDoc = await Flipbook.findOne({ v_id });
    } else if (page_v_id && page_v_id !== 'global') {
      dbDoc = await Flipbook.findOne({ 'pages.v_id': page_v_id });
    }

    if (dbDoc) {
      flipbookName = dbDoc.flipbookName || flipbookName;
      folderName = resolveFolder(dbDoc.folderName);
      if (emailId && dbDoc.userEmail && dbDoc.userEmail.toLowerCase() !== emailId.toLowerCase()) {
        if (file && fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch (e) {}
        }
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    } else {
      folderName = resolveFolder(folderName);
    }

    const safeFolderName = sanitizeName(resolveFolder(folderName), 'My_Flipbooks');
    const safeFlipbookName = sanitizeName(flipbookName, 'Untitled_Document');
    const { userFolder, candidateDirs } = await resolveUserFolder(emailId, dbDoc);
    const storageRoot = getStorageRoot();

    const isGallery = reqIsGallery === 'true' || reqIsGallery === true;
    const assetType = (type || 'image').toLowerCase();

    // Map asset subfolder
    let subFolder = 'Image';
    if (assetType === 'video' || assetType === 'videos') subFolder = 'video';
    else if (assetType === 'audio') subFolder = 'audio';
    else if (assetType === 'gif' || assetType === 'gifs') subFolder = 'gif';
    else if (assetType === 'download') subFolder = 'download';
    else if (assetType === '3d' || assetType === '3d_model' || assetType === 'model') subFolder = '3D_Model';

    let targetDir;
    let relativeUrlBase;

    if (isGallery) {
      const galleryFolderMap = {
        image: 'Images',
        video: 'Videos',
        gif: 'gifs',
        audio: 'audio',
        '3d': '3D_Models',
        '3d_model': '3D_Models'
      };
      const gallerySub = galleryFolderMap[assetType] || 'Images';
      targetDir = path.join(storageRoot, userFolder, gallerySub);
      relativeUrlBase = `/storage/${userFolder}/${gallerySub}`;
    } else {
      targetDir = path.join(
        storageRoot,
        userFolder,
        'My_Flipbooks',
        safeFolderName,
        safeFlipbookName,
        'assets',
        subFolder
      );
      relativeUrlBase = `/storage/${userFolder}/My_Flipbooks/${safeFolderName}/${safeFlipbookName}/assets/${subFolder}`;
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Handle replacement of old file if specified
    if (replacing_file_v_id || replacing_file_url) {
      try {
        let oldAsset = null;
        if (replacing_file_v_id) {
          oldAsset = await FlipbookAsset.findOne({ file_v_id: replacing_file_v_id });
        } else if (replacing_file_url) {
          const urlQuery = decodeURIComponent(replacing_file_url);
          oldAsset = await FlipbookAsset.findOne({
            url: { $regex: urlQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$' }
          });
        }

        if (oldAsset) {
          if (oldAsset.fileName) {
            const oldFilePath = path.join(targetDir, oldAsset.fileName);
            if (fs.existsSync(oldFilePath)) {
              try { fs.unlinkSync(oldFilePath); } catch (e) {}
            }
          }
          await FlipbookAsset.deleteOne({ _id: oldAsset._id });
        }
      } catch (delErr) {
        console.warn('[Asset Controller] Failed to remove replaced file:', delErr.message);
      }
    }

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const file_v_id = generateId(16);
    const uniqueFilename = `${file_v_id}${fileExt}`;
    const destinationPath = path.join(targetDir, uniqueFilename);

    // Move file from temp to final destination
    fs.copyFileSync(file.path, destinationPath);
    if (fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (e) {}
    }

    const relativeUrl = `${relativeUrlBase}/${uniqueFilename}`;
    const flipbookPath = isGallery ? null : `../assets/${subFolder}/${uniqueFilename}`;
    const finalPageVId = page_v_id || 'global';

    const assetSavedUrl = isGallery ? relativeUrl : flipbookPath;

    // Save to Database
    const newAsset = new FlipbookAsset({
      flipbook_v_id: dbDoc?.v_id || v_id || 'gallery',
      file_v_id,
      page_v_id: finalPageVId,
      assetType: subFolder,
      fileName: uniqueFilename,
      originalName: file.originalname,
      userEmail: emailId,
      isGallery,
      flipbookName: isGallery ? 'Gallery' : safeFlipbookName,
      folderName: isGallery ? 'Gallery' : safeFolderName,
      url: assetSavedUrl,
      size: file.size
    });

    await newAsset.save();

    return res.status(200).json({
      success: true,
      message: 'Asset uploaded successfully',
      url: assetSavedUrl,
      relativeUrl: flipbookPath || relativeUrl,
      flipbookPath,
      file_v_id,
      filename: uniqueFilename,
      name: file.originalname,
      size: file.size,
      assetType: subFolder
    });
  } catch (err) {
    console.error('[Asset Controller] Upload Error:', err);
    if (file && file.path && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (e) {}
    }
    return res.status(500).json({
      success: false,
      message: 'Server error uploading asset',
      error: err.message
    });
  }
};

/**
 * Delete a flipbook asset
 * @route POST /api/page-editor/delete-asset & DELETE /api/page-editor/delete-asset
 */
const deleteAsset = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const fileVId = req.body?.file_v_id || req.body?.fileVId || req.query?.file_v_id || req.query?.fileVId;
    const reqEmail = req.body?.emailId || req.query?.emailId;
    const assetUrl = req.body?.url || req.query?.url;
    let fileName = req.body?.fileName || req.body?.filename || req.query?.fileName || req.query?.filename;
    const folderName = req.body?.folderName || req.query?.folderName;
    const bookName = req.body?.bookName || req.body?.flipbookName || req.query?.bookName || req.query?.flipbookName;
    const assetType = req.body?.assetType || req.query?.assetType || 'Image';
    const emailId = authEmail || reqEmail;

    if (!fileName && assetUrl) fileName = path.basename(assetUrl);
    if (!fileName && req.body?.src) fileName = path.basename(req.body.src);

    let asset = null;
    if (fileVId) {
      asset = await FlipbookAsset.findOne({ file_v_id: fileVId });
    }
    if (!asset && assetUrl) {
      const urlQuery = decodeURIComponent(assetUrl);
      asset = await FlipbookAsset.findOne({
        url: { $regex: urlQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$' }
      });
    }
    if (!asset && fileName && emailId) {
      asset = await FlipbookAsset.findOne({
        fileName,
        userEmail: new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });
    }

    if (asset) {
      fileName = asset.fileName;
    }

    // Delete file from disk
    const storageRoot = getStorageRoot();
    if (emailId && fileName) {
      const { candidateDirs } = await resolveUserFolder(emailId);
      const safeFolder = sanitizeName(folderName, 'My_Flipbooks');
      const safeBook = sanitizeName(bookName, 'Untitled_Document');

      for (const uDir of candidateDirs) {
        const candidatePaths = [
          path.join(storageRoot, uDir, 'My_Flipbooks', safeFolder, safeBook, 'assets', assetType, fileName),
          path.join(storageRoot, uDir, 'My_Flipbooks', safeFolder, safeBook, 'assets', 'Image', fileName),
          path.join(storageRoot, uDir, 'My_Flipbooks', safeFolder, safeBook, 'assets', 'video', fileName),
          path.join(storageRoot, uDir, 'My_Flipbooks', safeFolder, safeBook, 'assets', 'audio', fileName),
          path.join(storageRoot, uDir, 'My_Flipbooks', safeFolder, safeBook, 'assets', 'gif', fileName),
          path.join(storageRoot, uDir, 'My_Flipbooks', safeFolder, safeBook, 'assets', 'download', fileName),
          path.join(storageRoot, uDir, 'My_Flipbooks', safeFolder, safeBook, 'assets', '3D_Model', fileName),
          path.join(storageRoot, uDir, 'Images', fileName),
          path.join(storageRoot, uDir, 'Videos', fileName),
          path.join(storageRoot, uDir, 'gifs', fileName),
          path.join(storageRoot, uDir, 'audio', fileName),
          path.join(storageRoot, uDir, '3D_Models', fileName),
          path.join(storageRoot, uDir, 'Gallery', 'Images', fileName),
          path.join(storageRoot, uDir, 'Gallery', 'Videos', fileName),
          path.join(storageRoot, uDir, 'Gallery', 'gifs', fileName),
          path.join(storageRoot, uDir, 'Gallery', 'audio', fileName)
        ];

        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            try { fs.unlinkSync(p); } catch (e) {}
          }
        }
      }
    }

    if (asset) {
      await FlipbookAsset.deleteOne({ _id: asset._id });
      if (asset.assetType === '3D_Model' || (asset.fileName && asset.fileName.toLowerCase().endsWith('.glb'))) {
        await InteractionThreedModel.deleteMany({
          $or: [
            { fileName: asset.fileName },
            { v_id: asset.file_v_id },
            { url: asset.url }
          ]
        }).catch(() => {});
      }
    } else if (fileVId) {
      await FlipbookAsset.deleteOne({ file_v_id: fileVId });
      await InteractionThreedModel.deleteMany({
        $or: [
          { v_id: fileVId },
          { fileName: fileName }
        ]
      }).catch(() => {});
    } else if (fileName) {
      await InteractionThreedModel.deleteMany({ fileName }).catch(() => {});
    }

    return res.status(200).json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('[Asset Controller] Error deleting asset:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting asset',
      error: error.message
    });
  }
};

/**
 * Retrieve user's media gallery assets for the page editor
 * @route GET /api/page-editor/get-gallery-assets
 */
const getGalleryAssets = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { emailId: reqEmail, type, currentUrl, currentFileName } = req.query;
    const emailId = authEmail || reqEmail;

    if (!emailId) {
      return res.status(400).json({ success: false, message: 'Missing emailId' });
    }

    const { userFolder, candidateDirs } = await resolveUserFolder(emailId);
    const requestedType = type ? type.toLowerCase() : null;
    const assetsMap = new Map();
    const validMediaExtensions = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|mkv|mp3|wav|ogg|glb|gltf)$/i;

    // 1. Query FlipbookAsset collection for gallery assets
    const dbAssets = await FlipbookAsset.find({
      userEmail: new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      $or: [
        { isGallery: true },
        { folderName: 'Gallery' },
        { flipbook_v_id: 'gallery' }
      ]
    }).sort({ createdAt: -1 });

    for (const asset of dbAssets) {
      if (asset.url && asset.fileName && validMediaExtensions.test(asset.fileName)) {
        if (currentFileName && (asset.fileName === currentFileName || asset.file_v_id === currentFileName)) continue;
        if (currentUrl && asset.url.toLowerCase().includes(currentUrl.toLowerCase())) continue;

        let detectedType = (asset.assetType || '').toLowerCase();
        if (detectedType === 'images' || detectedType === 'image') detectedType = 'image';
        else if (detectedType === 'videos' || detectedType === 'video') detectedType = 'video';
        else if (detectedType === 'gifs' || detectedType === 'gif') detectedType = 'gif';
        else if (detectedType === 'audio') detectedType = 'audio';
        else if (detectedType === '3d' || detectedType === '3d_model' || detectedType === 'model') detectedType = '3d';
        else detectedType = 'image';

        if (!requestedType || detectedType === requestedType) {
          assetsMap.set(asset.fileName, {
            id: asset.fileName,
            file_v_id: asset.file_v_id,
            name: asset.originalName || asset.fileName,
            url: asset.url,
            type: detectedType,
            size: asset.size || 0,
            uploadedAt: asset.createdAt || new Date()
          });
        }
      }
    }

    // 2. Scan physical gallery folders on disk
    const storageRoot = getStorageRoot();
    const gallerySubfolders = ['Images', 'Videos', 'gifs', 'audio', '3D_Models'];

    for (const uDir of candidateDirs) {
      for (const sub of gallerySubfolders) {
        const checkPaths = [
          { dir: path.join(storageRoot, uDir, sub), urlPrefix: `/storage/${uDir}/${sub}` },
          { dir: path.join(storageRoot, uDir, 'Gallery', sub), urlPrefix: `/storage/${uDir}/Gallery/${sub}` }
        ];

        for (const { dir: diskDir, urlPrefix } of checkPaths) {
          if (fs.existsSync(diskDir)) {
            try {
              const files = fs.readdirSync(diskDir);
              for (const f of files) {
                if (validMediaExtensions.test(f) && !assetsMap.has(f)) {
                  const stats = fs.statSync(path.join(diskDir, f));
                  let t = 'image';
                  if (sub === 'Videos') t = 'video';
                  else if (sub === 'gifs') t = 'gif';
                  else if (sub === 'audio') t = 'audio';
                  else if (sub === '3D_Models') t = '3d';

                  if (!requestedType || t === requestedType) {
                    const publicUrl = `${urlPrefix}/${f}`;
                    assetsMap.set(f, {
                      id: f,
                      file_v_id: f.split('.')[0] || f,
                      name: f,
                      url: publicUrl,
                      type: t,
                      size: stats.size,
                      uploadedAt: stats.mtime
                    });
                  }
                }
              }
            } catch (scanErr) {
              console.warn('[Asset Controller] Error scanning gallery folder:', diskDir, scanErr.message);
            }
          }
        }
      }
    }

    let assets = Array.from(assetsMap.values());
    assets.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return res.status(200).json({ success: true, assets });
  } catch (err) {
    console.error('[Asset Controller] Error fetching gallery assets:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching gallery assets',
      error: err.message
    });
  }
};

/**
 * Rename a gallery asset's display name
 * @route POST /api/page-editor/rename-gallery-asset
 */
const renameGalleryAsset = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { emailId: reqEmail, file_v_id, fileName, newName } = req.body;
    const emailId = authEmail || reqEmail;

    if (!newName) {
      return res.status(400).json({ success: false, message: 'Missing newName parameter' });
    }

    const query = {};
    if (file_v_id) query.file_v_id = file_v_id;
    else if (fileName) query.fileName = fileName;
    else return res.status(400).json({ success: false, message: 'Missing file identifier' });

    if (emailId) {
      query.userEmail = new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    const updatedAsset = await FlipbookAsset.findOneAndUpdate(
      query,
      { $set: { originalName: newName } },
      { new: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Asset renamed successfully',
      name: updatedAsset.originalName || updatedAsset.fileName
    });
  } catch (err) {
    console.error('[Asset Controller] Error renaming gallery asset:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error renaming asset',
      error: err.message
    });
  }
};

/**
 * Delete a gallery asset
 * @route POST /api/page-editor/delete-gallery-asset
 */
const deleteGalleryAsset = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { emailId: reqEmail, url, fileName, file_v_id } = req.body;
    const emailId = authEmail || reqEmail;

    if (!emailId) {
      return res.status(400).json({ success: false, message: 'Missing emailId' });
    }

    const { candidateDirs } = await resolveUserFolder(emailId);
    const storageRoot = getStorageRoot();

    // Delete DB records where isGallery is true ONLY (protects flipbook assets that copied this file)
    if (file_v_id) {
      await FlipbookAsset.deleteMany({
        file_v_id,
        isGallery: true,
        userEmail: new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });
    }
    if (fileName) {
      await FlipbookAsset.deleteMany({
        fileName,
        isGallery: true,
        userEmail: new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });
    }

    // Delete file from disk across gallery locations ONLY (never touches My_Flipbooks)
    if (fileName) {
      const subs = ['Images', 'Videos', 'gifs', 'audio', '3D_Models'];
      for (const uDir of candidateDirs) {
        for (const sub of subs) {
          const p1 = path.join(storageRoot, uDir, sub, fileName);
          const p2 = path.join(storageRoot, uDir, 'Gallery', sub, fileName);
          if (fs.existsSync(p1)) {
            try { fs.unlinkSync(p1); } catch (e) {}
          }
          if (fs.existsSync(p2)) {
            try { fs.unlinkSync(p2); } catch (e) {}
          }
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Gallery asset deleted successfully' });
  } catch (err) {
    console.error('[Asset Controller] Error deleting gallery asset:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting gallery asset',
      error: err.message
    });
  }
};

/**
 * Copy a gallery asset into a flipbook's own assets folder and create a new FlipbookAsset DB record
 * @route POST /api/page-editor/use-gallery-asset & /api/flipbook/use-gallery-asset
 */
const useGalleryAsset = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const {
      emailId: reqEmail,
      folderName,
      flipbookName,
      galleryUrl,
      fileName: reqFileName,
      page_v_id,
      assetType: reqAssetType
    } = req.body;
    const v_id = req.body.v_id || req.body.flipbook_v_id || req.body.flipbookVId;

    const emailId = authEmail || reqEmail;
    if (!emailId || !galleryUrl) {
      return res.status(400).json({ success: false, message: 'Missing required fields: emailId and galleryUrl' });
    }

    let dbDoc = null;
    let safeFolderName = sanitizeName(resolveFolder(folderName), 'My_Flipbooks');
    let safeFlipbookName = sanitizeName(flipbookName, 'Untitled_Document');

    if (v_id) {
      dbDoc = await Flipbook.findOne({ v_id });
    } else if (page_v_id && page_v_id !== 'global') {
      dbDoc = await Flipbook.findOne({ 'pages.v_id': page_v_id });
    }

    if (dbDoc) {
      safeFlipbookName = sanitizeName(dbDoc.flipbookName, safeFlipbookName);
      safeFolderName = sanitizeName(resolveFolder(dbDoc.folderName), safeFolderName);
    }

    const { userFolder, candidateDirs } = await resolveUserFolder(emailId, dbDoc);
    const storageRoot = getStorageRoot();

    // Parse source filename from URL
    const cleanUrl = galleryUrl.split('?')[0].split('#')[0];
    const sourceFileName = reqFileName || path.basename(cleanUrl);

    // Determine target subfolder
    let subFolder = 'Image';
    const cleanLower = cleanUrl.toLowerCase();
    const typeLower = (reqAssetType || '').toLowerCase();
    if (typeLower.includes('video') || cleanLower.includes('/videos/') || cleanLower.endsWith('.mp4') || cleanLower.endsWith('.mkv') || cleanLower.endsWith('.webm')) {
      subFolder = 'video';
    } else if (typeLower.includes('gif') || cleanLower.includes('/gifs/') || cleanLower.endsWith('.gif')) {
      subFolder = 'gif';
    } else if (typeLower.includes('audio') || cleanLower.includes('/audio/') || cleanLower.endsWith('.mp3') || cleanLower.endsWith('.wav') || cleanLower.endsWith('.ogg')) {
      subFolder = 'audio';
    } else if (typeLower.includes('3d') || cleanLower.includes('/3d_models/') || cleanLower.endsWith('.glb') || cleanLower.endsWith('.gltf')) {
      subFolder = '3D_Model';
    } else if (typeLower.includes('download') || cleanLower.includes('/download/')) {
      subFolder = 'download';
    }

    // Locate source file on disk in gallery
    let srcFilePath = null;
    const gallerySubs = ['Images', 'Videos', 'gifs', 'audio', '3D_Models', 'download'];
    for (const uDir of candidateDirs) {
      for (const gsub of gallerySubs) {
        const p1 = path.join(storageRoot, uDir, gsub, sourceFileName);
        const p2 = path.join(storageRoot, uDir, 'Gallery', gsub, sourceFileName);
        if (fs.existsSync(p1)) {
          srcFilePath = p1;
          break;
        }
        if (fs.existsSync(p2)) {
          srcFilePath = p2;
          break;
        }
      }
      if (srcFilePath) break;
    }

    // Target flipbook assets folder
    const targetDir = path.join(
      storageRoot,
      userFolder,
      'My_Flipbooks',
      safeFolderName,
      safeFlipbookName,
      'assets',
      subFolder
    );
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileExt = path.extname(sourceFileName);
    const newFileVId = generateId(16);
    const newFileName = `${newFileVId}${fileExt}`;
    const destinationPath = path.join(targetDir, newFileName);

    let fileSize = 0;
    if (srcFilePath && fs.existsSync(srcFilePath)) {
      fs.copyFileSync(srcFilePath, destinationPath);
      fileSize = fs.statSync(destinationPath).size;
    } else {
      try {
        const fetchUrl = galleryUrl.startsWith('http') ? galleryUrl : `http://localhost:8000${galleryUrl.startsWith('/') ? '' : '/'}${galleryUrl}`;
        const response = await fetch(fetchUrl);
        const arrayBuf = await response.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        fs.writeFileSync(destinationPath, buf);
        fileSize = buf.length;
      } catch (fErr) {
        console.warn('[Asset Controller] Failed to fetch remote gallery asset:', fErr.message);
      }
    }

    const relativeUrl = `/storage/${userFolder}/My_Flipbooks/${safeFolderName}/${safeFlipbookName}/assets/${subFolder}/${newFileName}`;
    const svgRelativePath = `../assets/${subFolder}/${newFileName}`;

    // Create a NEW FlipbookAsset document for this flipbook (isGallery: false)
    const newAsset = new FlipbookAsset({
      flipbook_v_id: v_id || 'flipbook_asset',
      file_v_id: newFileVId,
      page_v_id: page_v_id || 'global',
      assetType: subFolder,
      fileName: newFileName,
      originalName: sourceFileName,
      userEmail: emailId,
      isGallery: false,
      flipbookName: safeFlipbookName,
      folderName: safeFolderName,
      url: svgRelativePath,
      size: fileSize
    });

    await newAsset.save();

    return res.status(200).json({
      success: true,
      message: 'Gallery asset copied to flipbook assets folder',
      url: svgRelativePath,
      relativeUrl: svgRelativePath,
      file_v_id: newFileVId,
      fileName: newFileName,
      name: sourceFileName,
      size: fileSize
    });
  } catch (err) {
    console.error('[Asset Controller] Error using gallery asset:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error copying gallery asset to flipbook',
      error: err.message
    });
  }
};

/**
 * Upload a 3D model file into the flipbook's assets/3D_Model folder
 * AND if skipGlobalGallery !== 'true', also copy to user's workspace 3D_Models folder (storage/<userWorkspace>/3D_Models)
 * @route POST /api/flipbook/upload-3d-model
 */
const upload3DModel = async (req, res) => {
  const file = req.file;
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const emailId = authEmail || req.body.emailId || req.body.userEmail;
    let { folderName, flipbookName } = req.body;
    const v_id = req.body.flipbook_v_id || req.body.v_id || req.body.flipbookVId;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    if (!emailId) {
      if (file && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) {}
      }
      return res.status(400).json({ success: false, message: "Missing required field: emailId" });
    }

    let dbDoc = null;
    if (v_id) {
      dbDoc = await Flipbook.findOne({ v_id });
    } else if (emailId && folderName && flipbookName) {
      dbDoc = await Flipbook.findOne({
        userEmail: new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, 'i'),
        folderName,
        flipbookName
      });
    }

    if (dbDoc) {
      flipbookName = dbDoc.flipbookName || flipbookName;
      folderName = resolveFolder(dbDoc.folderName);
    } else {
      folderName = resolveFolder(folderName);
    }

    const safeFolderName = sanitizeName(resolveFolder(folderName), "My_Flipbooks");
    const safeFlipbookName = sanitizeName(flipbookName, "Untitled_Document");
    const { userFolder } = await resolveUserFolder(req.body.userID || emailId, dbDoc);
    const storageRoot = getStorageRoot();

    // 1. Destination in flipbook assets/3D_Model
    const { bookDir } = await resolveFlipbookPaths({
      v_id: dbDoc?.v_id || v_id,
      emailId,
      folderName: safeFolderName,
      flipbookName: safeFlipbookName
    });

    const flipbook3DDir = path.join(bookDir, 'assets', '3D_Model');
    if (!fs.existsSync(flipbook3DDir)) {
      fs.mkdirSync(flipbook3DDir, { recursive: true });
    }

    // Determine filename - keep original filename or sanitize cleanly
    const ext = path.extname(file.originalname || file.filename || '.glb').toLowerCase() || '.glb';
    const rawBaseName = path.basename(file.originalname || 'model.glb', ext).replace(/[^a-zA-Z0-9_-]/g, '_') || 'model';
    const targetFilename = `${rawBaseName}_${generateId(8)}${ext}`;
    const flipbookAssetPath = path.join(flipbook3DDir, targetFilename);

    // Copy uploaded file to flipbook assets
    fs.copyFileSync(file.path, flipbookAssetPath);

    const relativeUrl = `./assets/3D_Model/${targetFilename}`;
    const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const type = ext.replace(/^\./, '') || 'glb';

    // Parse hotspots
    let hotspots = [];
    if (req.body.hotspots) {
      try {
        hotspots = typeof req.body.hotspots === 'string' ? JSON.parse(req.body.hotspots) : req.body.hotspots;
      } catch (e) {}
    } else if (req.body.sourceModelId) {
      try {
        const src = await ThreedModel.findOne({ modelId: req.body.sourceModelId }) ||
                    await InteractionThreedModel.findOne({ v_id: req.body.sourceModelId });
        if (src && src.hotspots) hotspots = src.hotspots;
      } catch (e) {}
    }

    // Create InteractionThreedModel
    const interactionModelId = generateId(20);
    const newInteractionModel = await InteractionThreedModel.create({
      v_id: interactionModelId,
      flipbook_v_id: dbDoc?.v_id || v_id || null,
      userEmail: emailId,
      flipbookName: safeFlipbookName,
      folderName: safeFolderName,
      fileName: targetFilename,
      displayName: req.body.displayName || rawBaseName,
      url: relativeUrl,
      size: sizeStr,
      type: type,
      hotspots: Array.isArray(hotspots) ? hotspots : []
    });

    // Create FlipbookAsset record for flipbook tracking
    try {
      await FlipbookAsset.create({
        flipbook_v_id: dbDoc?.v_id || v_id || null,
        file_v_id: generateId(20),
        assetType: '3D_Model',
        fileName: targetFilename,
        originalName: file.originalname || targetFilename,
        userEmail: emailId.toLowerCase(),
        isGallery: false,
        page_v_id: req.body.page_v_id || 'global',
        flipbookName: safeFlipbookName,
        folderName: safeFolderName,
        url: relativeUrl,
        size: file.size
      });
    } catch (assetErr) {
      console.warn('[3D Asset] FlipbookAsset creation notice:', assetErr.message);
    }

    // 2. Also copy to user's workspace 3D_Models folder (storage/<userWorkspace>/3D_Models) if skipGlobalGallery !== 'true'
    let globalUrl = null;
    const isDirectUpload = req.body.skipGlobalGallery !== 'true';
    if (isDirectUpload) {
      const global3DDir = path.join(storageRoot, userFolder, '3D_Models');
      if (!fs.existsSync(global3DDir)) {
        fs.mkdirSync(global3DDir, { recursive: true });
      }

      const globalFilePath = path.join(global3DDir, targetFilename);
      fs.copyFileSync(file.path, globalFilePath);

      globalUrl = `/storage/${userFolder}/3D_Models/${targetFilename}`;

      const existingModel = await ThreedModel.findOne({
        $or: [{ userEmail: emailId }, { emailId: emailId }],
        name: targetFilename
      });

      if (!existingModel) {
        await ThreedModel.create({
          modelId: 'model_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          userEmail: emailId,
          emailId: emailId,
          name: targetFilename,
          displayName: req.body.displayName || rawBaseName,
          url: globalUrl,
          type: type,
          size: sizeStr,
          hotspots: Array.isArray(hotspots) ? hotspots : []
        });
      }
    }

    // Cleanup temp uploaded file
    if (file && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (e) {}
    }

    return res.status(200).json({
      message: "3D model uploaded successfully",
      url: relativeUrl,
      globalUrl: globalUrl,
      filename: targetFilename,
      v_id: newInteractionModel.v_id,
      displayName: newInteractionModel.displayName,
      hotspots: newInteractionModel.hotspots || []
    });
  } catch (error) {
    if (file && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (e) {}
    }
    console.error('[Upload 3D Model] Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  uploadAsset,
  upload3DModel,
  deleteAsset,
  getGalleryAssets,
  renameGalleryAsset,
  deleteGalleryAsset,
  useGalleryAsset
};

