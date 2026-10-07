const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const SignupOtp = require('../models/SignupOtp');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwtHelper');
const { sendOtpEmail, sendSignupOtpEmail } = require('../utils/emailService');

/**
 * Hash 6-digit OTP using SHA-256 before database storage
 */
const hashOtp = (otp) => {
  if (!otp) return '';
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
};

/**
 * Extract client IP address accurately from request
 */
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
};

/**
 * Helper to determine if current connection is HTTPS / Secure
 * If the connection is plain HTTP (e.g. preview sslip.io or localhost), cookies must NOT have secure=true
 * otherwise modern browsers will reject and drop the cookie.
 */
const isSecureConnection = (req) => {
  if (!req) return process.env.NODE_ENV === 'production';
  const proto = req.headers?.['x-forwarded-proto'] || (req.secure ? 'https' : '') || req.protocol;
  const referer = req.headers?.['referer'] || '';
  const origin = req.headers?.['origin'] || '';
  return proto === 'https' || referer.startsWith('https://') || origin.startsWith('https://') || process.env.NODE_ENV === 'production';
};

/**
 * Helper to securely attach HttpOnly cookies for Access Token and Refresh Token (7 days)
 * and a non-sensitive cookie indicator for client UI routing
 */
const setAuthCookies = (res, accessToken, refreshToken = null, req = null) => {
  const isSecure = isSecureConnection(req);
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: SEVEN_DAYS,
    path: '/'
  };

  // 1. HttpOnly Access Token cookie
  res.cookie('token', accessToken, cookieOptions);

  // 2. HttpOnly Refresh Token cookie (7 days)
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, cookieOptions);
  }

  // 3. Non-sensitive client indicator (zero credentials, zero user IDs)
  res.cookie('flipibook_logged_in', 'true', {
    ...cookieOptions,
    httpOnly: false
  });
};

const clearAuthCookies = (res, req = null) => {
  const isSecure = isSecureConnection(req);
  const cookieOpts = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    path: '/'
  };
  res.clearCookie('token', cookieOpts);
  res.clearCookie('refreshToken', cookieOpts);
  res.clearCookie('flipibook_logged_in', { ...cookieOpts, httpOnly: false });
};


/**
 * 1. User Signup
 */
const signup = async (req, res) => {
  try {
    const { name, emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = emailId.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ emailId: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (pre-save hook generates FLIPI0001 userID)
    const user = new User({
      name: name ? name.trim() : '',
      emailId: cleanEmail,
      password: hashedPassword
    });

    await user.save();

    // Capture IP & Create Login Log
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';

    const loginLog = await LoginLog.create({
      userId: user.userID,
      userObjectId: user._id,
      emailId: user.emailId,
      ipAddress,
      userAgent,
      loginTime: new Date(),
      status: 'ACTIVE',
      loginMethod: 'EMAIL_PASSWORD'
    });

    const token = generateToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog._id
    });

    const refreshToken = generateRefreshToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog._id
    });

    setAuthCookies(res, token, refreshToken, req);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('[Signup Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during signup' });
  }
};

/**
 * 1b. Send OTP for Account Creation
 */
const sendSignupOtp = async (req, res) => {
  try {
    const { name, emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const cleanEmail = emailId.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ emailId: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert into SignupOtp with SHA-256 hashed OTP
    await SignupOtp.findOneAndUpdate(
      { emailId: cleanEmail },
      {
        name: name ? name.trim() : '',
        emailId: cleanEmail,
        password: hashedPassword,
        otp: hashOtp(otp),
        expiresAt
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send signup verification email (plaintext to recipient)
    await sendSignupOtpEmail(cleanEmail, otp, name ? name.trim() : '');

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('[Send Signup OTP Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to send verification code' });
  }
};

/**
 * 1c. Verify Signup OTP & Create Account
 */
const verifySignupOtp = async (req, res) => {
  try {
    const { emailId, otp } = req.body;

    if (!emailId || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const cleanEmail = emailId.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // Check if user already registered
    const existingUser = await User.findOne({ emailId: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const pendingSignup = await SignupOtp.findOne({ emailId: cleanEmail });
    if (!pendingSignup) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found or code expired. Please sign up again.'
      });
    }

    if (pendingSignup.expiresAt < new Date()) {
      await SignupOtp.deleteOne({ _id: pendingSignup._id });
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Verify SHA-256 hashed OTP
    if (pendingSignup.otp !== hashOtp(cleanOtp)) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // Create user
    const user = new User({
      name: pendingSignup.name || '',
      emailId: cleanEmail,
      password: pendingSignup.password
    });

    await user.save();

    // Clean up pending OTP record
    await SignupOtp.deleteOne({ _id: pendingSignup._id });

    // Capture IP & Create Login Log
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';

    const loginLog = await LoginLog.create({
      userId: user.userID,
      userObjectId: user._id,
      emailId: user.emailId,
      ipAddress,
      userAgent,
      loginTime: new Date(),
      status: 'ACTIVE',
      loginMethod: 'EMAIL_PASSWORD'
    });

    const token = generateToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog._id
    });

    const refreshToken = generateRefreshToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog._id
    });

    setAuthCookies(res, token, refreshToken, req);

    return res.status(201).json({
      success: true,
      message: 'Account verified and created successfully',
      token,
      user: {
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('[Verify Signup OTP Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during verification' });
  }
};

/**
 * 1d. Resend Signup OTP
 */
const resendSignupOtp = async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = emailId.trim().toLowerCase();

    const pendingSignup = await SignupOtp.findOne({ emailId: cleanEmail });
    if (!pendingSignup) {
      return res.status(400).json({
        success: false,
        message: 'Registration session expired. Please enter your details again.'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pendingSignup.otp = hashOtp(otp);
    pendingSignup.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pendingSignup.save();

    await sendSignupOtpEmail(cleanEmail, otp, pendingSignup.name || '');

    return res.status(200).json({
      success: true,
      message: 'New verification code sent to your email'
    });
  } catch (error) {
    console.error('[Resend Signup OTP Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to resend code' });
  }
};

/**
 * 2. User Login
 */
const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = emailId.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ emailId: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'This account does not exist. Please sign up.'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password. Please try again.' });
    }

    // Track Login in LoginLog Table
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';

    const loginLog = await LoginLog.create({
      userId: user.userID,
      userObjectId: user._id,
      emailId: user.emailId,
      ipAddress,
      userAgent,
      loginTime: new Date(),
      status: 'ACTIVE',
      loginMethod: 'EMAIL_PASSWORD'
    });

    const token = generateToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog._id
    });

    const refreshToken = generateRefreshToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog._id
    });

    setAuthCookies(res, token, refreshToken, req);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

/**
 * 3. Google OAuth Login / Signup
 */
const googleLogin = async (req, res) => {
  try {
    const { email, name, picture, mode } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ emailId: cleanEmail });

    // From the Sign Up tab: never log into an existing account
    if (mode === 'signup' && user) {
      return res.status(409).json({
        success: false,
        code: 'ACCOUNT_EXISTS',
        message: 'An account with this email already exists. Please sign in.'
      });
    }

    // From the Sign In tab: if account does not exist, do not auto-create, prompt user to sign up
    if (mode === 'signin' && !user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'This account does not exist. Please sign up.'
      });
    }

    if (!user) {
      // Auto-register google user with a secure random password hash
      const randomPassword = Math.random().toString(36).slice(-12) + '!FliPi';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name: name || '',
        emailId: cleanEmail,
        password: hashedPassword,
        picture: picture || ''
      });

      await user.save();
    } else if (picture && (!user.picture || user.picture !== picture)) {
      user.picture = picture;
      if (name && !user.name) user.name = name;
      await user.save();
    }

    // Log the Google Sign-in event
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';

    const loginLog = await LoginLog.create({
      userId: user.userID,
      userObjectId: user._id,
      emailId: user.emailId,
      ipAddress,
      userAgent,
      loginTime: new Date(),
      status: 'ACTIVE',
      loginMethod: 'GOOGLE'
    });

    const token = generateToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog._id
    });

    const refreshToken = generateRefreshToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog._id
    });

    setAuthCookies(res, token, refreshToken, req);

    return res.status(200).json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('[Google Login Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during Google auth' });
  }
};

/**
 * 4. Forgot Password - Generate & Send OTP
 */
const forgotPassword = async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = emailId.trim().toLowerCase();
    const user = await User.findOne({ emailId: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = {
      code: hashOtp(otp),
      expiresAt
    };

    await user.save();

    // Send email using Nodemailer (plaintext to recipient)
    await sendOtpEmail(cleanEmail, otp);

    return res.status(200).json({
      success: true,
      message: 'OTP has been sent to your email successfully'
    });
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
};

/**
 * 5. Reset Password with OTP verification
 */
const resetPassword = async (req, res) => {
  try {
    const { emailId, otp, newPassword } = req.body;

    if (!emailId || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    const cleanEmail = emailId.trim().toLowerCase();
    const user = await User.findOne({ emailId: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ success: false, message: 'No OTP requested or OTP has already been used' });
    }

    // Check expiration
    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Verify SHA-256 hashed OTP code
    if (user.otp.code !== hashOtp(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP
    user.otp = {
      code: null,
      expiresAt: null
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! Please sign in with your new password.'
    });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to reset password' });
  }
};

/**
 * 6. Sign Out / Logout - Track Logout Timestamp & Status
 */
const logout = async (req, res) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    let filter = {};

    if (token) {
      const decoded = verifyToken(token);
      if (decoded?.sessionId) {
        filter._id = decoded.sessionId;
      } else if (decoded?.userId) {
        filter.userId = decoded.userId;
        filter.status = 'ACTIVE';
      }
    }

    if (Object.keys(filter).length > 0) {
      await LoginLog.updateMany(
        filter,
        {
          $set: {
            logoutTime: new Date(),
            status: 'LOGGED_OUT'
          }
        }
      );
    }

    clearAuthCookies(res, req);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('[Logout Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error during logout' });
  }
};

/**
 * 7. Get Login Logs History
 */
const getLoginLogs = async (req, res) => {
  try {
    const { userId, limit = 50 } = req.query;
    const query = userId ? { userId } : {};

    const logs = await LoginLog.find(query)
      .sort({ loginTime: -1 })
      .limit(Number(limit))
      .select('-__v');

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('[Get Login Logs Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch login logs' });
  }
};

/**
 * Helper to reliably extract cookies from req.cookies or raw req.headers.cookie
 */
const getCookie = (req, name) => {
  if (req.cookies?.[name]) return req.cookies[name];
  const raw = req.headers.cookie;
  if (!raw) return null;
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * 8. Verify Session (Current Authenticated User Context)
 */
const verifySession = async (req, res) => {
  try {
    const accessToken = getCookie(req, 'token') || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    const refreshToken = getCookie(req, 'refreshToken');

    let targetUserId = null;
    let activeToken = accessToken;

    // 1. Try verifying the Access Token (1 hour)
    if (accessToken) {
      const decodedAccess = verifyToken(accessToken);
      if (decodedAccess && decodedAccess.id) {
        targetUserId = decodedAccess.id;
        activeToken = accessToken;
      }
    }

    // 2. If Access Token expired/missing, fallback to Refresh Token (7 days)
    if (!targetUserId && refreshToken) {
      const decodedRefresh = verifyToken(refreshToken);
      if (decodedRefresh && decodedRefresh.id) {
        // Verify session is active in LoginLog
        if (decodedRefresh.sessionId) {
          const session = await LoginLog.findById(decodedRefresh.sessionId);
          if (session && session.status === 'LOGGED_OUT') {
            clearAuthCookies(res, req);
            return res.status(200).json({
              success: true,
              isAuthenticated: false,
              user: null,
              message: 'Session has been logged out'
            });
          }
        }

        // Issue a fresh new Access Token (1 hour)
        const newAccessToken = generateToken({
          userId: decodedRefresh.userId,
          emailId: decodedRefresh.emailId,
          id: decodedRefresh.id,
          sessionId: decodedRefresh.sessionId
        });

        // Set the refreshed Access Token cookie while maintaining the 7-day Refresh Token
        setAuthCookies(res, newAccessToken, refreshToken, req);
        targetUserId = decodedRefresh.id;
        activeToken = newAccessToken;
      }
    }

    // 3. If no tokens were provided in the request, return unauthenticated without altering cookies
    if (!accessToken && !refreshToken) {
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null,
        message: 'No active session'
      });
    }

    // 4. If tokens were provided but could not be validated or refreshed, clear and return unauthenticated
    if (!targetUserId) {
      clearAuthCookies(res, req);
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null,
        message: 'Session has expired'
      });
    }

    // 5. Retrieve user details
    const user = await User.findById(targetUserId).select('name picture emailId');
    if (!user) {
      console.warn('[Verify Session] User not found for id:', targetUserId);
      clearAuthCookies(res, req);
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null,
        message: 'User no longer exists'
      });
    }

    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      token: activeToken,
      user: {
        name: user.name,
        picture: user.picture,
        emailId: user.emailId
      }
    });
  } catch (error) {
    console.error('[Verify Session Error]:', error);
    return res.status(500).json({
      success: false,
      isAuthenticated: false,
      message: 'Server error verifying session'
    });
  }
};

module.exports = {
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
};
