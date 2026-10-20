const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const threedModelController = require('../controllers/threedModelController');
const { getStorageRoot } = require('../utils/storageHelper');

const router = express.Router();

const upload = multer({
  dest: path.join(os.tmpdir(), 'threed_uploads'),
  limits: { fileSize: 500 * 1024 * 1024 }
});

// Models Listing and Details
router.get('/get-models', threedModelController.getModels);
router.get('/get-model/:modelId', threedModelController.getModelById);

// Chunked and Direct Uploads
router.post('/upload-chunk', upload.single('chunk'), threedModelController.uploadChunk);
router.post('/convert-model', upload.single('model'), threedModelController.convertModel);
router.get('/converted/:filename', threedModelController.getConvertedFile);

// Save Settings, Hotspots and Sessions
router.post('/save-settings', threedModelController.saveSettings);
router.post('/save-hotspots', threedModelController.saveHotspots);
router.post('/save-session', threedModelController.saveSession);
router.get('/get-session', threedModelController.getSession);

// Renaming
router.post('/rename-model', threedModelController.renameModel);
router.post('/rename-label', threedModelController.renameLabel);

// Deletion
router.delete('/delete-model/:emailId/:modelId', threedModelController.deleteModel);
router.delete('/delete-model/:modelId', threedModelController.deleteModel);
router.post('/delete-multiple-models', threedModelController.deleteMultipleModels);

module.exports = router;
