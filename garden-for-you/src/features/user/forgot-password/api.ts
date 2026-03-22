import type { ForgotPasswordValues } from "./model";

type ForgotPasswordResponse = {
  ok: boolean;
  message: string;
};

export async function forgotPasswordRequest(values: ForgotPasswordValues) {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(data?.message ?? "Не удалось сбросить пароль");
  }

  return (await response.json()) as ForgotPasswordResponse;
}
