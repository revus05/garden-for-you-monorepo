import "server-only";

import type { Product } from "entities/product/model/types";
import { createServerSdk } from "shared/lib/server-sdk";

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

const NEXT_PUBLIC_REGION_ID = requiredEnv(
  "NEXT_PUBLIC_REGION_ID",
  process.env.NEXT_PUBLIC_REGION_ID,
);

export async function getProductByHandle(
  handle: string,
): Promise<Product | null> {
  const serverSdk = await createServerSdk();

  const { products } = await serverSdk.store.product.list({
    handle,
    region_id: NEXT_PUBLIC_REGION_ID,
    limit: 1,
  });

  return products[0] ?? null;
}
