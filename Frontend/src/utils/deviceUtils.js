/**
 * deviceUtils.js
 * Persistent client device identifier & platform detection.
 * Creates a unique first-party device ID for the browser/machine, independent of user accounts.
 */

const DEVICE_COOKIE_NAME = 'flipibook_device_id';
const TEN_YEARS_SECONDS = 10 * 365 * 24 * 60 * 60; // 315,360,000 seconds

/**
 * Detect a clean slug for the current browser engine to ensure different browsers
 * on the same machine (e.g. Chrome vs Safari) each receive distinct device identifiers.
 */
const detectBrowserSlug = () => {
  if (typeof navigator === 'undefined') return 'browser';
  const ua = navigator.userAgent.toLowerCase();
  if (/edg\//.test(ua)) return 'edge';
  if (/opr\/|opera/.test(ua)) return 'opera';
  if (/samsungbrowser/.test(ua)) return 'samsung';
  if (/chrome|crios/.test(ua)) return 'chrome';
  if (/firefox|fxios/.test(ua)) return 'firefox';
  if (/safari/.test(ua) && !/chrome|crios/.test(ua)) return 'safari';
  return 'device';
};

/**
 * Generate a cryptographically secure random device ID namespaced by browser slug
 */
const generateRandomDeviceId = () => {
  const slug = detectBrowserSlug();
  try {
    if (typeof crypto !== 'undefined') {
      if (typeof crypto.randomUUID === 'function') {
        const cleanUuid = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
        return `dev_${slug}_${cleanUuid}`;
      }
      if (typeof crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(10);
        crypto.getRandomValues(bytes);
        const hex = Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        return `dev_${slug}_${hex}`;
      }
    }
  } catch (e) {
    // Fallback if crypto throws
  }

  // Math.random fallback
  const randomStr = Math.random().toString(36).substring(2, 12) + Date.now().toString(36).slice(-6);
  return `dev_${slug}_${randomStr}`;
};

/**
 * Read cookie value by name
 */
const getCookie = (name) => {
  try {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(`${name}=`)) {
        return decodeURIComponent(trimmed.substring(name.length + 1));
      }
    }
  } catch (err) {
    console.warn(`Error reading ${name} cookie:`, err);
  }
  return null;
};

/**
 * Write persistent cookie
 */
const setCookie = (name, value, maxAgeSeconds = TEN_YEARS_SECONDS) => {
  try {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax;`;
  } catch (err) {
    console.warn(`Error writing ${name} cookie:`, err);
  }
};

/**
 * Retrieve or generate the persistent device identifier.
 * Ensures the deviceId is properly namespaced to the current browser engine.
 */
export const getOrCreateDeviceId = () => {
  const currentSlug = detectBrowserSlug();

  // 1. Try first-party cookie
  let deviceId = getCookie(DEVICE_COOKIE_NAME);
  if (deviceId && deviceId.startsWith(`dev_${currentSlug}_`)) {
    try {
      localStorage.setItem(DEVICE_COOKIE_NAME, deviceId);
    } catch {}
    return deviceId;
  }

  // 2. Try localStorage
  try {
    const stored = localStorage.getItem(DEVICE_COOKIE_NAME);
    if (stored && stored.startsWith(`dev_${currentSlug}_`)) {
      deviceId = stored;
      setCookie(DEVICE_COOKIE_NAME, deviceId);
      return deviceId;
    }
  } catch {}

  // 3. Generate fresh device ID specific to this browser
  deviceId = generateRandomDeviceId();
  setCookie(DEVICE_COOKIE_NAME, deviceId);
  try {
    localStorage.setItem(DEVICE_COOKIE_NAME, deviceId);
  } catch {}

  return deviceId;
};

/**
 * Detect client platform details (browser, operatingSystem, deviceType)
 */
export const getClientDeviceInfo = () => {
  const deviceId = getOrCreateDeviceId();
  let browser = 'Unknown Browser';
  let operatingSystem = 'Unknown OS';
  let deviceType = 'desktop';

  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase();

    // OS
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

    // Browser
    if (/edg\//.test(ua)) browser = 'Edge';
    else if (/opr\/|opera/.test(ua)) browser = 'Opera';
    else if (/samsungbrowser/.test(ua)) browser = 'Samsung Internet';
    else if (/chrome|crios/.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/.test(ua)) browser = 'Firefox';
    else if (/safari/.test(ua) && !/chrome|crios/.test(ua)) browser = 'Safari';

    // Device Type
    if (/mobile|iphone|ipod|android.*mobile/.test(ua)) {
      deviceType = 'mobile';
    } else if (/ipad|tablet|android(?!.*mobile)/.test(ua)) {
      deviceType = 'tablet';
    }
  }

  return {
    deviceId,
    browser,
    operatingSystem,
    deviceType,
  };
};

// In-memory variable cache only (NEVER saved to sessionStorage/localStorage/cookies)
let cachedNetworkInfo = null;

// Automatically purge any previous network info from browser storage
try {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('flipibook_net_info');
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('flipibook_net_info');
  }
} catch {}

/**
 * Validate that an IP string is strictly in standard IPv4 format (e.g. 106.198.42.15)
 */
export const isIPv4 = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
};

/**
 * Fetch client's real public routable IPv4 address and approximate location.
 * Strictly in-memory: never stored in browser storage (no cookies, no sessionStorage, no localStorage).
 */
export const getPublicClientIpAndLocation = async () => {
  // Check in-memory cache only
  if (cachedNetworkInfo && cachedNetworkInfo.ip && isIPv4(cachedNetworkInfo.ip)) {
    return cachedNetworkInfo;
  }

  let detectedIpv4 = null;
  let detectedLocation = '';

  // 1. Primary Provider: api4.ipify.org (strictly IPv4-only A-record endpoint)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://api4.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.ip && isIPv4(data.ip)) {
        detectedIpv4 = String(data.ip).trim();
      }
    }
  } catch {}

  // 2. Secondary Provider: ipv4.icanhazip.com (Cloudflare IPv4-only edge)
  if (!detectedIpv4) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('https://ipv4.icanhazip.com', { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text && isIPv4(text.trim())) {
          detectedIpv4 = text.trim();
        }
      }
    } catch {}
  }

  // 3. Fallback Provider: v4.ident.me (Strictly IPv4)
  if (!detectedIpv4) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('https://v4.ident.me', { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text && isIPv4(text.trim())) {
          detectedIpv4 = text.trim();
        }
      }
    } catch {}
  }

  // 4. Fallback Provider: ipapi.co (only if it returns an IPv4)
  if (!detectedIpv4) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data.ip && isIPv4(data.ip) && !data.error) {
          detectedIpv4 = String(data.ip).trim();
          if (data.city && (data.country_name || data.country)) {
            detectedLocation = `${data.city}, ${data.country_name || data.country}`;
          }
        }
      }
    } catch {}
  }

  // If IPv4 was resolved, query real location for this specific IPv4 address
  if (detectedIpv4) {
    if (!detectedLocation) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1500);
        const geoRes = await fetch(`https://ipapi.co/${detectedIpv4}/json/`, { signal: controller.signal });
        clearTimeout(timer);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.city && (geo.country_name || geo.country)) {
            detectedLocation = `${geo.city}, ${geo.country_name || geo.country}`;
          } else if (geo.city) {
            detectedLocation = geo.city;
          } else if (geo.country_name || geo.country) {
            detectedLocation = geo.country_name || geo.country;
          }
        }
      } catch {}
    }

    const info = {
      ip: detectedIpv4,
      location: detectedLocation || 'Unknown Location',
    };
    cachedNetworkInfo = info;
    return info;
  }

  return null;
};
