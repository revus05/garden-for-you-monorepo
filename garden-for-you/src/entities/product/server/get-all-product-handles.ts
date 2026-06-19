import "server-only";
import { medusaFetch } from "@/shared/api/medusa-fetch";
import { CACHE_TAGS } from "@/shared/cache";
import { publicEnv } from "@/shared/config/env";

const NEXT_PUBLIC_REGION_ID = publicEnv.NEXT_PUBLIC_REGION_ID;

export async function getAllProductHandles(): Promise<string[]> {
  const handles: string[] = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      region_id: NEXT_PUBLIC_REGION_ID,
      limit: String(limit),
      offset: String(offset),
      fields: "handle",
    });

    const res = await medusaFetch("/store/products", {
      searchParams: params,
      next: { tags: [CACHE_TAGS.products] },
    });

    if (!res.ok) break;

    const data = (await res.json()) as { products: { handle: string }[] };
    const products = data.products ?? [];

    handles.push(...products.map((p) => p.handle).filter(Boolean));

    if (products.length < limit) break;
    offset += limit;
  }

  return handles;
}
