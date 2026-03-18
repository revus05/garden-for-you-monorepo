import type { AppDispatch } from "app/store";
import { resetCart } from "entities/cart";
import { resetCartRequest } from "entities/cart/api/cart";

export async function refreshCart(dispatch: AppDispatch) {
  await resetCartRequest();
  dispatch(resetCart());
}
