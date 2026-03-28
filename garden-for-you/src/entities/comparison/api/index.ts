export async function saveComparisonIdsRequest(ids: string[]): Promise<void> {
  await fetch("/api/comparison", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
    cache: "no-store",
  });
}
