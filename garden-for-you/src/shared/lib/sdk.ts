import Medusa from "@medusajs/js-sdk";
import { AUTH_TOKEN_COOKIE } from "shared/config/auth";

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

const MEDUSA_URL = requiredEnv(
  "NEXT_PUBLIC_MEDUSA_URL",
  process.env.NEXT_PUBLIC_MEDUSA_URL,
);
const MEDUSA_PUBLISHABLE_KEY = requiredEnv(
  "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
);

export function createSdk({ token }: { token?: string } = {}) {
  return new Medusa({
    baseUrl: MEDUSA_URL,
    publishableKey: MEDUSA_PUBLISHABLE_KEY,
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
