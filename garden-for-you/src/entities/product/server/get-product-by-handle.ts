import "server-only";
import { requireEnv } from "@/shared/lib";
import type { Product, ProductSpec } from "../model/types";

const NEXT_PUBLIC_REGION_ID = requireEnv(
  "NEXT_PUBLIC_REGION_ID",
  process.env.NEXT_PUBLIC_REGION_ID,
);

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_URL || "";

const MEDUSA_PUBLISHABLE_KEY = requireEnv(
  "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
);

const STORE_HEADERS = {
  "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
};

async function fetchProductSpecs(
  productId: string,
  handle: string,
): Promise<ProductSpec[]> {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/products/${productId}/specs`,
      {
        headers: STORE_HEADERS,
        next: { tags: ["products", `product-handle-${handle}`] },
      },
    );

    if (!res.ok) return [];

    const data = (await res.json()) as { specs: ProductSpec[] };
    return data.specs ?? [];
  } catch {
    return [];
  }
}

export type ProductWithSpecs = {
  product: Product;
  specs: ProductSpec[];
};

export async function getProductByHandle(
  handle: string,
): Promise<ProductWithSpecs | null> {
  const params = new URLSearchParams({
    handle,
    region_id: NEXT_PUBLIC_REGION_ID,
    limit: "1",
    fields: "+variants.inventory_quantity",
  });

  const res = await fetch(
    `${MEDUSA_BACKEND_URL}/store/products?${params}`,
    {
      headers: STORE_HEADERS,
      next: { tags: ["products", `product-handle-${handle}`] },
    },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as { products: Product[] };
  const product = data.products?.[0] ?? null;
  if (!product) return null;

  const specs = await fetchProductSpecs(product.id, handle);

  return { product, specs };
}
