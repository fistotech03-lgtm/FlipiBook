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
 * Recursively calculate directory size in bytes, safely ignoring hidden system files
 */
const getDirSize = (dirPath) => {
  let size = 0;
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.DS_Store' || entry.name === 'Thumbs.db' || entry.name.startsWith('._')) continue;
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
 * Safely parse size to integer bytes (supports numbers or strings like "36.8 MB", "500 KB", "1024")
 */
const parseSizeToBytes = (val) => {
  if (typeof val === 'number' && !isNaN(val)) return Math.max(0, Math.round(val));
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const match = trimmed.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/i);
    if (match) {
      const num = parseFloat(match[1]);
      if (isNaN(num)) return 0;
      const unit = (match[2] || 'B').toUpperCase();
      const mult = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024, TB: 1024 * 1024 * 1024 * 1024 };
      return Math.round(num * (mult[unit] || 1));
    }
  }
  return 0;
};

/**
 * Scan all media items in a gallery document to calculate total bytes
 */
const calculateGallerySize = (galleryDoc) => {
  if (!galleryDoc) return 0;
  let total = 0;

  const processItem = (item) => {
    if (!item) return;
    const size = parseSizeToBytes(item.size || item.fileSize || item.file_size || 0);
    total += size;
  };

  const scan = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (item && typeof item === 'object') {
          if (item.size !== undefined || item.fileSize !== undefined || item.url || item.filePath || item.originalName) {
            processItem(item);
          } else {
            scan(item);
          }
        }
      }
    } else {
      for (const key of Object.keys(obj)) {
        if (['_id', 'userObjectID', 'userID', '__v', 'createdAt', 'updatedAt'].includes(key)) continue;
        scan(obj[key]);
      }
    }
  };

  scan(galleryDoc.toObject ? galleryDoc.toObject() : galleryDoc);
  return total;
};

/**
 * Scan all flipbook asset items to calculate total bytes
 */
const calculateFlipbookAssetsSize = (assetDocs = []) => {
  if (!Array.isArray(assetDocs)) return 0;
  let total = 0;
  for (const doc of assetDocs) {
    if (!doc || !doc.assets) continue;
    const assets = doc.assets;
    ['images', 'video', 'gif', 'audio', 'threed'].forEach(type => {
      if (Array.isArray(assets[type])) {
        for (const item of assets[type]) {
          total += parseSizeToBytes(item.size || item.fileSize || 0);
        }
      }
    });
  }
  return total;
};

/**
 * Calculate user's active disk and database storage usage in bytes:
 * - Flipbook main files and SVG pages
 * - Flipbook attached media resources (flipbookAssets)
 * - User Gallery media assets (images, videos, gifs, audio, 3D models)
 * - Physical workspace files on disk
 */
const calculateUserStorage = async (userId, emailId, userBooks = [], userObjectId = null) => {
  try {
    const storageRoot = getStorageRoot();
    let diskSize = 0;

    // 1. Measure physical files on disk for this user (excluding hidden files)
    const userDirs = new Set([
      userId ? path.join(storageRoot, String(userId)) : null,
      userId ? path.join(storageRoot, 'flipbooks', String(userId)) : null,
      emailId ? path.join(storageRoot, emailId.replace(/[@.]/g, '_')) : null,
      emailId ? path.join(storageRoot, 'flipbooks', emailId.replace(/[@.]/g, '_')) : null,
      userObjectId ? path.join(storageRoot, String(userObjectId)) : null
    ]);

    for (const dir of userDirs) {
      if (dir && fs.existsSync(dir)) {
        diskSize += getDirSize(dir);
      }
    }

    // 2. Calculate Total Flipbooks & Pages Size from DB
    let booksSize = 0;
    if (Array.isArray(userBooks)) {
      for (const book of userBooks) {
        const pagesSum = Array.isArray(book.pages)
          ? book.pages.reduce((acc, p) => acc + parseSizeToBytes(p?.size), 0)
          : 0;
        const mainFileSize = parseSizeToBytes(book.fileSize || book.size || book.sizeBytes);
        booksSize += Math.max(mainFileSize, pagesSum);
      }
    }

    // 3. Calculate Flipbook Resources (flipbookAssets)
    let flipbookAssetsSize = 0;
    try {
      const FlipbookAsset = require('../../../../shared/models/FlipbookAsset');
      const assetConds = [];
      if (userObjectId) assetConds.push({ userObjectID: userObjectId });
      if (userId) assetConds.push({ userID: String(userId) });
      if (assetConds.length > 0) {
        const assets = await FlipbookAsset.find({ $or: assetConds }).lean();
        flipbookAssetsSize = calculateFlipbookAssetsSize(assets);
      }
    } catch (e) {
      console.warn('[Storage Helper] Warning querying flipbookAssets:', e.message);
    }

    // 4. Calculate User Gallery Usages (userGallery)
    let gallerySize = 0;
    try {
      const UserGallery = require('../../../../shared/models/UserGallery');
      const galleryConds = [];
      if (userObjectId) galleryConds.push({ userObjectID: userObjectId });
      if (userId) galleryConds.push({ userID: String(userId) });
      if (galleryConds.length > 0) {
        const galleries = await UserGallery.find({ $or: galleryConds }).lean();
        for (const g of galleries) {
          gallerySize += calculateGallerySize(g);
        }
      }
    } catch (e) {
      console.warn('[Storage Helper] Warning querying userGallery:', e.message);
    }

    // Total database-tracked usage
    const dbTotal = booksSize + flipbookAssetsSize + gallerySize;

    // Reconciliation: If disk has physical files, take the greater of disk vs DB to ensure nothing is missed
    const finalUsed = Math.max(diskSize, dbTotal);

    return finalUsed;
  } catch (err) {
    console.error('[Storage Helper] Error calculating storage:', err);
    return 0;
  }
};

/**
 * Delete a user's book directory from disk
 */
const deleteBookStorage = (userId, emailId, folderName, bookName, book = null) => {
  // Execute non-blocking in background so API caller never waits on disk I/O
  setImmediate(async () => {
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
        'default',
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
            dirsToDelete.add(path.join(storageRoot, uf, 'books', tf, bn));
            dirsToDelete.add(path.join(storageRoot, uf, tf, bn));
            dirsToDelete.add(path.join(storageRoot, 'flipbooks', uf, tf, bn));
          });
        });
        // Also inspect subdirectories in books directly
        const userSubDir = path.join(storageRoot, uf, 'books');
        if (fs.existsSync(userSubDir)) {
          try {
            const subdirs = fs.readdirSync(userSubDir);
            subdirs.forEach(sd => {
              bookNames.forEach(bn => {
                dirsToDelete.add(path.join(userSubDir, sd, bn));
              });
            });
          } catch (e) {}
        }
      });

      for (const d of dirsToDelete) {
        if (fs.existsSync(d)) {
          console.log(`[Storage Helper] Deleting disk folder: ${d}`);
          await fs.promises.rm(d, { recursive: true, force: true }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[Storage Helper] Warning deleting book directory:', err.message);
    }
  });
};

/**
 * Delete a user's folder directory from disk
 */
const deleteFolderStorage = (userId, emailId, folderName) => {
  // Execute non-blocking in background so API caller never waits on disk I/O
  setImmediate(async () => {
    try {
      const storageRoot = getStorageRoot();
      const dirs = [];
      if (userId) {
        dirs.push(
          path.join(storageRoot, String(userId), 'books', folderName),
          path.join(storageRoot, String(userId), folderName),
          path.join(storageRoot, 'flipbooks', String(userId), folderName)
        );
      }
      if (emailId) {
        const sanitizedEmail = emailId.replace(/[@.]/g, '_');
        dirs.push(
          path.join(storageRoot, sanitizedEmail, 'books', folderName),
          path.join(storageRoot, sanitizedEmail, folderName),
          path.join(storageRoot, 'flipbooks', sanitizedEmail, folderName)
        );
      }
      for (const d of dirs) {
        if (fs.existsSync(d)) {
          await fs.promises.rm(d, { recursive: true, force: true }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[Storage Helper] Warning deleting folder directory:', err.message);
    }
  });
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
  'gallery',
  'gallery/pageEditorgallery',
  'gallery/pageEditorgallery/images',
  'gallery/pageEditorgallery/videos',
  'gallery/pageEditorgallery/gifs',
  'gallery/customizationGallery',
  'gallery/customizationGallery/images',
  'gallery/customizationGallery/videos',
  'gallery/3dGallery',
  'gallery/3dGallery/models',
  'gallery/3dGallery/texture',
  'gallery/3dGallery/snapshot',
  'books',
  'books/default',
  'userdetails',
  'userdetails/profile',
  'userdetails/company_logo'
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

    const defaultBooks = path.join(userDir, 'books', 'default');
    ensureDirPerms(defaultBooks);

    if (folderName) {
      const customF = path.join(userDir, 'books', folderName);
      ensureDirPerms(customF);
    }

    // Clean up any legacy books/fol_* directories and merge books into books/default
    const booksDir = path.join(userDir, 'books');
    if (fs.existsSync(booksDir)) {
      try {
        const subdirs = fs.readdirSync(booksDir);
        for (const sd of subdirs) {
          if (sd.startsWith('fol_')) {
            const strayFolPath = path.join(booksDir, sd);
            if (fs.statSync(strayFolPath).isDirectory()) {
              const bookItems = fs.readdirSync(strayFolPath);
              for (const b of bookItems) {
                if (b === '.DS_Store') continue;
                const srcBook = path.join(strayFolPath, b);
                const destBook = path.join(defaultBooks, b);
                if (!fs.existsSync(destBook)) {
                  fs.renameSync(srcBook, destBook);
                }
              }
              try {
                fs.rmSync(strayFolPath, { recursive: true, force: true });
              } catch (_) {}
            }
          }
        }
      } catch (_) {}
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
  parseSizeToBytes,
  calculateGallerySize,
  calculateFlipbookAssetsSize,
  calculateUserStorage,
  deleteBookStorage,
  deleteFolderStorage,
  initFlipbookStorage,
  ensureUserWorkspace
};
