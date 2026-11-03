/**
 * deviceParser.js
 * High-performance, lightweight parser for device, browser, OS, and location detection.
 * Avoids heavy external dependencies while accurately distinguishing client environments.
 */

const parseUserAgent = (uaString = '') => {
  const ua = String(uaString).toLowerCase();

  // 1. Detect Operating System
  let operatingSystem = 'Unknown OS';
  if (/windows nt 10\.0/.test(ua)) operatingSystem = 'Windows 11/10';
  else if (/windows nt 6\.3/.test(ua)) operatingSystem = 'Windows 8.1';
  else if (/windows nt 6\.1/.test(ua)) operatingSystem = 'Windows 7';
  else if (/windows/.test(ua)) operatingSystem = 'Windows';
  else if (/macintosh|mac os x/.test(ua)) {
    if (/iphone/.test(ua)) operatingSystem = 'iOS (iPhone)';
    else if (/ipad/.test(ua)) operatingSystem = 'iPadOS';
    else operatingSystem = 'macOS';
  } else if (/android/.test(ua)) operatingSystem = 'Android';
  else if (/cros/.test(ua)) operatingSystem = 'ChromeOS';
  else if (/linux/.test(ua)) operatingSystem = 'Linux';

  // 2. Detect Browser
  let browser = 'Unknown Browser';
  if (/edg\//.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/.test(ua)) browser = 'Opera';
  else if (/samsungbrowser/.test(ua)) browser = 'Samsung Internet';
  else if (/chrome|crios/.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/.test(ua)) browser = 'Firefox';
  else if (/safari/.test(ua) && !/chrome|crios/.test(ua)) browser = 'Safari';

  // 3. Detect Device Type
  let deviceType = 'desktop';
  if (/mobile|iphone|ipod|android.*mobile/.test(ua)) {
    deviceType = 'mobile';
  } else if (/ipad|tablet|android(?!.*mobile)/.test(ua)) {
    deviceType = 'tablet';
  }

  return {
    browser,
    operatingSystem,
    deviceType
  };
};

/**
 * Resolve approximate geographic location using Cloudflare/Proxy headers or IP detection
 */
const resolveLocation = (req, ipAddress = '') => {
  // Check client reported location
  if (req?.headers?.['x-client-location']) {
    return String(req.headers['x-client-location']).trim();
  }
  if (req?.body?.location) {
    return String(req.body.location).trim();
  }

  // Check Cloudflare or Reverse-Proxy Geo Headers
  const city =
    req?.headers?.['cf-ipcity'] ||
    req?.headers?.['x-client-city'] ||
    req?.headers?.['x-real-ip-city'] ||
    null;
  const country =
    req?.headers?.['cf-ipcountry'] ||
    req?.headers?.['x-client-country'] ||
    null;

  if (city && country) {
    return `${city}, ${country}`;
  }
  if (city) return city;
  if (country) return country;

  // Local loopback or private network
  const cleanIp = String(ipAddress).replace(/^::ffff:/, '').trim();
  const isLocal =
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp === 'localhost' ||
    cleanIp.startsWith('192.168.') ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('172.');

  if (isLocal) {
    return 'Local Network';
  }

  return 'Unknown Location';
};

module.exports = {
  parseUserAgent,
  resolveLocation
};

