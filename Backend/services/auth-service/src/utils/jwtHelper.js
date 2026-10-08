const fs = require('fs');
const path = require('path');
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

// 3. Cluster-wide Shared Secret for multi-replica consistency
// When RSA keys are not explicitly supplied, all replicas seamlessly share this cluster secret
const SHARED_SECRET = process.env.JWT_SECRET || process.env.MONGO_URI || 'flipibook_secure_cluster_secret_key_2026';
const useRSA = !!(privateKey && publicKey);

const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

/**
 * Sign Access Token (1 hour)
 */
const generateToken = (payload) => {
  if (useRSA) {
    return jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
  }
  return jwt.sign(payload, SHARED_SECRET, {
    algorithm: 'HS256',
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });
};

/**
 * Sign Refresh Token (7 days)
 */
const generateRefreshToken = (payload) => {
  if (useRSA) {
    return jwt.sign({ ...payload, type: 'refresh' }, privateKey, {
      algorithm: 'RS256',
      expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });
  }
  return jwt.sign({ ...payload, type: 'refresh' }, SHARED_SECRET, {
    algorithm: 'HS256',
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
};

/**
 * Verify token across all backend replicas consistently
 */
const verifyToken = (token) => {
  if (!token) return null;

  // Try RSA (RS256) first if public key is available
  if (publicKey) {
    try {
      return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    } catch {
      // Fallback to shared secret below if token was signed with HS256
    }
  }

  // Try Shared Secret (HS256)
  try {
    return jwt.verify(token, SHARED_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
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
