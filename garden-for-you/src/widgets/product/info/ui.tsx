"use client";

import type { StoreProduct } from "@medusajs/types";
import { ShoppingCart } from "lucide-react";
import type { FC } from "react";
import { addCartItem, removeCartItem } from "@/features/cart";
import { cn, useAppDispatch, useAppSelector } from "@/shared/lib";
import { Badge, Button } from "@/shared/ui";

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

  const isInStock = !!product.variants?.[0].inventory_quantity;

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
      {!isInStock && <Badge variant="destructive">Нет в наличии</Badge>}
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
      <span className="whitespace-pre-line">{product.description}</span>
    </div>
  );
};
