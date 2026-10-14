const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getStorageRoot } = require('../utils/storageHelper');

// Configure temporary upload storage
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(getStorageRoot(), 'temp_uploads');
    if (!fs.existsSync(tempDir)) {
      try {
        fs.mkdirSync(tempDir, { recursive: true });
      } catch (e) {}
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `upload_${uniqueSuffix}${ext}`);
  }
});

const uploadAsset = multer({
  storage: tempStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for rich media assets
  }
});

module.exports = {
  uploadAsset
};
