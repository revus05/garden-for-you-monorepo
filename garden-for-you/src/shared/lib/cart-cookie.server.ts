import "server-only";

import type { NextResponse } from "next/server";
import { CART_ID_COOKIE } from "shared/config/cart";

const CART_ID_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function isSecureCookie() {
  return process.env.NODE_ENV === "production";
}

export function setCartIdCookie(response: NextResponse, cartId: string) {
  response.cookies.set({
    name: CART_ID_COOKIE,
    value: cartId,
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: CART_ID_COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearCartIdCookie(response: NextResponse) {
  response.cookies.set({
    name: CART_ID_COOKIE,
    value: "",
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
