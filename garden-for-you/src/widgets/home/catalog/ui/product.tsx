import type { StoreProduct } from "@medusajs/types";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { addCartItem, removeCartItem } from "@/features/cart";
import plantPlaceholder from "@/images/plant-placholder.svg";
import { paths } from "@/shared/constants/navigation";
import { cn, useAppDispatch, useAppSelector } from "@/shared/lib";
import {
  Badge,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";

type CatalogProductProps = {
  product: StoreProduct;
};

export const CatalogProduct: FC<CatalogProductProps> = ({ product }) => {
  const dispatch = useAppDispatch();

  const cart = useAppSelector((state) => state.cartSlice.cart);

  if (!product.variants) return null;

  const handleAddToCartClick = async (variantId: string) => {
    await addCartItem(dispatch, variantId, 1);
  };

  const cartItem = cart?.items?.find((item) => item.product?.id === product.id);

  const isAvailable = product.variants.some((v) => {
    if (!v.manage_inventory) return true;
    if (v.allow_backorder) return true;
    return (v.inventory_quantity ?? 0) > 0;
  });

  const isInCart = !!cartItem;

  const handleCartButtonClick = () => {
    if (!product.variants) return;

    if (isInCart) {
      void removeCartItem(dispatch, cartItem?.id);
    } else {
      void handleAddToCartClick(product.variants[0].id);
    }
  };

  const startPrice = Math.min(
    ...product.variants.map(
      (variant) => variant.calculated_price?.calculated_amount || 999,
    ),
  );

  return (
    <div
      key={product.id}
      className="flex flex-col rounded-lg hover:shadow-product-cart transition-shadow relative border hover:border-primary"
    >
      {!isAvailable && (
        <div className="absolute top-2 left-2 shadow-md bg-white rounded-full h-5 flex">
          <Badge variant="destructive">Нет в наличии</Badge>
        </div>
      )}
      {isInCart && (
        <Badge className="absolute top-2 left-2 shadow-md">В корзине</Badge>
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
          {startPrice && (
            <p className="text-lg font-bold">
              <span className="text-foreground/50 text-base">От</span>{" "}
              {startPrice.toFixed(2)}{" "}
              {product.variants[0].calculated_price?.currency_code?.toUpperCase()}
            </p>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handleCartButtonClick}
                className="size-10"
                variant={isInCart ? "outline" : "default"}
                disabled={!isAvailable}
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
              <p>{isInCart ? "Убрать из корзины" : "Добавить в корзину"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
