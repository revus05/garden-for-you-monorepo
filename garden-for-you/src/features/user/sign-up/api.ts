import type { User } from "@/entities/user";
import type { SignUpValues } from "./model";

type SignUpResponse = {
  customer: User;
};

export async function signUpRequest(values: SignUpValues): Promise<User> {
  const response = await fetch("/api/auth/sign-up", {
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
    throw new Error(data?.message ?? "Не удалось зарегистрироваться.");
  }

  const data = (await response.json()) as SignUpResponse;
  return data.customer;
}
