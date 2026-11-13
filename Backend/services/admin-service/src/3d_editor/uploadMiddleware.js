const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Resolve the root storage directory
const storageRoot = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.resolve(__dirname, '../../../../storage');

const assetsStorageRoot = path.join(storageRoot, '3d_assets');

// Helper to ensure target folder exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Clean string for folder / file naming
const sanitizeSlug = (str) => {
  if (!str) return 'item';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'item';
};

/**
 * Creates a Multer upload instance that stores every item (and all its related
 * files like preview, maps, textures, model) in its own dedicated subfolder:
 * e.g.:
 *  - storage/3d_assets/hdris/<hdri_folder_name>/[hdriFile, preview]
 *  - storage/3d_assets/materials/<material_folder_name>/[preview, map, normalMap, ...]
 *  - storage/3d_assets/models/<model_folder_name>/[modelFile, thumbnail]
 */
const createAssetUploader = (assetCategory) => {
  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Create a persistent folder id per request so all uploaded files in this request go together
      if (!req._itemFolder) {
        // If updating an existing item with an ID in params
        if (req.params && req.params.id) {
          req._itemFolder = sanitizeSlug(req.params.id);
        } else {
          const rawName = req.body?.name || path.basename(file.originalname, path.extname(file.originalname));
          const nameSlug = sanitizeSlug(rawName);
          const timestamp = Date.now();
          req._itemFolder = `${nameSlug}_${timestamp}`;
        }
      }

      const dest = path.join(assetsStorageRoot, assetCategory, req._itemFolder);
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const unique = crypto.randomBytes(3).toString('hex');
      cb(null, `${base}_${unique}${ext}`);
    }
  });

  return multer({
    storage: diskStorage,
    limits: {
      fileSize: 300 * 1024 * 1024 // 300 MB limit
    }
  });
};

const uploadModels = createAssetUploader('models');
const uploadHdris = createAssetUploader('hdris');
const uploadMaterials = createAssetUploader('materials');

module.exports = {
  uploadModels,
  uploadHdris,
  uploadMaterials,
  storageRoot,
  assetsStorageRoot
};
