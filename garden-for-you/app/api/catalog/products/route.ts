import { unstable_cache } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { createSdk } from "@/shared/lib";
import type { StoreProductCategory } from "@medusajs/types";
import { CATALOG_PRODUCTS_PAGE_SIZE } from "@/entities/product/model";

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

// Cache category tree on the server for 5 minutes
const getCachedCategories = unstable_cache(
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

const VALID_ORDERS = new Set(["-created_at", "created_at", "-title", "title"]);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const categoryIds = searchParams.getAll("category_id[]");
  const parentHandle = searchParams.get("parent_handle") ?? "";
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0") || 0);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(CATALOG_PRODUCTS_PAGE_SIZE)) || CATALOG_PRODUCTS_PAGE_SIZE),
  );
  const order = searchParams.get("order") ?? "title";
  const orderBy = VALID_ORDERS.has(order) ? order : "title";
  const q = searchParams.get("q") ?? "";
  const regionId = searchParams.get("region_id") ?? "";

  // Resolve category IDs including descendants (server-side, cached)
  let resolvedCategoryIds: string[] = [];

  if (categoryIds.length > 0 || parentHandle) {
    const allCategories = await getCachedCategories();

    if (categoryIds.length > 0) {
      for (const id of categoryIds) {
        const node = findInTree(allCategories, id);
        if (node) resolvedCategoryIds.push(...collectDescendantIds([node]));
      }
    } else {
      const parent = allCategories.find((c) => c.id === parentHandle || (c as StoreProductCategory & { handle: string }).handle === parentHandle);
      if (parent) {
        resolvedCategoryIds = collectDescendantIds(parent.category_children ?? []);
      }
    }
  }

  const sdk = createSdk();

  const { products, count } = await sdk.store.product.list({
    limit,
    offset,
    ...(regionId ? { region_id: regionId } : {}),
    ...(resolvedCategoryIds.length > 0 ? { category_id: resolvedCategoryIds } : {}),
    ...(q ? { q } : {}),
    order: orderBy,
    fields:
      "id,handle,title,thumbnail,+variants.id,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.calculated_price.calculated_amount,+variants.calculated_price.currency_code",
  });

  const nextOffset = count > offset + limit ? offset + limit : undefined;

  return NextResponse.json({ products, count, next_offset: nextOffset });
}
