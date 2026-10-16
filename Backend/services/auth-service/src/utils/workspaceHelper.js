const fs = require("fs");
const path = require("path");

/**
 * Resolve root storage directory
 */
const getStorageRoot = () => {
  if (process.env.STORAGE_PATH) {
    return path.resolve(process.env.STORAGE_PATH);
  }
  const localDefault = path.resolve(__dirname, "../../../../storage");
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
  "3D_Models",
  "3D_Screenshot",
  "Company_logo",
  "gifs",
  "Images",
  "My_Flipbooks",
  "Profile",
  "Texture",
  "Videos",
];

const ensureDir = (p) => {
  if (!fs.existsSync(p)) {
    try {
      fs.mkdirSync(p, { recursive: true, mode: 0o777 });
    } catch (e) {}
  }
  try {
    fs.chmodSync(p, 0o777);
  } catch (e) {}
};

/**
 * Initialize a user's workspace directory and subfolders in storage
 * @param {Object} user - User object containing userID, _id, emailId
 */
const createUserWorkspace = (user) => {
  try {
    if (!user) return null;
    const storageRoot = getStorageRoot();
    ensureDir(storageRoot);

    // Resolve target directories: both custom FLIPIxxxx and sanitized email
    const customUserId = user.userID || (user._id ? String(user._id) : (user.id ? String(user.id) : null));
    const targetDirs = [];
    if (customUserId) targetDirs.push(customUserId);

    if (user.emailId) {
      const emailDir = user.emailId.trim().toLowerCase().replace(/[@.]/g, "_");
      if (emailDir && !targetDirs.includes(emailDir)) {
        targetDirs.push(emailDir);
      }
    }

    if (targetDirs.length === 0) {
      console.warn("[Workspace Helper] No valid userId or emailId to create workspace");
      return null;
    }

    let primaryDir = null;
    for (const dirName of targetDirs) {
      const userDir = path.join(storageRoot, dirName);
      ensureDir(userDir);

      // Create all required top-level folders
      for (const folder of WORKSPACE_FOLDERS) {
        const folderPath = path.join(userDir, folder);
        ensureDir(folderPath);
      }

      // Inside My_Flipbooks, create the default "My_Flipbooks" folder
      const defaultFolder = path.join(userDir, "My_Flipbooks", "My_Flipbooks");
      ensureDir(defaultFolder);

      if (!primaryDir) primaryDir = userDir;
    }

    console.log(
      `[Workspace Helper] Successfully created workspace for: ${targetDirs.join(", ")} at ${storageRoot}`,
    );
    return primaryDir;
  } catch (err) {
    console.error(
      "[Workspace Helper] Error initializing workspace:",
      err.message,
    );
    return false;
  }
};

module.exports = {
  getStorageRoot,
  WORKSPACE_FOLDERS,
  createUserWorkspace,
};
