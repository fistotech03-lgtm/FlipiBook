// Backend/services/user-service/src/routes/profileRoutes.js
const express = require('express');
const multer = require('multer');
const profileController = require('../controllers/profileController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// GET profile
router.get('/', profileController.getProfile);

// POST save full profile (both /save and /)
router.post('/save', profileController.saveProfile);
router.post('/', profileController.saveProfile);
router.put('/', profileController.saveProfile);
router.patch('/', profileController.saveProfile);

// Avatar & Banner uploads
router.post('/avatar', upload.single('avatar'), profileController.updateAvatar);
router.post('/banner', upload.single('banner'), profileController.updateBanner);

// Creator Follow / Unfollow routes
router.post('/follow', profileController.followCreator);
router.post('/unfollow', profileController.unfollowCreator);

module.exports = router;
