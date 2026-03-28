import "server-only";

import type { NextResponse } from "next/server";
import {
  COMPARISON_COOKIE,
  COMPARISON_COOKIE_MAX_AGE,
} from "@/shared/config/comparison";

function isSecureCookie() {
  return process.env.NODE_ENV === "production";
}

export function setComparisonCookie(
  response: NextResponse,
  productIds: string[],
) {
  response.cookies.set({
    name: COMPARISON_COOKIE,
    value: JSON.stringify(productIds),
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: COMPARISON_COOKIE_MAX_AGE,
  });
}

export function clearComparisonCookie(response: NextResponse) {
  response.cookies.set({
    name: COMPARISON_COOKIE,
    value: "",
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
