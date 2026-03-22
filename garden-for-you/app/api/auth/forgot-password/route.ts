import { forgotPasswordSchema } from "features/user/forgot-password/model";
import { NextResponse } from "next/server";
import { paths } from "shared/constants/navigation";
import { sdk } from "shared/lib/sdk";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Некорректные данные." },
      { status: 400 },
    );
  }

  try {
    const origin = new URL(request.url).origin;

    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: parsed.data.email,
      metadata: {
        reset_url: `${origin}${paths.resetPassword}`,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message:
          "Если аккаунт с таким email существует, мы отправили ссылку для сброса пароля.",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
