const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const os = require('os');

const { authenticateUser, optionalAuth } = require('../middlewares/authMiddleware');
const controller = require('../controllers/customizedEditorController');

// Multer upload config for memory buffer or temp upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [
      '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.avif',
      '.mp4', '.webm', '.ogv', '.mov', '.avi',
      '.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a'
    ];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type (${ext}). Allowed types: ${allowed.join(', ')}`));
    }
  }
});

// Middleware to handle multer file upload error gracefully
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ==========================================
// 1. Health & Auth Status
// ==========================================
router.get(['/health', '/status'], optionalAuth, controller.getStatus);
router.get('/check-auth', authenticateUser, controller.checkAuth);
router.get('/me', authenticateUser, controller.checkAuth);

// ==========================================
// 2. Settings Management (Primary: userId)
// ==========================================
router.get('/settings/:v_id', authenticateUser, controller.getSettings);
router.get('/settings', authenticateUser, controller.getSettings);
router.get(['/customized-settings', '/customized_settings'], optionalAuth, controller.getSettings);
router.get('/public/settings/:v_id', optionalAuth, controller.getPublicSettings);
router.get('/public/settings', optionalAuth, controller.getPublicSettings);
router.post('/update-settings', authenticateUser, controller.updateSettings);
router.post('/reset-settings', authenticateUser, controller.resetSettings);

// ==========================================
// 3. Asset Management (Upload, Delete, List)
// ==========================================
router.post(
  ['/upload-customized-asset', '/upload-asset'],
  optionalAuth,
  handleUpload,
  controller.uploadCustomizedAsset
);
router.post(
  ['/delete-customized-asset', '/delete-asset'],
  authenticateUser,
  controller.deleteCustomizedAsset
);
router.get('/assets', authenticateUser, controller.getUserAssets);
router.get('/background-assets', optionalAuth, controller.getBackgroundAssets);
router.post('/copy-theme-asset', optionalAuth, controller.copyThemeAsset);

// ==========================================
// 4. Lead Capture & Management
// ==========================================
router.post(['/submit-lead', '/public/submit-lead'], optionalAuth, controller.submitLead);
router.get(['/leads', '/get-leads'], authenticateUser, controller.getLeads);
router.delete('/leads/:leadId', authenticateUser, controller.deleteLead);

// ==========================================
// 5. Visibility Credentials & Security
// ==========================================
router.post('/verify-credential', optionalAuth, controller.verifyCredential);
router.post('/send-visibility-otp', optionalAuth, controller.sendVisibilityOtp);
router.post('/verify-visibility-otp', optionalAuth, controller.verifyVisibilityOtp);

// ==========================================
// 6. User Presets
// ==========================================
router.get('/presets', authenticateUser, controller.getUserPresets);
router.post('/presets', authenticateUser, controller.saveUserPreset);

// ==========================================
// 7. Compatibility Routes for Legacy Components
// ==========================================
router.post('/branding', optionalAuth, (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return handleUpload(req, res, () => controller.uploadCustomizedAsset(req, res));
  }
  return controller.updateSettings(req, res);
});

router.post('/background', optionalAuth, (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return handleUpload(req, res, () => controller.uploadCustomizedAsset(req, res));
  }
  return controller.updateSettings(req, res);
});

router.post('/branding/upload', optionalAuth, handleUpload, controller.uploadCustomizedAsset);
router.post('/branding/save', authenticateUser, controller.updateSettings);
router.post('/branding/delete-asset', authenticateUser, controller.deleteCustomizedAsset);

router.post('/background/upload', optionalAuth, handleUpload, controller.uploadCustomizedAsset);
router.post('/background/save', authenticateUser, controller.updateSettings);
router.post('/background/delete-asset', authenticateUser, controller.deleteCustomizedAsset);

// ==========================================
// 8. Book Appearance & Transparent Sheet
// ==========================================
router.post(['/book-appearance', '/appearance'], optionalAuth, controller.updateBookAppearance);
router.post(['/book-appearance/transparent-sheet', '/transparent-sheet'], optionalAuth, controller.saveTransparentSheet);
router.delete(['/book-appearance/transparent-sheet/:sheetId', '/transparent-sheet/:sheetId'], optionalAuth, controller.deleteTransparentSheet);
router.post(['/book-appearance/delete-transparent-sheet', '/delete-transparent-sheet'], optionalAuth, controller.deleteTransparentSheet);

module.exports = router;
