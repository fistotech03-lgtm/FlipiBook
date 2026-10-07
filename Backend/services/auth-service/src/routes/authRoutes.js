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

const { authLimiter, otpLimiter, otpVerifyLimiter } = require('../middlewares/rateLimiter');

// Public Auth Endpoints
router.post('/signup', authLimiter, signup);
router.post('/signup-otp', otpLimiter, sendSignupOtp);
router.post('/verify-signup-otp', otpVerifyLimiter, verifySignupOtp);
router.post('/resend-signup-otp', otpLimiter, resendSignupOtp);
router.post('/login', authLimiter, login);
router.post('/google-login', authLimiter, googleLogin);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/reset-password', otpVerifyLimiter, resetPassword);
router.post('/logout', logout);

// Session Verification Endpoint (reads HttpOnly cookie)
router.get('/verify', verifySession);

// Tracked Login History Endpoint
router.get('/logs', getLoginLogs);

module.exports = router;
