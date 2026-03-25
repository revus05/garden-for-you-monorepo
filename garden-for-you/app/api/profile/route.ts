import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE } from "@/shared/config/auth";
import { createSdk } from "@/shared/lib";

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { message: "Некорректные данные" },
      { status: 400 },
    );
  }

  try {
    const sdk = createSdk({ token });
    const { customer } = await sdk.store.customer.update({
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone || undefined,
    });
    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json(
      { message: "Ошибка при обновлении профиля" },
      { status: 500 },
    );
  }
}
