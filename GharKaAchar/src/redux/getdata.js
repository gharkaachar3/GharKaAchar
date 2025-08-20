import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../utils/axiosClient";

export const GetAllProduct = createAsyncThunk(
  "getdata/getallproduct",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/getdata/allproducts");
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to fetch products"
      );
    }
  }
);

export const getAllcategories = createAsyncThunk(
  "getdata/getallcategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/getdata/allcategories");
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to fetch products"
      );
    }
  }
);

export const GetAllbanners = createAsyncThunk(
  "getdata/getallbanners",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/getdata/allbanner");
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to fetch products"
      );
    }
  }
);

const GetDataSlice = createSlice({
  name: "getdata",
  initialState: {
    data: [],
    categories:[],
    banners:[],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetAllProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(GetAllProduct.rejected, (state, action) => {
        state.loading = false;
        state.data = [];
        state.error = action.payload || action.error?.message || "Failed to load";
      })
       .addCase(getAllcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getAllcategories.rejected, (state, action) => {
        state.loading = false;
        state.categories = [];
        state.error = action.payload || action.error?.message || "Failed to load";
      })
      .addCase(GetAllbanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllbanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(GetAllbanners.rejected, (state, action) => {
        state.loading = false;
        state.banners = [];
        state.error = action.payload || action.error?.message || "Failed to load";
      })
  }
});

export default GetDataSlice.reducer;

