import type { AppDispatch } from "app/store";
import { updateCart } from "entities/cart";
import { addCartItemRequest } from "entities/cart/api/cart";

export async function addCartItem(
  dispatch: AppDispatch,
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
