const express = require('express');
const { adminLogin, adminLogout, adminMe } = require('../controllers/adminAuthController');
const { verifyAdmin } = require('../middlewares/adminAuthMiddleware');

const router = express.Router();

// Public login endpoint for admin portal
router.post('/login', adminLogin);

// Protected endpoints
router.post('/logout', adminLogout);
router.get('/me', verifyAdmin, adminMe);

module.exports = router;
