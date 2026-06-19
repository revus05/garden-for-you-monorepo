import "server-only";
import { CACHE_TAGS } from "@/shared/cache";
import { publicEnv, resolveMedusaBaseUrl } from "@/shared/config/env";

const NEXT_PUBLIC_REGION_ID = publicEnv.NEXT_PUBLIC_REGION_ID;
const MEDUSA_BACKEND_URL = resolveMedusaBaseUrl();
const MEDUSA_PUBLISHABLE_KEY = publicEnv.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

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

    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/products?${params}`,
      {
        headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
        next: { tags: [CACHE_TAGS.products] },
      },
    );

    if (!res.ok) break;

    const data = (await res.json()) as { products: { handle: string }[] };
    const products = data.products ?? [];

    handles.push(...products.map((p) => p.handle).filter(Boolean));

    if (products.length < limit) break;
    offset += limit;
  }

  return handles;
}
