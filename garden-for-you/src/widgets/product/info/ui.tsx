"use client";

import type { StoreProduct } from "@medusajs/types";
import { addCartItem, removeCartItem } from "features/cart";
import type { FC } from "react";
import { useAppDispatch, useAppSelector } from "shared/lib/hooks";
import { cn } from "shared/lib/utils";
import { Button } from "shared/ui/button";
import { Icons } from "shared/ui/icons";

type ProductInfoProps = {
  product: StoreProduct;
};

export const ProductInfo: FC<ProductInfoProps> = ({ product }) => {
  const dispatch = useAppDispatch();

  const handleAddToCartClick = async (variantId: string) => {
    await addCartItem(dispatch, variantId, 1);
  };

  const cart = useAppSelector((state) => state.cartSlice.cart);

  const cartItem = cart?.items?.find((item) => item.product?.id === product.id);

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
    <div className="flex flex-col gap-4">
      <h1 className="font-black text-3xl">{product.title}</h1>
      {product.variants?.[0]?.calculated_price && (
        <p className="text-lg font-bold">
          {product.variants[0].calculated_price.calculated_amount?.toFixed(2)}{" "}
          {product.variants[0].calculated_price.currency_code?.toUpperCase()}
        </p>
      )}
      <Button
        onClick={handleCartButtonClick}
        className="w-fit"
        size="lg"
        variant={isInCart ? "outline" : "default"}
      >
        {isInCart ? "Удалить из корзины" : "Добавить в корзину"}
        <Icons.cart
          className={cn(
            isInCart
              ? "[&_path]:stroke-secondary-foreground"
              : "[&_path]:stroke-primary-foreground",
          )}
        />
      </Button>
      <span className="whitespace-pre-line">{product.description}</span>
    </div>
  );
};
