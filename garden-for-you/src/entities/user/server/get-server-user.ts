import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/shared/config/auth";
import { createSdk } from "@/shared/lib";
import type { User } from "../model/types";

export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) return null;

  try {
    const sdk = createSdk({ token });
    const { customer } = await sdk.store.customer.retrieve();
    return customer;
  } catch {
    return null;
  }
}
