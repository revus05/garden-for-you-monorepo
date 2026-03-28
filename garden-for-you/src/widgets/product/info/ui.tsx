"use client";

import type { StoreProduct } from "@medusajs/types";
import { Scale, ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import {
  type ComparisonProduct,
  MAX_COMPARISON_COUNT,
} from "@/entities/comparison";
import type { ProductSpec } from "@/entities/product";
import { addCartItem, removeCartItem } from "@/features/cart";
import {
  addToComparisonWithSync,
  removeFromComparisonWithSync,
} from "@/features/comparison";
import { paths } from "@/shared/constants/navigation";
import { cn, useAppDispatch, useAppSelector } from "@/shared/lib";
import {
  Badge,
  Button,
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

  const cartItem = cart?.items?.find((item) => item.product?.id === product.id);
  const isInStock = !!product.variants?.[0].inventory_quantity;
  const isInCart = !!cartItem;
  const isInComparison = comparisonProducts.some((p) => p.id === product.id);
  const isComparisonFull =
    comparisonProducts.length >= MAX_COMPARISON_COUNT && !isInComparison;

  const currentIds = comparisonProducts.map((p) => p.id);

  const handleCartButtonClick = () => {
    if (!product.variants) return;
    if (isInCart) {
      void removeCartItem(dispatch, cartItem?.id);
    } else {
      void addCartItem(dispatch, product.variants[0].id, 1);
    }
  };

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

  return (
    <div className="flex flex-col gap-4">
      {!isInStock && <Badge variant="destructive">Нет в наличии</Badge>}
      <h1 className="font-black text-3xl">{product.title}</h1>
      {product.variants?.[0]?.calculated_price && (
        <p className="text-lg font-bold">
          {product.variants[0].calculated_price.calculated_amount?.toFixed(2)}{" "}
          {product.variants[0].calculated_price.currency_code?.toUpperCase()}
        </p>
      )}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleCartButtonClick}
          className="w-fit"
          size="lg"
          variant={isInCart ? "outline" : "default"}
          disabled={!isInStock}
        >
          {isInCart ? "Удалить из корзины" : "Добавить в корзину"}
          <ShoppingCart
            className={cn(
              isInCart
                ? "stroke-secondary-foreground"
                : "stroke-primary-foreground",
            )}
          />
        </Button>

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

      <span className="whitespace-pre-line">{product.description}</span>

      {specs.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-lg">Характеристики</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {specs.map((spec) => (
              <div key={spec.id} className="contents">
                <dt className="text-muted-foreground">
                  {spec.definition.name}
                </dt>
                <dd className="font-medium">
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
