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

/**
 * Default workspace folders created for each user on registration:
 * - 3D_Models
 * - 3D_Screenshot
 * - Company_logo
 * - gifs
 * - Images
 * - My_Flipbooks (contains My_Flipbooks as default folder)
 * - Profile
 * - Texture
 * - Videos
 */
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
 * @param {Object} user - User object containing userID, _id, emailId
 */
const createUserWorkspace = (user) => {
  try {
    if (!user) return null;
    const storageRoot = getStorageRoot();
    if (!fs.existsSync(storageRoot)) {
      try {
        fs.mkdirSync(storageRoot, { recursive: true, mode: 0o777 });
      } catch (e) {}
    }

    // Resolve user IDs: e.g. FLIPI0001 and fistotech03_gmail_com
    const userId = user.userID || (user._id ? String(user._id) : (user.id ? String(user.id) : (user.emailId ? user.emailId.replace(/[@.]/g, '_') : null)));
    if (!userId) return null;

    const targetDirs = [userId];
    if (user.emailId) {
      const emailDir = user.emailId.trim().toLowerCase().replace(/[@.]/g, '_');
      if (emailDir && emailDir !== userId) {
        targetDirs.push(emailDir);
      }
    }

    let primaryDir = null;
    for (const dirName of targetDirs) {
      const userDir = path.join(storageRoot, dirName);
      if (!fs.existsSync(userDir)) {
        try {
          fs.mkdirSync(userDir, { recursive: true, mode: 0o777 });
        } catch (e) {}
      }

      // Create all required top-level folders
      for (const folder of WORKSPACE_FOLDERS) {
        const folderPath = path.join(userDir, folder);
        if (!fs.existsSync(folderPath)) {
          try {
            fs.mkdirSync(folderPath, { recursive: true, mode: 0o777 });
          } catch (e) {}
        }
      }

      // Inside My_Flipbooks, create the default "My_Flipbooks" folder
      const defaultFolder = path.join(userDir, 'My_Flipbooks', 'My_Flipbooks');
      if (!fs.existsSync(defaultFolder)) {
        try {
          fs.mkdirSync(defaultFolder, { recursive: true, mode: 0o777 });
        } catch (e) {}
      }

      if (!primaryDir) primaryDir = userDir;
    }

    console.log(`[Workspace Helper] Successfully created workspace for user: ${userId} (${targetDirs.join(', ')})`);
    return primaryDir;
  } catch (err) {
    console.error('[Workspace Helper] Error initializing workspace:', err.message);
    return false;
  }
};

module.exports = {
  getStorageRoot,
  WORKSPACE_FOLDERS,
  createUserWorkspace
};
