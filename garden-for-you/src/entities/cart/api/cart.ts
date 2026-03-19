import type { Cart } from "entities/cart";
import { toast } from "sonner";

type CartResponse = {
  cart: Cart | null;
};

type CartApiErrorPayload = {
  message?: string;
};

export class CartRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartRequestError";
  }
}

async function parseErrorPayload(response: Response) {
  return (await response
    .json()
    .catch(() => null)) as CartApiErrorPayload | null;
}

async function parseCartResponse(
  response: Response,
  fallbackMessage: string,
): Promise<CartResponse> {
  if (!response.ok) {
    const data = await parseErrorPayload(response);
    const message = data?.message ?? fallbackMessage;

    toast.error(message);

    throw new CartRequestError(message);
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
    throw new CartRequestError("Корзина не была получена.");
  }

  return data.cart;
}

export async function resetCartRequest(): Promise<void> {
  const response = await fetch("/api/cart", {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await parseErrorPayload(response);
    const message = data?.message ?? "Не удалось очистить корзину.";

    toast.error(message);

    throw new CartRequestError(message);
  }
}

export async function addCartItemRequest(
  variantId: string,
  quantity = 1,
): Promise<Cart> {
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
    throw new CartRequestError("Корзина не была получена.");
  }

  return data.cart;
}

export async function updateCartItemQuantityRequest(
  lineItemId: string,
  quantity: number,
): Promise<Cart> {
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
    throw new CartRequestError("Корзина не была получена.");
  }

  return data.cart;
}

export async function removeCartItemRequest(
  lineItemId: string,
): Promise<Cart | null> {
  const response = await fetch(`/api/cart/items/${lineItemId}`, {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
  });

  const data = await parseCartResponse(
    response,
    "Не удалось удалить товар из корзины.",
  );

  if (!data.cart) {
    return null;
  }

  return data.cart;
}
