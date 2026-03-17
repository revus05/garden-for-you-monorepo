"use client";

import { type AppStore, makeStore } from "app/store";
import type { User } from "entities/user";
import { type ReactNode, useRef } from "react";
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

  if (!storeRef.current) {
    storeRef.current = makeStore(preloadedUser);
  }

  return (
    <Provider store={storeRef.current}>
      {children}
      <Toaster position="top-right" />
    </Provider>
  );
}
