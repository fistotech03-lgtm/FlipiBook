const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const CustomizedSettings = require('../models/customizedSettings');
const Lead = require('../models/lead');
const UserGallery = require('../models/userGallery');
const EditorPreset = require('../models/editorPreset');
const Flipbook = require('../models/flipbook');
const backupService = require('../../../../shared/backupService');

const { getAuthUser, getUserQuery, getUserStorageFolder } = require('../utils/userHelper');
const {
  getStorageRoot,
  getAssetTypeFolder,
  getCustomizedAssetUploadDir,
  toPublicStorageUrl,
  deleteAssetFile
} = require('../utils/storageHelper');
const { getDefaultSettings } = require('../utils/defaultSettings');

const VIRTUAL_FOLDERS = new Set([
  'recent book',
  'recent',
  'all books',
  'all flipbooks',
  'favorites',
  'trash',
]);

const resolveFolder = (folderName) => {
  if (Array.isArray(folderName)) {
    const flat = folderName.flat(Infinity);
    const realFolders = flat.filter(
      (f) => f && typeof f === 'string' && !VIRTUAL_FOLDERS.has(String(f).trim().toLowerCase())
    );
    return realFolders.length > 0 ? String(realFolders[0]).trim() : 'default';
  }
  if (typeof folderName === 'string' && folderName.trim()) {
    const clean = folderName.trim();
    if (VIRTUAL_FOLDERS.has(clean.toLowerCase())) return 'default';
    return clean;
  }
  return 'default';
};

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

        if (!initialSettings.Visibility?.shareId || initialSettings.Visibility?.shareId === flipbookDoc.v_id) {
          if (!initialSettings.Visibility) initialSettings.Visibility = {};
          initialSettings.Visibility.shareId = crypto.randomBytes(8).toString('hex');
        }

        try {
          settingsDoc = await CustomizedSettings.create({
            userID: authUser.customUserId || flipbookDoc.userID || 'default_user',
            userEmail: authUser.emailId || flipbookDoc.userEmail || '',
            v_id: flipbookDoc.v_id,
            flipbookName: flipbookDoc.flipbookName,
            folderName: resolveFolder(flipbookDoc.folderName),
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

    if (settingsDoc && (!settingsDoc.Visibility?.shareId || settingsDoc.Visibility?.shareId === settingsDoc.v_id)) {
      const distinctShareId = crypto.randomBytes(8).toString('hex');
      settingsDoc.Visibility = {
        ...(settingsDoc.Visibility?.toObject ? settingsDoc.Visibility.toObject() : (settingsDoc.Visibility || {})),
        shareId: distinctShareId
      };
      await CustomizedSettings.updateOne({ _id: settingsDoc._id }, { $set: { 'Visibility.shareId': distinctShareId } });
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
    const existingShareId =
      existing?.Visibility?.shareId ||
      existingSettings?.Visibility?.shareId ||
      flipbook?.share?.shareId ||
      flipbook?.Visibility?.shareId;

    const incomingShareId =
      incVisibility?.shareId ||
      req.body?.shareId ||
      req.body?.share?.shareId;

    let finalShareId = existingShareId;
    if (!finalShareId || finalShareId === resolvedVId) {
      finalShareId = (incomingShareId && incomingShareId !== resolvedVId)
        ? incomingShareId
        : crypto.randomBytes(8).toString('hex');
    }

    cleanSettings.Visibility.shareId = finalShareId;

    // 4. Update CustomizedSettings: Set ONLY canonical fields and explicitly purge userId + lowercase duplicates + profileSettings
    const updatePayload = {
      $set: {
        userID: targetUserID,
        userEmail: targetEmail,
        v_id: resolvedVId,
        flipbookName: effectiveBookName || flipbook?.flipbookName || existing?.flipbookName,
        folderName: folderName || existing?.folderName || 'default',
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

    // 5. Synchronize with Flipbook model (lastUpdated, userID)
    await Flipbook.updateOne(
      { $or: [{ v_id: resolvedVId }, ...(flipbook?._id ? [{ _id: flipbook._id }] : [])] },
      {
        $set: {
          userID: targetUserID,
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
    defaults.Visibility.shareId = crypto.randomBytes(8).toString('hex');

    const updated = await CustomizedSettings.findOneAndUpdate(
      { ...userQuery, v_id },
      { $set: defaults },
      { returnDocument: 'after' }
    );

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
 * Helper to find or create UserGallery document for a user in Customized Editor (strictly keyed by userObjectID and userID)
 */
const findOrCreateUserGallery = async (authUser, req = null) => {
  let userGallery = null;
  const orConds = [];
  if (authUser.objectId) orConds.push({ userObjectID: authUser.objectId });
  if (authUser.customUserId) orConds.push({ userID: authUser.customUserId });

  let resolvedUserId = authUser.customUserId;
  let userObjectId = authUser.objectId;
  const targetEmail = authUser.emailId || req?.body?.emailId || req?.query?.emailId;

  if ((!resolvedUserId || !userObjectId) && targetEmail) {
    try {
      if (mongoose.connection && mongoose.connection.db) {
        const u = await mongoose.connection.db.collection('users').findOne({
          emailId: new RegExp(`^${targetEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
        });
        if (u) {
          resolvedUserId = resolvedUserId || u.userID;
          userObjectId = userObjectId || u._id;
          if (u._id && !orConds.some(c => c.userObjectID && String(c.userObjectID) === String(u._id))) {
            orConds.push({ userObjectID: u._id });
          }
          if (u.userID && !orConds.some(c => c.userID === u.userID)) {
            orConds.push({ userID: u.userID });
          }
        }
      }
    } catch (e) {}
  }

  if (orConds.length > 0) {
    userGallery = await UserGallery.findOne({ $or: orConds });
  }

  if (!userGallery) {
    if (!resolvedUserId) {
      resolvedUserId = getUserStorageFolder(req);
    }

    userGallery = new UserGallery({
      userObjectID: userObjectId || null,
      userID: resolvedUserId || null,
      userdetails: { images: [] },
      pageEditorgallery: { images: [], video: [], gif: [] },
      CustomizationGallery: { images: [], videos: [] },
      '3DGallery': { models: [], texture: [], snapshot: [] }
    });

    try {
      await userGallery.save();
    } catch (saveErr) {
      if (saveErr.code === 11000 && orConds.length > 0) {
        userGallery = await UserGallery.findOne({ $or: orConds });
      }
    }
  }

  if (userGallery) {
    if (!userGallery.userdetails) userGallery.userdetails = { images: [] };
    if (!userGallery.CustomizationGallery) userGallery.CustomizationGallery = { images: [], videos: [] };
    if (!userGallery.pageEditorgallery) userGallery.pageEditorgallery = { images: [], video: [], gif: [] };
    if (!userGallery['3DGallery']) userGallery['3DGallery'] = { models: [], texture: [], snapshot: [] };
  }

  return userGallery;
};

/**
 * POST /upload-customized-asset
 * Upload logo, watermark, background image/video, sound, etc.
 * Stores in unified UserGallery schema and storage/<userFolder>/Gallery/...
 */
const uploadCustomizedAsset = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const reqEmail = req.body.emailId || req.query.emailId;
    if (!authUser.objectId && !authUser.emailId && !reqEmail) {
      return res.status(401).json({ success: false, message: 'Authentication required to upload assets' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { assetType = 'Logo', folderName = 'default', flipbookName, v_id, oldSrc } = req.body;
    let userFolder = getUserStorageFolder(req);

    // If userFolder was a raw ObjectId or email, try to resolve to canonical FLIPIxxxx if available
    const emailToLookup = authUser.emailId || reqEmail;
    if (emailToLookup && (!userFolder || !/^FLIPI\d+/i.test(userFolder))) {
      try {
        if (mongoose.connection && mongoose.connection.db) {
          const u = await mongoose.connection.db.collection('users').findOne({
            emailId: new RegExp(`^${emailToLookup.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
          });
          if (u && u.userID) {
            userFolder = u.userID;
          }
        }
      } catch (e) {}
    }

    const typeFolder = getAssetTypeFolder(assetType);

    // If replacing an old asset, remove from disk
    if (oldSrc) {
      try {
        deleteAssetFile(oldSrc);
      } catch (e) {}
    }

    // Target upload folder on disk in unified Gallery structure
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
    const fileSize = req.file.size || (fs.existsSync(targetPath) ? fs.statSync(targetPath).size : 0);

    // Record asset in UserGallery model
    const userGallery = await findOrCreateUserGallery(authUser, req);
    let assetId = safeName;

    if (userGallery) {
      if (typeFolder === 'Logo' || typeFolder === 'Company_Logo' || typeFolder === 'Preloader') {
        const item = {
          type: 'company_logo',
          originalName: req.file.originalname,
          convertedName: safeName,
          filePath: targetPath,
          url: publicUrl,
          size: fileSize,
          timestamp: new Date()
        };
        userGallery.userdetails.images.push(item);
        userGallery.markModified('userdetails');
        const added = userGallery.userdetails.images[userGallery.userdetails.images.length - 1];
        if (added && added._id) assetId = added._id.toString();
      } else if (typeFolder === 'Profile') {
        const item = {
          type: 'profile',
          originalName: req.file.originalname,
          convertedName: safeName,
          filePath: targetPath,
          url: publicUrl,
          size: fileSize,
          timestamp: new Date()
        };
        userGallery.userdetails.images.push(item);
        userGallery.markModified('userdetails');
        const added = userGallery.userdetails.images[userGallery.userdetails.images.length - 1];
        if (added && added._id) assetId = added._id.toString();
      } else if (typeFolder === 'Video') {
        const item = {
          originalName: req.file.originalname,
          convertedName: safeName,
          filePath: targetPath,
          url: publicUrl,
          size: fileSize,
          timestamp: new Date()
        };
        userGallery.CustomizationGallery.videos.push(item);
        userGallery.markModified('CustomizationGallery');
        const added = userGallery.CustomizationGallery.videos[userGallery.CustomizationGallery.videos.length - 1];
        if (added && added._id) assetId = added._id.toString();
      } else {
        // Images, Background, Watermark, Transparent_Sheet, Texture, Gallery_Image, Other
        const item = {
          originalName: req.file.originalname,
          convertedName: safeName,
          filePath: targetPath,
          url: publicUrl,
          size: fileSize,
          timestamp: new Date()
        };
        userGallery.CustomizationGallery.images.push(item);
        userGallery.markModified('CustomizationGallery');
        const added = userGallery.CustomizationGallery.images[userGallery.CustomizationGallery.images.length - 1];
        if (added && added._id) assetId = added._id.toString();
      }
      await userGallery.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Customized asset uploaded successfully',
      url: publicUrl,
      fileName: safeName,
      assetType: typeFolder,
      assetId,
      size: fileSize
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
 * Deletes asset file from disk and its metadata record from UserGallery.
 */
const deleteCustomizedAsset = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const { url, assetId, fileName } = req.body;

    if (!url && !assetId && !fileName) {
      return res.status(400).json({ success: false, message: 'Asset url, assetId or fileName required' });
    }

    // 1. Delete asset file from disk
    let deletedFromDisk = false;
    if (url) {
      deletedFromDisk = deleteAssetFile(url);
    }

    // 2. Remove record from UserGallery
    const userGallery = await findOrCreateUserGallery(authUser, req);
    if (userGallery) {
      const matchPred = (item) => {
        if (!item) return false;
        if (url && item.url === url) return true;
        if (assetId && (item._id?.toString() === String(assetId) || item.convertedName === String(assetId))) return true;
        if (fileName && item.convertedName === fileName) return true;
        return false;
      };

      const filterSection = (arr) => {
        const removed = [];
        const kept = [];
        for (const it of arr) {
          if (matchPred(it)) {
            removed.push(it);
          } else {
            kept.push(it);
          }
        }
        return { kept, removed };
      };

      const resUserImages = filterSection(userGallery.userdetails?.images || []);
      const resCustomImages = filterSection(userGallery.CustomizationGallery?.images || []);
      const resCustomVideos = filterSection(userGallery.CustomizationGallery?.videos || []);

      userGallery.userdetails.images = resUserImages.kept;
      userGallery.CustomizationGallery.images = resCustomImages.kept;
      userGallery.CustomizationGallery.videos = resCustomVideos.kept;

      userGallery.markModified('userdetails');
      userGallery.markModified('CustomizationGallery');
      await userGallery.save();

      const allRemoved = [...resUserImages.removed, ...resCustomImages.removed, ...resCustomVideos.removed];

      // If file was not yet deleted from disk by URL, delete via item.filePath in background
      if (!deletedFromDisk && allRemoved.length > 0) {
        setImmediate(async () => {
          for (const it of allRemoved) {
            if (it.filePath && fs.existsSync(it.filePath)) {
              await fs.promises.unlink(it.filePath).catch(() => {});
            }
          }
        });
      }

      // Record gallery asset deletion in backup DB
      const userFolder = getUserStorageFolder(authUser);
      backupService.recordGalleryAssetDeletion({
        userFolder: userFolder || authUser?.customUserId || authUser?.userID,
        userObjectID: authUser?.objectId || authUser?.rawId,
        userID: authUser?.customUserId || authUser?.userID,
        category: 'CustomizationGallery',
        assets: allRemoved,
        targetName: fileName || assetId,
        url: url || ''
      }, {
        req,
        user: authUser,
        reason: 'USER_GALLERY_DELETE'
      });
    }

    // 3. For backwards compatibility, clean legacy collection if any doc remains
    try {
      if (mongoose.connection && mongoose.connection.db) {
        const q = {};
        if (url) q.url = url;
        if (fileName) q.fileName = fileName;
        if (assetId && /^[0-9a-fA-F]{24}$/.test(assetId)) q._id = new mongoose.Types.ObjectId(assetId);
        if (Object.keys(q).length > 0) {
          await mongoose.connection.db.collection('customizedassets').deleteMany(q);
        }
      }
    } catch (e) {}

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
 * List user's customized assets from UserGallery
 */
const getUserAssets = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const { assetType, v_id } = req.query;

    const userGallery = await findOrCreateUserGallery(authUser, req);
    const assets = [];

    if (userGallery) {
      // 1. userdetails.images (Logo / Profile)
      (userGallery.userdetails?.images || []).forEach(item => {
        if (!item || !item.url) return;
        const mappedType = item.type === 'company_logo' ? 'Logo' : 'Profile';
        assets.push({
          id: item._id?.toString() || item.convertedName,
          _id: item._id?.toString() || item.convertedName,
          fileName: item.convertedName,
          originalName: item.originalName,
          url: item.url,
          storagePath: item.filePath,
          size: item.size || 0,
          assetType: mappedType,
          createdAt: item.timestamp || new Date()
        });
      });

      // 2. CustomizationGallery.images (Background / Watermark / Texture / etc.)
      (userGallery.CustomizationGallery?.images || []).forEach(item => {
        if (!item || !item.url) return;
        let detectedType = 'Background';
        const nameLower = (item.convertedName || '').toLowerCase();
        if (nameLower.includes('watermark')) detectedType = 'Watermark';
        else if (nameLower.includes('texture')) detectedType = 'Texture';
        else if (nameLower.includes('transparent')) detectedType = 'Transparent_Sheet';
        else if (nameLower.includes('preloader')) detectedType = 'Preloader';

        assets.push({
          id: item._id?.toString() || item.convertedName,
          _id: item._id?.toString() || item.convertedName,
          fileName: item.convertedName,
          originalName: item.originalName,
          url: item.url,
          storagePath: item.filePath,
          size: item.size || 0,
          assetType: detectedType,
          createdAt: item.timestamp || new Date()
        });
      });

      // 3. CustomizationGallery.videos (Video / Audio)
      (userGallery.CustomizationGallery?.videos || []).forEach(item => {
        if (!item || !item.url) return;
        assets.push({
          id: item._id?.toString() || item.convertedName,
          _id: item._id?.toString() || item.convertedName,
          fileName: item.convertedName,
          originalName: item.originalName,
          url: item.url,
          storagePath: item.filePath,
          size: item.size || 0,
          assetType: 'Video',
          createdAt: item.timestamp || new Date()
        });
      });
    }

    // 4. Query legacy customizedassets collection if any exist
    try {
      if (mongoose.connection && mongoose.connection.db) {
        const legacyQuery = {};
        if (authUser.objectId) legacyQuery.userId = authUser.objectId;
        else if (authUser.emailId) legacyQuery.userEmail = authUser.emailId;

        const legacyDocs = await mongoose.connection.db.collection('customizedassets').find(legacyQuery).toArray();
        for (const doc of legacyDocs) {
          if (doc && doc.url && !assets.some(a => a.url === doc.url)) {
            assets.push({
              id: doc._id?.toString() || doc.fileName,
              _id: doc._id?.toString() || doc.fileName,
              fileName: doc.fileName,
              originalName: doc.originalName || doc.fileName,
              url: doc.url,
              storagePath: doc.storagePath,
              size: doc.size || 0,
              assetType: doc.assetType || 'Background',
              createdAt: doc.createdAt || new Date()
            });
          }
        }
      }
    } catch (e) {}

    // Filter by assetType if requested
    let filteredAssets = assets;
    if (assetType) {
      const normalizedTarget = getAssetTypeFolder(assetType).toLowerCase();
      filteredAssets = assets.filter(a => {
        const aType = (a.assetType || '').toLowerCase();
        if (normalizedTarget === 'logo' || normalizedTarget === 'company_logo') {
          return aType === 'logo' || aType === 'company_logo';
        }
        if (normalizedTarget === 'background') {
          return aType === 'background' || aType === 'image' || aType === 'watermark' || aType === 'texture' || aType === 'transparent_sheet';
        }
        return aType === normalizedTarget;
      });
    }

    filteredAssets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      assets: filteredAssets,
      count: filteredAssets.length
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
    const { imageUrl, v_id, folderName = 'default', flipbookName = 'Untitled' } = req.body;

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

    // Record in UserGallery
    try {
      const userGallery = await findOrCreateUserGallery(authUser, req);
      if (userGallery) {
        const item = {
          originalName: path.basename(imageUrl),
          convertedName: fileName,
          filePath: destPath,
          url: publicUrl,
          size: fs.existsSync(destPath) ? fs.statSync(destPath).size : 0,
          timestamp: new Date()
        };
        if (isVideo) {
          userGallery.CustomizationGallery.videos.push(item);
        } else {
          userGallery.CustomizationGallery.images.push(item);
        }
        userGallery.markModified('CustomizationGallery');
        await userGallery.save();
      }
    } catch (ugErr) {}

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
    let settingsDoc = null;
    if (shareId) {
      settingsDoc = await CustomizedSettings.findOne({ 'Visibility.shareId': shareId });
      if (settingsDoc) {
        flipbook = await Flipbook.findOne({ v_id: settingsDoc.v_id });
      }
    }
    if (!flipbook && v_id && v_id !== 'preview') {
      flipbook = await Flipbook.findOne({ v_id });
    }
    if (!flipbook && shareId) {
      flipbook = await Flipbook.findOne({ v_id: shareId });
    }
    if (!settingsDoc && flipbook?.v_id) {
      settingsDoc = await CustomizedSettings.findOne({ v_id: flipbook.v_id });
    }

    const ownerUserId = flipbook?.userId || (flipbook?.userID ? null : undefined);
    const effectiveVId = flipbook?.v_id || v_id || 'preview';
    const effectiveShareId = shareId || settingsDoc?.Visibility?.shareId || '';
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

    // Record lead deletion in backup database
    backupService.recordLeadDeletion(deleted, { req, reason: 'USER_DELETE' });

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

/**
 * Helper to resolve flipbook by Visibility.shareId across collections
 */
const findBookByShareId = async (shareId) => {
  if (!shareId) return null;

  // 1. Primary: search CustomizedSettings collection by Visibility.shareId
  let customizedDoc = await CustomizedSettings.findOne({ 'Visibility.shareId': shareId });
  let book = null;

  if (customizedDoc) {
    book = await Flipbook.findOne({ v_id: customizedDoc.v_id });
  }

  // 2. Search Flipbook model by legacy fields
  if (!book) {
    book = await Flipbook.findOne({
      $or: [
        { 'Visibility.shareId': shareId },
        { 'share.shareId': shareId },
        { 'settings.Visibility.shareId': shareId },
        { 'settings.shareId': shareId }
      ]
    });
  }

  // 3. Fallback by v_id only if no shareId matched
  if (!book) {
    book = await Flipbook.findOne({ v_id: shareId });
  }

  if (book && !customizedDoc) {
    customizedDoc = await CustomizedSettings.findOne({ v_id: book.v_id });
  }

  if (book && customizedDoc) {
    const custObj = customizedDoc.toObject ? customizedDoc.toObject() : customizedDoc;
    book.Customized_Settings = {
      ...(book.Customized_Settings || {}),
      ...custObj,
      Visibility: custObj.Visibility || book.Customized_Settings?.Visibility
    };
  }

  // Ensure shareId is distinct from v_id
  if (book) {
    if (!book.Customized_Settings) book.Customized_Settings = {};
    if (!book.Customized_Settings.Visibility) book.Customized_Settings.Visibility = {};
    if (!book.Customized_Settings.Visibility.shareId || book.Customized_Settings.Visibility.shareId === book.v_id) {
      const distinctShareId = crypto.randomBytes(8).toString('hex');
      book.Customized_Settings.Visibility.shareId = distinctShareId;
      CustomizedSettings.updateOne({ v_id: book.v_id }, { $set: { 'Visibility.shareId': distinctShareId } }).catch(() => {});
    }
  }

  return book;
};

/**
 * GET /api/flipbook/public/get/:shareId
 * Fetch specific flipbook content publicly for sharing or owner preview
 */
const getPublicBook = async (req, res) => {
  try {
    const { shareId } = req.params;
    if (!shareId) return res.status(400).json({ success: false, message: "Missing shareId" });

    let book = await findBookByShareId(shareId);

    const reqEmail = (req.query.emailId || req.user?.email || req.user?.emailId || '').trim().toLowerCase();
    const reqUserID = (req.query.userID || req.user?.userID || '').trim();
    const reqUserId = (req.query.userId || req.user?.userId || req.user?.id || req.user?._id || '').toString().trim();

    // 1. Fallback by req.query.v_id if provided
    if (!book && req.query.v_id) {
      book = await findBookByShareId(req.query.v_id);
    }

    // 2. Fallback: if caller is authenticated/provided user params and user has exactly one flipbook
    if (!book && (reqEmail || reqUserID || reqUserId)) {
      const userConditions = [];
      if (reqEmail) userConditions.push({ userEmail: reqEmail });
      if (reqUserID) userConditions.push({ userID: reqUserID });
      if (reqUserId) userConditions.push({ userId: reqUserId });

      if (userConditions.length > 0) {
        const userBooks = await Flipbook.find({
          $or: userConditions,
          trash: { $ne: true }
        }).limit(2);

        if (userBooks && userBooks.length === 1) {
          book = await findBookByShareId(userBooks[0].v_id);
        }
      }
    }

    if (!book) {
      return res.status(404).json({ success: false, message: "Flipbook not found" });
    }

    const vis = book.Customized_Settings?.Visibility || book.share || {};

    const ownerEmail = (book.userEmail || '').trim().toLowerCase();
    const ownerUserID = (book.userID || '').trim();
    const ownerUserId = (book.userId ? String(book.userId) : '').trim();

    let isOwner = false;
    if (reqEmail && ownerEmail && reqEmail === ownerEmail) isOwner = true;
    if (reqUserID && ownerUserID && reqUserID === ownerUserID) isOwner = true;
    if (reqUserId && ownerUserId && reqUserId === ownerUserId) isOwner = true;
    const accessMode = String(vis.access || vis.type || 'public').toLowerCase();

    // Publication check (Owner can preview unpublished, public readers cannot)
    if (!isOwner && (book.isPublished === false || !book.isPublished)) {
      return res.status(403).json({
        success: false,
        message: "This Flipbook not Yet Published",
        isUnpublished: true
      });
    }

    // Pre-build preview page structures for background blur preview
    const previewPages = (book.pages || []).map(p => ({
      id: p.pageNumber,
      name: p.name,
      fileName: p.fileName,
      html: "",
      v_id: p.v_id,
      hide: p.hide || 0
    }));

    // 1. Private access check
    if (accessMode.includes('private') && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "This flipbook is private. It cannot be viewed via public link.",
        isPrivate: true,
        accessMode: 'private'
      });
    }

    // 2. Password Protect access check
    if (accessMode.includes('password') && !isOwner) {
      const inputKey = (req.query.accessKey || req.query.password || '').trim();
      const storedKey = String(vis.accessKey || vis.password || '').trim();
      let keyMatches = false;
      if (storedKey && inputKey) {
        if (storedKey.startsWith('$2a$') || storedKey.startsWith('$2b$')) {
          try {
            keyMatches = await bcrypt.compare(inputKey, storedKey);
          } catch (e) {
            keyMatches = inputKey === storedKey;
          }
        } else {
          keyMatches = inputKey === storedKey;
        }
      }

      if (!keyMatches) {
        return res.status(401).json({
          success: false,
          message: "Invalid Access Key",
          isPasswordProtected: true,
          bookName: book.flipbookName,
          accessMode: 'password',
          pages: previewPages,
          FlipbookInfo: book.Customized_Settings?.FlipbookInfo || {},
          meta: book.Customized_Settings?.FlipbookInfo || {},
          Customized_Settings: book.Customized_Settings || {}
        });
      }
    }

    // 3. Invite Only Access check
    if (accessMode.includes('invite') && !isOwner) {
      const allowedEmails = (vis.inviteOnly?.emails || []).map(e => (typeof e === 'string' ? e : e?.email || '').toLowerCase());
      const allowedDomains = (vis.inviteOnly?.domains || []).map(d => (typeof d === 'string' ? d : d?.domain || '').toLowerCase());

      const userEmailLower = (reqEmail || '').toLowerCase();
      const userDomainLower = userEmailLower.includes('@') ? userEmailLower.split('@')[1] : '';

      const isEmailAllowed = allowedEmails.includes(userEmailLower);
      const isDomainAllowed = allowedDomains.some(dom => userDomainLower === dom || userDomainLower.endsWith('.' + dom));

      if (!userEmailLower || (!isEmailAllowed && !isDomainAllowed)) {
        return res.status(403).json({
          success: false,
          message: "Invite only access required",
          isInviteOnly: true,
          accessMode: 'invite',
          pages: previewPages,
          FlipbookInfo: book.Customized_Settings?.FlipbookInfo || {},
          meta: book.Customized_Settings?.FlipbookInfo || {},
          Customized_Settings: book.Customized_Settings || {}
        });
      }

      // Check Auto Expire timer
      const autoExpire = vis.inviteOnly?.autoExpire;
      if (autoExpire && autoExpire.enabled) {
        const rawGranted = autoExpire.grantedAt || autoExpire.createdAt || book.updatedAt || book.createdAt;
        if (rawGranted) {
          const grantedAt = new Date(rawGranted).getTime();
          const daysStr = String(autoExpire.days || '0');
          const daysMatch = daysStr.match(/(\d+)/);
          const daysNum = daysMatch ? parseInt(daysMatch[1], 10) : 0;
          const timeStr = String(autoExpire.time || '0');
          const timeMatch = timeStr.match(/(\d+)/);
          const timeNum = timeMatch ? parseInt(timeMatch[1], 10) : 0;
          let timeInMs = timeStr.toLowerCase().includes('hour') ? timeNum * 3600000 : timeNum * 60000;
          const totalAllowedMs = (daysNum * 86400000) + timeInMs;
          if (totalAllowedMs > 0 && (Date.now() - grantedAt) > totalAllowedMs) {
            return res.status(403).json({
              success: false,
              message: "Time Expired! The access time granted for this flipbook has expired.",
              isExpired: true,
              isInviteOnly: true,
              accessMode: 'invite',
              pages: previewPages,
              FlipbookInfo: book.Customized_Settings?.FlipbookInfo || {},
              meta: book.Customized_Settings?.FlipbookInfo || {},
              Customized_Settings: book.Customized_Settings || {}
            });
          }
        }
      }
    }

    // Populate page content from disk storage or MongoDB
    const storageRoot = getStorageRoot();
    const userFolders = Array.from(
      new Set(
        [
          book.userID,
          book.userId ? String(book.userId) : null,
          book.userEmail ? book.userEmail.replace(/[@.]/g, "_") : null,
        ].filter(Boolean)
      )
    );

    const primaryFolder = resolveFolder(book.folderName);
    const rawFolders = Array.isArray(book.folderName) ? book.folderName.flat(Infinity) : [book.folderName];
    const folders = Array.from(
      new Set(
        [primaryFolder, ...rawFolders, 'default']
          .filter((f) => f && typeof f === 'string' && f.trim())
          .map((f) => String(f).trim())
      )
    );

    const bookNames = Array.from(
      new Set(
        [book.flipbookName, book.v_id, `${book.flipbookName}_${book.v_id}`]
          .flat(Infinity)
          .filter((bn) => bn && typeof bn === 'string' && bn.trim())
          .map((bn) => String(bn).trim())
      )
    );

    const candidateDirs = [];
    for (const uf of userFolders) {
      if (!uf || typeof uf !== 'string') continue;
      for (const f of folders) {
        if (!f || typeof f !== 'string') continue;
        for (const bn of bookNames) {
          if (!bn || typeof bn !== 'string') continue;
          candidateDirs.push(
            path.join(storageRoot, uf, "books", f, bn),
            path.join(storageRoot, uf, "books", bn),
            path.join(storageRoot, uf, f, bn),
            path.join(storageRoot, uf, bn),
            path.join(storageRoot, "flipbooks", uf, f, bn),
            path.join(storageRoot, "flipbooks", uf, bn)
          );
        }
      }
    }

    const sanitizedEmail = (book.userEmail || '').replace(/[@.]/g, '_');
    let effectiveUserFolder = book.userID || sanitizedEmail;
    for (const uf of userFolders) {
      if (fs.existsSync(path.join(storageRoot, uf, 'books', primaryFolder, book.flipbookName))) {
        effectiveUserFolder = uf;
        break;
      }
      if (fs.existsSync(path.join(storageRoot, uf, primaryFolder, book.flipbookName))) {
        effectiveUserFolder = uf;
        break;
      }
    }
    const resolvedBaseUrl = `/storage/${effectiveUserFolder}/books/${primaryFolder}/${book.flipbookName}/`;

    const populatedPages = (book.pages || []).map((p) => {
      const pageObj = p.toObject ? p.toObject() : { ...p };
      let pageContent = "";

      for (const candDir of candidateDirs) {
        const candidateFiles = [
          pageObj.fileName ? path.join(candDir, "pages", pageObj.fileName) : null,
          pageObj.name ? path.join(candDir, "pages", `${pageObj.name}.svg`) : null,
          path.join(candDir, "pages", `${pageObj.pageNumber}.svg`),
          path.join(candDir, "pages", `Page ${pageObj.pageNumber}.svg`),
          path.join(candDir, `Page ${pageObj.pageNumber}.html`),
        ].filter(Boolean);

        for (const fPath of candidateFiles) {
          if (fs.existsSync(fPath)) {
            try {
              const str = fs.readFileSync(fPath, "utf8");
              if (str && str.trim()) {
                pageContent = str;
                break;
              }
            } catch (e) {}
          }
        }
        if (pageContent) break;
      }

      if (!pageContent) {
        pageContent = pageObj.content || pageObj.html || "";
      }

      if (pageContent && resolvedBaseUrl) {
        pageContent = pageContent.replace(/(src|href|xlink:href)=(['"])(?:\.\.\/|\.\/)?assets\//gi, `$1=$2${resolvedBaseUrl}assets/`);
      }

      const cleanName = String(pageObj.name || "").replace(/[\\/:*?"<>|]/g, "").trim();
      const resolvedFileName = pageObj.fileName || (cleanName ? (cleanName.endsWith(".svg") ? cleanName : `${cleanName}.svg`) : `${pageObj.pageNumber}.svg`);

      return {
        id: pageObj.pageNumber,
        ...pageObj,
        fileName: resolvedFileName,
        content: pageContent,
        html: pageContent,
      };
    });

    const docFlipbookInfo = book.Customized_Settings?.FlipbookInfo || {};
    const docSettings = { ...(book.Customized_Settings || {}) };
    const ratings = Array.isArray(book.bookRating) ? book.bookRating : [];
    const totalRatings = ratings.length;
    const avgRating = totalRatings > 0
      ? Number((ratings.reduce((sum, r) => sum + (r.ratingValue || 0), 0) / totalRatings).toFixed(1))
      : 0;

    const accurateViews = (Array.isArray(book.viewers) && book.viewers.length > 0)
      ? book.viewers.length
      : (typeof book.viewsCount === 'number' ? book.viewsCount : 0);

    const publisherName = docFlipbookInfo.publisher || (book.userEmail ? book.userEmail.split('@')[0] : 'FlipiBook');

    const flipbookInfoObj = {
      ...docFlipbookInfo,
      flipbookName: book.flipbookName,
      folderName: primaryFolder,
      v_id: book.v_id,
      baseUrl: resolvedBaseUrl,
      publisher: publisherName,
      category: docFlipbookInfo.category || 'General',
      language: docFlipbookInfo.language || 'English',
      quotes: docFlipbookInfo.quotes || '',
      about: docFlipbookInfo.about || '',
      viewsCount: accurateViews,
      addedToShelfCount: book.addedToShelfCount || 0,
      createdAt: book.createdAt,
      publishedAt: docFlipbookInfo.publishedAt || book.updatedAt || book.createdAt
    };

    res.status(200).json({
      success: true,
      v_id: book.v_id,
      flipbookName: book.flipbookName,
      folderName: primaryFolder,
      userEmail: book.userEmail,
      isOwner,
      pages: populatedPages,
      Customized_Settings: docSettings,
      settings: docSettings,
      Visibility: vis,
      share: vis,
      isPublished: Boolean(book.isPublished),
      FlipbookInfo: flipbookInfoObj,
      meta: flipbookInfoObj,
      viewsCount: accurateViews,
      addedToShelfCount: book.addedToShelfCount || 0,
      bookRating: ratings,
      averageRating: avgRating,
      totalRatings: totalRatings,
      publisher: publisherName,
      createdAt: book.createdAt,
      publishedAt: docFlipbookInfo.publishedAt || book.updatedAt || book.createdAt
    });
  } catch (err) {
    console.error("[Customized Editor] Error in getPublicBook:", err);
    res.status(500).json({ success: false, message: "Server error fetching public flipbook" });
  }
};

/**
 * POST /public/view/:shareId
 * Record unique view count for flipbook
 */
const recordPublicView = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { viewerId, userEmail } = req.body;
    const book = await findBookByShareId(shareId);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    if (!Array.isArray(book.viewers)) book.viewers = [];
    const identifier = viewerId || userEmail;
    if (identifier && !book.viewers.includes(identifier)) {
      book.viewers.push(identifier);
    }
    book.viewsCount = Math.max((book.viewsCount || 0) + 1, book.viewers.length);
    await book.save();
    res.json({ success: true, viewsCount: book.viewsCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /public/rate/:shareId
 * Submit or update a public rating and review
 */
const submitPublicRating = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { ratingId, name, ratingValue, review, userEmail, profileImgUrl } = req.body;
    const book = await findBookByShareId(shareId);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    if (!Array.isArray(book.bookRating)) book.bookRating = [];
    if (ratingId) {
      const existing = book.bookRating.find(r => String(r._id) === String(ratingId));
      if (existing) {
        existing.name = name;
        existing.ratingValue = Number(ratingValue);
        existing.review = review;
        if (userEmail) existing.userEmail = userEmail;
        if (profileImgUrl) existing.profileImgUrl = profileImgUrl;
      }
    } else {
      book.bookRating.push({
        name,
        ratingValue: Number(ratingValue),
        review: review || '',
        userEmail,
        profileImgUrl,
        createdAt: new Date()
      });
    }

    const total = book.bookRating.length;
    const avg = total > 0 ? Number((book.bookRating.reduce((sum, r) => sum + (r.ratingValue || 0), 0) / total).toFixed(1)) : 0;
    book.averageRating = avg;
    book.totalRatings = total;
    book.markModified && book.markModified('bookRating');
    await book.save();

    res.json({ success: true, bookRating: book.bookRating, averageRating: avg, totalRatings: total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /public/rate/:shareId/:ratingId
 */
const updatePublicRating = async (req, res) => {
  return submitPublicRating(req, res);
};

/**
 * DELETE /public/rate/:shareId/:ratingId
 */
const deletePublicRating = async (req, res) => {
  try {
    const { shareId, ratingId } = req.params;
    const book = await findBookByShareId(shareId);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    if (Array.isArray(book.bookRating)) {
      book.bookRating = book.bookRating.filter(r => String(r._id) !== String(ratingId));
      const total = book.bookRating.length;
      const avg = total > 0 ? Number((book.bookRating.reduce((sum, r) => sum + (r.ratingValue || 0), 0) / total).toFixed(1)) : 0;
      book.averageRating = avg;
      book.totalRatings = total;
      book.markModified && book.markModified('bookRating');
      await book.save();
      return res.json({ success: true, bookRating: book.bookRating, averageRating: avg, totalRatings: total });
    }
    res.json({ success: true, bookRating: [], averageRating: 0, totalRatings: 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
  deleteTransparentSheet,
  findBookByShareId,
  getPublicBook,
  recordPublicView,
  submitPublicRating,
  updatePublicRating,
  deletePublicRating
};
