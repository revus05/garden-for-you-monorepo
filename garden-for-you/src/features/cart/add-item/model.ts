import type { Dispatch } from "@reduxjs/toolkit";
import { addCartItemRequest, updateCart } from "@/entities/cart";

export async function addCartItem(
  dispatch: Dispatch,
  variantId: string,
  quantity = 1,
) {
  try {
    const updatedCart = await addCartItemRequest(variantId, quantity);

    dispatch(updateCart(updatedCart));

    return updatedCart;
  } catch {
    return null;
  }
}
