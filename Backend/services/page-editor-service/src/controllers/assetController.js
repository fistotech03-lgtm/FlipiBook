const fs = require('fs');
const path = require('path');
const Flipbook = require('../models/Flipbook');
const FlipbookAsset = require('../models/FlipbookAsset');
const { getAuthUser } = require('../utils/userHelper');
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
 * Upload an asset for a flipbook page or gallery
 * @route POST /api/page-editor/upload-asset
 */
const uploadAsset = async (req, res) => {
  const file = req.file;
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { emailId: reqEmail, type, v_id, replacing_file_v_id, replacing_file_url, page_v_id, isGallery: reqIsGallery } = req.body;
    let { folderName, flipbookName } = req.body;
    const emailId = authEmail || reqEmail;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!emailId) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, message: 'Missing required field: emailId' });
    }

    // Resolve flipbook metadata if v_id provided
    if (v_id) {
      const dbDoc = await Flipbook.findOne({ v_id });
      if (dbDoc) {
        flipbookName = dbDoc.flipbookName;
        folderName = resolveFolder(dbDoc.folderName);
        if (emailId && dbDoc.userEmail && dbDoc.userEmail.toLowerCase() !== emailId.toLowerCase()) {
          if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
          return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
      }
    }

    const safeFolderName = sanitizeName(folderName, 'My_Flipbooks');
    const safeFlipbookName = sanitizeName(flipbookName, 'Untitled_Document');
    const sanitizedEmail = sanitizeEmail(emailId);
    const storageRoot = getStorageRoot();

    const isGallery = reqIsGallery === 'true' || reqIsGallery === true;
    const assetType = (type || 'image').toLowerCase();

    // Map asset subfolder
    let subFolder = 'Image';
    if (assetType === 'video' || assetType === 'videos') subFolder = 'video';
    else if (assetType === 'audio') subFolder = 'audio';
    else if (assetType === 'gif' || assetType === 'gifs') subFolder = 'gif';
    else if (assetType === 'download') subFolder = 'download';

    let targetDir;
    let relativeUrlBase;

    if (isGallery) {
      const galleryFolderMap = {
        image: 'Images',
        video: 'Videos',
        gif: 'gifs',
        audio: 'audio'
      };
      const gallerySub = galleryFolderMap[assetType] || 'Images';
      targetDir = path.join(storageRoot, sanitizedEmail, 'Gallery', gallerySub);
      relativeUrlBase = `/uploads/${sanitizedEmail}/Gallery/${gallerySub}`;
    } else {
      targetDir = path.join(
        storageRoot,
        sanitizedEmail,
        'My_Flipbooks',
        safeFolderName,
        safeFlipbookName,
        'assets',
        subFolder
      );
      relativeUrlBase = `/uploads/${sanitizedEmail}/My_Flipbooks/${safeFolderName}/${safeFlipbookName}/assets/${subFolder}`;
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
          let urlQuery = decodeURIComponent(replacing_file_url);
          oldAsset = await FlipbookAsset.findOne({ url: { $regex: urlQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$' } });
        }

        if (oldAsset) {
          if (oldAsset.fileName) {
            const oldFilePath = path.join(targetDir, oldAsset.fileName);
            if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
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
    const finalPageVId = page_v_id || 'global';

    // Save to Database
    const newAsset = new FlipbookAsset({
      flipbook_v_id: v_id || `temp_${Date.now()}`,
      file_v_id,
      page_v_id: finalPageVId,
      assetType: subFolder,
      fileName: uniqueFilename,
      originalName: file.originalname,
      userEmail: emailId,
      isGallery,
      flipbookName: safeFlipbookName,
      folderName: isGallery ? 'Gallery' : safeFolderName,
      url: relativeUrl,
      size: file.size
    });

    await newAsset.save();

    return res.status(200).json({
      success: true,
      message: 'Asset uploaded successfully',
      url: relativeUrl,
      file_v_id,
      filename: uniqueFilename,
      name: file.originalname,
      size: file.size
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
      asset = await FlipbookAsset.findOne({ url: { $regex: urlQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$' } });
    }
    if (!asset && fileName && emailId) {
      asset = await FlipbookAsset.findOne({ fileName, userEmail: emailId });
    }

    if (asset) {
      fileName = asset.fileName;
    }

    // Delete file from disk
    const storageRoot = getStorageRoot();
    if (emailId && fileName) {
      const sanitizedEmail = sanitizeEmail(emailId);
      const safeFolder = sanitizeName(folderName, 'My_Flipbooks');
      const safeBook = sanitizeName(bookName, 'Untitled_Document');

      const candidatePaths = [
        path.join(storageRoot, sanitizedEmail, 'My_Flipbooks', safeFolder, safeBook, 'assets', assetType, fileName),
        path.join(storageRoot, sanitizedEmail, 'My_Flipbooks', safeFolder, safeBook, 'assets', 'Image', fileName),
        path.join(storageRoot, sanitizedEmail, 'My_Flipbooks', safeFolder, safeBook, 'assets', 'video', fileName),
        path.join(storageRoot, sanitizedEmail, 'My_Flipbooks', safeFolder, safeBook, 'assets', 'audio', fileName),
        path.join(storageRoot, sanitizedEmail, 'My_Flipbooks', safeFolder, safeBook, 'assets', 'gif', fileName),
        path.join(storageRoot, sanitizedEmail, 'My_Flipbooks', safeFolder, safeBook, 'assets', 'download', fileName),
        path.join(storageRoot, sanitizedEmail, 'Gallery', 'Images', fileName),
        path.join(storageRoot, sanitizedEmail, 'Gallery', 'Videos', fileName),
        path.join(storageRoot, sanitizedEmail, 'Gallery', 'gifs', fileName)
      ];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          try { fs.unlinkSync(p); } catch (e) {}
        }
      }
    }

    if (asset) {
      await FlipbookAsset.deleteOne({ _id: asset._id });
    } else if (fileVId) {
      await FlipbookAsset.deleteOne({ file_v_id: fileVId });
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

    const sanitizedEmail = sanitizeEmail(emailId);
    const requestedType = type ? type.toLowerCase() : null;
    const assetsMap = new Map();
    const validMediaExtensions = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|mkv|mp3|wav|ogg)$/i;

    // 1. Query FlipbookAsset collection for gallery assets
    const dbAssets = await FlipbookAsset.find({
      userEmail: emailId,
      $or: [
        { isGallery: true },
        { folderName: 'Gallery' }
      ]
    }).sort({ createdAt: -1 });

    for (const asset of dbAssets) {
      if (asset.url && asset.fileName && validMediaExtensions.test(asset.fileName)) {
        if (currentFileName && (asset.fileName === currentFileName || asset.file_v_id === currentFileName)) continue;
        if (currentUrl && asset.url.toLowerCase().includes(currentUrl.toLowerCase())) continue;

        let detectedType = (asset.assetType || '').toLowerCase();
        if (detectedType === 'images') detectedType = 'image';
        else if (detectedType === 'videos') detectedType = 'video';
        else if (!detectedType) detectedType = 'image';

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
    const gallerySubfolders = ['Images', 'Videos', 'gifs', 'audio'];
    for (const sub of gallerySubfolders) {
      const diskDir = path.join(storageRoot, sanitizedEmail, 'Gallery', sub);
      if (fs.existsSync(diskDir)) {
        const files = fs.readdirSync(diskDir);
        for (const f of files) {
          if (validMediaExtensions.test(f) && !assetsMap.has(f)) {
            const stats = fs.statSync(path.join(diskDir, f));
            let t = 'image';
            if (sub === 'Videos') t = 'video';
            else if (sub === 'gifs') t = 'gif';
            else if (sub === 'audio') t = 'audio';

            if (!requestedType || t === requestedType) {
              const publicUrl = `/uploads/${sanitizedEmail}/Gallery/${sub}/${f}`;
              assetsMap.set(f, {
                id: f,
                name: f,
                url: publicUrl,
                type: t,
                size: stats.size,
                uploadedAt: stats.mtime
              });
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

    if (emailId) query.userEmail = emailId;

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

    const sanitizedEmail = sanitizeEmail(emailId);
    const storageRoot = getStorageRoot();

    // Delete DB records
    if (file_v_id) {
      await FlipbookAsset.deleteMany({ file_v_id, userEmail: emailId });
    }
    if (fileName) {
      await FlipbookAsset.deleteMany({ fileName, userEmail: emailId });
    }

    // Delete file from disk
    if (fileName) {
      const candidatePaths = [
        path.join(storageRoot, sanitizedEmail, 'Gallery', 'Images', fileName),
        path.join(storageRoot, sanitizedEmail, 'Gallery', 'Videos', fileName),
        path.join(storageRoot, sanitizedEmail, 'Gallery', 'gifs', fileName),
        path.join(storageRoot, sanitizedEmail, 'Gallery', 'audio', fileName)
      ];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          try { fs.unlinkSync(p); } catch (e) {}
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

module.exports = {
  uploadAsset,
  deleteAsset,
  getGalleryAssets,
  renameGalleryAsset,
  deleteGalleryAsset
};
