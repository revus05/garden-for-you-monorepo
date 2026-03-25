import type { Dispatch } from "@reduxjs/toolkit";
import { resetCart, resetCartRequest } from "@/entities/cart";

export async function refreshCart(dispatch: Dispatch) {
  try {
    await resetCartRequest();
    dispatch(resetCart());

    return true;
  } catch {
    return false;
  }
}
