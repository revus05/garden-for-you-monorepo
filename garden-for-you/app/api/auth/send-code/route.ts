import { NextResponse } from "next/server";
import { z } from "zod";
import { phoneSchema } from "@/shared/model/phone-schema";
import { sdk } from "@/shared/lib";

const bodySchema = z.object({ phone: phoneSchema });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Некорректный номер телефона." },
      { status: 400 },
    );
  }

  try {
    const result = await sdk.client.fetch<{ sent: boolean }>(
      "/store/auth/customer/send-code",
      {
        method: "POST",
        body: { phone: parsed.data.phone },
      },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? (error as { status?: number }).status ?? 500
        : 500;
    const message =
      error instanceof Error ? error.message : "Не удалось отправить код.";

    return NextResponse.json({ message }, { status });
  }
}
