import type { AppDispatch } from "app/store";
import { updateCart } from "entities/cart";
import { updateCartItemQuantityRequest } from "entities/cart/api/cart";

export async function updateCartItemQuantity(
  dispatch: AppDispatch,
  lineItemId: string,
  quantity: number,
) {
  const updatedCart = await updateCartItemQuantityRequest(lineItemId, quantity);
  dispatch(updateCart(updatedCart));

  return updatedCart;
}
