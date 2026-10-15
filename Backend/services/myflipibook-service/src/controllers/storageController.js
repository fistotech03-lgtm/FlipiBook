const mongoose = require('mongoose');
const UserSettings = require('../models/UserSettings');
const Flipbook = require('../models/Flipbook');
const { calculateUserStorage } = require('../utils/storageHelper');
const { getAuthUser, getUserQuery, getFlipbookUserQuery } = require('../utils/userHelper');

/**
 * GET /api/usersetting/get-settings
 * Retrieve user editor preferences and exact disk quota calculations
 */
exports.getStorageSettings = async (req, res) => {
  try {
    const { objectId, customUserId, rawId, emailId } = getAuthUser(req);
    const userQuery = getUserQuery(req);
    const flipQuery = getFlipbookUserQuery(req);

    if (!userQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let settings = await UserSettings.findOne(userQuery);
    if (!settings) {
      settings = await UserSettings.create({
        ...(objectId ? { userId: objectId } : {}),
        ...(customUserId ? { userID: customUserId } : {}),
        emailId,
        editorSettings: {
          isAutoSaveEnabled: true,
          isTrimViewEnabled: false,
          isRulerEnabled: true
        },
        maxStorage: 300 * 1024 * 1024
      }).catch(() => null);
    }

    // Fetch user books to calculate storage accurately
    const userBooks = flipQuery ? await Flipbook.find({ ...flipQuery, trash: false }) : [];
    const usedStorage = calculateUserStorage(rawId || customUserId, emailId, userBooks);

    res.status(200).json({
      success: true,
      _id: settings?._id,
      userId: settings?.userId || objectId || customUserId,
      emailId: settings?.emailId || emailId,
      editorSettings: settings?.editorSettings || {
        isAutoSaveEnabled: true,
        isTrimViewEnabled: false,
        isRulerEnabled: true
      },
      usedStorage,
      maxStorage: settings?.maxStorage || 300 * 1024 * 1024
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
    const { objectId, customUserId, emailId } = getAuthUser(req);
    const userQuery = getUserQuery(req);
    const { isAutoSaveEnabled } = req.body;

    if (!userQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const updateDoc = {
      $set: { 'editorSettings.isAutoSaveEnabled': Boolean(isAutoSaveEnabled) }
    };
    const insertFields = {};
    if (objectId) insertFields.userId = objectId;
    if (customUserId) insertFields.userID = customUserId;
    if (emailId) insertFields.emailId = emailId;
    if (Object.keys(insertFields).length > 0) {
      updateDoc.$setOnInsert = insertFields;
    }

    const settings = await UserSettings.findOneAndUpdate(
      userQuery,
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
    const { objectId, customUserId, emailId } = getAuthUser(req);
    const userQuery = getUserQuery(req);
    const { editorSettings } = req.body;

    if (!userQuery) {
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
    if (objectId) insertFields.userId = objectId;
    if (customUserId) insertFields.userID = customUserId;
    if (emailId) insertFields.emailId = emailId;
    if (Object.keys(insertFields).length > 0) {
      updateDoc.$setOnInsert = insertFields;
    }

    const settings = await UserSettings.findOneAndUpdate(
      userQuery,
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
