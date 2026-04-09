import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE } from "@/shared/config/auth";
import { requireEnv } from "@/shared/lib";

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  requireEnv("NEXT_PUBLIC_MEDUSA_URL", process.env.NEXT_PUBLIC_MEDUSA_URL);
const MEDUSA_PUBLISHABLE_KEY = requireEnv(
  "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
);

async function buildHeaders(includeJsonContentType = false) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  return {
    accept: "application/json",
    ...(includeJsonContentType ? { "content-type": "application/json" } : {}),
    "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function GET() {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/site-config`, {
    method: "GET",
    headers: await buildHeaders(),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}
