import "server-only";
import { requireEnv } from "@/shared/lib";
import { createServerSdk } from "@/shared/lib/server-sdk";
import type { Product } from "../model/types";

const NEXT_PUBLIC_REGION_ID = requireEnv(
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
    fields: "+variants.inventory_quantity",
  });

  return products[0] ?? null;
}
