import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { verifyToken, clearSession } from '../../utils/authUtils';

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const res = await axios.get(`${backendUrl}/api/auth/verify`, {
      withCredentials: true,
    });

    if (res.data?.success && res.data?.isAuthenticated) {
      return { isAuthenticated: true, user: res.data.user || null };
    }
    return { isAuthenticated: false, user: null };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Verification failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
  } catch (err) {
    console.warn('Logout request warning:', err);
  } finally {
    clearSession();
  }
  return null;
});

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  isAuthModalOpen: false,
  authModalMode: 'signin',
  authRedirectPath: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    openAuthModal: (state, action) => {
      state.authModalMode = action.payload?.mode || 'signin';
      state.authRedirectPath = action.payload?.redirectPath || null;
      state.isAuthModalOpen = true;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.authRedirectPath = null;
    },
    setAuthModalMode: (state, action) => {
      state.authModalMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.isLoading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.isLoading = false;
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const {
  setUser,
  setIsAuthenticated,
  openAuthModal,
  closeAuthModal,
  setAuthModalMode,
} = authSlice.actions;

export default authSlice.reducer;
