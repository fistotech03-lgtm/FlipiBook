const express = require('express');
const router = express.Router();
const pageEditorController = require('../controllers/pageEditorController');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Public status / health endpoint
router.get('/status', pageEditorController.getServiceStatus);

// Protected routes (requires authenticated user)
router.get('/data', authenticateUser, pageEditorController.getPageData);

module.exports = router;
