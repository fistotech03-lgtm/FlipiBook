const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middlewares/authMiddleware');
const storageController = require('../controllers/storageController');

router.use(authenticateUser);

router.get('/get-settings', storageController.getStorageSettings);
router.post('/update-autosave', storageController.updateAutoSave);
router.post('/update-editor-settings', storageController.updateEditorSettings);

module.exports = router;
