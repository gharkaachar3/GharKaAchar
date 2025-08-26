import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../utils/axiosClient";
import { setCartFromBackend } from "./CartSlice";

// Register
export const register = createAsyncThunk(
  "user/register",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/register", credentials);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Registration failed");
    }
  }
);

// Login
export const login = createAsyncThunk(
  "user/login",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosClient.post("/user/login", credentials);

      // Backend cart sync after login
      if (response.data?.user?.cart) {
        dispatch(setCartFromBackend(response.data.user.cart));
      }

      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post("/user/logout");
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Logout failed");
    }
  }
);

// Check Auth
export const check = createAsyncThunk(
  "user/check",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosClient.get("/user/check");

      // Backend cart sync on session restore
      if (response.data?.user?.cart) {
        dispatch(setCartFromBackend(response.data.user.cart));
      }

      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Check failed");
    }
  }
);

// Slice
const AuthSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    isAuthenticated: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // Check
      .addCase(check.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(check.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(check.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      });
  }
});

export default AuthSlice.reducer;
