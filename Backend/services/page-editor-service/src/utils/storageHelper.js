const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Flipbook = require('../../../../shared/models/Flipbook');

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
    return realFolders.length > 0 ? resolveFolder(realFolders[0]) : 'default';
  }
  if (typeof folderName === 'string' && folderName.trim()) {
    const clean = folderName.trim();
    const lower = clean.toLowerCase();
    if (VIRTUAL_FOLDERS.has(lower) || lower === 'my flipbooks' || lower === 'default' || lower === 'fol_default') return 'default';
    if (clean.startsWith('fol_')) return 'default';
    return clean;
  }
  return 'default';
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
  const effectiveFolder = resolveFolder(folderName || (doc ? doc.folderName : 'default'));

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
    'books',
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
        path.join(storageRoot, uf, 'books', effectiveFolder, variant),
        path.join(storageRoot, uf, 'books', 'default', variant),
        path.join(storageRoot, uf, 'books', variant),
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

      // Also scan subdirectories inside books
      const subDir = path.join(storageRoot, uf, 'books');
      if (fs.existsSync(subDir)) {
        try {
          const subdirs = fs.readdirSync(subDir);
          for (const sd of subdirs) {
            const nestedCand = path.join(subDir, sd, variant);
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
