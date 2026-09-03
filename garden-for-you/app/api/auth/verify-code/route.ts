import { NextResponse } from "next/server";
import { z } from "zod";
import { phoneSchema } from "@/shared/model/phone-schema";
import { sdk } from "@/shared/lib";

const bodySchema = z.object({
  phone: phoneSchema,
  code: z.string().trim().min(1, "Введите код"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Некорректные данные." },
      { status: 400 },
    );
  }

  try {
    const result = await sdk.client.fetch<{ verification_token: string }>(
      "/store/auth/customer/verify-code",
      {
        method: "POST",
        body: { phone: parsed.data.phone, code: parsed.data.code },
      },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? (error as { status?: number }).status ?? 400
        : 400;
    const message =
      error instanceof Error ? error.message : "Неверный код.";

    return NextResponse.json({ message }, { status });
  }
}
