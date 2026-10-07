import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';
import { useAuth } from '../store/hooks';

export { useAuth };

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return <>{children}</>;
};
