const express = require('express');
const router = express.Router();
const { authenticateUser, optionalAuth } = require('../middlewares/authMiddleware');
const folderController = require('../controllers/folderController');
const bookController = require('../controllers/bookController');

// Public / Optional-auth routes (accessible for preview, direct get, and gallery)
router.get('/preview/:v_id', optionalAuth, bookController.previewBook);
router.get('/get', optionalAuth, bookController.getBook);
router.get('/get-gallery-assets', optionalAuth, bookController.getGalleryAssets);

// All other flipbook & folder routes require authentication
router.use(authenticateUser);

// --- Folder Management ---
router.get('/folders', folderController.getFolders);
router.post('/folder/create', folderController.createFolder);
router.post('/folder/rename', folderController.renameFolder);
router.post('/folder/reorder', folderController.reorderFolders);
router.delete('/folder', folderController.deleteFolder);
router.post('/folder/duplicate', folderController.duplicateFolder);

// --- Flipbook CRUD & Actions ---
router.get('/list', bookController.getBooks);
router.post('/favorite', bookController.toggleFavorite);
router.post('/trash', bookController.trashBook);
router.post('/restore', bookController.restoreBook);
router.post('/empty-trash', bookController.emptyTrash);
router.post('/rename', bookController.renameBook);
router.post('/duplicate', bookController.duplicateBook);
router.delete('/delete/:v_id', bookController.deleteBookPermanently);
router.delete('/delete', bookController.deleteBookPermanently);
router.post('/remove-recent', bookController.removeRecent);
router.post('/unpublish', bookController.unpublishBook);
router.post('/save', bookController.saveBook);
router.post('/save/chunk', bookController.saveChunk);
router.post('/save-pages-batch', bookController.savePagesBatch);
router.post('/update-settings', bookController.updateSettings);

module.exports = router;
