import { type NextRequest, NextResponse } from "next/server";
import { fetchCatalogProductsPageServer } from "@/entities/product/server/fetch-catalog-products";
import type { ProductCategoryOrder } from "@/entities/product/model/types";

const VALID_ORDERS = new Set(["-created_at", "created_at", "-title", "title"]);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const categoryIds = searchParams.getAll("category_id[]");
  const parentHandle = searchParams.get("parent_handle") ?? undefined;
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0") || 0);
  const order = searchParams.get("order") ?? "title";
  const orderBy = (VALID_ORDERS.has(order) ? order : "title") as ProductCategoryOrder;
  const q = searchParams.get("q") ?? "";

  const result = await fetchCatalogProductsPageServer({
    filters: {
      categoryIds,
      parentHandle,
      searchQuery: q,
      orderBy,
    },
    offset,
  });

  return NextResponse.json(
    {
      products: result.products,
      count: result.count,
      next_offset: result.nextOffset,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
      },
    },
  );
}
