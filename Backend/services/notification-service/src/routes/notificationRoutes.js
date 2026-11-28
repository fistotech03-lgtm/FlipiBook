const express = require('express');
const { optionalAuth } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// Internal service-to-service event triggers
router.post('/internal/book-published', notificationController.createBookPublishedNotifications);
router.post('/internal/new-follower', notificationController.createNewFollowerNotification);

// User-facing notification endpoints
router.get('/', optionalAuth, notificationController.getNotifications);
router.patch('/read-all', optionalAuth, notificationController.markAllAsRead);
router.patch('/:id/read', optionalAuth, notificationController.markAsRead);

module.exports = router;
