import React from 'react';
import { Navigate } from 'react-router-dom';
import { verifyToken } from '../utils/authUtils';

/**
 * ProtectedRoute
 *
 * If a valid token exists in localStorage → render the page directly.
 * If no token or token is expired   → redirect to /login.
 *
 * No network request is made; token expiry is checked locally using the JWT payload.
 */
export default function ProtectedRoute({ children }) {
  const isAuthenticated = verifyToken();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
