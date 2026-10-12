const express = require('express');
const router = express.Router();
const myflipibookController = require('../controllers/myflipibookController');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Public status / health endpoint
router.get('/status', myflipibookController.getServiceStatus);

// Protected routes (requires authenticated user)
router.get('/list', authenticateUser, myflipibookController.getAllFlipbooks);

module.exports = router;
