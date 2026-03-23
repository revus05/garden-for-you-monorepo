import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE } from "shared/config/auth";
import { createSdk } from "shared/lib/sdk";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ orders: [] });
  }

  try {
    const sdk = createSdk({ token });
    const { orders } = await sdk.store.order.list({
      fields: "+items,+items.title,+items.thumbnail,+items.quantity",
    });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
