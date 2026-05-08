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
import {
  catalogQueryKeys,
  getFilteredCategories,
} from "@/features/catalog";
import HomePage from "@/pages/home";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const queryClient = new QueryClient();

  const categories = await queryClient.fetchQuery({
    queryKey: catalogQueryKeys.categories(),
    queryFn: fetchCatalogCategories,
  });

  const rawCategories =
    typeof params.categories === "string" ? params.categories : "";
  const selectedCategoryIds = rawCategories
    ? rawCategories.split(",").filter(Boolean)
    : [];
  const sortedCategoryIds = [...selectedCategoryIds].sort();
  const searchQuery =
    typeof params.q === "string" ? params.q : "";
  const orderBy = (
    typeof params.orderBy === "string" ? params.orderBy : "title"
  ) as ProductCategoryOrder;

  const filteredCategoryIds = getFilteredCategories(
    "seedlings",
    sortedCategoryIds,
    categories,
  );

  const filters = { categoryIds: filteredCategoryIds, searchQuery, orderBy };

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
