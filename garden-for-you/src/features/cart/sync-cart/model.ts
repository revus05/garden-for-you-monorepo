import type { AppDispatch } from "app/store";
import { setCartInitialized, updateCart } from "entities/cart";
import { syncCartRequest } from "entities/cart/api/cart";

export async function syncCart(dispatch: AppDispatch) {
  try {
    const cart = await syncCartRequest();

    dispatch(updateCart(cart));

    return cart;
  } catch (error) {
    dispatch(setCartInitialized(true));
    throw error;
  }
}
