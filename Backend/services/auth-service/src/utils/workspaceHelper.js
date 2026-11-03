const fs = require('fs');
const path = require('path');
const UserGallery = require('../../../../shared/models/UserGallery');

/**
 * Resolve root storage directory
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
 * Aligned workspace directory structure for each user:
 * 
 * storage/<userId>/
 * ├── gallery/
 * │   ├── pageEditorgallery/
 * │   │   ├── images/
 * │   │   ├── videos/
 * │   │   └── gifs/
 * │   ├── customizationGallery/
 * │   │   ├── images/
 * │   │   └── videos/
 * │   └── 3dGallery/
 * │       ├── models/
 * │       ├── texture/
 * │       └── snapshot/
 * ├── books/
 * │   └── default/
 * └── userdetails/
 *     ├── profile/
 *     └── company_logo/
 */
const WORKSPACE_STRUCTURE = {
  'gallery': {
    'pageEditorgallery': ['images', 'videos', 'gifs'],
    'customizationGallery': ['images', 'videos'],
    '3dGallery': ['models', 'texture', 'snapshot']
  },
  'books': ['default'],
  'userdetails': ['profile', 'company_logo']
};

/**
 * Flat list of relative directory paths created for each user (all names start with lowercase)
 */
const WORKSPACE_FOLDERS = [
  // 1. Gallery Root & Sub-galleries
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

  // 2. Books Root & Default Book Folder
  'books',
  'books/default',

  // 3. User Details Root & Sub-folders
  'userdetails',
  'userdetails/profile',
  'userdetails/company_logo'
];

/**
 * Helper to ensure directory exists with proper permissions
 */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o777 });
    } catch (e) {
      console.warn(`[Workspace Helper] Warning creating dir ${dirPath}:`, e.message);
    }
  }
  try {
    fs.chmodSync(dirPath, 0o777);
  } catch (e) {}
};

/**
 * Safely migrate files/folders from srcDir to destDir.
 * Case-sensitive and APFS/NTFS safe: never deletes destDir, and checks actual parent entries.
 */
const safeMigrateDirectory = (srcDir, destDir) => {
  try {
    if (srcDir === destDir) return;
    const srcParent = path.dirname(srcDir);
    const srcBase = path.basename(srcDir);
    if (!fs.existsSync(srcParent)) return;

    // Check actual directory table entry to avoid case-insensitive collisions on macOS / Windows
    const parentEntries = fs.readdirSync(srcParent);
    if (!parentEntries.includes(srcBase)) return;

    const destParent = path.dirname(destDir);
    const destBase = path.basename(destDir);
    const isSameParent = path.resolve(srcParent) === path.resolve(destParent);

    // If it is the exact same directory differing only by casing (e.g. Profile vs profile):
    if (isSameParent && srcBase.toLowerCase() === destBase.toLowerCase()) {
      if (srcBase !== destBase) {
        const tempName = `${srcBase}_mig_tmp_${Date.now()}`;
        const tempDir = path.join(srcParent, tempName);
        fs.renameSync(srcDir, tempDir);
        fs.renameSync(tempDir, destDir);
      }
      return;
    }

    // Otherwise, move all files from srcDir to destDir
    ensureDir(destDir);
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      if (!fs.existsSync(destFile)) {
        fs.renameSync(srcFile, destFile);
      }
    }

    if (path.resolve(srcDir) !== path.resolve(destDir)) {
      try {
        fs.rmdirSync(srcDir);
      } catch (_) {}
    }
  } catch (err) {
    console.warn(`[Workspace Helper] Migration note (${srcDir} -> ${destDir}):`, err.message);
  }
};

/**
 * Initialize a user's workspace directory in storage
 * @param {Object} user - User object containing userID, _id, emailId
 */
const createUserWorkspace = (user) => {
  try {
    if (!user) return null;
    const storageRoot = getStorageRoot();
    ensureDir(storageRoot);

    // Resolve target directory: prioritize custom FLIPIxxxx, fallback to user ID or sanitized email
    const userId = user.userID || (user._id ? String(user._id) : (user.id ? String(user.id) : null));
    let dirName = userId;
    if (!dirName && user.emailId) {
      dirName = user.emailId.trim().toLowerCase().replace(/[@.]/g, "_");
    }

    if (!dirName) {
      console.warn("[Workspace Helper] No valid userId or emailId to create workspace");
      return null;
    }

    const userDir = path.join(storageRoot, dirName);
    ensureDir(userDir);

    // Self-healing migration for existing servers (Production / Testing):
    // 1. Move legacy My_Flipbooks contents to books/default if present
    const legacyMyFlipbooks = path.join(userDir, 'My_Flipbooks');
    const defaultBooksDir = path.join(userDir, 'books', 'default');
    if (fs.existsSync(legacyMyFlipbooks)) {
      try {
        ensureDir(defaultBooksDir);
        const items = fs.readdirSync(legacyMyFlipbooks);
        for (const item of items) {
          const srcPath = path.join(legacyMyFlipbooks, item);
          const destPath = path.join(defaultBooksDir, item);
          if (!fs.existsSync(destPath)) {
            fs.renameSync(srcPath, destPath);
            console.log(`[Workspace Helper] Migrated legacy book "${item}" from My_Flipbooks to books/default`);
          }
        }
        try {
          fs.rmSync(legacyMyFlipbooks, { recursive: true, force: true });
        } catch (e) {}
      } catch (migErr) {
        console.warn(`[Workspace Helper] Warning during legacy My_Flipbooks migration for ${dirName}:`, migErr.message);
      }
    }

    // 2. Move legacy Gallery/userdetails to root userdetails if present
    const legacyUserDetails = path.join(userDir, 'Gallery', 'userdetails');
    const newUserDetails = path.join(userDir, 'userdetails');
    if (fs.existsSync(legacyUserDetails)) {
      try {
        ['Profile', 'Company_logo', 'profile', 'company_logo'].forEach((sub) => {
          const srcSub = path.join(legacyUserDetails, sub);
          const destSub = path.join(newUserDetails, sub.toLowerCase());
          ensureDir(destSub);
          if (fs.existsSync(srcSub)) {
            const files = fs.readdirSync(srcSub);
            for (const file of files) {
              const srcFile = path.join(srcSub, file);
              const destFile = path.join(destSub, file);
              if (!fs.existsSync(destFile)) {
                fs.renameSync(srcFile, destFile);
              }
            }
          }
        });
        try {
          fs.rmSync(legacyUserDetails, { recursive: true, force: true });
          console.log(`[Workspace Helper] Migrated legacy Gallery/userdetails to root userdetails for ${dirName}`);
        } catch (e) {}
      } catch (migErr) {
        console.warn(`[Workspace Helper] Warning during Gallery/userdetails migration for ${dirName}:`, migErr.message);
      }
    }

    // 3. Move legacy root Profile / Company_logo (created by user-service) into userdetails/profile & company_logo
    safeMigrateDirectory(path.join(userDir, 'Profile'), path.join(userDir, 'userdetails', 'profile'));
    safeMigrateDirectory(path.join(userDir, 'Company_logo'), path.join(userDir, 'userdetails', 'company_logo'));

    // 4. Safely migrate legacy uppercase folder names to lowercase
    const lowercaseMigrations = [
      { src: path.join(userDir, 'userdetails', 'Profile'), dest: path.join(userDir, 'userdetails', 'profile') },
      { src: path.join(userDir, 'userdetails', 'Company_logo'), dest: path.join(userDir, 'userdetails', 'company_logo') },
      { src: path.join(userDir, 'Gallery'), dest: path.join(userDir, 'gallery') },
      { src: path.join(userDir, 'gallery', 'pageEditorgallery', 'Images'), dest: path.join(userDir, 'gallery', 'pageEditorgallery', 'images') },
      { src: path.join(userDir, 'gallery', 'pageEditorgallery', 'Videos'), dest: path.join(userDir, 'gallery', 'pageEditorgallery', 'videos') },
      { src: path.join(userDir, 'gallery', 'CustomizationGallery'), dest: path.join(userDir, 'gallery', 'customizationGallery') },
      { src: path.join(userDir, 'gallery', 'customizationGallery', 'Images'), dest: path.join(userDir, 'gallery', 'customizationGallery', 'images') },
      { src: path.join(userDir, 'gallery', 'customizationGallery', 'Videos'), dest: path.join(userDir, 'gallery', 'customizationGallery', 'videos') },
      { src: path.join(userDir, 'gallery', '3DGallery'), dest: path.join(userDir, 'gallery', '3dGallery') },
      { src: path.join(userDir, 'gallery', '3dGallery', 'Models'), dest: path.join(userDir, 'gallery', '3dGallery', 'models') },
      { src: path.join(userDir, 'gallery', '3dGallery', 'Texture'), dest: path.join(userDir, 'gallery', '3dGallery', 'texture') },
      { src: path.join(userDir, 'gallery', '3dGallery', 'Snapshot'), dest: path.join(userDir, 'gallery', '3dGallery', 'snapshot') }
    ];

    for (const { src, dest } of lowercaseMigrations) {
      safeMigrateDirectory(src, dest);
    }

    // 5. Clean up obsolete books/fol_* directories and merge any missing books into books/default
    const booksDir = path.join(userDir, 'books');
    if (fs.existsSync(booksDir)) {
      try {
        const subdirs = fs.readdirSync(booksDir);
        for (const sd of subdirs) {
          if (sd.startsWith('fol_')) {
            const strayFolPath = path.join(booksDir, sd);
            if (fs.statSync(strayFolPath).isDirectory()) {
              const bookItems = fs.readdirSync(strayFolPath);
              ensureDir(defaultBooksDir);
              for (const b of bookItems) {
                if (b === '.DS_Store') continue;
                const srcBook = path.join(strayFolPath, b);
                const destBook = path.join(defaultBooksDir, b);
                if (!fs.existsSync(destBook)) {
                  fs.renameSync(srcBook, destBook);
                  console.log(`[Workspace Helper] Moved book "${b}" from ${sd} to books/default`);
                }
              }
              try {
                fs.rmSync(strayFolPath, { recursive: true, force: true });
                console.log(`[Workspace Helper] Removed legacy stray folder: ${strayFolPath}`);
              } catch (_) {}
            }
          }
        }
      } catch (folErr) {
        console.warn(`[Workspace Helper] Warning migrating stray fol_* dirs for ${dirName}:`, folErr.message);
      }
    }

    // 6. Unconditionally ensure the complete aligned folder hierarchy exists
    for (const relPath of WORKSPACE_FOLDERS) {
      const fullPath = path.join(userDir, relPath);
      ensureDir(fullPath);
    }

    // Ensure UserGallery document in MongoDB is initialized (strictly keyed by userObjectID and userID, no emailId)
    try {
      const orConds = [];
      if (user._id) orConds.push({ userObjectID: user._id });
      if (user.userID) orConds.push({ userID: user.userID });

      if (orConds.length > 0) {
        UserGallery.findOneAndUpdate(
          { $or: orConds },
          {
            $setOnInsert: {
              userObjectID: user._id || null,
              userID: user.userID || null,
              userdetails: { images: [] },
              pageEditorgallery: { images: [], video: [], gif: [] },
              CustomizationGallery: { images: [], videos: [] },
              '3DGallery': { models: [], texture: [], snapshot: [] }
            },
            $unset: { emailId: "" }
          },
          { upsert: true, returnDocument: 'after' }
        ).catch(err => console.warn('[Workspace Helper] UserGallery init note:', err.message));
      }
    } catch (ugErr) {}

    console.log(`[Workspace Helper] Successfully created aligned workspace for: ${dirName} at ${userDir}`);
    return userDir;
  } catch (err) {
    console.error('[Workspace Helper] Error initializing workspace:', err.message);
    return false;
  }
};

/**
 * Returns structured absolute paths for a user's workspace
 */
const getUserWorkspacePaths = (userId) => {
  const storageRoot = getStorageRoot();
  const userDir = path.join(storageRoot, String(userId));
  const galleryDir = path.join(userDir, 'gallery');

  return {
    root: userDir,
    galleryRoot: galleryDir,
    userDetails: {
      root: path.join(userDir, 'userdetails'),
      profile: path.join(userDir, 'userdetails', 'profile'),
      companyLogo: path.join(userDir, 'userdetails', 'company_logo')
    },
    pageEditorGallery: {
      root: path.join(galleryDir, 'pageEditorgallery'),
      images: path.join(galleryDir, 'pageEditorgallery', 'images'),
      videos: path.join(galleryDir, 'pageEditorgallery', 'videos'),
      gifs: path.join(galleryDir, 'pageEditorgallery', 'gifs')
    },
    customizationGallery: {
      root: path.join(galleryDir, 'customizationGallery'),
      images: path.join(galleryDir, 'customizationGallery', 'images'),
      videos: path.join(galleryDir, 'customizationGallery', 'videos')
    },
    threeDGallery: {
      root: path.join(galleryDir, '3dGallery'),
      models: path.join(galleryDir, '3dGallery', 'models'),
      texture: path.join(galleryDir, '3dGallery', 'texture'),
      snapshot: path.join(galleryDir, '3dGallery', 'snapshot')
    },
    books: {
      root: path.join(userDir, 'books'),
      default: path.join(userDir, 'books', 'default')
    }
  };
};

module.exports = {
  getStorageRoot,
  WORKSPACE_STRUCTURE,
  WORKSPACE_FOLDERS,
  createUserWorkspace,
  getUserWorkspacePaths
};
