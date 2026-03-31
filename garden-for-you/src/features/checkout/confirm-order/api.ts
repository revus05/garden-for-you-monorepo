type Order = {
  id: string;
  display_id: number;
};

type CompleteResponse = {
  order: Order;
};

export async function completeOrderRequest() {
  const response = await fetch("/api/checkout/complete", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(data?.message ?? "Не удалось оформить заказ");
  }

  return (await response.json()) as CompleteResponse;
}
