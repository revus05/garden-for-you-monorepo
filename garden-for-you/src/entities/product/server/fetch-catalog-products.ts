import "server-only";
import { unstable_cache } from "next/cache";
import { createSdk } from "@/shared/lib";
import { publicEnv } from "@/shared/config/env";
import type { StoreProductCategory } from "@medusajs/types";
import { CATALOG_PRODUCTS_PAGE_SIZE } from "../model";
import type { CatalogFilters, CatalogProductsPage } from "../model/types";

type CategoryNode = Pick<StoreProductCategory, "id"> & {
  category_children?: CategoryNode[];
};

function collectDescendantIds(cats: CategoryNode[]): string[] {
  const ids: string[] = [];
  for (const cat of cats) {
    ids.push(cat.id);
    if (cat.category_children?.length) {
      ids.push(...collectDescendantIds(cat.category_children));
    }
  }
  return ids;
}

function findInTree(cats: CategoryNode[], id: string): CategoryNode | undefined {
  for (const cat of cats) {
    if (cat.id === id) return cat;
    const found = findInTree(cat.category_children ?? [], id);
    if (found) return found;
  }
  return undefined;
}

// Shared cached category tree — reused by both API route and SSR prefetch
export const getCachedCategoryTree = unstable_cache(
  async () => {
    const sdk = createSdk();
    const { product_categories } = await sdk.store.category.list({
      limit: 200,
      include_descendants_tree: true,
      fields: "id,category_children,handle,name",
    } as Parameters<typeof sdk.store.category.list>[0]);
    return product_categories as CategoryNode[];
  },
  ["catalog-categories"],
  { revalidate: 300 },
);

const REGION_ID = publicEnv.NEXT_PUBLIC_REGION_ID;

// Direct server-side fetch — no loopback HTTP, calls Medusa directly
export async function fetchCatalogProductsPageServer({
  filters,
  offset,
}: {
  filters: CatalogFilters;
  offset: number;
}): Promise<CatalogProductsPage> {
  const limit = CATALOG_PRODUCTS_PAGE_SIZE;

  let resolvedCategoryIds: string[] = [];

  if (filters.categoryIds.length > 0 || filters.parentHandle) {
    const allCategories = await getCachedCategoryTree();

    if (filters.categoryIds.length > 0) {
      for (const id of filters.categoryIds) {
        const node = findInTree(allCategories, id);
        if (node) resolvedCategoryIds.push(...collectDescendantIds([node]));
      }
    } else {
      const parent = allCategories.find(
        (c) =>
          (c as StoreProductCategory & { handle: string }).handle ===
          filters.parentHandle,
      );
      if (parent) {
        resolvedCategoryIds = collectDescendantIds(
          parent.category_children ?? [],
        );
      }
    }
  }

  const sdk = createSdk();
  const { products, count } = await sdk.store.product.list({
    limit,
    offset,
    region_id: REGION_ID,
    ...(resolvedCategoryIds.length > 0
      ? { category_id: resolvedCategoryIds }
      : {}),
    ...(filters.searchQuery ? { q: filters.searchQuery } : {}),
    order: filters.orderBy,
    fields:
      "id,handle,title,thumbnail,+variants.id,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices.amount,+variants.prices.currency_code",
  });

  const nextOffset = count > offset + limit ? offset + limit : undefined;

  return { products, count, nextOffset };
}
