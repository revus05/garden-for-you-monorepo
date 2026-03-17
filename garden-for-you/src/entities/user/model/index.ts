import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./types";

type InitialState = {
  user: User | null;
};

const initialState: InitialState = {
  user: null,
};

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    signOut: (state) => {
      state.user = null;
    },
  },
});

export const { signIn, signOut } = userSlice.actions;
export default userSlice.reducer;
