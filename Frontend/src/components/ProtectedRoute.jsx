import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyToken } from '../utils/authUtils';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth();
  const location = useLocation();

  const isAuthorized = isAuthenticated || verifyToken();

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      openAuthModal('signin', location.pathname);
    }
  }, [isLoading, isAuthorized, location.pathname, openAuthModal]);

  if (isLoading) {
    return null;
  }

  return isAuthorized ? children : <Navigate to="/" replace />;
}
