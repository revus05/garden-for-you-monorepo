"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductCategoryOrder } from "@/entities/product";
import {
  findCategoryInTree,
  useCatalogCategoriesQuery,
  useCatalogProductsInfiniteQuery,
} from "@/features/catalog";
import noImage from "@/images/no-items.svg";
import { cn } from "@/shared/lib";
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Skeleton,
} from "@/shared/ui";
import { CatalogCategory } from "@/widgets/home/catalog/ui/category";
import { CatalogProduct } from "@/widgets/home/catalog/ui/product";
import { CatalogProductSkeleton } from "@/widgets/home/catalog/ui/product-skeleton";
import { CatalogSearch } from "@/widgets/home/catalog/ui/search";
import { CatalogSorting } from "@/widgets/home/catalog/ui/sorting";
import { CatalogTabs } from "@/widgets/home/catalog/ui/tabs";

const ORDER_LABELS: Record<ProductCategoryOrder, string> = {
  title: "По алфавиту ↓",
  "-title": "По алфавиту ↑",
  "-created_at": "Сначала новые",
  created_at: "Сначала старые",
};

export const Catalog = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read state from URL
  const urlCategoryIds =
    searchParams?.get("categories")?.split(",").filter(Boolean) ?? [];
  const urlSearchQuery = searchParams?.get("q") ?? "";
  const orderBy = (searchParams?.get("orderBy") ??
    "title") as ProductCategoryOrder;
  const activeTab = "seedlings" as const;

  // Local state for immediate UI updates (checkbox doesn't wait for URL)
  const [localCategoryIds, setLocalCategoryIds] = useState(urlCategoryIds);
  // Local search input with debounce to URL
  const [searchInput, setSearchInput] = useState(urlSearchQuery);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Sync local categories when URL changes externally (badge reset, back/forward)
  const urlCategoriesKey = searchParams?.get("categories") ?? "";
  useEffect(() => {
    setLocalCategoryIds(
      urlCategoriesKey ? urlCategoriesKey.split(",").filter(Boolean) : [],
    );
  }, [urlCategoriesKey]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}#catalog`, {
        scroll: false,
      });
    },
    [searchParams, router, pathname],
  );

  // Debounce search input → URL
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === urlSearchQuery) return;
    const timer = setTimeout(() => {
      updateParams({ q: trimmed || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, urlSearchQuery, updateParams]);

  // Sync search input when URL changes externally (e.g. badge reset)
  useEffect(() => {
    setSearchInput(urlSearchQuery);
  }, [urlSearchQuery]);

  const hasActiveFilters =
    localCategoryIds.length > 0 || urlSearchQuery !== "" || orderBy !== "title";

  const resetFilters = () => {
    setSearchInput("");
    setLocalCategoryIds([]);
    updateParams({ categories: null, q: null, orderBy: null });
  };

  const localCategoryIdsRef = useRef(localCategoryIds);
  localCategoryIdsRef.current = localCategoryIds;

  const setSelectedCategoryIds = useCallback(
    (action: string[] | ((prev: string[]) => string[])) => {
      const newIds =
        typeof action === "function"
          ? action(localCategoryIdsRef.current)
          : action;
      setLocalCategoryIds(newIds);
      updateParams({ categories: newIds.length > 0 ? newIds.join(",") : null });
    },
    [updateParams],
  );

  const setOrderBy = useCallback(
    (newOrder: ProductCategoryOrder) => {
      updateParams({ orderBy: newOrder === "title" ? null : newOrder });
    },
    [updateParams],
  );

  const categoriesQuery = useCatalogCategoriesQuery();

  const productsQuery = useCatalogProductsInfiniteQuery({
    categoryIds: localCategoryIds,
    parentHandle: activeTab,
    searchQuery: urlSearchQuery,
    orderBy,
  });

  const products =
    productsQuery.data?.pages.flatMap((page) => page.products) ?? [];
  const totalProductsCount = productsQuery.data?.pages[0]?.count ?? 0;
  const isInitialLoading = productsQuery.isPending;
  const isLoadingMore = productsQuery.isFetchingNextPage;
  const isRefetching =
    productsQuery.isFetching &&
    !productsQuery.isFetchingNextPage &&
    !productsQuery.isPending;
  const hasProducts = products.length > 0;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          productsQuery.hasNextPage &&
          !productsQuery.isFetchingNextPage
        ) {
          void productsQuery.fetchNextPage();
        }
      },
      { rootMargin: "1200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [productsQuery]);

  const activeCategories = (
    categoriesQuery.data?.find((category) => category.handle === activeTab)
      ?.category_children || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  const categoryFilters = (
    <div className="flex flex-col gap-4 w-full bg-background-secondary p-4 rounded-lg h-fit md:w-64 lg:w-72">
      <div className="flex flex-col gap-4">
        <div className="hidden md:block">
          <CatalogSearch
            searchQuery={searchInput}
            setSearchQuery={setSearchInput}
          />
        </div>
        <div className="flex flex-col gap-2">
          {categoriesQuery.isPending
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))
            : activeCategories?.map((category) => (
                <CatalogCategory
                  key={category.id}
                  category={category}
                  selectedCategoryIds={localCategoryIds}
                  setSelectedCategoryIds={setSelectedCategoryIds}
                />
              ))}
        </div>

        {categoriesQuery.isError && <p>Не удалось загрузить категории.</p>}
      </div>
    </div>
  );

  return (
    <section className="flex flex-col gap-4" id="catalog">
      <div className="grid md:grid-cols-3 grid-cols-2 gap-8">
        <div className="flex gap-2 items-center col-span-2 md:col-span-1">
          <h2 className="text-2xl font-bold">Каталог</h2>
          {hasProducts && <Badge>{totalProductsCount} товара найдено</Badge>}
          <Drawer open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="ml-auto md:hidden">
                Фильтры
              </Button>
            </DrawerTrigger>
            <DrawerContent className="md:hidden max-h-[90vh]">
              <DrawerHeader>
                <DrawerTitle>Фильтры</DrawerTitle>
                <DrawerDescription>
                  Выберите категорию, сортировку и параметры поиска.
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
                <div className="hidden">
                  <CatalogTabs activeTab={activeTab} setActiveTab={() => {}} />
                </div>
                <CatalogSorting orderBy={orderBy} setOrderBy={setOrderBy} />
                {categoryFilters}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      resetFilters();
                      setIsFiltersOpen(false);
                    }}
                  >
                    <X size={16} />
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="block md:hidden col-span-2">
          <CatalogSearch
            searchQuery={searchInput}
            setSearchQuery={setSearchInput}
          />
        </div>

        <div className="hidden md:block opacity-0">
          <CatalogTabs activeTab={activeTab} setActiveTab={() => {}} />
        </div>

        <div className="hidden md:block">
          <CatalogSorting orderBy={orderBy} setOrderBy={setOrderBy} />
        </div>
      </div>

      <div className="flex gap-4 sm:flex-row flex-col">
        <div className="hidden md:flex md:flex-col sticky top-19 max-h-[calc(100vh-76px)] overflow-y-auto scrollbar-hide self-start md:w-64 lg:w-72 shrink-0">
          {categoryFilters}
        </div>

        <div className="w-full min-w-0 flex flex-col gap-4">
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="cursor-pointer gap-1 h-6"
                onClick={resetFilters}
              >
                Сбросить все
              </Badge>
              {urlSearchQuery && (
                <Badge
                  variant="outline"
                  className="cursor-pointer gap-1 h-6 max-w-full shrink min-w-0"
                  onClick={() => {
                    setSearchInput("");
                    updateParams({ q: null });
                  }}
                >
                  <span className="truncate">Поиск: {urlSearchQuery}</span>
                  <X size={12} className="shrink-0" />
                </Badge>
              )}
              {orderBy !== "title" && (
                <Badge
                  variant="outline"
                  className="cursor-pointer gap-1 h-6"
                  onClick={() => setOrderBy("title")}
                >
                  {ORDER_LABELS[orderBy]}
                  <X size={12} />
                </Badge>
              )}
              {localCategoryIds.map((id) => {
                const category = findCategoryInTree(activeCategories, id);
                if (!category) return null;
                return (
                  <Badge
                    key={id}
                    variant="outline"
                    className="cursor-pointer gap-1 h-6"
                    onClick={() =>
                      setSelectedCategoryIds((prev) =>
                        prev.filter((cId) => cId !== id),
                      )
                    }
                  >
                    {category.name}
                    <X size={12} />
                  </Badge>
                );
              })}
            </div>
          )}

          {productsQuery.isError && <p>Не удалось загрузить каталог.</p>}
          {!isInitialLoading && !productsQuery.isError && !hasProducts && (
            <div className="flex flex-col gap-4 items-center py-16">
              <Image src={noImage} height={128} width={128} alt="no-products" />
              <p className="text-lg font-medium text-secondary-foreground">
                Товаров не найдено
              </p>
            </div>
          )}

          <div
            className={cn(
              "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-200",
              isRefetching && "opacity-50 pointer-events-none",
            )}
          >
            {isInitialLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <CatalogProductSkeleton key={i} />
                ))
              : products.map((product) => (
                  <CatalogProduct key={product.id} product={product} />
                ))}
          </div>

          <div ref={sentinelRef} aria-hidden="true" className="h-1" />
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
