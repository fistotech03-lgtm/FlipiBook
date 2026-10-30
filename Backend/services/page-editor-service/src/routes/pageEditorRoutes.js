const express = require('express');
const router = express.Router();
const pageEditorController = require('../controllers/pageEditorController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const pageRoutes = require('./pageRoutes');
const assetRoutes = require('./assetRoutes');

// Public status / health endpoint
router.get('/status', pageEditorController.getServiceStatus);

// Public route to resolve map URLs (expand shortlinks like maps.app.goo.gl)
router.get('/resolve-map-url', pageEditorController.resolveMapUrl);

// Protected routes (requires authenticated user)
router.get('/data', authenticateUser, pageEditorController.getPageData);

// Sub-routes for page operations and asset operations (all strictly auth-checked)
router.use('/', pageRoutes);
router.use('/', assetRoutes);

module.exports = router;
