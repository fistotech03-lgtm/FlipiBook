const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

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
  } catch {}
  return trimmed.replace(/\\n/g, '\n');
};

const loadPublicKey = () => {
  let pub = parseKey(process.env.RSA_PUBLIC_KEY);

  if (!pub) {
    const possiblePaths = [
      path.resolve(__dirname, '../../auth-service/certs/public.pem'),
      path.resolve(__dirname, '../certs/public.pem'),
      path.resolve(process.cwd(), 'services/auth-service/certs/public.pem'),
      path.resolve(process.cwd(), 'certs/public.pem')
    ];

    for (const certPath of possiblePaths) {
      try {
        if (fs.existsSync(certPath)) {
          pub = fs.readFileSync(certPath, 'utf8');
          break;
        }
      } catch (err) {}
    }
  }

  return pub;
};

const publicKey = loadPublicKey();

const verifyToken = (token) => {
  if (!token) return null;
  const key = publicKey || loadPublicKey();
  if (!key) {
    console.error('[Payment Service] RSA Public Key not configured for token verification');
    return null;
  }

  try {
    return jwt.verify(token, key, { algorithms: ['RS256'] });
  } catch (err) {
    return null;
  }
};

module.exports = {
  verifyToken,
  loadPublicKey
};
