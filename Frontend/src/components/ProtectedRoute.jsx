import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyToken } from '../utils/authUtils';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const location = useLocation();

  // Synchronous cookie check or in-memory auth check
  const isAuthorized = isAuthenticated || verifyToken();

  useEffect(() => {
    if (!isAuthorized) {
      openAuthModal('signin', location.pathname);
    }
  }, [isAuthorized, location.pathname, openAuthModal]);

  return isAuthorized ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
}
