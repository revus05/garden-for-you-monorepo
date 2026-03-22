import type { ResetPasswordValues } from "./model";

type ResetPasswordResponse = {
  ok: boolean;
  message: string;
};

export async function resetPasswordRequest(values: ResetPasswordValues) {
  const response = await fetch("/api/auth/reset-password", {
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

    throw new Error(data?.message ?? "Не удалось обновить пароль");
  }

  return (await response.json()) as ResetPasswordResponse;
}
