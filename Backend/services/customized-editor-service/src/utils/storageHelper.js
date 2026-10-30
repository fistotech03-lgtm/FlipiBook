const fs = require('fs');
const path = require('path');

/**
 * Resolves the root storage directory
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
 * Normalizes asset type names to standardized folder names:
 * Logo, Watermark, Background, Video, Audio, Preloader, Gallery_Image, Texture, Other
 */
const getAssetTypeFolder = (type) => {
  if (!type) return 'Logo';
  const lower = String(type).trim().toLowerCase();
  if (lower === 'watermark') return 'Watermark';
  if (lower === 'video' || lower === 'videos') return 'Video';
  if (lower === 'image' || lower === 'images' || lower === 'bgimg' || lower === 'background') return 'Background';
  if (lower.includes('gallery')) return 'Gallery_Image';
  if (lower === 'audio' || lower === 'sound' || lower === 'bgaudio') return 'Audio';
  if (lower.includes('preloader')) return 'Preloader';
  if (lower.includes('texture')) return 'Texture';
  if (lower.includes('transparent') || lower.includes('sheet')) return 'Transparent_Sheet';
  return 'Logo';
};

/**
 * Resolves or initializes target disk directory for a customized asset upload
 */
const getCustomizedAssetUploadDir = (userFolder, folderName = 'default', bookName = null, assetType = 'Logo') => {
  const root = getStorageRoot();
  const typeFolder = getAssetTypeFolder(assetType);
  const cleanUser = String(userFolder || 'default_user').replace(/[^a-zA-Z0-9_-]/g, '_');

  let targetDir;
  if (typeFolder === 'Logo' || typeFolder === 'Company_Logo' || typeFolder === 'Preloader') {
    targetDir = path.join(root, cleanUser, 'userdetails', 'company_logo');
    if (!fs.existsSync(targetDir) && fs.existsSync(path.join(root, cleanUser, 'userdetails', 'Company_logo'))) {
      targetDir = path.join(root, cleanUser, 'userdetails', 'Company_logo');
    }
  } else if (typeFolder === 'Profile') {
    targetDir = path.join(root, cleanUser, 'userdetails', 'profile');
    if (!fs.existsSync(targetDir) && fs.existsSync(path.join(root, cleanUser, 'userdetails', 'Profile'))) {
      targetDir = path.join(root, cleanUser, 'userdetails', 'Profile');
    }
  } else if (typeFolder === 'Video') {
    targetDir = path.join(root, cleanUser, 'gallery', 'customizationGallery', 'videos');
    if (!fs.existsSync(targetDir) && fs.existsSync(path.join(root, cleanUser, 'Gallery', 'CustomizationGallery', 'Videos'))) {
      targetDir = path.join(root, cleanUser, 'Gallery', 'CustomizationGallery', 'Videos');
    }
  } else {
    // Images, Background, Watermark, Texture, Transparent_Sheet, Gallery_Image, Audio, Other
    targetDir = path.join(root, cleanUser, 'gallery', 'customizationGallery', 'images');
    if (!fs.existsSync(targetDir) && fs.existsSync(path.join(root, cleanUser, 'Gallery', 'CustomizationGallery', 'Images'))) {
      targetDir = path.join(root, cleanUser, 'Gallery', 'CustomizationGallery', 'Images');
    }
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  return targetDir;
};

/**
 * Computes public URL for an asset given its absolute disk path
 */
const toPublicStorageUrl = (filePath) => {
  if (!filePath) return '';
  const root = getStorageRoot();
  const rel = path.relative(root, filePath).replace(/\\/g, '/');
  return `/storage/${encodeURI(rel)}`;
};

/**
 * Deletes an asset file from disk given its URL or disk path (non-blocking)
 */
const deleteAssetFile = (fileUrlOrPath) => {
  if (!fileUrlOrPath) return false;
  setImmediate(async () => {
    try {
      const root = getStorageRoot();
      let absPath = fileUrlOrPath;

      if (fileUrlOrPath.startsWith('/storage/')) {
        const rel = decodeURIComponent(fileUrlOrPath.replace('/storage/', ''));
        absPath = path.join(root, rel);
      } else if (fileUrlOrPath.startsWith('/uploads/')) {
        const rel = decodeURIComponent(fileUrlOrPath.replace('/uploads/', ''));
        absPath = path.join(root, rel);
      }

      if (fs.existsSync(absPath)) {
        await fs.promises.unlink(absPath).catch(() => {});
      }
    } catch (err) {
      console.warn('[Storage Helper] Warning deleting asset file:', err.message);
    }
  });
  return true;
};

module.exports = {
  getStorageRoot,
  getAssetTypeFolder,
  getCustomizedAssetUploadDir,
  toPublicStorageUrl,
  deleteAssetFile
};
