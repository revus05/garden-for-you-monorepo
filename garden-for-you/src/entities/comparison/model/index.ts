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

/**
 * Only the product ids live in the global store. They come straight from the
 * comparison cookie, so populating them costs zero network calls on every
 * route. The full product payload (title, price, specs) is fetched by the
 * `/compare` page alone, which is the only place that renders it.
 */
type InitialState = {
  ids: string[];
};

export const MAX_COMPARISON_COUNT = 6;

const initialState: InitialState = {
  ids: [],
};

const comparisonSlice = createSlice({
  name: "comparisonSlice",
  initialState,
  reducers: {
    addToComparison: (state, action: PayloadAction<string>) => {
      const exists = state.ids.includes(action.payload);
      if (!exists && state.ids.length < MAX_COMPARISON_COUNT) {
        state.ids.push(action.payload);
      }
    },
    removeFromComparison: (state, action: PayloadAction<string>) => {
      state.ids = state.ids.filter((id) => id !== action.payload);
    },
    clearComparison: (state) => {
      state.ids = [];
    },
  },
});

export const { addToComparison, removeFromComparison, clearComparison } =
  comparisonSlice.actions;
export default comparisonSlice.reducer;
