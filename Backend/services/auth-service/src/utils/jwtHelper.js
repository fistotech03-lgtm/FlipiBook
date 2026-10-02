const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const CERTS_DIR = path.resolve(__dirname, '../../certs');
const PRIVATE_KEY_PATH = path.join(CERTS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(CERTS_DIR, 'public.pem');

// Ensure CERTS_DIR exists
if (!fs.existsSync(CERTS_DIR)) {
  fs.mkdirSync(CERTS_DIR, { recursive: true });
}

// Auto-generate RSA key pair if missing and no env keys provided
if ((!process.env.RSA_PRIVATE_KEY || !process.env.RSA_PUBLIC_KEY) && (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH))) {
  console.log('[JWT] Generating RSA 2048 key pair in certs/ ...');
  const { privateKey: newPriv, publicKey: newPub } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  fs.writeFileSync(PRIVATE_KEY_PATH, newPriv);
  fs.writeFileSync(PUBLIC_KEY_PATH, newPub);
}

// Load RSA Keys (prefer file, fallback to environment variable)
const privateKey = process.env.RSA_PRIVATE_KEY || (fs.existsSync(PRIVATE_KEY_PATH) ? fs.readFileSync(PRIVATE_KEY_PATH, 'utf8') : null);
const publicKey = process.env.RSA_PUBLIC_KEY || (fs.existsSync(PUBLIC_KEY_PATH) ? fs.readFileSync(PUBLIC_KEY_PATH, 'utf8') : null);

if (!privateKey || !publicKey) {
  console.error('[JWT Error] RSA private or public key is missing in auth-service/certs/');
}

const JWT_EXPIRES_IN = '7d';

/**
 * Sign payload using RS256 with RSA private key
 */
const generateToken = (payload) => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Verify token using RS256 with RSA public key
 */
const verifyToken = (token) => {
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
  verifyToken
};
