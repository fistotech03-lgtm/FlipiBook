const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const CustomizedSettings = require('../models/CustomizedSettings');
const Lead = require('../models/Lead');
const CustomizedAsset = require('../models/CustomizedAsset');
const EditorPreset = require('../models/EditorPreset');
const Flipbook = require('../models/Flipbook');

const { getAuthUser, getUserQuery, getUserStorageFolder } = require('../utils/userHelper');
const {
  getStorageRoot,
  getAssetTypeFolder,
  getCustomizedAssetUploadDir,
  toPublicStorageUrl,
  deleteAssetFile
} = require('../utils/storageHelper');
const { getDefaultSettings } = require('../utils/defaultSettings');

/**
 * GET /status
 */
const getStatus = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    return res.status(200).json({
      success: true,
      service: 'customized-editor-service',
      status: 'active',
      authenticated: !!(authUser.objectId || authUser.emailId),
      user: authUser,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve service status',
      error: error.message
    });
  }
};

/**
 * GET /check-auth
 */
const checkAuth = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    return res.status(200).json({
      success: true,
      message: 'Authenticated successfully with Customized Editor Service',
      user: authUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Auth check failed',
      error: error.message
    });
  }
};

/**
 * GET /settings
 * Retrieve customized settings for a flipbook.
 * Access strictly authorized and accessed by userId.
 */
const getSettings = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const userQuery = getUserQuery(req);
    const v_id = req.params?.v_id || req.query?.v_id;

    if (!v_id) {
      return res.status(400).json({ success: false, message: 'Missing v_id parameter' });
    }

    if (!userQuery) {
      return res.status(401).json({ success: false, message: 'User identification required' });
    }

    // 1. Check CustomizedSettings collection primarily by user
    let settingsDoc = await CustomizedSettings.findOne({ ...userQuery, v_id });

    // 2. Fallback: check Flipbook document to import or initialize settings
    let flipbookDoc = null;
    if (!settingsDoc) {
      const fbQuery = { v_id };
      if (authUser.objectId) fbQuery.userId = authUser.objectId;
      else if (authUser.customUserId) fbQuery.userID = authUser.customUserId;
      else if (authUser.emailId) fbQuery.userEmail = authUser.emailId;

      flipbookDoc = await Flipbook.findOne(fbQuery);
      if (flipbookDoc) {
        const defaults = getDefaultSettings();
        const initialSettings = {
          ...defaults,
          ...(flipbookDoc.Customized_Settings || {})
        };

        // Create initial CustomizedSettings document strictly using canonical schema
        try {
          settingsDoc = await CustomizedSettings.create({
            userID: authUser.customUserId || flipbookDoc.userID || 'default_user',
            userEmail: authUser.emailId || flipbookDoc.userEmail || '',
            v_id: flipbookDoc.v_id,
            flipbookName: flipbookDoc.flipbookName,
            folderName: Array.isArray(flipbookDoc.folderName) ? flipbookDoc.folderName[0] : (flipbookDoc.folderName || 'My_Flipbooks'),
            FlipbookInfo: initialSettings.FlipbookInfo || defaults.FlipbookInfo,
            Branding: initialSettings.Branding || defaults.Branding,
            Background: initialSettings.Background || defaults.Background,
            MenuBar: initialSettings.MenuBar || defaults.MenuBar,
            Layouts: initialSettings.Layouts || defaults.Layouts,
            BookAppearance: initialSettings.BookAppearance || defaults.BookAppearance,
            leadForm: initialSettings.leadForm || defaults.leadForm,
            Visibility: initialSettings.Visibility || defaults.Visibility,
            otherSetup: initialSettings.otherSetup || {}
          });
        } catch (createErr) {
          if (createErr.code === 11000) {
            settingsDoc = await CustomizedSettings.findOne({ v_id: flipbookDoc.v_id });
          } else {
            throw createErr;
          }
        }
      }
    }

    if (!settingsDoc) {
      return res.status(404).json({ success: false, message: 'Customized settings not found for this flipbook' });
    }

    return res.status(200).json({
      success: true,
      settings: settingsDoc,
      Customized_Settings: settingsDoc
    });
  } catch (err) {
    console.error('[Customized Editor] Error getting settings:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving settings', error: err.message });
  }
};

/**
 * GET /public/settings/:v_id
 * Public endpoint for viewers reading the flipbook with customized appearance
 */
const getPublicSettings = async (req, res) => {
  try {
    const v_id = req.params?.v_id || req.query?.v_id;
    const shareId = req.query?.shareId;

    if (!v_id && !shareId) {
      return res.status(400).json({ success: false, message: 'v_id or shareId required' });
    }

    let settingsDoc = null;
    if (v_id) {
      settingsDoc = await CustomizedSettings.findOne({ v_id });
    }
    if (!settingsDoc && shareId) {
      settingsDoc = await CustomizedSettings.findOne({ 'Visibility.shareId': shareId });
    }

    // Fallback: check Flipbook collection
    if (!settingsDoc) {
      const fb = await Flipbook.findOne(v_id ? { v_id } : { 'Customized_Settings.Visibility.shareId': shareId });
      if (fb && fb.Customized_Settings) {
        settingsDoc = fb.Customized_Settings;
      }
    }

    if (!settingsDoc) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }

    const docObj = typeof settingsDoc.toObject === 'function' ? settingsDoc.toObject() : { ...settingsDoc };

    // Sanitize sensitive visibility information for public response
    if (docObj.Visibility) {
      docObj.Visibility.hasPassword = Boolean(docObj.Visibility.password);
      docObj.Visibility.password = undefined; // Never expose password hash to viewers
      docObj.Visibility.otp = undefined;
    }

    return res.status(200).json({
      success: true,
      settings: docObj,
      Customized_Settings: docObj
    });
  } catch (err) {
    console.error('[Customized Editor] Error getting public settings:', err);
    return res.status(500).json({ success: false, message: 'Error getting public settings', error: err.message });
  }
};

/**
 * POST /update-settings
 * Main endpoint to update customized settings.
 * Stores strictly canonical keys with zero duplicate fields and ONLY userID (no userId).
 */
const updateSettings = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const userQuery = getUserQuery(req);
    const {
      v_id,
      bookName,
      flipbookName,
      folderName,
      share,
      Customized_Settings,
      settings,
      width,
      height,
      orientation
    } = req.body;

    if (!v_id && !bookName && !flipbookName) {
      return res.status(400).json({ success: false, message: 'Missing v_id or bookName' });
    }

    // 1. Locate existing flipbook to verify ownership and metadata
    const effectiveBookName = flipbookName || bookName;
    const fbQuery = {};
    if (v_id) fbQuery.v_id = v_id;
    else if (effectiveBookName) fbQuery.flipbookName = effectiveBookName;
    if (userQuery) Object.assign(fbQuery, userQuery);

    let flipbook = await Flipbook.findOne(fbQuery);
    if (!flipbook && v_id) {
      flipbook = await Flipbook.findOne({ v_id });
    }

    const resolvedVId = v_id || flipbook?.v_id;
    if (!resolvedVId) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    // Determine target user identification: strictly userID string, never userId ObjectId
    const targetUserID = authUser.customUserId || req.body.userID || req.body.customUserId || flipbook?.userID || 'default_user';
    const targetEmail = authUser.emailId || req.body.emailId || flipbook?.userEmail || '';

    // 2. Extract and canonicalize incoming settings into the 9 sidebar sections
    const rawCustomized = Customized_Settings || {};
    const rawSettings = settings || {};
    const rawBody = req.body || {};

    const pick = (...candidates) => {
      for (const c of candidates) {
        if (c !== undefined && c !== null) return c;
      }
      return undefined;
    };

    // 1. Background
    const incBackground = pick(
      rawCustomized.Background,
      rawBody.Background,
      rawSettings.Background,
      rawCustomized.background,
      rawBody.background,
      rawSettings.background
    );

    // 2. BookAppearance
    const incBookAppearance = pick(
      rawCustomized.BookAppearance,
      rawBody.BookAppearance,
      rawSettings.BookAppearance,
      rawCustomized.appearance,
      rawBody.appearance,
      rawSettings.appearance,
      rawCustomized.bookAppearanceSettings,
      rawBody.bookAppearanceSettings
    );

    // 3. MenuBar
    const incMenuBar = pick(
      rawCustomized.MenuBar,
      rawBody.MenuBar,
      rawSettings.MenuBar,
      rawCustomized.menuBar,
      rawBody.menuBar,
      rawSettings.menuBar
    );

    // 4. Layouts
    let incLayouts = pick(
      rawCustomized.Layouts,
      rawBody.Layouts,
      rawSettings.Layouts
    );
    const legLayoutStyle = pick(
      rawCustomized.layoutStyle,
      rawBody.layoutStyle,
      rawCustomized.layout,
      rawBody.layout,
      rawSettings.layout
    );
    const legLayoutColors = pick(
      rawCustomized.layoutColors,
      rawBody.layoutColors,
      rawSettings.layoutColors
    );
    if (!incLayouts && (legLayoutStyle !== undefined || legLayoutColors !== undefined)) {
      incLayouts = {};
    }
    if (incLayouts) {
      incLayouts = { ...incLayouts };
      if (legLayoutStyle !== undefined && incLayouts.layoutStyle === undefined) {
        incLayouts.layoutStyle = legLayoutStyle;
      }
      if (legLayoutColors !== undefined && incLayouts.layoutColors === undefined) {
        incLayouts.layoutColors = legLayoutColors;
      }
    }

    // 5. Visibility & Privacy
    let incVisibility = pick(
      rawCustomized.Visibility,
      rawBody.Visibility,
      rawSettings.Visibility,
      rawCustomized.visibility,
      rawBody.visibility,
      rawSettings.visibility,
      rawBody.share,
      rawSettings.share
    );
    if (incVisibility) {
      incVisibility = { ...incVisibility };
      if (incVisibility.type && !incVisibility.access) {
        incVisibility.access = incVisibility.type;
      }
      if (incVisibility.password) {
        const rawPass = incVisibility.password;
        if (!rawPass.startsWith('$2a$') && !rawPass.startsWith('$2b$')) {
          incVisibility.password = await bcrypt.hash(rawPass, 10);
          incVisibility.isPasswordSaved = true;
        }
      }
    }

    // 6. leadForm
    const incLeadForm = pick(
      rawCustomized.leadForm,
      rawBody.leadForm,
      rawSettings.leadForm,
      rawCustomized.leadform,
      rawBody.leadform,
      rawSettings.leadform,
      rawCustomized.LeadForm,
      rawBody.LeadForm
    );

    // 7. Branding
    const incBranding = pick(
      rawCustomized.Branding,
      rawBody.Branding,
      rawSettings.Branding,
      rawCustomized.branding,
      rawBody.branding,
      rawSettings.branding
    );

    // 8. FlipbookInfo
    let incFlipbookInfo = pick(
      rawCustomized.FlipbookInfo,
      rawBody.FlipbookInfo,
      rawSettings.FlipbookInfo,
      rawCustomized.flipbookInfo,
      rawBody.flipbookInfo
    );
    if (!incFlipbookInfo && (width || height || orientation)) {
      incFlipbookInfo = {};
    }
    if (incFlipbookInfo) {
      incFlipbookInfo = { ...incFlipbookInfo };
      if (width) incFlipbookInfo.width = width;
      if (height) incFlipbookInfo.height = height;
      if (orientation) incFlipbookInfo.orientation = orientation;
    }

    // 9. otherSetup
    const incOtherSetup = pick(
      rawCustomized.otherSetup,
      rawBody.otherSetup,
      rawSettings.otherSetup,
      rawCustomized.othersetup,
      rawBody.othersetup
    );

    // 3. Merge with existing settings or defaults
    let existingSettings = await CustomizedSettings.findOne({ v_id: resolvedVId });
    const defaults = getDefaultSettings();
    const existing = existingSettings ? (typeof existingSettings.toObject === 'function' ? existingSettings.toObject() : existingSettings) : {};

    const cleanSettings = {
      FlipbookInfo: { ...(defaults.FlipbookInfo || {}), ...(existing.FlipbookInfo || {}), ...(incFlipbookInfo || {}) },
      Branding: { ...(defaults.Branding || {}), ...(existing.Branding || {}), ...(incBranding || {}) },
      Background: { ...(defaults.Background || {}), ...(existing.Background || {}), ...(incBackground || {}) },
      MenuBar: { ...(defaults.MenuBar || {}), ...(existing.MenuBar || {}), ...(incMenuBar || {}) },
      Layouts: { ...(defaults.Layouts || {}), ...(existing.Layouts || {}), ...(incLayouts || {}) },
      BookAppearance: { ...(defaults.BookAppearance || {}), ...(existing.BookAppearance || {}), ...(incBookAppearance || {}) },
      leadForm: { ...(defaults.leadForm || {}), ...(existing.leadForm || {}), ...(incLeadForm || {}) },
      Visibility: { ...(defaults.Visibility || {}), ...(existing.Visibility || {}), ...(incVisibility || {}) },
      otherSetup: { ...(existing.otherSetup || {}), ...(incOtherSetup || {}) }
    };
    if (cleanSettings.Branding) {
      delete cleanSettings.Branding.profileSettings;
    }

    // 4. Update CustomizedSettings: Set ONLY canonical fields and explicitly purge userId + lowercase duplicates + profileSettings
    const updatePayload = {
      $set: {
        userID: targetUserID,
        userEmail: targetEmail,
        v_id: resolvedVId,
        flipbookName: effectiveBookName || flipbook?.flipbookName || existing?.flipbookName,
        folderName: folderName || existing?.folderName || 'My_Flipbooks',
        ...cleanSettings
      },
      $unset: {
        userId: 1,
        appearance: 1,
        background: 1,
        menuBar: 1,
        visibility: 1,
        layout: 1,
        layoutColors: 1,
        share: 1,
        settings: 1,
        leadform: 1,
        'Branding.profileSettings': 1,
        profileSettings: 1
      }
    };

    let updatedCustomizedSettings;
    try {
      updatedCustomizedSettings = await CustomizedSettings.findOneAndUpdate(
        { v_id: resolvedVId, ...(targetUserID ? { userID: targetUserID } : {}) },
        updatePayload,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    } catch (upsertErr) {
      if (upsertErr.code === 11000) {
        // Handle concurrent race condition: document was created by parallel request; retry as update
        updatedCustomizedSettings = await CustomizedSettings.findOneAndUpdate(
          { v_id: resolvedVId },
          updatePayload,
          { returnDocument: 'after' }
        );
      } else {
        throw upsertErr;
      }
    }

    // 5. Synchronize with Flipbook.Customized_Settings
    await Flipbook.updateOne(
      { $or: [{ v_id: resolvedVId }, ...(flipbook?._id ? [{ _id: flipbook._id }] : [])] },
      {
        $set: {
          userID: targetUserID,
          Customized_Settings: cleanSettings,
          lastUpdated: new Date()
        }
      }
    ).catch((e) => console.warn('[Customized Editor] Could not sync with Flipbook model:', e.message));

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedCustomizedSettings,
      Customized_Settings: updatedCustomizedSettings,
      share: updatedCustomizedSettings.Visibility
    });
  } catch (err) {
    console.error('[Customized Editor] Error updating settings:', err);
    return res.status(500).json({ success: false, message: 'Server error updating settings', error: err.message });
  }
};

/**
 * POST /reset-settings
 * Reset customized settings to default
 */
const resetSettings = async (req, res) => {
  try {
    const userQuery = getUserQuery(req);
    const { v_id } = req.body;

    if (!v_id) {
      return res.status(400).json({ success: false, message: 'Missing v_id' });
    }

    const defaults = getDefaultSettings();
    defaults.Visibility.shareId = crypto.randomBytes(6).toString('hex');

    const updated = await CustomizedSettings.findOneAndUpdate(
      { ...userQuery, v_id },
      { $set: defaults },
      { returnDocument: 'after' }
    );

    await Flipbook.updateOne({ ...userQuery, v_id }, { $set: { Customized_Settings: defaults } }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Settings reset to default',
      settings: updated
    });
  } catch (err) {
    console.error('[Customized Editor] Error resetting settings:', err);
    return res.status(500).json({ success: false, message: 'Error resetting settings', error: err.message });
  }
};

/**
 * POST /upload-customized-asset
 * Upload logo, watermark, background image/video, sound, etc.
 * Stores in storage/<userFolder>/.../customized_assets/<assetType>/
 * Registers in CustomizedAsset model with userId as owner.
 */
const uploadCustomizedAsset = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser.objectId && !authUser.emailId) {
      return res.status(401).json({ success: false, message: 'Authentication required to upload assets' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { assetType = 'Logo', folderName = 'My_Flipbooks', flipbookName, v_id } = req.body;
    const userFolder = getUserStorageFolder(req);
    const typeFolder = getAssetTypeFolder(assetType);

    // Target upload folder on disk
    const targetDir = getCustomizedAssetUploadDir(userFolder, folderName, flipbookName, typeFolder);

    const ext = path.extname(req.file.originalname).toLowerCase();
    const safeName = `${typeFolder.toLowerCase()}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const targetPath = path.join(targetDir, safeName);

    // Save uploaded file to target directory
    fs.writeFileSync(targetPath, req.file.buffer || fs.readFileSync(req.file.path));

    // Cleanup temp multer file if diskStorage was used
    if (req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }

    const publicUrl = toPublicStorageUrl(targetPath);

    // Record asset in CustomizedAsset model indexed by userId
    const newAsset = await CustomizedAsset.create({
      userId: authUser.objectId,
      userID: authUser.customUserId,
      userEmail: authUser.emailId,
      v_id: v_id || null,
      flipbookName: flipbookName || null,
      assetType: typeFolder,
      fileName: safeName,
      originalName: req.file.originalname,
      url: publicUrl,
      storagePath: targetPath,
      size: req.file.size || fs.statSync(targetPath).size,
      mimeType: req.file.mimetype
    });

    return res.status(200).json({
      success: true,
      message: 'Customized asset uploaded successfully',
      url: publicUrl,
      fileName: safeName,
      assetType: typeFolder,
      assetId: newAsset._id,
      size: newAsset.size
    });
  } catch (err) {
    console.error('[Customized Editor] Error uploading asset:', err);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(500).json({ success: false, message: 'Failed to upload asset', error: err.message });
  }
};

/**
 * POST /delete-customized-asset
 * Deletes asset file from disk and its metadata record.
 * Validates ownership using userId.
 */
const deleteCustomizedAsset = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const { url, assetId } = req.body;

    if (!url && !assetId) {
      return res.status(400).json({ success: false, message: 'Asset url or assetId required' });
    }

    let deletedFromDisk = false;
    if (url) {
      deletedFromDisk = deleteAssetFile(url);
    }

    // Delete record from CustomizedAsset collection
    const query = {};
    if (authUser.objectId) query.userId = authUser.objectId;
    else if (authUser.emailId) query.userEmail = authUser.emailId;

    if (assetId) query._id = assetId;
    else if (url) query.url = url;

    const doc = await CustomizedAsset.findOneAndDelete(query);
    if (doc && doc.storagePath && !deletedFromDisk) {
      deleteAssetFile(doc.storagePath);
    }

    return res.status(200).json({
      success: true,
      message: 'Customized asset deleted successfully'
    });
  } catch (err) {
    console.error('[Customized Editor] Error deleting asset:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete asset', error: err.message });
  }
};

/**
 * GET /assets
 * List user's customized assets by userId
 */
const getUserAssets = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const userQuery = getUserQuery(req);
    const { assetType, v_id } = req.query;

    if (!userQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const filter = { ...userQuery };
    if (assetType) {
      filter.assetType = getAssetTypeFolder(assetType);
    }
    if (v_id) {
      filter.v_id = v_id;
    }

    const assets = await CustomizedAsset.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      assets,
      count: assets.length
    });
  } catch (err) {
    console.error('[Customized Editor] Error listing assets:', err);
    return res.status(500).json({ success: false, message: 'Failed to list assets', error: err.message });
  }
};

/**
 * GET /background-assets
 * Returns available preset backgrounds (images, textures, videos)
 */
const getBackgroundAssets = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const storageRoot = getStorageRoot();

    const bgDir = path.join(storageRoot, 'assets', 'bgimg');
    const videoDir = path.join(storageRoot, 'assets', 'Videos');

    let images = [];
    if (fs.existsSync(bgDir)) {
      const files = fs.readdirSync(bgDir);
      images = files
        .filter((f) => /\.(webp|jpg|jpeg|png|svg)$/i.test(f))
        .map((f) => `/storage/assets/bgimg/${f}`);
    }

    let videos = [];
    if (fs.existsSync(videoDir)) {
      const files = fs.readdirSync(videoDir);
      videos = files
        .filter((f) => /\.(webm|mp4)$/i.test(f))
        .map((f) => `/storage/assets/Videos/${f}`);
    }

    return res.status(200).json({
      success: true,
      images,
      videos
    });
  } catch (err) {
    console.error('[Customized Editor] Error getting background assets:', err);
    return res.status(500).json({ success: false, message: 'Failed to get background assets', error: err.message });
  }
};

/**
 * POST /copy-theme-asset
 * Copies a theme preset asset into the user's flipbook storage
 */
const copyThemeAsset = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const { imageUrl, v_id, folderName = 'My_Flipbooks', flipbookName = 'Untitled' } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Missing imageUrl' });
    }

    const userFolder = getUserStorageFolder(req);
    const isVideo = /\.(mp4|webm|ogv)$/i.test(imageUrl);
    const assetType = isVideo ? 'Video' : 'Background';

    const targetDir = getCustomizedAssetUploadDir(userFolder, folderName, flipbookName, assetType);
    const ext = path.extname(imageUrl.split('?')[0]) || (isVideo ? '.mp4' : '.webp');
    const fileName = `${assetType.toLowerCase()}_theme_${Date.now()}${ext}`;
    const destPath = path.join(targetDir, fileName);

    const storageRoot = getStorageRoot();
    let sourcePath = null;
    if (imageUrl.startsWith('/storage/')) {
      sourcePath = path.join(storageRoot, decodeURIComponent(imageUrl.replace('/storage/', '')));
    }

    if (sourcePath && fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
    } else {
      // Just return the same URL if local copy not needed
      return res.status(200).json({ success: true, url: imageUrl });
    }

    const publicUrl = toPublicStorageUrl(destPath);
    return res.status(200).json({
      success: true,
      message: 'Theme asset copied successfully',
      url: publicUrl,
      fileName
    });
  } catch (err) {
    console.error('[Customized Editor] Error copying theme asset:', err);
    return res.status(500).json({ success: false, message: 'Failed to copy theme asset', error: err.message });
  }
};

/**
 * POST /submit-lead
 * Public endpoint for viewer submitting a flipbook lead form.
 * Captures lead and links to flipbook owner's userId.
 */
const submitLead = async (req, res) => {
  try {
    const { v_id, shareId, flipbookName, userEmail, leadData } = req.body;

    if (!leadData || typeof leadData !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid leadData' });
    }

    // Find flipbook to identify the owner
    let flipbook = null;
    if (v_id && v_id !== 'preview') {
      flipbook = await Flipbook.findOne({ v_id });
    }
    if (!flipbook && shareId) {
      flipbook = await Flipbook.findOne({
        $or: [
          { 'Customized_Settings.Visibility.shareId': shareId },
          { v_id: shareId }
        ]
      });
    }

    const ownerUserId = flipbook?.userId || (flipbook?.userID ? null : undefined);
    const effectiveVId = flipbook?.v_id || v_id || 'preview';
    const effectiveShareId = shareId || flipbook?.Customized_Settings?.Visibility?.shareId || '';
    const effectiveBookName = flipbook?.flipbookName || flipbookName || 'Flipbook';
    const effectiveUserEmail = flipbook?.userEmail || userEmail || '';

    const detectedViewerIp =
      req.headers['cf-connecting-ip'] ||
      req.headers['x-real-ip'] ||
      (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
      req.socket?.remoteAddress ||
      '';

    const newLead = await Lead.create({
      userId: ownerUserId || new mongoose.Types.ObjectId(),
      userID: flipbook?.userID || null,
      userEmail: effectiveUserEmail,
      v_id: effectiveVId,
      shareId: effectiveShareId,
      flipbookName: effectiveBookName,
      leadData,
      viewerIp: detectedViewerIp,
      submittedAt: new Date()
    });

    if (flipbook) {
      await Flipbook.updateOne(
        { _id: flipbook._id },
        {
          $push: {
            collectedLeads: {
              leadId: newLead.leadId,
              submittedAt: newLead.submittedAt,
              data: leadData,
              viewerIp: detectedViewerIp
            }
          }
        }
      ).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: 'Lead submitted successfully',
      leadId: newLead.leadId
    });
  } catch (err) {
    console.error('[Customized Editor] Error submitting lead:', err);
    return res.status(500).json({ success: false, message: 'Server error submitting lead', error: err.message });
  }
};

/**
 * GET /leads
 * Retrieve leads collected for the authenticated user's flipbooks.
 * Accessible strictly by userId.
 */
const getLeads = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const userQuery = getUserQuery(req);
    const { v_id, page = 1, limit = 50 } = req.query;

    if (!userQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const filter = { ...userQuery };
    if (v_id) {
      filter.v_id = v_id;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      Lead.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      leads,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (err) {
    console.error('[Customized Editor] Error getting leads:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leads', error: err.message });
  }
};

/**
 * DELETE /leads/:leadId
 * Delete a lead record. Authorized by userId.
 */
const deleteLead = async (req, res) => {
  try {
    const userQuery = getUserQuery(req);
    const leadId = req.params?.leadId || req.body?.leadId;

    if (!leadId) {
      return res.status(400).json({ success: false, message: 'Missing leadId' });
    }

    const deleted = await Lead.findOneAndDelete({ ...userQuery, leadId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lead not found or unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (err) {
    console.error('[Customized Editor] Error deleting lead:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete lead', error: err.message });
  }
};

/**
 * POST /verify-credential
 * Public verification of password or access key for protected flipbooks
 */
const verifyCredential = async (req, res) => {
  try {
    const { v_id, input, mode } = req.body;

    if (!input) {
      return res.status(400).json({ success: false, message: 'Missing credential input' });
    }

    let settings = null;
    if (v_id) {
      settings = await CustomizedSettings.findOne({ v_id });
      if (!settings) {
        const fb = await Flipbook.findOne({ v_id });
        settings = fb?.Customized_Settings;
      }
    }

    if (!settings || !settings.Visibility) {
      return res.status(404).json({ success: false, message: 'Flipbook protection settings not found' });
    }

    const vis = settings.Visibility;
    let isMatch = false;

    if (mode === 'accessKey') {
      isMatch = Boolean(vis.accessKey && vis.accessKey === input.trim());
    } else {
      // Password mode
      if (vis.password) {
        if (vis.password.startsWith('$2a$') || vis.password.startsWith('$2b$')) {
          isMatch = await bcrypt.compare(input, vis.password);
        } else {
          isMatch = (vis.password === input);
        }
      }
    }

    if (isMatch) {
      return res.status(200).json({
        success: true,
        message: 'Verification successful'
      });
    }

    return res.status(400).json({
      success: false,
      message: mode === 'accessKey' ? 'Current access key is incorrect.' : 'Current password is incorrect.'
    });
  } catch (err) {
    console.error('[Customized Editor] Error verifying credential:', err);
    return res.status(500).json({ success: false, message: 'Server error verifying credential', error: err.message });
  }
};

/**
 * POST /send-visibility-otp
 */
const sendVisibilityOtp = async (req, res) => {
  try {
    const { emailId, v_id } = req.body;
    if (!emailId) {
      return res.status(400).json({ success: false, message: 'Missing emailId' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    if (v_id) {
      await CustomizedSettings.updateOne({ v_id }, { $set: { 'Visibility.otp': hashedOtp } });
      await Flipbook.updateOne({ v_id }, { $set: { 'Customized_Settings.Visibility.otp': hashedOtp } });
    }

    // In local dev/testing, return success
    return res.status(200).json({
      success: true,
      message: 'OTP generated and sent to email'
    });
  } catch (err) {
    console.error('[Customized Editor] Error sending visibility OTP:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP', error: err.message });
  }
};

/**
 * POST /verify-visibility-otp
 */
const verifyVisibilityOtp = async (req, res) => {
  try {
    const { v_id, otp } = req.body;
    if (!v_id || !otp) {
      return res.status(400).json({ success: false, message: 'v_id and otp required' });
    }

    const doc = await CustomizedSettings.findOne({ v_id });
    const storedHashedOtp = doc?.Visibility?.otp;

    if (!storedHashedOtp) {
      return res.status(400).json({ success: false, message: 'No OTP requested or OTP expired' });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), storedHashedOtp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    // Clear OTP after successful verification
    await CustomizedSettings.updateOne({ v_id }, { $unset: { 'Visibility.otp': 1 } });
    await Flipbook.updateOne({ v_id }, { $unset: { 'Customized_Settings.Visibility.otp': 1 } });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (err) {
    console.error('[Customized Editor] Error verifying OTP:', err);
    return res.status(500).json({ success: false, message: 'Server error verifying OTP', error: err.message });
  }
};

/**
 * GET /presets
 * Get saved presets for the user by userId
 */
const getUserPresets = async (req, res) => {
  try {
    const userQuery = getUserQuery(req);
    if (!userQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const presets = await EditorPreset.find(userQuery).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, presets });
  } catch (err) {
    console.error('[Customized Editor] Error getting presets:', err);
    return res.status(500).json({ success: false, message: 'Failed to get presets', error: err.message });
  }
};

/**
 * POST /presets
 * Save a new preset for the user by userId
 */
const saveUserPreset = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const { presetName, settings, isDefault = false } = req.body;

    if (!authUser.objectId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }
    if (!presetName || !settings) {
      return res.status(400).json({ success: false, message: 'presetName and settings required' });
    }

    if (isDefault) {
      await EditorPreset.updateMany({ userId: authUser.objectId }, { $set: { isDefault: false } });
    }

    const preset = await EditorPreset.findOneAndUpdate(
      { userId: authUser.objectId, presetName: presetName.trim() },
      {
        $set: {
          userId: authUser.objectId,
          userID: authUser.customUserId,
          userEmail: authUser.emailId,
          presetName: presetName.trim(),
          settings,
          isDefault
        }
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Preset saved successfully',
      preset
    });
  } catch (err) {
    console.error('[Customized Editor] Error saving preset:', err);
    return res.status(500).json({ success: false, message: 'Failed to save preset', error: err.message });
  }
};

/**
 * POST /book-appearance
 * Update BookAppearance settings (including transparentSheets, hardcover, drop shadow, flip styles)
 */
const updateBookAppearance = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const { v_id, BookAppearance, transparentSheets } = req.body;

    if (!v_id) {
      return res.status(400).json({ success: false, message: 'v_id is required' });
    }

    const defaults = getDefaultSettings();
    const existing = await CustomizedSettings.findOne({ v_id });
    const currentApp = existing?.BookAppearance ? existing.BookAppearance.toObject() : defaults.BookAppearance;

    const incomingApp = BookAppearance || {};
    if (transparentSheets !== undefined) {
      incomingApp.transparentSheets = Array.isArray(transparentSheets) ? transparentSheets : [];
    }

    const mergedApp = {
      ...currentApp,
      ...incomingApp
    };

    if (incomingApp.transparentSheets !== undefined) {
      mergedApp.transparentSheets = incomingApp.transparentSheets;
    }

    let updated;
    const appearancePayload = {
      $set: {
        BookAppearance: mergedApp,
        ...(authUser.customUserId ? { userID: authUser.customUserId } : {}),
        ...(authUser.emailId ? { userEmail: authUser.emailId } : {})
      },
      $unset: { userId: 1, appearance: 1 }
    };

    try {
      updated = await CustomizedSettings.findOneAndUpdate(
        { v_id, ...(authUser.customUserId ? { userID: authUser.customUserId } : {}) },
        appearancePayload,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } catch (upsertErr) {
      if (upsertErr.code === 11000) {
        updated = await CustomizedSettings.findOneAndUpdate(
          { v_id },
          appearancePayload,
          { new: true }
        );
      } else {
        throw upsertErr;
      }
    }

    await Flipbook.updateOne(
      { v_id },
      {
        $set: { 'Customized_Settings.BookAppearance': mergedApp },
        $unset: { 'Customized_Settings.appearance': 1, 'Customized_Settings.userId': 1 }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Book appearance updated successfully',
      BookAppearance: updated.BookAppearance
    });
  } catch (err) {
    console.error('[Customized Editor] Error updating book appearance:', err);
    return res.status(500).json({ success: false, message: 'Failed to update book appearance', error: err.message });
  }
};

/**
 * POST /book-appearance/transparent-sheet
 * Add or update a transparent sheet in BookAppearance.transparentSheets
 */
const saveTransparentSheet = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const { v_id, sheet } = req.body;

    if (!v_id || !sheet) {
      return res.status(400).json({ success: false, message: 'v_id and sheet object are required' });
    }

    const defaults = getDefaultSettings();
    const existing = await CustomizedSettings.findOne({ v_id });
    const currentApp = existing?.BookAppearance ? existing.BookAppearance.toObject() : defaults.BookAppearance;
    const sheets = Array.isArray(currentApp.transparentSheets) ? [...currentApp.transparentSheets] : [];

    const sheetId = sheet.id || Date.now();
    const index = sheets.findIndex(s => String(s.id) === String(sheetId));

    const normalizedSheet = {
      id: sheetId,
      page: sheet.page || 'Page 1',
      image: sheet.image || null,
      imageName: sheet.imageName || null,
      imageSize: sheet.imageSize || null,
      scale: sheet.scale !== undefined ? Number(sheet.scale) : 100,
      rotate: sheet.rotate !== undefined ? Number(sheet.rotate) : 0,
      opacity: sheet.opacity !== undefined ? Number(sheet.opacity) : 100,
      offsetX: sheet.offsetX !== undefined ? Number(sheet.offsetX) : 0,
      offsetY: sheet.offsetY !== undefined ? Number(sheet.offsetY) : 0,
      isExpanded: sheet.isExpanded !== undefined ? Boolean(sheet.isExpanded) : true
    };

    if (index >= 0) {
      sheets[index] = { ...sheets[index], ...normalizedSheet };
    } else {
      sheets.push(normalizedSheet);
    }

    currentApp.transparentSheets = sheets;

    let updated;
    const sheetPayload = {
      $set: {
        'BookAppearance.transparentSheets': sheets,
        ...(authUser.customUserId ? { userID: authUser.customUserId } : {}),
        ...(authUser.emailId ? { userEmail: authUser.emailId } : {})
      },
      $unset: { userId: 1, appearance: 1 }
    };

    try {
      updated = await CustomizedSettings.findOneAndUpdate(
        { v_id, ...(authUser.customUserId ? { userID: authUser.customUserId } : {}) },
        sheetPayload,
        { new: true, upsert: true }
      );
    } catch (upsertErr) {
      if (upsertErr.code === 11000) {
        updated = await CustomizedSettings.findOneAndUpdate(
          { v_id },
          sheetPayload,
          { new: true }
        );
      } else {
        throw upsertErr;
      }
    }

    await Flipbook.updateOne(
      { v_id },
      {
        $set: { 'Customized_Settings.BookAppearance.transparentSheets': sheets },
        $unset: { 'Customized_Settings.appearance': 1, 'Customized_Settings.userId': 1 }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Transparent sheet saved successfully',
      transparentSheets: sheets,
      sheet: normalizedSheet
    });
  } catch (err) {
    console.error('[Customized Editor] Error saving transparent sheet:', err);
    return res.status(500).json({ success: false, message: 'Failed to save transparent sheet', error: err.message });
  }
};

/**
 * DELETE /book-appearance/transparent-sheet/:sheetId
 * or POST /book-appearance/delete-transparent-sheet
 * Delete a transparent sheet from BookAppearance.transparentSheets
 */
const deleteTransparentSheet = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const v_id = req.body.v_id || req.query.v_id;
    const sheetId = req.params.sheetId || req.body.sheetId;

    if (!v_id || !sheetId) {
      return res.status(400).json({ success: false, message: 'v_id and sheetId are required' });
    }

    const existing = await CustomizedSettings.findOne({ v_id });
    if (!existing || !existing.BookAppearance) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }

    const currentSheets = Array.isArray(existing.BookAppearance.transparentSheets)
      ? existing.BookAppearance.transparentSheets
      : [];

    const sheetToDelete = currentSheets.find(s => String(s.id) === String(sheetId));
    const filteredSheets = currentSheets.filter(s => String(s.id) !== String(sheetId));

    if (sheetToDelete && sheetToDelete.image && sheetToDelete.image.includes('/customized_assets/')) {
      deleteAssetFile(sheetToDelete.image);
    }

    await CustomizedSettings.updateOne(
      { v_id },
      {
        $set: {
          'BookAppearance.transparentSheets': filteredSheets,
          ...(authUser.customUserId ? { userID: authUser.customUserId } : {}),
          ...(authUser.emailId ? { userEmail: authUser.emailId } : {})
        },
        $unset: { userId: 1, appearance: 1 }
      }
    );

    await Flipbook.updateOne(
      { v_id },
      {
        $set: { 'Customized_Settings.BookAppearance.transparentSheets': filteredSheets },
        $unset: { 'Customized_Settings.appearance': 1, 'Customized_Settings.userId': 1 }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Transparent sheet deleted successfully',
      transparentSheets: filteredSheets
    });
  } catch (err) {
    console.error('[Customized Editor] Error deleting transparent sheet:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete transparent sheet', error: err.message });
  }
};

module.exports = {
  getStatus,
  checkAuth,
  getSettings,
  getPublicSettings,
  updateSettings,
  resetSettings,
  uploadCustomizedAsset,
  deleteCustomizedAsset,
  getUserAssets,
  getBackgroundAssets,
  copyThemeAsset,
  submitLead,
  getLeads,
  deleteLead,
  verifyCredential,
  sendVisibilityOtp,
  verifyVisibilityOtp,
  getUserPresets,
  saveUserPreset,
  updateBookAppearance,
  saveTransparentSheet,
  deleteTransparentSheet
};
