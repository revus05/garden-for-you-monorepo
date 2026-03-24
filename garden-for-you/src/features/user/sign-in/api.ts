import type { User } from "entities/user";
import type { SignInValues } from "./model";

type SignInResponse = {
  customer: User;
};

export async function signInRequest(values: SignInValues): Promise<User> {
  const response = await fetch("/api/auth/sign-in", {
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
    throw new Error(data?.message ?? "Не удалось войти.");
  }

  const data = (await response.json()) as SignInResponse;
  return data.customer;
}
