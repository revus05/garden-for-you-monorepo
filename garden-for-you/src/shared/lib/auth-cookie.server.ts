import "server-only";

import type { NextResponse } from "next/server";
import {
  AUTH_TOKEN_COOKIE,
  AUTH_TOKEN_COOKIE_MAX_AGE_SECONDS,
} from "@/shared/config/auth";

function isSecureCookie() {
  return process.env.NODE_ENV === "production";
}

export function setAuthTokenCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_TOKEN_COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearAuthTokenCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
