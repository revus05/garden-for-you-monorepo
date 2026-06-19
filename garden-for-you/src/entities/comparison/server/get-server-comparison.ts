import "server-only";

import { cookies } from "next/headers";
import { publicEnv, resolveMedusaBaseUrl } from "@/shared/config/env";
import { createServerSdk } from "@/shared/lib/server-sdk";
import { COMPARISON_COOKIE } from "@/shared/config/comparison";
import type { ComparisonProduct } from "../model";
import type { ProductSpec, StoreProductVariantWithPrices } from "@/entities/product";

const NEXT_PUBLIC_REGION_ID = publicEnv.NEXT_PUBLIC_REGION_ID;
const MEDUSA_BACKEND_URL = resolveMedusaBaseUrl();
const MEDUSA_PUBLISHABLE_KEY = publicEnv.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

async function fetchProductSpecs(productId: string): Promise<ProductSpec[]> {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/products/${productId}/specs`,
      {
        headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
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

async function readCookieIds(): Promise<string[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COMPARISON_COOKIE)?.value;
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, 4);
  } catch {
    return [];
  }
}

export async function getServerComparison(): Promise<ComparisonProduct[]> {
  const ids = await readCookieIds();
  if (ids.length === 0) return [];

  const serverSdk = await createServerSdk();

  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const { products } = await serverSdk.store.product.list({
        id,
        region_id: NEXT_PUBLIC_REGION_ID,
        limit: 1,
        fields: "+variants.inventory_quantity,+variants.prices.amount,+variants.prices.currency_code",
      });
      const product = products[0];
      if (!product) return null;

      const specs = await fetchProductSpecs(product.id);
      const variant = product.variants?.[0] as StoreProductVariantWithPrices | undefined;

      return {
        id: product.id,
        handle: product.handle ?? "",
        title: product.title ?? "",
        thumbnail: product.thumbnail ?? null,
        price: variant?.prices?.[0]?.amount ?? null,
        currency:
          variant?.prices?.[0]?.currency_code?.toUpperCase() ?? null,
        specs,
      } satisfies ComparisonProduct;
    }),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<ComparisonProduct> =>
        r.status === "fulfilled" && r.value !== null,
    )
    .map((r) => r.value);
}
