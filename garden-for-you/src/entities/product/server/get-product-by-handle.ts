import "server-only";
import { medusaFetch } from "@/shared/api/medusa-fetch";
import { CACHE_TAGS, productHandleTag } from "@/shared/cache";
import { publicEnv } from "@/shared/config/env";
import type { Product, ProductSpec } from "../model/types";

const NEXT_PUBLIC_REGION_ID = publicEnv.NEXT_PUBLIC_REGION_ID;

async function fetchProductSpecs(
  productId: string,
  handle: string,
): Promise<ProductSpec[]> {
  try {
    const res = await medusaFetch(`/store/products/${productId}/specs`, {
      next: { tags: [CACHE_TAGS.products, productHandleTag(handle)] },
    });

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
    fields: "+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,*variants.options",
  });

  const res = await medusaFetch("/store/products", {
    searchParams: params,
    next: { tags: [CACHE_TAGS.products, productHandleTag(handle)] },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { products: Product[] };
  const product = data.products?.[0] ?? null;
  if (!product) return null;

  const specs = await fetchProductSpecs(product.id, handle);

  return { product, specs };
}
