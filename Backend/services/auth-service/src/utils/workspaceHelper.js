const fs = require('fs');
const path = require('path');
const UserGallery = require('../models/UserGallery');

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
 * ├── Gallery/
 * │   ├── userdetails/
 * │   │   ├── Profile/
 * │   │   └── Company_logo/
 * │   ├── pageEditorgallery/
 * │   │   ├── Images/
 * │   │   ├── Videos/
 * │   │   └── gifs/
 * │   ├── CustomizationGallery/
 * │   │   ├── Images/
 * │   │   └── Videos/
 * │   └── 3DGallery/
 * │       ├── Models/
 * │       ├── Texture/
 * │       └── Snapshot/
 * └── books/
 *     └── default/
 */
const WORKSPACE_STRUCTURE = {
  'Gallery': {
    'userdetails': ['Profile', 'Company_logo'],
    'pageEditorgallery': ['Images', 'Videos', 'gifs'],
    'CustomizationGallery': ['Images', 'Videos'],
    '3DGallery': ['Models', 'Texture', 'Snapshot']
  },
  'books': ['default']
};

/**
 * Flat list of relative directory paths created for each user
 */
const WORKSPACE_FOLDERS = [
  // 1. Gallery Root & Sub-galleries
  'Gallery',
  'Gallery/userdetails',
  'Gallery/userdetails/Profile',
  'Gallery/userdetails/Company_logo',
  'Gallery/pageEditorgallery',
  'Gallery/pageEditorgallery/Images',
  'Gallery/pageEditorgallery/Videos',
  'Gallery/pageEditorgallery/gifs',
  'Gallery/CustomizationGallery',
  'Gallery/CustomizationGallery/Images',
  'Gallery/CustomizationGallery/Videos',
  'Gallery/3DGallery',
  'Gallery/3DGallery/Models',
  'Gallery/3DGallery/Texture',
  'Gallery/3DGallery/Snapshot',

  // 2. Books Root & Default Book Folder
  'books',
  'books/default'
];

/**
 * Helper to ensure directory exists with proper permissions
 */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o777 });
    } catch (e) {}
  }
  try {
    fs.chmodSync(dirPath, 0o777);
  } catch (e) {}
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

    // Create aligned folder hierarchy
    for (const relPath of WORKSPACE_FOLDERS) {
      const fullPath = path.join(userDir, relPath);
      ensureDir(fullPath);
    }

    // Self-healing migration for existing servers (Production / Testing):
    // Move legacy My_Flipbooks contents to books/default if present
    const legacyMyFlipbooks = path.join(userDir, 'My_Flipbooks');
    const defaultBooksDir = path.join(userDir, 'books', 'default');
    if (fs.existsSync(legacyMyFlipbooks)) {
      try {
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

    // Ensure UserGallery document in MongoDB is initialized
    try {
      const orConds = [];
      if (user._id) orConds.push({ userObjectID: user._id });
      if (user.userID) orConds.push({ userID: user.userID });
      if (user.emailId) orConds.push({ emailId: user.emailId.trim().toLowerCase() });

      if (orConds.length > 0) {
        UserGallery.findOneAndUpdate(
          { $or: orConds },
          {
            $setOnInsert: {
              userObjectID: user._id || null,
              userID: user.userID || null,
              emailId: user.emailId ? user.emailId.trim().toLowerCase() : null,
              userdetails: { images: [] },
              pageEditorgallery: { images: [], video: [], gif: [] },
              CustomizationGallery: { images: [], videos: [] },
              '3DGallery': { models: [], texture: [], snapshot: [] }
            }
          },
          { upsert: true, new: true }
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
  const galleryDir = path.join(userDir, 'Gallery');

  return {
    root: userDir,
    galleryRoot: galleryDir,
    userDetails: {
      root: path.join(galleryDir, 'userdetails'),
      profile: path.join(galleryDir, 'userdetails', 'Profile'),
      companyLogo: path.join(galleryDir, 'userdetails', 'Company_logo')
    },
    pageEditorGallery: {
      root: path.join(galleryDir, 'pageEditorgallery'),
      images: path.join(galleryDir, 'pageEditorgallery', 'Images'),
      videos: path.join(galleryDir, 'pageEditorgallery', 'Videos'),
      gifs: path.join(galleryDir, 'pageEditorgallery', 'gifs')
    },
    customizationGallery: {
      root: path.join(galleryDir, 'CustomizationGallery'),
      images: path.join(galleryDir, 'CustomizationGallery', 'Images'),
      videos: path.join(galleryDir, 'CustomizationGallery', 'Videos')
    },
    threeDGallery: {
      root: path.join(galleryDir, '3DGallery'),
      models: path.join(galleryDir, '3DGallery', 'Models'),
      texture: path.join(galleryDir, '3DGallery', 'Texture'),
      snapshot: path.join(galleryDir, '3DGallery', 'Snapshot')
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
