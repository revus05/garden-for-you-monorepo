import "server-only";
import { unstable_cache } from "next/cache";
import { createSdk } from "@/shared/lib";
import { CACHE_TAGS } from "@/shared/cache";
import { publicEnv } from "@/shared/config/env";
import type { StoreProductCategory } from "@medusajs/types";
import { CATALOG_PRODUCTS_PAGE_SIZE } from "../model";
import { CATALOG_CATEGORY_LIST_PARAMS } from "../model/catalog-params";
import type {
  CatalogFilters,
  CatalogProductsPage,
  ProductCategory,
} from "../model/types";

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

/**
 * Shared cached category tree — reused by the catalog API route, the SSR
 * prefetch on the home page and server-side category resolution. Uses exactly
 * the same request params as the client `fetchCatalogCategories`, so the
 * dehydrated react-query cache matches what a client refetch would return.
 */
export const getCachedCategoryTree = unstable_cache(
  async (): Promise<ProductCategory[]> => {
    const sdk = createSdk();
    const { product_categories } = await sdk.store.category.list(
      CATALOG_CATEGORY_LIST_PARAMS as Parameters<
        typeof sdk.store.category.list
      >[0],
    );
    return product_categories;
  },
  ["catalog-categories"],
  { revalidate: 300, tags: [CACHE_TAGS.categories] },
);

const REGION_ID = publicEnv.NEXT_PUBLIC_REGION_ID;

type CachedProductsArgs = {
  categoryIds: string[];
  searchQuery?: string;
  orderBy: string;
  limit: number;
  offset: number;
};

// Cached SDK product.list — keyed on its args, invalidated by the `products` tag.
const getCachedProductsPage = unstable_cache(
  async ({
    categoryIds,
    searchQuery,
    orderBy,
    limit,
    offset,
  }: CachedProductsArgs) => {
    const sdk = createSdk();
    const { products, count } = await sdk.store.product.list({
      limit,
      offset,
      region_id: REGION_ID,
      ...(categoryIds.length > 0 ? { category_id: categoryIds } : {}),
      ...(searchQuery ? { q: searchQuery } : {}),
      order: orderBy,
      fields:
        "id,handle,title,thumbnail,+variants.id,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices.amount,+variants.prices.currency_code",
    });
    return { products, count };
  },
  ["catalog-products"],
  { revalidate: 60, tags: [CACHE_TAGS.products] },
);

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
    const allCategories = (await getCachedCategoryTree()) as CategoryNode[];

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

  const { products, count } = await getCachedProductsPage({
    categoryIds: resolvedCategoryIds,
    searchQuery: filters.searchQuery,
    orderBy: filters.orderBy,
    limit,
    offset,
  });

  const nextOffset = count > offset + limit ? offset + limit : undefined;

  return { products, count, nextOffset };
}
