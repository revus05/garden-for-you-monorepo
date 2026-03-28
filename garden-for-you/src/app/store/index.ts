import type { StoreCustomer } from "@medusajs/types";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { Cart } from "@/entities/cart";
import { cartSlice } from "@/entities/cart";
import { comparisonSlice } from "@/entities/comparison";
import type { ComparisonProduct } from "@/entities/comparison";
import { userSlice } from "@/entities/user";

const rootReducer = {
  userSlice,
  cartSlice,
  comparisonSlice,
};

const mainReducer = combineReducers(rootReducer);

export const makeStore = (
  preloadedUser: StoreCustomer | null,
  preloadedCart: Cart | null,
  preloadedComparison: ComparisonProduct[] = [],
) => {
  return configureStore({
    reducer: mainReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    preloadedState: {
      userSlice: { user: preloadedUser },
      cartSlice: {
        cart: preloadedCart,
        isInitialized: preloadedCart !== null,
      },
      comparisonSlice: {
        products: preloadedComparison,
      },
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<typeof mainReducer>;
