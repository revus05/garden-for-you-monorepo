import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { CART_ID_COOKIE } from "@/shared/config/cart";
import { createServerSdk } from "@/shared/lib/server-sdk";

const PICKUP_ADDRESS = {
  first_name: "Самовывоз",
  last_name: ".",
  address_1: "г. Минск",
  city: "Минск",
  postal_code: "220000",
  country_code: "by",
};

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  if (!cartId) {
    return NextResponse.json(
      { message: "Корзина не найдена" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as {
    shippingOptionId: string;
    requiresAddress: boolean;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1?: string;
    city?: string;
    postalCode?: string;
  };

  try {
    const sdk = await createServerSdk();

    const shippingAddress = body.requiresAddress
      ? {
          first_name: body.firstName,
          last_name: body.lastName,
          phone: body.phone,
          address_1: body.address1 ?? "",
          city: body.city ?? "Минск",
          postal_code: body.postalCode ?? "",
          country_code: "by",
        }
      : {
          ...PICKUP_ADDRESS,
          first_name: body.firstName,
          last_name: body.lastName,
          phone: body.phone,
        };

    await sdk.store.cart.update(cartId, {
      email: body.email,
      shipping_address: shippingAddress,
    });

    const { cart: updatedCart } = await sdk.store.cart.addShippingMethod(
      cartId,
      { option_id: body.shippingOptionId },
    );

    return NextResponse.json({ cart: updatedCart });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка при сохранении доставки";
    return NextResponse.json({ message }, { status: 500 });
  }
}
