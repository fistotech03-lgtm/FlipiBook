const express = require('express');
const router = express.Router();
const {
  signup,
  sendSignupOtp,
  verifySignupOtp,
  resendSignupOtp,
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
router.post('/signup-otp', sendSignupOtp);
router.post('/verify-signup-otp', verifySignupOtp);
router.post('/resend-signup-otp', resendSignupOtp);
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
