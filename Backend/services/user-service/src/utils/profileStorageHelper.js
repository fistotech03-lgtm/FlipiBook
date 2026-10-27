// Backend/services/user-service/src/utils/profileStorageHelper.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const getStorageRoot = () => {
  return process.env.STORAGE_PATH
    ? path.resolve(process.env.STORAGE_PATH)
    : path.resolve(__dirname, '../../../../storage');
};

const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return 'anonymous_user';
  return email.trim().toLowerCase().replace(/[@.]/g, '_');
};

/**
 * Resolve user directory (e.g. 'FLIPI0001' or 'user_domain_com')
 */
const resolveUserFolder = async (emailId) => {
  const sanitized = sanitizeEmail(emailId);
  let resolvedId = null;

  if (emailId) {
    try {
      const User = mongoose.models.User || require('../models/User');
      const user = await User.findOne({
        emailId: new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      }).select('userID');
      if (user && user.userID) {
        resolvedId = user.userID;
      }
    } catch (e) {}
  }

  const storageRoot = getStorageRoot();
  if (!resolvedId) {
    try {
      if (fs.existsSync(storageRoot)) {
        const topDirs = fs.readdirSync(storageRoot);
        const flipiDir = topDirs.find(d => /^FLIPI\d+/i.test(d));
        if (flipiDir) {
          resolvedId = flipiDir;
        }
      }
    } catch (e) {}
  }

  const userFolder = resolvedId || sanitized;

  // Ensure target Profile and Company_logo directories exist
  try {
    const profileDir = path.join(storageRoot, userFolder, 'Profile');
    const logoDir = path.join(storageRoot, userFolder, 'Company_logo');
    if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });
    if (!fs.existsSync(logoDir)) fs.mkdirSync(logoDir, { recursive: true });
  } catch (e) {
    console.warn('[profileStorageHelper] Failed to create directories:', e.message);
  }

  return userFolder;
};

/**
 * Safely delete previous profile asset from storage if local
 */
const deleteOldAsset = async (assetUrlOrCss) => {
  try {
    if (!assetUrlOrCss || typeof assetUrlOrCss !== 'string') return;
    const cleanUrl = assetUrlOrCss.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '').trim();
    if (!cleanUrl || cleanUrl.startsWith('data:') || cleanUrl === 'color_only') return;

    const storageRoot = getStorageRoot();
    const relMatch = cleanUrl.match(/(?:storage|uploads)\/(.+)$/i);
    if (relMatch) {
      const filePath = path.join(storageRoot, relMatch[1]);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.warn('[profileStorageHelper] Error deleting old asset:', err.message);
  }
};

/**
 * Save an uploaded Multer file or Base64 string into user's storage folder
 */
const saveProfileAsset = async (userFolder, fileOrBase64, prefix = 'avatar', subfolder = 'Profile') => {
  try {
    if (!fileOrBase64 || !userFolder) return null;
    const storageRoot = getStorageRoot();
    const targetDir = path.join(storageRoot, userFolder, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 1. Handle Multer file object
    if (fileOrBase64.buffer && Buffer.isBuffer(fileOrBase64.buffer)) {
      const ext = (path.extname(fileOrBase64.originalname || '').replace('.', '') || 'png').toLowerCase();
      const fileName = `${prefix}_${Date.now()}.${ext}`;
      const fullPath = path.join(targetDir, fileName);
      fs.writeFileSync(fullPath, fileOrBase64.buffer);
      return `/storage/${userFolder}/${subfolder}/${fileName}`;
    }

    // 2. Handle Base64 string
    if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
      const match = fileOrBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const contentType = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        let ext = 'png';
        if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
        else if (contentType.includes('webp')) ext = 'webp';
        else if (contentType.includes('svg')) ext = 'svg';
        else if (contentType.includes('gif')) ext = 'gif';

        const fileName = `${prefix}_${Date.now()}.${ext}`;
        const fullPath = path.join(targetDir, fileName);
        fs.writeFileSync(fullPath, buffer);
        return `/storage/${userFolder}/${subfolder}/${fileName}`;
      }
    }

    // 3. Already a URL or preset string
    return fileOrBase64;
  } catch (err) {
    console.error(`[profileStorageHelper] Error saving ${prefix} asset:`, err);
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : null;
  }
};

module.exports = {
  getStorageRoot,
  sanitizeEmail,
  resolveUserFolder,
  deleteOldAsset,
  saveProfileAsset
};
