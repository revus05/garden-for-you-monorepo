import "server-only";
import { medusaFetch } from "@/shared/api/medusa-fetch";
import { CACHE_TAGS } from "@/shared/cache";
import { publicEnv } from "@/shared/config/env";

const NEXT_PUBLIC_REGION_ID = publicEnv.NEXT_PUBLIC_REGION_ID;

export type ProductSitemapEntry = {
  handle: string;
  updatedAt: Date | undefined;
};

export async function getAllProductHandles(): Promise<ProductSitemapEntry[]> {
  const entries: ProductSitemapEntry[] = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      region_id: NEXT_PUBLIC_REGION_ID,
      limit: String(limit),
      offset: String(offset),
      fields: "handle,updated_at",
    });

    let res: Response;
    try {
      res = await medusaFetch("/store/products", {
        searchParams: params,
        next: { tags: [CACHE_TAGS.products], revalidate: 3600 },
      });
    } catch {
      // Backend unreachable (e.g. during docker build) — bail out so build
      // succeeds; pages are generated on-demand via ISR.
      break;
    }

    if (!res.ok) break;

    const data = (await res.json()) as {
      products: { handle: string; updated_at?: string }[];
    };
    const products = data.products ?? [];

    for (const product of products) {
      if (!product.handle) continue;
      const updatedAt = product.updated_at
        ? new Date(product.updated_at)
        : undefined;
      entries.push({
        handle: product.handle,
        updatedAt:
          updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt : undefined,
      });
    }

    if (products.length < limit) break;
    offset += limit;
  }

  return entries;
}
