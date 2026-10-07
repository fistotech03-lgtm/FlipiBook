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

// 3. If still missing, generate and save persistent RSA 2048 key pair
if (!privateKey || !publicKey) {
  try {
    if (!fs.existsSync(CERTS_DIR)) {
      fs.mkdirSync(CERTS_DIR, { recursive: true });
    }
    console.log('[JWT] Generating RSA 2048 key pair in certs/ ...');
    const { privateKey: newPriv, publicKey: newPub } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    privateKey = newPriv;
    publicKey = newPub;
    fs.writeFileSync(PRIVATE_KEY_PATH, newPriv);
    fs.writeFileSync(PUBLIC_KEY_PATH, newPub);
  } catch (err) {
    console.error('[JWT Error] Failed to auto-generate RSA keys:', err.message);
  }
}

const JWT_EXPIRES_IN = '7d';

/**
 * Sign payload using RS256 algorithm with RSA Private Key
 */
const generateToken = (payload) => {
  if (!privateKey) {
    throw new Error('[JWT] Cannot sign token: RSA private key is missing');
  }
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Verify token using RS256 algorithm with RSA Public Key
 */
const verifyToken = (token) => {
  if (!token || !publicKey) return null;
  try {
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });
  } catch {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  publicKey,
  privateKey
};
