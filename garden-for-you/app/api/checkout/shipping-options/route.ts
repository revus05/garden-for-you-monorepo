import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CART_ID_COOKIE } from "@/shared/config/cart";
import { createServerSdk } from "@/shared/lib/server-sdk";

export async function GET(_request: NextRequest) {
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
    const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
      cart_id: cartId,
    });

    return NextResponse.json({
      shipping_options: (shipping_options ?? []).map((opt) => ({
        id: opt.id,
        name: opt.name,
        amount: opt.amount ?? 0,
        type_code: opt.type?.code ?? "",
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ошибка при получении способов доставки";
    return NextResponse.json({ message }, { status: 500 });
  }
}
