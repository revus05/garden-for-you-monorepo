import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Cart } from "./types";

type InitialState = {
  cart: Cart | null;
  isInitialized: boolean;
};

const initialState: InitialState = {
  cart: null,
  isInitialized: false,
};

const cartSlice = createSlice({
  name: "cartSlice",
  initialState,
  reducers: {
    updateCart: (state, action: PayloadAction<Cart | null>) => {
      state.cart = action.payload;
      state.isInitialized = true;
    },
    resetCart: (state) => {
      state.cart = null;
      state.isInitialized = false;
    },
    setCartInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { updateCart, resetCart, setCartInitialized } = cartSlice.actions;
export default cartSlice.reducer;
