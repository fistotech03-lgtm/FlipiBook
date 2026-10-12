const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const LoginLog = require("../models/LoginLog");
const SignupOtp = require("../models/SignupOtp");
const {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
} = require("../utils/jwtHelper");
const { sendOtpEmail, sendSignupOtpEmail } = require("../utils/emailService");

/**
 * Hash 6-digit OTP using SHA-256 before database storage
 */
const hashOtp = (otp) => {
  if (!otp) return "";
  return crypto.createHash("sha256").update(String(otp).trim()).digest("hex");
};

/**
 * Constant-time string comparison to prevent timing attacks
 */
const safeCompare = (a, b) => {
  if (!a || !b || typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Check if an IP address is a private, loopback, or internal Docker bridge address
 */
const isPrivateOrLoopbackIp = (ip) => {
  if (!ip) return true;
  const clean = ip.replace(/^::ffff:/, "").trim();
  return (
    clean === "127.0.0.1" ||
    clean === "::1" ||
    clean === "localhost" ||
    clean === "unknown" ||
    clean.startsWith("10.") ||
    clean.startsWith("192.168.") ||
    clean.startsWith("fc00:") ||
    clean.startsWith("fe80:") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)
  );
};

const normalizeIp = (ip) => {
  if (!ip) return "";
  let clean = String(ip).trim();
  if (clean.startsWith("::ffff:")) {
    clean = clean.substring(7);
  }
  if (clean === "::1") {
    clean = "127.0.0.1";
  }
  return clean;
};

/**
 * Extract client IP address accurately from request across multiple proxy hops.
 * Prioritizes real routable public IPs over internal Docker / loopback IPs.
 */
const getClientIp = (req) => {
  const candidates = [];

  // 1. Cloudflare direct client header
  if (req.headers?.["cf-connecting-ip"]) {
    candidates.push(req.headers["cf-connecting-ip"]);
  }

  // 2. Explicit gateway forwarded client IP
  if (req.headers?.["x-client-ip"]) {
    candidates.push(req.headers["x-client-ip"]);
  }

  // 3. X-Real-IP (set by Nginx / Traefik / Dokploy)
  if (req.headers?.["x-real-ip"]) {
    candidates.push(req.headers["x-real-ip"]);
  }

  // 4. X-Forwarded-For header (can contain a comma-separated list of IPs)
  const xForwardedFor = req.headers?.["x-forwarded-for"];
  if (xForwardedFor) {
    const ips = String(xForwardedFor)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    candidates.push(...ips);
  }

  // 5. Express / socket remote address
  if (req.ip) candidates.push(req.ip);
  if (req.socket?.remoteAddress) candidates.push(req.socket.remoteAddress);

  // Normalize all candidate IPs
  const normalizedList = candidates
    .map(normalizeIp)
    .filter((ip) => Boolean(ip) && ip !== "unknown");

  // First priority: find the first non-private, non-loopback public routable IP
  const publicIp = normalizedList.find((ip) => !isPrivateOrLoopbackIp(ip));
  if (publicIp) {
    return publicIp;
  }

  // Fallback: return the first normalized IP or default 127.0.0.1
  return normalizedList[0] || "127.0.0.1";
};

/**
 * Helper to reliably extract cookies from req.cookies or raw req.headers.cookie
 */
const getCookie = (req, name) => {
  if (req.cookies?.[name]) return req.cookies[name];
  const raw = req.headers?.cookie;
  if (!raw) return null;
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Verify Google token directly against Google's OAuth2 endpoints.
 * Supports Google OAuth2 access_token and Google ID token (credential).
 * Ensures email is cryptographically verified by Google before granting access.
 */
const verifyGoogleIdentity = async ({ accessToken, credential }) => {
  try {
    // 1. Verify via Google OAuth2 access token
    if (accessToken) {
      const gRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (gRes.ok) {
        const data = await gRes.json();
        if (data?.email && (data.email_verified === true || data.email_verified === "true")) {
          return {
            email: data.email,
            name: data.name || "",
            picture: data.picture || "",
            sub: data.sub,
          };
        }
      }
    }

    // 2. Verify via Google ID token (credential)
    if (credential) {
      const gRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      if (gRes.ok) {
        const data = await gRes.json();
        if (data?.email && (data.email_verified === true || data.email_verified === "true")) {
          return {
            email: data.email,
            name: data.name || "",
            picture: data.picture || "",
            sub: data.sub,
          };
        }
      }
    }

    return null;
  } catch (err) {
    console.error("[Google Verification Error]:", err.message);
    return null;
  }
};


/**
 * Helper to determine if current connection is HTTPS / Secure
 * If the connection is plain HTTP (e.g. preview sslip.io or localhost), cookies must NOT have secure=true
 * otherwise modern browsers will reject and drop the cookie.
 */
const isSecureConnection = (req) => {
  // 1. If connection is explicitly HTTPS (via TLS terminating reverse proxy like Nginx, Dokploy/Traefik, Cloudflare)
  if (
    req?.secure ||
    req?.headers?.["x-forwarded-proto"]?.includes("https") ||
    req?.headers?.origin?.startsWith("https:") ||
    req?.headers?.referer?.startsWith("https:")
  ) {
    return true;
  }
  // 2. If configured CLIENT_URL in docker-compose is HTTPS (testing / production environments)
  if (process.env.CLIENT_URL?.startsWith("https:")) {
    return true;
  }
  // 3. If forwarded host is a live external domain (not localhost, not 127.0.0.1, not docker internal 'backend')
  const forwardedHost = req?.headers?.["x-forwarded-host"] || "";
  if (
    forwardedHost &&
    !forwardedHost.includes("localhost") &&
    !forwardedHost.includes("127.0.0.1") &&
    !forwardedHost.includes("backend")
  ) {
    return true;
  }
  return false;
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
    sameSite: "lax",
    maxAge: SEVEN_DAYS,
    path: "/",
  };

  // 1. HttpOnly Access Token cookie
  res.cookie("token", accessToken, cookieOptions);

  // 2. HttpOnly Refresh Token cookie (7 days)
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, cookieOptions);
  }

  // 3. Non-sensitive client indicator (zero credentials, zero user IDs)
  res.cookie("flipibook_logged_in", "true", {
    ...cookieOptions,
    httpOnly: false,
  });
};

const clearAuthCookies = (res, req = null) => {
  const isSecure = isSecureConnection(req);
  const cookieOpts = {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
  };
  res.clearCookie("token", cookieOpts);
  res.clearCookie("refreshToken", cookieOpts);
  res.clearCookie("flipibook_logged_in", { ...cookieOpts, httpOnly: false });
};

/**
 * 1. User Signup
 */
const signup = async (req, res) => {
  try {
    const { name, emailId, password } = req.body;

    if (!emailId || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const cleanEmail = emailId.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ emailId: cleanEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User with this email already exists",
        });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (pre-save hook generates FLIPI0001 userID)
    const user = new User({
      name: name ? name.trim() : "",
      emailId: cleanEmail,
      password: hashedPassword,
    });

    await user.save();

    // Capture IP & Create Login Log
    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    let loginLog = null;
    try {
      loginLog = await LoginLog.create({
        userId: user.userID || `FLIPI${user._id.toString().slice(-4).toUpperCase()}`,
        userObjectId: user._id,
        emailId: user.emailId,
        ipAddress,
        userAgent,
        loginTime: new Date(),
        status: "ACTIVE",
        loginMethod: "EMAIL_PASSWORD",
      });
    } catch (logErr) {
      console.error("[Signup LoginLog Error]:", logErr.message);
    }

    const token = generateToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog?._id,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog?._id,
    });

    setAuthCookies(res, token, refreshToken, req);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("[Signup Error]:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Server error during signup",
      });
  }
};

/**
 * 1b. Send OTP for Account Creation
 */
const sendSignupOtp = async (req, res) => {
  try {
    const { name, emailId, password } = req.body;

    if (!emailId || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    }

    const cleanEmail = emailId.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ emailId: cleanEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User with this email already exists",
        });
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
        name: name ? name.trim() : "",
        emailId: cleanEmail,
        password: hashedPassword,
        otp: hashOtp(otp),
        expiresAt,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    // Send signup verification email (plaintext to recipient)
    await sendSignupOtpEmail(cleanEmail, otp, name ? name.trim() : "");

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("[Send Signup OTP Error]:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to send verification code",
      });
  }
};

/**
 * 1c. Verify Signup OTP & Create Account
 */
const verifySignupOtp = async (req, res) => {
  try {
    const { emailId, otp } = req.body;

    if (!emailId || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const cleanEmail = emailId.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // Check if user already registered
    const existingUser = await User.findOne({ emailId: cleanEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User with this email already exists",
        });
    }

    const pendingSignup = await SignupOtp.findOne({ emailId: cleanEmail });
    if (!pendingSignup) {
      return res.status(400).json({
        success: false,
        message:
          "No pending registration found or code expired. Please sign up again.",
      });
    }

    if (pendingSignup.expiresAt < new Date()) {
      await SignupOtp.deleteOne({ _id: pendingSignup._id });
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Verify SHA-256 hashed OTP using timing-safe comparison
    if (!safeCompare(pendingSignup.otp, hashOtp(cleanOtp))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }

    // Create user
    const user = new User({
      name: pendingSignup.name || "",
      emailId: cleanEmail,
      password: pendingSignup.password,
    });

    await user.save();

    // Clean up pending OTP record
    await SignupOtp.deleteOne({ _id: pendingSignup._id });

    // Capture IP & Create Login Log
    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    let loginLog = null;
    try {
      loginLog = await LoginLog.create({
        userId: user.userID || `FLIPI${user._id.toString().slice(-4).toUpperCase()}`,
        userObjectId: user._id,
        emailId: user.emailId,
        ipAddress,
        userAgent,
        loginTime: new Date(),
        status: "ACTIVE",
        loginMethod: "EMAIL_PASSWORD",
      });
    } catch (logErr) {
      console.error("[Verify Signup LoginLog Error]:", logErr.message);
    }

    const token = generateToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog?._id,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog?._id,
    });

    setAuthCookies(res, token, refreshToken, req);

    return res.status(201).json({
      success: true,
      message: "Account verified and created successfully",
      token,
      user: {
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("[Verify Signup OTP Error]:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Server error during verification",
      });
  }
};

/**
 * 1d. Resend Signup OTP
 */
const resendSignupOtp = async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const cleanEmail = emailId.trim().toLowerCase();

    const pendingSignup = await SignupOtp.findOne({ emailId: cleanEmail });
    if (!pendingSignup) {
      return res.status(400).json({
        success: false,
        message:
          "Registration session expired. Please enter your details again.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pendingSignup.otp = hashOtp(otp);
    pendingSignup.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pendingSignup.save();

    await sendSignupOtpEmail(cleanEmail, otp, pendingSignup.name || "");

    return res.status(200).json({
      success: true,
      message: "New verification code sent to your email",
    });
  } catch (error) {
    console.error("[Resend Signup OTP Error]:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to resend code",
      });
  }
};

/**
 * 2. User Login
 */
const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const cleanEmail = emailId.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ emailId: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "This account does not exist. Please sign up.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid password. Please try again.",
        });
    }

    // Track Login in LoginLog Table
    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    let loginLog = null;
    try {
      loginLog = await LoginLog.create({
        userId: user.userID || `FLIPI${user._id.toString().slice(-4).toUpperCase()}`,
        userObjectId: user._id,
        emailId: user.emailId,
        ipAddress,
        userAgent,
        loginTime: new Date(),
        status: "ACTIVE",
        loginMethod: "EMAIL_PASSWORD",
      });
    } catch (logErr) {
      console.error("[Login Log Error]:", logErr.message);
    }

    const token = generateToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog?._id,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog?._id,
    });

    setAuthCookies(res, token, refreshToken, req);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        picture: user.picture,
        emailId: user.emailId,
        email: user.emailId,
      },
    });
  } catch (error) {
    console.error("[Login Error]:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Server error during login",
      });
  }
};

/**
 * 3. Google OAuth Login / Signup
 */
const googleLogin = async (req, res) => {
  try {
    const { accessToken, credential, mode } = req.body;

    if (!accessToken && !credential) {
      return res.status(400).json({
        success: false,
        message: "Google verification token is required",
      });
    }

    // Verify token directly with Google's servers
    const googleProfile = await verifyGoogleIdentity({ accessToken, credential });

    if (!googleProfile || !googleProfile.email) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google authentication token. Please sign in again.",
      });
    }

    // Strictly trust Google's verified email
    const cleanEmail = googleProfile.email.trim().toLowerCase();
    const verifiedName = googleProfile.name || req.body.name || "";
    const verifiedPicture = googleProfile.picture || req.body.picture || "";

    let user = await User.findOne({ emailId: cleanEmail });

    // From the Sign Up tab: never log into an existing account
    if (mode === "signup" && user) {
      return res.status(409).json({
        success: false,
        code: "ACCOUNT_EXISTS",
        message: "An account with this email already exists. Please sign in.",
      });
    }

    // From the Sign In tab: if account does not exist, do not auto-create, prompt user to sign up
    if (mode === "signin" && !user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "This account does not exist. Please sign up.",
      });
    }

    if (!user) {
      // Auto-register google user with a secure random password hash
      const randomPassword = crypto.randomBytes(32).toString("hex") + "!FliPi";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name: verifiedName,
        emailId: cleanEmail,
        password: hashedPassword,
        picture: verifiedPicture,
      });

      await user.save();
    } else if (verifiedPicture && (!user.picture || user.picture !== verifiedPicture)) {
      user.picture = verifiedPicture;
      if (verifiedName && !user.name) user.name = verifiedName;
      await user.save();
    }

    // Log the Google Sign-in event
    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    let loginLog = null;
    try {
      loginLog = await LoginLog.create({
        userId: user.userID || `FLIPI${user._id.toString().slice(-4).toUpperCase()}`,
        userObjectId: user._id,
        emailId: user.emailId,
        ipAddress,
        userAgent,
        loginTime: new Date(),
        status: "ACTIVE",
        loginMethod: "GOOGLE",
      });
    } catch (logErr) {
      console.error("[Google Login Log Error]:", logErr.message);
    }

    const token = generateToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog?._id,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: loginLog?._id,
    });

    setAuthCookies(res, token, refreshToken, req);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        name: user.name,
        picture: user.picture,
        emailId: user.emailId,
        email: user.emailId,
      },
    });
  } catch (error) {
    console.error("[Google Login Error]:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Server error during Google auth",
      });
  }
};

/**
 * 4. Forgot Password - Generate & Send OTP
 */
const forgotPassword = async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const cleanEmail = emailId.trim().toLowerCase();
    const user = await User.findOne({ emailId: cleanEmail });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = {
      code: hashOtp(otp),
      expiresAt,
    };

    await user.save();

    // Send email using Nodemailer (plaintext to recipient)
    await sendOtpEmail(cleanEmail, otp);

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your email successfully",
    });
  } catch (error) {
    console.error("[Forgot Password Error]:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Failed to send OTP" });
  }
};

/**
 * 5. Reset Password with OTP verification
 */
const resetPassword = async (req, res) => {
  try {
    const { emailId, otp, newPassword } = req.body;

    if (!emailId || !otp || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Email, OTP, and new password are required",
        });
    }

    const cleanEmail = emailId.trim().toLowerCase();
    const user = await User.findOne({ emailId: cleanEmail });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.otp || !user.otp.code) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No OTP requested or OTP has already been used",
        });
    }

    // Check expiration
    if (new Date() > new Date(user.otp.expiresAt)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP has expired. Please request a new one.",
        });
    }

    // Verify SHA-256 hashed OTP code using timing-safe comparison
    if (!safeCompare(user.otp.code, hashOtp(otp))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP code" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP
    user.otp = {
      code: null,
      expiresAt: null,
    };

    await user.save();

    // Revoke any existing active sessions upon password reset (OWASP standard)
    await LoginLog.updateMany(
      { userId: user.userID, status: "ACTIVE" },
      { $set: { status: "LOGGED_OUT", logoutTime: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message:
        "Password updated successfully! Please sign in with your new password.",
    });
  } catch (error) {
    console.error("[Reset Password Error]:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to reset password",
      });
  }
};

/**
 * 6. Sign Out / Logout - Track Logout Timestamp & Status
 */
const logout = async (req, res) => {
  try {
    const accessToken =
      getCookie(req, "token") ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);
    const refreshToken = getCookie(req, "refreshToken");

    // Decode token to identify who is logging out (try verification first, then fallback to decode)
    const decoded =
      verifyToken(accessToken) ||
      verifyToken(refreshToken) ||
      decodeToken(accessToken) ||
      decodeToken(refreshToken);

    let updatedCount = 0;

    // 1. Try updating specific session by sessionId
    if (decoded?.sessionId && mongoose.Types.ObjectId.isValid(decoded.sessionId)) {
      const resSession = await LoginLog.updateOne(
        { _id: decoded.sessionId },
        { $set: { logoutTime: new Date(), status: "LOGGED_OUT" } }
      );
      updatedCount = resSession.modifiedCount;
    }

    // 2. Fallback: if specific session was not found, update any ACTIVE session for this user
    if (updatedCount === 0 && (decoded?.id || decoded?.userId || decoded?.emailId)) {
      const orClauses = [
        decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)
          ? { userObjectId: decoded.id }
          : null,
        decoded.userId ? { userId: decoded.userId } : null,
        decoded.emailId ? { emailId: decoded.emailId.toLowerCase() } : null,
      ].filter(Boolean);

      if (orClauses.length > 0) {
        const resUser = await LoginLog.updateMany(
          { $or: orClauses, status: "ACTIVE" },
          { $set: { logoutTime: new Date(), status: "LOGGED_OUT" } }
        );
        updatedCount = resUser.modifiedCount;
      }
    }

    console.log(`[Logout] Successfully marked ${updatedCount} session(s) as LOGGED_OUT for:`, decoded?.emailId || decoded?.userId || decoded?.sessionId || "unknown");

    clearAuthCookies(res, req);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("[Logout Error]:", error);
    clearAuthCookies(res, req);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
};

/**
 * 7. Get Login Logs History
 */
const getLoginLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userIdentifier = req.user.userId;
    const userObjectId = req.user.id;
    const userEmail = req.user.emailId;

    const orClauses = [
      userIdentifier ? { userId: userIdentifier } : null,
      userObjectId && mongoose.Types.ObjectId.isValid(userObjectId)
        ? { userObjectId }
        : null,
      userEmail ? { emailId: userEmail.toLowerCase() } : null,
    ].filter(Boolean);

    const query = orClauses.length > 0 ? { $or: orClauses } : {};

    const logs = await LoginLog.find(query)
      .sort({ loginTime: -1 })
      .limit(Math.min(Math.max(1, Number(limit) || 50), 100))
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error("[Get Login Logs Error]:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to fetch login logs",
      });
  }
};

/**
 * 8. Verify Session (Current Authenticated User Context)
 */
const verifySession = async (req, res) => {
  try {
    const accessToken =
      getCookie(req, "token") ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);
    const refreshToken = getCookie(req, "refreshToken");

    let targetUserId = null;
    let activeToken = accessToken;
    let tokenEmail = null;

    // 1. Try verifying the Access Token (1 hour)
    if (accessToken) {
      const decodedAccess = verifyToken(accessToken);
      if (decodedAccess && decodedAccess.id) {
        // Verify session is active in LoginLog
        if (decodedAccess.sessionId && mongoose.Types.ObjectId.isValid(decodedAccess.sessionId)) {
          const session = await LoginLog.findById(decodedAccess.sessionId);
          if (session && session.status === "LOGGED_OUT") {
            clearAuthCookies(res, req);
            return res.status(200).json({
              success: true,
              isAuthenticated: false,
              user: null,
              message: "Session has been logged out",
            });
          }
        }
        targetUserId = decodedAccess.id;
        tokenEmail = decodedAccess.emailId || null;
        activeToken = accessToken;
      }
    }

    // 2. If Access Token expired/missing, fallback to Refresh Token (7 days)
    if (!targetUserId && refreshToken) {
      const decodedRefresh = verifyToken(refreshToken);
      if (decodedRefresh && decodedRefresh.id) {
        tokenEmail = decodedRefresh.emailId || null;
        // Verify session is active in LoginLog
        if (decodedRefresh.sessionId) {
          const session = await LoginLog.findById(decodedRefresh.sessionId);
          if (session && session.status === "LOGGED_OUT") {
            clearAuthCookies(res, req);
            return res.status(200).json({
              success: true,
              isAuthenticated: false,
              user: null,
              message: "Session has been logged out",
            });
          }
        }

        // Issue a fresh new Access Token (1 hour)
        const newAccessToken = generateToken({
          userId: decodedRefresh.userId,
          emailId: decodedRefresh.emailId,
          id: decodedRefresh.id,
          sessionId: decodedRefresh.sessionId,
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
        message: "No active session",
      });
    }

    // 4. If tokens were provided but could not be validated or refreshed, clear and return unauthenticated
    if (!targetUserId && !tokenEmail) {
      clearAuthCookies(res, req);
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null,
        message: "Session has expired",
      });
    }

    // 5. Retrieve user details by ID
    let user = null;
    if (targetUserId && mongoose.Types.ObjectId.isValid(targetUserId)) {
      user = await User.findById(targetUserId).select(
        "name picture emailId userID",
      );
    }

    // Fallback: If not found by _id, check if user exists by verified email in token
    if (!user && tokenEmail) {
      user = await User.findOne({ emailId: tokenEmail.trim().toLowerCase() }).select(
        "name picture emailId userID",
      );
      if (user) {
        // Auto-repair cookie session with current active user _id
        const repairedAccessToken = generateToken({
          userId: user.userID,
          emailId: user.emailId,
          id: user._id,
        });
        setAuthCookies(res, repairedAccessToken, refreshToken, req);
        activeToken = repairedAccessToken;
      }
    }

    if (!user) {
      console.warn("[Verify Session] User not found for id/email:", targetUserId || tokenEmail);
      clearAuthCookies(res, req);
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null,
        message: "User no longer exists",
      });
    }

    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      token: activeToken,
      user: {
        name: user.name,
        picture: user.picture,
        emailId: user.emailId,
      },
    });
  } catch (error) {
    console.error("[Verify Session Error]:", error);
    return res.status(500).json({
      success: false,
      isAuthenticated: false,
      message: "Server error verifying session",
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
  verifySession,
};
