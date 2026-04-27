"use client";

import { useDeferredValue, useState } from "react";
import type { ProductCategoryOrder } from "@/entities/product";
import {
  getFilteredCategories,
  useCatalogCategoriesQuery,
  useCatalogProductsInfiniteQuery,
} from "@/features/catalog";
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui";
import { CatalogCategory } from "@/widgets/home/catalog/ui/category";
import { CatalogProduct } from "@/widgets/home/catalog/ui/product";
import { CatalogSearch } from "@/widgets/home/catalog/ui/search";
import { CatalogSorting } from "@/widgets/home/catalog/ui/sorting";
import { CatalogTabs } from "@/widgets/home/catalog/ui/tabs";

export const Catalog = () => {
  const [activeTab, setActiveTab] = useState<"seedlings" | "fertilizer">(
    "seedlings",
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState<ProductCategoryOrder>("title");

  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const categoryIds = [...selectedCategoryIds].sort();

  const categoriesQuery = useCatalogCategoriesQuery();

  const filteredCategoryIds = getFilteredCategories(
    activeTab,
    categoryIds,
    categoriesQuery.data || [],
  );

  const productsQuery = useCatalogProductsInfiniteQuery(
    {
      categoryIds: filteredCategoryIds,
      searchQuery: deferredSearchQuery,
      orderBy,
    },
    { enabled: categoriesQuery.isSuccess },
  );

  const products =
    productsQuery.data?.pages.flatMap((page) => page.products) ?? [];
  const totalProductsCount = productsQuery.data?.pages[0]?.count ?? 0;
  const isInitialLoading = categoriesQuery.isPending || productsQuery.isPending;
  const isLoadingMore = productsQuery.isFetchingNextPage;
  const hasProducts = products.length > 0;

  const activeCategories = (
    categoriesQuery.data?.find((category) => category.handle === activeTab)
      ?.category_children || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  const categoryFilters = (
    <div className="flex flex-col gap-4 w-full bg-background-secondary p-4 rounded-lg h-fit md:w-64 lg:w-72">
      <div className="flex flex-col gap-4">
        <div className="hidden md:block">
          <CatalogSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        <div className="flex flex-col gap-2">
          {activeCategories?.map((category) => (
            <CatalogCategory
              key={category.id}
              category={category}
              selectedCategoryIds={selectedCategoryIds}
              setSelectedCategoryIds={setSelectedCategoryIds}
            />
          ))}
        </div>

        {categoriesQuery.isPending && <p>Загрузка категорий...</p>}
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
                  <CatalogTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>
                <CatalogSorting orderBy={orderBy} setOrderBy={setOrderBy} />
                {categoryFilters}
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="block md:hidden col-span-2">
          <CatalogSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        <div className="hidden md:block opacity-0">
          <CatalogTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="hidden md:block">
          <CatalogSorting orderBy={orderBy} setOrderBy={setOrderBy} />
        </div>
      </div>

      <div className="flex gap-4 sm:flex-row flex-col">
        <div className="hidden md:flex md:flex-col">{categoryFilters}</div>

        <div className="w-full flex flex-col gap-8">
          {isInitialLoading && <p>Загрузка...</p>}
          {productsQuery.isError && <p>Не удалось загрузить каталог.</p>}
          {!isInitialLoading && !productsQuery.isError && !hasProducts && (
            <p>Товаров не найдено</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <CatalogProduct key={product.id} product={product} />
            ))}
          </div>

          {productsQuery.hasNextPage && (
            <Button
              onClick={() => void productsQuery.fetchNextPage()}
              disabled={isLoadingMore}
              className="mt-8 mx-auto"
            >
              {isLoadingMore ? "Загрузка..." : "Показать ещё"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
