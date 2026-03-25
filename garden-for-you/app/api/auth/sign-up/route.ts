import { NextResponse } from "next/server";
import type { User } from "@/entities/user";
import { signUpSchema } from "@/features/user/sign-up/schema";
import { createSdk, sdk } from "@/shared/lib";
import { setAuthTokenCookie } from "@/shared/lib/auth-cookie.server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Некорректные данные." },
      { status: 400 },
    );
  }

  const { first_name, last_name, email, phone, password } = parsed.data;

  try {
    const registrationToken = await sdk.auth.register("customer", "emailpass", {
      email,
      password,
    });

    const regSdk = createSdk({ token: registrationToken });
    await regSdk.store.customer.create({
      first_name,
      last_name,
      email,
      phone,
    });

    const loginResult = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    });

    if (typeof loginResult !== "string") {
      return NextResponse.json(
        { message: "Требуются дополнительные шаги авторизации." },
        { status: 409 },
      );
    }

    const token = loginResult;
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
      {
        message:
          "Не удалось зарегистрироваться. Проверьте данные и попробуйте снова.",
      },
      { status: 400 },
    );
  }
}
