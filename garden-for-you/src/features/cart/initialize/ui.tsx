"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { syncCart } from "@/features/cart";
import { useAppDispatch, useAppSelector } from "@/shared/lib";

/**
 * Keeps the cart attached to the signed-in customer.
 *
 * There is deliberately no bootstrap sync on mount: the root layout already
 * resolved the cart from the cookie, and an unconditional `GET /api/cart` would
 * hit `resolveServerCart({ createIfMissing: true })` and create a Medusa cart
 * for every anonymous visitor. The cart is now created lazily, on the first
 * `POST /api/cart/items`.
 */
export function CartInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const user = useAppSelector((state) => state.userSlice.user);
  const lastMergeKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // The cart exists but is not yet linked to the customer (just signed in) —
    // ask the server to transfer it. Guarded by a key so it runs once per pair.
    if (!user?.id || !cart?.id || cart.customer_id) return;

    const mergeKey = `${user.id}:${cart.id}`;

    if (lastMergeKeyRef.current === mergeKey) return;

    lastMergeKeyRef.current = mergeKey;

    void syncCart(dispatch).catch(() => {
      lastMergeKeyRef.current = null;
    });
  }, [cart?.customer_id, cart?.id, dispatch, user?.id]);

  return children;
}
