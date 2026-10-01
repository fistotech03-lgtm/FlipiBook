const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const CERTS_DIR = path.resolve(__dirname, '../../certs');
const PRIVATE_KEY_PATH = path.join(CERTS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(CERTS_DIR, 'public.pem');

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
