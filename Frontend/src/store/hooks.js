import { useSelector, useDispatch } from 'react-redux';
import {
  openAuthModal,
  closeAuthModal,
  setAuthModalMode,
  setUser,
  setIsAuthenticated,
  checkAuth,
  logoutUser,
  logout,
} from './slices/authSlice';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    ...auth,
    checkAuth: () => dispatch(checkAuth()).unwrap(),
    logout: async () => {
      try {
        await dispatch(logoutUser());
      } catch (e) {
        console.warn('Logout warning:', e);
      } finally {
        dispatch(logout());
      }
    },
    openAuthModal: (mode = 'signin', redirectPath = null) =>
      dispatch(openAuthModal({ mode, redirectPath })),
    closeAuthModal: () => dispatch(closeAuthModal()),
    setAuthModalMode: (mode) => dispatch(setAuthModalMode(mode)),
    setUser: (user) => dispatch(setUser(user)),
    setIsAuthenticated: (status) => dispatch(setIsAuthenticated(status)),
  };
};
