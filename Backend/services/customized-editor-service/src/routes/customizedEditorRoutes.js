const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');

const { authenticateUser, optionalAuth } = require('../middlewares/authMiddleware');
const controller = require('../controllers/customizedEditorController');
const resumableController = require('../controllers/resumableController');
const bookInfoController = require('../controllers/bookInfoController');

// Multer upload config for memory buffer or temp upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [
      '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.avif',
      '.mp4', '.webm', '.ogv', '.mov', '.avi',
      '.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a',
      '.pdf', '.pptx', '.ppt', '.docx', '.doc'
    ];
    if (allowed.includes(ext) || !ext) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type (${ext}). Allowed types: ${allowed.join(', ')}`));
    }
  }
});

const { nanoid } = require('nanoid');
const { TEMP_UPLOADS_DIR } = require('../services/resumableUploadService');

// Direct streaming to disk storage (0MB RAM heap allocation, zero socket blocking)
const docDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(TEMP_UPLOADS_DIR)) {
        fs.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
      }
    } catch (_) {}
    cb(null, TEMP_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `direct_${nanoid(12)}_${Date.now()}${ext}`);
  }
});

const directDocUpload = multer({
  storage: docDiskStorage,
  limits: { fileSize: 250 * 1024 * 1024 } // 250MB direct upload ceiling
});

const chunkUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB chunk ceiling
});

// Middleware to handle multer file upload error gracefully
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.message === 'Request aborted' || req.aborted) {
        return res.status(499).end();
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Middleware to handle direct document upload error gracefully
const handleDirectDocUpload = (req, res, next) => {
  directDocUpload.single('file')(req, res, (err) => {
    if (err) {
      if (err.message === 'Request aborted' || req.aborted) {
        return res.status(499).end();
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Middleware to handle chunk upload error gracefully (e.g. client abort / tab close)
const handleChunkUploadMiddleware = (req, res, next) => {
  chunkUpload.single('chunk')(req, res, (err) => {
    if (err) {
      if (err.message === 'Request aborted' || req.aborted) {
        return res.status(499).end();
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ==========================================
// 0. Resumable Chunked Ingestion & Redis Extraction Pipeline (10,000+ Pages)
// ==========================================
router.post('/upload-document', optionalAuth, handleDirectDocUpload, resumableController.uploadDocument);
router.post('/upload-chunk', optionalAuth, handleChunkUploadMiddleware, resumableController.uploadChunk);
router.post('/upload-chunk-binary', optionalAuth, resumableController.uploadChunkBinary);
router.get('/extract-stream/:jobId', optionalAuth, resumableController.extractStream);
router.get('/job-status/:jobId', optionalAuth, resumableController.getJobStatus);
router.get('/manifest/:userId/:bookId', optionalAuth, resumableController.getBookManifest);
router.post('/upload-page-image', optionalAuth, upload.single('file'), resumableController.uploadPageImage);
router.post('/finalize-edge-book', optionalAuth, resumableController.finalizeEdgeBook);

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
router.get('/public/get/:shareId', optionalAuth, controller.getPublicBook);
router.get(['/preview-image/:shareId', '/public/preview-image/:shareId'], optionalAuth, controller.getPreviewImage);
router.get(['/preview-card/:shareId', '/public/preview-card/:shareId'], optionalAuth, controller.getPreviewCard);
router.post('/public/view/:shareId', optionalAuth, controller.recordPublicView);
router.post('/public/rate/:shareId', optionalAuth, controller.submitPublicRating);
router.put('/public/rate/:shareId/:ratingId', optionalAuth, controller.updatePublicRating);
router.delete('/public/rate/:shareId/:ratingId', optionalAuth, controller.deletePublicRating);
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
router.patch('/leads/:leadId/status', authenticateUser, controller.updateLeadStatus);
router.post('/leads/:leadId/notes', authenticateUser, controller.addLeadNote);
router.patch('/leads/:leadId/notes/:noteId', authenticateUser, controller.updateLeadNote);
router.delete('/leads/:leadId/notes/:noteId', authenticateUser, controller.deleteLeadNote);
router.post('/leads/:leadId/activity', authenticateUser, controller.addLeadActivity);
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

// ==========================================
// 9. Book Information & Cover Picture Service
// ==========================================
router.post(['/book-info', '/book-information', '/save-book-info', '/flipbook-info'], optionalAuth, bookInfoController.saveBookInfo);
router.get(['/book-info/:v_id', '/book-information/:v_id', '/flipbook-info/:v_id'], optionalAuth, bookInfoController.getBookInfo);
router.get(['/book-info', '/book-information', '/flipbook-info'], optionalAuth, bookInfoController.getBookInfo);
router.post(['/cover-picture', '/save-cover-picture'], optionalAuth, bookInfoController.saveCoverPicture);

module.exports = router;
