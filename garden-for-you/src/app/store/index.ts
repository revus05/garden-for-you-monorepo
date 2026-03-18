import type { StoreCustomer } from "@medusajs/types";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { Cart } from "entities/cart";
import { cartSlice } from "entities/cart";
import { userSlice } from "entities/user";

const rootReducer = {
  userSlice,
  cartSlice,
};

const mainReducer = combineReducers(rootReducer);

export const makeStore = (
  preloadedUser: StoreCustomer | null,
  preloadedCart: Cart | null,
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
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<typeof mainReducer>;
