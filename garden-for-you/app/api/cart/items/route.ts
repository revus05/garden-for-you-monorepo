import { resolveServerCart } from "entities/cart/server/resolve-server-cart";
import { NextResponse } from "next/server";
import { setCartIdCookie } from "shared/lib/cart-cookie.server";
import { createServerSdk } from "shared/lib/server-sdk";

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
    const cart = await resolveServerCart();

    if (!cart) {
      return NextResponse.json(
        { message: "Не удалось получить корзину." },
        { status: 500 },
      );
    }

    const sdk = await createServerSdk();
    const { cart: updatedCart } = await sdk.store.cart.createLineItem(cart.id, {
      variant_id: variantId,
      quantity,
    });

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
