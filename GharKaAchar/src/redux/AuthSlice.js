import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../utils/axiosClient";
import { setCartFromBackend, clearCart } from "./CartSlice";

// ✅ Register
export const register = createAsyncThunk(
  "auth/register",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosClient.post("/user/register", credentials);
      
      // Auto sync cart after registration
      if (response.data?.user?.cart) {
        dispatch(setCartFromBackend(response.data.user.cart));
      }
      
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data || 
        "Registration failed"
      );
    }
  }
);

// ✅ Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosClient.post("/user/login", credentials);

      // Sync backend cart after successful login
      if (response.data?.user?.cart) {
        dispatch(setCartFromBackend(response.data.user.cart));
      }

      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data || 
        "Login failed"
      );
    }
  }
);

// ✅ Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await axiosClient.post("/user/logout");
      
      // Clear cart on logout
      dispatch(clearCart());
      
      return null;
    } catch (err) {
      // Even if logout API fails, clear local state
      dispatch(clearCart());
      return null;
    }
  }
);

// ✅ Check Authentication Status
export const check = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosClient.get("/user/check");

      // Sync backend cart on session restore
      if (response.data?.user?.cart) {
        dispatch(setCartFromBackend(response.data.user.cart));
      }

      return response.data;
    } catch (err) {
      // Clear cart if session is invalid
      dispatch(clearCart());
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data || 
        "Session expired"
      );
    }
  }
);

// ✅ Auth Slice with Fixed Loading States
const AuthSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false, // ✅ Start with false
    isAuthenticated: false,
    error: null,
    redirectPath: null
  },
  reducers: {
    // ✅ Clear errors manually
    clearError: (state) => {
      state.error = null;
    },
    // ✅ Set redirect path for post-login navigation
    setRedirectPath: (state, action) => {
      state.redirectPath = action.payload;
    },
    // ✅ Clear redirect path
    clearRedirectPath: (state) => {
      state.redirectPath = null;
    },
    // ✅ Manual logout (for expired tokens, etc.)
    forceLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.redirectPath = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // ✅ Register Cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false; // ✅ Essential
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false; // ✅ Critical fix
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // ✅ Login Cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false; // ✅ Essential
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false; // ✅ Critical fix
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // ✅ Logout Cases
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false; // ✅ Essential
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.redirectPath = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false; // ✅ Critical fix
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.redirectPath = null;
      })

      // ✅ Check Cases - MOST IMPORTANT
      .addCase(check.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(check.fulfilled, (state, action) => {
        state.loading = false; // ✅ Essential
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(check.rejected, (state, action) => {
        state.loading = false; // ✅ MOST CRITICAL FIX
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      });
  }
});

// ✅ Export actions
export const { 
  clearError, 
  setRedirectPath, 
  clearRedirectPath, 
  forceLogout 
} = AuthSlice.actions;

export default AuthSlice.reducer;
