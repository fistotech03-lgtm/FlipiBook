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
  sendAddPasswordOtp,
  setPasswordWithOtp,
  logout,
  getLoginLogs,
  verifySession,
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
  getRecentActivities
} = require('../controllers/authController');

const { authLimiter, otpLimiter, otpVerifyLimiter } = require('../middlewares/rateLimiter');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Public Auth Endpoints
router.post('/signup', authLimiter, signup);
router.post('/signup-otp', otpLimiter, sendSignupOtp);
router.post('/verify-signup-otp', otpVerifyLimiter, verifySignupOtp);
router.post('/resend-signup-otp', otpLimiter, resendSignupOtp);
router.post('/login', authLimiter, login);
router.post('/google-login', authLimiter, googleLogin);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/reset-password', otpVerifyLimiter, resetPassword);
router.post('/send-add-password-otp', otpLimiter, sendAddPasswordOtp);
router.post('/set-password-otp', otpVerifyLimiter, setPasswordWithOtp);
router.post('/logout', logout);

// Session Verification Endpoint (reads HttpOnly cookie)
router.get('/verify', verifySession);

// Tracked Login History Endpoint (Protected - only authenticated users can access)
router.get('/logs', authenticateUser, getLoginLogs);

// Account Security / Active Sessions Endpoints (Protected)
router.get('/sessions', authenticateUser, getActiveSessions);
router.post('/sessions/revoke', authenticateUser, revokeSession);
router.post('/sessions/revoke-others', authenticateUser, revokeOtherSessions);
router.get('/recent-activity', authenticateUser, getRecentActivities);

module.exports = router;

