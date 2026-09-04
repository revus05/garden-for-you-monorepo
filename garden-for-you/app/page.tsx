import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { ProductCategoryOrder } from "@/entities/product";
import {
  fetchCatalogProductsPageServer,
  getCachedCategoryTree,
} from "@/entities/product/server";
import { catalogQueryKeys } from "@/features/catalog";
import HomePage from "@/pages/home";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const queryClient = new QueryClient();

  const rawCategories =
    typeof params.categories === "string" ? params.categories : "";
  const selectedCategoryIds = rawCategories
    ? rawCategories.split(",").filter(Boolean)
    : [];
  const searchQuery = typeof params.q === "string" ? params.q : "";
  const orderBy = (
    typeof params.orderBy === "string" ? params.orderBy : "title"
  ) as ProductCategoryOrder;

  const filters = {
    categoryIds: selectedCategoryIds,
    parentHandle: "seedlings" as const,
    searchQuery,
    orderBy,
  };

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: catalogQueryKeys.categories(),
      // Cached server fetcher instead of the raw client SDK call, which hit
      // Medusa on every render of the home page. Wrapped in an arrow so
      // react-query's context argument never reaches `unstable_cache`, which
      // would fold it into the cache key.
      queryFn: () => getCachedCategoryTree(),
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: catalogQueryKeys.products(filters),
      queryFn: () => fetchCatalogProductsPageServer({ filters, offset: 0 }),
      initialPageParam: 0,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePage />
    </HydrationBoundary>
  );
}
