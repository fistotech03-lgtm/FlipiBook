/**
 * authUtils.js
 *
 * Secure cookie-based authentication utilities.
 * JWT tokens and user IDs are stored in HttpOnly cookies managed exclusively by the backend.
 * Zero tokens, zero credentials, and zero sensitive keys are stored in localStorage.
 */

/**
 * Check if the browser currently has an active session cookie indicator.
 * This runs synchronously in O(1) time without extra network roundtrips.
 */
export const verifyToken = () => {
  try {
    const hasCookie = document.cookie
      .split(';')
      .some((item) => item.trim().startsWith('flipibook_logged_in=true'));

    return hasCookie;
  } catch {
    return false;
  }
};

/**
 * Clear client-side session state and non-sensitive cache.
 */
export const clearSession = () => {
  try {
    // Clear the client-readable cookie indicator
    document.cookie = 'flipibook_logged_in=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;';
    // Clear residual profile cache
    localStorage.removeItem('user');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
  } catch (err) {
    console.warn('Session clear error:', err);
  }
};

/**
 * Parse and normalize authentication error messages from backend responses
 */
export const getAuthErrorMessage = (err, fallbackMessage = 'An unexpected error occurred') => {
  if (!err) return fallbackMessage;

  // 1. Check if backend returned structured error message
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  // 2. Check if backend returned errors array
  if (err.response?.data?.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
    return err.response.data.errors[0].msg || err.response.data.errors[0].message || fallbackMessage;
  }

  // 3. HTTP status code specific fallbacks
  const status = err.response?.status;
  if (status === 400) {
    return err.response?.data?.message || 'Invalid request. Please check your input.';
  }
  if (status === 401) {
    return err.response?.data?.message || 'Authentication required or session expired. Please sign in.';
  }
  if (status === 403) {
    return err.response?.data?.message || 'Access denied. You do not have permission.';
  }
  if (status === 502 || status === 503 || status === 504) {
    return 'Authentication service is temporarily unavailable. Please try again in a moment.';
  }
  if (status >= 500) {
    return err.response?.data?.message || 'Internal server error. Please try again later.';
  }

  // 4. Network or connection errors
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || err.code === 'ECONNABORTED') {
    return 'Unable to connect to server. Please check your internet connection.';
  }

  // 5. Fallback to error message string
  if (err.message && typeof err.message === 'string' && !err.message.includes('object Object')) {
    return err.message;
  }

  return fallbackMessage;
};
