const fs = require('fs');
const path = require('path');

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

/**
 * Initialize a user's workspace directory and subfolders in storage
 */
const createUserWorkspace = (user) => {
  try {
    if (!user) return null;
    const storageRoot = getStorageRoot();
    if (!fs.existsSync(storageRoot)) {
      fs.mkdirSync(storageRoot, { recursive: true });
    }

    const userId = user.userID || (user._id ? String(user._id) : (user.id ? String(user.id) : (user.emailId ? user.emailId.replace(/[@.]/g, '_') : null)));
    if (!userId) return null;

    const userDir = path.join(storageRoot, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    for (const folder of WORKSPACE_FOLDERS) {
      const folderPath = path.join(userDir, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    }

    const defaultFolder = path.join(userDir, 'My_Flipbooks', 'My_Flipbooks');
    if (!fs.existsSync(defaultFolder)) {
      fs.mkdirSync(defaultFolder, { recursive: true });
    }

    console.log(`[Workspace Helper] Successfully created workspace for user: ${userId}`);
    return userDir;
  } catch (err) {
    console.error('[Workspace Helper] Error initializing workspace:', err.message);
    return false;
  }
};

/**
 * Initialize subfolders for a specific flipbook:
 * - assets/audio
 * - assets/download
 * - assets/gif
 * - assets/Image
 * - assets/video
 * - customized_assets
 * - pages
 */
const initFlipbookWorkspace = (bookDir) => {
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
    console.error('[Workspace Helper] Error initializing flipbook workspace:', err.message);
    return null;
  }
};

module.exports = {
  getStorageRoot,
  WORKSPACE_FOLDERS,
  createUserWorkspace,
  initFlipbookWorkspace
};
