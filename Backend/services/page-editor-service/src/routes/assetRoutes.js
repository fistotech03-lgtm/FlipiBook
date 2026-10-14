const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { uploadAsset } = require('../middlewares/uploadMiddleware');

// All asset operations strictly authenticate user first
router.post('/upload-asset', authenticateUser, uploadAsset.single('file'), assetController.uploadAsset);
router.post('/delete-asset', authenticateUser, assetController.deleteAsset);
router.delete('/delete-asset', authenticateUser, assetController.deleteAsset);
router.get('/get-gallery-assets', authenticateUser, assetController.getGalleryAssets);
router.post('/rename-gallery-asset', authenticateUser, assetController.renameGalleryAsset);
router.post('/delete-gallery-asset', authenticateUser, assetController.deleteGalleryAsset);

module.exports = router;
