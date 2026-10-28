const mongoose = require('mongoose');
const PageEditorSettings = require('../models/pageEditorSettings');
const User = require('../models/user');
const Flipbook = require('../models/flipbook');
const { calculateUserStorage } = require('../utils/storageHelper');
const { getAuthUser, resolveAuthUser, getFlipbookUserQuery } = require('../utils/userHelper');

/**
 * Resolves user credentials and builds query specifically for pageEditorSettings
 */
const resolveSettingsUser = async (req) => {
  const { objectId, customUserId, rawId, emailId } = await resolveAuthUser(req);

  const conds = [];
  if (objectId) conds.push({ userObjectID: objectId });
  if (customUserId) conds.push({ userID: customUserId });

  const settingsQuery =
    conds.length === 1 ? conds[0] : conds.length > 1 ? { $or: conds } : null;

  return { objectId, customUserId, rawId, emailId, settingsQuery };
};

/**
 * GET /api/usersetting/get-settings
 * Retrieve user editor preferences and exact disk quota calculations
 */
exports.getStorageSettings = async (req, res) => {
  try {
    const { objectId, customUserId, rawId, emailId, settingsQuery } =
      await resolveSettingsUser(req);
    const flipQuery = getFlipbookUserQuery(req);

    if (!settingsQuery && !emailId && !objectId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let settings = settingsQuery ? await PageEditorSettings.findOne(settingsQuery) : null;
    if (!settings && settingsQuery) {
      settings = await PageEditorSettings.create({
        ...(objectId ? { userObjectID: objectId } : {}),
        ...(customUserId ? { userID: customUserId } : {}),
        editorSettings: {
          isAutoSaveEnabled: false,
          isTrimViewEnabled: false,
          isRulerEnabled: true
        }
      }).catch(() => null);
    }

    // Fetch user books to calculate storage accurately
    const userBooks = flipQuery ? await Flipbook.find({ ...flipQuery, trash: false }) : [];
    const usedStorage = calculateUserStorage(rawId || customUserId, emailId, userBooks);

    res.status(200).json({
      success: true,
      _id: settings?._id,
      userObjectID: settings?.userObjectID || objectId || null,
      editorSettings: settings?.editorSettings || {
        isAutoSaveEnabled: false,
        isTrimViewEnabled: false,
        isRulerEnabled: true
      },
      isAutoSaveEnabled: settings?.editorSettings?.isAutoSaveEnabled ?? false,
      usedStorage,
      maxStorage: 300 * 1024 * 1024
    });
  } catch (err) {
    console.error('[Storage Controller] Error fetching settings:', err);
    res.status(500).json({ success: false, message: 'Server error fetching storage settings' });
  }
};

/**
 * POST /api/usersetting/update-autosave
 * Update auto-save preference
 */
exports.updateAutoSave = async (req, res) => {
  try {
    const { objectId, customUserId, settingsQuery } = await resolveSettingsUser(req);
    const { isAutoSaveEnabled } = req.body;

    if (!settingsQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const updateDoc = {
      $set: { 'editorSettings.isAutoSaveEnabled': Boolean(isAutoSaveEnabled) }
    };
    const insertFields = {
      'editorSettings.isTrimViewEnabled': false,
      'editorSettings.isRulerEnabled': true
    };
    if (objectId) insertFields.userObjectID = objectId;
    if (customUserId) insertFields.userID = customUserId;
    if (Object.keys(insertFields).length > 0) {
      updateDoc.$setOnInsert = insertFields;
    }

    const settings = await PageEditorSettings.findOneAndUpdate(
      settingsQuery,
      updateDoc,
      { returnDocument: 'after', upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Auto-save setting updated',
      isAutoSaveEnabled: settings.editorSettings?.isAutoSaveEnabled,
      editorSettings: settings.editorSettings
    });
  } catch (err) {
    console.error('[Storage Controller] Error updating autosave:', err);
    res.status(500).json({ success: false, message: 'Server error updating auto-save' });
  }
};

/**
 * POST /api/usersetting/update-editor-settings
 * Update all editor preferences
 */
exports.updateEditorSettings = async (req, res) => {
  try {
    const { objectId, customUserId, settingsQuery } = await resolveSettingsUser(req);
    const { editorSettings } = req.body;

    if (!settingsQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const updateFields = {};
    if (editorSettings) {
      if (editorSettings.isAutoSaveEnabled !== undefined) {
        updateFields['editorSettings.isAutoSaveEnabled'] = Boolean(editorSettings.isAutoSaveEnabled);
      }
      if (editorSettings.isTrimViewEnabled !== undefined) {
        updateFields['editorSettings.isTrimViewEnabled'] = Boolean(editorSettings.isTrimViewEnabled);
      }
      if (editorSettings.isRulerEnabled !== undefined) {
        updateFields['editorSettings.isRulerEnabled'] = Boolean(editorSettings.isRulerEnabled);
      }
    }

    const updateDoc = { $set: updateFields };
    const insertFields = {};
    if (objectId) insertFields.userObjectID = objectId;
    if (customUserId) insertFields.userID = customUserId;
    if (Object.keys(insertFields).length > 0) {
      updateDoc.$setOnInsert = insertFields;
    }

    const settings = await PageEditorSettings.findOneAndUpdate(
      settingsQuery,
      updateDoc,
      { returnDocument: 'after', upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Editor settings updated',
      editorSettings: settings.editorSettings
    });
  } catch (err) {
    console.error('[Storage Controller] Error updating editor settings:', err);
    res.status(500).json({ success: false, message: 'Server error updating editor settings' });
  }
};
