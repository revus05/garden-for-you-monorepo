import "server-only";
import { requireEnv } from "@/shared/lib";

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
        next: { tags: ["products"] },
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
