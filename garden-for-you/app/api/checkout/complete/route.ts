import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CART_ID_COOKIE } from "@/shared/config/cart";
import { createServerSdk } from "@/shared/lib/server-sdk";
import { clearCartIdCookie } from "@/shared/lib/cart-cookie.server";

export async function POST() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  if (!cartId) {
    return NextResponse.json(
      { message: "Корзина не найдена" },
      { status: 400 },
    );
  }

  try {
    const sdk = await createServerSdk();

    const { cart } = await sdk.store.cart.retrieve(cartId, {
      fields:
        "*payment_collection.payment_sessions,*payment_collection.payment_providers",
    });

    const { payment_providers } = await sdk.store.payment.listPaymentProviders(
      { region_id: cart.region_id ?? "" },
      { next: { tags: ["payment_providers"] } },
    );

    if (!payment_providers?.length) {
      return NextResponse.json(
        { message: "Нет доступных способов оплаты" },
        { status: 400 },
      );
    }

    await sdk.store.payment.initiatePaymentSession(cart, {
      provider_id: payment_providers[0].id,
    });

    const result = await sdk.store.cart.complete(cartId);

    if (result.type === "order") {
      const response = NextResponse.json({ order: result.order });
      clearCartIdCookie(response);
      return response;
    }

    return NextResponse.json(
      { message: "Не удалось создать заказ" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка при оформлении заказа";
    return NextResponse.json({ message }, { status: 500 });
  }
}
