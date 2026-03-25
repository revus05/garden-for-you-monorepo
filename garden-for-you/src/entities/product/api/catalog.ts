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
    fields: "+variants.inventory_quantity",
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
