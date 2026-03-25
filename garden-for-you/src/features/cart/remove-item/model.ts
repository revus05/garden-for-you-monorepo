import type { Dispatch } from "@reduxjs/toolkit";
import { removeCartItemRequest, updateCart } from "@/entities/cart";

export async function removeCartItem(dispatch: Dispatch, lineItemId: string) {
  try {
    const updatedCart = await removeCartItemRequest(lineItemId);

    dispatch(updateCart(updatedCart));

    return updatedCart;
  } catch {
    return null;
  }
}
