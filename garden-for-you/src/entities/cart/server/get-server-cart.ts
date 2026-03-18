import type { Cart } from "entities/cart";
import { resolveServerCart } from "./resolve-server-cart";

export async function getServerCart(): Promise<Cart | null> {
  try {
    return await resolveServerCart({ createIfMissing: false });
  } catch {
    return null;
  }
}
