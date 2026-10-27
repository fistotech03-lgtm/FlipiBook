const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser, optionalAuth, requireAdmin } = require('../middlewares/authMiddleware');

// Current user profile
router.get('/me', authenticateUser, userController.getMe);
router.get('/profile', authenticateUser, userController.getMe);
router.put('/profile', authenticateUser, userController.updateProfile);
router.patch('/profile', authenticateUser, userController.updateProfile);

// Public / lookup routes
router.get('/check-email', userController.checkEmailAvailable);
router.get('/by-id/:id', optionalAuth, userController.getUserById);
router.get('/by-email/:email', optionalAuth, userController.getUserByEmail);
router.get('/search', optionalAuth, userController.searchUsers);

// Preferences
router.get('/preferences', authenticateUser, userController.getPreferences);
router.put('/preferences', authenticateUser, userController.updatePreferences);

// Account security
router.post('/change-password', authenticateUser, userController.changePassword);
router.delete('/account', authenticateUser, userController.deleteAccount);

// Admin listing
router.get('/all', authenticateUser, requireAdmin, userController.listUsers);
router.get('/', optionalAuth, userController.searchUsers);

module.exports = router;
