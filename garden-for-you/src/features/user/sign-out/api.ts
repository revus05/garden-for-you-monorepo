export async function signOutRequest() {
  const response = await fetch("/api/auth/sign-out", { method: "POST" });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(data?.message ?? "Не удалось выйти.");
  }
}
