const express = require('express');
const router = express.Router();
const { authenticateUser, optionalAuth } = require('../middlewares/authMiddleware');
const { getStatus, checkAuth } = require('../controllers/customizedEditorController');

// Public / optional auth routes
router.get('/status', optionalAuth, getStatus);

// Protected routes requiring simple authentication
router.get('/check-auth', authenticateUser, checkAuth);
router.get('/me', authenticateUser, checkAuth);

module.exports = router;
