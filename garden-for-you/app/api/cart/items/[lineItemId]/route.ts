import { NextResponse } from "next/server";
import { resolveServerCart } from "@/entities/cart/server/resolve-server-cart";
import { setCartIdCookie } from "@/shared/lib/cart-cookie.server";
import { createServerSdk } from "@/shared/lib/server-sdk";

type UpdateCartItemBody = {
  quantity?: number;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ lineItemId: string }> },
) {
  const body = (await request
    .json()
    .catch(() => null)) as UpdateCartItemBody | null;
  const quantity = body?.quantity;
  const { lineItemId } = await params;

  if (!lineItemId || !quantity || quantity < 1) {
    return NextResponse.json(
      { message: "Некорректные данные корзины." },
      { status: 400 },
    );
  }

  try {
    const cart = await resolveServerCart({ createIfMissing: false });

    if (!cart) {
      return NextResponse.json(
        { message: "Корзина не найдена." },
        { status: 404 },
      );
    }

    const sdk = await createServerSdk();
    const { cart: updatedCart } = await sdk.store.cart.updateLineItem(
      cart.id,
      lineItemId,
      { quantity },
    );

    const response = NextResponse.json({ cart: updatedCart }, { status: 200 });

    setCartIdCookie(response, updatedCart.id);

    return response;
  } catch (e) {
    const message = e instanceof Error ? e.message : null;

    console.error(message);

    if (message === "Some variant does not have the required inventory") {
      return NextResponse.json(
        { message: "На складе нет достаточно этого товара" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Не удалось обновить товар в корзине." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ lineItemId: string }> },
) {
  const { lineItemId } = await params;

  if (!lineItemId) {
    return NextResponse.json(
      { message: "Некорректные данные корзины." },
      { status: 400 },
    );
  }

  try {
    const cart = await resolveServerCart({ createIfMissing: false });

    if (!cart) {
      return NextResponse.json(
        { message: "Корзина не найдена." },
        { status: 404 },
      );
    }

    const sdk = await createServerSdk();
    const { parent } = await sdk.store.cart.deleteLineItem(cart.id, lineItemId);
    const response = NextResponse.json(
      { cart: parent ?? null },
      { status: 200 },
    );

    if (parent?.id) {
      setCartIdCookie(response, parent.id);
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "Не удалось удалить товар из корзины." },
      { status: 500 },
    );
  }
}
