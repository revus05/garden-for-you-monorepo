import type { StoreCustomer } from "@medusajs/types";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { Cart } from "@/entities/cart";
import { cartSlice } from "@/entities/cart";
import { comparisonSlice } from "@/entities/comparison";
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
  preloadedComparisonIds: string[] = [],
) => {
  return configureStore({
    reducer: mainReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    preloadedState: {
      userSlice: { user: preloadedUser },
      cartSlice: {
        cart: preloadedCart,
        // The server layout already resolved the cart from the cookie; a null
        // cart means "no cart yet", not "not loaded".
        isInitialized: true,
      },
      comparisonSlice: {
        ids: preloadedComparisonIds,
      },
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<typeof mainReducer>;
