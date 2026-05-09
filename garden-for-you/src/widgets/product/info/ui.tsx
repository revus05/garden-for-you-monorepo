"use client";

import type { StoreProduct } from "@medusajs/types";
import { Scale, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { type FC, useState } from "react";
import {
  type ComparisonProduct,
  MAX_COMPARISON_COUNT,
} from "@/entities/comparison";
import type { ProductSpec } from "@/entities/product";
import {
  addCartItem,
  removeCartItem,
  updateCartItemQuantity,
} from "@/features/cart";
import {
  addToComparisonWithSync,
  removeFromComparisonWithSync,
} from "@/features/comparison";
import { paths } from "@/shared/constants/navigation";
import { cn, useAppDispatch, useAppSelector } from "@/shared/lib";
import {
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";

type ProductInfoProps = {
  product: StoreProduct;
  specs: ProductSpec[];
};

export const ProductInfo: FC<ProductInfoProps> = ({ product, specs }) => {
  const dispatch = useAppDispatch();

  const cart = useAppSelector((state) => state.cartSlice.cart);
  const comparisonProducts = useAppSelector(
    (state) => state.comparisonSlice.products,
  );

  const initialOptions: Record<string, string> = Object.fromEntries(
    product.options?.map((option) => [
      option.id,
      option.values?.[0]?.id ?? "",
    ]) ?? [],
  );

  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, string>>(initialOptions);
  const [quantityLoading, setQuantityLoading] = useState(false);

  const cartItem = cart?.items?.find((item) => item.product?.id === product.id);
  const isInCart = !!cartItem;
  const isInComparison = comparisonProducts.some((p) => p.id === product.id);
  const isComparisonFull =
    comparisonProducts.length >= MAX_COMPARISON_COUNT && !isInComparison;

  const currentIds = comparisonProducts.map((p) => p.id);

  const handleComparisonClick = () => {
    if (isInComparison) {
      void removeFromComparisonWithSync(
        dispatch,
        product.id,
        currentIds.filter((id) => id !== product.id),
      );
    } else if (!isComparisonFull) {
      const variant = product.variants?.[0];
      const compProduct: ComparisonProduct = {
        id: product.id,
        handle: product.handle ?? "",
        title: product.title ?? "",
        thumbnail: product.thumbnail ?? null,
        price: variant?.calculated_price?.calculated_amount ?? null,
        currency:
          variant?.calculated_price?.currency_code?.toUpperCase() ?? null,
        specs,
      };
      void addToComparisonWithSync(dispatch, compProduct, [
        ...currentIds,
        product.id,
      ]);
    }
  };

  const handleSelectedOption = (value: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }));
  };

  const isVariantAvailable = (
    variant: NonNullable<typeof product.variants>[number],
  ) => {
    if (!variant.manage_inventory) return true;
    if (variant.allow_backorder) return true;
    return (variant.inventory_quantity ?? 0) > 0;
  };

  const isOptionValueAvailable = (
    optionId: string,
    valueId: string,
  ): boolean => {
    const hypothetical = { ...selectedOptions, [optionId]: valueId };
    return !!product.variants?.some(
      (variant) =>
        variant.options?.every(
          (opt) => opt.id === hypothetical[opt.option_id ?? ""],
        ) && isVariantAvailable(variant),
    );
  };

  const selectedVariant = product.variants?.find((variant) =>
    variant.options?.every(
      (option) => option.id === selectedOptions[option.option_id ?? ""],
    ),
  );

  const isSelectedInStock = selectedVariant
    ? isVariantAvailable(selectedVariant)
    : false;

  const handleCartButtonClick = () => {
    if (!selectedVariant) return;
    if (isInCart) {
      void removeCartItem(dispatch, cartItem?.id);
    } else {
      void addCartItem(dispatch, selectedVariant.id, 1);
    }
  };

  const filteredOptions =
    product.options?.filter((option) => option.title !== "Default option") ||
    [];

  return (
    <div className="flex flex-col gap-4">
      {!isSelectedInStock && <Badge variant="destructive">Нет в наличии</Badge>}
      <h1 className="font-black text-3xl">{product.title}</h1>
      {selectedVariant?.calculated_price && (
        <p className="text-lg font-bold">
          {selectedVariant.calculated_price.calculated_amount?.toFixed(2)}{" "}
          {selectedVariant.calculated_price.currency_code?.toUpperCase()}
        </p>
      )}
      <div className="flex gap-2 flex-wrap">
        {isInCart && cartItem ? (
          <>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background-secondary/40 p-1">
              <Button
                size="icon"
                disabled={cartItem.quantity === 1 || quantityLoading}
                onClick={() => {
                  setQuantityLoading(true);
                  void updateCartItemQuantity(
                    dispatch,
                    cartItem.id,
                    cartItem.quantity - 1,
                  ).finally(() => setQuantityLoading(false));
                }}
              >
                -
              </Button>
              <span className="w-8 text-center font-medium">
                {cartItem.quantity}
              </span>
              <Button
                size="icon"
                disabled={quantityLoading}
                onClick={() => {
                  setQuantityLoading(true);
                  void updateCartItemQuantity(
                    dispatch,
                    cartItem.id,
                    cartItem.quantity + 1,
                  ).finally(() => setQuantityLoading(false));
                }}
              >
                +
              </Button>
            </div>
            <Button
              onClick={handleCartButtonClick}
              className="w-fit"
              size="lg"
              variant="outline"
            >
              Удалить из корзины
              <ShoppingCart className="stroke-secondary-foreground" />
            </Button>
          </>
        ) : (
          <Button
            onClick={handleCartButtonClick}
            className="w-fit"
            size="lg"
            variant="default"
            disabled={!isSelectedInStock}
          >
            Добавить в корзину
            <ShoppingCart className="stroke-primary-foreground" />
          </Button>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleComparisonClick}
              size="lg"
              variant={isInComparison ? "secondary" : "outline"}
              disabled={isComparisonFull}
              aria-label={
                isInComparison ? "Убрать из сравнения" : "Добавить к сравнению"
              }
            >
              <Scale className={cn(isInComparison && "stroke-primary")} />
              {isInComparison ? "В сравнении" : "Сравнить"}
              {isInComparison && comparisonProducts.length > 0 && (
                <Link
                  href={paths.compare}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-1 text-xs underline text-muted-foreground hover:text-primary"
                >
                  ({comparisonProducts.length})
                </Link>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isComparisonFull
              ? `Можно сравнивать не более ${MAX_COMPARISON_COUNT} товаров`
              : isInComparison
                ? "Убрать из сравнения"
                : "Добавить к сравнению"}
          </TooltipContent>
        </Tooltip>
      </div>

      {filteredOptions.length > 0 && (
        <div className="flex flex-col gap-4">
          {filteredOptions.map((option) => (
            <div key={option.id}>
              <h4>{option.title}</h4>

              <Tabs
                value={selectedOptions[option.id]}
                onValueChange={(value) =>
                  handleSelectedOption(value, option.id)
                }
              >
                <TabsList>
                  {option.values?.map((value) => (
                    <TabsTrigger
                      key={value.id}
                      value={value.id}
                      disabled={!isOptionValueAvailable(option.id, value.id)}
                    >
                      {value.value}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          ))}
        </div>
      )}

      <span className="whitespace-pre-line text-justify">
        {product.description}
      </span>

      {specs.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-lg">Характеристики</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {specs.map((spec) => (
              <div key={spec.id} className="contents">
                <dt className="text-muted-foreground">
                  {spec.definition.name}
                </dt>
                <dd className="font-medium text-right">
                  {spec.value}
                  {spec.definition.unit ? ` ${spec.definition.unit}` : ""}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};
