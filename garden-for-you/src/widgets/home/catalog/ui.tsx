"use client";

import type { CheckedState } from "@radix-ui/react-checkbox";
import type { ProductCategoryOrder } from "entities/product/model/types";
import { addCartItem } from "features/cart";
import {
  useCatalogCategoriesQuery,
  useCatalogProductsInfiniteQuery,
} from "features/catalog";
import { getFilteredCategories } from "features/catalog/lib/category-utils";
import Image from "next/image";
import { useDeferredValue, useState } from "react";
import { useAppDispatch } from "shared/lib/hooks";
import { Badge } from "shared/ui/badge";
import { Button } from "shared/ui/button";
import { Checkbox } from "shared/ui/checkbox";
import { Field } from "shared/ui/field";
import { Icons } from "shared/ui/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "shared/ui/input-group";
import { Label } from "shared/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "shared/ui/select";
import { Tabs, TabsList, TabsTrigger } from "shared/ui/tabs";

export const Catalog = () => {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<"seedlings" | "fertilizer">(
    "seedlings",
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState<ProductCategoryOrder>("-created_at");
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const categoryIds = [...selectedCategories].sort();

  const categoriesQuery = useCatalogCategoriesQuery();

  const filteredCategories = getFilteredCategories(
    activeTab,
    categoryIds,
    categoriesQuery.data || [],
  );

  const productsQuery = useCatalogProductsInfiniteQuery({
    categoryIds: filteredCategories,
    searchQuery: deferredSearchQuery,
    orderBy,
  });

  const products =
    productsQuery.data?.pages.flatMap((page) => page.products) ?? [];
  const totalProductsCount = productsQuery.data?.pages[0]?.count ?? 0;
  const isInitialLoading = productsQuery.isPending;
  const isLoadingMore = productsQuery.isFetchingNextPage;
  const hasProducts = products.length > 0;

  const handleCategoryCheckedChange = (
    categoryId: string,
    state: CheckedState,
  ) => {
    setSelectedCategories((current) =>
      state
        ? current.includes(categoryId)
          ? current
          : [...current, categoryId]
        : current.filter((id) => id !== categoryId),
    );
  };

  const handleAddToCartClick = async (variantId: string) => {
    const response = await addCartItem(dispatch, variantId, 1);
    console.log("addToCart", response);
  };

  const activeCategories =
    categoriesQuery.data?.find((category) => category.handle === activeTab)
      ?.category_children || [];

  return (
    <section className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-8">
        <div className="flex gap-2 items-center">
          <h2 className="text-2xl font-bold">Каталог</h2>
          {hasProducts && <Badge>{totalProductsCount} товара найдено</Badge>}
        </div>

        <Tabs
          defaultValue="seedlings"
          value={activeTab}
          onValueChange={(tab) =>
            setActiveTab(tab as "seedlings" | "fertilizer")
          }
          className="justify-self-center"
        >
          <TabsList>
            <TabsTrigger value="seedlings">Саженцы</TabsTrigger>
            <TabsTrigger value="fertilizer">Удобрения</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={orderBy}
          onValueChange={(orderBy) =>
            setOrderBy(orderBy as ProductCategoryOrder)
          }
        >
          <SelectTrigger className="w-full max-w-48 justify-self-end">
            <SelectValue placeholder="Сортировка" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              <SelectLabel>Сортировать по</SelectLabel>
              <SelectItem value="-created_at">Сначала новые</SelectItem>
              <SelectItem value="created_at">Сначала старые</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-4 min-w-72 bg-background-secondary p-4 rounded-lg">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Icons.search />
            </InputGroupAddon>
            <InputGroupInput
              id="products-search"
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <div className="flex flex-col gap-2">
            {activeCategories?.map((category) => (
              <Field orientation="horizontal" key={category.id}>
                <Checkbox
                  id={`product-category-${category.id}`}
                  name="product-category"
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(state) =>
                    handleCategoryCheckedChange(category.id, state)
                  }
                />
                <Label htmlFor={`product-category-${category.id}`}>
                  {category.name}
                </Label>
              </Field>
            ))}

            {categoriesQuery.isPending && <p>Загрузка категорий...</p>}
            {categoriesQuery.isError && <p>Не удалось загрузить категории.</p>}
          </div>
        </div>

        <div className="w-full">
          {isInitialLoading && <p>Загрузка...</p>}
          {productsQuery.isError && <p>Не удалось загрузить каталог.</p>}
          {!isInitialLoading && !productsQuery.isError && !hasProducts && (
            <p>Товаров не найдено</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col rounded-lg hover:shadow-product-cart transition-shadow"
              >
                {product.thumbnail && (
                  <div>
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      width={300}
                      height={300}
                      className="w-full object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1 p-2 grow">
                  <h3 className="font-semibold">{product.title}</h3>
                  <div className="flex justify-between items-center mt-auto">
                    {product.variants?.[0]?.calculated_price && (
                      <p className="text-lg font-bold">
                        {product.variants[0].calculated_price.calculated_amount?.toFixed(
                          2,
                        )}{" "}
                        {product.variants[0].calculated_price.currency_code?.toUpperCase()}
                      </p>
                    )}
                    <Button
                      size="icon"
                      onClick={() =>
                        product.variants?.[0]?.id &&
                        handleAddToCartClick(product.variants[0].id)
                      }
                      className="size-10"
                    >
                      <Icons.cart className="[&_path]:stroke-primary-foreground" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {productsQuery.hasNextPage && (
            <Button
              onClick={() => void productsQuery.fetchNextPage()}
              disabled={isLoadingMore}
              className="mt-8 block mx-auto bg-black text-white px-6 py-3 rounded"
            >
              {isLoadingMore ? "Загрузка..." : "Загрузить ещё"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
