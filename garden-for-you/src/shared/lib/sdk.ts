import Medusa from "@medusajs/js-sdk";
import { AUTH_TOKEN_COOKIE } from "@/shared/config/auth";
import { publicEnv, resolveMedusaBaseUrl } from "@/shared/config/env";

export function createSdk({ token }: { token?: string } = {}) {
  return new Medusa({
    baseUrl: resolveMedusaBaseUrl(),
    publishableKey: publicEnv.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    debug: process.env.NODE_ENV === "development",
    globalHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
    auth: {
      type: "jwt",
      jwtTokenStorageMethod: "nostore",
      jwtTokenStorageKey: AUTH_TOKEN_COOKIE,
    },
  });
}

export const sdk = createSdk();
