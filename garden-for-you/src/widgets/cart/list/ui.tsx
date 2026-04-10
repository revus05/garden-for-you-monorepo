"use client";

import { ArrowRight, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { removeCartItem, updateCartItemQuantity } from "@/features/cart";
import plantPlaceholder from "@/images/plant-placholder.svg";
import { paths } from "@/shared/constants/navigation";
import { formatPrice, useAppDispatch, useAppSelector } from "@/shared/lib";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";

export const CartList = () => {
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const dispatch = useAppDispatch();

  if (!cart || !cart?.items?.length) {
    return (
      <div className="wrapper py-16 flex flex-col items-center gap-6 text-center">
        <div className="size-24 rounded-full bg-background-secondary flex items-center justify-center">
          <ShoppingCart className="size-10 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Нет товаров в корзине</h1>
          <p className="text-muted-foreground max-w-sm">
            Добавьте товары в корзину
          </p>
        </div>
        <Button asChild size="lg">
          <Link href={`${paths.home}#catalog`} scroll={false}>
            Перейти в каталог
            <ArrowRight className="stroke-primary-foreground" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-card/95 gap-0">
      <CardHeader className="gap-1 border-b border-border/60">
        <CardTitle className="text-xl font-semibold">Корзина</CardTitle>
        <CardDescription>
          Проверьте состав заказа перед оформлением.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:hidden">
          {cart?.items?.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border/60 bg-background-secondary/20 p-4"
            >
              <div className="flex gap-3">
                {item.thumbnail && (
                  <Link
                    href={`${paths.productPage}/${item.product_handle}`}
                    className="shrink-0"
                  >
                    <Image
                      src={item.thumbnail}
                      width={80}
                      height={80}
                      alt={item.product_title || ""}
                      className="rounded-2xl border border-border/50 object-cover"
                    />
                  </Link>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      className="font-medium text-foreground hover:underline wrap-break-word"
                      href={`${paths.productPage}/${item.product_handle}`}
                    >
                      {item.product_title}
                    </Link>

                    <Button
                      size="icon"
                      variant="outline"
                      className="size-9 shrink-0 border-border/60 bg-background/80"
                      onClick={() => removeCartItem(dispatch, item.id)}
                    >
                      <X />
                    </Button>
                  </div>

                  {(item.variant as any)?.options?.length > 0 && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {(item.variant as any).options
                        .map((o: any) =>
                          o.option?.title
                            ? `${o.option.title}: ${o.value}`
                            : o.value,
                        )
                        .join(", ")}
                    </p>
                  )}

                  <p className="mt-2 text-sm text-muted-foreground">
                    Цена:{" "}
                    <span className="font-medium text-foreground">
                      {formatPrice(item.unit_price)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Количество
                </span>

                <div className="flex w-fit items-center gap-2 rounded-xl border border-border/60 bg-background-secondary/40 p-1">
                  <Button
                    size="icon"
                    disabled={item.quantity === 1}
                    onClick={() =>
                      updateCartItemQuantity(
                        dispatch,
                        item.id,
                        item.quantity - 1,
                      )
                    }
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    size="icon"
                    onClick={() =>
                      updateCartItemQuantity(
                        dispatch,
                        item.id,
                        item.quantity + 1,
                      )
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block">
          <Table className="min-w-180">
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead
                  colSpan={2}
                  className="h-12 uppercase tracking-[0.16em] text-muted-foreground"
                >
                  Наименование товара
                </TableHead>
                <TableHead className="h-12 uppercase tracking-[0.16em] text-muted-foreground">
                  Цена ед.
                </TableHead>
                <TableHead className="h-12 uppercase tracking-[0.16em] text-muted-foreground">
                  Кол-во
                </TableHead>
                <TableHead className="h-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart?.items?.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-border/60 hover:bg-background-secondary/30"
                >
                  <TableCell className="lg:w-24 w-16">
                    <Link
                      href={`${paths.productPage}/${item.product_handle}`}
                      className="w-full aspect-square flex justify-center items-center border rounded-lg"
                    >
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={300}
                          height={300}
                          className="w-full aspect-square object-cover rounded-t-[9px]"
                        />
                      ) : (
                        <Image
                          src={plantPlaceholder.src}
                          alt={item.title}
                          width={300}
                          height={300}
                          className="w-[70%] aspect-square object-cover rounded-t-[9px] translate-x-1 fill-primary-foreground/70"
                        />
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Link
                        className="font-medium text-foreground hover:underline"
                        href={`${paths.productPage}/${item.product_handle}`}
                      >
                        {item.product_title}
                      </Link>
                      {(item.variant as any)?.options?.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {(item.variant as any).options
                            .map((o: any) =>
                              o.option?.title
                                ? `${o.option.title}: ${o.value}`
                                : o.value,
                            )
                            .join(", ")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-40 font-medium">
                    {formatPrice(item.unit_price)}
                  </TableCell>
                  <TableCell className="w-44">
                    <div className="flex w-fit items-center gap-2 rounded-xl border border-border/60 bg-background-secondary/40 p-1">
                      <Button
                        size="icon"
                        disabled={item.quantity === 1}
                        onClick={() =>
                          updateCartItemQuantity(
                            dispatch,
                            item.id,
                            item.quantity - 1,
                          )
                        }
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        onClick={() =>
                          updateCartItemQuantity(
                            dispatch,
                            item.id,
                            item.quantity + 1,
                          )
                        }
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="w-12">
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-border/60 bg-background/80"
                      onClick={() => removeCartItem(dispatch, item.id)}
                    >
                      <X />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
