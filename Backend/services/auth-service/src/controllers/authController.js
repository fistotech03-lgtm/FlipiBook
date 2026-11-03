const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../../../../shared/models/User");
const LoginLog = require("../models/loginLog");
const SignupOtp = require("../models/signupOtp");
const {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
} = require("../utils/jwtHelper");
const { sendOtpEmail, sendSignupOtpEmail } = require("../utils/emailService");
const { createUserWorkspace } = require("../utils/workspaceHelper");
const { parseUserAgent, resolveLocation } = require("../utils/deviceParser");

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

const isIPv4 = (ip) => {
  if (!ip || typeof ip !== "string") return false;
  const parts = String(ip).trim().split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
};

/**
 * Extract client IP address accurately from request across multiple proxy hops.
 * Prioritizes real routable public IPs over internal Docker / loopback IPs.
 */
const getClientIp = (req) => {
  const candidates = [];

  // 1. Explicit client reported IP in header or body
  if (req.headers?.["x-client-ip"]) {
    candidates.push(req.headers["x-client-ip"]);
  }
  if (req.body?.ipAddress) {
    candidates.push(req.body.ipAddress);
  }

  // 2. Cloudflare direct client header
  if (req.headers?.["cf-connecting-ip"]) {
    candidates.push(req.headers["cf-connecting-ip"]);
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

  // 1. Highest priority: public routable IPv4 address
  const publicIpv4 = normalizedList.find((ip) => isIPv4(ip) && !isPrivateOrLoopbackIp(ip));
  if (publicIpv4) {
    return publicIpv4;
  }

  // 2. Secondary priority: any public routable IP
  const publicIp = normalizedList.find((ip) => !isPrivateOrLoopbackIp(ip));
  if (publicIp) {
    return publicIp;
  }

  // 3. Fallback: private IPv4 (e.g. 192.168.x.x, 10.x.x.x, or 127.0.0.1)
  const privateIpv4 = normalizedList.find((ip) => isIPv4(ip));
  if (privateIpv4) {
    return privateIpv4;
  }

  // 4. Default loopback IPv4
  return "127.0.0.1";
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
  // If connection is explicitly HTTP (not HTTPS), cookies MUST NOT have secure: true,
  // otherwise browsers (Chrome/Firefox/Safari) will drop the cookie immediately.
  const forwardedProto = req?.headers?.["x-forwarded-proto"];
  const origin = req?.headers?.origin;
  const referer = req?.headers?.referer;

  if (forwardedProto === "http" || origin?.startsWith("http:") || referer?.startsWith("http:")) {
    return false;
  }

  // 1. If connection is explicitly HTTPS (via TLS terminating reverse proxy like Nginx, Dokploy/Traefik, Cloudflare)
  if (
    req?.secure ||
    forwardedProto?.includes("https") ||
    origin?.startsWith("https:") ||
    referer?.startsWith("https:")
  ) {
    return true;
  }

  // 2. If configured CLIENT_URL in docker-compose is HTTPS (testing / production environments)
  if (process.env.CLIENT_URL?.startsWith("https:")) {
    return true;
  }

  return false;
};

/**
 * Helper to securely attach HttpOnly cookies for Access Token and Refresh Token (7 days)
 * and a non-sensitive cookie indicator for client UI routing
 */
const setAuthCookies = (res, accessToken, refreshToken = null, req = null, user = null) => {
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
  if (accessToken) {
    res.cookie("token", accessToken, cookieOptions);
  }

  // 2. HttpOnly Refresh Token cookie (7 days)
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, cookieOptions);
  }

  // 3. Non-sensitive client indicator (zero credentials, zero user IDs)
  res.cookie("flipibook_logged_in", "true", {
    ...cookieOptions,
    httpOnly: false,
  });

  // 4. Non-sensitive client user display info for instant UI hydration without localStorage
  if (user) {
    const safeUserData = {
      name: user.name || "",
      emailId: user.emailId || user.email || "",
      email: user.emailId || user.email || "",
      picture: user.picture || "",
    };
    res.cookie("flipibook_user", encodeURIComponent(JSON.stringify(safeUserData)), {
      ...cookieOptions,
      httpOnly: false,
    });
  }
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
  res.clearCookie("flipibook_user", { ...cookieOpts, httpOnly: false });
};

/**
 * 1. User Signup - Strictly requires email OTP verification
 */
const signup = async (req, res) => {
  return sendSignupOtp(req, res);
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

    // Create user storage workspace
    try {
      createUserWorkspace(user);
    } catch (wsErr) {
      console.warn("[Workspace Creation Warning]:", wsErr.message);
    }

    // Clean up pending OTP record
    await SignupOtp.deleteOne({ _id: pendingSignup._id });

    // Capture Device, IP & Create Login Log
    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";
    const parsed = parseUserAgent(userAgent);
    const browser = req.body?.browser || parsed.browser;
    const operatingSystem = req.body?.operatingSystem || parsed.operatingSystem;
    const deviceType = req.body?.deviceType || parsed.deviceType;
    const location = resolveLocation(req, ipAddress);
    const clientDeviceId = req.body?.deviceId || req.headers["x-device-id"] || `dev_${crypto.randomBytes(12).toString("hex")}`;
    const sessionObjectId = new mongoose.Types.ObjectId();
    const sessionId = sessionObjectId.toString();

    let loginLog = null;
    try {
      loginLog = await LoginLog.create({
        _id: sessionObjectId,
        userId: user.userID || `FLIPI${user._id.toString().slice(-4).toUpperCase()}`,
        userObjectId: user._id,
        emailId: user.emailId,
        sessionId,
        deviceId: clientDeviceId,
        ipAddress,
        userAgent,
        browser,
        operatingSystem,
        deviceType,
        location,
        loginTime: new Date(),
        lastActiveAt: new Date(),
        status: "ACTIVE",
        isRevoked: false,
        eventType: "NEW_DEVICE_LOGIN",
        loginMethod: "EMAIL_PASSWORD",
      });
    } catch (logErr) {
      console.error("[Verify Signup LoginLog Error]:", logErr.message);
    }

    const token = generateToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: sessionId,
      deviceId: clientDeviceId,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: sessionId,
      deviceId: clientDeviceId,
    });

    setAuthCookies(res, token, refreshToken, req, user);

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
    if (!user.password) {
      return res.status(400).json({
        success: false,
        code: "GOOGLE_ACCOUNT",
        message: "This account was registered with Google Sign-In and does not have a password. Please sign in with Google.",
      });
    }

    // Capture Device, IP & Geo Location
    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";
    const parsed = parseUserAgent(userAgent);
    const browser = req.body?.browser || parsed.browser;
    const operatingSystem = req.body?.operatingSystem || parsed.operatingSystem;
    const deviceType = req.body?.deviceType || parsed.deviceType;
    const location = resolveLocation(req, ipAddress);
    const clientDeviceId = req.body?.deviceId || req.headers["x-device-id"] || `dev_${crypto.randomBytes(12).toString("hex")}`;
    const sessionObjectId = new mongoose.Types.ObjectId();
    const sessionId = sessionObjectId.toString();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Record failed login attempt in audit history
      try {
        await LoginLog.create({
          userId: user.userID || `FLIPI${user._id.toString().slice(-4).toUpperCase()}`,
          userObjectId: user._id,
          emailId: user.emailId,
          sessionId: new mongoose.Types.ObjectId().toString(),
          deviceId: clientDeviceId,
          ipAddress,
          userAgent,
          browser,
          operatingSystem,
          deviceType,
          location,
          loginTime: new Date(),
          lastActiveAt: new Date(),
          status: "EXPIRED",
          isRevoked: true,
          eventType: "FAILED_LOGIN",
          loginMethod: "EMAIL_PASSWORD",
        });
      } catch (failedLogErr) {
        console.warn("[Failed Login Log Warning]:", failedLogErr.message);
      }

      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid password. Please try again.",
        });
    }

    // Determine if this is a newly seen device for this account
    let eventType = "SUCCESSFUL_LOGIN";
    try {
      const prevDeviceLog = await LoginLog.findOne({
        $or: [
          { userId: user.userID },
          { userObjectId: user._id },
          { emailId: user.emailId.toLowerCase() }
        ],
        deviceId: clientDeviceId
      });
      if (!prevDeviceLog) {
        eventType = "NEW_DEVICE_LOGIN";
      }
    } catch (checkErr) {
      console.warn("[Device Check Warning]:", checkErr.message);
    }

    // Close any previous active session on this exact same device for this user
    try {
      await LoginLog.updateMany(
        {
          $or: [
            { userId: user.userID },
            { userObjectId: user._id },
            { emailId: user.emailId.toLowerCase() }
          ],
          deviceId: clientDeviceId,
          status: "ACTIVE"
        },
        {
          $set: {
            status: "LOGGED_OUT",
            logoutTime: new Date()
          }
        }
      );
    } catch (staleErr) {
      console.warn("[Stale Session Cleanup Warning]:", staleErr.message);
    }

    let loginLog = null;
    try {
      loginLog = await LoginLog.create({
        _id: sessionObjectId,
        userId: user.userID || `FLIPI${user._id.toString().slice(-4).toUpperCase()}`,
        userObjectId: user._id,
        emailId: user.emailId,
        sessionId,
        deviceId: clientDeviceId,
        ipAddress,
        userAgent,
        browser,
        operatingSystem,
        deviceType,
        location,
        loginTime: new Date(),
        lastActiveAt: new Date(),
        status: "ACTIVE",
        isRevoked: false,
        eventType,
        loginMethod: "EMAIL_PASSWORD",
      });
    } catch (logErr) {
      console.error("[Login Log Error]:", logErr.message);
    }

    const token = generateToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: sessionId,
      deviceId: clientDeviceId,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: sessionId,
      deviceId: clientDeviceId,
    });

    setAuthCookies(res, token, refreshToken, req, user);

    // Ensure user storage workspace & subfolders exist
    try {
      createUserWorkspace(user);
    } catch (wsErr) {
      console.warn("[Workspace Creation Warning on Login]:", wsErr.message);
    }

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
      // For Google sign up, leave password empty (user can add password later via OTP)
      user = new User({
        name: verifiedName,
        emailId: cleanEmail,
        password: "",
        picture: verifiedPicture,
      });

      await user.save();

      // Create user storage workspace
      try {
        createUserWorkspace(user);
      } catch (wsErr) {
        console.warn("[Workspace Creation Warning]:", wsErr.message);
      }
    } else if (verifiedPicture && (!user.picture || user.picture !== verifiedPicture)) {
      user.picture = verifiedPicture;
      if (verifiedName && !user.name) user.name = verifiedName;
      await user.save();
    }

    // Log the Google Sign-in event with device tracking
    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";
    const parsed = parseUserAgent(userAgent);
    const browser = req.body?.browser || parsed.browser;
    const operatingSystem = req.body?.operatingSystem || parsed.operatingSystem;
    const deviceType = req.body?.deviceType || parsed.deviceType;
    const location = resolveLocation(req, ipAddress);
    const clientDeviceId = req.body?.deviceId || req.headers["x-device-id"] || `dev_${crypto.randomBytes(12).toString("hex")}`;
    const sessionObjectId = new mongoose.Types.ObjectId();
    const sessionId = sessionObjectId.toString();

    // Determine if this is a newly seen device for this account
    let eventType = "SUCCESSFUL_LOGIN";
    try {
      const prevDeviceLog = await LoginLog.findOne({
        $or: [
          { userId: user.userID },
          { userObjectId: user._id },
          { emailId: user.emailId.toLowerCase() }
        ],
        deviceId: clientDeviceId
      });
      if (!prevDeviceLog) {
        eventType = "NEW_DEVICE_LOGIN";
      }
    } catch (checkErr) {
      console.warn("[Google Device Check Warning]:", checkErr.message);
    }

    // Close any previous active session on this exact same device for this user
    try {
      await LoginLog.updateMany(
        {
          $or: [
            { userId: user.userID },
            { userObjectId: user._id },
            { emailId: user.emailId.toLowerCase() }
          ],
          deviceId: clientDeviceId,
          status: "ACTIVE"
        },
        {
          $set: {
            status: "LOGGED_OUT",
            logoutTime: new Date()
          }
        }
      );
    } catch (staleErr) {
      console.warn("[Google Stale Session Cleanup Warning]:", staleErr.message);
    }

    let loginLog = null;
    try {
      loginLog = await LoginLog.create({
        _id: sessionObjectId,
        userId: user.userID || `FLIPI${user._id.toString().slice(-4).toUpperCase()}`,
        userObjectId: user._id,
        emailId: user.emailId,
        sessionId,
        deviceId: clientDeviceId,
        ipAddress,
        userAgent,
        browser,
        operatingSystem,
        deviceType,
        location,
        loginTime: new Date(),
        lastActiveAt: new Date(),
        status: "ACTIVE",
        isRevoked: false,
        eventType,
        loginMethod: "GOOGLE",
      });
    } catch (logErr) {
      console.error("[Google Login Log Error]:", logErr.message);
    }

    const token = generateToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: sessionId,
      deviceId: clientDeviceId,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userID,
      emailId: user.emailId,
      id: user._id,
      sessionId: sessionId,
      deviceId: clientDeviceId,
    });

    setAuthCookies(res, token, refreshToken, req, user);

    // Ensure user storage workspace & subfolders exist
    try {
      createUserWorkspace(user);
    } catch (wsErr) {
      console.warn("[Workspace Creation Warning on Login]:", wsErr.message);
    }

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

    // Google-only / passwordless accounts cannot use Forgot Password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        code: "GOOGLE_ACCOUNT",
        message: "This account was registered with Google Sign-In and does not use a password. Please sign in with Google.",
      });
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
 * 4b. Send OTP to Add Password for Google or passwordless accounts
 * POST /api/auth/send-add-password-otp
 */
const sendAddPasswordOtp = async (req, res) => {
  try {
    const emailId = req.body?.emailId || req.user?.emailId || req.user?.email;

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

    await sendOtpEmail(cleanEmail, otp);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email to add password",
    });
  } catch (error) {
    console.error("[Send Add Password OTP Error]:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Failed to send OTP" });
  }
};

/**
 * 4c. Set Initial Password with OTP
 * POST /api/auth/set-password-otp
 */
const setPasswordWithOtp = async (req, res) => {
  try {
    const emailId = req.body?.emailId || req.user?.emailId || req.user?.email;
    const { otp, password } = req.body;

    if (!emailId || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
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
      return res.status(400).json({
        success: false,
        message: "No OTP requested or code has already been used",
      });
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (!safeCompare(user.otp.code, hashOtp(otp))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP code" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.otp = {
      code: null,
      expiresAt: null,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been added successfully",
    });
  } catch (error) {
    console.error("[Set Password With OTP Error]:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to set password",
    });
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

    // Google-only / passwordless accounts cannot use Reset Password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        code: "GOOGLE_ACCOUNT",
        message: "This account was registered with Google Sign-In and does not use a password. Please sign in with Google.",
      });
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

    try {
      const dbUpdatePromise = (async () => {
        const targetSessionId = decoded?.sessionId || req.body?.sessionId || null;
        const targetDeviceId = decoded?.deviceId || req.headers["x-device-id"] || req.cookies?.flipibook_device_id || null;

        const sessionMatches = [
          targetSessionId ? { sessionId: String(targetSessionId) } : null,
          targetSessionId && mongoose.Types.ObjectId.isValid(targetSessionId) ? { _id: targetSessionId } : null,
          targetDeviceId ? { deviceId: targetDeviceId } : null,
        ].filter(Boolean);

        const orClauses = [
          decoded?.id && mongoose.Types.ObjectId.isValid(decoded.id)
            ? { userObjectId: decoded.id }
            : null,
          decoded?.userId ? { userId: decoded.userId } : null,
          decoded?.emailId ? { emailId: decoded.emailId.toLowerCase() } : null,
        ].filter(Boolean);

        // Terminate ONLY this specific session / device, preserving other active sessions
        if (sessionMatches.length > 0 && orClauses.length > 0) {
          const resSession = await LoginLog.updateMany(
            {
              $or: orClauses,
              $and: [{ $or: sessionMatches }],
              status: { $in: ["ACTIVE", "active"] },
            },
            { $set: { logoutTime: new Date(), status: "LOGGED_OUT", isRevoked: true } }
          );
          updatedCount = resSession.modifiedCount;
        } else if (sessionMatches.length > 0) {
          const resSession = await LoginLog.updateMany(
            {
              $or: sessionMatches,
              status: { $in: ["ACTIVE", "active"] },
            },
            { $set: { logoutTime: new Date(), status: "LOGGED_OUT", isRevoked: true } }
          );
          updatedCount = resSession.modifiedCount;
        }
      })();

      // Race with 1000ms timeout so logout response is never blocked by DB connection buffering
      await Promise.race([
        dbUpdatePromise,
        new Promise((resolve) => setTimeout(resolve, 1000))
      ]);
    } catch (logErr) {
      console.warn('[Logout] Non-critical error updating session log:', logErr.message);
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
        // Verify session is active in LoginLog (safeguarded against DB buffering delay)
        if (decodedAccess.sessionId) {
          try {
            const session = await LoginLog.findOne({
              $or: [
                { sessionId: String(decodedAccess.sessionId) },
                mongoose.Types.ObjectId.isValid(decodedAccess.sessionId) ? { _id: decodedAccess.sessionId } : null
              ].filter(Boolean)
            });

            if (session && (session.status === "LOGGED_OUT" || session.status === "REVOKED" || session.isRevoked === true)) {
              clearAuthCookies(res, req);
              return res.status(200).json({
                success: true,
                isAuthenticated: false,
                user: null,
                message: "Session has been revoked or logged out",
              });
            }

            // Update lastActiveAt throttled (once every 60s)
            if (session && session.status === "ACTIVE") {
              const lastActive = session.lastActiveAt ? new Date(session.lastActiveAt).getTime() : 0;
              if (Date.now() - lastActive > 60000) {
                session.lastActiveAt = new Date();
                await session.save().catch(() => {});
              }
            }
          } catch (sessionErr) {
            console.warn("[Verify Session] Warning checking LoginLog:", sessionErr.message);
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
        // Verify session is active in LoginLog (safeguarded against DB buffering delay)
        if (decodedRefresh.sessionId) {
          try {
            const session = await LoginLog.findOne({
              $or: [
                { sessionId: String(decodedRefresh.sessionId) },
                mongoose.Types.ObjectId.isValid(decodedRefresh.sessionId) ? { _id: decodedRefresh.sessionId } : null
              ].filter(Boolean)
            });

            if (session && (session.status === "LOGGED_OUT" || session.status === "REVOKED" || session.isRevoked === true)) {
              clearAuthCookies(res, req);
              return res.status(200).json({
                success: true,
                isAuthenticated: false,
                user: null,
                message: "Session has been revoked or logged out",
              });
            }

            if (session && session.status === "ACTIVE") {
              session.lastActiveAt = new Date();
              await session.save().catch(() => {});
            }
          } catch (sessionErr) {
            console.warn("[Verify Session] Warning checking refresh LoginLog:", sessionErr.message);
          }
        }

        // Issue a fresh new Access Token (1 hour)
        const newAccessToken = generateToken({
          userId: decodedRefresh.userId,
          emailId: decodedRefresh.emailId,
          id: decodedRefresh.id,
          sessionId: decodedRefresh.sessionId,
          deviceId: decodedRefresh.deviceId,
        });

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
      try {
        user = await User.findById(targetUserId).select(
          "name picture emailId userID",
        );
      } catch (userErr) {
        console.warn("[Verify Session] User lookup by ID warning:", userErr.message);
      }
    }

    // Fallback: If not found by _id, check if user exists by verified email in token
    if (!user && tokenEmail) {
      try {
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
          activeToken = repairedAccessToken;
        }
      } catch (emailErr) {
        console.warn("[Verify Session] User lookup by email warning:", emailErr.message);
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

    // Refresh cookies with user display info for instant client hydration
    setAuthCookies(res, activeToken, refreshToken, req, user);

    // Ensure user storage workspace & subfolders exist on session verification
    try {
      createUserWorkspace(user);
    } catch (wsErr) {
      console.warn("[Workspace Creation Warning on Verify Session]:", wsErr.message);
    }

    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      token: activeToken,
      user: {
        name: user.name,
        picture: user.picture,
        emailId: user.emailId,
        email: user.emailId,
      },
    });
  } catch (error) {
    console.error("[Verify Session Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Server error verifying session",
    });
  }
};

/**
 * 9. Get Active Sessions for Current Account
 */
const getActiveSessions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userQueries = [
      req.user.userId ? { userId: req.user.userId } : null,
      req.user.id && mongoose.Types.ObjectId.isValid(req.user.id) ? { userObjectId: req.user.id } : null,
      req.user.emailId ? { emailId: req.user.emailId.toLowerCase() } : null,
    ].filter(Boolean);

    if (userQueries.length === 0) {
      return res.status(400).json({ success: false, message: "User identity unknown" });
    }

    // 1. Identify the caller environment
    const userAgent = req.headers["user-agent"] || "";
    const parsed = parseUserAgent(userAgent);
    const callerBrowser = req.headers["x-client-browser"] || parsed.browser;
    const callerOS = req.headers["x-client-os"] || parsed.operatingSystem;
    const callerDeviceId = req.headers["x-device-id"] || req.user.deviceId || req.cookies?.flipibook_device_id || null;
    const callerSessionId = req.user.sessionId ? String(req.user.sessionId) : null;

    // 2. Fetch all ACTIVE sessions for this user (safely matches isRevoked: false, null, or undefined)
    const sessions = await LoginLog.find({
      $or: userQueries,
      status: { $in: ["ACTIVE", "active"] },
      isRevoked: { $ne: true },
    })
      .sort({ lastActiveAt: -1 })
      .limit(20)
      .lean();

    // 3. Find if caller's device/session is already in the active list
    let callerSessionFound = sessions.find((s) => {
      if (callerSessionId && (s.sessionId === callerSessionId || s._id?.toString() === callerSessionId)) {
        return true;
      }
      if (callerDeviceId && s.deviceId === callerDeviceId) {
        return true;
      }
      return false;
    });

    // 4. Auto-heal: If authenticated caller has no active session record, register one immediately
    if (!callerSessionFound) {
      try {
        const sessionObjectId = new mongoose.Types.ObjectId();
        const ipAddress = getClientIp(req);
        const location = resolveLocation(req, ipAddress);
        const assignedDeviceId = callerDeviceId || `dev_${callerBrowser.toLowerCase()}_${crypto.randomBytes(8).toString("hex")}`;

        const createdSession = await LoginLog.create({
          _id: sessionObjectId,
          userId: req.user.userId || `FLIPI${req.user.id?.toString().slice(-4).toUpperCase()}`,
          userObjectId: req.user.id,
          emailId: req.user.emailId,
          sessionId: sessionObjectId.toString(),
          deviceId: assignedDeviceId,
          ipAddress,
          userAgent,
          browser: callerBrowser,
          operatingSystem: callerOS,
          deviceType: parsed.deviceType,
          location,
          loginTime: new Date(),
          lastActiveAt: new Date(),
          status: "ACTIVE",
          isRevoked: false,
          eventType: "SUCCESSFUL_LOGIN",
          loginMethod: "TOKEN_AUTH",
        });

        const createdObj = createdSession.toObject ? createdSession.toObject() : createdSession;
        sessions.unshift(createdObj);
        callerSessionFound = createdObj;
      } catch (healErr) {
        console.warn("[Auto-heal Session Warning]:", healErr.message);
      }
    } else {
      // Touch lastActiveAt throttled (every 30s) and auto-update IP/location if previously loopback
      try {
        const detectedIp = getClientIp(req);
        const updates = {};
        if (
          detectedIp &&
          isIPv4(detectedIp) &&
          !isPrivateOrLoopbackIp(detectedIp) &&
          (!isIPv4(callerSessionFound.ipAddress) || callerSessionFound.ipAddress === "127.0.0.1" || isPrivateOrLoopbackIp(callerSessionFound.ipAddress))
        ) {
          callerSessionFound.ipAddress = detectedIp;
          updates.ipAddress = detectedIp;
        }

        const clientLoc = req.headers["x-client-location"] || (req.body?.location ? req.body.location : null);
        if (clientLoc && (!callerSessionFound.location || callerSessionFound.location === "Unknown Location" || callerSessionFound.location === "Coimbatore, India")) {
          callerSessionFound.location = clientLoc;
          updates.location = clientLoc;
        }

        const lastActiveTime = callerSessionFound.lastActiveAt ? new Date(callerSessionFound.lastActiveAt).getTime() : 0;
        if (Date.now() - lastActiveTime > 30000) {
          callerSessionFound.lastActiveAt = new Date();
          updates.lastActiveAt = new Date();
        }

        if (Object.keys(updates).length > 0) {
          await LoginLog.updateOne(
            { _id: callerSessionFound._id },
            { $set: updates }
          );
        }
      } catch (touchErr) {
        // ignore
      }
    }

    // 5. Map sessions and accurately mark isCurrent for the caller device
    let hasCurrentMatched = false;
    const mappedSessions = sessions.map((sess) => {
      let isCurrent = false;
      if (!hasCurrentMatched) {
        if (callerSessionId && (sess.sessionId === callerSessionId || sess._id?.toString() === callerSessionId)) {
          isCurrent = true;
        } else if (callerDeviceId && sess.deviceId === callerDeviceId) {
          isCurrent = true;
        } else if (callerSessionFound && (sess.sessionId === callerSessionFound.sessionId || sess._id?.toString() === callerSessionFound._id?.toString())) {
          isCurrent = true;
        }
      }
      if (isCurrent) hasCurrentMatched = true;

      return {
        id: sess._id,
        sessionId: sess.sessionId || sess._id.toString(),
        deviceId: sess.deviceId,
        browser: sess.browser || "Unknown Browser",
        operatingSystem: sess.operatingSystem || "Unknown OS",
        deviceType: sess.deviceType || "desktop",
        ipAddress: sess.ipAddress || "127.0.0.1",
        location: sess.location || "Unknown Location",
        lastActiveAt: sess.lastActiveAt || sess.loginTime || sess.createdAt,
        loginTime: sess.loginTime || sess.createdAt,
        isCurrent,
        loginMethod: sess.loginMethod,
      };
    });

    // Fallback if neither sessionId nor deviceId matched: match by same browser & OS
    if (!hasCurrentMatched && mappedSessions.length > 0) {
      const sameBrowserSession = mappedSessions.find(
        (s) => s.browser === callerBrowser && s.operatingSystem === callerOS
      );
      if (sameBrowserSession) {
        sameBrowserSession.isCurrent = true;
      } else {
        mappedSessions[0].isCurrent = true;
      }
    }

    return res.status(200).json({
      success: true,
      sessions: mappedSessions,
    });
  } catch (error) {
    console.error("[Get Active Sessions Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve active sessions",
    });
  }
};

/**
 * 10. Revoke a Specific Session
 */
const revokeSession = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID is required" });
    }

    const userQueries = [
      req.user.userId ? { userId: req.user.userId } : null,
      req.user.id && mongoose.Types.ObjectId.isValid(req.user.id) ? { userObjectId: req.user.id } : null,
      req.user.emailId ? { emailId: req.user.emailId.toLowerCase() } : null,
    ].filter(Boolean);

    const sessionQuery = [
      { sessionId: String(sessionId) },
      mongoose.Types.ObjectId.isValid(sessionId) ? { _id: sessionId } : null,
    ].filter(Boolean);

    const targetSession = await LoginLog.findOne({
      $and: [
        { $or: sessionQuery },
        { $or: userQueries },
      ],
    });

    if (!targetSession) {
      return res.status(404).json({
        success: false,
        message: "Session not found or already terminated",
      });
    }

    targetSession.status = "REVOKED";
    targetSession.isRevoked = true;
    targetSession.logoutTime = new Date();
    await targetSession.save();

    return res.status(200).json({
      success: true,
      message: "Session successfully logged out and revoked",
    });
  } catch (error) {
    console.error("[Revoke Session Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to revoke session",
    });
  }
};

/**
 * 11. Revoke All Other Sessions Except Current
 */
const revokeOtherSessions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const currentSessionId = req.user.sessionId ? String(req.user.sessionId) : null;
    const currentDeviceId = req.headers["x-device-id"] || req.user.deviceId || req.cookies?.flipibook_device_id || null;

    const userQueries = [
      req.user.userId ? { userId: req.user.userId } : null,
      req.user.id && mongoose.Types.ObjectId.isValid(req.user.id) ? { userObjectId: req.user.id } : null,
      req.user.emailId ? { emailId: req.user.emailId.toLowerCase() } : null,
    ].filter(Boolean);

    const filter = {
      $or: userQueries,
      status: { $in: ["ACTIVE", "active"] },
      isRevoked: { $ne: true },
    };

    const excludeQueries = [
      currentSessionId ? { sessionId: currentSessionId } : null,
      currentSessionId && mongoose.Types.ObjectId.isValid(currentSessionId) ? { _id: currentSessionId } : null,
      currentDeviceId ? { deviceId: currentDeviceId } : null,
    ].filter(Boolean);

    if (excludeQueries.length > 0) {
      filter.$nor = excludeQueries;
    }

    const result = await LoginLog.updateMany(filter, {
      $set: {
        status: "REVOKED",
        isRevoked: true,
        logoutTime: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: `Successfully logged out ${result.modifiedCount} other device(s)`,
      revokedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("[Revoke Other Sessions Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to revoke other sessions",
    });
  }
};

/**
 * 12. Get Recent Login Activities History
 */
const getRecentActivities = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { limit = 20 } = req.query;
    const userQueries = [
      req.user.userId ? { userId: req.user.userId } : null,
      req.user.id && mongoose.Types.ObjectId.isValid(req.user.id) ? { userObjectId: req.user.id } : null,
      req.user.emailId ? { emailId: req.user.emailId.toLowerCase() } : null,
    ].filter(Boolean);

    const logs = await LoginLog.find({
      $or: userQueries,
    })
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(1, Number(limit) || 20), 50))
      .lean();

    const currentSessionId = req.user.sessionId ? String(req.user.sessionId) : null;
    const callerDeviceId = req.headers["x-device-id"] || req.user.deviceId || null;
    const detectedPublicIp = req.headers["x-client-ip"] || getClientIp(req);

    const activities = logs.map((log) => {
      const isCurrent = Boolean(
        (currentSessionId && (log.sessionId === currentSessionId || log._id.toString() === currentSessionId)) ||
        (callerDeviceId && log.deviceId === callerDeviceId)
      );

      let effectiveIp = log.ipAddress || "127.0.0.1";
      if (
        isCurrent &&
        detectedPublicIp &&
        isIPv4(detectedPublicIp) &&
        !isPrivateOrLoopbackIp(detectedPublicIp) &&
        (!isIPv4(effectiveIp) || effectiveIp === "127.0.0.1" || isPrivateOrLoopbackIp(effectiveIp))
      ) {
        effectiveIp = detectedPublicIp;
      }

      return {
        id: log._id,
        sessionId: log.sessionId,
        device: `${log.browser || "Browser"} on ${log.operatingSystem || "Device"}`,
        browser: log.browser || "Unknown",
        operatingSystem: log.operatingSystem || "Unknown",
        deviceType: log.deviceType || "desktop",
        location: log.location || "Unknown Location",
        date: log.createdAt || log.loginTime,
        ipAddress: effectiveIp,
        status: log.status,
        eventType: log.eventType || "SUCCESSFUL_LOGIN",
        isCurrent,
        loginMethod: log.loginMethod,
      };
    });

    return res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("[Get Recent Activities Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve login activities",
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
  sendAddPasswordOtp,
  setPasswordWithOtp,
  logout,
  getLoginLogs,
  verifySession,
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
  getRecentActivities,
};
