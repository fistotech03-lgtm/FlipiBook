const fs = require('fs');
const path = require('path');

/**
 * Resolve root storage path:
 * 1. process.env.STORAGE_PATH (e.g. /app/storage in Docker)
 * 2. Fallback to local Backend/storage directory
 */
const getStorageRoot = () => {
  if (process.env.STORAGE_PATH) {
    return path.resolve(process.env.STORAGE_PATH);
  }
  const localDefault = path.resolve(__dirname, '../../../../storage');
  if (!fs.existsSync(localDefault)) {
    try {
      fs.mkdirSync(localDefault, { recursive: true });
    } catch (e) {}
  }
  return localDefault;
};

/**
 * Recursively calculate directory size in bytes
 */
const getDirSize = (dirPath) => {
  let size = 0;
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += getDirSize(fullPath);
      } else {
        const stats = fs.statSync(fullPath);
        size += stats.size;
      }
    }
  } catch (err) {
    return 0;
  }
  return size;
};

/**
 * Calculate user's active disk storage usage in bytes by ObjectId (with email fallback)
 */
const calculateUserStorage = (userId, emailId, userBooks = []) => {
  try {
    const storageRoot = getStorageRoot();
    let diskSize = 0;

    // 1. Primary: Check by userId ObjectId directory
    if (userId) {
      const userDirById = path.join(storageRoot, 'flipbooks', String(userId));
      if (fs.existsSync(userDirById)) {
        diskSize = getDirSize(userDirById);
      }
    }

    // 2. Legacy fallback: Check by sanitized email directory
    if (diskSize === 0 && emailId) {
      const sanitizedEmail = emailId.replace(/[@.]/g, '_');
      const userDirByEmail = path.join(storageRoot, 'flipbooks', sanitizedEmail);
      if (fs.existsSync(userDirByEmail)) {
        diskSize = getDirSize(userDirByEmail);
      }
    }

    if (diskSize > 0) {
      return diskSize;
    }

    // 3. Fallback: calculate sum from database pages / fileSize
    let dbSize = 0;
    for (const book of userBooks) {
      if (Array.isArray(book.pages) && book.pages.length > 0) {
        const pagesSum = book.pages.reduce((acc, p) => acc + (p.size || 0), 0);
        dbSize += (pagesSum || book.fileSize || 0);
      } else {
        dbSize += (book.fileSize || 0);
      }
    }
    return dbSize;
  } catch (err) {
    console.error('[Storage Helper] Error calculating storage:', err);
    return 0;
  }
};

/**
 * Delete a user's book directory from disk
 */
const deleteBookStorage = (userId, emailId, folderName, bookName) => {
  try {
    const storageRoot = getStorageRoot();
    if (userId) {
      const dirById = path.join(storageRoot, 'flipbooks', String(userId), folderName, bookName);
      if (fs.existsSync(dirById)) {
        fs.rmSync(dirById, { recursive: true, force: true });
      }
    }
    if (emailId) {
      const sanitizedEmail = emailId.replace(/[@.]/g, '_');
      const dirByEmail = path.join(storageRoot, 'flipbooks', sanitizedEmail, folderName, bookName);
      if (fs.existsSync(dirByEmail)) {
        fs.rmSync(dirByEmail, { recursive: true, force: true });
      }
    }
  } catch (err) {
    console.warn('[Storage Helper] Warning deleting book directory:', err.message);
  }
};

/**
 * Delete a user's folder directory from disk
 */
const deleteFolderStorage = (userId, emailId, folderName) => {
  try {
    const storageRoot = getStorageRoot();
    if (userId) {
      const dirById = path.join(storageRoot, 'flipbooks', String(userId), folderName);
      if (fs.existsSync(dirById)) {
        fs.rmSync(dirById, { recursive: true, force: true });
      }
    }
    if (emailId) {
      const sanitizedEmail = emailId.replace(/[@.]/g, '_');
      const dirByEmail = path.join(storageRoot, 'flipbooks', sanitizedEmail, folderName);
      if (fs.existsSync(dirByEmail)) {
        fs.rmSync(dirByEmail, { recursive: true, force: true });
      }
    }
  } catch (err) {
    console.warn('[Storage Helper] Warning deleting folder directory:', err.message);
  }
};

module.exports = {
  getStorageRoot,
  getDirSize,
  calculateUserStorage,
  deleteBookStorage,
  deleteFolderStorage
};
