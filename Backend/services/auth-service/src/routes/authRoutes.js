const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  logout,
  getLoginLogs,
  verifySession
} = require('../controllers/authController');

// Public Auth Endpoints
router.post('/signup', signup);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

// Session Verification Endpoint (reads HttpOnly cookie)
router.get('/verify', verifySession);

// Tracked Login History Endpoint
router.get('/logs', getLoginLogs);

module.exports = router;
