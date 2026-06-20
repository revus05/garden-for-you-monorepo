import { NextResponse } from "next/server";
import { resolveServerCart } from "@/entities/cart/server/resolve-server-cart";
import {
  getCartIdCookie,
  setCartIdCookie,
} from "@/shared/lib/cart-cookie.server";
import { createServerSdk } from "@/shared/lib/server-sdk";

type AddCartItemBody = {
  variantId?: string;
  quantity?: number;
};

export async function POST(request: Request) {
  const body = (await request
    .json()
    .catch(() => null)) as AddCartItemBody | null;
  const variantId = body?.variantId?.trim();
  const quantity = body?.quantity ?? 1;

  if (!variantId || quantity < 1) {
    return NextResponse.json(
      { message: "Некорректные данные корзины." },
      { status: 400 },
    );
  }

  try {
    const sdk = await createServerSdk();
    const cartId = await getCartIdCookie();

    let updatedCart: Awaited<
      ReturnType<typeof sdk.store.cart.createLineItem>
    >["cart"] | null = null;

    // Fast path: add directly to the cart from the cookie, no extra retrieve.
    if (cartId) {
      try {
        ({ cart: updatedCart } = await sdk.store.cart.createLineItem(cartId, {
          variant_id: variantId,
          quantity,
        }));
      } catch {
        // Cart in cookie is gone/invalid — fall back to resolve+create below.
        updatedCart = null;
      }
    }

    if (!updatedCart) {
      const cart = await resolveServerCart();

      if (!cart) {
        return NextResponse.json(
          { message: "Не удалось получить корзину." },
          { status: 500 },
        );
      }

      ({ cart: updatedCart } = await sdk.store.cart.createLineItem(cart.id, {
        variant_id: variantId,
        quantity,
      }));
    }

    const response = NextResponse.json({ cart: updatedCart }, { status: 200 });

    setCartIdCookie(response, updatedCart.id);

    return response;
  } catch {
    return NextResponse.json(
      { message: "Не удалось добавить товар в корзину." },
      { status: 500 },
    );
  }
}
