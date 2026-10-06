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
