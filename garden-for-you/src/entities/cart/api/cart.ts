import type { Cart } from "entities/cart";

type CartResponse = {
  cart: Cart | null;
};

async function parseCartResponse(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(data?.message ?? fallbackMessage);
  }

  return (await response.json()) as CartResponse;
}

export async function syncCartRequest(): Promise<Cart> {
  const response = await fetch("/api/cart", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const data = await parseCartResponse(
    response,
    "Не удалось синхронизировать корзину.",
  );

  if (!data.cart) {
    throw new Error("Корзина не была получена.");
  }

  return data.cart;
}

export async function resetCartRequest() {
  const response = await fetch("/api/cart", {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(data?.message ?? "Не удалось очистить корзину.");
  }
}

export async function addCartItemRequest(variantId: string, quantity = 1) {
  const response = await fetch("/api/cart/items", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ variantId, quantity }),
  });

  const data = await parseCartResponse(
    response,
    "Не удалось добавить товар в корзину.",
  );

  if (!data.cart) {
    throw new Error("Корзина не была получена.");
  }

  return data.cart;
}

export async function updateCartItemQuantityRequest(
  lineItemId: string,
  quantity: number,
) {
  const response = await fetch(`/api/cart/items/${lineItemId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ quantity }),
  });

  const data = await parseCartResponse(
    response,
    "Не удалось обновить количество товара.",
  );

  if (!data.cart) {
    throw new Error("Корзина не была получена.");
  }

  return data.cart;
}

export async function removeCartItemRequest(lineItemId: string) {
  const response = await fetch(`/api/cart/items/${lineItemId}`, {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
  });

  const data = await parseCartResponse(
    response,
    "Не удалось удалить товар из корзины.",
  );

  return data.cart;
}
