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
    updateCartItemQuantityReducer: (
      state,
      action: PayloadAction<{ id: string; newQuantity: number }>,
    ) => {
      if (!state.cart) return;

      const { id, newQuantity } = action.payload;

      // Валидация: количество должно быть положительным целым числом
      if (!Number.isInteger(newQuantity) || newQuantity < 1) {
        console.warn(
          `[updateCartItemQuantityReducer] Invalid quantity: ${newQuantity}. Must be a positive integer.`,
        );
        return;
      }

      state.cart.items = state.cart.items?.map((item) =>
        item.id !== id ? item : { ...item, quantity: newQuantity },
      );
    },
  },
});

export const {
  updateCart,
  resetCart,
  setCartInitialized,
  updateCartItemQuantityReducer,
} = cartSlice.actions;
export default cartSlice.reducer;
