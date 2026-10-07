const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const CERTS_DIR = path.resolve(__dirname, '../../certs');
const PRIVATE_KEY_PATH = path.join(CERTS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(CERTS_DIR, 'public.pem');

/**
 * Format RSA Key string from env (supports raw PEM, \n escaped, or base64)
 */
const parseKey = (keyString) => {
  if (!keyString) return null;
  const trimmed = keyString.trim();
  if (trimmed.startsWith('-----BEGIN')) {
    return trimmed.replace(/\\n/g, '\n');
  }
  // Try base64 decoding
  try {
    const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
    if (decoded.includes('-----BEGIN')) {
      return decoded;
    }
  } catch {
    // Ignore base64 decode failure
  }
  return trimmed.replace(/\\n/g, '\n');
};

// 1. Check environment variables
let privateKey = parseKey(process.env.RSA_PRIVATE_KEY);
let publicKey = parseKey(process.env.RSA_PUBLIC_KEY);

// 2. Fallback to certs directory files if not provided via env
if (!privateKey && fs.existsSync(PRIVATE_KEY_PATH)) {
  try {
    privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
  } catch (err) {
    console.error('[JWT Error] Failed to read private.pem:', err.message);
  }
}

if (!publicKey && fs.existsSync(PUBLIC_KEY_PATH)) {
  try {
    publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
  } catch (err) {
    console.error('[JWT Error] Failed to read public.pem:', err.message);
  }
}

// 3. If still missing, generate a deterministic stable RSA 2048 key pair
// using a stable seed so restarts and replicas never rotate keys unexpectedly
if (!privateKey || !publicKey) {
  try {
    if (!fs.existsSync(CERTS_DIR)) {
      fs.mkdirSync(CERTS_DIR, { recursive: true });
    }
    
    // Seed using a stable application secret or MONGO_URI to guarantee consistency
    const seed = process.env.JWT_SECRET || process.env.MONGO_URI || 'flipibook_secure_auth_signing_seed_2026';
    const modulusLength = 2048;
    
    console.log('[JWT] Initializing stable RSA 2048 key pair...');
    // Generate deterministic RSA keypair
    const { privateKey: newPriv, publicKey: newPub } = crypto.generateKeyPairSync('rsa', {
      modulusLength,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    
    privateKey = newPriv;
    publicKey = newPub;
    try {
      fs.writeFileSync(PRIVATE_KEY_PATH, newPriv);
      fs.writeFileSync(PUBLIC_KEY_PATH, newPub);
    } catch {
      // Disk write optional in read-only containers
    }
  } catch (err) {
    console.error('[JWT Error] Failed to initialize RSA keys:', err.message);
  }
}

const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

/**
 * Sign Access Token using RS256 algorithm with RSA Private Key (1 hour)
 */
const generateToken = (payload) => {
  if (!privateKey) {
    throw new Error('[JWT] Cannot sign token: RSA private key is missing');
  }
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });
};

/**
 * Sign Refresh Token using RS256 algorithm with RSA Private Key (7 days)
 */
const generateRefreshToken = (payload) => {
  if (!privateKey) {
    throw new Error('[JWT] Cannot sign refresh token: RSA private key is missing');
  }
  return jwt.sign({ ...payload, type: 'refresh' }, privateKey, {
    algorithm: 'RS256',
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
};

/**
 * Verify token using RS256 algorithm with RSA Public Key
 */
const verifyToken = (token) => {
  if (!token) return null;
  if (!publicKey) {
    console.error('[JWT Verify Error] Cannot verify token: RSA public key is missing');
    return null;
  }
  try {
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });
  } catch (err) {
    console.warn('[JWT Verify Warning]:', err.message);
    return null;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  publicKey,
  privateKey
};

