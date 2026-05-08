import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  fetchCatalogCategories,
  fetchCatalogProductsPage,
  type ProductCategoryOrder,
} from "@/entities/product";
import { catalogQueryKeys } from "@/features/catalog";
import HomePage from "@/pages/home";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: catalogQueryKeys.categories(),
    queryFn: fetchCatalogCategories,
  });

  const rawCategories =
    typeof params.categories === "string" ? params.categories : "";
  const selectedCategoryIds = rawCategories
    ? rawCategories.split(",").filter(Boolean)
    : [];
  const searchQuery =
    typeof params.q === "string" ? params.q : "";
  const orderBy = (
    typeof params.orderBy === "string" ? params.orderBy : "title"
  ) as ProductCategoryOrder;

  const filters = {
    categoryIds: selectedCategoryIds,
    parentHandle: "seedlings" as const,
    searchQuery,
    orderBy,
  };

  await queryClient.prefetchInfiniteQuery({
    queryKey: catalogQueryKeys.products(filters),
    queryFn: () =>
      fetchCatalogProductsPage({ filters, offset: 0 }),
    initialPageParam: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePage />
    </HydrationBoundary>
  );
}
