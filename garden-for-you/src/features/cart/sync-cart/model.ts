import type { Dispatch } from "@reduxjs/toolkit";
import {
  setCartInitialized,
  syncCartRequest,
  updateCart,
} from "@/entities/cart";

export async function syncCart(dispatch: Dispatch) {
  try {
    const cart = await syncCartRequest();

    dispatch(updateCart(cart));

    return cart;
  } catch {
    dispatch(setCartInitialized(true));

    return null;
  }
}
