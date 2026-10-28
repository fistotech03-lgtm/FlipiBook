const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

/**
 * Format RSA Public Key string (supports raw PEM, \n escaped, or base64)
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
 * Load RSA Public Key from Environment or filesystem
 */
const loadPublicKey = () => {
  let pub = parseKey(process.env.RSA_PUBLIC_KEY);

  if (!pub) {
    const possiblePaths = [
      path.resolve(__dirname, '../../auth-service/certs/public.pem'),
      path.resolve(__dirname, '../certs/public.pem'),
      path.resolve(process.cwd(), 'services/auth-service/certs/public.pem'),
      path.resolve(process.cwd(), 'certs/public.pem'),
      path.resolve(__dirname, '../../../../certs/public.pem')
    ];

    for (const certPath of possiblePaths) {
      try {
        if (fs.existsSync(certPath)) {
          pub = fs.readFileSync(certPath, 'utf8');
          break;
        }
      } catch (err) {
        // Continue checking next path
      }
    }
  }

  return pub;
};

const publicKey = loadPublicKey();

/**
 * Verify token strictly using RS256 with Public Key (with HMAC fallback if configured)
 */
const verifyToken = (token) => {
  if (!token) return null;
  const key = publicKey || loadPublicKey();

  if (key) {
    try {
      return jwt.verify(token, key, { algorithms: ['RS256'] });
    } catch (err) {
      // Fall through to try HMAC if RS256 fails or secret is used
    }
  }

  const jwtSecret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || 'flipibook_secret_key_production_2026';
  if (jwtSecret) {
    try {
      return jwt.verify(token, jwtSecret);
    } catch (err) {
      return null;
    }
  }

  return null;
};

const generateToken = (payload, expiresIn = '7d') => {
  const jwtSecret = process.env.JWT_SECRET || 'flipibook_secret_key_production_2026';
  return jwt.sign(payload, jwtSecret, { expiresIn });
};

module.exports = {
  verifyToken,
  generateToken,
  loadPublicKey
};
