import "server-only";

import { unstable_cache } from "next/cache";
import { medusaFetch } from "@/shared/api/medusa-fetch";
import { CACHE_TAGS } from "@/shared/cache";
import { publicEnv } from "@/shared/config/env";
import { createSdk } from "@/shared/lib";
import type {
  ProductSpec,
  StoreProductVariantWithPrices,
} from "@/entities/product";
import type { ComparisonProduct } from "../model";
import { readComparisonIds } from "./read-comparison-ids";

const NEXT_PUBLIC_REGION_ID = publicEnv.NEXT_PUBLIC_REGION_ID;

async function fetchProductSpecs(productId: string): Promise<ProductSpec[]> {
  try {
    const res = await medusaFetch(`/store/products/${productId}/specs`);
    if (!res.ok) return [];
    const data = (await res.json()) as { specs: ProductSpec[] };
    return data.specs ?? [];
  } catch {
    return [];
  }
}

/**
 * Cached per single product id (not per comparison set) so entries are shared
 * between visitors instead of being keyed on every possible id combination.
 * Uses the anonymous SDK — an authenticated request would carry a per-user
 * header and could never be cached.
 */
const getCachedComparisonProduct = unstable_cache(
  async (id: string): Promise<ComparisonProduct | null> => {
    const sdk = createSdk();
    const { products } = await sdk.store.product.list({
      id,
      region_id: NEXT_PUBLIC_REGION_ID,
      limit: 1,
      fields:
        "+variants.inventory_quantity,+variants.prices.amount,+variants.prices.currency_code",
    });

    const product = products[0];
    if (!product) return null;

    const specs = await fetchProductSpecs(product.id);
    const variant = product.variants?.[0] as
      | StoreProductVariantWithPrices
      | undefined;

    return {
      id: product.id,
      handle: product.handle ?? "",
      title: product.title ?? "",
      thumbnail: product.thumbnail ?? null,
      price: variant?.prices?.[0]?.amount ?? null,
      currency: variant?.prices?.[0]?.currency_code?.toUpperCase() ?? null,
      specs,
    } satisfies ComparisonProduct;
  },
  ["comparison-product"],
  { revalidate: 300, tags: [CACHE_TAGS.products] },
);

/**
 * Full comparison payload. Only the `/compare` page needs this — never call it
 * from a layout, it costs one backend round-trip per compared product.
 */
export async function getServerComparison(): Promise<ComparisonProduct[]> {
  const ids = await readComparisonIds();
  if (ids.length === 0) return [];

  const results = await Promise.allSettled(
    ids.map((id) => getCachedComparisonProduct(id)),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<ComparisonProduct> =>
        r.status === "fulfilled" && r.value !== null,
    )
    .map((r) => r.value);
}
