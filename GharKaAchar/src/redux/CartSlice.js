import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Backend sync thunk
export const syncCartAPI = createAsyncThunk(
  "cart/syncCartAPI",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const cartArray = state.cart.cart;

      const res = await axios.post(
        "http://localhost:3000/cart/add",
        { cart: cartArray },
        { withCredentials: true }
      );

      console.log("✅ Cart synced:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ Cart sync failed", err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  cart: [],
  sampleProducts: [
      {
        id: 1,
        name: "Sweet Pickles",
        price: 249,
        description: "Traditional sweet pickles with a perfect balance of flavors",
        image:
          "https://www.jhajistore.com/cdn/shop/files/6_0db5b18c-a729-4a12-8f33-414be086ce24_500x.jpg?v=1703232511",
        category: "Pickles",
        weight: "500g"
      },
      {
        id: 2,
        name: "Mixed Pickles",
        price: 299,
        description: "Assorted vegetables pickled in authentic spices",
        image:
          "https://www.jhajistore.com/cdn/shop/files/Mixed_Pickles_500x.jpg?v=1703229599",
        category: "Pickles",
        weight: "500g"
      },
      {
        id: 3,
        name: "Spicy Pickles",
        price: 279,
        description: "Hot and fiery pickles for spice lovers",
        image:
          "https://www.jhajistore.com/cdn/shop/files/Spicy_Pickles_6c9a4ad3-a0a9-4f42-a8de-02bbb88a9297_500x.jpg?v=1703230259",
        category: "Pickles",
        weight: "400g"
      },
      {
        id: 4,
        name: "Mango Pickles",
        price: 229,
        description: "Traditional raw mango pickle with authentic taste",
        image:
          "https://www.jhajistore.com/cdn/shop/files/Mango_Pickles_500x.jpg?v=1703229599",
        category: "Pickles",
        weight: "300g"
      },
      {
        id: 5,
        name: "Bihari Pickles",
        price: 349,
        description: "Specialty pickles from Bihar with unique flavors",
        image:
          "https://www.jhajistore.com/cdn/shop/files/Bihari_Pickles_67611979-c95d-4074-a2c1-0c11c4cb3378_500x.jpg?v=1703232512",
        category: "Specialty",
        weight: "500g"
      },
      {
        id: 6,
        name: "Kheer Mixes",
        price: 199,
        description: "Ready-to-make traditional Indian dessert mixes",
        image:
          "https://www.jhajistore.com/cdn/shop/files/Sweet_Category_Feature_Image_500x.jpg?v=1726681863",
        category: "Desserts",
        weight: "250g"
      }
    ],
    recommendedProducts: [
      {
        id: 7,
        name: "Punjabi Mango Chutney",
        price: 199,
        description: "Sweet and tangy mango chutney",
        image: "https://www.jhajistore.com/cdn/shop/files/mango-chutney.jpg",
        category: "Chutneys",
        weight: "300g"
      },
      {
        id: 8,
        name: "Garlic Pickle",
        price: 229,
        description: "Spicy garlic pickle with mustard oil",
        image: "https://www.jhajistore.com/cdn/shop/files/garlic-pickle.jpg",
        category: "Pickles",
        weight: "250g"
      },
      {
        id: 9,
        name: "Masala Papad",
        price: 99,
        description: "Assorted flavored papads",
        image: "https://www.jhajistore.com/cdn/shop/files/masala-papad.jpg",
        category: "Snacks",
        weight: "200g"
      },
      {
        id: 10,
        name: "Instant Kheer Mix",
        price: 149,
        description: "Ready-to-make dessert mix",
        image: "https://www.jhajistore.com/cdn/shop/files/kheer-mix.jpg",
        category: "Desserts",
        weight: "200g"
      },
      {
        id: 11,
        name: "Mixed Fruit Jam",
        price: 179,
        description: "Homestyle fruit jam",
        image: "https://www.jhajistore.com/cdn/shop/files/fruit-jam.jpg",
        category: "Spreads",
        weight: "400g"
      }
    ]
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartFromBackend: (state, action) => {
      state.cart = action.payload || [];
    },
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.cart.find((i) => i.id === item.id);
      if (existing) {
        existing.qty = (existing.qty || 1) + (item.qty || 1);
      } else {
        state.cart.push({ ...item, qty: item.qty || 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((i) => i.id !== action.payload);
    },
    updateQty: (state, action) => {
      const { id, qty } = action.payload;
      const target = state.cart.find((i) => i.id === id);
      if (target && qty > 0) target.qty = qty;
    },
    clearCart: (state) => {
      state.cart = [];
    }
  }
});

export const {
  setCartFromBackend,
  addToCart,
  removeFromCart,
  updateQty,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;

