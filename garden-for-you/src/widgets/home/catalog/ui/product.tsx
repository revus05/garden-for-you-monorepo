import type { StoreProduct } from "@medusajs/types";
import { Scale, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import {
  type ComparisonProduct,
  MAX_COMPARISON_COUNT,
} from "@/entities/comparison";
import { addCartItem, removeCartItem } from "@/features/cart";
import {
  addToComparisonWithSync,
  removeFromComparisonWithSync,
} from "@/features/comparison";
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
  const comparisonProducts = useAppSelector(
    (state) => state.comparisonSlice.products,
  );

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
  const isInComparison = comparisonProducts.some((p) => p.id === product.id);
  const isComparisonFull =
    comparisonProducts.length >= MAX_COMPARISON_COUNT && !isInComparison;
  const currentComparisonIds = comparisonProducts.map((p) => p.id);

  const handleCartButtonClick = () => {
    if (!product.variants) return;

    if (isInCart) {
      void removeCartItem(dispatch, cartItem?.id);
    } else {
      void handleAddToCartClick(product.variants[0].id);
    }
  };

  const handleComparisonClick = () => {
    if (isInComparison) {
      void removeFromComparisonWithSync(
        dispatch,
        product.id,
        currentComparisonIds.filter((id) => id !== product.id),
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
        specs: [],
      };
      void addToComparisonWithSync(dispatch, compProduct, [
        ...currentComparisonIds,
        product.id,
      ]);
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
      {isInCart && isAvailable && (
        <Badge className="absolute top-2 left-2 shadow-md">В корзине</Badge>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-lg"
            variant="outline"
            className={cn(
              "absolute top-2 right-2 size-10 rounded-lg shadow-sm border backdrop-blur-2xl",
              isInComparison
                ? "bg-primary! border-primary! hover:bg-primary/90! hover:border-primary/90!"
                : "bg-white/90! hover:bg-white!",
            )}
            onClick={handleComparisonClick}
            disabled={isComparisonFull}
          >
            <Scale
              className={cn(
                "size-4",
                isInComparison ? "stroke-white" : "stroke-secondary-foreground",
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isInComparison
              ? "Убрать из сравнения"
              : isComparisonFull
                ? `Максимум ${MAX_COMPARISON_COUNT} товара`
                : "Добавить к сравнению"}
          </p>
        </TooltipContent>
      </Tooltip>

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
