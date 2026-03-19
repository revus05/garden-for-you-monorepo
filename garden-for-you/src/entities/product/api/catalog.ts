import { CATALOG_PRODUCTS_PAGE_SIZE } from "entities/product/model";
import { sdk } from "shared/lib/sdk";
import type {
  CatalogFilters,
  CatalogProductsPage,
  ProductCategory,
} from "../model/types";

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

const NEXT_PUBLIC_REGION_ID = requiredEnv(
  "NEXT_PUBLIC_REGION_ID",
  process.env.NEXT_PUBLIC_REGION_ID,
);

export async function fetchCatalogProductsPage({
  filters,
  offset,
}: {
  filters: CatalogFilters;
  offset: number;
}): Promise<CatalogProductsPage> {
  const { products, count } = await sdk.store.product.list({
    limit: CATALOG_PRODUCTS_PAGE_SIZE,
    offset,
    region_id: NEXT_PUBLIC_REGION_ID,
    category_id: filters.categoryIds,
    q: filters.searchQuery || undefined,
    order: filters.orderBy,
  });

  const nextOffset =
    count > offset + CATALOG_PRODUCTS_PAGE_SIZE
      ? offset + CATALOG_PRODUCTS_PAGE_SIZE
      : undefined;

  return {
    products,
    count,
    nextOffset,
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
