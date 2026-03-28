import "server-only";
import { requireEnv } from "@/shared/lib";
import { createServerSdk } from "@/shared/lib/server-sdk";
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

async function fetchProductSpecs(productId: string): Promise<ProductSpec[]> {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/products/${productId}/specs`,
      {
        headers: {
          "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
        },
        next: { revalidate: 60 },
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
  const serverSdk = await createServerSdk();

  const { products } = await serverSdk.store.product.list({
    handle,
    region_id: NEXT_PUBLIC_REGION_ID,
    limit: 1,
    fields: "+variants.inventory_quantity",
  });

  const product = products[0] ?? null;
  if (!product) return null;

  const specs = await fetchProductSpecs(product.id);

  return { product, specs };
}
