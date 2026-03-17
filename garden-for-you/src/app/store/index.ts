import type { StoreCustomer } from "@medusajs/types";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { userSlice } from "entities/user";

const rootReducer = {
  userSlice,
};

const mainReducer = combineReducers(rootReducer);

export const makeStore = (preloadedUser: StoreCustomer | null) => {
  return configureStore({
    reducer: mainReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    preloadedState: { userSlice: { user: preloadedUser } },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<typeof mainReducer>;
