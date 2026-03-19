import type { AppDispatch } from "app/store";
import { updateCart } from "entities/cart";
import { removeCartItemRequest } from "entities/cart/api/cart";

export async function removeCartItem(
  dispatch: AppDispatch,
  lineItemId: string,
) {
  try {
    const updatedCart = await removeCartItemRequest(lineItemId);

    dispatch(updateCart(updatedCart));

    return updatedCart;
  } catch {
    return null;
  }
}
