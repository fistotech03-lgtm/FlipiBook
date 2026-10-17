const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
 * Sanitize email for folder path
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
 * Resolve existing user folder (e.g. 'FLIPI0001' or sanitizedEmail)
 */
const resolveUserFolder = (emailOrUserId) => {
  const root = getStorageRoot();
  if (!emailOrUserId) return 'default_user';

  const raw = emailOrUserId.toString().trim();
  // 1. Direct match (e.g. FLIPI0001)
  if (fs.existsSync(path.join(root, raw))) {
    return raw;
  }

  // 2. Sanitized email match
  const sanitized = sanitizeEmail(raw);
  if (fs.existsSync(path.join(root, sanitized))) {
    return sanitized;
  }

  // 3. Check for any directory containing user identifier
  try {
    const dirs = fs.readdirSync(root);
    for (const d of dirs) {
      if (d.toLowerCase() === raw.toLowerCase() || d.toLowerCase() === sanitized.toLowerCase()) {
        return d;
      }
    }
  } catch (e) {}

  // Default to sanitized email or raw id
  return sanitized;
};

/**
 * Directory for user's 3D models (supports 3D_Models and 3D_Modals)
 */
const getUser3DDir = (emailOrUserId) => {
  const root = getStorageRoot();
  const userFolder = resolveUserFolder(emailOrUserId);
  const preferredDir = path.join(root, userFolder, '3D_Models');
  if (!fs.existsSync(preferredDir)) {
    fs.mkdirSync(preferredDir, { recursive: true });
  }
  return preferredDir;
};

/**
 * Directory for user's textures
 */
const getUserTextureDir = (emailOrUserId, materialName = '') => {
  const root = getStorageRoot();
  const userFolder = resolveUserFolder(emailOrUserId);
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
 * Directory for chunk uploads
 */
const getTempChunkDir = (uploadId) => {
  const root = getStorageRoot();
  const dir = path.join(root, '.temp_chunks', sanitizeFileName(uploadId, 'chunk'));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

/**
 * Directory for temporary converted models
 */
const getConvertedDir = () => {
  const root = getStorageRoot();
  const dir = path.join(root, '.converted_models');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

/**
 * Assemble chunks into final file
 */
const assembleChunks = async (tempDir, targetFilePath, totalChunks) => {
  const writeStream = fs.createWriteStream(targetFilePath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(tempDir, `chunk_${i}`);
    let retry = 0;
    while (!fs.existsSync(chunkPath) && retry < 15) {
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

  // Clean up temp directory
  try {
    const files = await fs.promises.readdir(tempDir);
    for (const f of files) {
      await fs.promises.unlink(path.join(tempDir, f)).catch(() => {});
    }
    await fs.promises.rmdir(tempDir).catch(() => {});
  } catch (cleanErr) {
    console.warn('[3D Storage] Chunk cleanup notice:', cleanErr.message);
  }
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
  getUser3DDir,
  getUserTextureDir,
  getTempChunkDir,
  getConvertedDir,
  assembleChunks,
  toStorageUrl,
  resolveUrl
};
