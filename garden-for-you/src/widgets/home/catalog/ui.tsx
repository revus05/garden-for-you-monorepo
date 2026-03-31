"use client";

import type { CheckedState } from "@radix-ui/react-checkbox";
import { ChevronDown, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import type { ProductCategoryOrder } from "@/entities/product";
import { addCartItem, removeCartItem } from "@/features/cart";
import {
  getFilteredCategories,
  useCatalogCategoriesQuery,
  useCatalogProductsInfiniteQuery,
} from "@/features/catalog";
import plantPlaceholder from "@/images/plant-placholder.svg";
import { paths } from "@/shared/constants/navigation";
import { cn, useAppDispatch, useAppSelector } from "@/shared/lib";
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Field,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";

export const Catalog = () => {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<"seedlings" | "fertilizer">(
    "seedlings",
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState<ProductCategoryOrder>("title");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const categoryIds = [...selectedCategories].sort();

  const categoriesQuery = useCatalogCategoriesQuery();

  const filteredCategoryIds = getFilteredCategories(
    activeTab,
    categoryIds,
    categoriesQuery.data || [],
  );

  const productsQuery = useCatalogProductsInfiniteQuery(
    { categoryIds: filteredCategoryIds, searchQuery: deferredSearchQuery, orderBy },
    { enabled: categoriesQuery.isSuccess },
  );

  const products =
    productsQuery.data?.pages.flatMap((page) => page.products) ?? [];
  const totalProductsCount = productsQuery.data?.pages[0]?.count ?? 0;
  const isInitialLoading =
    categoriesQuery.isPending || productsQuery.isPending;
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
    await addCartItem(dispatch, variantId, 1);
  };

  const activeCategories = (
    categoriesQuery.data?.find((category) => category.handle === activeTab)
      ?.category_children || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  const cart = useAppSelector((state) => state.cartSlice.cart);

  const tabs = (
    <Tabs
      defaultValue="seedlings"
      value={activeTab}
      onValueChange={(tab) => setActiveTab(tab as "seedlings" | "fertilizer")}
      className="md:justify-self-center"
    >
      <TabsList className="w-full md:w-auto">
        <TabsTrigger value="seedlings" className="flex-1 md:flex-none">
          Саженцы
        </TabsTrigger>
        <TabsTrigger
          value="fertilizer"
          className="flex-1 md:flex-none"
          disabled
        >
          Удобрения
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );

  const sorting = (
    <Select
      value={orderBy}
      onValueChange={(orderBy) => setOrderBy(orderBy as ProductCategoryOrder)}
    >
      <SelectTrigger className="w-full md:max-w-48 md:justify-self-end">
        <SelectValue placeholder="Сортировка" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          <SelectLabel>Сортировать по</SelectLabel>
          <SelectItem value="title">По алфавиту ↓</SelectItem>
          <SelectItem value="-title">По алфавиту ↑</SelectItem>
          <SelectItem value="-created_at">Сначала новые</SelectItem>
          <SelectItem value="created_at">Сначала старые</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  const search = (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        id="products-search"
        placeholder="Поиск"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </InputGroup>
  );

  const categoryFilters = (
    <div className="flex flex-col gap-4 w-full bg-background-secondary p-4 rounded-lg h-fit md:w-64 lg:w-72">
      <div className="flex flex-col gap-2">
        <div className="hidden md:block">{search}</div>
        {activeCategories?.map((category) => {
          const isCollapsed = collapsedCategories.has(category.id);
          const hasChildren = !!category.category_children?.length;

          return (
            <div key={category.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <Field
                  orientation="horizontal"
                  className="max-w-[calc(100%-16px)]"
                >
                  <Checkbox
                    id={`product-category-${category.id}`}
                    name="product-category"
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(state) =>
                      handleCategoryCheckedChange(category.id, state)
                    }
                  />
                  <Label
                    htmlFor={`product-category-${category.id}`}
                    className="block truncate w-full"
                  >
                    {category.name}
                  </Label>
                </Field>
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsedCategories((prev) => {
                        const next = new Set(prev);
                        if (next.has(category.id)) {
                          next.delete(category.id);
                        } else {
                          next.add(category.id);
                        }
                        return next;
                      })
                    }
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={isCollapsed ? "Развернуть" : "Свернуть"}
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform duration-200",
                        isCollapsed && "-rotate-90",
                      )}
                    />
                  </button>
                )}
              </div>

              {!isCollapsed &&
                category.category_children?.map((child) => (
                  <Field
                    orientation="horizontal"
                    key={child.id}
                    className="max-w-full pl-6"
                  >
                    <Checkbox
                      id={`product-category-${child.id}`}
                      name="product-category"
                      checked={selectedCategories.includes(child.id)}
                      onCheckedChange={(state) =>
                        handleCategoryCheckedChange(child.id, state)
                      }
                    />
                    <Label
                      htmlFor={`product-category-${child.id}`}
                      className="block truncate w-full"
                    >
                      {child.name}
                    </Label>
                  </Field>
                ))}
            </div>
          );
        })}

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
                <div className="hidden">{tabs}</div>
                {sorting}
                {categoryFilters}
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="block md:hidden col-span-2">{search}</div>

        <div className="hidden md:block opacity-0">{tabs}</div>

        <div className="hidden md:block">{sorting}</div>
      </div>

      <div className="flex gap-4 sm:flex-row flex-col">
        <div className="hidden md:flex md:flex-col">{categoryFilters}</div>

        <div className="w-full">
          {isInitialLoading && <p>Загрузка...</p>}
          {productsQuery.isError && <p>Не удалось загрузить каталог.</p>}
          {!isInitialLoading && !productsQuery.isError && !hasProducts && (
            <p>Товаров не найдено</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              if (!product.variants) return null;

              const cartItem = cart?.items?.find(
                (item) => item.product?.id === product.id,
              );

              const quantity = product.variants[0].inventory_quantity;

              const isInCart = !!cartItem;

              const handleCartButtonClick = () => {
                if (!product.variants) return;

                if (isInCart) {
                  void removeCartItem(dispatch, cartItem?.id);
                } else {
                  void handleAddToCartClick(product.variants[0].id);
                }
              };

              return (
                <div
                  key={product.id}
                  className="flex flex-col rounded-lg hover:shadow-product-cart transition-shadow relative border hover:border-primary"
                >
                  {!quantity && (
                    <div className="absolute top-2 left-2 shadow-md bg-white rounded-full h-5 flex">
                      <Badge variant="destructive">Нет в наличии</Badge>
                    </div>
                  )}
                  {isInCart && (
                    <Badge className="absolute top-2 left-2 shadow-md">
                      В корзине
                    </Badge>
                  )}

                  <Link
                    href={`${paths.productPage}/${product.handle}`}
                    className="w-full aspect-square flex justify-center items-center"
                  >
                    {product.thumbnail ? (
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        width={300}
                        height={300}
                        className="w-full aspect-square object-cover rounded-t-[9px]"
                      />
                    ) : (
                      <Image
                        src={plantPlaceholder.src}
                        alt={product.title}
                        width={300}
                        height={300}
                        className="w-[70%] aspect-square object-cover rounded-t-[9px] translate-x-2 fill-primary-foreground/70"
                      />
                    )}
                  </Link>
                  <div className="flex flex-col gap-1 p-2 grow">
                    <Link
                      href={`${paths.productPage}/${product.handle}`}
                      className="font-semibold hover:underline"
                    >
                      {product.title}
                    </Link>
                    <div className="flex justify-between items-center mt-auto">
                      {product.variants?.[0]?.calculated_price && (
                        <p className="text-lg font-bold">
                          {product.variants[0].calculated_price.calculated_amount?.toFixed(
                            2,
                          )}{" "}
                          {product.variants[0].calculated_price.currency_code?.toUpperCase()}
                        </p>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            onClick={handleCartButtonClick}
                            className="size-10"
                            variant={isInCart ? "outline" : "default"}
                            disabled={!quantity}
                          >
                            <ShoppingCart
                              className={cn(
                                isInCart
                                  ? "stroke-secondary-foreground"
                                  : "stroke-primary-foreground",
                              )}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          className={cn(
                            isInCart &&
                              "bg-background-secondary text-foreground border [&_svg]:bg-background-secondary [&_svg]:fill-background-secondary [&_svg]:stroke-background-secondary [&_svg]:border-b [&_svg]:border-r",
                          )}
                        >
                          <p>
                            {isInCart
                              ? "Убрать из корзины"
                              : "Добавить в корзину"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {productsQuery.hasNextPage && (
            <Button
              onClick={() => void productsQuery.fetchNextPage()}
              disabled={isLoadingMore}
              className="mt-8 mx-auto "
            >
              {isLoadingMore ? "Загрузка..." : "Загрузить ещё"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
