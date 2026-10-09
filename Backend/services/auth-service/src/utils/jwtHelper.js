const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Format RSA Key string (supports raw PEM, \n escaped, or base64)
 */
const parseKey = (keyString) => {
  if (!keyString) return null;
  const trimmed = keyString.trim();
  if (trimmed.startsWith('-----BEGIN')) {
    return trimmed.replace(/\\n/g, '\n');
  }
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

/**
 * Load RSA Key from Environment or filesystem certs
 */
const loadKeys = () => {
  let priv = parseKey(process.env.RSA_PRIVATE_KEY);
  let pub = parseKey(process.env.RSA_PUBLIC_KEY);

  // If not provided in env, load from certs directory
  if (!priv || !pub) {
    const certsDir = path.resolve(__dirname, '../../certs');
    const privPath = path.join(certsDir, 'private.pem');
    const pubPath = path.join(certsDir, 'public.pem');

    try {
      if (fs.existsSync(privPath) && !priv) {
        priv = fs.readFileSync(privPath, 'utf8');
      }
      if (fs.existsSync(pubPath) && !pub) {
        pub = fs.readFileSync(pubPath, 'utf8');
      }
    } catch (err) {
      console.warn('[JWT Helper] Warning loading cert files:', err.message);
    }
  }

  // Fallback: Generate 2048-bit RSA key pair if none exist
  if (!priv || !pub) {
    console.warn('[JWT Helper] Generating ephemeral RSA 2048-bit key pair...');
    const { privateKey: genPriv, publicKey: genPub } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    priv = genPriv;
    pub = genPub;
  }

  return { privateKey: priv, publicKey: pub };
};

const { privateKey, publicKey } = loadKeys();

const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

/**
 * Sign Access Token using RS256 with Private Key (1 hour)
 */
const generateToken = (payload) => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });
};

/**
 * Sign Refresh Token using RS256 with Private Key (7 days)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign({ ...payload, type: 'refresh' }, privateKey, {
    algorithm: 'RS256',
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
};

/**
 * Verify token strictly using RS256 with Public Key
 */
const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
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
