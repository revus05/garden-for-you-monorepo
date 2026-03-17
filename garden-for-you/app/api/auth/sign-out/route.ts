import { NextResponse } from "next/server";
import { clearAuthTokenCookie } from "shared/lib/auth-cookie.server";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  clearAuthTokenCookie(response);
  return response;
}
