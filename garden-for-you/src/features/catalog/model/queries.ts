import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  type CatalogFilters,
  fetchCatalogCategories,
  fetchCatalogProductsPage,
} from "@/entities/product";

const catalogQueryKeys = {
  all: ["catalog"] as const,
  categories: () => [...catalogQueryKeys.all, "categories"] as const,
  products: (filters: CatalogFilters) =>
    [...catalogQueryKeys.all, "products", filters] as const,
};

export function useCatalogCategoriesQuery() {
  return useQuery({
    queryKey: catalogQueryKeys.categories(),
    queryFn: fetchCatalogCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCatalogProductsInfiniteQuery(
  filters: CatalogFilters,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: catalogQueryKeys.products(filters),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchCatalogProductsPage({
        filters,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}
