import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  verifyToken,
  getInitialUser,
  setClientUserCookie,
  clearSession,
} from "../../utils/authUtils";
import { prefetchMyFlipbooks } from "../../queryClient";

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

      const res = await axios.get(`${backendUrl}/api/auth/verify`, {
        withCredentials: true,
      });

      if (res.data?.success && res.data?.isAuthenticated) {
        const targetEmail = res.data.user?.emailId || res.data.user?.email;
        if (targetEmail) {
          prefetchMyFlipbooks(targetEmail);
        }
        return { isAuthenticated: true, user: res.data.user || null };
      }

      // Explicit unauthenticated response from server
      if (res.data && res.data.isAuthenticated === false) {
        clearSession();
      }
      return { isAuthenticated: false, user: null };
    } catch (err) {
      const isAuthFailure =
        err.response?.status === 401 || err.response?.status === 403;
      if (isAuthFailure) {
        clearSession();
      }
      return rejectWithValue({
        message: err.response?.data?.message || "Verification failed",
        isAuthFailure,
      });
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
    await axios.post(
      `${backendUrl}/api/auth/logout`,
      {},
      { withCredentials: true },
    );
  } catch (err) {
    console.warn("Logout request warning:", err);
  } finally {
    clearSession();
  }
  return null;
});

const initialUser = getInitialUser();
const initialIsAuth = verifyToken();

const initialState = {
  isAuthenticated: initialIsAuth,
  user: initialUser,
  // If user profile is already present from cookie, isLoading is false immediately (0ms wait)
  isLoading: initialIsAuth && !initialUser,
  isAuthModalOpen: false,
  authModalMode: "signin",
  authRedirectPath: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      if (typeof action.payload === 'function') {
        console.error("Redux setUser action received a function updater instead of plain object payload!");
        return;
      }
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        setClientUserCookie(action.payload);
      } else {
        clearSession();
      }
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    openAuthModal: (state, action) => {
      state.authModalMode = action.payload?.mode || "signin";
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
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isAuthModalOpen = false;
      state.authRedirectPath = null;
      clearSession();
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        // If user already loaded from cookie, perform re-verification invisibly in background
        if (!state.user) {
          state.isLoading = true;
        }
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.isLoading = false;
        if (action.payload.user) {
          setClientUserCookie(action.payload.user);
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        // Only invalidate if the backend explicitly rejected authentication (e.g. 401/403)
        // Never wipe session on temporary server lags or 500 startup buffering errors
        if (action.payload?.isAuthFailure) {
          state.isAuthenticated = false;
          state.user = null;
        }
        state.isLoading = false;
      })
      // logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state) => {
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
  logout,
} = authSlice.actions;

export default authSlice.reducer;
