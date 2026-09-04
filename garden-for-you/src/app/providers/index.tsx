"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useRef, useState } from "react";
import { Provider } from "react-redux";
import { type AppStore, makeStore } from "@/app/store";
import type { Cart } from "@/entities/cart";
import type { User } from "@/entities/user";
import { CartInitializer } from "@/features/cart";
import { Toaster, TooltipProvider } from "@/shared/ui";

export function Providers({
  children,
  preloadedCart,
  preloadedUser,
  preloadedComparisonIds,
}: {
  children: ReactNode;
  preloadedCart: Cart | null;
  preloadedUser: User | null;
  preloadedComparisonIds: string[];
}) {
  const storeRef = useRef<AppStore>(null);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
          },
        },
      }),
  );

  if (!storeRef.current) {
    storeRef.current = makeStore(
      preloadedUser,
      preloadedCart,
      preloadedComparisonIds,
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={storeRef.current}>
        <TooltipProvider>
          <CartInitializer>{children}</CartInitializer>
          <Toaster position="top-right" />
        </TooltipProvider>
      </Provider>
    </QueryClientProvider>
  );
}
