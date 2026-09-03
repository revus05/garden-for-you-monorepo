import { NextResponse } from "next/server";
import type { User } from "@/entities/user";
import { signInSchema } from "@/features/user/sign-in/schema";
import { createSdk, sdk } from "@/shared/lib";
import { setAuthTokenCookie } from "@/shared/lib/auth-cookie.server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signInSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Некорректные данные." },
      { status: 400 },
    );
  }

  try {
    const { token } = await sdk.client.fetch<{ token: string }>(
      "/store/auth/customer/login",
      {
        method: "POST",
        body: parsed.data,
      },
    );

    const authed = createSdk({ token });
    const { customer } = await authed.store.customer.retrieve();

    const response = NextResponse.json(
      { customer: customer as User },
      { status: 200 },
    );
    setAuthTokenCookie(response, token);
    return response;
  } catch {
    return NextResponse.json(
      { message: "Неверный email/телефон или пароль." },
      { status: 401 },
    );
  }
}
