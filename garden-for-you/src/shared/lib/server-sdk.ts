import "server-only";

import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "shared/config/auth";
import { createSdk } from "shared/lib/sdk";

export async function createServerSdk() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  return createSdk({ token });
}
