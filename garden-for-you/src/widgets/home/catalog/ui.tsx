"use client";

import type { CheckedState } from "@radix-ui/react-checkbox";
import type { ProductCategoryOrder } from "entities/product/model/types";
import { addCartItem } from "features/cart";
import {
  useCatalogCategoriesQuery,
  useCatalogProductsInfiniteQuery,
} from "features/catalog";
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

export const Catalog = () => {
  const dispatch = useAppDispatch();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState<ProductCategoryOrder>("-created_at");
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const categoryIds = [...selectedCategories].sort();

  const categoriesQuery = useCatalogCategoriesQuery();
  const productsQuery = useCatalogProductsInfiniteQuery({
    categoryIds,
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

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <h2 className="text-2xl font-bold">Каталог</h2>
          {hasProducts && <Badge>{totalProductsCount} товара найдено</Badge>}
        </div>
        <Select
          value={orderBy}
          onValueChange={(orderBy) =>
            setOrderBy(orderBy as ProductCategoryOrder)
          }
        >
          <SelectTrigger className="w-full max-w-48">
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
            {categoriesQuery.data?.map((category) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                {product.thumbnail && (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover rounded"
                  />
                )}
                <h3 className="font-semibold mt-3">{product.title}</h3>
                <p className="text-sm text-gray-600">
                  {product.description?.slice(0, 100)}...
                </p>

                {product.variants?.[0]?.calculated_price && (
                  <p className="text-lg font-bold mt-2">
                    {product.variants[0].calculated_price.calculated_amount}{" "}
                    {product.variants[0].calculated_price.currency_code?.toUpperCase()}
                  </p>
                )}

                <Button
                  onClick={() =>
                    product.variants?.[0]?.id &&
                    handleAddToCartClick(product.variants[0].id)
                  }
                >
                  В корзину
                </Button>
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
