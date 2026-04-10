import "server-only";
import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/shared/config/auth";
import { CART_ID_COOKIE } from "@/shared/config/cart";
import { requireEnv } from "@/shared/lib";
import { createServerSdk } from "@/shared/lib/server-sdk";
import type { Cart } from "../model/types";

const REGION_ID = requireEnv(
  "NEXT_PUBLIC_REGION_ID",
  process.env.NEXT_PUBLIC_REGION_ID,
);

export async function resolveServerCart(options?: {
  createIfMissing?: boolean;
}) {
  const { createIfMissing = true } = options ?? {};
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  const sdk = await createServerSdk();

  let cart: Cart | null = null;

  if (cartId) {
    try {
      const response = await sdk.store.cart.retrieve(cartId, {
        fields:
          "+items.variant.options.value,+items.variant.options.option.title",
      });
      cart = response.cart;
    } catch {
      cart = null;
    }
  }

  if (!cart && !createIfMissing) {
    return null;
  }

  if (!cart) {
    const response = await sdk.store.cart.create({ region_id: REGION_ID });
    cart = response.cart;
  }

  if (token && !cart.customer_id) {
    const response = await sdk.store.cart.transferCart(cart.id);
    cart = response.cart;
  }

  return cart;
}
