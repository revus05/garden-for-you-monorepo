import { requireEnv, sdk } from "@/shared/lib";
import { CATALOG_PRODUCTS_PAGE_SIZE } from "../model";
import type {
  CatalogFilters,
  CatalogProductsPage,
  ProductCategory,
} from "../model/types";

const NEXT_PUBLIC_REGION_ID = requireEnv(
  "NEXT_PUBLIC_REGION_ID",
  process.env.NEXT_PUBLIC_REGION_ID,
);

function buildCatalogParams(filters: CatalogFilters, offset: number): URLSearchParams {
  const params = new URLSearchParams();
  params.set("limit", String(CATALOG_PRODUCTS_PAGE_SIZE));
  params.set("offset", String(offset));
  params.set("region_id", NEXT_PUBLIC_REGION_ID);
  params.set("order", filters.orderBy);

  for (const id of filters.categoryIds) {
    params.append("category_id[]", id);
  }

  if (!filters.categoryIds.length && filters.parentHandle) {
    params.set("parent_handle", filters.parentHandle);
  }

  if (filters.searchQuery) {
    params.set("q", filters.searchQuery);
  }

  return params;
}

export async function fetchCatalogProductsPage({
  filters,
  offset,
}: {
  filters: CatalogFilters;
  offset: number;
}): Promise<CatalogProductsPage> {
  const params = buildCatalogParams(filters, offset);

  // Route through Next.js API to avoid CORS and do server-side category expansion
  const isServer = typeof window === "undefined";
  const baseUrl = isServer
    ? (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
    : "";
  const url = `${baseUrl}/api/catalog/products?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Catalog fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    products: CatalogProductsPage["products"];
    count: number;
    next_offset?: number;
  };

  return {
    products: data.products,
    count: data.count,
    nextOffset: data.next_offset,
  };
}

export async function fetchCatalogCategories(): Promise<ProductCategory[]> {
  const { product_categories } = await sdk.store.category.list({
    limit: 100,
    include_descendants_tree: true,
    fields: "id,category_children,handle,name",
  });

  return product_categories;
}
