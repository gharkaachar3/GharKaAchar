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
        e?.response?.data?.message || e?.message || "Failed to fetch categories"
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
        e?.response?.data?.message || e?.message || "Failed to fetch banners"
      );
    }
  }
);

export const GetAlladmins = createAsyncThunk(
  "getdata/getallusers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/getdata/alladmins");
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to fetch admins"
      );
    }
  }
);

export const getAllOrder = createAsyncThunk(
  "getdata/getallorders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/getdata/allorders");
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to fetch admins"
      );
    }
  }
);

// New function that calls all GET functions
export const fetchAllData = createAsyncThunk(
  "getdata/fetchAllData",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Dispatch all the individual fetch actions
      const results = await Promise.allSettled([
        dispatch(GetAllProduct()).unwrap(),
        dispatch(getAllcategories()).unwrap(),
        dispatch(GetAllbanners()).unwrap(),
        dispatch(GetAlladmins()).unwrap(),
      ]);

      // Check if any failed
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        // If some failed, return info about what succeeded/failed
        const successCount = results.length - failures.length;
        return {
          success: true,
          message: `${successCount}/${results.length} data sources loaded successfully`,
          failures: failures.map(f => f.reason)
        };
      }
      
      return {
        success: true,
        message: "All data loaded successfully"
      };
    } catch (error) {
      return rejectWithValue("Failed to fetch all data");
    }
  }
);

const GetDataSlice = createSlice({
  name: "getdata",
  initialState: {
    data: [],
    categories: [],
    banners: [],
    admins: [],
    loading: false,
    error: null,
    orders:[],
    fetchAllStatus: null // Track the status of fetchAllData
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearFetchAllStatus: (state) => {
      state.fetchAllStatus = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // GetAllProduct cases
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
        state.error = action.payload || action.error?.message || "Failed to load products";
      })

      // getAllcategories cases
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
        state.error = action.payload || action.error?.message || "Failed to load categories";
      })

      // GetAllbanners cases  
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
        state.error = action.payload || action.error?.message || "Failed to load banners";
      })

      // GetAlladmins cases
      .addCase(GetAlladmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAlladmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload;
      })
      .addCase(GetAlladmins.rejected, (state, action) => {
        state.loading = false;
        state.admins = [];
        state.error = action.payload || action.error?.message || "Failed to load admins";
      })

      // fetchAllData cases
      .addCase(fetchAllData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fetchAllStatus = "loading";
      })
      .addCase(fetchAllData.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchAllStatus = "success";
      })
      .addCase(fetchAllData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch all data";
        state.fetchAllStatus = "failed";
      })
      // get all orders
        .addCase(getAllOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fetchAllStatus = "loading";
      })
      .addCase(getAllOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch all data";
        state.fetchAllStatus = "failed";
      });
  }
});

export const { clearError, clearFetchAllStatus } = GetDataSlice.actions;
export default GetDataSlice.reducer;
