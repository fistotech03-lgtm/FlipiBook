const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

let User;
try {
  User = require('../models/User');
} catch (_) {}

const userFolderCache = new Map();

/**
 * Generate unique ID
 */
const generateId = (length = 20) => {
  return crypto.randomBytes(Math.ceil(length * 0.75))
    .toString('base64url')
    .slice(0, length);
};

/**
 * Resolve root storage path
 */
const getStorageRoot = () => {
  if (process.env.STORAGE_PATH) {
    return path.resolve(process.env.STORAGE_PATH);
  }
  const localDefault = path.resolve(__dirname, '../../../../storage');
  if (!fs.existsSync(localDefault)) {
    try {
      fs.mkdirSync(localDefault, { recursive: true });
    } catch (e) {}
  }
  return localDefault;
};

/**
 * Resolve HDRI directory: check src/assets/hdri first
 */
const getHdriRoot = () => {
  const assetsHdri = path.resolve(__dirname, '../assets/hdri');
  if (fs.existsSync(assetsHdri)) return assetsHdri;
  if (process.env.HDRI_PATH && fs.existsSync(process.env.HDRI_PATH)) {
    return path.resolve(process.env.HDRI_PATH);
  }
  const localHdri = path.resolve(__dirname, '../../../hdri');
  if (fs.existsSync(localHdri)) return localHdri;
  const backend1Hdri = 'D:/Praveenkumar/Backend_1/hdri';
  if (fs.existsSync(backend1Hdri)) return path.resolve(backend1Hdri);
  return assetsHdri;
};

/**
 * Resolve Textures and Materials directory: check src/assets/materials first
 */
const getTexturesRoot = () => {
  const assetsMaterials = path.resolve(__dirname, '../assets/materials');
  if (fs.existsSync(assetsMaterials)) return assetsMaterials;
  const localTexture = path.resolve(__dirname, '../../../Texture');
  if (fs.existsSync(localTexture)) return localTexture;
  const backend1Texture = 'D:/Praveenkumar/Backend_1/Texture';
  if (fs.existsSync(backend1Texture)) return path.resolve(backend1Texture);
  return assetsMaterials;
};

/**
 * Sanitize email for folder path (fallback only)
 */
const sanitizeEmail = (email) => {
  if (!email) return 'default_user';
  return email.toString().trim().toLowerCase().replace(/[@.]/g, '_');
};

/**
 * Sanitize file or model names to prevent directory traversal
 */
const sanitizeFileName = (name, fallback = 'model.glb') => {
  if (!name) return fallback;
  const clean = name.toString().replace(/[^a-zA-Z0-9._-]/g, '_').trim();
  return clean || fallback;
};

/**
 * Resolve existing user folder (e.g. 'FLIPI0001') - Async with DB lookup
 * NEVER create an email folder like 'fistotech04_gmail_com'.
 */
const resolveUserFolderAsync = async (emailOrUserId, fallbackReq = null) => {
  const root = getStorageRoot();
  const cand = (
    (typeof emailOrUserId === 'string' ? emailOrUserId : '') ||
    fallbackReq?.body?.userID ||
    fallbackReq?.query?.userID ||
    fallbackReq?.user?.userId ||
    fallbackReq?.user?.userID ||
    fallbackReq?.body?.emailId ||
    fallbackReq?.query?.emailId ||
    fallbackReq?.user?.emailId ||
    ''
  ).toString().trim();

  // 1. If candidate is explicitly a FLIPI user ID
  if (/^FLIPI\d+/i.test(cand)) {
    const userDir = path.join(root, cand);
    if (!fs.existsSync(userDir)) {
      try { fs.mkdirSync(userDir, { recursive: true }); } catch (_) {}
    }
    userFolderCache.set(cand.toLowerCase(), cand);
    return cand;
  }

  // 2. Check memory cache
  if (cand && userFolderCache.has(cand.toLowerCase())) {
    return userFolderCache.get(cand.toLowerCase());
  }

  // 3. Database lookup for user's userID (e.g. 'FLIPI0001')
  try {
    const UserModel = User || mongoose.models.User || mongoose.model('User');
    if (UserModel && cand) {
      const u = await UserModel.findOne({
        $or: [
          { emailId: cand.toLowerCase() },
          { userID: cand },
          ...(mongoose.Types.ObjectId.isValid(cand) ? [{ _id: new mongoose.Types.ObjectId(cand) }] : [])
        ]
      }).select('userID emailId');

      if (u && u.userID) {
        const userDir = path.join(root, u.userID);
        if (!fs.existsSync(userDir)) {
          try { fs.mkdirSync(userDir, { recursive: true }); } catch (_) {}
        }
        userFolderCache.set(cand.toLowerCase(), u.userID);
        if (u.emailId) {
          userFolderCache.set(u.emailId.toLowerCase(), u.userID);
        }
        userFolderCache.set(u.userID.toLowerCase(), u.userID);
        return u.userID;
      }
    }
  } catch (dbErr) {
    console.warn('[Storage] DB lookup notice:', dbErr.message);
  }

  // 4. Synchronous directory inspection fallback
  return resolveUserFolder(cand, fallbackReq);
};

/**
 * Resolve existing user folder (e.g. 'FLIPI0001') - Synchronous
 * NEVER create an email folder like 'fistotech04_gmail_com'.
 */
const resolveUserFolder = (emailOrUserId, fallbackReq = null) => {
  const root = getStorageRoot();
  const cand = (
    (typeof emailOrUserId === 'string' ? emailOrUserId : '') ||
    fallbackReq?.body?.userID ||
    fallbackReq?.query?.userID ||
    fallbackReq?.user?.userId ||
    fallbackReq?.user?.userID ||
    fallbackReq?.body?.emailId ||
    fallbackReq?.query?.emailId ||
    fallbackReq?.user?.emailId ||
    ''
  ).toString().trim();

  // 1. Direct FLIPI match
  if (/^FLIPI\d+/i.test(cand)) {
    const userDir = path.join(root, cand);
    if (!fs.existsSync(userDir)) {
      try { fs.mkdirSync(userDir, { recursive: true }); } catch (_) {}
    }
    userFolderCache.set(cand.toLowerCase(), cand);
    return cand;
  }

  // 2. Check cache
  if (cand && userFolderCache.has(cand.toLowerCase())) {
    return userFolderCache.get(cand.toLowerCase());
  }

  // 3. Check existing directories in storageRoot for FLIPI folders
  try {
    const dirs = fs.readdirSync(root);
    const flipiDirs = dirs.filter(d => /^FLIPI\d+/i.test(d));
    if (flipiDirs.length === 1) {
      userFolderCache.set(cand.toLowerCase(), flipiDirs[0]);
      return flipiDirs[0];
    }
    if (flipiDirs.length > 1) {
      return flipiDirs[0];
    }
  } catch (_) {}

  // 4. If a directory with cand already exists and is not an email
  if (cand && !cand.includes('@') && fs.existsSync(path.join(root, cand))) {
    userFolderCache.set(cand.toLowerCase(), cand);
    return cand;
  }

  return 'FLIPI0001';
};

/**
 * Directory for user's 3D models (supports 3D_Models)
 */
const getUser3DDir = async (emailOrUserId, fallbackReq = null) => {
  const root = getStorageRoot();
  const userFolder = await resolveUserFolderAsync(emailOrUserId, fallbackReq);
  const preferredDir = path.join(root, userFolder, '3D_Models');
  if (!fs.existsSync(preferredDir)) {
    fs.mkdirSync(preferredDir, { recursive: true });
  }
  return preferredDir;
};

/**
 * Synchronous variant of getUser3DDir
 */
const getUser3DDirSync = (emailOrUserId, fallbackReq = null) => {
  const root = getStorageRoot();
  const userFolder = resolveUserFolder(emailOrUserId, fallbackReq);
  const preferredDir = path.join(root, userFolder, '3D_Models');
  if (!fs.existsSync(preferredDir)) {
    fs.mkdirSync(preferredDir, { recursive: true });
  }
  return preferredDir;
};

/**
 * Directory for user's textures
 */
const getUserTextureDir = async (emailOrUserId, materialName = '', fallbackReq = null) => {
  const root = getStorageRoot();
  const userFolder = await resolveUserFolderAsync(emailOrUserId, fallbackReq);
  const cleanMat = sanitizeFileName(materialName, '');
  const dir = cleanMat
    ? path.join(root, userFolder, 'Texture', cleanMat)
    : path.join(root, userFolder, 'Texture');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

/**
 * Directory for chunk uploads - inside user workspace!
 */
const getTempChunkDir = async (uploadId, emailOrUserId = null, fallbackReq = null) => {
  const root = getStorageRoot();
  const userFolder = await resolveUserFolderAsync(emailOrUserId, fallbackReq);
  const dir = path.join(root, userFolder, '.temp_chunks', sanitizeFileName(uploadId, 'chunk'));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

/**
 * Directory for temporary converted models - inside user workspace!
 */
const getConvertedDir = async (emailOrUserId = null, fallbackReq = null) => {
  const root = getStorageRoot();
  const userFolder = await resolveUserFolderAsync(emailOrUserId, fallbackReq);
  const dir = path.join(root, userFolder, '.converted_models');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

/**
 * Assemble chunks into final file.
 * Only removes individual chunk files; does NOT delete targetFilePath or tempDir!
 */
const assembleChunks = async (tempDir, targetFilePath, totalChunks) => {
  const writeStream = fs.createWriteStream(targetFilePath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(tempDir, `chunk_${i}`);
    let retry = 0;
    while (!fs.existsSync(chunkPath) && retry < 20) {
      await new Promise((r) => setTimeout(r, 100));
      retry++;
    }

    if (!fs.existsSync(chunkPath)) {
      throw new Error(`Missing chunk ${i} of ${totalChunks}`);
    }
    const chunkBuffer = await fs.promises.readFile(chunkPath);
    writeStream.write(chunkBuffer);
    try {
      await fs.promises.unlink(chunkPath);
    } catch (_) {}
  }

  await new Promise((resolve, reject) => {
    writeStream.end((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  return targetFilePath;
};

/**
 * Convert absolute file path in storage to /storage relative URL
 */
const toStorageUrl = (filePath) => {
  const root = getStorageRoot();
  const rel = path.relative(root, filePath).replace(/\\/g, '/');
  return `/storage/${rel}`;
};

/**
 * Resolve full dynamic URL with request host
 */
const resolveUrl = (req, relativeOrFullUrl) => {
  if (!relativeOrFullUrl) return relativeOrFullUrl;
  if (relativeOrFullUrl.startsWith('http://') || relativeOrFullUrl.startsWith('https://')) {
    return relativeOrFullUrl;
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:8000';
  const cleanPath = relativeOrFullUrl.startsWith('/') ? relativeOrFullUrl : `/${relativeOrFullUrl}`;
  return `${protocol}://${host}${cleanPath}`;
};

module.exports = {
  generateId,
  getStorageRoot,
  getHdriRoot,
  getTexturesRoot,
  sanitizeEmail,
  sanitizeFileName,
  resolveUserFolder,
  resolveUserFolderAsync,
  getUser3DDir,
  getUser3DDirSync,
  getUserTextureDir,
  getTempChunkDir,
  getConvertedDir,
  assembleChunks,
  toStorageUrl,
  resolveUrl
};
