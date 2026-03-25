import type { Dispatch } from "@reduxjs/toolkit";
import { updateCart, updateCartItemQuantityRequest } from "@/entities/cart";

export async function updateCartItemQuantity(
  dispatch: Dispatch,
  lineItemId: string,
  quantity: number,
) {
  try {
    const updatedCart = await updateCartItemQuantityRequest(
      lineItemId,
      quantity,
    );
    dispatch(updateCart(updatedCart));

    return updatedCart;
  } catch {
    return null;
  }
}
