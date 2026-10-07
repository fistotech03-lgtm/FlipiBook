/**
 * authUtils.js
 *
 * Secure cookie-based authentication utilities.
 * JWT tokens and user IDs are stored in HttpOnly cookies managed by the backend.
 * Zero credentials, zero user IDs, and zero tokens are stored in localStorage.
 */

/**
 * Check if the browser currently has an active session cookie.
 * This runs synchronously in O(1) time without extra network roundtrips.
 */
export const verifyToken = () => {
  try {
    // Check for the flipibook_logged_in cookie indicator set by backend
    const hasCookie = document.cookie
      .split(';')
      .some((item) => item.trim().startsWith('flipibook_logged_in=true'));

    return hasCookie;
  } catch {
    return false;
  }
};

/**
 * Clear client-side session state.
 */
export const clearSession = () => {
  try {
    // Clear the client-readable cookie indicator
    document.cookie = 'flipibook_logged_in=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    // Clear any residual storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  } catch (err) {
    console.warn('Error clearing session:', err);
  }
};

/**
 * Extract user-friendly error message from Axios / Network / Backend responses
 */
export const getErrorMessage = (err, fallbackMessage = 'An unexpected error occurred. Please try again.') => {
  if (!err) return fallbackMessage;

  // 1. Direct string passed as error
  if (typeof err === 'string') return err;

  // 2. Backend JSON API error message field (message or error)
  if (err.response?.data?.message && typeof err.response.data.message === 'string') {
    return err.response.data.message;
  }
  if (err.response?.data?.error && typeof err.response.data.error === 'string') {
    return err.response.data.error;
  }

  // 3. HTTP Status code specific handling
  const status = err.response?.status;
  if (status === 429) {
    return err.response?.data?.message || 'Too many requests. Please wait a few minutes before trying again.';
  }
  if (status === 409) {
    return err.response?.data?.message || 'An account with this email already exists. Please sign in.';
  }
  if (status === 404) {
    return err.response?.data?.message || 'Requested account or resource was not found.';
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

