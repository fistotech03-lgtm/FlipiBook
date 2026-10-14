const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { optionalAuth } = require('../middlewares/authMiddleware');
const { uploadAsset } = require('../middlewares/uploadMiddleware');

// Asset operations support both JWT authentication and email-based fallback (parsed from body by multer or query)
router.post('/upload-asset', uploadAsset.single('file'), optionalAuth, assetController.uploadAsset);
router.post('/delete-asset', optionalAuth, assetController.deleteAsset);
router.delete('/delete-asset', optionalAuth, assetController.deleteAsset);
router.get('/get-gallery-assets', optionalAuth, assetController.getGalleryAssets);
router.post('/rename-gallery-asset', optionalAuth, assetController.renameGalleryAsset);
router.post('/delete-gallery-asset', optionalAuth, assetController.deleteGalleryAsset);
router.post('/use-gallery-asset', optionalAuth, assetController.useGalleryAsset);

module.exports = router;
