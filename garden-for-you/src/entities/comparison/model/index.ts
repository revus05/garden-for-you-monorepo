import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ProductSpec } from "@/entities/product";

export type ComparisonProduct = {
  id: string;
  handle: string;
  title: string;
  thumbnail: string | null;
  price: number | null;
  currency: string | null;
  specs: ProductSpec[];
};

type InitialState = {
  products: ComparisonProduct[];
};

export const MAX_COMPARISON_COUNT = 4;

const initialState: InitialState = {
  products: [],
};

const comparisonSlice = createSlice({
  name: "comparisonSlice",
  initialState,
  reducers: {
    addToComparison: (state, action: PayloadAction<ComparisonProduct>) => {
      const exists = state.products.some((p) => p.id === action.payload.id);
      if (!exists && state.products.length < MAX_COMPARISON_COUNT) {
        state.products.push(action.payload);
      }
    },
    removeFromComparison: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    clearComparison: (state) => {
      state.products = [];
    },
  },
});

export const { addToComparison, removeFromComparison, clearComparison } =
  comparisonSlice.actions;
export default comparisonSlice.reducer;
