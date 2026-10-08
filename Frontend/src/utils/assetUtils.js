/**
 * Asset URL Utilities for FlipiBook
 * Resolves backend uploads and local asset URLs.
 */

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');

/**
 * Build the base URL for a flipbook's folder using the backend uploads directory.
 *
 * @param {string} sanitizedEmail  - email with @/. replaced by _
 * @param {string} folderName      - physical folder name
 * @param {string} flipbookName    - flipbook name
 * @returns {string}               - base URL ending with /
 */
export function getAssetBaseUrl(sanitizedEmail, folderName, flipbookName) {
  const cleanSeg = (s) => {
    if (!s || s === 'undefined' || s === 'null') return '';
    let decoded = s;
    try { decoded = decodeURIComponent(s); } catch (e) {}
    return decoded.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  };

  const email = cleanSeg(sanitizedEmail);
  const folder = cleanSeg(folderName);
  const book = cleanSeg(flipbookName);

  const segments = [email, 'My_Flipbooks', folder, book].filter(Boolean);
  const fullPath = segments.join('/');

  return BACKEND_URL ? `${BACKEND_URL}/uploads/${fullPath}/` : `/uploads/${fullPath}/`;
}

// Alias for seamless backward compatibility across migrated modules
export const getSupabaseBaseUrl = getAssetBaseUrl;

/**
 * Resolve an upload path to an accessible URL.
 *
 * @param {string} path - relative or absolute asset path
 * @returns {string}    - fully resolved URL
 */
export function resolveUploadsPath(path) {
  if (!path || typeof path !== 'string') return path;
  if (path.startsWith('blob:') || path.startsWith('data:')) return path;

  let cleanPath = path;

  // Auto-heal double URL concatenation
  const doubleUrlMatch = cleanPath.match(/^https?:\/\/[^/]+(https?:?\/?\/?.+)$/i);
  if (doubleUrlMatch) {
    let nested = doubleUrlMatch[1];
    if (!nested.startsWith('http://') && !nested.startsWith('https://')) {
      nested = nested.replace(/^https?:?\/?\/?/i, 'https://');
    }
    return nested;
  }

  // Strip duplicated backend origins
  if (BACKEND_URL && cleanPath.startsWith(`${BACKEND_URL}/`)) {
    return cleanPath;
  }

  // Already a full external URL
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // Route /temp_uploads to backend server
  if (cleanPath.startsWith('/temp_uploads') || cleanPath.startsWith('temp_uploads/')) {
    const slash = cleanPath.startsWith('/') ? '' : '/';
    return BACKEND_URL ? `${BACKEND_URL}${slash}${cleanPath}` : `${slash}${cleanPath}`;
  }

  // Handle /uploads path
  const isUpload = cleanPath.startsWith('/uploads') || cleanPath.startsWith('uploads/');
  if (isUpload) {
    const slash = cleanPath.startsWith('/') ? '' : '/';
    return BACKEND_URL ? `${BACKEND_URL}${slash}${cleanPath}` : `${slash}${cleanPath}`;
  }

  return cleanPath;
}

/**
 * Rewrites any relative upload paths in HTML to the backend URL if necessary.
 *
 * @param {string} html - HTML string
 * @returns {string}    - Processed HTML string
 */
export function rewriteHtmlUploads(html) {
  if (!html) return html;
  if (!BACKEND_URL) return html;

  const base = `${BACKEND_URL}/uploads/`;
  const DATA_URI_RE = /(data:[^;]+;base64,[A-Za-z0-9+/=\s]+)/g;
  const parts = html.split(DATA_URI_RE);

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 !== 0) continue;
    parts[i] = parts[i]
      .replace(/(src|href|xlink:href)=(['"])(\/uploads\/|uploads\/)/g, `$1=$2${base}`)
      .replace(/(url\(\s*['"]?)\/uploads\//g, `$1${base}`);
  }

  return parts.join('');
}

export const rewriteHtmlUploadsToSupabase = rewriteHtmlUploads;

export { BACKEND_URL };
