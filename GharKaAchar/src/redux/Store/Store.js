import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { syncCartAPI } from "../CartSlice";
import authReducer from "../AuthSlice";
import getDataReducer from "../getdata";

const cartSyncMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action);

  const cartActions = [
    "cart/addToCart",
    "cart/removeFromCart",
    "cart/updateQty",
    "cart/clearCart"
  ];

  if (cartActions.includes(action.type)) {
    console.log("🛒 Cart changed, syncing to backend...");
    storeAPI.dispatch(syncCartAPI());
  }

  return result;
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    getdata: getDataReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartSyncMiddleware)
});
