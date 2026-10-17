const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Flipbook = require('../models/Flipbook');

/**
 * Generate unique ID (nanoid replacement)
 */
const generateId = (length = 21) => {
  return crypto.randomBytes(Math.ceil(length * 0.75))
    .toString('base64url')
    .slice(0, length);
};

/**
 * Resolve root storage path
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
 * Resolve uploads directory for static files/assets
 */
const getUploadsRoot = () => {
  const root = getStorageRoot();
  return root;
};

/**
 * Sanitize email for folder path
 */
const sanitizeEmail = (email) => {
  if (!email) return 'default_user';
  return email.toString().trim().toLowerCase().replace(/[@.]/g, '_');
};

/**
 * Sanitize folder and book names to prevent directory traversal
 */
const sanitizeName = (name, fallback = 'Untitled') => {
  if (!name) return fallback;
  const clean = name.toString().replace(/[^a-zA-Z0-9 _-]/g, '').trim();
  return clean || fallback;
};

const VIRTUAL_FOLDERS = new Set(['recent book', 'recent', 'all books', 'all flipbooks', 'favorites', 'trash']);

/**
 * Resolve real physical folder from flipbook document or input
 */
const resolveFolder = (folderName) => {
  if (Array.isArray(folderName)) {
    const flat = folderName.flat(Infinity);
    const realFolders = flat.filter(
      (f) => f && typeof f === 'string' && !VIRTUAL_FOLDERS.has(String(f).trim().toLowerCase())
    );
    return realFolders.length > 0 ? String(realFolders[0]).trim() : 'My_Flipbooks';
  }
  if (typeof folderName === 'string' && folderName.trim()) {
    const clean = folderName.trim();
    if (VIRTUAL_FOLDERS.has(clean.toLowerCase())) return 'My_Flipbooks';
    return clean;
  }
  return 'My_Flipbooks';
};

/**
 * Resolves flipbook paths and database document
 */
const resolveFlipbookPaths = async ({ v_id, emailId, folderName, flipbookName }) => {
  let doc = null;

  if (v_id) {
    doc = await Flipbook.findOne({ v_id });
  }

  const effectiveEmail = (emailId || (doc ? doc.userEmail : '')) || 'default_user';
  const effectiveBook = sanitizeName(
    flipbookName || (doc ? doc.flipbookName : 'Untitled_Document'),
    'Untitled_Document'
  );
  const effectiveFolder = resolveFolder(folderName || (doc ? doc.folderName : 'My_Flipbooks'));

  const sanitizedEmail = sanitizeEmail(effectiveEmail);
  const storageRoot = getStorageRoot();
  const userFolders = [
    doc?.userID,
    doc?.userId ? String(doc.userId) : null,
    sanitizedEmail
  ].filter(Boolean);

  let bookDir = path.join(
    storageRoot,
    userFolders[0] || sanitizedEmail,
    'My_Flipbooks',
    effectiveFolder,
    effectiveBook
  );

  const bookVId = doc ? doc.v_id : v_id;
  const dirVariants = [
    effectiveBook,
    bookVId ? `${effectiveBook}_${bookVId}` : null,
    bookVId
  ].filter(Boolean);

  let found = false;
  // Search if bookDir already exists under another userFolder or folder alias
  for (const uf of userFolders) {
    if (found) break;
    for (const variant of dirVariants) {
      const candidates = [
        path.join(storageRoot, uf, 'My_Flipbooks', effectiveFolder, variant),
        path.join(storageRoot, uf, 'My_Flipbooks', 'My_Flipbooks', variant),
        path.join(storageRoot, uf, effectiveFolder, variant),
        path.join(storageRoot, uf, variant)
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          bookDir = cand;
          found = true;
          break;
        }
      }
      if (found) break;

      // Also scan subdirectories inside My_Flipbooks
      const myFlipbooksDir = path.join(storageRoot, uf, 'My_Flipbooks');
      if (fs.existsSync(myFlipbooksDir)) {
        try {
          const subdirs = fs.readdirSync(myFlipbooksDir);
          for (const sd of subdirs) {
            const nestedCand = path.join(myFlipbooksDir, sd, variant);
            if (fs.existsSync(nestedCand)) {
              bookDir = nestedCand;
              found = true;
              break;
            }
          }
        } catch (e) {}
      }
      if (found) break;
    }
  }

  return {
    doc,
    userEmail: effectiveEmail,
    sanitizedEmail,
    folderName: effectiveFolder,
    flipbookName: effectiveBook,
    bookDir,
    storageRoot
  };
};

/**
 * Initialize subfolders for a specific flipbook directory on disk:
 * - assets/audio
 * - assets/download
 * - assets/gif
 * - assets/Image
 * - assets/video
 * - pages
 */
const initFlipbookStorage = (bookDir) => {
  try {
    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }

    const assetsDir = path.join(bookDir, 'assets');
    const assetSubdirs = ['audio', 'download', 'gif', 'Image', 'video'];
    assetSubdirs.forEach((sub) => {
      const p = path.join(assetsDir, sub);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });

    const pagesDir = path.join(bookDir, 'pages');
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }

    return { bookDir, assetsDir, pagesDir };
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
  generateId,
  getStorageRoot,
  getUploadsRoot,
  sanitizeEmail,
  sanitizeName,
  resolveFolder,
  resolveFlipbookPaths,
  initFlipbookStorage,
  ensureUserWorkspace
};
