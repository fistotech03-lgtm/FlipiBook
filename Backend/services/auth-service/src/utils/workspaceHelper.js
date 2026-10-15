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
      fs.mkdirSync(storageRoot, { recursive: true });
    }

    // Use user ID as the single root workspace folder name
    const userId = user.userID || (user._id ? String(user._id) : (user.id ? String(user.id) : (user.emailId ? user.emailId.replace(/[@.]/g, '_') : null)));
    if (!userId) return null;

    const userDir = path.join(storageRoot, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Create all required top-level folders
    for (const folder of WORKSPACE_FOLDERS) {
      const folderPath = path.join(userDir, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    }

    // Inside My_Flipbooks, create the default "My_Flipbooks" folder
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

module.exports = {
  getStorageRoot,
  WORKSPACE_FOLDERS,
  createUserWorkspace
};
