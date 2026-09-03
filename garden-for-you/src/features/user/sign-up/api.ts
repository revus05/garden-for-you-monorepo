import type { User } from "@/entities/user";
import type { SignUpValues } from "./model";

type SignUpResponse = {
  customer: User;
};

async function parseError(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  return new Error(data?.message ?? fallback);
}

export async function sendCodeRequest(phone: string): Promise<void> {
  const response = await fetch("/api/auth/send-code", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ phone }),
  });

  if (!response.ok) {
    throw await parseError(response, "Не удалось отправить код.");
  }
}

export async function verifyCodeRequest(
  phone: string,
  code: string,
): Promise<string> {
  const response = await fetch("/api/auth/verify-code", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ phone, code }),
  });

  if (!response.ok) {
    throw await parseError(response, "Неверный код.");
  }

  const data = (await response.json()) as { verification_token: string };
  return data.verification_token;
}

export async function signUpRequest(
  values: SignUpValues,
  verificationToken?: string,
): Promise<User> {
  const response = await fetch("/api/auth/sign-up", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(
      verificationToken
        ? { ...values, verification_token: verificationToken }
        : values,
    ),
  });

  if (!response.ok) {
    throw await parseError(response, "Не удалось зарегистрироваться.");
  }

  const data = (await response.json()) as SignUpResponse;
  return data.customer;
}
