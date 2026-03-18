import { resolveServerCart } from "entities/cart/server/resolve-server-cart";
import { NextResponse } from "next/server";
import {
  clearCartIdCookie,
  setCartIdCookie,
} from "shared/lib/cart-cookie.server";

export async function GET() {
  try {
    const cart = await resolveServerCart();

    if (!cart) {
      return NextResponse.json(
        { message: "Не удалось получить корзину." },
        { status: 500 },
      );
    }

    const response = NextResponse.json({ cart }, { status: 200 });

    setCartIdCookie(response, cart.id);

    return response;
  } catch {
    return NextResponse.json(
      { message: "Не удалось получить корзину." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  clearCartIdCookie(response);

  return response;
}
