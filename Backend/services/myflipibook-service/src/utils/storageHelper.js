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
const deleteBookStorage = (userId, emailId, folderName, bookName, book = null) => {
  try {
    const storageRoot = getStorageRoot();
    const userFolders = [
      book?.userID,
      book?.userId ? String(book.userId) : null,
      userId ? String(userId) : null,
      emailId ? emailId.replace(/[@.]/g, '_') : null,
      book?.userEmail ? book.userEmail.replace(/[@.]/g, '_') : null
    ].filter(Boolean);

    const targetFolders = [
      folderName,
      'My_Flipbooks',
      ...(book && Array.isArray(book.folderName) ? book.folderName : (book?.folderName ? [book.folderName] : []))
    ].filter(Boolean);

    const bookNames = [
      bookName,
      book?.flipbookName,
      book ? `${book.flipbookName}_${book.v_id}` : null,
      book?.v_id
    ].filter(Boolean);

    const dirsToDelete = new Set();

    userFolders.forEach(uf => {
      targetFolders.forEach(tf => {
        bookNames.forEach(bn => {
          dirsToDelete.add(path.join(storageRoot, uf, 'My_Flipbooks', tf, bn));
          dirsToDelete.add(path.join(storageRoot, uf, tf, bn));
          dirsToDelete.add(path.join(storageRoot, 'flipbooks', uf, tf, bn));
        });
      });
      // Also inspect subdirectories in My_Flipbooks directly
      const userMyFlipbooks = path.join(storageRoot, uf, 'My_Flipbooks');
      if (fs.existsSync(userMyFlipbooks)) {
        try {
          const subdirs = fs.readdirSync(userMyFlipbooks);
          subdirs.forEach(sd => {
            bookNames.forEach(bn => {
              dirsToDelete.add(path.join(userMyFlipbooks, sd, bn));
            });
          });
        } catch (e) {}
      }
    });

    dirsToDelete.forEach(d => {
      if (fs.existsSync(d)) {
        console.log(`[Storage Helper] Deleting disk folder: ${d}`);
        fs.rmSync(d, { recursive: true, force: true });
      }
    });
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

/**
 * Initialize subfolders for a specific flipbook directory on disk:
 * - assets/audio
 * - assets/download
 * - assets/gif
 * - assets/Image
 * - assets/video
 * - customized_assets
 * - pages
 */
const initFlipbookStorage = (bookDir) => {
  try {
    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }

    const assetsDir = path.join(bookDir, 'assets');
    const assetSubdirs = ['audio', 'download', 'gif', 'Image', 'video', '3D_Model'];
    assetSubdirs.forEach((sub) => {
      const p = path.join(assetsDir, sub);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });

    const customAssetsDir = path.join(bookDir, 'customized_assets');
    if (!fs.existsSync(customAssetsDir)) {
      fs.mkdirSync(customAssetsDir, { recursive: true });
    }

    const pagesDir = path.join(bookDir, 'pages');
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }

    return { bookDir, assetsDir, customAssetsDir, pagesDir };
  } catch (err) {
    console.error('[Storage Helper] Error initializing flipbook storage:', err.message);
    return null;
  }
};

const WORKSPACE_FOLDERS = [
  '3D_Models',
  '3D_Screenshot',
  'Company_logo',
  'gifs',
  'Images',
  'My_Flipbooks',
  'Profile',
  'Texture',
  'Videos'
];

const ensureDirPerms = (p) => {
  if (!fs.existsSync(p)) {
    try { fs.mkdirSync(p, { recursive: true, mode: 0o777 }); } catch (e) {}
  }
  try { fs.chmodSync(p, 0o777); } catch (e) {}
};

/**
 * Ensure user's physical workspace folders exist on disk for both customUserId and email
 */
const ensureUserWorkspace = (userId, emailId, folderName = null) => {
  try {
    const storageRoot = getStorageRoot();
    ensureDirPerms(storageRoot);

    const dirName = userId ? String(userId) : (emailId ? emailId.trim().toLowerCase().replace(/[@.]/g, '_') : null);
    if (!dirName) return null;

    const userDir = path.join(storageRoot, dirName);
    ensureDirPerms(userDir);

    for (const wf of WORKSPACE_FOLDERS) {
      const fp = path.join(userDir, wf);
      ensureDirPerms(fp);
    }

    const defaultFolder = path.join(userDir, 'My_Flipbooks', 'My_Flipbooks');
    ensureDirPerms(defaultFolder);

    if (folderName) {
      const customF = path.join(userDir, 'My_Flipbooks', folderName);
      ensureDirPerms(customF);
    }

    return userDir;
  } catch (err) {
    console.error('[Storage Helper] Error ensuring user workspace:', err.message);
    return null;
  }
};


module.exports = {
  getStorageRoot,
  getDirSize,
  calculateUserStorage,
  deleteBookStorage,
  deleteFolderStorage,
  initFlipbookStorage,
  ensureUserWorkspace,
  WORKSPACE_FOLDERS
};
