"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type AppStore, makeStore } from "app/store";
import type { User } from "entities/user";
import { type ReactNode, useRef, useState } from "react";
import { Provider } from "react-redux";
import { Toaster } from "shared/ui/sonner";

export function Providers({
  children,
  preloadedUser,
}: {
  children: ReactNode;
  preloadedUser: User | null;
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
    storeRef.current = makeStore(preloadedUser);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={storeRef.current}>
        {children}
        <Toaster position="top-right" />
      </Provider>
    </QueryClientProvider>
  );
}
