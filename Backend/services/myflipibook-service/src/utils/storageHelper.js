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
 * Calculate user's active disk storage usage in bytes by ObjectId or custom UserID
 */
const calculateUserStorage = (userId, emailId, userBooks = []) => {
  try {
    const storageRoot = getStorageRoot();
    let diskSize = 0;

    // 1. Primary: Check by userId workspace directory (e.g. storage/<userId>/My_Flipbooks)
    if (userId) {
      const userDirById = path.join(storageRoot, String(userId));
      if (fs.existsSync(userDirById)) {
        diskSize = getDirSize(userDirById);
      }
      const legacyDirById = path.join(storageRoot, 'flipbooks', String(userId));
      if (diskSize === 0 && fs.existsSync(legacyDirById)) {
        diskSize = getDirSize(legacyDirById);
      }
    }

    // 2. Fallback: Check by sanitized email directory
    if (diskSize === 0 && emailId) {
      const sanitizedEmail = emailId.replace(/[@.]/g, '_');
      const userDirByEmail = path.join(storageRoot, sanitizedEmail);
      if (fs.existsSync(userDirByEmail)) {
        diskSize = getDirSize(userDirByEmail);
      }
      const legacyDirByEmail = path.join(storageRoot, 'flipbooks', sanitizedEmail);
      if (diskSize === 0 && fs.existsSync(legacyDirByEmail)) {
        diskSize = getDirSize(legacyDirByEmail);
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
      const dirs = [
        path.join(storageRoot, String(userId), 'My_Flipbooks', folderName, bookName),
        path.join(storageRoot, String(userId), folderName, bookName),
        path.join(storageRoot, 'flipbooks', String(userId), folderName, bookName)
      ];
      dirs.forEach(d => {
        if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
      });
    }
    if (emailId) {
      const sanitizedEmail = emailId.replace(/[@.]/g, '_');
      const dirs = [
        path.join(storageRoot, sanitizedEmail, 'My_Flipbooks', folderName, bookName),
        path.join(storageRoot, sanitizedEmail, folderName, bookName),
        path.join(storageRoot, 'flipbooks', sanitizedEmail, folderName, bookName)
      ];
      dirs.forEach(d => {
        if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
      });
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
      const dirs = [
        path.join(storageRoot, String(userId), 'My_Flipbooks', folderName),
        path.join(storageRoot, String(userId), folderName),
        path.join(storageRoot, 'flipbooks', String(userId), folderName)
      ];
      dirs.forEach(d => {
        if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
      });
    }
    if (emailId) {
      const sanitizedEmail = emailId.replace(/[@.]/g, '_');
      const dirs = [
        path.join(storageRoot, sanitizedEmail, 'My_Flipbooks', folderName),
        path.join(storageRoot, sanitizedEmail, folderName),
        path.join(storageRoot, 'flipbooks', sanitizedEmail, folderName)
      ];
      dirs.forEach(d => {
        if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
      });
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
