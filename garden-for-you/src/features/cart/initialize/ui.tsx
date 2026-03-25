"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { syncCart } from "@/features/cart";
import { useAppDispatch, useAppSelector } from "@/shared/lib";

export function CartInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const isInitialized = useAppSelector(
    (state) => state.cartSlice.isInitialized,
  );
  const user = useAppSelector((state) => state.userSlice.user);
  const isBootstrapInFlight = useRef(false);
  const lastMergeKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (isInitialized || isBootstrapInFlight.current) return;

    isBootstrapInFlight.current = true;

    void syncCart(dispatch).finally(() => {
      isBootstrapInFlight.current = false;
    });
  }, [dispatch, isInitialized]);

  useEffect(() => {
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
