import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE } from "shared/config/auth";
import { requiredEnv } from "shared/lib/utils";

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  requiredEnv("NEXT_PUBLIC_MEDUSA_URL", process.env.NEXT_PUBLIC_MEDUSA_URL);
const MEDUSA_PUBLISHABLE_KEY = requiredEnv(
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  const response = await fetch(
    `${MEDUSA_BACKEND_URL}/store/store-reviews${qs ? `?${qs}` : ""}`,
    {
      method: "GET",
      headers: await buildHeaders(),
      cache: "no-store",
    },
  );

  const data = await response.json().catch(() => null);

  console.log(data, response);

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/store-reviews`, {
    method: "POST",
    headers: await buildHeaders(true),
    body,
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  console.log(data, response);

  return NextResponse.json(data, { status: response.status });
}
