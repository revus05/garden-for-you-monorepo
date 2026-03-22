import { resetPasswordSchema } from "features/user/reset-password/model";
import { NextResponse } from "next/server";
import { sdk } from "shared/lib/sdk";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Некорректные данные." },
      { status: 400 },
    );
  }

  try {
    await sdk.auth.updateProvider(
      "customer",
      "emailpass",
      {
        password: parsed.data.password,
      },
      parsed.data.token,
    );

    return NextResponse.json(
      { ok: true, message: "Пароль успешно обновлен. Теперь можно войти." },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Ссылка для сброса недействительна или устарела." },
      { status: 400 },
    );
  }
}
