import type { ShippingOption, ShippingValues } from "./schema";

type ShippingResponse = {
  cart: unknown;
};

type ShippingOptionsResponse = {
  shipping_options: ShippingOption[];
};

export async function fetchShippingOptions(): Promise<ShippingOption[]> {
  const response = await fetch("/api/checkout/shipping-options", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      data?.message ?? "Не удалось загрузить способы доставки",
    );
  }

  const data = (await response.json()) as ShippingOptionsResponse;
  return data.shipping_options;
}

export async function submitShippingRequest(values: ShippingValues) {
  const response = await fetch("/api/checkout/shipping", {
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
    throw new Error(data?.message ?? "Не удалось сохранить данные доставки");
  }

  return (await response.json()) as ShippingResponse;
}
