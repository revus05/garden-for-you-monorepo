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
  // Флаг для предотвращения race condition: если пользователь уже взаимодействует с корзиной,
  // не вызываем syncCart, который может перезаписать его изменения
  const lastUpdateTimeRef = useRef<number>(0);
  const DEBOUNCE_SYNC_MS = 5000; // Минимум 5 секунд между синхронизациями

  useEffect(() => {
    if (isInitialized || isBootstrapInFlight.current) return;

    isBootstrapInFlight.current = true;

    void syncCart(dispatch).finally(() => {
      isBootstrapInFlight.current = false;
      lastUpdateTimeRef.current = Date.now();
    });
  }, [dispatch, isInitialized]);

  useEffect(() => {
    if (!user?.id || !cart?.id || cart.customer_id) return;

    const mergeKey = `${user.id}:${cart.id}`;

    if (lastMergeKeyRef.current === mergeKey) return;

    lastMergeKeyRef.current = mergeKey;

    // Не синхронизируем слишком часто, чтобы избежать race condition
    // с пользовательским взаимодействием (изменение количества товаров)
    const timeSinceLastUpdate = Date.now() - lastUpdateTimeRef.current;
    if (timeSinceLastUpdate < DEBOUNCE_SYNC_MS) {
      return;
    }

    void syncCart(dispatch)
      .catch(() => {
        lastMergeKeyRef.current = null;
      })
      .finally(() => {
        lastUpdateTimeRef.current = Date.now();
      });
  }, [cart?.customer_id, cart?.id, dispatch, user?.id]);

  return children;
}
